import mongoose from "mongoose";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Preference from "../models/preferenceModel.js";

// Get All Users (for User List Page)
export const getAllUsers = async (req, res) => {
  try {
    // Parse pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch users (exclude soft-deleted ones and passwords)
    const users = await User.find({ isDeleted: false })
      .select('username email role createdAt updatedAt') // Select only necessary fields, exclude password
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        usersPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create User (FR1)
export const createUser = async (req, res) => {
  try {
    const { username, email, role, password } = req.body;

    if (!username || !email)
      return res.status(400).json({ message: "Username and Email ID Required" });

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(409).json({ message: "Username already exists" });

    // For now, we'll store the password as plain text (not recommended for production)
    // In production, you should hash the password using bcrypt
    const user = await User.create({ username, email, role, password });
    user.audit.push({ action: "CREATE", details: { username, email, role } });
    await user.save();

    // Don't return the password in the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get User by ID (FR2)
export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      isDeleted: false,
    }).select('-password'); // Exclude password from response
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Update User (FR3)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role, password } = req.body;

    // Build update object - only include password if provided
    const updateData = { username, email, role, updatedAt: Date.now() };
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found or deleted" });

    updatedUser.audit.push({ action: "UPDATE", details: { username, email, role, passwordChanged: !!password } });
    await updatedUser.save();

    // Don't return the password in the response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Soft Delete User (FR4)
export const softDeleteUser = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();

    // Only start a transaction if MongoDB supports it
    const supportsTransactions =
      mongoose.connection.client.topology.s.descriptionType === "ReplicaSetWithPrimary";

    if (supportsTransactions) session.startTransaction();

    const { userId } = req.params;
    const user = await User.findById(userId).session(supportsTransactions ? session : null);
    if (!user) {
      if (supportsTransactions) await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeleted) {
      if (supportsTransactions) await session.abortTransaction();
      return res.status(400).json({ message: "User already deleted" });
    }

    // Soft delete user
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.audit.push({ action: "SOFT_DELETE" });
    await user.save({ session: supportsTransactions ? session : undefined });

    // Cascade soft delete posts
    await Post.updateMany(
      { userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session: supportsTransactions ? session : undefined }
    );

    if (supportsTransactions) await session.commitTransaction();

    res.status(200).json({ message: "User and related posts soft-deleted successfully" });
  } catch (err) {
    if (session && session.inTransaction()) await session.abortTransaction();
    console.error("Soft delete error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (session) session.endSession();
  }
};

// Hard Delete User (FR5)
export const hardDeleteUser = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();

    const supportsTransactions =
      mongoose.connection.client.topology.s.descriptionType === "ReplicaSetWithPrimary";
    if (supportsTransactions) session.startTransaction();

    const { userId } = req.params;
    const user = await User.findById(userId).session(supportsTransactions ? session : null);

    if (!user) {
      if (supportsTransactions) await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isDeleted) {
      if (supportsTransactions) await session.abortTransaction();
      return res.status(400).json({ message: "User must be soft deleted first" });
    }

    const now = Date.now();
    const deletedAt = new Date(user.deletedAt);
    const hoursSinceDeletion = (now - deletedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDeletion < 24) {
      if (supportsTransactions) await session.abortTransaction();
      return res.status(403).json({
        message: "User cannot be permanently deleted before 24 hours of soft deletion.",
      });
    }

    // Record audit + cascade delete
    user.audit.push({ action: "HARD_DELETE" });
    await user.save({ session: supportsTransactions ? session : undefined });

    await Promise.all([
      Post.deleteMany({ userId }, { session: supportsTransactions ? session : undefined }),
      Preference.deleteMany({ userId }, { session: supportsTransactions ? session : undefined }),
      User.deleteOne({ _id: userId }, { session: supportsTransactions ? session : undefined }),
    ]);

    if (supportsTransactions) await session.commitTransaction();

    res.status(200).json({ message: "User, posts, and preferences permanently deleted" });
  } catch (err) {
    if (session && session.inTransaction()) await session.abortTransaction();
    console.error("Hard delete error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (session) session.endSession();
  }
};

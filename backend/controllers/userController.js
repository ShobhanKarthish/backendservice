import mongoose from "mongoose";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Preference from "../models/preferenceModel.js";

// Create User (FR1)
export const createUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    if (!username || !email)
      return res.status(400).json({ message: "Username and Email ID Required" });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(409).json({ message: "Username already exists" });

    const user = await User.create({ username, email, role });
    user.audit.push({ action: "CREATE", details: { username, email } });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User by ID (FR2)
export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      isDeleted: false,
    });
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
    const { username, email, role } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { username, email, role, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found or deleted" });

    updatedUser.audit.push({ action: "UPDATE", details: { username, email, role } });
    await updatedUser.save();

    res.status(200).json(updatedUser);
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

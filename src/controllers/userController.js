import mongoose from "mongoose";
import User from "../models/userModel.js";
import Post from "../models/postModel.js"; // required for cascade delete

// create user  
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

// update user
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

// update user
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

// soft delete user (transactional)
export const softDeleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "User already deleted" });
    }

    // soft delete user
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.audit.push({ action: "SOFT_DELETE" });
    await user.save({ session });

    // cascade soft delete for posts
    await Post.updateMany(
      { userId: userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "User and related posts soft-deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Soft delete error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// hard delete user
export const hardDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isDeleted)
      return res
        .status(400)
        .json({ message: "User must be soft deleted first" });

    const now = Date.now();
    const deletedAt = new Date(user.deletedAt);
    const timeDiff = now - deletedAt;
    const hoursSinceDeletion = timeDiff / (1000 * 60 * 60);

    if (hoursSinceDeletion < 24) {
      return res.status(403).json({
        message:
          "User cannot be permanently deleted before 24 hours of soft deletion.",
      });
    }

    user.audit.push({ action: "HARD_DELETE" });
    await user.save();

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User permanently deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

import User from "../models/userModel.js";

export const createUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    if (!username || !email)
      return res.status(400).json({ message: "Username and Email ID Required" });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(409).json({ message: "Username already exists" });

    const user = await User.create({ username, email, role });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

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

export const softDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({ message: "User soft deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

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

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User permanently deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


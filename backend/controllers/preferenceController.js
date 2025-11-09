import User from "../models/userModel.js";
import Preference from "../models/preferenceModel.js";

export const upsertPreference = async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme, notifications, language } = req.body;

    // Integrity checks
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isDeleted)
      return res.status(403).json({ message: "User is soft-deleted" });

    const pref = await Preference.findOneAndUpdate(
      { userId },
      { theme, notifications, language, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json(pref);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPreference = async (req, res) => {
  try {
    const pref = await Preference.findOne({ userId: req.params.userId });
    if (!pref)
      return res.status(404).json({ message: "Preference not found" });
    res.status(200).json(pref);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

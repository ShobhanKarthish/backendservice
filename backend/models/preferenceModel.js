import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  theme: { type: String, enum: ["light", "dark"], default: "light" },
  notifications: { type: Boolean, default: true },
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

preferenceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Preference", preferenceSchema);

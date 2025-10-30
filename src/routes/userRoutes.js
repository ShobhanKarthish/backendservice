import express from "express";
import {
  createUser,
  getUser,
  softDeleteUser,
  hardDeleteUser, // 👈 this is the new one
} from "../controllers/userController.js";

const router = express.Router();

// Routes
router.post("/", createUser);
router.get("/:userId", getUser);
router.delete("/:userId", softDeleteUser);
router.delete("/purge/:userId", hardDeleteUser); // 👈 new route

export default router;

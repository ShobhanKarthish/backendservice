import express from "express";
import {
  createUser,
  getUser,
  getAllUsers, // Add this import
  updateUser, 
  softDeleteUser,
  hardDeleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// IMPORTANT: Place GET "/" before GET "/:userId" to avoid route conflicts
router.get("/", getAllUsers); // Get all users (with pagination)
router.post("/", createUser);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);
router.delete("/:userId", softDeleteUser);
router.post("/:userId/purge", hardDeleteUser);

export default router;

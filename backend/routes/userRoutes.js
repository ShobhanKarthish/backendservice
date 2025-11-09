import express from "express";
import {
  createUser,
  getUser,
  updateUser, 
  softDeleteUser,
  hardDeleteUser,
} from "../controllers/userController.js";


const router = express.Router();
router.put("/:userId", updateUser)


// Routes
router.post("/", createUser);
router.get("/:userId", getUser);
router.delete("/:userId", softDeleteUser);
router.post("/:userId/purge", hardDeleteUser);


export default router;

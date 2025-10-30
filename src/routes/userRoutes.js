import express from "express";
import {
  createUser,
  getUser,
  softDeleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/:userId", getUser);
router.delete("/:userId", softDeleteUser);

export default router;

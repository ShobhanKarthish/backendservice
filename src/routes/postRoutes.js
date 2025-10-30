import express from "express";
import {
  createPost,
  getUserPosts,
  softDeletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/users/:userId/posts", createPost);  
router.get("/users/:userId/posts", getUserPosts);  
router.delete("/posts/:postId", softDeletePost);   

export default router;

import Post from "../models/postModel.js";

// Create Post
export const createPost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, content } = req.body;

    const post = await Post.create({ userId, title, content });
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all posts for user (non-deleted)
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId, isDeleted: false });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Soft delete post
export const softDeletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.isDeleted)
      return res.status(400).json({ message: "Post already deleted" });

    post.isDeleted = true;
    post.deletedAt = Date.now();
    await post.save();

    res.status(200).json({ message: "Post soft-deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// mongodb connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

//test route
app.get("/", (req, res) => {
    res.send("backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen  (PORT, () => console.log(`Server running on port ${PORT}`));


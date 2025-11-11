import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";
import userRoutes from "./routes/userRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Track if database is connected
let dbConnected = false;

if (process.env.NODE_ENV !== "test") {
  console.log("Attempting to connect to MongoDB...");
  console.log("MONGO_URI:", process.env.MONGO_URI);

  // Try connecting to the provided MongoDB URI first with options to avoid buffering
  const connectWithRetry = async () => {
    try {
      // For MongoDB Atlas, we'll use different connection options
      const isAtlasConnection = process.env.MONGO_URI.includes('mongodb+srv');
      
      const connectionOptions = {
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0,   // Disable mongoose buffering
        serverSelectionTimeoutMS: 30000, // Increased timeout for cloud connections
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        ...(isAtlasConnection && {
          maxPoolSize: 10, // Maintain up to 10 socket connections
          serverSelectionTimeoutMS: 5000, // Keep it reasonable for server selection
          socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
          family: 4, // Use IPv4, skip trying IPv6
        })
      };
      
      console.log("Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      console.log("MongoDB connected successfully");
      dbConnected = true;
    } catch (err) {
      console.error("MongoDB connection error:", err.message);
      console.log("Attempting to start in-memory MongoDB server as fallback...");
      
      // Start in-memory MongoDB server for development
      try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri, {
          bufferCommands: false,
          bufferMaxEntries: 0,
        });
        console.log("Connected to in-memory MongoDB server");
        console.log("Using in-memory database for development");
        dbConnected = true;
      } catch (memoryErr) {
        console.error("Failed to start in-memory MongoDB server:", memoryErr.message);
        console.log("Please ensure MongoDB is running locally or Atlas credentials are correct");
      }
    }
  };

  connectWithRetry();
}

// Middleware to check database connection before handling requests
app.use((req, res, next) => {
  if (!dbConnected && req.path.startsWith('/api')) {
    return res.status(503).json({ 
      message: "Database not ready", 
      error: "Service temporarily unavailable. Database connection is still establishing." 
    });
  }
  next();
});

// Routes
app.get("/", (req, res) => res.send("Backend Service is running"));
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", preferenceRoutes);
app.use("/api/v1", postRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
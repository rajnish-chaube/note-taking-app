import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/notetaker";

export let isMongoConnected = false;

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("✅ MongoDB connected successfully");
    isMongoConnected = true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("📝 Falling back to in-memory storage for development");
    console.log(
      "💡 To use MongoDB: install and start MongoDB, or use MongoDB Atlas",
    );
    isMongoConnected = false;
    // Don't exit - continue with in-memory fallback
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("📴 MongoDB disconnected");
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
  }
};

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("🔗 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ Mongoose connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("📴 Mongoose disconnected from MongoDB");
});

// Handle process termination
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

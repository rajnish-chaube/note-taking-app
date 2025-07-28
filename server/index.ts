import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database";
import { handleDemo } from "./routes/demo";
import {
  handleSignup,
  handleLogin,
  handleSendOTP,
  handleVerifyOTP,
  handleGoogleAuth,
  handleGetUser,
  verifyToken,
} from "./routes/auth";
import {
  handleGetNotes,
  handleCreateNote,
  handleGetNote,
  handleUpdateNote,
  handleDeleteNote,
  handleGetTags,
  handleTogglePin,
  handleToggleArchive,
} from "./routes/notes";

export function createServer() {
  const app = express();

  // Connect to MongoDB
  connectDatabase().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/send-otp", handleSendOTP);
  app.post("/api/auth/verify-otp", handleVerifyOTP);
  app.post("/api/auth/google", handleGoogleAuth);
  app.get("/api/auth/me", verifyToken, handleGetUser);

  // Notes routes (protected)
  app.get("/api/notes", verifyToken, handleGetNotes);
  app.post("/api/notes", verifyToken, handleCreateNote);
  app.get("/api/notes/:id", verifyToken, handleGetNote);
  app.put("/api/notes/:id", verifyToken, handleUpdateNote);
  app.delete("/api/notes/:id", verifyToken, handleDeleteNote);
  app.post("/api/notes/:id/pin", verifyToken, handleTogglePin);
  app.post("/api/notes/:id/archive", verifyToken, handleToggleArchive);

  // Tags routes (protected)
  app.get("/api/tags", verifyToken, handleGetTags);

  return app;
}

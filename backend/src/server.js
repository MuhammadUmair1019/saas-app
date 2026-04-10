// ============================================
// Main Server Entry Point
// Sets up Express, connects to MongoDB, and
// registers all routes.
// ============================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import route files
import authRoutes from "./routes/auth.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// ---- IMPORTANT: Webhook route MUST come before express.json() ----
// Stripe webhooks need the raw body to verify the signature.
// If express.json() parses it first, verification will fail.
app.use("/api/webhook", webhookRoutes);

// ---- Global Middleware ----
// Parse JSON request bodies (for all routes except webhook)
app.use(express.json());

// Enable CORS so the frontend (different port) can talk to this server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ---- API Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Simple health check route
app.get("/", (_req, res) => {
  res.json({ message: "SaaS API is running" });
});

// ---- Connect to MongoDB and Start Server ----
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

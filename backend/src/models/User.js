// ============================================
// User Model (Mongoose Schema)
// Stores user credentials + Stripe subscription info
// ============================================

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // User's display name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // User's email (used for login) — must be unique
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Hashed password (never store plain text!)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    // Stripe customer ID — created when user first subscribes
    // Example: "cus_Abc123..."
    stripeCustomerId: {
      type: String,
      default: null,
    },

    // Stripe subscription ID — used to cancel/manage subscription
    // Example: "sub_Abc123..."
    subscriptionId: {
      type: String,
      default: null,
    },

    // Current subscription status from Stripe
    // "active" = paying, "inactive" = not subscribed,
    // "past_due" = payment failed
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "past_due"],
      default: "inactive",
    },

    // User's plan — determines what features they can access
    // "free" = default, "premium" = after successful payment
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;

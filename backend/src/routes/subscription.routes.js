// ============================================
// Subscription Routes
// All routes here are protected (require JWT)
// ============================================

import { Router } from "express";
import {
  createCheckoutSession,
  cancelSubscription,
  createBillingPortal,
} from "../controllers/subscription.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/subscription/create-checkout-session
// Creates a Stripe Checkout session and returns the URL
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

// POST /api/subscription/cancel
// Cancels the user's active subscription
router.post("/cancel", authMiddleware, cancelSubscription);

// POST /api/subscription/billing-portal
// Creates a Stripe Billing Portal session
router.post("/billing-portal", authMiddleware, createBillingPortal);

export default router;

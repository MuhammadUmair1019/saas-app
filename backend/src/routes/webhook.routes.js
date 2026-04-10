// ============================================
// Webhook Routes
//
// CRITICAL: This route uses express.raw() instead of
// express.json(). Stripe needs the raw request body
// to verify the webhook signature. If you use
// express.json() here, signature verification will FAIL.
//
// That's why this route is registered BEFORE
// express.json() in server.js.
// ============================================

import { Router } from "express";
import express from "express";
import { handleWebhook } from "../controllers/webhook.controller.js";

const router = Router();

// POST /api/webhook — Stripe sends events here
// express.raw() keeps the body as a Buffer (not parsed JSON)
router.post("/", express.raw({ type: "application/json" }), handleWebhook);

export default router;

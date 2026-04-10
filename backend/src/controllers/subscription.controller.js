// ============================================
// Subscription Controller
// Handles creating Stripe Checkout sessions,
// cancelling subscriptions, and opening the
// Stripe Billing Portal.
// ============================================

import Stripe from "stripe";
import User from "../models/User.js";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---- CREATE CHECKOUT SESSION ----
// POST /api/subscription/create-checkout-session
// Creates a Stripe Checkout page URL for the user to pay
export const createCheckoutSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If user already has a Stripe customer ID, reuse it.
    // Otherwise, create a new Stripe customer.
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        // metadata lets us link the Stripe customer back to our DB user
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;

      // Save the Stripe customer ID in our database
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create a Checkout Session
    // This generates a hosted payment page on Stripe's servers
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription", // "subscription" for recurring, "payment" for one-time
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // The Price ID from Stripe Dashboard
          quantity: 1,
        },
      ],
      // Where to redirect after successful payment
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      // Where to redirect if user cancels the checkout
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    // Send the checkout URL to the frontend
    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ message: "Failed to create checkout session." });
  }
};

// ---- CANCEL SUBSCRIPTION ----
// POST /api/subscription/cancel
// Cancels the user's active subscription
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.subscriptionId) {
      return res
        .status(400)
        .json({ message: "No active subscription found." });
    }

    // Cancel the subscription on Stripe
    // This will trigger a "customer.subscription.deleted" webhook event
    await stripe.subscriptions.cancel(user.subscriptionId);

    // Update the user's plan in our database immediately
    user.plan = "free";
    user.subscriptionStatus = "inactive";
    user.subscriptionId = null;
    await user.save();

    res.json({ message: "Subscription cancelled successfully." });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Failed to cancel subscription." });
  }
};

// ---- CREATE BILLING PORTAL SESSION ----
// POST /api/subscription/billing-portal
// Opens Stripe's hosted billing portal where users can
// manage their payment methods, view invoices, etc.
export const createBillingPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res
        .status(400)
        .json({ message: "No Stripe customer found for this user." });
    }

    // Create a portal session — Stripe hosts this page for you
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`, // Where to go when they're done
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    res.status(500).json({ message: "Failed to create billing portal." });
  }
};

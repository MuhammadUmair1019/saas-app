// ============================================
// Webhook Controller
// Handles incoming Stripe webhook events.
//
// HOW WEBHOOKS WORK:
// 1. User pays on Stripe Checkout page
// 2. Stripe sends an HTTP POST to our webhook URL
// 3. We verify the event signature (security!)
// 4. We update our database based on the event type
//
// IMPORTANT: The webhook route must use express.raw()
// instead of express.json() to get the raw body for
// signature verification.
// ============================================

import Stripe from "stripe";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleWebhook = async (req, res) => {
  // The raw body is needed for signature verification
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify that this event actually came from Stripe
    // (not from someone faking a webhook call)
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (thanks to express.raw middleware)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    // ---- CHECKOUT COMPLETED ----
    // Fired when a user successfully completes the Stripe Checkout page
    case "checkout.session.completed": {
      const session = event.data.object;

      // Find the user by their Stripe customer ID
      const user = await User.findOne({
        stripeCustomerId: session.customer,
      });

      if (user) {
        // Activate their subscription
        user.subscriptionId = session.subscription;
        user.subscriptionStatus = "active";
        user.plan = "premium";
        await user.save();
        console.log(`✅ Subscription activated for ${user.email}`);
      }
      break;
    }

    // ---- SUBSCRIPTION DELETED ----
    // Fired when a subscription is cancelled (by us or by Stripe)
    case "customer.subscription.deleted": {
      const subscription = event.data.object;

      const user = await User.findOne({
        stripeCustomerId: subscription.customer,
      });

      if (user) {
        // Deactivate their subscription
        user.subscriptionId = null;
        user.subscriptionStatus = "inactive";
        user.plan = "free";
        await user.save();
        console.log(`❌ Subscription cancelled for ${user.email}`);
      }
      break;
    }

    // ---- PAYMENT FAILED ----
    // Fired when a recurring payment fails (e.g., card expired)
    case "invoice.payment_failed": {
      const invoice = event.data.object;

      const user = await User.findOne({
        stripeCustomerId: invoice.customer,
      });

      if (user) {
        // Mark the subscription as past due
        user.subscriptionStatus = "past_due";
        await user.save();
        console.log(`⚠️ Payment failed for ${user.email}`);
      }
      break;
    }

    default:
      // Log unhandled events (useful for debugging)
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Always respond with 200 to acknowledge receipt
  // If you don't, Stripe will retry the webhook
  res.json({ received: true });
};

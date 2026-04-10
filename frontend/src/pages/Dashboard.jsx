// ============================================
// Dashboard Page
// Shows the user's current plan and subscription status.
// - Free users see a "Subscribe" button
// - Premium users see "Cancel" and "Manage Billing" buttons
// ============================================

import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function Dashboard() {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState("");

  // ---- SUBSCRIBE ----
  // Creates a Stripe Checkout session and redirects to Stripe's payment page
  const handleSubscribe = async () => {
    setLoading("subscribe");
    try {
      const res = await axios.post(
        `${API_URL}/subscription/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Redirect the user to Stripe's hosted checkout page
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start checkout.");
    } finally {
      setLoading("");
    }
  };

  // ---- CANCEL SUBSCRIPTION ----
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setLoading("cancel");
    try {
      await axios.post(
        `${API_URL}/subscription/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh user data to reflect the cancellation
      await refreshUser();
      alert("Subscription cancelled successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel subscription.");
    } finally {
      setLoading("");
    }
  };

  // ---- MANAGE BILLING ----
  // Opens Stripe's Billing Portal in a new tab
  const handleBillingPortal = async () => {
    setLoading("billing");
    try {
      const res = await axios.post(
        `${API_URL}/subscription/billing-portal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to open billing portal.");
    } finally {
      setLoading("");
    }
  };

  // Determine if user is premium
  const isPremium = user?.plan === "premium";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* ---- User Info Card ---- */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Name:</span> {user?.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user?.email}
          </p>
        </div>
      </div>

      {/* ---- Subscription Card ---- */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>

        <div className="flex items-center gap-3 mb-4">
          <span className="font-medium text-gray-700">Current Plan:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPremium
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isPremium ? "Premium" : "Free"}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="font-medium text-gray-700">Status:</span>
          <span
            className={`text-sm ${
              user?.subscriptionStatus === "active"
                ? "text-green-600"
                : user?.subscriptionStatus === "past_due"
                ? "text-yellow-600"
                : "text-gray-500"
            }`}
          >
            {user?.subscriptionStatus === "active"
              ? "Active"
              : user?.subscriptionStatus === "past_due"
              ? "Past Due"
              : "Inactive"}
          </span>
        </div>

        {/* ---- Action Buttons ---- */}
        <div className="flex flex-wrap gap-3">
          {!isPremium ? (
            // Free user: show subscribe button
            <button
              onClick={handleSubscribe}
              disabled={loading === "subscribe"}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading === "subscribe"
                ? "Redirecting..."
                : "Subscribe to Premium ($9.99/mo)"}
            </button>
          ) : (
            // Premium user: show cancel and billing buttons
            <>
              <button
                onClick={handleCancel}
                disabled={loading === "cancel"}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {loading === "cancel" ? "Cancelling..." : "Cancel Subscription"}
              </button>

              <button
                onClick={handleBillingPortal}
                disabled={loading === "billing"}
                className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {loading === "billing"
                  ? "Opening..."
                  : "Manage Billing"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

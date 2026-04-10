// ============================================
// Premium Page
// Only accessible to users with plan === "premium".
// Free users see an "Access Denied" message.
// ============================================

import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function Premium() {
  const { user } = useAuth();

  // Check if user has premium plan
  const isPremium = user?.plan === "premium";

  // ---- ACCESS DENIED (Free Users) ----
  if (!isPremium) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-10">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            This page is only available to Premium subscribers. Upgrade your
            plan to unlock exclusive content and features.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard to Subscribe
          </Link>
        </div>
      </div>
    );
  }

  // ---- PREMIUM CONTENT (Premium Users) ----
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-10">
        <div className="text-6xl mb-4 text-center">⭐</div>
        <h1 className="text-3xl font-bold text-center text-green-600 mb-3">
          Welcome, Premium Member!
        </h1>
        <p className="text-gray-600 text-center mb-8">
          You have full access to all premium features and content.
        </p>

        {/* Example premium content */}
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">
              Premium Feature: Advanced Analytics
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Access detailed analytics and insights about your usage.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">
              Premium Feature: Priority Support
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Get 24/7 priority support from our dedicated team.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">
              Premium Feature: Unlimited Exports
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Export your data in any format with no limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

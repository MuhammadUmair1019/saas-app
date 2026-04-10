// ============================================
// App Component
// Sets up routing and the navigation bar.
// ============================================

import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

// Page components
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Premium from "./pages/Premium.jsx";

function App() {
  const { user, logout, loading } = useAuth();

  // Show a loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ---- Navigation Bar ---- */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            SaaS App
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Show these links only when logged in */}
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <Link
                  to="/premium"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Premium
                </Link>
                <span className="text-sm text-gray-500">
                  Hi, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Show these links only when logged out */}
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ---- Page Routes ---- */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />

          {/* Protected routes — redirect to login if not authenticated */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/premium"
            element={user ? <Premium /> : <Navigate to="/login" />}
          />

          {/* Default route */}
          <Route
            path="*"
            element={
              <Navigate to={user ? "/dashboard" : "/login"} />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

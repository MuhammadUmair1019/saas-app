// ============================================
// Auth Context
// Provides authentication state (user, token)
// and methods (login, register, logout) to
// the entire app via React Context.
//
// HOW IT WORKS:
// 1. On app load, checks localStorage for a saved token
// 2. If token exists, fetches the user profile from the API
// 3. Provides login/register/logout functions to components
// 4. Any component can use useAuth() to access auth state
// ============================================

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// The base URL for all API calls
const API_URL = "http://localhost:5000/api";

// Create the context
const AuthContext = createContext();

// Custom hook so components can easily use auth state
// Usage: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State: current user object (null if not logged in)
  const [user, setUser] = useState(null);
  // State: JWT token string
  const [token, setToken] = useState(localStorage.getItem("token"));
  // State: loading flag (true while checking auth on first load)
  const [loading, setLoading] = useState(true);

  // On mount (and when token changes), fetch the user profile
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Call GET /api/auth/me with the JWT in the header
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (error) {
        // Token is invalid or expired — clear it
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // ---- REGISTER ----
  const register = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    // Save token to localStorage so it persists across refreshes
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // ---- LOGIN ----
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // ---- LOGOUT ----
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // ---- REFRESH USER ----
  // Call this after subscription changes to get updated user data
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (error) {
      console.error("Refresh user failed:", error);
    }
  };

  // Provide all auth state and methods to children
  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// Authentication Middleware
// Verifies the JWT token sent in the request header.
// If valid, attaches the user's ID to req.user
// so downstream controllers know who is making the request.
// ============================================

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1. Get the token from the Authorization header
    //    Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // 2. Extract just the token part (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // 3. Verify and decode the token
    //    jwt.verify() throws an error if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user ID from the token payload to the request
    //    Now any controller can use req.user.id to identify the user
    req.user = { id: decoded.id };

    // 5. Pass control to the next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authMiddleware;

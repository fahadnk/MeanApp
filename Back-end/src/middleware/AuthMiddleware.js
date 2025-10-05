// backend/src/middleware/AuthMiddleware.js

// ---------------------------------------------------
// Import Dependencies
// ---------------------------------------------------

// Import the jsonwebtoken library to verify and decode JWT tokens
import jwt from "jsonwebtoken";


// ---------------------------------------------------
// Authentication Middleware
// ---------------------------------------------------
// This middleware protects routes by ensuring that
// only users with valid JWT tokens can access them.
function authMiddleware(req, res, next) {
  // Extract the "Authorization" header from the request
  // Expected format: "Bearer <token>"
  const authHeader = req.headers["authorization"];

  // If the header exists, split it by space and get the second part (the token)
  // Example: "Bearer abc123" → token = "abc123"
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is found in the header, reject the request with 401 Unauthorized
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token using the secret key stored in environment variables
    // If valid, decode the token to get user data (id, role, etc.)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request object
    // This allows controllers/services to access `req.user`
    req.user = decoded;

    // Move on to the next middleware or route handler
    next();
  } catch (err) {
    // If verification fails (invalid or expired token), reject with 403 Forbidden
    return res
      .status(403)
      .json({ message: "Invalid or expired token." });
  }
}


// ---------------------------------------------------
// Export Middleware
// ---------------------------------------------------
// Export the middleware so it can be used in routes
export default authMiddleware;

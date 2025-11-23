// ---------------------------------------------------
// Import Dependencies
// ---------------------------------------------------

// Import the "jsonwebtoken" library, which allows us to 
// verify and decode JSON Web Tokens (JWTs).
// JWTs are used to securely identify authenticated users
// by embedding user information in a signed token.
import jwt from "jsonwebtoken";

// Import success/error helpers for consistent API responses
import { success, error } from "../utils/response.js";


// ---------------------------------------------------
// Authentication Middleware
// ---------------------------------------------------
// This middleware protects routes by ensuring the user
// is authenticated before accessing them.
// It checks for a valid JWT token in the Authorization header.
//
// In Express, middleware functions receive (req, res, next)
// where:
// - req → request object (incoming data)
// - res → response object (used to send replies)
// - next → function to pass control to the next middleware or route handler
function authMiddleware(req, res, next) {
  // ---------------------------------------------------
  // Step 1: Extract Authorization header from the request
  // ---------------------------------------------------
  // The header looks like:  "Authorization: Bearer <token>"
  // We access it from req.headers["authorization"].
  const authHeader = req.headers["authorization"];

  // ---------------------------------------------------
  // Step 2: Extract the token part from the header
  // ---------------------------------------------------
  // If the header exists, split it by space → ["Bearer", "<token>"]
  // and take the second part (the token itself).
  const token = authHeader && authHeader.split(" ")[1];

  // ---------------------------------------------------
  // Step 3: Handle missing token
  // ---------------------------------------------------
  // If no token is found, it means the request is unauthenticated.
  // Return HTTP 401 (Unauthorized) and stop further processing.
  if (!token) {
    return error(res, "Access denied. No token provided.", 401);
  }

  // ---------------------------------------------------
  // Step 4: Verify the token using JWT secret
  // ---------------------------------------------------
  // This step ensures the token is valid and not tampered with.
  // jwt.verify() decodes the token and checks it against your secret key.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ---------------------------------------------------
    // Step 5: Optional safety check — verify token structure
    // ---------------------------------------------------
    // Ensure the decoded token contains expected fields (like user ID).
    // This helps prevent malformed or incomplete tokens from passing through.
    if (!decoded || !decoded.id) {
      return error(res, "Invalid token.", 403);
    }

    // ---------------------------------------------------
    // Step 6: Attach decoded user data to req object
    // ---------------------------------------------------
    // By setting req.user = decoded, subsequent middlewares and
    // route handlers can access user info (e.g., req.user.id).
    req.user = decoded;

    // ---------------------------------------------------
    // Step 7: Pass control to the next middleware/route
    // ---------------------------------------------------
    // If everything is valid, continue processing the request.
    next();

  } catch (err) {
    // ---------------------------------------------------
    // Step 8: Handle invalid or expired tokens
    // ---------------------------------------------------
    // If jwt.verify() throws an error (e.g., token expired, wrong signature),
    // return HTTP 403 (Forbidden) with an error message.
    return error(res, "Invalid or expired token.", 403);
  }
}


// ---------------------------------------------------
// Export Middleware
// ---------------------------------------------------
// Export the middleware function so it can be imported
// and used in route files (e.g., to protect /profile routes).
export default authMiddleware;

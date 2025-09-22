// Import the user service layer which contains business logic
const userService = require("../services/user.service");

// Import standardized success/error response helpers
const { success, error } = require("../utils/response");

class UserController {
  // -------------------------
  // Register a new user
  // -------------------------
  async register(req, res) {
    try {
      // Call the service to register the user (business logic handles duplicate emails etc.)
      const user = await userService.register(req.body);

      // Send back the created user with 201 Created status
      return success(res, user, "User registered successfully", 201);
    } catch (err) {
      // If the error is about duplicate email → use 409 Conflict
      // Otherwise, fall back to generic 400 Bad Request
      const status = err.message.includes("Email already in use") ? 409 : 400;

      // Send standardized error response
      return error(res, err.message, status);
    }
  }

  // -------------------------
  // Authenticate user login
  // -------------------------
  async login(req, res) {
    try {
      // Extract credentials from request body
      const { email, password } = req.body;

      // Basic validation: both fields must be provided
      if (!email || !password) {
        return error(res, "Email & password are required", 400);
      }

      // Call the service to validate credentials and return user info (with token later)
      const user = await userService.login(email, password);

      // Send successful login response
      return success(res, user, "Login successful");
    } catch (err) {
      // Wrong password or user not found → 401 Unauthorized
      return error(res, err.message, 401);
    }
  }

  // -------------------------
  // Get currently authenticated user's profile
  // -------------------------
  async profile(req, res) {
    try {
      // `req.user` is expected to be set by an authentication middleware (JWT decoding etc.)
      const user = await userService.getUserById(req.user.id);

      // If no user found in DB → send 404 Not Found
      if (!user) return error(res, "User not found", 404);

      // Send user profile
      return success(res, user, "Profile fetched successfully");
    } catch (err) {
      // Generic failure → send 400 Bad Request
      return error(res, err.message, 400);
    }
  }
}

// Export a singleton instance of UserController for use in routes
module.exports = new UserController();

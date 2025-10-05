// backend/src/controllers/user.controller.js

// ---------------------------------------------------
// Import Dependencies
// ---------------------------------------------------

// Import the service layer (business logic for users).
// This service interacts with the database and applies business rules.
import userService from "../services/user.service.js";

// Import response helper functions that standardize API responses.
// "success" → formats a successful response.
// "error"   → formats an error response.
import { success, error } from "../utils/response.js";


// ---------------------------------------------------
// UserController Class
// ---------------------------------------------------
// This controller handles incoming HTTP requests related to users,
// such as registration, login, and fetching profiles.
// It delegates the actual logic to the "userService" layer.
class UserController {
  // -------------------------
  // Register a new user
  // -------------------------
  async register(req, res) {
    try {
      // Call the service layer to register a new user.
      // The service will handle validation, duplicate email checks, and DB insert.
      const user = await userService.register(req.body);

      // If successful → return HTTP 201 (Created) with the user data.
      return success(res, user, "User registered successfully", 201);
    } catch (err) {
      // If email already exists, send HTTP 409 (Conflict).
      // Otherwise, default to HTTP 400 (Bad Request).
      const status = err.message.includes("Email already in use") ? 409 : 400;

      // Standardized error response with the message from the service.
      return error(res, err.message, status);
    }
  }

  // -------------------------
  // Authenticate user login
  // -------------------------
  async login(req, res) {
    try {
      // Extract email & password from the request body.
      const { email, password } = req.body;

      // Validation: Ensure both fields are provided.
      if (!email || !password) {
        return error(res, "Email & password are required", 400);
      }

      // Delegate login logic to the service layer:
      // - Verifies user exists
      // - Checks password
      // - (In future) Generates JWT token
      const user = await userService.login(email, password);

      // If login is successful → return user info (with token later).
      return success(res, user, "Login successful");
    } catch (err) {
      // If credentials are invalid → send HTTP 401 (Unauthorized).
      return error(res, err.message, 401);
    }
  }

  // -------------------------
  // Get currently authenticated user's profile
  // -------------------------
  async profile(req, res) {
    try {
      // "req.user" is usually populated by the authentication middleware
      // (e.g., JWT middleware that decodes the token and attaches user data).
      const user = await userService.getUserById(req.user.id);

      // If user not found in DB → return 404 (Not Found).
      if (!user) return error(res, "User not found", 404);

      // If found → return profile details.
      return success(res, user, "Profile fetched successfully");
    } catch (err) {
      // Catch-all for errors → return HTTP 400 (Bad Request).
      return error(res, err.message, 400);
    }
  }
}


// ---------------------------------------------------
// Export Controller
// ---------------------------------------------------
// Export a singleton instance of UserController
// so it can be directly imported into routes without
// needing to instantiate it every time.
export default new UserController();

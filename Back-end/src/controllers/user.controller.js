// ---------------------------------------------------
// Import Dependencies
// ---------------------------------------------------

// Importing the "userService" which contains all the business logic 
// related to user operations such as register, login, fetch users, etc.
// The controller acts as a bridge between routes (HTTP requests)
// and services (business logic + database operations).
import userService from "../services/user.service.js";

// Importing helper functions that help standardize API responses.
// - "success": formats a success JSON response with status, data, and message.
// - "error": formats an error JSON response with a proper error message and status code.
import { success, error } from "../utils/response.js";


// ---------------------------------------------------
// UserController Class
// ---------------------------------------------------
// This class groups together all the controller methods 
// that handle incoming HTTP requests related to users.
// Each method corresponds to an endpoint (e.g., /register, /login).
class UserController {

  // ===================================================
  // Method: register
  // Purpose: Register (create) a new user in the system.
  // Route: POST /api/users/register
  // ===================================================
  async register(req, res) {
    try {
      // "req.body" contains the data sent by the client (e.g. name, email, password)
      // This data is passed to the service layer for validation and database insertion.
      const user = await userService.register(req.body);

      // If successful, send a 201 Created response with a success message.
      // The "success" helper ensures a consistent JSON structure.
      return success(res, user, "User registered successfully", 201);
    } catch (err) {
      // If the error message indicates a duplicate email, set status 409 (Conflict)
      // Otherwise, respond with a 400 (Bad Request) for general validation errors.
      const status = err.message.includes("Email already in use") ? 409 : 400;

      // Use the "error" helper to send a standardized error response.
      return error(res, err.message, status);
    }
  }

  // ===================================================
  // Method: login
  // Purpose: Authenticate a user and issue a token.
  // Route: POST /api/users/login
  // ===================================================
  async login(req, res) {
    try {
      // Extract "email" and "password" from the incoming request body.
      const { email, password } = req.body;

      // Validate presence of required fields before proceeding.
      // This prevents unnecessary database calls.
      if (!email || !password) {
        return error(res, "Email & password are required", 400);
      }

      // Delegate authentication logic to the user service.
      // The service checks credentials and generates a token if valid.
      const user = await userService.login(email, password);

      // Respond with success message and user data (often includes JWT).
      return success(res, user, "Login successful");
    } catch (err) {
      // If authentication fails (invalid credentials, etc.), send 401 Unauthorized.
      return error(res, err.message, 401);
    }
  }

  // ===================================================
  // Method: profile
  // Purpose: Retrieve details of the currently authenticated user.
  // Route: GET /api/users/profile
  // Middleware: Requires authentication (e.g., AuthMiddleware)
  // ===================================================
  async profile(req, res) {
    try {
      // "req.user" is set by the authentication middleware (decoded from JWT).
      // It usually contains { id, email, role }.
      const user = await userService.getUserById(req.user.id);

      // If no user is found (e.g., deleted account), send 404 Not Found.
      if (!user) return error(res, "User not found", 404);

      // If user exists, return profile data.
      return success(res, user, "Profile fetched successfully");
    } catch (err) {
      // Catch any unexpected server or database errors.
      return error(res, err.message, 400);
    }
  }

  // ===================================================
  // Method: getAllUsers
  // Purpose: Fetch a list of all users in the system (Admin only).
  // Route: GET /api/users
  // Middleware: Requires authentication + Admin role
  // ===================================================
  async getAllUsers(req, res) {
    try {
      // Call the service layer to fetch all users from the database.
      const users = await userService.getAllUsers();

      // Return the fetched users list in a standardized success response.
      return success(res, users, "All users fetched successfully");
    } catch (err) {
      // Handle unexpected errors gracefully.
      return error(res, err.message, 400);
    }
  }
}


// ---------------------------------------------------
// Export Controller
// ---------------------------------------------------
// Instead of exporting the class itself, we export a *new instance*
// of UserController so it can be directly used in routes without 
// creating a new object every time.
export default new UserController();

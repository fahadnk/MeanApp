// backend/src/routes/auth.routes.js

// Import Express framework to create router instances and handle HTTP routing
import express from "express";

// Import controller that contains the business logic for authentication operations
import userController from "../controllers/user.controller.js";

// Import custom middleware functions for authentication, authorization, and validation
import authMiddleware from "../middleware/AuthMiddleware.js"; // Verifies JWT tokens and authenticates users
import roleMiddleware from "../middleware/RoleMiddleware.js"; // Checks user roles and permissions
import validateSchema from "../middleware/ValidateMiddleware.js"; // Validates request bodies against predefined schemas

// Import Joi validation schemas for request payload validation
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

// Create an Express router instance to define modular, mountable route handlers
const router = express.Router();

// -------------------------
// Authentication Routes
// -------------------------

/**
 * USER REGISTRATION ENDPOINT
 * Path: POST /api/auth/register
 * Purpose: Creates a new user account in the system
 * Middleware Chain:
 * 1. validateSchema(registerSchema) - Validates request body against registration rules
 *    - Checks email format, password strength, name requirements, etc.
 * 2. userController.register - Business logic to create user in database
 * Access: Public (no authentication required)
 */
router.post(
  "/register",
  validateSchema(registerSchema), // Request validation: ensures data integrity before processing
  userController.register // Controller method: handles user creation, password hashing, response
);

/**
 * USER LOGIN ENDPOINT
 * Path: POST /api/auth/login
 * Purpose: Authenticates existing users and returns JWT token
 * Middleware Chain:
 * 1. validateSchema(loginSchema) - Validates login credentials format
 *    - Ensures email is valid and password meets requirements
 * 2. userController.login - Verifies credentials and generates authentication token
 * Access: Public (no authentication required)
 */
router.post(
  "/login",
  validateSchema(loginSchema), // Request validation: ensures proper credential format
  userController.login // Controller method: verifies user, generates JWT, sets cookies
);

/**
 * USER PROFILE ENDPOINT
 * Path: GET /api/auth/profile
 * Purpose: Retrieves authenticated user's profile information
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token and attaches user to request object
 * 2. userController.profile - Fetches and returns user profile data
 * Access: Private (requires valid JWT token)
 */
router.get(
  "/profile", 
  authMiddleware, // Authentication: ensures user is logged in and token is valid
  userController.profile // Controller method: returns user profile (excluding sensitive data like password)
);

/**
 * GET ALL USERS ENDPOINT (ADMIN ONLY)
 * Path: GET /api/auth/
 * Purpose: Retrieves list of all users in the system (administrative function)
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. roleMiddleware("admin") - Checks if authenticated user has 'admin' role
 * 3. userController.getAllUsers - Fetches and returns all users from database
 * Access: Private, Admin-only (requires admin privileges)
 */
router.get(
  "/", 
  authMiddleware, // Authentication: ensures user is logged in
  roleMiddleware(["admin","manager"]), // Authorization: restricts access to users with 'admin' role
  userController.getAllUsers // Controller method: retrieves complete user list (with pagination/filtering)
);

router.post(
  "/reset-password",
  authMiddleware,
  validateSchema(resetPasswordSchema),
  userController.resetPassword
);

// Export the router to be mounted in the main application (usually in app.js or server.js)
export default router;
// -------------------------
// Import Dependencies
// -------------------------

import express from "express";

// Controllers
import userController from "../controllers/user.controller.js";

// Middleware
import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";


// -------------------------
// Create Router Instance
// -------------------------

const router = express.Router();


// -------------------------
// Auth Routes
// -------------------------

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", userController.register);

// @route   POST /api/users/login
// @desc    Login user and return JWT
// @access  Public
router.post("/login", userController.login);


// -------------------------
// User Profile Routes
// -------------------------

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private (requires JWT)
router.get("/profile", authMiddleware, userController.profile);

// Example: Admin-only route (future use)
// @route   GET /api/users
// @desc    Get all users (only admins can access)
// @access  Private (Admin)
router.get("/", authMiddleware, roleMiddleware("admin"), userController.getAllUsers);


// -------------------------
// Export Router
// -------------------------

export default router;

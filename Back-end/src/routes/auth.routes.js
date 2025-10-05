// backend/src/routes/users.routes.js

const express = require("express");
const router = express.Router();

// Controllers
const userController = require("../controllers/user.controller");

// Middleware
const authMiddleware = require("../middleware/AuthMiddleware");
const roleMiddleware = require("../middleware/RoleMiddleware");

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

module.exports = router;

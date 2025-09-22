// Import Express to create a router instance
const express = require("express");
const router = express.Router();

// Import the UserController (handles the business logic for routes)
const userController = require("../controllers/user.controller");

// -------------------------
// Auth Endpoints
// -------------------------

// Register a new user
// POST /api/users/register
// Calls UserController.register()
router.post("/register", (req, res) => userController.register(req, res));

// Login an existing user
// POST /api/users/login
// Calls UserController.login()
router.post("/login", (req, res) => userController.login(req, res));

// -------------------------
// Profile Endpoint
// -------------------------

// Get current user profile
// GET /api/users/profile
// ⚠️ Requires authentication middleware (e.g., JWT) before this in future
// For now, directly calls UserController.profile()
router.get("/profile", (req, res) => userController.profile(req, res));

// Export router so it can be mounted in main app.js/server.js
module.exports = router;

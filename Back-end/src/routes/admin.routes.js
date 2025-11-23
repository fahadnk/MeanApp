// backend/src/routes/admin.routes.js

// Import Express framework to create router instances for admin endpoints
import express from "express";

// Import middleware functions for authentication, authorization, and validation
import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";
import validateSchema from "../middleware/ValidateMiddleware.js";

// Import validation schemas for user and task data validation
import { updateUserSchema } from "../validators/user.validator.js";
import { createTaskSchema } from "../validators/task.validator.js";

// Import admin controller containing business logic for admin operations
import adminController from "../controllers/admin.controller.js";

// Create Express router instance for admin routes
const router = express.Router();

// Apply admin-only protection to all routes in this router
router.use(authMiddleware, roleMiddleware("admin"));

// ---------------------------
// User Management Routes
// ---------------------------

// Get all users with pagination/filtering
router.get("/users", adminController.getAllUsers);

// Get specific user by ID with detailed information
router.get("/users/:id", adminController.getUserById);

// Update user profile and role information
router.put(
  "/users/:id",
  validateSchema(updateUserSchema), // Validate update data
  adminController.updateUser // Process user update
);

// Permanently delete user account
router.delete("/users/:id", adminController.deleteUser);

// ---------------------------
// Task Management For Users
// ---------------------------

// Get all tasks assigned to a specific user
router.get("/users/:id/tasks", adminController.getUserTasks);

// Create new task and assign to any user (admin privilege)
router.post(
  "/tasks",
  validateSchema(createTaskSchema), // Validate task creation data
  adminController.createTaskForUser // Create task with admin permissions
);

// Delete any task in the system (admin override)
router.delete("/tasks/:taskId", adminController.deleteTask);

// Export router for use in main application
export default router;
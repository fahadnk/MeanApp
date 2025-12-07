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

// -------------------------------------------
// Promote a User to Manager Role
// -------------------------------------------
// PUT /api/users/:id/promote
// Allows an admin to elevate a regular user to "manager" role.
// Used for delegating team management responsibilities.
//
// Example:
//   PUT /users/64abc123def456/promote
// -------------------------------------------
router.put(
  "/users/:id/promote",
  adminController.promoteUserToManager
);

// -------------------------------------------
// Demote a Manager/User Back to Regular User
// -------------------------------------------
// PUT /api/users/:id/demote
// Admin-only action to revoke manager privileges and set role back to "user".
// Commonly used when a manager leaves a team or role changes.
//
// Example:
//   PUT /users/64abc123def456/demote
// -------------------------------------------
router.put(
  "/users/:id/demote",
  adminController.demoteUserToUser
);

// -------------------------------------------
// Assign User to a Team
// -------------------------------------------
// POST /api/users/:id/assign-team
// Assigns a user to a specific team (sets user.team = teamId).
// Request body must contain valid teamId.
// Validation middleware ensures correct payload.
//
// Body Example:
//   { "teamId": "64def789abc123" }
//
// Protected + validated route.
// -------------------------------------------
router.post(
  "/users/:id/assign-team",
  validateSchema(assignTeamSchema),
  adminController.assignUserToTeam
);

// -------------------------------------------
// Remove User from Their Current Team
// -------------------------------------------
// POST /api/users/:id/remove-team
// Sets user.team = null (unassigns from any team).
// No body required — action is based solely on user ID.
// Typically allowed for admins or team managers.
//
// Example:
//   POST /users/64abc123def456/remove-team
// -------------------------------------------
router.post(
  "/users/:id/remove-team",
  adminController.removeUserFromTeam
);

// Export router for use in main application
export default router;
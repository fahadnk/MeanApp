// backend/src/routes/tasks.routes.js

// -------------------------
// Import Dependencies
// -------------------------

import express from "express";

// Controllers
import taskController from "../controllers/task.controller.js";

// Middleware
import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";


// -------------------------
// Create Router Instance
// -------------------------

const router = express.Router();


// -------------------------
// Task Routes
// -------------------------

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (any logged-in user)
router.post("/", authMiddleware, taskController.create);

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
//          - Admins: see all tasks
//          - Users: see only their own assigned tasks
router.get("/", authMiddleware, taskController.getAll);

// @route   GET /api/tasks/:id
// @desc    Get a single task by ID
// @access  Private (admin or task assignee/creator)
router.get("/:id", authMiddleware, taskController.getById);

// @route   PUT /api/tasks/:id
// @desc    Update a task by ID
// @access  Private (only task creator or admin)
router.put("/:id", authMiddleware, taskController.update);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task by ID
// @access  Private (only task creator or admin)
router.delete("/:id", authMiddleware, taskController.delete);

// Example: Admin-only task management route
// @route   DELETE /api/tasks
// @desc    Delete ALL tasks (⚠️ Admin only)
// @access  Private (admin)
router.delete("/", authMiddleware, roleMiddleware("admin"), taskController.deleteAll);


// -------------------------
// Export Router
// -------------------------

export default router;

// backend/src/routes/tasks.routes.js

// -------------------------
// Import Dependencies
// -------------------------
import express from "express";
import taskController from "../controllers/task.controller.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";

// -------------------------
// Create Router Instance
// -------------------------
const router = express.Router();

// -------------------------
// 📌 Task Routes (CRUD)
// -------------------------

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (any logged-in user)
router.post("/", authMiddleware, taskController.createTask);

// @route   GET /api/tasks/:id
// @desc    Get a single task by ID
// @access  Private (admin or assignee)
router.get("/:id", authMiddleware, taskController.getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Update a task by ID
// @access  Private (only creator or admin)
router.put("/:id", authMiddleware, taskController.updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task by ID
// @access  Private (only creator or admin)
router.delete("/:id", authMiddleware, taskController.deleteTask);

// -------------------------
// 🔍 Advanced Queries & Filters
// -------------------------

// @route   GET /api/tasks
// @desc    Get paginated, filtered, or searched tasks
// @query   ?page=1&limit=10&search=bug&status=todo&priority=high
// @access  Private
router.get("/", authMiddleware, taskController.queryTasks);

// -------------------------
// 📊 Aggregation Endpoints (Admin only)
// -------------------------

// @route   GET /api/tasks/stats/:groupBy?
// @desc    Get task statistics grouped by "status" or "user"
// @example /api/tasks/stats/status  or  /api/tasks/stats/user
// @access  Private (admin only)
router.get(
  "/stats/:groupBy?",
  authMiddleware,
  roleMiddleware("admin"),
  taskController.getTaskStats
);

// -------------------------
// ⚠️ Admin-only Bulk Management
// -------------------------

// @route   DELETE /api/tasks
// @desc    Delete all tasks (admin only)
// @access  Private (admin)
router.delete(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  taskController.deleteAll
);

// -------------------------
// Export Router
// -------------------------
export default router;

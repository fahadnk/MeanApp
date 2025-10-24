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

// ---------------------------------------------------
// ROUTE 1: GET /stats
// ---------------------------------------------------
// This route returns general task statistics when no grouping parameter is provided.
// Example: GET /api/tasks/stats
// ---------------------------------------------------
router.get(
  "/stats",                // ✅ The route path — no dynamic parameter here
  authMiddleware,          // 🧩 Middleware #1: Verifies JWT and attaches user info (req.user)
  roleMiddleware("admin"), // 🧩 Middleware #2: Allows access only if the user has an 'admin' role
  taskController.getTaskStats // 🎯 Controller method that handles the request and sends the response
  // When a GET request hits "/stats", Express runs:
  // 1. authMiddleware → 2. roleMiddleware → 3. getTaskStats()
);


// ---------------------------------------------------
// ROUTE 2: GET /stats/:groupBy
// ---------------------------------------------------
// This route allows optional grouping of task statistics by a specific field.
// Example URLs:
//   - GET /api/tasks/stats/status → Groups by task status (todo, done, etc.)
//   - GET /api/tasks/stats/user   → Groups by assigned user
// ---------------------------------------------------
router.get(
  "/stats/:groupBy",       // ✅ The ":groupBy" is a route parameter (dynamic value from the URL)
  authMiddleware,          // 🧩 Middleware #1: Validates JWT and ensures request is authenticated
  roleMiddleware("admin"), // 🧩 Middleware #2: Checks if user role = "admin" before proceeding
  taskController.getTaskStats // 🎯 Controller method reuses the same logic as the first route
  // Inside controller: req.params.groupBy gives access to the value after "/stats/"
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

// Import Express and create a new router instance
const express = require("express");
const router = express.Router();

// Import the TaskController (handles request/response logic)
const taskController = require("../controllers/task.controller");

// -------------------------
// Task CRUD Endpoints
// -------------------------

// Create a new task
// POST /api/tasks
router.post("/", (req, res) => taskController.create(req, res));

// Get all tasks
// GET /api/tasks
// - Admins see all tasks
// - Regular users see only their assigned tasks
router.get("/", (req, res) => taskController.getAll(req, res));

// Get a single task by ID
// GET /api/tasks/:id
// Authorization: 
//   - Admin can view any task
//   - Regular user can only view their own assigned tasks
router.get("/:id", (req, res) => taskController.getById(req, res));

// Update a task by ID
// PUT /api/tasks/:id
// Authorization: 
//   - Only task creator or admin can update
router.put("/:id", (req, res) => taskController.update(req, res));

// Delete a task by ID
// DELETE /api/tasks/:id
// Authorization: 
//   - Only task creator or admin can delete
router.delete("/:id", (req, res) => taskController.delete(req, res));

// Export the router to be used in app.js/server.js
module.exports = router;

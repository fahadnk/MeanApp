// backend/src/controllers/task.controller.js

// -------------------------
// Import Dependencies
// -------------------------
// Import the TaskService — the business logic layer that communicates
// with repositories and enforces application rules.
import taskService from "../services/task.service.js";

// -------------------------
// Task Controller
// -------------------------
// Controllers handle HTTP requests and responses.
// They do not contain business logic — instead, they delegate it to the service layer.
// Each controller method corresponds to an API endpoint (route handler).
class TaskController {
  // -------------------------
  // Create Task
  // -------------------------
  // @route   POST /api/tasks
  // @access  Protected
  // @desc    Create a new task in the system.
  async createTask(req, res) {
    try {
      // Delegate creation logic to the service layer
      // The request body should contain title, description, etc.
      const task = await taskService.createTask(req.body);

      // Respond with success message and created task
      res.status(201).json({ success: true, task });
    } catch (err) {
      // Catch validation or database errors and send 400 Bad Request
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // -------------------------
  // Get Task By ID
  // -------------------------
  // @route   GET /api/tasks/:id
  // @access  Protected
  // @desc    Retrieve a single task by its ID.
  async getTaskById(req, res) {
    try {
      // Extract task ID from URL parameters and user info from request (via AuthMiddleware)
      const task = await taskService.getTaskById(req.params.id, req.user);

      // Return task data
      res.json({ success: true, task });
    } catch (err) {
      // Handle unauthorized access or not found errors
      res.status(403).json({ success: false, message: err.message });
    }
  }

  // -------------------------
  // Get All Tasks (Role-based)
  // -------------------------
  // @route   GET /api/tasks
  // @access  Protected
  // @desc    Fetch all tasks.
  //           - Admins see all tasks.
  //           - Normal users see only their own tasks.
  async getTasks(req, res) {
    try {
      // Pass current user info to service layer for role-based filtering
      const tasks = await taskService.getTasks(req.user);

      // Return list of tasks
      res.json({ success: true, tasks });
    } catch (err) {
      // Catch unexpected server errors
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // -------------------------
  // Update Task
  // -------------------------
  // @route   PUT /api/tasks/:id
  // @access  Protected
  // @desc    Update an existing task (only admins or task creators allowed).
  async updateTask(req, res) {
    try {
      // Extract ID from params and updated data from request body
      const updated = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user
      );

      // Return updated task object
      res.json({ success: true, task: updated });
    } catch (err) {
      // Handle access denied or validation errors
      res.status(403).json({ success: false, message: err.message });
    }
  }

  // -------------------------
  // Delete Task
  // -------------------------
  // @route   DELETE /api/tasks/:id
  // @access  Protected
  // @desc    Delete a task (admin or task creator only).
  async deleteTask(req, res) {
    try {
      // Call service to delete task by ID
      await taskService.deleteTask(req.params.id, req.user);

      // Send success confirmation
      res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
      // Handle forbidden or not found scenarios
      res.status(403).json({ success: false, message: err.message });
    }
  }

  // -------------------------
  // 🔍 Advanced: Query Tasks (Search, Filter, Pagination)
  // -------------------------
  // @route   GET /api/tasks/query
  // @access  Protected
  // @desc    Fetch tasks using advanced filters like:
  //           - search by title/description
  //           - filter by status or priority
  //           - paginate results (page & limit)
  async queryTasks(req, res) {
    try {
      // `req.query` contains URL query parameters (?search=abc&page=2&limit=10)
      const data = await taskService.queryTasks(req.query, req.user);

      // Spread `data` to include pagination + results
      res.json({ success: true, ...data });
    } catch (err) {
      // Handle invalid query or missing parameters
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // -------------------------
  // 📊 Advanced: Aggregation (Tasks per Status/User)
  // -------------------------
  // @route   GET /api/tasks/stats/:groupBy
  // @access  Admin Only (typically)
  // @desc    Returns aggregated data such as:
  //           - Tasks grouped by status
  //           - Tasks grouped by assigned user
  async getTaskStats(req, res) {
    try {
      // `groupBy` could be 'status' or 'user'
      const { groupBy } = req.params;

      // Delegate aggregation logic to the service
      const stats = await taskService.getTaskStats(groupBy || "status");

      // Return statistics
      res.json({ success: true, stats });
    } catch (err) {
      // Catch invalid groupBy values or database issues
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

// -------------------------
// Export Singleton Controller
// -------------------------
// Export a single instance to maintain consistency across routes.
// This ensures only one shared controller instance handles all incoming requests.
export default new TaskController();

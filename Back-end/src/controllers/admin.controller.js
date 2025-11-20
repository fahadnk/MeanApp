// backend/src/controllers/admin.controller.js

// -------------------------
// 1️⃣ Import Admin Service
// -------------------------
import adminService from "../services/admin.service.js";
// ^ Service layer handles all business logic and DB interactions.
//   Controller should not directly access the database.
//   Keeps separation of concerns: Controller -> Service -> Repository/DB.


// -------------------------
// 2️⃣ Admin Controller Class
// -------------------------
class AdminController {

  // ---------------------------
  // Get all users
  // ---------------------------
  async getAllUsers(req, res) {
    try {
      // Call the service to fetch all users
      const users = await adminService.getAllUsers();

      // Send a JSON response with success flag and users array
      res.json({ success: true, users });
    } catch (err) {
      // If something goes wrong, return 500 Internal Server Error
      res.status(500).json({ success: false, message: err.message });
    }
  }


  // ---------------------------
  // Get a single user by ID
  // ---------------------------
  async getUserById(req, res) {
    try {
      // Fetch user from the service using route param :id
      const user = await adminService.getUserById(req.params.id);

      // Return user in JSON
      res.json({ success: true, user });
    } catch (err) {
      // If user not found or invalid ID, return 404 Not Found
      res.status(404).json({ success: false, message: err.message });
    }
  }


  // ---------------------------
  // Update user by ID
  // ---------------------------
  async updateUser(req, res) {
    try {
      // Pass user ID and new data from request body to service
      const updated = await adminService.updateUser(req.params.id, req.body);

      // Respond with updated user
      res.json({ success: true, user: updated });
    } catch (err) {
      // If validation fails or update fails, return 400 Bad Request
      res.status(400).json({ success: false, message: err.message });
    }
  }


  // ---------------------------
  // Delete user by ID
  // ---------------------------
  async deleteUser(req, res) {
    try {
      // Call service to delete the user
      await adminService.deleteUser(req.params.id);

      // Respond with success message
      res.json({ success: true, message: "User deleted" });
    } catch (err) {
      // If deletion fails (invalid ID, etc.), return 400
      res.status(400).json({ success: false, message: err.message });
    }
  }


  // ---------------------------
  // Get tasks assigned to a user
  // ---------------------------
  async getUserTasks(req, res) {
    try {
      // Fetch tasks from the service using user ID
      const tasks = await adminService.getUserTasks(req.params.id);

      // Return tasks array
      res.json({ success: true, tasks });
    } catch (err) {
      // If user or tasks not found, return 404
      res.status(404).json({ success: false, message: err.message });
    }
  }


  // ---------------------------
  // Create a new task for any user
  // ---------------------------
  async createTaskForUser(req, res) {
    try {
      // Create task using data in request body
      const task = await adminService.createTaskForUser(req.body);

      // Return 201 Created and the task object
      res.status(201).json({ success: true, task });
    } catch (err) {
      // If validation or creation fails, return 400
      res.status(400).json({ success: false, message: err.message });
    }
  }


  // ---------------------------
  // Delete any task by taskId
  // ---------------------------
  async deleteTask(req, res) {
    try {
      // Delete task via service layer
      await adminService.deleteTask(req.params.taskId);

      // Respond with success message
      res.json({ success: true, message: "Task deleted" });
    } catch (err) {
      // If deletion fails, return 400
      res.status(400).json({ success: false, message: err.message });
    }
  }
}


// -------------------------
// 3️⃣ Export Singleton Instance
// -------------------------
export default new AdminController();
// ^ Export a single instance of AdminController.
//   This avoids creating multiple instances across the app and is standard for controllers.

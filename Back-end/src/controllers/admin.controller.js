// backend/src/controllers/admin.controller.js

// Import admin service layer containing business logic for admin operations
import adminService from "../services/admin.service.js";

// Import utility functions for standardized API response formatting
import { success, error } from "../utils/response.js";

// Admin Controller Class - Handles HTTP requests and responses for admin features
class AdminController {

  // Handle GET request to retrieve all users from the system
  async getAllUsers(req, res) {
    try {
      // Call service layer to fetch all users from database
      const users = await adminService.getAllUsers();
      // Return success response with users data
      return success(res, users, "Users fetched successfully");
    } catch (err) {
      // Return server error response if operation fails
      return error(res, err.message, 500);
    }
  }

  // Handle GET request to retrieve a specific user by ID
  async getUserById(req, res) {
    try {
      // Extract user ID from URL parameters and fetch user data
      const user = await adminService.getUserById(req.params.id);
      // Return success response with user data
      return success(res, user, "User fetched successfully");
    } catch (err) {
      // Return not found error if user doesn't exist
      return error(res, err.message, 404);
    }
  }

  // Handle PUT request to update user information
  async updateUser(req, res) {
    try {
      // Update user with ID from URL and data from request body
      const updated = await adminService.updateUser(req.params.id, req.body);
      // Return success response with updated user data
      return success(res, updated, "User updated successfully");
    } catch (err) {
      // Return bad request error if update fails
      return error(res, err.message, 400);
    }
  }

  // Handle DELETE request to remove a user from the system
  async deleteUser(req, res) {
    try {
      // Delete user by ID extracted from URL parameters
      await adminService.deleteUser(req.params.id);
      // Return success response with no data
      return success(res, null, "User deleted successfully");
    } catch (err) {
      // Return bad request error if deletion fails
      return error(res, err.message, 400);
    }
  }

  // Handle GET request to fetch all tasks assigned to a specific user
  async getUserTasks(req, res) {
    try {
      // Fetch tasks for user ID from URL parameters
      const tasks = await adminService.getUserTasks(req.params.id);
      // Return success response with tasks array
      return success(res, tasks, "User tasks fetched successfully");
    } catch (err) {
      // Return not found error if user or tasks don't exist
      return error(res, err.message, 404);
    }
  }

  // Handle POST request to create a new task for any user (admin privilege)
  async createTaskForUser(req, res) {
    try {
      // Create task using data from request body
      const task = await adminService.createTaskForUser(req.body);
      // Return success response with 201 Created status and new task data
      return success(res, task, "Task created successfully", 201);
    } catch (err) {
      // Return bad request error if task creation fails
      return error(res, err.message, 400);
    }
  }

  // Handle DELETE request to remove any task in the system (admin override)
  async deleteTask(req, res) {
    try {
      // Delete task by ID extracted from URL parameters
      await adminService.deleteTask(req.params.taskId);
      // Return success response with no data
      return success(res, null, "Task deleted successfully");
    } catch (err) {
      // Return bad request error if task deletion fails
      return error(res, err.message, 400);
    }
  }
}

// Export singleton instance of AdminController to ensure single instance usage
export default new AdminController();
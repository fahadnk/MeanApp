// backend/src/controllers/task.controller.js

/**
 * TASK CONTROLLER
 * Handles HTTP requests for task management operations
 * Manages task CRUD, querying, statistics, and administrative functions
 * Implements role-based access control and proper error handling
 */

// Import task service layer containing business logic for task operations
import taskService from "../services/task.service.js";

// Import response utility functions for standardized API responses
import { success, error } from "../utils/response.js";

/**
 * Task Controller Class
 * Centralized handler for all task-related HTTP endpoints
 * Handles authentication, authorization, and request/response processing
 */
class TaskController {
  
  /**
   * Create Task
   * Creates a new task in the system with user ownership
   * Validates task data and assigns creator information
   */
  async createTask(req, res) {
    try {
      // Create task using request data and authenticated user info
      const task = await taskService.createTask(req.body, req.user);
      // Return 201 Created with new task data
      return success(res, task, "Task created successfully", 201);
    } catch (err) {
      // Return 400 for validation or creation errors
      return error(res, err.message, 400);
    }
  }

  /**
   * Get Task By ID
   * Retrieves specific task with access control checks
   * Ensures user has permission to view the requested task
   */
  async getTaskById(req, res) {
    try {
      // Fetch task by ID with user permission validation
      const task = await taskService.getTaskById(req.params.id, req.user);
      // Return task data if user has access
      return success(res, task, "Task fetched successfully");
    } catch (err) {
      // Return 403 Forbidden if user lacks access permissions
      return error(res, err.message, 403);
    }
  }

  /**
   * Get All Tasks (Role-Based)
   * Retrieves task list filtered by user role and permissions
   * Admins see all tasks, regular users see only their assigned/created tasks
   */
  async getTasks(req, res) {
    try {
      // Fetch tasks based on user role and permissions
      const tasks = await taskService.getTasks(req.user);
      // Return filtered task list
      return success(res, tasks, "Tasks fetched successfully");
    } catch (err) {
      // Return 500 for server errors during fetch
      return error(res, err.message, 500);
    }
  }

  /**
   * Update Task
   * Modifies existing task with proper ownership validation
   * Ensures only authorized users can update task properties
   */
  async updateTask(req, res) {
    try {
      // Update task with ID, new data, and user permission check
      const updated = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user
      );
      // Return updated task data
      return success(res, updated, "Task updated successfully");
    } catch (err) {
      // Return 403 if user lacks update permissions
      return error(res, err.message, 403);
    }
  }

  /**
   * Delete Task
   * Removes task from system with authorization checks
   * Only task creators or admins can delete tasks
   */
  async deleteTask(req, res) {
    try {
      // Delete task with permission validation
      await taskService.deleteTask(req.params.id, req.user);
      // Return success confirmation
      return success(res, null, "Task deleted successfully");
    } catch (err) {
      // Return 403 if user lacks delete permissions
      return error(res, err.message, 403);
    }
  }

  /**
   * Advanced: Query Tasks
   * Handles filtered, sorted, and paginated task queries
   * Supports complex filtering through query parameters
   */
  async queryTasks(req, res) {
    try {
      // Fetch tasks with advanced filtering from query params
      const data = await taskService.getTasks(req.user, req.query);
      // Return filtered and processed task data
      return success(res, data, "Tasks retrieved successfully");
    } catch (err) {
      // Return 400 for invalid query parameters
      return error(res, err.message, 400);
    }
  }

  /**
   * Aggregation: Task Statistics
   * Generates analytical data and statistics about tasks
   * Groups tasks by various fields for reporting and insights
   */
  async getTaskStats(req, res) {
    try {
      // Extract grouping field from URL parameters or default to status
      const { groupBy } = req.params;
      const groupField = groupBy || "status";

      // Generate statistical data grouped by specified field
      const stats = await taskService.getTaskStats(groupField);

      // Return statistics with grouping information
      return success(
        res,
        { groupBy: groupField, stats },
        "Task statistics fetched successfully"
      );
    } catch (err) {
      // Log error for debugging and return 400 for client errors
      console.error("Error in getTaskStats:", err.message);
      return error(res, err.message, 400);
    }
  }

  /**
   * Delete All Tasks (Admin Only)
   * Administrative function to clear all tasks from system
   * Restricted to users with admin role for safety
   */
  async deleteAll(req, res) {
    try {
      // Verify user has admin privileges
      if (req.user.role !== "admin") {
        return error(res, "Access denied", 403);
      }

      // Execute bulk deletion of all tasks
      await taskService.deleteAllTasks();
      // Return success confirmation
      return success(res, null, "All tasks deleted successfully");
    } catch (err) {
      // Return 500 for server errors during bulk deletion
      return error(res, err.message, 500);
    }
  }
}

// Export singleton instance for consistent controller usage
export default new TaskController();
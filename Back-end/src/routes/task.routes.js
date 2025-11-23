// backend/src/routes/tasks.routes.js

// Import Express framework to create router instances for task-related endpoints
import express from "express";

// Import controller that contains business logic for task operations (CRUD, queries, stats)
import taskController from "../controllers/task.controller.js";

// Import custom middleware functions for authentication, authorization, and validation
import authMiddleware from "../middleware/AuthMiddleware.js"; // Verifies JWT tokens and authenticates users
import roleMiddleware from "../middleware/RoleMiddleware.js"; // Checks user roles and permissions
import validateSchema from "../middleware/ValidateMiddleware.js"; // Validates request bodies against predefined schemas

// Import Joi validation schemas for task creation and update payload validation
import {
  createTaskSchema,
  updateTaskSchema
} from "../validators/task.validator.js";

// Create an Express router instance to define modular, mountable route handlers for tasks
const router = express.Router();

// -------------------------
// CRUD Routes (Basic Task Operations)
// -------------------------

/**
 * CREATE TASK ENDPOINT
 * Path: POST /api/tasks
 * Purpose: Creates a new task in the system
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated and attaches user to request
 * 2. validateSchema(createTaskSchema) - Validates task data against creation rules
 *    - Checks title, description, status, priority, assignedTo, dueDate formats
 * 3. taskController.createTask - Business logic to create task in database
 * Access: Private (any authenticated user can create tasks)
 */
router.post(
  "/",
  authMiddleware, // Authentication: ensures user is logged in (will be used as createdBy)
  validateSchema(createTaskSchema), // Validation: ensures task data meets requirements before processing
  taskController.createTask // Controller: creates task, handles assignedTo validation, sets createdBy
);

/**
 * GET TASK BY ID ENDPOINT
 * Path: GET /api/tasks/:id
 * Purpose: Retrieves a specific task by its unique identifier
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. taskController.getTaskById - Fetches and returns specific task details
 * Access: Private (user must be authenticated, with additional access control in controller)
 * Note: Controller should check if user has permission to view this task (owner, assigned, or admin)
 */
router.get(
  "/:id", 
  authMiddleware, // Authentication: ensures user is logged in
  taskController.getTaskById // Controller: fetches task, populates user references, checks permissions
);

/**
 * UPDATE TASK ENDPOINT
 * Path: PUT /api/tasks/:id
 * Purpose: Updates an existing task's properties
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. validateSchema(updateTaskSchema) - Validates update data against update rules
 *    - May have different validation rules than creation (e.g., partial updates allowed)
 * 3. taskController.updateTask - Business logic to update task in database
 * Access: Private (with authorization checks in controller for task ownership/admin rights)
 */
router.put(
  "/:id",
  authMiddleware, // Authentication: ensures user is logged in
  validateSchema(updateTaskSchema), // Validation: ensures update data is valid
  taskController.updateTask // Controller: updates task, validates ownership/permissions
);

/**
 * DELETE TASK ENDPOINT
 * Path: DELETE /api/tasks/:id
 * Purpose: Permanently deletes a specific task from the system
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. taskController.deleteTask - Business logic to remove task from database
 * Access: Private (with authorization checks in controller for task ownership/admin rights)
 * Note: Typically only task creator or admin should be able to delete tasks
 */
router.delete(
  "/:id",
  authMiddleware, // Authentication: ensures user is logged in
  taskController.deleteTask // Controller: deletes task, validates ownership/permissions
);

// -------------------------
// Advanced Query Endpoints
// -------------------------

/**
 * QUERY TASKS ENDPOINT
 * Path: GET /api/tasks/
 * Purpose: Retrieves filtered, sorted, and paginated list of tasks
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. taskController.queryTasks - Handles complex queries with filtering, sorting, pagination
 * Access: Private (returns tasks based on user's permissions - their tasks or all if admin)
 * Features: Typically supports query params like ?status=done&priority=high&page=1&limit=10
 */
router.get(
  "/", 
  authMiddleware, // Authentication: ensures user is logged in
  taskController.queryTasks // Controller: handles complex filtering, pagination, and sorting
);

// -------------------------
// Aggregation Endpoints (Admin Only)
// -------------------------

/**
 * GET TASK STATISTICS ENDPOINT
 * Path: GET /api/tasks/stats
 * Purpose: Retrieves system-wide task statistics and analytics
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. roleMiddleware("admin") - Restricts access to users with admin role
 * 3. taskController.getTaskStats - Generates and returns statistical data
 * Access: Private, Admin-only (sensitive business intelligence data)
 * Returns: Counts by status, priority, completion rates, user performance metrics
 */
router.get(
  "/stats",
  authMiddleware, // Authentication: ensures user is logged in
  roleMiddleware("admin"), // Authorization: restricts to admin users only
  taskController.getTaskStats // Controller: performs MongoDB aggregations for analytics
);

/**
 * GET GROUPED TASK STATISTICS ENDPOINT
 * Path: GET /api/tasks/stats/:groupBy
 * Purpose: Retrieves task statistics grouped by specific field (status, priority, user, etc.)
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. roleMiddleware("admin") - Restricts access to users with admin role
 * 3. taskController.getTaskStats - Generates grouped statistical data
 * Access: Private, Admin-only
 * Examples: 
 *   /api/tasks/stats/status - Group tasks by status (todo, in-progress, done)
 *   /api/tasks/stats/priority - Group tasks by priority (low, medium, high)
 *   /api/tasks/stats/assignedTo - Group tasks by assigned user
 */
router.get(
  "/stats/:groupBy",
  authMiddleware, // Authentication: ensures user is logged in
  roleMiddleware("admin"), // Authorization: restricts to admin users only
  taskController.getTaskStats // Controller: handles dynamic grouping based on :groupBy parameter
);

// -------------------------
// Administrative Operations (Admin Only)
// -------------------------

/**
 * DELETE ALL TASKS ENDPOINT
 * Path: DELETE /api/tasks/
 * Purpose: Permanently deletes all tasks from the system (dangerous operation)
 * Middleware Chain:
 * 1. authMiddleware - Verifies user is authenticated
 * 2. roleMiddleware("admin") - Restricts access to users with admin role
 * 3. taskController.deleteAll - Business logic to remove all tasks
 * Access: Private, Admin-only (highly destructive operation - use with caution)
 * Use Case: System maintenance, testing environment cleanup, data reset operations
 */
router.delete(
  "/",
  authMiddleware, // Authentication: ensures user is logged in
  roleMiddleware("admin"), // Authorization: restricts to admin users only - critical for safety
  taskController.deleteAll // Controller: performs bulk delete with proper error handling
);

// Export the router to be mounted in the main application (usually in app.js or server.js)
export default router;
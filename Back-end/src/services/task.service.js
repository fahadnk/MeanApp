// backend/src/services/task.service.js

// -------------------------
// Import the TaskRepository for database operations
// -------------------------
import taskRepository from "../repositories/task.repository.js";

// -------------------------
// Import the DTO to ensure safe and consistent API responses
// -------------------------
import { taskDTO } from "./dto.js";

// -------------------------
// Service Layer for Tasks
// Encapsulates business logic and rules related to tasks
// -------------------------
class TaskService {
  // -------------------------
  // Create a new task
  // Example: taskService.createTask({ title, description, createdBy, assignedTo })
  // -------------------------
  async createTask(taskData) {
    const task = await taskRepository.create(taskData);
    return taskDTO(task); // return safe DTO
  }

  // -------------------------
  // Get a task by ID with authorization checks
  // Business rules:
  // - Admins can view all tasks
  // - Normal users can only view tasks assigned to them
  // -------------------------
  async getTaskById(id, currentUser) {
    const task = await taskRepository.findById(id);

    if (!task) throw new Error("Task not found");

    if (
      currentUser.role !== "admin" &&
      task.assignedTo.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    return taskDTO(task);
  }

  // -------------------------
  // Get all tasks depending on user role
  // - Admins → all tasks
  // - Users → only their assigned tasks
  // -------------------------
  async getTasks(currentUser) {
    if (currentUser.role === "admin") {
      const tasks = await taskRepository.getAll();
      return tasks.map(taskDTO);
    } else {
      const tasks = await taskRepository.findByUser(currentUser.id);
      return tasks.map(taskDTO);
    }
  }

  // -------------------------
  // Update a task with ownership/role validation
  // Business rules:
  // - Only the task creator OR an admin can update
  // -------------------------
  async updateTask(id, updateData, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    if (
      currentUser.role !== "admin" &&
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    const updated = await taskRepository.update(id, updateData);
    return taskDTO(updated);
  }

  // -------------------------
  // Delete a task with ownership/role validation
  // Business rules:
  // - Only the task creator OR an admin can delete
  // -------------------------
  async deleteTask(id, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    if (
      currentUser.role !== "admin" &&
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    return await taskRepository.delete(id);
  }
}

// -------------------------
// Export a single instance of TaskService (Singleton pattern)
// Ensures consistent usage across controllers
// -------------------------
const taskService = new TaskService();
export default taskService;

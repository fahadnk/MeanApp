// backend/src/services/task.service.js

// ---------------------------------------------------
// Import Dependencies
// ---------------------------------------------------

// Repository → Handles direct database operations for Task.
// This keeps DB logic separate from business rules.
import taskRepository from "../repositories/task.repository.js";

// DTO (Data Transfer Object) → Transforms raw DB documents
// into safe, clean objects for API responses (hides internal fields).
import { taskDTO } from "../services/dto.js";


// ---------------------------------------------------
// TaskService Class
// ---------------------------------------------------
// The service layer contains business logic for tasks.
// It decides *what* operations are allowed and delegates *how*
// they are executed to the repository layer.
class TaskService {
  // -------------------------
  // Create a new task
  // -------------------------
  async createTask(taskData) {
    // Save task to database via repository
    const task = await taskRepository.create(taskData);

    // Convert raw DB object → DTO before returning
    return taskDTO(task);
  }

  // -------------------------
  // Get task by ID (with access control)
  // -------------------------
  async getTaskById(id, currentUser) {
    // Fetch task by ID (repository populates relations)
    const task = await taskRepository.findById(id);

    // If task does not exist → throw error
    if (!task) throw new Error("Task not found");

    // Authorization rules:
    // - Admins can view all tasks
    // - Normal users can only view tasks assigned to them
    if (
      currentUser.role !== "admin" &&
      task.assignedTo.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    // Return safe DTO object
    return taskDTO(task);
  }

  // -------------------------
  // Get all tasks (role-based filtering)
  // -------------------------
  async getTasks(currentUser) {
    if (currentUser.role === "admin") {
      // Admins can fetch all tasks
      const tasks = await taskRepository.getAll();
      return tasks.map(taskDTO);
    } else {
      // Normal users → fetch only their assigned tasks
      const tasks = await taskRepository.findByUser(currentUser.id);
      return tasks.map(taskDTO);
    }
  }

  // -------------------------
  // Update task (only creator or admin allowed)
  // -------------------------
  async updateTask(id, updateData, currentUser) {
    // Fetch task first (needed for authorization check)
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    // Only admin or the task creator can update
    if (
      currentUser.role !== "admin" &&
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    // Apply update in database
    const updated = await taskRepository.update(id, updateData);

    // Return updated task as DTO
    return taskDTO(updated);
  }

  // -------------------------
  // Delete task (only creator or admin allowed)
  // -------------------------
  async deleteTask(id, currentUser) {
    // Fetch task (to check permissions)
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    // Only admin or the task creator can delete
    if (
      currentUser.role !== "admin" &&
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    // Delete task via repository
    return await taskRepository.delete(id);
  }
}


// ---------------------------------------------------
// Export Service
// ---------------------------------------------------
// Export a singleton instance so routes/controllers
// can use `taskService` directly.
export default new TaskService();

// Import the TaskRepository for database operations
const taskRepository = require("../repositories/task.repository");

// Import the DTO to ensure safe and consistent API responses
const { taskDTO } = require("./dto");

// Service Layer for Tasks
// Encapsulates business logic and rules related to tasks
class TaskService {
  // Create a new task
  async createTask(taskData) {
    const task = await taskRepository.create(taskData);
    return taskDTO(task); // return safe DTO
  }

  // Get a task by ID with authorization checks
  async getTaskById(id, currentUser) {
    const task = await taskRepository.findById(id);

    // If task does not exist, throw error
    if (!task) throw new Error("Task not found");

    // Business rule: user can only view tasks assigned to them
    // Admins can view all tasks
    if (
      currentUser.role !== "admin" &&
      task.assignedTo.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    return taskDTO(task);
  }

  // Get all tasks depending on user role
  async getTasks(currentUser) {
    if (currentUser.role === "admin") {
      // Admins can fetch all tasks
      const tasks = await taskRepository.getAll();
      return tasks.map(taskDTO);
    } else {
      // Normal users can only see tasks assigned to them
      const tasks = await taskRepository.findByUser(currentUser.id);
      return tasks.map(taskDTO);
    }
  }

  // Update a task with ownership/role validation
  async updateTask(id, updateData, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    // Business rule: only task creator or admin can update
    if (
      currentUser.role !== "admin" &&
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    const updated = await taskRepository.update(id, updateData);
    return taskDTO(updated);
  }

  // Delete a task with ownership/role validation
  async deleteTask(id, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    // Business rule: only task creator or admin can delete
    if (
      currentUser.role !== "admin" &&
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    return await taskRepository.delete(id);
  }
}

// Export a single instance of TaskService (Singleton pattern)
// Ensures consistent usage across controllers
module.exports = new TaskService();

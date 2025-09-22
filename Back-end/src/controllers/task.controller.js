// Import the Task repository (handles direct DB operations)
const taskRepository = require("../repositories/task.repository");

// Import DTO transformer (to hide internal fields and format API response)
const { taskDTO } = require("./dto");

class TaskService {
  // -------------------------
  // Create a new task
  // -------------------------
  async createTask(taskData) {
    // Save task in DB
    const task = await taskRepository.create(taskData);

    // Return formatted DTO
    return taskDTO(task);
  }

  // -------------------------
  // Get task by ID (with access control)
  // -------------------------
  async getTaskById(id, currentUser) {
    // Fetch task by ID (with populated assignedTo & createdBy)
    const task = await taskRepository.findById(id);

    // If no task found → throw error
    if (!task) throw new Error("Task not found");

    // Business rule: 
    // - Admins can access all tasks
    // - Normal users can only view tasks assigned to them
    if (
      currentUser.role !== "admin" && 
      task.assignedTo.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    // Return formatted DTO
    return taskDTO(task);
  }

  // -------------------------
  // Get tasks list (role-based filtering)
  // -------------------------
  async getTasks(currentUser) {
    if (currentUser.role === "admin") {
      // Admin → get all tasks
      const tasks = await taskRepository.getAll();
      return tasks.map(taskDTO);
    } else {
      // Normal user → only tasks assigned to them
      const tasks = await taskRepository.findByUser(currentUser.id);
      return tasks.map(taskDTO);
    }
  }

  // -------------------------
  // Update task (only creator or admin allowed)
  // -------------------------
  async updateTask(id, updateData, currentUser) {
    // Fetch task first for authorization
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    // Only admin or task creator can update
    if (
      currentUser.role !== "admin" && 
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    // Update task in DB
    const updated = await taskRepository.update(id, updateData);

    // Return updated task DTO
    return taskDTO(updated);
  }

  // -------------------------
  // Delete task (only creator or admin allowed)
  // -------------------------
  async deleteTask(id, currentUser) {
    // Fetch task for authorization
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    // Only admin or task creator can delete
    if (
      currentUser.role !== "admin" && 
      task.createdBy.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    // Delete task from DB
    return await taskRepository.delete(id);
  }
}

// Export singleton instance of TaskService
module.exports = new TaskService();

// backend/src/services/task.service.js

// -------------------------
// Import Dependencies
// -------------------------
// Repository → handles all DB operations
import taskRepository from "../repositories/task.repository.js";

// DTO → ensures safe, consistent response structures
import { taskDTO } from "./dto.js";

// NotificationService → handles real-time event broadcasting (Observer Pattern)
import notificationService from "./notification.service.js";


// -------------------------
// TaskService (Business Logic Layer)
// -------------------------
// The service layer enforces business logic and communicates
// between controllers (HTTP layer) and repositories (DB layer).
// -------------------------
class TaskService {
  // -------------------------
  // 🟢 Create a new task
  // -------------------------
async createTask(taskData, currentUser) {
  // Ensure createdBy is set automatically
  const task = await taskRepository.create({
    ...taskData,
    createdBy: currentUser.id,         // REQUIRED
    assignedTo: taskData.assignedTo || currentUser.id, // optional default
  });

  const dto = taskDTO(task);
  notificationService.taskCreated(dto);

  return dto;
}


  // -------------------------
  // 🔍 Get task by ID (Access Control)
  // -------------------------
  async getTaskById(id, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    // Role-based access control
    if (
      currentUser.role !== "admin" &&
      task.assignedTo.toString() !== currentUser.id.toString()
    ) {
      throw new Error("Access denied");
    }

    return taskDTO(task);
  }

  // -------------------------
  // 📋 Get all tasks (with Search, Filter, Pagination)
  // -------------------------
  async getTasks(currentUser, queryParams = {}) {
    const { page = 1, limit = 10, search = "", status, priority } = queryParams;
    const filters = { search, status, priority };

    if (currentUser.role !== "admin") {
      filters.assignedTo = currentUser.id;
    }

    const { data, pagination } = await taskRepository.getAll({
      page: Number(page),
      limit: Number(limit),
      ...filters,
    });

    const dtoList = data.map(taskDTO);
    return { tasks: dtoList, pagination };
  }

  // -------------------------
  // ✏️ Update task (with Access Validation)
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
    const dto = taskDTO(updated);

    // 🔔 Emit "taskUpdated" event in real-time
      notificationService.taskUpdated(dto);

    return dto;
  }

  // -------------------------
  // 🗑️ Delete task (with Access Validation)
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

    // Delete via repository
    const deletedTask = await taskRepository.delete(id);
    

    // 🔔 Emit event (optional)
     notificationService.taskDeleted({ id });
    

    return deletedTask;
  }

  // -------------------------
  // 📊 Task Aggregation (Analytics)
  // -------------------------
  async getTaskStats() {
    const [byUser, byStatus] = await Promise.all([
      taskRepository.countTasksByUser(),
      taskRepository.countTasksByStatus(),
    ]);
    return { byUser, byStatus };
  }
}

// -------------------------
// Export Singleton Instance
// -------------------------
export default new TaskService();

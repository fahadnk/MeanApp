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
// -----------------------------
// 🧩 Get a single task by ID with access control
// -----------------------------
async getTaskById(id, currentUser) {
  // 1️⃣ Fetch the task document from the database using the repository.
  //     - The repository handles population of "assignedTo" and "createdBy".
  //     - Returns either a plain object (due to `.lean()`) or null if not found.
  const task = await taskRepository.findById(id);

  // 2️⃣ If no task exists with this ID, throw an error.
  if (!task) throw new Error("Task not found");

  // 3️⃣ Extract `assignedToId`
  //     - When `.populate()` is used, `assignedTo` becomes an *object* like:
  //         { _id: '65f...', name: 'Ali', email: '...' }
  //     - When not populated, it’s a simple ObjectId.
  //     - So we normalize both cases to a clean string `_id`.
  const assignedToId =
    typeof task.assignedTo === "object"
      ? task.assignedTo._id?.toString()   // populated → extract _id
      : task.assignedTo?.toString();      // raw ObjectId → toString()

  // 4️⃣ Extract `createdById` using the same logic as above.
  //     - Ensures safe comparison between IDs regardless of population state.
  const createdById =
    typeof task.createdBy === "object"
      ? task.createdBy._id?.toString()
      : task.createdBy?.toString();

  // 5️⃣ Apply Role-Based Access Control (RBAC)
  //     - Admins can view all tasks.
  //     - Regular users can only view:
  //         a) tasks assigned to them, OR
  //         b) tasks they themselves created.
  //     - If none of these match, deny access.
  if (
    currentUser.role !== "admin" &&       // not admin
    assignedToId !== currentUser.id &&    // not assigned
    createdById !== currentUser.id        // not creator
  ) {
    throw new Error("Access denied");
  }

  // 6️⃣ Convert the database document into a clean DTO (Data Transfer Object)
  //     - Removes internal fields like `_id`, `__v`, etc.
  //     - Ensures consistent response shape for the frontend.
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

  // Delete Function

  async deleteTask(id, currentUser) {
      // 1️⃣ Retrieve the task from the database using its ID
      // This uses the repository layer to abstract DB operations
      const task = await taskRepository.findById(id);

      // 2️⃣ If the task does not exist, throw an error
      // This prevents trying to delete a non-existent task
      if (!task) throw new Error("Task not found");

      // 3️⃣ Determine the task creator's ID in a safe way
      // Handles both populated documents (object) and raw ObjectId
      const createdById =
        typeof task.createdBy === "object" // If populated
          ? task.createdBy._id?.toString() // Convert _id to string
          : task.createdBy?.toString();    // If raw ObjectId, convert to string

      // 4️⃣ Role-based access control
      // Only admins or the creator of the task can delete it
      if (currentUser.role !== "admin" && createdById !== currentUser.id) {
        throw new Error("Access denied"); // Throw error if user is not authorized
      }

      // 5️⃣ Perform the deletion using the repository layer
      // The repository handles database-specific logic
      const deletedTask = await taskRepository.delete(id);

      // 6️⃣ Emit a real-time event using Socket.IO
      // Notifies connected clients that the task was deleted
      notificationService.taskDeleted({ id });

      // 7️⃣ Return the deleted task (or deletion result) to the caller
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

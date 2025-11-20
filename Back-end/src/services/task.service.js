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

      // ⭐ ADDED
  await this.notifyTaskCreatedForUser(task);

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

 async updateTask(id, updateData, currentUser) {
  // 1️⃣ Retrieve the task from the database by its unique ID
  // taskRepository.findById returns a task object if found, otherwise null/undefined
  const task = await taskRepository.findById(id);

  // 2️⃣ If no task exists with the given ID, throw an error
  // This prevents updating a non-existent task
  if (!task) throw new Error("Task not found");

  // 3️⃣ Normalize the 'createdBy' field from the task
  // In MongoDB with Mongoose, the 'createdBy' field could either be:
  // a) an Object (populated reference) → task.createdBy._id
  // b) a raw ObjectId → task.createdBy
  // We convert it to a string for reliable comparison with currentUser.id
  const createdById =
    typeof task.createdBy === "object"
      ? task.createdBy._id?.toString() // If populated, get the _id and convert to string
      : task.createdBy?.toString();    // If raw ObjectId, convert to string

  // 4️⃣ Authorization check: ensure the user has permission to update this task
  // Admin users can update any task
  // Non-admin users can only update tasks they created
  // If neither condition is met, throw an "Access denied" error
  if (currentUser.role !== "admin" && createdById !== currentUser.id.toString()) {
    throw new Error("Access denied"); // This was causing 403 in your API
  }

  // 5️⃣ Perform the update using the repository
  // taskRepository.update handles the database update operation
  // updateData contains the fields to be updated
  const updated = await taskRepository.update(id, updateData);

  // 6️⃣ Transform the updated task object into a DTO
  // taskDTO filters and structures the data to return only relevant info
  // This ensures the client does not get sensitive internal fields
  const dto = taskDTO(updated);

  // 7️⃣ Notify other services or clients about the task update
  // notificationService.taskUpdated could trigger WebSocket events,
  // email notifications, or other side-effects
  notificationService.taskUpdated(dto);

  // 8️⃣ Return the transformed task to the client
  // Provides a clean, structured response
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

  async countTasksForUser(userId) {
    return await taskRepository.countByAssignedUser(userId);
  }

  async getTasksByUser(userId, { page = 1, limit = 10 } = {}) {
    return await taskRepository.findByUser(userId, { page, limit });
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

  // -------------------------
  // 🔔 Notify specific user when a task is created
  // -------------------------
  async notifyTaskCreatedForUser(task) {

    // Extract the user ID assigned to the task.
    // Because Mongoose can return populated objects OR raw ObjectId,
    // we safely detect the format.

    const userId =
      typeof task.assignedTo === "object"          // If `assignedTo` is populated (full user object)
        ? task.assignedTo._id?.toString()          // → Extract its _id and convert to string
        : task.assignedTo?.toString();             // Otherwise, use the raw ObjectId directly

    // If a userId was successfully extracted
    if (userId) {

      // Forward the event to the NotificationService.
      // This method will:
      //  - Find the user’s socket room (userId)
      //  - Emit a "taskCreated" event with task details
      //  - Notify ONLY that specific user
      notificationService.taskCreatedForUser(userId, task);
    }
  }

}

// -------------------------
// Export Singleton Instance
// -------------------------
export default new TaskService();

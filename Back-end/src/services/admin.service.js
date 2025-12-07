// backend/src/services/admin.service.js

// -------------------------
// 1️⃣ Import Repositories
// -------------------------
import userRepository from "../repositories/user.repository.js";
// ^ Handles all database operations for users (CRUD).

import taskRepository from "../repositories/task.repository.js";
// ^ Handles all database operations for tasks (CRUD).


// -------------------------
// 2️⃣ Import DTO Functions
// -------------------------
import { userDTO, taskDTO } from "./dto.js";
// ^ DTO (Data Transfer Object) functions convert raw DB models
//   into clean JSON objects that we send to the frontend.
//   Hides sensitive fields like passwords.


// -------------------------
// 3️⃣ Import Notification Service
// -------------------------
import notificationService from "./notification.service.js";
// ^ Handles real-time notifications via Socket.IO.
//   Sends events like "task created" or "task deleted" to specific users.


// -------------------------
// 4️⃣ Admin Service Class
// -------------------------
class AdminService {

  // ---------------------------
  // 4.1 Users
  // ---------------------------

  // Get all users
  async getAllUsers() {
    const users = await userRepository.getAll(); // Fetch all users from DB
    return users.map(userDTO);                   // Convert each user to DTO
  }

  // Get single user by ID
  async getUserById(id) {
    const user = await userRepository.findById(id); // Fetch user by ID
    if (!user) throw new Error("User not found");   // Throw error if missing

    return userDTO(user);                           // Convert to DTO before sending
  }

  // Update user by ID
  async updateUser(id, data) {
    const updated = await userRepository.update(id, data); // Update user in DB
    return userDTO(updated);                               // Convert to DTO
  }

  // Delete user by ID
  async deleteUser(id) {
    return await userRepository.delete(id); // Remove user from DB
  }


  // ---------------------------
  // 4.2 Tasks by User
  // ---------------------------

  async getUserTasks(userId) {
    const tasks = await taskRepository.findByUser(userId); // Fetch tasks assigned to user
    return tasks.data.map(taskDTO);                        // Convert tasks to DTO
  }


  // ---------------------------
  // 4.3 Create Task for ANY User
  // ---------------------------
  async createTaskForUser(data) {
    if (!data.assignedTo) {
      throw new Error("assignedTo is required"); // Must specify user
    }

    // Create the task in DB
    const task = await taskRepository.create({
      ...data,
      createdBy: data.createdBy, // Default to "admin" if not provided
    });

    const dto = taskDTO(task); // Convert task to DTO

    // Notify only the assigned user
    notificationService.taskCreatedForUser(data.assignedTo, dto);

    return dto; // Return task DTO to controller
  }


  // ---------------------------
  // 4.4 Delete Any Task
  // ---------------------------
  async deleteTask(taskId) {
    // Ensure the task exists first
    const exists = await taskRepository.findById(taskId);
    if (!exists) throw new Error("Task not found");

    // Delete task from DB
    await taskRepository.delete(taskId);

    // Notify relevant users (optional: could be assigned user)
    notificationService.taskDeleted(taskId);

    return true; // Indicate successful deletion
  }

  async promoteUserToManager(req, res) {
  try {
    const updated = await adminService.promoteUserToManager(req.params.id, req.user);
    return success(res, updated, "User promoted to manager");
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async demoteUserToUser(req, res) {
  try {
    const updated = await adminService.demoteUserToUser(req.params.id, req.user);
    return success(res, updated, "User demoted to user");
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async assignUserToTeam(req, res) {
  try {
    const updated = await adminService.assignUserToTeam(req.params.id, req.body.teamId, req.user);
    return success(res, updated, "User assigned to team");
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async removeUserFromTeam(req, res) {
  try {
    const updated = await adminService.removeUserFromTeam(req.params.id, req.user);
    return success(res, updated, "User removed from team");
  } catch (err) {
    return error(res, err.message, 400);
  }
}

}


// -------------------------
// 5️⃣ Export Singleton Instance
// -------------------------
export default new AdminService();
// ^ Single instance ensures consistent behavior across app.
//   Controllers use this instance to perform all admin operations.

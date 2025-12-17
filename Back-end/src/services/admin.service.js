// backend/src/services/admin.service.js

// -------------------------
// 1️⃣ Import Repositories
// -------------------------
import userRepository from "../repositories/user.repository.js";
// ^ Handles all database operations for users (CRUD).

import taskRepository from "../repositories/task.repository.js";
// ^ Handles all database operations for tasks (CRUD).

import teamRepository from "../repositories/team.repository.js";


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

  // -------------------------------------------
  // Promote User → Manager
  // -------------------------------------------
  async promoteUserToManager(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "manager") {
      throw new Error("User is already a Manager");
    }

    user.role = "manager";
    await user.save();

    return user;
  }



  // -------------------------------------------
  // Demote Manager → User
  // -------------------------------------------
  async demoteUserToNormal(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "manager") {
      throw new Error("User is not a Manager");
    }

    user.role = "user";
    await user.save();

    return user;
  }

  async assignUserToTeam(userId, teamId, currentUser) {
    // 1) Only Admin can perform this
    if (currentUser.role !== "admin") {
      throw new Error("Only admin can assign users to teams");
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    // Prevent assigning admins into teams
    if (user.role === "admin") {
      throw new Error("Admins cannot be assigned to teams");
    }

    // Prevent assigning a manager to someone else's team
    if (user.role === "manager" && team.manager.toString() !== userId) {
      throw new Error("Managers can only manage their own team");
    }

    // Add user to team members list (avoid duplicates)
    if (!team.members.includes(userId)) {
      team.members.push(userId);
    }

    // Set user's team
    user.team = teamId;

    await user.save();
    await team.save();

    return { user, team };
  }


  async removeUserFromTeam(userId, currentUser) {
    // 1) Only Admin can perform this
    if (currentUser.role !== "admin") {
      throw new Error("Only admin can remove users from teams");
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    if (!user.team) {
      throw new Error("User is not assigned to any team");
    }

    const team = await teamRepository.findById(user.team);
    if (!team) throw new Error("Team not found");

    // Special rule: manager cannot be removed from their own team  
    if (user.role === "manager" && team.manager.toString() === userId) {
      throw new Error("A team manager cannot be removed from their own team");
    }

    // Remove user from team list
    team.members = team.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    // Unassign team from user
    user.team = null;

    await team.save();
    await user.save();

    return { user, team };
  }

  async createUserByAdmin(data) {
    const { name, email, password, role } = data;

    // 1️⃣ Check existing user
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }

    // 2️⃣ Create user with forced password reset
    const user = await userRepository.create({
      name,
      email,
      password,
      role,
      mustResetPassword: true, // ⭐ admin-created users
    });

    return userDTO(user);
  }

  // -------------------------------------------
  // Dashboard → Task Statistics
  // -------------------------------------------
  // Returns count of tasks by status
  // Used for Admin Dashboard charts
  async getTaskStats() {
    const stats = await taskRepository.countTasksByStatus();

    const result = {
      completed: 0,
      inProgress: 0,
      pending: 0
    };

    stats.forEach(s => {
      result[s.status] = s.total;
    });

    return result;
  }

  async getUserStats() {
    const [usersCount, managersCount] = await Promise.all([
      userRepository.countByRole("user"),
      userRepository.countByRole("manager"),
    ]);

    return {
      usersCount,
      managersCount,
    };
  }

  async getManagers() {
    return await userRepository.findByRole("manager");
  }

  async getTeams() {
    return await teamRepository.getAllPopulated();
  }

}


// -------------------------
// 5️⃣ Export Singleton Instance
// -------------------------
export default new AdminService();
// ^ Single instance ensures consistent behavior across app.
//   Controllers use this instance to perform all admin operations.

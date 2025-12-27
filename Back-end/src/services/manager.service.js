// backend/src/services/manager.service.js

import teamRepository from "../repositories/team.repository.js";
import userRepository from "../repositories/user.repository.js";
import taskService from "./task.service.js";
import Team from "../models/team.model.js";
import user from "../models/user.model.js";

class ManagerService {

  // -------------------------------------
  // Create Team
  // -------------------------------------
  async createTeam(managerId, name) {
    return await teamRepository.create({ name, manager: managerId });
  }

  // -------------------------------------
  // Add User to Team
  // -------------------------------------
  async addUserToTeam(managerId, teamId, userId) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    if (team.manager.toString() !== managerId) {
      throw new Error("Not authorized");
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    // 🔐 ROLE SAFETY
    if (user.role !== "user") {
      throw new Error("Only users with role 'user' can be added to a team");
    }

    if (team.members.includes(userId)) {
      throw new Error("User already in team");
    }

    team.members.push(userId);
    await team.save();

    return team;
  }

  // -------------------------------------
  // Remove User
  // -------------------------------------
  async removeUserFromTeam(managerId, teamId, userId) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    if (team.manager.toString() !== managerId) {
      throw new Error("Not authorized");
    }

    team.members = team.members.filter(id => id.toString() !== userId);
    await team.save();

    return team;
  }

  // -------------------------------------
  // Get All Tasks of This Team
  // -------------------------------------
  async getTeamTasks(managerId, teamId) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    if (team.manager.toString() !== managerId) {
      throw new Error("Not authorized");
    }

    return await taskService.getTasksForTeam(teamId);
  }

  // -------------------------------------
  // Create Task For Team Members
  // -------------------------------------
  async createTaskForTeam(user, taskBody) {
    return await taskService.createTask(taskBody, user, { managerMode: true });
  }

  // -------------------------------------
  // Update Task
  // -------------------------------------
  async updateTaskForTeam(user, taskId, updateData) {
    return await taskService.updateTask(taskId, updateData, user);
  }

  // -------------------------------------
  // Delete Task
  // -------------------------------------
  async deleteTaskForTeam(user, taskId) {
    return await taskService.deleteTask(taskId, user);
  }

  // -------------------------------------
  // View All Users
  // -------------------------------------
  async getAvailableUsers(teamId) {
    return await userRepository.findAvailableUsers(teamId);
  }

  async getAllUsersPaginated(query) {
    return await userRepository.findUsersByRolePaginated("user", query);
  }

  async deleteTeam(teamId, managerId) {
    const team = await Team.findById(teamId);
    if (!team) throw new Error("Team not found");

    if (team.manager.toString() !== managerId.toString()) {
      throw new Error("Not authorized");
    }

    // 🔥 Unassign users from this team
    await user.updateMany(
      { team: teamId },
      { $unset: { team: "" } }
    );

    // 🔥 Delete team
    await Team.findByIdAndDelete(teamId);

    return true;
  }


}

export default new ManagerService();

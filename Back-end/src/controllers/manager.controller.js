// backend/src/controllers/manager.controller.js

import managerService from "../services/manager.service.js";
import { success, error } from "../utils/response.js";

class ManagerController {

  // -----------------------------
  // Create Team
  // -----------------------------
  async createTeam(req, res) {
    try {
      const team = await managerService.createTeam(req.user.id, req.body.name);
      return success(res, team, "Team created successfully", 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // -----------------------------
  // Add User To Team
  // -----------------------------
  async addUserToTeam(req, res) {
    try {
      const team = await managerService.addUserToTeam(
        req.user.id,
        req.params.teamId,
        req.params.userId
      );
      return success(res, team, "User added to team");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // -----------------------------
  // Remove User From Team
  // -----------------------------
  async removeUserFromTeam(req, res) {
    try {
      const team = await managerService.removeUserFromTeam(
        req.user.id,
        req.params.teamId,
        req.params.userId
      );
      return success(res, team, "User removed from team");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // -----------------------------
  // Get All Team Tasks
  // -----------------------------
  async getTeamTasks(req, res) {
    try {
      const tasks = await managerService.getTeamTasks(req.user.id, req.params.teamId);
      return success(res, tasks, "Team tasks fetched successfully");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // -----------------------------
  // Create Task For Team Member
  // -----------------------------
  async createTaskForTeam(req, res) {
    try {
      const task = await managerService.createTaskForTeam(req.user, req.body);
      return success(res, task, "Task created successfully", 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // -----------------------------
  // Update Task For Team Member
  // -----------------------------
  async updateTaskForTeam(req, res) {
    try {
      const task = await managerService.updateTaskForTeam(
        req.user,
        req.params.taskId,
        req.body
      );
      return success(res, task, "Task updated successfully");
    } catch (err) {
      return error(res, err.message, 403);
    }
  }

  // -----------------------------
  // Delete Task For Team Member
  // -----------------------------
  async deleteTaskForTeam(req, res) {
    try {
      await managerService.deleteTaskForTeam(req.user, req.params.taskId);
      return success(res, null, "Task deleted successfully");
    } catch (err) {
      return error(res, err.message, 403);
    }
  }

  // -----------------------------
  // Read-Only: View All Users
  // -----------------------------
  async getAllUsers(req, res) {
    try {
      const users = await managerService.getAllUsers();
      return success(res, users, "Users fetched");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new ManagerController();

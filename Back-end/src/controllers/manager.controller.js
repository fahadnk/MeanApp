// backend/src/controllers/manager.controller.js

import managerService from "../services/manager.service.js";
import { success, error } from "../utils/response.js";

class ManagerController {

  // -----------------------------
  // Create Team
  // -----------------------------
  async createTeam(req, res) {
    try {
      const team = await managerService.createTeam(req.user._id, req.body.name);
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
        req.user._id,
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
        req.user._id,
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
  // backend/src/controllers/manager.controller.js

  // -----------------------------
  // Get All Team Tasks
  // -----------------------------
  async getTeamTasks(req, res) {
    try {
      // SAFELY get user ID from multiple possible locations
      const userId = req.user?._id || req.user?.id || req.user?.userId;

      if (!userId) {
        console.log('❌ No user ID found in request');
        return error(res, "User not authenticated - no user ID", 401);
      }

      console.log('✅ Using userId:', userId);

      const tasks = await managerService.getTeamTasks(
        userId,
        req.params.teamId,
        req.query
      );

      return success(res, tasks, "Team tasks fetched successfully");
    } catch (err) {
      console.error('❌ Error in getTeamTasks:', err);
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
      const users = await managerService.getAllUsersPaginated(req.query);
      return success(res, users, "Users fetched");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  async getAvailableUsers(req, res) {
    try {
      const users = await managerService.getAvailableUsers(req.params.teamId);
      return success(res, users, "Available users fetched");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // -----------------------------
  // Get Team Stats
  // -----------------------------
  async getTeamStats(req, res) {
    try {
      const stats = await managerService.getTeamStats(
        req.user._id,
        req.params.teamId
      );

      return success(res, stats, "Team stats fetched successfully");
    } catch (err) {
      return error(res, err.message, 403);
    }
  }

  async deleteTeam(req, res) {
    try {
      const { teamId } = req.params;
      const managerId = req.user.id; // ✅ THIS WAS MISSING

      await managerService.deleteTeam(teamId, managerId);

      return success(res, "Team deleted successfully");
    } catch (err) {
      return error(res, err.message || "Failed to delete team", 400);
    }
  };

}

export default new ManagerController();

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
  // Get All Tasks of This Team (with pagination & filters)
  // -------------------------------------
  async getTeamTasks(managerId, teamId, queryParams = {}) {
    console.log('ManagerService.getTeamTasks - Start');
    console.log('ManagerId:', managerId);
    console.log('TeamId:', teamId);
    console.log('QueryParams:', queryParams);
    
    // Validate inputs
    if (!managerId) {
      console.log('❌ ManagerId is undefined or null');
      throw new Error("Manager ID is required");
    }
    
    const team = await teamRepository.findById(teamId);
    if (!team) {
      console.log('❌ Team not found');
      throw new Error("Team not found");
    }

    console.log('Team found:', team.name);
    console.log('Team manager type:', typeof team.manager);
    console.log('Team manager value:', team.manager);

    // SAFELY extract manager ID regardless of whether it's populated or just an ID
    let teamManagerId = null;
    
    if (!team.manager) {
      console.log('❌ Team has no manager assigned');
      throw new Error("Team has no manager assigned");
    }
    
    // Handle different possible formats
    if (typeof team.manager === 'object') {
      // If populated, it will have _id
      if (team.manager._id) {
        teamManagerId = team.manager._id.toString();
        console.log('Team manager is populated object, ID:', teamManagerId);
      } else {
        // If it's an object but no _id, try toString
        teamManagerId = team.manager.toString();
        console.log('Team manager is object, toString result:', teamManagerId);
      }
    } else {
      // If it's a string or ObjectId
      teamManagerId = team.manager.toString();
      console.log('Team manager is primitive, toString result:', teamManagerId);
    }

    // Convert managerId to string for comparison
    const managerIdStr = managerId.toString();
    console.log('Comparing:', { teamManagerId, managerIdStr });

    if (teamManagerId !== managerIdStr) {
      console.log('❌ Authorization failed - manager mismatch');
      throw new Error("Not authorized to access this team");
    }

    console.log('✅ Authorization successful, fetching tasks...');

    // Create a currentUser object for taskService
    const currentUser = {
      id: managerId,
      _id: managerId,
      role: 'manager'
    };

    // Pass queryParams to the task service
    const result = await taskService.getTasksForTeam(teamId, currentUser, queryParams);
    
    console.log('✅ Tasks fetched successfully, count:', result.tasks?.length || 0);
    
    return {
      team: {
        id: team._id,
        name: team.name,
        description: team.description,
        memberCount: team.members?.length || 0
      },
      tasks: result.tasks || [],
      pagination: result.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    };
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

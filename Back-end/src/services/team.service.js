// ------------------------------------------------------------
// TeamService.js
// Service layer responsible for the business logic of Team
// ------------------------------------------------------------
//  - Validates input
//  - Applies authorization rules
//  - Handles cross-repository operations
//  - Manages Manager/Admin permissions
//  - Ensures clean separation from controllers & DB layer
// ------------------------------------------------------------

// Import repositories for data access
import teamRepository from "../repositories/team.repository.js";
import userRepository from "../repositories/user.repository.js";

// Import role constants
import { ROLES } from "../constants/roles.js";

class TeamService {

  // ------------------------------------------------------------
  // Create a new team
  // - Manager must be a valid user
  // - Ensures unique team name
  // - Promotes user to Manager role if needed
  // ------------------------------------------------------------
  async createTeam({ name, managerId }) {

    // Fetch manager user
    const manager = await userRepository.findById(managerId);
    if (!manager) throw new Error("Manager user not found");

    // Ensure the user has MANAGER role
    if (manager.role !== ROLES.MANAGER) {
      // Auto-promote the user to Manager role
      await userRepository.update(managerId, { role: ROLES.MANAGER });
    }

    // Check for duplicate team name
    const exists = await teamRepository.findByName(name);
    if (exists) throw new Error("Team with this name already exists");

    // Create the team and set manager as initial member
    const team = await teamRepository.create({
      name,
      manager: managerId,
      members: [managerId],     // Manager is also a team member
    });

    return team;
  }

  // ------------------------------------------------------------
  // Add a member to a team
  // - Only team manager OR admin can perform this action
  // - Validates team existence and member existence
  // - Updates user's "team" reference as well
  // ------------------------------------------------------------
  async addMember(teamId, userId, actingUser) {

    // Load team
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    // Authorization check
    const isManager = team.manager._id?.toString() === actingUser.id;
    const isAdmin = actingUser.role === ROLES.ADMIN;
    if (!isManager && !isAdmin) throw new Error("Access denied");

    // Validate user
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    // Add user to team members
    const updatedTeam = await teamRepository.addMember(teamId, userId);

    // Update user's team reference (if your user model includes this field)
    await userRepository.update(userId, { team: teamId });

    return updatedTeam;
  }

  // ------------------------------------------------------------
  // Remove a member from a team
  // - Only team manager OR admin can remove members
  // - Cleans up user's team reference
  // ------------------------------------------------------------
  async removeMember(teamId, userId, actingUser) {

    // Load team
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    // Authorization check
    const isManager = team.manager._id?.toString() === actingUser.id;
    const isAdmin = actingUser.role === ROLES.ADMIN;
    if (!isManager && !isAdmin) throw new Error("Access denied");

    // Remove user from the team
    const updatedTeam = await teamRepository.removeMember(teamId, userId);

    // Remove the team reference on the user record
    await userRepository.update(userId, { $unset: { team: "" } });

    return updatedTeam;
  }

  // ------------------------------------------------------------
  // Get team details by ID
  // ------------------------------------------------------------
  async getTeamById(teamId) {
    return await teamRepository.findById(teamId);
  }

  // ------------------------------------------------------------
  // Get paginated list of teams
  // - Delegates to repository for pagination logic
  // ------------------------------------------------------------
  async getAllTeams(query) {
    return await teamRepository.getAll(query);
  }

  // ------------------------------------------------------------
  // Delete a team
  // - Only admin can delete a team
  // - Cleans up team reference for all users
  // - Removes the team from DB
  // ------------------------------------------------------------
  async deleteTeam(teamId, actingUser) {

    // Ensure team exists
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    // Only admin can delete a team
    const isAdmin = actingUser.role === ROLES.ADMIN;
    if (!isAdmin) throw new Error("Access denied");

    // Remove "team" ref from all members BEFORE deleting team
    for (const member of team.members) {
      await userRepository.update(member._id ?? member, { $unset: { team: "" } });
    }

    // Delete team
    return await teamRepository.delete(teamId);
  }
}

// ------------------------------------------------------------
// Export a Singleton instance
// ------------------------------------------------------------
export default new TeamService();

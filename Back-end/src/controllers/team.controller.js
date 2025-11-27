// Import TeamService which contains core business logic for team operations
import teamService from "../services/team.service.js";

// Import standardized API response helpers (success/error wrapper)
import { success, error } from "../utils/response.js";

class TeamController {
  // --------------------------------------------
  // Controller: Create a new team
  // Route: POST /teams
  // Access: Manager or Admin (via policy in service layer)
  // --------------------------------------------
  async createTeam(req, res) {
    try {
      // Call service to create team
      // managerId is taken from the authenticated user (req.user.id)
      const team = await teamService.createTeam({
        name: req.body.name,
        managerId: req.user.id,
      });

      // Return success response
      return success(res, team, "Team created", 201);
    } catch (err) {
      // Return formatted error response (HTTP 400)
      return error(res, err.message, 400);
    }
  }

  // --------------------------------------------
  // Controller: Add a member to a team
  // Route: POST /teams/:teamId/members
  // Access: Team Manager or Admin
  // --------------------------------------------
  async addMember(req, res) {
    try {
      // teamId from URL params
      // userId from request body
      // actingUser taken from authenticated user
      const updated = await teamService.addMember(
        req.params.teamId,
        req.body.userId,
        req.user
      );

      return success(res, updated, "Member added");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // --------------------------------------------
  // Controller: Remove a member from a team
  // Route: DELETE /teams/:teamId/members
  // Access: Team Manager or Admin
  // --------------------------------------------
  async removeMember(req, res) {
    try {
      const updated = await teamService.removeMember(
        req.params.teamId,
        req.body.userId,
        req.user
      );

      return success(res, updated, "Member removed");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // --------------------------------------------
  // Controller: Get a single team by ID
  // Route: GET /teams/:teamId
  // Access: Admin or the team's manager (depending on service logic)
  // --------------------------------------------
  async getTeam(req, res) {
    try {
      const team = await teamService.getTeamById(req.params.teamId);
      return success(res, team, "Team fetched");
    } catch (err) {
      // 404 aligns with “resource not found”
      return error(res, err.message, 404);
    }
  }

  // --------------------------------------------
  // Controller: Fetch all teams (paginated)
  // Route: GET /teams?page=1&limit=10
  // Access: Admin (or as per service rules)
  // --------------------------------------------
  async listTeams(req, res) {
    try {
      // Pass query parameters into service for pagination
      const data = await teamService.getAllTeams(req.query);

      return success(res, data, "Teams fetched");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // --------------------------------------------
  // Controller: Delete a team
  // Route: DELETE /teams/:teamId
  // Access: Admin only
  // --------------------------------------------
  async deleteTeam(req, res) {
    try {
      const deleted = await teamService.deleteTeam(
        req.params.teamId,
        req.user
      );

      return success(res, deleted, "Team deleted");
    } catch (err) {
      // 403 → “Forbidden” used when user has no permission
      return error(res, err.message, 403);
    }
  }
}

// Export a single instance of TeamController (Singleton)
export default new TeamController();

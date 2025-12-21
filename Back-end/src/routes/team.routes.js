// -------------------------------------------------------
// Import Dependencies & Middlewares
// -------------------------------------------------------
import express from "express";

// Middleware: Verifies JWT token & attaches decoded user to req.user
import authMiddleware from "../middleware/AuthMiddleware.js";

// Middleware: Ensures user has required role (e.g., Admin)
import roleMiddleware from "../middleware/RoleMiddleware.js";

// Controller: Contains handlers for team operations
import teamController from "../controllers/team.controller.js";

// Validation middleware: Validates incoming request bodies using Joi/Zod schemas
import validateSchema from "../middleware/ValidateMiddleware.js";

// Joi/Zod validation schemas for team creation and adding members
import { createTeamSchema, addMemberSchema } from "../validators/team.validator.js";

// Predefined Role constants for RBAC
import { ROLES } from "../utils/roles.js";

// Initialize Express Router instance
const router = express.Router();


// -------------------------------------------------------
// ROUTE: Create Team
// METHOD: POST /teams
// ACCESS: Any authenticated user
// BUSINESS LOGIC PROTECTION:
//   - Controller promotes user to Manager if needed
//   - Controller checks uniqueness & validates manager
// NOTE: Route-level restriction NOT required because logic happens inside service.
// -------------------------------------------------------
router.post(
  "/", 
  authMiddleware,                        // Must be logged in
  validateSchema(createTeamSchema),      // Validate request body
  teamController.createTeam              // Controller action
);


// -------------------------------------------------------
// ROUTE: Add Member to a Team
// METHOD: POST /teams/:teamId/members
// ACCESS: Team Manager OR Admin
// BUSINESS LOGIC:
//   - Permission is validated inside service layer (actingUser check)
// -------------------------------------------------------
router.post(
  "/:teamId/members",
  authMiddleware,                        // User must be authenticated
  validateSchema(addMemberSchema),       // Validate payload
  teamController.addMember               // Controller handles business flow
);


// -------------------------------------------------------
// ROUTE: Remove Member from a Team
// METHOD: POST /teams/:teamId/members/remove
// ACCESS: Team Manager OR Admin
// NOTE: Kept as POST for backward compatibility, 
//       but DELETE is more REST-correct.
// -------------------------------------------------------
router.post(
  "/:teamId/members/remove",
  authMiddleware,
  validateSchema(addMemberSchema),
  teamController.removeMember
);


// -------------------------------------------------------
// ROUTE: Get Team by ID
// METHOD: GET /teams/:teamId
// ACCESS: Any authenticated user
// BUSINESS LOGIC:
//   - Service can restrict returning private team details if needed
// -------------------------------------------------------
router.get(
  "/:teamId",
  authMiddleware,
  teamController.getTeam
);


// -------------------------------------------------------
// ROUTE: List Teams (Paginated)
// METHOD: GET /teams?page=1&limit=20
// ACCESS: Any authenticated user (admin can see all, others can be restricted in service)
// -------------------------------------------------------
router.get(
  "/",
  authMiddleware,
  teamController.listTeams
);


// -------------------------------------------------------
// ROUTE: Delete a Team
// METHOD: DELETE /teams/:teamId
// ACCESS: Admin Only
// BUSINESS LOGIC:
//   - Only admin may delete teams
//   - roleMiddleware enforces RBAC at route level
// -------------------------------------------------------
router.delete(
  "/:teamId",
  authMiddleware,                         // Must be authenticated
  roleMiddleware(ROLES.ADMIN),            // Only Admin can perform deletion
  teamController.deleteTeam               // Controller handles deletion
);


// -------------------------------------------------------
// Export router so it can be mounted in /routes/index.js
// -------------------------------------------------------
export default router;

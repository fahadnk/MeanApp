// backend/src/routes/manager.routes.js

import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";
import managerController from "../controllers/manager.controller.js";
import validateSchema from "../middleware/ValidateMiddleware.js";
import { createTeamSchema } from "../validators/team.validator.js";

const router = express.Router();

// Manager must be authenticated AND role = manager
router.use(authMiddleware, roleMiddleware("manager"));

// -------------------------------
// TEAM MANAGEMENT
// -------------------------------
router.post("/team", validateSchema(createTeamSchema), managerController.createTeam);
router.post("/team/:teamId/add-user/:userId", managerController.addUserToTeam);
router.post("/team/:teamId/remove-user/:userId", managerController.removeUserFromTeam);

// -------------------------------
// TASK MANAGEMENT FOR TEAM
// -------------------------------
router.get("/team/:teamId/tasks", managerController.getTeamTasks);
router.post("/tasks", managerController.createTaskForTeam);
router.put("/tasks/:taskId", managerController.updateTaskForTeam);
router.delete("/tasks/:taskId", managerController.deleteTaskForTeam);

// -------------------------------
// USERS (VIEW ONLY)
// -------------------------------
router.get("/users", managerController.getAllUsers);

export default router;

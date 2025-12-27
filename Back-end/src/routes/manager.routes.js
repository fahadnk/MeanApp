import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import roleMiddleware from "../middleware/RoleMiddleware.js";
import managerController from "../controllers/manager.controller.js";
import validateSchema from "../middleware/ValidateMiddleware.js";
import { createTeamSchema, addUserSchema } from "../validators/team.validator.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("manager"));

/* ================= TEAM ================= */
router.post("/team", validateSchema(createTeamSchema), managerController.createTeam);

router.post(
  "/team/:teamId/add-user/:userId",
  validateSchema(addUserSchema),
  managerController.addUserToTeam
);

router.post(
  "/team/:teamId/remove-user/:userId",
  managerController.removeUserFromTeam
);

router.delete(
  "/team/:teamId",
  managerController.deleteTeam
);

/* ================= TASKS ================= */
router.get("/team/:teamId/tasks", managerController.getTeamTasks);
router.post("/tasks", managerController.createTaskForTeam);
router.put("/tasks/:taskId", managerController.updateTaskForTeam);
router.delete("/tasks/:taskId", managerController.deleteTaskForTeam);

/* ================= USERS ================= */
router.get("/users", managerController.getAllUsers);
router.get("/team/:teamId/available-users", managerController.getAvailableUsers);
router.get("/team/:teamId/stats", managerController.getTeamStats);

export default router;

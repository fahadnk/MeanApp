// backend/src/services/task.service.js

// -------------------------
// Import Dependencies
// -------------------------
// Repository → handles all DB operations
import taskRepository from "../repositories/task.repository.js";

// DTO → ensures safe, consistent response structures
import { taskDTO } from "./dto.js";

// NotificationService → handles real-time event broadcasting (Observer Pattern)
import notificationService from "./notification.service.js";

// Additional repositories needed for team & user checks
import userRepository from "../repositories/user.repository.js";
import teamRepository from "../repositories/team.repository.js";

// Role constants
import { ROLES } from "../utils/roles.enum.js";


// -------------------------
// TaskService (Business Logic Layer)
// -------------------------
// The service layer enforces business logic and communicates
// between controllers (HTTP layer) and repositories (DB layer).
// -------------------------
class TaskService {

  // -------------------------
  // Create a new task with full RBAC
  // -------------------------
  async createTask(taskData, currentUser) {
    const assignedToId = taskData.assignedTo;

    // ADMIN: can assign to anyone (or leave unassigned)
    if (currentUser.role === ROLES.ADMIN) {
      if (assignedToId) {
        const user = await userRepository.findById(assignedToId);
        if (!user) throw new Error("Assigned user not found");
      }
    }
    // MANAGER: can assign only to self or team members
    else if (currentUser.role === ROLES.MANAGER) {
      const team = await teamRepository.findByManagerId(currentUser.id);

      if (!team) {
        // Manager without a team → can only assign to self
        if (assignedToId && assignedToId !== currentUser.id) {
          throw new Error("Access denied");
        }
      } else {
        // Has team → can assign to self or any team member
        if (assignedToId && assignedToId !== currentUser.id) {
          const isMember = team.members.some(
            m => (m._id ?? m).toString() === assignedToId.toString()
          );
          if (!isMember) throw new Error("Access denied - can only assign to team members");
        }
      }
    }
    // REGULAR USER: can only create tasks for themselves
    else {
      taskData.assignedTo = currentUser.id;
    }

    // Final task creation
    const task = await taskRepository.create({
      ...taskData,
      createdBy: currentUser.id,
      assignedTo: taskData.assignedTo || currentUser.id,
    });

    const dto = taskDTO(task);
    notificationService.taskCreated(dto);

    // Notify the assigned user (if any)
    await this.notifyTaskCreatedForUser(task);

    return dto;
  }


  // -------------------------
  // Get task by ID with full access control
  // -------------------------
  async getTaskById(id, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    const assignedToId =
      typeof task.assignedTo === "object"
        ? task.assignedTo._id?.toString()
        : task.assignedTo?.toString();

    const createdById =
      typeof task.createdBy === "object"
        ? task.createdBy._id?.toString()
        : task.createdBy?.toString();

    // ADMIN → full access
    if (currentUser.role === ROLES.ADMIN) {
      return taskDTO(task);
    }

    // MANAGER → can view if task assigned to team member OR created by him OR assigned to him
    if (currentUser.role === ROLES.MANAGER) {
      const team = await teamRepository.findByManagerId(currentUser.id);
      const isMemberInTeam = team?.members?.some(
        m => (m._id ?? m).toString() === assignedToId
      );

      if (isMemberInTeam || createdById === currentUser.id || assignedToId === currentUser.id) {
        return taskDTO(task);
      }
      throw new Error("Access denied");
    }

    // REGULAR USER → only own assigned or created tasks
    if (assignedToId !== currentUser.id && createdById !== currentUser.id) {
      throw new Error("Access denied");
    }

    return taskDTO(task);
  }


  // -------------------------
  // Update task with role-based permissions
  // -------------------------
  async updateTask(id, updateData, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    const assignedToId =
      typeof task.assignedTo === "object"
        ? task.assignedTo._id?.toString()
        : task.assignedTo?.toString();

    const createdById =
      typeof task.createdBy === "object"
        ? task.createdBy._id?.toString()
        : task.createdBy?.toString();

    // ADMIN → can update anything
    if (currentUser.role === ROLES.ADMIN) {
      // allowed
    }
    // MANAGER → can update if task belongs to his team OR he created it OR assigned to him
    else if (currentUser.role === ROLES.MANAGER) {
      const team = await teamRepository.findByManagerId(currentUser.id);
      const isMember = team?.members?.some(
        m => (m._id ?? m).toString() === assignedToId
      );

      if (!isMember && createdById !== currentUser.id && assignedToId !== currentUser.id) {
        throw new Error("Access denied");
      }
    }
    // REGULAR USER → only if assigned to them or they created it
    else {
      if (assignedToId !== currentUser.id && createdById !== currentUser.id) {
        throw new Error("Access denied");
      }
    }

    const updated = await taskRepository.update(id, updateData);
    const dto = taskDTO(updated);

    notificationService.taskUpdated(dto);

    return dto;
  }


  // -------------------------
  // Delete task with role-based control
  // -------------------------
  async deleteTask(id, currentUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");

    const assignedToId =
      typeof task.assignedTo === "object"
        ? task.assignedTo._id?.toString()
        : task.assignedTo?.toString();

    const createdById =
      typeof task.createdBy === "object"
        ? task.createdBy._id?.toString()
        : task.createdBy?.toString();

    // ADMIN → can delete anything
    if (currentUser.role === ROLES.ADMIN) {
      // allowed
    }
    // MANAGER → same rules as update
    else if (currentUser.role === ROLES.MANAGER) {
      const team = await teamRepository.findByManagerId(currentUser.id);
      const isMember = team?.members?.some(
        m => (m._id ?? m).toString() === assignedToId
      );

      if (!isMember && createdById !== currentUser.id && assignedToId !== currentUser.id) {
        throw new Error("Access denied");
      }
    }
    // REGULAR USER → only own created or assigned tasks
    else {
      if (createdById !== currentUser.id && assignedToId !== currentUser.id) {
        throw new Error("Access denied");
      }
    }

    const deleted = await taskRepository.delete(id);
    notificationService.taskDeleted(id);

    return deleted;
  }


  // -------------------------
  // Get all tasks (with Search, Filter, Pagination)
  // -------------------------
  async getTasks(currentUser, queryParams = {}) {
    const { page = 1, limit = 10, search = "", status, priority } = queryParams;
    const filters = { search, status, priority };

    if (currentUser.role !== ROLES.ADMIN) {
      filters.assignedTo = currentUser.id;
    }

    const { data, pagination } = await taskRepository.getAll({
      page: Number(page),
      limit: Number(limit),
      ...filters,
    });

    const dtoList = data.map(taskDTO);
    return { tasks: dtoList, pagination };
  }


  async countTasksForUser(userId) {
    return await taskRepository.countByAssignedUser(userId);
  }

  async getTasksByUser(userId, { page = 1, limit = 10 } = {}) {
    return await taskRepository.findByUser(userId, { page, limit });
  }


  // -------------------------
  // Task Aggregation (Analytics)
  // -------------------------
  async getTaskStats() {
    const [byUser, byStatus] = await Promise.all([
      taskRepository.countTasksByUser(),
      taskRepository.countTasksByStatus(),
    ]);
    return { byUser, byStatus };
  }


  // -------------------------
  // Notify specific user when a task is created
  // -------------------------
  async notifyTaskCreatedForUser(task) {
    const userId =
      typeof task.assignedTo === "object"
        ? task.assignedTo._id?.toString()
        : task.assignedTo?.toString();

    if (userId) {
      notificationService.taskCreatedForUser(userId, task);
    }
  }

}

// -------------------------
// Export Singleton Instance
// -------------------------
export default new TaskService();
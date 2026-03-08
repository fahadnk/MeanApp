// backend/src/services/task.service.js

// -------------------------
// Import Dependencies
// -------------------------
// Repository → handles all DB operations
import taskRepository from "../repositories/task.repository.js";
import taskActivityService from "./taskActivity.service.js";
import { diffObjects } from "../utils/diff.js";

// DTO → ensures safe, consistent response structures
import { taskDTO } from "./dto.js";

// NotificationService → handles real-time event broadcasting (Observer Pattern)
import notificationService from "./notification.service.js";

// Additional repositories needed for team & user checks
import userRepository from "../repositories/user.repository.js";
import teamRepository from "../repositories/team.repository.js";

// Role constants
import { ROLES } from "../utils/roles.js";


// -------------------------
// TaskService (Business Logic Layer)
// -------------------------
// The service layer enforces business logic and communicates
// between controllers (HTTP layer) and repositories (DB layer).
// -------------------------
class TaskService {

  // -------------------------
  // Helper method to get user details for activity logs
  // -------------------------
  async getUserDetails(userId) {
    if (!userId) return null;
    const user = await userRepository.findById(userId);
    return user ? { _id: user._id, name: user.name, email: user.email, role: user.role } : null;
  }

  // -------------------------
  // Helper method to format date for logging
  // -------------------------
  formatDateForLog(date) {
    if (!date) return null;
    return new Date(date).toISOString();
  }

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

    // Get assigned user details for logging
    const assignedUser = assignedToId ? await this.getUserDetails(assignedToId) : null;

    // Final task creation
    const task = await taskRepository.create({
      ...taskData,
      createdBy: currentUser.id,
      assignedTo: taskData.assignedTo || currentUser.id,
    });

    // 🔥 ENHANCED ACTIVITY LOG - Show all task details on creation
    const changes = {
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status || "todo",
      assignedTo: assignedUser || (await this.getUserDetails(currentUser.id)),
      dueDate: task.dueDate ? this.formatDateForLog(task.dueDate) : null
    };

    await taskActivityService.log({
      task: task._id,
      action: "TASK_CREATED",
      performedBy: currentUser.id,
      changes
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

    // Get current task state for comparison
    const oldTask = task;

    // Activity log - track all fields with detailed before/after
    const allowedFields = [
      "title", "description", "status", "priority", 
      "assignedTo", "dueDate", "estimatedHours", 
      "actualHours", "tags", "attachments"
    ];

    const changes = {};

    // Detailed field-by-field comparison
    for (const field of allowedFields) {
      const oldValue = oldTask[field];
      const newValue = updateData[field];

      if (newValue !== undefined && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        
        // Special handling for assignedTo (store user details)
        if (field === "assignedTo" && newValue) {
          const [fromUser, toUser] = await Promise.all([
            oldValue ? this.getUserDetails(oldValue) : null,
            newValue ? this.getUserDetails(newValue) : null
          ]);

          changes[field] = {
            from: fromUser || oldValue || null,
            to: toUser || newValue || null
          };
        }
        // Special handling for dates
        else if (field === "dueDate" && (oldValue || newValue)) {
          changes[field] = {
            from: oldValue ? this.formatDateForLog(oldValue) : null,
            to: newValue ? this.formatDateForLog(newValue) : null
          };
        }
        // Regular fields
        else {
          changes[field] = {
            from: oldValue || null,
            to: newValue || null
          };
        }
      }
    }

    const updated = await taskRepository.update(id, updateData);

    // 🔍 Determine action type for each change
    const actions = new Set();
    
    if (changes.status) actions.add("STATUS_CHANGED");
    if (changes.assignedTo) actions.add("ASSIGNED_CHANGED");
    if (changes.priority) actions.add("PRIORITY_CHANGED");
    if (changes.dueDate) actions.add("DUE_DATE_CHANGED");
    if (changes.description) actions.add("DESCRIPTION_CHANGED");
    if (changes.title) actions.add("TITLE_CHANGED");
    
    // If multiple changes or none specific, use TASK_UPDATED
    const action = actions.size === 1 ? Array.from(actions)[0] : "TASK_UPDATED";

    // Log all changes together
    if (Object.keys(changes).length > 0) {
      await taskActivityService.log({
        task: id,
        action,
        performedBy: currentUser.id,
        changes,
      });

      // Also log individual changes for better tracking
      if (Object.keys(changes).length > 1) {
        for (const [field, change] of Object.entries(changes)) {
          let individualAction = "TASK_UPDATED";
          
          switch(field) {
            case "status": individualAction = "STATUS_CHANGED"; break;
            case "assignedTo": individualAction = "ASSIGNED_CHANGED"; break;
            case "priority": individualAction = "PRIORITY_CHANGED"; break;
            case "dueDate": individualAction = "DUE_DATE_CHANGED"; break;
            case "description": individualAction = "DESCRIPTION_CHANGED"; break;
            case "title": individualAction = "TITLE_CHANGED"; break;
          }

          await taskActivityService.log({
            task: id,
            action: individualAction,
            performedBy: currentUser.id,
            changes: { [field]: change },
          });
        }
      }
    }

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
        ? task.assignedTo?._id?.toString()
        : task.assignedTo?.toString();

    const createdById =
      typeof task.createdBy === "object"
        ? task.createdBy?._id?.toString()
        : task.createdBy?.toString();

    // --------------------
    // AUTHORIZATION
    // --------------------
    if (currentUser.role === ROLES.ADMIN) {
      // allowed
    } else if (currentUser.role === ROLES.MANAGER) {
      const team = await teamRepository.findByManagerId(currentUser.id);

      const isMember = team?.members?.some(
        m => (m._id ?? m).toString() === assignedToId
      );

      if (!isMember && createdById !== currentUser.id && assignedToId !== currentUser.id) {
        throw new Error("Access denied");
      }
    } else {
      if (createdById !== currentUser.id && assignedToId !== currentUser.id) {
        throw new Error("Access denied");
      }
    }

    // Get assigned user details for logging
    const assignedUser = assignedToId ? await this.getUserDetails(assignedToId) : null;

    // --------------------
    // DELETE TASK
    // --------------------
    const deletedTask = await taskRepository.delete(id);

    // --------------------
    // ENHANCED ACTIVITY LOG - Store task snapshot before deletion
    // --------------------
    await taskActivityService.log({
      task: id,
      action: "TASK_DELETED",
      performedBy: currentUser.id,
      changes: {
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        assignedTo: assignedUser,
        dueDate: task.dueDate ? this.formatDateForLog(task.dueDate) : null,
        deletedAt: this.formatDateForLog(new Date()),
        deletedBy: currentUser.id
      }
    });

    // --------------------
    // NOTIFICATION
    // --------------------
    await notificationService.taskDeleted({
      taskId: id,
      deletedBy: currentUser.id,
      assignedTo: assignedToId
    });

    return deletedTask;
  }




  // -------------------------
  // Get all tasks (Search, Filter, Pagination, Team-aware)
  // -------------------------
  async getTasks(currentUser, queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      teamId,
    } = queryParams;

    const filters = { search, status, priority };

    // -------------------------
    // ROLE-BASED FILTERING
    // -------------------------

    // ADMIN → can see everything (optional team filter)
    if (currentUser.role === ROLES.ADMIN) {
      if (teamId) {
        filters.team = teamId;
      }
    }

    // MANAGER → can see ONLY his team tasks
    else if (currentUser.role === ROLES.MANAGER) {
      const team = await teamRepository.findByManagerId(currentUser.id);
      if (!team) {
        return { tasks: [], pagination: { total: 0, page, limit } };
      }

      filters.team = team._id;
    }

    // USER → only assigned tasks (no team filter allowed)
    else {
      filters.assignedTo = currentUser.id;
    }

    const { data, pagination } = await taskRepository.getAll({
      page: Number(page),
      limit: Number(limit),
      ...filters,
    });

    return {
      tasks: data.map(taskDTO),
      pagination,
    };
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

  // -------------------------
  // Get task activity timeline
  // -------------------------
  async getTaskActivity(taskId, currentUser) {
    // First verify user has access to this task
    await this.getTaskById(taskId, currentUser);
    
    // Get activity logs
    const activities = await taskActivityService.getByTask(taskId);
    return activities;
  }

  async getTasksForTeam(teamId, currentUser, queryParams = {}) {
  return this.getTasks(currentUser, {
    ...queryParams,
    teamId
  });
}

}

// -------------------------
// Export Singleton Instance
// -------------------------
export default new TaskService();
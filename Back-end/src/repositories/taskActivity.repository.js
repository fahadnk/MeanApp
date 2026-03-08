// repositories/taskActivity.repository.js
import TaskActivity from "../models/taskActivity.model.js";

class TaskActivityRepository {
  async log({ task, action, performedBy, changes = {}, metadata = {} }) {
    return TaskActivity.create({
      task,
      action,
      performedBy,
      changes,
      metadata
    });
  }

  async getByTask(taskId) {
    const activities = await TaskActivity.find({ task: taskId })
      .populate("performedBy", "name email role avatar")
      .populate("changes.assignedTo.from", "name email role avatar")
      .populate("changes.assignedTo.to", "name email role avatar")
      .sort({ createdAt: -1 })
      .lean();

    // Format changes for better readability
    return activities.map(activity => ({
      ...activity,
      formattedChanges: this.formatChanges(activity)
    }));
  }

  // Add missing method for user feed
  async getUserFeed(userId, limit = 50) {
    // Get tasks where user is involved (assigned or created)
    const tasks = await TaskActivity.distinct('task', {
      $or: [
        { performedBy: userId },
        { 'changes.assignedTo.from._id': userId },
        { 'changes.assignedTo.to._id': userId }
      ]
    });

    const activities = await TaskActivity.find({ task: { $in: tasks } })
      .populate("performedBy", "name email role avatar")
      .populate("task", "title status priority")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return activities;
  }

  // Add missing method for batch logging
  async batchLog(activities) {
    return TaskActivity.insertMany(activities);
  }

  formatChanges(activity) {
    const formatted = {};
    
    Object.keys(activity.changes || {}).forEach(key => {
      const change = activity.changes[key];
      
      switch(key) {
        case 'assignedTo':
          formatted.assignedTo = {
            from: change.from?.name || change.from || 'Unassigned',
            to: change.to?.name || change.to || 'Unassigned'
          };
          break;
        case 'dueDate':
          formatted.dueDate = {
            from: change.from ? new Date(change.from).toLocaleDateString() : 'Not set',
            to: change.to ? new Date(change.to).toLocaleDateString() : 'Not set'
          };
          break;
        case 'status':
        case 'priority':
          formatted[key] = {
            from: change.from?.label || change.from || 'Not set',
            to: change.to?.label || change.to || 'Not set'
          };
          break;
        case 'description':
          formatted.description = {
            from: change.from?.preview || change.from || 'Not set',
            to: change.to?.preview || change.to || 'Not set'
          };
          break;
        default:
          formatted[key] = {
            from: change.from || 'Not set',
            to: change.to || 'Not set'
          };
      }
    });

    return formatted;
  }
}

export default new TaskActivityRepository();
// backend/src/services/taskActivity.service.js

import taskActivityRepository from "../repositories/taskActivity.repository.js";
import userRepository from "../repositories/user.repository.js";
import taskRepository from "../repositories/task.repository.js";

class TaskActivityService {
  
  /**
   * Log a task activity with enhanced formatting
   */
  async log({ task, action, performedBy, changes = {}, metadata = {} }) {
    
    // Validate and enrich changes before logging
    const enrichedChanges = await this.enrichChanges(changes, action);
    
    return taskActivityRepository.log({
      task,
      action,
      performedBy,
      changes: enrichedChanges,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: metadata.userAgent || null,
        ipAddress: metadata.ipAddress || null
      }
    });
  }

  /**
   * Get formatted task activity timeline
   */
  async getTaskActivity(taskId) {
    const activities = await taskActivityRepository.getByTask(taskId);
    
    // Format each activity for frontend consumption
    const formattedActivities = await Promise.all(
      activities.map(async (activity) => {
        return this.formatActivityForDisplay(activity);
      })
    );

    return formattedActivities;
  }

  /**
   * Get activity feed for a user (across all tasks they have access to)
   */
  async getUserActivityFeed(userId, limit = 50) {
    const activities = await taskActivityRepository.getUserFeed(userId, limit);
    
    const formattedActivities = await Promise.all(
      activities.map(async (activity) => {
        return this.formatActivityForDisplay(activity);
      })
    );

    return formattedActivities;
  }

  /**
   * Enrich changes with additional context and user details
   */
  async enrichChanges(changes, action) {
    const enriched = {};

    for (const [key, value] of Object.entries(changes)) {
      
      // Handle user references (assignedTo, createdBy, etc.)
      if (key.toLowerCase().includes('assigned') || key === 'createdBy' || key === 'updatedBy') {
        enriched[key] = await this.enrichUserChange(value);
      }
      
      // Handle date fields
      else if (key.toLowerCase().includes('date') || key === 'dueDate' || key === 'startDate' || key === 'completedAt') {
        enriched[key] = this.enrichDateChange(value);
      }
      
      // Handle status changes
      else if (key === 'status') {
        enriched[key] = this.enrichStatusChange(value);
      }
      
      // Handle priority changes
      else if (key === 'priority') {
        enriched[key] = this.enrichPriorityChange(value);
      }
      
      // Handle description (truncate if too long)
      else if (key === 'description') {
        enriched[key] = this.enrichDescriptionChange(value);
      }
      
      // Default handling
      else {
        enriched[key] = value;
      }
    }

    return enriched;
  }

  /**
   * Enrich user change with full user details
   */
  async enrichUserChange(change) {
    if (!change) return change;

    const enriched = {};

    if (change.from) {
      const fromUser = change.from._id 
        ? change.from 
        : await userRepository.findById(change.from).catch(() => null);
      
      enriched.from = fromUser ? {
        _id: fromUser._id,
        name: fromUser.name,
        email: fromUser.email,
        role: fromUser.role,
        avatar: fromUser.avatar
      } : (typeof change.from === 'string' ? { _id: change.from, name: 'Unknown User' } : change.from);
    }

    if (change.to) {
      const toUser = change.to._id 
        ? change.to 
        : await userRepository.findById(change.to).catch(() => null);
      
      enriched.to = toUser ? {
        _id: toUser._id,
        name: toUser.name,
        email: toUser.email,
        role: toUser.role,
        avatar: toUser.avatar
      } : (typeof change.to === 'string' ? { _id: change.to, name: 'Unknown User' } : change.to);
    }

    return enriched;
  }

  /**
   * Enrich date changes with formatted strings
   */
  enrichDateChange(change) {
    if (!change) return change;

    const enriched = {};

    if (change.from) {
      enriched.from = {
        raw: change.from,
        formatted: new Date(change.from).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        relative: this.getRelativeTimeString(change.from)
      };
    }

    if (change.to) {
      enriched.to = {
        raw: change.to,
        formatted: new Date(change.to).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        relative: this.getRelativeTimeString(change.to)
      };
    }

    return enriched;
  }

  /**
   * Enrich status changes with display info
   */
  enrichStatusChange(change) {
    if (!change) return change;

    const statusConfig = {
      'todo': { label: 'To Do', color: '#2196F3', icon: 'pending' },
      'in-progress': { label: 'In Progress', color: '#FF9800', icon: 'progress' },
      'in-review': { label: 'In Review', color: '#9C27B0', icon: 'review' },
      'done': { label: 'Done', color: '#4CAF50', icon: 'done' },
      'blocked': { label: 'Blocked', color: '#F44336', icon: 'block' }
    };

    const enriched = {};

    if (change.from) {
      enriched.from = {
        value: change.from,
        ...(statusConfig[change.from] || { label: change.from, color: '#9E9E9E' })
      };
    }

    if (change.to) {
      enriched.to = {
        value: change.to,
        ...(statusConfig[change.to] || { label: change.to, color: '#9E9E9E' })
      };
    }

    return enriched;
  }

  /**
   * Enrich priority changes with display info
   */
  enrichPriorityChange(change) {
    if (!change) return change;

    const priorityConfig = {
      'low': { label: 'Low', color: '#4CAF50', icon: 'arrow_downward' },
      'medium': { label: 'Medium', color: '#FF9800', icon: 'remove' },
      'high': { label: 'High', color: '#F44336', icon: 'arrow_upward' },
      'critical': { label: 'Critical', color: '#9C27B0', icon: 'priority_high' }
    };

    const enriched = {};

    if (change.from) {
      enriched.from = {
        value: change.from,
        ...(priorityConfig[change.from] || { label: change.from, color: '#9E9E9E' })
      };
    }

    if (change.to) {
      enriched.to = {
        value: change.to,
        ...(priorityConfig[change.to] || { label: change.to, color: '#9E9E9E' })
      };
    }

    return enriched;
  }

  /**
   * Enrich description changes (truncate if too long)
   */
  enrichDescriptionChange(change) {
    if (!change) return change;

    const truncate = (text, length = 100) => {
      if (!text) return text;
      return text.length > length ? text.substring(0, length) + '...' : text;
    };

    const enriched = {};

    if (change.from) {
      enriched.from = {
        full: change.from,
        preview: truncate(change.from),
        length: change.from.length
      };
    }

    if (change.to) {
      enriched.to = {
        full: change.to,
        preview: truncate(change.to),
        length: change.to.length
      };
    }

    return enriched;
  }

  /**
   * Format a single activity for display
   */
  async formatActivityForDisplay(activity) {
    const performedBy = activity.performedBy;
    
    // Get task details if needed
    let taskDetails = null;
    if (activity.task && !activity.task.title) {
      const task = await taskRepository.findById(activity.task).catch(() => null);
      if (task) {
        taskDetails = {
          id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority
        };
      }
    }

    // Generate human-readable message
    const message = await this.generateActivityMessage(activity);

    return {
      ...activity,
      performedBy: performedBy ? {
        _id: performedBy._id,
        name: performedBy.name,
        email: performedBy.email,
        role: performedBy.role,
        avatar: performedBy.avatar,
        initials: this.getInitials(performedBy.name)
      } : null,
      task: taskDetails || activity.task,
      message,
      timeAgo: this.getRelativeTimeString(activity.createdAt),
      formattedTimestamp: new Date(activity.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isSystem: !activity.performedBy // Flag for system-generated activities
    };
  }

  /**
   * Generate a human-readable message for the activity
   */
  async generateActivityMessage(activity) {
    const performerName = activity.performedBy?.name || 'System';
    
    switch (activity.action) {
      case 'TASK_CREATED':
        return `${performerName} created this task`;
        
      case 'TASK_UPDATED':
        return `${performerName} updated the task`;
        
      case 'TASK_DELETED':
        return `${performerName} deleted this task`;
        
      case 'STATUS_CHANGED':
        if (activity.changes?.status) {
          const from = activity.changes.status.from?.label || activity.changes.status.from;
          const to = activity.changes.status.to?.label || activity.changes.status.to;
          return `${performerName} changed status from ${from} to ${to}`;
        }
        return `${performerName} changed the status`;
        
      case 'ASSIGNED_CHANGED':
        if (activity.changes?.assignedTo) {
          const from = activity.changes.assignedTo.from?.name || 'Unassigned';
          const to = activity.changes.assignedTo.to?.name || 'Unassigned';
          if (from === 'Unassigned') {
            return `${performerName} assigned this task to ${to}`;
          } else if (to === 'Unassigned') {
            return `${performerName} unassigned this task from ${from}`;
          } else {
            return `${performerName} reassigned this task from ${from} to ${to}`;
          }
        }
        return `${performerName} changed the assignment`;
        
      case 'PRIORITY_CHANGED':
        if (activity.changes?.priority) {
          const from = activity.changes.priority.from?.label || activity.changes.priority.from;
          const to = activity.changes.priority.to?.label || activity.changes.priority.to;
          return `${performerName} changed priority from ${from} to ${to}`;
        }
        return `${performerName} changed the priority`;
        
      case 'DUE_DATE_CHANGED':
        if (activity.changes?.dueDate) {
          const from = activity.changes.dueDate.from?.formatted || 'No due date';
          const to = activity.changes.dueDate.to?.formatted || 'No due date';
          return `${performerName} changed due date from ${from} to ${to}`;
        }
        return `${performerName} changed the due date`;
        
      case 'DESCRIPTION_CHANGED':
        return `${performerName} updated the description`;
        
      case 'TITLE_CHANGED':
        if (activity.changes?.title) {
          return `${performerName} renamed the task from "${activity.changes.title.from}" to "${activity.changes.title.to}"`;
        }
        return `${performerName} changed the title`;
        
      case 'COMMENT_ADDED':
        return `${performerName} added a comment`;
        
      default:
        return `${performerName} performed ${activity.action.replace(/_/g, ' ').toLowerCase()}`;
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  getRelativeTimeString(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  }

  /**
   * Get initials from name
   */
  getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Batch log multiple activities
   */
  async batchLog(activities) {
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => ({
        ...activity,
        changes: await this.enrichChanges(activity.changes, activity.action)
      }))
    );

    return taskActivityRepository.batchLog(enrichedActivities);
  }

  /**
   * Get activity statistics for a task
   */
  async getTaskActivityStats(taskId) {
    const activities = await taskActivityRepository.getByTask(taskId);
    
    const stats = {
      totalActivities: activities.length,
      uniqueContributors: new Set(activities.map(a => a.performedBy?._id?.toString())).size,
      actionBreakdown: {},
      timeline: {
        firstActivity: activities.length > 0 ? activities[activities.length - 1].createdAt : null,
        lastActivity: activities.length > 0 ? activities[0].createdAt : null
      }
    };

    activities.forEach(activity => {
      // Count by action type
      stats.actionBreakdown[activity.action] = (stats.actionBreakdown[activity.action] || 0) + 1;
    });

    return stats;
  }
}

export default new TaskActivityService();
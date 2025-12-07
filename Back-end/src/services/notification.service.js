// ============================================================================
// Notification Service (Observer Pattern + Room-Based Real-Time Events)
// ============================================================================

class NotificationService {

  // -------------------------------------------------------------------------
  // Constructor – initializes the service (io can be injected later)
  // -------------------------------------------------------------------------
  constructor(io) {
    this.io = io || null; // Socket.IO server instance (attached at server startup)
  }

  // -------------------------------------------------------------------------
  // Attach a live Socket.IO instance (called once from server.js)
  // -------------------------------------------------------------------------
  /**
   * Attaches the active Socket.IO server instance to this service.
   * Must be called before any emit methods work.
   * @param {Server} io - Socket.IO server instance
   */
  attachIO(io) {
    this.io = io;
  }

  // -------------------------------------------------------------------------
  // Generic broadcast to ALL connected clients
  // -------------------------------------------------------------------------
  /**
   * Generic emit to everyone (broadcast)
   * Example: notificationService.emit('taskCreated', task)
   */
  emit(event, data) {
    if (this.io) {
      this.io.emit(event, data);                                      // Sends to every connected socket
      console.log(`Event Emitted: ${event}`, data);                   // Debug log for monitoring
    } else {
      console.warn(`Socket.IO instance not attached; cannot emit '${event}'.`);
    }
  }

  // -------------------------------------------------------------------------
  // Emit to a single user's private room
  // Room convention: "user:<userId>"
  // -------------------------------------------------------------------------
  /**
   * Emit event to a single user room
   * Room convention: "user:<userId>"
   */
  emitToUser(userId, event, data) {
    if (!this.io) {
      console.warn("No io instance - emitToUser skipped");
      return;
    }
    const room = `user:${userId}`;                                    // Private room per user
    this.io.to(room).emit(event, data);                               // Send only to that room
    console.log(`Emitted ${event} to ${room}`, data);
  }

  // -------------------------------------------------------------------------
  // Emit to multiple users (e.g. team members, mentions)
  // -------------------------------------------------------------------------
  /**
   * Emit event to multiple specific users
   * Useful for notifying all team members, mentions, etc.
   */
  emitToUsers(userIds = [], event, data) {
    if (!this.io) {
      console.warn("No io instance - emitToUsers skipped");
      return;
    }
    userIds.forEach((id) => {
      this.io.to(`user:${id}`).emit(event, data);                     // One emit per user room
    });
    console.log(`Emitted ${event} to users:`, userIds);
  }

  // -------------------------------------------------------------------------
  // Emit to an entire team room
  // Room convention: "team:<teamId>"
  // -------------------------------------------------------------------------
  /**
   * Emit event to an entire team room
   * Room convention: "team:<teamId>"
   * Perfect for team-wide updates (new task in team, member added, etc.)
   */
  emitToTeam(teamId, event, data) {
    if (!this.io) {
      console.warn("No io instance - emitToTeam skipped");
      return;
    }
    const room = `team:${teamId}`;                                    // Team-scoped room
    this.io.to(room).emit(event, data);
    console.log(`Emitted ${event} to ${room}`, data);
  }

  // -------------------------------------------------------------------------
  // Task Created – broadcast to everyone
  // -------------------------------------------------------------------------
  /**
   * Emit Task Created Event (broadcast to all connected clients)
   */
  taskCreated(task) {
    this.emit("taskCreated", task);                                   // Global broadcast
    console.log("Task Created Event Emitted:", task.title);
  }

  // -------------------------------------------------------------------------
  // Task Updated – broadcast to everyone
  // -------------------------------------------------------------------------
  /**
   * Emit Task Updated Event (broadcast)
   */
  taskUpdated(task) {
    this.emit("taskUpdated", task);
    console.log("Task Updated Event Emitted:", task.title);
  }

  // -------------------------------------------------------------------------
  // Task Deleted – broadcast to everyone
  // -------------------------------------------------------------------------
  /**
   * Emit Task Deleted Event (broadcast)
   */
  taskDeleted(taskId) {
    this.emit("taskDeleted", { id: taskId });
    console.log("Task Deleted Event Emitted:", taskId);
  }

  // -------------------------------------------------------------------------
  // Private notification: only the assigned user receives this
  // -------------------------------------------------------------------------
  /**
   * Send notification ONLY to the assigned user when a task is created/assigned
   * Uses private user room → more efficient & secure than broadcasting
   */
  taskCreatedForUser(userId, task) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit("taskAssigned", task);        // Private delivery
      console.log(`Task Assigned Event sent to user:${userId}`);
    } else {
      console.warn(`Socket.IO instance not attached; cannot emit 'taskAssigned' to user ${userId}.`);
    }
  }
}

// -----------------------------------------------------------------------------
// Export singleton instance — one shared service across the entire app
// -----------------------------------------------------------------------------
const notificationService = new NotificationService();
export default notificationService;
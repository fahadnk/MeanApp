// ============================================================================
//  Notification Service (Observer Pattern)
// ============================================================================
class NotificationService {
  constructor(io) {
    this.io = io; // Socket.IO instance will be attached at runtime
  }

  /**
   * Attach a live Socket.IO instance
   */
  attachIO(io) {
    this.io = io;
  }

  /**
   * Generic emit function — works for any event
   * Example: notificationService.emit('taskCreated', task)
   */
  emit(event, data) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📢 Event Emitted: ${event}`, data);
    } else {
      console.warn(`⚠️ Socket.IO instance not attached; cannot emit '${event}'.`);
    }
  }

  /**
   * Emit Task Created Event (specific helper)
   */
  taskCreated(task) {
    this.emit("taskCreated", task);
    console.log("📢 Task Created Event Emitted:", task.title);
  }

  /**
   * Emit Task Updated Event (specific helper)
   */
  taskUpdated(task) {
    this.emit("taskUpdated", task);
    console.log("📢 Task Updated Event Emitted:", task.title);
  }

  /**
   * Emit Task Deleted Event (specific helper)
   */
  taskDeleted(taskId) {
    this.emit("taskDeleted", { id: taskId });
    console.log("📢 Task Deleted Event Emitted:", taskId);
  }

    /**
   * ⭐ NEW FUNCTION
   * Send notification only to the assigned user
   */
  taskCreatedForUser(userId, task) {
    if (this.io) {
      this.io.to(String(userId)).emit("taskAssigned", task);
      console.log(`🎯 Task Assigned Event sent to user ${userId}`);
    } else {
      console.warn(
        `⚠️ Socket.IO instance not attached; cannot emit 'taskAssigned' to user ${userId}.`
      );
    }
  }
}

// Export singleton
const notificationService = new NotificationService();
export default notificationService;

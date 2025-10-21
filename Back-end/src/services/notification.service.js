// ============================================================================
//  Notification Service (Observer Pattern)
// ----------------------------------------------------------------------------
//  PURPOSE:
//    This service acts as a decoupled event emitter for all real-time updates
//    across the system. It listens to domain-level events (like task creation
//    or updates) and broadcasts them through Socket.IO to connected clients.
//
//  WHY:
//    - Keeps WebSocket logic separate from business logic.
//    - Maintains clean separation of concerns (Service → Repository → Controller).
//    - Implements a lightweight Observer pattern: business events trigger
//      notifications without knowing how they’re delivered.
//
//  EXAMPLE USE CASE:
//    In TaskService after creating a task:
//        notificationService.taskCreated(createdTask);
//
//    The connected frontend automatically receives a `taskCreated` event.
// ============================================================================

class NotificationService {
  /**
   * @constructor
   * @param {Server} io - Optional Socket.IO instance (injected at runtime)
   */
  constructor(io) {
    this.io = io; // Will hold active Socket.IO server instance
  }

  /**
   * Attach a live Socket.IO instance after server initialization.
   * Called once inside `server.js` after the HTTP + Socket.IO server starts.
   *
   * @param {Server} io - Active Socket.IO instance from `server.js`
   */
  attachIO(io) {
    this.io = io;
  }

  // --------------------------------------------------------------------------
  // 🟢 Emit Task Created Event
  // --------------------------------------------------------------------------
  /**
   * Broadcasts a new task creation event to all connected clients.
   * The frontend can listen for "taskCreated" to refresh UI or notify users.
   *
   * @param {Object} task - Task data object (usually includes title, status, etc.)
   */
  taskCreated(task) {
    if (this.io) {
      // Broadcast event globally — can be optimized to emit to specific rooms
      this.io.emit("taskCreated", task);
      console.log("📢 Task Created Event Emitted:", task.title);
    } else {
      console.warn("⚠️ Socket.IO instance not attached; cannot emit 'taskCreated'.");
    }
  }

  // --------------------------------------------------------------------------
  // 🟡 Emit Task Updated Event
  // --------------------------------------------------------------------------
  /**
   * Broadcasts a task update event to all connected clients.
   * Clients can listen for "taskUpdated" to sync their task states in real-time.
   *
   * @param {Object} task - Updated task data
   */
  taskUpdated(task) {
    if (this.io) {
      this.io.emit("taskUpdated", task);
      console.log("📢 Task Updated Event Emitted:", task.title);
    } else {
      console.warn("⚠️ Socket.IO instance not attached; cannot emit 'taskUpdated'.");
    }
  }
}

// -----------------------------------------------------------------------------
// 🧩 Export Singleton Instance
// -----------------------------------------------------------------------------
// The service is exported as a singleton to maintain a single shared Socket.IO
// context across the entire backend. This ensures all parts of the system emit
// events through the same WebSocket connection.
const notificationService = new NotificationService();
export default notificationService;

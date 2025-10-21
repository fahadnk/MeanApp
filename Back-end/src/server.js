// ============================================================================
//  server.js
//  Entry Point for Backend Application
// ----------------------------------------------------------------------------
//  - Initializes Express application (imported from app.js)
//  - Creates an HTTP server to host both Express and Socket.IO
//  - Configures WebSocket (Socket.IO) for real-time events
//  - Handles environment setup, server startup, and graceful shutdown
// ============================================================================

// -------------------------
// 1️⃣ Core & Third-Party Imports
// -------------------------
import http from "http";                   // Native Node.js HTTP module (to create raw server)
import { Server } from "socket.io";        // Socket.IO for real-time communication
import dotenv from "dotenv";               // Environment variable manager

// -------------------------
// 2️⃣ Local Application Imports
// -------------------------
import app from "./app.js";                // Express app instance (configured separately)
import notificationService from "./services/notification.service.js"; // Custom service for socket events

// -------------------------
// 3️⃣ Load Environment Variables
// -------------------------
dotenv.config();                           // Loads variables from .env into process.env

// -------------------------
// 4️⃣ Configure Server Port
// -------------------------
// Default fallback to 5000 if PORT is not defined in .env
const PORT = process.env.PORT || 5000;

// -------------------------
// 5️⃣ Create HTTP Server
// -------------------------
// Express runs on top of an HTTP server instance so that we can
// integrate both REST API (Express) and WebSocket (Socket.IO) on the same port.
const server = http.createServer(app);

// -------------------------
// 6️⃣ Initialize Socket.IO Server
// -------------------------
// Attaches WebSocket capabilities to our HTTP server.
// The 'cors' configuration allows frontend clients to connect across domains.
const io = new Server(server, {
  cors: {
    origin: "*",                          // ⚠️ Allow all origins (safe for dev; restrict in production)
  },
});

// -------------------------
// 7️⃣ Global Socket.IO Access
// -------------------------
// Store the `io` instance inside the Express app for global access.
// Controllers or services can retrieve it later via `req.app.get("io")`.
app.set("io", io);

// -------------------------
// 8️⃣ Attach Socket.IO to NotificationService
// -------------------------
// Dependency injection pattern: pass the active Socket.IO instance
// into the notificationService so it can emit events like:
//   notificationService.emitToUser(userId, "taskCreated", task);
notificationService.attachIO(io);

// -------------------------
// 9️⃣ Handle Socket.IO Connection Events
// -------------------------
// Listens for new WebSocket connections and disconnections.
// Each client connected via Socket.IO receives a unique `socket.id`.
io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  // Optional: You could register custom event listeners here (e.g. join rooms)
  // socket.on("joinRoom", (roomId) => socket.join(roomId));

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// -------------------------
// 🔟 Start HTTP + WebSocket Server
// -------------------------
// Launch the combined Express + Socket.IO server.
// The server now listens for both HTTP requests and WebSocket messages.
server.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});

// -------------------------
// 1️⃣1️⃣ Global Error Handling: Uncaught Exceptions
// -------------------------
// Handles synchronous errors that escape the app’s control flow (e.g. coding bugs).
// After logging, the app exits to prevent unstable state.
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception detected! Shutting down...");
  console.error(err);
  process.exit(1); // Forcefully exit to avoid undefined behavior
});

// -------------------------
// 1️⃣2️⃣ Global Error Handling: Unhandled Promise Rejections
// -------------------------
// Handles rejected Promises that aren’t wrapped in try/catch.
// Useful for detecting DB connection errors, async bugs, etc.
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection detected! Shutting down...");
  console.error(reason);

  // Close the server gracefully before exiting
  server.close(() => process.exit(1));
});

// -------------------------
// 1️⃣3️⃣ Graceful Shutdown on SIGTERM
// -------------------------
// Commonly triggered by hosting platforms (Docker, Heroku, Kubernetes)
// Allows existing connections to complete before process exit.
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("💤 Process terminated cleanly.");
  });
});

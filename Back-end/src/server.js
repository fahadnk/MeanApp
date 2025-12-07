// ============================================================================
//  server.js
//  Entry Point for Backend Application
// ----------------------------------------------------------------------------
//  - Loads environment variables
//  - Initializes Express server (from app.js)
//  - Creates an HTTP server to attach both Express & Socket.IO
//  - Sets up real-time WebSocket communication with room-based architecture
//  - Binds Notification Service to Socket.IO
//  - Handles user identification and team room management
//  - Handles all global crashes & graceful shutdown signals
// ============================================================================

// -------------------------
// 1. Core & Third-Party Imports
// -------------------------

import http from "http";                   
// ^ Built-in Node.js HTTP module – required to create server for Socket.IO

import { Server } from "socket.io";        
// ^ Socket.IO server class – enables real-time bidirectional communication

import dotenv from "dotenv";               
// ^ Loads environment variables from .env file into process.env


// -------------------------
// 2. Local Application Imports
// -------------------------

import app from "./app.js";                
// ^ Main Express application with all routes, middlewares, error handlers

import notificationService from "./services/notification.service.js";
// ^ Centralized service for emitting real-time events (broadcast + rooms)


// -------------------------
// 3. Load Environment Variables
// -------------------------

dotenv.config();                           
// ^ Must be called early – populates process.env.PORT, JWT secrets, etc.


// -------------------------
// 4. Configure Server Port
// -------------------------

const PORT = process.env.PORT || 5000;
// ^ Server listening port – configurable via environment or defaults to 5000


// -------------------------
// 5. Create HTTP Server
// -------------------------

const server = http.createServer(app);
// ^ Wraps Express app in raw HTTP server so Socket.IO can attach to it


// -------------------------
// 6. Initialize Socket.IO Server
// -------------------------

const io = new Server(server, {
  cors: {
    origin: "*",                      // TODO: Restrict in production (e.g. ["https://yourapp.com"])
    methods: ["GET", "POST"]
  },
  // Optional: improve performance & security
  allowEIO3: true                     // Support older Socket.IO clients if needed
});
// ^ Creates WebSocket server with CORS enabled for frontend connectivity


// -------------------------
// 7. Make Socket.IO Globally Available in Express
// -------------------------

app.set("io", io);
// ^ Allows controllers/middlewares to access via req.app.get("io")


// -------------------------
// 8. Attach Socket.IO to NotificationService
// -------------------------

notificationService.attachIO(io);
// ^ Critical: Gives notification service access to live io instance


// -------------------------
// 9. Handle Socket.IO Connection Events (Room-Based Architecture)
// -------------------------

io.on("connection", (socket) => {
  // ^ Fires every time a new client connects via WebSocket

  console.log(`Client connected: ${socket.id}`);
  // ^ Unique socket ID assigned by Socket.IO – useful for debugging

  // -------------------------------------------------------------------------
  // CLIENT IDENTIFICATION – Join personal room: "user:<userId>"
  // -------------------------------------------------------------------------
  // Frontend must emit after login:
  //   socket.emit("identify", { userId: "64abc123..." } OR just userId string)
  // -------------------------------------------------------------------------
  socket.on("identify", (payload) => {
    try {
      // Support both string and object payload for flexibility
      const { userId } = typeof payload === "object" ? payload : { userId: payload };

      if (!userId) {
        console.warn("identify event received without userId");
        return;
      }

      // Join private user room → enables targeted notifications
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} identified as user:${userId} and joined room`);

      // Optional: Store userId on socket for later use
      socket.userId = userId;

    } catch (err) {
      console.warn("identify handler error:", err.message);
    }
  });

  // -------------------------------------------------------------------------
  // JOIN TEAM ROOM – Subscribe to team-specific updates
  // -------------------------------------------------------------------------
  // Frontend calls when user views a team dashboard or opens team page
  //   socket.emit("joinTeam", { teamId: "64def456..." })
  // -------------------------------------------------------------------------
  socket.on("joinTeam", ({ teamId }) => {
    if (!teamId) {
      console.warn("joinTeam called without teamId");
      return;
    }

    socket.join(`team:${teamId}`);
    console.log(`Socket ${socket.id} joined team room → team:${teamId}`);
  });

  // -------------------------------------------------------------------------
  // LEAVE TEAM ROOM – Unsubscribe when leaving team view
  // -------------------------------------------------------------------------
  socket.on("leaveTeam", ({ teamId }) => {
    if (!teamId) {
      console.warn("leaveTeam called without teamId");
      return;
    }

    socket.leave(`team:${teamId}`);
    console.log(`Socket ${socket.id} left team room → team:${teamId}`);
  });

  // -------------------------------------------------------------------------
  // DISCONNECT – Cleanup logging
  // -------------------------------------------------------------------------
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id} | Reason: ${reason}`);
    // Note: socket automatically leaves all rooms on disconnect
  });
});


// -------------------------
// 10. Start HTTP + WebSocket Server
// -------------------------

server.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
  console.log(`WebSocket server active – waiting for clients...`);
});


// -------------------------
// 11. Global Error Handling: Uncaught Exceptions
// -------------------------

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception detected! Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);

  process.exit(1);
});


// -------------------------
// 12. Global Error Handling: Unhandled Promise Rejections
// -------------------------

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  
  server.close(() => {
    console.error("Server closed due to unhandled rejection");
    process.exit(1);
  });
});


// -------------------------
// 13. Graceful Shutdown on SIGTERM (PM2, Docker, Render, etc.)
// -------------------------

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");

  server.close(() => {
    console.log("HTTP server closed. WebSocket connections terminated.");
    process.exit(0);
  });
});
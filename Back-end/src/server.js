// ============================================================================
//  server.js
//  Entry Point for Backend Application
// ----------------------------------------------------------------------------
//  - Loads environment variables
//  - Initializes Express server (from app.js)
//  - Creates an HTTP server to attach both Express & Socket.IO
//  - Sets up real-time WebSocket communication
//  - Binds Notification Service to Socket.IO
//  - Handles all global crashes & graceful shutdown signals
// ============================================================================

// -------------------------
// 1️⃣ Core & Third-Party Imports
// -------------------------

import http from "http";                   
// ^ Imports Node.js' built-in HTTP module.
//   We use this to create a raw HTTP server so that Socket.IO can attach to it.

import { Server } from "socket.io";        
// ^ Imports the Socket.IO Server class used to create a WebSocket server.

import dotenv from "dotenv";               
// ^ Imports dotenv so we can load variables from a .env file into process.env.


// -------------------------
// 2️⃣ Local Application Imports
// -------------------------

import app from "./app.js";                
// ^ Imports the Express application (routes, middlewares, etc).

import notificationService from "./services/notification.service.js";
// ^ Imports a custom notification service responsible for sending real-time
//   updates through Socket.IO.


// -------------------------
// 3️⃣ Load Environment Variables
// -------------------------

dotenv.config();                           
// ^ Reads `.env` file and injects variables into `process.env`.
//   Must be done early before using environment variables.


// -------------------------
// 4️⃣ Configure Server Port
// -------------------------

const PORT = process.env.PORT || 5000;
// ^ Determines which port your server will run on.
//   Uses PORT from environment or defaults to 5000.


// -------------------------
// 5️⃣ Create HTTP Server
// -------------------------

const server = http.createServer(app);
// ^ Wraps the Express application inside a raw HTTP server.
//   This is required because Socket.IO must attach to an HTTP server,
//   not directly to the Express app.


// -------------------------
// 6️⃣ Initialize Socket.IO Server
// -------------------------

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins; adjust later for production security.
  },
});
// ^ Creates a WebSocket server instance.
//   - Binds it to the HTTP server
//   - Enables CORS so frontend apps on other domains can connect.


// -------------------------
// 7️⃣ Make Socket.IO Globally Available in Express
// -------------------------

app.set("io", io);
// ^ Stores the io instance inside Express app.
//   This allows other parts of the backend (like controllers) to access it
//   via req.app.get("io") and emit real-time events.


// -------------------------
// 8️⃣ Attach Socket.IO to NotificationService
// -------------------------

notificationService.attachIO(io);
// ^ Passes the Socket.IO instance to your notification service.
//   The service can now send WebSocket notifications to specific users or rooms.


// -------------------------
// 9️⃣ Handle Socket.IO Connection Events
// -------------------------

io.on("connection", (socket) => {
  // ^ This event triggers whenever a client establishes a WebSocket connection.

  console.log(`🟢 Client connected: ${socket.id}`);
  // ^ Logs each newly connected client's unique socket ID.


  // ⭐ CLIENT IDENTIFICATION FOR PRIVATE ROOMS ⭐
  // --------------------------------------------
  // The frontend should emit:
  //   socket.emit("identify", userId)
  // after login, passing the logged-in user's ID.

  socket.on("identify", (userId) => {
    // ^ Listens for an event from frontend to identify which user this socket belongs to.

    if (!userId) return;
    // ^ If userId is missing or undefined, ignore and do nothing.

    socket.join(String(userId));
    // ^ Adds this socket to a room uniquely named after the user’s ID.
    //   This lets you send notifications to a specific user like:
    //   io.to(userId).emit("eventName", data);

    console.log(`📌 User ${userId} joined room ${userId}`);
  });


  socket.on("disconnect", () => {
    // ^ This event triggers when a user disconnects (browser closed, network issue, etc.)

    console.log(`🔴 Client disconnected: ${socket.id}`);
    // ^ Logs disconnection for debugging.
  });
});


// -------------------------
// 🔟 Start HTTP + WebSocket Server
// -------------------------

server.listen(PORT, () => {
  // ^ Starts the HTTP server + Socket.IO listener on specified port.

  console.log(`✅ Server is running and listening on port ${PORT}`);
  // ^ Logs a success message on startup.
});


// -------------------------
// 1️⃣1️⃣ Global Error Handling: Uncaught Exceptions
// -------------------------

process.on("uncaughtException", (err) => {
  // ^ Catches errors thrown outside of promises (sync code)
  //   that were not handled anywhere in your app.

  console.error("❌ Uncaught Exception detected! Shutting down...");
  console.error(err);

  process.exit(1);
  // ^ Forcefully shuts the app down to avoid unstable state.
});


// -------------------------
// 1️⃣2️⃣ Global Error Handling: Unhandled Promise Rejections
// -------------------------

process.on("unhandledRejection", (reason) => {
  // ^ Captures rejected promises that weren't awaited with try/catch.

  console.error("❌ Unhandled Promise Rejection detected! Shutting down...");
  console.error(reason);

  server.close(() => process.exit(1));
  // ^ First closes the HTTP+Socket.IO server
  //   then exits the Node process.
});


// -------------------------
// 1️⃣3️⃣ Graceful Shutdown on SIGTERM
// -------------------------

process.on("SIGTERM", () => {
  // ^ This event fires when platforms like Render, PM2, or Docker
  //   send SIGTERM before killing the process.

  console.log("👋 SIGTERM received. Shutting down gracefully...");

  server.close(() => {
    // ^ Stops the server from accepting new connections.

    console.log("💤 Process terminated cleanly.");
  });
});

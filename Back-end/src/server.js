// -------------------------
// Import Application
// -------------------------

// Import the Express application instance we created in app.js.
// This file (server.js) only starts the server and manages process-level events.
const app = require("./app");

// -------------------------
// Configure Port
// -------------------------

// PORT is either provided via environment variable (for deployment platforms like Heroku)
// or defaults to 5000 when running locally.
const PORT = process.env.PORT || 5000;

// -------------------------
// Start Server
// -------------------------

// Create the server instance by calling app.listen().
// This allows us to store the server reference, so we can later close it gracefully on shutdown.
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});

// -------------------------
// Handle Uncaught Exceptions
// -------------------------

// This handles programming errors (e.g., calling an undefined function).
// If not caught, these will crash the Node.js process.
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception detected! Shutting down...");
  console.error(err); // log the error details
  // Exit immediately (1 = failure).
  process.exit(1);
});

// -------------------------
// Handle Unhandled Promise Rejections
// -------------------------

// This handles cases where a Promise is rejected but no .catch() is provided.
// Without this, Node.js would crash unexpectedly.
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection detected! Shutting down...");
  console.error(reason); // log the rejection reason
  // Gracefully close the server before shutting down.
  server.close(() => process.exit(1));
});

// -------------------------
// Graceful Shutdown on SIGTERM (e.g., Heroku, Docker)
// -------------------------

// Many deployment environments send a SIGTERM signal before killing the app.
// We listen for it and close the server gracefully so ongoing requests are not lost.
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("💤 Process terminated.");
  });
});

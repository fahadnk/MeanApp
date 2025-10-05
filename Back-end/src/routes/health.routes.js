// Import Router from Express to create modular route handlers
import { Router } from "express";

// Create a new router instance
const router = Router();

// Define a GET route for "/"
// When someone calls GET /api/health (because it's mounted in app.js),
// the server responds with a JSON object confirming the service is running
router.get("/", (req, res) => {
  res.json({
    status: "ok",                // Indicates system is healthy
    message: "Health check passed!" // Human-readable confirmation
  });
});

// Export the router so it can be used in app.js
export default router;

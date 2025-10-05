// backend/src/middleware/CorrelationMiddleware.js

// ---------------------------------------------------
// Import Dependencies
// ---------------------------------------------------

// Import UUID generator (universally unique identifiers)
// v4 → generates random UUIDs like: "3b241101-e2bb-4255-8caf-4136c566a962"
import { v4 as uuidv4 } from "uuid";


// ---------------------------------------------------
// Correlation Middleware
// ---------------------------------------------------
// Purpose: Attach a unique correlation ID to each request
// - Helps track a request across logs, services, or microservices
// - If client provides a correlation ID → reuse it
// - If not → generate a new one
function correlationMiddleware(req, res, next) {
  // Look for existing correlation ID in request headers (from client or other services)
  // If not found, generate a new UUID
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

  // Attach correlationId to the request object
  // → makes it available in controllers, services, and loggers
  req.correlationId = correlationId;

  // Also add correlationId in response headers
  // → useful so clients/microservices know the correlation ID for troubleshooting
  res.setHeader("x-correlation-id", correlationId);

  // Move to the next middleware/route
  next();
}


// ---------------------------------------------------
// Export Middleware
// ---------------------------------------------------
// Export middleware so it can be plugged into Express app
export default correlationMiddleware;

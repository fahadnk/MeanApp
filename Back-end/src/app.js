// -----------------------------------------------------------------------------
// src/app.js (or backend/src/app.js)
// -----------------------------------------------------------------------------
// 🏗️ Express App Initialization with Security, Logging & Sanitization
// -----------------------------------------------------------------------------

// ----------------------------
// 📦 Core Dependencies
// ----------------------------
import express from "express";               // Express framework
import cors from "cors";                     // Enable Cross-Origin Resource Sharing
import helmet from "helmet";                 // Sets HTTP headers for better security
// import { xss } from "express-xss-sanitizer"; // Prevents XSS attacks in request bodies
import morgan from "morgan";                 // HTTP request logger middleware
import { v4 as uuidv4 } from "uuid";         // Generates unique request IDs for tracing
// ----------------------------
// 🧼 Custom Middleware
// ----------------------------
import sanitizeRequest from "./middleware/SanitizeMiddleware.js"; // Prevents NoSQL injection

// ----------------------------
// 🧭 Route Imports
// ----------------------------
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import teamRoutes from "./routes/team.routes.js";

// ----------------------------
// ⚠️ Error + Logging Utilities
// ----------------------------
import errorMiddleware from "./middleware/ErrorMiddleware.js";
import logger from "./config/logger.js"; // Winston or pino-based logger

// ----------------------------
// 🚀 Initialize Express App
// ----------------------------
const app = express();


// -----------------------------------------------------------------------------
// 🧩 1. Correlation ID Middleware
// -----------------------------------------------------------------------------
// - Assigns a unique `req.id` to every request for traceability.
// - The same ID is included in response headers (`X-Request-Id`)
//   and logs for easy debugging across services.
// -----------------------------------------------------------------------------
app.use((req, res, next) => {
  req.id = uuidv4();                  // Generate unique UUID per request
  res.setHeader("X-Request-Id", req.id); // Attach to response headers
  next();
});


// -----------------------------------------------------------------------------
// ⚙️ 2. Global Middlewares
// -----------------------------------------------------------------------------
app.use(express.json()); // Parse JSON request bodies
app.use(cors());         // Enable CORS for all origins
app.use(helmet());       // Secure HTTP headers
app.use(sanitizeRequest); // Sanitize Mongo injection attempts ($ / . keys)

// -----------------------------------------------------------------------------
// 📋 3. Logging Setup (using Morgan + Winston)
// -----------------------------------------------------------------------------
// - Custom morgan token "id" injects our correlation ID into each log.
// - The logs are piped through `logger.http()` (likely Winston).
// -----------------------------------------------------------------------------
morgan.token("id", (req) => req.id); // define :id token for logs
const morganFormat =
  "[:id] :method :url :status :response-time ms - :res[content-length]";

app.use(
  morgan(morganFormat, {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);


// -----------------------------------------------------------------------------
// 🛣️ 4. API Routes
// -----------------------------------------------------------------------------
// Each route module exports an Express Router instance.
// -----------------------------------------------------------------------------
app.use("/api/health", healthRoutes); // Health check endpoint
app.use("/api/auth", authRoutes);     // Auth routes (login/register)
app.use("/api/tasks", taskRoutes);    // Task CRUD routes
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/teams", teamRoutes);


// -----------------------------------------------------------------------------
// ❌ 5. Centralized Error Handling
// -----------------------------------------------------------------------------
// Any thrown or forwarded errors (next(err)) are handled here.
// Ensures consistent error response structure.
// -----------------------------------------------------------------------------
app.use(errorMiddleware);


// -----------------------------------------------------------------------------
// ✅ Export App Instance
// -----------------------------------------------------------------------------
// - The server is started in `src/server.js` using `app.listen()`
// - Keeps this file testable and modular (can be imported into Jest tests)
// -----------------------------------------------------------------------------
export default app;

// -----------------------------------------------------------------------------
// src/app.js
// -----------------------------------------------------------------------------

// ----------------------------
// 📦 Core Dependencies
// ----------------------------
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";

// ----------------------------
// 📘 Swagger (ADD THIS)
// ----------------------------
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js"; // make sure extension is .js

// ----------------------------
// 🧼 Custom Middleware
// ----------------------------
import sanitizeRequest from "./middleware/SanitizeMiddleware.js";

// ----------------------------
// 🛠️ New Additions for File Upload
// ----------------------------
import path from "path";                    // ← ADD THIS
import { fileURLToPath } from "url";        // ← ADD THIS

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
import logger from "./config/logger.js";

// ----------------------------
// 🚀 Initialize Express App
// ----------------------------
const app = express();

// ----------------------------
// 📁 Static File Serving for Uploads (ADD THIS SECTION)
// ----------------------------
// This must come BEFORE routes, but AFTER core middlewares like express.json()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded profile pictures
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// ------------------------------------------------------------


// -----------------------------------------------------------------------------
// 🧩 1. Correlation ID Middleware
// -----------------------------------------------------------------------------
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
});


// -----------------------------------------------------------------------------
// ⚙️ 2. Global Middlewares
// -----------------------------------------------------------------------------
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(sanitizeRequest);


// -----------------------------------------------------------------------------
// 📋 3. Logging Setup
// -----------------------------------------------------------------------------
morgan.token("id", (req) => req.id);
const morganFormat = "[:id] :method :url :status :response-time ms - :res[content-length]";

app.use(
  morgan(morganFormat, {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// -----------------------------------------------------------------------------
// 📚 4. Swagger Docs (ADD THIS)
// -----------------------------------------------------------------------------
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// -----------------------------------------------------------------------------
// 🛣️ 4. API Routes
// -----------------------------------------------------------------------------
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/teams", teamRoutes);


// -----------------------------------------------------------------------------
// ❌ 5. Centralized Error Handling
// -----------------------------------------------------------------------------
app.use(errorMiddleware);


export default app;
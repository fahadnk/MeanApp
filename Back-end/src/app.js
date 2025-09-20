// Import the Express framework to create and manage the server
import express from "express";

// Import the CORS middleware to allow cross-origin requests (frontend & backend communication)
import cors from "cors";

// Import Helmet middleware to enhance security by setting various HTTP headers
import helmet from "helmet";

// Import health routes (a separate module that handles /api/health related requests)
import healthRoutes from "./routes/health.routes.js";

// Create an Express application instance
const app = express();

// Middleware to parse incoming requests with JSON payloads (req.body will be available as JS object)
app.use(express.json());

// Enable Cross-Origin Resource Sharing so requests from other domains (e.g., frontend) are allowed
app.use(cors());

// Use Helmet to add extra security headers to responses (helps protect against common vulnerabilities)
app.use(helmet());

// Register routes: all requests to "/api/health" will be handled by healthRoutes
app.use("/api/health", healthRoutes);

// Export the app instance so it can be used in server.js (to actually start listening on a port)
export default app;

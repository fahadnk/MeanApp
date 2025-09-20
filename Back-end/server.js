// Import the Express app instance (configured with middleware & routes)
import app from "./src/app.js";

// Import configuration (port, environment, etc.) from env.js (Singleton)
import config from "./src/config/env.js";

// Import database configuration to initialize MongoDB connection
// (just importing it runs the connection because of "new Database()" in db.js)
import "./src/config/db.js"; 

// Start the server and make it listen on the configured port
app.listen(config.port, () => {
  console.log(
    `🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`
  );
});

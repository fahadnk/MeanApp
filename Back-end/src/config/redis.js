// ---------------------------------------------------
// Redis Client Setup
// ---------------------------------------------------

import Redis from "ioredis";

// Create Redis instance using environment variables
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

export default redis;
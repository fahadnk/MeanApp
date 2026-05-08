// ---------------------------------------------------
// Import Dependencies
// ---------------------------------------------------

import redis from "../config/redis.js";
import { error } from "../utils/response.js";


// ---------------------------------------------------
// Rate Limiter Middleware (Production Ready)
// ---------------------------------------------------
// Limits number of requests per IP using Redis.
// Uses atomic increment + expiry for reliability.

function rateLimiter({ windowMs = 60000, max = 10 } = {}) {
  return async (req, res, next) => {
    try {
      // ---------------------------------------------------
      // Step 1: Identify client (IP-based)
      // ---------------------------------------------------
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

      const key = `rate_limit:${ip}`;

      // ---------------------------------------------------
      // Step 2: Increment request count atomically
      // ---------------------------------------------------
      const current = await redis.incr(key);

      // ---------------------------------------------------
      // Step 3: Set expiry for first request
      // ---------------------------------------------------
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      // ---------------------------------------------------
      // Step 4: Check if limit exceeded
      // ---------------------------------------------------
      if (current > max) {
        const ttl = await redis.pttl(key); // remaining time

        return error(
          res,
          `Too many requests. Try again in ${Math.ceil(ttl / 1000)} seconds.`,
          429
        );
      }

      // ---------------------------------------------------
      // Step 5: Optional headers (good practice)
      // ---------------------------------------------------
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - current);

      // ---------------------------------------------------
      // Step 6: Continue request flow
      // ---------------------------------------------------
      next();

    } catch (err) {
      // ---------------------------------------------------
      // Step 7: Fail-safe (do not block user if Redis fails)
      // ---------------------------------------------------
      console.error("Rate limiter error:", err.message);
      next();
    }
  };
}


// ---------------------------------------------------
// Export Middleware
// ---------------------------------------------------

export default rateLimiter;
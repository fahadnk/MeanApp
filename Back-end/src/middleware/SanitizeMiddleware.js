// src/middleware/SanitizeMiddleware.js
// Safe request sanitizer using `xss`.
// - Never throws when req.body / req.query / req.params is undefined.
// - Recursively sanitizes strings inside plain objects and arrays.
// - Does not mutate non-plain objects (e.g., file buffers) unexpectedly.
// - Logs errors but does NOT block requests (calls next()).

import xss from "xss";

/**
 * Sanitize string using xss library.
 */
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  // You can customize xss options here if needed.
  return xss(value);
}

/**
 * Recursively sanitize values:
 * - strings => sanitizeString
 * - plain objects => walk keys
 * - arrays => map each element
 * - everything else => return as-is
 *
 * NOTE: We treat "plain object" as value.constructor === Object to avoid touching
 * mongoose docs, Date objects, Buffer, etc.
 */
function sanitizeValue(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") return sanitizeString(value);

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v));
  }

  if (typeof value === "object" && value.constructor === Object) {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = sanitizeValue(value[key]);
    }
    return out;
  }

  // primitives (number, boolean), Dates, Buffers, Mongoose docs -> leave unchanged
  return value;
}

/**
 * Middleware entrypoint.
 * Safe: will not call Object.assign on undefined.
 */
export default function sanitizeRequest(req, res, next) {
  try {
    // Only process when these properties are plain objects
    if (req.body && typeof req.body === "object" && req.body.constructor === Object) {
      // Replace req.body with sanitized copy (do not mutate nested non-plain objects)
      req.body = sanitizeValue(req.body);
    }

    if (req.query && typeof req.query === "object" && req.query.constructor === Object) {
      req.query = sanitizeValue(req.query);
    }

    if (req.params && typeof req.params === "object" && req.params.constructor === Object) {
      req.params = sanitizeValue(req.params);
    }

    // Continue regardless of sanitization result
    return next();
  } catch (err) {
    // Log internal errors but do not block API (fail open)
    console.error("Sanitization middleware error:", err && err.stack ? err.stack : err);
    return next(); // Let the request continue to the normal handlers
  }
}

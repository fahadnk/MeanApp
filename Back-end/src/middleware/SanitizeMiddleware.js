import xss from "xss";

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clean = {};
  for (const key in obj) {
    clean[key] = typeof obj[key] === "string" ? xss(obj[key]) : obj[key];
  }
  return clean;
}

export default function sanitizeRequest(req, res, next) {
  try {
    Object.assign(req.body, sanitizeObject(req.body));
    Object.assign(req.params, sanitizeObject(req.params));
    Object.assign(req.query, sanitizeObject(req.query)); // ✅ safe mutation
    next();
  } catch (err) {
    console.error("Sanitization error:", err);
    res
      .status(500)
      .json({ success: false, message: "Request sanitization failed." });
  }
}

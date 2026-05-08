export function validateEnvMiddleware(req, res, next) {
  const requiredVars = ["DB_PASSWORD", "JWT_SECRET", "PORT"];

  const missingVars = requiredVars.filter(
    (key) => !process.env[key] || process.env[key].trim() === ""
  );

  if (missingVars.length > 0) {
    return res.status(500).json({
      error: `Missing environment variables: ${missingVars.join(", ")}`
    });
  }

  next();
}

export default validateEnvMiddleware;
// ============================================================================
// 📌 Global API Response Codes (Backend Constants)
// ----------------------------------------------------------------------------
// Use these codes everywhere in controllers/services to maintain consistency.
// ============================================================================

const RESPONSE_CODES = Object.freeze({
  // Success
  SUCCESS: 200,
  CREATED: 201,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  // Server Error
  INTERNAL_ERROR: 500,
});

export default RESPONSE_CODES;

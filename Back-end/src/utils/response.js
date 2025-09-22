// Utility function to send a success response
// res     → Express response object
// data    → actual response payload (object, array, etc.)
// message → optional message (default: "Success")
// status  → HTTP status code (default: 200 OK)
function success(res, data, message = "Success", status = 200) {
  return res.status(status).json({
    success: true,   // flag indicating request succeeded
    message,         // human-readable message
    data,            // main payload returned to client
  });
}

// Utility function to send an error response
// res     → Express response object
// message → error message (default: "Error")
// status  → HTTP status code (default: 400 Bad Request)
// details → optional technical error details (stack, validation errors, etc.)
function error(res, message = "Error", status = 400, details = null) {
  const response = {
    success: false,  // flag indicating request failed
    message,         // error description for client
  };

  // Include error details only if provided
  if (details) {
    response.error = details;
  }

  return res.status(status).json(response);
}

// Export both helpers to reuse in controllers
module.exports = { success, error };

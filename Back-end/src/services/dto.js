// Convert a User MongoDB document into a simplified DTO (Data Transfer Object)
// This hides internal fields (like password, __v, etc.) and ensures consistent API responses
export function userDTO(user) {
  // If no user is provided (null/undefined), return null
  if (!user) return null;

  // Return only safe and relevant fields for the client
  return {
    id: user._id,          // MongoDB ObjectId mapped as 'id'
    name: user.name,       // User's name
    email: user.email,     // User's email
    role: user.role,       // User's role (user/admin)
    createdAt: user.createdAt, // Timestamp when user was created
  };
}

// Convert a Task MongoDB document into a simplified DTO
// Includes nested userDTOs for 'assignedTo' and 'createdBy'
export function taskDTO(task) {
  // If no task is provided, return null
  if (!task) return null;

  return {
    id: task._id,              // Task's MongoDB ObjectId
    title: task.title,         // Task title
    description: task.description, // Optional task description
    status: task.status,       // Current task status (todo/in-progress/done)
    priority: task.priority,   // Task priority (low/medium/high)

    // Nested DTO: if task has an 'assignedTo' user, convert it with userDTO
    assignedTo: task.assignedTo ? userDTO(task.assignedTo) : null,

    // Nested DTO: if task has a 'createdBy' user, convert it with userDTO
    createdBy: task.createdBy ? userDTO(task.createdBy) : null,

    createdAt: task.createdAt, // Task creation timestamp
    updatedAt: task.updatedAt, // Last updated timestamp
  };
}

import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow("", null),
  priority: Joi.string().valid("low", "medium", "high").required(),
  status: Joi.string().valid("todo", "in-progress", "done").default("todo"),
  dueDate: Joi.date().required(),
  assignedTo: Joi.string().required(),
  createdBy: Joi.string().required(), // ONLY admin/manager allowed
  teamId: Joi.string().optional()       // ONLY admin allowed
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().allow("", null).optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
  status: Joi.string().valid("todo", "in-progress", "done").optional(),
  dueDate: Joi.date().optional(),
  assignedTo: Joi.string().optional(),
  createdBy: Joi.string().optional(), // ONLY admin/manager allowed
  teamId: Joi.string().optional()
}).min(1);


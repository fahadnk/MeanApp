import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow("", null),
  priority: Joi.string().valid("low", "medium", "high").required(),
  status: Joi.string().valid("todo", "in-progress", "done").default("todo"),
  dueDate: Joi.date().required(),     // 🔥 REQUIRED
  createdBy: Joi.string().required(),
  assignedTo: Joi.string().optional()
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().allow("", null),
  priority: Joi.string().valid("low", "medium", "high").optional(),
  status: Joi.string().valid("todo", "in-progress", "done").optional(),
  dueDate: Joi.date().optional(),     // allow optional on update
  createdBy: Joi.string().optional(),
  assignedTo: Joi.string().optional()
});

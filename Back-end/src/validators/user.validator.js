import Joi from "joi";

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  role: Joi.string().valid("admin", "user"),
}).min(1);
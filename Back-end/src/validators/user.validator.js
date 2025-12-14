import Joi from "joi";
import { ROLE_VALUES } from "../utils/roles.js";

export const createUserByAdminSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...ROLE_VALUES).default("user"),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  role: Joi.string().valid(...ROLE_VALUES),
}).min(1);
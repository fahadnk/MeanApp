import Joi from "joi";

export const createTeamSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
});

export const addMemberSchema = Joi.object({
  userId: Joi.string().required()
});

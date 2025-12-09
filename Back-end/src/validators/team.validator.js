import Joi from "joi";

// ---------------------------------------------------
// 1️⃣ Create Team (Manager or Admin creates a team)
// ---------------------------------------------------
export const createTeamSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
});

// ---------------------------------------------------
// 2️⃣ Add Member to Team (Manager adds a user)
// ---------------------------------------------------
export const addMemberSchema = Joi.object({
  userId: Joi.string().required()
});

// ---------------------------------------------------
// 3️⃣ Assign User to Team (Admin assigns user to ANY team)
// ---------------------------------------------------
export const assignTeamSchema = Joi.object({
  teamId: Joi.string().required()
});

// ---------------------------------------------------
// 4️⃣ Remove User From Team (Admin or Manager)
// ---------------------------------------------------
// This route normally does not take body data,
// so we allow an empty object.
export const removeTeamSchema = Joi.object({});

import joi from "joi";

export const createSubcategory = joi.object({
  name: joi.string().trim().required(),
  categoryId:joi.string().min(24).max(24).required(),
}).required();
export const updateSubcategory = joi.object({
  id: joi.string().min(24).max(24).required(),
  name: joi.string().trim(),
  categoryId:joi.string().min(24).max(24),
}).required();
export const deleteSubcategory = joi.object({
  subcategoryId:joi.string().min(24).max(24).required(),
}).required();
export const searchSubcategory = joi.object({
  subcategoryId:joi.string().min(24).max(24).required(),
  search: joi.string().trim().required(),
}).required();
export const search = joi.object({
  search: joi.string().trim().required(),
}).required();

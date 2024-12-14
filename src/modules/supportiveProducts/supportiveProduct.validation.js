import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const createSupportiveProduct = joi
  .object({
    nameAr: joi.string().trim().required().regex(/^[\u0600-\u06FF\s]*$/, 'Arabic'),
    nameEn: joi.string().trim().required().regex(/^[a-zA-Z\s]*$/, 'English'),
    companyNameAr: joi.string().trim().required().regex(/^[\u0600-\u06FF\s]*$/, 'Arabic'),
    companyNameEn: joi.string().trim().required().regex(/^[a-zA-Z\s]*$/, 'English'),
    categoryId: joi.string().required(),
    subcategoryId: joi.string(),
    categoryName: joi.string(),
    subcategoryName: joi.string(),
    countryOfOrigin: joi.string().required(),
    reasonForBoycott: joi.string().required(),
    file: generalFields.file.required(),
  }).required();

export const updateSupportiveProduct = joi.object({
  id: joi.string().min(24).max(24).required(),
  nameAr: joi.string().trim().required().regex(/^[\u0600-\u06FF\s]*$/, 'Arabic'),
  nameEn: joi.string().trim().required().regex(/^[a-zA-Z\s]*$/, 'English'),
  companyNameAr: joi.string().trim().required().regex(/^[\u0600-\u06FF\s]*$/, 'Arabic'),
  companyNameEn: joi.string().trim().required().regex(/^[a-zA-Z\s]*$/, 'English'),
  categoryId: joi.string().required(),
  subcategoryId: joi.string(),
  categoryName: joi.string(),
  subcategoryName: joi.string(),
  countryOfOrigin: joi.string().required(),
  reasonForBoycott: joi.string().required(),
  file: generalFields.file,
}).required();

export const deleteSupportiveProduct = joi.object({
  productId: joi.string().min(24).max(24).required(),
}).required();
export const getSpecificSupportiveProduct = joi.object({
  specificId: joi.string().min(24).max(24).required(),
}).required();
export const getSupportiveProduct = joi.object({
  categoryId: joi.string().min(24).max(24).required(),
  subcategoryId: joi.string().min(24).max(24),
}).required();
export const search = joi.object({
  search: joi.string().trim().required(),
}).required();

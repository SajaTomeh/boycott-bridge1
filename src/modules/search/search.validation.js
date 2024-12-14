import joi from "joi";
export const search = joi.object({
    search: joi.string().trim().required(),
  }).required();
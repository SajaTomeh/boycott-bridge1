//backend/src/modules/categories/category.validation.js

import Joi from 'joi';


// Validate Create Category
export const validateCreateCategory = (obj) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().label('name'),
    });
    return schema.validate(obj);
};
// Validate Update Category
export const validateUpdateCategory = (obj) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().label('name'),
    });
    return schema.validate(obj);
};


//Search
export const searchCategory = Joi.object({
    categoryId: Joi.string().min(24).max(24).required(),
    search: Joi.string().trim().required(),
}).required();
export const search = Joi.object({
    search: Joi.string().trim().required(),
}).required();



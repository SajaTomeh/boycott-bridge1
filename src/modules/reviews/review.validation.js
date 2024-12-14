//backend/src/modules/reviews/review.validation.js

import Joi from 'joi';



// Validate Create Rating
export const validateCreateRating = (obj) => {
    const schema = Joi.object({
        rating: Joi.number().integer().min(1).max(5).label('rating').required(),
    });
    return schema.validate(obj);
};

// Validate Create Comment
export const validateCreateComment = (obj) => {
    const schema = Joi.object({
        comment: Joi.string().label('comment').required(),
    });
    return schema.validate(obj);
};

// Validate Update Comment
export const validateUpdateComment = (obj) => {
    const schema = Joi.object({
        comment: Joi.string().required().label('comment'),
    });
    return schema.validate(obj);
};

// Validate Search
export const search = Joi.object({
    search: Joi.string().trim().required(),
}).required();




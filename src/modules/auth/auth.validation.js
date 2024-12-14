//backend/src/modules/users/user.validation.js

import joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

// Validate Login User
export const validateLogin = (obj) => {
    const schema = joi.object({
        email: joi.string().trim().min(5).max(100).required().email(),
        password: joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}


// Validate Register User
export const validateRegisterUser = (obj) => {
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100).required(),
        email: joi.string().trim().min(5).max(100).required().email(),
        password: passwordComplexity().required(),
    });
    return schema.validate(obj);
}


// Validate Register Company
export const validateRegisterCompany = (obj) => {
    const schema = joi.object({
        companyNameEn: joi.string().trim().min(1).max(200).required(),
        companyNameAr: joi.string().trim().min(1).max(200).required(),
        email: joi.string().trim().min(5).max(100).required().email(),
        password: passwordComplexity().required(),
        location: joi.string().trim().required(),
    });
    return schema.validate(obj);
}

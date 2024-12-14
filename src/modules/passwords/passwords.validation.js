//backend/src/modules/users/user.validation.js

import joi from 'joi';
import passwordComplexity from 'joi-password-complexity';


// Validate New Password
export const validateNewPassword = (obj) => {
    const schema = joi.object({
        password: passwordComplexity().required(),
    });
    return schema.validate(obj);
}

// Validate Email
export const validateEmail = (obj) => {
    const schema = joi.object({
        email: joi.string().trim().min(5).max(100).required().email(),
    });
    return schema.validate(obj);
}
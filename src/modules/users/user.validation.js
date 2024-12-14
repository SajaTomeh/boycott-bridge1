  //backend/src/modules/users/user.validation.js
import passwordComplexity from 'joi-password-complexity';
import joi from "joi";
export const updateUser = joi.object({
    id: joi.string().min(24).max(24).required(),
    username: joi.string().trim().required(),
  }).required();
export const deleteUser = joi.object({
    userId: joi.string().min(24).max(24).required(),
  }).required();
export const searchUser = joi.object({
    search: joi.string().trim().required(),
  }).required();


// Validate Register User
export const validateRegisterUser = (obj) => {
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100).required(),
        email: joi.string().trim().min(5).max(100).required().email(),
        password: passwordComplexity().required(),
    });
    return schema.validate(obj);
}

// Validate Login User
export const validateLoginUser = (obj) => {
    const schema = joi.object({
        email: joi.string().trim().min(5).max(100).required().email(),
        password: joi.string().trim().min(8).required(),
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

// Validate New Password
export const validateNewPassword = (obj) => {
    const schema = joi.object({
        password: passwordComplexity().required(),
    });
    return schema.validate(obj);
}


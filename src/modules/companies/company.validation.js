//backend/src/modules/companies/company.validation.js

import Joi from 'joi';


// Validate Login Company
export const validateLoginCompany = (obj) => {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}




// Validate Update Company Name
export const validateUpdateCompanyName = (newCompanyNameEn, newCompanyNameAr) => {
    const schema = Joi.object({
        newCompanyNameEn: Joi.string().required(),
        newCompanyNameAr: Joi.string().required()
    });
    return schema.validate({ newCompanyNameEn, newCompanyNameAr });
}


//Search
export const search = Joi.object({
    search: Joi.string().trim().required(),
}).required();
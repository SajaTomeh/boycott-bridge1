//backend/src/utils/checkExistence.js

import User from '../../DB/models/user.model.js';
import Company from '../../DB/models/company.model.js';


export async function checkExistence(email, username = "") {
    // Check if the email is already registered either as a user or a company
    let existingUser = await User.findOne({ email: email });
    let existingCompany = await Company.findOne({ email: email });

    if (existingUser || existingCompany) {
        return { exists: true, message: "Email is already registered" };
    }

    // Check if company name already exists in English
    existingCompany = await Company.findOne({ companyNameEn: username });
    if (existingCompany) {
        return { exists: true, message: "Company English name already exists" };
    }

    // Check if company name already exists in Arabic
    existingCompany = await Company.findOne({ companyNameAr: username });
    if (existingCompany) {
        return { exists: true, message: "Company Arabic name already exists" };
    }

    // If no existing email or username was found, return false
    return { exists: false };
}

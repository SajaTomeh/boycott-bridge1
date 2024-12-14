// backend/src/modules/auth/auth.controller.js

//"auth" refers to the [authentication] and registration processes.
// [authentication] (verifying who the user is) المصادقة
import bcrypt from 'bcryptjs';
import url from 'url';


import { asyncHandler } from "../../utils/errorHandling.js";
import User from '../../../DB/models/user.model.js';
import Company from '../../../DB/models/company.model.js';
import AdminNotification from '../../../DB/models/adminNotification.model.js';
import UnapprovedCompany from '../../../DB/models/unapprovedCompany.model.js';
import VerificationToken from '../../../DB/models/verificationToken.model.js';
import {
    validateRegisterUser,
    validateRegisterCompany,
    validateLogin
} from './auth.validation.js';
import { sendVerificationEmail } from '../../utils/emailVerification.js';
import { checkExistence } from '../../utils/checkExistence.js';



/**-----------------------------------------------
 * @desc    Register New User or Company
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 ------------------------------------------------*/
export const register = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body); // Log the request body for debugging

    let isCompanyRegistration = req.body.location ? true : false;

    if (isCompanyRegistration) {
        // Handle registration as a company

        let { username, companyNameEn, ...requestBody } = req.body;
        requestBody.companyNameEn = companyNameEn;
        requestBody.companyNameAr = username;
        const { error } = validateRegisterCompany(requestBody);

        if (error) {
            console.log("Company Registration Validation Error:", error); // Log validation error for debugging
            return res.status(400).json({ message: error.details[0].message });
        }
        if (isCompanyRegistration) {
            const { exists, message } = await checkExistence(req.body.email, req.body.username);
            if (exists) {
                return res.status(400).json({ message: message });
            }
        } else {
            const { exists, message } = await checkExistence(req.body.email);
            if (exists) {
                return res.status(400).json({ message: message });
            }
        }


        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        let unapprovedCompany = await UnapprovedCompany.findOne({ email: req.body.email });
        if (unapprovedCompany) {
            return res.status(400).json({ message: "Wait for the administrator’s approval. A confirmation message will be sent to your email if approved." });
        }
        // Save the company in a new database for unapproved companies
        let company = new UnapprovedCompany({
            companyNameEn: req.body.companyNameEn,
            companyNameAr: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            location: req.body.location,
        });
        await company.save();

        // Create a new admin notification
        let adminNotification = new AdminNotification({
            companyId: company._id,
            messageInformation: `Company [${company.companyNameEn} / ${company.companyNameAr}] Email ${company.email} Location ${company.location} wants to create an account`,
            section: 'registrationRequests'
        });
        await adminNotification.save();

        // Respond to the client
        res.status(201).json({
            message: "Wait for the administrator’s approval. A confirmation message will be sent to your email if approved.",
        });

    } else {
        // Handle registration as a user
        const { error } = validateRegisterUser(req.body);
        if (error) {
            console.log("User Registration Validation Error:", error); // Log validation error for debugging
            return res.status(400).json({ message: error.details[0].message });
        }

        const { exists, message } = await checkExistence(req.body.email, req.body.username);
        if (exists) {
            return res.status(400).json({ message: message });
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        let user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        await user.save();

        // Send verification email to the user
        await sendVerificationEmail(user, "accountVerification");

        // Response to the client
        res.status(201).json({
            message: "We sent to you an email, please verify your email address",
        });
    }
});

/**-----------------------------------------------
 * @desc    Login User or Company
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 ------------------------------------------------*/
export const login = asyncHandler(async (req, res) => {
    // 1 .validation
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // 2 .is user or company exist

    let user = await User.findOne({ email: req.body.email });
    let company = await Company.findOne({ email: req.body.email });
    let unapprovedCompany = await UnapprovedCompany.findOne({ email: req.body.email });
    if (unapprovedCompany) {
        return res.status(400).json({ message: "Wait for the administrator’s approval. A confirmation message will be sent to your email if approved." });
    }
    if (!user && !company && !unapprovedCompany) {
        return res.status(400).json({ message: "invalid email or password" });
    }

    let account = user || company;
    // 3 .check the password
    const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        account.password
    );
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "invalid email or password" });
    }

    if (!account.confirmEmail) {
        await sendVerificationEmail(account, "accountVerification");
        return res.status(400).json({
            message: "We sent to you an email, please verify your email address",
        });
    }
    // 4 .generate token (jwt)
    const token = account.generateAuthToken();
    res.status(200).json({
        _id: account._id,
        isAdmin: account.isAdmin,
        userType: account.userType,
        profilePhoto: account.profilePhoto,
        token,
        username: account.username,
    });
});


/**-----------------------------------------------
 * @desc    Verify User or Company Account
 * @route   /api/auth/:accountId/verify-account/:token
 * @method  GET
 * @access  private  (owner of the account)
 ------------------------------------------------*/
export const verifyAccount = asyncHandler(async (req, res) => {
    //
    let redirectURL;
    let user = await User.findById(req.params.accountId);
    let company = await Company.findById(req.params.accountId);
    if (!user && !company) {
        redirectURL = url.resolve(process.env.FEURL, '/?message=invalid link');
        res.redirect(redirectURL);

    }
    let account = user || company;

    const verificationToken = await VerificationToken.findOneAndDelete({
        accountId: account._id,
        token: req.params.token,
    });

    if (!verificationToken) {
        redirectURL = url.resolve(process.env.FEURL, '/?message=Invalid link or email message has expired (5 minutes),Log in to send the verification link again');
        res.redirect(redirectURL);
    }

    account.confirmEmail = true;
    await account.save();

    // res.status(200).json({ message: "Your account verified" });

    /*
    // Redirect to the homepage after verification
    const redirectURL = url.resolve(process.env.FEURL, '/');
    res.status(200).redirect(redirectURL);
*/

    // Construct the redirect URL with a query parameter for the message
    redirectURL = url.resolve(process.env.FEURL, '/?message=Your account is verified');
    res.redirect(redirectURL);
});









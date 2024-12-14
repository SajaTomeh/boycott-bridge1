// backend/src/utils/emailVerification.js

import crypto from "crypto";

import VerificationToken from "../../DB/models/verificationToken.model.js";
import DeletionToken from "../../DB/models/deletionToken.model.js";
import sendEmail from "./sendEmail.js";


//n
// Account Verification && Password Reset
export const sendVerificationEmail = async (account, purpose) => {
    let verificationToken = await VerificationToken.findOne({ accountId: account._id });

    // Check if the token has expired
    if (verificationToken && verificationToken.expiresAt < Date.now()) {
        verificationToken = null;
    }

    if (!verificationToken) {
        verificationToken = new VerificationToken({
            accountId: account._id,
            token: crypto.randomBytes(32).toString("hex"),
            expiresAt: Date.now() + 5 * 60 * 1000,  // token will expire in 5 minutes
        });
        await verificationToken.save();
    }

    let link;
    let emailSubject;
    let htmlTemplate;

    if (purpose === "accountVerification") {
        link = `${process.env.SERVER_DOMAIN}/api/auth/${account._id}/verify-account/${verificationToken.token}`;
        emailSubject = "Verify Your Email";
        htmlTemplate = `<a href="${link}">Click here to verify your email</a>`;
    }
    else if (purpose === "registrationApproved") {
        link = `${process.env.SERVER_DOMAIN}/api/auth/${account._id}/verify-account/${verificationToken.token}`;
        emailSubject = "Registration Approved";
        htmlTemplate = `
        <div>
        <p>Your registration has been approved by the admin. Click on the link below to verify your email and activate your account.</p>
        <a href="${link}">Verify</a>
        </div>`;
    }
    else if (purpose === "passwordReset") {
        link = `${process.env.SERVER_DOMAIN}/api/passwords/reset/${account._id}/${verificationToken.token}`;
        emailSubject = "Reset Password";
        htmlTemplate = `<a href="${link}">Click here to reset your password</a>`;
    }

    await sendEmail(account.email, emailSubject, htmlTemplate);
};

// Deletion 
export const sendDeletionConfirmationEmail = async (company, requestedByEmail) => {

    let deletionToken = await DeletionToken.findOne({ companyId: company._id });

    // Check if the token has expired
    if (deletionToken && deletionToken.expiresAt < Date.now()) {
        deletionToken = null;
    }

    if (!deletionToken) {
        deletionToken = new DeletionToken({
            companyId: company._id,
            token: crypto.randomBytes(32).toString("hex"),
            requestedByEmail: requestedByEmail,
            expiresAt: Date.now() + 5 * 60 * 1000,  // This token will expire in 5 minutes
        });
        await deletionToken.save();

    }

    let link = `${process.env.SERVER_DOMAIN}/api/companies/${company._id}/confirm-delete/${deletionToken.token}`;
    let htmlTemplate = `
        <div>
            <p>Click on the link below to confirm account deletion</p>
            <a href="${link}">Confirm Deletion</a>
        </div>`;

    await sendEmail(deletionToken.requestedByEmail, "Confirm Account Deletion", htmlTemplate);
};
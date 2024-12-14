//backend/src/modules/passwords/password.controller.js

import bcrypt from "bcryptjs";
import url from 'url';

import { asyncHandler } from "../../utils/errorHandling.js";
import User from "../../../DB/models/user.model.js";
import Company from "../../../DB/models/company.model.js";
import VerificationToken from "../../../DB/models/verificationToken.model.js";
import { validateNewPassword, validateEmail } from "./passwords.validation.js";
import { sendVerificationEmail } from "../../utils/emailVerification.js";




/**-----------------------------------------------
 * @desc    Update Password [Admin , User , Company]
 * @route   /api/passwords/reset/:accountId
 * @method  PUT
 * @access  private (only Account Holder)
 ------------------------------------------------*/
export const updatePassword = asyncHandler(async (req, res) => {

    const { accountId } = req.params;
    let account;

    // Attempt to find a user or company with the provided accountId
    account = await User.findById(accountId) || await Company.findById(accountId);

    // If no account is found, return an error
    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }


    // Check if currentPassword is provided
    if (!req.body.currentPassword) {
        return res.status(400).json({ message: "Current password must be provided to change password" });
    }

    // Check if the request includes a password change
    if (req.body.newPassword && req.body.confirmNewPassword) {
        // Verify the current password
        const validPassword = await bcrypt.compare(req.body.currentPassword, account.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Incorrect password" });
        }
        // Check if newPassword and confirmNewPassword are the same
        if (req.body.newPassword !== req.body.confirmNewPassword) {
            return res.status(400).json({ message: "New password and confirm new password must match" });
        }
        // Validate the new password
        const { error } = validateNewPassword({ password: req.body.newPassword });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        // If the password is correct, proceed with the password change
        const hashedPassword = await bcrypt.hash(req.body.newPassword, Number(process.env.SALT_ROUND));

        let update = { $set: { password: hashedPassword } };

        const updatedAccount = await account.updateOne(update);

        // If the update is successful, send a success message
        if (updatedAccount.modifiedCount === 1) {
            return res.status(200).json({ message: "Password updated successfully" });
        } else {
            return res.status(500).json({ message: "Error updating password" });
        }
    } else {
        return res.status(400).json({ message: "New password and confirm new password are required to update" });
    }
});

/**-----------------------------------------------
 * @desc    Send Reset Password Link
 * @route   /api/passwords/reset-link
 * @method  POST
 * @access  public 
 ------------------------------------------------*/
export const sendResetPasswordLink = asyncHandler(async (req, res) => {


    // Validate the new password
    const { error } = validateEmail(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }


    let account;

    // Attempt to find a user or company with the provided accountId
    account = await User.findOne(req.body) || await Company.findOne(req.body);

    // If no account is found, return an error
    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }

    // 3. Send Verification Email
    await sendVerificationEmail(account, "passwordReset");

    // 4. Response to the client
    res.status(200).json({
        message: "Password reset link sent to your email"
    })
});

/**-----------------------------------------------
 * @desc    Get Reset Password Link
 * @route   /api/passwords/reset/:accountId/:token
 * @method  GET
 * @access  private (only Account Holder)
 ------------------------------------------------*/
export const getResetPasswordLink = asyncHandler(async (req, res) => {

    let redirectURL;

    const account = await User.findById(req.params.accountId) || await Company.findById(req.params.accountId);
    if (!account) {

        redirectURL = url.resolve(process.env.FEURL, '/login/forgetPassword/?message=invalid link');
        res.redirect(redirectURL);
    }

    const verificationToken = await VerificationToken.findOne({
        accountId: account._id,
        token: req.params.token,
    });
    if (!verificationToken) {

        redirectURL = url.resolve(process.env.FEURL, '/login/forgetPassword/?message=Invalid link or email message has expired (5 minutes),Send the password reset link again');
        res.redirect(redirectURL);
    }
    redirectURL = url.resolve(process.env.FEURL, `/passwords/reset/${account._id}/${verificationToken.token}/?message=Valid url`);
    res.redirect(redirectURL);

});
/**-----------------------------------------------
 * @desc    Reset Password (forget password)
 * @route   /api/passwords/reset/:accountId/:token
 * @method  POST
 * @access  private (only Account Holder)
 ------------------------------------------------*/
export const resetPassword = asyncHandler(async (req, res) => {
    const { accountId, token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    // Check if newPassword and confirmNewPassword are provided and match
    if (!newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: "Both new password and confirm new password must be provided" });
    }
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "New password and confirm new password must match" });
    }

    // Validate the new password
    const { error } = validateNewPassword({ password: newPassword });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Attempt to find the account using accountId
    const account = await User.findById(accountId) || await Company.findById(accountId);
    if (!account) {
        return res.status(400).json({ message: "Invalid link or account not found" });
    }

    // Verify the token
    const verificationToken = await VerificationToken.findOneAndDelete({
        accountId: account._id,
        token: token,
    });
    if (!verificationToken) {
        return res.status(400).json({ message: "Invalid link or token not found" });
    }


    // Hash the new password
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the account with the new hashed password
    account.password = hashedPassword;
    await account.save();

    // Send success response
    res.status(200).json({ message: "Password reset successfully, please log in" });
});


//backend/src/modules/adminNotifications/adminNotifications.controller.js

import crypto from "crypto";

import { asyncHandler } from "../../utils/errorHandling.js";
import Company from "../../../DB/models/company.model.js";
import AlternativeProduct from '../../../DB/models/alternativeProduct.model.js';
import CompanyNotification from "../../../DB/models/companyNotification.model.js";
import AdminNotification from '../../../DB/models/adminNotification.model.js';
import VerificationToken from "../../../DB/models/verificationToken.model.js";
import UnapprovedCompany from '../../../DB/models/unapprovedCompany.model.js';
import sendEmail from "../../utils/sendEmail.js";
import makeNotificationReadable from '../../utils/readable.js';
import getNotificationCount from '../../utils/count.js';
import { checkExistence } from '../../utils/checkExistence.js';
import { sendVerificationEmail } from "../../utils/emailVerification.js";





// [Get Specific Notifications]
////////////////////////////////////////////////////////////////////////////////////////////////////////
/**-----------------------------------------------
 * @desc    Get Specific Company Message Notification (show)
 * @route   /api/admin/notifications/company-messages/:companyMessageNotificationId
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getSpecificCompanyMessageNotification = asyncHandler(async (req, res) => {

    const notification = await AdminNotification.findById(req.params.companyMessageNotificationId);

    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.section !== 'companyMessages') {
        return res.status(400).json({ message: "Invalid notification section" });
    }

    const response = {
        NotificationId: notification._id,
        title: notification.title,
        message: notification.message,
        date: notification.date
    };

    res.status(200).json(response);
});

/**-----------------------------------------------
 * @desc    Get Specific Information About Product Notification (show)
 * @route   /api/admin/notifications/product-info/:productInfoNotificationId
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getSpecificInformationAboutProductNotification = asyncHandler(async (req, res) => {

    const notification = await AdminNotification.findById(req.params.productInfoNotificationId);

    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.section !== 'informationAboutProduct') {
        return res.status(400).json({ message: "Invalid notification section" });
    }

    const response = {
        NotificationId: notification._id,
        productName: notification.productName,
        username: notification.username,
        response: notification.response,
        date: notification.date
    };



    res.status(200).json(response);
});

/**-----------------------------------------------
 * @desc    Get Specific complaint-inquirie Notification (show)
 * @route   /api/admin/notifications/complaints-inquiries/:complaintInquiryNotificationId
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getSpecificComplaintInquirieNotification = asyncHandler(async (req, res) => {
    const notification = await AdminNotification.findById(req.params.complaintInquiryNotificationId);

    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.section !== 'complaints-inquiries') {
        return res.status(400).json({ message: "Invalid notification section" });
    }

    const response = {
        NotificationId: notification._id,
        title: notification.title,
        username: notification.username,
        message: notification.message,
        response: notification.response,
        date: notification.date
    };



    res.status(200).json(response);
});
////////////////////////////////////////////////////////////////////////////////////////////////////////




// [Registration Requests]
////////////////////////////////////////////////////////////////////////////////////////////////////////
/**-----------------------------------------------
 * @desc    Get All Registration Requests Notifications
 * @route   /api/admin/notifications/registration-requests
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getRegistrationRequestsNotifications = asyncHandler(async (req, res) => {
    const notifications = await AdminNotification.find({ section: 'registrationRequests' }).sort({ date: -1 });

    // Map over the notifications to add the additional information
    const modifiedNotifications = notifications.map(notification => {
        let response = notification.response;
        let result = {
            NotificationId: notification._id,
            messageInformation: notification.messageInformation,
            response: response,
            date: notification.date
        };




        return result;
    });

    res.status(200).json(modifiedNotifications);
});

/**-----------------------------------------------
 * @desc    Approval Registration Request
 * @route   /api/admin/notifications/registration-requests/registrationRequestId/approval
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
export const approvalRegistrationRequest = asyncHandler(async (req, res) => {

    // Find the AdminNotification by id
    const adminNotification = await AdminNotification.findById(req.params.registrationRequestId);
    if (!adminNotification) {
        return res.status(404).json({ message: "Admin notification not found" });
    }

    // Find the UnapprovedCompany using the companyId from the AdminNotification
    const unapprovedCompany = await UnapprovedCompany.findById(adminNotification.companyId);
    if (!unapprovedCompany) {
        return res.status(404).json({ message: "Unapproved company not found" });
    }

    const { exists, message } = await checkExistence(unapprovedCompany.email);
    if (exists) {
        return res.status(400).json({ message: message });
    }


    let company = new Company({
        companyNameEn: unapprovedCompany.companyNameEn,
        companyNameAr: unapprovedCompany.companyNameAr,
        email: unapprovedCompany.email,
        password: unapprovedCompany.password,
        location: unapprovedCompany.location,
    });

    await company.save();

    // Delete the unapproved company from the UnapprovedCompany collection
    await UnapprovedCompany.findByIdAndDelete(adminNotification.companyId);

    // Creating new VerificationToken & save it to DB
    const verificationToken = new VerificationToken({
        accountId: company._id,
        token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();

    await sendVerificationEmail(company, "registrationApproved");

    // Update the AdminNotification 

    //adminNotification.response = 'approve';
    if (req.body.response !== "approve") {
        return res.status(400).json({ message: "Response must only be equal to 'approve'" });
    }
    adminNotification.response = req.body.response;

    await adminNotification.save();

    let companyObject = company.toObject();
    delete companyObject.password;
    return res.status(200).json({ message: "Company registration approved successfully", company: companyObject });
});

/**-----------------------------------------------
 * @desc    Reject Registration Request
 * @route   /api/admin/notifications/registration-requests/:registrationRequestId/reject
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
export const rejectRegistrationRequest = asyncHandler(async (req, res) => {

    // Find the AdminNotification by id
    const adminNotification = await AdminNotification.findById(req.params.registrationRequestId);
    if (!adminNotification) {
        return res.status(404).json({ message: "Admin notification not found" });
    }

    // Find the UnapprovedCompany using the companyId from the AdminNotification
    const unapprovedCompany = await UnapprovedCompany.findById(adminNotification.companyId);
    if (!unapprovedCompany) {
        return res.status(404).json({ message: "Unapproved company not found" });
    }

    // Delete the unapproved company from the UnapprovedCompany collection
    await UnapprovedCompany.findByIdAndDelete(adminNotification.companyId);

    // Send an email to the company informing them of the rejection
    const htmlTemplate = `
        <div>
        <p>Your registration has been rejected by the admin. ${req.body.adminMessage ? `Reason: ${req.body.adminMessage}` : ''}</p>
        </div>`;

    await sendEmail(unapprovedCompany.email, "Registration Rejected", htmlTemplate);

    // Update the AdminNotification 
    //adminNotification.response = 'reject';

    if (req.body.response !== "reject") {
        return res.status(400).json({ message: "Response must only be equal to 'reject'" });
    }
    adminNotification.response = req.body.response;

    await adminNotification.save();

    return res.status(200).json({ message: "Company registration rejected successfully" });
});
///////////////////////////////////////////////////////////////////////////////////////



// [Name Change Requests]
////////////////////////////////////////////////////////////////////////////////////////////////////////
/**-----------------------------------------------
 * @desc    Get All Name Change Requests Notifications
 * @route   /api/admin/notifications/name-change-requests
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getNameChangeRequestsNotifications = asyncHandler(async (req, res) => {

    const notifications = await AdminNotification.find({ section: 'nameChangeRequests' }).sort({ date: -1 });

    // Map over the notifications to add the additional information
    const modifiedNotifications = notifications.map(notification => {
        let response = notification.response;
        let result = {
            NotificationId: notification._id,
            companyId: notification.companyId,
            messageInformation: notification.messageInformation,
            response: response,
            date: notification.date
        };



        return result;
    });

    res.status(200).json(modifiedNotifications);
});

/**-----------------------------------------------
 * @desc    Approval Name Change Request
 * @route   /api/admin/notifications/name-change-requests/:nameChangeRequestId/approval
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
export const approvalNameChangeRequest = asyncHandler(async (req, res) => {

    const notification = await AdminNotification.findById(req.params.nameChangeRequestId);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    const company = await Company.findById(notification.companyId);
    if (!company || !company.newCompanyNameEn || !company.newCompanyNameAr) {
        return res.status(404).json({ message: "Company not found or no name change requested" });
    }

    const oldCompanyNameEn = company.companyNameEn;
    const oldCompanyNameAr = company.companyNameAr;
    const newCompanyNameEn = company.newCompanyNameEn;
    const newCompanyNameAr = company.newCompanyNameAr;

    const updatedCompany = await Company.findByIdAndUpdate(
        company._id,
        {
            $set: {
                companyNameEn: newCompanyNameEn,
                companyNameAr: newCompanyNameAr,
                newCompanyNameEn: null,
                newCompanyNameAr: null,
                isNameChangeApproved: true
            },
        },
        { new: true }
    ).select("-password -confirmEmail");

    if (updatedCompany) {
        //notification.response = "approve";

        if (req.body.response !== "approve") {
            return res.status(400).json({ message: "Response must only be equal to 'approve'" });
        }
        notification.response = req.body.response;

        await notification.save();

        // Create a new notification for the company
        const companyNotification = new CompanyNotification({
            companyId: company._id,
            messageInformation: `The admin has approved the request to change the name from ${oldCompanyNameEn} / ${oldCompanyNameAr} to ${newCompanyNameEn} / ${newCompanyNameAr}.`,
            adminResponse: "approve",
            section: "nameChange"
        });

        await companyNotification.save();


        // Update the company name in alternativeProductModel
        await AlternativeProduct.updateMany(
            { createdBy: company._id },
            { companyNameAr: newCompanyNameAr, companyNameEn: newCompanyNameEn }
        );

        return res.status(200).json({ message: "Company name updated successfully", updatedCompany });
    }
    else {
        return res.status(500).json({ message: "Error updating company name" });
    }
});

/**-----------------------------------------------
 * @desc    Reject Name Change Request
 * @route   /api/admin/notifications/name-change-requests/:nameChangeRequestId/reject
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
export const rejectNameChangeRequest = asyncHandler(async (req, res) => {

    const notification = await AdminNotification.findById(req.params.nameChangeRequestId);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    const company = await Company.findById(notification.companyId);
    if (!company || !company.newCompanyNameEn || !company.newCompanyNameAr) {
        return res.status(404).json({ message: "Company not found or no name change requested" });
    }

    const newCompanyNameEn = company.newCompanyNameEn;
    const newCompanyNameAr = company.newCompanyNameAr;

    const updatedCompany = await Company.findByIdAndUpdate(
        company._id,
        {
            $set: {
                newCompanyNameEn: null,
                newCompanyNameAr: null,
                isNameChangeApproved: false
            },
        },
        { new: true }
    ).select("-password -confirmEmail");

    if (updatedCompany) {
        //notification.response = "reject";

        if (req.body.response !== "reject") {
            return res.status(400).json({ message: "Response must only be equal to 'reject'" });
        }
        notification.response = req.body.response;

        await notification.save();

        // Create a new notification for the company
        const companyNotification = new CompanyNotification({
            companyId: company._id,
            messageInformation: `The admin has rejected the request to change the name to ${newCompanyNameEn} / ${newCompanyNameAr}. For further inquiries regarding the matter, contact the administrator.`,
            adminResponse: "reject",
            section: "nameChange"
        });

        await companyNotification.save();

        return res.status(200).json({ message: "Your request to change your name has been rejected. For further inquiries regarding the matter, contact the administrator.", updatedCompany });
    } else {
        return res.status(500).json({ message: "Error updating company name" });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////



// [Company Messages]
////////////////////////////////////////////////////////////////////////////////////////////////////////
/**-----------------------------------------------
 * @desc    Get All Company Messages Notifications
 * @route   /api/admin/notifications/company-messages
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getCompanyMessagesNotifications = asyncHandler(async (req, res) => {

    const notifications = await AdminNotification.find({ section: 'companyMessages' }).sort({ date: -1 });

    // Map over the notifications to add the additional information
    const modifiedNotifications = notifications.map(notification => {
        let response = notification.response;
        let result = {
            NotificationId: notification._id,
            companyId: notification.companyId,
            messageInformation: notification.messageInformation,
            response: response,
            date: notification.date,
            adminResponse: notification.adminResponse
        };



        return result;
    });

    res.status(200).json(modifiedNotifications);
});

/**-----------------------------------------------
 * @desc    Reply to Company Message
 * @route   /api/admin/notifications/company-messages/:companyMessageId/reply
 * @method  POST
 * @access  private (only admin)
 ------------------------------------------------*/
export const replyCompanyMessage = asyncHandler(async (req, res) => {

    const adminNotification = await AdminNotification.findOne({ _id: req.params.companyMessageId });
    if (!adminNotification) {
        return res.status(404).json({ message: "No company message found" });
    }

    const company = await Company.findById(adminNotification.companyId);
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }

    // Check if admin's response is empty
    if (!req.body.adminResponse || req.body.adminResponse.trim() === '') {
        return res.status(400).json({ message: "Please write your response [adminResponse]" });
    }

    const notification = new CompanyNotification({
        companyId: adminNotification.companyId,
        adminResponse: req.body.adminResponse,
        message: adminNotification.message,
        title: adminNotification.title,
        section: 'contactAdmin'
    });
    await notification.save();

    // Update the adminNotification
    adminNotification.adminResponse = req.body.adminResponse;
    //adminNotification.response = "answered";

    if (req.body.response !== "answered") {
        return res.status(400).json({ message: "Response must only be equal to 'answered'" });
    }
    adminNotification.response = req.body.response;


    await adminNotification.save();

    return res.status(200).json({ message: "Admin's response sent successfully", notification });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////





// [Products Information]
////////////////////////////////////////////////////////////////////////////////////////////////////////
/**-----------------------------------------------
 * @desc    Get All Products Information Notifications
 * @route   /api/admin/notifications/product-inquiries
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getProductsInformationNotifications = asyncHandler(async (req, res) => {

    const notifications = await AdminNotification.find({ section: 'informationAboutProduct' }).sort({ date: -1 });

    // Map over the notifications to add the additional information
    const modifiedNotifications = notifications.map(notification => {
        let response = notification.response;
        let result = {
            NotificationId: notification._id,
            messageInformation: notification.messageInformation,
            response: response,
            date: notification.date
        };


        return result;
    });

    res.status(200).json(modifiedNotifications);
});

/**-----------------------------------------------
 * @desc    Readable product information notifications
 * @route   /api/admin/notifications/product-inquiries/:productInformationId/readable
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
export const readableProductInformation = asyncHandler((req, res) => {
    return makeNotificationReadable(req, res, AdminNotification, "productInformationId");
});
///////////////////////////////////////////////////////////////////////////////////////



// [Complaints/Inquiries]
////////////////////////////////////////////////////////////////////////////////////////////////////////
/**-----------------------------------------------
 * @desc    Get All Complaints/Inquiries Notifications 
 * @route   /api/admin/notifications/complaints-inquiries
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getComplaintsInquiriesNotifications = asyncHandler(async (req, res) => {

    const notifications = await AdminNotification.find({ section: 'complaints-inquiries' }).sort({ date: -1 });

    // Map over the notifications to add the additional information
    const modifiedNotifications = notifications.map(notification => {
        let response = notification.response;
        let result = {
            NotificationId: notification._id,
            messageInformation: notification.messageInformation,
            response: response,
            date: notification.date,

        };


        return result;
    });

    res.status(200).json(modifiedNotifications);
});

/**-----------------------------------------------
 * @desc    Readable Complaint/Inquirie Notifications
 * @route   /api/admin/notifications/complaints-inquiries/:complaintInquiryId/readable
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
export const readableComplaintInquirie = asyncHandler((req, res) => {
    return makeNotificationReadable(req, res, AdminNotification, "complaintInquiryId");
});
////////////////////////////////////////////////////////////////////////////////////////////////////////



// [Count]
///////////////////////////////////////////////////////////////////////////////////////
/**-----------------------------------------------
 * @desc    Get Registration Requests Count
 * @route   /api/admin/notifications/registration-requests/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getRegistrationRequestsCount = asyncHandler(async (req, res) => {

    const count = await getNotificationCount(AdminNotification, 'registrationRequests');
    res.status(200).json({ count });
});

/**-----------------------------------------------
 * @desc    Get Name Change Requests Count
 * @route   /api/admin/notifications/name-change-requests/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getNameChangeRequestsCount = asyncHandler(async (req, res) => {
    const count = await getNotificationCount(AdminNotification, 'nameChangeRequests');
    res.status(200).json({ count });
});

/**-----------------------------------------------
 * @desc    Get Company Messages Count
 * @route    /api/admin/notifications/company-messages/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getCompanyMessagesCount = asyncHandler(async (req, res) => {
    const count = await getNotificationCount(AdminNotification, 'companyMessages');
    res.status(200).json({ count });
});

/**-----------------------------------------------
 * @desc    Get Information About Products Count
 * @route   /api/admin/notifications/product-info/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getInformationAboutProductCount = asyncHandler(async (req, res) => {
    const count = await getNotificationCount(AdminNotification, 'informationAboutProduct');
    res.status(200).json({ count });
});

/**-----------------------------------------------
 * @desc    Get Complaints-Inquiries Count
 * @route   /api/admin/notifications/complaints-inquiries/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getComplaintsInquiriesCount = asyncHandler(async (req, res) => {
    const count = await getNotificationCount(AdminNotification, 'complaints-inquiries');
    res.status(200).json({ count });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////


// [Count All]
/**-----------------------------------------------
 * @desc    Get Notifications Count where response is null
 * @route   /api/admin/notifications/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getNullResponseNotificationsCount = asyncHandler(async (req, res) => {
    const count = await AdminNotification.countDocuments({ response: null });
    res.status(200).json({ count });
});

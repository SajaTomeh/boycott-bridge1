//backend/src/modules/adminNotifications/adminNotifications.router.js

import express from 'express';

import * as adminNotificationsController from './adminNotifications.controller.js';
import { verifyTokenAndAdmin } from '../../middlewares/verifyToken.js';
import validateObjectId from '../../middlewares/validateObjectId.js';

const router = express.Router();




// [Get Specific Notifications]
////////////////////////////////////////////////////////////////////////////////////////////////////////

// /api/admin/notifications/company-messages/:companyMessageNotificationId
router
    .route("/company-messages/:companyMessageNotificationId")
    .get(validateObjectId("companyMessageNotificationId"), verifyTokenAndAdmin,
        adminNotificationsController.getSpecificCompanyMessageNotification);

// /api/admin/notifications/product-info/:productInfoNotificationId
router
    .route("/product-info/:productInfoNotificationId")
    .get(validateObjectId("productInfoNotificationId"), verifyTokenAndAdmin,
        adminNotificationsController.getSpecificInformationAboutProductNotification);

// /api/admin/notifications/complaints-inquiries/:complaintInquiryNotificationId
router
    .route("/complaints-inquiries/:complaintInquiryNotificationId")
    .get(validateObjectId("complaintInquiryNotificationId"), verifyTokenAndAdmin,
        adminNotificationsController.getSpecificComplaintInquirieNotification);
////////////////////////////////////////////////////////////////////////////////////////////////////////



// [Registration Requests]
////////////////////////////////////////////////////////////////////////////////////////////////////////

// /api/admin/notifications/registration-requests
router
    .route("/registration-requests")
    .get(verifyTokenAndAdmin, adminNotificationsController.getRegistrationRequestsNotifications);

// /api/admin/notifications/registration-requests/:registrationRequestId/approval
router
    .route("/registration-requests/:registrationRequestId/approval")
    .put(validateObjectId("registrationRequestId"), verifyTokenAndAdmin,
        adminNotificationsController.approvalRegistrationRequest);

// /api/admin/notifications/registration-requests/:registrationRequestId/reject
router
    .route("/registration-requests/:registrationRequestId/reject")
    .put(validateObjectId("registrationRequestId"), verifyTokenAndAdmin,
        adminNotificationsController.rejectRegistrationRequest);
////////////////////////////////////////////////////////////////////////////////////////////////////////





// [Name Change Requests]
////////////////////////////////////////////////////////////////////////////////////////////////////////

// /api/admin/notifications/name-change-requests
router
    .route("/name-change-requests")
    .get(verifyTokenAndAdmin, adminNotificationsController.getNameChangeRequestsNotifications);

// /api/admin/notifications/name-change-requests/:nameChangeRequestId/approval
router
    .route("/name-change-requests/:nameChangeRequestId/approval")
    .put(validateObjectId("nameChangeRequestId"), verifyTokenAndAdmin,
        adminNotificationsController.approvalNameChangeRequest);

// /api/admin/notifications/name-change-requests/:nameChangeRequestId/reject
router
    .route("/name-change-requests/:nameChangeRequestId/reject")
    .put(validateObjectId("nameChangeRequestId"), verifyTokenAndAdmin,
        adminNotificationsController.rejectNameChangeRequest);
////////////////////////////////////////////////////////////////////////////////////////////////////////



// [Company Messages]
////////////////////////////////////////////////////////////////////////////////////////////////////////

// /api/admin/notifications/company-messages
router
    .route("/company-messages")
    .get(verifyTokenAndAdmin, adminNotificationsController.getCompanyMessagesNotifications);

// /api/admin/notifications/company-messages/:companyMessageId/reply
router
    .route("/company-messages/:companyMessageId/reply")
    .post(validateObjectId("companyMessageId"), verifyTokenAndAdmin,
        adminNotificationsController.replyCompanyMessage);
////////////////////////////////////////////////////////////////////////////////////////////////////////




// [Products Information]
////////////////////////////////////////////////////////////////////////////////////////////////////////

//  /api/admin/notifications/product-inquiries
router
    .route("/product-inquiries")
    .get(verifyTokenAndAdmin, adminNotificationsController.getProductsInformationNotifications);

//  /api/admin/notifications/product-inquiries/:productInformationId/readable
router
    .route("/product-inquiries/:productInformationId/readable")
    .put(validateObjectId("productInformationId"), verifyTokenAndAdmin,
        adminNotificationsController.readableProductInformation);
////////////////////////////////////////////////////////////////////////////////////////////////////////



// [Complaints/Inquiries]
////////////////////////////////////////////////////////////////////////////////////////////////////////

//  /api/admin/notifications/complaints-inquiries
router
    .route("/complaints-inquiries")
    .get(verifyTokenAndAdmin, adminNotificationsController.getComplaintsInquiriesNotifications);

//   /api/admin/notifications/complaints-inquiries/:complaintInquiryId/readable
router
    .route("/complaints-inquiries/:complaintInquiryId/readable")
    .put(validateObjectId("complaintInquiryId"), verifyTokenAndAdmin,
        adminNotificationsController.readableComplaintInquirie);
////////////////////////////////////////////////////////////////////////////////////////////////////////



// [Count]
///////////////////////////////////////////////////////////////////////////////////////

//   /api/admin/notifications/registration-requests/count
router
    .route("/registration-requests/count")
    .get(verifyTokenAndAdmin, adminNotificationsController.getRegistrationRequestsCount);

//   /api/admin/notifications/name-change-requests/count
router
    .route("/name-change-requests/count")
    .get(verifyTokenAndAdmin, adminNotificationsController.getNameChangeRequestsCount);

//   /api/admin/notifications/company-messages/count/temp
router
    .route("/company-messages/count/temp")
    .get(verifyTokenAndAdmin, adminNotificationsController.getCompanyMessagesCount);

//   /api/admin/notifications/product-info/count/temp
router
    .route("/product-info/count/temp")
    .get(verifyTokenAndAdmin, adminNotificationsController.getInformationAboutProductCount);

//   /api/admin/notifications/complaints-inquiries/count/temp
router
    .route("/complaints-inquiries/count/temp")
    .get(verifyTokenAndAdmin, adminNotificationsController.getComplaintsInquiriesCount);
///////////////////////////////////////////////////////////////////////////////////////



// [Count All]
//   /api/admin/notifications/count
router
    .route("/count")
    .get(verifyTokenAndAdmin, adminNotificationsController.getNullResponseNotificationsCount);



export default router;

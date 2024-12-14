//backend/src/modules/companyNotifications/CompanyNotifications.router.js

import express from 'express';

import * as companyNotificationsController from "./companyNotifications.controller.js";
import { verifyTokenCompanyAndOnlyCompanyItself } from "../../middlewares/verifyToken.js";
import validateObjectId from "../../middlewares/validateObjectId.js";

const router = express.Router();


// [Get All]

// /api/companies/:companyId/notifications/name-changes
router.route('/:companyId/notifications/name-changes')
    .get(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companyNotificationsController.getNameChangeNotifications);

// /api/companies/:companyId/notifications/contact-admin
router.route('/:companyId/notifications/contact-admin')
    .get(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companyNotificationsController.getContactAdminNotifications);


// [Get Specific]

// /api/companies/:companyId/notifications/contact-admin/:contactAdminNotificationId
router.route('/:companyId/notifications/contact-admin/:contactAdminNotificationId')
    .get(validateObjectId("companyId"), validateObjectId("contactAdminNotificationId"),
        verifyTokenCompanyAndOnlyCompanyItself,
        companyNotificationsController.getSpecificContactAdminNotification);



//[Readable]

// /api/companies/:companyId/notifications/name-changes/:nameChangesNotificationId/readable
router.route('/:companyId/notifications/name-changes/:nameChangesNotificationId/readable')
    .put(validateObjectId("companyId"), validateObjectId("nameChangesNotificationId"),
        verifyTokenCompanyAndOnlyCompanyItself, companyNotificationsController.readableNameChange);

// /api/companies/:companyId/notifications/contact-admin/:contactAdminNotificationId/readable
router.route('/:companyId/notifications/contact-admin/:contactAdminNotificationId/readable')
    .put(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companyNotificationsController.readableContactAdmin);


// [Count]

// /api/companies/:companyId/notifications/name-changes/count
router.route('/:companyId/notifications/name-changes/count')
    .get(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companyNotificationsController.getNameChangeCount);

// /api/companies/:companyId/notifications/contact-admin/count/temp
router.route('/:companyId/notifications/contact-admin/count/temp')
    .get(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companyNotificationsController.getContactAdminCount);



// [Count All]

// /api/companies/:companyId/notifications/count
router.route('/:companyId/notifications/count')
    .get(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companyNotificationsController.getNullResponseNotificationsCount);



export default router;

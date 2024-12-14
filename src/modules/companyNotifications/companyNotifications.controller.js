//backend/src/modules/companyNotifications/companyNotifications.controller.js

import { asyncHandler } from "../../utils/errorHandling.js";
import CompanyNotification from "../../../DB/models/companyNotification.model.js";
import makeNotificationReadable from "../../utils/readable.js";
import getNotificationCount from "../../utils/count.js";




// [Get All]
/**-----------------------------------------------
 * @desc    Get All Name Change Notifications
 * @route   /api/companies/:companyId/notifications/name-changes
 * @method  GET
 * @access  private (only company itself)
 ------------------------------------------------*/
export const getNameChangeNotifications = asyncHandler(async (req, res) => {

    const { companyId } = req.params;

    const notifications = await CompanyNotification.find({ section: 'nameChange', companyId: companyId }).sort({ date: -1 });

    // Map over the notifications to add the additional information
    const modifiedNotifications = notifications.map(notification => {
        let result = {
            NotificationId: notification._id,
            messageInformation: notification.messageInformation,
            adminResponse: notification.adminResponse,
            date: notification.date
        };

        return result;
    });

    res.status(200).json(modifiedNotifications);
});

/**-----------------------------------------------
 * @desc    Get All Contact Admin Notifications
 * @route   /api/companies/:companyId/notifications/contact-admin
 * @method  GET
 * @access  private (only company itself)
 ------------------------------------------------*/
export const getContactAdminNotifications = asyncHandler(async (req, res) => {

    const { companyId } = req.params;

    const notifications = await CompanyNotification.find({ section: 'contactAdmin', companyId: companyId }).sort({ date: -1 });

    // Map over the notifications to add the additional information
    const modifiedNotifications = notifications.map(notification => {
        let result = {
            NotificationId: notification._id,
            messageInformation: "المسؤول قام بالرد على رسالتك بتاريخ",
            adminResponse: notification.adminResponse,
            response: notification.response,
            date: notification.date,
            message: notification.message
        };

        return result;
    });

    res.status(200).json(modifiedNotifications);
});



// [Get Specific]
/**-----------------------------------------------
 * @desc    Get Specific Contact Admin Notification (show)
 * @route   /api/companies/:companyId/notifications/contact-admin/:contactAdminNotificationId
 * @method  GET
 * @access  private (only company itself)
 ------------------------------------------------*/
export const getSpecificContactAdminNotification = asyncHandler(async (req, res) => {

    const notification = await CompanyNotification.findOne({
        _id: req.params.contactAdminNotificationId,
        companyId: req.params.companyId
    });

    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    const modifiedNotifications = {
        date: notification.date,
        title: notification.title,
        message: notification.message,
        adminResponse: notification.adminResponse
    }

    res.status(200).json(modifiedNotifications);
});



// [Count]
/**-----------------------------------------------
 * @desc    Get Name Change Count
 * @route   /api/companies/:companyId/notifications/name-changes/count
 * @method  GET
 * @access  private (only Company itself)
 ------------------------------------------------*/
export const getNameChangeCount = asyncHandler(async (req, res) => {
    const companyId = req.params.companyId;
    const count = await getNotificationCount(CompanyNotification, 'nameChange', companyId);
    res.status(200).json({ count });
});

/**-----------------------------------------------
 * @desc    Get Contact Admin Count
 * @route   /api/companies/:companyId/notifications/contact-admin/count
 * @method  GET
 * @access  private (only Company itself)
 ------------------------------------------------*/
export const getContactAdminCount = asyncHandler(async (req, res) => {
    const companyId = req.params.companyId;
    const count = await getNotificationCount(CompanyNotification, 'contactAdmin', companyId);
    res.status(200).json({ count });
});



//[Readable]
/**-----------------------------------------------
 * @desc    Readable Name Change Notifications
 * @route   /api/companies/:companyId/notifications/name-changes/readable
 * @method  PUT
 * @access  private (only company itself)
 ------------------------------------------------*/
export const readableNameChange = asyncHandler((req, res) => {
    return makeNotificationReadable(req, res, CompanyNotification, "nameChangesNotificationId");
});

/**-----------------------------------------------
 * @desc    Readable Contact Admin Notifications
 * @route   /api/companies/:companyId/notifications/contact-admin/:contactAdminNotificationId/readable
 * @method  PUT
 * @access  private (only company itself)
 ------------------------------------------------*/
export const readableContactAdmin = asyncHandler((req, res) => {
    return makeNotificationReadable(req, res, CompanyNotification, "contactAdminNotificationId");
});



// [Count All]
/**-----------------------------------------------
 * @desc    Get Notifications Count where response is null for a specific company
 * @route   /api/companies/:companyId/notifications/count
 * @method  GET
 * @access  private (only company itself)
 ------------------------------------------------*/
export const getNullResponseNotificationsCount = asyncHandler(async (req, res) => {
    const companyId = req.params.companyId;
    const count = await CompanyNotification.countDocuments({ companyId: companyId, response: null });
    res.status(200).json({ count });
});

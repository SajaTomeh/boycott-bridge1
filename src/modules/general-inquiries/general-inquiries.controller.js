//backend/src/modules/adminNotifications/general-inquiries.controller.js


import { asyncHandler } from "../../utils/errorHandling.js";
import AdminNotification from '../../../DB/models/adminNotification.model.js';
import alternativeProductModel from "../../../DB/models/alternativeProduct.model.js";
import supportiveProductModel from "../../../DB/models/supportiveProduct.model.js";





/**-----------------------------------------------
 * @desc    Send Complaint or Inquiry (Notification)
 * @route   /api/general-inquiries/complaints-inquiries
 * @method  POST
 * @access  public 
 ------------------------------------------------*/
export const sendComplaintOrInquiry = async (req, res) => {
    // Check if title and message are provided
    if (!req.body.title || !req.body.message) {
        return res.status(400).json({ message: "Title and message must be provided" });
    }

    // Create a new admin notification for complaints/inquiries
    const adminNotification = new AdminNotification({
        messageInformation: `مستخدم ارسل شكوى / استفسار`,
        message: req.body.message,
        title: req.body.title,
        section: 'complaints-inquiries'
    });

    // Save the admin notification
    const savedAdminNotification = await adminNotification.save();

    // If the notification is successfully saved, send a success message
    if (savedAdminNotification) {
        return res.status(200).json({ message: "Your complaints-inquiries has been sent to the administrator" });
    } else {
        return res.status(500).json({ message: "Error sending message to administrator" });
    }
};


/**-----------------------------------------------
 * @desc    Provide Information About a Product (Notification)
 * @route   /api/general-inquiries/product-info-request
 * @method  POST
 * @access  public
 ------------------------------------------------*/
export const provideProductInformation = async (req, res) => {
    // Check if product name is provided
    if (!req.body.productName) {
        return res.status(400).json({ message: "Product name must be provided" });
    }

    // Check if the product exists
    if (await supportiveProductModel.findOne({ nameAr: req.body.productName })
        ||
        await alternativeProductModel.findOne({ nameEn: req.body.productName })) {

        return res.status(409).json({ message: "Product already exists" });
    }

    // Create a new admin notification for product information requests
    const adminNotification = new AdminNotification({
        productName: req.body.productName,
        messageInformation: `Request to provide information about ${req.body.productName}`,
        section: "informationAboutProduct"
    });

    // Save the admin notification
    const savedAdminNotification = await adminNotification.save();

    // If the notification is successfully saved, send a success message
    if (savedAdminNotification) {
        return res.status(200).json({ message: "Your request for product information has been sent to the administrator" });
    } else {
        return res.status(500).json({ message: "Error sending message to administrator" });
    }
};
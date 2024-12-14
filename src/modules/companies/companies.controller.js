//backend/src/modules/companies/companies.controller.js

import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import url from 'url';


import { asyncHandler } from "../../utils/errorHandling.js";
import User from "../../../DB/models/user.model.js";
import Company from "../../../DB/models/company.model.js";
import Review from "../../../DB/models/review.model.js";
import AlternativeProduct from "../../../DB/models/alternativeProduct.model.js";
import AdminNotification from "../../../DB/models/adminNotification.model.js";
import DeletionToken from "../../../DB/models/deletionToken.model.js";
import { validateUpdateCompanyName } from "./company.validation.js";
import { pagination } from "../../utils/pagination.js";
import { sendDeletionConfirmationEmail } from '../../utils/emailVerification.js';





/**-----------------------------------------------
 * @desc    Get Company Profile
 * @route   /api/companies/:companyId/profile
 * @method  GET
 * @access  public
 ------------------------------------------------*/
export const getCompanyProfile = asyncHandler(async (req, res) => {

    const { skip, limit } = pagination(req.query.page, req.query.limit);
    const company = await Company.findById(req.params.companyId)
        .skip(skip)
        .limit(limit)
        .select("-password")
        .populate("createdAlternativeProducts");

    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
});

/**-----------------------------------------------
 * @desc    Get All Companies 
 * @route   /api/companies
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getAllCompanies = asyncHandler(async (req, res) => {
    const { skip, limit } = pagination(req.query.page, req.query.limit);
    const companies = await Company.find()
        .skip(skip)
        .limit(limit)
        .select("-password")
    res.status(200).json(companies);
});

/**-----------------------------------------------
 * @desc    Get Companies Count
 * @route   /api/companies/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getCompaniesCount = asyncHandler(async (req, res) => {
    const count = await Company.countDocuments();
    res.status(200).json({ count });
});

/**-----------------------------------------------
 * @desc    Get Products Count for a Specific Company
 * @route   /api/companies/:companyId/products/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getProductsCountForCompany = asyncHandler(async (req, res) => {

    const companyId = req.params.companyId;
    const productCount = await AlternativeProduct.countDocuments({ createdBy: companyId });

    res.status(200).json({ count: productCount });
});

/**-----------------------------------------------
 * @desc    Profile Photo Upload
 * @route   /api/companies/:companyId/profile-photo-upload
 * @method  POST
 * @access  private (only logged in company)
 ------------------------------------------------*/
export const profilePhotoUpload = asyncHandler(async (req, res) => {

    // 1. Get the company from DB
    const company = await Company.findById(req.params.companyId);
    if (!company) {
        return res.status(404).json({ message: `Company not found with id: ${req.params.companyId}` });
    }

    // 2. Upload the image to Cloudinary
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/companies/${req.params.companyId}`,
        });

        // 3. Delete the old profile photo if it exists
        if (company.profilePhoto?.publicId) {
            await cloudinary.uploader.destroy(company.profilePhoto.publicId);
        }

        // 4. Update the company's profile photo in the DB
        company.profilePhoto = {
            url: secure_url,
            publicId: public_id,
        };
        await company.save();

        // 5. Remove image from the server
        fs.unlinkSync(req.file.path);

        // 6. Send response to client
        return res.status(200).json({
            message: "Your profile photo uploaded successfully",
            profilePhoto: { url: secure_url, publicId: public_id },
        });
    } else {
        return res.status(400).json({ message: "Image file is required" });
    }
});

/**-----------------------------------------------
 * @desc    Update Company Location
 * @route   /api/companies/:companyId/location
 * @method  PUT
 * @access  private (only company itself)
 ------------------------------------------------*/
export const updateCompanyLocation = asyncHandler(async (req, res) => {
    // Check if the company exists
    const company = await Company.findById(req.params.companyId);
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }

    // Check if the request includes a location change
    if (req.body.location) {
        // Check if currentPassword is provided
        if (!req.body.currentPassword) {
            return res.status(400).json({ message: "Current password must be provided to change location" });
        }
        // Verify the current password
        const validPassword = await bcrypt.compare(req.body.currentPassword, company.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Incorrect password" });
        }
        // If the password is correct, proceed with the location change
        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.companyId,
            {
                $set: {
                    location: req.body.location
                },
            },
            { new: true }
        ).select("-password -confirmEmail");

        // If the update is successful, send a success message
        if (updatedCompany) {
            return res.status(200).json({ message: "Company location updated successfully", updatedCompany });
        } else {
            return res.status(500).json({ message: "Error updating company location" });
        }
    } else {
        return res.status(400).json({ message: "Location is required to update" });
    }
});

/**-----------------------------------------------
 * @desc    Update Company Name (Notification)
 * @route   /api/companies/:companyId/name
 * @method  PUT
 * @access  private (only company itself)
 ------------------------------------------------*/
export const updateCompanyName = asyncHandler(async (req, res) => {
    // Validate the request body
    const { error } = validateUpdateCompanyName(req.body.newCompanyNameEn, req.body.newCompanyNameAr);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the new company name already exists in the database
    const existingCompany = await Company.findOne({
        $or: [
            { companyNameEn: req.body.newCompanyNameEn },
            { companyNameAr: req.body.newCompanyNameAr }
        ]
    });
    if (existingCompany) {
        return res.status(400).json({ message: "Company name already exists" });
    }

    // Check if the company exists
    const company = await Company.findById(req.params.companyId);
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }

    // Check if the request includes a name change
    if (req.body.newCompanyNameEn && req.body.newCompanyNameAr) {
        // Check if currentPassword is provided
        if (!req.body.currentPassword) {
            return res.status(400).json({ message: "Current password must be provided to change company name" });
        }
        // Verify the current password
        const validPassword = await bcrypt.compare(req.body.currentPassword, company.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Incorrect password" });
        }
        // If the password is correct, proceed with the name change

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.companyId,
            {
                $set: {
                    newCompanyNameEn: req.body.newCompanyNameEn,
                    newCompanyNameAr: req.body.newCompanyNameAr,
                    isNameChangeApproved: false
                },
            },
            { new: true }
        ).select("-password -confirmEmail");

        // If the update is successful, send a success message
        if (updatedCompany) {
            // Create a new admin notification
            const adminNotification = new AdminNotification({
                companyId: company._id,
                messageInformation: `The company ${company.companyNameEn} / ${company.companyNameAr} wants to change its name to ${req.body.newCompanyNameEn} / ${req.body.newCompanyNameAr}.`,
                section: 'nameChangeRequests'
            });
            await adminNotification.save();

            return res.status(200).json({ message: "Your request has been successfully sent to the administrator. Wait for his approval and stay up to date with your notifications.", updatedCompany });
        } else {
            return res.status(500).json({ message: "Error updating company name" });
        }
    } else {
        return res.status(400).json({ message: "Company name is required to update" });
    }
});

/**-----------------------------------------------
 * @desc    Send Message to Admin (Notification)
 * @route   /api/companies/:companyId/messages
 * @method  POST
 * @access  private (only company itself)
 ------------------------------------------------*/
export const sendMessageToAdmin = asyncHandler(async (req, res) => {
    // Check if the company exists
    const company = await Company.findById(req.params.companyId);
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }

    // Check if title and message are provided
    if (!req.body.title || !req.body.message) {
        return res.status(400).json({ message: "Title and message must be provided" });
    }


    // Create a new admin notification
    const adminNotification = new AdminNotification({
        companyId: company._id,
        messageInformation: `A message was sent from the company "${company.companyNameEn}" with the subject "${req.body.title.trim()}"`,
        message: req.body.message,
        title: req.body.title,
        section: 'companyMessages'
    });

    // Save the admin notification
    const savedAdminNotification = await adminNotification.save();

    // If the notification is successfully saved, send a success message
    if (savedAdminNotification) {
        return res.status(200).json({ message: "Your message has been sent to the administrator, stay informed of your notifications" });
    } else {
        return res.status(500).json({ message: "Error sending message to administrator" });
    }
});

/**-----------------------------------------------
 * @desc    Request Delete Company (Account)
 * @route   /api/companies/:companyId/request-delete
 * @method  POST
 * @access  private (only admin or company itself)
 ------------------------------------------------*/
export const requestDeleteCompany = asyncHandler(async (req, res) => {
    // 1. Get the company from DB
    const company = await Company.findById(req.params.companyId);
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }

    // Extract the user's ID from the JWT
    const token = req.headers.authorization.split(' ')[1]; // Assuming the token is sent in the Authorization header
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Look up the user's email in the database
    let user;
    if (decodedToken.userType === 'admin') {
        user = await User.findById(userId);
    } else if (decodedToken.userType === 'company') {
        user = await Company.findById(userId);
    }
    const requestedByEmail = user.email;

    // 2. Send the deletion confirmation email
    await sendDeletionConfirmationEmail(company, requestedByEmail);

    // 3. Send a response to the client
    res.status(200).json({ message: "Deletion confirmation email has been sent" });
});

/**-----------------------------------------------
 * @desc    Confirm Delete Company (Account)
 * @route   /api/companies/:companyId/confirm-delete/:token
 * @method  POST
 * @access  private (only admin or company itself)
 ------------------------------------------------*/
export const confirmDeleteCompany = asyncHandler(async (req, res) => {

    let redirectURL;

    let company = await Company.findById(req.params.companyId);

    if (!company) {
        redirectURL = url.resolve(process.env.FEURL, '/?message=Invalid link');
        res.redirect(redirectURL);
    }

    let deletionToken = await DeletionToken.findOne({ companyId: company._id });
    let requestedByEmail = deletionToken.requestedByEmail;
    let requestedBy = await User.findOne({ email: requestedByEmail });



    deletionToken = await DeletionToken.findOneAndDelete({
        companyId: company._id,
        token: req.params.token,
    });

    if (!deletionToken) {
        redirectURL = url.resolve(process.env.FEURL, '/?message=Invalid link or email message has expired (5 minutes),Send the deletion request again');
        res.redirect(redirectURL);
    }

    // Delete the company 
    await Company.findByIdAndDelete(company._id);

    const products = await AlternativeProduct.find({ createdBy: company._id });
    const productIds = products.map(product => product._id);
    await AlternativeProduct.deleteMany({ createdBy: company._id });
    await Review.deleteMany({ alternativeProductId: { $in: productIds } });


    if (requestedBy && requestedBy.isAdmin == "true") {

        redirectURL = url.resolve(process.env.FEURL, '/admin/companiesManagement/?message=Company profile deleted successfully');
        return res.redirect(redirectURL);

    }
    else {
        redirectURL = url.resolve(process.env.FEURL, '/?message=Company profile deleted successfully');
        res.redirect(redirectURL);

    }



    //res.status(200).json({ message: "Company profile deleted successfully" });

    /*
        const redirectURL = url.resolve(process.env.FEURL, '/');
        res.status(200).redirect(redirectURL);
    */




});



//Search
export const searchCompanyProducts = async (req, res, next) => {
    let queryObj = { ...req.query };
    const excQuery = ["search", "sort"];
    excQuery.map((ele) => {
        delete queryObj[ele];
    });
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(
        /\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g,
        (match) => `$${match}`
    );
    queryObj = JSON.parse(queryObj);
    const companyId = req.user.id;
    queryObj.createdBy = companyId;
    const searchValue = req.query.search.trim();
    const queryConditions = {
        ...queryObj,
        $or: [
            { nameAr: { $regex: searchValue, $options: "i" } },
            { nameEn: { $regex: searchValue, $options: "i" } },
        ]
    };
    const mongooseQuery = AlternativeProduct.find(queryConditions);
    const products = await mongooseQuery.sort(
        req.query.sort?.replaceAll(",", " ")
    );
    return res.status(200).json({ message: "success",details: "تم البحث بنجاح", products });
};
export const searchCompanyByEmail = async (req, res, next) => {
    let queryObj = { ...req.query };
    const excQuery = ["search", "sort"];
    excQuery.map((ele) => {
        delete queryObj[ele];
    });
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(
        /\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g,
        (match) => `$${match}`
    );
    queryObj = JSON.parse(queryObj);

    const searchValue = req.query.search.trim();
    const queryConditions = {
        ...queryObj,
        email: { $regex: "^" + searchValue + "$", $options: "i" }
    };
    const mongooseQuery = Company.find(queryConditions);
    const company = await mongooseQuery.sort(
        req.query.sort?.replaceAll(",", " ")
    );
    return res.status(200).json({ message: "success",details: "تم البحث بنجاح", company });
};
export const searchCompanyByUserName = async (req, res, next) => {
    let queryObj = { ...req.query };
    const excQuery = ["search", "sort"];
    excQuery.map((ele) => {
        delete queryObj[ele];
    });
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(
        /\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g,
        (match) => `$${match}`
    );
    queryObj = JSON.parse(queryObj);

    const searchValue = req.query.search.trim();
    const queryConditions = {
        ...queryObj,
        $or: [
            { companyNameAr: { $regex: searchValue, $options: "i" } },
            { companyNameEn: { $regex: searchValue, $options: "i" } },
        ]
    };

    const mongooseQuery = Company.find(queryConditions);
    const company = await mongooseQuery.sort(
        req.query.sort?.replaceAll(",", " ")
    );
    return res.status(200).json({ message: "success",details: "تم البحث بنجاح", company });
};
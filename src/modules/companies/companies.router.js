//backend/src/modules/companies/companies.router.js

import express from 'express';

import * as companiesController from './companies.controller.js';
import {
    verifyTokenAndAdmin, verifyTokenCompanyAndOnlyCompanyItself,
    verifyTokenCompanyItselfOrAdmin
} from '../../middlewares/verifyToken.js';
import validateObjectId from '../../middlewares/validateObjectId.js';

import { auth } from "../../middlewares/auth.js";
import { endPoint } from "./company.endpoint.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./company.validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import fileUpload, { fileValidation } from "../../utils/multer.js";

const router = express.Router();


// /api/companies/:companyId/profile 
router.route('/:companyId/profile')
    .get(validateObjectId("companyId"), companiesController.getCompanyProfile);

// /api/companies 
router.route('/')
    .get(verifyTokenAndAdmin, companiesController.getAllCompanies);

// /api/companies/count
router.route('/count')
    .get(verifyTokenAndAdmin, companiesController.getCompaniesCount);

// /api/companies/:companyId/products/count
router.route('/:companyId/products/count')
    .get(validateObjectId("companyId"), companiesController.getProductsCountForCompany);

// /api/companies/:companyId/profile-photo-upload 
router.route('/:companyId/profile-photo-upload')
    .post(
        validateObjectId("companyId"),
        verifyTokenCompanyAndOnlyCompanyItself,
        fileUpload(fileValidation.image).single("image"),
        companiesController.profilePhotoUpload);

// /api/companies/:companyId/location
router.route('/:companyId/location')
    .put(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companiesController.updateCompanyLocation);

// /api/companies/:companyId/name
router.route('/:companyId/name')
    .put(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companiesController.updateCompanyName);

// /api/companies/:companyId/messages
router.route('/:companyId/messages')
    .post(validateObjectId("companyId"), verifyTokenCompanyAndOnlyCompanyItself,
        companiesController.sendMessageToAdmin);

// /api/companies/:companyId/request-delete 
router.route('/:companyId/request-delete')
    .post(validateObjectId("companyId"), verifyTokenCompanyItselfOrAdmin,
        companiesController.requestDeleteCompany);

// /api/companies/:companyId/confirm-delete/:token 
router.route('/:companyId/confirm-delete/:token')
    .get(validateObjectId("companyId"), companiesController.confirmDeleteCompany);



//Search
router.get(
    "/searchCompanyByEmail",
    auth(endPoint.search),
    validation(validators.search),
    asyncHandler(companiesController.searchCompanyByEmail)
);
router.get(
    "/searchCompanyByUserName",
    auth(endPoint.search),
    validation(validators.search),
    asyncHandler(companiesController.searchCompanyByUserName)
);
router.get(
    "/searchCompanyProducts",
    auth(endPoint.searchInCompany),
    validation(validators.search),
    asyncHandler(companiesController.searchCompanyProducts)
);



export default router;

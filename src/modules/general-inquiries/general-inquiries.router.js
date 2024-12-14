//backend/src/modules/adminNotifications/general-inquiries.router.js

import express from 'express';
import {
    sendComplaintOrInquiry,
    provideProductInformation
} from './general-inquiries.controller.js';

const router = express.Router();



// /api/general-inquiries/complaints-inquiries
router
    .route("/complaints-inquiries")
    .post(sendComplaintOrInquiry);

// /api/general-inquiries/product-info-request
router
    .route("/product-info-request")
    .post(provideProductInformation);


export default router;

//backend/src/modules/passwords/passwords.router.js

import express from 'express';

import {
    updatePassword,
    sendResetPasswordLink,
    getResetPasswordLink,
    resetPassword,
} from './password.controller.js';
import validateObjectId from '../../middlewares/validateObjectId.js';
import { verifyTokenAccountHolder } from '../../middlewares/verifyToken.js';


const router = express.Router();


// /api/passwords/reset-link
router.post('/reset-link', sendResetPasswordLink);


// /api/passwords/update/:accountId 
router.put('/update/:accountId',
    validateObjectId("accountId"), verifyTokenAccountHolder, updatePassword);



// /api/passwords/reset/:accountId/:token
router
    .route('/reset/:accountId/:token')
    .get(validateObjectId("accountId"), getResetPasswordLink)
    .post(validateObjectId("accountId"), resetPassword);



export default router;

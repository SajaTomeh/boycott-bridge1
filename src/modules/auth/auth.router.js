//backend/src/modules/auth/auth.router.js

import express from 'express';

import { register, login, verifyAccount } from './auth.controller.js';
import validateObjectId from '../../middlewares/validateObjectId.js';


const router = express.Router();



// /api/auth/register
router.post('/register', register);

// /api/auth/login
router.post('/login', login);

// /api/auth/:accountId/verify-account/:token
router.get('/:accountId/verify-account/:token',
    validateObjectId("accountId"), verifyAccount);

export default router;

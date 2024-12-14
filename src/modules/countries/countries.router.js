//backend/src/modules/countries/countries.router.js

import express from 'express';

import {
    getAllCountriesReplaceIsrael,
    getAllCountriesExcludePalestine
} from './countries.controller.js';
import {
    verifyTokenAndAdmin,
    verifyCompanyToken
} from "../../middlewares/verifyToken.js";


const router = express.Router();


//[Alternative Products]
// /api/countries/Replace/Israel 
router.get('/Replace/Israel', verifyCompanyToken, getAllCountriesReplaceIsrael);


//[Supportive Products]
// /api/countries/exclude/palestine 
router.get('/exclude/palestine', verifyTokenAndAdmin, getAllCountriesExcludePalestine);



export default router;

//backend/src/modules/categories/categories.router.js

import express from 'express';

import * as categoriesController from './categories.controller.js';
import { verifyTokenAndAdmin } from '../../middlewares/verifyToken.js';
import validateObjectId from '../../middlewares/validateObjectId.js';

import { validation } from "../../middlewares/validation.js";
import * as validators from "./category.validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { auth } from "../../middlewares/auth.js";
import { endPoint } from "./category.endpoint.js";


//sub
import alternativeProductRouter from "../alternativeProducts/alternativeProducts.router.js";
import supportiveProductRouter from "../supportiveProducts/supportiveProducts.router.js";
import subcategoryRouter from "../subcategories/subcategories.router.js";


const router = express.Router();

// /api/categories
router
    .route('/')
    .post(verifyTokenAndAdmin, categoriesController.createCategory)
    .get(categoriesController.getAllCategories);


// /api/categories/count
router.route('/count')
    .get(verifyTokenAndAdmin, categoriesController.getCategoriesCount);


router.get(
    "/searchCategory",
    auth(endPoint.search),
    validation(validators.search),
    asyncHandler(categoriesController.searchCategory)
);


// /api/categories/:categoryId  
router
    .route('/:categoryId')
    .get(validateObjectId("categoryId"), categoriesController.getSpecificCategory)
    .put(validateObjectId("categoryId"), verifyTokenAndAdmin, categoriesController.updateCategory)
    .delete(validateObjectId("categoryId"), verifyTokenAndAdmin, categoriesController.deleteCategory);



//Search
router.get(
    "/:categoryId/searchCategoryAlternativeProducts",
    validation(validators.searchCategory),
    asyncHandler(categoriesController.searchCategoryAlternativeProducts)
);
router.get(
    "/:categoryId/searchCategorySupportiveProducts",
    validation(validators.searchCategory),
    asyncHandler(categoriesController.searchCategorySupportiveProducts)
);




//sub 
router.use("/:categoryId/subcategory", subcategoryRouter);
router.use("/:categoryId/alternativeProducts", alternativeProductRouter);
router.use(
    "/:categoryId/subcategories/:subcategoryId/alternativeProducts",
    alternativeProductRouter
);
router.use("/:categoryId/supportiveProducts", supportiveProductRouter);
router.use(
    "/:categoryId/subcategories/:subcategoryId/supportiveProducts",
    supportiveProductRouter
);


export default router;

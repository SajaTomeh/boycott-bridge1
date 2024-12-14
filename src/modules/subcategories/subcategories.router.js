import { Router } from "express";
import { asyncHandler } from "../../utils/errorHandling.js";
import { auth } from "../../middlewares/auth.js";
import { endPoint } from "./subcategory.endpoint.js";
import * as subcategoriesController from "./subcategories.controller.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./subcategory.validation.js";
const router = Router({ mergeParams: true });

router.get(
  "/allSubcategories",
  auth(endPoint.getAll),
  asyncHandler(subcategoriesController.getAllSubCategories)
);
router.get("/countSubcategories",auth(endPoint.count),asyncHandler(subcategoriesController.getCountSubcategories));

router.get(
  "/searchSubCategory",
  auth(endPoint.search),
  validation(validators.search),
  asyncHandler(subcategoriesController.searchSubCategory)
);
router.get(
  "/:subcategoryId/searchSubCategoryAlternativeProducts",
  validation(validators.searchSubcategory),
  asyncHandler(subcategoriesController.searchSubCategoryAlternativeProducts)
);
router.get(
  "/:subcategoryId/searchSubCategorySupportiveProducts",
  validation(validators.searchSubcategory),
  asyncHandler(subcategoriesController.searchSubCategorySupportiveProducts)
);
router.post(
  "/",
  auth(endPoint.create),
  validation(validators.createSubcategory),
  asyncHandler(subcategoriesController.createSubcategory)
);
router.put(
  "/:id",
  auth(endPoint.update),
  validation(validators.updateSubcategory),
  asyncHandler(subcategoriesController.updateSubcategory)
);
router.delete(
  "/:subcategoryId",
  auth(endPoint.delete),
  validation(validators.deleteSubcategory),
  asyncHandler(subcategoriesController.deleteSubcategory)
);

export default router;

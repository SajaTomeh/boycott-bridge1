import { Router } from "express";
import * as supportiveProductController from "./supportiveProducts.controller.js";
import { endPoint } from "./supportiveProducts.endPoint.js";
import { auth } from "../../middlewares/auth.js";
import fileUpload, { fileValidation } from "../../utils/multer.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./supportiveProduct.validation.js";
const router = Router({ mergeParams: true });
router.get(
  "/",
  asyncHandler(supportiveProductController.getSupportiveProducts)
);
router.get(
  "/countSupportiveProducts",asyncHandler(supportiveProductController.getCountSupportiveProducts));
router.get(
  "/supportivesByCategory",
  validation(validators.getSupportiveProduct),
  asyncHandler(supportiveProductController.getCategoryWithSupportives )
);
router.get(
  "/supportivesBySubcategory",
  validation(validators.getSupportiveProduct),
  asyncHandler(supportiveProductController.getSubcategoryWithSupportives )
);
router.get(
  "/searchProducts",
  validation(validators.search),
  asyncHandler(supportiveProductController.searchSupportiveProducts)
);
router.get(
  "/:specificId",
  validation(validators.getSpecificSupportiveProduct),
  asyncHandler(supportiveProductController.getSpecificSupportiveProduct)
);
router.post(
  "/",
  auth(endPoint.create),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.createSupportiveProduct),
  asyncHandler(supportiveProductController.createSupportiveProduct)
);
router.put(
  "/:id",
  auth(endPoint.update),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.updateSupportiveProduct),
  asyncHandler(supportiveProductController.updateSupportiveProduct)
);
router.delete(
  "/:productId",
  auth(endPoint.delete),
  validation(validators.deleteSupportiveProduct),
  asyncHandler(supportiveProductController.deleteSupportiveProduct)
);
export default router;

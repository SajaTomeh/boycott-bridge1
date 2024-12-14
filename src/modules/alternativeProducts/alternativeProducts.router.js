import { Router } from "express";
import * as alternativeProductController from "./alternativeProducts.controller.js";
import { endPoint } from "./alternativeProducts.endPoint.js";
import { auth } from "../../middlewares/auth.js";
import fileUpload, { fileValidation } from "../../utils/multer.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./alternativeProduct.validation.js";
import reviewRouter from "../reviews/reviews.router.js";

const router = Router({ mergeParams: true });
router.use("/:productId/review", reviewRouter);
router.get(
  "/",
  asyncHandler(alternativeProductController.getAllAlternativeProducts)
);
router.get("/countAlternativeProducts",asyncHandler(alternativeProductController.getCountAlternativeProducts));

router.get(
  "/alternativesByCategory",
  validation(validators.getAlternativeProduct),
  asyncHandler(
    alternativeProductController.getCategoryWithAlternatives
  )
);
router.get(
  "/alternativesBySubcategory",
  validation(validators.getAlternativeProduct),
  asyncHandler(
    alternativeProductController.getSubcategoryWithAlternatives
  )
);
router.get(
  "/searchProducts",
  validation(validators.search),
  asyncHandler(alternativeProductController.searchAlternativeProducts)
);
router.get(
  "/:specificId",
  validation(validators.getSpecificAlternativeProduct),
  asyncHandler(alternativeProductController.getSpecificAlternativeProduct)
);
router.post(
  "/",
  auth(endPoint.create),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.createAlternativeProduct),
  asyncHandler(alternativeProductController.createAlternativeProduct)
);
router.put(
  "/:id",
  auth(endPoint.update),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.updateAlternativeProduct),
  asyncHandler(alternativeProductController.updateAlternativeProduct)
);
router.delete(
  "/:productId",
  auth(endPoint.delete),
  validation(validators.deleteAlternativeProduct),
  asyncHandler(alternativeProductController.deleteAlternativeProduct)
);

export default router;

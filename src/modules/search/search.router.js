import { Router } from "express";
import * as searchController from "./search.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./search.validation.js";
const router = Router();
router.get(
    "/",
    validation(validators.search),
    asyncHandler(searchController.searchProducts)
  );
export default router;

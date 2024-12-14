import { Router } from "express";
import * as usersController from "./users.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { endPoint } from "./user.endPoint.js";
import { auth } from "../../middlewares/auth.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./user.validation.js";

const router = Router();
router.get("/", auth(endPoint.getAll), asyncHandler(usersController.getUsers));
router.get("/countUsers", auth(endPoint.count),asyncHandler(usersController.getCountUsers));
router.get(
  "/searchUserName",
  auth(endPoint.search),
  validation(validators.searchUser),
  asyncHandler(usersController.searchUserName)
);
router.patch(
  "/:id",
  auth(endPoint.update),
  validation(validators.updateUser),
  asyncHandler(usersController.updateUsername)
);
router.delete(
  "/:userId",
  auth(endPoint.delete),
  validation(validators.deleteUser),
  asyncHandler(usersController.deleteUser)
);

export default router;

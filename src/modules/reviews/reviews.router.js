//backend/src/modules/reviews/reviews.router.js

import express from "express"

import {
    createRating,
    createComment,
    getAllComments,
    deleteComment,
    updateComment,
    searchComment
} from "./reviews.controller.js";
import {
    verifyTokenAndOnlyUser,
    verifyTokenAndAdmin,
    verifyTokenUserOrProductOwner,
    verifyTokenAdminOrCommentOwner,
    verifyTokenCommentOwner
} from "../../middlewares/verifyToken.js";
import validateObjectId from "../../middlewares/validateObjectId.js";

import { auth } from "../../middlewares/auth.js";
import { endPoint } from "./review.endPoint.js";
import { validation } from "../../middlewares/validation.js";
import * as validators from "./review.validation.js";
import { asyncHandler } from '../../utils/errorHandling.js';

const router = express.Router();



// /api/reviews/ratings/:productId
router
    .route("/ratings/:productId")
    .post(validateObjectId("productId"), verifyTokenAndOnlyUser, createRating)

// /api/reviews/comments/:productId
router
    .route("/comments/:productId")
    .post(validateObjectId("productId"), verifyTokenUserOrProductOwner, createComment)

// /api/reviews/comments
router
    .route("/comments")
    .get(verifyTokenAndAdmin, getAllComments);

// /api/reviews/comments/:commentId
router.route("/comments/:commentId")
    .delete(validateObjectId("commentId"), verifyTokenAdminOrCommentOwner, deleteComment)
    .put(validateObjectId("commentId"), verifyTokenCommentOwner, updateComment);


//Search
router.get(
    "/searchComment",
    auth(endPoint.search),
    validation(validators.search),
    asyncHandler(searchComment)
);

export default router;

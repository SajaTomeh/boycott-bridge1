//backend/src/modules/reviews/reviews.controller.js

import { asyncHandler } from "../../utils/errorHandling.js";
import AlternativeProduct from "../../../DB/models/alternativeProduct.model.js";
import User from '../../../DB/models/user.model.js';
import Company from '../../../DB/models/company.model.js';
import Review from "../../../DB/models/review.model.js";
import { pagination } from "./../../utils/pagination.js";
import {
    validateCreateRating,
    validateCreateComment,
    validateUpdateComment
} from './review.validation.js';



/**-----------------------------------------------
 * @desc    Create Rating
 * @route   /api/reviews/ratings/:productId
 * @method  POST
 * @access  private (only user)
 ------------------------------------------------*/
export const createRating = asyncHandler(async (req, res) => {
    const { error } = validateCreateRating(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { productId } = req.params;
    const { rating } = req.body;

    const product = await AlternativeProduct.findById(productId);
    if (!product) {
        return res.status(400).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user.id);

    // Check if the user has already rated this product
    let existingRating = await Review.findOne({
        alternativeProductId: productId,
        userId: user.id,
        rating: { $exists: true }
    });

    if (existingRating) {
        // Update the existing rating
        const oldRating = existingRating.rating;
        existingRating.rating = rating;
        await existingRating.save();

        // Recalculate the average rating
        const allRatings = await Review.find({
            alternativeProductId: productId, rating: { $exists: true }
        });
        const totalRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = totalRatings / allRatings.length;

        // Convert the average rating to the smallest integer
        product.rating = Math.floor(newAverageRating);
        await product.save();

        return res.status(200).json({ message: "Rating updated successfully", existingRating });
    } else {
        // Create a new rating
        let ratingData = {
            alternativeProductId: productId,
            username: user.username,
            rating: rating,
            userId: user.id
        };

        const newRating = await Review.create(ratingData);
        if (!newRating) {
            return res.status(400).json({ message: "Error while adding rating" });
        }

        // Recalculate the average rating
        const allRatings = await Review.find({
            alternativeProductId: productId, rating: { $exists: true }
        });
        const totalRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = totalRatings / allRatings.length;

        // Convert the average rating to the smallest integer
        product.rating = Math.floor(newAverageRating);
        await product.save();

        return res.status(201).json({ message: "Rating added successfully", newRating });
    }
});

/**-----------------------------------------------
 * @desc    Create Comment
 * @route   /api/reviews/comments/:productId
 * @method  POST
 * @access  private (only user & company comment owner)
 ------------------------------------------------*/
export const createComment = asyncHandler(async (req, res) => {
    const { error } = validateCreateComment(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { productId } = req.params;
    const { comment } = req.body;

    const product = await AlternativeProduct.findById(productId);
    if (!product) {
        return res.status(400).json({ message: "can not comment on this product" });
    }

    let commentData = {
        alternativeProductId: productId
    };


    if (req.user) {
        const user = await User.findById(req.user.id);
        commentData.userId = user.id;
        commentData.username = user.username;
    }
    else if (req.company) {
        const company = await Company.findById(req.company.id);
        commentData.companyId = company.id;
        commentData.username = company.companyNameEn + "|" + company.companyNameAr;
    }

    if (comment) {
        commentData.comment = comment;

    }




    const newComment = await Review.create(commentData);
    if (!newComment) {
        return res.status(400).json({ message: "error while adding comment" });
    }

    return res.status(201).json({ message: "success", newComment });
});

/**-----------------------------------------------
 * @desc    Get All Comments
 * @route   /api/reviews/comments
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getAllComments = asyncHandler(async (req, res) => {
    const { skip, limit } = pagination(req.query.page, req.query.limit);
    const comments = await Review
        .find({ comment: { $exists: true, $ne: null } })
        .skip(skip)
        .limit(limit)

    return res.status(200).json(comments);
});

/**-----------------------------------------------
 * @desc    Update Comment
 * @route   /api/reviews/:commentId
 * @method  PUT
 * @access  private (only owner of the comment)
 ------------------------------------------------*/
export const updateComment = asyncHandler(async (req, res) => {
    const { error } = validateUpdateComment(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const comment = await Review.findById(req.params.commentId);
    if (!comment) {
        return res.status(404).json({ message: "invalid comment id" });
    }


    const updatedComment = await Review.findByIdAndUpdate(req.params.commentId, {
        $set: {
            comment: req.body.comment,
        }
    }, { new: true });

    return res.status(200).json({ message: "success", updatedComment });
});

/**-----------------------------------------------
 * @desc    Delete Comment
 * @route   /api/reviews/:commentId
 * @method  DELETE
 * @access  private (only admin or owner of the comment)
 ------------------------------------------------*/
export const deleteComment = asyncHandler(async (req, res) => {

    const deletedComment = await Review.findByIdAndDelete(req.params.commentId);
    if (!deletedComment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    return res.status(200).json({ message: "Comment has been deleted" });

});


//Search
export const searchComment = async (req, res, next) => {
    let queryObj = { ...req.query };
    const excQuery = ["search", "sort"];
    excQuery.map((ele) => {
        delete queryObj[ele];
    });
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(
        /\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g,
        (match) => `$${match}`
    );
    queryObj = JSON.parse(queryObj);
    const searchValue = req.query.search.trim();
    const queryConditions = {
        ...queryObj,
        comment: { $regex: searchValue, $options: "i" }
    };
    const mongooseQuery = Review.find(queryConditions);
    const comment = await mongooseQuery.sort(
        req.query.sort?.replaceAll(",", " ")
    );
    return res.status(200).json({ message: "success",details: "تم البحث بنجاح", comment });
};
//backend/DB/models/review.model.js


import mongoose, { Schema, Types } from 'mongoose';

const reviewSchema = new Schema({

    userId: {
        type: Types.ObjectId,
        ref: "User",
    },
    companyId: {
        type: Types.ObjectId,
        ref: "Company",
    },
    alternativeProductId: {
        type: Types.ObjectId,
        ref: "AlternativeProduct",
        required: true,
    },
    comment: {
        type: String,
    },
    username: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Review', reviewSchema);

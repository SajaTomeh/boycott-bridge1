//backend/DB/models/category.model.js

import mongoose, { Schema, Types } from 'mongoose';

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

categorySchema.virtual("subcategory", {
    ref: 'Subcategory',
    localField: '_id',
    foreignField: 'categoryId'
});

export default mongoose.model('Category', categorySchema);

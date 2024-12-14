import mongoose, { Schema, Types, model } from "mongoose";

const supportiveProductSchema = new Schema(
  {
    nameAr: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameEn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyNameAr: {
      type: String,
      required: true,
      trim: true,
    },
    companyNameEn: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory" },
    categoryName:{
      type: String,
    },
    subcategoryName:{
      type: String,
    },
    countryOfOrigin: {
      type: String,
      required: true,
    },
    reasonForBoycott: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const supportiveProductModel =
  mongoose.model.SupportiveProduct ||
  model("Supportive-Product", supportiveProductSchema);
export default supportiveProductModel;

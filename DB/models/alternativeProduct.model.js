import mongoose, { Schema, Types, model } from "mongoose";

const alternativeProductSchema = new Schema(
  {
    nameAr: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      min: 2,
      max: 200,
    },
    nameEn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      min: 2,
      max: 200,
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
    pointsOfSale: [
      {
        type: String,
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "Company",
    },
    companyNameAr:{
      type: String,
    },
    companyNameEn:{
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  }
);
alternativeProductSchema.virtual("reviews",{
  ref:'Review',
  localField:'_id',
  foreignField:'alternativeProductId'
});
const alternativeProductModel =
  mongoose.model.AlternativeProduct || model("Alternative-Product", alternativeProductSchema);
export default alternativeProductModel;

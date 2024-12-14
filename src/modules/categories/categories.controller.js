//backend/src/modules/categories/categories.controller.js

import { asyncHandler } from "../../utils/errorHandling.js";
import Category from '../../../DB/models/category.model.js';
import AlternativeProduct from '../../../DB/models/alternativeProduct.model.js';
import SupportiveProduct from '../../../DB/models/supportiveProduct.model.js';
import Subcategory from "../../../DB/models/subcategory.model.js";
import { validateCreateCategory, validateUpdateCategory } from './category.validation.js';
import { pagination } from '../../utils/pagination.js';




/**-----------------------------------------------
 * @desc    Create New Category
 * @route   /api/categories
 * @method  POST
 * @access  private (only admin)
 ------------------------------------------------*/
export const createCategory = asyncHandler(async (req, res) => {
    const { error } = validateCreateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const name = req.body.name;
    if (await Category.findOne({ name })) {
        return res.status(409).json({ message: "Category name already exists" });
    }

    const category = await Category.create({
        name,
        createdBy: req.user.id,
        updatedBy: req.user.id,
    });

    res.status(201).json(category);
});

/**-----------------------------------------------
 * @desc    Get Specific Category
 * @route   /api/categories/:categoryId
 * @method  GET
 * @access  public
 ------------------------------------------------*/
export const getSpecificCategory = asyncHandler(async (req, res) => {

    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
        return res.status(404).json({ message: "category not found" });
    }
    return res.status(200).json({ category });
});

/**-----------------------------------------------
 * @desc    Get All Categories
 * @route   /api/categories
 * @method  GET
 * @access  public
 ------------------------------------------------*/
export const getAllCategories = asyncHandler(async (req, res) => {
    const { skip, limit } = pagination(req.query.page, req.query.limit);
    const categories = await Category
        .find()
        .skip(skip)
        .limit(limit)
        .populate("subcategory");
    res.status(200).json(categories);
});

/**-----------------------------------------------
 * @desc    Get Categories Count
 * @route   /api/Categories/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
export const getCategoriesCount = asyncHandler(async (req, res) => {
    const count = await Category.countDocuments();
    res.status(200).json({ count });
});

/**-----------------------------------------------
 * @desc    Update Category
 * @route   /api/categories/:categoryId
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
export const updateCategory = asyncHandler(async (req, res) => {
    const { error } = validateUpdateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const category = await Category.findById(req.params.categoryId);
    if (!category) {
        return res.status(404).json({ message: `invalid category` });
    }

    if (req.body.name) {
        if (
            await Category
                .findOne({ name: req.body.name, _id: { $ne: category._id } })
                .select("name")
        ) {
            return res.status(409).json({ message: `category ${req.body.name} already exists` });
        }
        category.name = req.body.name;
    }

    category.updatedBy = req.user.id;
    await category.save();

    // Additional operations to update alternativeProductModel and supportiveProductModel
    await AlternativeProduct.updateMany({ categoryId: req.params.categoryId }, { categoryName: req.body.name });
    await SupportiveProduct.updateMany({ categoryId: req.params.categoryId }, { categoryName: req.body.name });

    return res.status(200).json({ message: "success", category });
});

/**-----------------------------------------------
 * @desc    Delete Category
 * @route   /api/categories/:categoryId
 * @method  DELETE
 * @access  private (only admin)
 ------------------------------------------------*/
export const deleteCategory = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.categoryId);
    if (!category) {
        return res.status(404).json({ message: "category not found" });
    }

    // Check for associated alternative products
    const alternativeProducts = await AlternativeProduct.find({ categoryId: req.params.categoryId });
    if (alternativeProducts.length > 0) {
        return res.status(400).json({ message: "Category cannot be deleted because it has associated alternative products" });
    }

    // Check for associated supportive products
    const supportiveProducts = await SupportiveProduct.find({ categoryId: req.params.categoryId });
    if (supportiveProducts.length > 0) {
        return res.status(400).json({ message: "Category cannot be deleted because it has associated supportive products" });
    }

    // Check for associated subcategories
    const subCategories = await Subcategory.find({ categoryId: req.params.categoryId });
    if (subCategories.length > 0) {
        return res.status(400).json({ message: "Category cannot be deleted because it has associated subcategories" });
    }

    // If there are no associations, delete the category
    await Category.findByIdAndDelete(req.params.categoryId);

    res.status(200).json({
        message: "category has been deleted successfully",
        categoryId: category._id,
    });
});




//Search
export const searchCategory = async (req, res, next) => {
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
        name: { $regex: searchValue, $options: "i" }
    };
    const mongooseQuery = Category.find(queryConditions);

    const category = await mongooseQuery.sort(
        req.query.sort?.replaceAll(",", " ")
    );
    return res.status(200).json({ message: "success",details: "تم البحث بنجاح", category });
};
export const searchCategoryAlternativeProducts = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) {
        return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
    }
    const subCategories = await Subcategory.find({ categoryId });
    if (subCategories.length > 0) {
        return next(
            new Error(
                "الصنف الرئيسي يحتوي على أصناف فرعية، لا يمكن البحث مباشرة في هذا الصنف",
                { cause: 400 }
            )
        );
    }

    let queryObj = { ...req.query };
    const excQuery = ["search", "sort"];
    excQuery.forEach((ele) => {
        delete queryObj[ele];
    });

    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const searchValue = req.query.search.trim();
    const queryConditions = {
        ...queryObj,
        categoryId,
        $or: [
            { nameAr: { $regex: searchValue, $options: "i" } },
            { nameEn: { $regex: searchValue, $options: "i" } },
            { companyNameAr: { $regex: searchValue, $options: "i" } },
            { companyNameEn: { $regex: searchValue, $options: "i" } },
        ]
    };

    const mongooseQuery = AlternativeProduct.find(queryConditions);
    const Products = await mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));
    return res.status(200).json({ message: "success", details: "تم البحث بنجاح", Products });
};
export const searchCategorySupportiveProducts = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) {
        return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
    }
    const subCategories = await Subcategory.find({ categoryId });
    if (subCategories.length > 0) {
        return next(
            new Error(
                "الصنف الرئيسي يحتوي على أصناف فرعية، لا يمكن البحث مباشرة في هذا الصنف",
                { cause: 400 }
            )
        );
    }

    let queryObj = { ...req.query };
    const excQuery = ["search", "sort"];
    excQuery.forEach((ele) => {
        delete queryObj[ele];
    });

    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const searchValue = req.query.search.trim();

    const queryConditions = {
        ...queryObj,
        categoryId,
        $or: [
            { nameAr: { $regex: searchValue, $options: "i" } },
            { nameEn: { $regex: searchValue, $options: "i" } },
            { companyNameAr: { $regex: searchValue, $options: "i" } },
            { companyNameEn: { $regex: searchValue, $options: "i" } },
        ]
    };

    const mongooseQuery = SupportiveProduct.find(queryConditions);

    const Products = await mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));
    return res.status(200).json({ message: "success",details: "تم البحث بنجاح", Products });
};



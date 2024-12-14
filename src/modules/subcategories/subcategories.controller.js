import categoryModel from "../../../DB/models/category.model.js";
import subcategoryModel from "../../../DB/models/subcategory.model.js";
import alternativeProductModel from "../../../DB/models/alternativeProduct.model.js";
import supportiveProductModel from "../../../DB/models/supportiveProduct.model.js";
import { pagination } from "../../utils/pagination.js";


export const createSubcategory = async (req, res, next) => {
  const { name, categoryId } = req.body;
  if (await subcategoryModel.findOne({ name })) {
    return next(new Error(" الصنف الفرعي موجود بالفعل", { cause: 409 }));
  }
  if (!(await categoryModel.findById(categoryId))) {
    return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
  }
  const alternativeProducts = await alternativeProductModel.findOne({ categoryId,subcategoryId: { $exists: false } });
  const supportiveProducts = await supportiveProductModel.findOne({ categoryId,subcategoryId: { $exists: false } });
  if (alternativeProducts || supportiveProducts) {
    return next(new Error(" لا يمكن إضافة صنف فرعي إلى صنف رئيسي يحتوي بالفعل على منتجات بديلة أو داعمة", { cause: 400 }));

  }
  const subcategory = await subcategoryModel.create({
    name,
    categoryId,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
  return res.status(201).json({ message: "success",details:"تم إنشاء الصنف الفرعي بنجاح", subcategory });

};

export const getAllSubCategories = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const subCategories = await subcategoryModel.find().skip(skip).limit(limit).populate({ path: "categoryId" });;
  if(!subCategories){
    return next(new Error(" لم يتم العثور على أصناف فرعية", { cause: 404 }));
  }
  return res.status(200).json({ message: "success",details:"تم الحصول على الأصناف الفرعية بنجاح",subCategories});
};
export const getCountSubcategories = async (req, res) => {
  const subcategoriesCount = await subcategoryModel.countDocuments();
  res.status(200).json({message:"success",details:"تم الحصول على عدد الأصناف الفرعية بنجاح",subcategoriesCount});
};

export const deleteSubcategory = async (req, res, next) => {
  const { subcategoryId } = req.params;
    const subcategory = await subcategoryModel.findById(subcategoryId);
    if (!subcategory) {
      return next(new Error(" الصنف الفرعي غير موجود", { cause: 404 }));
    }

    const alternativeProducts = await alternativeProductModel.findOne({ subcategoryId });
    const supportiveProducts = await supportiveProductModel.findOne({ subcategoryId });

    if(alternativeProducts && supportiveProducts){
      return next(new Error(" لا يمكن حذف الصنف الفرعي لأنه يحتوي على منتجات بديلة وداعمة", { cause: 400 }));
    }
    else if (alternativeProducts) {
      return next(new Error(" لا يمكن حذف الصنف الفرعي لأنه يحتوي على منتجات بديلة", { cause: 400 }));
    }
    else if (supportiveProducts) {
      return next(new Error(" لا يمكن حذف الصنف الفرعي لأنه يحتوي على منتجات داعمة", { cause: 400 }));
    }
      await subcategoryModel.findByIdAndDelete(subcategoryId);
      return res.status(200).json({
        message: "success",
        details: "تم حذف الصنف الفرعي بنجاح"
      });
      
    
};

export const updateSubcategory = async (req, res, next) => { 
  const subcategory = await subcategoryModel.findById(req.params.id);
  if (!subcategory) {
    return next(
      new Error(" الصنف الفرعي غير موجود", { cause: 404 })
    );
  }
  if (req.body.name) {
    if (
      await subcategoryModel
        .findOne({ name: req.body.name, _id: { $ne: subcategory._id } })
        .select("name")
    ) {
      return next(
        new Error(" الصنف الفرعي موجود بالفعل", {
          cause: 404,
        })
      );
    }
    subcategory.name = req.body.name;
  }
  const updateFields = {
    categoryName: subcategory.categoryName, 
    subcategoryName: subcategory.name 
  };
  if (req.body.categoryId){
    const checkCategory = await categoryModel.findById(req.body.categoryId);
    if (!checkCategory) {
      return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
    }

    const alternativeProducts = await alternativeProductModel.findOne({ categoryId:req.body.categoryId,subcategoryId: { $exists: false } });
  const supportiveProducts = await supportiveProductModel.findOne({ categoryId:req.body.categoryId,subcategoryId: { $exists: false } });
  if (alternativeProducts || supportiveProducts) {
    return next(new Error(" الصنف الرئيسي يحتوي على منتجات بديلة أو داعمة ولا يحتوي على أصناف فرعية", { cause: 400 }));  
  }

  subcategory.categoryId = req.body.categoryId;
  subcategory.categoryName = checkCategory.name;

  updateFields.categoryId = req.body.categoryId;
  updateFields.categoryName = checkCategory.name;
    
  }
  await alternativeProductModel.updateMany(
    { subcategoryId: subcategory._id },
    updateFields
  );

  await supportiveProductModel.updateMany(
    { subcategoryId: subcategory._id },
    updateFields
  );
  subcategory.updatedBy = req.user._id;
  await subcategory.save();
  return res.status(200).json({ message: "success",details:"تم تحديث الصنف الفرعي بنجاح" , subcategory });
};

export const searchSubCategory = async (req, res, next) => {
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
  const searchValue=req.query.search.trim();
  const queryConditions = {
    ...queryObj,
    name: { $regex: searchValue, $options: "i" }
  };
  const mongooseQuery = subcategoryModel.find(queryConditions);
  
  const subCategory = await mongooseQuery.sort(
    req.query.sort?.replaceAll(",", " ")
  );
  return res.status(200).json({ message: "success",details:"تم البحث بنجاح", subCategory });
};

export const searchSubCategoryAlternativeProducts = async (req, res, next) => {
  const subcategoryId = req.params.subcategoryId;
  const subcategoryDoc = await subcategoryModel.findById(subcategoryId);
  if (!subcategoryDoc) {
    return next(new Error(" الصنف الفرعي غير موجود", { cause: 404 }));
  }

  let queryObj = { ...req.query };
  const excQuery = ["search", "sort"];
  excQuery.forEach((ele) => {
    delete queryObj[ele];
  });

  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, (match) => `$${match}`);
  queryObj = JSON.parse(queryObj);

  const searchValue=req.query.search.trim();

  const queryConditions = {
    ...queryObj, subcategoryId,
    $or: [
      { nameAr: { $regex: searchValue, $options: "i" } },
      { nameEn: { $regex: searchValue, $options: "i" } },
      { companyNameAr: { $regex: searchValue, $options: "i" } },
      { companyNameEn: { $regex: searchValue, $options: "i" } },
    ]
  };  
  const mongooseQuery = alternativeProductModel.find(queryConditions);
  
  const Products = await mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));
  return res.status(200).json({ message: "success",details:"تم البحث بنجاح", Products });
};
export const searchSubCategorySupportiveProducts = async (req, res, next) => {
  const subcategoryId = req.params.subcategoryId;
  const subcategoryDoc = await subcategoryModel.findById(subcategoryId);
  if (!subcategoryDoc) {
    return next(new Error(" الصنف الفرعي غير موجود", { cause: 404 }));
  }

  let queryObj = { ...req.query };
  const excQuery = ["search", "sort"];
  excQuery.forEach((ele) => {
    delete queryObj[ele];
  });

  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, (match) => `$${match}`);
  queryObj = JSON.parse(queryObj);

  const searchValue=req.query.search.trim();

  const queryConditions = {
    ...queryObj,subcategoryId,
    $or: [
      { nameAr: { $regex: searchValue, $options: "i" } },
      { nameEn: { $regex: searchValue, $options: "i" } },
      { companyNameAr: { $regex: searchValue, $options: "i" } },
      { companyNameEn: { $regex: searchValue, $options: "i" } },
    ]
  };
  const mongooseQuery = supportiveProductModel.find(queryConditions);
  const Products = await mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));
  return res.status(200).json({ message: "success",details:"تم البحث بنجاح", Products });
};


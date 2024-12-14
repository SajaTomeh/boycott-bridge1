import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from "../../../DB/models/category.model.js";
import supportiveProductModel from "../../../DB/models/supportiveProduct.model.js";
import subcategoryModel from "../../../DB/models/subcategory.model.js";
import { pagination } from "../../utils/pagination.js";

export const createSupportiveProduct = async (req, res, next) => {
  const { nameAr, nameEn, categoryId, subcategoryId } = req.body;
  const checkCategory = await categoryModel.findById(categoryId);
  if (!checkCategory) {
    return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
  }
  const categoryHasSubcategories = await subcategoryModel.findOne({
    categoryId,
  });
  if (categoryHasSubcategories && !subcategoryId) {
    return next(
      new Error(" الصنف الفرعي مطلوب لأن الصنف الرئيسي يحتوي على أصناف فرعية", {
        cause: 400,
      })
    );
  }
  if (!categoryHasSubcategories && subcategoryId) {
    return next(
      new Error(
       " الصنف الرئيسي لا يحتوي على أصناف فرعية، يرجى إزالة الصنف الفرعي",
        { cause: 400 }
      )
    );
  }
  if (subcategoryId) {
    const checkSubCategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryId });
    if (!checkSubCategory) {
      return next(new Error(" الصنف الفرعي غير موجود ضمن هذا الصنف الرئيسي", { cause: 404 }));
    }
    req.body.subcategoryName = checkSubCategory.name;
  }

  if (await supportiveProductModel.findOne({$or: [{ nameAr: nameAr }, { nameEn: nameEn }]})) {
    return next(new Error(" المنتج موجود بالفعل", { cause: 409 }));
  }
  req.body.slug = slugify(nameEn);
  const nameCategory = checkCategory.name; //to get category name
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/supportiveProducts/${nameCategory}/${req.body.nameEn}`,
    }
  );
  req.body.image = { secure_url, public_id };
  req.body.categoryName = nameCategory;
  req.body.createdBy = req.user._id;
  req.body.updatedBy = req.user._id;

  const supportiveProduct = await supportiveProductModel.create(req.body);
  if (!supportiveProduct) {
    return next(
      new Error(" حدث خطأ أثناء إنشاء المنتج", { cause: 404 })
    );
  }
  return res.status(201).json({ message: "success", details:"تم إنشاء المنتج بنجاح", supportiveProduct });
};

export const getSupportiveProducts = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const supportiveProducts = await supportiveProductModel
    .find()
    .skip(skip)
    .limit(limit);
  return res.status(200).json({ message: "success",details:"تم الحصول على المنتجات بنجاح",supportiveProducts});
};

export const getCountSupportiveProducts = async (req, res) => {
  const productCount = await supportiveProductModel.countDocuments();
  res.status(200).json({message:"success",details:"تم الحصول على عدد المنتجات بنجاح",productCount});
};

export const getCategoryWithSupportives = async (req, res,next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const { categoryId} = req.params;

  if (!categoryId) {
    return next(new Error(" الصنف الرئيسي مطلوب", { cause: 400 }));
  }

  const category = await categoryModel
    .findById(categoryId)
    .populate("subcategory");

  if (!category) {
    return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
  }

  if (category.subcategory && category.subcategory.length > 0) {
    return next(
      new Error(
        " الصنف الرئيسي يحتوي على أصناف فرعية، يجب إدخال الصنف الفرعي",
        { cause: 400 }
      )
    );
    }
    const products = await supportiveProductModel
      .find({ categoryId })
      .skip(skip)
      .limit(limit);
  
  return res.status(200).json({message:"success",details:"تم الحصول على المنتجات بنجاح",products});
};

export const getSubcategoryWithSupportives = async (req, res,next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const { categoryId,subcategoryId} = req.params;

  if (!categoryId) {
    return next(new Error(" الصنف الرئيسي مطلوب", { cause: 400 }));
  }
  if (!subcategoryId) {
    return next(new Error(" الصنف الفرعي مطلوب", { cause: 400 }));
  }

  const category = await categoryModel
    .findById(categoryId)
    .populate("subcategory");
    const subcategory = await subcategoryModel.findById(subcategoryId);

  if (!category) {
    return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
  }
  if (!subcategory) {
    return next(new Error(" الصنف الفرعي غير موجود", { cause: 404 }));
  }
  let products;
  if (category.subcategory && category.subcategory.length > 0) {
    products = await supportiveProductModel
      .find({ subcategoryId })
      .skip(skip)
      .limit(limit);
    }else{
      return next(
        new Error(
          " الصنف الرئيسي لا يحتوي على أصناف فرعية، يرجى إزالة الصنف الفرعي",          { cause: 400 }
        )
      );
    }
  
  return res.status(200).json({message:"success",details:"تم الحصول على المنتجات بنجاح",products});
};

export const getSpecificSupportiveProduct = async (req, res, next) => {
  const { specificId } = req.params;
  const supportiveProduct = await supportiveProductModel.findById(specificId);
  if (!supportiveProduct) {
    return next(new Error(" المنتج غير موجود", { cause: 404 }));
  }
  return res.status(201).json({ message: "success",details:"تم العثور على المنتج بنجاح", supportiveProduct });
};

export const updateSupportiveProduct = async (req, res, next) => {
  const {nameAr, nameEn,subcategoryId,categoryId}=req.body;
  const supportiveProduct = await supportiveProductModel.findById(
    req.params.id
  );

  if (!supportiveProduct) {
    return next(
      new Error(" المنتج غير موجود", {
        cause: 404,
      })
    );
  }
  const checkCategory = await categoryModel.findById(req.body.categoryId);
  if (!checkCategory) {
    return next(new Error(" الصنف الرئيسي غير موجود", { cause: 404 }));
  }
  const categoryHasSubcategories = await subcategoryModel.findOne({
    categoryId,
  });
  if (categoryHasSubcategories && !subcategoryId) {
    return next(
      new Error(" الصنف الفرعي مطلوب لأن الصنف الرئيسي يحتوي على أصناف فرعية", {
        cause: 400,
      })
    );
  }
  if (!categoryHasSubcategories) {
    if(subcategoryId){
    return next(
      new Error(
        " الصنف الرئيسي لا يحتوي على أصناف فرعية، يرجى إزالة الصنف الفرعي",
        { cause: 400 }
      )
    )}
    supportiveProduct.subcategoryId = undefined;
    supportiveProduct.markModified('subcategoryId');
    supportiveProduct.subcategoryName = undefined;

  }
  if (subcategoryId) {
    const checkSubCategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryId });
    if (!checkSubCategory) {
      return next(new Error(" الصنف الفرعي غير موجود ضمن هذا الصنف الرئيسي", { cause: 404 }));
    }
    supportiveProduct.subcategoryId = subcategoryId;
    supportiveProduct.subcategoryName=checkSubCategory.name;

  }
  if (nameAr || nameEn) {
    if (
      await supportiveProductModel
        .findOne({
          $or: [{ nameAr: nameAr }, { nameEn: nameEn }],
          _id: { $ne: supportiveProduct._id }
        })
    ){
      return next(
        new Error(" المنتج موجود بالفعل", {
          cause: 404,
        })
      );
    }
    supportiveProduct.nameAr = nameAr;
    supportiveProduct.nameEn = nameEn;
    supportiveProduct.slug = slugify(nameEn);
  }
  supportiveProduct.companyNameAr = req.body.companyNameAr;
  supportiveProduct.companyNameEn = req.body.companyNameEn;
  supportiveProduct.countryOfOrigin = req.body.countryOfOrigin;
  supportiveProduct.categoryId = req.body.categoryId;
  supportiveProduct.categoryName=checkCategory.name;
  supportiveProduct.reasonForBoycott = req.body.reasonForBoycott;
  const nameCategory = checkCategory.name;
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/supportiveProducts/${nameCategory}/${nameEn}`,
      }
    );
    await cloudinary.uploader.destroy(supportiveProduct.image.public_id);
    supportiveProduct.image = { secure_url, public_id };
  }
  supportiveProduct.updatedBy = req.user._id;
  await supportiveProduct.save();
  return res.status(200).json({ message: "success",details:"تم تحديث المنتج بنجاح", supportiveProduct });
};

export const deleteSupportiveProduct = async (req, res, next) => {
  const { productId } = req.params;
  const supportiveProduct = await supportiveProductModel.findByIdAndDelete(
    productId
  );
  if (!supportiveProduct) {
    return next(new Error(" المنتج غير موجود", { cause: 404 }));
  }
  return res.status(200).json({ message: "success",
    details: "تم حذف المنتج بنجاح"});
};
export const searchSupportiveProducts = async (req, res, next) => {
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
    $or: [
      { nameAr: { $regex: searchValue, $options: "i" } },
      { nameEn: { $regex: searchValue, $options: "i" } },
      { companyNameAr: { $regex: searchValue, $options: "i" } },
      { companyNameEn: { $regex: searchValue, $options: "i" } },
    ],
  };  
  const mongooseQuery = supportiveProductModel.find(queryConditions);
  
  const supportiveProducts = await mongooseQuery.sort(
    req.query.sort?.replaceAll(",", " ")
  );
  return res.status(200).json({ message: "success",details:"تم البحث بنجاح", supportiveProducts });
};

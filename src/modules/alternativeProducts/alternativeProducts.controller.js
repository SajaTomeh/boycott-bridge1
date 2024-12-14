import alternativeProductModel from "../../../DB/models/alternativeProduct.model.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from "../../../DB/models/category.model.js";
import subcategoryModel from "../../../DB/models/subcategory.model.js";
import { pagination } from "../../utils/pagination.js";
import companyModel from "../../../DB/models/company.model.js";
import reviewModel from "../../../DB/models/review.model.js";

export const createAlternativeProduct = async (req, res, next) => {
  const { nameAr, nameEn, pointsOfSale, categoryId, subcategoryId } = req.body;

  const checkCompany = await companyModel.findById(req.user._id);
  if (!checkCompany) {
    return next(new Error("الشركة غير موجودة", { cause: 404 }));
  }

  const checkCategory = await categoryModel.findById(categoryId);
  if (!checkCategory) {
    return next(new Error("الصنف الرئيسي غير موجود", { cause: 404 }));
  }

  const categoryHasSubcategories = await subcategoryModel.findOne({
    categoryId,
  });
  if (categoryHasSubcategories && !subcategoryId) {
    return next(
      new Error("الصنف الفرعي مطلوب لأن الصنف الرئيسي يحتوي على أصناف فرعية", {
        cause: 400,
      })
    );
  }
  if (!categoryHasSubcategories && subcategoryId) {
    return next(
      new Error(
        "الصنف الرئيسي لا يحتوي على أصناف فرعية، يرجى إزالة الصنف الفرعي",
        { cause: 400 }
      )
    );
  }

  if (subcategoryId) {
    const checkSubCategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryId });
    if (!checkSubCategory) {
      return next(new Error("الصنف الفرعي غير موجود ضمن هذا الصنف الرئيسي", { cause: 404 }));
    }
    req.body.subcategoryName = checkSubCategory.name;

  }

  if (
    await alternativeProductModel.findOne({
      $or: [{ nameAr: nameAr }, { nameEn: nameEn }],
    })
  ) {
    return next(new Error("المنتج موجود بالفعل", { cause: 409 }));
  }

  req.body.slug = slugify(nameEn);

  const nameCategory = checkCategory.name; //to get category name
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/alternativeProducts/${nameCategory}/${req.body.nameEn}`,
    }
  );
  req.body.image = { secure_url, public_id };
  req.body.pointsOfSale = pointsOfSale.split(",");
  req.body.categoryName = nameCategory;
  req.body.createdBy = req.user._id;
  req.body.companyNameAr = req.user.companyNameAr;
  req.body.companyNameEn = req.user.companyNameEn;

  const alternativeProduct = await alternativeProductModel.create(req.body);
  if (!alternativeProduct) {
    return next(new Error("حدث خطأ أثناء إنشاء المنتج", { cause: 404 }));
  }
  return res.status(201).json({ message: "success", details: "تم إنشاء المنتج بنجاح", alternativeProduct });
};
export const getAllAlternativeProducts = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const alternativeProducts = await alternativeProductModel
    .find()
    .skip(skip)
    .limit(limit);
  return res.status(200).json({ message: "success", details: "تم الحصول على المنتجات بنجاح", alternativeProducts });
};
export const getCountAlternativeProducts = async (req, res) => {
  const productCount = await alternativeProductModel.countDocuments();
  res.status(200).json({ message: "success", details: "تم الحصول على عدد المنتجات بنجاح", productCount });
};

export const getCategoryWithAlternatives = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const { categoryId } = req.params;

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
  const products = await alternativeProductModel
    .find({ categoryId })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({ message: "success", details: "تم الحصول على المنتجات بنجاح", products });
};
export const getSubcategoryWithAlternatives = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const { categoryId, subcategoryId } = req.params;

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
    products = await alternativeProductModel
      .find({ subcategoryId })
      .skip(skip)
      .limit(limit);
  } else {
    return next(
      new Error(
        " الصنف الرئيسي لا يحتوي على أصناف فرعية، يرجى إزالة الصنف الفرعي",
        { cause: 400 }
      )
    );
  }

  return res.status(200).json({ message: "success", details: "تم الحصول على المنتجات بنجاح", products });
};

export const getSpecificAlternativeProduct = async (req, res, next) => {
  const { specificId } = req.params;

  const alternativeProduct = await alternativeProductModel
    .findById(specificId)
    .populate("reviews");

  if (!alternativeProduct) {
    return next(new Error(" المنتج غير موجود", { cause: 404 }));
  }
  return res.status(201).json({ message: "success", details: "تم العثور على المنتج بنجاح", alternativeProduct });
};

export const updateAlternativeProduct = async (req, res, next) => {
  const { nameAr, nameEn, subcategoryId, categoryId, pointsOfSale } = req.body;
  const alternativeProduct = await alternativeProductModel.findById(
    req.params.id
  );

  if (!alternativeProduct) {
    return next(
      new Error(" المنتج غير موجود", {
        cause: 404,
      })
    );
  }

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
  if (!categoryHasSubcategories) {
    if (subcategoryId) {
      return next(
        new Error(
          " الصنف الرئيسي لا يحتوي على أصناف فرعية، يرجى إزالة الصنف الفرعي",
          { cause: 400 }
        )
      );
    }
    alternativeProduct.subcategoryId = undefined;
    alternativeProduct.markModified("subcategoryId");
    alternativeProduct.subcategoryName = undefined;
  }
  if (subcategoryId) {
    const checkSubCategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryId });
    if (!checkSubCategory) {
      return next(new Error(" الصنف الفرعي غير موجود ضمن هذا الصنف الرئيسي", { cause: 404 }));
    }
    alternativeProduct.subcategoryId = subcategoryId;
    alternativeProduct.subcategoryName = checkSubCategory.name;
  }

  if (nameAr || nameEn) {
    if (
      await alternativeProductModel.findOne({
        $or: [{ nameAr: nameAr }, { nameEn: nameEn }],
        _id: { $ne: alternativeProduct._id },
      })
    ) {
      return next(
        new Error(" المنتج موجود بالفعل", {
          cause: 409,
        })
      );
    }
    alternativeProduct.nameAr = nameAr;
    alternativeProduct.nameEn = nameEn;
    alternativeProduct.slug = slugify(nameEn);
  }

  alternativeProduct.countryOfOrigin = req.body.countryOfOrigin;
  alternativeProduct.categoryId = categoryId;
  alternativeProduct.categoryName = checkCategory.name;
  alternativeProduct.price = req.body.price;
  alternativeProduct.pointsOfSale = pointsOfSale.split(",");

  if (req.file) {
    const nameCategory = checkCategory.name; //to get category name
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/alternativeProducts/${nameCategory}/${nameEn}`,
      }
    );

    await cloudinary.uploader.destroy(alternativeProduct.image.public_id);

    alternativeProduct.image = { secure_url, public_id };
  }
  await alternativeProduct.save();
  return res.status(200).json({ message: "success", details: "تم تحديث المنتج بنجاح", alternativeProduct });
};
export const deleteAlternativeProduct = async (req, res, next) => {
  const { productId } = req.params;
  const alternativeProduct = await alternativeProductModel.findByIdAndDelete(
    productId
  );

  if (!alternativeProduct) {
    return next(new Error(" المنتج غير موجود", { cause: 404 }));
  }
  await reviewModel.deleteMany({ alternativeProductId: productId });
  return res.status(200).json({
    message: "success",
    details: "تم حذف المنتج و التعليقات الخاصة به بنجاح"
  });
};
export const searchAlternativeProducts = async (req, res, next) => {
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
    $or: [
      { nameAr: { $regex: searchValue, $options: "i" } },
      { nameEn: { $regex: searchValue, $options: "i" } },
      { companyNameAr: { $regex: searchValue, $options: "i" } },
      { companyNameEn: { $regex: searchValue, $options: "i" } },
    ],
  };

  const mongooseQuery = alternativeProductModel.find(queryConditions);

  const alternativeProducts = await mongooseQuery.sort(
    req.query.sort?.replaceAll(",", " ")
  );
  return res.status(200).json({ message: "success", details: "تم البحث بنجاح", alternativeProducts });
};

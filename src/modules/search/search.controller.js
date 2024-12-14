import alternativeProductModel from "../../../DB/models/alternativeProduct.model.js";
import supportiveProductModel from "../../../DB/models/supportiveProduct.model.js";

export const searchProducts = async (req, res, next) => {
  let queryObj = { ...req.query };
  const excQuery = ["search", "sort"];
  excQuery.forEach((ele) => {
    delete queryObj[ele];
  });

  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(
    /\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g,
    (match) => `$${match}`
  );
  queryObj = JSON.parse(queryObj);
  const searchValue = req.query.search.trim();
  const companyQuery = {
    $or: [
      { companyNameAr: { $regex: "^" + searchValue + "$", $options: "i" } },
      { companyNameEn: { $regex: "^" + searchValue + "$", $options: "i" } },
    ],
  };
  const productQuery ={ 
    $or: [
    { nameAr: { $regex: "^" + searchValue + "$", $options: "i" } },
    { nameEn: { $regex: "^" + searchValue + "$", $options: "i" } },
  ],}
  const alternativeQuery = alternativeProductModel.find({...queryObj,...productQuery });
  
  const supportiveQuery = supportiveProductModel.find({...queryObj,...productQuery});
  
  const companyAlternative = alternativeProductModel.find({...queryObj,...companyQuery});
  
  const companySupportive = supportiveProductModel.find({...queryObj,...companyQuery});

  const [
    alternativeProducts,
    supportiveProducts,
    companyAlternativeProducts,
    companySupportiveProducts,
  ] = await Promise.all([
    alternativeQuery.sort(req.query.sort?.replaceAll(",", " ")),
    supportiveQuery.sort(req.query.sort?.replaceAll(",", " ")),
    companyAlternative.sort(req.query.sort?.replaceAll(",", " ")),
    companySupportive.sort(req.query.sort?.replaceAll(",", " ")),
  ]);
  if (alternativeProducts.length > 0) {
    return res.status(200).json({
      message: "هذا المنتج غير داعم",
      aboutProduct: alternativeProducts,
    });
  } else if (supportiveProducts.length > 0) {
    const alternativeProducts = await alternativeProductModel.find({
      categoryId: supportiveProducts[0].categoryId,
      subcategoryId: supportiveProducts[0].subcategoryId,
    });
    return res.status(200).json({
      message: "هذا المنتج داعم",
      aboutProduct: supportiveProducts,
      alternativeProducts: alternativeProducts,
    });
  } else if (companySupportiveProducts.length > 0) {
    return res.status(200).json({
      message: "هذه الشركة داعمة",
      products: companySupportiveProducts,
    });
  } else if (companyAlternativeProducts.length > 0) {
    return res.status(200).json({
      message: "هذه الشركة غير داعمة",
      products: companyAlternativeProducts,
    });
  } else {
    return next(new Error("لم يتم العثور على منتجات", { cause: 200 }));
  }
};

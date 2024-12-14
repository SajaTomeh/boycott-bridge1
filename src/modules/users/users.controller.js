import userModel from "../../../DB/models/user.model.js";
import reviewModel from "../../../DB/models/review.model.js";
import { pagination } from "../../utils/pagination.js";

export const getCountUsers = async (req, res) => {
  const userCount = await userModel.countDocuments({ isAdmin: { $ne: true } });
  res.status(200).json({message:"success",details:"تم الحصول على عدد المستخدمين بنجاح",userCount});
};
export const getUsers = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const useres = await userModel.find({ isAdmin: { $ne: true }}).skip(skip).limit(limit);
  return res.status(200).json({message:"success",details: "تم الحصول على المستخدمين بنجاح",useres});
};
export const updateUsername = async (req, res, next) => {
  const { id } = req.params;
  const { username } = req.body;
  const user = await userModel.findById(id);
  if (!user) {
    return next(new Error(" المستخدم غير موجود", { cause: 404 }));
  }
  if (username) {
    user.username = username;
  }
  await user.save();
  return res.status(200).json({ message: "success", details:"تم تحديث اسم المستخدم بنجاح", user });
};
export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel.findByIdAndDelete(userId);
  if (!user) {
    return next(new Error(" المستخدم غير موجود", { cause: 404 }));
  }
  await reviewModel.updateMany(
    { userId: userId },
    { 
      $unset: { userId: "" } ,
      $set:{username:"اسم المستخدم "}
    }
  );
  return res.status(200).json({ message: "success",
    details: "تم حذف المستخدم بنجاح"})
};
export const searchUserName = async (req, res, next) => {
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
  queryObj.isAdmin = { $ne: true };
  const searchValue=req.query.search.trim();
  const queryConditions = {
    ...queryObj,
    username: { $regex: searchValue, $options: "i" }
  }; 
  const mongooseQuery = userModel.find(queryConditions);
  const userName = await mongooseQuery.sort(
    req.query.sort?.replaceAll(",", " ")
  );
  return res.status(200).json({ message: "success",details:"تم البحث بنجاح", userName });
};
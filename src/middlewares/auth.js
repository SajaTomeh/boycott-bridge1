import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";
import companyModel from "../../DB/models/company.model.js";

export const roles = {
  Admin: "Admin",
  User: "User",
  Company: "Company",
};

// Function to get user by role
const getUserByRole = async (role, id) => {
  if (role === roles.Company) {
    return await companyModel.findById(id);
  } else {
    return await userModel.findById(id);
  }
};

// Middleware for authentication
export const auth = (accessRoles = []) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new Error("Invalid authorization", { cause: 400 }));
    }

    try {
      const token = authorization.split(" ")[1];
      if (!token) {
        return next(new Error("Token not found", { cause: 400 }));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return next(new Error("Invalid authorization", { cause: 400 }));
      }

      const role =
        decoded.userType.charAt(0).toUpperCase() +
        decoded.userType.slice(1).toLowerCase();
      const user = await getUserByRole(role, decoded.id);

      if (!user) {
        return next(
          new Error(`${role.toLowerCase()} not registered`, { cause: 404 })
        );
      }

      if (!accessRoles.includes(role)) {
        return next(new Error("Not authorized", { cause: 403 }));
      }

      req.user = { ...user.toObject(), role };
      next();
    } catch (error) {
      return next(new Error("Invalid token, access denied", { cause: 401 }));
    }
  };
};

import { roles } from "../../middlewares/auth.js";

export const endPoint = {
  getAll:[roles.Admin],
  update: [roles.User],
  delete: [roles.User,roles.Admin],
  search:[roles.Admin],
  count:[roles.Admin],
};

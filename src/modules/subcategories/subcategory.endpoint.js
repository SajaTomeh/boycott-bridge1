import { roles } from "../../middlewares/auth.js";

export const endPoint = {
  create: [roles.Admin],
  update: [roles.Admin],
  delete: [roles.Admin],
  search: [roles.Admin],
  getAll: [roles.Admin],
  count: [roles.Admin]
};

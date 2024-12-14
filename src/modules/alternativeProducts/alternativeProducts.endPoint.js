import { roles } from "../../middlewares/auth.js";

export const endPoint = {
  create: [roles.Company],
  update: [roles.Company],
  delete: [roles.Company],
};

import { roles } from "../../middlewares/auth.js";

export const endPoint = {
  search: [roles.Admin],
};

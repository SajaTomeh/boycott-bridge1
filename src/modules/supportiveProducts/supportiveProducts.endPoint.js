import { roles } from "../../middlewares/auth.js";

export const endPoint={
    create:[roles.Admin],
    delete:[roles.Admin],
    update:[roles.Admin],
}
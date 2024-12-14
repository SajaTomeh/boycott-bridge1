//backend/src/modules/app.router.js


import rateLimiting from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import hpp from "hpp";

import connectToDb from "../../DB/connection.js";
import { errorHandler, notFound } from "../middlewares/error.js";




import authRouter from "./auth/auth.router.js";
import adminNotificationsRouter from "./adminNotifications/adminNotifications.router.js";
import companyNotificationsRouter from "./companyNotifications/CompanyNotifications.router.js";
import companiesRouter from "./companies/companies.router.js";
import usersRouter from "./users/users.router.js";
import passwordsRouter from "./passwords/passwords.router.js";
import categoriesRouter from "./categories/categories.router.js";
import subcategoriesRouter from './subcategories/subcategories.router.js';
import alternativeProductsRouter from "./alternativeProducts/alternativeProducts.router.js";
import reviewRouter from "./reviews/reviews.router.js";
import countriesRouter from "./countries/countries.router.js";
import supportiveProductsRouter from "./supportiveProducts/supportiveProducts.router.js";
import searchRouter from "./search/search.router.js";
import generalInquiries from "./general-inquiries/general-inquiries.router.js";




const initApp = (app, express) => {

    // Connection To Db
    connectToDb();

    // Middlewares
    app.use(express.json());

    // Security Headers (helmet)
    app.use(helmet());

    // Prevent Http Param Pollution
    app.use(hpp());

    // Prevent XSS(Cross Site Scripting) Attacks
    app.use(xss());

    // Rate Limiting
    app.use(rateLimiting({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 200,
    }));

    // Cors Policy
    app.use(cors({
        origin: "http://localhost:5173"
    }));

    // Routes
    app.use("/api/auth", authRouter);
    app.use("/api/admin/notifications", adminNotificationsRouter);
    app.use("/api/companies", companyNotificationsRouter);
    app.use("/api/companies", companiesRouter);
    app.use("/api/users", usersRouter);
    app.use("/api/passwords", passwordsRouter);
    app.use("/api/categories", categoriesRouter);
    app.use("/api/subcategories", subcategoriesRouter);
    app.use("/api/alternativeProducts", alternativeProductsRouter);
    app.use("/api/reviews", reviewRouter);
    app.use("/api/countries", countriesRouter);
    app.use("/api/supportiveProducts", supportiveProductsRouter);
    app.use("/api/searchProducts", searchRouter);
    app.use("/api/general-inquiries", generalInquiries);


    // Not Found Route
    app.get("*", (req, res) => {
        return res.status(404).json({ message: "page not found" });
    });

    // Error Handler Middleware
    app.use(notFound);
    app.use(errorHandler);


};

export default initApp;

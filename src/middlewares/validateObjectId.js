//backend/src/middlewares/validateObjectId.js

import mongoose from 'mongoose';

export default function validateObjectId(paramName) {
    return (req, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
            return res.status(400).json({ message: `Invalid ${paramName}` });
        }
        next();
    }
}

//backend/DB/models/company.model.js

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


const companySchema = new mongoose.Schema({
    companyNameEn: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        min: 1,
        max: 200
    },
    companyNameAr: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        min: 1,
        max: 200
    },
    email: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png",
            publicId: null,
        }
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    newCompanyNameEn: {
        type: String,
        trim: true,
        min: 1,
        max: 200
    },
    newCompanyNameAr: {
        type: String,
        trim: true,
        min: 1,
        max: 200
    },
    isNameChangeApproved: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        default: 'company'
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

// Populate Alternative Products That Were Created By This Company
companySchema.virtual("createdAlternativeProducts", {
    ref: "Alternative-Product",
    foreignField: "createdBy",
    localField: "_id",
});


// Generate Auth Token
// 24h
companySchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, userType: 'company' }, process.env.JWT_SECRET, { expiresIn: Number(process.env.JWT_EXPIRY_TIME) });
}

export default mongoose.model('Company', companySchema);

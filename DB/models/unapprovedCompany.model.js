//backend/DB/models/unapprovedCompany.model.js


import mongoose from 'mongoose';

const unapprovedCompanySchema = new mongoose.Schema({
    companyNameEn: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        max: 200
    },
    companyNameAr: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        max: 200
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('UnapprovedCompany', unapprovedCompanySchema);

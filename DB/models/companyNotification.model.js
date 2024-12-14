//backend/DB/models/companyNotification.model.js


import mongoose from 'mongoose';

const companyNotificationSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    messageInformation: {
        type: String
    },
    message: {
        type: String
    },
    adminResponse: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        trim: true,
        required: false
    },
    response: {
        type: String,
        default: null,
    },
    section: {
        type: String,
        enum: ['nameChange', 'contactAdmin'],
        required: true
    }
});

export default mongoose.model('CompanyNotification', companyNotificationSchema);

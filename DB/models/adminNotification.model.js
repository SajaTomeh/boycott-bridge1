//backend/DB/models/adminNotification.model.js

import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema({

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },

    productName: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 200,
    },
    message: {
        type: String
    },
    messageInformation: {
        type: String,
        //required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        trim: true
    },
    adminResponse: {
        type: String
    },
    response: {
        type: String,
        default: null,
        enum: ['readable', 'approve', 'reject', 'answered']
    },
    section: {
        type: String,
        enum: ['registrationRequests', 'nameChangeRequests', 'companyMessages', 'informationAboutProduct', 'complaints-inquiries'],
        required: true
    }
});

export default mongoose.model('AdminNotification', adminNotificationSchema);

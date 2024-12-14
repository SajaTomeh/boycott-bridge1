//backend/DB/models/deletionToken.model.js

import mongoose from 'mongoose';

const DeletionTokenSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    token: {
        type: String,
        required: true
    },

    requestedByEmail: { // to store the email of the person who requested the deletion
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' },  // token will expire in 5 minutes
    },
});

export default mongoose.model('DeletionToken', DeletionTokenSchema);


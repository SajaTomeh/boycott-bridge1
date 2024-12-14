//backend/DB/models/verificationToken.model.js

import mongoose from 'mongoose';

const verificationTokenSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' },  // token will expire in 5 minutes
    },

}, {
    timestamps: true,
});

export default mongoose.model('VerificationToken', verificationTokenSchema);

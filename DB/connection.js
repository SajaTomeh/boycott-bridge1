//backend/DB/connection.js

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_CLOUD_URI);
        console.log("Connected To MongoDB ^_^");
    } catch (err) {
        console.log(`Connection Failed To MongoDB! Error: ${err}`);
    }
}

export default connectDB;

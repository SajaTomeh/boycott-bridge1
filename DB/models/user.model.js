import mongoose, { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      min: 4,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    isAdmin: {
      type: Boolean,
      default: false,
  },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate Auth Token
// 24h
userSchema.methods.generateAuthToken = function () {
  let userType = this.isAdmin ? 'admin' : 'user';
  return jwt.sign({ id: this._id, userType: userType  }, process.env.JWT_SECRET, { expiresIn: Number(process.env.JWT_EXPIRY_TIME) });
}

const userModel = mongoose.model.User || model("User", userSchema);
export default userModel;

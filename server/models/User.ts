import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  authProvider: "local" | "google" | "otp";
  googleId?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider === "local";
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "otp"],
      default: "local",
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Additional indexes (email already has unique:true, googleId has index:true above)
// userSchema.index({ email: 1 }); // Removed - already unique
// userSchema.index({ googleId: 1 }); // Removed - already indexed above

export const User = mongoose.model<IUser>("User", userSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL - automatically delete expired documents
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
otpSchema.index({ email: 1, createdAt: -1 });
// TTL index is already set above in the schema definition
// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Removed duplicate

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);

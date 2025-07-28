import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  color?: string;
  tags: string[];
  userId: mongoose.Types.ObjectId;
  isPinned: boolean;
  isArchived: boolean;
  attachments: {
    filename: string;
    url: string;
    type: string;
    size: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    color: {
      type: String,
      default: "#ffffff",
      match: /^#[0-9A-F]{6}$/i,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        filename: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, title: "text", content: "text" });

export const Note = mongoose.model<INote>("Note", noteSchema);

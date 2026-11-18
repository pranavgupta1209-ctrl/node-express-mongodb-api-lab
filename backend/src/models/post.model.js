import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    age: { type: Number, required: true, min: 1, max: 150 },
  },
  { timestamps: true },
);

export const Post = mongoose.model("Post", postSchema);

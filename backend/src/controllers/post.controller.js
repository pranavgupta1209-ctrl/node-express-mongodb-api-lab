import mongoose from "mongoose";
import { Post } from "../models/post.model.js";

function validatePostInput(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Send a JSON object containing post fields.";
  }

  const fields = Object.keys(body);
  const allowedFields = ["name", "description", "age"];
  if (!fields.length || fields.some((field) => !allowedFields.includes(field))) {
    return "Use only name, description and age; provide at least one field.";
  }

  for (const field of allowedFields) {
    if (!(field in body)) {
      if (!partial) return "Name, description and age are required.";
      continue;
    }
    if (field === "age") {
      if (typeof body.age !== "number" || !Number.isFinite(body.age)) {
        return "Age must be a JSON number.";
      }
    } else if (typeof body[field] !== "string" || !body[field].trim()) {
      return "Name and description must be nonempty strings.";
    }
  }
  return null;
}

export async function createPost(req, res, next) {
  const message = validatePostInput(req.body);
  if (message) return res.status(400).json({ message });

  try {
    const { name, description, age } = req.body;
    const post = await Post.create({ name, description, age });
    return res.status(201).json({ message: "Post created.", post });
  } catch (error) {
    return next(error);
  }
}

export async function getPosts(req, res, next) {
  try {
    const posts = await Post.find().sort({ createdAt: -1, _id: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    return next(error);
  }
}

export async function updatePost(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ message: "Post ID must be 24 hexadecimal characters." });
  }

  const message = validatePostInput(req.body, true);
  if (message) return res.status(400).json({ message });

  try {
    // The allowlist above prevents changing _id, timestamps or update operators.
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!post) return res.status(404).json({ message: "Post not found." });
    return res.status(200).json({ message: "Post updated.", post });
  } catch (error) {
    return next(error);
  }
}

export async function deletePost(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ message: "Post ID must be 24 hexadecimal characters." });
  }

  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    return res.status(200).json({ message: "Post deleted.", postId: post._id });
  } catch (error) {
    return next(error);
  }
}

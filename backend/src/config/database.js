import mongoose from "mongoose";

export default async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error("MONGODB_URI must be a MongoDB connection string.");
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("MongoDB connected successfully.");
}

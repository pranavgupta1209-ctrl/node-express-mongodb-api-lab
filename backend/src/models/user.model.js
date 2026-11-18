import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 30,
      match: /^[a-z0-9_.-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
      // bcrypt only uses the first 72 UTF-8 bytes of a password.
      validate: {
        validator: (value) => Buffer.byteLength(value, "utf8") <= 72,
        message: "Password must be at most 72 UTF-8 bytes.",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(document, result) {
        delete result.password;
        delete result.__v;
        return result;
      },
    },
  },
);

userSchema.pre("save", async function () {
  // Saving an unchanged user must not hash the stored password again.
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  if (typeof candidate !== "string" || Buffer.byteLength(candidate, "utf8") > 72 || !this.password) {
    return false;
  }
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);

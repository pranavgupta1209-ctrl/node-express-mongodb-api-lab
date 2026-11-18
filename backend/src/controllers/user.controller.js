import { User } from "../models/user.model.js";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasValidCredentials(body) {
  return (
    isObject(body) &&
    typeof body.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) &&
    body.email.trim().length <= 254 &&
    typeof body.password === "string" &&
    body.password.length >= 6 &&
    Buffer.byteLength(body.password, "utf8") <= 72
  );
}

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(req, res, next) {
  if (
    !hasValidCredentials(req.body) ||
    typeof req.body.username !== "string" ||
    !/^[a-z0-9_.-]{1,30}$/i.test(req.body.username.trim())
  ) {
    return res.status(400).json({
      message:
        "Provide a username (1-30 letters, numbers, dots, underscores or hyphens), a valid email, and a password (at least 6 characters, at most 72 UTF-8 bytes).",
    });
  }

  try {
    const username = req.body.username.trim().toLowerCase();
    const email = req.body.email.trim().toLowerCase();
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with that username or email already exists.",
      });
    }

    const user = await User.create({ username, email, password: req.body.password });
    return res.status(201).json({ message: "User registered.", user: publicUser(user) });
  } catch (error) {
    // Unique indexes also protect against two registrations arriving together.
    return next(error);
  }
}

export async function loginUser(req, res, next) {
  if (!hasValidCredentials(req.body)) {
    return res.status(400).json({ message: "Provide a valid email and password." });
  }

  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Credentials verified. This demo does not create a session or token.",
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export function logoutUser(req, res) {
  return res.status(200).json({
    message: "Logout demonstration only. There is no session or token to invalidate.",
  });
}

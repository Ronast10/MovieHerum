import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// @POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (username.length < 3)
      return res.status(400).json({ message: "Username must be at least 3 characters" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Check if already a verified user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Check if pending verification already exists
    const existingPending = await PendingUser.findOne({ email });
    if (existingPending) {
      // Resend verification email
      await sendVerificationEmail(email, existingPending.username, existingPending.verificationToken);
      return res.status(200).json({
        message: "Verification email resent! Please check your inbox.",
      });
    }

    // Hash password BEFORE storing in PendingUser
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save to PendingUser — NOT real User collection yet
    await PendingUser.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      expiresAt,
    });

    await sendVerificationEmail(email, username, verificationToken);

    res.status(201).json({
      message: "Verification email sent! Please check your inbox to activate your account.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/auth/verify-email?token=xxx
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token)
      return res.status(400).json({ message: "Token is required" });

    // Find in pending users
    const pending = await PendingUser.findOne({
      verificationToken: token,
      expiresAt: { $gt: new Date() },
    });

    if (!pending)
      return res.status(400).json({ message: "Invalid or expired verification link" });

    // Double-check user doesn't already exist
    const alreadyExists = await User.findOne({
      $or: [{ email: pending.email }, { username: pending.username }],
    });
    if (alreadyExists) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(400).json({ message: "Account already exists, please login" });
    }

    // NOW create the real verified user with already-hashed password
    await User.create({
      username: pending.username,
      email: pending.email,
      password: pending.password,
      isVerified: true,
    });

    // Clean up pending record
    await PendingUser.deleteOne({ _id: pending._id });

    res.json({ message: "Email verified! Your account is ready. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox." });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = "";
        await user.save();
      }
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/auth/refresh
export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid refresh token" });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

// @GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken -verificationToken"
    );
    if (!user)
      return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
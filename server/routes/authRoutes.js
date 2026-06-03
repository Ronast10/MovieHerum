import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  verifyEmail,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Traditional Auth Routes ---
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refreshAccessToken);
router.get("/me", protect, getMe);
router.get("/verify-email", verifyEmail);

// --- Google OAuth Routes ---
router.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email"], 
  session: false 
}));

router.get("/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: `${process.env.CLIENT_URL}/login`, 
    session: false 
  }),
  (req, res) => {
    // Generate tokens
    const accessToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: req.user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Prepare user data for redirect
    const userData = JSON.stringify({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
    });

    // Redirect to frontend with token and user data
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&user=${encodeURIComponent(userData)}`);
  }
);
// Get user by username (public profiles)
router.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password -refreshToken -verificationToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put("/update-profile", protect, async (req, res) => {
  try {
    const { bio, username } = req.body;
    const updateFields = {};

    if (bio !== undefined) updateFields.bio = bio;

    if (username && username.trim()) {
      const trimmed = username.trim();

      if (trimmed.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }

      const existing = await User.findOne({ username: trimmed });
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: "Username already taken" });
      }

      updateFields.username = trimmed;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshToken -verificationToken");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
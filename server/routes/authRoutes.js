import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refreshAccessToken);
router.get("/me", protect, getMe);

export default router;
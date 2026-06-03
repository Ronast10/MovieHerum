import express from "express";
import {
  createReview,
  getMovieReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  toggleLike,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/movie/:movieId", getMovieReviews);
router.get("/user/:userId", getUserReviews);
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.put("/:id/like", protect, toggleLike);

export default router;
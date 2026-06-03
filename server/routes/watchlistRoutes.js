import express from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
} from "../controllers/watchlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWatchlist);
router.post("/add", protect, addToWatchlist);
router.delete("/remove/:movieId", protect, removeFromWatchlist);
router.get("/check/:movieId", protect, checkWatchlist);

export default router;
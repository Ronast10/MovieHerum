import express from "express";
import {
  getTrending,
  getPopular,
  getTopRated,
  searchMovies,
  getGenres,
  getMovieById,
  discoverMovies,
} from "../controllers/movieController.js";

const router = express.Router();

router.get("/trending", getTrending);
router.get("/popular", getPopular);
router.get("/top-rated", getTopRated);
router.get("/search", searchMovies);
router.get("/genres", getGenres);
router.get("/discover", discoverMovies);
router.get("/:id", getMovieById);

export default router;
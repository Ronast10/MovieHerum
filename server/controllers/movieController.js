import tmdb from "../utils/tmdb.js";

// @GET /api/movies/trending
export const getTrending = async (req, res) => {
  try {
    const { data } = await tmdb.get("/trending/movie/week");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/movies/popular
export const getPopular = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const { data } = await tmdb.get("/movie/popular", { params: { page } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/movies/top-rated
export const getTopRated = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const { data } = await tmdb.get("/movie/top_rated", { params: { page } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/movies/search?q=batman
export const searchMovies = async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.status(400).json({ message: "Query is required" });
    const { data } = await tmdb.get("/search/movie", {
      params: { query: q, page },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/movies/genres
export const getGenres = async (req, res) => {
  try {
    const { data } = await tmdb.get("/genre/movie/list");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/movies/:id
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const [details, credits, videos, similar] = await Promise.all([
      tmdb.get(`/movie/${id}`),
      tmdb.get(`/movie/${id}/credits`),
      tmdb.get(`/movie/${id}/videos`),
      tmdb.get(`/movie/${id}/similar`),
    ]);

    res.json({
      ...details.data,
      cast: credits.data.cast.slice(0, 10),
      crew: credits.data.crew.filter((c) => c.job === "Director"),
      videos: videos.data.results.filter((v) => v.site === "YouTube"),
      similar: similar.data.results.slice(0, 8),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/movies/discover?genre=28&year=2023
export const discoverMovies = async (req, res) => {
  try {
    const { genre, year, sort_by = "popularity.desc", page = 1 } = req.query;
    const params = { sort_by, page };
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    const { data } = await tmdb.get("/discover/movie", { params });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
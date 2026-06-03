import User from "../models/User.js";

// @GET /api/watchlist
export const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("watchlist");
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/watchlist/add
export const addToWatchlist = async (req, res) => {
  try {
    const { movieId, title, poster } = req.body;

    if (!movieId || !title)
      return res.status(400).json({ message: "movieId and title are required" });

    const user = await User.findById(req.user._id);

    const already = user.watchlist.find((m) => m.movieId === movieId);
    if (already)
      return res.status(400).json({ message: "Movie already in watchlist" });

    user.watchlist.push({ movieId, title, poster });
    await user.save();

    res.status(201).json({ message: "Added to watchlist", watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/watchlist/remove/:movieId
export const removeFromWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.watchlist = user.watchlist.filter(
      (m) => m.movieId !== Number(req.params.movieId)
    );

    await user.save();
    res.json({ message: "Removed from watchlist", watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/watchlist/check/:movieId
export const checkWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("watchlist");
    const exists = user.watchlist.some(
      (m) => m.movieId === Number(req.params.movieId)
    );
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
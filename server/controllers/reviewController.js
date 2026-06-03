import Review from "../models/Review.js";

// @POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { movieId, movieTitle, moviePoster, rating, content } = req.body;

    if (!movieId || !movieTitle || !rating || !content)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await Review.findOne({
      userId: req.user._id,
      movieId,
    });
    if (existing)
      return res.status(400).json({ message: "You already reviewed this movie" });

    const review = await Review.create({
      userId: req.user._id,
      movieId,
      movieTitle,
      moviePoster,
      rating,
      content,
    });

    await review.populate("userId", "username avatar");
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/reviews/movie/:movieId
export const getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/reviews/user/:userId
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/reviews/:id
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { rating, content } = req.body;
    review.rating = rating || review.rating;
    review.content = content || review.content;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/reviews/:id/like
export const toggleLike = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    const alreadyLiked = review.likes.includes(req.user._id);

    if (alreadyLiked) {
      review.likes = review.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      review.likes.push(req.user._id);
    }

    await review.save();
    res.json({ likes: review.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @GET /api/reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
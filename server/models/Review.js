import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    moviePoster: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      minlength: 10,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// One review per user per movie
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import api from "../services/api";

const IMG_BASE = "https://image.tmdb.org/t/p";

const TABS = [
  { label: "All", key: "all" },
  { label: "Above 5 ⭐", key: "above" },
  { label: "Below 5 ⭐", key: "below" },
];

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get("/reviews");
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filtered = reviews.filter((r) => {
    if (activeTab === "above") return r.rating >= 5;
    if (activeTab === "below") return r.rating < 5;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl text-light mb-1">Community Reviews</h1>
          <p className="text-muted font-body text-sm">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} from the MovieHerum community
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-surface border border-border rounded-lg p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-md font-body text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-gold text-bg font-semibold"
                  : "text-muted hover:text-light"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-bg/20 text-bg" : "bg-card text-muted"
              }`}>
                {tab.key === "all"
                  ? reviews.length
                  : tab.key === "above"
                  ? reviews.filter((r) => r.rating >= 5).length
                  : reviews.filter((r) => r.rating < 5).length}
              </span>
            </button>
          ))}
        </div>

        {/* Reviews */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-light mb-2">No reviews here</p>
            <p className="text-muted font-body text-sm">
              {activeTab === "above"
                ? "No reviews with rating 5 or above yet."
                : activeTab === "below"
                ? "No reviews with rating below 5 yet."
                : "Be the first to write a review!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => (
              <div
                key={review._id}
                className="group bg-surface border border-border rounded-xl p-5 hover:border-gold/30 transition-colors"
              >
                <div className="flex gap-5">
                  {/* Poster */}
                  <Link to={`/movie/${review.movieId}`} className="flex-shrink-0">
                    {review.moviePoster ? (
                      <img
                        src={`${IMG_BASE}/w92${review.moviePoster}`}
                        alt={review.movieTitle}
                        className="w-16 h-24 object-cover rounded-lg border border-border group-hover:border-gold/30 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-card rounded-lg flex items-center justify-center border border-border">
                        <FiStar className="text-muted" size={20} />
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <Link
                        to={`/movie/${review.movieId}`}
                        className="font-display text-xl text-light hover:text-gold transition-colors line-clamp-1"
                      >
                        {review.movieTitle}
                      </Link>

                      {/* Rating badge */}
                      <div className={`flex items-center gap-1 flex-shrink-0 px-2.5 py-1 rounded-lg text-sm font-body font-semibold ${
                        review.rating >= 8
                          ? "bg-green-900/40 text-green-400 border border-green-800/40"
                          : review.rating >= 5
                          ? "bg-gold/10 text-gold border border-gold/20"
                          : "bg-red-900/40 text-red-400 border border-red-800/40"
                      }`}>
                        <FiStar size={13} fill="currentColor" />
                        {review.rating}/10
                      </div>
                    </div>

                    {/* User + date */}
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        to={`/profile/${review.userId?.username}`}
                        className="flex items-center gap-1.5 text-sm font-body hover:text-gold transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-bg text-xs font-bold">
                          {review.userId?.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-gold">@{review.userId?.username}</span>
                      </Link>
                      <span className="text-muted text-xs font-body">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-light/75 font-body text-sm leading-relaxed line-clamp-3">
                      {review.content}
                    </p>

                    {review.likes?.length > 0 && (
                      <p className="text-muted font-body text-xs mt-3">
                        ♥ {review.likes.length} {review.likes.length === 1 ? "like" : "likes"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
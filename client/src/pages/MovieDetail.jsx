import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiPlus, FiCheck, FiArrowLeft, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";
import useAuthStore from "../store/authStore";

const IMG_BASE = "https://image.tmdb.org/t/p";

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[...Array(10)].map((_, i) => (
      <button key={i} onClick={() => onChange(i + 1)}>
        <FiStar
          size={18}
          className={i < value ? "text-gold fill-gold" : "text-muted"}
          fill={i < value ? "currentColor" : "none"}
        />
      </button>
    ))}
  </div>
);

const MovieDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuthStore();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, reviewsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/reviews/movie/${id}`),
        ]);
        setMovie(movieRes.data);
        setReviews(reviewsRes.data);

        if (user && token) {
          const { data } = await api.get(`/watchlist/check/${id}`);
          setInWatchlist(data.exists);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const toggleWatchlist = async () => {
    if (!user) return toast.error("Please login first");
    try {
      if (inWatchlist) {
        await api.delete(`/watchlist/remove/${id}`);
        setInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await api.post("/watchlist/add", { movieId: movie.id, title: movie.title, poster: movie.poster_path });
        setInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const submitReview = async () => {
    if (!user) return toast.error("Please login first");
    if (!reviewForm.rating) return toast.error("Please select a rating");
    if (reviewForm.content.length < 10) return toast.error("Review too short");
    setSubmitting(true);
    try {
      const { data } = await api.post("/reviews",
        { movieId: movie.id, movieTitle: movie.title, moviePoster: movie.poster_path, ...reviewForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([data, ...reviews]);
      setReviewForm({ rating: 0, content: "" });
      toast.success("Review posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error posting review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted font-body">Movie not found</p>
    </div>
  );

  const trailer = movie.videos?.find((v) => v.type === "Trailer");

  return (
    <div className="min-h-screen pt-16">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img
          src={`${IMG_BASE}/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-48 relative z-10">
        <Link to="/browse" className="inline-flex items-center gap-2 text-muted hover:text-gold font-body text-sm mb-6 transition-colors">
          <FiArrowLeft size={16} /> Back to Browse
        </Link>

        <div className="flex gap-8 flex-col md:flex-row">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={`${IMG_BASE}/w300${movie.poster_path}`}
              alt={movie.title}
              className="w-44 md:w-56 rounded-xl shadow-2xl border border-border"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-display text-4xl md:text-5xl font-black text-light leading-tight mb-3">
              {movie.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-gold">
                <FiStar size={16} fill="currentColor" />
                <span className="font-body font-semibold">{movie.vote_average?.toFixed(1)}</span>
                <span className="text-muted text-sm font-body">({movie.vote_count?.toLocaleString()} votes)</span>
              </div>
              <span className="text-muted font-body text-sm">{movie.release_date?.slice(0, 4)}</span>
              {movie.runtime && (
                <span className="text-muted font-body text-sm">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-5">
              {movie.genres?.map((g) => (
                <span key={g.id} className="px-3 py-1 border border-border text-muted text-xs font-body rounded-full">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-light/80 font-body leading-relaxed mb-6 max-w-2xl">{movie.overview}</p>

            {/* Director */}
            {movie.crew?.length > 0 && (
              <p className="text-muted font-body text-sm mb-6">
                Directed by <span className="text-light">{movie.crew[0].name}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {trailer && (
                <a
                  href={`https://youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gold text-bg font-body font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-dim transition-colors text-sm"
                >
                  Watch Trailer
                </a>
              )}
              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 border font-body text-sm px-6 py-2.5 rounded-lg transition-colors ${
                  inWatchlist
                    ? "border-gold text-gold"
                    : "border-border text-muted hover:border-gold hover:text-gold"
                }`}
              >
                {inWatchlist ? <FiCheck size={16} /> : <FiPlus size={16} />}
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>

        {/* Cast */}
        {movie.cast?.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-light mb-5">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {movie.cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-24 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 border border-border bg-card">
                    {person.profile_path ? (
                      <img src={`${IMG_BASE}/w185${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="text-muted" size={28} />
                      </div>
                    )}
                  </div>
                  <p className="text-light text-xs font-body font-medium line-clamp-1">{person.name}</p>
                  <p className="text-muted text-xs font-body line-clamp-1">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-14 mb-16">
          <h2 className="font-display text-2xl text-light mb-6">Reviews</h2>

          {/* Write review */}
          {user ? (
            <div className="bg-surface border border-border rounded-xl p-6 mb-8">
              <p className="text-light font-body font-medium mb-4">Write a Review</p>
              <StarPicker value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
              <textarea
                value={reviewForm.content}
                onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                placeholder="Share your thoughts about this film..."
                rows={4}
                className="w-full mt-4 bg-card border border-border text-light font-body text-sm p-4 rounded-lg focus:outline-none focus:border-gold transition-colors placeholder:text-muted resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="bg-gold text-bg font-body font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-dim transition-colors text-sm disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Review"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-center">
              <p className="text-muted font-body text-sm mb-3">Sign in to write a review</p>
              <Link to="/login" className="text-gold font-body text-sm hover:text-gold-dim">
                Sign In →
              </Link>
            </div>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-muted font-body text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-surface border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold">
                        {review.userId?.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-light font-body font-medium text-sm">{review.userId?.username}</p>
                        <p className="text-muted font-body text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gold">
                      <FiStar size={14} fill="currentColor" />
                      <span className="font-body font-semibold text-sm">{review.rating}/10</span>
                    </div>
                  </div>
                  <p className="text-light/80 font-body text-sm leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Similar movies */}
        {movie.similar?.length > 0 && (
          <section className="mb-16">
            <h2 className="font-display text-2xl text-light mb-5">You Might Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {movie.similar.map((m) => (
                <Link key={m.id} to={`/movie/${m.id}`} className="group flex-shrink-0 w-36">
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={m.poster_path ? `${IMG_BASE}/w185${m.poster_path}` : "/no-poster.png"}
                      alt={m.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="mt-2 text-light text-xs font-body line-clamp-1 group-hover:text-gold transition-colors">{m.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiStar, FiBookmark, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";
import useAuthStore from "../store/authStore";

const IMG_BASE = "https://image.tmdb.org/t/p";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, token, setUser } = useAuthStore();
  const isOwner = user?.username === username;

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [activeTab, setActiveTab] = useState("reviews");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
  setLoading(true);
  try {
    const { data: userData } = await api.get(`/auth/user/${username}`);
    setProfileUser(userData);
    setBioInput(userData.bio || "");
    setUsernameInput(userData.username || "");

    // Fetch reviews — always public
    const reviewsRes = await api.get(`/reviews/user/${userData._id}`);
    setReviews(reviewsRes.data);

    // Fetch watchlist — check against fetched userData, not stale isOwner
    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.username === username) {
      const watchlistRes = await api.get("/watchlist");
      setWatchlist(watchlistRes.data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
};

  const saveProfile = async () => {
  if (!usernameInput.trim()) return toast.error("Username cannot be empty");
  if (usernameInput.length < 3) return toast.error("Username must be at least 3 characters");
  setSaving(true);
  try {
    const { data } = await api.put("/auth/update-profile", {
      bio: bioInput.trim(),
      username: usernameInput.trim(),
    });

    // Update Zustand store with full returned user data
    const currentUser = useAuthStore.getState().user;
    useAuthStore.getState().setUser({
      ...currentUser,
      username: data.username,
      bio: data.bio,
    });

    // Update local state
    setProfileUser((prev) => ({
      ...prev,
      username: data.username,
      bio: data.bio,
    }));

    setEditing(false);
    toast.success("Profile updated!");

    // Redirect if username changed
    if (data.username !== username) {
      navigate(`/profile/${data.username}`);
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update profile");
  } finally {
    setSaving(false);
  }
};

  const cancelEdit = () => {
    setEditing(false);
    setBioInput(profileUser.bio || "");
    setUsernameInput(profileUser.username || "");
  };

  const removeFromWatchlist = async (movieId) => {
  try {
    await api.delete(`/watchlist/remove/${movieId}`);
    setWatchlist((prev) => prev.filter((m) => m.movieId !== movieId));
    toast.success("Removed from watchlist");
  } catch {
    toast.error("Error removing movie");
  }
};

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profileUser) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl text-light mb-2">User not found</p>
        <Link to="/" className="text-gold font-body text-sm">Go Home →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 md:px-12 max-w-5xl mx-auto">

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start mb-10">

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gold flex items-center justify-center text-bg text-4xl font-bold font-display flex-shrink-0 border-4 border-surface shadow-xl overflow-hidden">
          {profileUser.avatar
            ? <img src={profileUser.avatar} alt={profileUser.username} className="w-full h-full object-cover" />
            : profileUser.username?.[0]?.toUpperCase()
          }
        </div>

        {/* Info */}
        <div className="flex-1">
          {editing ? (
            /* ── EDIT MODE ── */
            <div className="space-y-4">
              {/* Username input */}
              <div>
                <label className="text-muted text-xs font-body uppercase tracking-wider mb-1.5 block">
                  Username
                </label>
                <input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  maxLength={20}
                  placeholder="Your username"
                  className="bg-surface border border-gold/50 focus:border-gold text-light font-body text-base px-4 py-2.5 rounded-lg focus:outline-none transition-colors w-full max-w-xs"
                />
                <p className="text-muted text-xs font-body mt-1">
                  {usernameInput.length}/20 characters
                </p>
              </div>

              {/* Bio input */}
              <div>
                <label className="text-muted text-xs font-body uppercase tracking-wider mb-1.5 block">
                  Bio
                </label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Write something about yourself..."
                  rows={3}
                  maxLength={160}
                  className="w-full max-w-lg bg-surface border border-border focus:border-gold text-light font-body text-sm p-3 rounded-lg focus:outline-none resize-none placeholder:text-muted transition-colors"
                />
                <p className="text-muted text-xs font-body mt-1">
                  {bioInput.length}/160 characters
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gold text-bg font-body font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-gold-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 border border-border text-muted font-body text-sm px-5 py-2.5 rounded-lg hover:border-gold hover:text-gold transition-colors"
                >
                  <FiX size={15} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── VIEW MODE ── */
            <div>
              {/* Username + verified + edit button */}
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="font-display text-3xl text-light">
                  {profileUser.username}
                </h1>
                {profileUser.isVerified && (
                  <span className="bg-gold/20 text-gold text-xs font-body px-2 py-0.5 rounded-full border border-gold/30">
                    ✓ Verified
                  </span>
                )}
                {isOwner && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-muted hover:text-gold transition-colors text-xs font-body border border-border hover:border-gold px-3 py-1 rounded-full"
                  >
                    <FiEdit2 size={12} />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Email */}
              <p className="text-muted font-body text-sm mb-3">
                {profileUser.email}
              </p>

              {/* Bio */}
              <p className="text-light/70 font-body text-sm max-w-lg leading-relaxed">
                {profileUser.bio || (
                  <span className="text-muted italic">
                    {isOwner ? "No bio yet — click Edit Profile to add one." : "No bio yet."}
                  </span>
                )}
              </p>

              {/* Member since */}
              <p className="text-muted font-body text-xs mt-3">
                Member since {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long"
                })}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        {!editing && (
          <div className="flex gap-6 md:flex-col md:gap-4 md:text-right flex-shrink-0">
            <div>
              <p className="font-display text-3xl text-gold">{reviews.length}</p>
              <p className="text-muted font-body text-xs uppercase tracking-wider">Reviews</p>
            </div>
            {isOwner && (
              <div>
                <p className="font-display text-3xl text-gold">{watchlist.length}</p>
                <p className="text-muted font-body text-xs uppercase tracking-wider">Watchlist</p>
              </div>
            )}
            {reviews.length > 0 && (
              <div>
                <p className="font-display text-3xl text-gold">
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                </p>
                <p className="text-muted font-body text-xs uppercase tracking-wider">Avg Rating</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-8" />

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-surface border border-border rounded-lg p-1 w-fit">
        {["reviews", ...(isOwner ? ["watchlist"] : [])].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-md font-body text-sm capitalize transition-colors ${
              activeTab === tab
                ? "bg-gold text-bg font-semibold"
                : "text-muted hover:text-light"
            }`}
          >
            {tab}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? "bg-bg/20 text-bg" : "bg-card text-muted"
            }`}>
              {tab === "reviews" ? reviews.length : watchlist.length}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-xl text-light mb-2">No reviews yet</p>
              <p className="text-muted font-body text-sm mb-4">
                {isOwner ? "Start reviewing movies you've watched!" : "This user hasn't reviewed any movies yet."}
              </p>
              {isOwner && (
                <Link to="/browse" className="text-gold font-body text-sm hover:text-gold-dim">
                  Browse Movies →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Link
                  key={review._id}
                  to={`/movie/${review.movieId}`}
                  className="group flex gap-4 bg-surface border border-border rounded-xl p-5 hover:border-gold/40 transition-colors"
                >
                  <div className="flex-shrink-0 w-14">
                    {review.moviePoster ? (
                      <img
                        src={`${IMG_BASE}/w92${review.moviePoster}`}
                        alt={review.movieTitle}
                        className="w-14 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-14 h-20 bg-card rounded-lg flex items-center justify-center">
                        <FiStar className="text-muted" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-display text-lg text-light group-hover:text-gold transition-colors line-clamp-1">
                        {review.movieTitle}
                      </h3>
                      <div className={`flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded text-sm font-body font-semibold ${
                        review.rating >= 8
                          ? "bg-green-900/40 text-green-400"
                          : review.rating >= 5
                          ? "bg-gold/10 text-gold"
                          : "bg-red-900/40 text-red-400"
                      }`}>
                        <FiStar size={12} fill="currentColor" />
                        {review.rating}/10
                      </div>
                    </div>
                    <p className="text-muted font-body text-xs mb-2">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                    <p className="text-light/70 font-body text-sm line-clamp-2 leading-relaxed">
                      {review.content}
                    </p>
                    {review.likes?.length > 0 && (
                      <p className="text-muted font-body text-xs mt-2">
                        ♥ {review.likes.length} {review.likes.length === 1 ? "like" : "likes"}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Tab */}
      {activeTab === "watchlist" && isOwner && (
        <div>
          {watchlist.length === 0 ? (
            <div className="text-center py-16">
              <FiBookmark className="text-muted mx-auto mb-3" size={32} />
              <p className="font-display text-xl text-light mb-2">Watchlist is empty</p>
              <p className="text-muted font-body text-sm mb-4">Save movies you want to watch later.</p>
              <Link to="/browse" className="text-gold font-body text-sm hover:text-gold-dim">
                Browse Movies →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlist.map((movie) => (
                <div key={movie.movieId} className="group relative">
                  <Link to={`/movie/${movie.movieId}`}>
                    <div className="relative overflow-hidden rounded-lg">
                      {movie.poster ? (
                        <img
                          src={`${IMG_BASE}/w300${movie.poster}`}
                          alt={movie.title}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-card rounded-lg flex items-center justify-center">
                          <FiBookmark className="text-muted" size={28} />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-light text-sm font-body font-medium line-clamp-1 group-hover:text-gold transition-colors">
                      {movie.title}
                    </p>
                  </Link>
                  <button
                    onClick={() => removeFromWatchlist(movie.movieId)}
                    className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-muted hover:text-gold p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <FiX size={14} />
                  </button>
                  <p className="text-muted text-xs font-body">
                    Added {new Date(movie.addedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
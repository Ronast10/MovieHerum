import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiMenu } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const IMG_BASE = "https://image.tmdb.org/t/p";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?q=${query}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success("Logged out 👋");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-2xl font-bold text-gold tracking-wide flex-shrink-0"
        >
          Movie<span className="text-light">Herum</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-7">
          <Link to="/" className="text-muted hover:text-light text-sm font-body transition-colors">
            Home
          </Link>
          <Link to="/browse" className="text-muted hover:text-light text-sm font-body transition-colors">
            Browse
          </Link>
          <Link to="/reviews" className="text-muted hover:text-light text-sm font-body transition-colors">
            Reviews
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Search Bar */}
          <div ref={searchRef} className="relative">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 bg-surface border border-gold/50 rounded-full px-4 py-2 w-64 transition-all"
              >
                <FiSearch className="text-muted flex-shrink-0" size={15} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, genres..."
                  className="bg-transparent text-light text-sm focus:outline-none flex-1 placeholder:text-muted"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")}>
                    <FiX className="text-muted hover:text-light" size={14} />
                  </button>
                )}
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 bg-surface border border-border hover:border-gold/50 text-muted hover:text-light rounded-full px-4 py-2 text-sm font-body transition-all"
              >
                <FiSearch size={15} />
                <span className="hidden md:inline">Search...</span>
              </button>
            )}
          </div>

          {/* Auth Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-surface border border-border hover:border-gold/50 rounded-full pl-1 pr-3 py-1 transition-all group"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gold flex items-center justify-center text-bg text-xs font-bold">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.username?.[0]?.toUpperCase()
                  )}
                </div>
                {/* Username */}
                <span className="text-light text-sm font-body hidden md:inline max-w-[100px] truncate">
                  {user.username}
                </span>
                {/* Chevron */}
                <svg
                  className={`text-muted transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gold flex items-center justify-center text-bg font-bold flex-shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          user.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-light font-body font-semibold text-sm truncate">
                          {user.username}
                        </p>
                        <p className="text-muted font-body text-xs truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-light hover:bg-card font-body text-sm transition-colors"
                    >
                      <span>👤</span>
                      My Profile
                    </Link>
                    <Link
                      to="/browse"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-light hover:bg-card font-body text-sm transition-colors"
                    >
                      <span>🎬</span>
                      Browse Movies
                    </Link>
                    <Link
                      to="/reviews"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-light hover:bg-card font-body text-sm transition-colors"
                    >
                      <span>⭐</span>
                      Community Reviews
                    </Link>
                  </div>

                  <div className="border-t border-border py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-card font-body text-sm transition-colors"
                    >
                      <span>🚪</span>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-muted hover:text-light font-body text-sm transition-colors px-3 py-2"
              >
                 Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gold text-bg font-body font-semibold text-sm px-4 py-2 rounded-full hover:bg-gold-dim transition-colors"
              >
                Join 
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-muted hover:text-light transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border px-6 py-4 flex flex-col gap-1">
          {user && (
            <div className="flex items-center gap-3 py-3 mb-2 border-b border-border">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gold flex items-center justify-center text-bg font-bold">
                {user.avatar
                  ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  : user.username?.[0]?.toUpperCase()
                }
              </div>
              <div>
                <p className="text-light font-body font-semibold text-sm">{user.username}</p>
                <p className="text-muted font-body text-xs">{user.email}</p>
              </div>
            </div>
          )}

          <Link to="/" onClick={() => setMenuOpen(false)} className="text-light font-body py-2.5 flex items-center gap-3">
            <span>🏠</span> Home
          </Link>
          <Link to="/browse" onClick={() => setMenuOpen(false)} className="text-light font-body py-2.5 flex items-center gap-3">
            <span>🎬</span> Browse
          </Link>
          <Link to="/reviews" onClick={() => setMenuOpen(false)} className="text-light font-body py-2.5 flex items-center gap-3">
            <span>⭐</span> Reviews
          </Link>

          {user ? (
            <>
              <Link to={`/profile/${user.username}`} onClick={() => setMenuOpen(false)} className="text-light font-body py-2.5 flex items-center gap-3">
                <span>👤</span> My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-400 font-body py-2.5 flex items-center gap-3 text-left"
              >
                <span>🚪</span> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-light font-body py-2.5 flex items-center gap-3">
                <span>🔑</span> Sign In
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-gold font-body py-2.5 flex items-center gap-3">
                <span>✨</span> Join Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
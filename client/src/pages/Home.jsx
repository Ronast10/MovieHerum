import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlay, FiPlus, FiStar, FiChevronRight } from "react-icons/fi";
import api from "../services/api";

const IMG_BASE = "https://image.tmdb.org/t/p";

const MovieCard = ({ movie }) => (
  <Link
    to={`/movie/${movie.id}`}
    className="group relative flex-shrink-0 w-40 md:w-48 cursor-pointer"
  >
    <div className="relative overflow-hidden rounded-lg">
      <img
        src={
          movie.poster_path
            ? `${IMG_BASE}/w300${movie.poster_path}`
            : "/no-poster.png"
        }
        alt={movie.title}
        className="w-full h-60 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <div className="flex items-center gap-1 text-gold text-xs font-body mb-1">
          <FiStar size={11} fill="currentColor" />
          <span>{movie.vote_average?.toFixed(1)}</span>
        </div>
        <p className="text-light text-xs font-body line-clamp-2 leading-tight">
          {movie.overview}
        </p>
      </div>
      {/* Rating badge */}
      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gold text-xs font-body px-1.5 py-0.5 rounded flex items-center gap-1">
        <FiStar size={10} fill="currentColor" />
        {movie.vote_average?.toFixed(1)}
      </div>
    </div>
    <p className="mt-2 text-light text-sm font-body font-medium line-clamp-1 group-hover:text-gold transition-colors">
      {movie.title}
    </p>
    <p className="text-muted text-xs font-body">
      {movie.release_date?.slice(0, 4)}
    </p>
  </Link>
);

const Section = ({ title, movies, link }) => (
  <section className="mb-14">
    <div className="flex items-center justify-between mb-6 px-6 md:px-12">
      <h2 className="font-display text-2xl text-light">
        {title}
      </h2>
      <Link
        to={link}
        className="text-gold text-sm font-body flex items-center gap-1 hover:gap-2 transition-all"
      >
        See all <FiChevronRight size={16} />
      </Link>
    </div>
    <div className="flex gap-4 overflow-x-auto px-6 md:px-12 pb-4 scrollbar-hide">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  </section>
);

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, p, tr] = await Promise.all([
          api.get("/movies/trending"),
          api.get("/movies/popular"),
          api.get("/movies/top-rated"),
        ]);
        setTrending(t.data.results);
        setPopular(p.data.results);
        setTopRated(tr.data.results);
        // Pick a random hero from trending
        const heroMovies = t.data.results.filter((m) => m.backdrop_path);
        setHero(heroMovies[Math.floor(Math.random() * 5)]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted font-body text-sm">Loading MovieHerum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HERO */}
      {hero && (
        <section className="relative h-[85vh] flex items-end">
          {/* Backdrop */}
          <div className="absolute inset-0">
            <img
              src={`${IMG_BASE}/original${hero.backdrop_path}`}
              alt={hero.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 md:px-12 pb-20 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 bg-gold" />
              <span className="text-gold text-xs font-body uppercase tracking-widest">
                Trending Now
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black text-light leading-tight mb-4">
              {hero.title}
            </h1>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5 text-gold">
                <FiStar size={16} fill="currentColor" />
                <span className="font-body font-medium">
                  {hero.vote_average?.toFixed(1)}
                </span>
              </div>
              <span className="text-muted font-body text-sm">
                {hero.release_date?.slice(0, 4)}
              </span>
            </div>
            <p className="text-light/70 font-body text-base leading-relaxed mb-8 line-clamp-3">
              {hero.overview}
            </p>
            <div className="flex gap-4">
              <Link
                to={`/movie/${hero.id}`}
                className="flex items-center gap-2 bg-gold text-bg font-body font-semibold px-6 py-3 rounded hover:bg-gold-dim transition-colors"
              >
                <FiPlay size={18} fill="currentColor" />
                View Details
              </Link>
              <button className="flex items-center gap-2 border border-border text-light font-body px-6 py-3 rounded hover:border-gold hover:text-gold transition-colors">
                <FiPlus size={18} />
                Watchlist
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MOVIE SECTIONS */}
      <div className="mt-8">
        <Section
          title="Trending This Week"
          movies={trending}
          link="/browse?sort=trending"
        />
        <Section
          title="Popular Now"
          movies={popular}
          link="/browse?sort=popular"
        />
        <Section
          title="All Time Greats"
          movies={topRated}
          link="/browse?sort=top-rated"
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-10 py-8 px-6 md:px-12 text-center">
        <p className="font-display text-gold text-lg mb-1">MovieHerum</p>
        <p className="text-muted text-xs font-body">
          Your cinematic universe — discover, rate, and collect films.
        </p>
      </footer>
    </div>
  );
};

export default Home;
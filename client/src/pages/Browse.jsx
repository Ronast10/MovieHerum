import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiSearch, FiStar, FiFilter } from "react-icons/fi";
import api from "../services/api";

const IMG_BASE = "https://image.tmdb.org/t/p";

const MovieCard = ({ movie }) => (
  <Link to={`/movie/${movie.id}`} className="group cursor-pointer">
    <div className="relative overflow-hidden rounded-lg">
      <img
        src={movie.poster_path ? `${IMG_BASE}/w300${movie.poster_path}` : "/no-poster.png"}
        alt={movie.title}
        className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-light text-xs font-body line-clamp-3 leading-tight">{movie.overview}</p>
      </div>
      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gold text-xs font-body px-1.5 py-0.5 rounded flex items-center gap-1">
        <FiStar size={10} fill="currentColor" />
        {movie.vote_average?.toFixed(1)}
      </div>
    </div>
    <p className="mt-2 text-light text-sm font-body font-medium line-clamp-1 group-hover:text-gold transition-colors">{movie.title}</p>
    <p className="text-muted text-xs font-body">{movie.release_date?.slice(0, 4)}</p>
  </Link>
);

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeGenre, setActiveGenre] = useState("");
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");

  useEffect(() => {
    api.get("/movies/genres").then(({ data }) => setGenres(data.genres));
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [page, activeGenre, sort]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) { setQuery(q); handleSearch(q); }
  }, [searchParams]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let res;
      if (activeGenre) {
        res = await api.get(`/movies/discover?genre=${activeGenre}&page=${page}`);
      } else if (sort === "top-rated") {
        res = await api.get(`/movies/top-rated?page=${page}`);
      } else if (sort === "trending") {
        res = await api.get(`/movies/trending`);
        setMovies(res.data.results);
        setLoading(false);
        return;
      } else {
        res = await api.get(`/movies/popular?page=${page}`);
      }
      setMovies(res.data.results);
      setTotalPages(Math.min(res.data.total_pages, 20));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q = query) => {
    if (!q.trim()) return fetchMovies();
    setLoading(true);
    try {
      const { data } = await api.get(`/movies/search?q=${q}&page=${page}`);
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages, 20));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenre = (id) => {
    setActiveGenre(id === activeGenre ? "" : id);
    setPage(1);
    setQuery("");
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-light mb-1">Browse</h1>
        <p className="text-muted font-body text-sm">Discover your next favourite film</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-lg">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search any movie..."
            className="w-full bg-surface border border-border text-light font-body text-sm pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors placeholder:text-muted"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          className="bg-gold text-bg font-body font-semibold px-6 py-3 rounded-lg hover:bg-gold-dim transition-colors"
        >
          Search
        </button>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-surface border border-border text-light font-body text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-gold"
        >
          <option value="popular">Popular</option>
          <option value="top-rated">Top Rated</option>
          <option value="trending">Trending</option>
        </select>
      </div>

      {/* Genre Pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => handleGenre(String(g.id))}
            className={`px-4 py-1.5 rounded-full text-xs font-body transition-colors border ${
              activeGenre === String(g.id)
                ? "bg-gold text-bg border-gold"
                : "bg-surface border-border text-muted hover:border-gold hover:text-gold"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 mb-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2 border border-border text-muted font-body text-sm rounded hover:border-gold hover:text-gold transition-colors disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-muted font-body text-sm">
                Page <span className="text-gold">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2 border border-border text-muted font-body text-sm rounded hover:border-gold hover:text-gold transition-colors disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;
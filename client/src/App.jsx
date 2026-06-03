import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import MovieDetail from "./pages/MovieDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import Reviews from "./pages/Reviews";

function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reviews" element={<Reviews />} />
      </Routes>
    </div>
  );
}

export default App;
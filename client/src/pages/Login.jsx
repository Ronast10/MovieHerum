import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-3xl font-bold text-gold">
            Movie<span className="text-light">Herum</span>
          </Link>
          <p className="text-muted font-body text-sm mt-2">
            Sign in to your cinematic universe
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="font-display text-2xl text-light mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-muted text-xs font-body uppercase tracking-wider mb-2 block">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-card border border-border text-light font-body text-sm pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors placeholder:text-muted"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-muted text-xs font-body uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full bg-card border border-border text-light font-body text-sm pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-light"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-bg font-body font-semibold py-3 rounded-lg hover:bg-gold-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-xs font-body">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Login Button */}
          <a
            href="http://localhost:5000/api/auth/google"
            className="w-full flex items-center justify-center gap-3 border border-border text-light font-body text-sm py-3 rounded-lg hover:border-gold hover:text-gold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </a>

          <p className="text-center text-muted font-body text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-gold hover:text-gold-dim transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("invalid");
      setMessage("No verification token found.");
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(({ data }) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("invalid");
        setMessage(err.response?.data?.message || "Invalid or expired link");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === "verifying" && (
          <>
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted font-body">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-6xl mb-6">🎬</div>
            <h2 className="font-display text-3xl text-light mb-3">You're verified!</h2>
            <p className="text-muted font-body text-sm mb-8 leading-relaxed">
              {message || "Your account is now active. Welcome to MovieHerum!"}
            </p>
            <Link
              to="/login"
              className="bg-gold text-bg font-body font-semibold px-8 py-3 rounded-lg hover:bg-gold-dim transition-colors"
            >
              Sign In Now →
            </Link>
          </>
        )}
        {status === "invalid" && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h2 className="font-display text-3xl text-light mb-3">Link Invalid</h2>
            <p className="text-muted font-body text-sm mb-8 leading-relaxed">
              {message || "This verification link is expired or invalid."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/register"
                className="bg-gold text-bg font-body font-semibold px-6 py-3 rounded-lg hover:bg-gold-dim transition-colors"
              >
                Register Again
              </Link>
              <Link
                to="/login"
                className="border border-border text-muted font-body px-6 py-3 rounded-lg hover:border-gold hover:text-gold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
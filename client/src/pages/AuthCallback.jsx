import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const called = useRef(false); // prevent double fire in React StrictMode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setToken(token);
        setUser(user);
        toast.success("Welcome to MovieHerum! 🎬", { id: "google-login" });
        navigate("/", { replace: true });
      } catch {
        toast.error("Login failed, please try again");
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted font-body text-sm">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({ user: data, token: data.accessToken, loading: false });
          return { success: true };
        } catch (err) {
          set({ loading: false });
          return { success: false, message: err.response?.data?.message || "Login failed" };
        }
      },

      register: async (username, email, password) => {
      set({ loading: true });
      try {
      const { data } = await api.post("/auth/register", { username, email, password });
      set({ loading: false });
      return { success: true, message: data.message };
      } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || "Registration failed" };
  }
},

      logout: async () => {
        try { await api.post("/auth/logout"); } catch {}
        set({ user: null, token: null });
      },
    }),
    {
      name: "movieherum-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
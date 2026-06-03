/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0D0D0D",
        surface: "#141414",
        card: "#1A1A1A",
        border: "#2A2A2A",
        gold: "#E8B84B",
        "gold-dim": "#C49A2E",
        muted: "#6B6B6B",
        light: "#E8E8E8",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
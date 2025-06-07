/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        "dark-blue": "#1f2937",
        "deep-purple": "#4c1d95",
        "slate-blue": "#6366f1",
        "light-purple": "#a78bfa",
      },
    },
  },
  plugins: [],
};

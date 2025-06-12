// src/config/api.ts
const API_BASE_URL: string =
  process.env.NODE_ENV === "production"
    ? "https://your-backend-domain.vercel.app"
    : "http://localhost:5000";

export default API_BASE_URL;

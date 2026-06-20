import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!isDev && !backendUrl) {
  console.error(
    "❌ VITE_BACKEND_URL is not set! API calls will fail.\n" +
    "Set it in Netlify → Site Settings → Environment Variables:\n" +
    "  VITE_BACKEND_URL = https://your-backend.onrender.com"
  );
}

const BASE_URL = isDev
  ? "http://localhost:5001/api"
  : backendUrl
  ? `${backendUrl}/api`
  : "/api"; // fallback (will fail cross-domain, but prevents crash)

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

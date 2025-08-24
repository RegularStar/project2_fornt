import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/",
  withCredentials: false,
});

// Add auth headers and user id from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Set user id header if stored
    const uid = localStorage.getItem("uid");
    if (uid) config.headers["X-User-Id"] = uid;

    // Set Authorization header from JWT access token
    const token = localStorage.getItem("accessToken");
    if (token) config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

export default api;

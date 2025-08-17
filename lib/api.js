import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const uid = localStorage.getItem("uid");
    if (uid) config.headers["X-User-Id"] = uid;
  }
  return config;
});

export default api;

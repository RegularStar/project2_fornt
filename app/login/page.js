"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/token/", {
        username,
        password,
      });
      const { access, refresh, user_id } = response.data;
      if (access) {
        // store tokens in localStorage for subsequent requests
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        if (user_id) {
          localStorage.setItem("uid", user_id);
        }
        // redirect to home page after login
        router.push("/");
      } else {
        setError("Invalid server response");
      }
    } catch (err) {
      setError("Invalid username or password");
      console.error("Login failed", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="border border-gray-300 p-4 rounded max-w-sm w-full">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}

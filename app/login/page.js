"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 백엔드 베이스 URL (루트에 .env.local 파일에 설정)
  // NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
  const KAKAO_START_URL =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000") +
    // ⬇️ 너의 백엔드에서 "카카오 로그인 시작" 엔드포인트 경로에 맞춰 수정
    "/user/login/callback/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 혹시 남아 있을 기존 토큰(관리자 토큰 등) 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("uid");

      const response = await api.post("/api/token/", {
        username,
        password,
      });

      const { access, refresh, user_id } = response.data || {};
      if (access) {
        localStorage.setItem("accessToken", access);
        if (refresh) localStorage.setItem("refreshToken", refresh);
        if (user_id) localStorage.setItem("uid", user_id);
        router.push("/");
      } else {
        setError("Invalid server response");
      }
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid username or password");
    }
  };

  const handleKakaoLogin = () => {
    // 카카오 인가 플로우 시작: 백엔드로 이동 → 카카오 → (Django 콜백) → 프론트 /auth/callback
    // (백엔드 kakao_callback에서 최종 리다이렉트:
    //   http://localhost:3000/auth/callback#access=...&refresh=... )
    window.location.href = KAKAO_START_URL;
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="border border-gray-300 p-4 rounded max-w-sm w-full"
      >
        <h1 className="text-xl font-bold mb-4">Login</h1>

        {error && <div className="text-red-500 mb-2">{error}</div>}

        {/* ID / 비밀번호 로그인 */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-2"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-4"
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Login
        </button>

        {/* 구분선 */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 카카오 로그인 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="bg-yellow-300 hover:bg-yellow-400 text-black p-2 w-full rounded"
        >
          카카오로 로그인
        </button>
      </form>
    </div>
  );
}
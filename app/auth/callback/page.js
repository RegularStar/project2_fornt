"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KakaoAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // URL 프래그먼트: #access=...&refresh=...
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const access = params.get("access");
    const refresh = params.get("refresh");

    // 기존 토큰(관리자 등) 제거 후 새 토큰 저장
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("uid");

    if (access) localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);

    router.replace("/"); // 홈으로
  }, [router]);

  return <p>카카오 로그인 처리 중...</p>;
}
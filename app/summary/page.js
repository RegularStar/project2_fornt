"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// 로컬 타임존 기준 YYYY-MM-DD
function toYMDLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SummaryPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  const [recommendations, setRecommendations] = useState([]); // ✅ 추천 상품
  const [loadingRec, setLoadingRec] = useState(false);

  const ymdToday = toYMDLocal(new Date());

  async function fetchMe() {
    try {
      const r1 = await api.get("/api/me/");
      setUser(r1.data);
      return;
    } catch {}
    try {
      const r2 = await api.get("/api/diary/whoami/");
      setUser(r2.data);
    } catch {
      setUser(null);
    }
  }

  async function handleLogout() {
    try {
      await api.post("/api/user/logout/");
    } catch {
      try {
        await api.post("/api/auth/logout/");
      } catch {}
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("uid");
    setUser(null);
    setSummary(null);
    setEntries([]);
    setRecommendations([]);
    router.replace("/login");
  }

  useEffect(() => {
    fetchMe();
  }, []);

  // 오늘 요약/엔트리 로드
  useEffect(() => {
    let cancelled = false;
    async function loadForToday() {
      setLoading(true);
      try {
        try {
          const s = await api.get("/api/diary/summaries/", { params: { date: ymdToday } });
          if (!cancelled) setSummary(s.data);
        } catch (err) {
          if (!cancelled) setSummary(null);
        }

        try {
          const e = await api.get("/api/diary/entries/", { params: { date: ymdToday } });
          if (!cancelled) setEntries(Array.isArray(e.data) ? e.data : []);
        } catch {
          if (!cancelled) setEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (user !== undefined) {
      loadForToday();
    }
    return () => {
      cancelled = true;
    };
  }, [user, ymdToday]);

  // ✅ 추천 상품 불러오기 (summary가 있을 때만)
  useEffect(() => {
    let cancelled = false;
  
    async function loadRecommendations() {
      if (!summary) {
        setRecommendations([]);
        return;
      }
      setLoadingRec(true);
      try {
        // 1) 생성/갱신
        await api.post("/api/coupang/recommendations/", { date: ymdToday });
        // 2) 조회
        const r = await api.get("/api/coupang/recommendations/detail/", {
          params: { date: ymdToday },
        });
        if (!cancelled) setRecommendations(r.data.items || []);
      } catch (err) {
        // 혹시 404 등 에러면 빈 배열
        if (!cancelled) setRecommendations([]);
      } finally {
        if (!cancelled) setLoadingRec(false);
      }
    }
  
    loadRecommendations();
    return () => { cancelled = true; };
  }, [summary, ymdToday]);

  const displayName =
    user?.username ||
    user?.email ||
    (user?.id ? `#${String(user.id).slice(0, 6)}` : null);

  async function handleSummarize() {
    try {
      setSummarizing(true);
      await api.post("/api/diary/finalize-summary/", { date: ymdToday });
      const s = await api.get("/api/diary/summaries/", { params: { date: ymdToday } });
      setSummary(s.data);
      const e = await api.get("/api/diary/entries/", { params: { date: ymdToday } });
      setEntries(Array.isArray(e.data) ? e.data : []);
    } catch (e) {
      alert("요약 생성 중 오류가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3] p-6 max-w-2xl mx-auto relative">
      <nav className="mb-6 text-sm text-gray-600 flex items-center justify-between">
        <div className="flex gap-4">
          <Link href="/" className="hover:underline">메인</Link>
          <Link href="/history" className="hover:underline">히스토리</Link>
          <Link href="/summary" className="hover:underline">요약</Link>
        </div>
        <div className="flex items-center gap-3">
          {displayName && <span className="text-gray-700">👤 {displayName}</span>}
          {user ? (
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border hover:bg-gray-100">
              로그아웃
            </button>
          ) : (
            <Link href="/login" className="px-3 py-1.5 rounded-lg border hover:bg-gray-100">
              로그인
            </Link>
          )}
        </div>
      </nav>

      <h1 className="text-2xl font-semibold text-gray-800 mb-4">오늘의 이야기</h1>

      {/* AI 요약 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        {summary ? (
          <>
            <div className="text-sm text-gray-500 mb-2">
              {new Date(summary.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="border rounded p-3 text-gray-800 whitespace-pre-line">
              {summary.summary_text}
            </div>
            {!!summary.emotion && (
              <div className="mt-3 inline-block text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                대표 감정: {summary.emotion}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">요약 데이터가 없어요.</div>
        )}
      </div>

      {/* 추천 상품 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <h2 className="font-medium text-gray-800 mb-3">추천 상품</h2>
        {loadingRec ? (
          <div className="text-sm text-gray-500">불러오는 중...</div>
        ) : !summary ? (
          <div className="text-sm text-gray-500">요약이 없으므로 추천도 없어요.</div>
        ) : recommendations.length === 0 ? (
          <div className="text-sm text-gray-500">추천 결과가 없어요.</div>
        ) : (
          <ul className="space-y-2">
            {recommendations.map((item, idx) => (
              <li key={idx} className="border rounded p-2 hover:bg-gray-50">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {item.title}
                </a>
                {item.keyword && (
                  <span className="ml-2 text-xs text-gray-500">({item.keyword})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 오늘 일기 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-medium text-gray-800 mb-3">오늘의 감정 흐름</h2>
        {loading ? (
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
        ) : entries.length === 0 ? (
          <div className="text-sm text-gray-500">아직 등록된 한 줄 일기가 없어요.</div>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="border rounded p-2 flex items-center justify-between">
                <div className="text-gray-800">{e.content}</div>
                <div className="text-xs text-gray-500 ml-3">{e.emotion || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={handleSummarize}
        disabled={summarizing}
        className="fixed bottom-6 right-6 rounded-full shadow-lg px-5 py-3 bg-black text-white text-sm disabled:opacity-60"
        title="오늘 일기 요약/감정 분석"
      >
        {summarizing ? "요약 중..." : "요약하기"}
      </button>
    </div>
  );
}
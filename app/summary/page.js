"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function SummaryPage() {
  const [summary, setSummary] = useState(null);     // { date, summary_text, emotion, ... }
  const [entries, setEntries] = useState([]);       // 오늘 한 줄 일기들
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 홈에서 localStorage에 저장했던 요약 불러오기
    const raw = typeof window !== "undefined" ? localStorage.getItem("summary") : null;
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        setSummary(obj);
        // 같은 날짜의 한 줄 일기들 가져오기
        api.get("/diary/entries/", { params: { date: obj.date } })
          .then((res) => setEntries(Array.isArray(res.data) ? res.data : []))
          .catch(() => setEntries([]))
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f3] p-6 max-w-2xl mx-auto">
      {/* 공통 네비 */}
      <nav className="mb-6 text-sm text-gray-600 flex gap-4">
        <Link href="/" className="hover:underline">메인</Link>
        <Link href="/login" className="hover:underline">로그인</Link>
      </nav>

      <h1 className="text-2xl font-semibold text-gray-800 mb-4">오늘의 이야기</h1>

      {/* AI 대필 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        {summary ? (
          <>
            <div className="text-sm text-gray-500 mb-2">
              {new Date(summary.date).toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" })}
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

      {/* 한 줄 일기들 */}
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
    </div>
  );
}

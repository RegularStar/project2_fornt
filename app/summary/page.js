"use client";
import { useEffect, useState } from "react";

export default function SummaryPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("summary");
    if (s) setSummary(JSON.parse(s));
  }, []);

  if (!summary) {
    return <div className="max-w-2xl mx-auto p-6">요약 결과가 없어요. 홈에서 “하루 마무리”를 먼저 눌러주세요.</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">오늘의 이야기</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-500 text-sm mb-1">{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</p>
          <blockquote className="border rounded-lg p-4 bg-gray-50 text-gray-800 mb-4 whitespace-pre-wrap">
            {summary.diary_text}
          </blockquote>
          <div className="flex gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600">
              대표 감정: {summary.emotion}
            </span>
          </div>
        </div>

        {Array.isArray(summary.recommended_items) && summary.recommended_items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">추천 아이템</h2>
            <ul className="space-y-3">
              {summary.recommended_items.map((it, idx) => (
                <li key={idx} className="border rounded-lg px-4 py-3">
                  <div className="font-medium text-gray-800">{it.title}</div>
                  <div className="text-sm text-gray-500">{it.reason}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

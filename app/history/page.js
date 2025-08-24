"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

const EMOTION_COLOR = {
  행복: "bg-orange-400 text-orange-600",
  좋음: "bg-green-400 text-green-600",
  아쉬움: "bg-blue-400 text-blue-600",
  슬픔: "bg-sky-400 text-sky-600",
  분노: "bg-red-400 text-red-600",
  불안: "bg-purple-400 text-purple-600",
};

// yyyy-mm-dd → 'M월 D일'
function prettyDate(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${m}월 ${d}일`;
}

// 로컬타임 YYYY-MM-DD
function toYMDLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 현재 월의 날짜 배열
function buildMonthDays(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const days = Array.from({ length: last }, (_, i) => new Date(y, m, i + 1));
  return { year: y, month: m + 1, days };
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]); // [{date:'YYYY-MM-DD', summary_text, emotion}]
  const [selectedDate, setSelectedDate] = useState(null);
  const [sort, setSort] = useState("desc"); // "desc" | "asc"
  const [emoFilter, setEmoFilter] = useState("전체");

  const { year, month, days: monthDays } = useMemo(() => buildMonthDays(), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        setLoading(true);
        setError("");

        // 1) 작성된 날짜 목록 가져오기
        const daysRes = await api.get("/api/diary/days/");
        const raw = Array.isArray(daysRes.data) ? daysRes.data : [];

        // ✅ 문자열/객체 모두 지원 → YYYY-MM-DD 리스트로 정규화
        const dayList = raw
          .map((v) => {
            if (typeof v === "string") return v.slice(0, 10);
            if (v && typeof v === "object") {
              const s = v.day || v.date || v.created || "";
              return typeof s === "string" ? s.slice(0, 10) : null;
            }
            return null;
          })
          .filter(Boolean);

        // 2) 각 날짜의 요약 동시 로드 (백엔드는 ?date=YYYY-MM-DD 를 기대)
        const settled = await Promise.allSettled(
          dayList.map((d) => api.get("/api/diary/summaries/", { params: { date: d } }))
        );

        const rows = [];
        settled.forEach((r, i) => {
          if (r.status === "fulfilled") {
            const day = dayList[i];
            const { summary_text = "", emotion = "" } = r.value.data || {};
            rows.push({ date: day, summary_text, emotion });
          }
        });

        // 3) 정렬
        rows.sort((a, b) =>
          sort === "desc"
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date)
        );

        if (!cancelled) setEntries(rows);
      } catch (e) {
        if (!cancelled)
          setError("히스토리를 불러오지 못했어요. 백엔드 응답 형식 또는 CORS를 확인해주세요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [sort]);

  const hasEntryDates = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);

  const visible = entries
    .filter((e) => (emoFilter === "전체" ? true : e.emotion === emoFilter))
    .filter((e) => (selectedDate ? e.date === selectedDate : true));

  return (
    <div className="min-h-screen bg-[#f8f6f3] p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-800">지나온 이야기들</h1>
        </div>
        <div className="flex gap-2">
          <select
            value={emoFilter}
            onChange={(e) => setEmoFilter(e.target.value)}
            className="text-sm rounded-xl border px-3 py-2 bg-white shadow-sm"
          >
            <option>전체</option>
            {Object.keys(EMOTION_COLOR).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm rounded-xl border px-3 py-2 bg-white shadow-sm"
          >
            <option value="desc">최신순</option>
            <option value="asc">오래된순</option>
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">
            {year}년 {month}월
          </h3>
          <div className="text-xs text-gray-500">작성한 날짜에 점이 표시돼요</div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((d) => {
            const iso = toYMDLocal(d); // ✅ 로컬 기준
            const isSelected = selectedDate === iso;
            const has = hasEntryDates.has(iso);
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(isSelected ? null : iso)}
                className={`h-10 rounded-xl text-sm flex items-center justify-center transition ${
                  isSelected ? "bg-[#d4c4b0] text-white" : "hover:bg-gray-50 text-gray-800"
                }`}
                title={iso}
              >
                <div className="relative">
                  {d.getDate()}
                  {has && (
                    <span className="absolute -right-2 -top-1 w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl shadow-sm animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {visible.length === 0 ? (
            <div className="text-sm text-gray-500">표시할 히스토리가 없어요.</div>
          ) : (
            visible.map((e) => {
              const color = EMOTION_COLOR[e.emotion] || "bg-gray-300 text-gray-600";
              const [dot, text] = color.split(" ");
              return (
                <div key={e.date} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm text-gray-500">{prettyDate(e.date)}</div>
                      <div className="mt-1 text-gray-800 leading-relaxed whitespace-pre-line">
                        {e.summary_text}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className={`text-xs ${text}`}>{e.emotion || "—"}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
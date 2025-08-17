"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/diary/list/")
      .then((res) => setItems(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">지난 이야기들</h1>

        <div className="bg-white rounded-xl shadow-sm p-5">
          {loading && <div className="text-sm text-gray-500">불러오는 중…</div>}
          {!loading && items.length === 0 && <div className="text-sm text-gray-400">아직 저장된 요약이 없어요.</div>}

          <ul className="divide-y">
            {items.map((d, i) => (
              <li key={i} className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-gray-500">{d.date}</div>
                  <span className="text-xs inline-flex rounded-full px-2 py-1 bg-blue-50 text-blue-600">{d.emotion}</span>
                </div>
                <div className="text-gray-800">{d.summary_text}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

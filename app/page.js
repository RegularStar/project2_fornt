"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

const EMOTIONS = ["행복", "좋음", "아쉬움", "슬픔", "분노", "불안"];

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Home() {
  const [list, setList] = useState([]);         // [{id, content, emotion, date, ...}]
  const [entry, setEntry] = useState("");
  const [emotion, setEmotion] = useState("행복");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingEmotion, setEditingEmotion] = useState("행복");

  const date = useMemo(() => todayISO(), []);

  async function load() {
    const res = await api.get("/diary/entries/", { params: { date } });
    setList(Array.isArray(res.data) ? res.data : []);
  }

  useEffect(() => {
    load().catch(() => setList([]));
  }, [date]);

  async function handleAdd() {
    if (!entry.trim()) return;
    try {
      setSaving(true);
      await api.post("/diary/entries/create/", { content: entry, emotion }); // 백엔드가 emotion 받으면 저장됨
      setEntry("");
      setEmotion("행복");
      await load();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingText(item.content);
    setEditingEmotion(item.emotion || "행복");
  }
  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
    setEditingEmotion("행복");
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      setSaving(true);
      // 1) PUT/PATCH 시도 (백엔드에 해당 엔드포인트가 있을 때)
      try {
        await api.put(`/diary/entries/${editingId}/update/`, {
          content: editingText,
          emotion: editingEmotion,
        });
      } catch {
        try {
          await api.patch(`/diary/entries/${editingId}/update/`, {
            content: editingText,
            emotion: editingEmotion,
          });
        } catch {
          alert("수정 API가 백엔드에 필요해요. (update 엔드포인트가 없거나 권한 문제)");
        }
      }
      await load();
    } finally {
      setSaving(false);
      cancelEdit();
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3] p-6 max-w-2xl mx-auto">
      {/* 공통 네비 */}
      <nav className="mb-6 text-sm text-gray-600 flex gap-4">
        <Link href="/" className="hover:underline">메인</Link>
        <Link href="/login" className="hover:underline">로그인</Link>
        <Link href="/history" className="hover:underline">히스토리</Link>
        <Link href="/summary" className="hover:underline">요약</Link>
      </nav>

      <h1 className="text-2xl font-semibold text-gray-800 mb-4">오늘의 감정 흐름</h1>

      {/* 입력 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex gap-2">
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="한 줄 일기를 입력하세요"
            className="flex-1 border rounded-xl px-3 py-2"
          />
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="border rounded-xl px-3 py-2 bg-white"
          >
            {EMOTIONS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="text-sm text-gray-500">아직 등록된 한 줄 일기가 없어요.</div>
        ) : list.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center justify-between">
            {editingId === item.id ? (
              <>
                <div className="flex-1 flex gap-2">
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 border rounded-xl px-3 py-2"
                  />
                  <select
                    value={editingEmotion}
                    onChange={(e) => setEditingEmotion(e.target.value)}
                    className="border rounded-xl px-3 py-2 bg-white"
                  >
                    {EMOTIONS.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 ml-3">
                  <button onClick={saveEdit} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-xl disabled:opacity-50" disabled={saving}>저장</button>
                  <button onClick={cancelEdit} className="px-3 py-2 text-sm bg-gray-200 rounded-xl">취소</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <div className="text-gray-800">{item.content}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.emotion || "—"}</div>
                </div>
                <button onClick={() => startEdit(item)} className="px-3 py-1.5 text-sm border rounded-xl">
                  편집
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

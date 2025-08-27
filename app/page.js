"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
  const [entry, setEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const date = useMemo(() => todayISO(), []);

  // 로그인 상태 확인
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

  async function load() {
    const res = await api.get("/api/diary/entries/", { params: { date } });
    setList(Array.isArray(res.data) ? res.data : []);
  }

  useEffect(() => {
    fetchMe();
    load().catch(() => setList([]));
  }, [date]);

  // 생성
  async function handleAdd() {
    if (!entry.trim()) return;
    try {
      setSaving(true);
      await api.post("/api/diary/entries/create/", { content: entry });
      setEntry("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  // 수정 시작/취소
  function startEdit(item) {
    setEditingId(item.id);
    setEditingText(item.content);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  // 수정 저장 (PUT/PATCH)
  async function saveEdit() {
    if (!editingId) return;
    try {
      setSaving(true);
      try {
        await api.put(`/api/diary/entries/${editingId}/update/`, { content: editingText });
      } catch {
        await api.patch(`/api/diary/entries/${editingId}/update/`, { content: editingText });
      }
      await load();
    } catch {
      alert("수정 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
      cancelEdit();
    }
  }

  // 삭제
  async function handleDelete(id) {
    if (!confirm("이 일기를 삭제할까요?")) return;
    try {
      setSaving(true);
      await api.delete(`/api/diary/entries/${id}/delete/`);
      // 낙관적 업데이트
      setList((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) cancelEdit();
    } catch {
      alert("삭제 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
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
    router.replace("/login");
  }

  const displayName =
    user?.username || user?.email || (user?.id ? `#${String(user.id).slice(0, 6)}` : null);

  return (
    <div className="min-h-screen bg-[#f8f6f3] p-6 max-w-2xl mx-auto">
      {/* 상단 네비 */}
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

      <h1 className="text-2xl font-semibold text-gray-800 mb-4">오늘의 감정 흐름</h1>

      {/* 입력 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex gap-2">
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="한 줄 일기를 입력하세요"
            className="flex-1 border rounded-xl px-3 py-2"
          />
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
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3 shadow-sm flex items-center justify-between"
          >
            {editingId === item.id ? (
              <>
                <div className="flex-1 flex gap-2">
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
                    className="flex-1 border rounded-xl px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-xl disabled:opacity-50"
                    disabled={saving}
                  >
                    저장
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-2 text-sm bg-gray-200 rounded-xl"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-xl"
                    disabled={saving}
                    title="삭제"
                  >
                    삭제
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <div className="text-gray-800">{item.content}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.emotion || "—"}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 text-sm border rounded-xl"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 text-sm border rounded-xl text-red-600"
                    disabled={saving}
                    title="삭제"
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
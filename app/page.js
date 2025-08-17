"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getOrCreateUid, getNickname, setNickname, maskName } from "@/lib/user";

export default function Home() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([
    "활기차지만 조금 슬프다",
    "쫄깃쫄깃한 간식을 잔뜩 먹었다",
    "오후에 잠깐 쉬고 나니 머리가 맑아졌다",
  ]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    getOrCreateUid();
    setName(getNickname());
  }, []);

  const handleSetName = () => {
    const n = prompt("표시할 이름(닉네임)을 입력하세요:");
    if (n && n.trim()) {
      setNickname(n.trim());
      setName(n.trim());
    }
  };

  async function handleAdd() {
    const v = entry.trim();
    if (!v) return;
    try {
      setSaving(true);
      await api.post("/diary/entries/create/", { content: v });
      setEntries(prev => [...prev, v]);
      setEntry("");
    } catch (e) {
      console.error(e);
      alert("저장 실패: 백엔드 서버/URL을 확인해주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish() {
    try {
      setGenLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const res = await api.post("/diary/generate/", { date: today });
      localStorage.setItem("summary", JSON.stringify(res.data));
      window.location.href = "/summary";
    } catch (e) {
      console.error(e);
      alert("요약 생성 실패: 백엔드 로그를 확인해주세요.");
    } finally {
      setGenLoading(false);
    }
  }

  const handleKeyDown = (e) => e.key === "Enter" && handleAdd();

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-800">한줄일기</h1>
        <div className="text-right">
          <div className="text-xs text-gray-500">안녕하세요</div>
          <div className="text-xs text-gray-400">
            {name ? `${maskName(name)}님` : (
              <button onClick={handleSetName} className="underline hover:text-gray-500">
                이름 설정
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })} · 오늘 {entries.length}개의 기록
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleFinish}
            disabled={genLoading}
            className="bg-[#d4c4b0] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#c4b29d] transition-colors disabled:opacity-60"
          >
            {genLoading ? "생성 중…" : "하루 마무리"}
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-8">
        <p className="text-gray-700 mb-4 font-medium">지금 이 순간, 어떤 기분인가요?</p>
        <p className="text-xs text-gray-500 mb-3">
          {new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" })}
        </p>

        <div className="bg-white rounded-lg border border-gray-100 flex overflow-hidden shadow-sm">
          <input
            type="text"
            placeholder="회의가 잘 끝나서 후련하다"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 outline-none text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="bg-[#d4c4b0] text-white px-5 hover:bg-[#c4b29d] transition-colors text-sm disabled:opacity-60"
          >
            {saving ? "저장…" : "추가"}
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4 text-gray-800">오늘의 감정 흐름</h2>

        <div className="space-y-3">
          {entries.map((e, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm"
            >
              <span className="text-sm text-gray-700 flex-1">{e}</span>
              <button className="text-xs text-gray-400 hover:text-gray-600 ml-2">편집</button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">일주 감정 변화</span>
          <span className="text-xs text-orange-500">• 변화 50%</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          이번 달, 어려웠던 일들 사이로도 조금씩 즐거움이 스며들고 있어요.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-orange-400 h-2 rounded-full w-1/2"></div>
        </div>
      </div>

      {/* Bottom Tags */}
      <div className="flex gap-2">
        {["기쁨", "피곤함", "부족함"].map(tag => (
          <button key={tag} className="text-xs text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50">
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch list of days with diary entries
        const daysRes = await api.get("/diary/days/");
        const days = daysRes.data || [];
        const results = [];
        // Fetch summary for each day
        await Promise.all(
          days.map(async (day) => {
            try {
              const res = await api.get("/diary/summaries/", { params: { date: day } });
              // Ensure data shape has summary_text and emotion
              const { summary_text, emotion } = res.data;
              results.push({ date: day, summary_text, emotion });
            } catch (err) {
              console.error("Failed to fetch summary for", day, err);
            }
          })
        );
        // Sort results by date descending
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEntries(results);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      {entries.map((entry) => (
        <div key={entry.date} className="mb-4 border border-gray-300 rounded p-2">
          <div className="font-semibold">{entry.date}</div>
          <div className="text-sm italic">Emotion: {entry.emotion}</div>
          <div>{entry.summary_text}</div>
        </div>
      ))}
      {entries.length === 0 && <div>No history found.</div>}
    </div>
  );
}

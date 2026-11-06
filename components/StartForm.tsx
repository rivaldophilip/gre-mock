"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function StartForm({ testId }: { testId: string }) {
  const [mode, setMode] = useState<"exam" | "practice">("exam");
  const [timerOn, setTimerOn] = useState(true);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function start() {
    setBusy(true);
    const r = await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ testId, mode, timerOn }),
    });
    const j = await r.json();
    if (r.ok) router.push(`/test/${testId}/run?attempt=${j.id}`);
    else setBusy(false);
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <select value={mode} onChange={(e) => setMode(e.target.value as "exam" | "practice")} className="rounded border bg-transparent px-2 py-1">
        <option value="exam">Exam (review after each section)</option>
        <option value="practice">Practice (answer after each question)</option>
      </select>
      <label className="flex items-center gap-1">
        <input type="checkbox" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} /> Timer
      </label>
      <button disabled={busy} onClick={start} className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50">Start</button>
    </div>
  );
}

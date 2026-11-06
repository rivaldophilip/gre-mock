"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { btn, seg, segItem } from "./ui";

const HINT = {
  exam: "Answers are shown after each section.",
  practice: "The answer is shown after each question.",
};

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
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="radiogroup" aria-label="Mode" className={`${seg} sm:w-64`}>
          {(["exam", "practice"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`${segItem(mode === m)} capitalize`}>
              {m}
            </button>
          ))}
        </div>
        <label className="flex items-center justify-between gap-3 text-sm font-medium sm:justify-start">
          Timer
          <span className="relative inline-flex">
            <input type="checkbox" role="switch" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} className="peer sr-only" />
            <span className="h-6 w-10 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
            <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-surface shadow-sm transition-transform peer-checked:translate-x-4" />
          </span>
        </label>
        <button disabled={busy} onClick={start} className={`${btn("primary")} w-full sm:ml-auto sm:w-auto`}>
          {busy ? "Starting…" : "Start test"}
        </button>
      </div>
      <p className="text-sm text-muted">{HINT[mode]}</p>
    </div>
  );
}

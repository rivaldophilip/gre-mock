"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { btn } from "./ui";

type Mode = "exam" | "practice";

/** One click starts the test in the chosen mode, timed unless the quiz was made untimed. */
export function StartForm({ testId, timerOn = true }: { testId: string; timerOn?: boolean }) {
  const [busy, setBusy] = useState<Mode | null>(null);
  const router = useRouter();
  async function start(mode: Mode) {
    setBusy(mode);
    const r = await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ testId, mode, timerOn }),
    });
    const j = await r.json();
    if (r.ok) router.push(`/test/${testId}/run?attempt=${j.id}`);
    else setBusy(null);
  }
  return (
    <div className="flex gap-2">
      <button disabled={!!busy} onClick={() => start("exam")} className={`${btn("primary", "sm")} flex-1 sm:flex-none`} title="Answers are shown after each section">
        {busy === "exam" ? "Starting…" : "Exam"}
      </button>
      <button disabled={!!busy} onClick={() => start("practice")} className={`${btn("secondary", "sm")} flex-1 sm:flex-none`} title="The answer is shown after each question">
        {busy === "practice" ? "Starting…" : "Practice"}
      </button>
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FallbackDialog, type FallbackLine } from "./FallbackDialog";
import { startAttempt, type Mode } from "./StartForm";
import { IconAlert } from "./icons";
import { btn } from "./ui";

type Draft = { id: number; testId: string; fallbacks: FallbackLine[] };

/**
 * The dashboard's new-quiz card: Exam or Practice assembles a full mock of the tab's measure and starts it at once.
 * A draft (the bank ran short) asks Proceed / Cancel first; a custom quiz is still made on /create.
 */
export function QuickMock({ measure }: { measure: "verbal" | "quant" }) {
  const [busy, setBusy] = useState<Mode | null>(null);
  const [error, setError] = useState<string[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const router = useRouter();

  async function start(testId: string, mode: Mode) {
    if (!(await startAttempt(router, testId, mode, true))) {
      setBusy(null);
      setError(["could not start the quiz"]);
      router.refresh();
    }
  }
  async function go(mode: Mode) {
    setBusy(mode);
    setError(null);
    const r = await fetch("/api/quizzes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "mock", measure }) });
    const j = await r.json().catch(() => null);
    if (!r.ok) {
      setBusy(null);
      setError(j?.failures?.map((f: FallbackLine) => f.note) ?? [j?.error ?? "could not assemble a quiz"]);
    } else if (j.status === "draft") setDraft({ id: j.id, testId: j.testId, fallbacks: j.fallbacks });
    else await start(j.testId, mode);
  }

  return (
    <section className="space-y-2.5 rounded-xl border border-accent/35 bg-accent-soft p-3 sm:px-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold leading-snug capitalize">Full {measure} mock</h2>
          <p className="text-sm text-muted">
            27 questions · aimed at your weak spots · or{" "}
            <Link href={`/create?m=${measure}&kind=custom`} className="font-medium text-accent hover:underline">build a custom quiz</Link>
          </p>
        </div>
        <div className="flex gap-2 sm:flex-none">
          <button disabled={!!busy} onClick={() => go("practice")} className={`${btn("secondary", "sm")} max-sm:flex-1`} title="The answer is shown after each question">
            {busy === "practice" ? "Starting…" : "Practice"}
          </button>
          <button disabled={!!busy} onClick={() => go("exam")} className={`${btn("primary", "sm")} max-sm:flex-1`} title="Answers are shown after each section">
            {busy === "exam" ? "Starting…" : "Exam"}
          </button>
        </div>
      </div>
      {error && (
        <div className="space-y-1 rounded-xl bg-bad-soft px-4 py-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-bad"><IconAlert size={16} /> The bank cannot fill this quiz</p>
          <ul className="list-disc space-y-0.5 pl-5">{error.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      {draft && busy && (
        <FallbackDialog
          quizId={draft.id}
          fallbacks={draft.fallbacks}
          onProceed={() => {
            setDraft(null);
            start(draft.testId, busy);
          }}
          onCancel={() => {
            setDraft(null);
            setBusy(null);
          }}
        />
      )}
    </section>
  );
}

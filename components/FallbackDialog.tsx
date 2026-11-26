"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlert } from "./icons";
import { btn, card } from "./ui";

export type FallbackLine = { slotId: string; note: string; step: number };

/**
 * The bank could not fill every slot exactly: one line per slot that fell back, then Proceed (the draft becomes a
 * ready quiz) or Cancel (it is discarded and its items go back to the stock). Either way the shortfall is logged for
 * the next refill.
 */
export function FallbackDialog({ quizId, fallbacks, onProceed, onCancel }: { quizId: number; fallbacks: FallbackLine[]; onProceed: () => void; onCancel: () => void }) {
  const [busy, setBusy] = useState<"go" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function proceed() {
    setBusy("go");
    const r = await fetch(`/api/quizzes/${quizId}/confirm`, { method: "POST" });
    setBusy(null);
    if (r.ok) onProceed();
    else setError((await r.json().catch(() => null))?.error ?? "could not confirm");
  }
  async function cancel() {
    setBusy("cancel");
    await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
    setBusy(null);
    onCancel();
  }
  return (
    <div role="dialog" aria-modal aria-labelledby="fallback-title" className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-4">
      <div className={`${card} max-h-[85dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-b-none p-5 sm:rounded-2xl sm:p-6`}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warn-soft text-warn"><IconAlert size={20} /></span>
          <div>
            <h2 id="fallback-title" className="text-lg font-semibold">The bank ran short</h2>
            <p className="text-sm text-muted">
              {fallbacks.length} slot{fallbacks.length === 1 ? "" : "s"} could not be filled exactly. The quiz is ready with these substitutes; the gaps are noted for the next refill.
            </p>
          </div>
        </div>
        <ul className="space-y-1.5 text-sm">
          {fallbacks.map((f) => (
            <li key={f.slotId} className="rounded-xl bg-surface-2 px-3.5 py-2.5">{f.note}</li>
          ))}
        </ul>
        {error && <p className="text-sm text-bad">{error}</p>}
        <div className="flex gap-2">
          <button className={`${btn("secondary")} flex-1`} disabled={!!busy} onClick={cancel}>{busy === "cancel" ? "Cancelling…" : "Cancel"}</button>
          <button className={`${btn("primary")} flex-1`} disabled={!!busy} onClick={proceed} autoFocus>{busy === "go" ? "Saving…" : "Proceed"}</button>
        </div>
      </div>
    </div>
  );
}

/** A draft on the dashboard: opens the dialog again; Proceed turns it into a ready quiz. */
export function DraftReview({ quizId, fallbacks }: { quizId: number; fallbacks: FallbackLine[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button className={btn("primary", "sm")} onClick={() => setOpen(true)}>Review</button>
      {open && <FallbackDialog quizId={quizId} fallbacks={fallbacks} onProceed={() => { setOpen(false); router.refresh(); }} onCancel={() => { setOpen(false); router.refresh(); }} />}
    </>
  );
}

/** Discard a ready quiz (its items go back to the stock). */
export function QuizDiscard({ quizId }: { quizId: number }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function discard() {
    if (!window.confirm("Discard this quiz? Its questions go back to the bank for later quizzes.")) return;
    setBusy(true);
    const r = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
    if (r.ok) router.refresh();
    setBusy(false);
  }
  return (
    <button disabled={busy} onClick={discard} className={btn("ghost", "sm")}>Discard</button>
  );
}

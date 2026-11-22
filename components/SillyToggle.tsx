"use client";
import { useState } from "react";

/** Label classes shared with the "I guessed" checkbox, so the two sit on one line and align. */
export const flagLabel = "flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-muted";

/**
 * On a wrong quant answer, once it is shown: mark the miss a silly mistake (a slip, not a gap in the concept). Its
 * concept weakness then counts half, so the concept comes back less than after a real miss. Untick to undo.
 */
export function SillyToggle({ attemptId, questionId, initial = false, onChange }: { attemptId: number; questionId: string; initial?: boolean; onChange?: (silly: boolean) => void }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  async function toggle(next: boolean) {
    if (busy) return;
    setBusy(true);
    const ok = await fetch(`/api/attempts/${attemptId}/silly`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId, silly: next }) })
      .then((r) => r.ok)
      .catch(() => false);
    setBusy(false);
    setErr(!ok);
    if (ok) {
      setOn(next);
      onChange?.(next);
    }
  }
  return (
    <label className={`${flagLabel} ${on ? "font-medium text-warn" : err ? "text-bad" : ""}`} title="A slip (misread, arithmetic, copied wrong), not a gap in the concept: the miss counts half against it">
      <input type="checkbox" className="size-5 accent-warn" checked={on} disabled={busy} onChange={(e) => void toggle(e.target.checked)} />
      Silly mistake
      {err && <span className="text-xs">(not saved, try again)</span>}
    </label>
  );
}

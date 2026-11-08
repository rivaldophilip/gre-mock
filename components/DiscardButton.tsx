"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconX } from "./icons";

const WARN = {
  exam: "Discard this attempt? Answers in the section you have not finished will not count toward your stats. You can still review it and start the test again.",
  practice: "Discard this attempt? Answers you already checked still count. You can still review it and start the test again.",
};

/** Abandon an unfinished attempt so the test can be started again. */
export function DiscardButton({ attemptId, mode }: { attemptId: number; mode: "exam" | "practice" }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function discard() {
    if (!window.confirm(WARN[mode])) return;
    setBusy(true);
    const r = await fetch(`/api/attempts/${attemptId}/abandon`, { method: "POST" });
    if (r.ok) router.refresh();
    setBusy(false);
  }
  return (
    <button disabled={busy} onClick={discard} aria-label="Discard attempt" title="Discard attempt" className="inline-grid size-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-surface hover:text-fg disabled:opacity-45">
      <IconX size={16} />
    </button>
  );
}

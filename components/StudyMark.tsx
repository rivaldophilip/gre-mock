"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MarkKind, MarkState } from "@/lib/study";
import { IconArchive, IconTrash, IconUndo } from "./icons";

const small = "inline-grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-45";

/** Archive (studied: folds it away), delete (drops it from the guide) or restore one formula card or topic card, as bare icons for the card's corner. */
export function StudyMark({ measure, kind, id, state }: { measure: string; kind: Exclude<MarkKind, "topic">; id: string; state?: MarkState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function set(next: MarkState | "shown") {
    if (next === "deleted" && !window.confirm("Delete this card from your guide? You can restore it from “Removed” at the bottom of the page.")) return;
    setBusy(true);
    const r = await fetch("/api/study", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ measure, kind, id, state: next }) });
    setBusy(false);
    if (r.ok) startTransition(() => router.refresh());
  }

  const off = busy || pending;
  const actions = [
    ...(state ? [{ next: "shown" as const, label: "Restore card", Icon: IconUndo }] : [{ next: "archived" as const, label: "Archive: studied it, fold it away", Icon: IconArchive }]),
    ...(state === "deleted" ? [] : [{ next: "deleted" as const, label: "Delete card", Icon: IconTrash }]),
  ];

  return (
    <div className="flex shrink-0 items-center gap-1 print:hidden">
      {actions.map(({ next, label, Icon }) => (
        <button key={next} type="button" disabled={off} onClick={() => set(next)} aria-label={label} title={label} className={small}>
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

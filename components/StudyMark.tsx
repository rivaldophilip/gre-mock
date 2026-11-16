"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MarkKind, MarkState } from "@/lib/study";
import { btn } from "./ui";
import { IconArchive, IconTrash, IconUndo } from "./icons";

const NOUN: Record<MarkKind, string> = { card: "card", topic: "topic" };
const small = "inline-grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-45";

/**
 * Archive (studied: folds it away), delete (drops it from the guide) or restore one formula card or topic.
 * `compact` draws bare icons for a formula card's corner; otherwise labelled buttons for a topic's footer.
 */
export function StudyMark({ measure, kind, id, state, compact }: { measure: string; kind: MarkKind; id: string; state?: MarkState; compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const noun = NOUN[kind];

  async function set(next: MarkState | "shown") {
    if (next === "deleted" && !window.confirm(`Delete this ${noun} from your guide? You can restore it from “Removed” at the bottom of the page.`)) return;
    setBusy(true);
    const r = await fetch("/api/study", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ measure, kind, id, state: next }) });
    setBusy(false);
    if (r.ok) startTransition(() => router.refresh());
  }

  const off = busy || pending;
  const actions = [
    ...(state ? [{ next: "shown" as const, label: "Restore", Icon: IconUndo }] : [{ next: "archived" as const, label: "Archive", Icon: IconArchive }]),
    ...(state === "deleted" ? [] : [{ next: "deleted" as const, label: "Delete", Icon: IconTrash }]),
  ];
  const title = (label: string) => (label === "Archive" ? `Archive: studied it, fold it away` : `${label} ${noun}`);

  return (
    <div className="flex shrink-0 items-center gap-1 print:hidden">
      {actions.map(({ next, label, Icon }) =>
        compact ? (
          <button key={next} type="button" disabled={off} onClick={() => set(next)} aria-label={`${label} ${noun}`} title={title(label)} className={small}>
            <Icon size={14} />
          </button>
        ) : (
          <button key={next} type="button" disabled={off} onClick={() => set(next)} title={title(label)} className={btn(next === "deleted" ? "ghost" : "secondary", "sm")}>
            <Icon size={15} />
            {label === "Archive" ? "Studied it, archive" : label}
          </button>
        ),
      )}
    </div>
  );
}

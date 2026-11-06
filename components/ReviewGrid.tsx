"use client";
import { useEffect } from "react";
import { IconX } from "./icons";

export interface GridItem {
  n: number; // display number within section
  answered: boolean;
  marked: boolean;
}

/** Section overview: bottom sheet on phones, centered dialog on larger screens. */
export function ReviewGrid({
  items,
  current,
  onGo,
  onClose,
  title = "Review",
  footer,
}: {
  items: GridItem[];
  current: number;
  onGo: (i: number) => void;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
}) {
  const unanswered = items.filter((i) => !i.answered).length;
  const marked = items.filter((i) => i.marked).length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close review" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-scrim backdrop-blur-[2px]" />
      <div className="relative w-full max-w-lg space-y-4 rounded-t-3xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgb(0_0_0/0.2)] md:rounded-3xl md:pb-5 md:shadow-xl">
        <div className="mx-auto -mt-1 h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted">
              {unanswered} unanswered · {marked} marked
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close review" className="grid size-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg">
            <IconX size={18} />
          </button>
        </div>
        <div className="grid max-h-[45dvh] grid-cols-5 gap-2 overflow-y-auto p-1 sm:grid-cols-6">
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onGo(i)}
              aria-label={`Question ${it.n}${it.answered ? "" : ", unanswered"}${it.marked ? ", marked" : ""}`}
              className={`relative grid aspect-square place-items-center rounded-xl text-[15px] font-semibold tabular-nums transition-colors ${
                it.answered ? "bg-accent-soft text-accent hover:bg-accent/20" : "border-[1.5px] border-dashed border-line text-muted hover:border-muted"
              } ${i === current ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
            >
              {it.n}
              {it.marked && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-mark" />}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded border-[1.5px] border-accent bg-accent-soft" />Answered</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded border-[1.5px] border-dashed border-muted" />Unanswered</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-mark" />Marked</span>
        </div>
        {footer}
      </div>
    </div>
  );
}

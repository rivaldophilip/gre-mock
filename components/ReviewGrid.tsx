"use client";
export interface GridItem {
  n: number; // display number within section
  answered: boolean;
  marked: boolean;
}

export function ReviewGrid({
  items,
  current,
  onGo,
  onClose,
}: {
  items: GridItem[];
  current: number;
  onGo: (i: number) => void;
  onClose: () => void;
}) {
  const unanswered = items.filter((i) => !i.answered).length;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-label="Review">
      <div className="w-full max-w-lg rounded-lg bg-[var(--background)] p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Review — {unanswered} unanswered, {items.filter((i) => i.marked).length} marked</h2>
          <button onClick={onClose} aria-label="Close review">✕</button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => onGo(i)}
              className={`relative rounded border py-3 text-sm ${i === current ? "ring-2 ring-blue-500" : ""} ${it.answered ? "bg-green-500/15" : "bg-red-500/10"}`}
            >
              {it.n}
              {it.marked && <span className="absolute right-1 top-0 text-orange-500">⚑</span>}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs opacity-70">Green = answered · red = unanswered · ⚑ = marked</p>
      </div>
    </div>
  );
}

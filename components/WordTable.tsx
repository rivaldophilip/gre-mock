"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TableShell } from "@/components/ShowMore";
import { btn } from "@/components/ui";

export type WordRow = {
  id: string;
  lemma: string;
  /** position in priority order */
  rank: number;
  S: number;
  ms: number | null;
  /** a secondary-sense word's GRE sense: dismissing it asks first */
  gre?: string;
  /** the server-rendered cells, after the checkbox */
  cells: React.ReactNode;
};

type Sort = "az" | "weak" | "time";
/** Each sortable column's default order (first click); a second click reverses it. */
const SORTS: Record<Sort, (a: WordRow, b: WordRow) => number> = {
  az: (a, b) => a.lemma.localeCompare(b.lemma),
  weak: (a, b) => b.S - a.S || a.rank - b.rank,
  time: (a, b) => (b.ms ?? -1) - (a.ms ?? -1) || a.rank - b.rank,
};
const UNDO_MS = 6000;
/** Swiping the undo toast this far sideways, or this far down, closes it (keeping the dismissal). */
const SWIPE_X = 70;
const SWIPE_DOWN = 36;

async function send(method: "POST" | "DELETE", ids: string[]) {
  const r = await fetch("/api/words/dismiss", { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) });
  return r.ok;
}

/**
 * The weakest-words list: sorted by clicking a column header, a page at a time. Ticking words (a row click, Shift for a
 * range) offers Dismiss: in the header row on wider screens, in a bar docked to the bottom on phones. Esc clears the
 * ticks, Delete dismisses them, and a toast offers Undo.
 */
export function WordTable({ head, sorts, rows, pageSize = 15 }: { head: string[]; sorts: (Sort | null)[]; rows: WordRow[]; pageSize?: number }) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [sort, setSort] = useState<{ by: Sort; desc: boolean }>({ by: "weak", desc: false });
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ids: string[]; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // the toast follows a drag; a swipe sideways or down closes it, so it stops covering the list
  const dragFrom = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const cmp = SORTS[sort.by];
  const hits = rows.toSorted(sort.desc ? (a, b) => cmp(b, a) : cmp);
  const pages = Math.max(1, Math.ceil(hits.length / pageSize));
  const p = Math.min(page, pages - 1);
  const from = p * pageSize;
  const shown = hits.slice(from, from + pageSize);
  // ticks on rows that left the list (dismissed, or missed elsewhere) no longer count
  const live = new Set(rows.map((r) => r.id));
  const picked = [...sel].filter((id) => live.has(id));
  const n = picked.length;
  const onPage = shown.filter((r) => sel.has(r.id)).length;
  const off = busy || refreshing;

  const clear = () => {
    setSel(new Set());
    setAnchor(null);
  };

  const toggle = (id: string, shift: boolean) => {
    const next = new Set(sel);
    if (shift && anchor) {
      const ids = hits.map((r) => r.id);
      const [a, b] = [ids.indexOf(anchor), ids.indexOf(id)].sort((x, y) => x - y);
      if (a >= 0) for (const x of ids.slice(a, b + 1)) next.add(x);
      else next.add(id);
    } else {
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setAnchor(id);
    }
    setSel(next);
  };

  const togglePage = () => {
    const next = new Set(sel);
    if (onPage === shown.length) for (const r of shown) next.delete(r.id);
    else for (const r of shown) next.add(r.id);
    setSel(next);
  };

  async function dismiss() {
    if (!n || off) return;
    const words = rows.filter((r) => sel.has(r.id));
    const gre = words.filter((w) => w.gre);
    if (gre.length && !window.confirm(`${gre.map((w) => `“${w.lemma}” usually means “${w.gre}” on the GRE`).join("; ")}. Dismiss anyway?`)) return;
    setBusy(true);
    const ok = await send("POST", picked);
    setBusy(false);
    if (!ok) return;
    clear();
    clearTimeout(timer.current);
    setToast({ ids: picked, text: words.length > 2 ? `${words.length} words` : words.map((w) => w.lemma).join(", ") });
    timer.current = setTimeout(() => setToast(null), UNDO_MS);
    startTransition(() => router.refresh());
  }

  const closeToast = () => {
    clearTimeout(timer.current);
    setToast(null);
    setDrag({ x: 0, y: 0 });
  };

  async function undo() {
    if (!toast) return;
    clearTimeout(timer.current);
    const ids = toast.ids;
    setToast(null);
    if (await send("DELETE", ids)) startTransition(() => router.refresh());
  }

  // Esc clears the ticks and Delete dismisses them, unless the keys are meant for a text field
  useEffect(() => {
    if (!n) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input[type=text], input[type=search], textarea, [contenteditable]")) return;
      if (e.key === "Escape") clear();
      else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  const pager = pages > 1 && (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm">
      <button type="button" className={btn("ghost", "sm")} disabled={p === 0} onClick={() => setPage(p - 1)}>‹ Prev</button>
      <span className="tabular-nums text-muted">{from + 1}–{from + shown.length} of {hits.length}</span>
      <button type="button" className={btn("ghost", "sm")} disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Next ›</button>
    </div>
  );

  // drawn twice (header row and selection bar) in the same spot, so it reads as one box
  const selectAll = (
    <input ref={(el) => { if (el) el.indeterminate = onPage > 0 && onPage < shown.length; }} type="checkbox" className="cbx" checked={shown.length > 0 && onPage === shown.length} onChange={togglePage} aria-label="Tick every word on this page" />
  );
  const cells = [
    selectAll,
    ...head.map((h, i) => {
      const by = sorts[i];
      if (!by) return h;
      const on = sort.by === by;
      return (
        <button
          key={by}
          type="button"
          onClick={() => { setSort({ by, desc: on ? !sort.desc : false }); setPage(0); }}
          aria-label={`Sort by ${h}`}
          className={`inline-flex items-center gap-1 uppercase tracking-[0.06em] hover:text-fg ${on ? "text-fg" : ""}`}
        >
          {h}
          <span aria-hidden className={`text-[10px] ${on ? "" : "opacity-40"}`}>{on ? (sort.desc ? "▲" : "▼") : "↕"}</span>
        </button>
      );
    }),
  ];
  const dismissLabel = `Dismiss ${n} word${n === 1 ? "" : "s"}`;
  // wider screens: while words are ticked, a selection bar covers the header row at its exact height (sorting waits
  // until Cancel). The checkbox sits where the header's does and the count lines up with the Word column, so nothing moves.
  const selectionBar = n > 0 && (
    <div className="hidden h-full items-center justify-between gap-3 bg-surface-2 pr-2 pl-4 sm:flex">
      <span className="flex items-center gap-8">
        {selectAll}
        <span className="text-sm font-medium tabular-nums">{n} selected</span>
      </span>
      <span className="flex items-center gap-1">
        <button type="button" onClick={clear} className="h-7 rounded-lg px-2.5 text-[13px] font-medium text-muted hover:bg-line/60 hover:text-fg">Cancel</button>
        <button type="button" disabled={off} onClick={dismiss} className="h-7 rounded-lg bg-bad px-3 text-[13px] font-semibold text-bad-fg hover:bg-bad/90 disabled:opacity-45">{dismissLabel}</button>
      </span>
    </div>
  );

  return (
    <>
      <TableShell head={cells} footer={pager} overlay={selectionBar || undefined}>
        {shown.map((r) => {
          const on = sel.has(r.id);
          return (
            <tr
              key={r.id}
              onClick={(e) => {
                // the row toggles, but not when the click was meant for something inside it (an explanation, a link)
                if ((e.target as HTMLElement).closest("a, button, input, label, summary, [tabindex]")) return;
                toggle(r.id, e.shiftKey);
              }}
              onMouseDown={(e) => { if (e.shiftKey) e.preventDefault(); }}
              className={`cursor-pointer ${on ? "bg-fg/5" : "hover:bg-surface-2/50"}`}
            >
              <td className="w-px !pr-0">
                <input
                  type="checkbox"
                  className="cbx"
                  checked={on}
                  onChange={() => {}}
                  onClick={(e) => toggle(r.id, e.shiftKey)}
                  aria-label={`Tick ${r.lemma}`}
                />
              </td>
              {r.cells}
            </tr>
          );
        })}
      </TableShell>

      {/* phones: a toolbar docked to the bottom, in thumb reach */}
      {n > 0 && (
        <>
          <div className="h-16 sm:hidden" aria-hidden />
          <div
            role="toolbar"
            aria-label="Ticked words"
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center border-t border-line bg-surface/90 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden"
          >
            <button type="button" onClick={clear} className="h-11 justify-self-start rounded-lg px-3 text-[15px] font-medium text-accent active:bg-surface-2">Cancel</button>
            <span className="text-[13px] tabular-nums text-muted">{n} selected</span>
            <button type="button" disabled={off} onClick={dismiss} className="h-11 justify-self-end rounded-lg px-3 text-[15px] font-semibold text-bad active:bg-surface-2 disabled:opacity-45">Dismiss</button>
          </div>
        </>
      )}

      {toast && (
        <div
          role="status"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            dragFrom.current = { x: e.clientX, y: e.clientY };
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragFrom.current) return;
            setDrag({ x: e.clientX - dragFrom.current.x, y: Math.max(0, e.clientY - dragFrom.current.y) });
          }}
          onPointerUp={() => {
            if (!dragFrom.current) return;
            dragFrom.current = null;
            setDragging(false);
            if (Math.abs(drag.x) > SWIPE_X || drag.y > SWIPE_DOWN) closeToast();
            else setDrag({ x: 0, y: 0 });
          }}
          onPointerCancel={() => { dragFrom.current = null; setDragging(false); setDrag({ x: 0, y: 0 }); }}
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px)`,
            opacity: 1 - Math.min(0.7, Math.max(Math.abs(drag.x) / (SWIPE_X * 2), drag.y / (SWIPE_DOWN * 2))),
            transition: dragging ? "none" : "transform .18s ease-out, opacity .18s ease-out",
          }}
          className="fixed touch-none select-none inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex items-center justify-between gap-3 rounded-xl bg-fg py-2.5 pr-2 pl-4 text-sm text-canvas shadow-lg sm:right-auto sm:left-1/2 sm:w-96 sm:-translate-x-1/2"
        >
          <span className="min-w-0 truncate">Dismissed {toast.text}</span>
          <button type="button" onClick={undo} className="rounded-lg px-2 py-1.5 font-semibold underline underline-offset-4 hover:bg-canvas/10">Undo</button>
        </div>
      )}
    </>
  );
}

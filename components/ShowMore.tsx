"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { card } from "@/components/ui";

/** Folds a stats table or list to its first `shown` rows, with a toggle to show the rest. */
function useFold<T>(rows: T[], shown?: number) {
  const [open, setOpen] = useState(false);
  const folds = shown !== undefined && rows.length > shown;
  return { visible: folds && !open ? rows.slice(0, shown) : rows, folds, open, toggle: () => setOpen((o) => !o) };
}

function Toggle({ open, n, noun, onClick }: { open: boolean; n: number; noun: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full px-4 py-2.5 text-center text-sm text-muted underline-offset-4 hover:bg-surface-2/60 hover:text-fg hover:underline">
      {open ? "Show fewer" : `Show all ${n} ${noun}`}
    </button>
  );
}

/**
 * The stats table card: header row, scrolling body, and an optional footer under the scroll area. `overlay` (a
 * selection bar) is laid over the header row at its exact height, so the columns and rows never move when it shows.
 */
export function TableShell({ head, children, footer, overlay }: { head: React.ReactNode[]; children: React.ReactNode; footer?: React.ReactNode; overlay?: React.ReactNode }) {
  const headRef = useRef<HTMLTableSectionElement>(null);
  const [headH, setHeadH] = useState(0);
  useLayoutEffect(() => {
    const el = headRef.current;
    if (!el || !overlay) return;
    const measure = () => setHeadH(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [overlay]);
  return (
    <div className={`${card} relative overflow-hidden`}>
      {overlay && headH > 0 && <div className="absolute inset-x-0 top-0 z-10" style={{ height: headH }}>{overlay}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_tr]:border-t [&_tr]:border-line">
          <thead ref={headRef}>
            <tr className="!border-t-0 bg-surface-2/60 text-left">
              {head.map((h, i) => (
                <th key={i} className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {footer && <div className="border-t border-line">{footer}</div>}
    </div>
  );
}

export function Table({ head, rows, shown, noun = "rows" }: { head: string[]; rows: React.ReactNode[]; shown?: number; noun?: string }) {
  const { visible, folds, open, toggle } = useFold(rows, shown);
  return (
    <TableShell head={head} footer={folds && <Toggle open={open} n={rows.length} noun={noun} onClick={toggle} />}>
      {visible}
    </TableShell>
  );
}

export function List({ items, shown, noun = "items" }: { items: React.ReactNode[]; shown?: number; noun?: string }) {
  const { visible, folds, open, toggle } = useFold(items, shown);
  return (
    <ul className={`${card} divide-y divide-line overflow-hidden`}>
      {visible}
      {folds && <li><Toggle open={open} n={items.length} noun={noun} onClick={toggle} /></li>}
    </ul>
  );
}

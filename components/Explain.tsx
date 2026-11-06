"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const W = 300;

/**
 * A value with a dotted underline that shows how it was derived on hover, or on tap/focus on touch.
 * The tooltip is position:fixed, so scrolling table wrappers don't clip it. `why` lines split on "\n".
 */
export function Explain({ children, why }: { children: ReactNode; why: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  const [pos, setPos] = useState<{ left: number; top: number; width: number; up: boolean } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(W, window.innerWidth - 32);
    const left = Math.min(Math.max(16, r.left + r.width / 2 - width / 2), window.innerWidth - 16 - width);
    const up = r.bottom + 220 > window.innerHeight && r.top > 220;
    setPos({ left, top: up ? r.top - 6 : r.bottom + 6, width, up });
  };
  const hide = () => setPos(null);

  useEffect(() => {
    if (!pos) return;
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [pos]);

  return (
    <span
      ref={ref}
      tabIndex={0}
      aria-describedby={pos ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="cursor-help rounded underline decoration-muted/60 decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {children}
      {pos && (
        <span
          id={id}
          role="tooltip"
          style={{ left: pos.left, top: pos.top, width: pos.width, transform: pos.up ? "translateY(-100%)" : undefined }}
          className="pointer-events-none fixed z-50 block whitespace-pre-line rounded-xl border border-line bg-surface-2 p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-fg shadow-lg"
        >
          {why}
        </span>
      )}
    </span>
  );
}

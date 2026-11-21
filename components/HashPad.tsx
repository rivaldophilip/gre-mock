"use client";

import { useEffect, useRef } from "react";

/**
 * Lets a #id jump bring even the page's last cards to the top. Without it the browser stops at the page bottom, so a
 * jump to the last question leaves the one before it filling the screen. Place it at the end of the page: it grows just
 * enough, on load and on every in-page jump, and then scrolls the target into view.
 */
export function HashPad() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      const pad = ref.current;
      const el = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (!pad || !el) return;
      pad.style.height = "0px";
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      const top = el.getBoundingClientRect().top + window.scrollY - margin;
      const short = top + window.innerHeight - document.documentElement.scrollHeight;
      pad.style.height = `${Math.max(0, Math.ceil(short))}px`;
      el.scrollIntoView();
    };
    fit();
    window.addEventListener("hashchange", fit);
    return () => window.removeEventListener("hashchange", fit);
  }, []);
  return <div ref={ref} aria-hidden />;
}

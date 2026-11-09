"use client";

import { useEffect } from "react";

/** Opens the folded <details> a link jumps to (#id), on load and on every in-page jump, and scrolls it into view. */
export function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const el = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (el instanceof HTMLDetailsElement && !el.open) {
        el.open = true;
        el.scrollIntoView();
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}

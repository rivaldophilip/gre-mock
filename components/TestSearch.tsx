"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconX } from "./icons";
import { field } from "./ui";

const href = (tab: string, q: string) => `/?tab=${tab}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ""}`;

/**
 * Narrows the dashboard to tests with a question matching a word, concept or topic.
 * Matching runs on the server (keys and tags never reach the client); this only updates `?q=`.
 * A plain GET form, so Enter still searches without JS.
 */
export function TestSearch({ tab, q }: { tab: string; q: string }) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  const [seen, setSeen] = useState(q);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // follow the URL when it changes elsewhere (back button), but keep a trailing space being typed
  if (q !== seen) {
    setSeen(q);
    if (value.trim() !== q) setValue(q);
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (v: string, wait: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => router.replace(href(tab, v), { scroll: false }), wait);
  };
  const clear = () => {
    setValue("");
    go("", 0);
  };

  return (
    <form method="get" action="/" role="search" className="relative" onSubmit={(e) => (e.preventDefault(), go(value, 0))}>
      <input type="hidden" name="tab" value={tab} />
      <IconSearch size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          go(e.target.value, 250);
        }}
        onKeyDown={(e) => e.key === "Escape" && value && (e.preventDefault(), clear())}
        placeholder="Search words, concepts, topics (abase, circle arc, dice)"
        aria-label="Search tests"
        autoComplete="off"
        spellCheck={false}
        className={`${field} pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden`}
      />
      {value && (
        <button type="button" onClick={clear} aria-label="Clear search" className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
          <IconX size={15} />
        </button>
      )}
    </form>
  );
}

"use client";
import { useState } from "react";

/** Tap a word to mark it "didn't know". Unknown words are added to the bank (tier user_added). */
export function WordChip({ word, attemptId }: { word: string; attemptId: number }) {
  const [state, setState] = useState<"idle" | "busy" | "tagged" | "error">("idle");
  async function tag() {
    if (state === "busy" || state === "tagged") return;
    setState("busy");
    const r = await fetch("/api/words", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ word, attemptId }),
    });
    setState(r.ok ? "tagged" : "error");
  }
  return (
    <button
      onClick={tag}
      title="Tap if you didn't know this word"
      className={`rounded-full border px-2 py-0.5 text-sm ${state === "tagged" ? "border-orange-500 bg-orange-500/20" : state === "error" ? "border-red-500" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
    >
      {word}
      {state === "tagged" && " ✓ didn't know"}
    </button>
  );
}

/** Passage text where each word is tappable. */
export function TaggablePassage({ paragraphs, attemptId }: { paragraphs: string[]; attemptId: number }) {
  const [tagged, setTagged] = useState<Set<string>>(new Set());
  async function tag(raw: string) {
    const w = raw.toLowerCase().replace(/[^a-z'-]/g, "");
    if (w.length < 3 || tagged.has(w)) return;
    setTagged(new Set(tagged).add(w));
    await fetch("/api/words", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ word: w, attemptId }) });
  }
  return (
    <div className="space-y-2 leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p.split(/(\s+)/).map((tok, j) => {
            const w = tok.toLowerCase().replace(/[^a-z'-]/g, "");
            return /\s+/.test(tok) || w.length < 3 ? (
              tok
            ) : (
              <span key={j} onClick={() => tag(tok)} className={`cursor-pointer rounded hover:bg-orange-200/50 dark:hover:bg-orange-500/30 ${tagged.has(w) ? "bg-orange-300 dark:bg-orange-600/50" : ""}`}>
                {tok}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

"use client";
import { useState } from "react";

export type Sense = { pos?: string; def: string; secondary?: boolean; synonyms?: string[]; connotation?: string; example?: string };

const norm = (raw: string) => raw.toLowerCase().replace(/[^a-z'-]/g, "");

async function send(method: "POST" | "DELETE", word: string, attemptId: number) {
  const r = await fetch("/api/words", { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ word, attemptId }) });
  return r.ok ? ((await r.json()) as { lemma?: string; senses?: Sense[] | null }) : null;
}

export function SenseLine({ senses }: { senses?: Sense[] | null }) {
  if (!senses?.length) return null;
  const s = senses[0];
  return (
    <span className="text-[13px] leading-snug text-muted">
      {s.pos && <em>{s.pos}. </em>}
      {s.def}
      {s.secondary && <span className="ml-1 rounded-md bg-warn-soft px-1.5 py-px text-[11px] font-semibold text-warn">secondary sense</span>}
      {s.synonyms?.length ? <span className="text-muted/80"> · {s.synonyms.slice(0, 3).join(", ")}</span> : null}
    </span>
  );
}

/** A choice word with its definition. Tap to mark "didn't know"; tap again to undo. */
export function WordChip({ word, attemptId, senses, tagged: initial = false }: { word: string; attemptId: number; senses?: Sense[] | null; tagged?: boolean }) {
  const [tagged, setTagged] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  async function toggle() {
    if (busy) return;
    setBusy(true);
    const r = await send(tagged ? "DELETE" : "POST", word, attemptId);
    setBusy(false);
    setErr(!r);
    if (r) setTagged(!tagged);
  }
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={toggle}
        title={tagged ? "Tap to undo" : "Tap if you didn't know this word"}
        className={`inline-flex min-h-9 items-center gap-1 self-start rounded-full border px-3 py-1 text-sm font-medium transition-colors ${tagged ? "border-warn/50 bg-warn-soft text-warn" : err ? "border-bad text-bad" : "border-line bg-surface hover:bg-surface-2"}`}
      >
        {word}
        {tagged && " ✓ didn't know"}
      </button>
      <span className="pl-2"><SenseLine senses={senses} /></span>
    </div>
  );
}

/** Passage text where each word is tappable; tagged words are listed below with their definitions. */
export function TaggablePassage({ paragraphs, attemptId, initial = [] }: { paragraphs: string[]; attemptId: number; initial?: string[] }) {
  const [tagged, setTagged] = useState<Map<string, Sense[] | null>>(() => new Map(initial.map((w) => [w, null])));
  async function toggle(raw: string) {
    const w = norm(raw);
    if (w.length < 3) return;
    const next = new Map(tagged);
    if (tagged.has(w)) {
      next.delete(w);
      setTagged(next);
      await send("DELETE", w, attemptId);
      return;
    }
    next.set(w, null);
    setTagged(next);
    const r = await send("POST", w, attemptId);
    if (r) setTagged((m) => new Map(m).set(w, r.senses ?? null));
  }
  return (
    <div className="space-y-3 text-[15.5px] leading-[1.75]">
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p.split(/(\s+)/).map((tok, j) => {
            const w = norm(tok);
            return /\s+/.test(tok) || w.length < 3 ? (
              tok
            ) : (
              <span key={j} onClick={() => toggle(tok)} className={`cursor-pointer rounded px-px transition-colors ${tagged.has(w) ? "bg-warn-soft text-warn font-medium" : "hover:bg-surface-2"}`}>
                {tok}
              </span>
            );
          })}
        </p>
      ))}
      {tagged.size > 0 && (
        <ul className="space-y-1.5 border-t border-line pt-3 text-sm leading-snug">
          {[...tagged.entries()].map(([w, senses]) => (
            <li key={w}>
              <strong>{w}</strong> <SenseLine senses={senses} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

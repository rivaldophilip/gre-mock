"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { baseForms } from "@/lib/vocab-match";
import { Rich, RichInline, type WordRender } from "./Rich";

export type Sense = { pos?: string; def: string; secondary?: boolean; synonyms?: string[]; connotation?: string; example?: string };

const norm = (raw: string) => raw.toLowerCase().replace(/[^a-z'-]/g, "");
const slug = (w: string) => w.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Words this short are never tappable. */
const MIN_LEN = 3;

async function send(method: "POST" | "DELETE", word: string, attemptId: number) {
  try {
    const r = await fetch("/api/words", { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ word, attemptId }) });
    return r.ok ? ((await r.json()) as { id?: string; lemma?: string; senses?: Sense[] | null }) : null;
  } catch {
    return null;
  }
}

export interface WordTags {
  has(raw: string): boolean;
  senses(raw: string): Sense[] | null | undefined;
  /** `senses`, when the page already has the word's definition, shows it at once instead of after the save. */
  toggle(raw: string, senses?: Sense[] | null): Promise<boolean>;
  /** The key a word is tagged under (its bank id), or null when it is not tagged. */
  keyOf(raw: string): string | null;
  entries: [string, Sense[] | null][];
}

/**
 * This attempt's "didn't know" tags, shared by every tappable text on the page. Tags are keyed by bank id, and a
 * token matches through its base forms, so "abated" in a passage shows as tagged when "abate" is.
 */
export function useWordTags(attemptId: number, initial: { id: string; senses?: Sense[] | null }[] = []): WordTags {
  const [tags, setTags] = useState<Map<string, Sense[] | null>>(() => new Map(initial.map((t) => [t.id, t.senses ?? null])));
  const busy = useRef<Set<string>>(new Set());
  // surface form -> the id the server resolved it to (catches irregular variants base forms miss)
  const surface = useRef<Map<string, string>>(new Map());
  const keyOf = useCallback(
    (raw: string) => {
      const w = norm(raw);
      if (w.length < MIN_LEN) return null;
      const s = surface.current.get(w);
      if (s && tags.has(s)) return s;
      for (const f of baseForms(w)) if (tags.has(slug(f))) return slug(f);
      return null;
    },
    [tags],
  );
  const toggle = useCallback(
    async (raw: string, known?: Sense[] | null) => {
      const w = norm(raw);
      if (w.length < MIN_LEN || busy.current.has(w)) return false;
      busy.current.add(w);
      try {
        const k = keyOf(w);
        if (k) {
          const prev = tags.get(k) ?? null;
          setTags((m) => { const n = new Map(m); n.delete(k); return n; });
          if (await send("DELETE", w, attemptId)) return true;
          setTags((m) => new Map(m).set(k, prev));
          return false;
        }
        const tmp = slug(w);
        setTags((m) => new Map(m).set(tmp, known ?? null));
        const r = await send("POST", w, attemptId);
        setTags((m) => {
          const n = new Map(m);
          n.delete(tmp);
          if (r) {
            n.set(r.id ?? tmp, r.senses ?? known ?? null);
            surface.current.set(w, r.id ?? tmp);
          }
          return n;
        });
        return !!r;
      } finally {
        busy.current.delete(w);
      }
    },
    [attemptId, keyOf, tags],
  );
  return useMemo(
    () => ({
      has: (raw: string) => keyOf(raw) !== null,
      senses: (raw: string) => {
        const k = keyOf(raw);
        return k ? tags.get(k) : undefined;
      },
      toggle,
      keyOf,
      entries: [...tags.entries()],
    }),
    [keyOf, tags, toggle],
  );
}

export function SenseLine({ senses, short }: { senses?: Sense[] | null; short?: boolean }) {
  if (!senses?.length) return null;
  const s = senses[0];
  if (short) return <span className="text-[13px] leading-snug text-muted">{shortDef(s)}</span>;
  return (
    <span className="text-[13px] leading-snug text-muted">
      {s.pos && <em>{s.pos}. </em>}
      {s.def}
      {s.secondary && <span className="ml-1 rounded-md bg-warn-soft px-1.5 py-px text-[11px] font-semibold text-warn">secondary sense</span>}
      {s.synonyms?.length ? <span className="text-muted/80"> · {s.synonyms.slice(0, 3).join(", ")}</span> : null}
    </span>
  );
}

/**
 * A choice word with its definition. Tap to mark "didn't know"; tap again to undo.
 * With `tags` it shares the page's tag state (so the same word tapped elsewhere shows here too).
 */
export function WordChip({ word, attemptId, senses, tagged: initial = false, tags }: { word: string; attemptId: number; senses?: Sense[] | null; tagged?: boolean; tags?: WordTags }) {
  const [own, setOwn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const tagged = tags ? tags.has(word) : own;
  async function toggle() {
    if (busy) return;
    setBusy(true);
    const ok = tags ? await tags.toggle(word, senses) : !!(await send(own ? "DELETE" : "POST", word, attemptId));
    setBusy(false);
    setErr(!ok);
    if (ok && !tags) setOwn(!own);
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
      <span className="pl-2"><SenseLine senses={senses ?? tags?.senses(word)} /></span>
    </div>
  );
}

/** Part of speech and the first clause of the definition. */
const shortDef = (s: Sense) => `${s.pos ? `${s.pos}. ` : ""}${s.def.split(/[;:]/)[0].trim()}`;

/**
 * A per-word renderer for Rich / RichInline: each word is tappable, tagged words are highlighted. A word whose definition
 * is known (`senses`, or the tag's own) shows it on hover, with a line on what tapping does.
 */
export function tapWord(tags: WordTags, senses?: Sense[] | null): WordRender {
  return function TapWord(tok, key) {
    if (norm(tok).length < MIN_LEN) return tok;
    const on = tags.has(tok);
    const sense = (senses ?? tags.senses(tok))?.[0];
    const hint = on ? "Marked as not known. Tap to undo." : "Didn’t know it? Tap to see it more often.";
    return (
      <span
        key={key}
        title={sense ? undefined : hint}
        onClick={(e) => {
          e.stopPropagation();
          void tags.toggle(tok, senses);
        }}
        className={`group relative cursor-pointer rounded -mx-px px-px transition-colors ${on ? "bg-warn-soft font-medium text-warn" : "hover:bg-surface-2"}`}
      >
        {tok}
        {sense && (
          <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-60 -translate-x-1/2 rounded-lg border border-line bg-surface px-3 py-2 text-left text-[13px] font-normal leading-snug text-fg shadow-lg group-hover:block">
            {shortDef(sense)}
            <span className="mt-1 block text-xs text-muted">{hint}</span>
          </span>
        )}
      </span>
    );
  };
}

/** Rich text whose words are tappable; `senses` is the definition to show on hover when the text is a single word. */
export function TaggableText({ text, tags, senses, inline, className }: { text: string; tags: WordTags; senses?: Sense[] | null; inline?: boolean; className?: string }) {
  const word = tapWord(tags, senses);
  return inline ? <RichInline text={text} word={word} /> : <Rich text={text} className={className} word={word} />;
}

/** The tagged words that occur in these texts, with their definitions; `skip` leaves out words shown elsewhere (choice chips). */
export function TaggedList({ texts, tags, skip = [] }: { texts: string[]; tags: WordTags; skip?: string[] }) {
  const skipped = new Set(skip.map((s) => tags.keyOf(s)).filter(Boolean));
  const keys = new Set<string>();
  for (const t of texts) for (const tok of t.split(/\s+/)) {
    const k = tags.keyOf(tok);
    if (k && !skipped.has(k)) keys.add(k);
  }
  const shown = tags.entries.filter(([k]) => keys.has(k));
  if (!shown.length) return null;
  return (
    <ul className="space-y-1.5 border-t border-line pt-3 text-sm leading-snug">
      {shown.map(([k, senses]) => (
        <li key={k}>
          <strong>{k}</strong> <SenseLine senses={senses} short />
        </li>
      ))}
    </ul>
  );
}

/** Passage text where each word is tappable; tagged words are listed below with their definitions. */
export function TaggablePassage({ paragraphs, attemptId, initial = [] }: { paragraphs: string[]; attemptId: number; initial?: string[] }) {
  const tags = useWordTags(attemptId, initial.map((id) => ({ id })));
  return (
    <div className="space-y-3 text-[15.5px] leading-[1.75]">
      {paragraphs.map((p, i) => (
        <p key={i}>
          <TaggableText text={p} tags={tags} inline />
        </p>
      ))}
      <TaggedList texts={paragraphs} tags={tags} />
    </div>
  );
}

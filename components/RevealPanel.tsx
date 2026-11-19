"use client";
import type { Explanation, Key, PublicQuestion } from "@/lib/types";
import { Rich, RichInline } from "./Rich";
import { TaggableText, TaggedList, type Sense, type WordTags } from "./WordTagger";
import { IconCheck, IconX } from "./icons";

export type Reveal = { key: Key; explanation: Explanation; isCorrect: boolean; words?: { word: string; id?: string; senses?: Sense[] | null }[] };

/**
 * A checked answer: correct or not, the explanation, and (verbal, with `tags`) the question's words as "didn't know"
 * chips. `distractors` also lists why each wrong choice fails, which the endless vocab mode shows since each word's
 * meaning is the point there.
 */
export function RevealPanel({
  reveal,
  q,
  tags,
  inPassage,
  distractors,
  children,
}: {
  reveal: Reveal;
  q: PublicQuestion;
  tags?: WordTags;
  /** the question has a passage, so the tap hint names it */
  inPassage?: boolean;
  distractors?: boolean;
  children?: React.ReactNode;
}) {
  const chips = tags ? (reveal.words ?? []) : [];
  const ex = reveal.explanation;
  return (
    <div className={`space-y-3 rounded-2xl border p-4 leading-relaxed sm:p-5 ${reveal.isCorrect ? "border-ok/35 bg-ok-soft" : "border-bad/35 bg-bad-soft"}`}>
      <p className={`flex items-center gap-2 text-base font-semibold ${reveal.isCorrect ? "text-ok" : "text-bad"}`}>
        {reveal.isCorrect ? <IconCheck size={20} /> : <IconX size={20} />}
        {reveal.isCorrect ? "Correct" : "Incorrect"}
      </p>
      <Rich text={ex.key} />
      {ex.steps && (
        <ol className="list-decimal space-y-1.5 pl-5 marker:text-muted">
          {ex.steps.map((s, i) => <li key={i}><Rich text={s} /></li>)}
        </ol>
      )}
      {ex.fast && <p className="rounded-xl bg-surface/70 px-3.5 py-2.5"><strong>Faster:</strong> <RichInline text={ex.fast} /></p>}
      {ex.trap && <p className="rounded-xl bg-surface/70 px-3.5 py-2.5"><strong>Trap:</strong> <RichInline text={ex.trap} /></p>}
      {distractors && ex.distractors && (
        <ul className="space-y-1.5 text-sm leading-snug">
          {Object.entries(ex.distractors).map(([c, why]) => (
            <li key={c}>
              <strong>{c}</strong> <span className="text-muted"><RichInline text={why} /></span>
            </li>
          ))}
        </ul>
      )}
      {tags && (q.type === "tc" || q.type === "se" || chips.length > 0) && (
        <div className="space-y-3 border-t border-line/60 pt-3">
          <p className="text-xs text-muted">Tap any word you didn’t know, here or in the {inPassage ? "passage" : "sentence"}. It will come up more in later tests; the ones you leave untapped come up less.</p>
          {chips.length > 0 && (
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
              {chips.map((w) => <span key={w.word}><TaggableText text={w.word} tags={tags} senses={w.senses} inline /></span>)}
            </p>
          )}
          <TaggedList texts={[q.prompt, ...chips.map((w) => w.word)]} tags={tags} />
        </div>
      )}
      {children}
    </div>
  );
}

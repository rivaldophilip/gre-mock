import type { Answer, Question, Tag, Test } from "./types";
import { isAnswered, scoreAnswer } from "./scoring";
import { WORD_W, CONCEPT_W, READING_WPM, SILLY_FACTOR, SLOW_MS } from "./priority/config";

export type ItemKind = "word" | "concept";
export type EventKind =
  | "dont_know"
  | "key_missed"
  | "distractor_chosen"
  | "key_guessed"
  | "key_partial"
  | "key_correct"
  | "key_slow"
  | "distractor_rejected"
  | "exposure"
  | "seen_known"
  | "concept_wrong_primary"
  | "concept_wrong_secondary"
  | "concept_guessed"
  | "concept_slow"
  | "concept_right_primary"
  | "concept_right_secondary";

export interface ItemEvent {
  kind: ItemKind;
  itemId: string;
  event: EventKind;
  weight: number;
}

function chosen(q: Question, a: Answer | undefined, at: number[] | undefined): boolean {
  if (!a?.sel || !at) return false;
  if (q.type === "tc") return a.sel[at[0]] === at[1];
  return a.sel.includes(at[0]);
}

/**
 * Whether the part of the answer a word sits in was right. Each text-completion blank is judged on its own, and an
 * SE key the test-taker picked is a right pick even when the other pick was wrong: only the wrong words count against.
 */
function partRight(q: Question, a: Answer | undefined, t: Tag, correct: boolean): boolean {
  if (q.type === "tc" && t.at && "sel" in q.key) return a?.sel?.[t.at[0]] === q.key.sel[t.at[0]];
  if (q.type === "se" && t.role === "key") return chosen(q, a, t.at);
  return correct;
}

function wordEvent(q: Question, a: Answer | undefined, t: Tag, correct: boolean, guessed: boolean): ItemEvent | null {
  const base = { kind: "word" as const, itemId: t.id };
  if (t.role === "passage" || t.role === "stem") return { ...base, event: "exposure", weight: 0 };
  const picked = chosen(q, a, t.at);
  correct = partRight(q, a, t, correct);
  if (t.role === "key") {
    if (!picked) return { ...base, event: "key_missed", weight: WORD_W.key_missed };
    if (!correct) return { ...base, event: "key_partial", weight: WORD_W.key_partial };
    if (guessed) return { ...base, event: "key_guessed", weight: WORD_W.key_guessed };
    return { ...base, event: "key_correct", weight: WORD_W.key_correct };
  }
  if (t.role === "distractor") {
    if (picked) return { ...base, event: "distractor_chosen", weight: WORD_W.distractor_chosen };
    if (correct) return { ...base, event: "distractor_rejected", weight: WORD_W.distractor_rejected };
  }
  return null;
}

/**
 * Extra time before a question counts as slow: the first read of a passage that two or more questions share,
 * granted to the question opened first on it (the rest only look back at it). 0 for every other question.
 */
export function readingAllowanceMs(test: Pick<Test, "questions" | "passages">, q: Question, openedFirst: boolean): number {
  if (!q.passageId || !openedFirst) return 0;
  if (test.questions.filter((x) => x.passageId === q.passageId).length < 2) return 0;
  const p = test.passages.find((x) => x.id === q.passageId);
  const words = p ? p.paragraphs.join(" ").split(/\s+/).filter(Boolean).length : 0;
  return Math.round((words / READING_WPM) * 60_000);
}

/** The weight of a concept_wrong_* event: halved (SILLY_FACTOR) when the test-taker marked the miss a silly mistake. */
export function wrongWeight(event: "concept_wrong_primary" | "concept_wrong_secondary", silly: boolean): number {
  const w = event === "concept_wrong_primary" ? CONCEPT_W.wrong_primary : CONCEPT_W.wrong_secondary;
  return silly ? w * SILLY_FACTOR : w;
}

function conceptEvents(
  t: Tag,
  correct: boolean,
  guessed: boolean,
  slow: boolean,
  silly: boolean,
): ItemEvent[] {
  const primary = t.role === "primary";
  const base = { kind: "concept" as const, itemId: t.id };
  const out: ItemEvent[] = [];
  if (!correct) {
    const event = primary ? "concept_wrong_primary" : "concept_wrong_secondary";
    out.push({ ...base, event, weight: wrongWeight(event, silly) });
    return out;
  }
  if (guessed) {
    out.push({ ...base, event: "concept_guessed", weight: CONCEPT_W.guessed });
  } else {
    out.push(
      primary
        ? { ...base, event: "concept_right_primary", weight: CONCEPT_W.right_primary }
        : { ...base, event: "concept_right_secondary", weight: CONCEPT_W.right_secondary },
    );
  }
  if (slow) out.push({ ...base, event: "concept_slow", weight: CONCEPT_W.slow });
  return out;
}

/** All item events produced by one response. Pure; the API persists the result. */
export function eventsForResponse(
  q: Question,
  measure: "verbal" | "quant",
  a: Answer | undefined,
  /** readingMs: the passage-reading allowance for this question (readingAllowanceMs); silly: a wrong quant answer marked "silly mistake" */
  opts: { guessed: boolean; timeMs: number; readingMs?: number; silly?: boolean },
  passageTags: Tag[] = [],
): ItemEvent[] {
  // a blank (or partly filled) question says nothing about the words or concepts in it, so it records nothing
  if (!isAnswered(q, a)) return [];
  const correct = scoreAnswer(q, a);
  const slow = opts.timeMs > SLOW_MS[measure] + (opts.readingMs ?? 0);
  const out: ItemEvent[] = [];
  for (const t of [...q.tags, ...passageTags]) {
    if (t.kind === "word") {
      const e = wordEvent(q, a, t, correct, opts.guessed);
      if (e) out.push(e);
      // shown but not judged by the answer: not tagging it "didn't know" is the evidence (scoring keeps one per attempt)
      if (!e || e.event === "exposure") out.push({ kind: "word", itemId: t.id, event: "seen_known", weight: WORD_W.seen_known });
      if ((e?.event === "key_correct" || e?.event === "key_guessed") && slow) out.push({ ...e, event: "key_slow", weight: WORD_W.key_slow });
    } else {
      out.push(...conceptEvents(t, correct, opts.guessed, slow, !!opts.silly && measure === "quant"));
    }
  }
  return out;
}

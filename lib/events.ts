import type { Answer, Question, Tag } from "./types";
import { scoreAnswer } from "./scoring";
import { WORD_W, CONCEPT_W, SLOW_MS } from "./priority/config";

export type ItemKind = "word" | "concept";
export type EventKind =
  | "dont_know"
  | "key_missed"
  | "distractor_chosen"
  | "key_guessed"
  | "key_partial"
  | "key_correct"
  | "distractor_rejected"
  | "exposure"
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

function wordEvent(q: Question, a: Answer | undefined, t: Tag, correct: boolean, guessed: boolean): ItemEvent | null {
  const base = { kind: "word" as const, itemId: t.id };
  if (t.role === "passage" || t.role === "stem") return { ...base, event: "exposure", weight: 0 };
  const picked = chosen(q, a, t.at);
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

function conceptEvents(
  t: Tag,
  correct: boolean,
  guessed: boolean,
  timeMs: number,
  measure: "verbal" | "quant",
): ItemEvent[] {
  const primary = t.role === "primary";
  const base = { kind: "concept" as const, itemId: t.id };
  const out: ItemEvent[] = [];
  if (!correct) {
    out.push(
      primary
        ? { ...base, event: "concept_wrong_primary", weight: CONCEPT_W.wrong_primary }
        : { ...base, event: "concept_wrong_secondary", weight: CONCEPT_W.wrong_secondary },
    );
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
  if (timeMs > SLOW_MS[measure]) out.push({ ...base, event: "concept_slow", weight: CONCEPT_W.slow });
  return out;
}

/** All item events produced by one response. Pure; the API persists the result. */
export function eventsForResponse(
  q: Question,
  measure: "verbal" | "quant",
  a: Answer | undefined,
  opts: { guessed: boolean; timeMs: number },
  passageTags: Tag[] = [],
): ItemEvent[] {
  const correct = scoreAnswer(q, a);
  const out: ItemEvent[] = [];
  for (const t of [...q.tags, ...passageTags]) {
    if (t.kind === "word") {
      const e = wordEvent(q, a, t, correct, opts.guessed);
      if (e) out.push(e);
    } else {
      out.push(...conceptEvents(t, correct, opts.guessed, opts.timeMs, measure));
    }
  }
  return out;
}

/** The answer-choice words of TC / SE questions, and the bank word each one is tagged as. Shared by review and the practice reveal. */
import type { Question } from "./types";

export function choiceWords(q: Question): string[] {
  if (q.type === "tc") return q.blanks?.flat() ?? [];
  if (q.type === "se") return q.choices ?? [];
  return [];
}

/** choice text -> vocab id, via the tag that sits on that choice */
export function wordIdFor(q: Question, text: string): string | undefined {
  const at = (t: Question["tags"][number]) => (q.type === "tc" ? q.blanks?.[t.at?.[0] ?? -1]?.[t.at?.[1] ?? -1] : q.choices?.[t.at?.[0] ?? -1]);
  return q.tags.find((t) => t.kind === "word" && t.at && at(t) === text)?.id;
}

/** The answer-choice words of TC / SE questions, and the bank word each one is tagged as. Shared by review and the practice reveal. */
import type { Question } from "./types";
import { baseForms } from "./vocab-match";

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

/** Words a phrase choice wraps its vocab word in ("lobbied against", "a matter of opinion"); never tappable on their own. */
const FUNCTION_WORDS = new Set(
  "a an the of to in on at by for from with without into onto upon about against over under after before as than and or but nor so it its is are was were be been being has have had do does did not no this that these those".split(" "),
);

/**
 * The words of a choice to offer as "didn't know" taps: the whole choice when it is one word; for a phrase, the token
 * that is the tagged bank word (`id`, through its base forms), else its content words.
 */
export function vocabTokens(text: string, id?: string | null): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return words;
  const bare = (w: string) => w.toLowerCase().replace(/[^a-z'-]/g, "");
  if (id) {
    const hit = words.find((w) => baseForms(bare(w)).some((f) => f.replace(/[^a-z0-9]+/g, "-") === id));
    if (hit) return [hit];
  }
  return words.filter((w) => bare(w).length >= 3 && !FUNCTION_WORDS.has(bare(w)));
}

import type { Question, Test } from "./types";

/** Lowercase words of a text, with KaTeX commands, braces and punctuation dropped. */
export function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\\[a-z]+/g, " ") // \dfrac, \cdot, \pi
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Everything a question can be found by: what the test-taker sees (stem, choices, passage,
 * figure caption) plus its word lemmas and concept ids and names. Explanations are left out,
 * so a word that appears only in a rationale gives no hit.
 */
function questionWords(t: Test, q: Question, conceptNames: Map<string, string>): Set<string> {
  const parts: string[] = [q.prompt, ...(q.choices ?? []), ...(q.blanks ?? []).flat()];
  if (q.qc) parts.push(q.qc.a, q.qc.b, q.qc.info ?? "");
  const p = q.passageId ? t.passages.find((x) => x.id === q.passageId) : undefined;
  if (p) parts.push(p.title ?? "", ...p.paragraphs);
  const f = q.figureId ? t.figures.find((x) => x.id === q.figureId) : undefined;
  if (f) parts.push(f.caption ?? "");
  for (const tag of q.tags) {
    parts.push(tag.id);
    if (tag.kind === "concept") parts.push(conceptNames.get(tag.id) ?? "");
  }
  return new Set(words(parts.join(" ")));
}

/** Irregular forms a prefix match cannot reach. */
const ALIASES: Record<string, string> = { dice: "die" };

/** Tests for a term: a prefix of a word, its singular ("arcs" -> "arc") likewise, or its alias as a whole word. */
function forms(term: string): ((w: string) => boolean)[] {
  const out = [(w: string) => w.startsWith(term)];
  if (term.length > 3 && term.endsWith("s") && !term.endsWith("ss")) {
    const one = term.replace(/(?<=[sxz]|[cs]h)es$|s$/, "");
    out.push((w) => w.startsWith(one));
  }
  const alias = ALIASES[term];
  if (alias) out.push((w) => w === alias || w === `${alias}s`);
  return out;
}

/** Each query term must start some word: "circle" finds "circles", "abase" finds "abased". */
const hasAll = (ws: Set<string>, terms: string[]) =>
  terms.every((term) => forms(term).some((f) => [...ws].some(f)));

/**
 * How many questions of a test match the query (all terms within one question).
 * A match on the test's title counts as every question matching. An empty query matches nothing.
 */
export function matchCount(t: Test, query: string, conceptNames: Map<string, string>): number {
  const terms = words(query);
  if (terms.length === 0) return 0;
  if (hasAll(new Set(words(`${t.title} ${t.id}`)), terms)) return t.questions.length;
  return t.questions.filter((q) => hasAll(questionWords(t, q, conceptNames), terms)).length;
}

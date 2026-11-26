// The word bank as the authoring scripts read it (data/vocab.json), with its synonym links.
import fs from "node:fs";

/** Bank synonyms of a word in either direction (a word lists X, or X lists the word), for SE pairs. Exposure-only words are never a choice, so they have none and are none. */
export function bankSynonyms() {
  const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as { id: string; lemma: string; exposureOnly?: boolean; senses?: { synonyms?: string[] }[] }[];
  const choosable = vocab.filter((v) => !v.exposureOnly);
  const idOf = new Map(choosable.map((v) => [v.lemma.toLowerCase(), v.id]));
  const syn = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (a === b) return;
    if (!syn.has(a)) syn.set(a, new Set());
    syn.get(a)!.add(b);
  };
  for (const v of choosable)
    for (const s of v.senses ?? [])
      for (const w of s.synonyms ?? []) {
        const other = idOf.get(w.toLowerCase());
        if (other) {
          link(v.id, other);
          link(other, v.id);
        }
      }
  return syn;
}

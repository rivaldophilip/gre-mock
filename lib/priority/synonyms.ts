// Bank synonyms of a word in either direction (a word lists X, or X lists the word), for SE pairs. Exposure-only
// words are never a choice, so they have none and are none. Pure: scripts read data/vocab.json, the app its vocab table.
type VocabRow = { id: string; lemma: string; exposureOnly?: boolean | null; senses?: unknown };

export function synonymMap(vocab: VocabRow[]): Map<string, Set<string>> {
  const choosable = vocab.filter((v) => !v.exposureOnly);
  const idOf = new Map(choosable.map((v) => [v.lemma.toLowerCase(), v.id]));
  const syn = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (a === b) return;
    if (!syn.has(a)) syn.set(a, new Set());
    syn.get(a)!.add(b);
  };
  for (const v of choosable)
    for (const s of (v.senses ?? []) as { synonyms?: string[] }[])
      for (const w of s.synonyms ?? []) {
        const other = idOf.get(w.toLowerCase());
        if (other) {
          link(v.id, other);
          link(other, v.id);
        }
      }
  return syn;
}

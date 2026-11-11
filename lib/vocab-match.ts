/** Match choice text to a vocab bank word, allowing regular inflections. Shared by the validator and the tagger. */
export type VocabEntry = { id: string; lemma: string; variants: string[] };

/** Base forms a word could be an inflection of, most literal first. */
export function baseForms(text: string): string[] {
  const t = text.toLowerCase().trim();
  const out = [t];
  const add = (s: string) => s.length > 1 && !out.includes(s) && out.push(s);
  if (t.endsWith("ies")) add(t.slice(0, -3) + "y");
  if (t.endsWith("ied")) add(t.slice(0, -3) + "y");
  for (const suf of ["s", "es", "d", "ed", "ing"]) {
    if (!t.endsWith(suf)) continue;
    const stem = t.slice(0, -suf.length);
    add(stem);
    if (suf === "ing" || suf === "ed") {
      add(stem + "e"); // disparaging -> disparage
      if (stem.length > 2 && stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1)); // abetted -> abet
    }
  }
  return out;
}

/** The words of a phrase choice ("at odds with", "a perfunctory", "the fragility of the consensus"); one word for a plain choice. */
const phraseWords = (text: string) => text.toLowerCase().trim().split(/\s+/).filter(Boolean);

export function vocabIndex(vocab: VocabEntry[]): Map<string, string> {
  const forms = new Map<string, string>();
  for (const v of vocab) for (const f of [v.lemma, ...v.variants]) if (!forms.has(f.toLowerCase())) forms.set(f.toLowerCase(), v.id);
  return forms;
}

/** The bank word id this text is a form of, or null. A phrase choice resolves to the first bank word it contains. */
export function wordIdOf(text: string, index: Map<string, string>): string | null {
  for (const f of baseForms(text)) {
    const id = index.get(f);
    if (id) return id;
  }
  const words = phraseWords(text);
  if (words.length > 1)
    for (const w of words)
      for (const f of baseForms(w)) {
        const id = index.get(f);
        if (id) return id;
      }
  return null;
}

/** Does the choice text spell this bank word (or, for a phrase, contain it)? Old tests were tagged under a looser prefix rule, which still counts. */
export function choiceIsWord(text: string, v: VocabEntry): boolean {
  const t = text.toLowerCase().trim();
  const forms = [v.lemma, ...v.variants].map((f) => f.toLowerCase());
  if (baseForms(t).some((b) => forms.includes(b)) || forms.some((f) => t.startsWith(f) || f.startsWith(t))) return true;
  const words = phraseWords(t);
  return words.length > 1 && words.some((w) => baseForms(w).some((b) => forms.includes(b)));
}

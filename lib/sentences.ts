/** Sentence splitting shared by the runner (select-in-passage) and the validator. Index runs across paragraphs. */
export function splitSentences(paragraph: string): string[] {
  return paragraph
    // **bold** may open or close a sentence (boldface argument portions), so allow its markers at the boundary
    .split(/(?<=[.!?]["”')\]]?\*{0,2})\s+(?=\*{0,2}["“(]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function passageSentences(paragraphs: string[]): { text: string; para: number }[] {
  return paragraphs.flatMap((p, para) => splitSentences(p).map((text) => ({ text, para })));
}

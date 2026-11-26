// The word bank as the authoring scripts read it (data/vocab.json), with its synonym links.
import fs from "node:fs";
import { synonymMap } from "../../lib/priority/synonyms";

/** Bank synonyms of a word in either direction (lib/priority/synonyms.ts), from data/vocab.json. */
export function bankSynonyms() {
  return synonymMap(JSON.parse(fs.readFileSync("data/vocab.json", "utf8")));
}

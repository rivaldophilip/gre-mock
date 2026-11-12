/** Normalized word n-gram shingles, for near-copy detection. */
const BOILERPLATE =
  /which of the following|select all (that apply|of the following)|must be true|could be the value of|is the value of|what is the|how many|of the following|consider each of the choices|quantity [ab]|the relationship cannot be determined|information given|is greater|are equal/g;

export function shingles(text: string, n = 6): Set<string> {
  const w = text
    .toLowerCase()
    .replace(BOILERPLATE, " ")
    .replace(/\$[^$]*\$/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

/** Share of `a`'s shingles that also occur in `b` (containment). */
export function containment(a: Set<string>, b: Set<string>): number {
  if (a.size === 0) return 0;
  let hit = 0;
  for (const s of a) if (b.has(s)) hit++;
  return hit / a.size;
}

/** Texts with fewer shingles than this are too short for an overlap verdict to mean anything. */
export const MIN_SHINGLES = 10;

/** Short words a skeleton keeps as words; any other 1-3 letter token is a name (a point, a variable, a list). */
const KEEP_SHORT = new Set("a an of the and is in to at by on are be has its for one two new sum set not or if as it all".split(" "));

/**
 * Setup-level shingles for quant: the math inside $...$ is kept as tokens, every number becomes `#` and every short
 * name `V`. Two items that differ only in numbers, letters or labels then share most of their shingles.
 */
export function skeletonShingles(text: string, n = 4): Set<string> {
  const w = text
    .toLowerCase()
    .replace(/\$([^$]*)\$/g, (_, m: string) => " " + m.replace(/\\[a-z]+|[^a-z0-9]/g, " ") + " ")
    .replace(BOILERPLATE, " ")
    .replace(/indicate all such values/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => (/^\d+$/.test(x) ? "#" : /^[a-z]{1,3}$/.test(x) && !KEEP_SHORT.has(x) ? "V" : x));
  const out = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

/** Skeletons with fewer shingles than this are generic ("$n$ is a positive integer") and are not compared. */
export const MIN_SKELETON = 12;
/** Containment at or above this, between items of one concept, means the same setup with new numbers or names. */
export const SETUP_TH = 0.4;

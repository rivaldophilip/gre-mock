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

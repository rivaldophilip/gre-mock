import type { ItemScore } from "./compute";

export interface Pick {
  itemId: string;
  bucket: "review" | "new" | "wildcard";
  reason: string;
}

/** Deterministic PRNG so briefs are reproducible given a seed. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Verbal key-word slots: 50% review (weakness evidence, by P), 40% new (by N*Y), 10% wildcard.
 * Falls back to the other buckets when one runs dry (e.g. first test: no history).
 */
export function allocateWords(scores: ItemScore[], slots: number, random: () => number): Pick[] {
  const nReview = Math.round(slots * 0.5);
  const nNew = Math.round(slots * 0.4);
  const nWild = slots - nReview - nNew;
  const used = new Set<string>();
  const out: Pick[] = [];
  const take = (list: ItemScore[], n: number, bucket: Pick["bucket"]) => {
    for (const s of list) {
      if (n <= 0) break;
      if (used.has(s.itemId)) continue;
      used.add(s.itemId);
      out.push({ itemId: s.itemId, bucket, reason: s.reason });
      n--;
    }
    return n;
  };
  const review = scores.filter((s) => s.weakEvidence > 0 || s.C > 0).sort((a, b) => b.P - a.P);
  // shuffle first so equal-yield words don't always come out alphabetically
  const fresh = scores
    .filter((s) => s.N === 1)
    .sort(() => random() - 0.5)
    .sort((a, b) => b.N * b.Y - a.N * a.Y);
  const wildPool = scores.filter((s) => s.Y >= 0.6).sort(() => random() - 0.5);

  let shortReview = take(review.filter((s) => s.weakEvidence > 0), nReview, "review");
  // fill the review shortfall from partly covered items, then from new
  shortReview = take(review, shortReview, "review");
  take(fresh, nNew + shortReview, "new");
  const shortWild = take(wildPool, nWild, "wildcard");
  take(fresh, shortWild, "new");
  return out;
}

/**
 * Quant: 50% weakest, 35% least covered, 15% balance areas (area share toward 25% each).
 * Concepts are distinct while any unused concept remains (47 concepts vs 27 slots).
 */
export function allocateConcepts(
  scores: (ItemScore & { area: string })[],
  slots: number,
  areas: string[],
  random: () => number = Math.random,
): Pick[] {
  const nWeak = Math.round(slots * 0.5);
  const nCover = Math.round(slots * 0.35);
  const out: Pick[] = [];
  const used = new Set<string>();
  const count = new Map<string, number>(areas.map((a) => [a, 0]));
  const take = (s: ItemScore & { area: string }, bucket: Pick["bucket"]) => {
    used.add(s.itemId);
    out.push({ itemId: s.itemId, bucket, reason: s.reason });
    count.set(s.area, (count.get(s.area) ?? 0) + 1);
  };
  const shuffled = [...scores].sort(() => random() - 0.5); // random tie-breaks
  const fresh = (list: typeof scores) => list.filter((s) => !used.has(s.itemId)).concat(used.size >= scores.length ? list : []);
  // weakness-evidence concepts first (by P), then high-yield ones to fill
  const byWeak = [...shuffled].sort((a, b) => (b.weakEvidence > 0 ? 1 : 0) - (a.weakEvidence > 0 ? 1 : 0) || (b.weakEvidence > 0 ? b.P - a.P : b.Y - a.Y));
  for (let i = 0; i < nWeak; i++) take(fresh(byWeak)[0], "review");
  const byCover = [...shuffled].sort((a, b) => b.N * b.Y - a.N * a.Y);
  for (let i = 0; i < nCover; i++) take(fresh(byCover)[0], "new");
  while (out.length < slots) {
    const target = [...count.entries()].sort((a, b) => a[1] - b[1])[0][0];
    const pool = fresh(shuffled.filter((s) => s.area === target).sort((a, b) => b.P - a.P));
    take(pool[0] ?? fresh(shuffled)[0], "wildcard");
  }
  return out;
}

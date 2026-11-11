import { heldBy, type ItemScore } from "./compute";

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
  // items an untaken test already targets wait until it is taken (last resort below)
  const live = scores.filter((s) => !s.pending);
  const review = live.filter((s) => s.weakEvidence > 0 || s.C > 0).sort((a, b) => b.P - a.P);
  // shuffle first so equal-yield words don't always come out alphabetically
  const fresh = live
    .filter((s) => s.N === 1)
    .sort(() => random() - 0.5)
    .sort((a, b) => b.N * b.Y - a.N * a.Y);
  const wildPool = live.filter((s) => s.Y >= 0.6).sort(() => random() - 0.5);

  let shortReview = take(review.filter((s) => s.weakEvidence > 0), nReview, "review");
  // fill the review shortfall from partly covered items, then from new
  shortReview = take(review, shortReview, "review");
  take(fresh, nNew + shortReview, "new");
  const shortWild = take(wildPool, nWild, "wildcard");
  take(fresh, shortWild, "new");
  take(scores.filter((s) => s.pending).sort((a, b) => heldBy(a) - heldBy(b) || b.P - a.P), slots - out.length, "review");
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
  // unused first (reuse only once every concept is used), and items untaken tests already target last,
  // fewest holders first: once every concept is held, briefs made back to back rotate through all of them
  const fresh = (list: typeof scores) => {
    const l = list.filter((s) => !used.has(s.itemId)).concat(used.size >= scores.length ? list : []);
    return [...l].sort((a, b) => heldBy(a) - heldBy(b)); // stable: keeps each list's own order within a count
  };
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

/** Secondary senses are a hard-item driver: at least this many verbal keys test one. */
export const MIN_SECONDARY = 4;

/** Verbal key words for a brief: allocateWords, then top up secondary-sense keys by replacing the weakest "new" picks. */
export function allocateVerbalKeys(scores: ItemScore[], isSecondary: (id: string) => boolean, slots: number, random: () => number): Pick[] {
  const keys = allocateWords(scores, slots, random);
  const have = keys.filter((k) => isSecondary(k.itemId)).length;
  if (have < MIN_SECONDARY) {
    const taken = new Set(keys.map((k) => k.itemId));
    const extra = scores.filter((s) => isSecondary(s.itemId) && !taken.has(s.itemId)).sort((a, b) => b.N * b.Y - a.N * a.Y || b.P - a.P);
    // keep every review pick
    const replaceable = keys.map((k, i) => ({ k, i })).filter(({ k }) => k.bucket !== "review" && !isSecondary(k.itemId)).reverse();
    for (let j = 0; j < MIN_SECONDARY - have && j < extra.length && j < replaceable.length; j++) {
      keys[replaceable[j].i] = { itemId: extra[j].itemId, bucket: "new", reason: `secondary sense (${extra[j].reason})` };
    }
  }
  return keys;
}

/**
 * One variant (sub-form) per picked concept: the one used least so far, counting earlier briefs (`used`:
 * concept -> variant -> times used) and the earlier slots of this brief, ties random. So a concept that comes
 * back in mock after mock is tested a different way each time. A concept with no variants listed gets none.
 */
export function assignVariants(
  concepts: string[],
  variants: Record<string, string[]>,
  used: Map<string, Map<string, number>>,
  random: () => number,
): (string | undefined)[] {
  const count = new Map([...used].map(([c, m]) => [c, new Map(m)]));
  return concepts.map((c) => {
    const options = variants[c] ?? [];
    if (!options.length) return undefined;
    const seen = count.get(c) ?? new Map<string, number>();
    const least = Math.min(...options.map((v) => seen.get(v) ?? 0));
    const ties = options.filter((v) => (seen.get(v) ?? 0) === least);
    const pick = ties[Math.floor(random() * ties.length)];
    count.set(c, seen.set(pick, least + 1));
    return pick;
  });
}

/**
 * How many keys each select-all (rc_multi) slot gets: 1, 2 or 3 with the official weights (about 40 / 40 / 20 in the
 * Official Guide). If every draw comes out 2, the last is redrawn as 1 or 3, so no test teaches "it's always two".
 */
export function drawMultiKeys(n: number, random: () => number): number[] {
  const draw = (): number => {
    const r = random();
    return r < 0.4 ? 1 : r < 0.8 ? 2 : 3;
  };
  const out = Array.from({ length: n }, draw);
  if (n && !out.some((k) => k !== 2)) out[n - 1] = random() < 2 / 3 ? 1 : 3;
  return out;
}

/**
 * Chance each item is picked by the next brief: run the (seeded, partly random) allocator `trials`
 * times and count. Returns itemId -> share of runs it was picked in (0..1).
 */
export function selectionOdds(allocate: (random: () => number) => Pick[], trials = 200, seed = 1): Map<string, number> {
  const hits = new Map<string, number>();
  for (let i = 0; i < trials; i++) {
    for (const id of new Set(allocate(rng(seed + i * 7919)).map((p) => p.itemId))) hits.set(id, (hits.get(id) ?? 0) + 1);
  }
  return new Map([...hits].map(([id, n]) => [id, n / trials]));
}

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

/** Never tested and no weakness evidence: what the new-first half draws from. */
export const isNew = (s: ItemScore) => !s.tested && s.weakEvidence === 0;

/**
 * While an item no untaken test holds is still untested: half the slots go to untested items first (unexposed
 * before merely seen, then by yield, ties random; spread over `groupOf` when given), the rest to the tested items
 * by P. Either side fills in when the other runs dry, and held items come last, fewest holders first. Returns
 * null once nothing untested is left, so the caller keeps its usual rule.
 */
export function allocateNewFirst<T extends ItemScore>(
  scores: T[],
  slots: number,
  random: () => number,
  groupOf?: (s: T) => string,
): Pick[] | null {
  const live = scores.filter((s) => !s.pending);
  const shuffled = [...live].sort(() => random() - 0.5);
  let fresh = shuffled.filter(isNew).sort((a, b) => (a.C > 0 ? 1 : 0) - (b.C > 0 ? 1 : 0) || b.Y - a.Y);
  if (!fresh.length) return null;
  if (groupOf) {
    // round-robin over groups (quant areas): the k-th best of each group before the (k+1)-th of any
    const seen = new Map<string, number>();
    const nth = new Map<string, number>();
    for (const s of fresh) {
      const k = seen.get(groupOf(s)) ?? 0;
      seen.set(groupOf(s), k + 1);
      nth.set(s.itemId, k);
    }
    fresh = [...fresh].sort((a, b) => nth.get(a.itemId)! - nth.get(b.itemId)!);
  }
  const tested = shuffled.filter((s) => !isNew(s)).sort((a, b) => b.P - a.P);
  const held = scores.filter((s) => s.pending).sort((a, b) => heldBy(a) - heldBy(b) || b.P - a.P);
  const out: Pick[] = [];
  const used = new Set<string>();
  const take = (list: ItemScore[], n: number, bucket: Pick["bucket"]) => {
    for (const s of list) {
      if (n <= 0 || out.length >= slots) break;
      if (used.has(s.itemId)) continue;
      used.add(s.itemId);
      out.push({ itemId: s.itemId, bucket, reason: s.reason });
      n--;
    }
  };
  take(fresh, Math.round(slots * 0.5), "new");
  take(tested, slots, "review");
  take(fresh, slots, "new");
  take(held, slots, "review");
  // a pool smaller than its slots (reading skills) repeats, in the same order
  for (let i = 0; out.length < slots && out.length; i++) out.push({ ...out[i] });
  return out;
}

/**
 * Verbal key-word slots: new-first while untested words remain (allocateNewFirst); after that 50% review
 * (weakness evidence, by P), 40% new (by N*Y), 10% wildcard. Falls back to the other buckets when one runs dry.
 */
export function allocateWords(scores: ItemScore[], slots: number, random: () => number): Pick[] {
  const newFirst = allocateNewFirst(scores, slots, random);
  if (newFirst) return newFirst;
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
 * Quant concepts and reading skills: new-first while untested ones remain (allocateNewFirst, spread over areas);
 * after that 50% weakest, 35% least covered, 15% balance areas (area share toward 25% each).
 * Concepts are distinct while any unused concept remains (47 concepts vs 27 slots).
 */
export function allocateConcepts(
  scores: (ItemScore & { area: string })[],
  slots: number,
  areas: string[],
  random: () => number = Math.random,
): Pick[] {
  const newFirst = allocateNewFirst(scores, slots, random, (s) => s.area);
  if (newFirst) return newFirst;
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
    // fewest holders first, as in allocateWords: otherwise the same high-yield secondary words top up every brief
    const extra = scores
      .filter((s) => isSecondary(s.itemId) && !taken.has(s.itemId))
      .sort(() => random() - 0.5)
      .sort((a, b) => heldBy(a) - heldBy(b) || b.N * b.Y - a.N * a.Y || b.P - a.P);
    // keep every review pick
    const replaceable = keys.map((k, i) => ({ k, i })).filter(({ k }) => k.bucket !== "review" && !isSecondary(k.itemId)).reverse();
    for (let j = 0; j < MIN_SECONDARY - have && j < extra.length && j < replaceable.length; j++) {
      keys[replaceable[j].i] = { itemId: extra[j].itemId, bucket: "new", reason: `secondary sense (${extra[j].reason})` };
    }
  }
  return keys;
}

/** A verbal test keys 15 TC blanks and 7 SE pairs: 29 key words when both words of every pair are keys. */
export const SE_PAIRS = 7;

/**
 * SE keys two words that mean the same, but key words drawn one by one rarely include a synonym pair, so about 7 of
 * the 29 ended up as distractors. Pair up to `pairs` picks: first pairs already among them, then, highest priority
 * first, give an unpaired pick its best live bank synonym in place of the lowest-priority pick that can go (not a
 * review pick, not one `keep` protects, not already paired, and ranked no higher than the partner). A pair an earlier SE item keyed (`usedPair`) is skipped.
 * Returns the picks (same length, swapped in place) and the pairs.
 */
export function pairSeKeys(
  keys: Pick[],
  scores: ItemScore[],
  synonyms: (id: string) => Iterable<string>,
  opts: { pairs?: number; keep?: (id: string) => boolean; usedPair?: (a: string, b: string) => boolean } = {},
): { keys: Pick[]; pairs: [string, string][] } {
  const want = opts.pairs ?? SE_PAIRS;
  const keep = opts.keep ?? (() => false);
  const usedPair = opts.usedPair ?? (() => false);
  const byId = new Map(scores.map((s) => [s.itemId, s]));
  const P = (id: string) => byId.get(id)?.P ?? 0;
  const out = keys.map((k) => ({ ...k }));
  const picked = () => new Set(out.map((k) => k.itemId));
  const paired = new Set<string>();
  const pairs: [string, string][] = [];
  const pair = (a: string, b: string) => {
    paired.add(a).add(b);
    pairs.push([a, b]);
  };
  const byP = () => out.map((k) => k.itemId).filter((id) => !paired.has(id)).sort((a, b) => P(b) - P(a));
  // pairs already among the picks
  for (const a of byP()) {
    if (pairs.length >= want) break;
    if (paired.has(a)) continue;
    const ids = picked();
    const b = [...synonyms(a)].filter((s) => s !== a && ids.has(s) && !paired.has(s) && !usedPair(a, s)).sort((x, y) => P(y) - P(x))[0];
    if (b) pair(a, b);
  }
  // then swap a synonym in for the pick that matters least
  for (const a of byP()) {
    if (pairs.length >= want) break;
    const ids = picked();
    if (paired.has(a) || !ids.has(a)) continue; // swapped out earlier in this loop
    const partner = [...synonyms(a)]
      .map((s) => byId.get(s))
      .filter((s): s is ItemScore => !!s && !s.pending && !ids.has(s.itemId) && !usedPair(a, s.itemId))
      .sort((x, y) => y.P - x.P)[0];
    if (!partner) continue;
    const victim = out
      .map((k, i) => ({ k, i }))
      .filter(({ k }) => k.itemId !== a && !paired.has(k.itemId) && k.bucket !== "review" && !keep(k.itemId))
      .sort((x, y) => P(x.k.itemId) - P(y.k.itemId))[0];
    // never trade a word for a less needed one: the pair waits for a pick that ranks below the partner
    if (!victim || P(victim.k.itemId) > partner.P) continue;
    out[victim.i] = { itemId: partner.itemId, bucket: partner.tested ? "review" : "new", reason: `SE partner for ${a} (${partner.reason})` };
    pair(a, partner.itemId);
  }
  return { keys: out, pairs };
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

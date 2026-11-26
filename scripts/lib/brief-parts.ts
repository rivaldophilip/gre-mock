// Pieces every brief shares (scripts/brief.ts for a mock, scripts/bank-brief.ts for a bank batch): what is held and
// shown soon, finished answers for the revisit queue, practice need per type, official exemplars, word history and
// the drill-style TC / SE mix. Reads the user's database, the bank and the source files.
import fs from "node:fs";
import path from "node:path";
import { bankDb, schema, type DB } from "../../lib/db";
import { bank } from "../../lib/db";
import { eq } from "drizzle-orm";
import { loadMetas, type BankMetas } from "../../lib/bank-metas";
import { heldRefs } from "../../lib/holds";
import { typeStats, TYPE_INFO, type SlotType } from "../../lib/qtypes";
import { itemText, testVariants } from "../../lib/setup-history";
import { measureSources } from "../../lib/sources";
import { REVISIT_CHANGES, type Answered, type Revisit } from "../../lib/priority/revisit";
import type { Question } from "../../lib/types";

export const REF = path.resolve("../books/extracted/reference/items.jsonl"); // local-only corpus (not in the repo)
const BRIEFS = "content/briefs";

/** The bank's metadata as it is now. */
export async function bankNow(): Promise<BankMetas> {
  const db = bankDb();
  const [v] = await db.select().from(bank.meta).where(eq(bank.meta.key, "version"));
  return loadMetas(db, Number(v?.value ?? 0));
}

/** Cut at a word boundary, so a topic reads as words rather than a fragment. */
export function clip(s: string, n: number) {
  if (s.length <= n) return s;
  const i = s.lastIndexOf(" ", n);
  return s.slice(0, i > 0 ? i : n) + "…";
}

type Brief = { testId: string; keyWords?: { id: string }[]; skillSlots?: { skill: string; variant?: string }[]; conceptSlots?: { concept: string; variant?: string }[]; slots?: { concept?: string; skill?: string; variant?: string }[]; distractorWords?: { untested?: { id: string }[]; review?: { id: string }[] }; passageWords?: { id: string }[] };

/** Briefs on disk whose source the bank does not hold yet (still being authored), for this measure. */
export function inFlightBriefs(metas: BankMetas, measure: string): Brief[] {
  if (!fs.existsSync(BRIEFS)) return [];
  const prefix = measure === "quant" ? /^(quant-\d+|qbank-\d+)\.json$/ : /^(verbal-\d+|drill-\d+|vbank-\d+)\.json$/;
  return fs
    .readdirSync(BRIEFS)
    .filter((f) => prefix.test(f))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(BRIEFS, f), "utf8")) as Brief)
    .filter((b) => !metas.sources.has(b.testId));
}

/**
 * What a new brief should not pick again (docs/PRIORITY.md, holds): the targets of items held by a ready or started
 * quiz or an open mock attempt, and of briefs still being authored, as itemId -> holders; and the words those will show
 * anyway (distractors, passage words), so a brief does not offer them as never-seen. Same shape the brief has always used.
 */
export async function bankHolds(db: DB, metas: BankMetas, measure: string) {
  const [quizzes, attempts] = await Promise.all([db.select({ id: schema.quizzes.id, status: schema.quizzes.status, layout: schema.quizzes.layout }).from(schema.quizzes), db.select().from(schema.attempts)]);
  const held = heldRefs(quizzes, attempts, (sid) => (metas.bySource.get(sid) ?? []).map((i) => i.ref));
  const items = new Map<string, string[]>();
  const hold = (item: string, by: string) => {
    const h = items.get(item) ?? [];
    if (!h.includes(by)) items.set(item, [...h, by]);
  };
  const shown = new Set<string>();
  const holders = new Set<string>();
  const quizOf = new Map<string, string>();
  for (const q of quizzes) for (const s of (q.layout as { sections: { items: { ref: string }[] }[] }).sections) for (const i of s.items) quizOf.set(i.ref, `quiz-${q.id}`);
  for (const ref of held) {
    const m = metas.byRef.get(ref);
    if (!m || m.measure !== measure) continue;
    const by = quizOf.get(ref) ?? m.sourceId;
    holders.add(by);
    if (m.primary) hold(m.primary, by);
    for (const k of m.keyWords) hold(k, by);
    for (const t of m.tags) if (t.kind === "word" && (t.role === "distractor" || t.role === "passage")) shown.add(t.id);
  }
  for (const b of inFlightBriefs(metas, measure)) {
    holders.add(b.testId);
    for (const id of [...(b.keyWords ?? []).map((k) => k.id), ...(b.skillSlots ?? []).map((k) => k.skill), ...(b.conceptSlots ?? []).map((k) => k.concept), ...(b.slots ?? []).flatMap((s) => [s.concept, s.skill].filter((x): x is string => !!x))]) hold(id, b.testId);
    for (const w of [...(b.distractorWords?.untested ?? []), ...(b.distractorWords?.review ?? []), ...(b.passageWords ?? [])]) shown.add(w.id);
  }
  return { untaken: [...holders].sort(), items, shown, held };
}

/**
 * Every locked answer the revisit queue reads: those of finished attempts (timed at the finish) and of the drill
 * (timed when locked; a drill attempt never finishes). Replays are left out: they re-ask a known item.
 */
export async function finishedAnswers(db: DB): Promise<Answered[]> {
  const attempts = await db.select().from(schema.attempts);
  const at = new Map(attempts.filter((a) => a.finishedAt && a.mode !== "replay").map((a) => [a.id, a.finishedAt!]));
  const drill = new Set(attempts.filter((a) => a.mode === "drill").map((a) => a.id));
  return (await db.select().from(schema.responses))
    .filter((r) => r.finalized && !r.reused && (at.has(r.attemptId) || drill.has(r.attemptId)))
    .map((r) => ({ questionId: r.questionId, isCorrect: r.isCorrect, guessed: r.guessed, at: at.get(r.attemptId) ?? r.updatedAt }));
}

/** Accuracy and pace per question type on this measure, most in need of practice first (replays and reused items left out). */
export async function typeFocus(db: DB, metas: BankMetas, measure: string) {
  const attempts = await db.select({ id: schema.attempts.id, mode: schema.attempts.mode }).from(schema.attempts);
  const replays = new Set(attempts.filter((a) => a.mode === "replay").map((a) => a.id));
  const rows = (await db.select().from(schema.responses))
    .filter((r) => r.finalized && !r.reused && !replays.has(r.attemptId) && metas.byRef.get(r.questionId)?.measure === measure)
    .map((r) => ({ type: metas.byRef.get(r.questionId)!.slotType as SlotType, isCorrect: r.isCorrect, guessed: r.guessed, timeMs: r.timeMs }));
  return typeStats(rows).map((s) => ({
    type: s.type,
    label: TYPE_INFO[s.type].label,
    answered: s.n,
    accuracy: +(s.correct / s.n).toFixed(2),
    avgSec: Math.round(s.avgMs / 1000),
    paceSec: TYPE_INFO[s.type].paceSec,
    need: +s.need.toFixed(2),
  }));
}

/**
 * Variants used so far (concept -> variant -> times): every source's recorded variants (lib/setup-history.ts), plus
 * briefs still being authored, counted 1.5 so two parallel batches don't practise the same form.
 */
export function variantsUsed(measure: string, metas: BankMetas, current: string) {
  const used = testVariants(measure);
  for (const b of inFlightBriefs(metas, measure)) {
    if (b.testId === current) continue;
    const pairs = [...(b.conceptSlots ?? []).map((s) => [s.concept, s.variant] as const), ...(b.skillSlots ?? []).map((s) => [s.skill, s.variant] as const), ...(b.slots ?? []).map((s) => [s.concept ?? s.skill ?? "", s.variant] as const)];
    for (const [concept, variant] of pairs) {
      if (!variant || !concept) continue;
      const m = used.get(concept) ?? new Map<string, number>();
      used.set(concept, m.set(variant, (m.get(variant) ?? 0) + 1.5));
    }
  }
  return used;
}

export const keyWordsOf = (q: Pick<Question, "tags">) => q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id);

/** A revisit as a brief shows it: the earlier item, how it went, and the structural change the sibling makes. */
export const revisitNote = (measure: "verbal" | "quant", r: Revisit, n: number) => ({
  ref: r.ref,
  result: r.result,
  item: itemText(r.question),
  setup: r.question.setup,
  change: REVISIT_CHANGES[measure][n % REVISIT_CHANGES[measure].length],
});

export type UsedBefore = { ref: string; stem?: string; keys?: string[]; distractors: string[] };

/** Verbal: earlier TC / SE items per key word (every source), with their distractor words, so a returning word gets new company. */
export function wordHistory(): Map<string, UsedBefore[]> {
  const out = new Map<string, UsedBefore[]>();
  for (const t of measureSources("verbal"))
    for (const q of t.questions.filter((x) => x.type === "tc" || x.type === "se")) {
      const distractors = q.tags.filter((x) => x.kind === "word" && x.role === "distractor").map((x) => x.id);
      const keys = keyWordsOf(q);
      // the stem too, so a returning word's earlier frame is visible: without it, authors reach for the word's textbook frame, which the earlier item usually used
      for (const k of keys) out.set(k, [...(out.get(k) ?? []), { ref: `${t.id}:${q.id}`, stem: clip(q.prompt, 200), keys, distractors }]);
    }
  return out;
}

/** Per key word, the distractor words of every earlier TC / SE item it keyed: `check` bars them when it returns. */
export function earlierCompany() {
  const out = new Map<string, Set<string>>();
  for (const [k, uses] of wordHistory()) for (const u of uses) u.distractors.forEach((d) => out.set(k, (out.get(k) ?? new Set()).add(d)));
  return out;
}

/** SE key pairs any source already keyed, as "a|b" with a < b, so a brief never repeats one. */
export function keyedSePairs() {
  const out = new Set<string>();
  for (const t of measureSources("verbal"))
    for (const q of t.questions.filter((x) => x.type === "se")) {
      const k = keyWordsOf(q).sort();
      if (k.length === 2) out.add(k.join("|"));
    }
  return out;
}

// ---- official exemplars (local corpus only, never committed)
export type RefItem = { id: string; type: string; source: string; pplus: number | null; difficulty: string | null; concepts?: string[]; answer_check?: string };
export function refItems(): RefItem[] {
  if (!fs.existsSync(REF)) return [];
  return fs
    .readFileSync(REF, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((x) => x.type !== "passage" && x.answer_check !== "not_found");
}

/** Estimated level of an official item: from P+ (5: <30, 4: 30-45, 3: 45-60), else from the OG set label. */
export function levelOf(x: RefItem): number | null {
  if (x.pplus !== null && x.pplus !== undefined) return x.pplus < 30 ? 5 : x.pplus < 45 ? 4 : x.pplus < 60 ? 3 : 2;
  if (x.difficulty === "hard") return 4.5;
  if (x.difficulty === "medium") return 3;
  return null;
}

/** Hardest official items whose primary concept is `concept`. */
export function conceptExemplars(items: RefItem[], concept: string) {
  return items
    .filter((x) => x.concepts?.[0] === concept && levelOf(x) !== null)
    .sort((a, b) => levelOf(b)! - levelOf(a)!)
    .slice(0, 2)
    .map((x) => x.id);
}

// ---- TC / SE batches (the drill style: standalone items that show many words each)
export type TcseType = "se" | "tc1" | "tc2" | "tc3";
/** The type mix: SE and the longer completions show the most words per question (6, 9, 6, 5). */
export const TCSE_MIX: [TcseType, number][] = [["se", 0.4], ["tc3", 0.3], ["tc2", 0.2], ["tc1", 0.1]];
export const TCSE_KEYS: Record<TcseType, number> = { se: 2, tc1: 1, tc2: 2, tc3: 3 };
export const TCSE_DISTRACTORS: Record<TcseType, number> = { se: 4, tc1: 4, tc2: 4, tc3: 6 };

/** Largest-remainder split of `n` slots over a mix. */
export function splitMix<T extends string>(n: number, mix: [T, number][]): T[] {
  const raw = mix.map(([t, w]) => ({ t, x: w * n }));
  const k = raw.map((r) => Math.floor(r.x));
  let left = n - k.reduce((a, b) => a + b, 0);
  for (const i of raw.map((r, i) => ({ i, f: r.x - Math.floor(r.x) })).sort((a, b) => b.f - a.f).map((r) => r.i)) {
    if (left <= 0) break;
    k[i]++;
    left--;
  }
  return raw.flatMap((r, i) => Array<T>(k[i]).fill(r.t));
}

export type Shown = { id: string; word: string; secondary: boolean; sense: string | null };
const POS_ABBR: Record<string, string> = { noun: "n", verb: "v", adjective: "adj", adverb: "adv" };
/** `torpor (n)`, or `foil (v, 2nd sense: to prevent from succeeding)` for a word whose everyday sense is not the one. */
export function choiceWord(w: Shown) {
  const [pos, ...def] = (w.sense ?? "").split(" ");
  const abbr = POS_ABBR[pos] ?? pos;
  return w.secondary ? `${w.word} (${abbr}, 2nd sense: ${def.join(" ")})` : `${w.word} (${abbr})`;
}

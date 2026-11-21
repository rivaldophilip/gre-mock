// Build a generation brief from the DB: which words/concepts the next test must target.
// usage: npm run brief -- verbal|quant [--seed N] [--user <email>]  (the only account is the default)
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import fs from "node:fs";
import path from "node:path";
import { schema } from "../lib/db";
import { oneTarget } from "./lib/accounts";
import { bankSynonyms } from "./lib/bank";
import { DRILL_DIR, isDrillId } from "../lib/test-path";
import { markPending, scoreAll, type ItemScore, type LoggedEvent } from "../lib/priority/compute";
import { PASSAGE_WORDS_MIN, SE_TRAP_PAIRS, UNTESTED_DISTRACTOR_SHARE } from "../lib/priority/config";
import { allocateConcepts, allocateVerbalKeys, assignVariants, drawMultiKeys, pairSeKeys, rng, SE_PAIRS } from "../lib/priority/allocate";
import { slotType, typeStats, TYPE_INFO, type SlotType } from "../lib/qtypes";
import { conceptHistory, itemText, measureTests, primaryOf, testVariants, type SetupGroup } from "../lib/setup-history";
import { matchRevisits, revisitQueue, REVISIT_CHANGES, type Answered, type Revisit } from "../lib/priority/revisit";
import type { Question } from "../lib/types";

const measure = process.argv[2] as "verbal" | "quant";
if (measure !== "verbal" && measure !== "quant") {
  console.error("usage: npm run brief -- verbal|quant");
  process.exit(1);
}
const seedArg = process.argv.indexOf("--seed");

const blueprint = JSON.parse(fs.readFileSync("data/blueprints.json", "utf8"))[measure];
const REF = path.resolve("../books/extracted/reference/items.jsonl"); // local-only corpus (not in the repo)

/** Test ids this measure already uses: written tests plus briefs still being authored (so parallel runs don't collide). */
function usedNumbers() {
  const nums = (dir: string, re: RegExp) =>
    fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => re.exec(f)).filter((m) => m).map((m) => Number(m![1])) : [];
  return [...nums("content/tests", new RegExp(`^${measure}-(\\d+)\\.json$`)), ...nums("content/briefs", new RegExp(`^${measure}-(\\d+)\\.json$`))];
}
function nextId() {
  return `${measure}-${String(Math.max(0, ...usedNumbers()) + 1).padStart(3, "0")}`;
}

/** Targets of briefs whose test is not registered yet (still being authored), as [itemId, test id] pairs. */
function inFlightBriefs(registered: Set<string>) {
  const dir = "content/briefs";
  const out: [string, string][] = [];
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => new RegExp(`^${measure}-\\d+\\.json$`).test(f)).sort() : []) {
    const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (registered.has(b.testId)) continue;
    const ids: string[] = [
      ...(b.keyWords ?? []).map((k: { id: string }) => k.id),
      ...(b.skillSlots ?? []).map((k: { skill: string }) => k.skill),
      ...(b.conceptSlots ?? []).map((k: { concept: string }) => k.concept),
    ];
    for (const id of ids) out.push([id, b.testId]);
  }
  return out;
}

type DrillBrief = { testId: string; keyWords?: { id: string }[]; distractorWords?: { untested?: { id: string }[]; review?: { id: string }[] } };
/** Drill batch briefs on disk (content/briefs/drill-NNN.json). */
function drillBriefs(): DrillBrief[] {
  const dir = "content/briefs";
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^drill-\d+\.json$/.test(f)).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) : [];
}

/** Never-seen words that briefs still being authored offer as distractors or passage words, so sibling briefs offer others. */
function inFlightFreshWords(registered: Set<string>) {
  const dir = "content/briefs";
  const out = new Set<string>();
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => new RegExp(`^${measure}-\\d+\\.json$`).test(f)) : []) {
    const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (registered.has(b.testId)) continue;
    for (const w of [...(b.distractorWords?.untested ?? []), ...(b.distractorWords?.review ?? []), ...(b.passageWords ?? [])] as { id: string }[]) out.add(w.id);
  }
  return out;
}

/** Revisit refs promised by other briefs whose test is not written yet, so parallel briefs don't sibling one item twice. */
function inFlightRevisits(current: string) {
  const dir = "content/briefs";
  const refs = new Set<string>();
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => new RegExp(`^${measure}-\\d+\\.json$`).test(f)) : []) {
    const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (b.testId === current || fs.existsSync(path.join("content/tests", `${b.testId}.json`))) continue;
    for (const s of [...(b.keyWords ?? []), ...(b.conceptSlots ?? [])] as { revisit?: { ref: string } }[]) if (s.revisit) refs.add(s.revisit.ref);
  }
  return refs;
}

/**
 * Variants used so far (concept -> variant -> times). A test that records its variants (quant `variant` fields)
 * counts from its questions; a brief counts only while its test is unwritten or records none (verbal skill slots).
 * A brief whose test is unwritten is a sibling being authored in parallel, so it counts 1.5: on a tie with a variant an
 * earlier test used once, the sibling's variant loses, and two parallel mocks don't practise the same form.
 */
function variantsUsed(current: string) {
  const dir = "content/briefs";
  const used = testVariants(measure);
  const recorded = new Set<string>();
  for (const f of fs.existsSync("content/tests") ? fs.readdirSync("content/tests").filter((f) => new RegExp(`^${measure}-\\d+\\.json$`).test(f)) : []) {
    const t = JSON.parse(fs.readFileSync(path.join("content/tests", f), "utf8"));
    if ((t.questions ?? []).some((q: { variant?: string }) => q.variant)) recorded.add(t.id);
  }
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => new RegExp(`^${measure}-\\d+\\.json$`).test(f)) : []) {
    const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (b.testId === current || recorded.has(b.testId)) continue;
    const weight = fs.existsSync(path.join("content/tests", `${b.testId}.json`)) ? 1 : 1.5;
    const slots = [
      ...((b.conceptSlots ?? []) as { concept: string; variant?: string }[]).map((s) => [s.concept, s.variant] as const),
      ...((b.skillSlots ?? []) as { skill: string; variant?: string }[]).map((s) => [s.skill, s.variant] as const),
    ];
    for (const [concept, variant] of slots) {
      if (!variant) continue;
      const m = used.get(concept) ?? new Map<string, number>();
      used.set(concept, m.set(variant, (m.get(variant) ?? 0) + weight));
    }
  }
  return used;
}

/** Cut at a word boundary, so a topic reads as words rather than a fragment. */
function clip(s: string, n: number) {
  if (s.length <= n) return s;
  const i = s.lastIndexOf(" ", n);
  return s.slice(0, i > 0 ? i : n) + "…";
}

/** Verbal: passage topics of every earlier test, stems of the latest only. Quant lists its history per concept slot instead. */
function previousTests() {
  const dir = "content/tests";
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(measure + "-")).sort();
  return files
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .map((t, i) => ({
      id: t.id,
      passageTopics: (t.passages ?? []).map((p: { title?: string; paragraphs: string[] }) => p.title ?? clip(p.paragraphs[0], 70)),
      ...(i === files.length - 1 ? { stems: (t.questions ?? []).map((q: { prompt: string }) => clip(q.prompt, 60)) } : {}),
    }));
}

/**
 * Items that registered tests without a finished attempt already target (key words, primary skills / concepts),
 * as itemId -> the test ids holding it. Making several tests before taking them then spreads the targets instead of
 * repeating them; once every item is held, the least-held ones come first.
 */
async function pendingItems(db: Awaited<ReturnType<typeof oneTarget>>["db"]) {
  const tests = await db.select({ id: schema.tests.id }).from(schema.tests);
  const taken = new Set((await db.select({ t: schema.attempts.testId, f: schema.attempts.finishedAt }).from(schema.attempts)).filter((a) => a.f).map((a) => a.t));
  const untaken = new Set(tests.map((t) => t.id).filter((id) => !taken.has(id)));
  const out = new Map<string, string[]>();
  const hold = (item: string, test: string) => {
    const held = out.get(item) ?? [];
    if (!held.includes(test)) out.set(item, [...held, test]);
  };
  // words an untaken test will show anyway (distractors, passage words): not offered again as never-seen
  const shown = new Set<string>();
  // a drill batch is taken one question at a time: only its unanswered questions still hold their words
  const drillRuns = new Set((await db.select({ id: schema.attempts.id, mode: schema.attempts.mode }).from(schema.attempts)).filter((a) => a.mode === "drill").map((a) => a.id));
  const drillAnswered = new Set((await db.select().from(schema.responses)).filter((r) => r.finalized && drillRuns.has(r.attemptId)).map((r) => r.questionId));
  for (const r of await db.select().from(schema.questionItems)) {
    const test = r.questionId.split(":")[0];
    if (isDrillId(test)) {
      if (drillAnswered.has(r.questionId) || r.kind !== "word") continue;
      if (r.role === "key") hold(r.itemId, test);
      else shown.add(r.itemId);
      continue;
    }
    if (!untaken.has(test)) continue;
    if (r.role === "key" || r.role === "primary") hold(r.itemId, test);
    else if (r.kind === "word") shown.add(r.itemId);
  }
  // briefs still being authored count as untaken tests too
  const registered = new Set(tests.map((t) => t.id));
  for (const [item, test] of inFlightBriefs(registered)) {
    untaken.add(test);
    hold(item, test);
  }
  for (const item of inFlightFreshWords(registered)) shown.add(item);
  // drill briefs still being authored: their keys are held and their distractors will be shown
  if (measure === "verbal")
    for (const b of drillBriefs().filter((b) => !registered.has(b.testId))) {
      for (const k of b.keyWords ?? []) hold(k.id, b.testId);
      for (const w of b.distractorWords?.untested ?? []) shown.add(w.id);
    }
  // only drill batches with questions left count as untaken
  const listed = [...untaken].filter((t) => !isDrillId(t) || [...out.values()].some((ts) => ts.includes(t)));
  return { untaken: listed.sort(), items: out, shown };
}

/** Every finalized answer of a finished attempt, timed at the attempt's finish: what the revisit queue reads. */
async function finishedAnswers(db: Awaited<ReturnType<typeof oneTarget>>["db"]): Promise<Answered[]> {
  const done = new Map((await db.select().from(schema.attempts)).filter((a) => a.finishedAt).map((a) => [a.id, a.finishedAt!]));
  return (await db.select().from(schema.responses))
    .filter((r) => r.finalized && done.has(r.attemptId))
    .map((r) => ({ questionId: r.questionId, isCorrect: r.isCorrect, guessed: r.guessed, at: done.get(r.attemptId)! }));
}

const keyWordsOf = (q: Question) => q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id);

/** A revisit as the brief shows it: the earlier item, how it went, and the structural change the sibling makes. */
const revisitNote = (r: Revisit, n: number) => ({
  ref: r.ref,
  result: r.result,
  item: itemText(r.question),
  setup: r.question.setup,
  change: REVISIT_CHANGES[measure][n % REVISIT_CHANGES[measure].length],
});

/** Verbal: earlier TC / SE items per key word, with their distractor words, so a returning word gets new company. */
function wordHistory(): Map<string, UsedBefore[]> {
  const out = new Map<string, UsedBefore[]>();
  for (const t of [...measureTests("verbal"), ...measureTests("drill", DRILL_DIR)])
    for (const q of t.questions.filter((x) => x.type === "tc" || x.type === "se")) {
      const distractors = q.tags.filter((x) => x.kind === "word" && x.role === "distractor").map((x) => x.id);
      const keys = keyWordsOf(q);
      // the stem too, so a returning word's earlier frame is visible: without it, authors reach for the word's textbook frame, which the earlier item usually used
      for (const k of keys) out.set(k, [...(out.get(k) ?? []), { ref: `${t.id}:${q.id}`, stem: clip(q.prompt, 200), keys, distractors }]);
    }
  return out;
}

/** Accuracy and pace per question type on this measure, most in need of practice first. */
async function typeFocus(db: Awaited<ReturnType<typeof oneTarget>>["db"]) {
  const dir = "content/tests";
  const typeOf = new Map<string, SlotType>();
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.startsWith(measure + "-")) : []) {
    const t = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const q of t.questions ?? []) typeOf.set(`${t.id}:${q.id}`, slotType(q));
  }
  // miss replays re-ask questions already seen, so they would flatter the format's accuracy
  const replays = new Set((await db.select({ id: schema.attempts.id, mode: schema.attempts.mode }).from(schema.attempts)).filter((a) => a.mode === "replay").map((a) => a.id));
  const rows = (await db.select().from(schema.responses))
    .filter((r) => r.finalized && typeOf.has(r.questionId) && !replays.has(r.attemptId))
    .map((r) => ({ type: typeOf.get(r.questionId)!, isCorrect: r.isCorrect, guessed: r.guessed, timeMs: r.timeMs }));
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

type RefItem = { id: string; type: string; source: string; pplus: number | null; difficulty: string | null; concepts?: string[]; answer_check?: string };
function refItems(): RefItem[] {
  if (!fs.existsSync(REF)) return [];
  return fs
    .readFileSync(REF, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((x) => x.type !== "passage" && x.answer_check !== "not_found");
}

/** Estimated level of an official item: from P+ (5: <30, 4: 30-45, 3: 45-60), else from the OG set label. */
function levelOf(x: RefItem): number | null {
  if (x.pplus !== null && x.pplus !== undefined) return x.pplus < 30 ? 5 : x.pplus < 45 ? 4 : x.pplus < 60 ? 3 : 2;
  if (x.difficulty === "hard") return 4.5;
  if (x.difficulty === "medium") return 3;
  return null;
}

/** Which official item types can anchor a blueprint slot type (old Big Book formats map onto modern ones). */
const ANCHORS: Record<string, string[]> = {
  tc1: ["tc1", "sc_old"], tc2: ["tc2", "sc_old"], tc3: ["tc3"], se: ["se", "sc_old"],
  rc: ["rc"], rc_multi: ["rc_multi"], rc_select: ["rc_select"], arg: ["arg"],
  qc: ["qc"], mc: ["mc"], mc_multi: ["mc_multi"], numeric: ["numeric"], di: ["di"],
};

/** 2-3 official exemplars per blueprint slot, at the slot's level, not reused across slots while others remain. */
function slotExemplars(items: RefItem[]) {
  const used = new Map<string, number>();
  return (blueprint.sections as { n: number; slots: { type: string; level: number }[] }[]).flatMap((sec) =>
    sec.slots.map((slot, i) => {
      const pool = items
        .filter((x) => (ANCHORS[slot.type] ?? [slot.type]).includes(x.type) && levelOf(x) !== null)
        .map((x) => ({ x, gap: Math.abs(levelOf(x)! - slot.level) }))
        // within one level when the corpus allows; rare types (rc_select) fall back to the nearest level
        .filter((c, _i, all) => c.gap <= 1 || all.filter((o) => o.gap <= 1).length < 2)
        .sort((a, b) => (used.get(a.x.id) ?? 0) - (used.get(b.x.id) ?? 0) || a.gap - b.gap || (a.x.pplus ?? 50) - (b.x.pplus ?? 50));
      const pick = pool.slice(0, 3).map((c) => c.x.id);
      pick.forEach((id) => used.set(id, (used.get(id) ?? 0) + 1));
      return { section: sec.n, slot: i + 1, type: slot.type, level: slot.level, exemplars: pick };
    }),
  );
}

/** Hardest official items whose primary concept is `concept`. */
function conceptExemplars(items: RefItem[], concept: string) {
  return items
    .filter((x) => x.concepts?.[0] === concept && levelOf(x) !== null)
    .sort((a, b) => levelOf(b)! - levelOf(a)!)
    .slice(0, 2)
    .map((x) => x.id);
}

async function main() {
  const { account, db } = await oneTarget();
  console.log(`brief for ${account.email} (${account.dbName})`);
  const seed = seedArg > 0 ? Number(process.argv[seedArg + 1]) : Date.now() % 100000;
  const random = rng(seed);
  const now = new Date();
  const allEvents = await db.select().from(schema.itemEvents);
  const eventsOf = (kind: "word" | "concept"): LoggedEvent[] =>
    allEvents.filter((e) => e.kind === kind).map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt, attemptId: e.attemptId }));
  const logged = eventsOf(measure === "verbal" ? "word" : "concept");
  // quant concepts and reading skills share the concepts table; areas tell them apart
  const SKILL_AREAS = ["reading", "argument"];
  const conceptRows = await db.select().from(schema.concepts);
  const id = nextId();
  const heldRevisits = inFlightRevisits(id);
  const notHeld = (r: Revisit) => !heldRevisits.has(r.ref);
  const refs = refItems();
  const pending = await pendingItems(db);
  if (pending.untaken.length) console.log(`untaken tests: ${pending.untaken.join(", ")}; ${pending.items.size} of their targets are damped`);
  const slots: Slot[] = slotExemplars(refs);
  // select-all slots get their key count up front (official 1 / 2 / 3 mix), so the author doesn't default to two
  const multi = slots.filter((s) => s.type === "rc_multi");
  drawMultiKeys(multi.length, random).forEach((k, i) => (multi[i].keys = k));
  const brief: Record<string, unknown> = { testId: id, measure, seed, generatedAt: now.toISOString(), untakenTests: pending.untaken, blueprint, ...(measure === "verbal" ? { previous: previousTests() } : {}), slots, typeFocus: await typeFocus(db) };
  const focusNote =
    " typeFocus ranks question types by practice need (miss rate plus slowness against pace): put the weakest review words / skills / concepts on the slots of the top two types (need >= 0.4), so the practice lands where it is needed.";

  if (measure === "verbal") {
    const vocab = (await db.select().from(schema.vocab)).filter((v) => !v.pink);
    const byId = new Map(vocab.map((v) => [v.id, v]));
    const scores = markPending(scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield })), logged, now), pending.items);
    const drawn = allocateVerbalKeys(scores, (wid) => !!byId.get(wid)?.isSecondary, 29, random);
    // SE keys two words: pair key words with bank synonyms up front, so all 29 can be keys (never an SE pair keyed before)
    const synonyms = bankSynonyms();
    const seKeyed = new Set([...measureTests("verbal"), ...measureTests("drill", DRILL_DIR)].flatMap((t) => t.questions.filter((q) => q.type === "se").map((q) => keyWordsOf(q).sort().join("|"))));
    const { keys, pairs: sePairs } = pairSeKeys(drawn, scores, (wid) => synonyms.get(wid) ?? [], {
      keep: (wid) => !!byId.get(wid)?.isSecondary,
      usedPair: (a, b) => seKeyed.has([a, b].sort().join("|")),
    });
    const used = new Set(keys.map((k) => k.itemId));
    const rest = scores.filter((s) => !used.has(s.itemId));
    const weakD = rest.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).slice(0, 25);
    const weakIds = new Set(weakD.map((s) => s.itemId));
    // untested distractors: never-seen words, a deep enough list that UNTESTED_DISTRACTOR_SHARE of ~40 distractors fits;
    // words an untaken test or sibling brief already shows go last, so parallel mocks spend different words
    const unshown = (s: ItemScore) => (pending.shown.has(s.itemId) ? 1 : 0);
    const freshAll = rest.filter((s) => !weakIds.has(s.itemId) && s.N === 1).sort(() => random() - 0.5).sort((a, b) => unshown(a) - unshown(b));
    // SE trap pairs: two never-seen bank synonyms that suit each other but not the sentence. Left to chance the list
    // held 1-2 such pairs, so authors filled SE traps with non-bank words or the same weak pairs in every sibling
    // same part of speech as each other and as some key word, or no SE item can carry the pair (nouns with no noun key)
    const posOf = (wid: string) => (byId.get(wid)?.senses as { pos?: string }[] | null)?.[0]?.pos;
    const keyPos = new Set(keys.map((k) => posOf(k.itemId)).filter(Boolean));
    const pairable = new Set(freshAll.filter((s) => !pending.shown.has(s.itemId) && !byId.get(s.itemId)?.isSecondary && keyPos.has(posOf(s.itemId))).map((s) => s.itemId));
    const trapPairs: [string, string][] = [];
    const inPair = new Set<string>();
    for (const s of freshAll) {
      if (trapPairs.length >= SE_TRAP_PAIRS) break;
      if (!pairable.has(s.itemId) || inPair.has(s.itemId)) continue;
      const mate = [...(synonyms.get(s.itemId) ?? [])].find((o) => pairable.has(o) && !inPair.has(o) && posOf(o) === posOf(s.itemId));
      if (!mate) continue;
      trapPairs.push([s.itemId, mate]);
      inPair.add(s.itemId).add(mate);
    }
    const freshD = [...freshAll.filter((s) => inPair.has(s.itemId)), ...freshAll.filter((s) => !inPair.has(s.itemId))].slice(0, 60);
    const freshIds = new Set(freshD.map((s) => s.itemId));
    // passage words never repeat a distractor-list word, so each one is a further word seen
    const free = scores.filter((s) => !used.has(s.itemId) && !weakIds.has(s.itemId) && !freshIds.has(s.itemId) && s.N === 1);
    const byNY = (a: ItemScore, b: ItemScore) => unshown(a) - unshown(b) || b.N * b.Y - a.N * a.Y;
    // shuffled first: equal N·Y would otherwise keep table order, so every brief drew the same a-c words
    const tiered = free.filter((s) => ["passage", "extended"].includes(byId.get(s.itemId)!.tier)).sort(() => random() - 0.5).sort(byNY);
    // until the passage/extended tiers are populated, fall back to untested bank words
    const filler = free.filter((s) => !tiered.includes(s)).sort(() => random() - 0.5).sort(byNY);
    const passPool = [...tiered, ...filler].slice(0, 40);
    const show = (s: ItemScore, bucket?: string) => {
      const v = byId.get(s.itemId)!;
      const sense = (v.senses as { def: string; pos?: string; secondary?: boolean }[] | null)?.[0];
      return { word: v.lemma, id: v.id, tier: v.tier, secondary: v.isSecondary, sense: sense ? `${sense.pos ?? ""} ${sense.def}`.trim() : null, bucket, reason: s.reason, P: +s.P.toFixed(2) };
    };
    const answers = await finishedAnswers(db);
    const revisits = matchRevisits(keys.map((k) => k.itemId), revisitQueue(answers, measureTests(measure), now).filter(notHeld), keyWordsOf);
    const history = wordHistory();
    let nth = 0;
    const keySlots = keys.map((k, i) => ({
      ...show(scores.find((s) => s.itemId === k.itemId)!, k.bucket),
      reason: k.reason,
      usedBefore: history.get(k.itemId) ?? [],
      ...(revisits.has(i) ? { revisit: revisitNote(revisits.get(i)!, nth++) } : {}),
    }));
    // reading skills: the blueprint's argument slots get argument skills, the other RC slots reading skills
    const rcSlots = (blueprint.sections as { slots: { type: string }[] }[]).flatMap((sec) => sec.slots).filter((sl) => sl.type.startsWith("rc") || sl.type === "arg");
    const nArg = rcSlots.filter((sl) => sl.type === "arg").length;
    const skillRows = conceptRows.filter((c) => SKILL_AREAS.includes(c.area));
    const skillScores = markPending(scoreAll(skillRows.map((c) => ({ id: c.id, yield: c.yield })), eventsOf("concept"), now), pending.items);
    const skillArea = new Map(skillRows.map((c) => [c.id, c.area]));
    const pickSkills = (area: string, n: number) =>
      allocateConcepts(skillScores.filter((s) => skillArea.get(s.itemId) === area).map((s) => ({ ...s, area })), n, [area], random);
    const skillPicks = [...pickSkills("reading", rcSlots.length - nArg), ...pickSkills("argument", nArg)];
    // a skill repeats across slots and mocks, so each slot also gets the sub-form used least so far
    const skillVariants = assignVariants(skillPicks.map((p) => p.itemId), JSON.parse(fs.readFileSync("data/concept_variants.json", "utf8")), variantsUsed(id), random);
    const skillSlots = skillPicks.map((p, i) => ({
      skill: p.itemId,
      name: skillRows.find((c) => c.id === p.itemId)?.name,
      variant: skillVariants[i],
      area: skillArea.get(p.itemId),
      bucket: p.bucket,
      reason: p.reason,
      exemplars: conceptExemplars(refs, p.itemId),
    }));
    Object.assign(brief, {
      keyWords: keySlots,
      sePairs,
      skillSlots,
      distractorWords: { weak: weakD.map((s) => show(s)), untested: freshD.map((s) => show(s)), trapPairs: trapPairs.map((p) => p.map((w) => byId.get(w)!.lemma)) },
      passageWords: passPool.map((s) => show(s)),
      wordTargets: { untestedDistractorShare: UNTESTED_DISTRACTOR_SHARE, passageWordsMin: PASSAGE_WORDS_MIN },
      instructions:
        "Use keyWords as the answers/keys across TC blanks and SE pairs (29 slots, order free); key each of the sePairs (two key words that are bank synonyms) as one SE item; any other SE item pairs a key word with a listed bank synonym. Draw at least " + Math.round(UNTESTED_DISTRACTOR_SHARE * 100) + "% of the distractor words from distractorWords.untested, the rest from distractorWords.weak. Weave " + PASSAGE_WORDS_MIN + "-6 passageWords into each RC passage (not the arguments). check enforces both. Do not write word tags: `npm run tag` fills them from the choice and passage text (regular inflections match; tag an irregular form such as `forsworn` by hand). Each key word's `sense` is the GRE-tested sense: write the sentence so THAT sense is the one that fits (for secondary=true words, the everyday sense must be the trap). Give each RC question one primary skill tag {kind:'concept', role:'primary'} from skillSlots (argument skills on the arg items, rc-select-verify suits rc_multi), optionally a secondary one; the reading skills can repeat. Write each skill slot's question as its `variant`. A key word that was used before comes back in a new sentence logic, with a new SE partner where possible, and with no distractor from its earlier items (the validator rejects a shared distractor or a repeated SE pair). A key word with a `revisit` is a deliberate sibling of that earlier item, made with the change named: set `revisits` to its ref on the question." + focusNote,
    });
  } else {
    const concepts = conceptRows.filter((c) => !SKILL_AREAS.includes(c.area));
    const scores = markPending(scoreAll(concepts.map((c) => ({ id: c.id, yield: c.yield })), logged, now), pending.items);
    const areaOf = new Map(concepts.map((c) => [c.id, c.area]));
    const withArea = scores.map((s) => ({ ...s, area: areaOf.get(s.itemId)! }));
    const picks = allocateConcepts(withArea, 27, ["arithmetic", "algebra", "geometry", "data"], random);
    const revisits = matchRevisits(picks.map((p) => p.itemId), revisitQueue(await finishedAnswers(db), measureTests(measure), now).filter(notHeld), (q) => [primaryOf(q) ?? ""]);
    // a revisit keeps its earlier item's form (the change it names is structural), so its slot takes that variant
    const siblingForms = new Map([...revisits].flatMap(([i, r]) => (r.question.variant ? [[i, r.question.variant] as const] : [])));
    const variants = assignVariants(picks.map((p) => p.itemId), JSON.parse(fs.readFileSync("data/concept_variants.json", "utf8")), variantsUsed(id), random, siblingForms);
    const history = conceptHistory(measure);
    // other earlier items in a revisited item's setup group: the sibling's change must differ from theirs too, or the judge
    // calls it a copy of one of them (quant-018's revisit of a worn two-set item moved its trap where quant-006 already had)
    const shownOf = new Map<string, string>(measureTests(measure).flatMap((t) => t.questions.map((q) => [`${t.id}:${q.id}`, itemText(q)] as [string, string])));
    const siblingsOf = (concept: string, ref: string) =>
      ((history.get(concept) ?? []).find((g) => g.items.some((it) => `${it.testId}:${it.qid}` === ref))?.items ?? [])
        .map((it) => `${it.testId}:${it.qid}`)
        .filter((r) => r !== ref)
        .map((r) => `${r}: ${clip(shownOf.get(r) ?? "", 220)}`);
    let nth = 0;
    brief.conceptSlots = picks.map((p, i) => ({
      slot: i + 1,
      concept: p.itemId,
      name: concepts.find((c) => c.id === p.itemId)?.name,
      variant: variants[i],
      area: areaOf.get(p.itemId),
      bucket: p.bucket,
      reason: p.reason,
      exemplars: conceptExemplars(refs, p.itemId),
      history: history.get(p.itemId) ?? [],
      ...(revisits.has(i) ? { revisit: { ...revisitNote(revisits.get(i)!, nth++), siblings: siblingsOf(p.itemId, revisits.get(i)!.ref) } } : {}),
    }));
    brief.instructions =
      "Assign the 27 concept slots to the 27 blueprint slots (any order, but a DI set of 3 should share a concept area). Each question: one primary concept (the slot) and optional secondary tags. Write each question as its slot's variant, the form of the concept earlier mocks used least, with a setup that is not in the slot's history (worn setups are banned). Record `setup` (one abstract line, no numbers or story) and `variant` on every question. A slot with a `revisit` is the exception: its variant is that earlier item's form, and you write a sibling of the item (the user missed or guessed it), keeping its decisive insight and making the change named, and set `revisits` to its ref. Provide a python verification script." + focusNote;
  }

  fs.mkdirSync("content/briefs", { recursive: true });
  const out = `content/briefs/${id}.json`;
  fs.writeFileSync(out, JSON.stringify(brief, null, 1));
  fs.writeFileSync(`content/briefs/${id}.md`, briefMarkdown(brief));
  fs.writeFileSync(`content/briefs/${id}.local.md`, exemplarMarkdown(brief, refs));
  console.log(`wrote ${out}, content/briefs/${id}.md (read this one) and ${id}.local.md (official exemplars, gitignored)`);
}

type Slot = { section: number; slot: number; type: string; level: number; exemplars: string[]; keys?: number };
type RevisitNote = { ref: string; result: string; item: string; setup?: string; change: string; siblings?: string[] };
type UsedBefore = { ref: string; stem?: string; keys?: string[]; distractors: string[] };
type Word = { word: string; id: string; secondary: boolean; sense: string | null; bucket?: string; reason?: string; usedBefore?: UsedBefore[]; revisit?: RevisitNote };
const revisitLine = (r: RevisitNote) => `  - **revisit ${r.ref}** (you ${r.result} it): ${r.item}${r.setup ? ` [setup: ${r.setup}]` : ""}. Write a sibling, not a copy: ${r.change}. Set \`"revisits": "${r.ref}"\`.${r.siblings?.length ? ` Earlier items already rework this setup, and the judge compares the sibling with them too, so make a change none of them made: ${r.siblings.join(" ‖ ")}.` : ""}${measure === "verbal" ? " Check still rejects its distractors and its SE key pair, so give it new ones." : ""}`;

/**
 * Which passage each reading slot belongs to: blueprint passages in order (p1, p2, ...), arguments a1, a2. The first
 * slot of each passage also carries its shape, e.g. "p3 (2-4 paragraphs, 4 questions)".
 */
function passageOfSlots(slots: Slot[]): Map<string, string> {
  const out = new Map<string, string>();
  let p = 0;
  let a = 0;
  for (const sec of blueprint.sections as { n: number }[]) {
    const shapes = [...((blueprint.passages ?? {})[String(sec.n)] ?? [])] as { questions: number; paragraphs?: string }[];
    let left = 0;
    for (const s of slots.filter((x) => x.section === sec.n)) {
      if (s.type === "arg") out.set(`${s.section}.${s.slot}`, `a${++a}`);
      else if (s.type.startsWith("rc")) {
        let label = `p${p}`;
        if (left === 0) {
          const shape = shapes.shift();
          left = shape?.questions ?? 99;
          label = `p${++p}${shape ? ` (${shape.paragraphs ?? "1"} paragraph${shape.paragraphs === "1" ? "" : "s"}, ${shape.questions} question${shape.questions > 1 ? "s" : ""})` : ""}`;
        }
        out.set(`${s.section}.${s.slot}`, label);
        left--;
      }
    }
  }
  return out;
}

function briefMarkdown(b: Record<string, unknown>): string {
  const slots = b.slots as Slot[];
  const where = passageOfSlots(slots);
  const untaken = (b.untakenTests as string[] | undefined) ?? [];
  const lines: string[] = [`# Brief ${b.testId} (${b.measure}, seed ${b.seed})`, "",
    ...(untaken.length ? [`Untaken tests (their targets are damped, so this test spreads to other items): ${untaken.join(", ")}`, ""] : []), "## Slots", "", "| sec | slot | type | level | passage |", "|---|---|---|---|---|"];
  for (const s of slots) lines.push(`| ${s.section} | ${s.slot} | ${s.type}${s.keys ? ` (${s.keys} key${s.keys > 1 ? "s" : ""})` : ""} | ${s.level} | ${where.get(`${s.section}.${s.slot}`) ?? ""} |`);
  if (b.measure === "verbal")
    lines.push(
      "",
      "Format (the validator enforces it): passage shapes as in the table, at most 2 reading passages longer than one paragraph; each rc_multi with the key count shown; rc_select on a multi-paragraph passage sets `paras`; at least 2 of the 3-blank TCs are 3-5 sentence passages; at least 3 TC blanks have all-phrase choices. Details: docs/QUIZ-AUTHORING.md, Structure rules.",
    );
  const focus = (b.typeFocus as { type: string; need: number }[]).filter((t) => t.need >= 0.4).map((t) => t.type);
  lines.push("", `Type focus (need >= 0.4, put the weakest items here): ${focus.length ? focus.join(", ") : "none"}`);
  if (b.measure === "verbal") {
    const keys = b.keyWords as Word[];
    const keyIds = new Set(keys.map((k) => k.id));
    const syn = bankSynonyms();
    const sePairs = (b.sePairs ?? []) as [string, string][];
    const lemma = new Map(keys.map((k) => [k.id, k.word]));
    // 15 TC blanks + 7 SE items, one extra key per SE item keyed with two key words; the rest cannot all be keys
    const keySlots = 15 + SE_PAIRS + sePairs.length;
    const spare = keys.length - keySlots;
    lines.push("", `## Key words (${Math.min(keys.length, keySlots)} keys across TC blanks and SE pairs)`, "");
    if (sePairs.length)
      lines.push(`SE pairs (key both words of each pair in one SE item): ${sePairs.map(([x, y]) => `${lemma.get(x) ?? x} / ${lemma.get(y) ?? y}`).join("; ")}.${sePairs.length < SE_PAIRS ? ` The other ${SE_PAIRS - sePairs.length} SE item(s) pair a key word with a listed bank synonym.` : ""} The remaining key words are the 15 TC keys.`, "");
    if (spare > 0)
      lines.push(`Only ${keySlots} of the ${keys.length} key words fit as keys (15 TC blanks + 7 SE items, ${sePairs.length} of them keyed with two key words). Key every review word; use the ${spare} spare new word(s) as distractors (they count as untested).`, "");
    lines.push("Synonyms: * = also a key word.", "");
    for (const k of keys) {
      const partners = [...(syn.get(k.id) ?? [])].sort((x, y) => Number(keyIds.has(y)) - Number(keyIds.has(x))).slice(0, 6);
      lines.push(`- **${k.word}**${k.secondary ? " [secondary: everyday sense is the trap]" : ""}: ${k.sense ?? ""} (${k.bucket}, ${k.reason}). Synonyms: ${partners.map((x) => (keyIds.has(x) ? x + "*" : x)).join(", ") || "none in bank"}`);
      if (k.usedBefore?.length) {
        lines.push(`  - used before (write a new situation and contrast, not these frames; no distractor or SE pair from them):`);
        for (const u of k.usedBefore) {
          const extra = [u.keys && u.keys.length > 1 ? `keys ${u.keys.join("/")}` : "", u.distractors.length ? `distractors ${u.distractors.join(", ")}` : ""].filter(Boolean).join("; ");
          lines.push(`    - ${u.ref.replace(/^\D+-/, "")}${u.stem ? `: "${u.stem}"` : ""}${extra ? ` (${extra})` : ""}`);
        }
      }
      if (k.revisit) lines.push(revisitLine(k.revisit));
    }
    // one line per distinct skill: a skill drawn for several slots is described once, with its count and one variant per slot
    const skills = JSON.parse(fs.readFileSync("data/rc_skills.json", "utf8")) as { id: string; description: string }[];
    const slotsOf = new Map<string, { whys: string[]; variants: string[] }>();
    for (const s of b.skillSlots as { skill: string; bucket: string; reason: string; variant?: string }[]) {
      const why = `${s.bucket}, ${s.reason.replace(/; already in untaken .*$/, "")}`;
      const e = slotsOf.get(s.skill) ?? { whys: [], variants: [] };
      slotsOf.set(s.skill, { whys: [...e.whys, why], variants: s.variant ? [...e.variants, s.variant] : e.variants });
    }
    lines.push("", `## Reading skills for the ${(b.skillSlots as unknown[]).length} RC slots (arg-* on argument slots)`, "", "Write each slot's question as its variant (the form of the skill earlier mocks used least); a skill drawn twice gets two. Put a variant on a slot whose format fits it (an EXCEPT variant on a single-answer rc slot).", "");
    for (const [skill, { whys, variants }] of slotsOf)
      lines.push(
        `- **${skill}**${whys.length > 1 ? ` ×${whys.length}` : ""} (${[...new Set(whys)].join("; ")}): ${skills.find((x) => x.id === skill)?.description ?? ""}${variants.length ? ` Variant${variants.length > 1 ? "s" : ""}: ${variants.join("; ")}.` : ""}`,
      );
    const d = b.distractorWords as { weak: Word[]; untested: Word[]; trapPairs?: string[][] };
    lines.push("", `## Distractor words (at least ${Math.round(UNTESTED_DISTRACTOR_SHARE * 100)}% of distractors from Untested, the rest from Weak)`, "", `Weak: ${d.weak.map((w) => w.word).join(", ") || "none"}`, "", `Untested: ${d.untested.map((w) => w.word).join(", ")}`);
    if (d.trapPairs?.length)
      lines.push("", `SE trap pairs (both words untested bank synonyms, already in the list above): ${d.trapPairs.map((p) => p.join(" / ")).join("; ")}. Use one as the wrong synonym pair of an SE item: the sentence must rule out their shared meaning.`);
    lines.push("", `## Passage words (weave ${PASSAGE_WORDS_MIN}-6 into each reading passage)`, "", (b.passageWords as Word[]).map((w) => `${w.word}${w.secondary ? " (2nd sense)" : ""}`).join(", "));
  } else {
    lines.push(
      "",
      "## Concept slots (one primary concept per question, any order; a DI set shares an area)",
      "",
      "Write each question as its variant (the form of the concept earlier mocks used least), with a setup that is **not** in the slot's history below: new numbers, names or a story around a listed setup are the same item. **Worn** setups (2+ tests) are banned outright. Record `setup` and `variant` on each question. A slot marked **revisit** is the one exception: a sibling of an item you missed, with the change named (at most 4 per test).",
    );
    const byReason = new Map<string, string[]>();
    for (const c of b.conceptSlots as { concept: string; name: string; area: string; reason: string; variant?: string; history?: SetupGroup[]; revisit?: RevisitNote }[]) {
      // group by the score's reason; how many untaken tests already hold the concept goes on its own line
      const held = /; already in untaken (.*)$/.exec(c.reason)?.[1].split(", ").length ?? 0;
      const reason = c.reason.replace(/; already in untaken .*$/, "");
      const past = (c.history ?? []).map((g) => `  - ${g.worn ? "**worn** " : ""}${g.setup} (${g.items.map((i) => `${i.testId.replace(/^\D+-/, "")} ${i.qid}`).join(", ")})`);
      byReason.set(reason, [...(byReason.get(reason) ?? []), `- **${c.concept}**: ${c.name} (${c.area})${held ? ` [in ${held} untaken]` : ""}${c.variant ? `. Variant: ${c.variant}` : ""}${past.length ? ". Asked before:" : ""}`, ...(c.revisit ? [revisitLine(c.revisit)] : []), ...past]);
    }
    for (const [reason, cs] of byReason) lines.push("", `${reason} (${cs.length}):`, ...cs);
  }
  if (b.previous) {
    lines.push("", "## Earlier tests (do not repeat topics)", "");
    for (const t of b.previous as { id: string; passageTopics: string[]; stems?: string[] }[]) {
      lines.push(`- ${t.id}: ${t.passageTopics.join(" / ") || "(no passages)"}`);
      if (t.stems) lines.push(`  - stems: ${t.stems.join(" · ")}`);
    }
  }
  lines.push("", "How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.", "");
  return lines.join("\n");
}

/** One official exemplar per distinct slot type and level, stem and choices only. Local file: official text is never committed. */
function exemplarMarkdown(b: Record<string, unknown>, refs: RefItem[]): string {
  const byId = new Map(refs.map((r) => [r.id, r as RefItem & Record<string, unknown>]));
  const seen = new Set<string>();
  const out = [`# Official exemplars for ${b.testId} (style and difficulty only; never copy)`];
  for (const s of b.slots as Slot[]) {
    const k = `${s.type} L${s.level}`;
    const x = byId.get(s.exemplars[0]);
    if (seen.has(k) || !x) continue;
    seen.add(k);
    const ch = x.choices as unknown;
    const choices = Array.isArray(ch) ? (Array.isArray(ch[0]) ? (ch as string[][]).map((c) => c.join(" / ")).join(" || ") : (ch as string[]).join(" / ")) : "";
    out.push("", `## ${k}: ${x.id} (P+ ${x.pplus ?? "?"}, answer ${JSON.stringify(x.answer)})`, String(x.stem ?? ""), x.qa ? `A: ${x.qa}  B: ${x.qb}` : "", choices);
  }
  return out.filter((l) => l !== "").join("\n") + "\n";
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });

// Brief for one endless-vocab drill batch: standalone TC / SE items whose choices are, almost all, words never tested.
// usage: npm run -s brief:drill [-- --count 20] [--seed N] [--user <email>]
// Writes content/briefs/drill-NNN.{json,md}. Then author content/drill/drill-NNN.json and run check, blind, novelty and
// register on it as for a mock (docs/QUIZ-AUTHORING.md, Drill batches).
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import fs from "node:fs";
import path from "node:path";
import { schema } from "../lib/db";
import { oneTarget } from "./lib/accounts";
import { bankSynonyms } from "./lib/bank";
import { scoreAll, type ItemScore } from "../lib/priority/compute";
import { DRILL_BATCH, DRILL_FRESH_DISTRACTORS, DRILL_UNTESTED_SHARE } from "../lib/priority/config";
import { rng } from "../lib/priority/allocate";
import { REVISIT_CHANGES, REVISIT_MAX, revisitQueue, type Revisit } from "../lib/priority/revisit";
import { itemText, measureTests } from "../lib/setup-history";
import { DRILL_DIR, isDrillId, TESTS_DIR } from "../lib/test-path";
import { DRILL_LEVELS } from "./validate-test";

const arg = (name: string) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined);
const count = Number(arg("--count") ?? DRILL_BATCH);
if (!Number.isInteger(count) || count < 1 || count > 30) {
  console.error("usage: npm run -s brief:drill [-- --count 1..30] [--seed N] [--user <email>]");
  process.exit(1);
}

type SlotType = "se" | "tc1" | "tc2" | "tc3";
/** The type mix: SE and the longer completions show the most words per question (6, 9, 6, 5). */
const MIX: [SlotType, number][] = [["se", 0.4], ["tc3", 0.3], ["tc2", 0.2], ["tc1", 0.1]];
const KEYS: Record<SlotType, number> = { se: 2, tc1: 1, tc2: 2, tc3: 3 };
const DISTRACTORS: Record<SlotType, number> = { se: 4, tc1: 4, tc2: 4, tc3: 6 };

/** Largest-remainder split of `n` slots over the mix, at least one SE once there are two slots. */
function slotTypes(n: number): SlotType[] {
  const raw = MIX.map(([t, w]) => ({ t, x: w * n }));
  const k = raw.map((r) => Math.floor(r.x));
  let left = n - k.reduce((a, b) => a + b, 0);
  for (const i of raw.map((r, i) => ({ i, f: r.x - Math.floor(r.x) })).sort((a, b) => b.f - a.f).map((r) => r.i)) {
    if (left <= 0) break;
    k[i]++;
    left--;
  }
  return raw.flatMap((r, i) => Array<SlotType>(k[i]).fill(r.t));
}

function nextId() {
  const nums = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => /^drill-(\d+)\.json$/.exec(f)).filter((m) => m).map((m) => Number(m![1])) : []);
  return `drill-${String(Math.max(0, ...nums(DRILL_DIR), ...nums("content/briefs")) + 1).padStart(3, "0")}`;
}

/**
 * Words that will be seen soon anyway, with how many pending tests hold each: every word of an untaken mock, of a
 * drill question not answered yet, and of a brief (mock or drill) whose test is not registered. A drill brief whose
 * batch is already written holds only the words the batch uses, so its unused distractor list goes back to the pool.
 */
async function soonShown(db: Awaited<ReturnType<typeof oneTarget>>["db"]) {
  const tests = await db.select({ id: schema.tests.id }).from(schema.tests);
  const attempts = await db.select().from(schema.attempts);
  const taken = new Set(attempts.filter((a) => a.finishedAt && a.mode !== "drill").map((a) => a.testId));
  const drillRuns = new Set(attempts.filter((a) => a.mode === "drill").map((a) => a.id));
  const answered = new Set((await db.select().from(schema.responses)).filter((r) => r.finalized && drillRuns.has(r.attemptId)).map((r) => r.questionId));
  const holds = new Map<string, number>();
  const hold = (w: string) => holds.set(w, (holds.get(w) ?? 0) + 1);
  for (const r of await db.select().from(schema.questionItems)) {
    if (r.kind !== "word") continue;
    const test = r.questionId.split(":")[0];
    if (isDrillId(test) ? !answered.has(r.questionId) : !taken.has(test)) hold(r.itemId);
  }
  const registered = new Set(tests.map((t) => t.id));
  const dir = "content/briefs";
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^(verbal|drill)-\d+\.json$/.test(f)) : []) {
    const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (registered.has(b.testId)) continue;
    const written = path.join(DRILL_DIR, `${b.testId}.json`);
    const words: string[] =
      isDrillId(b.testId) && fs.existsSync(written)
        ? (JSON.parse(fs.readFileSync(written, "utf8")).questions as { tags: { kind: string; id: string }[] }[]).flatMap((q) => q.tags.filter((t) => t.kind === "word").map((t) => t.id))
        : ([...(b.keyWords ?? []), ...(b.distractorWords?.untested ?? []), ...(b.distractorWords?.review ?? []), ...(b.passageWords ?? [])] as { id: string }[]).map((w) => w.id);
    new Set(words).forEach(hold);
  }
  return holds;
}

/** Per key word, the distractor words of every earlier mock or drill TC / SE item it keyed: `check` bars them when it returns. */
function earlierCompany() {
  const out = new Map<string, Set<string>>();
  for (const dir of [TESTS_DIR, DRILL_DIR])
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : []) {
      const t = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { questions?: { type: string; tags: { kind: string; id: string; role: string }[] }[] };
      for (const q of t.questions ?? []) {
        if (q.type !== "se" && q.type !== "tc") continue;
        const words = (role: string) => q.tags.filter((x) => x.kind === "word" && x.role === role).map((x) => x.id);
        for (const k of words("key")) words("distractor").forEach((d) => out.set(k, (out.get(k) ?? new Set()).add(d)));
      }
    }
  return out;
}

/** SE key pairs already keyed by any mock or drill item, as "a|b" with a < b, so a batch never repeats one. */
function keyedSePairs() {
  const out = new Set<string>();
  for (const dir of [TESTS_DIR, DRILL_DIR])
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : []) {
      const t = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { questions?: { type: string; tags: { kind: string; id: string; role: string }[] }[] };
      for (const q of t.questions ?? []) {
        if (q.type !== "se") continue;
        const k = q.tags.filter((x) => x.kind === "word" && x.role === "key").map((x) => x.id).sort();
        if (k.length === 2) out.add(k.join("|"));
      }
    }
  return out;
}

async function main() {
  const { account, db } = await oneTarget();
  console.log(`drill brief for ${account.email} (${account.dbName})`);
  const seed = arg("--seed") ? Number(arg("--seed")) : Date.now() % 100000;
  const random = rng(seed);
  const now = new Date();
  const id = nextId();
  // only words data/vocab.json still holds: `tag` reads that file, so a stale database row could never be tagged
  const bank = new Set((JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as { id: string }[]).map((v) => v.id));
  // and only nouns, verbs and adjectives with a sense: an adverb or preposition almost never suits a TC / SE blank
  const choicePos = new Set(["noun", "verb", "adjective"]);
  const vocab = (await db.select().from(schema.vocab)).filter((v) => !v.pink && bank.has(v.id) && choicePos.has((v.senses as { pos?: string }[] | null)?.[0]?.pos ?? ""));
  const byId = new Map(vocab.map((v) => [v.id, v]));
  const events = (await db.select().from(schema.itemEvents)).filter((e) => e.kind === "word");
  const scores = scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield })), events.map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt, attemptId: e.attemptId })), now);
  const holds = await soonShown(db);
  const held = (wid: string) => holds.get(wid) ?? 0;
  // never-seen words not due elsewhere, high yield first with some shuffle so sibling batches differ
  const jitter = new Map(scores.map((s) => [s.itemId, random()]));
  const fresh = scores.filter((s) => s.C === 0 && !held(s.itemId)).sort((a, b) => b.Y + 0.3 * jitter.get(b.itemId)! - (a.Y + 0.3 * jitter.get(a.itemId)!));
  const freshIds = new Set(fresh.map((s) => s.itemId));
  // once the untested words run short: words seen before or held by a pending test, least held first, then the
  // weakest (highest priority), so a word comes back only after the rest of the bank has had its turn
  const review = scores.filter((s) => !freshIds.has(s.itemId)).sort((a, b) => held(a.itemId) - held(b.itemId) || b.P + 0.1 * jitter.get(b.itemId)! - (a.P + 0.1 * jitter.get(a.itemId)!));
  const ranked = [...fresh, ...review];
  const posOf = (wid: string) => (byId.get(wid)?.senses as { pos?: string }[] | null)?.[0]?.pos;
  const synonyms = bankSynonyms();

  const types = slotTypes(count);
  const nSe = types.filter((t) => t === "se").length;
  const nKeys = types.reduce((t, x) => t + KEYS[x], 0);
  const nDistractors = types.reduce((t, x) => t + DISTRACTORS[x], 0);

  // revisits: drill items answered wrong or guessed come back as siblings keyed with the same word
  const drillTests = measureTests("drill", DRILL_DIR);
  const drillRuns = new Map((await db.select().from(schema.attempts)).filter((a) => a.mode === "drill").map((a) => [a.id, a]));
  const answers = (await db.select().from(schema.responses))
    .filter((r) => r.finalized && drillRuns.has(r.attemptId))
    .map((r) => ({ questionId: r.questionId, isCorrect: r.isCorrect, guessed: r.guessed, at: r.updatedAt }));
  const promised = new Set(
    (fs.existsSync("content/briefs") ? fs.readdirSync("content/briefs").filter((f) => /^drill-\d+\.json$/.test(f)) : [])
      .map((f) => JSON.parse(fs.readFileSync(path.join("content/briefs", f), "utf8")))
      .filter((b) => !fs.existsSync(path.join(DRILL_DIR, `${b.testId}.json`)))
      .flatMap((b) => (b.revisits ?? []).map((r: { ref: string }) => r.ref)),
  );
  const revisits: Revisit[] = revisitQueue(answers, drillTests, now).filter((r) => !promised.has(r.ref)).slice(0, Math.min(REVISIT_MAX, Math.floor(count / 5)));

  const used = new Set<string>();
  const take = (s: ItemScore) => used.add(s.itemId);
  const keyed = keyedSePairs();
  /** One part-of-speech synonym pair per pick, in `ranked` order: the mate comes from the same pool (fresh or not). */
  const pairs = (n: number, ok: (wid: string) => boolean, strict: boolean) => {
    const out: [string, string][] = [];
    for (const s of ranked) {
      if (out.length >= n) break;
      if (used.has(s.itemId) || byId.get(s.itemId)?.isSecondary || !ok(s.itemId)) continue;
      const pool = freshIds.has(s.itemId) ? freshIds : null;
      const mate = [...(synonyms.get(s.itemId) ?? [])].find(
        (o) => !used.has(o) && byId.has(o) && ok(o) && (pool ? pool.has(o) : !freshIds.has(o)) && posOf(o) === posOf(s.itemId) && (!strict || !byId.get(o)?.isSecondary) && !keyed.has([s.itemId, o].sort().join("|")),
      );
      if (!mate) continue;
      out.push([s.itemId, mate]);
      used.add(s.itemId).add(mate);
    }
    return out;
  };
  // SE pairs: two bank synonyms of one part of speech, keyed together, never a pair an earlier item keyed
  const sePairs = pairs(nSe, () => true, true);
  const loose = Math.max(0, nKeys - sePairs.length * 2 - revisits.length);
  const keys = ranked.filter((s) => !used.has(s.itemId)).slice(0, loose);
  keys.forEach(take);
  // SE trap pairs: synonyms that suit each other but not the sentence, one per SE item, in the part of speech of its
  // key pair (a noun pair among adjective choices is ruled out by grammar, not meaning); the order follows sePairs
  // a bank synonym of any key would be a second answer wherever it sat beside that key, so none is a distractor
  const nearKey = new Set([...sePairs.flat(), ...keys.map((k) => k.itemId)].flatMap((w) => [...(synonyms.get(w) ?? [])]));
  const trapPairs = sePairs.flatMap(([k]) => pairs(1, (w) => posOf(w) === posOf(k) && !nearKey.has(w), false));
  // a deeper list than needed, so the author can choose distractors that suit each sentence: untested words up to
  // DRILL_FRESH_DISTRACTORS of it (keys get the untested words first), review words for the rest
  const depth = Math.ceil(nDistractors * 1.5) - trapPairs.length * 2;
  const freshExtra = fresh.filter((s) => !used.has(s.itemId) && !nearKey.has(s.itemId)).slice(0, Math.ceil(depth * DRILL_FRESH_DISTRACTORS));
  freshExtra.forEach(take);
  const reviewExtra = review.filter((s) => !used.has(s.itemId) && !nearKey.has(s.itemId)).slice(0, depth - freshExtra.length);
  const extra = [...freshExtra, ...reviewExtra];
  const show = (wid: string) => {
    const v = byId.get(wid)!;
    const sense = (v.senses as { def: string; pos?: string }[] | null)?.[0];
    return { id: v.id, word: v.lemma, secondary: v.isSecondary, sense: sense ? `${sense.pos ?? ""} ${sense.def}`.trim() : null };
  };
  const company = earlierCompany();
  const lemmaOf = (wid: string) => byId.get(wid)?.lemma ?? wid;
  const keyWords = [...sePairs.flat(), ...keys.map((k) => k.itemId)].map((w) => ({
    ...show(w),
    bucket: freshIds.has(w) ? "new" : "review",
    ...(company.get(w)?.size ? { avoid: [...company.get(w)!].map(lemmaOf).sort() } : {}),
  }));
  const shown = [...trapPairs.flat(), ...extra.map((s) => s.itemId)];
  const levels = types.map((_, i) => DRILL_LEVELS[i % 2 === 0 ? 1 : 0]);
  const brief = {
    testId: id,
    measure: "drill",
    seed,
    generatedAt: now.toISOString(),
    count,
    slots: types.map((type, i) => ({ slot: i + 1, type, level: levels[i] })),
    keyWords,
    sePairs,
    revisits: revisits.map((r, i) => ({ ref: r.ref, result: r.result, item: itemText(r.question), keys: r.question.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id), change: REVISIT_CHANGES.verbal[i % REVISIT_CHANGES.verbal.length] })),
    distractorWords: { untested: shown.filter((w) => freshIds.has(w)).map(show), review: shown.filter((w) => !freshIds.has(w)).map(show), trapPairs: trapPairs.map((p) => p.map((w) => byId.get(w)!.lemma)) },
    drillTargets: { untestedChoiceShare: DRILL_UNTESTED_SHARE },
    freshLeft: fresh.length,
  };
  fs.mkdirSync("content/briefs", { recursive: true });
  fs.writeFileSync(`content/briefs/${id}.json`, JSON.stringify(brief, null, 1));
  fs.writeFileSync(`content/briefs/${id}.md`, briefMarkdown(brief));
  const newKeys = keyWords.filter((k) => k.bucket === "new").length;
  console.log(`${fresh.length} untested words not due elsewhere; this batch shows about ${nKeys + nDistractors} (keys ${newKeys}/${keyWords.length} untested; distractor list ${brief.distractorWords.untested.length} untested + ${brief.distractorWords.review.length} review)`);
  console.log(`wrote content/briefs/${id}.json and content/briefs/${id}.md (read this one)`);
  console.log(`next: write ${DRILL_DIR}/${id}.json in one Write, then npm run -s check -- ${id}`);
}

type Shown = { id: string; word: string; secondary: boolean; sense: string | null };
const POS_ABBR: Record<string, string> = { noun: "n", verb: "v", adjective: "adj" };
/** `torpor (n)`, or `foil (v, 2nd sense: to prevent from succeeding)` for a word whose everyday sense is not the one. */
function choiceWord(w: Shown) {
  const [pos, ...def] = (w.sense ?? "").split(" ");
  const abbr = POS_ABBR[pos] ?? pos;
  return w.secondary ? `${w.word} (${abbr}, 2nd sense: ${def.join(" ")})` : `${w.word} (${abbr})`;
}
function briefMarkdown(b: {
  testId: string; seed: number; count: number; slots: { slot: number; type: string; level: number }[]; keyWords: Shown[]; sePairs: [string, string][];
  revisits: { ref: string; result: string; item: string; keys: string[]; change: string }[]; distractorWords: { untested: Shown[]; review: Shown[]; trapPairs: string[][] }; freshLeft: number;
}): string {
  const lemma = new Map([...b.keyWords, ...b.distractorWords.untested, ...b.distractorWords.review].map((w) => [w.id, w.word]));
  const pairIds = new Set(b.sePairs.flat());
  const lines = [
    `# Drill brief ${b.testId} (${b.count} items, seed ${b.seed})`,
    "",
    `Standalone TC / SE items for the endless vocab mode, at the hard end of a mock. ${b.freshLeft} untested bank words are not due elsewhere; the choice words below are untested ones first, then review words (seen before, or held by another pending test) once those run short. File: content/drill/${b.testId}.json, shape and rules in docs/QUIZ-AUTHORING.md, Drill batches.`,
    "",
    "## Slots (ids s1q1, s1q2, …; all section 1; order free)",
    "",
    "| slot | type | level |",
    "|---|---|---|",
    ...b.slots.map((s) => `| s1q${s.slot} | ${s.type} | ${s.level} |`),
    "",
    `## Key words (every one a key; at least ${Math.round(DRILL_UNTESTED_SHARE * 100)}% of all choice words from this brief; [review] = seen before)`,
    "",
  ];
  if (b.sePairs.length) lines.push(`SE pairs (key both words of a pair in one SE item): ${b.sePairs.map(([x, y]) => `${lemma.get(x)} / ${lemma.get(y)}`).join("; ")}.`, "");
  for (const k of b.keyWords) lines.push(`- **${k.word}**${pairIds.has(k.id) ? " (SE pair)" : ""}${(k as Shown & { bucket?: string }).bucket === "review" ? " [review]" : ""}${(k as Shown & { avoid?: string[] }).avoid ? ` (not beside its earlier distractors: ${(k as Shown & { avoid?: string[] }).avoid!.join(", ")})` : ""}${k.secondary ? " [secondary: the everyday sense is the trap]" : ""}: ${k.sense ?? ""}`);
  if (b.revisits.length) {
    lines.push("", "## Revisits (missed or guessed drill items; one slot each, keyed with the same word)", "");
    for (const r of b.revisits) lines.push(`- **${r.ref}** (you ${r.result} it; key ${r.keys.join(" / ")}): ${r.item}. Write a sibling, not a copy: ${r.change}. Set \`"revisits": "${r.ref}"\`, and give it new distractors.`);
  }
  lines.push(
    "",
    "## Distractor words (take every distractor from here; use the untested ones first)",
    "",
    "Each word with its part of speech (n / v / adj); a second-sense word carries the sense to use.",
    "",
    `Untested: ${b.distractorWords.untested.map(choiceWord).join(", ") || "none left"}`,
  );
  if (b.distractorWords.review.length) lines.push("", `Review (seen before): ${b.distractorWords.review.map(choiceWord).join(", ")}`);
  if (b.distractorWords.trapPairs.length)
    lines.push("", `SE trap pairs (both bank synonyms, listed first above): ${b.distractorWords.trapPairs.map((p) => p.join(" / ")).join("; ")}. Use one per SE item as the wrong synonym pair: the sentence must rule out their shared meaning.`);
  lines.push("", "How to use this brief: docs/QUIZ-AUTHORING.md, Drill batches; difficulty craft: docs/HARD-PATTERNS.md.", "");
  return lines.join("\n");
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });

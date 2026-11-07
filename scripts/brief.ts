// Build a generation brief from the DB: which words/concepts the next test must target.
// usage: npm run brief -- verbal|quant [--seed N] [--user <email>]  (the only account is the default)
import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "node:fs";
import path from "node:path";
import { schema } from "../lib/db";
import { oneTarget } from "./lib/accounts";
import { markPending, scoreAll, type ItemScore, type LoggedEvent } from "../lib/priority/compute";
import { allocateConcepts, allocateVerbalKeys, rng } from "../lib/priority/allocate";
import { slotType, typeStats, TYPE_INFO, type SlotType } from "../lib/qtypes";

const measure = process.argv[2] as "verbal" | "quant";
if (measure !== "verbal" && measure !== "quant") {
  console.error("usage: npm run brief -- verbal|quant");
  process.exit(1);
}
const seedArg = process.argv.indexOf("--seed");

const blueprint = JSON.parse(fs.readFileSync("data/blueprints.json", "utf8"))[measure];
const REF = path.resolve("../books/extracted/reference/items.jsonl"); // local-only corpus (not in the repo)

function nextId() {
  const dir = "content/tests";
  const n = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.startsWith(measure + "-")).length : 0;
  return `${measure}-${String(n + 1).padStart(3, "0")}`;
}

/** Topics of every earlier test, stems of the latest only: the validator's overlap check already guards originality. */
function previousTests() {
  const dir = "content/tests";
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(measure + "-")).sort();
  return files
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .map((t, i) => ({
      id: t.id,
      passageTopics: (t.passages ?? []).map((p: { title?: string; paragraphs: string[] }) => p.title ?? p.paragraphs[0].slice(0, 70)),
      ...(i === files.length - 1 ? { stems: (t.questions ?? []).map((q: { prompt: string }) => q.prompt.slice(0, 60)) } : {}),
    }));
}

/**
 * Items that registered tests without a finished attempt already target (key words, primary skills / concepts),
 * as itemId -> test id. Making several tests before taking them then spreads the targets instead of repeating them.
 */
async function pendingItems(db: Awaited<ReturnType<typeof oneTarget>>["db"]) {
  const tests = await db.select({ id: schema.tests.id }).from(schema.tests);
  const taken = new Set((await db.select({ t: schema.attempts.testId, f: schema.attempts.finishedAt }).from(schema.attempts)).filter((a) => a.f).map((a) => a.t));
  const untaken = new Set(tests.map((t) => t.id).filter((id) => !taken.has(id)));
  const out = new Map<string, string>();
  for (const r of await db.select().from(schema.questionItems)) {
    const test = r.questionId.split(":")[0];
    if (untaken.has(test) && (r.role === "key" || r.role === "primary") && !out.has(r.itemId)) out.set(r.itemId, test);
  }
  return { untaken: [...untaken].sort(), items: out };
}

/** Accuracy and pace per question type on this measure, most in need of practice first. */
async function typeFocus(db: Awaited<ReturnType<typeof oneTarget>>["db"]) {
  const dir = "content/tests";
  const typeOf = new Map<string, SlotType>();
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.startsWith(measure + "-")) : []) {
    const t = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const q of t.questions ?? []) typeOf.set(`${t.id}:${q.id}`, slotType(q));
  }
  const rows = (await db.select().from(schema.responses))
    .filter((r) => r.finalized && typeOf.has(r.questionId))
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
    allEvents.filter((e) => e.kind === kind).map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt }));
  const logged = eventsOf(measure === "verbal" ? "word" : "concept");
  // quant concepts and reading skills share the concepts table; areas tell them apart
  const SKILL_AREAS = ["reading", "argument"];
  const conceptRows = await db.select().from(schema.concepts);
  const id = nextId();
  const refs = refItems();
  const pending = await pendingItems(db);
  if (pending.untaken.length) console.log(`untaken tests: ${pending.untaken.join(", ")}; ${pending.items.size} of their targets are damped`);
  const brief: Record<string, unknown> = { testId: id, measure, seed, generatedAt: now.toISOString(), untakenTests: pending.untaken, blueprint, previous: previousTests(), slots: slotExemplars(refs), typeFocus: await typeFocus(db) };
  const focusNote =
    " typeFocus ranks question types by practice need (miss rate plus slowness against pace): put the weakest review words / skills / concepts on the slots of the top two types (need >= 0.4), so the practice lands where it is needed.";

  if (measure === "verbal") {
    const vocab = (await db.select().from(schema.vocab)).filter((v) => !v.pink);
    const byId = new Map(vocab.map((v) => [v.id, v]));
    const scores = markPending(scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield })), logged, now), pending.items);
    const keys = allocateVerbalKeys(scores, (wid) => !!byId.get(wid)?.isSecondary, 29, random);
    const used = new Set(keys.map((k) => k.itemId));
    const rest = scores.filter((s) => !used.has(s.itemId));
    const weakD = rest.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).slice(0, 25);
    const weakIds = new Set(weakD.map((s) => s.itemId));
    const freshD = rest.filter((s) => !weakIds.has(s.itemId) && s.N === 1).sort(() => random() - 0.5).slice(0, 60 - weakD.length);
    const free = scores.filter((s) => !used.has(s.itemId) && !weakIds.has(s.itemId) && s.N === 1);
    const byNY = (a: ItemScore, b: ItemScore) => b.N * b.Y - a.N * a.Y;
    const tiered = free.filter((s) => ["passage", "extended"].includes(byId.get(s.itemId)!.tier)).sort(byNY);
    // until the passage/extended tiers are populated, fall back to untested bank words
    const filler = free.filter((s) => !tiered.includes(s)).sort(() => random() - 0.5).sort(byNY);
    const passPool = [...tiered, ...filler].slice(0, 40);
    const show = (s: ItemScore, bucket?: string) => {
      const v = byId.get(s.itemId)!;
      const sense = (v.senses as { def: string; pos?: string; secondary?: boolean }[] | null)?.[0];
      return { word: v.lemma, id: v.id, tier: v.tier, secondary: v.isSecondary, sense: sense ? `${sense.pos ?? ""} ${sense.def}`.trim() : null, bucket, reason: s.reason, P: +s.P.toFixed(2) };
    };
    const keySlots = keys.map((k) => ({ ...show(scores.find((s) => s.itemId === k.itemId)!, k.bucket), reason: k.reason }));
    // reading skills: the blueprint's argument slots get argument skills, the other RC slots reading skills
    const rcSlots = (blueprint.sections as { slots: { type: string }[] }[]).flatMap((sec) => sec.slots).filter((sl) => sl.type.startsWith("rc") || sl.type === "arg");
    const nArg = rcSlots.filter((sl) => sl.type === "arg").length;
    const skillRows = conceptRows.filter((c) => SKILL_AREAS.includes(c.area));
    const skillScores = markPending(scoreAll(skillRows.map((c) => ({ id: c.id, yield: c.yield })), eventsOf("concept"), now), pending.items);
    const skillArea = new Map(skillRows.map((c) => [c.id, c.area]));
    const pickSkills = (area: string, n: number) =>
      allocateConcepts(skillScores.filter((s) => skillArea.get(s.itemId) === area).map((s) => ({ ...s, area })), n, [area], random);
    const skillSlots = [...pickSkills("reading", rcSlots.length - nArg), ...pickSkills("argument", nArg)].map((p) => ({
      skill: p.itemId,
      name: skillRows.find((c) => c.id === p.itemId)?.name,
      area: skillArea.get(p.itemId),
      bucket: p.bucket,
      reason: p.reason,
      exemplars: conceptExemplars(refs, p.itemId),
    }));
    Object.assign(brief, {
      keyWords: keySlots,
      skillSlots,
      distractorWords: { weak: weakD.map((s) => show(s)), untested: freshD.map((s) => show(s)) },
      passageWords: passPool.map((s) => show(s)),
      instructions:
        "Use keyWords as the answers/keys across TC blanks and SE pairs (29 slots, order free); pair key words with each other in SE where the brief marks a partner with *, otherwise with a listed bank synonym. Fill distractors from distractorWords (about 40% weak). Weave 3-6 passageWords into each RC passage. Do not write word tags: `npm run tag` fills them from the choice and passage text (regular inflections match; tag an irregular form such as `forsworn` by hand). Each key word's `sense` is the GRE-tested sense: write the sentence so THAT sense is the one that fits (for secondary=true words, the everyday sense must be the trap). Give each RC question one primary skill tag {kind:'concept', role:'primary'} from skillSlots (argument skills on the arg items, rc-select-verify suits rc_multi), optionally a secondary one; the reading skills can repeat." + focusNote,
    });
  } else {
    const concepts = conceptRows.filter((c) => !SKILL_AREAS.includes(c.area));
    const scores = markPending(scoreAll(concepts.map((c) => ({ id: c.id, yield: c.yield })), logged, now), pending.items);
    const areaOf = new Map(concepts.map((c) => [c.id, c.area]));
    const withArea = scores.map((s) => ({ ...s, area: areaOf.get(s.itemId)! }));
    const picks = allocateConcepts(withArea, 27, ["arithmetic", "algebra", "geometry", "data"], random);
    brief.conceptSlots = picks.map((p, i) => ({ slot: i + 1, concept: p.itemId, name: concepts.find((c) => c.id === p.itemId)?.name, area: areaOf.get(p.itemId), bucket: p.bucket, reason: p.reason, exemplars: conceptExemplars(refs, p.itemId) }));
    brief.instructions =
      "Assign the 27 concept slots to the 27 blueprint slots (any order, but a DI set of 3 should share a concept area). Each question: one primary concept (the slot) and optional secondary tags. Provide a python verification script." + focusNote;
  }

  fs.mkdirSync("content/briefs", { recursive: true });
  const out = `content/briefs/${id}.json`;
  fs.writeFileSync(out, JSON.stringify(brief, null, 1));
  fs.writeFileSync(`content/briefs/${id}.md`, briefMarkdown(brief));
  fs.writeFileSync(`content/briefs/${id}.local.md`, exemplarMarkdown(brief, refs));
  console.log(`wrote ${out}, content/briefs/${id}.md (read this one) and ${id}.local.md (official exemplars, gitignored)`);
}

type Slot = { section: number; slot: number; type: string; level: number; exemplars: string[] };
type Word = { word: string; id: string; secondary: boolean; sense: string | null; bucket?: string; reason?: string };

/** Which passage each reading slot belongs to: blueprint passages in order (p1, p2, ...), arguments a1, a2. */
function passageOfSlots(slots: Slot[]): Map<string, string> {
  const out = new Map<string, string>();
  let p = 0;
  let a = 0;
  for (const sec of blueprint.sections as { n: number }[]) {
    const sizes = ((blueprint.passages ?? {})[String(sec.n)] ?? []).map((x: { questions: number }) => x.questions) as number[];
    let left = 0;
    for (const s of slots.filter((x) => x.section === sec.n)) {
      if (s.type === "arg") out.set(`${s.section}.${s.slot}`, `a${++a}`);
      else if (s.type.startsWith("rc")) {
        if (left === 0) {
          p++;
          left = sizes.shift() ?? 99;
        }
        out.set(`${s.section}.${s.slot}`, `p${p}`);
        left--;
      }
    }
  }
  return out;
}

/** Bank synonyms of a word in either direction (a word lists X, or X lists the word), for SE pairs. */
function bankSynonyms() {
  const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as { id: string; lemma: string; senses?: { synonyms?: string[] }[] }[];
  const idOf = new Map(vocab.map((v) => [v.lemma.toLowerCase(), v.id]));
  const syn = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (a === b) return;
    if (!syn.has(a)) syn.set(a, new Set());
    syn.get(a)!.add(b);
  };
  for (const v of vocab)
    for (const s of v.senses ?? [])
      for (const w of s.synonyms ?? []) {
        const other = idOf.get(w.toLowerCase());
        if (other) {
          link(v.id, other);
          link(other, v.id);
        }
      }
  return syn;
}

function briefMarkdown(b: Record<string, unknown>): string {
  const slots = b.slots as Slot[];
  const where = passageOfSlots(slots);
  const untaken = (b.untakenTests as string[] | undefined) ?? [];
  const lines: string[] = [`# Brief ${b.testId} (${b.measure}, seed ${b.seed})`, "",
    ...(untaken.length ? [`Untaken tests (their targets are damped, so this test spreads to other items): ${untaken.join(", ")}`, ""] : []), "## Slots", "", "| sec | slot | type | level | passage |", "|---|---|---|---|---|"];
  for (const s of slots) lines.push(`| ${s.section} | ${s.slot} | ${s.type} | ${s.level} | ${where.get(`${s.section}.${s.slot}`) ?? ""} |`);
  const focus = (b.typeFocus as { type: string; need: number }[]).filter((t) => t.need >= 0.4).map((t) => t.type);
  lines.push("", `Type focus (need >= 0.4, put the weakest items here): ${focus.length ? focus.join(", ") : "none"}`);
  if (b.measure === "verbal") {
    const keys = b.keyWords as Word[];
    const keyIds = new Set(keys.map((k) => k.id));
    const syn = bankSynonyms();
    lines.push("", "## Key words (29 keys across TC blanks and SE pairs)", "", "SE partners: * = also a key word (best pair); otherwise a bank synonym may be the second key.", "");
    for (const k of keys) {
      const partners = [...(syn.get(k.id) ?? [])].sort((x, y) => Number(keyIds.has(y)) - Number(keyIds.has(x))).slice(0, 6);
      lines.push(`- **${k.word}**${k.secondary ? " [secondary: everyday sense is the trap]" : ""}: ${k.sense ?? ""} (${k.bucket}, ${k.reason}). Synonyms: ${partners.map((x) => (keyIds.has(x) ? x + "*" : x)).join(", ") || "none in bank"}`);
    }
    const skills = JSON.parse(fs.readFileSync("data/rc_skills.json", "utf8")) as { id: string; description: string }[];
    lines.push("", "## Reading skills for the 13 RC slots (arg-* on argument slots; may repeat)", "");
    for (const s of b.skillSlots as { skill: string; bucket: string; reason: string }[])
      lines.push(`- **${s.skill}** (${s.bucket}, ${s.reason}): ${skills.find((x) => x.id === s.skill)?.description ?? ""}`);
    const d = b.distractorWords as { weak: Word[]; untested: Word[] };
    lines.push("", "## Distractor words (about 40% of distractors)", "", `Weak: ${d.weak.map((w) => w.word).join(", ") || "none"}`, "", `Untested: ${d.untested.map((w) => w.word).join(", ")}`);
    lines.push("", "## Passage words (weave 3-6 into each passage)", "", (b.passageWords as Word[]).map((w) => `${w.word}${w.secondary ? " (2nd sense)" : ""}`).join(", "));
  } else {
    lines.push("", "## Concept slots (one primary concept each)", "");
    for (const c of b.conceptSlots as { slot: number; concept: string; name: string; area: string; reason: string }[]) lines.push(`- ${c.slot}. **${c.concept}** (${c.name}, ${c.area}): ${c.reason}`);
  }
  lines.push("", "## Earlier tests (do not repeat topics)", "");
  for (const t of b.previous as { id: string; passageTopics: string[]; stems?: string[] }[]) {
    lines.push(`- ${t.id}: ${t.passageTopics.join(" / ") || "(no passages)"}`);
    if (t.stems) lines.push(`  - stems: ${t.stems.join(" · ")}`);
  }
  lines.push("", "## Instructions", "", String(b.instructions), "");
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

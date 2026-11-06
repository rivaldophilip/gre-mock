// Build a generation brief from the DB: which words/concepts the next test must target.
// usage: npm run brief -- verbal|quant [--seed N] [--user <email>]  (the only account is the default)
import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "node:fs";
import path from "node:path";
import { schema } from "../lib/db";
import { oneTarget } from "./lib/accounts";
import { scoreAll, type ItemScore, type LoggedEvent } from "../lib/priority/compute";
import { allocateConcepts, allocateWords, rng } from "../lib/priority/allocate";

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

function previousTests() {
  const dir = "content/tests";
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(measure + "-"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .map((t) => ({
      id: t.id,
      passageTopics: (t.passages ?? []).map((p: { title?: string; paragraphs: string[] }) => p.title ?? p.paragraphs[0].slice(0, 80)),
      stems: (t.questions ?? []).map((q: { prompt: string }) => q.prompt.slice(0, 90)),
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
  const events = (await db.select().from(schema.itemEvents)).filter((e) => e.kind === (measure === "verbal" ? "word" : "concept"));
  const logged: LoggedEvent[] = events.map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt }));
  const id = nextId();
  const refs = refItems();
  const brief: Record<string, unknown> = { testId: id, measure, seed, generatedAt: now.toISOString(), blueprint, previous: previousTests(), slots: slotExemplars(refs) };

  if (measure === "verbal") {
    const vocab = (await db.select().from(schema.vocab)).filter((v) => !v.pink);
    const byId = new Map(vocab.map((v) => [v.id, v]));
    const scores = scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield })), logged, now);
    const keys = allocateWords(scores, 29, random);
    // secondary senses are a hard-item driver: make sure at least MIN_SECONDARY keys test one
    const MIN_SECONDARY = 4;
    const isSec = (wid: string) => !!byId.get(wid)?.isSecondary;
    const have = keys.filter((k) => isSec(k.itemId)).length;
    if (have < MIN_SECONDARY) {
      const taken = new Set(keys.map((k) => k.itemId));
      const extra = scores.filter((s) => isSec(s.itemId) && !taken.has(s.itemId)).sort((a, b) => b.N * b.Y - a.N * a.Y || b.P - a.P);
      // replace the weakest "new" picks, keeping every review pick
      const replaceable = keys.map((k, i) => ({ k, i })).filter(({ k }) => k.bucket !== "review" && !isSec(k.itemId)).reverse();
      for (let j = 0; j < MIN_SECONDARY - have && j < extra.length && j < replaceable.length; j++) {
        keys[replaceable[j].i] = { itemId: extra[j].itemId, bucket: "new", reason: `secondary sense (${extra[j].reason})` };
      }
    }
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
    Object.assign(brief, {
      keyWords: keySlots,
      distractorWords: { weak: weakD.map((s) => show(s)), untested: freshD.map((s) => show(s)) },
      passageWords: passPool.map((s) => show(s)),
      instructions:
        "Use keyWords as the answers/keys across TC blanks and SE pairs (29 slots, order free). Fill distractors from distractorWords (about 40% weak). Weave 3-6 passageWords into each RC passage. Tag every word: role key|distractor|passage with `at` choice positions. Words must be spelled exactly as vocab lemma. Each key word's `sense` is the GRE-tested sense: write the sentence so THAT sense is the one that fits (for secondary=true words, the everyday sense must be the trap).",
    });
  } else {
    const concepts = await db.select().from(schema.concepts);
    const scores = scoreAll(concepts.map((c) => ({ id: c.id, yield: c.yield })), logged, now);
    const areaOf = new Map(concepts.map((c) => [c.id, c.area]));
    const withArea = scores.map((s) => ({ ...s, area: areaOf.get(s.itemId)! }));
    const picks = allocateConcepts(withArea, 27, ["arithmetic", "algebra", "geometry", "data"], random);
    brief.conceptSlots = picks.map((p, i) => ({ slot: i + 1, concept: p.itemId, name: concepts.find((c) => c.id === p.itemId)?.name, area: areaOf.get(p.itemId), bucket: p.bucket, reason: p.reason, exemplars: conceptExemplars(refs, p.itemId) }));
    brief.instructions =
      "Assign the 27 concept slots to the 27 blueprint slots (any order, but a DI set of 3 should share a concept area). Each question: one primary concept (the slot) and optional secondary tags. Provide a python verification script.";
  }

  fs.mkdirSync("content/briefs", { recursive: true });
  const out = `content/briefs/${id}.json`;
  fs.writeFileSync(out, JSON.stringify(brief, null, 1));
  console.log(`wrote ${out}`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });

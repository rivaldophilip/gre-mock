// Build a generation brief from the DB: which words/concepts the next test must target.
// usage: npm run brief -- verbal|quant [--seed N]
import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "node:fs";
import path from "node:path";
import { db, schema } from "../lib/db";
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

type Exemplar = { id: string; type: string; pplus: number | null; difficulty: string | null };
function exemplars(): Record<string, string[]> {
  if (!fs.existsSync(REF)) return {};
  const items: (Exemplar & { source: string })[] = fs
    .readFileSync(REF, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((x) => x.type !== "passage");
  const hard = items.filter((x) => (x.pplus !== null && x.pplus <= 45) || x.difficulty === "hard");
  const out: Record<string, string[]> = {};
  for (const t of new Set(items.map((x) => x.type))) {
    out[t] = hard
      .filter((x) => x.type === t)
      .sort((a, b) => (a.pplus ?? 50) - (b.pplus ?? 50))
      .slice(0, 12)
      .map((x) => x.id);
  }
  return out;
}

async function main() {
  const seed = seedArg > 0 ? Number(process.argv[seedArg + 1]) : Date.now() % 100000;
  const random = rng(seed);
  const now = new Date();
  const events = (await db().select().from(schema.itemEvents)).filter((e) => e.kind === (measure === "verbal" ? "word" : "concept"));
  const logged: LoggedEvent[] = events.map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt }));
  const id = nextId();
  const brief: Record<string, unknown> = { testId: id, measure, seed, generatedAt: now.toISOString(), blueprint, previous: previousTests(), exemplarIds: exemplars() };

  if (measure === "verbal") {
    const vocab = (await db().select().from(schema.vocab)).filter((v) => !v.pink);
    const byId = new Map(vocab.map((v) => [v.id, v]));
    const scores = scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield })), logged, now);
    const keys = allocateWords(scores, 29, random);
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
      return { word: v.lemma, id: v.id, tier: v.tier, secondary: v.isSecondary, group: v.meaningGroup, bucket, reason: s.reason, P: +s.P.toFixed(2) };
    };
    const keySlots = keys.map((k) => show(scores.find((s) => s.itemId === k.itemId)!, k.bucket));
    Object.assign(brief, {
      keyWords: keySlots,
      distractorWords: { weak: weakD.map((s) => show(s)), untested: freshD.map((s) => show(s)) },
      passageWords: passPool.map((s) => show(s)),
      instructions:
        "Use keyWords as the answers/keys across TC blanks and SE pairs (29 slots, order free). Fill distractors from distractorWords (about 40% weak). Weave 3-6 passageWords into each RC passage. Tag every word: role key|distractor|passage with `at` choice positions. Words must be spelled exactly as vocab lemma.",
    });
  } else {
    const concepts = await db().select().from(schema.concepts);
    const scores = scoreAll(concepts.map((c) => ({ id: c.id, yield: c.yield })), logged, now);
    const areaOf = new Map(concepts.map((c) => [c.id, c.area]));
    const withArea = scores.map((s) => ({ ...s, area: areaOf.get(s.itemId)! }));
    const picks = allocateConcepts(withArea, 27, ["arithmetic", "algebra", "geometry", "data"], random);
    brief.conceptSlots = picks.map((p, i) => ({ slot: i + 1, concept: p.itemId, name: concepts.find((c) => c.id === p.itemId)?.name, area: areaOf.get(p.itemId), bucket: p.bucket, reason: p.reason }));
    brief.instructions =
      "Assign the 27 concept slots to the 27 blueprint slots (any order, but a DI set of 3 should share a concept area). Each question: one primary concept (the slot) and optional secondary tags. Provide a python verification script.";
  }

  fs.mkdirSync("content/briefs", { recursive: true });
  const out = `content/briefs/${id}.json`;
  fs.writeFileSync(out, JSON.stringify(brief, null, 1));
  console.log(`wrote ${out}`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });

// Brief for the next question-bank batch (docs/BANK.md, Refill): the top gaps from bank:gaps turned into slots.
// usage: npm run -s bank:brief [-- quant|verbal] [--kind quant|tcse|rc] [--count N] [--seed N] [--user <email>]
// With no measure, the one with the larger deficit. Kinds:
//   quant  20-30 items over 4-8 concepts at levels 4 and 5, revisit siblings, and a DI set when the bank lacks one
//   tcse   standalone TC / SE items keyed with the words no unseen item keys, then untested ones (the drill style)
//   rc     reading passages in the shapes the bank lacks (rc4-long, rc2, rc1) and arguments, by skill
// Writes content/briefs/<id>.{json,md} for content/bank/<measure>/<id>.json.
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import fs from "node:fs";
import path from "node:path";
import { schema } from "../lib/db";
import { assignVariants, drawMultiKeys, rng } from "../lib/priority/allocate";
import { DRILL_UNTESTED_SHARE, PASSAGE_WORDS_MIN, SMOOTH } from "../lib/priority/config";
import { REVISIT_CHANGES, REVISIT_MAX } from "../lib/priority/revisit";
import { conceptHistory, itemText, type SetupGroup } from "../lib/setup-history";
import { measureSources } from "../lib/sources";
import { BANK_DIR } from "../lib/test-path";
import { bankSynonyms } from "./lib/bank";
import { DEFICIT_THRESHOLD, type BatchKind, type Gap } from "./lib/bank-gaps";
import { bankHolds, choiceWord, clip, conceptExemplars, earlierCompany, keyedSePairs, refItems, splitMix, TCSE_DISTRACTORS, TCSE_KEYS, TCSE_MIX, variantsUsed, type Shown, type TcseType } from "./lib/brief-parts";
import { gapsFor } from "./bank-gaps";
import type { Question } from "../lib/types";

const args = process.argv.slice(2);
const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const QUANT_TYPES = [["qc", 9], ["mc", 10], ["mc_multi", 3], ["numeric", 2]] as const;

type Slot = { slot: number; qid: string; type: string; level: number; concept?: string; skill?: string; name?: string; variant?: string; unit?: string; keys?: number; revisit?: { ref: string; result: string; item: string; setup?: string; change: string } };
type Unit = { id: string; shape: string; paragraphs?: string };

function nextId(measure: "quant" | "verbal") {
  const prefix = measure === "quant" ? "qbank" : "vbank";
  const nums = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => new RegExp(`^${prefix}-(\\d+)\\.json$`).exec(f)).filter((m) => m).map((m) => Number(m![1])) : []);
  return `${prefix}-${String(Math.max(0, ...nums(path.join(BANK_DIR, measure)), ...nums("content/briefs")) + 1).padStart(3, "0")}`;
}

/** The missed item a revisit gap names, as the brief shows it. */
function revisitOf(ref: string, result: string, n: number, measure: "quant" | "verbal", byRef: Map<string, Question>) {
  const q = byRef.get(ref)!;
  return { ref, result, item: itemText(q), setup: q.setup, change: REVISIT_CHANGES[measure][n % REVISIT_CHANGES[measure].length] };
}

async function main() {
  const asked = (["quant", "verbal"] as const).find((m) => args.includes(m));
  const runs = asked ? [await gapsFor(asked)] : await Promise.all((["quant", "verbal"] as const).map(gapsFor));
  const run = runs.reduce((a, b) => (b.batch.deficit > a.batch.deficit ? b : a));
  const measure = run.ctx.measure;
  const kind = (opt("--kind") as BatchKind | undefined) ?? run.batch.kind;
  if (run.batch.deficit < DEFICIT_THRESHOLD && !asked && !opt("--kind")) console.log(`note: the largest weighted deficit is ${run.batch.deficit.toFixed(1)} (< ${DEFICIT_THRESHOLD}); writing a brief anyway`);
  const seed = opt("--seed") ? Number(opt("--seed")) : Date.now() % 100000;
  const random = rng(seed);
  const id = nextId(measure);
  const { db, metas, ctx, gaps } = run;
  const holds = await bankHolds(db, metas, measure);
  const byRef = new Map<string, Question>(measureSources(measure).flatMap((t) => t.questions.map((q) => [`${t.id}:${q.id}`, q] as [string, Question])));
  const revisitGaps = gaps.filter((g) => g.kind === "revisit" && byRef.has(g.id));
  const names = new Map(ctx.conceptScores.map((s) => [s.itemId, ctx.conceptName(s.itemId)]));
  const variants = JSON.parse(fs.readFileSync("data/concept_variants.json", "utf8")) as Record<string, string[]>;
  const refs = refItems();
  const slots: Slot[] = [];
  const units: Unit[] = [];
  const add = (s: Omit<Slot, "slot" | "qid">) => slots.push({ slot: slots.length + 1, qid: `s1q${slots.length + 1}`, ...s });
  const brief: Record<string, unknown> = { testId: id, measure, kind, seed, generatedAt: new Date().toISOString(), gaps: gaps.slice(0, 20).map((g: Gap) => `${g.kind} ${g.id}${g.level ? ` L${g.level}` : ""} (${g.why})`) };

  if (kind === "quant") {
    // 4-8 concepts: those with gaps first (by weighted deficit), then the most needed of the rest
    const ranked = [...new Set(gaps.filter((g) => g.kind === "concept").map((g) => g.id))];
    for (const s of [...ctx.conceptScores].sort((a, b) => b.P - a.P)) if (ranked.length < 4 && !ranked.includes(s.itemId) && s.area !== "reading" && s.area !== "argument") ranked.push(s.itemId);
    const count = Math.max(20, Math.min(30, Number(opt("--count") ?? 24)));
    const concepts = ranked.slice(0, Math.max(4, Math.min(8, Math.round(count / 4))));
    const per = Math.max(2, Math.round(count / concepts.length));
    const typeLeft = new Map<string, number>(QUANT_TYPES.map(([t, n]) => [t, n + (gaps.find((g) => g.kind === "type" && g.id === t)?.deficit ?? 0)]));
    const nextType = () => {
      const t = [...typeLeft].sort((a, b) => b[1] - a[1])[0][0];
      typeLeft.set(t, typeLeft.get(t)! - 4);
      return t;
    };
    // levels 4 and 5 in turn, the level a gap names first
    for (const c of concepts) {
      const first = gaps.find((g) => g.kind === "concept" && g.id === c && g.level)?.level ?? 4;
      for (let i = 0; i < per; i++) add({ type: nextType(), level: i % 2 === 0 ? first : 9 - first, concept: c, name: names.get(c) });
    }
    revisitGaps.slice(0, REVISIT_MAX).forEach((g, n) => {
      const q = byRef.get(g.id)!;
      const concept = q.tags.find((t) => t.kind === "concept" && t.role === "primary")?.id;
      add({ type: q.setId ? "mc" : q.type, level: Math.min(5, q.difficulty), concept, name: concept && names.get(concept), variant: q.variant, revisit: revisitOf(g.id, g.why.includes("guessed") ? "guessed" : "missed", n, measure, byRef) });
    });
    if (gaps.some((g) => g.kind === "unit" && g.id === "di3")) {
      units.push({ id: "d1", shape: "di3" });
      const dataConcept = ranked.find((c) => ctx.conceptScores.find((s) => s.itemId === c)?.area === "data") ?? "data-interpretation-calc";
      for (const level of [3, 4, 5]) add({ type: "di", level, concept: dataConcept, name: names.get(dataConcept), unit: "d1" });
    }
    // each slot takes the variant its concept was used least in (the revisits keep their earlier item's)
    const fixed = new Map(slots.flatMap((s, i) => (s.revisit && s.variant ? [[i, s.variant] as const] : [])));
    const vs = assignVariants(slots.map((s) => s.concept ?? ""), variants, variantsUsed(measure, metas, id), random, fixed);
    slots.forEach((s, i) => (s.variant = vs[i]));
    const history = conceptHistory("quant");
    Object.assign(brief, {
      slots,
      units,
      conceptSlots: slots.map((s) => ({ concept: s.concept, variant: s.variant })),
      targets: { concepts },
      history: Object.fromEntries(concepts.map((c) => [c, (history.get(c) ?? []).map((g: SetupGroup) => ({ setup: g.setup, worn: g.worn, items: g.items.length }))])),
      exemplars: Object.fromEntries(concepts.map((c) => [c, conceptExemplars(refs, c)])),
    });
  } else if (kind === "tcse") {
    const count = Number(opt("--count") ?? 20);
    const types = splitMix<TcseType>(count, TCSE_MIX);
    const vocab = (await db.select().from(schema.vocab)).filter((v) => !v.pink);
    const bankWords = new Set((JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as { id: string; exposureOnly?: boolean }[]).filter((v) => !v.exposureOnly).map((v) => v.id));
    const normPos = (p?: string) => (p === "adj" ? "adjective" : p);
    const posOf = (w: string) => normPos((byId.get(w)?.senses as { pos?: string }[] | null)?.[0]?.pos);
    const byId = new Map(vocab.filter((v) => bankWords.has(v.id) && ["noun", "verb", "adjective"].includes(normPos((v.senses as { pos?: string }[] | null)?.[0]?.pos) ?? "")).map((v) => [v.id, v]));
    const scores = ctx.wordScores.filter((s) => byId.has(s.itemId));
    const shown = (w: string) => holds.shown.has(w) || holds.items.has(w);
    // keys: the words gaps name (no unseen item keys them), then never-seen words nothing will show soon, then by priority
    const gapWords = gaps.filter((g) => g.kind === "words" && byId.has(g.id)).map((g) => g.id);
    const fresh = scores.filter((s) => s.C === 0 && !shown(s.itemId)).sort((a, b) => b.Y + 0.3 * random() - (a.Y + 0.3 * random()));
    const freshIds = new Set(fresh.map((s) => s.itemId));
    const rest = scores.filter((s) => !freshIds.has(s.itemId)).sort((a, b) => b.P - a.P);
    const ranked = [...new Set([...gapWords, ...fresh.map((s) => s.itemId), ...rest.map((s) => s.itemId)])];
    const syn = bankSynonyms();
    const keyed = keyedSePairs();
    const used = new Set<string>();
    const pairs = (n: number, ok: (w: string) => boolean) => {
      const out: [string, string][] = [];
      for (const w of ranked) {
        if (out.length >= n) break;
        if (used.has(w) || byId.get(w)?.isSecondary || !ok(w)) continue;
        const mate = [...(syn.get(w) ?? [])].find((o) => !used.has(o) && byId.has(o) && ok(o) && posOf(o) === posOf(w) && !keyed.has([w, o].sort().join("|")));
        if (!mate) continue;
        out.push([w, mate]);
        used.add(w).add(mate);
      }
      return out;
    };
    const nSe = types.filter((t) => t === "se").length;
    const sePairs = pairs(nSe, () => true);
    const revisits = revisitGaps.filter((g) => ["tc", "se"].includes(byRef.get(g.id)!.type)).slice(0, Math.min(REVISIT_MAX, Math.floor(count / 5)));
    const revisitKeys = revisits.reduce((t, g) => t + byRef.get(g.id)!.tags.filter((x) => x.kind === "word" && x.role === "key").length, 0);
    const nKeys = types.reduce((t, x) => t + TCSE_KEYS[x], 0);
    const keys = ranked.filter((w) => !used.has(w)).slice(0, Math.max(0, nKeys - sePairs.length * 2 - revisitKeys));
    keys.forEach((k) => used.add(k));
    const nearKey = new Set([...sePairs.flat(), ...keys].flatMap((w) => [...(syn.get(w) ?? [])]));
    const trapPairs = sePairs.flatMap(([k]) => pairs(1, (w) => posOf(w) === posOf(k) && !nearKey.has(w)));
    const depth = Math.ceil(types.reduce((t, x) => t + TCSE_DISTRACTORS[x], 0) * 1.5) - trapPairs.length * 2;
    const extra = ranked.filter((w) => !used.has(w) && !nearKey.has(w)).slice(0, depth);
    const show = (w: string): Shown => {
      const v = byId.get(w)!;
      const sense = (v.senses as { def: string; pos?: string }[] | null)?.[0];
      return { id: v.id, word: v.lemma, secondary: v.isSecondary, sense: sense ? `${sense.pos ?? ""} ${sense.def}`.trim() : null };
    };
    const company = earlierCompany();
    types.forEach((type, i) => add({ type, level: i % 2 === 0 ? 5 : 4 }));
    Object.assign(brief, {
      slots,
      keyWords: [...sePairs.flat(), ...keys].map((w) => ({ ...show(w), bucket: freshIds.has(w) ? "new" : "review", ...(gapWords.includes(w) ? { gap: true } : {}), ...(company.get(w)?.size ? { avoid: [...company.get(w)!].map((d) => byId.get(d)?.lemma ?? d).sort() } : {}) })),
      sePairs,
      revisits: revisits.map((g, n) => ({ ...revisitOf(g.id, g.why.includes("guessed") ? "guessed" : "missed", n, "verbal", byRef), keys: byRef.get(g.id)!.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id) })),
      distractorWords: { untested: [...trapPairs.flat(), ...extra].filter((w) => freshIds.has(w)).map(show), review: [...trapPairs.flat(), ...extra].filter((w) => !freshIds.has(w)).map(show), trapPairs: trapPairs.map((p) => p.map((w) => byId.get(w)!.lemma)) },
      drillTargets: { untestedChoiceShare: DRILL_UNTESTED_SHARE, exposureOnlyChoices: false },
      targets: { words: [...sePairs.flat(), ...keys] },
    });
  } else {
    // reading: the unit shapes the bank lacks, else a default spread; skills by priority, each slot its least-used variant
    // a mock's reading in one batch (4 + 2 + 2 + 1 questions, two arguments), with one more of any shape the bank lacks
    const plan = ["rc4-long", "rc2", "rc2", "rc1", "arg1", "arg1"];
    for (const g of gaps.filter((x) => x.kind === "unit")) if (g.deficit > 1) plan.splice(plan.indexOf(g.id) + 1, 0, g.id);
    const QTYPES: Record<string, string[]> = { "rc4-long": ["rc", "rc", "rc_multi", "rc_select"], rc2: ["rc", "rc_multi"], rc1: ["rc"], arg1: ["arg"] };
    let p = 0;
    let a = 0;
    for (const shape of plan) {
      const uid = shape === "arg1" ? `a${++a}` : `p${++p}`;
      units.push({ id: uid, shape, paragraphs: shape === "rc4-long" ? "2-4" : shape === "arg1" ? "1" : "1-2" });
      QTYPES[shape].forEach((type) => add({ type, level: slots.length % 2 === 0 ? 4 : 5, unit: uid }));
    }
    const multi = slots.filter((s) => s.type === "rc_multi");
    drawMultiKeys(multi.length, random).forEach((k, i) => (multi[i].keys = k));
    const skillGaps = gaps.filter((g) => g.kind === "skill").map((g) => g.id);
    const area = (s: Slot) => (s.type === "arg" ? "argument" : "reading");
    const pick = (ar: string) => [...new Set([...skillGaps.filter((x) => ctx.conceptScores.find((c) => c.itemId === x)?.area === ar), ...[...ctx.conceptScores].filter((c) => c.area === ar).sort((x, y) => y.P - x.P).map((c) => c.itemId)])];
    const queues = { reading: pick("reading"), argument: pick("argument") };
    for (const s of slots) {
      const q = queues[area(s)];
      s.skill = q.shift();
      if (s.skill) q.push(s.skill);
      s.name = s.skill && names.get(s.skill);
    }
    const vs = assignVariants(slots.map((s) => s.skill ?? ""), variants, variantsUsed(measure, metas, id), random);
    slots.forEach((s, i) => (s.variant = vs[i]));
    // passage words: exposure-only words first (a passage is their only way in), then never-seen bank words
    const UNTESTED_S = SMOOTH.prior / SMOOTH.total;
    const vocab = await db.select().from(schema.vocab);
    const lemma = new Map(vocab.map((v) => [v.id, v.lemma]));
    const exposure = ctx.wordScores.length ? vocab.filter((v) => v.exposureOnly).map((v) => v.id) : [];
    const words = [...exposure.filter((w) => !holds.shown.has(w)), ...ctx.wordScores.filter((s) => s.C === 0 && !holds.shown.has(s.itemId)).sort(() => random() - 0.5).map((s) => s.itemId), ...ctx.wordScores.filter((s) => s.S > UNTESTED_S).map((s) => s.itemId)];
    const topics = measureSources("verbal").flatMap((t) => t.passages.map((x) => `${t.id} ${x.id}: ${x.title ?? clip(x.paragraphs[0], 70)}`));
    Object.assign(brief, {
      slots,
      units,
      skillSlots: slots.filter((s) => s.skill).map((s) => ({ skill: s.skill, variant: s.variant })),
      passageWords: [...new Set(words)].slice(0, 40).map((w) => ({ id: w, word: lemma.get(w) ?? w })),
      wordTargets: { untestedDistractorShare: 0, passageWordsMin: PASSAGE_WORDS_MIN, exposureOnlyChoices: false },
      previousTopics: topics,
      targets: { skills: [...new Set(slots.map((s) => s.skill))] },
    });
  }

  fs.mkdirSync("content/briefs", { recursive: true });
  fs.writeFileSync(`content/briefs/${id}.json`, JSON.stringify(brief, null, 1));
  fs.writeFileSync(`content/briefs/${id}.md`, markdown(brief, slots, units));
  console.log(`${measure} ${kind} batch ${id}: ${slots.length} items${units.length ? ` in ${units.length} unit(s) and singles` : ""}`);
  console.log(`wrote content/briefs/${id}.json and content/briefs/${id}.md (read this one)`);
  console.log(`next: write ${BANK_DIR}/${measure}/${id}.json in one Write${measure === "quant" ? ` and content/verify/${id}.py` : ""}, then npm run -s check -- ${id}`);
}

function markdown(b: Record<string, unknown>, slots: Slot[], units: Unit[]): string {
  const kind = b.kind as BatchKind;
  const lines = [
    `# Bank batch ${b.testId} (${b.measure}, ${kind}, seed ${b.seed})`,
    "",
    `Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/${b.measure}/${b.testId}.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; ${units.length ? "a unit's questions share its passage or DI set, whose id is the unit's id; " : ""}rules in docs/QUIZ-AUTHORING.md, Bank batches.`,
    "",
    "Gaps this batch closes: " + ((b.gaps as string[]).slice(0, 8).join("; ") || "none"),
    "",
    "## Slots",
    "",
    `| qid | type | level | ${kind === "quant" ? "concept | variant" : kind === "rc" ? "unit | skill | variant" : "notes"} |`,
    `|---|---|---|${kind === "quant" ? "---|---" : kind === "rc" ? "---|---|---" : "---"}|`,
    ...slots.map((s) =>
      kind === "quant"
        ? `| ${s.qid} | ${s.type}${s.unit ? ` (${s.unit})` : ""} | ${s.level} | ${s.concept ?? ""} | ${s.variant ?? ""}${s.revisit ? " (revisit)" : ""} |`
        : kind === "rc"
          ? `| ${s.qid} | ${s.type}${s.keys ? ` (${s.keys} key${s.keys > 1 ? "s" : ""})` : ""} | ${s.level} | ${s.unit} | ${s.skill ?? ""} | ${s.variant ?? ""} |`
          : `| ${s.qid} | ${s.type} | ${s.level} | |`,
    ),
  ];
  if (units.length) lines.push("", "Units: " + units.map((u) => `${u.id} ${u.shape}${u.paragraphs ? ` (${u.paragraphs} paragraph${u.paragraphs === "1" ? "" : "s"})` : ""}`).join(", "));
  if (kind === "quant") {
    const hist = b.history as Record<string, { setup: string; worn: boolean; items: number }[]>;
    lines.push("", "## Asked before (per concept; never reuse a setup, worn ones are banned)", "");
    for (const [c, gs] of Object.entries(hist)) {
      lines.push(`- **${c}**`);
      for (const g of gs.slice(0, 12)) lines.push(`  - ${g.worn ? "**worn** " : ""}${g.setup}${g.items > 1 ? ` (${g.items}×)` : ""}`);
      if (gs.length > 12) lines.push(`  - … ${gs.length - 12} more (the novelty judge sees every one)`);
    }
    for (const s of slots.filter((x) => x.revisit))
      lines.push("", `Revisit ${s.qid} of ${s.revisit!.ref} (you ${s.revisit!.result} it): ${s.revisit!.item}${s.revisit!.setup ? ` [setup: ${s.revisit!.setup}]` : ""}. Write a sibling, not a copy: ${s.revisit!.change}. Set \`"revisits": "${s.revisit!.ref}"\`.`);
    lines.push("", "Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).");
  } else if (kind === "tcse") {
    const keys = b.keyWords as (Shown & { bucket: string; gap?: boolean; avoid?: string[] })[];
    const pairs = b.sePairs as [string, string][];
    const lemma = new Map(keys.map((k) => [k.id, k.word]));
    lines.push("", `## Key words (every one a key; at least ${Math.round(DRILL_UNTESTED_SHARE * 100)}% of all choice words from this brief)`, "");
    if (pairs.length) lines.push(`SE pairs (both words of a pair keyed in one SE item): ${pairs.map(([x, y]) => `${lemma.get(x)} / ${lemma.get(y)}`).join("; ")}.`, "");
    for (const k of keys) lines.push(`- **${k.word}**${k.gap ? " (no unseen item keys it)" : ""}${k.bucket === "review" ? " [review]" : ""}${k.avoid ? ` (not beside: ${k.avoid.join(", ")})` : ""}${k.secondary ? " [secondary: the everyday sense is the trap]" : ""}: ${k.sense ?? ""}`);
    const rv = b.revisits as { ref: string; result: string; item: string; keys: string[]; change: string }[];
    if (rv.length) {
      lines.push("", "## Revisits (one slot each, keyed with the same word)", "");
      for (const r of rv) lines.push(`- **${r.ref}** (you ${r.result} it; key ${r.keys.join(" / ")}): ${r.item}. Write a sibling: ${r.change}. Set \`"revisits": "${r.ref}"\`, with new distractors.`);
    }
    const d = b.distractorWords as { untested: Shown[]; review: Shown[]; trapPairs: string[][] };
    lines.push("", "## Distractor words (take every distractor from here, untested first)", "", `Untested: ${d.untested.map(choiceWord).join(", ") || "none left"}`);
    if (d.review.length) lines.push("", `Review: ${d.review.map(choiceWord).join(", ")}`);
    if (d.trapPairs.length) lines.push("", `SE trap pairs: ${d.trapPairs.map((p) => p.join(" / ")).join("; ")}. One per SE item as the wrong synonym pair.`);
  } else {
    lines.push("", `## Passage words (weave ${PASSAGE_WORDS_MIN}-6 into each reading passage, not the arguments)`, "", (b.passageWords as { word: string }[]).map((w) => w.word).join(", "));
    lines.push("", "## Earlier passages (do not repeat a topic)", "", ...(b.previousTopics as string[]).map((t) => `- ${t}`));
    lines.push("", "Set each passage's `domain` (science, social science, humanities, arts, business). Each question: one primary skill tag (its slot's), written as its variant.");
  }
  lines.push("", "How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.", "");
  return lines.join("\n");
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });

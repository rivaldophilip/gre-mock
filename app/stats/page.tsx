import Link from "next/link";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { scoreAll, type LoggedEvent } from "@/lib/priority/compute";
import { allocateConcepts, selectionOdds } from "@/lib/priority/allocate";
import { avgTimeWhy, missWhy, needWhy, paceWhy, weaknessWhy } from "@/lib/priority/explain";
import { SLOW_MS } from "@/lib/priority/config";
import { listTestIds, loadTest } from "@/lib/content";
import { pairKey, sectionOvertimeMs } from "@/lib/attempts";
import { attemptNumbers, attemptTimeMs, fmtDuration, isListed, mockNumbers } from "@/lib/attempt-summary";
import { bandText, bandWhy, estimateBand, isAnswered } from "@/lib/scoring";
import { slotType, typeStats, TYPE_INFO, type SlotType } from "@/lib/qtypes";
import type { Answer, Question } from "@/lib/types";
import blueprints from "@/data/blueprints.json";
import { SenseLine, type Sense } from "@/components/WordTagger";
import { AppHeader } from "@/components/AppHeader";
import { Explain } from "@/components/Explain";
import { AttemptsPanel } from "@/components/AttemptsPanel";
import type { ProgressPoint } from "@/components/ProgressChart";
import { List, Table } from "@/components/ShowMore";
import { WordTable } from "@/components/WordTable";
import { WordRestore } from "@/components/WordRestore";
import { badge, card } from "@/components/ui";

export const dynamic = "force-dynamic";

/** Simulated briefs per item list; at 200 runs a 50% chance is ±3.5 points. */
const TRIALS = 200;
const QUANT_AREAS = ["arithmetic", "algebra", "geometry", "data"];
const slotsOf = (m: "verbal" | "quant") => blueprints[m].sections.flatMap((s) => s.slots.map((x) => x.type));
const pct = (x: number) => `${Math.round(100 * x)}%`;
/** Practice-need badge thresholds: High at or above NEED_HIGH, Medium at or above NEED_MED. */
const NEED_HIGH = 0.5;
const NEED_MED = 0.3;
/** Rows a table shows folded: how many meet `keep`, clamped to [min, max]. */
const cutoff = <T,>(rows: T[], keep: (r: T) => boolean, min: number, max = Infinity) =>
  Math.min(rows.length, Math.max(min, Math.min(max, rows.filter(keep).length)));

export default async function Stats() {
  const db = await userDb();
  const [vocab, concepts, events, resp, attempts, qitems] = await Promise.all([
    db.select().from(schema.vocab),
    db.select().from(schema.concepts),
    db.select().from(schema.itemEvents),
    db.select().from(schema.responses),
    db.select().from(schema.attempts),
    db.select().from(schema.questionItems),
  ]);
  const vmap = new Map(vocab.map((v) => [v.id, v]));
  const now = new Date();
  const ev = (kind: string): LoggedEvent[] => events.filter((e) => e.kind === kind).map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt, attemptId: e.attemptId }));
  const ws = scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield, exposureOnly: v.exposureOnly })), ev("word"), now);
  // quant concepts and reading/argument skills share the concepts table
  const isSkill = (area?: string) => area === "reading" || area === "argument";
  const cname = new Map(concepts.map((c) => [c.id, c]));
  const all = scoreAll(concepts.map((c) => ({ id: c.id, yield: c.yield })), ev("concept"), now);
  const cs = all.filter((s) => !isSkill(cname.get(s.itemId)?.area));
  const ss = all.filter((s) => isSkill(cname.get(s.itemId)?.area));
  // the full list doubles as a study list, so it is not capped; the table pages through it
  // dismissed words (known, or not worth it) leave the list until a later miss brings them back
  const weakWords = ws.filter((s) => s.weakEvidence > 0 && !s.dismissed).sort((a, b) => b.P - a.P);
  const dismissedWords = ws.filter((s) => s.dismissed).sort((a, b) => (vmap.get(a.itemId)?.lemma ?? a.itemId).localeCompare(vmap.get(b.itemId)?.lemma ?? b.itemId));
  // a secondary-sense word was most likely missed on its GRE sense, which the dismiss prompt names
  const greSense = (id: string) => ((vmap.get(id)?.senses ?? null) as Sense[] | null)?.find((x) => x.secondary)?.def;
  const weakConcepts = cs.filter((s) => s.weakEvidence > 0).sort((a, b) => b.S - a.S || b.P - a.P).slice(0, 15);
  const weakSkills = ss.filter((s) => s.weakEvidence > 0).sort((a, b) => b.S - a.S || b.P - a.P).slice(0, 10);
  // an exposure-only word is never a choice: one showing in a passage or stem covers it, so it counts as tested
  const covW = { tested: ws.filter((s) => s.C >= 1).length, exposed: ws.filter((s) => s.C > 0 && s.C < 1).length, untested: ws.filter((s) => s.C === 0).length };
  const covC = { tested: cs.filter((s) => s.C >= 1).length, exposed: cs.filter((s) => s.C > 0 && s.C < 1).length, untested: cs.filter((s) => s.C === 0).length };
  const covS = { tested: ss.filter((s) => s.C >= 1).length, untested: ss.filter((s) => s.C === 0).length };

  // chance of being picked by the next brief: rerun the same allocators the brief uses
  const conceptOdds = selectionOdds((r) => allocateConcepts(cs.map((s) => ({ ...s, area: cname.get(s.itemId)!.area })), 27, QUANT_AREAS, r), TRIALS);
  const vSlots = slotsOf("verbal");
  const nArg = vSlots.filter((t) => t === "arg").length;
  const nRc = vSlots.filter((t) => t.startsWith("rc")).length;
  const skillsIn = (area: string) => ss.filter((s) => cname.get(s.itemId)?.area === area).map((s) => ({ ...s, area }));
  const skillOdds = selectionOdds((r) => [...allocateConcepts(skillsIn("reading"), nRc, ["reading"], r), ...allocateConcepts(skillsIn("argument"), nArg, ["argument"], r)], TRIALS);

  // average time on the questions that tested each word (as the answer or a wrong choice) or concept / skill
  const timeOf = new Map(resp.map((r) => [r.id, r.timeMs]));
  const testedIn = new Map<string, Set<number>>();
  for (const e of events) {
    if (e.responseId === null || e.event === "key_slow" || e.event === "concept_slow") continue;
    if (e.kind === "word" ? !/^(key|distractor)_/.test(e.event) : !e.event.startsWith("concept_")) continue;
    const k = `${e.kind}:${e.itemId}`;
    (testedIn.get(k) ?? testedIn.set(k, new Set()).get(k)!).add(e.responseId);
  }
  const avgTime = (kind: string, id: string) => {
    const ids = [...(testedIn.get(`${kind}:${id}`) ?? [])];
    return ids.length ? { n: ids.length, ms: ids.reduce((t, r) => t + (timeOf.get(r) ?? 0), 0) / ids.length } : null;
  };

  // every authored question, for its type and for attempt totals
  const tests = new Map(listTestIds().map((id) => [id, loadTest(id)!]));
  const qByKey = new Map<string, Question>();
  for (const t of tests.values()) for (const q of t.questions) qByKey.set(pairKey(t.id, q.id), q);
  // blank questions are left out of accuracy, as they are out of the priority model
  const answered = (r: (typeof resp)[number]) => {
    const q = qByKey.get(r.questionId);
    return !!q && r.finalized && isAnswered(q, (r.answer ?? undefined) as Answer | undefined);
  };
  const types = typeStats(
    resp.filter(answered).map((r) => ({ type: slotType(qByKey.get(r.questionId)!), isCorrect: r.isCorrect, guessed: r.guessed, timeMs: r.timeMs })),
  );
  const slotCount = (t: SlotType) => [...vSlots, ...slotsOf("quant")].filter((x) => x === t).length;

  const byAttempt = new Map<number, { correct: number; guessed: number }>();
  for (const r of resp) {
    if (!r.isCorrect) continue;
    const s = byAttempt.get(r.attemptId) ?? { correct: 0, guessed: 0 };
    s.correct++;
    if (r.guessed) s.guessed++;
    byAttempt.set(r.attemptId, s);
  }

  // accuracy by quant concept area and by reading skill, through each question's primary tag
  const primaryOf = new Map(qitems.filter((i) => i.kind === "concept" && i.role === "primary").map((i) => [i.questionId, i.itemId]));
  const byArea = new Map<string, { n: number; ok: number }>();
  const byConcept = new Map<string, { n: number; ok: number }>();
  const bySkill = new Map<string, { n: number; ok: number; ms: number }>();
  for (const r of resp) {
    if (!answered(r)) continue;
    const c = cname.get(primaryOf.get(r.questionId) ?? "");
    if (!c) continue;
    if (isSkill(c.area)) {
      const s = bySkill.get(c.id) ?? { n: 0, ok: 0, ms: 0 };
      s.n++;
      s.ok += r.isCorrect ? 1 : 0;
      s.ms += r.timeMs;
      bySkill.set(c.id, s);
      continue;
    }
    const s = byArea.get(c.area) ?? { n: 0, ok: 0 };
    s.n++;
    s.ok += r.isCorrect ? 1 : 0;
    byArea.set(c.area, s);
    const k = byConcept.get(c.id) ?? { n: 0, ok: 0 };
    k.n++;
    k.ok += r.isCorrect ? 1 : 0;
    byConcept.set(c.id, k);
  }

  const pctOf = (s: { n: number; ok: number }) => Math.round((100 * s.ok) / s.n);
  // per-concept rows under each area, weakest first; under MIN_N answers the % is shaky, so those go last and dimmed
  const MIN_N = 5;
  const areaRows = [...byArea.entries()].sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([area, s]) => ({
    area,
    s,
    concepts: [...byConcept.entries()]
      .filter(([id]) => cname.get(id)?.area === area)
      .sort((a, b) => Number(a[1].n < MIN_N) - Number(b[1].n < MIN_N) || a[1].ok / a[1].n - b[1].ok / b[1].n),
  }));

  const skillRows = [...bySkill.entries()].sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);

  // abandoned attempts are not listed and take no number
  const listed = attempts.filter(isListed);
  const numberOf = attemptNumbers(listed);
  const bandOf = (a: (typeof attempts)[number]) => {
    const s = byAttempt.get(a.id) ?? { correct: 0, guessed: 0 };
    return a.finishedAt ? estimateBand(s.correct, s.guessed, tests.get(a.testId)?.questions.length ?? 0) : null;
  };
  // the Attempts tiles and progress chart: every finished attempt, all time (the chart scrolls back to mock #1 and
  // the tiles follow it); retakes share their mock's number
  const measureOf = (a: (typeof attempts)[number]) => tests.get(a.testId)?.measure;
  const mockNo = mockNumbers(listed, measureOf);
  const progress: ProgressPoint[] = listed.flatMap((a) => {
    const band = bandOf(a);
    const m = measureOf(a);
    if (!band || !m) return [];
    return [{
      id: a.id, measure: m, n: mockNo.get(a.testId)!, finishedAt: a.finishedAt!.getTime(), score: { mid: band.mid, low: band.low, high: band.high },
      timeMs: attemptTimeMs(a), testId: a.testId, attemptNo: numberOf.get(a.id) ?? 1, timed: a.timerOn, mode: a.mode, href: `/test/${a.testId}/review/${a.id}`,
    }];
  });
  const limitMs = { verbal: 0, quant: 0 };
  for (const m of ["verbal", "quant"] as const) limitMs[m] = blueprints[m].sections.reduce((t, s) => t + s.minutes, 0) * 60_000;

  return (
    <>
      <AppHeader active="stats" />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
          <p className="text-sm text-muted">What you have covered, and where to aim next.</p>
        </div>

        {progress.length > 0 ? (
          <AttemptsPanel points={progress} now={now.getTime()} limitMs={limitMs} />
        ) : (
          <section className="space-y-3">
            <h2 className="font-semibold">Attempts</h2>
            <p className="text-sm text-muted">No finished attempts yet.</p>
          </section>
        )}

        <Section title="Coverage">
          <div className="grid gap-3 sm:grid-cols-3">
            <Coverage label="Words" total={vocab.length} parts={[["Tested", covW.tested], ["Exposed", covW.exposed], ["Untested", covW.untested]]} />
            <Coverage label="Quant concepts" total={cs.length} parts={[["Tested", covC.tested], ["Exposed", covC.exposed], ["Untested", covC.untested]]} />
            <Coverage label="Reading skills" total={ss.length} parts={[["Tested", covS.tested], ["Untested", covS.untested]]} />
          </div>
        </Section>

        <Section title="Weakest words" note="Sorted by weakness, weakest first; click a column to sort by it. Tick words you know or don't need and dismiss them: tests and drills stop aiming at them until you miss them again.">
          {weakWords.length === 0 ? <Empty /> : (
            <WordTable head={["Word", "Weakness", "Avg time", "Why"]} sorts={["az", "weak", "time", null]} rows={weakWords.map((s, i) => {
              const v = vmap.get(s.itemId);
              const senses = (v?.senses ?? null) as Sense[] | null;
              const lemma = v?.lemma ?? s.itemId;
              const t = avgTime("word", s.itemId);
              return {
                id: s.itemId, lemma, rank: i, S: s.S, ms: t?.ms ?? null, gre: v?.isSecondary ? greSense(s.itemId) : undefined,
                cells: (
                  <>
                    <td className="min-w-48"><strong>{lemma}</strong><br /><SenseLine senses={senses} /></td>
                    <td className="tabular-nums"><Explain why={weaknessWhy(s)}>{pct(s.S)}</Explain></td>
                    <td><AvgTime t={t} slowSec={SLOW_MS.verbal / 1000} noun="word (as the answer or a wrong choice)" /></td>
                    <td className="min-w-40 text-muted">{s.reason}</td>
                  </>
                ),
              };
            })} />
          )}
          {dismissedWords.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted hover:text-fg">Dismissed ({dismissedWords.length})</summary>
              <ul className={`${card} mt-2 divide-y divide-line overflow-hidden`}>
                {dismissedWords.map((s) => {
                  const v = vmap.get(s.itemId);
                  return (
                    <li key={s.itemId} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                      <span><strong>{v?.lemma ?? s.itemId}</strong> <SenseLine senses={(v?.senses ?? null) as Sense[] | null} /></span>
                      <WordRestore id={s.itemId} lemma={v?.lemma ?? s.itemId} />
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
        </Section>

        <Section title="Weakest quant concepts">
          {weakConcepts.length === 0 ? <Empty /> : (
            <Table head={["Concept", "Weakness", "Avg time", "Why"]} noun="concepts" shown={cutoff(weakConcepts, (s) => (conceptOdds.get(s.itemId) ?? 0) >= 0.5, 3, 5)} rows={weakConcepts.map((s) => (
                <tr key={s.itemId}>
                  <td className="min-w-40"><span className="font-medium">{cname.get(s.itemId)?.name ?? s.itemId}</span><br /><span className="text-xs capitalize text-muted">{cname.get(s.itemId)?.area}</span></td>
                  <td className="tabular-nums"><Explain why={weaknessWhy(s)}>{pct(s.S)}</Explain></td>
                  <td><AvgTime t={avgTime("concept", s.itemId)} slowSec={SLOW_MS.quant / 1000} noun="concept" /></td>
                  <td className="min-w-40 text-muted">{s.reason}</td>
                </tr>
              ))} />
          )}
        </Section>

        <Section title="Weakest reading skills">
          {weakSkills.length === 0 ? <Empty /> : (
            <Table head={["Skill", "Weakness", "Avg time", "Why"]} noun="skills" shown={cutoff(weakSkills, (s) => (skillOdds.get(s.itemId) ?? 0) >= 0.5, 3, 5)} rows={weakSkills.map((s) => (
                <tr key={s.itemId}>
                  <td className="min-w-40 font-medium">{cname.get(s.itemId)?.name ?? s.itemId}</td>
                  <td className="tabular-nums"><Explain why={weaknessWhy(s)}>{pct(s.S)}</Explain></td>
                  <td><AvgTime t={avgTime("concept", s.itemId)} slowSec={SLOW_MS.verbal / 1000} noun="skill" /></td>
                  <td className="min-w-40 text-muted">{s.reason}</td>
                </tr>
              ))} />
          )}
        </Section>

        <Section title="Question types to practise" note="Ranked by practice need: how often you miss a type, plus how far over the target pace you run. Hover or tap a number to see how it was worked out.">
          {types.length === 0 ? <Empty text="No answered questions yet." /> : (
            <Table head={["Question type", "Accuracy", "Avg time / target", "Miss chance", "Practice need"]} noun="question types" shown={cutoff(types, (t) => t.need >= NEED_MED, 3)} rows={types.map((t) => (
                <tr key={t.type}>
                  <td className="min-w-56">
                    <span className="font-medium">{TYPE_INFO[t.type].label}</span>
                    <br />
                    <span className="text-xs text-muted">{TYPE_INFO[t.type].what} {slotCount(t.type)} per test.</span>
                  </td>
                  <td className="whitespace-nowrap"><Accuracy pct={Math.round((100 * t.correct) / t.n)} /> <span className="text-xs text-muted">of {t.n}</span></td>
                  <td className={`whitespace-nowrap tabular-nums ${t.paceRatio > 1.15 ? "text-warn" : ""}`}><Explain why={paceWhy(t)}>{Math.round(t.avgMs / 1000)}s / {TYPE_INFO[t.type].paceSec}s</Explain></td>
                  <td className="tabular-nums"><Explain why={missWhy(t)}>{pct(t.missP)}</Explain></td>
                  <td className="whitespace-nowrap">
                    <Explain why={needWhy(t)}><span className={badge(t.need >= NEED_HIGH ? "bad" : t.need >= NEED_MED ? "warn" : "ok")}>{t.need >= NEED_HIGH ? "High" : t.need >= NEED_MED ? "Medium" : "Low"} · {pct(t.need)}</span></Explain>
                  </td>
                </tr>
              ))} />
          )}
        </Section>

        {byArea.size > 0 && (
          <Section title="Quant accuracy by concept area" note="All-time raw accuracy by each question's main concept; open an area for its concepts. The weakest list above is the weighted, decayed version that drives the next test.">
            <div className={`${card} divide-y divide-line overflow-hidden`}>
              {areaRows.map(({ area, s, concepts }) => (
                <details key={area} className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-2/60 [&::-webkit-details-marker]:hidden">
                    <span className="text-muted transition-transform group-open:rotate-90">›</span>
                    <span className="flex-1 font-medium capitalize">{area}</span>
                    <span className="tabular-nums text-muted">{s.n}</span>
                    <Accuracy pct={pctOf(s)} />
                  </summary>
                  <table className="w-full text-sm [&_td]:px-4 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-line">
                    <tbody>
                      {concepts.map(([id, k]) => (
                        <tr key={id} className={k.n < MIN_N ? "text-muted" : ""}>
                          <td className="pl-10">{cname.get(id)?.name ?? id}</td>
                          <td className="w-12 text-right tabular-nums">{k.n}</td>
                          <td className="w-32"><Accuracy pct={pctOf(k)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ))}
            </div>
          </Section>
        )}

        {bySkill.size > 0 && (
          <Section title="Reading accuracy by skill">
            <Table head={["Skill", "Answered", "Accuracy", "Avg time"]} noun="skills" shown={cutoff(skillRows, ([, s]) => pctOf(s) < 70, 3, 5)} rows={skillRows.map(([id, s]) => (
                <tr key={id}>
                  <td className="min-w-40 font-medium">{cname.get(id)?.name ?? id}</td>
                  <td className="tabular-nums">{s.n}</td>
                  <td><Accuracy pct={pctOf(s)} /></td>
                  <td className="tabular-nums">{Math.round(s.ms / s.n / 1000)}s</td>
                </tr>
              ))} />
          </Section>
        )}

        <Section title="Attempt history">
          {listed.length === 0 ? <Empty text="No attempts yet." /> : (
            <List noun="attempts" shown={5} items={[...listed].sort((x, y) => y.startedAt.getTime() - x.startedAt.getTime()).map((a) => {
                const total = tests.get(a.testId)?.questions.length ?? 0;
                const s = byAttempt.get(a.id) ?? { correct: 0, guessed: 0 };
                const band = bandOf(a);
                const test = tests.get(a.testId);
                const overMs = test ? sectionOvertimeMs(a, test, 1) + sectionOvertimeMs(a, test, 2) : 0;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                    <Link className="font-medium underline-offset-4 hover:underline" href={`/test/${a.testId}/review/${a.id}`}>{a.testId} · attempt {numberOf.get(a.id)}</Link>
                    <span className="capitalize text-muted">{a.mode}{a.timerOn ? "" : ", untimed"}</span>
                    <span className={badge(a.finishedAt ? "ok" : "warn")}>{a.finishedAt ? "Finished" : "In progress"}</span>
                    <span className="tabular-nums text-muted" title="Time on the section clocks, without pauses">{fmtDuration(attemptTimeMs(a))}</span>
                    {overMs >= 1000 && <span className={badge("bad")} title="Ran past the section clock; answers given in overtime still count">+{fmtDuration(overMs)} over</span>}
                    {band && (
                      <span className="tabular-nums">
                        <span className="text-muted">{s.correct}/{total} · </span>
                        <Explain why={bandWhy(band) + (a.timerOn ? "" : "\nTaken untimed, so expect lower under the clock.")}>
                          <span className="font-semibold">~{bandText(band)}</span>
                        </Explain>
                      </span>
                    )}
                    <span className="ml-auto tabular-nums text-muted">{a.startedAt.toISOString().slice(0, 10)}</span>
                  </li>
                );
              })} />
          )}
        </Section>
      </main>
    </>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {note && <p className="text-sm text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty({ text = "No weakness evidence yet." }: { text?: string }) {
  return <p className={`${card} px-4 py-5 text-center text-sm text-muted`}>{text}</p>;
}

function Accuracy({ pct }: { pct: number }) {
  return (
    <span className="inline-flex items-center gap-2 tabular-nums">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-2">
        <span className={`block h-full rounded-full ${pct >= 70 ? "bg-ok" : pct >= 50 ? "bg-warn" : "bg-bad"}`} style={{ width: `${pct}%` }} />
      </span>
      {pct}%
    </span>
  );
}

function Coverage({ label, total, parts }: { label: string; total: number; parts: [string, number][] }) {
  const tested = parts[0][1];
  return (
    <div className={`${card} space-y-2 p-4`}>
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{label}</div>
      <div className="font-mono text-2xl font-semibold tabular-nums">
        {tested}
        <span className="text-base text-muted">/{total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <div className="h-full rounded-full bg-accent" style={{ width: `${total ? (100 * tested) / total : 0}%` }} />
      </div>
      <div className="text-xs text-muted">{parts.map(([k, v]) => `${k} ${v}`).join(" · ")}</div>
    </div>
  );
}


function AvgTime({ t, slowSec, noun }: { t: { n: number; ms: number } | null; slowSec: number; noun: string }) {
  if (!t) return <span className="text-muted">-</span>;
  return (
    <Explain why={avgTimeWhy(t.n, t.ms, slowSec, noun)}>
      <span className={`tabular-nums ${t.ms / 1000 > slowSec ? "text-warn" : ""}`}>{Math.round(t.ms / 1000)}s</span>
    </Explain>
  );
}

import Link from "next/link";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { scoreAll, type ItemScore, type LoggedEvent } from "@/lib/priority/compute";
import { allocateConcepts, allocateVerbalKeys, selectionOdds } from "@/lib/priority/allocate";
import { avgTimeWhy, missWhy, needWhy, oddsWhy, paceWhy, weaknessWhy } from "@/lib/priority/explain";
import { SLOW_MS } from "@/lib/priority/config";
import { listTestIds, loadTest } from "@/lib/content";
import { pairKey } from "@/lib/attempts";
import { attemptNumbers, attemptTimeMs, fmtDuration, isListed } from "@/lib/attempt-summary";
import { bandText, bandWhy, estimateBand, isAnswered } from "@/lib/scoring";
import { slotType, typeStats, TYPE_INFO, type SlotType } from "@/lib/qtypes";
import type { Answer, Question } from "@/lib/types";
import blueprints from "@/data/blueprints.json";
import { SenseLine, type Sense } from "@/components/WordTagger";
import { AppHeader } from "@/components/AppHeader";
import { Explain } from "@/components/Explain";
import { badge, card, seg, segItem } from "@/components/ui";

export const dynamic = "force-dynamic";

/** Simulated briefs per item list; at 200 runs a 50% chance is ±3.5 points. */
const TRIALS = 200;
const QUANT_AREAS = ["arithmetic", "algebra", "geometry", "data"];
const slotsOf = (m: "verbal" | "quant") => blueprints[m].sections.flatMap((s) => s.slots.map((x) => x.type));
const pct = (x: number) => `${Math.round(100 * x)}%`;
const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "1m", label: "1 month", days: 30 },
  { id: "3m", label: "3 months", days: 91 },
  { id: "all", label: "All time", days: Infinity },
] as const;

export default async function Stats({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const db = await userDb();
  const { range: rangeParam } = await searchParams;
  const range = RANGES.find((r) => r.id === rangeParam) ?? RANGES[0];
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
  const ev = (kind: string): LoggedEvent[] => events.filter((e) => e.kind === kind).map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt }));
  const ws = scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield })), ev("word"), now);
  // quant concepts and reading/argument skills share the concepts table
  const isSkill = (area?: string) => area === "reading" || area === "argument";
  const cname = new Map(concepts.map((c) => [c.id, c]));
  const all = scoreAll(concepts.map((c) => ({ id: c.id, yield: c.yield })), ev("concept"), now);
  const cs = all.filter((s) => !isSkill(cname.get(s.itemId)?.area));
  const ss = all.filter((s) => isSkill(cname.get(s.itemId)?.area));
  const weakWords = ws.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).slice(0, 25);
  const weakConcepts = cs.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).slice(0, 15);
  const weakSkills = ss.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).slice(0, 10);
  const covW = { tested: ws.filter((s) => s.C >= 1).length, exposed: ws.filter((s) => s.C > 0 && s.C < 1).length, untested: ws.filter((s) => s.C === 0).length };
  const covC = { tested: cs.filter((s) => s.C >= 1).length, exposed: cs.filter((s) => s.C > 0 && s.C < 1).length, untested: cs.filter((s) => s.C === 0).length };
  const covS = { tested: ss.filter((s) => s.C >= 1).length, untested: ss.filter((s) => s.C === 0).length };

  // chance of being picked by the next brief: rerun the same allocators the brief uses
  const bankWords = ws.filter((s) => !vmap.get(s.itemId)?.pink);
  const wordOdds = selectionOdds((r) => allocateVerbalKeys(bankWords, (id) => !!vmap.get(id)?.isSecondary, 29, r), TRIALS);
  const conceptOdds = selectionOdds((r) => allocateConcepts(cs.map((s) => ({ ...s, area: cname.get(s.itemId)!.area })), 27, QUANT_AREAS, r), TRIALS);
  const vSlots = slotsOf("verbal");
  const nArg = vSlots.filter((t) => t === "arg").length;
  const nRc = vSlots.filter((t) => t.startsWith("rc")).length;
  const skillsIn = (area: string) => ss.filter((s) => cname.get(s.itemId)?.area === area).map((s) => ({ ...s, area }));
  const skillOdds = selectionOdds((r) => [...allocateConcepts(skillsIn("reading"), nRc, ["reading"], r), ...allocateConcepts(skillsIn("argument"), nArg, ["argument"], r)], TRIALS);
  const rankIn = (list: ItemScore[]) => new Map(list.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).map((s, i) => [s.itemId, i + 1]));
  const wordRank = rankIn(bankWords);
  const conceptRank = rankIn(cs);
  const skillRank = rankIn(ss);
  const nWeak = { word: wordRank.size, concept: conceptRank.size, skill: skillRank.size };

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
  }

  const pctOf = (s: { n: number; ok: number }) => Math.round((100 * s.ok) / s.n);

  // abandoned attempts are not listed and take no number
  const listed = attempts.filter(isListed);
  const numberOf = attemptNumbers(listed);
  const bandOf = (a: (typeof attempts)[number]) => {
    const s = byAttempt.get(a.id) ?? { correct: 0, guessed: 0 };
    return a.finishedAt ? estimateBand(s.correct, s.guessed, tests.get(a.testId)?.questions.length ?? 0) : null;
  };
  // the summary counts finished attempts, by when they were finished
  const since = now.getTime() - range.days * 86_400_000;
  const inRange = listed.filter((a) => a.finishedAt && a.finishedAt.getTime() >= since);
  const mean = (xs: number[]) => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : null);
  const avgTimeMs = mean(inRange.map((a) => attemptTimeMs(a)));
  const scoreSummary = (m: "verbal" | "quant") => {
    const mids = inRange.filter((a) => tests.get(a.testId)?.measure === m).flatMap((a) => bandOf(a)?.mid ?? []);
    return { n: mids.length, avg: mean(mids), best: mids.length ? Math.max(...mids) : null };
  };
  const vScore = scoreSummary("verbal");
  const qScore = scoreSummary("quant");

  return (
    <>
      <AppHeader active="stats" />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
          <p className="text-sm text-muted">What you have covered, and where to aim next.</p>
        </div>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Attempts</h2>
            <nav className={`${seg} w-full sm:w-auto`} aria-label="Period">
              {RANGES.map((r) => (
                <Link key={r.id} href={`/stats?range=${r.id}`} scroll={false} aria-current={r.id === range.id ? "page" : undefined} className={`${segItem(r.id === range.id)} whitespace-nowrap`}>
                  {r.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Finished attempts" value={String(inRange.length)} note={`${vScore.n} verbal · ${qScore.n} quant`} />
            <Tile
              label="Avg time spent"
              value={avgTimeMs === null ? "–" : fmtDuration(avgTimeMs)}
              note="per attempt, pauses excluded"
            />
            <ScoreTile label="Avg verbal score" s={vScore} />
            <ScoreTile label="Avg quant score" s={qScore} />
          </div>
          {inRange.length === 0 && (
            <p className="text-sm text-muted">
              No attempt finished in the last {range.label.toLowerCase()}.
              {range.id !== "all" && listed.some((a) => a.finishedAt) && (
                <> <Link href="/stats?range=all" scroll={false} className="font-medium text-accent hover:underline">Show all time</Link></>
              )}
            </p>
          )}
        </section>

        <Section title="Coverage">
          <div className="grid gap-3 sm:grid-cols-3">
            <Coverage label="Words" total={vocab.length} parts={[["Tested", covW.tested], ["Exposed", covW.exposed], ["Untested", covW.untested]]} />
            <Coverage label="Quant concepts" total={cs.length} parts={[["Tested", covC.tested], ["Exposed", covC.exposed], ["Untested", covC.untested]]} />
            <Coverage label="Reading skills" total={ss.length} parts={[["Tested", covS.tested], ["Untested", covS.untested]]} />
          </div>
        </Section>

        <Section title="Weakest words">
          {weakWords.length === 0 ? <Empty /> : (
            <Table head={["Word", "In next test", "Weakness", "Avg time", "Why"]}>
              {weakWords.map((s) => (
                <tr key={s.itemId}>
                  <td className="min-w-48"><strong>{vmap.get(s.itemId)?.lemma ?? s.itemId}</strong><br /><SenseLine senses={vmap.get(s.itemId)?.senses as Sense[] | null} /></td>
                  <td><Odds s={s} odds={wordOdds.get(s.itemId) ?? 0} noun="key-word" slots={29} reviewSlots={15} rank={wordRank.get(s.itemId)} rankOf={nWeak.word} /></td>
                  <td className="tabular-nums"><Explain why={weaknessWhy(s)}>{pct(s.S)}</Explain></td>
                  <td><AvgTime t={avgTime("word", s.itemId)} slowSec={SLOW_MS.verbal / 1000} noun="word (as the answer or a wrong choice)" /></td>
                  <td className="min-w-40 text-muted">{s.reason}</td>
                </tr>
              ))}
            </Table>
          )}
        </Section>

        <Section title="Weakest quant concepts">
          {weakConcepts.length === 0 ? <Empty /> : (
            <Table head={["Concept", "In next test", "Weakness", "Avg time", "Why"]}>
              {weakConcepts.map((s) => (
                <tr key={s.itemId}>
                  <td className="min-w-40"><span className="font-medium">{cname.get(s.itemId)?.name ?? s.itemId}</span><br /><span className="text-xs capitalize text-muted">{cname.get(s.itemId)?.area}</span></td>
                  <td><Odds s={s} odds={conceptOdds.get(s.itemId) ?? 0} noun="concept" slots={27} reviewSlots={14} rank={conceptRank.get(s.itemId)} rankOf={nWeak.concept} /></td>
                  <td className="tabular-nums"><Explain why={weaknessWhy(s)}>{pct(s.S)}</Explain></td>
                  <td><AvgTime t={avgTime("concept", s.itemId)} slowSec={SLOW_MS.quant / 1000} noun="concept" /></td>
                  <td className="min-w-40 text-muted">{s.reason}</td>
                </tr>
              ))}
            </Table>
          )}
        </Section>

        <Section title="Weakest reading skills">
          {weakSkills.length === 0 ? <Empty /> : (
            <Table head={["Skill", "In next test", "Weakness", "Avg time", "Why"]}>
              {weakSkills.map((s) => (
                <tr key={s.itemId}>
                  <td className="min-w-40 font-medium">{cname.get(s.itemId)?.name ?? s.itemId}</td>
                  <td><Odds s={s} odds={skillOdds.get(s.itemId) ?? 0} noun="reading-question" slots={nRc + nArg} reviewSlots={Math.round(nRc * 0.5) + Math.round(nArg * 0.5)} rank={skillRank.get(s.itemId)} rankOf={nWeak.skill} /></td>
                  <td className="tabular-nums"><Explain why={weaknessWhy(s)}>{pct(s.S)}</Explain></td>
                  <td><AvgTime t={avgTime("concept", s.itemId)} slowSec={SLOW_MS.verbal / 1000} noun="skill" /></td>
                  <td className="min-w-40 text-muted">{s.reason}</td>
                </tr>
              ))}
            </Table>
          )}
        </Section>

        <Section title="Question types to practise" note="Ranked by practice need: how often you miss a type, plus how far over the target pace you run. Hover or tap a number to see how it was worked out.">
          {types.length === 0 ? <Empty text="No answered questions yet." /> : (
            <Table head={["Question type", "Accuracy", "Avg time / target", "Miss chance", "Practice need"]}>
              {types.map((t) => (
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
                    <Explain why={needWhy(t)}><span className={badge(t.need >= 0.5 ? "bad" : t.need >= 0.3 ? "warn" : "ok")}>{t.need >= 0.5 ? "High" : t.need >= 0.3 ? "Medium" : "Low"} · {pct(t.need)}</span></Explain>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Section>

        {byArea.size > 0 && (
          <Section title="Quant accuracy by concept area">
            <Table head={["Area", "Answered", "Accuracy"]}>
              {[...byArea.entries()].map(([t, s]) => (
                <tr key={t}>
                  <td className="font-medium capitalize">{t}</td>
                  <td className="tabular-nums">{s.n}</td>
                  <td><Accuracy pct={pctOf(s)} /></td>
                </tr>
              ))}
            </Table>
          </Section>
        )}

        {bySkill.size > 0 && (
          <Section title="Reading accuracy by skill">
            <Table head={["Skill", "Answered", "Accuracy", "Avg time"]}>
              {[...bySkill.entries()].sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([id, s]) => (
                <tr key={id}>
                  <td className="min-w-40 font-medium">{cname.get(id)?.name ?? id}</td>
                  <td className="tabular-nums">{s.n}</td>
                  <td><Accuracy pct={pctOf(s)} /></td>
                  <td className="tabular-nums">{Math.round(s.ms / s.n / 1000)}s</td>
                </tr>
              ))}
            </Table>
          </Section>
        )}

        <Section title="Attempt history">
          {listed.length === 0 ? <Empty text="No attempts yet." /> : (
            <ul className={`${card} divide-y divide-line overflow-hidden`}>
              {[...listed].sort((x, y) => y.startedAt.getTime() - x.startedAt.getTime()).map((a) => {
                const total = tests.get(a.testId)?.questions.length ?? 0;
                const s = byAttempt.get(a.id) ?? { correct: 0, guessed: 0 };
                const band = bandOf(a);
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                    <Link className="font-medium underline-offset-4 hover:underline" href={`/test/${a.testId}/review/${a.id}`}>{a.testId} · attempt {numberOf.get(a.id)}</Link>
                    <span className="capitalize text-muted">{a.mode}{a.timerOn ? "" : ", untimed"}</span>
                    <span className={badge(a.finishedAt ? "ok" : "warn")}>{a.finishedAt ? "Finished" : "In progress"}</span>
                    <span className="tabular-nums text-muted" title="Time on the section clocks, without pauses">{fmtDuration(attemptTimeMs(a))}</span>
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
              })}
            </ul>
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

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full text-sm [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_tr]:border-t [&_tr]:border-line">
        <thead>
          <tr className="!border-t-0 bg-surface-2/60 text-left">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
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

function Tile({ label, value, note, why }: { label: string; value: string; note: string; why?: string }) {
  return (
    <div className={`${card} space-y-1 p-4`}>
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{label}</div>
      <div className="font-mono text-2xl font-semibold">{why ? <Explain why={why}>{value}</Explain> : value}</div>
      <div className="text-xs text-muted">{note}</div>
    </div>
  );
}

function ScoreTile({ label, s }: { label: string; s: { n: number; avg: number | null; best: number | null } }) {
  if (s.avg === null) return <Tile label={label} value="–" note="no finished attempt" />;
  return (
    <Tile
      label={label}
      value={`~${Math.round(s.avg)}`}
      note={`best ~${s.best} · ${s.n} attempt${s.n === 1 ? "" : "s"}`}
      why={`Mean of the strict score estimates (the middle of each band) of ${s.n} finished attempt${s.n === 1 ? "" : "s"} in this period, on the 130–170 scale. Untimed attempts count too.`}
    />
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

function Odds({ s, odds, ...ctx }: { s: ItemScore; odds: number; noun: string; slots: number; reviewSlots: number; rank?: number; rankOf: number }) {
  return (
    <Explain why={oddsWhy(s, odds, { trials: TRIALS, ...ctx })}>
      <span className={`font-semibold tabular-nums ${odds >= 0.8 ? "text-accent" : odds < 0.2 ? "text-muted" : ""}`}>{pct(odds)}</span>
    </Explain>
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

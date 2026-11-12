import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { loadTest } from "@/lib/content";
import { canReveal, getAttempt, isClosed, pairKey, responsesFor, sectionOvertimeMs, sectionStatus } from "@/lib/attempts";
import { bandText, bandWhy, estimateBand, scoreAnswer } from "@/lib/scoring";
import { TYPE_INFO, slotType } from "@/lib/qtypes";
import type { Answer, Question, Test } from "@/lib/types";
import { Rich, RichInline } from "@/components/Rich";
import { Figure } from "@/components/Figure";
import { TaggablePassage, WordChip, type Sense } from "@/components/WordTagger";
import rcSkills from "@/data/rc_skills.json";
import { AppHeader } from "@/components/AppHeader";
import { IconCheck, IconNext, IconX } from "@/components/icons";
import { Explain } from "@/components/Explain";
import { badge, btn, card } from "@/components/ui";

export const dynamic = "force-dynamic";
const L = "ABCDEFGHIJ";
const skillName = new Map(rcSkills.map((s) => [s.id, s.name]));

/** The reading skill a question tests (its primary skill tag), for RC questions. */
function skillOf(q: Question): string | undefined {
  const t = q.tags.find((x) => x.kind === "concept" && x.role === "primary" && skillName.has(x.id));
  return t && skillName.get(t.id);
}

/**
 * What a difficulty level means on the real GRE. Levels follow official P+ (the share of real test-takers who got an
 * item right), with the same bands the authoring scripts use (docs/QUIZ-AUTHORING.md, scripts/brief.ts).
 */
const LEVEL_WHY: Record<number, string> = {
  1: "Level 1: easy. On the real GRE, well over 60% of test-takers get an item like this right.",
  2: "Level 2: easier than average. Over 60% of real GRE test-takers get an item like this right.",
  3: "Level 3: medium. About 45–60% of real GRE test-takers get an item like this right, close to the average official item (about 50%).",
  4: "Level 4: hard. Only about 30–45% of real GRE test-takers get an item like this right: the harder items of a hard second section.",
  5: "Level 5: very hard. Under 30% of real GRE test-takers get an item like this right: the toughest items ETS uses.",
  6: "Level 6: harder than a typical GRE hard item. It rates like the hardest tenth of official hard items (an estimated 10–17% of test-takers correct), about 1.3–2 times fewer correct answers than a median level-5 item.",
  7: "Level 7: beyond the real GRE. It rates above every official item we measured (an estimated under 10% correct, extrapolated), more than twice as hard as a median level-5 item.",
};
const levelWhy = (n: number) =>
  `${LEVEL_WHY[n]}\nThe level is set when the test is written and checked against official items of known difficulty (levels 6–7: docs/CALIBRATION.md); it is an estimate, not an ETS rating.`;

/** "3:12" from milliseconds. */
const mss = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function choiceWords(q: Question): string[] {
  if (q.type === "tc") return q.blanks?.flat() ?? [];
  if (q.type === "se") return q.choices ?? [];
  return [];
}

/** One blank or pick of an answer; `ok` is set where a multi-part answer is right in some parts and wrong in others. */
type Part = { text: string; ok?: boolean };
type Parts = { parts: Part[]; sep: string };

function yourAnswer(q: Question, a: Answer | undefined): Parts {
  const none = { parts: [{ text: "—" }], sep: "" };
  if (!a) return none;
  if (q.type === "numeric") return { parts: [{ text: a.frac ? `${a.frac[0]}/${a.frac[1]}` : (a.text ?? "—") }], sep: "" };
  if (!a.sel?.length) return none;
  const key = "sel" in q.key ? q.key.sel : [];
  if (q.type === "tc") return { parts: a.sel.map((v, i) => ({ text: v >= 0 ? (q.blanks?.[i]?.[v] ?? "—") : "—", ok: v === key[i] })), sep: " / " };
  if (q.type === "rc_select") return { parts: [{ text: `sentence ${a.sel[0] + 1}` }], sep: "" };
  if (q.type === "qc") return { parts: a.sel.map((i) => ({ text: L[i] })), sep: ", " };
  const multi = q.type === "se" || q.type === "rc_multi" || q.type === "mc_multi";
  return { parts: a.sel.map((i) => ({ text: `${L[i]}. ${q.choices?.[i] ?? ""}`, ok: multi ? key.includes(i) : undefined })), sep: "; " };
}

function keyText(q: Question): Parts {
  const k = q.key;
  if ("value" in k) return { parts: [{ text: k.value }], sep: "" };
  if (q.type === "tc") return { parts: k.sel.map((v, i) => ({ text: q.blanks?.[i]?.[v] ?? "" })), sep: " / " };
  if (q.type === "rc_select") return { parts: [{ text: `sentence ${k.sel[0] + 1}` }], sep: "" };
  if (q.type === "qc") return { parts: k.sel.map((i) => ({ text: L[i] })), sep: ", " };
  return { parts: k.sel.map((i) => ({ text: `${L[i]}. ${q.choices?.[i] ?? ""}` })), sep: "; " };
}

/** Answer text with its $math$ rendered; on a wrong multi-part answer each right part is green and each wrong one red. */
function AnswerText({ parts, sep }: Parts) {
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && sep}
          <span className={p.ok === undefined ? undefined : p.ok ? "text-ok" : "text-bad"}>
            <RichInline text={p.text} />
          </span>
        </span>
      ))}
    </>
  );
}

export default async function Review({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const db = await userDb();
  const { id, attemptId } = await params;
  const test = loadTest(id) as Test | null;
  const a = await getAttempt(Number(attemptId));
  if (!test || !a || a.testId !== id) redirect("/");
  const rows = new Map((await responsesFor(a.id)).map((r) => [r.questionId, r]));
  const visible = test.questions.filter((q) => canReveal(a, test, q, rows.get(pairKey(id, q.id))));
  const correct = visible.filter((q) => scoreAnswer(q, (rows.get(pairKey(id, q.id))?.answer ?? undefined) as Answer | undefined)).length;
  // definitions for every tagged word on the visible questions, and this attempt's "didn't know" tags
  const wordIds = [...new Set(visible.flatMap((q) => q.tags.filter((t) => t.kind === "word").map((t) => t.id)))];
  const vocabRows = wordIds.length
    ? await db.select({ id: schema.vocab.id, senses: schema.vocab.senses }).from(schema.vocab).where(inArray(schema.vocab.id, wordIds))
    : [];
  const sensesOf = new Map(vocabRows.map((v) => [v.id, v.senses as Sense[] | null]));
  const taggedRows = await db
    .select({ itemId: schema.itemEvents.itemId })
    .from(schema.itemEvents)
    .where(and(eq(schema.itemEvents.attemptId, a.id), eq(schema.itemEvents.event, "dont_know")));
  const taggedIds = new Set(taggedRows.map((r) => r.itemId));
  /** choice text -> vocab id, via the tag that sits on that choice */
  const wordIdFor = (q: Question, text: string) => {
    const at = (t: Question["tags"][number]) => (q.type === "tc" ? q.blanks?.[t.at?.[0] ?? -1]?.[t.at?.[1] ?? -1] : q.choices?.[t.at?.[0] ?? -1]);
    return q.tags.find((t) => t.kind === "word" && t.at && at(t) === text)?.id;
  };
  // deliberate revisits: where the earlier item lives (its latest finished review) and how it went there
  const revisitRefs = [...new Set(visible.flatMap((q) => (q.revisits ? [q.revisits] : [])))];
  const revisitTests = [...new Set(revisitRefs.map((r) => r.split(":")[0]))];
  const earlierAttempts = revisitTests.length
    ? await db
        .select({ id: schema.attempts.id, testId: schema.attempts.testId })
        .from(schema.attempts)
        .where(and(inArray(schema.attempts.testId, revisitTests), isNotNull(schema.attempts.finishedAt)))
        .orderBy(desc(schema.attempts.finishedAt))
    : [];
  const latestAttempt = new Map<string, number>();
  for (const e of earlierAttempts) if (!latestAttempt.has(e.testId)) latestAttempt.set(e.testId, e.id);
  const earlierRows = latestAttempt.size
    ? await db
        .select({ attemptId: schema.responses.attemptId, questionId: schema.responses.questionId, isCorrect: schema.responses.isCorrect, guessed: schema.responses.guessed })
        .from(schema.responses)
        .where(and(inArray(schema.responses.attemptId, [...latestAttempt.values()]), inArray(schema.responses.questionId, revisitRefs)))
    : [];
  const revisitOf = (ref: string) => {
    const [tid, qid] = ref.split(":");
    const t = loadTest(tid);
    const n = t ? t.questions.findIndex((x) => x.id === qid) + 1 : 0;
    const aid = latestAttempt.get(tid);
    const r = earlierRows.find((x) => x.attemptId === aid && x.questionId === ref);
    return { title: t?.title ?? tid, n, qid, href: aid ? `/test/${tid}/review/${aid}#q-${qid}` : undefined, how: r ? (!r.isCorrect ? "which you missed" : r.guessed ? "which you guessed" : "") : "" };
  };
  const waitingOn2 = !isClosed(a) && sectionStatus(a, 1).finished && !sectionStatus(a, 2).finished;
  // the clock runs negative past the limit; under a second over is rounding, not overtime
  const overBy = ([1, 2] as const).map((n) => ({ n, ms: sectionStatus(a, n).finished ? sectionOvertimeMs(a, test, n) : 0 })).filter((o) => o.ms >= 1000);

  const pct = visible.length ? Math.round((100 * correct) / visible.length) : 0;
  const results = visible.map((q) => ({ q, ok: scoreAnswer(q, (rows.get(pairKey(id, q.id))?.answer ?? undefined) as Answer | undefined) }));
  const guessedRight = results.filter(({ q, ok }) => ok && rows.get(pairKey(id, q.id))?.guessed).length;
  // an abandoned attempt shows its answers and keys, but is not a score
  const band = a.abandonedAt ? null : estimateBand(correct, guessedRight, visible.length);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <div className={`${card} space-y-4 p-5 sm:p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">
                {waitingOn2 ? "Section 1 review" : "Review"}
                {a.abandonedAt && <> · <span className={badge("muted")}>Abandoned</span></>}
              </p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{test.title}</h1>
            </div>
            <div className="text-right">
              <div className="font-mono text-3xl font-semibold tabular-nums">
                {correct}
                <span className="text-lg text-muted">/{visible.length}</span>
              </div>
              <div className="text-xs text-muted">{pct}% correct</div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm">
            Estimated score{" "}
            {band ? (
              <Explain why={bandWhy(band) + (a.timerOn ? "" : "\nTaken untimed, so expect lower under the clock.")}>
                <strong className="tabular-nums">~{bandText(band)}</strong>
              </Explain>
            ) : (
              <strong>-</strong>
            )}{" "}
            <span className="text-xs text-muted">(strict estimate, not an ETS conversion{guessedRight ? `; ${guessedRight} guessed right at half credit` : ""})</span>
          </p>
          {overBy.length > 0 && (
            <p className="flex flex-wrap items-center gap-1.5 text-sm">
              <Explain why={"The clock kept running after it reached zero. Answers given in overtime still count here; on the real exam the section would have closed at zero, so expect a lower score under the real clock."}>
                <span className={badge("bad")}>Over time</span>
              </Explain>
              <span className="tabular-nums text-muted">{overBy.map((o) => `Section ${o.n} +${mss(o.ms)}`).join(" · ")}</span>
            </p>
          )}
          {results.length > 0 && (
            <nav aria-label="Jump to question" className="flex flex-wrap gap-1.5">
              {results.map(({ q, ok }, i) => (
                <a
                  key={q.id}
                  href={`#q-${q.id}`}
                  aria-label={`Question ${i + 1}, ${ok ? "correct" : "incorrect"}`}
                  className={`grid size-8 place-items-center rounded-lg text-xs font-semibold tabular-nums transition-opacity hover:opacity-80 ${ok ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"}`}
                >
                  {i + 1}
                </a>
              ))}
            </nav>
          )}
          {waitingOn2 && (
            <Link className={`${btn("primary")} w-full sm:w-auto`} href={`/test/${id}/run?attempt=${a.id}`}>
              Continue to Section 2 <IconNext size={17} />
            </Link>
          )}
        </div>
        <p className="rounded-xl bg-warn-soft px-4 py-3 text-sm text-fg">Tap any word you did not know. It raises that word’s priority in your next test.</p>

        {visible.map((q, qi) => {
          const r = rows.get(pairKey(id, q.id));
          const ans = (r?.answer ?? undefined) as Answer | undefined;
          const ok = scoreAnswer(q, ans);
          const passage = q.passageId ? test.passages.find((p) => p.id === q.passageId) : undefined;
          const figure = q.figureId ? test.figures.find((f) => f.id === q.figureId) : undefined;
          const words = [...new Set(choiceWords(q))];
          const ex = q.explanation;
          return (
            <section key={q.id} id={`q-${q.id}`} className={`${card} scroll-mt-20 space-y-4 p-4 sm:p-5`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={badge(ok ? "ok" : "bad")}>
                  {ok ? <IconCheck size={13} /> : <IconX size={13} />}
                  {ok ? "Correct" : "Incorrect"}
                </span>
                <span className="text-sm font-semibold">Q{qi + 1}</span>
                <span className="text-sm text-muted">
                  S{q.section} · <Explain why={TYPE_INFO[slotType(q)].what}>{TYPE_INFO[slotType(q)].label}</Explain> · {q.id}
                  {skillOf(q) && <> · skill: {skillOf(q)}</>}
                </span>
                <span className="ml-auto text-xs tabular-nums text-muted">
                  {Math.round((r?.timeMs ?? 0) / 1000)}s{r?.guessed ? " · guessed" : ""} · <Explain why={levelWhy(q.difficulty)}>level {q.difficulty}</Explain>
                </span>
              </div>
              {q.revisits && (() => {
                const rv = revisitOf(q.revisits);
                return (
                  <p className="rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm">
                    <Explain why="A revisit keeps the idea of an earlier item you missed or guessed and changes how it is asked, so you practise the idea rather than recognise the question.">
                      <strong>Revisit</strong>
                    </Explain>{" "}
                    of {rv.title}, Q{rv.n} ({rv.qid}){rv.how ? `, ${rv.how}` : ""}.{" "}
                    {rv.href && <Link className="font-medium text-accent underline underline-offset-2" href={rv.href}>See that question</Link>}
                  </p>
                );
              })()}
              {passage && (
                <details className="group rounded-xl border border-line bg-surface-2/50">
                  <summary className="flex min-h-11 list-none items-center justify-between gap-2 px-3.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    Passage (tap words you didn’t know)
                    <IconNext size={16} className="text-muted transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-3.5 pb-3.5"><TaggablePassage paragraphs={passage.paragraphs} attemptId={a.id} initial={passage.tags.filter((t) => t.kind === "word" && taggedIds.has(t.id)).map((t) => t.id)} /></div>
                </details>
              )}
              {figure && <Figure fig={figure} />}
              {q.type === "qc" ? (
                <div className="space-y-2">
                  <Rich text={q.prompt} />
                  {q.qc && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl bg-surface-2 px-3 py-2"><span className="text-xs font-semibold text-muted">A</span> <RichInline text={q.qc.a} /></div>
                      <div className="rounded-xl bg-surface-2 px-3 py-2"><span className="text-xs font-semibold text-muted">B</span> <RichInline text={q.qc.b} /></div>
                    </div>
                  )}
                </div>
              ) : (
                <Rich text={q.prompt.replaceAll("___", "_____")} className="leading-relaxed" />
              )}
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div className={`rounded-xl px-3.5 py-2.5 ${ok ? "bg-ok-soft" : "bg-bad-soft"}`}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Your answer</dt>
                  <dd className={`font-medium ${ok ? "text-ok" : "text-bad"}`}><AnswerText {...yourAnswer(q, ans)} /></dd>
                </div>
                <div className="rounded-xl bg-ok-soft px-3.5 py-2.5">
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Key</dt>
                  <dd className="font-medium text-ok"><AnswerText {...keyText(q)} /></dd>
                </div>
              </dl>
              <div className="space-y-3 rounded-xl bg-surface-2 p-3.5 leading-relaxed sm:p-4">
                <Rich text={ex.key} />
                {ex.steps && <ol className="list-decimal space-y-1.5 pl-5 marker:text-muted">{ex.steps.map((s, i) => <li key={i}><Rich text={s} /></li>)}</ol>}
                {ex.fast && <p><strong>Faster:</strong> <RichInline text={ex.fast} /></p>}
                {ex.trap && <p><strong>Trap:</strong> <RichInline text={ex.trap} /></p>}
              </div>
              {ex.distractors && (
                <ul className="space-y-1.5 text-sm leading-snug">
                  {Object.entries(ex.distractors).map(([c, why]) => (
                    <li key={c}>
                      <strong>{c}</strong> <span className="text-muted"><RichInline text={why} /></span>
                    </li>
                  ))}
                </ul>
              )}
              {words.length > 0 && (
                <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                  {words.map((w) => {
                    const wid = wordIdFor(q, w);
                    return <WordChip key={w} word={w} attemptId={a.id} senses={wid ? sensesOf.get(wid) : undefined} tagged={!!wid && taggedIds.has(wid)} />;
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </>
  );
}

import Link from "next/link";
import { desc } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { conceptNames } from "@/lib/content";
import { matchCount } from "@/lib/search";
import { drillSummary } from "@/lib/drill";
import { isClosed, sectionStatus, type SectionState } from "@/lib/attempts";
import { loadTestById, testMetas, type TestMeta } from "@/lib/test-load";
import { bankQuestions } from "@/lib/bank";
import { isAway } from "@/lib/clock";
import { attemptNumbers, attemptTimeMs, fmtDuration, isListed } from "@/lib/attempt-summary";
import { bandText, estimateBand, isAnswered } from "@/lib/scoring";
import type { Answer } from "@/lib/types";
import { StartForm } from "@/components/StartForm";
import { TestSearch } from "@/components/TestSearch";
import { DiscardButton } from "@/components/DiscardButton";
import { AppHeader } from "@/components/AppHeader";
import { QuickMock } from "@/components/QuickMock";
import { IconNext, IconPlay, IconUndo } from "@/components/icons";
import { DraftReview, QuizDiscard, type FallbackLine } from "@/components/FallbackDialog";
import { badge, btn, card, eyebrow, seg, segItem } from "@/components/ui";

/** Rows are short and grouped by state, so a long run of mocks stays one screen: Done folds away. */
const row = "rounded-xl border p-3 sm:px-4";
const chevron = "text-muted transition-transform";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const db = await userDb();
  const { tab, q } = await searchParams;
  const measure = tab === "quant" ? "quant" : "verbal";
  const other = measure === "quant" ? "verbal" : "quant";
  const query = (q ?? "").trim();
  const tabHref = (m: string) => `/?tab=${m}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  const [metas, quizRows, allAttempts, rows] = await Promise.all([
    testMetas(db),
    db.select().from(schema.quizzes).orderBy(desc(schema.quizzes.createdAt)),
    db.select().from(schema.attempts).orderBy(desc(schema.attempts.startedAt)),
    db
      .select({ a: schema.responses.attemptId, qid: schema.responses.questionId, ok: schema.responses.isCorrect, g: schema.responses.guessed, fin: schema.responses.finalized, ans: schema.responses.answer })
      .from(schema.responses),
  ]);
  // abandoned attempts are not listed and take no number: each test counts its own attempts from 1
  const attempts = allAttempts.filter((a) => isListed(a) && metas.has(a.testId));
  const numberOf = attemptNumbers(attempts);
  const correct = new Map<number, number>();
  const guessed = new Map<number, number>();
  const answered = new Map<number, number>();
  // progress of an open attempt: a cleared choice or a half-filled completion is not an answer
  const openIds = new Set(attempts.filter((a) => !isClosed(a)).map((a) => a.id));
  const qByKey = await bankQuestions(rows.filter((r) => openIds.has(r.a)).map((r) => r.qid));
  for (const r of rows) {
    const qq = qByKey.get(r.qid);
    if (openIds.has(r.a) && qq && isAnswered(qq, (r.ans ?? undefined) as Answer | undefined)) answered.set(r.a, (answered.get(r.a) ?? 0) + 1);
  }
  // only finalized answers count: an exam section still open (or abandoned) has not been scored
  for (const r of rows) if (r.ok && r.fin) {
    correct.set(r.a, (correct.get(r.a) ?? 0) + 1);
    if (r.g) guessed.set(r.a, (guessed.get(r.a) ?? 0) + 1);
  }

  // endless vocab sits on the verbal tab, above the quizzes; a search is about quizzes, so it hides
  const drill = measure === "verbal" && !query ? await drillSummary() : null;

  type Attempt = typeof schema.attempts.$inferSelect;
  type View = { t: TestMeta; total: number; minutes: number; open?: Attempt; done: Attempt[]; latest?: Attempt };
  // a test is listed once it has an attempt (an untaken authored mock is bank stock now, not a row), and a quiz once it is made
  const testIds = new Set([...attempts.map((a) => a.testId), ...quizRows.filter((x) => x.status === "ready" || x.status === "draft").map((x) => `quiz-${x.id}`)]);
  const all: View[] = [...testIds].flatMap((id) => {
    const t = metas.get(id);
    if (!t) return [];
    const mine = attempts.filter((a) => a.testId === id);
    const done = mine.filter((a) => isClosed(a));
    return [{ t, total: t.total, minutes: t.minutes, open: mine.find((a) => !isClosed(a)), done, latest: done[0] }];
  });
  // a search keeps only tests with a matching question, across both measures so the other tab can be offered
  const hits = new Map<string, number>();
  if (query)
    for (const v of all) {
      const t = await loadTestById(db, v.t.id);
      const n = t ? matchCount(t, query, conceptNames) : 0;
      if (n) hits.set(v.t.id, n);
    }
  const views = all.filter((v) => v.t.measure === measure && (!query || hits.has(v.t.id)));
  const otherHits = query ? all.filter((v) => v.t.measure === other && hits.has(v.t.id)).length : 0;
  const quizOf = new Map(quizRows.map((x) => [`quiz-${x.id}`, x]));
  const inProgress = views.flatMap(({ open, ...v }) => (open ? [{ ...v, open }] : []));
  const ready = views.filter((v) => !v.open && !v.latest && ["ready", "draft"].includes(quizOf.get(v.t.id)?.status ?? ""));
  const finished = views.filter((v) => !v.open && v.latest).sort((x, y) => y.latest!.startedAt.getTime() - x.latest!.startedAt.getTime());

  // how many questions matched, not which: an untaken test is not spoiled
  const hit = (id: string) => {
    const n = hits.get(id);
    return n ? <span className={`${badge("accent")} ml-2 align-middle`}>{n} matching question{n === 1 ? "" : "s"}</span> : null;
  };

  const score = (a: Attempt, total: number, t: TestMeta) => {
    const c = correct.get(a.id) ?? 0;
    // a custom quiz is no mock: no score band
    const band = a.finishedAt && t.quizKind !== "custom" ? estimateBand(c, guessed.get(a.id) ?? 0, total) : null;
    return (
      <>
        <span className="font-mono font-semibold tabular-nums">
          {c}/{total}
        </span>
        {band && (
          <span className="text-xs tabular-nums text-muted" title="Strict score estimate; the review page shows how it is worked out">
            <span className="sm:hidden">~{band.mid}</span>
            <span className="hidden sm:inline">~{bandText(band)}</span>
          </span>
        )}
      </>
    );
  };

  const progressRow = ({ t, total, open }: View & { open: Attempt }) => {
    const resumeAt = sectionStatus(open, 1).finished ? 2 : 1;
    const clock = (open.sectionState as SectionState)[String(resumeAt)];
    const paused = isAway(clock) || clock?.pausedFor === "hold";
    const n = answered.get(open.id) ?? 0;
    return (
      <li key={t.id} className={`${row} space-y-2.5 border-warn/45 bg-warn-soft`}>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold leading-snug">{t.title}{hit(t.id)}</h2>
            <p className="text-sm text-muted">
              {paused && "Paused · "}
              <span className="capitalize">{open.mode}</span> · Section {resumeAt} · <span className="tabular-nums">{n}/{total}</span> answered
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link className={`${btn("primary", "sm")} flex-1 sm:flex-none`} href={`/test/${t.id}/run?attempt=${open.id}`}>
              Resume
              <IconNext size={16} />
            </Link>
            <DiscardButton attemptId={open.id} mode={open.mode as "exam" | "practice"} />
          </div>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface" aria-hidden>
          <div className="h-full rounded-full bg-warn" style={{ width: `${Math.round((100 * n) / total)}%` }} />
        </div>
      </li>
    );
  };

  // a ready quiz starts here or is discarded; a draft (the bank ran short) waits for Proceed in its dialog
  const readyRow = ({ t, total, minutes }: View) => {
    const quiz = quizOf.get(t.id)!;
    const draft = quiz.status === "draft";
    const untimed = (quiz.spec as { timer?: boolean }).timer === false;
    return (
      <li key={t.id} className={`${row} flex flex-col gap-2.5 border-line bg-surface sm:flex-row sm:items-center sm:gap-3`}>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold leading-snug">{t.title}{hit(t.id)}</h2>
          <p className="text-sm text-muted">
            {total} questions · {untimed ? "untimed" : `${minutes} min`}
            {draft && <> · <span className={badge("warn")}>{(quiz.fallbacks as FallbackLine[]).length} substitutes to confirm</span></>}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {draft ? <DraftReview quizId={quiz.id} fallbacks={quiz.fallbacks as FallbackLine[]} /> : <StartForm testId={t.id} timerOn={!untimed} />}
          {!draft && <QuizDiscard quizId={quiz.id} />}
        </div>
      </li>
    );
  };

  // every attempt shows its own score and opens its review (a quiz is taken once; a new one is assembled instead)
  const doneRow = ({ t, total, done }: View) => (
    <li key={t.id} className={`${row} space-y-2.5 border-line bg-surface`}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <h2 className="min-w-0 flex-1 font-semibold leading-snug">{t.title}{hit(t.id)}</h2>
      </div>
      <ul className="space-y-1">
        {done.map((a) => (
          <li key={a.id}>
            <Link href={`/test/${t.id}/review/${a.id}`} className="group flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2 text-sm transition-colors hover:bg-line/60">
              <span className="flex-1 text-muted">
                Attempt {numberOf.get(a.id)} · <span className="capitalize">{a.mode}</span> ·{" "}
                <span className="tabular-nums" title="Time on the section clocks, without pauses">{fmtDuration(attemptTimeMs(a))}</span>
              </span>
              {score(a, total, t)}
              <IconNext size={15} className={`${chevron} group-hover:translate-x-0.5`} />
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );

  return (
    <>
      <AppHeader active="tests" />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Your tests</h1>
          <nav className={`${seg} w-40 sm:w-56`} aria-label="Measure">
            {(["verbal", "quant"] as const).map((m) => (
              <Link key={m} href={tabHref(m)} aria-current={measure === m ? "page" : undefined} className={`${segItem(measure === m)} capitalize`}>
                {m}
              </Link>
            ))}
          </nav>
        </div>
        {!query && <QuickMock measure={measure} />}
        {drill && (drill.total > 0 || drill.misses > 0) && (
          <section className={`${row} flex flex-col gap-2.5 border-vocab-line bg-vocab-soft sm:flex-row sm:items-center sm:gap-3`}>
            <div className="min-w-0 flex-1">
              <h2 className="w-fit cursor-help font-semibold leading-snug" title="One question at a time, aimed at words you have not met">
                Endless vocab
              </h2>
              <p className="text-sm text-muted">
                {drill.left > 0 ? (
                  <>
                    <span className="tabular-nums">{drill.left}</span> {drill.left === 1 ? "question" : "questions"} ·{" "}
                    <span className="tabular-nums">{drill.untested}</span> untested words
                  </>
                ) : (
                  <>
                    All caught up · <span className="tabular-nums">{drill.untested}</span> untested words
                  </>
                )}
                {drill.misses > 0 && (
                  <>
                    {" "}
                    · <span className="tabular-nums">{drill.misses}</span> missed to replay
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2 sm:flex-none">
              {drill.misses > 0 && (
                <Link className={`${btn(drill.left > 0 ? "secondary" : "vocab", "sm")} max-sm:flex-1`} href="/drill?replay=1">
                  <IconUndo size={14} /> Replay misses
                </Link>
              )}
              {drill.left > 0 && (
                <Link className={`${btn("vocab", "sm")} max-sm:flex-1`} href="/drill">
                  <IconPlay size={14} /> Play
                </Link>
              )}
            </div>
          </section>
        )}
        {all.length > 0 && <TestSearch tab={measure} q={query} />}
        {views.length === 0 &&
          (query ? (
            <p className={`${card} p-6 text-center text-muted`}>
              No {measure} tests match “{query}”.
              {otherHits > 0 && (
                <>
                  {" "}
                  <Link href={tabHref(other)} className="inline-flex items-center gap-0.5 font-medium text-accent hover:underline">
                    {otherHits} {other} test{otherHits === 1 ? "" : "s"} match
                    <IconNext size={14} />
                  </Link>
                </>
              )}
            </p>
          ) : (
            <p className={`${card} p-6 text-center text-muted`}>
              No {measure} quizzes yet.{" "}
              <Link href={`/create?m=${measure}`} className="font-medium text-accent hover:underline">Make one</Link> from the question bank.
            </p>
          ))}
        {inProgress.length > 0 && (
          <section className="space-y-2">
            <h2 className={eyebrow}>In progress</h2>
            <ul className="space-y-2">{inProgress.map(progressRow)}</ul>
          </section>
        )}
        {ready.length > 0 && (
          <section className="space-y-2">
            <h2 className={eyebrow}>Ready</h2>
            <ul className="space-y-2">{ready.map(readyRow)}</ul>
          </section>
        )}
        {finished.length > 0 && (
          // folded away by default; open when there is nothing else to show, or when searching
          <details className="group/done space-y-2" open={!!query || inProgress.length + ready.length === 0}>
            <summary className={`${eyebrow} flex list-none items-center gap-1 hover:text-fg [&::-webkit-details-marker]:hidden`}>
              <IconNext size={14} className={`${chevron} group-open/done:rotate-90`} />
              Done · {finished.length}
            </summary>
            <ul className="space-y-2">{finished.map(doneRow)}</ul>
          </details>
        )}
      </main>
    </>
  );
}

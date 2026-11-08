import Link from "next/link";
import { desc } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { conceptNames, listTestIds, loadTest } from "@/lib/content";
import { matchCount } from "@/lib/search";
import { isClosed, pairKey, sectionStatus, type SectionState } from "@/lib/attempts";
import { isAway } from "@/lib/clock";
import { attemptNumbers, attemptTimeMs, fmtDuration, isListed } from "@/lib/attempt-summary";
import { bandText, estimateBand, isAnswered } from "@/lib/scoring";
import type { Answer, Question } from "@/lib/types";
import { StartForm } from "@/components/StartForm";
import { TestSearch } from "@/components/TestSearch";
import { DiscardButton } from "@/components/DiscardButton";
import { AppHeader } from "@/components/AppHeader";
import { IconNext } from "@/components/icons";
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
  // newest test first: ids are zero-padded, so a reversed sort is newest-first
  const all = listTestIds().reverse().map((id) => loadTest(id)!);
  // a search keeps only tests with a matching question, across both measures so the other tab can be offered
  const hits = new Map<string, number>();
  if (query) for (const t of all) {
    const n = matchCount(t, query, conceptNames);
    if (n) hits.set(t.id, n);
  }
  const tests = all.filter((t) => t.measure === measure && (!query || hits.has(t.id)));
  const otherHits = query ? all.filter((t) => t.measure === other && hits.has(t.id)).length : 0;
  const tabHref = (m: string) => `/?tab=${m}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  // abandoned attempts are not listed and take no number: each test counts its own attempts from 1
  const attempts = (await db.select().from(schema.attempts).orderBy(desc(schema.attempts.startedAt))).filter(isListed);
  const numberOf = attemptNumbers(attempts);
  const correct = new Map<number, number>();
  const guessed = new Map<number, number>();
  const answered = new Map<number, number>();
  const rows = await db
    .select({ a: schema.responses.attemptId, qid: schema.responses.questionId, ok: schema.responses.isCorrect, g: schema.responses.guessed, fin: schema.responses.finalized, ans: schema.responses.answer })
    .from(schema.responses);
  const qByKey = new Map<string, Question>();
  for (const t of tests) for (const q of t.questions) qByKey.set(pairKey(t.id, q.id), q);
  // progress of an open attempt: a cleared choice or a half-filled completion is not an answer
  for (const r of rows) {
    const q = qByKey.get(r.qid);
    if (q && isAnswered(q, (r.ans ?? undefined) as Answer | undefined)) answered.set(r.a, (answered.get(r.a) ?? 0) + 1);
  }
  // only finalized answers count: an exam section still open (or abandoned) has not been scored
  for (const r of rows) if (r.ok && r.fin) {
    correct.set(r.a, (correct.get(r.a) ?? 0) + 1);
    if (r.g) guessed.set(r.a, (guessed.get(r.a) ?? 0) + 1);
  }

  type Attempt = typeof schema.attempts.$inferSelect;
  const views = tests.map((t) => {
    const mine = attempts.filter((a) => a.testId === t.id);
    const open = mine.find((a) => !isClosed(a));
    const done = mine.filter((a) => isClosed(a));
    return {
      t,
      total: t.questions.length,
      minutes: t.sections.reduce((s, x) => s + x.minutes, 0),
      open,
      done,
      latest: done[0],
    };
  });
  type View = (typeof views)[number];
  const inProgress = views.flatMap(({ open, ...v }) => (open ? [{ ...v, open }] : []));
  const notStarted = views.filter((v) => !v.open && !v.latest);
  const finished = views.filter((v) => !v.open && v.latest);

  // how many questions matched, not which: an untaken test is not spoiled
  const hit = (id: string) => {
    const n = hits.get(id);
    return n ? <span className={`${badge("accent")} ml-2 align-middle`}>{n} matching question{n === 1 ? "" : "s"}</span> : null;
  };

  const score = (a: Attempt, total: number) => {
    const c = correct.get(a.id) ?? 0;
    const band = a.finishedAt ? estimateBand(c, guessed.get(a.id) ?? 0, total) : null;
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

  const newRow = ({ t, total, minutes }: View) => (
    <li key={t.id} className={`${row} flex flex-col gap-2.5 border-line bg-surface sm:flex-row sm:items-center sm:gap-3`}>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold leading-snug">{t.title}{hit(t.id)}</h2>
        <p className="text-sm text-muted">
          {total} questions · {minutes} min
        </p>
      </div>
      <StartForm testId={t.id} />
    </li>
  );

  // a finished test retakes from its title row; every attempt below shows its own score and opens its review
  const doneRow = ({ t, total, done }: View) => (
    <li key={t.id} className={`${row} space-y-2.5 border-line bg-surface`}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <h2 className="min-w-0 flex-1 font-semibold leading-snug">{t.title}{hit(t.id)}</h2>
        <StartForm testId={t.id} />
      </div>
      <ul className="space-y-1">
        {done.map((a) => (
          <li key={a.id}>
            <Link href={`/test/${t.id}/review/${a.id}`} className="group flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2 text-sm transition-colors hover:bg-line/60">
              <span className="flex-1 text-muted">
                Attempt {numberOf.get(a.id)} · <span className="capitalize">{a.mode}</span> ·{" "}
                <span className="tabular-nums" title="Time on the section clocks, without pauses">{fmtDuration(attemptTimeMs(a))}</span>
              </span>
              {score(a, total)}
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
          <nav className={`${seg} w-44 sm:w-56`} aria-label="Measure">
            {(["verbal", "quant"] as const).map((m) => (
              <Link key={m} href={tabHref(m)} aria-current={measure === m ? "page" : undefined} className={`${segItem(measure === m)} capitalize`}>
                {m}
              </Link>
            ))}
          </nav>
        </div>
        {all.length > 0 && <TestSearch tab={measure} q={query} />}
        {tests.length === 0 &&
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
            <p className={`${card} p-6 text-center text-muted`}>No {measure} tests yet. Ask Claude Code to run /new-test {measure}.</p>
          ))}
        {inProgress.length > 0 && (
          <section className="space-y-2">
            <h2 className={eyebrow}>In progress</h2>
            <ul className="space-y-2">{inProgress.map(progressRow)}</ul>
          </section>
        )}
        {notStarted.length > 0 && (
          <section className="space-y-2">
            <h2 className={eyebrow}>Not started</h2>
            <ul className="space-y-2">{notStarted.map(newRow)}</ul>
          </section>
        )}
        {finished.length > 0 && (
          // folded away by default; open when there is nothing else to show, or when searching
          <details className="group/done space-y-2" open={!!query || inProgress.length + notStarted.length === 0}>
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

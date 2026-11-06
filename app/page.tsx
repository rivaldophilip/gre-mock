import Link from "next/link";
import { desc } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { listTestIds, loadTest } from "@/lib/content";
import { isClosed, sectionStatus, type SectionState } from "@/lib/attempts";
import { isAway } from "@/lib/clock";
import { bandText, estimateBand } from "@/lib/scoring";
import { StartForm } from "@/components/StartForm";
import { DiscardButton } from "@/components/DiscardButton";
import { AppHeader } from "@/components/AppHeader";
import { IconNext } from "@/components/icons";
import { badge, btn, card, seg, segItem } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const db = await userDb();
  const { tab } = await searchParams;
  const measure = tab === "quant" ? "quant" : "verbal";
  const tests = listTestIds().map((id) => loadTest(id)!).filter((t) => t.measure === measure);
  const attempts = await db.select().from(schema.attempts).orderBy(desc(schema.attempts.startedAt));
  const correct = new Map<number, number>();
  const guessed = new Map<number, number>();
  const rows = await db
    .select({ a: schema.responses.attemptId, ok: schema.responses.isCorrect, g: schema.responses.guessed, fin: schema.responses.finalized })
    .from(schema.responses);
  // only finalized answers count: an exam section still open (or abandoned) has not been scored
  for (const r of rows) if (r.ok && r.fin) {
    correct.set(r.a, (correct.get(r.a) ?? 0) + 1);
    if (r.g) guessed.set(r.a, (guessed.get(r.a) ?? 0) + 1);
  }

  return (
    <>
      <AppHeader active="tests" />
      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your tests</h1>
            <p className="text-sm text-muted">Hard mocks built around the words and concepts you miss most.</p>
          </div>
          <nav className={`${seg} sm:w-56`} aria-label="Measure">
            {(["verbal", "quant"] as const).map((m) => (
              <Link key={m} href={`/?tab=${m}`} aria-current={measure === m ? "page" : undefined} className={`${segItem(measure === m)} capitalize`}>
                {m}
              </Link>
            ))}
          </nav>
        </div>
        {tests.length === 0 && (
          <p className={`${card} p-6 text-center text-muted`}>No {measure} tests yet. Ask Claude Code to run /new-test {measure}.</p>
        )}
        <ul className="space-y-4">
          {tests.map((t) => {
            const mine = attempts.filter((a) => a.testId === t.id);
            const open = mine.find((a) => !isClosed(a));
            const done = mine.filter((a) => isClosed(a));
            const total = t.questions.length;
            const minutes = t.sections.reduce((s, x) => s + x.minutes, 0);
            const resumeAt = open && sectionStatus(open, 1).finished ? 2 : 1;
            const pausedAway = !!open && isAway((open.sectionState as SectionState)[String(resumeAt)]);
            return (
              <li key={t.id} className={`${card} space-y-4 p-4 sm:p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold leading-snug">{t.title}</h2>
                    <p className="text-sm text-muted">
                      {total} questions · {t.sections.length} sections · {minutes} min
                    </p>
                  </div>
                  {open ? <span className={badge("warn")}>{pausedAway ? "Paused" : "In progress"}</span> : done.length ? <span className={badge("ok")}>Done</span> : <span className={badge("accent")}>New</span>}
                </div>
                {done.length > 0 && (
                  <ul className="space-y-1.5">
                    {done.map((a) => {
                      const c = correct.get(a.id) ?? 0;
                      const band = a.finishedAt ? estimateBand(c, guessed.get(a.id) ?? 0, total) : null;
                      return (
                        <li key={a.id}>
                          <Link href={`/test/${t.id}/review/${a.id}`} className="group flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-sm transition-colors hover:bg-line/60">
                            <span className="flex-1 text-muted">
                              Attempt {a.id} · <span className="capitalize">{a.mode}</span>
                              {!a.finishedAt && <> · <span className={badge("muted")}>Abandoned</span></>}
                            </span>
                            <span className="font-mono font-semibold tabular-nums">
                              {c}/{total}
                            </span>
                            {band && (
                              <span className="text-xs tabular-nums text-muted" title="Strict score estimate; the review page shows how it is worked out">
                                <span className="sm:hidden">~{band.mid}</span>
                                <span className="hidden sm:inline">~{bandText(band)}</span>
                              </span>
                            )}
                            <span className="h-1.5 w-12 overflow-hidden rounded-full bg-line" aria-hidden>
                              <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((100 * c) / total)}%` }} />
                            </span>
                            <IconNext size={16} className="text-muted transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {open ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link className={`${btn("primary")} w-full sm:w-auto`} href={`/test/${t.id}/run?attempt=${open.id}`}>
                      Resume Section {resumeAt}
                      <IconNext size={17} />
                    </Link>
                    <DiscardButton attemptId={open.id} mode={open.mode as "exam" | "practice"} />
                  </div>
                ) : (
                  <StartForm testId={t.id} />
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}

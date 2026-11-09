import Link from "next/link";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { listTestIds, loadStudy, loadTest } from "@/lib/content";
import { attemptNumbers } from "@/lib/attempt-summary";
import { LONG_MS, orderSections, studyStats, type Miss, type Tally } from "@/lib/study";
import { TYPE_INFO } from "@/lib/qtypes";
import type { Test } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { RichInline } from "@/components/Rich";
import { IconNext } from "@/components/icons";
import { PrintOpen } from "@/components/PrintOpen";
import { badge, card, eyebrow, seg, segItem } from "@/components/ui";

export const dynamic = "force-dynamic";

const MEASURES = [
  { id: "quant", label: "Quant" },
  { id: "verbal", label: "Verbal" },
] as const;

/** Sections open on load: the weakest few. */
const OPEN = 2;

/** "1:45" from milliseconds. */
const mss = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const pct = (t: Tally) => `${Math.round((100 * t.correct) / t.n)}%`;
const tone = (t?: Tally) => (!t || !t.n ? "muted" : t.correct / t.n < 0.5 ? "bad" : t.correct / t.n < 0.8 ? "warn" : "ok");

export default async function Study({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const measure = MEASURES.find((x) => x.id === m)?.id ?? "quant";
  const guide = loadStudy(measure);

  return (
    <>
      <AppHeader active="study" />
      <PrintOpen />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
            <p className="text-sm text-muted">Concepts, shortcuts and traps, ordered by what your mocks say to fix first.</p>
          </div>
          <nav className={`${seg} w-full sm:w-auto print:hidden`} aria-label="Measure">
            {MEASURES.map((x) => (
              <Link key={x.id} href={`/study?m=${x.id}`} scroll={false} aria-current={x.id === measure ? "page" : undefined} className={`${segItem(x.id === measure)} whitespace-nowrap`}>
                {x.label}
              </Link>
            ))}
          </nav>
        </div>
        {guide ? <Guide guide={guide} /> : (
          <div className={`${card} space-y-1 p-6 text-center`}>
            <p className="font-semibold">Coming soon</p>
            <p className="text-sm text-muted">The {measure} guide isn’t written yet.</p>
          </div>
        )}
      </main>
    </>
  );
}

async function Guide({ guide }: { guide: NonNullable<ReturnType<typeof loadStudy>> }) {
  const db = await userDb();
  const [attempts, responses] = await Promise.all([db.select().from(schema.attempts), db.select().from(schema.responses)]);
  const tests = new Map(listTestIds().flatMap((id): [string, Test][] => {
    const t = loadTest(id);
    return t && t.measure === guide.measure ? [[id, t]] : [];
  }));
  const stats = studyStats(guide, attempts, responses, tests);
  const numberOf = attemptNumbers(attempts);
  const sections = orderSections(guide.sections, stats.sections);
  const { overall, pacing } = stats;
  const formats = guide.formats.map((f) => ({ ...f, t: stats.formats.get(f.type) }));

  return (
    <>
      <p className="max-w-2xl text-sm leading-relaxed"><RichInline text={guide.intro} /></p>

      <section className="space-y-3">
        <h2 className="font-semibold">Where you are</h2>
        {overall.n === 0 ? (
          <p className="text-sm text-muted">No finished {guide.measure} mock yet. Every section below is in the default order until you finish one.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={`${card} space-y-1 p-4`}>
              <div className={eyebrow}>Accuracy</div>
              <div className="font-mono text-2xl font-semibold tabular-nums">
                {overall.correct}<span className="text-base text-muted">/{overall.n}</span> <span className="text-base">{pct(overall)}</span>
              </div>
              <div className="text-xs text-muted">{overall.tests} finished mock{overall.tests === 1 ? "" : "s"}; a 170 needs about 0–2 misses</div>
            </div>
            <div className={`${card} space-y-2 p-4`}>
              <div className={eyebrow}>By format</div>
              <ul className="space-y-1 text-sm">
                {formats.filter((f) => f.t).map((f) => (
                  <li key={f.type} className="flex items-center justify-between gap-2">
                    <span className="truncate">{f.title}</span>
                    <span className={badge(tone(f.t))}>{f.t!.correct}/{f.t!.n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${card} space-y-1.5 p-4 text-sm`}>
              <div className={eyebrow}>Time</div>
              <p><span className="font-mono font-semibold tabular-nums">{mss(pacing.hitMs)}</span> <span className="text-muted">avg on hits ·</span> <span className="font-mono font-semibold tabular-nums">{mss(pacing.missMs)}</span> <span className="text-muted">on misses</span></p>
              {pacing.long > 0 && <p><span className="font-semibold tabular-nums">{pacing.longRight}/{pacing.long}</span> <span className="text-muted">right when you spent over {LONG_MS / 60_000} min</span></p>}
              {pacing.guessed > 0 && <p><span className="font-semibold tabular-nums">{pacing.guessedRight}/{pacing.guessed}</span> <span className="text-muted">guesses right</span></p>}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3 break-inside-avoid">
        <h2 className="font-semibold">Formula quick-ref</h2>
        <div className={`${card} grid gap-x-8 gap-y-5 p-4 sm:grid-cols-2 sm:p-5`}>
          {guide.quickRef.map((g) => (
            <div key={g.title} className="space-y-1.5 break-inside-avoid">
              <div className={eyebrow}>{g.title}</div>
              <ul className="space-y-1 text-sm leading-relaxed">
                {g.lines.map((l, i) => <li key={i}><RichInline text={l} /></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Topics</h2>
          <p className="text-sm text-muted">Weakest first, by your accuracy on questions tagged with each topic’s concepts.</p>
        </div>
        <div className="space-y-2">
          {sections.map((s, i) => {
            const t = stats.sections.get(s.id)!;
            return (
              <details key={s.id} className={`${card} group break-inside-avoid`} open={i < OPEN && t.n > 0}>
                <summary className="flex min-h-14 list-none items-center gap-3 px-4 [&::-webkit-details-marker]:hidden">
                  <IconNext size={16} className="shrink-0 text-muted transition-transform group-open:rotate-90 print:hidden" />
                  <span className="flex-1 font-semibold">{s.title}</span>
                  {t.n > 0 && <span className="hidden text-xs tabular-nums text-muted sm:inline">avg {mss(t.avgMs)}</span>}
                  <span className={badge(tone(t))}>{t.n ? `${t.correct}/${t.n}` : "not tested yet"}</span>
                </summary>
                <div className="space-y-4 border-t border-line px-4 py-4">
                  <Block label="Know cold" lines={s.facts} />
                  <Block label="Shortcuts" lines={s.tricks} />
                  <Block label="Traps" lines={s.traps} tone="bad" />
                  {t.misses.length > 0 && <Misses misses={t.misses} numberOf={numberOf} />}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Format playbooks</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {formats.map((f) => (
            <div key={f.type} className={`${card} space-y-2 p-4 break-inside-avoid`}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{f.title}</h3>
                {f.t && <span className={badge(tone(f.t))}>{f.t.correct}/{f.t.n}</span>}
              </div>
              {f.t && (
                <p className="text-xs text-muted tabular-nums">
                  avg {mss(f.t.avgMs)} per question · target {mss(TYPE_INFO[f.type].paceSec * 1000)}
                </p>
              )}
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed marker:text-muted">
                {f.rules.map((r, i) => <li key={i}><RichInline text={r} /></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 break-inside-avoid">
        <h2 className="font-semibold">Pacing for a 170</h2>
        <div className={`${card} p-4`}>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-muted">
            {guide.pacing.map((p, i) => <li key={i}><RichInline text={p} /></li>)}
          </ul>
        </div>
      </section>
    </>
  );
}

function Block({ label, lines, tone }: { label: string; lines: string[]; tone?: "bad" }) {
  return (
    <div className="space-y-1.5">
      <div className={`${eyebrow} ${tone === "bad" ? "text-bad" : ""}`}>{label}</div>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-muted">
        {lines.map((l, i) => <li key={i}><RichInline text={l} /></li>)}
      </ul>
    </div>
  );
}

function Misses({ misses, numberOf }: { misses: Miss[]; numberOf: Map<number, number> }) {
  return (
    <div className="space-y-1.5 print:hidden">
      <div className={eyebrow}>Your misses · {misses.length}</div>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {misses.map((x) => {
          const n = numberOf.get(x.attemptId) ?? 1;
          const [, sec, q] = /^s(\d+)q(\d+)$/.exec(x.qid) ?? [];
          return (
            <li key={`${x.attemptId}:${x.qid}`} className="space-y-1 px-3.5 py-2.5 text-sm">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link href={`/test/${x.testId}/review/${x.attemptId}#q-${x.qid}`} className="font-medium text-accent underline-offset-4 hover:underline">
                  {x.testId}{n > 1 ? ` (attempt ${n})` : ""} · {sec ? `S${sec} Q${q}` : x.qid}
                </Link>
                <span className="text-xs text-muted">{TYPE_INFO[x.type].label} · level {x.difficulty} · {mss(x.timeMs)}{x.guessed ? " · guessed" : ""}</span>
              </div>
              {x.trap && <p className="text-muted"><RichInline text={x.trap} /></p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { listTestIds, loadStudy, loadTest } from "@/lib/content";
import { attemptNumbers } from "@/lib/attempt-summary";
import { LONG_MS, orderSections, studyStats, type Miss, type Tally } from "@/lib/study";
import { TYPE_INFO } from "@/lib/qtypes";
import type { Test } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { RichInline, Tex } from "@/components/Rich";
import { IconNext } from "@/components/icons";
import { PrintOpen } from "@/components/PrintOpen";
import { OpenOnHash } from "@/components/OpenOnHash";
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
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const chip = "inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-fg transition-colors hover:bg-surface-2";
const DOT = { bad: "bg-bad", warn: "bg-warn", ok: "bg-ok", muted: "bg-line" } as const;
const tone = (t?: Tally): keyof typeof DOT => (!t || !t.n ? "muted" : t.correct / t.n < 0.5 ? "bad" : t.correct / t.n < 0.8 ? "warn" : "ok");

export default async function Study({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const measure = MEASURES.find((x) => x.id === m)?.id ?? "quant";
  const guide = loadStudy(measure);

  return (
    <>
      <AppHeader active="study" />
      <PrintOpen />
      <OpenOnHash />
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
      <div className="space-y-3">
        <p className="max-w-2xl text-[15px] leading-relaxed"><RichInline text={guide.intro} /></p>
        <nav aria-label="On this page" className="flex flex-wrap gap-1.5 print:hidden">
          {[["formulas", "Formula sheet"], ["topics", "Topics"], ["formats", "Question types"], ["pacing", "Pacing"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className={chip}>{label}</a>
          ))}
        </nav>
      </div>

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

      <section id="formulas" className="scroll-mt-20 space-y-4">
        <div className="space-y-2">
          <div>
            <h2 className="font-semibold">Formula sheet</h2>
            <p className="text-sm text-muted">Every formula you need, one per card.</p>
          </div>
          <nav aria-label="Formula groups" className="flex flex-wrap gap-1.5 print:hidden">
            {guide.quickRef.map((g) => (
              <a key={g.title} href={`#f-${slug(g.title)}`} className={chip}>{g.title}</a>
            ))}
          </nav>
        </div>
        {guide.quickRef.map((g) => (
          <div key={g.title} id={`f-${slug(g.title)}`} className="scroll-mt-20 space-y-2">
            <h3 className={eyebrow}>{g.title}</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => (
                <div key={it.name} className={`${card} flex flex-col gap-1.5 p-3.5 break-inside-avoid`}>
                  <div className="text-xs font-medium text-muted"><RichInline text={it.name} /></div>
                  <div className="overflow-x-auto overflow-y-hidden py-0.5 text-[1.15rem] leading-snug"><Tex tex={it.tex} /></div>
                  {it.note && <div className="text-xs leading-relaxed text-muted"><RichInline text={it.note} /></div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="topics" className="scroll-mt-20 space-y-3">
        <div className="space-y-2">
          <div>
            <h2 className="font-semibold">Topics</h2>
            <p className="text-sm text-muted">Weakest first, based on how you did on each topic’s questions. Tap one to open it.</p>
          </div>
          <nav aria-label="Topics" className="flex flex-wrap gap-1.5 print:hidden">
            {sections.map((s) => {
              const t = stats.sections.get(s.id)!;
              return (
                <a key={s.id} href={`#t-${s.id}`} className={`${chip} gap-1.5`}>
                  <span className={`size-2 rounded-full ${DOT[tone(t)]}`} aria-hidden />
                  {s.title}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="space-y-2">
          {sections.map((s, i) => {
            const t = stats.sections.get(s.id)!;
            return (
              <details key={s.id} id={`t-${s.id}`} className={`${card} group scroll-mt-20`} open={i < OPEN && t.n > 0}>
                <summary className="flex min-h-14 list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
                  <IconNext size={16} className="shrink-0 text-muted transition-transform group-open:rotate-90 print:hidden" />
                  <span className="flex-1 font-semibold">{s.title}</span>
                  {t.misses.length > 0 && <span className="hidden text-xs tabular-nums text-muted sm:inline">{t.misses.length} missed</span>}
                  <span className={badge(tone(t))}>{t.n ? `${t.correct}/${t.n} right` : "not tested yet"}</span>
                </summary>
                <div className="space-y-5 border-t border-line p-4 sm:p-5">
                  <p className="rounded-xl bg-accent-soft px-4 py-3 text-[15px] leading-relaxed">
                    <span className="font-semibold text-accent">Big idea: </span>
                    <RichInline text={s.idea} />
                  </p>
                  <Example q={s.example.q} steps={s.example.steps} />
                  <Block label="Rules to remember" lines={s.facts} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Block label="Shortcuts" lines={s.tricks} tone="ok" />
                    <Block label="Watch out" lines={s.traps} tone="bad" />
                  </div>
                  {t.misses.length > 0 && <Misses misses={t.misses} numberOf={numberOf} />}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section id="formats" className="scroll-mt-20 space-y-3">
        <h2 className="font-semibold">Question types</h2>
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
              <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed marker:text-muted">
                {f.rules.map((r, i) => <li key={i}><RichInline text={r} /></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="pacing" className="scroll-mt-20 space-y-3 break-inside-avoid">
        <h2 className="font-semibold">Pacing for a 170</h2>
        <div className={`${card} p-4`}>
          <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed marker:text-muted">
            {guide.pacing.map((p, i) => <li key={i}><RichInline text={p} /></li>)}
          </ul>
        </div>
      </section>
    </>
  );
}

function Block({ label, lines, tone }: { label: string; lines: string[]; tone?: "ok" | "bad" }) {
  const color = tone === "bad" ? "text-bad" : tone === "ok" ? "text-ok" : "";
  const marker = tone === "bad" ? "marker:text-bad" : tone === "ok" ? "marker:text-ok" : "marker:text-muted";
  return (
    <div className="space-y-2">
      <h3 className={`${eyebrow} ${color}`}>{label}</h3>
      <ul className={`list-disc space-y-2 pl-5 text-[15px] leading-relaxed ${marker}`}>
        {lines.map((l, i) => <li key={i}><RichInline text={l} /></li>)}
      </ul>
    </div>
  );
}

function Example({ q, steps }: { q: string; steps: string[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="space-y-1 border-b border-line bg-surface-2 px-4 py-3">
        <h3 className={eyebrow}>Worked example</h3>
        <p className="text-[15px] font-medium leading-relaxed"><RichInline text={q} /></p>
      </div>
      <ol className="space-y-2.5 px-4 py-3.5">
        {steps.map((st, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">{i + 1}</span>
            <span><RichInline text={st} /></span>
          </li>
        ))}
      </ol>
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

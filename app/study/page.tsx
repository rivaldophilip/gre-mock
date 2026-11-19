import Link from "next/link";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { listTestIds, loadStudy, loadTest } from "@/lib/content";
import { attemptNumbers } from "@/lib/attempt-summary";
import { eq } from "drizzle-orm";
import { applyMarks, cardId, LONG_MS, orderSections, studyStats, type Mark, type MarkKind, type Miss, type Study, type StudySection, type Tally } from "@/lib/study";
import { TYPE_INFO } from "@/lib/qtypes";
import type { Test } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { RichInline, Tex } from "@/components/Rich";
import { IconNext } from "@/components/icons";
import { PrintOpen } from "@/components/PrintOpen";
import { OpenOnHash } from "@/components/OpenOnHash";
import { StudyMark } from "@/components/StudyMark";
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
  const [attempts, responses, markRows] = await Promise.all([
    db.select().from(schema.attempts),
    db.select().from(schema.responses),
    db.select().from(schema.studyMarks).where(eq(schema.studyMarks.measure, guide.measure)),
  ]);
  const tests = new Map(listTestIds().flatMap((id): [string, Test][] => {
    const t = loadTest(id);
    return t && t.measure === guide.measure ? [[id, t]] : [];
  }));
  const stats = studyStats(guide, attempts, responses, tests);
  const numberOf = attemptNumbers(attempts);
  const marks = (kind: MarkKind) => new Map(markRows.filter((r) => r.kind === kind).map((r): [string, Mark] => [r.itemId, { state: r.state as Mark["state"], updatedAt: r.updatedAt }]));
  const cards = applyMarks(guide.quickRef.flatMap((g) => g.items.map((it) => ({ ...it, group: g.title, id: cardId(g.title, it.name) }))), (c) => c.id, marks("card"));
  const groups = guide.quickRef.map((g) => ({ title: g.title, items: cards.shown.filter((c) => c.group === g.title) })).filter((g) => g.items.length);
  const topics = applyMarks(orderSections(guide.sections, stats.sections), (s) => s.id, marks("topic"), (s, since) =>
    stats.sections.get(s.id)!.misses.some((x) => x.finishedAt > since));
  const sections = topics.shown;
  const topicProps = { measure: guide.measure, stats: stats.sections, numberOf };
  const { overall, pacing } = stats;
  const formats = guide.formats.map((f) => ({ ...f, t: stats.formats.get(f.type) }));
  const sheet = guide.measure === "quant"
    ? { title: "Formula sheet", sub: "Every formula you need, one per card." }
    : { title: "Cheat sheet", sub: "Every move you need, one per card." };

  return (
    <>
      <div className="space-y-3">
        <p className="max-w-2xl text-[15px] leading-relaxed"><RichInline text={guide.intro} /></p>
        <nav aria-label="On this page" className="flex flex-wrap gap-1.5 print:hidden">
          {[["formulas", sheet.title], ["topics", "Topics"], ["formats", "Question types"], ["pacing", "Pacing"]].map(([id, label]) => (
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
            <h2 className="font-semibold">{sheet.title}</h2>
            <p className="text-sm text-muted">{sheet.sub}</p>
          </div>
          <nav aria-label={`${sheet.title} groups`} className="flex flex-wrap gap-1.5 print:hidden">
            {groups.map((g) => (
              <a key={g.title} href={`#f-${slug(g.title)}`} className={chip}>{g.title}</a>
            ))}
          </nav>
        </div>
        {groups.length === 0 && <p className="text-sm text-muted">Every card is archived or removed.</p>}
        {groups.map((g) => (
          <div key={g.title} id={`f-${slug(g.title)}`} className="scroll-mt-20 space-y-2">
            <h3 className={eyebrow}>{g.title}</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => <FormulaCard key={it.id} measure={guide.measure} card={it} />)}
            </div>
          </div>
        ))}
        {cards.archived.length > 0 && (
          <Shelf label={`Archived cards · ${cards.archived.length}`}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cards.archived.map((it) => <FormulaCard key={it.id} measure={guide.measure} card={it} state="archived" />)}
            </div>
          </Shelf>
        )}
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
          {sections.length === 0 && <p className="text-sm text-muted">Every topic is archived or removed.</p>}
          {sections.map((s, i) => (
            <Topic key={s.id} s={s} {...topicProps} open={i < OPEN && stats.sections.get(s.id)!.n > 0} back={topics.back.has(s.id)} />
          ))}
        </div>
        {topics.archived.length > 0 && (
          <Shelf label={`Archived topics · ${topics.archived.length}`}>
            <p className="text-sm text-muted">Studied and folded away. One comes back up top if a later mock misses it.</p>
            <div className="space-y-2">
              {topics.archived.map((s) => <Topic key={s.id} s={s} {...topicProps} state="archived" />)}
            </div>
          </Shelf>
        )}
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

      {cards.deleted.length + topics.deleted.length > 0 && (
        <Shelf label={`Removed · ${cards.deleted.length + topics.deleted.length}`}>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {topics.deleted.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-3.5 py-2 text-sm">
                <span className="flex-1"><span className="text-muted">Topic · </span>{s.title}</span>
                <StudyMark measure={guide.measure} kind="topic" id={s.id} state="deleted" compact />
              </li>
            ))}
            {cards.deleted.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3.5 py-2 text-sm">
                <span className="flex-1"><span className="text-muted">{c.group} · </span><RichInline text={c.name} /></span>
                <StudyMark measure={guide.measure} kind="card" id={c.id} state="deleted" compact />
              </li>
            ))}
          </ul>
        </Shelf>
      )}
    </>
  );
}

/** A folded group at the end of a section: archived or removed items, kept out of the way and out of print. */
function Shelf({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group space-y-3 print:hidden">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted hover:text-fg [&::-webkit-details-marker]:hidden">
        <IconNext size={14} className="transition-transform group-open:rotate-90" />
        {label}
      </summary>
      <div className="space-y-3 pt-1">{children}</div>
    </details>
  );
}

type Card = Study["quickRef"][number]["items"][number] & { id: string };

function FormulaCard({ measure, card: it, state }: { measure: Study["measure"]; card: Card; state?: Mark["state"] }) {
  return (
    <div className={`${card} flex flex-col gap-1.5 p-3.5 break-inside-avoid ${state ? "opacity-70" : ""}`}>
      <div className="-mr-1.5 -mt-1.5 flex items-start gap-2">
        <div className="flex-1 pt-1.5 text-xs font-medium text-muted"><RichInline text={it.name} /></div>
        <StudyMark measure={measure} kind="card" id={it.id} state={state} compact />
      </div>
      {it.tex
        ? <div className="overflow-x-auto overflow-y-hidden py-0.5 text-[1.15rem] leading-snug"><Tex tex={it.tex} /></div>
        : <div className="text-[15px] font-medium leading-snug"><RichInline text={it.text!} /></div>}
      {it.note && <div className="text-xs leading-relaxed text-muted"><RichInline text={it.note} /></div>}
    </div>
  );
}

function Topic({ s, measure, stats, numberOf, open, back, state }: {
  s: StudySection;
  measure: Study["measure"];
  stats: Map<string, Tally & { misses: Miss[] }>;
  numberOf: Map<number, number>;
  open?: boolean;
  back?: boolean;
  state?: Mark["state"];
}) {
  const t = stats.get(s.id)!;
  return (
    <details id={`t-${s.id}`} className={`${card} group scroll-mt-20`} open={open}>
      <summary className="flex min-h-14 list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
        <IconNext size={16} className="shrink-0 text-muted transition-transform group-open:rotate-90 print:hidden" />
        <span className="flex-1 font-semibold">{s.title}</span>
        {back && <span className={badge("warn")} title="You archived this topic, then a later mock missed it">missed since archived</span>}
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
        {s.tips && <Tips tips={s.tips} />}
        {s.patterns?.map((p) => <Pattern key={p.title} pattern={p} />)}
        {t.misses.length > 0 && <Misses misses={t.misses} numberOf={numberOf} />}
        <div className="flex justify-end border-t border-line pt-4">
          <StudyMark measure={measure} kind="topic" id={s.id} state={state} />
        </div>
      </div>
    </details>
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

function Tips({ tips }: { tips: NonNullable<StudySection["tips"]> }) {
  return (
    <div className="space-y-2">
      <h3 className={eyebrow}>Tips &amp; tricks</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {tips.map((t) => (
          <li key={t.title} className="flex flex-col gap-2 rounded-xl border border-line p-3.5 break-inside-avoid">
            <span className="font-semibold leading-snug"><RichInline text={t.title} /></span>
            {t.svg && <div className="flex justify-center rounded-lg bg-surface-2 p-2 text-fg [&>svg]:h-auto [&>svg]:max-h-44 [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: t.svg }} />}
            <p className="text-[15px] leading-relaxed"><RichInline text={t.text} /></p>
            {t.example && <p className="text-sm leading-relaxed"><span className="font-semibold text-accent">Example: </span><RichInline text={t.example} /></p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pattern({ pattern }: { pattern: NonNullable<StudySection["patterns"]>[number] }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className={eyebrow}>{pattern.title}</h3>
        <p className="text-[15px] leading-relaxed"><RichInline text={pattern.idea} /></p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {pattern.cases.map((c, i) => (
          <li key={c.name} className="space-y-2 rounded-xl border border-line p-3.5 break-inside-avoid">
            <div className="flex gap-2.5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">{i + 1}</span>
              <span className="font-semibold leading-snug">{c.name}</span>
            </div>
            <p className="text-[15px] font-medium leading-relaxed"><RichInline text={c.q} /></p>
            <p className="text-sm leading-relaxed"><span className="font-semibold text-accent">Spot it: </span><RichInline text={c.spot} /></p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed marker:text-muted">
              {c.steps.map((st, j) => <li key={j}><RichInline text={st} /></li>)}
            </ul>
          </li>
        ))}
      </ol>
      {pattern.notWhen && <Block label="Not this method" lines={pattern.notWhen} tone="bad" />}
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

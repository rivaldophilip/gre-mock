import Link from "next/link";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { loadStudy } from "@/lib/content";
import { bankQuestions } from "@/lib/bank";
import { testMetas } from "@/lib/test-load";
import { qAnchor } from "@/lib/ref";
import { attemptNumbers } from "@/lib/attempt-summary";
import { eq } from "drizzle-orm";
import { applyMarks, cardId, LONG_MS, orderSections, pieceId, studyStats, topicCards, type Mark, type MarkKind, type Miss, type Study, type StudySection, type Tally } from "@/lib/study";
import { TYPE_INFO } from "@/lib/qtypes";
import { AppHeader } from "@/components/AppHeader";
import { RichInline, Tex } from "@/components/Rich";
import { IconNext } from "@/components/icons";
import { PrintOpen } from "@/components/PrintOpen";
import { OpenOnHash } from "@/components/OpenOnHash";
import { StudyMark } from "@/components/StudyMark";
import { Card, cardSummary, cardTag, TopicCards } from "@/components/study/TopicCards";
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
  const tests = new Map([...(await testMetas(db))].filter(([, t]) => t.measure === guide.measure));
  const mine = new Set(attempts.filter((a) => tests.has(a.testId) && a.finishedAt).map((a) => a.id));
  const items = await bankQuestions(responses.filter((r) => mine.has(r.attemptId)).map((r) => r.questionId));
  const stats = studyStats(guide, attempts, responses, tests, items);
  const titleOf = new Map([...tests].map(([id, t]) => [id, t.kind === "quiz" ? t.title : id]));
  const numberOf = attemptNumbers(attempts);
  const marks = (kind: MarkKind) => new Map(markRows.filter((r) => r.kind === kind).map((r): [string, Mark] => [r.itemId, { state: r.state as Mark["state"], updatedAt: r.updatedAt }]));
  const cards = applyMarks(guide.quickRef.flatMap((g) => g.items.map((it) => ({ ...it, group: g.title, id: cardId(g.title, it.name) }))), (c) => c.id, marks("card"));
  const groups = guide.quickRef.map((g) => ({ title: g.title, intro: g.intro, svg: g.svg, items: cards.shown.filter((c) => c.group === g.title) })).filter((g) => g.items.length);
  const sections = orderSections(guide.sections, stats.sections);
  const pieceMarks = marks("piece");
  const split = new Map(sections.map((s) => [s.id, topicCards(s, pieceMarks, stats.sections.get(s.id)!.misses)]));
  const removed = sections.flatMap((s) => split.get(s.id)!.deleted.map((c) => ({ s, c })));
  const { overall, pacing } = stats;
  const formats = guide.formats.map((f) => ({ ...f, t: stats.formats.get(f.type) }));
  const sheet = guide.measure === "quant"
    ? { title: "Formula sheet", sub: "Every formula you need, one per card." }
    : { title: "Cheat sheet", sub: "Every move you need, one per card." };
  const hasSheet = guide.quickRef.length > 0;

  return (
    <>
      <div className="space-y-3">
        <p className="max-w-2xl text-[15px] leading-relaxed"><RichInline text={guide.intro} /></p>
        <nav aria-label="On this page" className="flex flex-wrap gap-1.5 print:hidden">
          {[...(hasSheet ? [["formulas", sheet.title]] : []), ["topics", "Topics"], ["formats", "Question types"], ["pacing", "Pacing"]].map(([id, label]) => (
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

      {hasSheet && <section id="formulas" className="scroll-mt-20 space-y-4">
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
            {(g.intro || g.svg) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {g.svg && <div className="flex shrink-0 justify-center rounded-lg bg-surface-2 p-2 text-fg [&>svg]:h-auto [&>svg]:max-h-44 [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: g.svg }} />}
                {g.intro && <p className="max-w-xl text-[15px] leading-relaxed"><RichInline text={g.intro} /></p>}
              </div>
            )}
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
      </section>}

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
          {sections.map((s, i) => (
            <Topic key={s.id} s={s} measure={guide.measure} t={stats.sections.get(s.id)!} split={split.get(s.id)!} numberOf={numberOf} titleOf={titleOf} open={i < OPEN && stats.sections.get(s.id)!.n > 0} />
          ))}
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

      {cards.deleted.length + removed.length > 0 && (
        <Shelf label={`Removed · ${cards.deleted.length + removed.length}`}>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {removed.map(({ s, c }) => (
              <li key={pieceId(s.id, c.id)} className="flex items-center gap-3 px-3.5 py-2 text-sm">
                <span className="line-clamp-2 min-w-0 flex-1"><span className="text-muted">{s.title} · {cardTag(c, s)} · </span><RichInline text={cardSummary(c)} /></span>
                <StudyMark measure={guide.measure} kind="piece" id={pieceId(s.id, c.id)} state="deleted" />
              </li>
            ))}
            {cards.deleted.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3.5 py-2 text-sm">
                <span className="flex-1"><span className="text-muted">{c.group} · </span><RichInline text={c.name} /></span>
                <StudyMark measure={guide.measure} kind="card" id={c.id} state="deleted" />
              </li>
            ))}
          </ul>
        </Shelf>
      )}
    </>
  );
}

/** A folded group: archived or removed items, or a topic's misses, kept out of the way and out of print. */
function Shelf({ label, open, children }: { label: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="group/shelf space-y-3 print:hidden" open={open}>
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted hover:text-fg [&::-webkit-details-marker]:hidden">
        <IconNext size={14} className="transition-transform group-open/shelf:rotate-90" />
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
        <StudyMark measure={measure} kind="card" id={it.id} state={state} />
      </div>
      {it.tex
        ? <div className="overflow-x-auto overflow-y-hidden py-0.5 text-[1.15rem] leading-snug"><Tex tex={it.tex} /></div>
        : <div className="text-[15px] font-medium leading-snug"><RichInline text={it.text!} /></div>}
      {it.note && <div className="text-xs leading-relaxed text-muted"><RichInline text={it.note} /></div>}
      {it.svg && <div className="mt-1 flex justify-center rounded-lg bg-surface-2 p-2 text-fg [&>svg]:h-auto [&>svg]:max-h-36 [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: it.svg }} />}
    </div>
  );
}

function Topic({ s, measure, t, split, numberOf, titleOf, open }: {
  s: StudySection;
  measure: Study["measure"];
  t: Tally & { misses: Miss[] };
  split: ReturnType<typeof topicCards>;
  numberOf: Map<number, number>;
  titleOf: Map<string, string>;
  open?: boolean;
}) {
  const { shown, archived, back, fresh, missedSince } = split;
  const total = shown.length + archived.length;
  return (
    <details id={`t-${s.id}`} className={`${card} group scroll-mt-20`} open={open}>
      <summary className="flex min-h-14 list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
        <IconNext size={16} className="shrink-0 text-muted transition-transform group-open:rotate-90 print:hidden" />
        <span className="flex-1 font-semibold">{s.title}</span>
        {missedSince && <span className={badge("warn")} title="A mock finished after you archived some of these cards missed this topic">missed since studied</span>}
        {fresh.size > 0 && <span className={badge("accent")} title="Cards added after you last studied this topic">{fresh.size} new</span>}
        {archived.length > 0 && (shown.length === 0
          ? <span className={badge("ok")}>all studied</span>
          : <span className="hidden text-xs tabular-nums text-muted sm:inline">{archived.length}/{total} studied</span>)}
        {t.misses.length > 0 && <span className="hidden text-xs tabular-nums text-muted sm:inline">{t.misses.length} missed</span>}
        <span className={badge(tone(t))}>{t.n ? `${t.correct}/${t.n} right` : "not tested yet"}</span>
      </summary>
      <div className="space-y-5 border-t border-line p-4 sm:p-5">
        {total === 0 && <p className="text-sm text-muted">Every card here is removed. Restore them from “Removed” at the bottom of the page.</p>}
        {total > 0 && shown.length === 0 && <p className="text-sm text-muted">Everything here is studied. The archived cards are below.</p>}
        <TopicCards s={s} measure={measure} shown={shown} back={back} fresh={fresh} />
        {archived.length > 0 && (
          <Shelf label={`Archived · ${archived.length}`} open={missedSince}>
            <div className="grid gap-2 sm:grid-cols-2">
              {archived.map((c) => <Card key={c.id} s={s} measure={measure} c={c} state="archived" tag={cardTag(c, s)} />)}
            </div>
          </Shelf>
        )}
        {t.misses.length > 0 && <Misses misses={t.misses} numberOf={numberOf} titleOf={titleOf} />}
      </div>
    </details>
  );
}

function Misses({ misses, numberOf, titleOf }: { misses: Miss[]; numberOf: Map<number, number>; titleOf: Map<string, string> }) {
  return (
    <Shelf label={`Your misses · ${misses.length}`}>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {misses.map((x) => {
          const n = numberOf.get(x.attemptId) ?? 1;
          const [, sec, q] = /^s(\d+)q(\d+)$/.exec(x.qid) ?? [];
          return (
            <li key={`${x.attemptId}:${x.qid}`} className="space-y-1 px-3.5 py-2.5 text-sm">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link href={`/test/${x.testId}/review/${x.attemptId}#${qAnchor(x.ref)}`} className="font-medium text-accent underline-offset-4 hover:underline">
                  {titleOf.get(x.testId) ?? x.testId}{n > 1 ? ` (attempt ${n})` : ""} · {x.testId.startsWith("quiz-") ? x.ref.replace(":", " ") : sec ? `S${sec} Q${q}` : x.qid}
                </Link>
                <span className="text-xs text-muted">{TYPE_INFO[x.type].label} · level {x.difficulty} · {mss(x.timeMs)}{x.guessed ? " · guessed" : ""}</span>
              </div>
              {x.trap && <p className="text-muted"><RichInline text={x.trap} /></p>}
            </li>
          );
        })}
      </ul>
    </Shelf>
  );
}

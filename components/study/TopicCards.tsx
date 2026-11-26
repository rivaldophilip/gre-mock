import { isTile, KIND_LABEL, LANES, pieceId, type Mark, type StudyCard, type StudyPattern, type StudySection } from "@/lib/study";
import { RichInline, Tex } from "@/components/Rich";
import { StudyMark } from "@/components/StudyMark";
import { badge, eyebrow } from "@/components/ui";

type Measure = "verbal" | "quant";
type Of<K extends StudyCard["kind"]> = Extract<StudyCard, { kind: K }>;
/** Per-card flags the page works out: archived or deleted, back from the archive on a miss, or written since the reader studied the topic. */
interface Flags {
  state?: Mark["state"];
  back?: boolean;
  fresh?: boolean;
  /** shown outside its lane (a shelf), so it names its kind */
  tag?: string;
}

const figure = "flex justify-center rounded-lg bg-surface-2 p-2 text-fg [&>svg]:h-auto [&>svg]:max-h-44 [&>svg]:max-w-full";
const tile = "flex min-w-0 flex-col gap-2 rounded-xl border border-line p-3.5 break-inside-avoid";
const NAME = { rule: "text-muted", shortcut: "text-ok", trap: "text-bad", limit: "text-bad" } as const;
const EDGE = { shortcut: "border-l-[3px] border-l-ok", trap: "border-l-[3px] border-l-bad", limit: "border-l-[3px] border-l-bad" } as const;
const Svg = ({ svg }: { svg?: string }) => (svg ? <div className={figure} dangerouslySetInnerHTML={{ __html: svg }} /> : null);

/** A topic's shown cards: one lane per kind in LANES order (empty lanes drop out), then each pattern with its cases and limits. */
export function TopicCards({ s, measure, shown, back, fresh }: { s: StudySection; measure: Measure; shown: StudyCard[]; back: Set<string>; fresh: Set<string> }) {
  const flags = (c: StudyCard): Flags => ({ back: back.has(c.id), fresh: fresh.has(c.id) });
  const lanes = LANES.map((l) => ({ ...l, cards: shown.filter((c) => c.kind === l.kind) })).filter((l) => l.cards.length);
  const patterns = (s.patterns ?? []).map((p) => ({ p, cards: shown.filter((c): c is Of<"case"> | Of<"limit"> => (c.kind === "case" || c.kind === "limit") && c.pattern === p.id) })).filter((x) => x.cards.length);
  return (
    <>
      {lanes.map((l) => (
        <div key={l.kind} className="space-y-2">
          {l.kind !== "idea" && <h3 className={`${eyebrow} ${l.kind === "shortcut" ? "text-ok" : l.kind === "trap" ? "text-bad" : ""}`}>{l.label}</h3>}
          <div className={l.kind === "idea" || l.kind === "example" ? "space-y-2" : l.kind === "contrast" ? "grid gap-2 sm:grid-cols-2" : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"}>
            {l.cards.map((c) => <Card key={c.id} s={s} measure={measure} c={c} {...flags(c)} />)}
          </div>
        </div>
      ))}
      {patterns.map(({ p, cards }) => <Pattern key={p.id} s={s} measure={measure} p={p} cards={cards} flags={flags} />)}
    </>
  );
}

function Pattern({ s, measure, p, cards, flags }: { s: StudySection; measure: Measure; p: StudyPattern; cards: (Of<"case"> | Of<"limit">)[]; flags: (c: StudyCard) => Flags }) {
  const cases = cards.filter((c) => c.kind === "case");
  const limits = cards.filter((c) => c.kind === "limit");
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className={eyebrow}>{p.title}</h3>
        <p className="text-[15px] leading-relaxed"><RichInline text={p.idea} /></p>
      </div>
      {cases.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => <Card key={c.id} s={s} measure={measure} c={c} {...flags(c)} />)}
        </div>
      )}
      {limits.length > 0 && (
        <div className="space-y-2">
          <h4 className={`${eyebrow} text-bad`}>Not this method</h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {limits.map((c) => <Card key={c.id} s={s} measure={measure} c={c} {...flags(c)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/** The corner every card shares: optional kind tag and badges, then archive / delete (or restore). */
function Corner({ s, measure, c, state, back, fresh, tag, children }: Flags & { s: StudySection; measure: Measure; c: StudyCard; children?: React.ReactNode }) {
  return (
    <div className="-mr-1.5 -mt-1.5 flex items-start gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 pt-1">
        {tag && <span className={eyebrow}>{tag}</span>}
        {children}
        {back && <span className={badge("warn")} title="You archived this card, then a later mock missed this kind of question">missed since studied</span>}
        {fresh && <span className={badge("accent")} title="Added after you last studied this topic">new</span>}
      </div>
      <StudyMark measure={measure} kind="piece" id={pieceId(s.id, c.id)} state={state} />
    </div>
  );
}

/** One topic card, drawn by kind. */
export function Card({ s, measure, c, ...f }: Flags & { s: StudySection; measure: Measure; c: StudyCard }) {
  const dim = f.state ? "opacity-70" : "";
  const corner = (children?: React.ReactNode) => <Corner s={s} measure={measure} c={c} {...f}>{children}</Corner>;
  switch (c.kind) {
    case "idea":
      return (
        <div className={`space-y-1 rounded-xl bg-accent-soft px-4 py-3 ${dim}`}>
          {corner(<span className="text-xs font-medium text-accent">Big idea</span>)}
          <p className="text-[15px] leading-relaxed"><RichInline text={c.text} /></p>
        </div>
      );
    case "example":
      return (
        <div className={`overflow-hidden rounded-xl border border-line ${dim}`}>
          <div className="space-y-1 border-b border-line bg-surface-2 px-4 py-3">
            {corner(<span className={eyebrow}>Worked example</span>)}
            <p className="text-[15px] font-medium leading-relaxed"><RichInline text={c.q} /></p>
          </div>
          <Svg svg={c.svg} />
          <ol className="space-y-2.5 px-4 py-3.5">
            {c.steps.map((st, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">{i + 1}</span>
                <span><RichInline text={st} /></span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "contrast":
      return (
        <div className={`${tile} ${dim}`}>
          {corner()}
          <p className="text-[15px] font-medium leading-snug"><RichInline text={c.q} /></p>
          <p className="text-sm leading-relaxed"><span className="font-semibold text-ok">{c.label}: </span><RichInline text={c.answer} /></p>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-bad">Looks right, but isn’t</div>
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed marker:text-bad">
              {c.wrong.map((w) => <li key={w.text}><span className="italic"><RichInline text={w.text} /></span> <span className="text-muted"><RichInline text={w.why} /></span></li>)}
            </ul>
          </div>
        </div>
      );
    case "case":
      return (
        <div className={`${tile} ${dim}`}>
          {corner(<span className="text-xs font-medium text-muted">{c.name}</span>)}
          <p className="text-[15px] font-medium leading-snug"><RichInline text={c.q} /></p>
          <Svg svg={c.svg} />
          <p className="text-xs leading-relaxed"><span className="font-semibold text-accent">Spot it: </span><RichInline text={c.spot} /></p>
          <ul className="list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-muted marker:text-muted">
            {c.steps.map((st, j) => <li key={j}><RichInline text={st} /></li>)}
          </ul>
        </div>
      );
    default:
      // rule, shortcut, trap, limit: drawn like a formula card
      return (
        <div className={`${tile} gap-1.5 ${EDGE[c.kind as keyof typeof EDGE] ?? ""} ${dim}`}>
          {corner(<span className={`text-xs font-medium ${NAME[c.kind]}`}><RichInline text={c.name} /></span>)}
          {c.tex
            ? <div className="overflow-x-auto overflow-y-hidden py-0.5 text-[1.15rem] leading-snug"><Tex tex={c.tex} /></div>
            : <div className="text-[15px] font-medium leading-snug"><RichInline text={c.text!} /></div>}
          {c.note && <div className="text-xs leading-relaxed text-muted"><RichInline text={c.note} /></div>}
          {c.example && <div className="text-xs leading-relaxed"><span className="font-semibold text-accent">e.g. </span><RichInline text={c.example} /></div>}
          {c.svg && <div className={`mt-1 ${figure} [&>svg]:max-h-36`} dangerouslySetInnerHTML={{ __html: c.svg }} />}
        </div>
      );
  }
}

/** A short line naming a card, for the Removed list. */
export const cardSummary = (c: StudyCard) =>
  c.kind === "case" || isTile(c) ? c.name : c.kind === "example" || c.kind === "contrast" ? c.q : c.text;

export const cardTag = (c: StudyCard, s: StudySection) =>
  c.kind === "case" || c.kind === "limit" ? `${s.patterns?.find((p) => p.id === c.pattern)?.title ?? ""} · ${KIND_LABEL[c.kind]}` : KIND_LABEL[c.kind];

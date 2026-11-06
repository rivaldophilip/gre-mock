import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { loadTest } from "@/lib/content";
import { canReveal, getAttempt, pairKey, responsesFor, sectionStatus } from "@/lib/attempts";
import { roughBand, scoreAnswer } from "@/lib/scoring";
import type { Answer, Question, Test } from "@/lib/types";
import { Rich, RichInline } from "@/components/Rich";
import { Figure } from "@/components/Figure";
import { TaggablePassage, WordChip, type Sense } from "@/components/WordTagger";

export const dynamic = "force-dynamic";
const L = "ABCDEFGHIJ";

function choiceWords(q: Question): string[] {
  if (q.type === "tc") return q.blanks?.flat() ?? [];
  if (q.type === "se") return q.choices ?? [];
  return [];
}

function yourAnswer(q: Question, a: Answer | undefined): string {
  if (!a) return "—";
  if (q.type === "numeric") return a.frac ? `${a.frac[0]}/${a.frac[1]}` : (a.text ?? "—");
  if (!a.sel?.length) return "—";
  if (q.type === "tc") return a.sel.map((v, i) => (v >= 0 ? q.blanks?.[i]?.[v] : "—")).join(" / ");
  if (q.type === "rc_select") return `sentence ${a.sel[0] + 1}`;
  if (q.type === "qc") return a.sel.map((i) => L[i]).join(", ");
  return a.sel.map((i) => `${L[i]}. ${q.choices?.[i] ?? ""}`).join("; ");
}

function keyText(q: Question): string {
  const k = q.key;
  if ("value" in k) return k.value;
  if (q.type === "tc") return k.sel.map((v, i) => q.blanks?.[i]?.[v]).join(" / ");
  if (q.type === "rc_select") return `sentence ${k.sel[0] + 1}`;
  if (q.type === "qc") return k.sel.map((i) => L[i]).join(", ");
  return k.sel.map((i) => `${L[i]}. ${q.choices?.[i] ?? ""}`).join("; ");
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
  const waitingOn2 = !a.finishedAt && sectionStatus(a, 1).finished && !sectionStatus(a, 2).finished;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{test.title} — review</h1>
        <Link href="/" className="underline">Dashboard</Link>
      </header>
      <p>
        <strong>{correct}/{visible.length}</strong> correct · rough band {roughBand(correct, visible.length)} <span className="text-xs opacity-60">(not an ETS conversion)</span>
      </p>
      {waitingOn2 && <Link className="inline-block rounded bg-blue-600 px-3 py-1 text-white" href={`/test/${id}/run?attempt=${a.id}`}>Continue to Section 2</Link>}
      <p className="text-sm opacity-70">Tap any word you did not know — it raises that word’s priority in your next test.</p>

      {visible.map((q) => {
        const r = rows.get(pairKey(id, q.id));
        const ans = (r?.answer ?? undefined) as Answer | undefined;
        const ok = scoreAnswer(q, ans);
        const passage = q.passageId ? test.passages.find((p) => p.id === q.passageId) : undefined;
        const figure = q.figureId ? test.figures.find((f) => f.id === q.figureId) : undefined;
        const words = [...new Set(choiceWords(q))];
        const ex = q.explanation;
        return (
          <section key={q.id} id={`q-${q.id}`} className={`space-y-3 rounded-lg border-l-4 border p-4 ${ok ? "border-l-green-600" : "border-l-red-500"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold">S{q.section} · {q.type.toUpperCase()} · {q.id}</span>
              <span>{ok ? "✓ correct" : "✗ incorrect"} · {Math.round((r?.timeMs ?? 0) / 1000)}s{r?.guessed ? " · guessed" : ""} · level {q.difficulty}</span>
            </div>
            {passage && (
              <details className="rounded border p-3">
                <summary className="cursor-pointer text-sm font-medium">Passage (tap words you didn’t know)</summary>
                <div className="mt-2"><TaggablePassage paragraphs={passage.paragraphs} attemptId={a.id} initial={passage.tags.filter((t) => t.kind === "word" && taggedIds.has(t.id)).map((t) => t.id)} /></div>
              </details>
            )}
            {figure && <Figure fig={figure} />}
            {q.type === "qc" ? (
              <div className="space-y-1"><Rich text={q.prompt} />{q.qc && <p><strong>A:</strong> <RichInline text={q.qc.a} /> &nbsp; <strong>B:</strong> <RichInline text={q.qc.b} /></p>}</div>
            ) : (
              <Rich text={q.prompt.replaceAll("___", "_____")} />
            )}
            <p className="text-sm">Your answer: <strong>{yourAnswer(q, ans)}</strong> · Key: <strong className="text-green-600">{keyText(q)}</strong></p>
            <Rich text={ex.key} className="rounded bg-black/5 p-3 dark:bg-white/5" />
            {ex.steps && <ol className="list-decimal space-y-1 pl-5">{ex.steps.map((s, i) => <li key={i}><Rich text={s} /></li>)}</ol>}
            {ex.fast && <p><strong>Faster:</strong> <RichInline text={ex.fast} /></p>}
            {ex.trap && <p><strong>Trap:</strong> <RichInline text={ex.trap} /></p>}
            {ex.distractors && (
              <ul className="space-y-1 text-sm">
                {Object.entries(ex.distractors).map(([c, why]) => (
                  <li key={c}><strong>{c}</strong>: <RichInline text={why} /></li>
                ))}
              </ul>
            )}
            {words.length > 0 && (
              <div className="grid gap-2 pt-1 sm:grid-cols-2">
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
  );
}

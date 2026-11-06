import Link from "next/link";
import { db, schema } from "@/lib/db";
import { scoreAll, type LoggedEvent } from "@/lib/priority/compute";
import { SenseLine, type Sense } from "@/components/WordTagger";

export const dynamic = "force-dynamic";

export default async function Stats() {
  const [vocab, concepts, events, resp, attempts, qs, qitems] = await Promise.all([
    db().select().from(schema.vocab),
    db().select().from(schema.concepts),
    db().select().from(schema.itemEvents),
    db().select().from(schema.responses),
    db().select().from(schema.attempts),
    db().select().from(schema.questions),
    db().select().from(schema.questionItems),
  ]);
  const vmap = new Map(vocab.map((v) => [v.id, v]));
  const now = new Date();
  const ev = (kind: string): LoggedEvent[] => events.filter((e) => e.kind === kind).map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt }));
  const ws = scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield })), ev("word"), now);
  const cs = scoreAll(concepts.map((c) => ({ id: c.id, yield: c.yield })), ev("concept"), now);
  const weakWords = ws.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).slice(0, 25);
  const weakConcepts = cs.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P).slice(0, 15);
  const cname = new Map(concepts.map((c) => [c.id, c]));
  const covW = { tested: ws.filter((s) => s.C >= 1).length, exposed: ws.filter((s) => s.C > 0 && s.C < 1).length, untested: ws.filter((s) => s.C === 0).length };
  const covC = { tested: cs.filter((s) => s.C >= 1).length, exposed: cs.filter((s) => s.C > 0 && s.C < 1).length, untested: cs.filter((s) => s.C === 0).length };

  const qmap = new Map(qs.map((q) => [q.id, q]));
  const byType = new Map<string, { n: number; ok: number; ms: number }>();
  for (const r of resp) {
    if (!r.finalized) continue;
    const t = qmap.get(r.questionId)?.type ?? "?";
    const s = byType.get(t) ?? { n: 0, ok: 0, ms: 0 };
    s.n++;
    s.ok += r.isCorrect ? 1 : 0;
    s.ms += r.timeMs;
    byType.set(t, s);
  }

  // accuracy by concept area, through each question's primary concept
  const primaryOf = new Map(qitems.filter((i) => i.kind === "concept" && i.role === "primary").map((i) => [i.questionId, i.itemId]));
  const byArea = new Map<string, { n: number; ok: number }>();
  for (const r of resp) {
    if (!r.finalized) continue;
    const area = cname.get(primaryOf.get(r.questionId) ?? "")?.area;
    if (!area) continue;
    const s = byArea.get(area) ?? { n: 0, ok: 0 };
    s.n++;
    s.ok += r.isCorrect ? 1 : 0;
    byArea.set(area, s);
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 p-6">
      <header className="flex items-baseline justify-between"><h1 className="text-2xl font-semibold">Stats</h1><Link href="/" className="underline">Dashboard</Link></header>

      <section><h2 className="mb-2 font-semibold">Coverage</h2>
        <p className="text-sm">Words — tested {covW.tested} · exposed {covW.exposed} · untested {covW.untested} (of {vocab.length})</p>
        <p className="text-sm">Concepts — tested {covC.tested} · exposed {covC.exposed} · untested {covC.untested} (of {concepts.length})</p>
      </section>

      <section><h2 className="mb-2 font-semibold">Weakest words</h2>
        {weakWords.length === 0 ? <p className="text-sm opacity-70">No weakness evidence yet.</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left"><th>Word</th><th>Priority</th><th>Weakness</th><th>Why</th></tr></thead><tbody>
            {weakWords.map((s) => <tr key={s.itemId} className="border-t"><td className="py-1"><strong>{vmap.get(s.itemId)?.lemma ?? s.itemId}</strong><br /><SenseLine senses={vmap.get(s.itemId)?.senses as Sense[] | null} /></td><td>{s.P.toFixed(2)}</td><td>{s.S.toFixed(2)}</td><td>{s.reason}</td></tr>)}
          </tbody></table>)}
      </section>

      <section><h2 className="mb-2 font-semibold">Weakest concepts</h2>
        {weakConcepts.length === 0 ? <p className="text-sm opacity-70">No weakness evidence yet.</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left"><th>Concept</th><th>Area</th><th>Priority</th><th>Why</th></tr></thead><tbody>
            {weakConcepts.map((s) => <tr key={s.itemId} className="border-t"><td>{cname.get(s.itemId)?.name ?? s.itemId}</td><td>{cname.get(s.itemId)?.area}</td><td>{s.P.toFixed(2)}</td><td>{s.reason}</td></tr>)}
          </tbody></table>)}
      </section>

      <section><h2 className="mb-2 font-semibold">Accuracy and time by question type</h2>
        <table className="w-full text-sm"><thead><tr className="text-left"><th>Type</th><th>Answered</th><th>Accuracy</th><th>Avg time</th></tr></thead><tbody>
          {[...byType.entries()].map(([t, s]) => <tr key={t} className="border-t"><td>{t}</td><td>{s.n}</td><td>{Math.round((100 * s.ok) / s.n)}%</td><td>{Math.round(s.ms / s.n / 1000)}s</td></tr>)}
        </tbody></table>
      </section>

      {byArea.size > 0 && (
        <section><h2 className="mb-2 font-semibold">Quant accuracy by concept area</h2>
          <table className="w-full text-sm"><thead><tr className="text-left"><th>Area</th><th>Answered</th><th>Accuracy</th></tr></thead><tbody>
            {[...byArea.entries()].map(([t, s]) => <tr key={t} className="border-t capitalize"><td>{t}</td><td>{s.n}</td><td>{Math.round((100 * s.ok) / s.n)}%</td></tr>)}
          </tbody></table>
        </section>
      )}

      <section><h2 className="mb-2 font-semibold">Attempt history</h2>
        <ul className="space-y-1 text-sm">{[...attempts].reverse().map((a) => <li key={a.id}><Link className="underline" href={`/test/${a.testId}/review/${a.id}`}>#{a.id} {a.testId}</Link> · {a.mode} · {a.finishedAt ? "finished" : "in progress"} · {a.startedAt.toISOString().slice(0, 10)}</li>)}</ul>
      </section>
    </main>
  );
}

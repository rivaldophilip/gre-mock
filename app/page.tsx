import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { listTestIds, loadTest } from "@/lib/content";
import { StartForm } from "@/components/StartForm";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const measure = tab === "quant" ? "quant" : "verbal";
  const tests = listTestIds().map((id) => loadTest(id)!).filter((t) => t.measure === measure);
  const attempts = await db().select().from(schema.attempts).orderBy(desc(schema.attempts.startedAt));
  const correct = new Map<number, number>();
  const rows = await db().select({ a: schema.responses.attemptId, ok: schema.responses.isCorrect }).from(schema.responses);
  for (const r of rows) if (r.ok) correct.set(r.a, (correct.get(r.a) ?? 0) + 1);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">GRE Hard Mocks</h1>
        <Link href="/stats" className="underline">Stats</Link>
      </header>
      <nav className="flex gap-4 border-b">
        {(["verbal", "quant"] as const).map((m) => (
          <Link key={m} href={`/?tab=${m}`} className={`px-2 py-2 capitalize ${measure === m ? "border-b-2 border-blue-600 font-semibold" : "opacity-60"}`}>{m}</Link>
        ))}
      </nav>
      {tests.length === 0 && <p className="opacity-70">No {measure} tests yet. Ask Claude Code to run /new-test {measure}.</p>}
      <ul className="space-y-4">
        {tests.map((t) => {
          const mine = attempts.filter((a) => a.testId === t.id);
          const open = mine.find((a) => !a.finishedAt);
          const done = mine.filter((a) => a.finishedAt);
          const total = t.questions.length;
          return (
            <li key={t.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">{t.title}</h2>
                <span className="text-sm opacity-70">{open ? "in progress" : done.length ? "done" : "new"} · {total} questions</span>
              </div>
              {done.map((a) => (
                <div key={a.id} className="text-sm">
                  <Link className="underline" href={`/test/${t.id}/review/${a.id}`}>
                    Attempt {a.id}: {correct.get(a.id) ?? 0}/{total} ({a.mode})
                  </Link>
                </div>
              ))}
              {open ? (
                <Link className="inline-block rounded bg-blue-600 px-3 py-1 text-sm text-white" href={`/test/${t.id}/run?attempt=${open.id}`}>Resume</Link>
              ) : (
                <StartForm testId={t.id} />
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

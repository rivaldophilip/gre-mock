import { redirect } from "next/navigation";
import { loadTest, publicTest } from "@/lib/content";
import { canReveal, getAttempt, pairKey, responsesFor, secondsLeft } from "@/lib/attempts";
import { Runner } from "@/components/Runner";

export const dynamic = "force-dynamic";

export default async function Run({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ attempt?: string }> }) {
  const { id } = await params;
  const { attempt } = await searchParams;
  const test = loadTest(id);
  const a = attempt ? await getAttempt(Number(attempt)) : null;
  if (!test || !a || a.testId !== id) redirect("/");
  if (a.finishedAt) redirect(`/test/${id}/review/${a.id}`);

  const rows = await responsesFor(a.id);
  const byQ = new Map(rows.map((r) => [r.questionId, r]));
  const initial: Record<string, { answer: never; guessed: boolean; marked: boolean; timeMs: number; finalized: boolean }> = {};
  const reveals: Record<string, { key: unknown; explanation: unknown; isCorrect: boolean }> = {};
  for (const q of test.questions) {
    const r = byQ.get(pairKey(id, q.id));
    if (!r) continue;
    initial[q.id] = { answer: r.answer as never, guessed: r.guessed, marked: r.marked, timeMs: r.timeMs, finalized: r.finalized };
    if (a.mode === "practice" && r.finalized && canReveal(a, test, q, r)) reveals[q.id] = { key: q.key, explanation: q.explanation, isCorrect: r.isCorrect };
  }
  return (
    <Runner
      test={publicTest(test)}
      attemptId={a.id}
      mode={a.mode as "exam" | "practice"}
      timerOn={a.timerOn}
      sectionState={a.sectionState as never}
      secondsLeft={{ "1": secondsLeft(a, test, 1), "2": secondsLeft(a, test, 2) }}
      initial={initial}
      reveals={reveals as never}
      position={a.currentPosition}
    />
  );
}

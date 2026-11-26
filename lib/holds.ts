// Which bank items a user has seen and which are held (docs/BANK.md). Pure, so the rules are tested without a
// database: lib/quiz.ts and lib/drill.ts feed it rows.
//   seen: any response with the item's ref, in any attempt.
//   held: the items of a quiz that is ready or started, and of a source (a mock) with an open exam or practice attempt.
// Neither may be put in a new quiz or served by the drill; only the fallback ladder reuses seen items.
import type { Layout } from "./virtual-test";

export type QuizRow = { id: number; status: string; layout: unknown };
export type AttemptRow = { testId: string; mode: string; finishedAt: Date | null; abandonedAt: Date | null };

/** Quiz statuses whose items are held. */
export const HOLDING = new Set(["ready", "started"]);

export function heldRefs(quizzes: QuizRow[], attempts: AttemptRow[], refsOfSource: (sourceId: string) => string[], except?: number): Set<string> {
  const out = new Set<string>();
  for (const q of quizzes) {
    if (!HOLDING.has(q.status) || q.id === except) continue;
    for (const s of (q.layout as Layout).sections) for (const i of s.items) out.add(i.ref);
  }
  // a drill or replay attempt stays open and spans one item at a time: it holds nothing
  for (const a of attempts) {
    if (a.finishedAt || a.abandonedAt || a.mode === "drill" || a.mode === "replay" || a.testId.startsWith("quiz-")) continue;
    for (const r of refsOfSource(a.testId)) out.add(r);
  }
  return out;
}

export const seenRefs = (responses: { questionId: string }[]) => new Set(responses.map((r) => r.questionId));

/**
 * The latest locked answer to each ref (wrong, blank or guessed counts as missed), the way the miss pool reads them:
 * what ladder steps 4-6 reuse.
 */
export function latestResults(answers: { questionId: string; isCorrect: boolean; guessed: boolean; updatedAt: Date; id: number }[]) {
  const latest = new Map<string, (typeof answers)[number]>();
  for (const a of answers) {
    const was = latest.get(a.questionId);
    if (!was || was.updatedAt < a.updatedAt || (+was.updatedAt === +a.updatedAt && was.id < a.id)) latest.set(a.questionId, a);
  }
  return new Map([...latest].map(([ref, a]) => [ref, { missed: !a.isCorrect || a.guessed, isCorrect: a.isCorrect, guessed: a.guessed, at: a.updatedAt }]));
}

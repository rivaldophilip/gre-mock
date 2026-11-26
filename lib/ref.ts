// Bank refs: every item is known by `<sourceId>:<qid>` ("quant-005:s2q14", "qbank-003:s1q7"), the key responses,
// revisit links and item events' questions are stored under. A quiz shows the item under a display id (s1q1, …), so
// code reaches the ref through the loaded question, never by joining a test id and a question id.
import type { Question } from "./types";

/** The ref of an item as authored in a source file. */
export const makeRef = (sourceId: string, qid: string) => `${sourceId}:${qid}`;

/** The bank ref of a loaded question (set by lib/test-load.ts on every question it returns). */
export function refOf(q: Pick<Question, "ref" | "id">): string {
  if (!q.ref) throw new Error(`question ${q.id} was loaded without a ref`);
  return q.ref;
}

/** "quant-005:s2q14" -> ["quant-005", "s2q14"] */
export function splitRef(ref: string): [string, string] {
  const i = ref.indexOf(":");
  return [ref.slice(0, i), ref.slice(i + 1)];
}

/** The review page's anchor for an item: stable across quizzes, so a revisit can link to where its earlier item was shown. */
export const qAnchor = (ref: string) => `q-${ref.replace(/[^a-z0-9]+/gi, "-")}`;

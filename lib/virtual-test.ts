// A Test built from bank rows (docs/BANK.md): a source file as it was written, or an assembled quiz. Pure, so the
// sync's round trip and the quiz's id namespacing are tested without a database. lib/test-load.ts feeds it rows.
import type { Figure, Passage, Question, Test } from "./types";

export type ItemBody = { ref: string; sourceId: string; position: number; status: string; body: unknown };
export type PartBody = { ref: string; sourceId: string; position: number; status: string; body: unknown };
export type SourceHead = { id: string; measure: string; title: string; sections: unknown };

const byPos = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

/**
 * A source as its file has it: questions (retired ones included) in file order, each carrying its ref; passages and
 * figures in file order. Rows marked `gone` (no longer in the file) are left out.
 */
export function sourceTest(src: SourceHead, items: ItemBody[], passages: PartBody[], figures: PartBody[]): Test {
  const live = <T extends { status: string; sourceId: string }>(xs: T[]) => xs.filter((x) => x.status !== "gone" && x.sourceId === src.id);
  return {
    id: src.id,
    measure: src.measure as Test["measure"],
    title: src.title,
    sections: src.sections as Test["sections"],
    passages: live(passages).sort(byPos).map((p) => p.body as Passage),
    figures: live(figures).sort(byPos).map((f) => f.body as Figure),
    questions: live(items).sort(byPos).map((i) => ({ ...(i.body as Question), ref: i.ref })),
  };
}

/** One quiz slot as stored in quizzes.layout (lib/quiz.ts). */
export type LayoutItem = {
  ref: string;
  slotId: string;
  slotType: string;
  level: number;
  target?: string;
  unitId?: string;
  reused?: boolean;
  revisitOf?: string;
};
export type Layout = { sections: { n: 1 | 2; minutes: number; items: LayoutItem[] }[] };
export type QuizHead = { id: number; measure: string; title: string; layout: Layout };

export const quizTestId = (id: number) => `quiz-${id}`;
export const quizIdOf = (testId: string): number | null => {
  const m = /^quiz-(\d+)$/.exec(testId);
  return m ? Number(m[1]) : null;
};

/**
 * An assembled quiz as a Test: display ids s1q1, s1q2, … in layout order, every question carrying its bank ref and
 * whether it is reused, and passages, figures and DI sets renamed p1, a1, f1, d1, … (two sources can both have a "p1").
 */
export function quizTest(quiz: QuizHead, items: Map<string, ItemBody>, passages: Map<string, PartBody>, figures: Map<string, PartBody>): Test {
  const names = new Map<string, string>();
  const counters = { p: 0, a: 0, f: 0, d: 0 };
  const rename = (kind: keyof typeof counters, ref: string) => {
    const k = `${kind}|${ref}`;
    if (!names.has(k)) names.set(k, `${kind}${++counters[kind]}`);
    return names.get(k)!;
  };
  const outPassages: Passage[] = [];
  const outFigures: Figure[] = [];
  const questions: Question[] = [];
  for (const sec of quiz.layout.sections)
    sec.items.forEach((slot, i) => {
      const row = items.get(slot.ref);
      if (!row) throw new Error(`quiz ${quiz.id}: item ${slot.ref} is not in the bank`);
      const q = row.body as Question;
      const sid = row.sourceId;
      const out: Question = { ...q, id: `s${sec.n}q${i + 1}`, section: sec.n, ref: slot.ref, reused: !!slot.reused };
      if (q.passageId) {
        const pref = `${sid}:${q.passageId}`;
        const p = passages.get(pref);
        if (!p) throw new Error(`quiz ${quiz.id}: passage ${pref} is not in the bank`);
        const isArg = q.subtype === "arg";
        const fresh = !names.has(`${isArg ? "a" : "p"}|${pref}`);
        out.passageId = rename(isArg ? "a" : "p", pref);
        if (fresh) outPassages.push({ ...(p.body as Passage), id: out.passageId });
      }
      if (q.figureId) {
        const fref = `${sid}:${q.figureId}`;
        const f = figures.get(fref);
        if (!f) throw new Error(`quiz ${quiz.id}: figure ${fref} is not in the bank`);
        const fresh = !names.has(`f|${fref}`);
        out.figureId = rename("f", fref);
        if (fresh) outFigures.push({ ...(f.body as Figure), id: out.figureId });
      }
      if (q.setId) out.setId = rename("d", `${sid}:${q.setId}`);
      questions.push(out);
    });
  return {
    id: quizTestId(quiz.id),
    measure: quiz.measure as Test["measure"],
    title: quiz.title,
    sections: quiz.layout.sections.map((s) => ({ n: s.n, minutes: s.minutes })),
    passages: outPassages,
    figures: outFigures,
    questions,
  };
}

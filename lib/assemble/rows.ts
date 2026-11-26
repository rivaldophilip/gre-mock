// The rows an assembly context is built from (lib/assemble/context.ts): the bank's metadata and the user's own
// tables. Shared by the app (lib/quiz.ts) and the refill scripts (bank:gaps, bank:brief), so both see the same stock.
import { schema, type DB } from "../db";
import type { BankMetas } from "../bank-metas";
import type { Blueprint } from "../blueprint-rules";
import type { CtxRows } from "./context";
import blueprints from "../../data/blueprints.json";
import conceptVariants from "../../data/concept_variants.json";

const { quizzes, responses, attempts, vocab, concepts, itemEvents } = schema;

export async function contextRows(db: DB, metas: BankMetas, measure: "verbal" | "quant", seed: number, except?: number): Promise<CtxRows> {
  const [resp, att, qz, voc, con, ev] = await Promise.all([
    db.select({ id: responses.id, attemptId: responses.attemptId, questionId: responses.questionId, isCorrect: responses.isCorrect, guessed: responses.guessed, updatedAt: responses.updatedAt, finalized: responses.finalized }).from(responses),
    db.select({ id: attempts.id, testId: attempts.testId, mode: attempts.mode, finishedAt: attempts.finishedAt, abandonedAt: attempts.abandonedAt }).from(attempts),
    db.select({ id: quizzes.id, status: quizzes.status, layout: quizzes.layout }).from(quizzes),
    measure === "verbal" ? db.select().from(vocab) : Promise.resolve([] as (typeof vocab.$inferSelect)[]),
    db.select().from(concepts),
    db.select({ kind: itemEvents.kind, itemId: itemEvents.itemId, event: itemEvents.event, weight: itemEvents.weight, createdAt: itemEvents.createdAt, attemptId: itemEvents.attemptId }).from(itemEvents),
  ]);
  return {
    measure,
    seed,
    now: new Date(),
    items: metas.items,
    units: metas.units,
    passages: new Map([...metas.passages].map(([k, p]) => [k, { paragraphs: p.paragraphs, domain: p.domain }])),
    responses: resp,
    attempts: att,
    quizzes: qz,
    vocab: voc,
    concepts: con,
    events: ev,
    variants: conceptVariants as Record<string, string[]>,
    blueprint: (blueprints as unknown as Record<string, Blueprint>)[measure],
    except,
  };
}

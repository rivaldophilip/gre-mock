import "server-only";
// What the app reads from content/: the study guides only. Questions come from the question bank (lib/bank.ts).
import fs from "node:fs";
import path from "node:path";
import concepts from "@/data/concepts.json";
import rcSkills from "@/data/rc_skills.json";
import type { PublicQuestion, PublicTest, Question, Test } from "./types";
import { StudySchema, type Study } from "./study";

/** The study guide for a measure (content/study/<measure>.json), or null if none is written yet. */
export function loadStudy(measure: "verbal" | "quant"): Study | null {
  const file = path.join(process.cwd(), "content", "study", `${measure}.json`);
  if (!fs.existsSync(file)) return null;
  return StudySchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

/** Everything the runner may see: no keys, explanations, tags, difficulty, or the authoring setup, variant and revisit link (they hint at the method). */
export function publicTest(t: Test): PublicTest {
  return {
    ...t,
    passages: t.passages.map(({ tags: _tags, ...p }) => p),
    questions: t.questions.map(publicQuestion),
  };
}

/** One question as the runner may see it (see publicTest); the bank ref and the reused flag stay on the server too. */
export function publicQuestion({ key: _k, explanation: _e, tags: _t, difficulty: _d, setup: _s, variant: _v, revisits: _r, solverRating: _sr, ref: _ref, reused: _ru, ...q }: Question): PublicQuestion {
  return q;
}

/** Questions in display order: by section, then declaration order. */
export function orderedQuestions(t: Test) {
  return [...t.questions].sort((a, b) => a.section - b.section);
}

/** Concept and reading-skill id -> name, for search. */
export const conceptNames = new Map<string, string>([...concepts, ...rcSkills].map((c) => [c.id, c.name]));

import "server-only";
import fs from "node:fs";
import path from "node:path";
import concepts from "@/data/concepts.json";
import rcSkills from "@/data/rc_skills.json";
import { TestSchema, type PublicTest, type Test } from "./types";
import { StudySchema, type Study } from "./study";

const DIR = path.join(process.cwd(), "content", "tests");

export function listTestIds(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

/** The study guide for a measure (content/study/<measure>.json), or null if none is written yet. */
export function loadStudy(measure: "verbal" | "quant"): Study | null {
  const file = path.join(process.cwd(), "content", "study", `${measure}.json`);
  if (!fs.existsSync(file)) return null;
  return StudySchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

export function loadTest(id: string): Test | null {
  if (!/^[a-z]+-\d{3}$/.test(id)) return null;
  const file = path.join(DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return TestSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

/** Everything the runner may see: no keys, explanations, tags or difficulty. */
export function publicTest(t: Test): PublicTest {
  return {
    ...t,
    passages: t.passages.map(({ tags: _tags, ...p }) => p),
    questions: t.questions.map(({ key: _k, explanation: _e, tags: _t, difficulty: _d, ...q }) => q),
  };
}

/** Questions in display order: by section, then declaration order. */
export function orderedQuestions(t: Test) {
  return [...t.questions].sort((a, b) => a.section - b.section);
}

/** Concept and reading-skill id -> name, for search. */
export const conceptNames = new Map<string, string>([...concepts, ...rcSkills].map((c) => [c.id, c.name]));

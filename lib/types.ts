import { z } from "zod";

export const QTYPES = [
  "tc", // text completion (1-3 blanks)
  "se", // sentence equivalence (pick 2 of 6)
  "rc", // reading comprehension / argument, single answer
  "rc_multi", // reading comprehension, select all that apply
  "rc_select", // select-in-passage (click a sentence)
  "qc", // quantitative comparison
  "mc", // multiple choice, single answer
  "mc_multi", // multiple choice, select all that apply
  "numeric", // numeric entry (single box or fraction)
] as const;
export type QType = (typeof QTYPES)[number];

export const VERBAL_TYPES: QType[] = ["tc", "se", "rc", "rc_multi", "rc_select"];
export const QUANT_TYPES: QType[] = ["qc", "mc", "mc_multi", "numeric"];

/** What the test-taker submits for one question. */
export const AnswerSchema = z.object({
  sel: z.array(z.number().int().min(-1)).optional(), // choice indices (tc: one per blank, -1 = unset; rc_select: sentence index)
  text: z.string().max(40).optional(), // numeric entry, single box
  frac: z.tuple([z.string().max(20), z.string().max(20)]).optional(), // numeric entry, fraction boxes
});
export type Answer = z.infer<typeof AnswerSchema>;

export const TagSchema = z.object({
  kind: z.enum(["word", "concept"]),
  id: z.string(),
  role: z.enum(["key", "distractor", "passage", "stem", "primary", "secondary"]),
  /** position of the choice this word occupies: tc -> [blank, choice], se/rc -> [choice] */
  at: z.array(z.number().int().min(0)).optional(),
});
export type Tag = z.infer<typeof TagSchema>;

export const ExplanationSchema = z.object({
  key: z.string().min(1), // why the key is right
  distractors: z.record(z.string(), z.string()).optional(), // choice text -> why it fails
  steps: z.array(z.string()).optional(), // quant: numbered solution
  fast: z.string().optional(),
  trap: z.string().optional(),
});
export type Explanation = z.infer<typeof ExplanationSchema>;

export const KeySchema = z.union([
  z.object({ sel: z.array(z.number().int().min(0)).min(1) }),
  z.object({ value: z.string().min(1) }), // numeric: "3/8", "0.375", "12"
]);
export type Key = z.infer<typeof KeySchema>;

export const QuestionSchema = z.object({
  id: z.string(),
  section: z.union([z.literal(1), z.literal(2)]),
  type: z.enum(QTYPES),
  /** 1-5 follow official P+ bands; 6-7 are set only by calibration (docs/CALIBRATION.md): harder than official hard items */
  difficulty: z.number().int().min(1).max(7),
  /** "arg" marks a short argument item (type rc over a one-paragraph passage) */
  subtype: z.literal("arg").optional(),
  /** stem. Markdown-ish text; $...$ is KaTeX. For tc, use ___ (blank) markers, one per blank. */
  prompt: z.string().min(1),
  passageId: z.string().optional(),
  setId: z.string().optional(), // data-interpretation set (shares a figure)
  figureId: z.string().optional(),
  blanks: z.array(z.array(z.string())).optional(), // tc: choices per blank
  choices: z.array(z.string()).optional(), // se/rc/rc_multi/mc/mc_multi
  qc: z.object({ a: z.string(), b: z.string(), info: z.string().optional() }).optional(),
  numeric: z.object({ kind: z.enum(["single", "fraction"]), unit: z.string().optional() }).optional(),
  key: KeySchema,
  explanation: ExplanationSchema,
  tags: z.array(TagSchema).default([]),
});
export type Question = z.infer<typeof QuestionSchema>;

export const PassageSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  /** paragraphs; for rc_select questions each sentence is clickable */
  paragraphs: z.array(z.string()).min(1),
  tags: z.array(TagSchema).default([]),
});
export type Passage = z.infer<typeof PassageSchema>;

export const FigureSchema = z.object({
  id: z.string(),
  caption: z.string().optional(),
  svg: z.string().optional(),
  table: z.object({ head: z.array(z.string()), rows: z.array(z.array(z.string())) }).optional(),
});
export type Figure = z.infer<typeof FigureSchema>;

export const TestSchema = z.object({
  id: z.string(), // verbal-001
  measure: z.enum(["verbal", "quant"]),
  title: z.string(),
  sections: z
    .array(z.object({ n: z.union([z.literal(1), z.literal(2)]), minutes: z.number().int().positive() }))
    .length(2),
  passages: z.array(PassageSchema).default([]),
  figures: z.array(FigureSchema).default([]),
  questions: z.array(QuestionSchema).min(1),
});
export type Test = z.infer<typeof TestSchema>;

// ---- runner-facing (answers stripped) ----
export type PublicQuestion = Omit<Question, "key" | "explanation" | "tags" | "difficulty">;
export type PublicPassage = Omit<Passage, "tags">;
export type PublicTest = Omit<Test, "questions" | "passages"> & {
  questions: PublicQuestion[];
  passages: PublicPassage[];
};

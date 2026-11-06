import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const vocab = pgTable("vocab", {
  id: text("id").primaryKey(), // slug of the lemma
  lemma: text("lemma").notNull(),
  variants: text("variants").array().notNull().default([]),
  pos: text("pos"),
  senses: jsonb("senses"), // [{def, secondary?, synonyms[], connotation, example}]
  isSecondary: boolean("is_secondary").notNull().default(false),
  meaningGroup: text("meaning_group"),
  sources: text("sources").array().notNull().default([]),
  sourceCount: integer("source_count").notNull().default(0),
  pink: boolean("pink").notNull().default(false),
  tier: text("tier").notNull().default("core"), // core|secondary|ets|extended|passage|user_added
  yield: real("yield").notNull().default(0.5),
});

export const concepts = pgTable("concepts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(), // arithmetic|algebra|geometry|data
  etsSection: text("ets_section"),
  yield: real("yield").notNull().default(0.5),
});

export const tests = pgTable("tests", {
  id: text("id").primaryKey(),
  measure: text("measure").notNull(), // verbal|quant
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  brief: jsonb("brief"),
});

export const questions = pgTable(
  "questions",
  {
    id: text("id").primaryKey(), // `${testId}:${questionId}`
    testId: text("test_id").notNull(),
    section: integer("section").notNull(),
    position: integer("position").notNull(),
    type: text("type").notNull(),
    difficulty: integer("difficulty").notNull(),
  },
  (t) => [index("questions_test_idx").on(t.testId)],
);

export const questionItems = pgTable(
  "question_items",
  {
    questionId: text("question_id").notNull(),
    kind: text("kind").notNull(), // word|concept
    itemId: text("item_id").notNull(),
    role: text("role").notNull(),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.kind, t.itemId, t.role] }), index("qi_item_idx").on(t.kind, t.itemId)],
);

export const attempts = pgTable(
  "attempts",
  {
    id: serial("id").primaryKey(),
    testId: text("test_id").notNull(),
    mode: text("mode").notNull(), // exam|practice
    timerOn: boolean("timer_on").notNull().default(true),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
    currentPosition: integer("current_position").notNull().default(0),
    // {"1": {startedAt, finishedAt?}, "2": {...}}
    sectionState: jsonb("section_state").notNull().default({}),
  },
  (t) => [index("attempts_test_idx").on(t.testId)],
);

export const responses = pgTable(
  "responses",
  {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id").notNull(),
    questionId: text("question_id").notNull(),
    answer: jsonb("answer"),
    isCorrect: boolean("is_correct").notNull().default(false),
    timeMs: integer("time_ms").notNull().default(0),
    guessed: boolean("guessed").notNull().default(false),
    marked: boolean("marked").notNull().default(false),
    finalized: boolean("finalized").notNull().default(false), // item events emitted
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("responses_attempt_q").on(t.attemptId, t.questionId)],
);

export const itemEvents = pgTable(
  "item_events",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(), // word|concept
    itemId: text("item_id").notNull(),
    event: text("event").notNull(),
    weight: real("weight").notNull(),
    responseId: integer("response_id"),
    attemptId: integer("attempt_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ie_item_idx").on(t.kind, t.itemId), index("ie_resp_idx").on(t.responseId)],
);

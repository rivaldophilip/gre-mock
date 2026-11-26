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
  // shown only in passages and stems, never a TC / SE choice; one showing covers it (docs/PRIORITY.md)
  exposureOnly: boolean("exposure_only").notNull().default(false),
});

export const concepts = pgTable("concepts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(), // arithmetic|algebra|geometry|data
  etsSection: text("ets_section"),
  yield: real("yield").notNull().default(0.5),
});

export const attempts = pgTable(
  "attempts",
  {
    id: serial("id").primaryKey(),
    testId: text("test_id").notNull(),
    mode: text("mode").notNull(), // exam|practice|drill|replay
    timerOn: boolean("timer_on").notNull().default(true),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
    // quit before the end: no events for sections not yet submitted; reviewable, and a new attempt can start
    abandonedAt: timestamp("abandoned_at"),
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
    // a wrong quant answer the test-taker marked "silly mistake" once it was shown: its concept_wrong_* weights are halved
    silly: boolean("silly").notNull().default(false),
    finalized: boolean("finalized").notNull().default(false), // item events emitted
    // an assembled quiz showed an item answered before (lib/assemble, ladder steps 4-6): scored, but no item events
    reused: boolean("reused").notNull().default(false),
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

/** The reader's own trims of a study guide; no row means shown. */
export const studyMarks = pgTable(
  "study_marks",
  {
    measure: text("measure").notNull(), // verbal|quant
    kind: text("kind").notNull(), // card (formula sheet) | topic (guide section)
    itemId: text("item_id").notNull(), // cardId() or the section id
    state: text("state").notNull(), // archived (studied; folded away) | deleted (not wanted in the guide)
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.measure, t.kind, t.itemId] })],
);

/**
 * A quiz assembled from the bank (lib/quiz.ts, docs/BANK.md): a full mock or a custom quiz. Its attempt's testId is
 * `quiz-<id>`. `layout` lists each section's items by bank ref; `fallbacks` the slots the ladder could not fill exactly.
 */
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  measure: text("measure").notNull(), // verbal|quant
  kind: text("kind").notNull(), // mock|custom
  title: text("title").notNull(),
  spec: jsonb("spec").notNull(), // what was asked for (lib/assemble/custom.ts, QuizSpec)
  seed: integer("seed").notNull(),
  bankVersion: integer("bank_version").notNull(),
  layout: jsonb("layout").notNull(), // {sections: [{n, minutes, items: [{ref, slotId, slotType, level, target, unitId, reused, revisitOf}]}]}
  fallbacks: jsonb("fallbacks").notNull().default([]),
  // draft (fell back; waits for Proceed) | ready | started | done | abandoned | cancelled
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** A slot the bank could not fill as wanted: what was wanted, the ladder step that filled it, and with what. bank:gaps reads the open ones. */
export const shortfalls = pgTable(
  "shortfalls",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id").notNull(),
    slotId: text("slot_id").notNull(),
    measure: text("measure").notNull(),
    slotType: text("slot_type").notNull(),
    wantedKind: text("wanted_kind").notNull(), // concept|skill|words|any
    wantedId: text("wanted_id"),
    wantedLevel: integer("wanted_level"),
    step: integer("step").notNull(), // ladder step 2-8 (lib/assemble/ladder.ts)
    gotRef: text("got_ref"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
  },
  (t) => [index("shortfalls_open_idx").on(t.resolvedAt)],
);

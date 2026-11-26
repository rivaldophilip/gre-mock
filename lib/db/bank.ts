// The shared question bank (database `gre_bank`, docs/BANK.md): every item of every source file, written by
// `npm run bank:sync` from the JSON in content/ and only read by the app. Item bodies include their keys, so the
// server alone reads them. Rows are never deleted: an item that leaves its file is marked `gone`, so a ref a
// response points to always resolves. Migrations: drizzle-bank/.
import { index, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

/** One source file: a mock (verbal-001), a drill batch (drill-001) or a bank batch (qbank-001). */
export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(), // mock|drill|batch
  measure: text("measure").notNull(), // verbal|quant
  title: text("title").notNull(),
  sections: jsonb("sections").notNull(), // [{n, minutes}], as in the file
  /** source order within its measure (lib/sources.ts): mocks, then drill batches, then bank batches */
  position: integer("position").notNull(),
  hash: text("hash").notNull(),
  syncedAt: timestamp("synced_at").notNull().defaultNow(),
});

export const items = pgTable(
  "items",
  {
    ref: text("ref").primaryKey(), // `${sourceId}:${qid}`
    sourceId: text("source_id").notNull(),
    qid: text("qid").notNull(),
    measure: text("measure").notNull(),
    type: text("type").notNull(), // tc|se|rc|…
    slotType: text("slot_type").notNull(), // tc1|…|arg|di (lib/qtypes.ts)
    section: integer("section").notNull(),
    position: integer("position").notNull(), // index in the file's questions array
    difficulty: integer("difficulty").notNull(),
    solverRating: integer("solver_rating"),
    primary: text("primary_tag"), // primary concept or reading skill
    variant: text("variant"),
    setup: text("setup"),
    /** the setup group (lib/setup-history.ts, conceptHistory) an item shares with earlier items: one ref names it */
    setupGroup: text("setup_group"),
    keyWords: text("key_words").array().notNull().default([]),
    revisits: text("revisits"),
    unitId: text("unit_id"), // the passage or DI set it belongs to (`${sourceId}:${passageId|setId}`)
    passageId: text("passage_id"), // `${sourceId}:${passageId}`
    figureId: text("figure_id"), // `${sourceId}:${figureId}`
    status: text("status").notNull().default("active"), // active|retired|gone
    body: jsonb("body").notNull(), // the question as in the file
    hash: text("hash").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("items_source_idx").on(t.sourceId), index("items_primary_idx").on(t.primary), index("items_unit_idx").on(t.unitId)],
);

export const passages = pgTable("passages", {
  ref: text("ref").primaryKey(), // `${sourceId}:${passageId}`
  sourceId: text("source_id").notNull(),
  pid: text("pid").notNull(),
  position: integer("position").notNull(),
  kind: text("kind").notNull(), // reading|argument
  paragraphs: integer("paragraphs").notNull(),
  domain: text("domain"),
  status: text("status").notNull().default("active"),
  body: jsonb("body").notNull(),
  hash: text("hash").notNull(),
});

export const figures = pgTable("figures", {
  ref: text("ref").primaryKey(),
  sourceId: text("source_id").notNull(),
  fid: text("fid").notNull(),
  position: integer("position").notNull(),
  status: text("status").notNull().default("active"),
  body: jsonb("body").notNull(),
  hash: text("hash").notNull(),
});

/** A set served together: a reading passage with its questions, an argument, or a DI set. */
export const units = pgTable("units", {
  id: text("id").primaryKey(), // `${sourceId}:${passageId|setId}`
  sourceId: text("source_id").notNull(),
  measure: text("measure").notNull(),
  shape: text("shape").notNull(), // rc4-long|rc3|rc2|rc1|arg1|di3 (from actual counts)
  n: integer("n").notNull(),
  minLevel: integer("min_level").notNull(),
  maxLevel: integer("max_level").notNull(),
  section: integer("section").notNull(), // the section it sits in, in its source
  status: text("status").notNull().default("active"),
});

/** Every tag an item carries, passage tags copied onto each of the passage's questions. */
export const itemTags = pgTable(
  "item_tags",
  {
    ref: text("ref").notNull(),
    kind: text("kind").notNull(), // word|concept
    tagId: text("tag_id").notNull(),
    role: text("role").notNull(),
  },
  (t) => [primaryKey({ columns: [t.ref, t.kind, t.tagId, t.role] }), index("item_tags_tag_idx").on(t.kind, t.tagId)],
);

/** A bank batch's brief (content/briefs/<id>.json) and what it targeted. */
export const batches = pgTable("batches", {
  id: text("id").primaryKey(),
  measure: text("measure").notNull(),
  kind: text("kind").notNull(), // quant|tcse|rc
  brief: jsonb("brief"),
  targets: jsonb("targets"),
  status: text("status").notNull(), // synced
  syncedAt: timestamp("synced_at").notNull().defaultNow(),
});

/** `version`: bumped by every sync that changes a row, so the app can memoise item metadata per version. */
export const meta = pgTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Quiz assembly from the bank (docs/BANK.md): shared types. Everything under lib/assemble is pure; lib/quiz.ts builds
// the context from the databases and stores what assembly returns.
import type { ItemScore } from "../priority/compute";
import type { Blueprint } from "../blueprint-rules";
import type { SlotType } from "../qtypes";

/** An item as assembly sees it: bank metadata, no body. */
export type Cand = {
  ref: string;
  sourceId: string;
  measure: string;
  type: string;
  slotType: SlotType;
  position: number;
  difficulty: number;
  solverRating: number | null;
  primary: string | null;
  variant: string | null;
  setupGroup: string | null;
  keyWords: string[];
  revisits: string | null;
  unitId: string | null;
  status: string;
  tags: { kind: string; id: string; role: string }[];
};

/** A set served together: a reading passage with its questions, an argument, or a DI set. */
export type UnitCand = {
  id: string;
  sourceId: string;
  kind: "reading" | "argument" | "di";
  shape: string;
  n: number;
  status: string;
  paragraphs: number;
  domain: string | null;
  items: Cand[];
};

export type Target = {
  /** concept: a quant concept; skill: reading / argument skills; words: TC / SE key words; any: no target */
  kind: "concept" | "skill" | "words" | "any";
  ids: string[];
  label: string;
};

/** Where a slot's levels are drawn from: its own type, or a unit's pool ("rc" for reading passages, "arg", "di"). */
export type PoolKey = string;

export type Slot = {
  id: string;
  section: 1 | 2;
  kind: "item" | "unit";
  /** item: its slot type; unit: "rc" (reading passage), "arg" or "di" */
  slotType: SlotType | "rc";
  /** unit: the number of questions wanted */
  size?: number;
  /** item: the level the plan gives it (a mock's blueprint slot); other open levels of its type still fit (pools) */
  level?: number;
  /** unit, custom quiz: unseen sets must sit within these levels */
  levelRange?: [number, number];
  target: Target;
  /** quant: the sub-form preferred for the target concept (assignVariants) */
  variant?: string;
  /** a revisit sibling placed on purpose (its earlier item was missed or guessed) */
  forced?: string;
  revisitOf?: string;
};

export type Picked = { slot: Slot; cands: Cand[]; step: number; unitId?: string; reused: boolean[] };

/** A slot the ladder could not fill exactly (any step after the first), or a blueprint rule the bank could not meet. */
export type Fallback = {
  slotId: string;
  slotType: string;
  wantedKind: Target["kind"] | "rule";
  wantedId: string | null;
  wantedLevel: number | null;
  step: number;
  refs: string[];
  /** one line for the confirmation dialog: "wanted circles L5 → got circles L4 (nearby difficulty)" */
  note: string;
};

export type Revisit = { ref: string; at: number; result: "missed" | "guessed" };

/** What a custom quiz asks for (components/CreateQuiz.tsx). */
export type QuizSpec =
  | { kind: "mock"; measure: "verbal" | "quant" }
  | {
      kind: "custom";
      measure: "verbal" | "quant";
      length: number;
      /** slot types; "rc" stands for reading passages */
      types: (SlotType | "rc")[];
      /** concepts (quant) or skills (verbal) to aim at; "weakest" ranks the user's weak ones by priority */
      targets: string[] | "weakest";
      levels: [number, number];
      timer: boolean;
    };

export type Ctx = {
  measure: "verbal" | "quant";
  /** every item of the measure, any status */
  items: Cand[];
  units: UnitCand[];
  seen: Set<string>;
  held: Set<string>;
  /** the latest locked answer per ref */
  results: Map<string, { missed: boolean }>;
  /** quant concepts (with areas) or verbal reading / argument skills (area reading | argument) */
  conceptScores: (ItemScore & { area: string })[];
  /** verbal: word scores (dismissed and exposure-only words left out) */
  wordScores: ItemScore[];
  isSecondary: (wordId: string) => boolean;
  synonyms: (wordId: string) => Iterable<string>;
  conceptName: (id: string) => string;
  variants: Record<string, string[]>;
  /** concept -> variant -> times seen */
  variantUse: Map<string, Map<string, number>>;
  /** setup groups of items the user has seen */
  seenGroups: Set<string>;
  /** misses old enough to revisit, oldest first */
  revisits: Revisit[];
  blueprint: Blueprint;
  random: () => number;
};

import { CONCEPT_W, SILLY_FACTOR } from "./priority/config";

/** Hover help for the "I guessed" and "Silly mistake" checkboxes (Runner, review page). */
export const GUESSED_HELP = [
  "Tick it if you weren’t sure.",
  "Right anyway: half credit, and its topics come back sooner.",
  "Locked once checked.",
].join("\n");

export const SILLY_HELP = [
  "Tick it if you knew how and slipped (misread, arithmetic).",
  `The miss counts half against its topics (+${CONCEPT_W.wrong_primary * SILLY_FACTOR}, not +${CONCEPT_W.wrong_primary}). Still scored wrong.`,
].join("\n");

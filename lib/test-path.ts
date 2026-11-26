// Where a source file lives: mocks in content/tests, endless-vocab drill batches (drill-001, …) in content/drill, and
// question-bank batches (qbank-001, vbank-001, …) in content/bank/<measure>. Shared by the sync and the authoring
// scripts, so both resolve an id the same way.

export const TESTS_DIR = "content/tests";
export const DRILL_DIR = "content/drill";
export const BANK_DIR = "content/bank";

/** A drill batch: single TC / SE items served one at a time by the endless vocab mode, never listed as a mock. */
export const isDrillId = (id: string) => /^drill-\d{3}$/.test(id);

/** A question-bank batch (docs/BANK.md): items written by topic, served only through assembled quizzes and the drill. */
export const isBankId = (id: string) => /^[qv]bank-\d{3}$/.test(id);

/** A bank batch's measure, from its prefix. */
export const bankMeasure = (id: string): "quant" | "verbal" => (id.startsWith("q") ? "quant" : "verbal");

export const testDir = (id: string) => (isDrillId(id) ? DRILL_DIR : isBankId(id) ? `${BANK_DIR}/${bankMeasure(id)}` : TESTS_DIR);
export const testPath = (id: string) => `${testDir(id)}/${id}.json`;

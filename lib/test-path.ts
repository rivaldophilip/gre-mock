// Where a test file lives: mocks in content/tests, endless-vocab drill batches (drill-001, …) in content/drill.
// Shared by the app loader and the authoring scripts, so both resolve an id the same way.

export const TESTS_DIR = "content/tests";
export const DRILL_DIR = "content/drill";

/** A drill batch: single TC / SE items served one at a time by the endless vocab mode, never listed as a mock. */
export const isDrillId = (id: string) => /^drill-\d{3}$/.test(id);

export const testDir = (id: string) => (isDrillId(id) ? DRILL_DIR : TESTS_DIR);
export const testPath = (id: string) => `${testDir(id)}/${id}.json`;

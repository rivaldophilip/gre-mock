// Reading content/tests/<id>.json (content/drill/ for drill batches) for the authoring scripts, with errors that say what to do instead of a stack trace.
import fs from "node:fs";
import { testDir, testPath } from "../../lib/test-path";

export { TESTS_DIR, testPath } from "../../lib/test-path";

/** Print a message for the author and stop. Scripts call this for every expected failure. */
export function die(message: string): never {
  console.error(message);
  process.exit(1);
}

export function readTestFile(id: string | undefined, usage: string): unknown {
  if (!id || id.startsWith("-")) die(`usage: ${usage}`);
  const file = testPath(id);
  if (!fs.existsSync(file)) {
    const dir = testDir(id);
    const have = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort() : [];
    die(`no ${file}. Tests on disk: ${have.join(", ") || "none"}. A new bank batch starts with: npm run -s bank:brief`);
  }
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (e) {
    // point at the line, which the author can Edit, rather than a character offset
    const msg = (e as Error).message;
    const pos = Number(msg.match(/position (\d+)/)?.[1]);
    if (!Number.isFinite(pos)) die(`${file} is not valid JSON: ${msg}`);
    const line = text.slice(0, pos).split("\n").length;
    const src = text.split("\n")[line - 1] ?? "";
    die(`${file} is not valid JSON at line ${line}: ${msg.replace(/ in JSON at position \d+.*$/, "")}\n  ${line} | ${src.trim().slice(0, 160)}`);
  }
}

/** Write a test back in the file's own indentation and final newline, so a re-tag changes only what it means to. */
export function writeTestFile(id: string, test: unknown) {
  const file = testPath(id);
  const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const indent = old.match(/^\{\n([ \t]+)"/)?.[1] ?? "  ";
  fs.writeFileSync(file, JSON.stringify(test, null, indent) + (old && !old.endsWith("\n") ? "" : "\n"));
}

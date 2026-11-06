import type { Answer, Question } from "./types";

/** Parse "3/8", "0.375", "-2", "1,200" into a number; NaN if not numeric. */
export function parseNumber(raw: string | undefined): number {
  if (raw === undefined) return NaN;
  const s = raw.trim().replace(/,/g, "");
  if (!s) return NaN;
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (frac) {
    const d = Number(frac[2]);
    return d === 0 ? NaN : Number(frac[1]) / d;
  }
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

function closeEnough(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...new Set(a)].sort((x, y) => x - y);
  const sb = [...new Set(b)].sort((x, y) => x - y);
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

export function isAnswered(q: Pick<Question, "type" | "blanks">, a: Answer | undefined): boolean {
  if (!a) return false;
  if (q.type === "tc") {
    const n = q.blanks?.length ?? 1;
    return (a.sel?.length ?? 0) === n && a.sel!.every((v) => v >= 0);
  }
  if (q.type === "numeric") {
    if (a.frac) return a.frac[0].trim() !== "" && a.frac[1].trim() !== "";
    return (a.text ?? "").trim() !== "";
  }
  return (a.sel?.length ?? 0) > 0;
}

/** Fully correct only (no partial credit, as on the real exam). */
export function scoreAnswer(q: Question, a: Answer | undefined): boolean {
  if (!a || !isAnswered(q, a)) return false;
  const key = q.key;
  switch (q.type) {
    case "tc": {
      if (!("sel" in key)) return false;
      const n = q.blanks?.length ?? key.sel.length;
      const sel = a.sel ?? [];
      if (sel.length !== n) return false;
      return key.sel.every((k, i) => sel[i] === k);
    }
    case "se":
    case "rc_multi":
    case "mc_multi":
      return "sel" in key && sameSet(a.sel ?? [], key.sel);
    case "rc":
    case "rc_select":
    case "qc":
    case "mc":
      return "sel" in key && (a.sel?.length ?? 0) === 1 && a.sel![0] === key.sel[0];
    case "numeric": {
      if (!("value" in key)) return false;
      const target = parseNumber(key.value);
      if (a.frac) {
        const d = parseNumber(a.frac[1]);
        const n = parseNumber(a.frac[0]);
        if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return false;
        return closeEnough(n / d, target);
      }
      return closeEnough(parseNumber(a.text), target);
    }
  }
}

/** Raw score and a deliberately rough band (not an ETS conversion). */
export function roughBand(correct: number, total: number): string {
  if (total === 0) return "-";
  const p = correct / total;
  // Tests are harder than ETS, so the bands are shifted generously.
  if (p >= 0.9) return "~168-170";
  if (p >= 0.8) return "~165-167";
  if (p >= 0.7) return "~161-164";
  if (p >= 0.6) return "~157-160";
  if (p >= 0.5) return "~153-156";
  if (p >= 0.4) return "~149-152";
  return "<149";
}

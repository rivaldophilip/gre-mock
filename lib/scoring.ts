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

/**
 * Accuracy -> scaled score (130-170), piecewise linear. Set to roughly what the same accuracy earns on an
 * official 27-question section. There is deliberately no credit for these mocks being harder than ETS.
 */
export const BAND_CURVE: [number, number][] = [
  [0, 130], [0.1, 135], [0.2, 140], [0.3, 144], [0.4, 147], [0.5, 150],
  [0.6, 153], [0.7, 156], [0.8, 160], [0.88, 163], [0.94, 166], [0.97, 168], [1, 170],
];
/** A correct answer flagged "guessed" earns this much credit. */
export const GUESS_CREDIT = 0.5;

function scaled(p: number): number {
  const x = Math.min(1, Math.max(0, p));
  for (let i = 1; i < BAND_CURVE.length; i++) {
    const [p1, s1] = BAND_CURVE[i];
    if (x <= p1) {
      const [p0, s0] = BAND_CURVE[i - 1];
      return Math.round(s0 + ((x - p0) / (p1 - p0)) * (s1 - s0));
    }
  }
  return 170;
}

export interface Band {
  mid: number;
  low: number;
  high: number;
  correct: number;
  guessed: number; // of the correct ones
  total: number;
  credit: number;
  /** credited accuracy */
  p: number;
}

/**
 * Strict score estimate: guessed-right answers earn half credit, unanswered count as wrong, and the
 * range is a ±1 standard-error (Wilson) interval on the credited accuracy, so a short or partial
 * attempt gives a wide band.
 */
export function estimateBand(correct: number, guessed: number, total: number): Band | null {
  if (total <= 0) return null;
  const credit = correct - (1 - GUESS_CREDIT) * Math.min(guessed, correct);
  const p = credit / total;
  const z = 1;
  const d = 1 + (z * z) / total;
  const c = (p + (z * z) / (2 * total)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) / d;
  return { mid: scaled(p), low: scaled(c - h), high: scaled(c + h), correct, guessed, total, credit, p };
}

export const bandText = (b: Band) => (b.low === b.high ? `${b.mid}` : `${b.mid} (${b.low}–${b.high})`);

/** How the band was derived, for a hover tooltip. */
export function bandWhy(b: Band): string {
  const g = b.guessed ? ` − ${b.guessed} guessed × ${1 - GUESS_CREDIT}` : "";
  return [
    `Credit: ${b.correct} right${g} = ${+b.credit.toFixed(1)} of ${b.total} (${Math.round(100 * b.p)}%).`,
    `${Math.round(100 * b.p)}% maps to ${b.mid} on the official-style curve (50% → 150, 70% → 156, 80% → 160, 94% → 166).`,
    `Range ${b.low}–${b.high} is ±1 standard error for ${b.total} questions; fewer questions give a wider range.`,
    "Unanswered counts as wrong. No bonus for these mocks being harder than ETS. Not an ETS conversion.",
  ].join("\n");
}

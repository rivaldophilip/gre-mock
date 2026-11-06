"use client";
import type { Answer, PublicQuestion } from "@/lib/types";
import { Rich, RichInline } from "./Rich";
import { IconCheck, IconX } from "./icons";

const L = "ABCDEFGHIJ";
const numField =
  "rounded-xl border border-line bg-surface text-center text-lg font-medium tabular-nums text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-70";

function ChoiceList({
  choices,
  type,
  sel,
  onChange,
  disabled,
  keySel,
}: {
  choices: string[];
  type: "radio" | "check";
  sel: number[];
  onChange: (s: number[]) => void;
  disabled?: boolean;
  keySel?: number[];
}) {
  return (
    <ul className="space-y-2">
      {choices.map((c, i) => {
        const on = sel.includes(i);
        const isKey = keySel?.includes(i);
        const state = keySel ? (isKey ? "ok" : on ? "bad" : "dim") : on ? "sel" : "idle";
        const box = {
          ok: "border-ok bg-ok-soft",
          bad: "border-bad bg-bad-soft",
          dim: "border-line bg-surface opacity-60",
          sel: "border-accent bg-accent-soft",
          idle: "border-line bg-surface hover:border-muted/50 hover:bg-surface-2",
        }[state];
        const letter = {
          ok: "border-ok bg-ok text-surface",
          bad: "border-bad bg-bad text-bad-fg",
          dim: "border-line text-muted",
          sel: "border-accent bg-accent text-accent-fg",
          idle: "border-line text-muted",
        }[state];
        return (
          <li key={i}>
            <label
              className={`flex min-h-13 items-start gap-3 rounded-2xl border-[1.5px] px-3.5 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${box} ${disabled ? "cursor-default" : "cursor-pointer active:scale-[0.995]"}`}
            >
              <input
                type={type === "radio" ? "radio" : "checkbox"}
                className="sr-only"
                disabled={disabled}
                checked={on}
                onChange={() => {
                  if (type === "radio") onChange([i]);
                  else onChange(on ? sel.filter((x) => x !== i) : [...sel, i].sort((a, b) => a - b));
                }}
              />
              <span
                aria-hidden
                className={`mt-px grid size-6 shrink-0 place-items-center border-[1.5px] text-xs font-semibold transition-colors ${type === "radio" ? "rounded-full" : "rounded-md"} ${letter}`}
              >
                {L[i]}
              </span>
              <span className="min-w-0 flex-1 pt-px leading-snug">
                <RichInline text={c} />
              </span>
              {state === "ok" && <IconCheck size={18} className="mt-0.5 text-ok" />}
              {state === "bad" && <IconX size={18} className="mt-0.5 text-bad" />}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

const Hint = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted">{children}</p>;

export function QuestionRenderer({
  q,
  answer,
  onChange,
  disabled,
  keySel,
  keyValue,
}: {
  q: PublicQuestion;
  answer: Answer | undefined;
  onChange: (a: Answer) => void;
  disabled?: boolean;
  keySel?: number[];
  keyValue?: string;
}) {
  const sel = answer?.sel ?? [];
  switch (q.type) {
    case "tc": {
      const blanks = q.blanks ?? [];
      const parts = q.prompt.split("___");
      return (
        <div className="space-y-5">
          <p className="text-[17px] leading-relaxed">
            {parts.map((p, i) => (
              <span key={i}>
                <RichInline text={p} />
                {i < parts.length - 1 && (
                  <span className="mx-1 inline-block min-w-16 border-b-2 border-accent px-1 text-center font-semibold text-accent">
                    {sel[i] !== undefined && sel[i] >= 0 ? blanks[i]?.[sel[i]] : <span className="font-normal text-muted">({blanks.length > 1 ? L[i].toLowerCase() : i + 1})</span>}
                  </span>
                )}
              </span>
            ))}
          </p>
          <div className={`grid gap-5 ${blanks.length === 1 ? "" : blanks.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {blanks.map((choices, bi) => (
              <div key={bi} className="space-y-2">
                {blanks.length > 1 && <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Blank ({L[bi].toLowerCase()})</div>}
                <ChoiceList
                  choices={choices}
                  type="radio"
                  sel={sel[bi] !== undefined && sel[bi] >= 0 ? [sel[bi]] : []}
                  disabled={disabled}
                  keySel={keySel ? [keySel[bi]] : undefined}
                  onChange={(s) => {
                    const next = Array.from({ length: blanks.length }, (_, k) => sel[k] ?? -1);
                    next[bi] = s[0];
                    onChange({ sel: next }); // -1 = blank not yet chosen
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "se":
      return (
        <div className="space-y-4">
          <Rich text={q.prompt} className="text-[17px] leading-relaxed" />
          <Hint>Select the two answer choices that, when used to complete the sentence, fit the meaning of the sentence as a whole and produce completed sentences that are alike in meaning.</Hint>
          <ChoiceList choices={q.choices ?? []} type="check" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s.slice(-2) })} />
        </div>
      );
    case "rc":
    case "mc":
      return (
        <div className="space-y-4">
          <Rich text={q.prompt} className="text-[17px] leading-relaxed" />
          <ChoiceList choices={q.choices ?? []} type="radio" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s })} />
        </div>
      );
    case "rc_multi":
    case "mc_multi":
      return (
        <div className="space-y-4">
          <Rich text={q.prompt} className="text-[17px] leading-relaxed" />
          <Hint>Select all that apply.</Hint>
          <ChoiceList choices={q.choices ?? []} type="check" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s })} />
        </div>
      );
    case "rc_select":
      return (
        <div className="space-y-3">
          <Rich text={q.prompt} className="text-[17px] leading-relaxed" />
          <p className={`rounded-xl px-3.5 py-3 text-sm ${sel.length ? "bg-accent-soft text-fg" : "bg-surface-2 text-muted"}`}>
            {sel.length ? <>Selected sentence {sel[0] + 1}. Tap another sentence to change it.</> : "Tap a sentence in the passage to select it."}
          </p>
        </div>
      );
    case "qc": {
      const opts = ["Quantity A is greater.", "Quantity B is greater.", "The two quantities are equal.", "The relationship cannot be determined from the information given."];
      return (
        <div className="space-y-4">
          {q.prompt && <Rich text={q.prompt} className="text-[17px] leading-relaxed" />}
          {q.qc?.info && <Rich text={q.qc.info} className="rounded-2xl bg-surface-2 p-3.5 text-center" />}
          <div className="grid grid-cols-2 gap-2.5 text-center">
            {(["a", "b"] as const).map((k) => (
              <div key={k} className="rounded-2xl border border-line bg-surface p-3">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Quantity {k.toUpperCase()}</div>
                <Rich text={q.qc?.[k] ?? ""} />
              </div>
            ))}
          </div>
          <ChoiceList choices={opts} type="radio" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s })} />
        </div>
      );
    }
    case "numeric": {
      const fraction = q.numeric?.kind === "fraction";
      return (
        <div className="space-y-4">
          <Rich text={q.prompt} className="text-[17px] leading-relaxed" />
          <div className="flex items-center gap-3">
            {fraction ? (
              <div className="inline-flex flex-col items-center gap-1.5">
                <input aria-label="numerator" disabled={disabled} inputMode="decimal" className={`${numField} h-12 w-28`} value={answer?.frac?.[0] ?? ""} onChange={(e) => onChange({ frac: [e.target.value, answer?.frac?.[1] ?? ""] })} />
                <div className="h-0.5 w-28 rounded bg-fg" />
                <input aria-label="denominator" disabled={disabled} inputMode="decimal" className={`${numField} h-12 w-28`} value={answer?.frac?.[1] ?? ""} onChange={(e) => onChange({ frac: [answer?.frac?.[0] ?? "", e.target.value] })} />
              </div>
            ) : (
              <input aria-label="answer" disabled={disabled} inputMode="decimal" className={`${numField} h-12 w-44`} value={answer?.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
            )}
            {q.numeric?.unit && <span className="text-muted">{q.numeric.unit}</span>}
          </div>
          {keyValue && (
            <p className="inline-flex items-center gap-1.5 rounded-xl bg-ok-soft px-3 py-2 text-sm font-medium text-ok">
              <IconCheck size={16} /> Answer: {keyValue}
            </p>
          )}
        </div>
      );
    }
  }
}

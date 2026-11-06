"use client";
import type { Answer, PublicQuestion } from "@/lib/types";
import { Rich, RichInline } from "./Rich";

const L = "ABCDEFGHIJ";

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
        const state = keySel ? (isKey ? "border-green-600 bg-green-500/10" : on ? "border-red-500 bg-red-500/10" : "") : on ? "border-blue-600 bg-blue-500/10" : "";
        return (
          <li key={i}>
            <label className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2 ${state} ${disabled ? "cursor-default" : "hover:bg-black/5 dark:hover:bg-white/5"}`}>
              <input
                type={type === "radio" ? "radio" : "checkbox"}
                className="mt-1"
                disabled={disabled}
                checked={on}
                onChange={() => {
                  if (type === "radio") onChange([i]);
                  else onChange(on ? sel.filter((x) => x !== i) : [...sel, i].sort((a, b) => a - b));
                }}
              />
              <span className="font-mono text-sm opacity-60">{type === "check" && L[i] ? L[i] : type === "radio" ? L[i] : ""}</span>
              <span className="flex-1">
                <RichInline text={c} />
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

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
        <div className="space-y-4">
          <p className="leading-relaxed">
            {parts.map((p, i) => (
              <span key={i}>
                <RichInline text={p} />
                {i < parts.length - 1 && (
                  <span className="mx-1 inline-block min-w-16 border-b-2 border-current px-1 text-center font-medium">
                    {sel[i] !== undefined && sel[i] >= 0 ? blanks[i]?.[sel[i]] : <span className="opacity-50">({i + 1})</span>}
                  </span>
                )}
              </span>
            ))}
          </p>
          <div className={`grid gap-4 ${blanks.length === 1 ? "" : blanks.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {blanks.map((choices, bi) => (
              <div key={bi}>
                {blanks.length > 1 && <div className="mb-1 text-sm font-semibold">Blank ({L[bi]})</div>}
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
        <div className="space-y-3">
          <Rich text={q.prompt} />
          <p className="text-sm opacity-70">Select the two answer choices that, when used to complete the sentence, fit the meaning of the sentence as a whole and produce completed sentences that are alike in meaning.</p>
          <ChoiceList choices={q.choices ?? []} type="check" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s.slice(-2) })} />
        </div>
      );
    case "rc":
    case "mc":
      return (
        <div className="space-y-3">
          <Rich text={q.prompt} />
          <ChoiceList choices={q.choices ?? []} type="radio" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s })} />
        </div>
      );
    case "rc_multi":
    case "mc_multi":
      return (
        <div className="space-y-3">
          <Rich text={q.prompt} />
          <p className="text-sm opacity-70">Select all that apply.</p>
          <ChoiceList choices={q.choices ?? []} type="check" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s })} />
        </div>
      );
    case "rc_select":
      return (
        <div className="space-y-3">
          <Rich text={q.prompt} />
          <p className="text-sm opacity-70">Click a sentence in the passage to select it.{sel.length ? ` Selected sentence ${sel[0] + 1}.` : ""}</p>
        </div>
      );
    case "qc": {
      const opts = ["Quantity A is greater.", "Quantity B is greater.", "The two quantities are equal.", "The relationship cannot be determined from the information given."];
      return (
        <div className="space-y-3">
          {q.prompt && <Rich text={q.prompt} />}
          {q.qc?.info && <Rich text={q.qc.info} className="rounded border p-3" />}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded border p-3"><div className="mb-1 text-sm font-semibold">Quantity A</div><Rich text={q.qc?.a ?? ""} /></div>
            <div className="rounded border p-3"><div className="mb-1 text-sm font-semibold">Quantity B</div><Rich text={q.qc?.b ?? ""} /></div>
          </div>
          <ChoiceList choices={opts} type="radio" sel={sel} disabled={disabled} keySel={keySel} onChange={(s) => onChange({ sel: s })} />
        </div>
      );
    }
    case "numeric": {
      const fraction = q.numeric?.kind === "fraction";
      return (
        <div className="space-y-3">
          <Rich text={q.prompt} />
          <div className="flex items-center gap-2">
            {fraction ? (
              <div className="inline-flex flex-col items-center gap-1">
                <input aria-label="numerator" disabled={disabled} inputMode="decimal" className="w-24 rounded border bg-transparent px-2 py-1 text-center" value={answer?.frac?.[0] ?? ""} onChange={(e) => onChange({ frac: [e.target.value, answer?.frac?.[1] ?? ""] })} />
                <div className="h-px w-24 bg-current" />
                <input aria-label="denominator" disabled={disabled} inputMode="decimal" className="w-24 rounded border bg-transparent px-2 py-1 text-center" value={answer?.frac?.[1] ?? ""} onChange={(e) => onChange({ frac: [answer?.frac?.[0] ?? "", e.target.value] })} />
              </div>
            ) : (
              <input aria-label="answer" disabled={disabled} inputMode="decimal" className="w-40 rounded border bg-transparent px-3 py-2" value={answer?.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
            )}
            {q.numeric?.unit && <span>{q.numeric.unit}</span>}
          </div>
          {keyValue && <p className="text-sm text-green-600">Answer: {keyValue}</p>}
        </div>
      );
    }
  }
}

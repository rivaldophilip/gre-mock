"use client";
import { useState } from "react";
import { IconX } from "./icons";
import { btn } from "./ui";

const KEY = {
  num: "bg-surface text-fg border border-line hover:bg-surface-2 text-lg",
  op: "bg-accent-soft text-accent hover:bg-accent/20 text-lg",
  fn: "bg-surface-2 text-muted hover:text-fg text-sm",
  eq: "bg-accent text-accent-fg hover:bg-accent/90 text-lg",
};

function Btn({ label, onClick, kind = "num", aria }: { label: string; onClick: () => void; kind?: keyof typeof KEY; aria?: string }) {
  return (
    <button type="button" aria-label={aria} onClick={onClick} className={`h-12 select-none rounded-xl font-semibold tabular-nums transition-colors active:scale-95 md:h-10 ${KEY[kind]}`}>
      {label}
    </button>
  );
}

/** ETS-style on-screen calculator: + - × ÷ ± √ ( ) MR MC M+ C CE, Transfer Display, 8-digit display. */
export function Calculator({ onTransfer, onClose }: { onTransfer?: (v: string) => void; onClose: () => void }) {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState<string[]>([]); // tokens: numbers, operators, parens
  const [fresh, setFresh] = useState(true);
  const [mem, setMem] = useState(0);
  const [err, setErr] = useState(false);

  const show = (n: number) => {
    if (!Number.isFinite(n)) {
      setErr(true);
      setDisplay("Error");
      return;
    }
    let s = String(Number(n.toPrecision(12)));
    if (s.length > 8 || /e/.test(s)) {
      if (Math.abs(n) >= 1e8 || /e/.test(s)) {
        setErr(true);
        setDisplay("Error");
        return;
      }
      const intLen = Math.abs(Math.trunc(n)) === 0 ? 0 : String(Math.abs(Math.trunc(n))).length;
      s = String(Number(n.toFixed(Math.max(0, 8 - intLen))));
    }
    setDisplay(s);
  };

  const evaluate = (tokens: string[]): number => {
    // shunting-yard over + - * / with parens
    const out: (number | string)[] = [];
    const ops: string[] = [];
    const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
    for (const t of tokens) {
      if (/^-?\d*\.?\d+$/.test(t) || /^-?\d+\.$/.test(t)) out.push(parseFloat(t));
      else if (t === "(") ops.push(t);
      else if (t === ")") {
        while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop()!);
        ops.pop();
      } else {
        while (ops.length && ops[ops.length - 1] !== "(" && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop()!);
        ops.push(t);
      }
    }
    while (ops.length) out.push(ops.pop()!);
    const st: number[] = [];
    for (const t of out) {
      if (typeof t === "number") st.push(t);
      else {
        const b = st.pop()!;
        const a = st.pop()!;
        st.push(t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : a / b);
      }
    }
    return st[0];
  };

  const digit = (d: string) => {
    if (err) return;
    if (fresh) {
      setDisplay(d === "." ? "0." : d);
      setFresh(false);
    } else {
      if (d === "." && display.includes(".")) return;
      if (display.replace(/[-.]/g, "").length >= 8) return;
      setDisplay(display === "0" && d !== "." ? d : display + d);
    }
  };
  const op = (o: string) => {
    if (err) return;
    if (fresh && expr.length && !["(", ")"].includes(expr[expr.length - 1])) {
      setExpr([...expr.slice(0, -1), o]);
      return;
    }
    const lastTok = expr[expr.length - 1];
    const next = lastTok === ")" ? [...expr, o] : [...expr, display, o];
    setExpr(next);
    setFresh(true);
  };
  const paren = (p: "(" | ")") => {
    if (err) return;
    if (p === "(") {
      setExpr([...expr, "("]);
      setFresh(true);
    } else {
      setExpr([...expr, ...(fresh && expr[expr.length - 1] === ")" ? [] : [display]), ")"]);
      setFresh(true);
    }
  };
  const equals = () => {
    if (err) return;
    let toks = fresh && expr.length && expr[expr.length - 1] !== ")" && !["(" ].includes(expr[expr.length - 1]) ? expr.slice(0, -1) : [...expr, ...(expr[expr.length - 1] === ")" && fresh ? [] : [display])];
    let depth = 0;
    for (const t of toks) depth += t === "(" ? 1 : t === ")" ? -1 : 0;
    toks = [...toks, ...Array(Math.max(0, depth)).fill(")")];
    try {
      const r = toks.length ? evaluate(toks) : parseFloat(display);
      show(r);
    } catch {
      setErr(true);
      setDisplay("Error");
    }
    setExpr([]);
    setFresh(true);
  };
  const clearAll = () => {
    setDisplay("0");
    setExpr([]);
    setFresh(true);
    setErr(false);
  };
  const val = () => parseFloat(display);

  return (
    // phone: bottom sheet over the action bar; desktop: floating panel
    <div
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgb(0_0_0/0.2)] md:inset-x-auto md:bottom-5 md:right-5 md:w-80 md:rounded-2xl md:pb-4 md:shadow-xl"
      role="dialog"
      aria-label="Calculator"
    >
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Calculator{mem !== 0 && <span className="ml-2 rounded-md bg-surface-2 px-1.5 py-0.5 text-xs text-muted">M</span>}</span>
        <button type="button" onClick={onClose} aria-label="Close calculator" className="grid size-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg">
          <IconX size={18} />
        </button>
      </div>
      <div className={`mb-3 truncate rounded-xl bg-surface-2 px-3.5 py-3 text-right font-mono text-3xl font-medium tabular-nums ${err ? "text-bad" : ""}`} data-testid="calc-display">{display}</div>
      <div className="grid grid-cols-5 gap-1.5">
        <Btn kind="fn" label="MR" onClick={() => { setDisplay(String(mem)); setFresh(true); }} />
        <Btn kind="fn" label="MC" onClick={() => setMem(0)} />
        <Btn kind="fn" label="M+" onClick={() => !err && setMem(mem + val())} />
        <Btn kind="fn" label="CE" onClick={() => { setDisplay("0"); setFresh(true); setErr(false); }} />
        <Btn kind="fn" label="C" onClick={clearAll} />
        <Btn label="7" onClick={() => digit("7")} /><Btn label="8" onClick={() => digit("8")} /><Btn label="9" onClick={() => digit("9")} />
        <Btn kind="op" label="÷" aria="divide" onClick={() => op("/")} /><Btn kind="op" label="√" aria="square root" onClick={() => !err && (val() < 0 ? (setErr(true), setDisplay("Error")) : (show(Math.sqrt(val())), setFresh(true)))} />
        <Btn label="4" onClick={() => digit("4")} /><Btn label="5" onClick={() => digit("5")} /><Btn label="6" onClick={() => digit("6")} />
        <Btn kind="op" label="×" aria="multiply" onClick={() => op("*")} /><Btn kind="op" label="±" aria="change sign" onClick={() => !err && setDisplay(display.startsWith("-") ? display.slice(1) : display === "0" ? "0" : "-" + display)} />
        <Btn label="1" onClick={() => digit("1")} /><Btn label="2" onClick={() => digit("2")} /><Btn label="3" onClick={() => digit("3")} />
        <Btn kind="op" label="−" aria="subtract" onClick={() => op("-")} /><Btn kind="op" label="(" onClick={() => paren("(")} />
        <Btn label="0" onClick={() => digit("0")} /><Btn label="." onClick={() => digit(".")} /><Btn kind="eq" label="=" aria="equals" onClick={equals} />
        <Btn kind="op" label="+" aria="add" onClick={() => op("+")} /><Btn kind="op" label=")" onClick={() => paren(")")} />
      </div>
      {onTransfer && (
        <button type="button" onClick={() => !err && onTransfer(display)} className={`${btn("primary")} mt-3 w-full`}>
          Transfer Display
        </button>
      )}
    </div>
  );
}

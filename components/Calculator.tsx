"use client";
import { useState } from "react";

function Btn({ label, onClick, cls = "" }: { label: string; onClick: () => void; cls?: string }) {
  return (
    <button onClick={onClick} className={`rounded border px-2 py-2 text-sm hover:bg-black/10 dark:hover:bg-white/10 ${cls}`}>
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
    <div className="fixed bottom-4 right-4 z-50 w-64 rounded-lg border bg-[var(--background)] p-3 shadow-xl" role="dialog" aria-label="Calculator">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
        <span>Calculator</span>
        <button onClick={onClose} aria-label="Close calculator">✕</button>
      </div>
      <div className="mb-2 rounded border bg-black/5 px-2 py-2 text-right font-mono text-2xl dark:bg-white/10" data-testid="calc-display">{display}</div>
      <div className="grid grid-cols-5 gap-1">
        <Btn label="MR" onClick={() => { setDisplay(String(mem)); setFresh(true); }} />
        <Btn label="MC" onClick={() => setMem(0)} />
        <Btn label="M+" onClick={() => !err && setMem(mem + val())} />
        <Btn label="CE" onClick={() => { setDisplay("0"); setFresh(true); setErr(false); }} />
        <Btn label="C" onClick={clearAll} />
        <Btn label="7" onClick={() => digit("7")} /><Btn label="8" onClick={() => digit("8")} /><Btn label="9" onClick={() => digit("9")} />
        <Btn label="÷" onClick={() => op("/")} /><Btn label="√" onClick={() => !err && (val() < 0 ? (setErr(true), setDisplay("Error")) : (show(Math.sqrt(val())), setFresh(true)))} />
        <Btn label="4" onClick={() => digit("4")} /><Btn label="5" onClick={() => digit("5")} /><Btn label="6" onClick={() => digit("6")} />
        <Btn label="×" onClick={() => op("*")} /><Btn label="±" onClick={() => !err && setDisplay(display.startsWith("-") ? display.slice(1) : display === "0" ? "0" : "-" + display)} />
        <Btn label="1" onClick={() => digit("1")} /><Btn label="2" onClick={() => digit("2")} /><Btn label="3" onClick={() => digit("3")} />
        <Btn label="−" onClick={() => op("-")} /><Btn label="(" onClick={() => paren("(")} />
        <Btn label="0" onClick={() => digit("0")} /><Btn label="." onClick={() => digit(".")} /><Btn label="=" onClick={equals} cls="bg-blue-600 text-white" />
        <Btn label="+" onClick={() => op("+")} /><Btn label=")" onClick={() => paren(")")} />
      </div>
      {onTransfer && (
        <button onClick={() => !err && onTransfer(display)} className="mt-2 w-full rounded border px-2 py-1 text-sm hover:bg-black/10 dark:hover:bg-white/10">
          Transfer Display
        </button>
      )}
    </div>
  );
}

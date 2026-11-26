"use client";
import { useState } from "react";
import Link from "next/link";
import { FallbackDialog, type FallbackLine } from "./FallbackDialog";
import { StartForm } from "./StartForm";
import { IconAlert, IconCheck } from "./icons";
import { badge, btn, card, eyebrow, field, seg, segItem } from "./ui";

type Measure = "verbal" | "quant";
export type TopicGroup = { area: string; items: { id: string; name: string }[] };
type Preview = { total: number; minutes: number; byType: Record<string, number>; byLevel: Record<string, number>; byTarget: Record<string, number> };
type Created = { id: number; testId: string; title: string; status: "ready" | "draft"; fallbacks: FallbackLine[]; preview: Preview };

/** A toggle chip for one target: accent when on. */
const chip = (on: boolean) =>
  `inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-sm transition-colors ${on ? "border-accent/50 bg-accent-soft font-medium text-accent" : "border-line hover:bg-surface-2"}`;

const TYPE_NAME: Record<string, string> = { tc1: "TC, 1 blank", tc2: "TC, 2 blanks", tc3: "TC, 3 blanks", se: "Sentence equivalence", rc: "Reading", rc_multi: "Reading, select all", rc_select: "Reading, select sentence", arg: "Argument", qc: "Quantitative comparison", mc: "Multiple choice", mc_multi: "Multiple choice, select all", numeric: "Numeric entry", di: "Data interpretation" };

/**
 * Choose a full mock or a custom quiz, assemble it on the server, then start it. A draft (the bank ran short) opens
 * the fallback dialog first; the preview shows counts only, never an item.
 */
export function CreateQuiz({ initialMeasure, initialKind, topics, types }: { initialMeasure: Measure; initialKind: "mock" | "custom"; topics: Record<Measure, TopicGroup[]>; types: Record<Measure, { id: string; label: string }[]> }) {
  const [measure, setMeasure] = useState<Measure>(initialMeasure);
  const [kind, setKind] = useState<"mock" | "custom">(initialKind);
  const [length, setLength] = useState(10);
  const [picked, setPicked] = useState<Record<Measure, Set<string>>>({ verbal: new Set(["tc3", "se"]), quant: new Set(["qc", "mc"]) });
  const [weakest, setWeakest] = useState(true);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [levels, setLevels] = useState<[number, number]>([3, 5]);
  const [timer, setTimer] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string[] | null>(null);
  const [made, setMade] = useState<Created | null>(null);
  const [confirming, setConfirming] = useState(false);

  const toggle = (s: Set<string>, id: string) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  };
  const switchMeasure = (m: Measure) => {
    setMeasure(m);
    setChosen(new Set());
    setMade(null);
  };

  async function assemble() {
    setBusy(true);
    setError(null);
    const body =
      kind === "mock"
        ? { kind, measure }
        : { kind, measure, length, types: [...picked[measure]], targets: weakest ? "weakest" : [...chosen], levels, timer };
    const r = await fetch("/api/quizzes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => null);
    setBusy(false);
    if (!r.ok) {
      setError(j?.failures?.map((f: FallbackLine) => f.note) ?? [j?.error ?? "could not assemble a quiz"]);
      return;
    }
    setMade(j);
    setConfirming(j.status === "draft");
  }

  const customOk = picked[measure].size > 0 && (weakest || chosen.size > 0) && length >= 1;
  const counts = (m: Record<string, number>, name: (k: string) => string) =>
    Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => (
        <li key={k} className="flex justify-between gap-3">
          <span className="truncate">{name(k)}</span>
          <span className="tabular-nums text-muted">{n}</span>
        </li>
      ));

  if (made && !confirming)
    return (
      <section className={`${card} space-y-5 p-5 sm:p-6`}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ok-soft text-ok"><IconCheck size={20} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{made.title}</h2>
            <p className="text-sm text-muted">
              {made.preview.total} questions · {kind === "custom" && !timer ? "untimed" : `${made.preview.minutes} min`}
              {made.fallbacks.length > 0 && <> · <span className={badge("warn")}>{made.fallbacks.length} substitutes</span></>}
            </p>
          </div>
        </div>
        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="space-y-1.5"><h3 className={eyebrow}>Types</h3><ul className="space-y-0.5">{counts(made.preview.byType, (k) => TYPE_NAME[k] ?? k)}</ul></div>
          <div className="space-y-1.5"><h3 className={eyebrow}>Difficulty</h3><ul className="space-y-0.5">{counts(made.preview.byLevel, (k) => `Difficulty ${k}`)}</ul></div>
          <div className="space-y-1.5"><h3 className={eyebrow}>Topics</h3><ul className="max-h-48 space-y-0.5 overflow-y-auto pr-1">{counts(made.preview.byTarget, (k) => k)}</ul></div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <StartForm testId={made.testId} timerOn={kind === "mock" || timer} />
          <Link href={`/?tab=${measure}`} className={btn("ghost", "sm")}>Start later</Link>
        </div>
      </section>
    );

  return (
    <>
      <section className={`${card} space-y-5 p-5 sm:p-6`}>
        <div className="flex flex-wrap gap-3">
          <nav className={`${seg} w-full sm:w-56`} aria-label="Measure">
            {(["verbal", "quant"] as const).map((m) => (
              <button key={m} type="button" onClick={() => switchMeasure(m)} aria-pressed={measure === m} className={`${segItem(measure === m)} capitalize`}>{m}</button>
            ))}
          </nav>
          <nav className={`${seg} w-full sm:w-64`} aria-label="Quiz kind">
            <button type="button" onClick={() => setKind("mock")} aria-pressed={kind === "mock"} className={segItem(kind === "mock")}>Full mock</button>
            <button type="button" onClick={() => setKind("custom")} aria-pressed={kind === "custom"} className={segItem(kind === "custom")}>Custom</button>
          </nav>
        </div>

        {kind === "mock" ? (
          <p className="text-sm text-muted">
            27 questions in two timed sections, laid out like the real GRE {measure} measure and aimed by your stats: weak and untested {measure === "quant" ? "concepts" : "words and reading skills"} first, with revisits of questions you missed.
          </p>
        ) : (
          <div className="space-y-5">
            <label className="block space-y-1.5">
              <span className={eyebrow}>Questions</span>
              <input type="number" min={1} max={40} value={length} onChange={(e) => setLength(Math.max(1, Math.min(40, Number(e.target.value) || 1)))} className={`${field} w-28`} />
            </label>
            <fieldset className="space-y-2">
              <legend className={eyebrow}>Types</legend>
              <div className="flex flex-wrap gap-2">
                {types[measure].map((t) => (
                  <label key={t.id} className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${picked[measure].has(t.id) ? "border-accent/50 bg-accent-soft" : "border-line"}`}>
                    <input type="checkbox" checked={picked[measure].has(t.id)} onChange={() => setPicked({ ...picked, [measure]: toggle(picked[measure], t.id) })} />
                    {t.label}
                  </label>
                ))}
              </div>
              {(picked[measure].has("di") || picked[measure].has("rc")) && <p className="text-xs text-muted">Data sets and reading passages come whole: a set counts as its questions.</p>}
            </fieldset>
            <fieldset className="space-y-2">
              <legend className={eyebrow}>{measure === "quant" ? "Concepts" : "Reading skills"}</legend>
              {/* every topic stays in view: "my weakest" is the default chip, picking a topic replaces it, and clearing the last one brings it back */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button type="button" aria-pressed={weakest} onClick={() => { setWeakest(true); setChosen(new Set()); }} className={chip(weakest)}>
                  {weakest && <IconCheck size={14} />} My weakest
                </button>
                <span className="text-muted">or pick {measure === "quant" ? "concepts" : "skills"}:</span>
              </div>
              <div className="space-y-3">
                {topics[measure].map((g) => (
                  <div key={g.area} className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-muted">{g.area}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((it) => (
                        <button
                          key={it.id}
                          type="button"
                          aria-pressed={chosen.has(it.id)}
                          onClick={() => {
                            const next = toggle(chosen, it.id);
                            setChosen(next);
                            setWeakest(next.size === 0);
                          }}
                          className={chip(chosen.has(it.id))}
                        >
                          {it.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {measure === "verbal" && <p className="text-xs text-muted">Completions aim at your {weakest ? "weakest" : "highest-priority"} words; skills steer the reading passages.</p>}
            </fieldset>
            <div className="flex flex-wrap items-end gap-4">
              <label className="space-y-1.5">
                <span className={`${eyebrow} block`}>Difficulty (1 easiest – 5 hardest)</span>
                <span className="flex items-center gap-2 text-sm">
                  <select className={`${field} w-20`} value={levels[0]} onChange={(e) => setLevels([Number(e.target.value), Math.max(Number(e.target.value), levels[1])])}>
                    {[1, 2, 3, 4, 5].map((l) => <option key={l}>{l}</option>)}
                  </select>
                  to
                  <select className={`${field} w-20`} value={levels[1]} onChange={(e) => setLevels([Math.min(levels[0], Number(e.target.value)), Number(e.target.value)])}>
                    {[1, 2, 3, 4, 5].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </span>
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={timer} onChange={(e) => setTimer(e.target.checked)} /> Timed (each type at real-test pace)
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-1 rounded-xl bg-bad-soft px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-bad"><IconAlert size={16} /> The bank cannot fill this quiz</p>
            <ul className="list-disc space-y-0.5 pl-5">{error.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <button className={`${btn("primary")} w-full sm:w-auto`} disabled={busy || (kind === "custom" && !customOk)} onClick={assemble}>
          {busy ? "Assembling…" : kind === "mock" ? `Assemble a ${measure} mock` : "Assemble quiz"}
        </button>
      </section>
      {made && confirming && (
        <FallbackDialog
          quizId={made.id}
          fallbacks={made.fallbacks}
          onProceed={() => setConfirming(false)}
          onCancel={() => {
            setMade(null);
            setConfirming(false);
          }}
        />
      )}
    </>
  );
}

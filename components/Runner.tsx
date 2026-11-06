"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Answer, Explanation, Key, PublicTest } from "@/lib/types";
import { isAnswered } from "@/lib/scoring";
import type { SectionState } from "@/lib/clock";
import { Calculator } from "./Calculator";
import { Figure } from "./Figure";
import { PassagePane } from "./PassagePane";
import { QuestionRenderer } from "./QuestionRenderer";
import { Rich } from "./Rich";
import { ReviewGrid } from "./ReviewGrid";

type Meta = { guessed: boolean; marked: boolean; timeMs: number; finalized: boolean };
type Reveal = { key: Key; explanation: Explanation; isCorrect: boolean };

export interface RunnerProps {
  test: PublicTest;
  attemptId: number;
  mode: "exam" | "practice";
  timerOn: boolean;
  sectionState: SectionState;
  secondsLeft: Record<string, number | null>;
  initial: Record<string, { answer: Answer | null; guessed: boolean; marked: boolean; timeMs: number; finalized: boolean }>;
  reveals: Record<string, Reveal>;
  position: number;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function Runner(p: RunnerProps) {
  const { test, attemptId, mode, timerOn } = p;
  const router = useRouter();
  const [sectionState, setSectionState] = useState<SectionState>(p.sectionState);
  const [section, setSection] = useState<1 | 2>(() => (p.sectionState["1"]?.finishedAt ? 2 : 1));
  const qs = useMemo(() => test.questions.filter((q) => q.section === section), [test, section]);
  const sectionStarted = !!sectionState[String(section)]?.startedAt;
  const sectionDone = !!sectionState[String(section)]?.finishedAt;
  const minutes = test.sections.find((s) => s.n === section)!.minutes;

  const [idx, setIdx] = useState(() => (p.sectionState[String(section)]?.startedAt ? Math.min(p.position, qs.length - 1) : 0));
  const [answers, setAnswers] = useState<Record<string, Answer | undefined>>(() =>
    Object.fromEntries(Object.entries(p.initial).map(([k, v]) => [k, v.answer ?? undefined])),
  );
  const [meta, setMeta] = useState<Record<string, Meta>>(() =>
    Object.fromEntries(Object.entries(p.initial).map(([k, v]) => [k, { guessed: v.guessed, marked: v.marked, timeMs: v.timeMs, finalized: v.finalized }])),
  );
  const [reveals, setReveals] = useState<Record<string, Reveal>>(p.reveals);
  const [left, setLeft] = useState<number | null>(p.secondsLeft[String(section)] ?? null);
  // practice mode: the clock stops while a revealed answer is read, and restarts on the next navigation
  const [paused, setPaused] = useState(() => mode === "practice" && !!p.sectionState[String(section)]?.pausedAt);
  const [calc, setCalc] = useState(false);
  const [grid, setGrid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveErr, setSaveErr] = useState(false);

  const q = qs[idx];
  const cur = q ? (meta[q.id] ?? { guessed: false, marked: false, timeMs: 0, finalized: false }) : undefined;
  const entered = useRef(0);
  const latest = useRef({ answers, meta });
  useEffect(() => {
    latest.current = { answers, meta };
  }, [answers, meta]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // questions whose latest state has not reached the server yet (failed or pending saves)
  const dirty = useRef<Set<string>>(new Set());

  const post = useCallback(
    async (qid: string, extra: { commit?: boolean; position?: number; resume?: boolean } = {}, spent = 0) => {
      const m = latest.current.meta[qid] ?? { guessed: false, marked: false, timeMs: 0, finalized: false };
      try {
        const r = await fetch(`/api/attempts/${attemptId}/response`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            questionId: qid,
            answer: latest.current.answers[qid] ?? null,
            timeMs: m.timeMs + spent,
            guessed: m.guessed,
            marked: m.marked,
            ...extra,
          }),
        });
        // 409 = section closed / time up / answer locked: retrying cannot help
        if (r.ok || r.status === 409) dirty.current.delete(qid);
        setSaveErr(dirty.current.size > 0);
        return r.ok ? await r.json() : null;
      } catch {
        setSaveErr(true);
        return null;
      }
    },
    [attemptId],
  );

  /** Re-send every question whose last save failed. */
  const flush = useCallback(async () => {
    await Promise.all([...dirty.current].map((qid) => post(qid)));
  }, [post]);

  useEffect(() => {
    const onOnline = () => void flush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);

  // time spent on the current question is folded into meta whenever we leave it
  const settle = useCallback(() => {
    if (!q) return 0;
    const spent = Date.now() - entered.current;
    entered.current = Date.now();
    setMeta((m) => ({ ...m, [q.id]: { ...(m[q.id] ?? { guessed: false, marked: false, finalized: false, timeMs: 0 }), timeMs: (m[q.id]?.timeMs ?? 0) + spent } }));
    latest.current = { answers: latest.current.answers, meta: { ...latest.current.meta, [q.id]: { ...(latest.current.meta[q.id] ?? { guessed: false, marked: false, finalized: false, timeMs: 0 }), timeMs: (latest.current.meta[q.id]?.timeMs ?? 0) + spent } } };
    return spent;
  }, [q]);

  const scheduleSave = useCallback(
    (qid: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => post(qid), 400);
    },
    [post],
  );

  const go = useCallback(
    (to: number) => {
      if (!q) return;
      settle();
      if (timer.current) clearTimeout(timer.current);
      const resume = paused;
      if (resume) setPaused(false);
      void post(q.id, resume ? { position: to, resume: true } : { position: to }).then((j) => {
        // resync with the server clock, which excluded the reading time
        if (resume && typeof j?.secondsLeft === "number") setLeft(j.secondsLeft);
        return flush();
      });
      setIdx(to);
    },
    [q, settle, post, flush, paused],
  );

  const finishSection = useCallback(async () => {
    setBusy(true);
    if (q) {
      settle();
      if (timer.current) clearTimeout(timer.current);
      await post(q.id);
    }
    await flush();
    const r = await fetch(`/api/attempts/${attemptId}/section`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ section, action: "finish" }),
    });
    const j = await r.json();
    setBusy(false);
    setGrid(false);
    if (r.ok) {
      setSectionState(j.sectionState);
      if (section === 2) router.push(`/test/${test.id}/review/${attemptId}`);
    }
  }, [q, settle, post, flush, attemptId, section, test.id, router]);

  const startSection = useCallback(async () => {
    setBusy(true);
    const r = await fetch(`/api/attempts/${attemptId}/section`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ section, action: "start" }),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok) {
      setSectionState(j.sectionState);
      setLeft(timerOn ? minutes * 60 : null);
      setPaused(false);
      setIdx(0);
      entered.current = Date.now();
    }
  }, [attemptId, section, timerOn, minutes]);

  // countdown (server-anchored at start; local tick)
  useEffect(() => {
    if (!timerOn || !sectionStarted || sectionDone || left === null || paused) return;
    if (left <= 0) {
      const t = setTimeout(() => void finishSection(), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLeft((l) => (l === null ? l : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left, timerOn, sectionStarted, sectionDone, paused, finishSection]);

  useEffect(() => {
    entered.current = Date.now();
  }, [idx, section]);

  if (!q && !sectionDone) return <p className="p-6">No questions in this section.</p>;

  // ---------- interstitials ----------
  if (sectionDone) {
    const sec1 = section === 1;
    return (
      <main className="mx-auto max-w-xl space-y-4 p-8">
        <h1 className="text-xl font-semibold">Section {section} complete</h1>
        {mode === "exam" && (
          <a className="inline-block rounded border px-3 py-2 underline" target="_blank" href={`/test/${test.id}/review/${attemptId}`}>
            Review Section {section} answers (new tab)
          </a>
        )}
        {sec1 ? (
          <button
            className="block rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => {
              setSection(2);
              setIdx(0);
            }}
          >
            Continue to Section 2
          </button>
        ) : (
          <a className="rounded bg-blue-600 px-4 py-2 text-white" href={`/test/${test.id}/review/${attemptId}`}>
            See results
          </a>
        )}
      </main>
    );
  }

  if (!sectionStarted) {
    return (
      <main className="mx-auto max-w-xl space-y-4 p-8">
        <h1 className="text-xl font-semibold">{test.title} — Section {section}</h1>
        <p>
          {qs.length} questions · {timerOn ? `${minutes} minutes` : "untimed"} · {mode === "exam" ? "Exam mode: answers shown after the section" : "Practice mode: answer shown after each question"}
        </p>
        <button disabled={busy} onClick={startSection} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          Start Section {section}
        </button>
      </main>
    );
  }

  // ---------- running ----------
  const passage = q.passageId ? test.passages.find((x) => x.id === q.passageId) : undefined;
  const figure = q.figureId ? test.figures.find((f) => f.id === q.figureId) : undefined;
  const reveal = reveals[q.id];
  const locked = !!cur?.finalized || !!reveal;
  const a = answers[q.id];
  const setAnswer = (ans: Answer) => {
    if (locked) return;
    dirty.current.add(q.id);
    setAnswers((m) => ({ ...m, [q.id]: ans }));
    latest.current = { ...latest.current, answers: { ...latest.current.answers, [q.id]: ans } };
    scheduleSave(q.id);
  };
  const setFlag = (k: "guessed" | "marked", v: boolean) => {
    setMeta((m) => ({ ...m, [q.id]: { ...(m[q.id] ?? { guessed: false, marked: false, timeMs: 0, finalized: false }), [k]: v } }));
    latest.current = { ...latest.current, meta: { ...latest.current.meta, [q.id]: { ...(latest.current.meta[q.id] ?? { guessed: false, marked: false, timeMs: 0, finalized: false }), [k]: v } } };
    if (!locked) {
      dirty.current.add(q.id);
      scheduleSave(q.id);
    }
  };
  const check = async () => {
    setBusy(true);
    settle();
    if (timer.current) clearTimeout(timer.current);
    const j = await post(q.id, { commit: true, position: idx }, 0);
    setBusy(false);
    if (j?.reveal) {
      if (timerOn) setPaused(true);
      if (typeof j.secondsLeft === "number") setLeft(j.secondsLeft);
      setReveals((r) => ({ ...r, [q.id]: j.reveal }));
      setMeta((m) => ({ ...m, [q.id]: { ...(m[q.id] ?? { guessed: false, marked: false, timeMs: 0 }), finalized: true } as Meta }));
    }
  };
  const gridItems = qs.map((x, i) => ({ n: i + 1, answered: isAnswered(x, answers[x.id]), marked: !!meta[x.id]?.marked }));
  const isQuant = test.measure === "quant";
  const keySel = reveal && "sel" in reveal.key ? reveal.key.sel : undefined;
  const keyValue = reveal && "value" in reveal.key ? reveal.key.value : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-[var(--background)] px-4 py-2 text-sm">
        <span className="font-semibold">{test.title}</span>
        <span className="opacity-70">Section {section} · Q{idx + 1}/{qs.length}</span>
        <span className="flex-1" />
        {saveErr && <span className="text-red-500">save failed — will retry</span>}
        {timerOn && left !== null && (
          <span data-testid="timer" className={`font-mono ${paused ? "opacity-60" : left < 300 ? "text-red-500" : ""}`} title={paused ? "Paused while you read the answer; resumes on the next question" : undefined}>
            {fmt(left)}
            {paused && " ⏸"}
          </span>
        )}
        {isQuant && <button className="rounded border px-2 py-1" onClick={() => setCalc((c) => !c)}>Calculator</button>}
        <button className="rounded border px-2 py-1" onClick={() => setFlag("marked", !cur?.marked)}>{cur?.marked ? "Unmark" : "Mark"}</button>
        <button className="rounded border px-2 py-1" onClick={() => { settle(); setGrid(true); }}>Review</button>
        <button className="rounded border px-2 py-1 disabled:opacity-40" disabled={idx === 0} onClick={() => go(idx - 1)}>Back</button>
        {idx < qs.length - 1 ? (
          <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={() => go(idx + 1)}>Next</button>
        ) : (
          <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={() => { settle(); setGrid(true); }}>End section</button>
        )}
      </header>

      <div className={`flex flex-1 ${passage || figure ? "flex-col md:flex-row" : ""}`}>
        {(passage || figure) && (
          <section className="max-h-[50vh] overflow-y-auto border-b p-5 md:max-h-none md:w-1/2 md:border-b-0 md:border-r">
            {passage && (
              <PassagePane
                passage={passage}
                selectable={q.type === "rc_select"}
                selected={q.type === "rc_select" ? (a?.sel?.[0] ?? undefined) : undefined}
                highlight={q.type === "rc_select" && keySel ? keySel[0] : undefined}
                onSelect={(i) => setAnswer({ sel: [i] })}
              />
            )}
            {figure && <Figure fig={figure} />}
          </section>
        )}
        <section className={`flex-1 space-y-5 p-5 ${passage || figure ? "md:w-1/2" : "mx-auto w-full max-w-3xl"}`}>
          <QuestionRenderer q={q} answer={a} onChange={setAnswer} disabled={locked} keySel={keySel} keyValue={keyValue} />
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!cur?.guessed} disabled={locked} onChange={(e) => setFlag("guessed", e.target.checked)} /> I guessed
            </label>
            {mode === "practice" && !locked && (
              <button disabled={busy || !isAnswered(q, a)} onClick={check} className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-40">
                Check answer
              </button>
            )}
          </div>
          {reveal && (
            <div className={`space-y-2 rounded border p-4 ${reveal.isCorrect ? "border-green-600" : "border-red-500"}`}>
              <p className="font-semibold">{reveal.isCorrect ? "Correct" : "Incorrect"}</p>
              <Rich text={reveal.explanation.key} />
              {reveal.explanation.steps && (
                <ol className="list-decimal space-y-1 pl-5">
                  {reveal.explanation.steps.map((s, i) => <li key={i}><Rich text={s} /></li>)}
                </ol>
              )}
              {reveal.explanation.fast && <p><strong>Faster:</strong> {reveal.explanation.fast}</p>}
              {reveal.explanation.trap && <p><strong>Trap:</strong> {reveal.explanation.trap}</p>}
            </div>
          )}
        </section>
      </div>

      {calc && (
        <Calculator
          onClose={() => setCalc(false)}
          onTransfer={q.type === "numeric" ? (v) => setAnswer(q.numeric?.kind === "fraction" ? { frac: [v, a?.frac?.[1] ?? ""] } : { text: v }) : undefined}
        />
      )}
      {grid && (
        <div>
          <ReviewGrid items={gridItems} current={idx} onGo={(i) => { setGrid(false); go(i); }} onClose={() => setGrid(false)} />
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <button disabled={busy} onClick={finishSection} className="rounded bg-red-600 px-4 py-2 text-white shadow-lg disabled:opacity-50">
              Finish Section {section} now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

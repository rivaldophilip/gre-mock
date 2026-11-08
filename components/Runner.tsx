"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Answer, Explanation, Key, PublicTest } from "@/lib/types";
import { isAnswered } from "@/lib/scoring";
import type { SectionState } from "@/lib/clock";
import { Calculator } from "./Calculator";
import { Figure } from "./Figure";
import { PassagePane } from "./PassagePane";
import { QuestionRenderer } from "./QuestionRenderer";
import { Rich, RichInline } from "./Rich";
import { ReviewGrid } from "./ReviewGrid";
import { IconBack, IconCalc, IconCheck, IconClock, IconFlag, IconGrid, IconNext, IconPause, IconPlay, IconX } from "./icons";
import { btn, card, iconBtn, seg, segItem } from "./ui";

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
  const [paused, setPaused] = useState(() => {
    const st = p.sectionState[String(section)];
    return mode === "practice" && !!st?.pausedAt && (st.pausedFor ?? "reveal") === "reveal";
  });
  // practice mode: the test-taker pressed Pause; the clock stays stopped (and the question hidden) until Resume
  const [held, setHeld] = useState(() => mode === "practice" && p.sectionState[String(section)]?.pausedFor === "hold");
  // the page is hidden (other tab or app, locked phone, closing): the server clock is paused for "away"
  const [away, setAway] = useState(false);
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
    async (qid: string, extra: { commit?: boolean; position?: number; resume?: boolean } = {}, spent = 0, keepalive = false) => {
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
          keepalive,
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
    if (!timerOn || !sectionStarted || sectionDone || left === null || paused || held || away) return;
    if (left <= 0) {
      const t = setTimeout(() => void finishSection(), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLeft((l) => (l === null ? l : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left, timerOn, sectionStarted, sectionDone, paused, held, away, finishSection]);

  // The clock only runs while the page is in front of the test-taker. Leaving (tab, app, lock, close, Pause & exit)
  // saves what is pending and pauses it; coming back resumes it. Heartbeats let the server stop the clock on its own
  // if the page dies without saying goodbye (see lib/clock.ts).
  const active = sectionStarted && !sectionDone;
  const running = timerOn && active;
  const clock = useCallback(
    async (action: "pause" | "resume" | "heartbeat" | "hold" | "release", keepalive = false) => {
      try {
        const r = await fetch(`/api/attempts/${attemptId}/clock`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ section, action }),
          keepalive,
        });
        return r.ok ? ((await r.json()) as { secondsLeft: number | null }) : null;
      } catch {
        return null;
      }
    },
    [attemptId, section],
  );
  const leave = useCallback(() => {
    if (!sectionStarted || sectionDone) return;
    if (q) {
      settle();
      if (timer.current) clearTimeout(timer.current);
      void post(q.id, {}, 0, true);
    }
    for (const qid of dirty.current) if (qid !== q?.id) void post(qid, {}, 0, true);
    if (running) void clock("pause", true);
  }, [sectionStarted, sectionDone, q, settle, post, running, clock]);
  const leaveRef = useRef(leave);
  useEffect(() => {
    leaveRef.current = leave;
  }, [leave]);
  const gone = useRef(false);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const back = () => {
      gone.current = false;
      if (!running) return setAway(false);
      void clock("resume").then((j) => {
        if (typeof j?.secondsLeft === "number") setLeft(j.secondsLeft);
        setAway(false);
      });
    };
    const off = () => {
      if (gone.current) return;
      gone.current = true;
      setAway(true);
      leaveRef.current();
    };
    const onVis = () => (document.visibilityState === "hidden" ? off() : back());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", off);
    window.addEventListener("pageshow", back);
    // lifts an "away" pause left by the last visit (the server keeps a practice reveal pause as it is)
    if (document.visibilityState === "visible") back();
    const beat = setInterval(() => {
      if (running && document.visibilityState === "visible") void clock("heartbeat");
    }, 20_000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", off);
      window.removeEventListener("pageshow", back);
      clearInterval(beat);
    };
  }, [active, running, clock]);

  // leaving through in-app navigation (browser Back) unmounts without a pagehide
  useEffect(
    () => () => {
      if (activeRef.current && !gone.current) leaveRef.current();
    },
    [],
  );

  const pauseAndExit = useCallback(async () => {
    setBusy(true);
    gone.current = true;
    if (q && sectionStarted && !sectionDone) {
      settle();
      if (timer.current) clearTimeout(timer.current);
      await post(q.id);
    }
    await flush();
    if (running) await clock("pause");
    router.push("/");
  }, [q, sectionStarted, sectionDone, settle, post, flush, running, clock, router]);

  // practice Pause / Resume: stays on the page; time on hold counts neither to the section nor to the question
  const toggleHold = useCallback(async () => {
    setBusy(true);
    if (!held) {
      setHeld(true);
      if (q) {
        settle();
        if (timer.current) clearTimeout(timer.current);
        void post(q.id);
      }
      const j = await clock("hold");
      if (typeof j?.secondsLeft === "number") setLeft(j.secondsLeft);
    } else {
      const j = await clock("release");
      if (typeof j?.secondsLeft === "number") setLeft(j.secondsLeft);
      entered.current = Date.now();
      setHeld(false);
    }
    setBusy(false);
  }, [held, q, settle, post, clock]);

  useEffect(() => {
    entered.current = Date.now();
  }, [idx, section]);

  // phones show passage and question one at a time; the choice resets per question (rc_select answers in the passage)
  const [paneFor, setPaneFor] = useState<{ id: string; pane: "passage" | "question" } | null>(null);
  const pane = q && paneFor?.id === q.id ? paneFor.pane : q?.type === "rc_select" ? "passage" : "question";
  const questionPane = useRef<HTMLElement>(null);
  const passagePane = useRef<HTMLElement>(null);
  const passageId = q?.passageId;
  useEffect(() => {
    window.scrollTo({ top: 0 });
    questionPane.current?.scrollTo({ top: 0 });
  }, [idx, section]);
  useEffect(() => {
    passagePane.current?.scrollTo({ top: 0 });
  }, [passageId]);

  if (!q && !sectionDone) return <p className="p-6 text-muted">No questions in this section.</p>;

  // ---------- interstitials ----------
  const shell = (children: React.ReactNode) => (
    <main className="flex flex-1 items-center justify-center px-4 py-10 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className={`${card} w-full max-w-md space-y-6 p-6 sm:p-8`}>{children}</div>
    </main>
  );
  const stat = (label: string, value: string) => (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );

  if (sectionDone) {
    const sec1 = section === 1;
    return shell(
      <>
        <div className="space-y-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-ok-soft text-ok"><IconCheck size={24} /></span>
          <div>
            <p className="text-sm text-muted">{test.title}</p>
            <h1 className="text-2xl font-semibold tracking-tight">Section {section} complete</h1>
          </div>
          {sec1 && <p className="text-muted">Take a breath. Section 2 starts its own timer when you begin it.</p>}
        </div>
        <div className="flex flex-col gap-2.5">
          {sec1 ? (
            <button
              className={`${btn("primary", "lg")} w-full`}
              onClick={() => {
                setSection(2);
                setIdx(0);
              }}
            >
              Continue to Section 2 <IconNext size={18} />
            </button>
          ) : (
            <a className={`${btn("primary", "lg")} w-full`} href={`/test/${test.id}/review/${attemptId}`}>
              See results <IconNext size={18} />
            </a>
          )}
          {mode === "exam" && sec1 && (
            <a className={`${btn("secondary")} w-full`} target="_blank" href={`/test/${test.id}/review/${attemptId}`}>
              Review Section 1 answers (new tab)
            </a>
          )}
        </div>
      </>,
    );
  }

  if (!sectionStarted) {
    return shell(
      <>
        <div className="space-y-1">
          <p className="text-sm text-muted">{test.title}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Section {section}</h1>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stat("Questions", String(qs.length))}
          {stat("Time", timerOn ? `${minutes} min` : "Untimed")}
          {stat("Mode", mode === "exam" ? "Exam" : "Practice")}
        </div>
        <p className="text-muted">
          {mode === "exam"
            ? "Answers are shown after the section. You can move between questions and mark any to revisit."
            : "Check each answer as you go. The clock pauses while you read an explanation."}
        </p>
        <div className="flex flex-col gap-2.5">
          <button disabled={busy} onClick={startSection} className={`${btn("primary", "lg")} w-full`}>
            {busy ? "Starting…" : `Start Section ${section}`}
          </button>
          <Link href="/" className={`${btn("ghost")} w-full`}>Back to tests</Link>
        </div>
      </>,
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

  const last = idx === qs.length - 1;
  const unanswered = gridItems.filter((g) => !g.answered).length;
  const openGrid = () => {
    settle();
    setGrid(true);
  };
  const showPassage = !!passage && pane === "passage";
  const timerPill = timerOn && left !== null && (
    <span
      data-testid="timer"
      title={held ? "Paused" : paused ? "Paused while you read the answer; resumes on the next question" : undefined}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 font-mono text-sm font-semibold tabular-nums ${
        paused || held ? "bg-surface-2 text-muted" : left < 300 ? "bg-warn-soft text-warn" : "bg-surface-2 text-fg"
      }`}
    >
      {paused || held ? <IconPause size={12} /> : <IconClock size={15} />}
      {fmt(left)}
    </span>
  );
  const nextBtn = last ? (
    <button className={btn("primary")} onClick={openGrid}>End section</button>
  ) : (
    <button className={`${btn("primary")} px-5`} onClick={() => go(idx + 1)}>
      Next <IconNext size={17} />
    </button>
  );

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-3 sm:px-4">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{test.title}</div>
            <div className="truncate text-xs text-muted">
              Section {section} · Question {idx + 1} of {qs.length}
            </div>
          </div>
          {saveErr && (
            <span role="status" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-bad-soft px-2.5 py-1 text-xs font-medium text-bad">
              <span className="size-1.5 animate-pulse rounded-full bg-bad" />
              <span className="hidden sm:inline">Save failed, retrying</span>
              <span className="sm:hidden">Not saved</span>
            </span>
          )}
          {timerPill}
          {isQuant && (
            <button className={iconBtn(calc, "accent")} aria-label="Calculator" aria-pressed={calc} title="Calculator" onClick={() => setCalc((c) => !c)}>
              <IconCalc size={18} />
            </button>
          )}
          <button className={iconBtn(!!cur?.marked)} aria-label={cur?.marked ? "Unmark question" : "Mark question"} aria-pressed={!!cur?.marked} title={cur?.marked ? "Unmark" : "Mark for review"} onClick={() => setFlag("marked", !cur?.marked)}>
            <IconFlag size={18} on={!!cur?.marked} />
          </button>
          {mode === "practice" && timerOn ? (
            <button
              className={iconBtn(held, "accent")}
              disabled={busy}
              aria-label={held ? "Resume" : "Pause"}
              aria-pressed={held}
              title={held ? "Resume the clock" : "Pause the clock"}
              onClick={() => void toggleHold()}
            >
              {held ? <IconPlay size={16} /> : <IconPause size={16} />}
            </button>
          ) : (
            <button
              className={iconBtn()}
              disabled={busy}
              aria-label={timerOn ? "Pause and exit" : "Save and exit"}
              title={timerOn ? "Pause the clock and exit; resume from the dashboard" : "Save and exit; resume from the dashboard"}
              onClick={() => void pauseAndExit()}
            >
              <IconPause size={16} />
            </button>
          )}
          <div className="ml-2 hidden items-center gap-2 md:flex">
            <button className={btn("soft")} onClick={openGrid}>
              <IconGrid size={17} /> Review
            </button>
            <button className={btn("secondary")} disabled={idx === 0} onClick={() => go(idx - 1)}>
              <IconBack size={17} /> Back
            </button>
            {nextBtn}
          </div>
        </div>
        {passage && (
          <div className="px-3 pb-2.5 md:hidden">
            <div className={seg} role="tablist" aria-label="Show">
              {(["passage", "question"] as const).map((p) => (
                <button key={p} role="tab" aria-selected={pane === p} onClick={() => setPaneFor({ id: q.id, pane: p })} className={`${segItem(pane === p)} capitalize`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="h-[3px] bg-surface-2" aria-hidden>
          <div className="h-full rounded-r-full bg-accent transition-[width] duration-300" style={{ width: `${((idx + 1) / qs.length) * 100}%` }} />
        </div>
      </header>

      <div className={`flex-1 md:min-h-0 ${passage || figure ? "md:grid md:grid-cols-2 md:grid-rows-[minmax(0,1fr)]" : "md:overflow-y-auto"}`}>
        {(passage || figure) && (
          <section
            ref={passagePane}
            className={`${showPassage ? "block" : "hidden"} border-line px-4 pb-28 pt-5 sm:px-6 md:block md:bg-surface md:overflow-y-auto md:border-r md:pb-10 md:pt-7 lg:px-10`}
          >
            <div className="mx-auto max-w-[68ch] space-y-4">
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
            </div>
          </section>
        )}
        <section ref={questionPane} className={`${showPassage ? "hidden" : "block"} px-4 pb-28 pt-5 sm:px-6 md:block md:overflow-y-auto md:pb-10 md:pt-7 lg:px-10`}>
          <div className="mx-auto w-full max-w-2xl space-y-5">
            {figure && !passage && (
              <div className="md:hidden">
                <Figure fig={figure} />
              </div>
            )}
            <QuestionRenderer q={q} answer={a} onChange={setAnswer} disabled={locked} keySel={keySel} keyValue={keyValue} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-muted">
                <input type="checkbox" className="size-5" checked={!!cur?.guessed} disabled={locked} onChange={(e) => setFlag("guessed", e.target.checked)} /> I guessed
              </label>
              {mode === "practice" && !locked && (
                <button disabled={busy || !isAnswered(q, a)} onClick={check} className={`${btn("ok")} max-sm:flex-1`}>
                  {busy ? "Checking…" : "Check answer"}
                </button>
              )}
            </div>
            {reveal && (
              <div className={`space-y-3 rounded-2xl border p-4 leading-relaxed sm:p-5 ${reveal.isCorrect ? "border-ok/35 bg-ok-soft" : "border-bad/35 bg-bad-soft"}`}>
                <p className={`flex items-center gap-2 text-base font-semibold ${reveal.isCorrect ? "text-ok" : "text-bad"}`}>
                  {reveal.isCorrect ? <IconCheck size={20} /> : <IconX size={20} />}
                  {reveal.isCorrect ? "Correct" : "Incorrect"}
                </p>
                <Rich text={reveal.explanation.key} />
                {reveal.explanation.steps && (
                  <ol className="list-decimal space-y-1.5 pl-5 marker:text-muted">
                    {reveal.explanation.steps.map((s, i) => <li key={i}><Rich text={s} /></li>)}
                  </ol>
                )}
                {reveal.explanation.fast && <p className="rounded-xl bg-surface/70 px-3.5 py-2.5"><strong>Faster:</strong> <RichInline text={reveal.explanation.fast} /></p>}
                {reveal.explanation.trap && <p className="rounded-xl bg-surface/70 px-3.5 py-2.5"><strong>Trap:</strong> <RichInline text={reveal.explanation.trap} /></p>}
                {paused && <p className="flex items-center gap-1.5 text-xs text-muted"><IconPause size={11} /> Timer paused. It resumes when you move to another question.</p>}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* phone action bar, in thumb reach */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-surface/85 md:hidden" aria-label="Question navigation">
        <div className="flex gap-2 px-3 py-2.5">
          <button className={`${btn("secondary")} px-3.5`} disabled={idx === 0} onClick={() => go(idx - 1)} aria-label="Previous question">
            <IconBack size={17} />
            <span className="max-[359px]:hidden">Back</span>
          </button>
          <button className={`${btn("soft")} min-w-0 flex-1`} onClick={openGrid}>
            <IconGrid size={17} /> Review
            {unanswered > 0 && <span className="rounded-full bg-warn-soft px-1.5 py-px text-xs font-semibold text-warn">{unanswered} left</span>}
          </button>
          {nextBtn}
        </div>
      </nav>

      {calc && (
        <Calculator
          onClose={() => setCalc(false)}
          onTransfer={q.type === "numeric" ? (v) => setAnswer(q.numeric?.kind === "fraction" ? { frac: [v, a?.frac?.[1] ?? ""] } : { text: v }) : undefined}
        />
      )}
      {held && (
        <div className="fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-30 flex items-center justify-center bg-scrim p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Paused">
          <div className={`${card} w-full max-w-sm space-y-5 p-6 text-center`}>
            <div className="space-y-1.5">
              <p className="flex items-center justify-center gap-2 text-lg font-semibold"><IconPause size={16} /> Paused</p>
              <p className="text-sm text-muted">The clock is stopped{left !== null ? ` with ${fmt(left)} left` : ""}.</p>
            </div>
            <div className="flex gap-2">
              <button className={`${btn("secondary")} flex-1`} disabled={busy} onClick={() => void pauseAndExit()}>Exit</button>
              <button className={`${btn("primary")} flex-1`} disabled={busy} onClick={() => void toggleHold()} autoFocus>
                <IconPlay size={15} /> Resume
              </button>
            </div>
          </div>
        </div>
      )}
      {grid && (
        <ReviewGrid
          title={`Section ${section} review`}
          items={gridItems}
          current={idx}
          onGo={(i) => { setGrid(false); go(i); }}
          onClose={() => setGrid(false)}
          footer={
            <div className="space-y-2.5 border-t border-line pt-4">
              {unanswered > 0 && <p className="text-sm text-warn">{unanswered} question{unanswered === 1 ? " is" : "s are"} still unanswered.</p>}
              <div className="flex gap-2">
                <button className={`${btn("secondary")} flex-1`} onClick={() => setGrid(false)}>Back to Q{idx + 1}</button>
                <button disabled={busy} onClick={finishSection} className={`${btn("danger")} flex-1`}>
                  {busy ? "Finishing…" : `Finish Section ${section}`}
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}

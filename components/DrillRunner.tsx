"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Answer, PublicQuestion } from "@/lib/types";
import { isAnswered } from "@/lib/scoring";
import { QuestionRenderer } from "./QuestionRenderer";
import { RevealPanel, type Reveal } from "./RevealPanel";
import { useWordTags } from "./WordTagger";
import { IconBack, IconClock, IconNext, IconPause, IconPlay } from "./icons";
import { btn, card, iconBtn } from "./ui";

export type DrillState = { left: number; total: number; untested: number; misses: number } & (
  | { attemptId: number; ref: string; question: PublicQuestion; from: string }
  | { attemptId: null }
);
type Pick = Extract<DrillState, { attemptId: number }>;

/** The response API's cap on time per question. */
const MAX_Q_MS = 3_600_000;
const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

async function fetchNext(replay: boolean, exclude?: string): Promise<DrillState | null> {
  const qs = new URLSearchParams({ ...(replay ? { replay: "1" } : {}), ...(exclude ? { exclude } : {}) }).toString();
  try {
    const r = await fetch(`/api/drill/next${qs ? `?${qs}` : ""}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DrillState) : null;
  } catch {
    return null;
  }
}

/** "verbal-003" -> "Verbal mock 3", "drill-002" -> "Endless vocab batch 2": where a replayed miss comes from. */
const sourceName = (testId: string) => {
  const [kind, n] = testId.split("-");
  return `${kind === "drill" ? "Endless vocab batch" : "Verbal mock"} ${Number(n)}`;
};

/**
 * Endless vocab: one TC / SE question at a time, picked from the drill pool toward still-untested words. Checking an
 * answer logs it like a practice answer (stats and priorities); a question left unchecked logs nothing. With
 * `replay`, it serves missed TC / SE items from the mocks and the drill instead: a sure right answer takes an item out
 * of the miss pool, and replays log no item events.
 */
export function DrillRunner({ initial, replay = false }: { initial: DrillState; replay?: boolean }) {
  const [state, setState] = useState<DrillState>(initial);
  const [loading, setLoading] = useState(false);
  // Pause, as in a practice mock: the stopwatch stops and the question is hidden until Resume. Nothing is saved
  // until Check, so pausing needs no request, and Exit leaves the question unlogged.
  const [held, setHeld] = useState(false);
  // the pick to show after this one, fetched while the answer is being read
  const prefetched = useRef<Promise<DrillState | null> | null>(null);

  const next = useCallback(async () => {
    if (state.attemptId === null) return;
    setLoading(true);
    const s = (await (prefetched.current ?? fetchNext(replay, state.ref))) ?? (await fetchNext(replay, state.ref));
    prefetched.current = null;
    setLoading(false);
    if (s) setState(s);
  }, [state, replay]);

  // P pauses and resumes; Escape resumes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || state.attemptId === null || (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]")) return;
      if (e.key.toLowerCase() === "p" || (held && e.key === "Escape")) {
        e.preventDefault();
        setHeld((h) => (e.key === "Escape" ? false : !h));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [held, state.attemptId]);

  const onChecked = useCallback(() => {
    if (state.attemptId !== null) prefetched.current = fetchNext(replay, state.ref);
  }, [state, replay]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-2 px-4">
          <Link href="/" className={`${btn("secondary", "sm")} px-2.5`} aria-label="Back to tests">
            <IconBack size={17} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{replay ? "Replay misses" : "Endless vocab"}</div>
            <div className="truncate text-xs tabular-nums text-muted">
              {replay ? `${state.left} to fix` : `${state.untested} untested ${state.untested === 1 ? "word" : "words"} left`}
              {replay && state.attemptId !== null && ` · from ${sourceName(state.from)}`}
            </div>
          </div>
          {state.attemptId !== null && (
            <button
              className={iconBtn(held, "accent")}
              aria-label={held ? "Resume" : "Pause"}
              aria-pressed={held}
              title={held ? "Resume the clock (P)" : "Pause the clock (P)"}
              onClick={() => setHeld((h) => !h)}
            >
              {held ? <IconPlay size={16} /> : <IconPause size={16} />}
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5 sm:pb-10 sm:pt-7">
        {state.attemptId === null ? (
          <div className={`${card} space-y-3 p-6 text-center`}>
            <p className="text-lg font-semibold">{replay ? "No misses to replay" : "You're all caught up"}</p>
            <p className="text-sm text-muted">
              {replay
                ? "Every vocab question you have missed or guessed is now answered right."
                : `You have answered every endless-vocab question (${state.total}).${state.misses ? ` ${state.misses} missed question${state.misses === 1 ? " is" : "s are"} waiting for a replay.` : ""}`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {!replay && state.misses > 0 && (
                <Link href="/drill?replay=1" className={btn("primary")}>Replay misses</Link>
              )}
              <Link href="/" className={btn(!replay && state.misses > 0 ? "secondary" : "primary")}>Back to tests</Link>
            </div>
          </div>
        ) : (
          <DrillQuestion key={state.ref} pick={state} onChecked={onChecked} onNext={next} loading={loading} replay={replay} held={held} />
        )}
      </main>
      {held && state.attemptId !== null && (
        <div className="fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Paused">
          <div className={`${card} w-full max-w-sm space-y-5 p-6 text-center`}>
            <div className="space-y-1.5">
              <p className="flex items-center justify-center gap-2 text-lg font-semibold"><IconPause size={16} /> Paused</p>
              <p className="text-sm text-muted">The clock is stopped. An answer you have not checked is not saved.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/" className={`${btn("secondary")} flex-1`}>Exit</Link>
              <button className={`${btn("primary")} flex-1`} onClick={() => setHeld(false)} autoFocus>
                <IconPlay size={15} /> Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrillQuestion({ pick, onChecked, onNext, loading, replay, held }: { pick: Pick; onChecked: () => void; onNext: () => void; loading: boolean; replay: boolean; held: boolean }) {
  const { question: q, attemptId } = pick;
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [guessed, setGuessed] = useState(false);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const tags = useWordTags(attemptId);
  // time on the question while the page is visible; it feeds the slow-answer signal as in the mocks
  const spent = useRef(0);
  const since = useRef<number | null>(null);
  const [now, setNow] = useState(0);
  const elapsed = () => spent.current + (since.current === null ? 0 : Date.now() - since.current);

  // the clock starts when the question is shown
  useEffect(() => {
    since.current = Date.now();
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden && since.current !== null) {
        spent.current += Date.now() - since.current;
        since.current = null;
      } else if (!document.hidden && since.current === null && !reveal && !held) since.current = Date.now();
    };
    // Pause stops the clock; Resume restarts it unless the answer is already shown or the page is hidden
    if (held && since.current !== null) {
      spent.current += Date.now() - since.current;
      since.current = null;
    } else if (!held && !reveal && !document.hidden && since.current === null) since.current = Date.now();
    document.addEventListener("visibilitychange", onVis);
    const t = setInterval(() => setNow(elapsed()), 1000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(t);
    };
  }, [reveal, held]);

  const ready = isAnswered(q, answer);
  const check = useCallback(async () => {
    if (!ready || busy || reveal) return;
    setBusy(true);
    setErr(false);
    const timeMs = Math.min(elapsed(), MAX_Q_MS);
    try {
      const r = await fetch(`/api/attempts/${attemptId}/response`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: q.id, answer: answer ?? null, timeMs, guessed, marked: false, commit: true }),
      });
      const j = r.ok ? await r.json() : null;
      if (j?.reveal) {
        spent.current = timeMs;
        since.current = null;
        setNow(timeMs);
        setReveal(j.reveal);
        onChecked();
      } else setErr(true);
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }, [ready, busy, reveal, attemptId, q.id, answer, guessed, onChecked]);

  // keys: 1-6 or a-f pick a choice (SE, one-blank TC), Enter checks, then moves on
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (held || e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]")) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (reveal) onNext();
        else void check();
        return;
      }
      if (reveal) return;
      const k = e.key.toLowerCase();
      const i = /^[1-6]$/.test(k) ? Number(k) - 1 : /^[a-f]$/.test(k) ? k.charCodeAt(0) - 97 : -1;
      if (i < 0) return;
      const sel = answer?.sel ?? [];
      if (q.type === "se" && i < (q.choices?.length ?? 0)) setAnswer({ sel: sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i].slice(-2) });
      else if (q.type === "tc" && q.blanks?.length === 1 && i < q.blanks[0].length) setAnswer({ sel: [i] });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reveal, answer, q, check, onNext, held]);

  const keySel = reveal && "sel" in reveal.key ? reveal.key.sel : undefined;
  const action = reveal ? (
    <button className={`${btn("primary")} max-sm:flex-1 px-5`} disabled={loading} onClick={onNext}>
      {loading ? "Loading…" : "Next"} <IconNext size={17} />
    </button>
  ) : (
    <button className={`${btn("ok")} max-sm:flex-1`} disabled={busy || !ready} onClick={() => void check()}>
      {busy ? "Checking…" : "Check answer"}
    </button>
  );

  return (
    <div className="space-y-5">
      <QuestionRenderer q={q} answer={answer} onChange={(a) => !reveal && setAnswer(a)} disabled={!!reveal} keySel={keySel} tags={reveal ? tags : undefined} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" className="size-5" checked={guessed} disabled={!!reveal} onChange={(e) => setGuessed(e.target.checked)} /> I guessed
        </label>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-muted" title="Time on this question">
          <IconClock size={13} /> {fmt(now)}
        </span>
        <div className="hidden sm:block">{action}</div>
      </div>
      {err && <p role="status" className="text-sm text-bad">Could not save the answer. Check your connection and try again.</p>}
      {reveal && replay && (
        <p role="status" className={`text-sm font-medium ${reveal.isCorrect && !guessed ? "text-ok" : "text-muted"}`}>
          {reveal.isCorrect && !guessed ? "Fixed: this one leaves your misses." : reveal.isCorrect ? "Right, but guessed: it stays in your misses." : "Still a miss: it stays in your misses."}
        </p>
      )}
      {reveal && <RevealPanel reveal={reveal} q={q} tags={tags} distractors />}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-surface/85 sm:hidden" aria-label="Question actions">
        <div className="flex gap-2 px-3 py-2.5">{action}</div>
      </nav>
    </div>
  );
}

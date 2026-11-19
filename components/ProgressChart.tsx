"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { card, seg, segItem } from "./ui";

export type Measure = "verbal" | "quant";

export interface ProgressPoint {
  id: number;
  measure: Measure;
  /** the test's mock number within its measure, by first finish; a test's retakes share it */
  n: number;
  finishedAt: number;
  score: { mid: number; low: number; high: number };
  timeMs: number;
  testId: string;
  attemptNo: number;
  timed: boolean;
  mode: string;
  href: string;
}

/** The part of the history in view: a span of mock numbers, or of finish times. */
export type ChartView = { kind: "n"; lo: number; hi: number } | { kind: "date"; from: number; to: number };

const MEASURES: Measure[] = ["verbal", "quant"];
const LABEL: Record<Measure, string> = { verbal: "Verbal", quant: "Quant" };
const COLOR: Record<Measure, string> = { verbal: "var(--series-verbal)", quant: "var(--series-quant)" };
/** Retakes: the measure's color washed toward grey, so they read as the same series but secondary. */
const RETAKE: Record<Measure, string> = {
  verbal: "color-mix(in oklab, var(--series-verbal) 35%, var(--muted))",
  quant: "color-mix(in oklab, var(--series-quant) 35%, var(--muted))",
};
const colorOf = (p: ProgressPoint) => (p.attemptNo > 1 ? RETAKE : COLOR)[p.measure];
/** Target scaled score per measure, drawn as a dashed line on the score chart. */
const GOAL: Record<Measure, number> = { verbal: 164, quant: 164 };
const H = 240;
const M = { top: 14, right: 40, bottom: 28, left: 36 };
const DAY = 86_400_000;
/** Width of one mock on the mock-number axis; more mocks than fit scroll. */
const MOCK_PX = 48;
/** Most of the date axis one screen shows; a longer history scrolls. */
const DATE_VIEW = 30 * DAY;

type XMode = "n" | "date";
type YMode = "score" | "time";

/**
 * Score or time of each finished attempt against mock number or date, one line per measure through first
 * attempts, retakes as grey dots. The plot scrolls sideways back to the first mock (a date axis shows up to
 * 30 days a screen) and reports the window in view through `onView`.
 * Drawn only after mount: it needs the container width, and dates are labelled in the viewer's time zone.
 */
export function ProgressChart({ points, now, limitMs, onView }: { points: ProgressPoint[]; now: number; limitMs: Record<Measure, number>; onView?: (v: ChartView) => void }) {
  const [xMode, setXMode] = useState<XMode>("n");
  const [yMode, setYMode] = useState<YMode>("score");
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const present = MEASURES.filter((m) => points.some((p) => p.measure === m));
  const retakes = present.filter((m) => points.some((p) => p.measure === m && p.attemptNo > 1));

  return (
    <div className={`${card} space-y-3 p-4`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Toggle label="X axis" value={xMode} set={setXMode} options={[["n", "Mock #"], ["date", "Date"]]} />
        <Toggle label="Y axis" value={yMode} set={setYMode} options={[["score", "Score"], ["time", "Time"]]} />
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted sm:ml-auto">
          {present.map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <svg width="18" height="10" aria-hidden><line x1="1" x2="17" y1="5" y2="5" stroke={COLOR[m]} strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="5" r="3.5" fill={COLOR[m]} /></svg>
              {LABEL[m]}
            </li>
          ))}
          {retakes.length > 0 && (
            <li className="flex items-center gap-1.5">
              <svg width={retakes.length * 10} height="10" aria-hidden>
                {retakes.map((m, i) => <circle key={m} cx={5 + i * 10} cy="5" r="3.5" fill={RETAKE[m]} />)}
              </svg>
              Retake
            </li>
          )}
        </ul>
      </div>
      <div ref={box} style={{ height: H }} className="relative">
        {w > 0 && <Plot w={w} points={points} now={now} xMode={xMode} yMode={yMode} limitMs={limitMs} present={present} onView={onView} />}
      </div>
      <p className="text-xs text-muted">
        {yMode === "score"
          ? `Score is the strict estimate; the whisker is its ±1 standard-error range. A retake (grey) re-uses questions you have seen, so it reads high. Dashed lines are the goals (${present.map((m) => `${LABEL[m].toLowerCase()} ${GOAL[m]}`).join(", ")}).`
          : `Time on the section clocks, pauses excluded. Dashed lines are the time limits for both sections (${present.map((m) => `${LABEL[m].toLowerCase()} ${Math.round(limitMs[m] / 60_000)}m`).join(", ")}).`}{" "}
        Drag or scroll sideways for earlier mocks; tap a point to open its review.
      </p>
    </div>
  );
}

function Toggle<T extends string>({ label, value, set, options }: { label: string; value: T; set: (v: T) => void; options: [T, string][] }) {
  return (
    <div className={seg} role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={v === value} onClick={() => set(v)} className={`${segItem(v === value)} whitespace-nowrap !py-1 text-xs`}>
          {text}
        </button>
      ))}
    </div>
  );
}

const yOf = (p: ProgressPoint, y: YMode) => (y === "score" ? p.score.mid : p.timeMs / 60_000);
const fmtMin = (min: number) => (min < 60 ? `${Math.round(min)}m` : `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, "0")}m`);
const fmtDay = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function Plot({ w, points, now, xMode, yMode, limitMs, present, onView }: { w: number; points: ProgressPoint[]; now: number; xMode: XMode; yMode: YMode; limitMs: Record<Measure, number>; present: Measure[]; onView?: (v: ChartView) => void }) {
  const router = useRouter();
  const [hover, setHover] = useState<number | null>(null); // mock number, or a point id in date mode
  const [refHover, setRefHover] = useState<number | null>(null); // index of the hovered goal / limit label
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const frame = useRef(0);

  const viewIw = w - M.left - M.right;
  const ih = H - M.top - M.bottom;

  // x scale over the whole history; the visible window is viewIw wide (dates: all of it up to DATE_VIEW)
  const firstAt = Math.min(...points.map((p) => p.finishedAt));
  const nMax = Math.max(...points.map((p) => p.n));
  let x0: number, x1: number, iw: number;
  if (xMode === "n") {
    [x0, x1] = [0.5, nMax + 0.5];
    iw = Math.max(viewIw, nMax * MOCK_PX);
  } else {
    const viewMs = Math.min(DATE_VIEW, Math.max(DAY, now - firstAt + DAY / 2));
    [x0, x1] = [Math.min(firstAt - DAY / 2, now - viewMs), now];
    iw = ((x1 - x0) / viewMs) * viewIw;
  }
  const total = M.left + iw + M.right;
  const xv = (p: ProgressPoint) => (xMode === "n" ? p.n : p.finishedAt);
  const sx = (v: number) => M.left + ((v - x0) / (x1 - x0 || 1)) * iw;

  // the window in view, from the left edge of the plot (the y axis covers the margin) to the right edge of the box
  const report = (left: number) => {
    const at = (cx: number) => x0 + ((cx - M.left) / iw) * (x1 - x0);
    const [l, r] = [at(left + M.left), at(left + w)];
    onView?.(xMode === "n" ? { kind: "n", lo: Math.max(1, Math.ceil(l - 0.2)), hi: Math.min(nMax, Math.floor(r + 0.2)) } : { kind: "date", from: l, to: Math.min(now, r) });
  };

  // open on the latest attempts
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
    setScrollX(el.scrollLeft);
    report(el.scrollLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the scale changes
  }, [xMode, w, total]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // once a frame while scrolling: the tooltip side and the window in view
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = scroller.current;
      if (!el) return;
      setScrollX(el.scrollLeft);
      report(el.scrollLeft);
    });
  };

  // drag to scroll with a mouse, as a finger does on touch; a drag does not count as a tap on a point
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
    dragged.current = false;
    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = ev.clientX - d.x;
      if (!d.moved && Math.abs(dx) < 4) return;
      if (!d.moved) [d.moved, dragged.current] = [true, true];
      setGrabbing(true);
      setHover(null);
      el.scrollLeft = d.left - dx;
    };
    const up = () => {
      drag.current = null;
      setGrabbing(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.stopPropagation();
    e.preventDefault();
  };

  // y scale: scores on a 5-point grid inside 130–170, time from 0 with the limits in view
  let y0: number, y1: number, step: number;
  if (yMode === "score") {
    y0 = Math.max(130, Math.floor((Math.min(...points.map((p) => p.score.low)) - 1) / 5) * 5);
    y1 = Math.min(170, Math.ceil((Math.max(...points.map((p) => p.score.high)) + 1) / 5) * 5);
    // keep the goal lines in view
    const goals = present.map((m) => GOAL[m]);
    y0 = Math.min(y0, Math.floor((Math.min(...goals) - 1) / 5) * 5);
    y1 = Math.max(y1, Math.ceil((Math.max(...goals) + 1) / 5) * 5);
    if (y1 - y0 < 10) [y0, y1] = y0 + 10 <= 170 ? [y0, y0 + 10] : [160, 170];
    step = y1 - y0 > 25 ? 10 : 5;
  } else {
    const top = Math.max(...points.map((p) => p.timeMs / 60_000), ...present.map((m) => limitMs[m] / 60_000));
    step = top > 90 ? 30 : top > 45 ? 15 : 10;
    y0 = 0;
    y1 = Math.ceil((top * 1.08) / step) * step;
  }
  const sy = (v: number) => M.top + ih - ((v - y0) / (y1 - y0)) * ih;
  const yTicks: number[] = [];
  for (let v = y0; v <= y1 + 1e-9; v += step) yTicks.push(v);

  // x ticks: every mock number, or local midnights, thinned to fit
  const xTicks: { v: number; text: string }[] = [];
  if (xMode === "n") {
    for (let v = 1; v <= nMax; v++) xTicks.push({ v, text: `#${v}` });
  } else {
    const start = new Date(x0);
    start.setHours(0, 0, 0, 0);
    const every = Math.max(1, Math.ceil(56 / ((iw / (x1 - x0)) * DAY)));
    for (let d = new Date(start); d.getTime() <= x1; d.setDate(d.getDate() + every)) if (d.getTime() >= x0) xTicks.push({ v: d.getTime(), text: fmtDay(d.getTime()) });
  }

  // a line per measure through first attempts; retakes are dots off the line
  const series = present.map((m) => ({ m, pts: points.filter((p) => p.measure === m).sort((a, b) => xv(a) - xv(b) || a.attemptNo - b.attemptNo) }));
  const firsts = (pts: ProgressPoint[]) => pts.filter((p) => p.attemptNo === 1);

  // hover: mock mode reads every attempt at one mock number; date mode picks the nearest point
  const active = hover === null ? [] : xMode === "n" ? points.filter((p) => p.n === hover) : points.filter((p) => p.id === hover);
  const crossX = active.length ? sx(xv(active[0])) : null;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (xMode === "n") {
      const v = Math.round(x0 + ((px - M.left) / iw) * (x1 - x0));
      setHover(points.some((p) => p.n === v) ? v : null);
    } else {
      let best: ProgressPoint | null = null;
      let bd = Infinity;
      for (const p of points) {
        const d = Math.hypot(sx(p.finishedAt) - px, (sy(yOf(p, yMode)) - py) * 0.5);
        if (d < bd) [best, bd] = [p, d];
      }
      setHover(best && bd < 60 ? best.id : null);
    }
  };

  // end labels on the last first attempt of each line, dropped when they would collide
  const ends = series.flatMap(({ m, pts }) => {
    const f = firsts(pts);
    return f.length ? [{ m, p: f[f.length - 1] }] : [];
  });
  const endsClash = ends.length === 2 && Math.abs(sy(yOf(ends[0].p, yMode)) - sy(yOf(ends[1].p, yMode))) < 14 && Math.abs(sx(xv(ends[0].p)) - sx(xv(ends[1].p))) < 40;
  const fmtY = (v: number) => (yMode === "score" ? String(Math.round(v)) : `${Math.round(v)}m`);

  // dashed reference lines: the goal on scores, the section limit on time; lines that sit together share one label
  const refs = present.map((m) => ({ m, v: yMode === "score" ? GOAL[m] : limitMs[m] / 60_000 }));
  const refLabels: { y: number; refs: typeof refs }[] = [];
  for (const r of [...refs].sort((a, b) => a.v - b.v)) {
    const last = refLabels[refLabels.length - 1];
    if (last && Math.abs(last.y - sy(r.v)) < 12) last.refs.push(r);
    else refLabels.push({ y: sy(r.v), refs: [r] });
  }
  const refX = total - M.right + 6;
  // step a label off its line when a line's end value sits there too
  const refY = (y: number) => (ends.some(({ p }) => sx(xv(p)) + 30 > refX && Math.abs(sy(yOf(p, yMode)) - y) < 12) ? y - 12 : y);
  const refWord = yMode === "score" ? "Goal" : "Limit";

  return (
    <>
      <div
        ref={scroller}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        className={`no-scrollbar h-full overflow-x-auto overflow-y-hidden overscroll-x-contain ${total > w ? (grabbing ? "cursor-grabbing" : "cursor-grab") : ""}`}
      >
        <div className="relative" style={{ width: total }}>
          <svg width={total} height={H} className="block select-none" onPointerMove={(e) => !drag.current?.moved && refHover === null && onMove(e)} onPointerLeave={() => setHover(null)} role="img" aria-label={`${yMode === "score" ? "Score" : "Time"} of each finished attempt by ${xMode === "n" ? "mock number" : "date"}`}>
            {yTicks.map((v) => <line key={v} x1={M.left} x2={total - M.right} y1={sy(v)} y2={sy(v)} stroke="var(--line)" strokeWidth="1" />)}
            {xTicks.map((t) => (
              <text key={t.v} x={sx(t.v)} y={H - 8} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">{t.text}</text>
            ))}
            {refs.map(({ m, v }) => (
              <line key={m} x1={M.left} x2={total - M.right} y1={sy(v)} y2={sy(v)} stroke={COLOR[m]} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="4 4" />
            ))}
            {crossX !== null && <line x1={crossX} x2={crossX} y1={M.top} y2={M.top + ih} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />}
            {series.map(({ m, pts }) => (
              <g key={m}>
                {yMode === "score" &&
                  pts.map((p) => <line key={p.id} x1={sx(xv(p))} x2={sx(xv(p))} y1={sy(p.score.low)} y2={sy(p.score.high)} stroke={colorOf(p)} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />)}
                {firsts(pts).length > 1 && (
                  <polyline points={firsts(pts).map((p) => `${sx(xv(p))},${sy(yOf(p, yMode))}`).join(" ")} fill="none" stroke={COLOR[m]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                )}
                {/* retakes first, so a first attempt at the same spot draws on top */}
                {[...pts].sort((a, b) => Number(b.attemptNo > 1) - Number(a.attemptNo > 1)).map((p) => {
                  const on = active.includes(p);
                  return (
                    <circle
                      key={p.id}
                      cx={sx(xv(p))}
                      cy={sy(yOf(p, yMode))}
                      r={on ? 5.5 : 4}
                      fill={colorOf(p)}
                      stroke="var(--surface)"
                      strokeWidth="2"
                      className={grabbing ? undefined : "cursor-pointer"}
                      onClick={() => router.push(p.href)}
                    />
                  );
                })}
              </g>
            ))}
            {!endsClash &&
              ends.map(({ m, p }) => (
                <text key={m} x={sx(xv(p)) + 9} y={sy(yOf(p, yMode))} dy="0.32em" className="fill-fg text-[11px] font-semibold tabular-nums">{fmtY(yOf(p, yMode))}</text>
              ))}
            {refLabels.map((l, i) => (
              <text
                key={i}
                x={refX}
                y={refY(l.y)}
                dy="0.32em"
                className="cursor-default fill-muted text-[10px] font-medium"
                onPointerEnter={() => { setRefHover(i); setHover(null); }}
                onPointerLeave={() => setRefHover(null)}
              >
                {refWord}
              </text>
            ))}
          </svg>
          {refHover !== null && refLabels[refHover] && (
            <div
              className="pointer-events-none absolute z-10 space-y-0.5 whitespace-nowrap rounded-lg border border-line bg-surface px-2 py-1 text-xs shadow-lg"
              style={{ right: M.right - 2, top: refY(refLabels[refHover].y) + 10 }}
            >
              {refLabels[refHover].refs.map(({ m, v }) => (
                <div key={m} className="flex items-center gap-1.5 tabular-nums">
                  <svg width="12" height="6" aria-hidden><line x1="0" x2="12" y1="3" y2="3" stroke={COLOR[m]} strokeWidth="1.5" strokeDasharray="3 2" /></svg>
                  <span className="text-muted">{LABEL[m]} {yMode === "score" ? "goal" : "time limit"}</span>
                  <span className="font-semibold text-fg">{yMode === "score" ? v : fmtMin(v)}</span>
                </div>
              ))}
            </div>
          )}
          {active.length > 0 && crossX !== null && <Tip x={crossX} total={total} right={crossX - scrollX > w / 2} pts={active} xMode={xMode} />}
        </div>
      </div>
      {/* the y axis stays put while the plot scrolls under it */}
      <svg width={M.left} height={H - M.bottom + 4} className="pointer-events-none absolute left-0 top-0" aria-hidden>
        <rect width={M.left} height={H} fill="var(--surface)" />
        {yTicks.map((v) => (
          <text key={v} x={M.left - 8} y={sy(v)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">{fmtY(v)}</text>
        ))}
      </svg>
      <ul className="sr-only">
        {points.map((p) => (
          <li key={p.id}>
            <a href={p.href}>{`${LABEL[p.measure]} mock ${p.n}, ${p.testId}${p.attemptNo > 1 ? ` retake ${p.attemptNo}` : ""}: score ${p.score.mid}, ${fmtMin(p.timeMs / 60_000)}`}</a>
          </li>
        ))}
      </ul>
    </>
  );
}

function Tip({ x, total, right, pts, xMode }: { x: number; total: number; right: boolean; pts: ProgressPoint[]; xMode: XMode }) {
  const sorted = [...pts].sort((a, b) => MEASURES.indexOf(a.measure) - MEASURES.indexOf(b.measure) || a.attemptNo - b.attemptNo);
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 w-56 space-y-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lg"
      style={right ? { right: total - x + 10 } : { left: x + 10 }}
    >
      <div className="font-semibold text-muted">{xMode === "n" ? `Mock #${pts[0].n}` : fmtDay(pts[0].finishedAt)}</div>
      {sorted.map((p) => (
        <div key={p.id} className="flex gap-2">
          <svg width="12" height="14" className="mt-0.5 shrink-0" aria-hidden><line x1="1" x2="11" y1="7" y2="7" stroke={colorOf(p)} strokeWidth="2" strokeLinecap="round" /></svg>
          <div className="min-w-0">
            <div className="tabular-nums">
              <span className="text-sm font-semibold text-fg">{p.score.mid}</span>
              <span className="text-muted"> ({p.score.low}–{p.score.high}) · {fmtMin(p.timeMs / 60_000)}</span>
            </div>
            <div className="text-muted">
              {LABEL[p.measure]} · {p.testId}
              {p.attemptNo > 1 ? ` · retake ${p.attemptNo}` : ""}
              {p.timed ? "" : " · untimed"}
              {p.mode === "practice" ? " · practice" : ""}
            </div>
            <div className="text-muted">{fmtDay(p.finishedAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

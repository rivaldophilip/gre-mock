"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { card, seg, segItem } from "./ui";

export type Measure = "verbal" | "quant";

export interface ProgressPoint {
  id: number;
  measure: Measure;
  /** nth finished attempt of this measure, across every test */
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

const MEASURES: Measure[] = ["verbal", "quant"];
const LABEL: Record<Measure, string> = { verbal: "Verbal", quant: "Quant" };
const COLOR: Record<Measure, string> = { verbal: "var(--series-verbal)", quant: "var(--series-quant)" };
const H = 240;
const M = { top: 14, right: 40, bottom: 28, left: 36 };
const DAY = 86_400_000;

type XMode = "n" | "date";
type YMode = "score" | "time";

/**
 * Score or time of each finished attempt, one line per measure, against attempt number or date.
 * Drawn only after mount: it needs the container width, and dates are labelled in the viewer's time zone.
 */
export function ProgressChart({ points, domain, limitMs }: { points: ProgressPoint[]; domain: [number, number]; limitMs: Record<Measure, number> }) {
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
  const hasRetake = points.some((p) => p.attemptNo > 1);

  return (
    <div className={`${card} space-y-3 p-4`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Toggle label="X axis" value={xMode} set={setXMode} options={[["n", "Attempt #"], ["date", "Date"]]} />
        <Toggle label="Y axis" value={yMode} set={setYMode} options={[["score", "Score"], ["time", "Time"]]} />
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted sm:ml-auto">
          {present.map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <svg width="18" height="10" aria-hidden><line x1="1" x2="17" y1="5" y2="5" stroke={COLOR[m]} strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="5" r="3.5" fill={COLOR[m]} /></svg>
              {LABEL[m]}
            </li>
          ))}
          {hasRetake && (
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" aria-hidden><circle cx="5" cy="5" r="3.5" fill="var(--surface)" stroke="var(--muted)" strokeWidth="1.5" /></svg>
              Retake
            </li>
          )}
        </ul>
      </div>
      <div ref={box} style={{ height: H }} className="relative">
        {w > 0 && <Plot w={w} points={points} xMode={xMode} yMode={yMode} domain={domain} limitMs={limitMs} present={present} />}
      </div>
      <p className="text-xs text-muted">
        {yMode === "score"
          ? "Score is the strict estimate; the whisker is its ±1 standard-error range. A retake re-uses questions you have seen, so it reads high."
          : `Time on the section clocks, pauses excluded. Dashed lines are the time limits for both sections (${present.map((m) => `${LABEL[m].toLowerCase()} ${Math.round(limitMs[m] / 60_000)}m`).join(", ")}).`}{" "}
        Tap a point to open its review.
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

function Plot({ w, points, xMode, yMode, domain, limitMs, present }: { w: number; points: ProgressPoint[]; xMode: XMode; yMode: YMode; domain: [number, number]; limitMs: Record<Measure, number>; present: Measure[] }) {
  const router = useRouter();
  const [hover, setHover] = useState<number | null>(null); // attempt number, or a point id in date mode
  const iw = w - M.left - M.right;
  const ih = H - M.top - M.bottom;

  // x scale
  const ns = points.map((p) => p.n);
  const [x0, x1] = xMode === "n" ? [Math.min(...ns) - 0.5, Math.max(...ns) + 0.5] : domain;
  const xv = (p: ProgressPoint) => (xMode === "n" ? p.n : p.finishedAt);
  const sx = (v: number) => M.left + ((v - x0) / (x1 - x0 || 1)) * iw;

  // y scale: scores on a 5-point grid inside 130–170, time from 0 with the limits in view
  let y0: number, y1: number, step: number;
  if (yMode === "score") {
    y0 = Math.max(130, Math.floor((Math.min(...points.map((p) => p.score.low)) - 1) / 5) * 5);
    y1 = Math.min(170, Math.ceil((Math.max(...points.map((p) => p.score.high)) + 1) / 5) * 5);
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

  // x ticks: whole attempt numbers, or local midnights, thinned to fit
  const maxTicks = Math.max(2, Math.floor(iw / 56));
  const xTicks: { v: number; text: string }[] = [];
  if (xMode === "n") {
    const lo = Math.ceil(x0), hi = Math.floor(x1);
    const every = Math.ceil((hi - lo + 1) / maxTicks);
    for (let v = lo; v <= hi; v += every) xTicks.push({ v, text: `#${v}` });
  } else {
    const start = new Date(x0);
    start.setHours(0, 0, 0, 0);
    const days = Math.ceil((x1 - start.getTime()) / DAY);
    const every = Math.max(1, Math.ceil(days / maxTicks));
    for (let d = new Date(start); d.getTime() <= x1; d.setDate(d.getDate() + every)) if (d.getTime() >= x0) xTicks.push({ v: d.getTime(), text: fmtDay(d.getTime()) });
  }

  const series = present.map((m) => ({ m, pts: points.filter((p) => p.measure === m).sort((a, b) => xv(a) - xv(b)) }));

  // hover: attempt mode reads every series at one attempt number; date mode picks the nearest point
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

  // end labels on the last point of each line, dropped when they would collide
  const ends = series.flatMap(({ m, pts }) => (pts.length ? [{ m, p: pts[pts.length - 1] }] : []));
  const endsClash = ends.length === 2 && Math.abs(sy(yOf(ends[0].p, yMode)) - sy(yOf(ends[1].p, yMode))) < 14 && Math.abs(sx(xv(ends[0].p)) - sx(xv(ends[1].p))) < 40;
  const fmtY = (v: number) => (yMode === "score" ? String(Math.round(v)) : `${Math.round(v)}m`);

  return (
    <>
      <svg width={w} height={H} className="block touch-pan-y select-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`${yMode === "score" ? "Score" : "Time"} of each finished attempt by ${xMode === "n" ? "attempt number" : "date"}`}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={w - M.right} y1={sy(v)} y2={sy(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={M.left - 8} y={sy(v)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">{fmtY(v)}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t.v} x={sx(t.v)} y={H - 8} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">{t.text}</text>
        ))}
        {yMode === "time" &&
          present.map((m) => (
            <line key={m} x1={M.left} x2={w - M.right} y1={sy(limitMs[m] / 60_000)} y2={sy(limitMs[m] / 60_000)} stroke={COLOR[m]} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="4 4" />
          ))}
        {crossX !== null && <line x1={crossX} x2={crossX} y1={M.top} y2={M.top + ih} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />}
        {series.map(({ m, pts }) => (
          <g key={m}>
            {yMode === "score" &&
              pts.map((p) => <line key={p.id} x1={sx(xv(p))} x2={sx(xv(p))} y1={sy(p.score.low)} y2={sy(p.score.high)} stroke={COLOR[m]} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />)}
            {pts.length > 1 && (
              <polyline points={pts.map((p) => `${sx(xv(p))},${sy(yOf(p, yMode))}`).join(" ")} fill="none" stroke={COLOR[m]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            )}
            {pts.map((p) => {
              const on = active.includes(p);
              return (
                <circle
                  key={p.id}
                  cx={sx(xv(p))}
                  cy={sy(yOf(p, yMode))}
                  r={on ? 5.5 : 4}
                  fill={p.attemptNo > 1 ? "var(--surface)" : COLOR[m]}
                  stroke={p.attemptNo > 1 ? COLOR[m] : "var(--surface)"}
                  strokeWidth="2"
                  className="cursor-pointer"
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
      </svg>
      {active.length > 0 && crossX !== null && <Tip x={crossX} w={w} pts={active} xMode={xMode} />}
      <ul className="sr-only">
        {points.map((p) => (
          <li key={p.id}>
            <a href={p.href}>{`${LABEL[p.measure]} attempt ${p.n}, ${p.testId} attempt ${p.attemptNo}: score ${p.score.mid}, ${fmtMin(p.timeMs / 60_000)}`}</a>
          </li>
        ))}
      </ul>
    </>
  );
}

function Tip({ x, w, pts, xMode }: { x: number; w: number; pts: ProgressPoint[]; xMode: XMode }) {
  const right = x > w / 2;
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 w-56 space-y-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lg"
      style={right ? { right: w - x + 10 } : { left: x + 10 }}
    >
      <div className="font-semibold text-muted">{xMode === "n" ? `Attempt #${pts[0].n}` : fmtDay(pts[0].finishedAt)}</div>
      {pts.map((p) => (
        <div key={p.id} className="flex gap-2">
          <svg width="12" height="14" className="mt-0.5 shrink-0" aria-hidden><line x1="1" x2="11" y1="7" y2="7" stroke={COLOR[p.measure]} strokeWidth="2" strokeLinecap="round" /></svg>
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
            {xMode === "n" && <div className="text-muted">{fmtDay(p.finishedAt)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

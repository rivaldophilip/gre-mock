"use client";

import { useState } from "react";
import { fmtDuration, summarizePoints, type ScoreSummary } from "@/lib/attempt-summary";
import { Explain } from "./Explain";
import { ProgressChart, type ChartView, type Measure, type ProgressPoint } from "./ProgressChart";
import { card } from "./ui";

const fmtDay = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/**
 * The Attempts section of /stats: tiles over whatever the progress chart shows, so scrolling the chart back
 * is how you look at an earlier period. Everything runs in the browser; nothing goes back to the server.
 */
export function AttemptsPanel({ points, now, limitMs }: { points: ProgressPoint[]; now: number; limitMs: Record<Measure, number> }) {
  const [view, setView] = useState<ChartView | null>(null);
  const inView = view === null ? points : points.filter((p) => (view.kind === "n" ? p.n >= view.lo && p.n <= view.hi : p.finishedAt >= view.from && p.finishedAt <= view.to));
  const s = summarizePoints(inView);
  const label =
    view === null || inView.length === points.length
      ? "All time"
      : view.kind === "n"
        ? `In view: mocks #${view.lo}–#${view.hi}`
        : `In view: ${fmtDay(view.from)} – ${fmtDay(view.to)}`;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-semibold">Attempts</h2>
        <span className="text-xs text-muted tabular-nums">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="Finished attempts"
          value={String(s.n)}
          note={`${s.verbal} verbal · ${s.quant} quant${s.retakes ? ` · ${s.retakes} retake${s.retakes === 1 ? "" : "s"}` : ""}`}
        />
        <Tile label="Avg time spent" value={s.avgTimeMs === null ? "–" : fmtDuration(s.avgTimeMs)} note="per attempt, pauses excluded" />
        <ScoreTile label="Avg verbal score" s={s.vScore} />
        <ScoreTile label="Avg quant score" s={s.qScore} />
      </div>
      <ProgressChart points={points} now={now} limitMs={limitMs} onView={setView} />
    </section>
  );
}

function Tile({ label, value, note, why }: { label: string; value: string; note: string; why?: string }) {
  return (
    <div className={`${card} space-y-1 p-4`}>
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{label}</div>
      <div className="font-mono text-2xl font-semibold">{why ? <Explain why={why}>{value}</Explain> : value}</div>
      <div className="text-xs text-muted">{note}</div>
    </div>
  );
}

function ScoreTile({ label, s }: { label: string; s: ScoreSummary }) {
  if (s.avg === null) return <Tile label={label} value="–" note="no first attempt in view" />;
  return (
    <Tile
      label={label}
      value={`~${Math.round(s.avg)}`}
      note={`best ~${s.best} · ${s.n} mock${s.n === 1 ? "" : "s"}`}
      why={`Mean of the strict score estimates (the middle of each band) of ${s.n} first attempt${s.n === 1 ? "" : "s"} in view, on the 130–170 scale. Retakes are left out, since they re-use questions you have seen; untimed attempts count.`}
    />
  );
}

import { describe, expect, it } from "vitest";
import { elapsedMs, paused, resumed } from "../lib/clock";

const T0 = Date.parse("2026-11-06T10:00:00Z");
const at = (s: number) => T0 + s * 1000;
const iso = (s: number) => new Date(at(s)).toISOString();

describe("section clock with practice-mode pauses", () => {
  it("runs on wall time when never paused", () => {
    expect(elapsedMs({ startedAt: iso(0) }, at(90))).toBe(90_000);
  });

  it("stands still during a pause", () => {
    const p = paused({ startedAt: iso(0) }, at(60))!;
    expect(elapsedMs(p, at(60))).toBe(60_000);
    expect(elapsedMs(p, at(300))).toBe(60_000); // reading the answer for 4 minutes costs nothing
  });

  it("resumes from where it stopped and accumulates several pauses", () => {
    let c = paused({ startedAt: iso(0) }, at(60))!;
    c = resumed(c, at(100))!; // 40 s paused
    expect(c.pausedAt).toBeUndefined();
    expect(elapsedMs(c, at(130))).toBe(90_000);
    c = resumed(paused(c, at(130))!, at(200))!; // another 70 s
    expect(c.pausedMs).toBe(110_000);
    expect(elapsedMs(c, at(210))).toBe(100_000);
  });

  it("ignores pausing twice, resuming when running, and pausing a finished or unstarted section", () => {
    const p = paused({ startedAt: iso(0) }, at(10))!;
    expect(paused(p, at(20))).toBeNull();
    expect(resumed({ startedAt: iso(0) }, at(20))).toBeNull();
    expect(paused({ startedAt: iso(0), finishedAt: iso(5) }, at(20))).toBeNull();
    expect(paused({}, at(20))).toBeNull();
    expect(elapsedMs(undefined, at(20))).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { STALE_MS, elapsedMs, heartbeat, isAway, paused, resumed } from "../lib/clock";

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

describe("section clock while the test-taker is away", () => {
  it("stops at the last heartbeat once the page goes quiet, and the gap is folded in on resume", () => {
    const st = { startedAt: iso(0), lastSeenAt: iso(100) };
    expect(elapsedMs(st, at(100) + STALE_MS)).toBe(100_000 + STALE_MS); // still within the grace window
    expect(elapsedMs(st, at(3600))).toBe(100_000); // an hour without heartbeats costs nothing
    expect(isAway(st, at(3600))).toBe(true);
    const back = resumed(st, at(3600), "away")!;
    expect(back.pausedMs).toBe(3_500_000);
    expect(elapsedMs(back, at(3630))).toBe(130_000);
    expect(isAway(back, at(3630))).toBe(false);
  });

  it("a heartbeat keeps the clock running, and one after a silent gap does not charge the gap", () => {
    let c = heartbeat({ startedAt: iso(0), lastSeenAt: iso(0) }, at(20))!;
    expect(elapsedMs(c, at(30))).toBe(30_000);
    c = heartbeat(c, at(500))!; // came back after a crash
    expect(elapsedMs(c, at(500))).toBe(20_000);
  });

  it("an away pause does not lift a practice reveal pause, and vice versa", () => {
    const reveal = paused({ startedAt: iso(0) }, at(60), "reveal")!;
    expect(resumed(reveal, at(90), "away")).toBeNull();
    expect(paused(reveal, at(70), "away")).toBeNull();
    expect(isAway(reveal, at(90))).toBe(false);
    const away = paused({ startedAt: iso(0) }, at(60), "away")!;
    expect(resumed(away, at(90), "reveal")).toBeNull();
    expect(isAway(away, at(90))).toBe(true);
    expect(elapsedMs(resumed(away, at(90), "away")!, at(100))).toBe(70_000);
  });

  it("a practice hold survives leaving and coming back, and only Resume lifts it", () => {
    const hold = paused({ startedAt: iso(0) }, at(60), "hold")!;
    expect(paused(hold, at(70), "away")).toBeNull();
    expect(resumed(hold, at(80), "away")).toBeNull();
    expect(resumed(hold, at(80), "reveal")).toBeNull();
    expect(heartbeat(hold, at(85))!.pausedFor).toBe("hold");
    expect(isAway(hold, at(90))).toBe(false);
    expect(elapsedMs(resumed(hold, at(90), "hold")!, at(100))).toBe(70_000);
  });

  it("pausing a stale clock starts the pause at the last heartbeat", () => {
    const p = paused({ startedAt: iso(0), lastSeenAt: iso(50) }, at(500), "away")!;
    expect(p.pausedAt).toBe(iso(50));
    expect(elapsedMs(p, at(900))).toBe(50_000);
  });
});

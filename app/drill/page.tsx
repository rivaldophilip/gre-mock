import { pickNext, pickReplay } from "@/lib/drill";
import { DrillRunner } from "@/components/DrillRunner";

export const dynamic = "force-dynamic";

/** Endless vocab: single TC / SE questions from the drill pool, one after another; `?replay=1` replays misses instead. */
export default async function Drill({ searchParams }: { searchParams: Promise<{ replay?: string }> }) {
  const replay = (await searchParams).replay === "1";
  return <DrillRunner key={String(replay)} initial={await (replay ? pickReplay() : pickNext())} replay={replay} />;
}

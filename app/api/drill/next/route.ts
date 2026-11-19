import { NextResponse } from "next/server";
import { pickNext, pickReplay } from "@/lib/drill";

/**
 * The next endless-vocab question (never the one in `exclude`, the one on screen, while another is left). With
 * `replay=1`, the next missed TC / SE item to replay instead.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const exclude = params.get("exclude") ?? undefined;
  return NextResponse.json(await (params.get("replay") === "1" ? pickReplay(exclude) : pickNext(exclude)));
}

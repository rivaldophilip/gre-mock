import { NextResponse } from "next/server";
import { z } from "zod";
import { userDb } from "@/lib/session";
import { createQuiz } from "@/lib/quiz";
import { CUSTOM_MAX, CUSTOM_TYPES } from "@/lib/assemble/custom";

const Measure = z.enum(["verbal", "quant"]);
const Body = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mock"), measure: Measure }),
  z.object({
    kind: z.literal("custom"),
    measure: Measure,
    length: z.number().int().min(1).max(CUSTOM_MAX),
    types: z.array(z.enum([...CUSTOM_TYPES.verbal, ...CUSTOM_TYPES.quant])).min(1),
    targets: z.union([z.literal("weakest"), z.array(z.string().regex(/^[a-z0-9-]+$/)).max(60)]),
    levels: z.tuple([z.number().int().min(1).max(7), z.number().int().min(1).max(7)]),
    timer: z.boolean(),
  }),
]);

/**
 * Assemble a quiz from the bank. Ready when every slot was filled exactly; a draft (with its fallbacks, for the
 * Proceed / Cancel dialog) when any fell back; 409 with what is missing when the bank cannot fill it at all.
 */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const spec = body.data;
  if (spec.kind === "custom" && spec.types.some((t) => !(CUSTOM_TYPES[spec.measure] as readonly string[]).includes(t)))
    return NextResponse.json({ error: "a type of the other measure" }, { status: 400 });
  const out = await createQuiz(await userDb(), spec);
  if (!out.ok) return NextResponse.json({ error: "not enough questions in the bank", failures: out.failures }, { status: 409 });
  return NextResponse.json(out);
}

import concepts from "@/data/concepts.json";
import rcSkills from "@/data/rc_skills.json";
import { AppHeader } from "@/components/AppHeader";
import { CreateQuiz, type TopicGroup } from "@/components/CreateQuiz";
import { CUSTOM_TYPES } from "@/lib/assemble/custom";
import { TYPE_INFO } from "@/lib/qtypes";

export const dynamic = "force-dynamic";

const AREA = { arithmetic: "Arithmetic", algebra: "Algebra", geometry: "Geometry", data: "Data analysis", reading: "Reading", argument: "Arguments" } as Record<string, string>;

/** Make a quiz from the question bank: a full mock, or a custom one (types, topics, levels, length). */
export default async function Create({ searchParams }: { searchParams: Promise<{ m?: string; kind?: string }> }) {
  const { m, kind } = await searchParams;
  const measure = m === "quant" ? "quant" : "verbal";
  const group = (rows: { id: string; name: string; area: string }[]): TopicGroup[] =>
    [...new Set(rows.map((r) => r.area))].map((area) => ({ area: AREA[area] ?? area, items: rows.filter((r) => r.area === area).map((r) => ({ id: r.id, name: r.name })) }));
  const topics = { quant: group(concepts), verbal: group(rcSkills) };
  const types = {
    quant: CUSTOM_TYPES.quant.map((t) => ({ id: t, label: TYPE_INFO[t].label })),
    verbal: CUSTOM_TYPES.verbal.map((t) => ({ id: t, label: t === "rc" ? "Reading passages" : TYPE_INFO[t].label })),
  };
  return (
    <>
      <AppHeader active="tests" />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New quiz</h1>
          <p className="text-sm text-muted">Assembled from the question bank, aimed at what you need next. Questions you have seen are left out.</p>
        </div>
        <CreateQuiz initialMeasure={measure} initialKind={kind === "custom" ? "custom" : "mock"} topics={topics} types={types} />
      </main>
    </>
  );
}

import type { Figure as F } from "@/lib/types";
import { RichInline } from "./Rich";

/** SVG figures inherit the text color, so authored SVGs should draw with currentColor to work in both themes. */
export function Figure({ fig }: { fig: F }) {
  return (
    <figure className="my-1 space-y-2 rounded-2xl border border-line bg-surface p-3 text-fg">
      {fig.svg && <div className="flex justify-center [&>svg]:h-auto [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: fig.svg }} />}
      {fig.table && (
        <div className="overflow-x-auto">
          <table className="mx-auto w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-line">
                {fig.table.head.map((h, i) => (
                  <th key={i} className={`px-3 py-2 font-semibold text-muted ${i === 0 ? "text-left" : "text-right"}`}>
                    <RichInline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fig.table.rows.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {r.map((c, j) => (
                    <td key={j} className={`px-3 py-2 ${j === 0 ? "text-left" : "text-right"}`}>
                      <RichInline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {fig.caption && <figcaption className="text-center text-xs text-muted">{fig.caption}</figcaption>}
    </figure>
  );
}

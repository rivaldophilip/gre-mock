import type { Figure as F } from "@/lib/types";
import { RichInline } from "./Rich";

export function Figure({ fig }: { fig: F }) {
  return (
    <figure className="my-3 rounded border p-3">
      {fig.svg && <div className="flex justify-center [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: fig.svg }} />}
      {fig.table && (
        <table className="mx-auto border-collapse text-sm">
          <thead>
            <tr>
              {fig.table.head.map((h, i) => (
                <th key={i} className="border px-3 py-1 text-left">
                  <RichInline text={h} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fig.table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className="border px-3 py-1">
                    <RichInline text={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {fig.caption && <figcaption className="mt-2 text-center text-xs opacity-70">{fig.caption}</figcaption>}
    </figure>
  );
}

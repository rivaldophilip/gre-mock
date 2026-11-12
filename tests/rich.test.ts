import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Rich } from "@/components/Rich";

const render = (text: string) => renderToStaticMarkup(createElement(Rich, { text }));

describe("Rich", () => {
  it("keeps escaped dollar signs inside a $math$ span", () => {
    const html = render(
      "cost of $\\$50$. A loyalty-card holder paid $\\$54$ for the jacket, what percent above the cost?",
    );
    // exactly the two amounts are typeset (KaTeX keeps each span's TeX source in an annotation)
    const sources = [...html.matchAll(/<annotation encoding="application\/x-tex">(.*?)<\/annotation>/g)].map((m) => m[1]);
    expect(sources).toEqual(["\\$50", "\\$54"]);
    expect(html).not.toContain("katex-error");
  });

  it("still renders ordinary math, bold and italic", () => {
    const html = render("Solve $x^2 = 4$, **now** and *later*");
    expect(html.match(/class="katex"/g)).toHaveLength(1);
    expect(html).toContain("<strong>now</strong>");
    expect(html).toContain("<em>later</em>");
  });
});

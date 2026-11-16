import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Rich, type WordRender } from "@/components/Rich";

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

  it("passes each plain, bold and italic word through `word`, but never splits math", () => {
    const seen: string[] = [];
    const word: WordRender = (t, key) => (seen.push(t), createElement("u", { key }, t));
    const html = renderToStaticMarkup(createElement(Rich, { text: "The *laconic* reply, **curt**, cost $x + y$ here", word }));
    expect(seen).toEqual(["The", "laconic", "reply,", "curt", ",", "cost", "here"]);
    expect(html).toContain("<em><u>laconic</u></em>");
    expect(html).toContain("<strong><u>curt</u></strong>");
    expect(html.match(/class="katex"/g)).toHaveLength(1);
  });

  it("renders the same as before without `word`", () => {
    expect(render("A *b* **c** $d$")).toBe(renderToStaticMarkup(createElement(Rich, { text: "A *b* **c** $d$", word: undefined })));
    expect(render("plain words here")).toBe("<div><p class=\"mb-3 last:mb-0 whitespace-pre-line\">plain words here</p></div>");
  });
});

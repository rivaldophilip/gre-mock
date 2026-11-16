import katex from "katex";

/** Renders one whitespace-free token of plain (or bold / italic) text, e.g. as a tappable word. */
export type WordRender = (token: string, key: string) => React.ReactNode;

/** Plain text, or with `word` each non-space token passed through it (spaces kept as they are). */
function words(text: string, key: string, word?: WordRender): React.ReactNode {
  if (!word) return text;
  return text.split(/(\s+)/).map((t, j) => (!t || /^\s+$/.test(t) ? t : word(t, `${key}.${j}`)));
}

/** Tiny inline markup: $math$, **bold**, *italic*, blank lines = paragraphs. Math is never split into words. */
function inline(text: string, key: string, word?: WordRender) {
  const out: React.ReactNode[] = [];
  // A math span may contain an escaped dollar sign (`$\$50$`), so `\$` must not close it.
  // A bare `\$` outside math is a literal dollar sign, matched first so it cannot open a math span.
  const re = /\\\$|\$((?:\\.|[^$\\])+)\$|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(words(text.slice(last, m.index), `${key}-t${i++}`, word));
    if (m[0] === "\\$") out.push("$");
    else if (m[1] !== undefined) {
      const html = katex.renderToString(m[1], { throwOnError: false });
      out.push(<span key={`${key}-${i++}`} dangerouslySetInnerHTML={{ __html: html }} />);
    } else if (m[2] !== undefined) out.push(<strong key={`${key}-${i}`}>{words(m[2], `${key}-${i++}`, word)}</strong>);
    else out.push(<em key={`${key}-${i}`}>{words(m[3], `${key}-${i++}`, word)}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(words(text.slice(last), `${key}-t${i}`, word));
  return out;
}

export function Rich({ text, className, word }: { text: string; className?: string; word?: WordRender }) {
  const paras = text.split(/\n\s*\n/);
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i} className="mb-3 last:mb-0 whitespace-pre-line">
          {inline(p, String(i), word)}
        </p>
      ))}
    </div>
  );
}

export function RichInline({ text, word }: { text: string; word?: WordRender }) {
  return <>{inline(text, "i", word)}</>;
}

/** One formula on its own, set at display size (fractions full height), for formula cards. */
export function Tex({ tex, className }: { tex: string; className?: string }) {
  const html = katex.renderToString(`\\displaystyle ${tex}`, { throwOnError: false });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

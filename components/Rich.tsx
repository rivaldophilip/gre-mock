import katex from "katex";

/** Tiny inline markup: $math$, **bold**, *italic*, blank lines = paragraphs. */
function inline(text: string, key: string) {
  const out: React.ReactNode[] = [];
  const re = /\$([^$]+)\$|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const html = katex.renderToString(m[1], { throwOnError: false });
      out.push(<span key={`${key}-${i++}`} dangerouslySetInnerHTML={{ __html: html }} />);
    } else if (m[2] !== undefined) out.push(<strong key={`${key}-${i++}`}>{m[2]}</strong>);
    else out.push(<em key={`${key}-${i++}`}>{m[3]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Rich({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n\s*\n/);
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i} className="mb-3 last:mb-0 whitespace-pre-line">
          {inline(p, String(i))}
        </p>
      ))}
    </div>
  );
}

export function RichInline({ text }: { text: string }) {
  return <>{inline(text, "i")}</>;
}

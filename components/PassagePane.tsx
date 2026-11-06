"use client";
import { passageSentences } from "@/lib/sentences";
import type { PublicPassage } from "@/lib/types";
import { RichInline } from "./Rich";

export function PassagePane({
  passage,
  selectable,
  selected,
  onSelect,
  highlight,
}: {
  passage: PublicPassage;
  selectable?: boolean;
  selected?: number;
  onSelect?: (i: number) => void;
  highlight?: number; // sentence index to highlight in review
}) {
  const body = "max-w-[68ch] space-y-4 text-[16.5px] leading-[1.75]";
  const title = passage.title && <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{passage.title}</h3>;
  if (!selectable) {
    return (
      <div className={body}>
        {title}
        {passage.paragraphs.map((p, i) => (
          <p key={i}>
            <RichInline text={p} />
          </p>
        ))}
      </div>
    );
  }
  const sents = passageSentences(passage.paragraphs);
  const paras = passage.paragraphs.map((_, i) => sents.map((s, idx) => ({ ...s, idx })).filter((s) => s.para === i));
  return (
    <div className={body}>
      {title}
      {paras.map((ss, i) => (
        <p key={i}>
          {ss.map((s) => (
            <span
              key={s.idx}
              role="button"
              tabIndex={0}
              aria-pressed={selected === s.idx}
              onClick={() => onSelect?.(s.idx)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(s.idx)}
              className={`cursor-pointer rounded-md px-0.5 py-0.5 decoration-clone transition-colors [box-decoration-break:clone] ${
                selected === s.idx ? "bg-accent/25 text-fg" : "hover:bg-accent-soft"
              } ${highlight === s.idx ? "bg-ok-soft outline-2 outline-ok" : ""}`}
            >
              <RichInline text={s.text} />{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

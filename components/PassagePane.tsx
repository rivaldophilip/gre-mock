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
  if (!selectable) {
    return (
      <div className="space-y-3 leading-relaxed">
        {passage.title && <h3 className="font-semibold">{passage.title}</h3>}
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
    <div className="space-y-3 leading-relaxed">
      {passage.title && <h3 className="font-semibold">{passage.title}</h3>}
      {paras.map((ss, i) => (
        <p key={i}>
          {ss.map((s) => (
            <span
              key={s.idx}
              role="button"
              tabIndex={0}
              onClick={() => onSelect?.(s.idx)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(s.idx)}
              className={`cursor-pointer rounded px-0.5 hover:bg-yellow-200/60 dark:hover:bg-yellow-500/30 ${
                selected === s.idx ? "bg-yellow-300 dark:bg-yellow-600/60" : ""
              } ${highlight === s.idx ? "outline outline-2 outline-green-500" : ""}`}
            >
              <RichInline text={s.text} />{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

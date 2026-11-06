/** Shared class strings, so every page draws buttons, cards and pills the same way. */

type BtnVariant = "primary" | "secondary" | "soft" | "ghost" | "danger" | "ok";
type BtnSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-45";
const BTN_SIZE: Record<BtnSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-[15px]",
  lg: "h-12 px-5 text-base",
};
const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent/90 active:bg-accent/80",
  secondary: "border border-line bg-surface text-fg hover:bg-surface-2",
  soft: "bg-surface-2 text-fg hover:bg-line/70",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-bad text-bad-fg hover:bg-bad/90",
  ok: "bg-ok text-surface hover:bg-ok/90",
};

export const btn = (variant: BtnVariant = "secondary", size: BtnSize = "md") => `${BTN_BASE} ${BTN_SIZE[size]} ${BTN_VARIANT[variant]}`;

/** Square icon-only button. */
export const iconBtn = (on = false, tone: "mark" | "accent" = "mark") =>
  `inline-grid size-10 shrink-0 place-items-center rounded-xl border transition-colors ${
    !on ? "border-line bg-surface text-fg hover:bg-surface-2" : tone === "mark" ? "border-mark/50 bg-mark/12 text-mark" : "border-accent/50 bg-accent-soft text-accent"
  }`;

export const card = "rounded-2xl border border-line bg-surface";

type Tone = "accent" | "ok" | "bad" | "warn" | "muted";
const TONE: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent",
  ok: "bg-ok-soft text-ok",
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
  muted: "bg-surface-2 text-muted",
};
export const badge = (tone: Tone = "muted") => `inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]}`;

/** Segmented control: wrapper + one item. */
export const seg = "flex gap-0.5 rounded-xl bg-surface-2 p-1";
export const segItem = (on: boolean) =>
  `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    on ? "bg-surface text-fg shadow-sm dark:bg-line" : "text-muted hover:text-fg"
  }`;

/** Text inputs: 16px so iOS never zooms on focus. */
export const field =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

/** Uppercase eyebrow label. */
export const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted";

"use client";
import { useSyncExternalStore } from "react";
import { readThemePref, setThemePref, type ThemePref } from "@/lib/theme";
import { IconMonitor, IconMoon, IconSun } from "./icons";

const subscribe = (cb: () => void) => {
  window.addEventListener("themepref", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("themepref", cb);
    window.removeEventListener("storage", cb);
  };
};

const OPTIONS: { v: ThemePref; label: string; Icon: typeof IconSun }[] = [
  { v: "light", label: "Light", Icon: IconSun },
  { v: "dark", label: "Dark", Icon: IconMoon },
  { v: "system", label: "System", Icon: IconMonitor },
];

/** Light / Dark / System. The server renders no selection; the client fills it in after hydration. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const pref = useSyncExternalStore(subscribe, readThemePref, () => null);
  return (
    <div role="radiogroup" aria-label="Theme" className={`inline-flex gap-0.5 rounded-xl bg-surface-2 p-0.5 ${className}`}>
      {OPTIONS.map(({ v, label, Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={pref === v}
          aria-label={label}
          title={label}
          onClick={() => setThemePref(v)}
          className={`grid size-8 place-items-center rounded-[10px] transition-colors ${pref === v ? "bg-surface text-fg shadow-sm dark:bg-line" : "text-muted hover:text-fg"}`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}

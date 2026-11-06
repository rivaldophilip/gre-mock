/** Theme preference: "light" | "dark" | "system" (the default, stored as no value). */
export type ThemePref = "light" | "dark" | "system";
export const THEME_KEY = "theme";
const COLORS = { light: "#f5f8f8", dark: "#0e1314" };

/**
 * Runs inline in <head> before first paint: resolves the saved preference to data-theme="light|dark" on <html>,
 * keeps following the OS while set to system, and keeps the browser chrome (theme-color) in step.
 * Exposes window.__applyTheme for the toggle.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");function apply(){var p=null;try{p=localStorage.getItem(${JSON.stringify(THEME_KEY)})}catch(e){}var t=p==="dark"||(p!=="light"&&m.matches)?"dark":"light";d.dataset.theme=t;document.querySelectorAll('meta[name="theme-color"]').forEach(function(x){x.setAttribute("content",t==="dark"?${JSON.stringify(COLORS.dark)}:${JSON.stringify(COLORS.light)})})}apply();m.addEventListener("change",apply);addEventListener("storage",apply);document.addEventListener("DOMContentLoaded",apply);window.__applyTheme=apply})()`;

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function setThemePref(p: ThemePref) {
  try {
    if (p === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, p);
  } catch {}
  (window as unknown as { __applyTheme?: () => void }).__applyTheme?.();
  window.dispatchEvent(new Event("themepref"));
}

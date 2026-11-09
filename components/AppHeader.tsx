import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { IconLogout } from "./icons";
import { btn } from "./ui";

/** Top bar for the dashboard, study, stats and review pages. */
export function AppHeader({ active }: { active?: "tests" | "study" | "stats" }) {
  const nav = (href: string, label: string, on: boolean) => (
    <Link href={href} aria-current={on ? "page" : undefined} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${on ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}>
      {label}
    </Link>
  );
  return (
    <header className="print:hidden sticky top-0 z-30 border-b border-line bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-2 px-4">
        <Link href="/" className="mr-1 flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-[10px] bg-accent text-[10.5px] font-bold tracking-wide text-accent-fg">GRE</span>
          <span className="hidden sm:inline">Hard Mocks</span>
        </Link>
        <nav className="flex gap-0.5">
          {nav("/", "Tests", active === "tests")}
          {nav("/study", "Study", active === "study")}
          {nav("/stats", "Stats", active === "stats")}
        </nav>
        <span className="flex-1" />
        <ThemeToggle />
        <form action="/api/logout" method="post">
          <button className={`${btn("ghost", "sm")} px-2.5`} aria-label="Log out" title="Log out">
            <IconLogout size={17} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </form>
      </div>
    </header>
  );
}

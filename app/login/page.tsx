"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { btn, card, field } from "@/components/ui";
import { IconAlert } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (r.ok) return router.replace("/");
    const j = await r.json().catch(() => ({}));
    setErr(j.error ?? "Sign-in failed");
  }
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <ThemeToggle className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))]" />
      <form onSubmit={submit} className={`${card} w-full max-w-sm space-y-5 p-6 shadow-sm sm:p-7`}>
        <div className="space-y-3">
          <span className="grid size-11 place-items-center rounded-xl bg-accent text-xs font-bold tracking-wide text-accent-fg">GRE</span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">GRE Hard Mocks</h1>
            <p className="text-sm text-muted">Sign in to take and review your tests.</p>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              autoFocus
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={field}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </label>
        </div>
        {err && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-bad-soft px-3 py-2.5 text-sm text-bad">
            <IconAlert size={17} className="mt-px" />
            {err}
          </p>
        )}
        <button disabled={busy} className={`${btn("primary", "lg")} w-full`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

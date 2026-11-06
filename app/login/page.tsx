"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">GRE Hard Mocks</h1>
        <input
          type="email"
          autoFocus
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border bg-transparent px-3 py-2"
        />
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded border bg-transparent px-3 py-2"
        />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button disabled={busy} className="w-full rounded bg-blue-600 px-3 py-2 font-medium text-white disabled:opacity-50">
          Sign in
        </button>
      </form>
    </main>
  );
}

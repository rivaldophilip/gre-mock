"use client";
import { useState } from "react";

export default function Login() {
  const [passcode, setPasscode] = useState("");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (r.ok) window.location.href = "/";
    else setErr("Wrong passcode");
  }
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">GRE Hard Mocks</h1>
        <input
          type="password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="w-full rounded border bg-transparent px-3 py-2"
        />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="w-full rounded bg-blue-600 px-3 py-2 font-medium text-white">Enter</button>
      </form>
    </main>
  );
}

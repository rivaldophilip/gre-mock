"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { btn } from "./ui";

/** Restore one dismissed word to the weakest list. */
export function WordRestore({ id, lemma }: { id: string; lemma: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function restore() {
    setBusy(true);
    const r = await fetch("/api/words/dismiss", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
    setBusy(false);
    if (r.ok) startTransition(() => router.refresh());
  }

  return (
    <button type="button" disabled={busy || pending} onClick={restore} aria-label={`Restore ${lemma}`} className={btn("ghost", "sm")}>
      Restore
    </button>
  );
}

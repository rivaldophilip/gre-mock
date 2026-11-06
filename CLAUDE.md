# GRE Hard Mock app

Next.js (App Router) + TypeScript + Tailwind + Drizzle/Neon Postgres, deployed on Vercel. Tests are authored by Claude Code ahead of time as JSON in `content/tests/`; the webapp only takes and reviews them.

- **To create a test:** run `/new-test verbal` or `/new-test quant`, which follows `docs/QUIZ-AUTHORING.md`.
- Priority model for targeting weak words/concepts: `docs/PRIORITY.md`. Difficulty craft: `docs/HARD-PATTERNS.md`.
- **Public repo: never commit** ETS / Big Book text, the extracted corpus (`../books/extracted/`), `.env*`, or answer keys served to the client. Every test item must be original.
- Next.js here is v16: `proxy.ts` replaces middleware, `params`/`searchParams` are Promises. Read `node_modules/next/dist/docs/` before changing framework-level code.
- DB: Neon Postgres (Vercel Marketplace resource `gre-mock-db`, connected to the `gre-mock` project, so `DATABASE_URL` is set in every Vercel environment). `APP_PASSCODE` and `AUTH_SECRET` must also be set in Vercel. Locally `.env.local` holds the same `DATABASE_URL` (`vercel env pull`) plus `APP_PASSCODE`; a localhost URL switches to the plain `pg` driver. `npm run db:push`, `npm run seed`, `npm test`, `npm run validate -- <id>`.
- Vocab bank: `python3 scripts/build_vocab.py --ets data/ets_words.txt` → `data/vocab.json`, then `npm run seed`. Inputs: `data/popular_words.txt` (core), `data/extra_words.json` (secondary / extended / passage tiers), `data/definitions.json` (pos + senses per lemma, own words), `data/dropped_words.txt` (noise from the official-items mining). A new word needs a definitions entry, or the build reports it as missing.
- Reference corpus (local only, `../books/extracted/reference/`): `python3 scripts/merge_reference.py` rebuilds `items.jsonl`, applying the page-image repairs in `reference/fixes/` (quant math, Quantity A/B, figure descriptions). Then `python3 scripts/concept_yields.py` recomputes concept yields. `scripts/pdf_text.js` does the PDFKit text extraction; `pdftoppm` (poppler) renders pages.

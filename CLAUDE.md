# GRE Hard Mock app

Next.js (App Router) + TypeScript + Tailwind + Drizzle/Neon Postgres, deployed on Vercel. Tests are authored by Claude Code ahead of time as JSON in `content/tests/`; the webapp only takes and reviews them.

- **To create a test:** run `/new-test verbal` or `/new-test quant`, which follows `docs/QUIZ-AUTHORING.md`.
- Priority model for targeting weak words/concepts: `docs/PRIORITY.md`. Difficulty craft: `docs/HARD-PATTERNS.md`.
- **Public repo: never commit** ETS / Big Book text, the extracted corpus (`../books/extracted/`), `.env*`, or answer keys served to the client. Every test item must be original.
- Next.js here is v16: `proxy.ts` replaces middleware, `params`/`searchParams` are Promises. Read `node_modules/next/dist/docs/` before changing framework-level code.
- Dev: `.env.local` holds `DATABASE_URL` (pull with `vercel env pull .env.local`; a localhost URL uses the plain `pg` driver) and `APP_PASSCODE`. `npm run db:push`, `npm run seed`, `npm test`, `npm run validate -- <id>`.
- Scripts: `scripts/build_vocab.py` (vocab bank from the xlsx + extras + official-word evidence), `scripts/pdf_text.js` (PDFKit text extraction).

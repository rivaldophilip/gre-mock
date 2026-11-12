# GRE Hard Mock app

Next.js (App Router) + TypeScript + Tailwind + Drizzle/Neon Postgres, deployed on Vercel. Tests are authored by Claude Code ahead of time as JSON in `content/tests/`; the webapp only takes and reviews them.

- **To create a test:** run `/new-test verbal` or `/new-test quant`, which follows `docs/QUIZ-AUTHORING.md`.
- Priority model for targeting weak words, quant concepts and reading skills (`data/rc_skills.json`, which shares the concepts table under areas `reading` / `argument`): `docs/PRIORITY.md`. Each quant concept and reading skill lists its sub-forms in `data/concept_variants.json` (a new concept needs an entry there and a section in `content/study/quant.json`; a new skill needs an entry there). Difficulty craft: `docs/HARD-PATTERNS.md`. Levels 6–7 (calibrated against PowerPrep and official items): `docs/CALIBRATION.md`.
- **Public repo: never commit** ETS / Big Book text, the extracted corpus (`../books/extracted/`), `.env*`, or answer keys served to the client. Every test item must be original.
- Next.js here is v16: `proxy.ts` replaces middleware, `params`/`searchParams` are Promises. Read `node_modules/next/dist/docs/` before changing framework-level code.
- **Accounts and data isolation.** Sign-in is email + password, and **there is no sign-up path in the app; never add one.** Accounts are created only from the CLI: `npm run user:add -- <email>` (password from a hidden prompt), plus `user:passwd`, `user:list` and `user:remove`. Neon has two kinds of database on one branch:
  - `neondb` (`DATABASE_URL`) is the **registry**: just the `users` table (`lib/db/registry.ts`, migrations in `drizzle-registry/`), holding scrypt hashes and a 5-failure / 15-minute lockout.
  - `gre_u_<id>` is **each user's own database**, with the full schema in `lib/db/schema.ts` (migrations in `drizzle/`). Its URL is `DATABASE_URL` with the database name swapped.

  The session JWT (signed with `AUTH_SECRET`) names the user's database. App code reaches it only through `userDb()` (`lib/session.ts`), never through a global connection.
- **DB setup.** Neon is the Vercel Marketplace resource `gre-mock-db`, connected to the `gre-mock` project, so `DATABASE_URL` is set in every Vercel environment; `AUTH_SECRET` (≥ 32 chars) must also be set there. Locally `.env.local` holds both (`vercel env pull`); a localhost URL switches to the plain `pg` driver. After a schema change, run `npm run db:generate`, then `npm run db:migrate` (registry plus every user database). `npm run seed` and `npm run register -- <id>` write to every user database (or one, with `--user <email>`); `npm run brief` reads one user's stats. Also `npm test`. For authoring:
  - `npm run -s check -- <id>` tags, validates and runs the quant key check (`content/verify/keys.py`) in one call;
  - `npm run -s blind -- <id> [--only ids] [--check -]` makes the blind copy for the `gre-blind-solver` agent and checks its reply;
  - `npm run -s novelty -- <id> [--only ids] [--check -]` pairs each item with the earlier items it could repeat, for the `gre-novelty-judge` agent, and checks its verdicts (`--audit quant|verbal` sweeps earlier tests);
  - `register` refuses an invalid test;
  - `python3 scripts/session_stats.py` measures a run from its transcript.
- Vocab bank: `python3 scripts/build_vocab.py --ets data/ets_words.txt` → `data/vocab.json`, then `npm run seed`. Inputs: `data/popular_words.txt` (core), `data/extra_words.json` (secondary / extended / passage tiers), `data/definitions.json` (pos + senses per lemma, own words), `data/dropped_words.txt` (noise from the official-items mining). A new word needs a definitions entry, or the build reports it as missing.
- Reference corpus (local only, `../books/extracted/reference/`): `python3 scripts/merge_reference.py` rebuilds `items.jsonl`, applying the page-image repairs in `reference/fixes/` (quant math, Quantity A/B, figure descriptions) and the tags for later-added concepts in `reference/concept_retags.jsonl`. Then `python3 scripts/concept_yields.py` recomputes concept yields. `scripts/pdf_text.js` does the PDFKit text extraction; `pdftoppm` (poppler) renders pages.

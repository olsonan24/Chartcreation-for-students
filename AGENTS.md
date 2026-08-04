# Aionis Student Chart Creator

## Scope

- This repository root is the Vercel-deployed Vite PWA.
- `lib/numerology.ts` is the approved formula engine.
- `reference/Pass7-Recreated/` is read-only formula provenance and is not part of the web build.
- The private Aionis owner console is intentionally outside this public repository.

## Non-negotiable contracts

- Do not change `lib/numerology.ts` without explicit formula approval and the formula-auditor workflow.
- Preserve the legacy browser key `pass7-mobile-clients-v1`; it is an opt-in import source, never an automatic upload source.
- Accept DOB as `DD/MM/YYYY`; convert dates only in `features/people/people.mapper.ts`.
- Screen, phone, comparison, and print must consume the same `Report` calculations.
- Keep owner telemetry, tokens, and administrative controls out of this application.
- Preserve the one-page A4 print contract and installable PWA shell.
- Never put a Supabase secret or service-role key in browser code, Vercel client variables, tests, screenshots, or documentation.

## Authentication and data ownership

- `lib/supabase/client.ts` owns the single typed browser client.
- `features/auth/` owns session state and sign-in/sign-up/sign-out UI.
- `features/people/people.repository.ts` owns all `public.people` queries.
- `features/people/usePeople.ts` owns loading and confirmed-write UI state.
- `features/people/people.mapper.ts` owns database/application field and date conversion.
- `supabase/migrations/` is the source of truth for tables, grants, triggers, and RLS.
- `lib/supabase/database.types.ts` must be regenerated from the schema after every data-model change.
- `app/page.tsx` coordinates the application and must not contain raw Supabase queries or policy logic.

Every `public.people` policy must retain `TO authenticated` and ownership checks against `(select auth.uid())`. Updates require both `USING` and `WITH CHECK`. Do not disable RLS or trust a form-supplied user ID.

## Verification

Run from the repository root:

```text
npm ci
npm run lint
npm test
npm run build
```

For database work, start the isolated local stack and run:

```text
npx supabase start
npx supabase db lint --local --level warning
npm run test:db
npm run supabase:types:local
```

The optional authenticated production-preview proof is `npm run test:print-proof`; it requires `E2E_BASE_URL`, `E2E_EMAIL`, and `E2E_PASSWORD`, with `E2E_SIGN_UP=1` for a new disposable local account.

Before applying to a linked project, inspect existing tables/policies and use a dry run. Never run a destructive remote reset. After an approved migration, regenerate linked types and run RLS tests plus Supabase security/performance advisors.

For print changes, generate and inspect a real one-page A4 PDF. For UI changes, verify phone and desktop layouts without document-level horizontal overflow.

## AI development workflow

Use `.agents/skills/aionis-ai-workflow/SKILL.md` for substantial repository work, context recovery, accepted-answer reuse, or efficiency review.

For governed multi-target features, agent contracts, Dream reviews, analytics, or releases, start at `docs/aionis-operating-system/00-START-HERE.md` and use `.agents/skills/aionis-operating-system/SKILL.md`.

- Continue the current thread while the same tightly scoped problem and live debugging state remain useful. Start a clean thread only when the primary job changes, a verified artifact replaces the conversation, or obsolete material dominates. Never restart mid-debug when current runtime state is still required.
- Before compaction or context editing, update `docs/ai-context/CRITICAL_STATE.md`. Afterward, reread it and reconcile every protected fact before continuing.
- Correct misunderstandings at the source: stop the wrong path, rewrite the complete corrected request, preserve only accepted work, and use a clean task when rejected reasoning has polluted the thread.
- Define the smallest sufficient deliverable before substantial work. Routine updates stay short; specifications and verification reports may be as long as needed.
- Select the smallest applicable tool profile from `docs/ai-context/TOOL_PROFILES.md`. Repository instructions cannot unload tools already placed in the request envelope.
- Recommend the least expensive model likely to succeed after considering ambiguity, risk, context, retries, and verification. Never silently change the active model.
- Validate entries in `docs/ai-context/ACCEPTED_ANSWERS.json` before reuse and summarize the reused decision. Ask when current intent is ambiguous.
- Record only privacy-safe efficiency summaries with the workflow telemetry script. Keep telemetry outside the student application and out of Git.
- Treat prompt caching as an API optimization for stable repeated prefixes, not the default remedy for an interactive coding thread.
- Treat repository skills as Level 2 controls. History/tool reduction before a model call requires the optional Level 3 gateway described in `docs/ai-context/LEVEL3_GATEWAY_SPEC.md`.

## Vercel

Vercel uses the repository root, `npm ci`, `npm run build`, and `dist`. It requires browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables for Production and Preview. Cloud records and authentication require connectivity; only the PWA application shell is cached for offline loading.

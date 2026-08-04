# Current State

Updated: 2026-08-03

## Products

- Student app: this repository root (`Chartcreation-for-students`)
- Private owner console: separate local workspace, never deployed with this app
- Recovered formula reference: `reference/Pass7-Recreated/`

## Student App Checkpoint

- Current documentation branch: `docs/aionis-ai-operating-system` (stacked on `feature/supabase-user-persistence`)
- Published `main` baseline: `2250222`
- Formula engine is unchanged from its approved port.
- Formula baseline SHA-256: `F7A0965F01AA4410BB38CEF05FF832F51A5EAFF6CC2E8E10238DB79EF7E5644A`
- Standard Vite production build outputs `dist/index.html`; Workbox precaches the app shell and artwork.
- `vercel.json` retains the Vite build/output settings and SPA fallback.
- Local app URL: `http://localhost:4173` (LAN address varies by workstation).

## Supabase Persistence Milestone

The feature branch adds a narrow authentication/persistence boundary without changing formulas or report rendering:

- one typed browser client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`;
- email/password sign-up, sign-in, restored sessions, auth subscription, and immediate in-memory clearing on sign-out;
- typed people mapper, repository, and React loading/mutation hook outside `app/page.tsx`;
- confirmed create/update/delete behavior that preserves visible records on remote failure;
- committed `public.people` migration with explicit authenticated grants, RLS, trigger, ownership index, and minimal source fields;
- follow-up grant hardening that removes Supabase default table privileges beyond SELECT, INSERT, UPDATE, and DELETE and prevents API roles from executing the trigger function directly;
- generated TypeScript database types from the applied local migration;
- consent-based legacy import that never deletes `pass7-mobile-clients-v1` and prevents normalized duplicates;
- accurate private-account/cloud-connectivity language and isolated additive auth/import styling.

Local database verification currently passes:

- schema migration applies to an isolated Supabase stack on ports `55320`–`55329`;
- schema lint reports no warnings;
- pgTAP proves eight own-row, cross-user, foreign-owner, and unauthenticated access cases;
- 21 mapper, repository, auth, hook, account-race, partial-import, and legacy-import tests pass;
- locked formula fixtures and SHA guard remain in the test chain.

Current authenticated Preview evidence covers registration with confirmation still required, confirmation redirect, sign-in/sign-out, session restoration after refresh and reopen, create/read/update/delete persistence, two-account switching and cross-account denial, explicit-consent legacy import, a 390x844 layout with 44px action targets and no horizontal overflow, a registered/controlling PWA after refresh, no browser console errors, no service-role credentials in browser requests, and a visually inspected one-page A4 PDF. The disposable users and rows were deleted after the run.

## Hosted Supabase and Vercel

The Vercel Marketplace resource `supabase-chart-builder` is connected to the `chartcreation-for-students` project for Production, Preview, and Development. The browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables are present in all three environments, point to the intended hosted project, and use a publishable rather than secret key. All 16 Marketplace-provided server-only Supabase, JWT, Postgres, pooler, and framework-alias variables were removed from this static frontend project. Repeated hosted readback shows only the two required `VITE_` variables across Production, Preview, and Development.

Remote project `frejicmqhsenqmdmqmfe` has both committed migrations applied. Live schema inspection on 2026-08-03 confirms `public.people` has zero rows after hosted-test cleanup, the `updated_at` trigger, RLS enabled, four authenticated owner policies with `USING` and `WITH CHECK` where applicable, no `anon` table grant, authenticated CRUD-only table privileges, and no trigger-function execution for `anon` or `authenticated`. Fresh remote `public` schema type generation matches the committed `lib/supabase/database.types.ts` after newline normalization.

The same eight pgTAP ownership cases pass against the hosted database inside a rolled-back transaction, including cross-user read/update/delete denial, foreign-owner insert denial, and unauthenticated read/insert denial. Hosted security and performance advisors report no warning- or error-level findings.

Product-bearing Vercel Preview deployment `dpl_7yFB9aLvfKrtrn94pk8nEm6JaLcL` is Ready for head `850b26828b4431f04cf7710076ba031688fd8fc2`. Its compiled Vite bundle contains the intended Supabase project URL, one publishable key, and the authentication UI, with no actual secret key, service-role JWT, direct Postgres credential, or pooler credential. Preview remains protected by Vercel Authentication. A temporary second automation bypass used for isolated browser verification was removed afterward; the pre-existing system automation bypass was not changed.

Supabase Auth is reachable, email/password signup is enabled, email confirmation remains required, and anonymous signup is disabled. The hosted Site URL is `https://chartcreation-for-students.vercel.app`. The redirect allow-list is narrowly scoped to `https://chartcreation-for-students.vercel.app/**`, `https://chartcreation-for-students-git-c5c253-olsonan24-7349s-projects.vercel.app/**`, `http://localhost:4173/**`, and `http://127.0.0.1:4173/**`. The saved state was read back from the hosted dashboard. Registration correctly returned no session before confirmation. Because the test runner has no access to the recipient inbox, one disposable user was confirmed with the Supabase administrative test method without changing Auth policy; a separate generated signup confirmation link exercised the real confirmation redirect to the authorized branch alias.

The Supabase CLI account can list the Vercel-managed project but cannot use the project-management endpoint required by `supabase link`. Database migration and verification therefore use the Vercel-provided non-pooling Postgres connection; no RLS or authentication bypass was introduced.

## Immutable Experience Contracts

- `lib/numerology.ts` and recovered formula provenance remain unchanged.
- Screen, comparison, and print continue to construct the same `Report` values.
- `PassPrintReport` and `app/globals.css` print rules retain the one-page A4 contract.
- Existing colors, typography, layouts, breakpoints, animations, assets, mobile/desktop navigation, and chart styling remain locked.
- The PWA shell can load offline; authentication and cloud records require connectivity.

## AI Workflow Milestone

Token-efficiency controls now live only in repository development artifacts; they do not run in or appear in the student application.

- `.agents/skills/aionis-ai-workflow/` provides the on-demand Level 2 workflow, deterministic audit, and privacy-safe telemetry utility.
- `docs/ai-context/CRITICAL_STATE.md` is the bounded, loss-aware checkpoint to read before and after compaction.
- `docs/ai-context/ACCEPTED_ANSWERS.json` stores a bounded, versioned registry whose entries must be revalidated before reuse.
- `docs/ai-context/TOOL_PROFILES.md` defines minimal coding, database, UI-verification, research, and release-verification profiles while documenting that an in-thread skill cannot unload tools already in the request envelope.
- `docs/ai-context/LEVEL3_GATEWAY_SPEC.md` is an optional pre-model gateway design only; no gateway or production service was deployed.
- Local telemetry is summary-only, excludes prompts and source content, and writes by default to the ignored `.ai-context/telemetry/` directory.
- Fresh threads are conditional on a material job/context change; active debugging remains in the current thread when its environment state is still needed.

Verified on 2026-08-03: the skill validator passed; all four workflow telemetry tests passed; the workflow scope guard found zero product paths; lint and production build passed; and the unchanged application test chain passed 4 formula, 21 unit, and 8 rendered-artifact checks. The formula SHA-256 still matches the protected value above.

Verification commands:

```text
python C:\Users\olson\.codex\skills\.system\skill-creator\scripts\quick_validate.py .agents\skills\aionis-ai-workflow
node --test .agents/skills/aionis-ai-workflow/scripts/telemetry.test.mjs
node .agents/skills/aionis-ai-workflow/scripts/verify-workflow.mjs
```

## Aionis AI Operating System Foundation

Prompt 1 adds development contracts only and does not implement runtime behavior:

- `docs/aionis-operating-system/` contains 17 progressively routed governance/lifecycle documents, 10 Markdown work-product templates, 9 draft JSON Schema contracts, and an intentionally empty future-audits directory;
- eight concise project-local skills cover orchestration, planning, intelligence, security, both Dream reviews, release gating, and analytics review;
- every capability is routed to one of five explicit targets, with four independent system loops, three knowledge planes, evidence lineage, human gates, privacy boundaries, and a twelve-phase roadmap that does not authorize later phases;
- existing architecture, formula, print, persistence, and token-efficient workflow sources remain authoritative and are linked rather than copied;
- the AI-workflow scope guard recognizes only the exact new Prompt 1 documentation and skill directories in addition to its prior allowed paths.

Verified on 2026-08-03: all 9 schemas pass JSON parsing and Draft 2020-12 meta-validation; all 8 new skills pass the Codex skill validator; all referenced repository paths resolve; the workflow validator and 4 telemetry tests pass; lint, 4 formula fixtures, 21 unit tests, 8 rendered-artifact tests, and the production PWA build pass. No application, formula, UI, CSS, authentication, database/RLS, PWA, print, or deployment file changed in Prompt 1.

## Known Risks and Follow-up

- Hosted default privileges for future `public` objects remain broad for both creator roles `postgres` and `supabase_admin`: API roles can inherit table DML, sequence use, and function execution. Existing `public.people` and `public.set_people_updated_at` are explicitly hardened, so this is not a PR #1 release blocker.
- A default-privilege migration is not yet safe to approve: the migration connection can change `postgres` defaults but cannot change `supabase_admin` defaults, and removing the built-in `PUBLIC EXECUTE` default for future functions requires a global role-level change rather than a `public`-schema-only change. Keep this as a separate platform-hardening follow-up; no migration was created, committed, or applied.
- The current hosted database and committed migrations are aligned; do not reapply or reset them.
- The production origin still serves `main`. PR #1 should receive human review before merge/promotion.
- Git commands must run inside this repository root; the parent workspace contains unrelated projects.
- The operating-system schemas are draft shared contracts only; they have no database, service, analytics, Dream, or runtime persistence implementation.
- The next action is human review of the Prompt 1 draft foundation. Do not start the repository gap audit or Prompts 2 through 12 without separate authorization.

## Read Next By Task

- Formula or values: `docs/FORMULA_GUARDRAILS.md`
- File ownership and data flow: `docs/ARCHITECTURE.md`
- Print/PDF: `docs/PRINT_CONTRACT.md`
- General feature: `.agents/skills/aionis-feature-orchestrator/SKILL.md`
- AI workflow and token efficiency: `.agents/skills/aionis-ai-workflow/SKILL.md`, then `docs/ai-context/WORKFLOW.md`
- Aionis operating-system governance: `docs/aionis-operating-system/00-START-HERE.md`

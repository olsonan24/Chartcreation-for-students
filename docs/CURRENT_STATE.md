# Current State

Updated: 2026-08-03

## Products

- Student app: this repository root (`Chartcreation-for-students`)
- Private owner console: separate local workspace, never deployed with this app
- Recovered formula reference: `reference/Pass7-Recreated/`

## Student App Checkpoint

- Feature branch: `feature/supabase-user-persistence`
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

Earlier authenticated preview evidence covered session persistence, create/edit/delete behavior, two-account isolation, comparison rendering, a 390x844 layout with no document-level horizontal overflow, a registered/controlling PWA after refresh, no browser console errors, no service-role credentials in browser requests, and a one-page A4 PDF. This evidence is retained as regression history, but the release gate remains open until the hosted Auth URL configuration is corrected and the flow is rerun against the current PR deployment.

## Hosted Supabase and Vercel

The Vercel Marketplace resource `supabase-chart-builder` is connected to the `chartcreation-for-students` project for Production, Preview, and Development. The browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables are present in all three environments, point to the intended hosted project, and use a publishable rather than secret key.

Release blocker: the same static Vercel project also receives privileged/server-only Marketplace variables in every environment, including Supabase secret/service-role/JWT credentials and direct Postgres connection credentials. The deployed Vite bundle does not contain those values, but keeping them in a static-browser project's Vercel environment violates least privilege. Removing or unlinking those managed variables requires explicit human approval because it is a destructive environment-configuration change.

Remote project `frejicmqhsenqmdmqmfe` has both committed migrations applied. Live schema inspection on 2026-08-03 confirms `public.people` has zero rows, the `updated_at` trigger, RLS enabled, four authenticated owner policies, no `anon` table grant, authenticated CRUD-only table privileges, and no trigger-function execution for `anon` or `authenticated`. Remote `public` schema type generation exactly matches the committed `lib/supabase/database.types.ts`.

The same eight pgTAP ownership cases pass against the hosted database inside a rolled-back transaction, including cross-user read/update/delete denial, foreign-owner insert denial, and unauthenticated read/insert denial. Hosted security and performance advisors report no warning- or error-level findings.

Vercel Preview deployment `dpl_CHmjt46CByKkbBjvT1BTRt6e35gn` is Ready for verified product head `7f3116d96a28a1d44d052dc1597379bf0a2811d9`. Its compiled Vite bundle contains the intended Supabase project URL, one publishable key, and the authentication UI, with no actual secret key, service-role JWT, or Postgres credential. Browser navigation to raw Preview URLs remains behind Vercel Deployment Protection; authenticated CLI retrieval verifies the deployed artifact without changing that protection setting. The subsequent readiness-checkpoint commit changes only this document and does not alter deployment inputs.

Supabase Auth is reachable, email/password signup is enabled, and email confirmation is required. Release blocker: the hosted Site URL is still `http://localhost:3000` and the redirect allow-list is empty. Because signup does not pass an explicit redirect URL, confirmation emails currently fall back to the incorrect localhost Site URL.

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

## Known Risks and Follow-up

- Human approval is required to set the Supabase Site URL to the canonical production origin and add narrowly scoped production, PR-preview, and local redirect URLs.
- Human approval is required to unlink or remove privileged Supabase/Postgres Marketplace variables from this static Vercel project while retaining only the two browser-safe `VITE_` variables.
- Hosted `public` default privileges remain broad for future tables/functions even though the current `people` table and trigger function are explicitly hardened. A separately reviewed migration should make future public objects deny-by-default before another public object is added.
- After those configuration changes, redeploy the PR head and rerun hosted email confirmation, session restore, CRUD persistence, refresh, two-account switching/isolation, phone/PWA checks, and the one-page PDF proof.
- The current hosted database and committed migrations are aligned; do not reapply or reset them.
- Keep the authenticated phone/PWA/PDF proof in the release gate and rerun it against the hosted deployment.
- Git commands must run inside this repository root; the parent workspace contains unrelated projects.

## Read Next By Task

- Formula or values: `docs/FORMULA_GUARDRAILS.md`
- File ownership and data flow: `docs/ARCHITECTURE.md`
- Print/PDF: `docs/PRINT_CONTRACT.md`
- General feature: `.agents/skills/aionis-feature-orchestrator/SKILL.md`
- AI workflow and token efficiency: `.agents/skills/aionis-ai-workflow/SKILL.md`, then `docs/ai-context/WORKFLOW.md`

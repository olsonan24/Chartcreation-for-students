# Current State

Updated: 2026-07-31

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
- generated TypeScript database types from the applied local migration;
- consent-based legacy import that never deletes `pass7-mobile-clients-v1` and prevents normalized duplicates;
- accurate private-account/cloud-connectivity language and isolated additive auth/import styling.

Local database verification currently passes:

- schema migration applies to an isolated Supabase stack on ports `55320`–`55329`;
- schema lint reports no warnings;
- pgTAP proves eight own-row, cross-user, foreign-owner, and unauthenticated access cases;
- 21 mapper, repository, auth, hook, account-race, partial-import, and legacy-import tests pass;
- locked formula fixtures and SHA guard remain in the test chain.

Authenticated production-preview verification also passes: session persistence, create/edit/delete behavior, two-account isolation, comparison rendering, a 390x844 layout with no document-level horizontal overflow, a registered/controlling PWA after refresh, no browser console errors, no service-role credentials in browser requests, and a freshly rendered one-page A4 PDF.

## Remote Project Gate

The configured Supabase MCP targets project `frejicmqhsenqmdmqmfe`, but its callable tools were not loaded into the already-running Codex task. The locally authenticated Supabase CLI belongs to another account and cannot see that project. Therefore the hosted schema has not been inspected or mutated from this task yet. Do not apply the migration remotely until authenticated tooling can first verify that `public.people` and policy names do not conflict.

After that non-destructive inspection, the remaining hosted steps are: dry-run/apply the migration, regenerate types from the linked schema, run RLS checks with two users and an unauthenticated client, and run Supabase security/performance advisors.

## Immutable Experience Contracts

- `lib/numerology.ts` and recovered formula provenance remain unchanged.
- Screen, comparison, and print continue to construct the same `Report` values.
- `PassPrintReport` and `app/globals.css` print rules retain the one-page A4 contract.
- Existing colors, typography, layouts, breakpoints, animations, assets, mobile/desktop navigation, and chart styling remain locked.
- The PWA shell can load offline; authentication and cloud records require connectivity.

## Known Risks and Follow-up

- Vercel must receive both browser-safe Supabase variables for Preview and Production before deployment.
- Hosted email confirmation and allowed redirect/site URLs must be verified in Supabase Auth settings.
- Hosted RLS proof and hosted browser flows cannot be claimed until the target project is reachable through authenticated tooling.
- Keep the authenticated production-preview phone/PWA/PDF proof in the release gate and rerun it against the hosted deployment.
- Git commands must run inside this repository root; the parent workspace contains unrelated projects.

## Read Next By Task

- Formula or values: `docs/FORMULA_GUARDRAILS.md`
- File ownership and data flow: `docs/ARCHITECTURE.md`
- Print/PDF: `docs/PRINT_CONTRACT.md`
- General feature: `.agents/skills/aionis-feature-orchestrator/SKILL.md`

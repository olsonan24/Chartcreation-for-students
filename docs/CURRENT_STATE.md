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

Authenticated production-preview verification also passes: session persistence, create/edit/delete behavior, two-account isolation, comparison rendering, a 390x844 layout with no document-level horizontal overflow, a registered/controlling PWA after refresh, no browser console errors, no service-role credentials in browser requests, and a freshly rendered one-page A4 PDF.

## Hosted Supabase and Vercel

The Vercel Marketplace resource `supabase-chart-builder` is connected to the `chartcreation-for-students` project for Production, Preview, and Development. Vercel now supplies the managed Supabase variables plus the browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` aliases required by this Vite application.

Remote project `frejicmqhsenqmdmqmfe` has both committed migrations applied. Live schema inspection confirms `public.people`, the `updated_at` trigger, RLS enabled, four authenticated owner policies, no `anon` table grant, authenticated CRUD-only table privileges, and no trigger-function execution for `anon` or `authenticated`. Remote `public` schema type generation matches the committed `lib/supabase/database.types.ts`.

The Supabase CLI account can list the Vercel-managed project but cannot use the project-management endpoint required by `supabase link`. Database migration and verification therefore use the Vercel-provided non-pooling Postgres connection; no RLS or authentication bypass was introduced.

## Immutable Experience Contracts

- `lib/numerology.ts` and recovered formula provenance remain unchanged.
- Screen, comparison, and print continue to construct the same `Report` values.
- `PassPrintReport` and `app/globals.css` print rules retain the one-page A4 contract.
- Existing colors, typography, layouts, breakpoints, animations, assets, mobile/desktop navigation, and chart styling remain locked.
- The PWA shell can load offline; authentication and cloud records require connectivity.

## Known Risks and Follow-up

- Hosted email confirmation and allowed redirect/site URLs must be verified in Supabase Auth settings.
- The remote policy definitions and grants are verified directly, while full hosted two-account CRUD isolation still needs an end-to-end run against the redeployed Vercel preview.
- Keep the authenticated phone/PWA/PDF proof in the release gate and rerun it against the hosted deployment.
- Git commands must run inside this repository root; the parent workspace contains unrelated projects.

## Read Next By Task

- Formula or values: `docs/FORMULA_GUARDRAILS.md`
- File ownership and data flow: `docs/ARCHITECTURE.md`
- Print/PDF: `docs/PRINT_CONTRACT.md`
- General feature: `.agents/skills/aionis-feature-orchestrator/SKILL.md`

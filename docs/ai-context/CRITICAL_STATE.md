# Critical State

Updated: 2026-08-04

This bounded file contains facts that cannot safely be approximated. Refresh it immediately before compaction or context editing; remove completed task detail instead of appending a log.

## Protected facts

- Approved formula source: `lib/numerology.ts`.
- Approved formula SHA-256: `F7A0965F01AA4410BB38CEF05FF832F51A5EAFF6CC2E8E10238DB79EF7E5644A`.
- DOB input is `DD/MM/YYYY`; database conversion belongs only in `features/people/people.mapper.ts`.
- Screen, comparison, and one-page A4 print consume the same `Report` calculations.
- Legacy key `pass7-mobile-clients-v1` is never uploaded without explicit consent.
- Browser code may use only the Supabase URL and publishable key; secret/service-role credentials are forbidden.
- The private owner console remains outside this repository and student UI.

## Current checkpoint

- Prompt 2 audit is merged on `main` at `50fcda1bdff39989a184dc90994a8f0e5a1de045`.
- Prompt 3 authorization is limited to `FPR-03-contracts-validators`, target `SHARED_CONTRACT`; the implementation branch begins from that exact main commit.
- Hosted Supabase project: `frejicmqhsenqmdmqmfe`.
- Applied migrations: `20260731204509_create_people.sql`, `20260801000026_tighten_people_grants.sql`.
- Last verified hosted state and remaining release risks: `docs/CURRENT_STATE.md`.

## Bounded workflow task

- Goal: reconcile CR-01 through CR-07, add approval/memory/analytics contracts, a versioned manifest and capability inventory, deterministic validation/fixtures, and CI enforcement.
- Allowed changes: operating-system docs/schemas/fixtures/manifests, the operating-system skill validator, the named stale documentation files, `.github/workflows/verify.yml`, and `package.json` only for the validator command.
- Forbidden changes: application code, calculations, UI/CSS, authentication, database/RLS behavior, migrations, assets, PWA/print behavior, deployment configuration, production data, runtime services, orchestrator state, persistence, and later phases.
- Acceptance: all schemas meta-validate; valid/invalid and semantic fixtures behave for the intended reason; manifests, inventory, skills, links, scope, privacy, workflow telemetry, application regressions, and GitHub checks pass; the complete diff contains only authorized paths.

## Resume evidence

- Reproduction: run `npm run validate:aionis`, `npm run lint`, `npm test`, and the full dependency audit without automatic fixes.
- Relevant files: `docs/aionis-operating-system/`, `.agents/skills/aionis-operating-system/`, `.github/workflows/verify.yml`, `package.json`, and the four named stale-document corrections.
- Verification: local contract validation covers 12 schemas, all golden/semantic fixtures, manifest/inventory, references, skills, links, protected scope, privacy, audit status, and stale statements; validator self-tests, telemetry privacy tests, lint, 4 formula tests, 21 unit tests, production PWA build, and 8 rendered/PWA/print/Vercel assertions pass. GitHub check and merge evidence remain to be recorded outside this bounded checkpoint.
- Unresolved platform issue: future Supabase default privileges remain a separately scoped blocker; create no new `public` object.
- Working tree: refresh with exact `git status --short --branch` output immediately before compaction.

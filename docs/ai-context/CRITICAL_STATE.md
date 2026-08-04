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
- The future-default-privilege security prerequisite is released in hosted production and awaiting PR #8 consolidation. Create no persistent application `public` object; only rollback-contained verification objects were authorized in this task.

## Current governed task

- Starting `main`: `7b40f3987b55141aee27aa81761cc3ea55385622`, the merge commit for PR #7.
- Branch: `security/supabase-future-default-privileges`; target: `PRIVATE_AIONIS_BACKEND` privilege hardening only.
- Human authorization: Plan, Security, and Release Gates are explicit for the digest-bound `FPR-SEC-default-privileges` release. Code Gate requires the final PR diff and required checks before merge.
- Goal: make future `postgres`-owned `public` tables, sequences, and functions deny-by-default for Data API roles while preserving every existing object and application behavior.
- Allowed paths: one exact migration; future-object pgTAP; minimal local verifier coverage; bounded feature/security/release/rollback/state/manifest docs; workflow telemetry outside Git.
- Prohibited: `supabase_admin` alteration; new persistent application objects; existing grants/RLS/policies/triggers; generated types; product/formula/UI/CSS/auth/print/PWA/Vercel/environment/dependency changes; private evidence, entitlements, timelines, runtime AI, analytics, Dreaming, or global learning.

## Current implementation checkpoint

- Preflight: PR #7 is merged; local `main` equals `origin/main`; the starting tree was clean; no open PR or existing target branch overlapped this work.
- Implementation commit: `25bc261d9a0a108174bf7e545b3da0e75615cd04`; migration SQL SHA-256: `5dfbcc97fc5a60709fc99d4b75ba9004f2ea2be271955df95ade3a271f48f358`.
- Migration: `supabase/migrations/20260804191700_harden_postgres_default_privileges.sql`; exact four approved statements only.
- Test: `supabase/tests/database/future_default_privileges.test.sql`; 10 false effective-privilege assertions in a rolled-back transaction.
- Local proof: isolated reset and all three migrations pass; public schema lint has zero findings; 10 future-object plus 8 existing people pgTAP cases pass; generated types match; cleanup succeeds.
- Full proof: 5 shared-validator tests, 12 shared schemas/manifest checks, 49 evidence-lineage tests, 32 orchestrator tests, 4 telemetry tests, workflow scope check, lint, 4 formula tests, 21 unit tests, production build, and 8 rendered checks pass. Production audit is clean; full audit has the pre-existing one moderate PostCSS development advisory.
- Hosted release: the repository owner manually applied the exact digest-bound SQL in the SQL Editor as `postgres`. Independent read-only verification returned all 10 future-object checks false.
- Migration history: preflight showed version `20260804191700` absent; reconciliation inserted only its ledger row. Final readback shows one row, the correct migration name, and four statements. The migration body was not reapplied.
- Hosted regression: all eight people/RLS cases returned `ok`; production people count remained 4; fixed test users, probe relations, and probe functions all returned 0 after rollback. Existing ownership, RLS, four policies, trigger, grants, and function execution boundaries remain correct.
- Advisors after rerun: Performance 0 errors/0 warnings; Security 0 database errors and one unrelated pre-existing Auth leaked-password-protection warning. `supabase_admin` is unchanged.
- PR: `https://github.com/olsonan24/Chartcreation-for-students/pull/8`; mark ready and squash-merge only after the final evidence commit and every required check are green.

## Remaining consolidation work

- Validate the final evidence diff, push it, wait for required GitHub/Vercel checks, post the gate comment, mark PR #8 ready, squash-merge, update local `main`, and delete the release branch.
- Do not begin private evidence/memory, entitlements, timeline tables, or any other capability here.

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
- The current authorized task is the future-default-privilege security prerequisite. Create no persistent application `public` object; only rollback-only probes may create temporary objects.

## Current governed task

- Starting `main`: `7b40f3987b55141aee27aa81761cc3ea55385622`, the merge commit for PR #7.
- Branch: `security/supabase-future-default-privileges`; target: `PRIVATE_AIONIS_BACKEND` privilege hardening only.
- Human authorization: Plan Gate is explicit for `FPR-SEC-default-privileges`. Security approves the bounded implementation with conditions. Code and production Release Gates require the final PR/digest evidence; hosted application and merge are not automatic.
- Goal: make future `postgres`-owned `public` tables, sequences, and functions deny-by-default for Data API roles while preserving every existing object and application behavior.
- Allowed paths: one exact migration; future-object pgTAP; minimal local verifier coverage; bounded feature/security/release/rollback/state/manifest docs; workflow telemetry outside Git.
- Prohibited: `supabase_admin` alteration; new persistent application objects; existing grants/RLS/policies/triggers; generated types; product/formula/UI/CSS/auth/print/PWA/Vercel/environment/dependency changes; private evidence, entitlements, timelines, runtime AI, analytics, Dreaming, global learning; automatic hosted mutation or merge.

## Current implementation checkpoint

- Preflight: PR #7 is merged; local `main` equals `origin/main`; the starting tree was clean; no open PR or existing target branch overlapped this work.
- Implementation commit: `25bc261d9a0a108174bf7e545b3da0e75615cd04`; migration SQL SHA-256: `5dfbcc97fc5a60709fc99d4b75ba9004f2ea2be271955df95ade3a271f48f358`.
- Migration: `supabase/migrations/20260804191700_harden_postgres_default_privileges.sql`; exact four approved statements only.
- Test: `supabase/tests/database/future_default_privileges.test.sql`; 10 false effective-privilege assertions in a rolled-back transaction.
- Local proof: isolated reset and all three migrations pass; public schema lint has zero findings; 10 future-object plus 8 existing people pgTAP cases pass; generated types match; cleanup succeeds.
- Full proof: 5 shared-validator tests, 12 shared schemas/manifest checks, 49 evidence-lineage tests, 32 orchestrator tests, 4 telemetry tests, workflow scope check, lint, 4 formula tests, 21 unit tests, production build, and 8 rendered checks pass. Production audit is clean; full audit has the pre-existing one moderate PostCSS development advisory.
- Hosted evidence supplied by the user and read back in the SQL Editor: role `postgres`; rollback-only probe returned false for all 10 table/sequence/function checks.
- Hosted mutation status: not applied. `supabase_admin` is unchanged. Existing `public.people` and `public.set_people_updated_at` are untouched.
- Draft PR: `https://github.com/olsonan24/Chartcreation-for-students/pull/8`; exact remote file list matches scope; application/governance, isolated database, and Vercel checks are green.

## Remaining proof and release work

- Stop before hosted mutation and merge. Hand off the exact one-time SQL, read-only/default inspection query, rollback SQL labeled not to run, digest, proof, and PR link for explicit Release Gate review.
- Do not begin private evidence/memory, entitlements, timeline tables, or any other capability here.

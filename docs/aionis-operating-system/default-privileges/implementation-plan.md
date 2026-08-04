# Implementation Plan: FPR-SEC-default-privileges

- Specification version / branch / target: `1.0.0`; `security/supabase-future-default-privileges`; `PRIVATE_AIONIS_BACKEND`.
- Protected behavior and prohibited paths: preserve existing `people` grants/RLS/policies/trigger, generated types, product code, formulas, UI, auth, print, PWA, Vercel, dependencies, and hosted settings. Create no persistent application object.
- Smallest sufficient deliverable: one four-statement migration, one rollback-only future-object pgTAP file, the existing people suite, local verifier coverage, and gate evidence.
- Work items, owners, allowed paths, inputs, outputs, and dependencies: primary agent owns the integrated migration, tests, verification, and documentation. Inputs are the Prompt 2 audit and the user-attested hosted probe. Outputs are the migration artifact, test evidence, reviews, and handoff SQL.
- Parallel ownership and integration contract: no delegation; the change is one tightly coupled database-security workstream.
- Sequence and artifact handoffs: inspect defaults and creator role; add migration/test; reset and verify locally; bind the SQL digest and implementation commit; run full CI; open a draft PR; stop before hosted application and merge.
- Test, security, intelligence, analytics, formula, UI, print, and release checks: database reset/lint, 10 future-object assertions, 8 people assertions, type parity, `validate:aionis`, workflow checks, lint, tests/build/rendered checks, dependency audits, Security review, and Release review. Other impact lanes are unchanged/not applicable.
- Preview/staging strategy: database behavior is verified in the isolated local stack and by the existing hosted rollback-only SQL Editor probe. There is no persistent staging mutation for this four-statement privilege change.
- Failure handling and rollback: stop on any non-false future-object result, current-people regression, advisor finding, type drift, scope drift, or creator-role mismatch. Use explicit grants as the preferred forward fix; use the default-restoring rollback only under a separately approved incident decision.
- Open decisions and gate blockers: Code Gate requires exact PR-diff and CI review. Release Gate requires an explicit production-application decision against the bound SQL digest. Hosted application and merge are outside this implementation step.
- Plan Gate evidence and decision: the repository owner's 2026-08-04 instruction authorizes this exact feature, SQL, and branch.

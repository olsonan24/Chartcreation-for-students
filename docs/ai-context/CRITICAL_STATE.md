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
- The blocked future-default-privilege issue is separate; create no new `public` object and do not attempt the platform mutation here.

## Current governed task

- Starting `main`: `0a801a543899c16efce8a5cd7dd36bf2242b8aa3`, the merge commit for PR #5.
- Branch: `dev/aionis-orchestrator-and-lifecycle-state`; target: `DEV_TOOLING`.
- Human authorization: Plan Gate is explicit; Code Gate and automatic merge are conditional on the complete acceptance/verification/diff conditions in the attached implementation brief.
- Goal: deterministic local feature workspaces, canonical lifecycle transitions, assignments and file ownership, hard/soft dependencies, consumer-owned handoffs, current-version approvals/gates, integration readiness, and append-only failure/rollback history.
- Allowed paths: purpose-built orchestrator tooling/tests/schema/synthetic fixtures and bounded operating-system docs, manifest/inventory, `docs/CURRENT_STATE.md`, this file, `package.json`, and `.github/workflows/verify.yml`.
- Prohibited: application/formula/UI/CSS/auth/database/migration/generated-type/print/PWA/Vercel/environment/hosted/production changes; runtime AI, evidence backend, Dreaming, analytics, global learning, and dependency upgrades.

## Current implementation checkpoint

- CLI: `.agents/skills/aionis-operating-system/scripts/orchestrator/cli.mjs`.
- Core/state rules: `.agents/skills/aionis-operating-system/scripts/orchestrator/core.mjs`.
- Development workspace schema: `.agents/skills/aionis-operating-system/scripts/orchestrator/workspace.schema.json`.
- Synthetic workspaces: `docs/aionis-operating-system/orchestrator/features/`.
- Documentation: `docs/aionis-operating-system/orchestrator/README.md`.
- Local proof so far: 31 orchestrator tests and all 3 tracked workspaces pass; `npm run validate:aionis` passes 12 shared schemas plus orchestrator validation; the 4 telemetry privacy tests pass.
- The standalone token-workflow scope check sees the explicitly authorized `package.json` and CI edits as out of its older working-tree allow-list. It will be rerun from the committed clean branch/CI, where the guard validates repository state without weakening its scope.

## Remaining proof and release work

- Run lint, full application tests/build, local database CI, secret/private-data scans, scope/catastrophic-diff guards, dependency audits, and the complete GitHub lifecycle.
- Before commit, confirm no product, formula, database, auth, UI, CSS, print, PWA, Vercel, environment, hosted-service, generated, or private-data file changed.
- After PR checks and exact GitHub diff review, record the conditional Code Gate comment, merge only if every condition is green, then synchronize and clean local `main`.
- Exact next proposed phase after this task: `FPR-05-evidence-lineage` on a separately authorized branch; do not begin it here.

# Recommended Aionis PR Sequence

This sequence is a recommendation from the Prompt 2 audit. It is not authorization to implement Prompt 3 or any later capability. Every PR targets `main`, begins from current `main`, receives its own feature specification, and stops at its required human gate.

The sequence resolves the normalized `proposed_pr_name` values in `requirement-matrix.json`; it does not convert a `NOT_CURRENTLY_APPLICABLE` future requirement into authorization.

## 1. `FPR-03-contracts-validators` — `contracts/aionis-shared-contracts-and-validators`

Target: `SHARED_CONTRACT`
Roadmap alignment: Phase 3

Resolve the foundation before building against it:

- reconcile all seven active document/schema conflicts;
- add a versioned operating-system manifest and capability/owner inventory;
- add approval and complete memory-record contracts;
- decide event-versus-contract governance ownership;
- correct stale `CURRENT_STATE`, `CRITICAL_STATE`, formula paths, print paths, and PWA-cache wording;
- commit deterministic schema, schema-instance, skill, path/link, manifest, and product-scope validators;
- run those validators in GitHub Actions;
- add database lint/pgTAP/type-drift CI or explicitly split that work into a immediately following security PR.

Required gates: Plan and Code.
Stop condition: do not start orchestrator or backend implementations until the shared contracts have valid/invalid golden fixtures and CI enforcement.

## Independent security lane: `FPR-SEC-build-dependency` — `security/aionis-build-dependency-maintenance`

Target: `DEV_TOOLING`

Review and update the Vite/PostCSS dependency chain so the full development audit no longer reports the current moderate PostCSS advisory. Add a deliberate dependency-audit policy/check; do not use an unreviewed automatic `npm audit fix`. Prove production dependencies remain clean and lint, tests, build, PWA, and rendered artifacts do not regress.

Required gates: Security and Code.
Sequencing: may run alongside the shared-contract PR because paths and ownership do not overlap; must land before the final release pipeline.

## 2. `FPR-SEC-default-privileges` — `security/supabase-future-default-privileges`

Target: `PRIVATE_AIONIS_BACKEND`
Roadmap alignment: prerequisite hardening lane

Resolve the previously documented future-object issue in a separate PR:

- obtain authority capable of controlling defaults for both `postgres` and `supabase_admin`;
- define safe future table, sequence, and function defaults, including built-in `PUBLIC EXECUTE` behavior;
- dry-run and inspect before applying;
- prove new objects are deny-by-default while current `people` behavior remains unchanged;
- retain a tested rollback/forward-fix plan.

Required gates: Plan, Security, Code, and Release for the platform mutation.
Blocker: no safe implementation exists with the currently documented migration authority.
Stop condition: add no new `public` object before this lands or a Security Gate accepts an explicit bounded exception.

## 3. `FPR-04-orchestrator-lifecycle` — `dev/aionis-orchestrator-and-lifecycle-state`

Target: `DEV_TOOLING`
Roadmap alignment: Phase 4

Implement assignment contracts, feature state transitions, file ownership, collision detection, integration contracts, producer/consumer handoffs, evidence requirements, approval invalidation, and gate blocking. Keep privileged booleans explicit and false unless separately authorized.

Required gates: Plan and Code.

## 4. `FPR-05-evidence-lineage` — `backend/aionis-evidence-lineage`

Target: `PRIVATE_AIONIS_BACKEND`
Roadmap alignment: Phase 5

Implement append-only evidence records, content digests, provenance/access scope, generation manifests, component/version registry, supersession, reproducibility records, stochastic acceptance rules, and rollback history. Do not add personal-profile synthesis.

Required gates: Plan, Security, Intelligence, and Code.

## 5. `FPR-06-private-evidence-memory` — `backend/aionis-private-evidence-and-memory`

Target: `PRIVATE_AIONIS_BACKEND`
Roadmap alignment: Phase 6

Implement private identity and tenant isolation, personal evidence ingestion, knowledge planes/forms, consent, retention/deletion, staleness, confidence decay, access/audit records, and cross-user leakage defenses. This PR depends on future default-privilege hardening before it creates public-schema objects.

Required gates: Plan, Security, Intelligence, and Code.

## 6. `FPR-07-runtime-intelligence-feedback` — `backend/aionis-runtime-intelligence-and-feedback`

Target: `PRIVATE_AIONIS_BACKEND`
Roadmap alignment: Phase 7

Implement governed model routing, exact manifests, timeout/retry/token/cost budgets, tenant/workload capacity, idempotency, dead letters, cancellation, conditional synthesis, supporting/contradictory explanations, Inquiry, and feedback-as-new-evidence. Do not add global learning.

Required gates: Plan, Security, Intelligence, and Code.

## 7. `FPR-08-analytics-observability` — `backend/aionis-analytics-and-observability`

Target: `PRIVATE_AIONIS_BACKEND`
Roadmap alignment: Phase 8

Implement separate operational and product/intelligence analytics contracts, event ingestion, consent/lawful basis, tenant isolation, prohibited-field enforcement, sampling, aggregation, retention/deletion, alerts, missingness, calibration, and version comparisons. Keep names, DOBs, prompts, free text, evidence content, credentials, and cross-user identifiers out of development telemetry.

Required gates: Analytics, Security, Intelligence, and Code.

## 8. `FPR-09-development-dreaming` — `dev/aionis-development-dreaming`

Target: `DEV_TOOLING`
Roadmap alignment: Phase 9

Implement approved sanitized development-event ingestion, immutable cursor/snapshot state, empty-run skipping, idempotent reconciliation, duplicate/contradiction/stale-doc/resolved-TODO/recurring-failure detection, exact proposals, cost records, negative knowledge, and the narrowly pre-approved maintenance lane.

Required gates: Dream and Code.

## 9. `FPR-10-human-pattern-dreaming` — `backend/aionis-human-pattern-dreaming`

Target: `PRIVATE_AIONIS_BACKEND`
Roadmap alignment: Phase 10

Implement the Pattern Ledger, Human Pattern proposal flow, user/org isolation, source classification, supporting and contradictory evidence, conditional language, Inquiry, sensitivity, confidence/decay, approval, versioned profile updates, supersession, explanation, and rollback.

Required gates: Dream, Intelligence, Security, and Code.

## 10. `FPR-11-global-learning` — `backend/aionis-global-intelligence-learning`

Target: `PRIVATE_AIONIS_BACKEND`
Roadmap alignment: Phase 11

Implement the approved aggregation eligibility contract, consent and de-identification, cohort thresholds, suppression/rejection of small or linkable groups, leakage/bias/calibration/subgroup evaluation, methodology proposals, governed intelligence versions, release evidence, and rollback. Private evidence never becomes eligible merely by removing direct identifiers.

Required gates: Dream, Intelligence, Security, and Release.

## 11. `FPR-12-release-pipeline` — `dev/aionis-staged-release-and-observation`

Target: `DEV_TOOLING`
Roadmap alignment: Phase 12

Add main branch protection/rulesets, required CI/security/intelligence checks, a true staging environment, immutable release manifests and artifact digests, configuration proof, migration records, rollout/stop conditions, rollback rehearsal, explicit production approval, post-release observation, and sanitized consolidation.

Required gate: Release plus every impact gate from included capabilities.

## Sequencing rules

- Use one target per PR. Cross-target interfaces land first in a `SHARED_CONTRACT` PR.
- Do not stack these PRs unless a future prompt explicitly authorizes stacking; default each PR to current `main`.
- A schema PR does not authorize a service, database, analytics event, model call, or production mutation.
- A passing CI run is evidence, not human approval.
- Formula, constitutional, security, personal-profile, and production changes never enter the mechanically safe auto-maintenance exception.
- Preserve existing student-app formula, auth/RLS, legacy import, owner-console separation, PWA, and one-page print contracts throughout.

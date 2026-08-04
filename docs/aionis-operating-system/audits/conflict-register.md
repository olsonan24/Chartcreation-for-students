# Aionis Operating-System Conflict Register

Baseline: `9041d142f87ab48a8706a333cfebd70d702783fb`

This register distinguishes true contract conflicts and stale artifacts from intentional future capability gaps. A future capability is not labeled contradictory merely because it has not been built.

## Resolved contradictions

Prompt 3 resolves the complete active set. The deterministic validator requires every row below to remain explicitly `RESOLVED` and verifies the cited contracts and fixtures.

| ID | Status | Resolution | Verification evidence | Owner target |
| --- | --- | --- | --- | --- |
| `CR-01` | RESOLVED | The closed agent contract now requires feature/artifact identity, owner, dependencies, gate, handoff, approval references, paths, inputs/outputs, checks, and explicit privileged booleans. | `schemas/agent-contract.schema.json`; `fixtures/valid-contracts.json`; `agent-missing-feature` | `SHARED_CONTRACT` |
| `CR-02` | RESOLVED | The feature contract represents every documented lifecycle state, rollback identity, failed-gate history, prior state, reason, and approval invalidation. | `schemas/feature-specification.schema.json`; observing/rolled-back fixtures; legal/illegal transition tests | `SHARED_CONTRACT` |
| `CR-03` | RESOLVED | Every feature declares either governing analytics contract IDs or an explicit non-applicability reason. | `schemas/feature-specification.schema.json`; `feature-missing-analytics` | `SHARED_CONTRACT` |
| `CR-04` | RESOLVED | Dream proposals now carry requested gate/status, rollback target, evidence and contradictions, sensitivity, confidence, exact change, reversibility, and rejection/supersession history. | `schemas/dream-proposal.schema.json`; `dream-valid`; `dream-missing-required-gate` | `SHARED_CONTRACT` |
| `CR-05` | RESOLVED | Generation manifests now require provider/model/configuration, versions, evidence, timeout/retries, input/output and cost budgets, fallback disclosure, environment/release, confidence, and acceptance policy. | `schemas/generation-manifest.schema.json`; generation fixtures | `SHARED_CONTRACT` |
| `CR-06` | RESOLVED | Routing documentation distinguishes prompt caching from the Workbox/PWA cache without claiming a configured cache ID. | `12-model-routing-cost-and-capacity.md`; stale-identifier validator | `DEV_TOOLING` |
| `CR-07` | RESOLVED | Governance lives in a versioned analytics contract; events carry only the envelope, approved payload, and mandatory contract/version/purpose linkage. | `schemas/analytics-contract.schema.json`; `schemas/analytics-event.schema.json`; analytics linkage fixtures | `SHARED_CONTRACT` |

## Outdated artifacts

| ID | Severity | Artifact | Exact evidence | Required correction | Future PR |
| --- | --- | --- | --- | --- | --- |
| `OR-01` | High | `docs/CURRENT_STATE.md` | Lines 13-14 still identify the stacked Prompt 1 branch and `2250222` main baseline. Lines 106 and 109 say PR #1 still needs review and Prompt 2 is not authorized. Git shows PR #1 merged at `662ccb1`, PR #2 merged at `9041d14`, and this prompt authorizes Prompt 2. | Reconcile current branch/baseline, merged reviews, audit result, next authorized action, and remaining risks. | `FPR-03-contracts-validators` |
| `OR-02` | Medium | `docs/ai-context/CRITICAL_STATE.md` | It still says the active task is Prompt 1, permits only foundation files, forbids Prompt 2, expects a draft stacked PR, and reports no Prompt 1 defect. | Replace the completed Prompt 1 task checkpoint with the next active bounded checkpoint after this audit is approved. | `FPR-03-contracts-validators` |
| `OR-03` | Medium | `docs/FORMULA_GUARDRAILS.md` | It refers to `Pass7-Mobile/lib/numerology.ts` and sibling `Pass7-Recreated/...`; in this repository the correct paths are `lib/numerology.ts` and `reference/Pass7-Recreated/...`. | Correct path locators without changing formula content. | `FPR-03-contracts-validators` |
| `OR-04` | Medium | `docs/PRINT_CONTRACT.md` | It refers to `Pass7-Mobile/app/page.tsx`, `Pass7-Mobile/app/globals.css`, and an ignored local PDF path that is not a tracked immutable evidence record. | Correct paths and replace the ephemeral locator with a digest/evidence ID policy. | `FPR-03-contracts-validators` |

## Governance and enforcement gaps

These are missing controls, not conflicting requirements:

| ID | Risk | Evidence | Future PR |
| --- | --- | --- | --- |
| `GE-01` | Required gates are bypassable. | GitHub reports `main` is unprotected and the repository has no rulesets. PR #1/#2 followed checks and review voluntarily. | `FPR-12-release-pipeline` |
| `GE-02` | Approvals are not reusable governed artifacts. | No approval schema or gate ledger exists. PR reviews are `COMMENTED` records with useful prose, not structured approval objects. | `FPR-03-contracts-validators`, then `FPR-04-orchestrator-lifecycle` |
| `GE-03` | Prompt 1 validation is not durable. | `CURRENT_STATE.md` reports one-time schema/skill/path validation; CI runs only `npm ci`, lint, and `npm test`. | `FPR-03-contracts-validators` |
| `GE-04` | Database isolation tests can regress outside CI. | `test:db` exists in `package.json`, but `.github/workflows/verify.yml` does not start Supabase or run pgTAP/type drift. | `FPR-03-contracts-validators` |
| `GE-05` | The development/build dependency graph has a known moderate issue and no automated dependency gate. | Fresh full `npm audit` reports `postcss@8.5.20` through `vite@8.1.5`; production-only audit is clean. | `FPR-SEC-build-dependency` |

## Known blocker

`BLK-01` — Future Supabase `public` objects do not default to least privilege.

- `docs/CURRENT_STATE.md:103-104` records broad default privileges for both creator roles, `postgres` and `supabase_admin`.
- The available migration connection can change `postgres` defaults but not `supabase_admin` defaults.
- Removing built-in `PUBLIC EXECUTE` for future functions needs a global role-level change, not only a `public`-schema change.
- Current `public.people` and `public.set_people_updated_at` are explicitly hardened, so existing rows are not exposed by this future-object issue.
- Resolution belongs in the separate `FPR-SEC-default-privileges` PR after platform-owner authority and a reviewed dry-run/rollback plan exist. No new `public` object should precede it.

## Explicit non-conflicts

- Private backend, runtime AI, analytics, Dream loops, global learning, orchestrator state, and release-manifest plumbing are documented future phases. Requirements intentionally reserved for separately authorized phases are `NOT_CURRENTLY_APPLICABLE`; requirements with meaningful merged contract pieces are `PARTIALLY_IMPLEMENTED`. Neither is contradictory merely because runtime behavior is absent.
- The Level 3 gateway is explicitly a design specification. Level 2 workflow implementation does not claim Level 3 enforcement.
- Prompt caching is not implemented, and no provider-specific cache was required by Prompt 1.
- The owner console is external by design; its absence from this public repository is correct.
- Prompt 1 did not change product files. The commit and PR file list support that scope claim.

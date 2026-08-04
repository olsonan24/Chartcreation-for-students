# Aionis Operating-System Conflict Register

Baseline: `9041d142f87ab48a8706a333cfebd70d702783fb`

This register distinguishes true contract conflicts and stale artifacts from intentional future capability gaps. A future capability is not labeled contradictory merely because it has not been built.

## Active contradictions

| ID | Severity | Conflict | Exact evidence | Consequence | Owner target | Future PR |
| --- | --- | --- | --- | --- | --- | --- |
| `CR-01` | High | The agent-assignment document requires fields the closed agent schema forbids. | `03-agent-team-and-orchestration.md` requires feature ID, artifact version, owner, dependencies, current gate, and handoff recipient. `schemas/agent-contract.schema.json` lacks all six and sets `additionalProperties: false`. | A compliant assignment cannot validate; orchestration built on the schema would lose required handoff and dependency state. | `SHARED_CONTRACT` | `FPR-03-contracts-validators` |
| `CR-02` | High | The lifecycle state model and feature schema have incompatible enums/history. | `04-feature-lifecycle.md` includes `OBSERVING` and `ROLLED_BACK`. `schemas/feature-specification.schema.json` omits both, adds `rejected`, and has no failed-gate reason/prior-state field. | The documented lifecycle and emergency rollback cannot be represented or validated. | `SHARED_CONTRACT` | `FPR-03-contracts-validators` |
| `CR-03` | Medium | Analytics are mandatory in the feature/Plan artifacts but forbidden by the closed feature schema. | `04-feature-lifecycle.md` and `05-human-approval-gates.md` require analytics/proposed analytics. `templates/feature-specification.md` includes analytics requirements. `schemas/feature-specification.schema.json` has no analytics field and disallows additional properties. | A Markdown feature spec can comply while its machine-readable equivalent cannot. | `SHARED_CONTRACT` | `FPR-03-contracts-validators` |
| `CR-04` | High | Human Pattern proposals require requested approval and rollback target, but the Dream schema cannot record them. | `09-human-pattern-dreaming.md` requires both. `schemas/dream-proposal.schema.json` has `approvalId` only after a decision, no requested-approval field, no rollback target, and `additionalProperties: false`. | A sensitive proposal cannot carry its required gate request or restoration identity. | `SHARED_CONTRACT` | `FPR-03-contracts-validators` |
| `CR-05` | Medium | The runtime-generation contract requires timeout, retry ceiling, and token/cost budget, but the closed generation schema omits them. | `12-model-routing-cost-and-capacity.md` requires these values. `schemas/generation-manifest.schema.json` cannot represent them and disallows additional properties. | A manifest could validate while failing the routing/capacity contract. | `SHARED_CONTRACT` | `FPR-03-contracts-validators` |
| `CR-06` | Low | The operating-system document names a PWA cache that is absent from current configuration. | `12-model-routing-cost-and-capacity.md:17` names `aionis-timeline-v3`. `vite.config.ts` sets no `cacheId`; repository and generated-artifact search finds no such string. | The caching distinction is conceptually correct but cites a nonexistent/stale implementation identity. | `DEV_TOOLING` | `FPR-03-contracts-validators` |
| `CR-07` | High | The analytics contract requires governance fields the closed event schema cannot represent. | `13-analytics-and-observability.md` requires owner, consent/lawful basis, sampling, access, deletion, aggregation, alerts, and version. `schemas/analytics-event.schema.json` lacks most of them; `contractId` is optional; additional properties are forbidden. | Event validation would not prove contract compliance or traceability. | `SHARED_CONTRACT` | `FPR-03-contracts-validators` |

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

- Private backend, runtime AI, analytics, Dream loops, global learning, orchestrator state, and release-manifest plumbing are documented future phases. Their absence is reported as `DOCUMENTED_ONLY`, not contradictory.
- The Level 3 gateway is explicitly a design specification. Level 2 workflow implementation does not claim Level 3 enforcement.
- Prompt caching is not implemented, and no provider-specific cache was required by Prompt 1.
- The owner console is external by design; its absence from this public repository is correct.
- Prompt 1 did not change product files. The commit and PR file list support that scope claim.

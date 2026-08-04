# Feature Lifecycle

## Software-development loop

Plan → design → build → test → secure → stage → approve → release → observe → improve.

## Required artifacts

1. Create a feature specification with target, scope, exclusions, ownership, risks, analytics, and gates.
2. Approve an implementation plan before behavioral work.
3. Use a focused branch and explicit file ownership.
4. Produce code, test, security, intelligence, and release evidence proportional to risk.
5. Verify in preview and staging before human production approval.
6. Observe agreed operational and product/intelligence signals after release.
7. Feed sanitized development lessons into the development-memory loop, not into personal memory.

Use `templates/feature-specification.md` and `templates/implementation-plan.md`. The release sequence is detailed in `14-release-and-environment-strategy.md`.

## State model

`DRAFT` → `PLAN_APPROVED` → `BUILDING` → `CODE_APPROVED` → `STAGED` → `RELEASE_APPROVED` → `RELEASED` → `OBSERVING` → `CLOSED`.

Any failed gate returns the feature to the named earlier state with reasons preserved as negative knowledge. Emergency rollback may move `RELEASED` to `ROLLED_BACK`; it does not erase the release record.

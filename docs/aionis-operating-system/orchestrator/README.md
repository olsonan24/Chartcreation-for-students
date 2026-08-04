# Aionis Development Orchestrator

Status: implemented repository-development tooling for `DEV_TOOLING`. Nothing in this directory runs in the student application, processes student profiles, calls a model, changes a database, or deploys production behavior.

## What it controls

The orchestrator keeps governed feature work in deterministic, machine-readable JSON. A workspace binds a stable feature ID and artifact version to the merged feature specification, implementation plan, agent assignments, file ownership, dependencies, handoffs, checks, gate state, approval records, and append-only history.

Tracked synthetic workspaces live in `docs/aionis-operating-system/orchestrator/features/`. They contain no names, birthdates, profile content, prompts, credentials, production data, or private student information. The purpose-built workspace schema lives beside the CLI at `.agents/skills/aionis-operating-system/scripts/orchestrator/workspace.schema.json`; feature, assignment, and approval objects are also validated against the merged shared contracts.

## Canonical lifecycle

The exact merged states are:

```text
DRAFT -> PLAN_APPROVED -> BUILDING -> CODE_APPROVED -> STAGED
      -> RELEASE_APPROVED -> RELEASED -> OBSERVING -> CLOSED
```

`RELEASED -> ROLLED_BACK` preserves the release and restore version. `REJECTED` is terminal. Documented failed-gate returns move to an earlier state with the gate, reason, evidence, actor, and time preserved. Illegal transitions are rejected and recorded by accepted CLI mutations; a failed gate never silently advances state.

Plan, Code, Release, and Dream gates require a merged-schema approval record matching the feature ID, current artifact version, and exact gate. The decision must be `APPROVED`, evidence references must exist, and the approval must be neither invalidated nor expired in workspace metadata. Tests, generated text, comments, silence, or a PR do not substitute for an approval record.

## Assignments and ownership

Assignments use the merged agent contract and include target, owner, inputs, outputs, dependencies, checks, current gate, handoff recipient, allowed/prohibited paths, and approval references. All four privileged booleans remain explicit. A true value is rejected unless a current scoped approval authorizes `privilege:<field>`.

Ownership comparison detects exact-file, parent/child, and glob/directory collisions. Non-overlapping paths are parallel safe. An intentional overlap requires an integration contract naming both participants, the overlap, merge order, integration owner, and verification owner.

Hard dependencies must exist, match the required artifact version, and be complete. Soft dependencies are reported without blocking. Hard cycles and missing dependency IDs fail validation. Parallel-safe features remain explicit in the plan and do not waive file ownership.

## Handoffs and artifact versions

A producer creates a pending handoff with the artifact identity/version, outputs, completed checks, risks, and open questions. Only the named consumer may accept or reject it. Rejection retains the reason. A material version change appends a version record and invalidates approvals and handoff acceptance for the superseded version without deleting history.

## Integration readiness

Readiness reports the current state, completed and blocked dependencies, cycles, ownership collisions, pending or stale handoffs, missing checks, missing/stale approvals, failed gates, unresolved risks, and exact blockers. It emits readable text by default and JSON with `--json`. Any blocker produces a nonzero exit code.

## Commands

```text
npm run aionis:orchestrator -- help
npm run aionis:orchestrator -- init docs/aionis-operating-system/orchestrator/features/synthetic-new.json --feature-id SYNTHETIC-new --title "Synthetic feature" --owner synthetic-owner --dry-run
npm run aionis:orchestrator -- validate docs/aionis-operating-system/orchestrator/features/synthetic-ready-feature.json
npm run aionis:orchestrator -- validate-all
npm run aionis:orchestrator -- collisions <workspace>
npm run aionis:orchestrator -- advance <workspace> --to BUILDING --actor synthetic-owner --reason "Approved synthetic build" --dry-run
npm run aionis:orchestrator -- fail-gate <workspace> --gate CODE_GATE --return-to BUILDING --actor synthetic-reviewer --reason "Synthetic check failed" --dry-run
npm run aionis:orchestrator -- assign <workspace> --payload <assignment-json> --dry-run
npm run aionis:orchestrator -- handoff-create <workspace> --payload <handoff-json> --actor <producer> --dry-run
npm run aionis:orchestrator -- handoff-decide <workspace> --handoff-id <id> --actor <consumer> --decision ACCEPTED --dry-run
npm run aionis:orchestrator -- gates <workspace>
npm run aionis:orchestrator -- readiness <workspace> --json
npm run validate:orchestrator
```

Mutation commands support `--dry-run`, refuse absolute and repository-escaping paths, validate privacy and contracts before acceptance, and replace accepted JSON atomically. Initialization refuses to overwrite an existing workspace. Invalid operations exit nonzero with actionable errors.

## History and rollback

Transitions, failed transitions, gate returns, handoff events, invalidated approvals, superseded versions, and rollbacks append to dedicated history arrays. Current state is updated only after validation; history is never silently replaced. This is version-controlled development state, not an evidence persistence backend or database.

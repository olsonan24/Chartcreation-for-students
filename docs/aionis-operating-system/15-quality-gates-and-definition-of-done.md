# Quality Gates and Definition of Done

A change is done only when its specification is met, required gates are approved, and evidence is attached to the exact version.

## Universal checks

- Scope, target, ownership, and exclusions match the approved plan.
- Existing authoritative contracts are linked and unchanged unless explicitly approved.
- Tests cover acceptance, failure, isolation, and rollback behavior proportional to risk.
- Security, privacy, intelligence, formula, analytics, accessibility, and environment impacts are classified.
- Schemas and links validate; docs contain no secrets or private user information.
- Generated conclusions have evidence lineage and generation manifests.
- Release and rollback artifacts identify immutable versions.
- Unresolved risks and known limitations are explicit.

Repository-specific application checks remain in `AGENTS.md`. Student UI changes require lint, tests, build, and phone/desktop visual verification; print changes require a real one-page PDF; formulas require the formula-auditor workflow. Those checks are not triggered by documentation-only Prompt 1 except as regression confidence.

Review the diff for unauthorized application, formula, UI, CSS, authentication, database, PWA, print, deployment, or private-data changes before approval.

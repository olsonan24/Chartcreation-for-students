---
name: aionis-operating-system
description: Orchestrate multi-target Aionis features, reviews, Dream proposals, and releases through explicit boundaries, ownership, artifacts, evidence, and human gates. Use for work spanning agents, targets, lifecycle stages, shared contracts, or operating-system governance.
---

# Aionis Operating System

1. Read `AGENTS.md`, `docs/CURRENT_STATE.md`, and `docs/aionis-operating-system/00-START-HERE.md`.
2. Invoke the existing `.agents/skills/aionis-ai-workflow/SKILL.md` practices for bounded context, tool profiles, accepted-answer reuse, and privacy-safe telemetry. Do not duplicate that workflow.
3. Assign exactly one target to each capability and record protected contracts.
4. Create or validate the feature specification, ownership, risks, required reviews, gates, and rollback artifact.
5. Sequence owners and handoffs. Permit parallel work only with non-overlapping paths or an explicit integration contract.
6. Block integration when evidence, ownership, required checks, or human approval is missing.
7. Finish with exact versions, gate status, unresolved risks, and the next authorized action.

For shared-contract work, run `npm run validate:aionis`. It meta-validates every Draft 2020-12 schema, executes golden and semantic fixtures, resolves manifest/capability/contract references, validates skills and links, protects product scope, scans synthetic instances for secrets/private data, and detects resolved-audit or stale-baseline drift. A passing validator is evidence; it never creates human approval.

For governed feature state, use `npm run aionis:orchestrator -- help`. Version-controlled synthetic workspaces live under `docs/aionis-operating-system/orchestrator/features/`; the CLI validates merged feature, agent, and approval contracts before making an atomic repository-local write. Dry-run is required when reviewing a proposed mutation before acceptance.

Load only the numbered document, template, or schema needed for the current stage. Never treat `docs/aionis-operating-system/16-complete-implementation-roadmap.md` as authorization to start a later phase.

# Agent Team and Orchestration

## Central orchestrator

The orchestrator owns shared feature state, artifact handoffs, task sequencing, parallel execution, file ownership, conflict detection, integration, gate completion, and release status. It does not waive approvals or expand an agent's permissions.

For each assignment it must record: feature ID, artifact version, target, owner, allowed paths, prohibited paths, inputs, outputs, dependencies, required checks, current gate, and handoff recipient.

The assignment also records approval references bound to the current artifact version. A reference to a stale, rejected, or invalidated approval cannot satisfy a gate.

Parallel agents must have non-overlapping ownership unless a written integration contract defines the shared interface, merge order, conflict owner, and verification responsibility.

## Machine-readable contract

Use `schemas/agent-contract.schema.json`. Every agent contract declares:

- agent ID and purpose;
- required inputs and outputs;
- allowed and prohibited paths and tools;
- required checks and human approval gate;
- whether it may deploy, modify formulas, modify constitutional methodology, or access private user information.

All privileged booleans default conceptually to false; omission is invalid. Formula or constitutional modification requires explicit human authorization in addition to a contract value of true.

## Handoff rule

A handoff is complete only when its artifact is versioned, the producer's checks are recorded, unresolved risks are named, and the consumer accepts ownership. The orchestrator blocks integration on overlapping writes, missing provenance, failed checks, or an unmet gate.

Use `.agents/skills/aionis-operating-system/SKILL.md` for routing and `.agents/skills/aionis-ai-workflow/SKILL.md` for bounded context handling.

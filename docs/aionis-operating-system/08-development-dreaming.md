# Development Dreaming

## Development-memory loop

Capture sanitized development events → reconcile sessions → detect stale, duplicate, or contradictory knowledge → create proposals → obtain approval → update future development guidance.

Development Dreaming runs outside active implementation work and reads only approved, sanitized development events. It must never ingest secrets, credentials, raw prompts containing sensitive data, private user profiles, names, dates of birth, or production profile data.

## Run contract

- Track an immutable last-processed cursor and input snapshot.
- Skip empty runs and report that no work was performed.
- Be idempotent for the same cursor range and rules version.
- Detect duplicates, contradictions, stale documentation, resolved TODOs, and recurring failures.
- Produce exact before-and-after proposals with source evidence and affected paths.
- Preserve rejected proposals as negative knowledge.
- Apply automatically only mechanically safe, reversible maintenance explicitly allowed by policy.
- Route meaningful changes through the Dream Gate.
- Record estimated model/token cost and prefer deterministic checks when sufficient.

Dreaming never modifies formulas, constitutional methodology, security policy, application behavior, or production state without the applicable human gates. Use `schemas/dream-proposal.schema.json` and `templates/dream-review.md`.

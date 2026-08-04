# Evidence Lineage and Versioning

Implementation: the repository-local backend-neutral Phase 5 foundation is documented in `evidence-lineage/README.md`. It provides in-memory and synthetic-fixture adapters only; no production persistence, public API, personal profile, or runtime model call exists.

## Core rules

- Evidence is identified, immutable, attributable, timestamped, and access-scoped.
- Conclusions cite evidence, rules, modifiers, methodology, engines, and knowledge snapshot.
- Generated conclusions never serve as evidence supporting themselves.
- Corrections create new versions and supersession links; they do not rewrite history.
- Reproduction records environment and exact component versions, including fallback use.
- Canonical integrity uses SHA-256 over deterministic `c14n-json-v1` structured content; the digest records both algorithm and canonicalization version.
- Supporting and contradictory evidence remain distinct relationships, and lineage validation rejects missing references, duplicate IDs, prohibited self-support, cycles, and cross-tenant links.

Use `schemas/evidence-record.schema.json` for evidence and `schemas/generation-manifest.schema.json` for significant generated conclusions. The generation manifest records finding ID, timestamp, provider, exact model ID/configuration, prompt and constitution versions, calculation and synthesis engine versions, knowledge snapshot, evidence/rule/modifier IDs, language tier, confidence, fallback-model use, environment, and release version.

Approval is a separate governed artifact defined by `schemas/approval-record.schema.json`. A passing check, silence, or generated statement cannot populate an approval record. Approval references are usable only when their artifact ID and current version match and the record has not been invalidated.

## Reproducibility target

Every significant generated conclusion must eventually be reproducible, auditable, versioned, reviewable, and reversible. “Reproducible” means the recorded inputs and versions can rerun the governed process; stochastic output may differ and must be compared under a documented acceptance rule.

## Version and rollback

Use immutable artifact IDs plus semantic or monotonic versions. A superseding record identifies its predecessor and reason. Rollback selects a known approved version, records the triggering evidence and approver, restores dependent versions consistently, and preserves both the failed and restored histories.

The executable foundation validates plans and synthetic history only. A future secure private storage adapter must implement authentication, authorization, tenant isolation, encryption, retention/deletion execution, audit logging, and transactions without moving or weakening these domain rules.

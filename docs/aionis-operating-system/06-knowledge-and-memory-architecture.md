# Knowledge and Memory Architecture

## Three knowledge planes

- **Constitutional knowledge:** approved methodology, protected calculations, ethics, governance, and non-negotiables. Formal versioning and human approval are mandatory.
- **Operational knowledge:** procedures, architecture, incidents, accepted answers, release evidence, and sanitized development lessons. It may become stale and is superseded through review.
- **Personal evidence and memory:** isolated user statements, calculations, feedback, inferences, hypotheses, and profile versions. It is private, consent-bound, and never development telemetry.

## Memory forms

- **Episodic:** timestamped events and interactions.
- **Semantic:** reconciled facts, patterns, and concepts.
- **Procedural:** approved repeatable workflows and skills.
- **Governance:** approvals, rejections, policies, exceptions, and supersession decisions.

Every record declares plane, memory form, target, owner/tenant boundary, provenance, status, confidence where applicable, created time, version, retention, and supersession link. Immutable evidence is never overwritten. Derived records point to evidence IDs and may be superseded or rolled back.

Use `schemas/memory-record.schema.json` for the general machine-readable contract. It also records observed time, staleness, negative knowledge, and consent or routing restrictions where applicable. This schema does not create persistence.

Staleness checks compare age, source availability, dependency versions, contradictions, and current constitutional version. Confidence decay is explicit and explainable; it never silently converts a hypothesis into a fact.

Development memory accepts only approved, sanitized development events. Personal memory accepts private evidence only through the authorized backend. Global learning receives only consented, de-identified aggregates.

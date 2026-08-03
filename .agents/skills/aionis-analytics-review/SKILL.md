---
name: aionis-analytics-review
description: Review Aionis operational and product-intelligence analytics contracts for purpose, event schemas, prohibited sensitive fields, consent, tenant isolation, sampling, aggregation, retention, access, calibration, alerts, and development-telemetry boundaries.
---

# Aionis Analytics Review

1. Apply `.agents/skills/aionis-ai-workflow/SKILL.md`; read `docs/aionis-operating-system/02-system-boundaries.md` and `docs/aionis-operating-system/13-analytics-and-observability.md`.
2. Complete `docs/aionis-operating-system/templates/analytics-contract.md` and validate events against `docs/aionis-operating-system/schemas/analytics-event.schema.json`.
3. Classify each event as operational or product-and-intelligence; never silently reuse one purpose for the other.
4. Require target, owner, decision purpose, consent/lawful basis, tenant scope, allowed fields, prohibited sensitive fields, sampling, retention, access, deletion, and alerts.
5. Reject raw private profiles, credentials, prompts, evidence content, cross-user identifiers, or names/DOBs in development telemetry.
6. Review cohort thresholds, de-identification, missingness, bias, confidence calibration, and version comparisons.
7. Record approval conditions and the security, intelligence, Dream, or Release Gate dependencies.

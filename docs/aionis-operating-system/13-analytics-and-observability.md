# Analytics and Observability

## Separate contracts

**Operational analytics:** errors, latency, queue depth, failed jobs, model usage, token use and estimated cost, retry rate, consolidation jobs, and security warnings.

**Product and intelligence analytics:** questionnaire completion, time per question, finding reading time, accuracy ratings, rejection rates, confusion rates, coach rewrites, rule performance, confidence calibration, and version comparisons.

Operational records support reliability and security. Product/intelligence analytics support consented product and methodology evaluation. Do not silently reuse one class for the other.

Every event uses `schemas/analytics-event.schema.json`; every collection proposal uses `templates/analytics-contract.md`. The contract must declare target, class, purpose, owner, lawful/consent basis, schema, prohibited sensitive fields, tenant handling, sampling, retention, access, deletion, aggregation, alerts, and version.

Raw names, dates of birth, free-form profile text, evidence content, prompts, credentials, tokens, session secrets, and cross-user identifiers are prohibited unless a separately approved contract explicitly justifies a private operational field. They are always prohibited from development telemetry.

Metrics are evidence about system behavior, not proof of a personal conclusion. Record missingness, selection bias, and version changes when comparing results.

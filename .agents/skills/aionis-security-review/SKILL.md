---
name: aionis-security-review
description: Review Aionis changes for least privilege, secrets, tenant isolation, RLS, server validation, sensitive logging, consent, retention, cross-user leakage, environment access, auditability, and rollback. Use for security-sensitive plans, code, Dreams, analytics, and releases.
---

# Aionis Security Review

1. Apply `.agents/skills/aionis-ai-workflow/SKILL.md`; read `docs/aionis-operating-system/02-system-boundaries.md`, `docs/aionis-operating-system/11-security-and-privacy.md`, and `docs/ARCHITECTURE.md` for current boundaries.
2. Complete `docs/aionis-operating-system/templates/security-review.md` against the exact artifact and environment.
3. Trace data from collection through storage, models/providers, logs, analytics, retrieval, deletion, and rollback.
4. Verify authentication, authorization, tenant isolation, RLS, server-side validation, least privilege, secrets, and environment separation.
5. Reject production credentials in browser code, private profiles in development memory, sensitive development telemetry, and cross-user pattern leakage.
6. Confirm consent/de-identification for aggregate learning, explicit retention, audit ownership, incident response, and reversible change.
7. Record evidence, findings, conditions, owner, and required human gate. Security review never authorizes deployment by itself.

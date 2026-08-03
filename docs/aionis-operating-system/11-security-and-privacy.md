# Security and Privacy

## Baseline controls

- Apply least privilege and environment-aware access.
- Redact secrets and sensitive values before storage, logs, telemetry, or model calls.
- Put no production credentials or service-role keys in browser code.
- Enforce tenant isolation, Row Level Security, server-side validation, and deny-by-default authorization.
- Prevent sensitive logs; define audit logging and retention rules separately.
- Deny development agents access to production profiles.
- Prohibit private profile data from development memory and development telemetry.
- Prevent cross-user pattern leakage in retrieval, inference, caches, analytics, and support tools.
- Require consent and robust de-identification for aggregate learning.
- Make material changes reversible and audit privileged actions.

The public repository's current Supabase and application rules remain authoritative in `AGENTS.md` and `docs/ARCHITECTURE.md`.

## Review questions

Confirm target and environment; data classification; authentication and authorization; tenant scope; client/server trust boundary; secret path; input/output validation; logs; retention/deletion; consent; third parties/models; abuse cases; rollback; and incident owner.

Security approval does not replace intelligence, formula, code, or release approval. Use `templates/security-review.md` and `.agents/skills/aionis-security-review/SKILL.md`.

# Security Review: FPR-SEC-default-privileges@1.0.0

- Artifact version / reviewer / environment / target: migration commit `25bc261d9a0a108174bf7e545b3da0e75615cd04`; Codex security review; isolated local Supabase plus user-attested hosted rollback probe; `PRIVATE_AIONIS_BACKEND`.
- Data classification, consent, tenant, and retention: privilege metadata only; no user data, consent record, tenant row, or retention-bearing content.
- Authentication, authorization, least privilege, RLS, and server validation: future `postgres`-owned objects are deny-by-default for Data API roles. Existing `people` CRUD grants, authenticated owner RLS, policies, and trigger remain unchanged and pass all 8 regression cases.
- Client/server trust boundary and secret handling: SQL is database-only. No browser/client credential, service-role key, connection string, or secret is added to code, tests, screenshots, or docs.
- Model/provider and third-party data flow: none.
- Input/output validation, abuse cases, and sensitive-log prevention: the migration contains only the four approved `ALTER DEFAULT PRIVILEGES` statements. Tests create uniquely named probes inside a transaction and roll them back. Output is boolean privilege evidence only.
- Cross-user, cross-tenant, cache, analytics, and development-memory leakage checks: no new data path exists. Existing cross-user and unauthenticated people cases remain green. No cache, analytics, or development-memory content changes.
- Audit trail, incident owner, reversibility, and rollback: Git migration history, SHA-256-bound release evidence, local pgTAP output, and hosted probe results form the audit trail. Private-platform owner controls release/incident decisions. Explicit grants are the preferred forward fix; default restoration is documented and requires a separate Release Gate.
- Findings by severity / required remediation: no high/medium/low implementation finding. Condition: apply only as `postgres`; do not alter `supabase_admin`; re-open review if the application object-creator role changes; run hosted verification and advisors after application.
- Prohibited sensitive fields confirmed absent: names, DOBs, emails, credentials, tokens, prompts, profile/evidence content, and production rows.
- Decision: approve with conditions for PR review; this does not authorize hosted application or merge.
- Human gate / approver / timestamp: Plan Gate approved by the repository owner on 2026-08-04; Code and Release Gate decisions pending against the final PR head and bound migration digest.

# Feature Specification: Future Supabase object default privileges

- Feature ID / version: `FPR-SEC-default-privileges@1.0.0`
- Owner / target: private platform / `PRIVATE_AIONIS_BACKEND`
- Status / required gates: implementation verified locally; Plan approved by the repository owner in the 2026-08-04 task; Security approved with conditions; Code and production Release Gates remain pending.
- Problem and user outcome: objects created in `public` by the hosted SQL Editor's `postgres` role can inherit broad Data API privileges. Future application objects must begin inaccessible until an explicit object-specific grant is reviewed.
- In scope: one migration changing only `postgres` default privileges for future `public` tables, sequences, and functions; a global removal of PostgreSQL's built-in future-function `PUBLIC EXECUTE`; local and hosted verification; rollback and explicit-grant guidance; bounded governance updates.
- Out of scope: `supabase_admin` defaults; existing-object grants, RLS, policies, triggers, or ownership; new application objects; application code, formulas, UI, authentication, print, PWA, Vercel, dependencies, and hosted settings.
- Current behavior / expected behavior: existing `public.people` behavior remains unchanged. New `postgres`-owned `public` tables have no implicit CRUD for `anon`, `authenticated`, or `service_role`; new sequences have no implicit `USAGE` or `SELECT`; new functions have no implicit `EXECUTE` for those roles or `PUBLIC`.
- Constitutional and repository contracts: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/aionis-operating-system/11-security-and-privacy.md`, and the Prompt 2 `FPR-SEC-default-privileges` recommendation remain authoritative.
- Inputs, outputs, data classification, and tenant boundary: privilege metadata only; no student, tenant, profile, credential, or production-row data is read or written.
- Build-time AI / runtime AI classification: repository and database release work only; no runtime AI.
- Evidence, intelligence, security, analytics, and accessibility requirements: 10 deny-by-default assertions, the existing 8 people RLS assertions, lint, type parity, full repository CI, hosted rollback-only proof, Security review, and Release review. Intelligence, analytics, UI, accessibility, print, and formula impacts are not applicable.
- File ownership and integration contracts: `supabase/migrations/` owns the default-privilege change; `supabase/tests/database/` owns probes; the local verifier must run every database test; governance evidence stays below this directory and in bounded state/manifest files.
- Acceptance criteria and proof: the exact approved migration is the only database mutation; future-object checks are all false; the SQL Editor reports `Role postgres`; current people tests and generated types remain unchanged; no hosted mutation occurs before explicit Release Gate approval.
- Risks, dependencies, rollback, and known unknowns: a wrong creator role would leave a gap. `supabase_admin` is a managed-platform role and is deliberately unchanged; application schema changes must continue through the reviewed `postgres` path. Re-open the Security Gate if the creator path changes. See `rollback-plan.md`.
- Human Plan Gate decision / approver / timestamp: approved by the repository owner through the explicit 2026-08-04 task authorizing only this feature and branch.

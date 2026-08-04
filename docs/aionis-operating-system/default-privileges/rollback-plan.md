# Rollback Plan: FPR-SEC-default-privileges@1.0.0

- Current version / rollback target / target environment: migration `20260804191700`, SQL SHA-256 `5dfbcc97fc5a60709fc99d4b75ba9004f2ea2be271955df95ade3a271f48f358`; restore the prior `postgres` defaults only if an approved production incident requires it.
- Trigger evidence and stop conditions: stop rollout if the SQL Editor role is not `postgres`, any of the 10 future-object checks is true, existing `people` metadata or behavior changes, advisors report a warning/error, or migration history/digest differs.
- Owner / approver / communication path: private-platform owner; explicit human Release Gate approval; preserve the SQL Editor result and PR audit trail.
- Data, contract, intelligence, and migration compatibility: default privileges affect only future objects. Existing objects and data are untouched. No intelligence, formula, analytics, UI, or contract behavior changes.
- Ordered rollback steps: prefer an explicit grant on the affected object. Only if restoring broad future defaults is the approved incident response, execute the clearly labeled SQL below once as `postgres`, then verify defaults and current people behavior.
- Verification after restoration: repeat the 10-object rollback probe, inspect current role/object owners, rerun people pgTAP, and rerun security/performance advisors.
- User impact and recovery window: no current-user impact is expected. Explicit object grants are immediate; default restoration affects only objects created afterward.
- Audit records and evidence to preserve: PR commit/diff, migration digest, SQL Editor role, execution result, verification rows, advisor output, incident decision, and any forward-fix grants.
- Rehearsal date / result: 2026-08-04; migration and rollback syntax were exercised in rollback-only local/hosted transactions, with all 10 hardened-state checks false after the approved changes.
- Conditions that make rollback unsafe and forward-fix alternative: restoring broad defaults recreates the exposure and is unsafe as a routine response. Grant only the exact privilege needed on the exact object instead.

## Preferred forward-fix examples

Replace the example names and grant only what the reviewed application path needs:

```sql
grant select, insert, update, delete
on table public.example_table
to authenticated;

grant usage, select
on sequence public.example_table_id_seq
to authenticated;

grant execute
on function public.example_function(uuid)
to authenticated;
```

Any exposed table must also have reviewed RLS and tenant policies. Do not grant `anon` or `service_role` merely to work around an application error.

## Rollback SQL — do not run without a new Release Gate

```sql
alter default privileges for role postgres in schema public
  grant select, insert, update, delete
  on tables
  to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  grant usage, select
  on sequences
  to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  grant execute
  on functions
  to anon, authenticated, service_role;

alter default privileges for role postgres
  grant execute
  on functions
  to public;
```

# Hosted Release Evidence: FPR-SEC-default-privileges

Observed on 2026-08-04 in production project `frejicmqhsenqmdmqmfe`. This evidence is sanitized: it contains only identifiers already committed to the release, privilege booleans, and aggregate counts.

## Applied artifact

- Executor role shown by the Supabase SQL Editor: `postgres`.
- Migration: `20260804191700_harden_postgres_default_privileges.sql`.
- Committed SQL SHA-256: `5dfbcc97fc5a60709fc99d4b75ba9004f2ea2be271955df95ade3a271f48f358`.
- Application: the repository owner manually applied the exact committed four-statement SQL once.
- Migration-history reconciliation: preflight count 0; final count 1; name `harden_postgres_default_privileges`; statement count 4. Reconciliation inserted only the ledger record and did not execute the migration body again.

## Future-object verification

The committed read-only query returned exactly 10 rows. Every `automatically_accessible` value was `false`:

- functions: `public`, `anon`, `authenticated`, `service_role`;
- sequences: `anon`, `authenticated`, `service_role`;
- tables: `anon`, `authenticated`, `service_role`.

## Existing people/RLS regression

- Existing people row count before and after the rolled-back regression: 4.
- Hosted pgTAP results: `ok 1` through `ok 8`.
- Anonymous people CRUD: false.
- Authenticated people CRUD: true; extra table privileges: false.
- Trigger-function execution for `anon` and `authenticated`: false.
- `people` owner: `postgres`; RLS: true; policy count: 4; non-internal trigger count: 1.
- Fixed test users remaining after rollback: 0.

## Cleanup and advisors

- Remaining probe relations: 0.
- Remaining probe functions: 0.
- Refreshed Performance Advisor: 0 errors, 0 warnings, 0 suggestions.
- Refreshed Security Advisor: 0 database errors, 1 unrelated Auth warning (`Leaked Password Protection Disabled`), 0 suggestions.
- `supabase_admin` was not altered.

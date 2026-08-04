# Critical State

Updated: 2026-08-03

This bounded file contains facts that cannot safely be approximated. Refresh it immediately before compaction or context editing; remove completed task detail instead of appending a log.

## Protected facts

- Approved formula source: `lib/numerology.ts`.
- Approved formula SHA-256: `F7A0965F01AA4410BB38CEF05FF832F51A5EAFF6CC2E8E10238DB79EF7E5644A`.
- DOB input is `DD/MM/YYYY`; database conversion belongs only in `features/people/people.mapper.ts`.
- Screen, comparison, and one-page A4 print consume the same `Report` calculations.
- Legacy key `pass7-mobile-clients-v1` is never uploaded without explicit consent.
- Browser code may use only the Supabase URL and publishable key; secret/service-role credentials are forbidden.
- The private owner console remains outside this repository and student UI.

## Current checkpoint

- Branch: `docs/aionis-ai-operating-system`, based on `feature/supabase-user-persistence` so the installed AI workflow remains available.
- Hosted Supabase project: `frejicmqhsenqmdmqmfe`.
- Applied migrations: `20260731204509_create_people.sql`, `20260801000026_tighten_people_grants.sql`.
- Last verified hosted state and remaining release risks: `docs/CURRENT_STATE.md`.

## Active workflow task

- Goal: complete Prompt 1 only by installing the modular Aionis AI Operating System foundation as documentation, draft JSON schemas, Markdown templates, and project-local skills.
- Allowed changes: `AGENTS.md`, `docs/aionis-operating-system/`, required project-local skills under `.agents/skills/`, and bounded checkpoint updates.
- Forbidden changes: application code, calculations, UI/CSS, authentication, database/RLS behavior, assets, PWA/print behavior, deployment, production data, and Prompts 2 through 12.
- Acceptance: all required contracts/templates/skills present; schemas and paths valid; existing authoritative sources linked rather than duplicated; application regression checks pass; product diff empty; commit, push, and draft stacked PR; no merge and no gap audit.

## Resume evidence

- Reproduction: validate `docs/aionis-operating-system/schemas/*.json`, validate the eight new skills, then run the unchanged repository lint, tests, and build.
- Relevant files: `AGENTS.md`, `docs/aionis-operating-system/`, `.agents/skills/aionis-*/SKILL.md`, and this checkpoint.
- Verification: nine schemas pass Draft 2020-12 meta-validation; eight new skills and all referenced repository paths validate; the workflow validator, four telemetry tests, lint, four formula fixtures, 21 unit tests, eight rendered-artifact tests, and production PWA build pass. Record final Git and draft-PR identity in the handoff.
- Unresolved defect: none currently identified in the Prompt 1 artifacts.
- Working tree: refresh with exact `git status --short --branch` output immediately before compaction.

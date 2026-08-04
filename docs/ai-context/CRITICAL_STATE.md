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

- Branch: `feature/supabase-user-persistence`.
- Hosted Supabase project: `frejicmqhsenqmdmqmfe`.
- Applied migrations: `20260731204509_create_people.sql`, `20260801000026_tighten_people_grants.sql`.
- Last verified hosted state and remaining release risks: `docs/CURRENT_STATE.md`.

## Active workflow task

- Goal: install the corrected, token-efficient AI-development workflow from the 2026-08-03 correction brief.
- Allowed changes: `AGENTS.md`, `.gitignore`, `.agents/skills/aionis-ai-workflow/`, `docs/ai-context/`, and the workflow checkpoint in `docs/CURRENT_STATE.md`.
- Forbidden changes: Aionis application code, calculations, UI, database behavior, assets, deployment configuration, or production data.
- Acceptance: conditional thread policy; loss-aware compaction; correct-at-source rule; task budgets; telemetry; tool profiles; model routing; restricted caching; versioned accepted answers; Level 3 design only; transcript-accuracy statement; scripts/tests passing; product diff empty.

## Resume evidence

- Reproduction: run `node .agents/skills/aionis-ai-workflow/scripts/verify-workflow.mjs` and `node --test .agents/skills/aionis-ai-workflow/scripts/telemetry.test.mjs`.
- Relevant files: `AGENTS.md`, `docs/ai-context/*`, `.agents/skills/aionis-ai-workflow/*`.
- Verification: skill validator, four telemetry tests, workflow scope guard, lint, application test chain, and production build pass as of 2026-08-03; the protected formula hash still matches.
- Unresolved defect: none in the workflow implementation at this checkpoint.
- Working tree: refresh with exact `git status --short --branch` output immediately before compaction.

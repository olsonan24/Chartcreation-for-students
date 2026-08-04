# Aionis AI Operating System

Status: Prompt 1 foundation. These contracts are future-facing and create no runtime behavior.

## Read progressively

1. Read `AGENTS.md` and `docs/CURRENT_STATE.md`.
2. Use `.agents/skills/aionis-ai-workflow/SKILL.md` for token-efficient repository work.
3. Read only the numbered document relevant to the task.
4. Load a template or schema only when producing that artifact.

Do not preload this entire directory. Start with governance and boundaries for architectural work, the feature lifecycle for implementation planning, and the applicable Dream, security, analytics, or release document for reviews.

## Authoritative sources retained

- Application ownership and data flow: `docs/ARCHITECTURE.md`.
- Formula protection: `docs/FORMULA_GUARDRAILS.md` and `lib/numerology.ts`.
- One-page report behavior: `docs/PRINT_CONTRACT.md`.
- Token-efficient development workflow: `docs/ai-context/WORKFLOW.md`.
- Current repository state: `docs/CURRENT_STATE.md`.

This operating system links to those sources instead of copying them. Conflicts are resolved in favor of the existing protected contract until a human-approved change explicitly supersedes it.

## Map

- `01`–`03`: governance, boundaries, and agent orchestration.
- `04`–`07`: lifecycle, gates, knowledge, and evidence.
- `08`–`10`: Development Dreaming, Human Pattern Dreaming, and global learning.
- `11`–`15`: security, model/cost routing, analytics, release, and quality.
- `16`: phased implementation roadmap; it is not authorization to begin another phase.
- `templates/`: reviewable Markdown work products.
- `schemas/`: draft JSON Schema contracts with no persistence implementation.
- `audits/`: future dated audit outputs; no gap audit is created in Prompt 1.

Every capability must declare exactly one target: `DEV_TOOLING`, `PUBLIC_STUDENT_APP`, `PRIVATE_AIONIS_BACKEND`, `PRIVATE_OWNER_CONSOLE`, or `SHARED_CONTRACT`.

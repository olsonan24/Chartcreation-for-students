---
name: aionis-ai-workflow
description: Run token-efficient, loss-aware Aionis repository work. Use for substantial coding, database, UI verification, research, release, context-compaction, accepted-answer reuse, tool-profile selection, model-routing recommendations, workflow telemetry, or handoff tasks in Chartcreation-for-students.
---

# Aionis AI Workflow

## Start bounded

1. Read `AGENTS.md` and `docs/CURRENT_STATE.md`.
2. Define the task, protected behavior, acceptance proof, allowed paths, and smallest sufficient deliverable.
3. Select one profile from `docs/ai-context/TOOL_PROFILES.md`.
4. Read only the task-specific contract and direct dependencies.
5. Check `docs/ai-context/ACCEPTED_ANSWERS.json` before asking a model to recreate an approved result.

Do not load the entire repository for orientation.

## Decide whether to continue the thread

Continue when the job is still tightly scoped and current environment/debugging state is useful. Start a clean thread when the primary job changes, a verified artifact replaces the discussion, or obsolete attempts dominate. Do not restart during active debugging that depends on current state.

For the full correction-at-source and session policy, read `docs/ai-context/WORKFLOW.md`.

## Protect compaction

Before compaction or context editing:

1. Update `docs/ai-context/CRITICAL_STATE.md` with exact requirements, protected behavior, acceptance criteria, reproduction steps, relevant files, unresolved defects, and `git status`.
2. Use only a currently supported compaction mechanism.
3. Reread the artifact after compaction.
4. Compare retained understanding with every saved fact and correct drift before acting.

Keep `CRITICAL_STATE.md` bounded; it is not an activity log.

## Route tools and models honestly

Use the minimum tool profile that can finish and verify the task. A skill cannot remove conversation history, standing instructions, hidden setup, or tool definitions already loaded before it runs. Record that limitation instead of claiming tool reduction.

Recommend the least expensive model likely to succeed without costly retries. Consider reasoning difficulty, context, ambiguity, error impact, and verification. Never silently change the active model.

## Reuse accepted answers safely

Reuse an entry only when its status is `accepted`, its invalidators are false, and its source/version still match. Show its short summary before reuse. Ask for confirmation when current intent could differ. Do not silently reuse stale architecture or formula decisions.

## Record privacy-safe telemetry

Record task summaries only when technically available:

```text
node .agents/skills/aionis-ai-workflow/scripts/telemetry.mjs record --task-id <id> --category coding --status success --opened "AGENTS.md:1-80;docs/CURRENT_STATE.md:1-40" --tools "shell,apply_patch" --tool-calls 6
node .agents/skills/aionis-ai-workflow/scripts/telemetry.mjs report
```

Never record prompts, file contents, secrets, credentials, names, DOBs, or user data. Exact token fields are optional; source bytes are the documented fallback proxy.

## Finish

Run:

```text
node .agents/skills/aionis-ai-workflow/scripts/verify-workflow.mjs
node --test .agents/skills/aionis-ai-workflow/scripts/telemetry.test.mjs
```

Update `docs/CURRENT_STATE.md` after a material milestone. Report files changed, proof, limitations, and whether any product file changed.

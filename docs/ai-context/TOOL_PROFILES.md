# Task-Specific Tool Profiles

Choose one primary profile before substantial work. Add a tool only when the task or its proof requires it.

| Profile | Load/enable | Keep out unless required | Typical proof |
| --- | --- | --- | --- |
| Coding | repository search/read, shell, patch editor, Git, test runner | browser, database admin, web research | targeted tests, lint, diff |
| Database | repository search/read, shell, Supabase CLI or MCP, PostgreSQL docs | browser UI, image tools, release tools | migration dry run, RLS tests, advisors |
| UI verification | local server, browser control, screenshot/image inspection, console logs | database admin, broad web research | phone/desktop bounds, accessibility, console |
| Research | repository read/search, web search/open for primary sources | patch editor, deployment, database writes | sourced short report |
| Release verification | Git/GitHub, Vercel, shell/build, browser, targeted security check | image generation, unrelated MCP servers | commit/deployment identity, live artifact, smoke test |

## Selection rules

1. Start with the smallest profile that can both execute and verify the task.
2. Prefer deterministic local scripts over another model call for fixed recipes.
3. Add tools explicitly when a new requirement appears; record the expanded tool set in telemetry.
4. Never disable global user tools, edit credentials, or change account permissions without approval.
5. Keep database and release mutations out of read-only research tasks.

## Current-surface limitation

A Claude or Codex skill runs after the request envelope is assembled. It cannot unload standing instructions, conversation history, hidden setup, connectors, MCP schemas, or tools already included.

To enforce a minimal profile today, configure it before creating the task:

- Start a new task with only the profile’s required connectors/MCP servers enabled in the client or launcher.
- Use a separate project/user configuration that allow-lists those servers; do not delete the global configuration or credentials.
- For CLI launches, select the prepared profile/configuration before the model process starts.
- If the active surface offers no per-task tool allow-list, record the intended profile and the actual preloaded tool set; do not claim enforcement.

The optional Level 3 gateway would automate this selection before model invocation.

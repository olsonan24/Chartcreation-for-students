# Aionis AI Development Workflow

Updated: 2026-08-03

## Audit result

The repository already had useful Level 1 habits: read `CURRENT_STATE.md`, load one task contract, prefer targeted searches, and preserve formula/print/privacy boundaries. It did not contain a committed critical-state artifact, accepted-answer registry, task tool profiles, privacy-safe efficiency telemetry, or a Level 3 gateway specification. No tracked rule requiring a fresh thread at every phase or a universal 500-word report limit was found in current files or Git history.

This installation adds those missing controls without changing application code or claiming that a repository skill can alter the request envelope.

## Policy provenance

Keep these sources distinct:

- **Explicit correction brief:** conditional clean threads, loss-aware compaction, correction at source, task budgets, telemetry, profiles, model routing, restricted caching, versioned reuse, Level 2/3 separation, and transcript accuracy.
- **Engineering inference:** bounded registry size, proxy calculations, profile names, validation scripts, and waste-ranking presentation.
- **Aionis-specific recommendation:** exact files, formula/print/privacy checkpoints, and Git-safe telemetry location.

Do not claim that the source transcript explicitly named all 15 rules. Several spoken labels were absent; repository labels are organizational choices.

## Thread policy

Continue the current thread when:

- the same tightly scoped problem is active;
- immediate context or runtime state helps;
- debugging evidence has not yet been captured elsewhere.

Start a clean thread when:

- the primary job materially changes;
- a verified artifact fully replaces the conversation;
- obsolete discussion, rejected attempts, or unrelated tool output dominate;
- a misunderstanding has polluted the task enough that a corrected request is safer.

Do not restart in the middle of debugging when process, browser, database, or working-tree state is still needed.

## Loss-aware compaction

Before native compaction or supported context editing:

1. Refresh `CRITICAL_STATE.md`.
2. Preserve exact requirements, protected behavior, acceptance criteria, reproduction steps, relevant file/ranges, unresolved defects, and working-tree status.
3. Invoke only a mechanism currently supported by the active Claude or Codex surface.
4. Reread `CRITICAL_STATE.md` afterward.
5. Compare retained understanding against each fact.
6. Correct omissions or changed facts before continuing.

Do not turn the file into a transcript or daily log. Remove completed task details once they are no longer required to resume safely.

## Correct at the source

When an unclear or mistaken request produces the wrong path:

1. Stop the incorrect path.
2. Rewrite the complete corrected request.
3. Preserve only accepted work that still satisfies it.
4. Start a clean task if repeated criticism, rejected drafts, or obsolete reasoning dominate.
5. Do not carry the correction argument into the replacement task.

## Task budgets

Before substantial work, name the smallest sufficient deliverable: exact edit, patch, JSON, five bullets, short report, implementation specification, or verification report. Honor the user’s explicit length requirement. Keep commentary brief, but do not truncate an artifact that genuinely requires detail.

There is no universal final-answer word limit.

## Accepted-answer reuse

Use `ACCEPTED_ANSWERS.json` as a bounded cache of approved decisions and verified artifacts, not as a memory dump.

Before reuse:

1. Confirm `status` is `accepted`.
2. Confirm the source and relevant commit/document version still exist.
3. Test every listed invalidator.
4. Show the entry’s short summary.
5. Ask for confirmation if current intent is ambiguous.
6. Avoid a new model call only when the entry is sufficient.

Add a new version instead of overwriting history. Mark the old entry `superseded` and identify its replacement. Keep at most the registry’s declared maximum entries; archive obsolete evidence outside automatically loaded context.

## Model routing

Recommend, but never silently select, the least expensive model expected to finish correctly:

| Risk | Typical work | Guidance |
| --- | --- | --- |
| Low | Exact text edit, deterministic search, known command | Prefer a lower-cost capable model or fixed recipe. |
| Medium | Bounded multi-file implementation with clear contracts | Use a balanced coding model plus targeted verification. |
| High | Formula changes, security architecture, ambiguous recovery, release decisions | Use a stronger reasoning model; expected retry/error cost dominates price. |

Consider required context, architectural ambiguity, impact of error, expected retries, and proof requirements. Do not automatically choose the smallest model.

## Prompt caching

Prompt caching is primarily an API optimization for repeated stable prefixes. It is not the main solution for ordinary interactive coding threads.

Possible future Aionis API candidates include an immutable formula contract, stable output schema, and repeated grading/reference instructions. Do not implement provider-specific caching without an explicit API workload and request.

## Measurement

The telemetry script stores one privacy-safe task summary per line under ignored `.ai-context/telemetry/`. It can record exact input/output tokens only when the provider exposes them. Otherwise it measures loaded source bytes and reports the transparent estimate `ceil(sourceBytes / 4)` as a comparison proxy, not an exact token count.

Reports rank tasks separately by source bytes, tool calls, and retries so the largest visible waste sources are easy to inspect without storing prompts or content.

## Control levels

- **Level 1:** human habits such as focused requests, clean corrections, and short updates.
- **Level 2:** repository instructions, skills, deterministic scripts, critical state, registries, and verification. This is what is installed now.
- **Level 3:** a pre-model intermediary that can shape the request before the model receives it. See `LEVEL3_GATEWAY_SPEC.md`.

Level 2 cannot reduce conversation history, standing instructions, hidden setup, or tool definitions already present in the request envelope. It can only guide behavior after invocation.

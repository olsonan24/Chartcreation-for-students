# Optional Level 3 Aionis Development Gateway

Status: design specification only; not implemented or deployed.

## Objective

Place an explicit, user-controlled intermediary before a model call so request size, tools, retrieval, model routing, and telemetry can be enforced rather than merely recommended.

## Request path

```text
User request
  -> inspect task metadata
  -> select task/tool profile
  -> check accepted-answer registry
  -> run safe deterministic recipes/searches
  -> select bounded relevant passages
  -> apply input/output budgets
  -> ask, reject, bypass, or route
  -> invoke selected model
  -> verify result and record summary telemetry
  -> return result with stop control
```

## Required capabilities

- Inspect task category, requested artifact, risk, repository state, and user overrides before any model call.
- Choose Coding, Database, UI verification, Research, or Release verification profiles.
- Retrieve only valid accepted-answer entries and show the proposed reuse summary.
- Run allow-listed fixed local recipes and deterministic searches without a model.
- Select only relevant line ranges and enforce configurable input/output budgets.
- Reject or request confirmation for oversized, ambiguous, destructive, or profile-incompatible requests.
- Recommend or route to an appropriate model based on difficulty, context, risk, retries, and verification cost.
- Record privacy-safe efficiency telemetry and allow the user to bypass or stop before transmission.

## Safety and privacy

- Default-deny prompt/content logging; store identifiers, counts, ranges, and byte totals only.
- Never store secrets, credentials, private chart records, names, DOBs, complete prompts, or file contents without explicit approval.
- Keep deterministic recipes allow-listed, versioned, reviewable, and non-destructive by default.
- Show the selected profile, retrieved accepted answer, model recommendation, and budget before a consequential call.
- Provide hard stop and one-request bypass controls. Bypass must be visible in telemetry.

## Suggested components

| Component | Responsibility |
| --- | --- |
| Request classifier | Category, risk, deliverable, and ambiguity assessment |
| Profile registry | Tool and connector allow-lists |
| Accepted-answer resolver | Version/invalidation checks and reuse summary |
| Recipe runner | Fixed local commands and deterministic searches |
| Context selector | Path/range retrieval and byte budget |
| Budget gate | Input/output ceilings and oversize rejection |
| Model router | Recommendation and approved selection |
| Telemetry sink | Privacy-safe task summaries and waste report |
| User control | Preview, confirm, bypass, and stop |

## Guarantees by level

| Control | Level 2 repository workflow | Level 3 gateway |
| --- | --- | --- |
| Encourage bounded file reads | Yes | Yes |
| Remove history already supplied | No | Yes, before forwarding |
| Remove preloaded tool definitions | No | Yes, if the client/API supports per-call tools |
| Enforce input/output budgets | Advisory | Yes |
| Avoid a model call with a fixed recipe | Voluntary | Yes |
| Prevent prompt/content telemetry | Script policy | Gateway enforcement |
| Route models | Recommendation only | Yes, with user policy |

## Non-goals

- No production Aionis/student feature.
- No proxy credentials in this repository.
- No provider-specific prompt-caching implementation.
- No silent model changes or automatic destructive commands.

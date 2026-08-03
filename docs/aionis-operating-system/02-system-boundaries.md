# System Boundaries

## Exclusive targets

| Target | Responsibility | Forbidden examples |
| --- | --- | --- |
| `DEV_TOOLING` | Repository agents, sanitized development memory, CI, local review tools | Raw student data, production profile access |
| `PUBLIC_STUDENT_APP` | Student-facing chart experience | Service-role keys, owner controls, development telemetry |
| `PRIVATE_AIONIS_BACKEND` | Server-side private processing, governed personal memory, queues | Browser secrets, cross-tenant access |
| `PRIVATE_OWNER_CONSOLE` | Authorized private review and operations | Public links, student-app bundling |
| `SHARED_CONTRACT` | Schemas and versioned interfaces used across targets | Secrets, target-specific execution logic |

Assign a capability to one target. Cross-target flows require an explicit contract, minimal data, authentication, authorization, validation, audit logging, and retention rules.

## Required separations

- **Build-time AI / runtime AI:** development assistance is `DEV_TOOLING`; user-facing generation requires a separately approved runtime target.
- **Development memory / personal memory:** sanitized repository events never contain profiles; personal evidence stays in the private backend.
- **Personal learning / global learning:** personal updates are isolated to a user or organization; global methodology uses only consented, de-identified outcomes and formal review.
- **Operational data / analytics:** records needed to perform a job are not automatically analytics inputs.
- **Public / private:** public student capabilities never expose private owner functions.
- **Evidence / conclusions:** immutable source evidence is distinct from versioned interpretations.
- **Constitution / memory:** constitutional methodology changes only through formal approval; operational or personal memory cannot rewrite it.
- **Facts / hypotheses:** interfaces and reports must label each explicitly.
- **Private data / telemetry:** private user data is prohibited from development telemetry.

The current application boundary remains defined by `docs/ARCHITECTURE.md`.

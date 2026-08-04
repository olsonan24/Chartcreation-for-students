# Model Routing, Cost, and Capacity

## Routing policy

Choose the least expensive deterministic tool or model expected to meet the quality and proof requirement after accounting for ambiguity, sensitivity, context size, retry risk, latency, and impact of error. Never silently change a user-selected model. Follow `docs/ai-context/WORKFLOW.md` for the current development routing policy.

Each runtime generation contract records provider, exact model ID, configuration, prompt version, fallback policy, timeout, retry ceiling, token/cost budget, environment, and required evidence. Fallback use is visible in the generation manifest and cannot bypass a security, intelligence, or approval gate.

The generation manifest also records constitutional and engine versions, release identity, confidence, exact input/output budgets, cost currency and ceiling, fallback provider/model and disclosure, and the acceptance or stochastic comparison policy.

## Capacity controls

- Set per-request and aggregate budgets for tokens, estimated cost, latency, retries, and queue age.
- Bound concurrency by target, tenant, and workload class.
- Use backpressure, idempotency keys, dead-letter handling, and cancellation for queued work.
- Prefer cached deterministic artifacts only when version and invalidation rules are explicit.
- Degrade safely: return a bounded unavailable or Inquiry state rather than inventing a conclusion.

Prompt caching is an optimization for stable repeated prefixes; it is neither development memory nor the student application's Workbox/PWA cache. Workbox may name generated runtime caches, but this repository does not configure or promise a specific PWA cache identifier.

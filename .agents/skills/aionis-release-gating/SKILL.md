---
name: aionis-release-gating
description: Assemble and evaluate Aionis release evidence across immutable identity, automated checks, preview and staging, security and intelligence reviews, configuration, analytics, rollout, rollback, human approval, observation, and consolidation.
---

# Aionis Release Gating

1. Apply `.agents/skills/aionis-ai-workflow/SKILL.md`; read `docs/aionis-operating-system/14-release-and-environment-strategy.md` and `docs/aionis-operating-system/15-quality-gates-and-definition-of-done.md` plus repository release contracts.
2. Build artifacts from `docs/aionis-operating-system/schemas/release-manifest.schema.json`, `docs/aionis-operating-system/templates/release-review.md`, and `docs/aionis-operating-system/templates/rollback-plan.md`.
3. Bind evidence to the exact commit, artifact digest, contract/intelligence versions, and environment.
4. Verify automated checks, preview/staging behavior, configuration and secrets, migrations, security/intelligence/formula decisions, analytics, rollout owner, stop conditions, and rollback rehearsal.
5. Confirm every required human approval matches the current artifact version.
6. Do not deploy unless explicitly authorized and the Release Gate is approved. A passing build or CI run is not production approval.
7. After release, record observation, incident state, consolidation ownership, and rollback status.

# Release and Environment Strategy

## Lifecycle

Feature specification → approved plan → focused branch → pull request → automated verification → preview environment → staging → security review → intelligence review → human approval → production → analytics → consolidation.

Development, preview, staging, and production have distinct credentials, data policies, access, and audit trails. Production data must not be copied into development. Synthetic or specifically approved de-identified fixtures are preferred.

## Release identity

Use `schemas/release-manifest.schema.json` to bind commit, artifact digest, contract and intelligence versions, environment, verification evidence, reviews, approvals, migrations, rollout strategy, analytics, and rollback target. A mutable branch name or “latest” tag is insufficient identity.

The Release Gate requires a passing definition of done, reviewed security/intelligence impact, verified environment configuration, recovery owner, rollback plan, and explicit approver decision. Production deployment is never implied by a passing CI run.

After release, observe the declared operational and product/intelligence signals. Consolidation creates sanitized lessons and versioned records; it never imports raw private profiles into development memory.

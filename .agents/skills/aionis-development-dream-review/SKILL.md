---
name: aionis-development-dream-review
description: Review Development Dream proposals built from approved sanitized development events for cursor correctness, idempotency, duplicates, contradictions, stale guidance, recurring failures, exact diffs, cost, reversibility, negative knowledge, and Dream Gate requirements.
---

# Aionis Development Dream Review

1. Apply `.agents/skills/aionis-ai-workflow/SKILL.md`; read `docs/aionis-operating-system/08-development-dreaming.md` and `docs/aionis-operating-system/05-human-approval-gates.md`.
2. Require a `dream-proposal` artifact and complete `docs/aionis-operating-system/templates/dream-review.md` outside active implementation work.
3. Verify approved sanitized inputs, last-processed cursor, empty-run skip, idempotency key, and absence of secrets or private profiles.
4. Check duplicate, contradiction, stale-document, resolved-TODO, and recurring-failure findings against source evidence.
5. Require an exact before/after, cost estimate, rollback, and retained prior rejections.
6. Allow automatic application only for pre-approved mechanically safe and reversible maintenance. Route every meaningful change through the Dream Gate.
7. Never approve automatic formula, constitutional, security, personal-profile, application-behavior, or production changes.

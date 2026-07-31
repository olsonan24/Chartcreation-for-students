# Aionis Student Chart Creator

## Scope

- This repository root is the Vercel-deployed Vite PWA.
- `lib/numerology.ts` is the approved formula engine.
- `reference/Pass7-Recreated/` is read-only formula provenance and is not part of the web build.
- The private Aionis owner console is intentionally outside this public repository.

## Non-negotiable contracts

- Do not change `lib/numerology.ts` without explicit formula approval and fixture updates.
- Preserve the browser storage key `pass7-mobile-clients-v1` and on-device privacy.
- Accept DOB as `DD/MM/YYYY`.
- Screen, phone, comparison, and print must consume the same `Report` calculations.
- Keep owner telemetry, tokens, administrative controls, databases, and student tracking out of this application.
- Preserve the one-page A4 print contract and offline PWA behavior.

## Verification

Run from the repository root:

```text
npm ci
npm run lint
npm test
```

For print changes, generate and inspect a real one-page A4 PDF. For UI changes, verify phone and desktop layouts without document-level horizontal overflow.

## Vercel

Vercel must use the repository root, `npm ci`, `npm run build`, and `dist`. No environment variables are required.

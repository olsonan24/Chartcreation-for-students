# Architecture

## Student App

`Pass7-Mobile` is a Next 16 / React 19 PWA built through Vinext, Vite, and a Cloudflare worker entry.

| Concern | Source of truth |
| --- | --- |
| Main UI, state, people, charts, comparison, print report | `Pass7-Mobile/app/page.tsx` |
| Screen and print styling | `Pass7-Mobile/app/globals.css` |
| All calculations | `Pass7-Mobile/lib/numerology.ts` |
| Formula fixtures | `Pass7-Mobile/tests/numerology.test.mjs` |
| UI/PWA/print structure checks | `Pass7-Mobile/tests/rendered-html.test.mjs` |
| PWA metadata | `Pass7-Mobile/app/layout.tsx`, `app/manifest.ts` |
| Offline asset cache | `Pass7-Mobile/public/sw.js` |
| Original formulas/report | `Pass7-Recreated/Pass/Numerology.cs`, `Report.cs`, `PdfDocument.cs` |

The student app has no active API, database, account, analytics, or OpenAI dependency. People are stored only in browser local storage. `db/` and `app/chatgpt-auth.ts` are unused template scaffolding.

## Print Pipeline

Printing is browser-native through `window.print()`. `PassPrintReport` renders a dedicated A4 report; print CSS hides the normal screen UI.

## Owner Console

`Aionis-Owner-Console` is a separate Node application bound to `127.0.0.1:4180`. It may read development metadata, run verification, and summarize project state. It must not read names, dates of birth, charts, or browser local storage.

## Privacy Boundary

There is intentionally no navigation or code path from the student app to the owner console. The console is not a student feature and must not be deployed with the student app.

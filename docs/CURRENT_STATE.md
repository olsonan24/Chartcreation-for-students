# Current State

Updated: 2026-07-31

## Products

- Student app: `Pass7-Mobile/`
- Private owner console: `Aionis-Owner-Console/`
- Recovered reference: `Pass7-Recreated/`

## Student App Checkpoint

- Branch: `codex/vite-vercel-student-release`
- Current known commit: `58046e3`
- Formula engine is unchanged from its approved port.
- Formula baseline SHA-256: `F7A0965F01AA4410BB38CEF05FF832F51A5EAFF6CC2E8E10238DB79EF7E5644A`
- Existing checks: 3 formula tests and 7 rendered-app/PWA/print/Vercel tests.
- Standard Vite production build outputs `dist/index.html`; Workbox precaches the app shell and artwork for offline reloads.
- `vercel.json` is committed with Vite build/output settings and the SPA fallback.
- Local phone URL when running: `http://10.0.0.178:4173`
- Saved people remain in browser `localStorage` under `pass7-mobile-clients-v1`.

## Current Mission

The student application is locally ready for GitHub and Vercel publication:

- concise `AGENTS.md` plus task-specific contracts;
- project skills `aionis-feature-orchestrator` and `aionis-formula-auditor`;
- four read-only custom agents for investigation, formulas, experience, and verification;
- separate private owner console at `http://127.0.0.1:4180`;
- formula fingerprint and golden fixtures remain unchanged;
- phone and desktop browser checks pass without document overflow or browser errors;
- a real A4 browser PDF was rendered and visually verified as one page;
- prepared for GitHub `main` at `olsonan24/Chartcreation-for-students` with automatic root-level Vercel configuration.

The current working milestone also:

- shows the complete ivory-and-gold `PassPrintReport` as the normal Chart screen on phone and desktop;
- preserves every summary, yearly, monthly, and extended-cycle row on screen and in print;
- displays portrait cosmic artwork uncropped with `contain` instead of stretching it through landscape `cover` boxes;
- keeps document scrolling enabled after dialogs close;
- reloads an installed PWA once when a newly claimed service worker replaces an older offline build;
- passes lint, all 3 formula fixtures, all 7 rendered-app tests, desktop/mobile browser checks, and a one-page A4 PDF inspection.

Latest artwork milestone:

- imports purpose-built desktop and phone backgrounds for the app shell, dashboard hero, comparison state, and report masthead;
- uses the supplied true-transparent Aionis crest and vertical report seal plus a dedicated install icon;
- applies the supplied ivory paper texture to the same shared screen/print report without changing chart colors or values;
- keeps legacy artwork out of the Workbox precache while caching the complete new asset set for offline reloads;
- visually passes desktop dashboard, phone dashboard, phone comparison, phone report, desktop report, scroll, and browser-console checks;
- renders `Pass7-Mobile/output/pdf/Aionis-artwork-release-proof.pdf` as one unclipped A4 page.

Latest knowledge-transfer milestone:

- adds `.agents/skills/aionis-timeline-chart-builder/` as a portable chart-construction skill;
- bundles the approved formula engine at its unchanged SHA-256, executable golden fixtures, formula and chart contracts, pattern-analysis guardrails, and phone/desktop/A4 requirements;
- exports a shareable single `SKILL.md` and complete ZIP package under `deliverables/`;
- passes the skill validator and all three bundled formula fixtures.

Latest repository-release milestone:

- makes the public repository root directly deployable by Vercel with `npm ci`, `npm run build`, and `dist`;
- includes the complete student source, tests, PWA artwork/cache configuration, project contracts, portable Aionis chart skill, GitHub verification workflow, and recovered C# source reference;
- excludes the private loopback owner console from the public student repository and deployment;
- requires no environment variables and preserves the approved formula SHA-256;
- passes a clean install, production dependency audit, lint, 3 formula fixtures, production PWA build, 7 rendered output checks, and the portable skill's 3 fixtures.

## Owner Console Checkpoint

- Binds only to `127.0.0.1:4180`; it is not reachable through the phone/LAN address.
- Reads no names, dates of birth, saved people, charts, or browser local storage.
- Shows local experimental Codex input/cache/output counters for matching workspace tasks.
- Explicitly labels those counters as not billing or API spend.
- Shows Git checkpoint, formula fingerprint, agent profiles, startup-context estimate, app health, and verification status.
- Full student verification passed from the console on 2026-07-19 in 7.8 seconds.
- Phone breakpoint: no document-level horizontal overflow and no browser console errors.

## Known Risks

- The prior artwork release was verified at commit `58046e3f210299b084e9681bf7eca2584c97217c`; publication now targets the public `olsonan24/Chartcreation-for-students` repository.
- Git commands must run inside `Pass7-Mobile/`; the parent tree can fall through to an unrelated `C:\Users\olson` repository.
- Keep the one-page browser PDF check in the release routine even though the latest A4 proof passed.
- Saved people are tied to the exact browser origin; changing host or port can make them appear absent.
- Codex session/cache telemetry is local, experimental, and not billing data.

## Read Next By Task

- Formula or values: `docs/FORMULA_GUARDRAILS.md`
- File ownership and data flow: `docs/ARCHITECTURE.md`
- Print/PDF: `docs/PRINT_CONTRACT.md`
- General feature: `.agents/skills/aionis-feature-orchestrator/SKILL.md`

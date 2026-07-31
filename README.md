# Aionis Timeline Formula

An installable timeline chart creator for phone and desktop web browsers.

This repository is the complete public source package for the student-facing application. It includes the responsive web/PWA code, exact formula engine, tests, artwork, deployment configuration, project documentation, portable AI chart-building skill, and recovered source-code reference. The private owner and token-usage console is intentionally maintained outside this public repository and is never included in the student build.

## Features

- Exact port of the original name, birth-date, pinnacle, challenge, essence, personal-year, calendar-year, and monthly calculations
- Individual timeline charts and multi-chart comparisons
- Touch-friendly phone layout with larger-screen support
- Private on-device person storage using browser local storage
- Install-to-home-screen support and offline caching
- Browser printing and PDF export

## Commands

```bash
npm ci
npm run dev
npm test
```

Open `http://localhost:4173` while the development server is running. `npm test` verifies the original reference charts, builds the production application, and checks the Vite/PWA output.

## Vercel deployment

Import `olsonan24/Chartcreation-for-students` into Vercel. The committed root-level `package.json` and `vercel.json` make configuration automatic:

- Framework preset: **Vite**
- Root directory: `.`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none

Do not choose a subdirectory as the Vercel Root Directory. Leave it at the repository root (`.`). The committed `vercel.json` supplies the build, output directory, single-page-app fallback, and service-worker cache headers. Every future push to `main` can then deploy automatically through the Vercel Git integration.

## Repository map

- `app/`, `src/`, `lib/`, and `public/`: production student application
- `tests/`: formula, PWA, output, and Vercel structure verification
- `docs/`: calculation, architecture, print, and current-state contracts
- `.agents/skills/aionis-timeline-chart-builder/`: portable AI skill with the approved engine and golden fixtures
- `reference/Pass7-Recreated/`: recovered C# source and build dependencies retained as formula provenance; not used by Vercel

The Vercel deployment contains only the generated static application. Documentation, tests, AI skill resources, and recovered C# reference files are excluded from the deployment upload by `.vercelignore`.

## Offline use

After the first complete visit over HTTPS, the application shell, chart artwork, scripts, and styles are cached on the device. Saved people remain in that browser's on-device storage. A GitHub or Vercel deployment does not transfer people saved under an older localhost address.

## Data privacy

Saved names and dates of birth stay in the current browser on the current device. This version does not send chart records to a database.

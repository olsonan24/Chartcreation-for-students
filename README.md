# Aionis Timeline Formula

An installable timeline chart creator for phone and desktop web browsers.

This repository contains the student-facing application only. The private owner and token-usage console is intentionally maintained outside this repository and is never included in the public build.

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

Import this repository into Vercel with these settings:

- Framework preset: **Vite**
- Root directory: `.`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none

The committed `vercel.json` supplies the single-page-app fallback and prevents stale service-worker updates.

## Offline use

After the first complete visit over HTTPS, the application shell, chart artwork, scripts, and styles are cached on the device. Saved people remain in that browser's on-device storage. A GitHub or Vercel deployment does not transfer people saved under an older localhost address.

## Data privacy

Saved names and dates of birth stay in the current browser on the current device. This version does not send chart records to a database.

# PASS 7 Mobile

An installable phone version of Peter Vaughan's original PASS numerology chart creator.

## Features

- Exact port of the original name, birth-date, pinnacle, challenge, essence, personal-year, calendar-year, and monthly calculations
- Individual QuickChart and Multi Chart comparisons
- Touch-friendly phone layout with larger-screen support
- Private on-device person storage using browser local storage
- Install-to-home-screen support and offline caching
- Browser printing and PDF export

## Commands

```bash
npm install
npm run dev
npm test
```

`npm test` verifies the original reference chart, builds the production application, and checks the rendered mobile/PWA shell.

## Data privacy

Saved names and dates of birth stay in the current browser on the current device. This version does not send chart records to a database.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("builds a standard Vite application shell for phone and desktop", async () => {
  const [html, page] = await Promise.all([read("../dist/index.html"), read("../app/page.tsx")]);

  assert.match(html, /<title>Aionis Timeline Formula<\/title>/i);
  assert.match(html, /id="root"/);
  assert.match(html, /\/assets\/index-[^"']+\.js/);
  assert.match(html, /\/assets\/index-[^"']+\.css/);
  assert.match(page, /Map the patterns that shape a lifetime\./);
  assert.match(page, /Add person/);
  assert.match(page, /Install/);
  assert.doesNotMatch(html, /Codex is working|react-loading-skeleton|codex-preview/i);
});

test("uses the Aionis brand throughout every user-facing surface", async () => {
  const [page, html, manifest, readme] = await Promise.all([
    read("../app/page.tsx"),
    read("../index.html"),
    read("../public/manifest.webmanifest"),
    read("../README.md"),
  ]);
  const userFacing = [page, html, manifest, readme].join("\n");

  assert.match(userFacing, /Aionis Timeline Formula/);
  assert.match(userFacing, /aionis-logo-transparent\.png/);
  assert.match(userFacing, /aionis-report-seal\.png/);
  assert.match(userFacing, /aionis-app-icon\.png/);
  assert.doesNotMatch(userFacing, /Peter Vaughan|Peter Vaughn|PASS 7/i);
});

test("uses an authenticated repository boundary while preserving build-time offline precaching", async () => {
  const [page, html, manifest, worker, packageJson, client, repository, legacy, migration] = await Promise.all([
    read("../app/page.tsx"),
    read("../index.html"),
    read("../public/manifest.webmanifest"),
    read("../dist/sw.js"),
    read("../package.json"),
    read("../lib/supabase/client.ts"),
    read("../features/people/people.repository.ts"),
    read("../features/people/legacyImport.ts"),
    read("../supabase/migrations/20260731204509_create_people.sql"),
  ]);

  assert.doesNotMatch(page, /supabase\.from|\.from\("people"\)|localStorage/);
  assert.match(client, /VITE_SUPABASE_URL/);
  assert.match(client, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(client, /service.role|service_role/i);
  assert.match(repository, /\.from\("people"\)/);
  assert.match(repository, /auth\.getUser\(\)/);
  assert.match(legacy, /pass7-mobile-clients-v1/);
  assert.match(legacy, /getItem/);
  assert.doesNotMatch(legacy, /removeItem/);
  assert.match(migration, /alter table public\.people enable row level security/);
  assert.match(migration, /to authenticated/);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /with check \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(page, /register\("\/sw\.js", \{ updateViaCache: "none" \}\)/);
  assert.match(page, /controllerchange/);
  assert.match(page, /registration\.update\(\)/);
  assert.match(page, /beforeinstallprompt/);
  assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.match(worker, /precacheAndRoute/);
  assert.match(worker, /index\.html/);
  assert.match(worker, /assets\/index-/);
  assert.match(worker, /dashboard-hero-desktop\.png/);
  assert.match(worker, /dashboard-hero-mobile\.png/);
  assert.match(worker, /report-paper-texture\.png/);
  assert.doesNotMatch(worker, /aionis-cosmic-body\.png|aionis-rhythm\.png|aionis-timeline-formula-logo\.jpg/);
  assert.doesNotMatch(packageJson, /vinext|cloudflare|wrangler|next|drizzle/i);
});

test("uses accurate cloud privacy and connectivity language", async () => {
  const [page, readme] = await Promise.all([read("../app/page.tsx"), read("../README.md")]);
  const copy = `${page}\n${readme}`;
  assert.match(copy, /private signed-in account/i);
  assert.match(copy, /cloud access requires connectivity/i);
  assert.doesNotMatch(copy, /device-only storage|never leaves this device|does not send chart records to a database/i);
});

test("lets iOS open the keyboard from a real tap on the name fields", async () => {
  const page = await read("../app/page.tsx");

  assert.doesNotMatch(page, /autoFocus/);
  assert.match(page, /type="text"\s+inputMode="text"\s+autoComplete="name"/);
  assert.match(page, /autoCapitalize="words"/);
  assert.match(page, /inputMode="numeric"/);
  assert.match(page, /useDialogFocus/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /previouslyFocused\?\.focus/);
});

test("offers a persisted Bulgarian alphabet mode with an accessible responsive keyboard", async () => {
  const [page, css, alphabets, repository, reportBuilder, migration] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/globals.css"),
    read("../lib/name-alphabets.ts"),
    read("../features/people/people.repository.ts"),
    read("../features/people/personReport.ts"),
    read("../supabase/migrations/20260805010000_add_people_name_alphabet_mode.sql"),
  ]);

  assert.match(page, /Name alphabet/);
  assert.match(alphabets, /Български \/ Кирилица/);
  assert.match(page, /Българска клавиатура/);
  assert.match(page, /BULGARIAN_ALPHABET\.map/);
  assert.match(page, /type="button"[\s\S]*?data-name-key=\{letter\}/);
  assert.match(page, /Space", "Hyphen", "Apostrophe", "Backspace", "Clear/);
  assert.match(page, /onPointerDown=\{\(event\) => event\.preventDefault\(\)\}/);
  assert.match(page, /setSelectionRange\(next\.caret, next\.caret\)/);
  assert.match(alphabets, /АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ/);
  assert.match(alphabets, /\(\(position - 1\) % 9\) \+ 1/);
  assert.match(repository, /name_alphabet_mode/);
  assert.match(reportBuilder, /client\.nameAlphabetMode/);
  assert.match(migration, /name_alphabet_mode text not null default 'latin'/);
  assert.match(migration, /'bulgarian-cyrillic'/);
  assert.doesNotMatch(migration, /disable row level security|drop policy|revoke/i);
  assert.match(css, /\.bulgarian-keyboard button \{[^}]*min-height: 44px/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*?repeat\(6, minmax\(0, 1fr\)\)/);
});

test("includes a dedicated AirPrint-safe one-page Aionis report", async () => {
  const [page, css] = await Promise.all([read("../app/page.tsx"), read("../app/globals.css")]);

  assert.match(page, /className="pass-print-report"/);
  assert.match(page, /className="print-report-masthead"/);
  assert.match(page, /Yearly Timeline - Personal Cycles/);
  assert.match(page, /Yearly \/ Monthly Timeline Summary/);
  assert.match(page, /Sequence Timeline - Extended Cycles/);
  assert.match(page, /className="chart-report-toolbar no-print"/);
  assert.match(page, /length=\{30\} variant="focus"/);
  assert.match(page, /length=\{80\} variant="lifetime"/);
  assert.match(page, /PrintMonthSection/);
  assert.match(page, /PRINT_DOTTED_ROWS = 2/);
  assert.match(page, /NameNumberStack/);
  assert.match(page, /gridTemplateColumns: `repeat\(\$\{letterGroups\.length\}, max-content\) max-content`/);
  assert.doesNotMatch(page, /Array\.from\(\{ length: 8 \}/);
  assert.match(css, /@page \{ size: A4 portrait; margin: 0; \}/);
  assert.match(css, /\.chart-view > :not\(\.pass-print-report\)/);
  assert.match(css, /width: 210mm;/);
  assert.match(css, /height: 287mm;/);
  assert.match(css, /max-height: 287mm;/);
  assert.match(css, /grid-template-rows: 34mm 42mm 58mm 46mm 82mm 1fr;/);
  assert.match(css, /\.print-brand/);
  assert.match(css, /\.print-report-panel/);
  assert.match(css, /\.print-report-panel > h2/);
  assert.match(css, /\.print-year-focus \.print-character-row, \.print-year-lifetime \.print-character-row/);
  assert.doesNotMatch(css, /height: 297mm;/);
  assert.equal((page.match(/window\.print\(\)/g) ?? []).length, 1);
});

test("ships purpose-built responsive Aionis artwork for phone, web, comparison, and reports", async () => {
  const [page, css, manifest] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/globals.css"),
    read("../public/manifest.webmanifest"),
  ]);

  assert.match(page, /aionis-logo-transparent\.png/);
  assert.match(page, /aionis-report-seal\.png/);
  assert.match(page, /className="desktop-nav"/);
  assert.match(page, /className="aionis-trust-ribbon"/);
  assert.match(page, /className="chart-report-hint no-print"/);
  assert.match(css, /@media screen/);
  assert.match(css, /app-background-desktop\.png/);
  assert.match(css, /app-background-mobile\.png/);
  assert.match(css, /dashboard-hero-desktop\.png/);
  assert.match(css, /dashboard-hero-mobile\.png/);
  assert.match(css, /compare-background-desktop\.png/);
  assert.match(css, /compare-background-mobile\.png/);
  assert.match(css, /report-header-desktop\.png/);
  assert.match(css, /report-header-mobile\.png/);
  assert.match(css, /report-paper-texture\.png/);
  assert.match(css, /overflow-y: auto !important;/);
  assert.match(css, /@media screen and \(min-width: 900px\)[\s\S]*?\.bottom-nav \{ display: none; \}/);
  assert.match(css, /\.person-main \{ background: transparent; color: #eef3fb; \}/);
  assert.doesNotMatch(page, /document\.body\.style\.overflow\s*=\s*"hidden"/);
  assert.match(manifest, /Aionis Timeline Formula/);
  assert.match(manifest, /aionis-app-icon\.png/);
});

test("is ready for a Vercel Vite deployment with browser-safe Supabase variables", async () => {
  const [vercel, packageJson, envExample] = await Promise.all([
    read("../vercel.json"),
    read("../package.json"),
    read("../.env.example"),
  ]);
  const config = JSON.parse(vercel);
  const pkg = JSON.parse(packageJson);

  assert.equal(config.framework, "vite");
  assert.equal(config.buildCommand, "npm run build");
  assert.equal(config.outputDirectory, "dist");
  assert.equal(config.rewrites[0].destination, "/index.html");
  assert.equal(pkg.scripts.dev, "vite");
  assert.equal(pkg.scripts.build, "vite build");
  assert.match(envExample, /VITE_SUPABASE_URL/);
  assert.match(envExample, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(envExample, /sb_secret_|SUPABASE_(SERVICE_ROLE|SECRET)/i);
});

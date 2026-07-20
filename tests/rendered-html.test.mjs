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
  assert.match(userFacing, /aionis-timeline-formula-logo\.jpg/);
  assert.doesNotMatch(userFacing, /Peter Vaughan|Peter Vaughn|PASS 7/i);
});

test("includes local persistence and build-time offline precaching", async () => {
  const [page, html, manifest, worker, packageJson] = await Promise.all([
    read("../app/page.tsx"),
    read("../index.html"),
    read("../public/manifest.webmanifest"),
    read("../dist/sw.js"),
    read("../package.json"),
  ]);

  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /navigator\.serviceWorker\.register\("\/sw\.js"\)/);
  assert.match(page, /beforeinstallprompt/);
  assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.match(worker, /precacheAndRoute/);
  assert.match(worker, /index\.html/);
  assert.match(worker, /assets\/index-/);
  assert.match(worker, /aionis-cosmic-body\.png/);
  assert.doesNotMatch(packageJson, /vinext|cloudflare|wrangler|next|drizzle/i);
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

test("includes a dedicated AirPrint-safe one-page Aionis report", async () => {
  const [page, css] = await Promise.all([read("../app/page.tsx"), read("../app/globals.css")]);

  assert.match(page, /className="pass-print-report"/);
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
  assert.match(css, /height: 266mm;/);
  assert.match(css, /max-height: 266mm;/);
  assert.match(css, /grid-template-rows: 50mm 68mm 42mm 70mm 1fr;/);
  assert.match(css, /\.print-brand/);
  assert.match(css, /\.print-year-focus \.print-character-row, \.print-year-lifetime \.print-character-row/);
  assert.doesNotMatch(css, /height: 297mm;/);
  assert.equal((page.match(/window\.print\(\)/g) ?? []).length, 1);
});

test("ships the matching cosmic dashboard artwork for phone and web", async () => {
  const [page, css, manifest] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/globals.css"),
    read("../public/manifest.webmanifest"),
  ]);

  assert.match(page, /aionis-cosmic-body\.png/);
  assert.match(page, /aionis-rhythm\.png/);
  assert.match(page, /className="desktop-nav"/);
  assert.match(page, /className="aionis-trust-ribbon"/);
  assert.match(page, /className="chart-surface-banner no-print"/);
  assert.match(css, /@media screen/);
  assert.match(css, /background: #020711/);
  assert.match(css, /@media screen and \(min-width: 900px\)[\s\S]*?\.bottom-nav \{ display: none; \}/);
  assert.match(css, /\.person-main \{ background: transparent; color: #eef3fb; \}/);
  assert.match(manifest, /Aionis Timeline Formula/);
});

test("is ready for a zero-configuration Vercel Vite deployment", async () => {
  const [vercel, packageJson] = await Promise.all([read("../vercel.json"), read("../package.json")]);
  const config = JSON.parse(vercel);
  const pkg = JSON.parse(packageJson);

  assert.equal(config.framework, "vite");
  assert.equal(config.buildCommand, "npm run build");
  assert.equal(config.outputDirectory, "dist");
  assert.equal(config.rewrites[0].destination, "/index.html");
  assert.equal(pkg.scripts.dev, "vite");
  assert.equal(pkg.scripts.build, "vite build");
});

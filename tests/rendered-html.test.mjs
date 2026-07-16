import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Aionis phone and web application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Aionis Timeline Formula<\/title>/i);
  assert.match(html, /Map the patterns that shape a lifetime\./);
  assert.match(html, /Add person/);
  assert.match(html, /Install/);
  assert.doesNotMatch(html, /Codex is working|react-loading-skeleton|codex-preview/i);
});

test("uses the Aionis brand throughout every user-facing surface", async () => {
  const [page, layout, manifest, worker, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);
  const userFacing = [page, layout, manifest, worker, readme].join("\n");

  assert.match(userFacing, /Aionis Timeline Formula/);
  assert.match(userFacing, /aionis-timeline-formula-logo\.jpg/);
  assert.match(page, /aionis-timeline-formula-logo\.jpg[\s\S]*?unoptimized/);
  assert.doesNotMatch(userFacing, /Peter|Vaughan|PASS 7/i);
});

test("includes local persistence and installable offline support", async () => {
  const [page, layout, manifest, worker, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /navigator\.serviceWorker\.register\("\/sw\.js"\)/);
  assert.match(page, /beforeinstallprompt/);
  assert.match(layout, /manifest:\s*"\/manifest\.webmanifest"/);
  assert.match(manifest, /display:\s*"standalone"/);
  assert.match(worker, /caches\.open/);
  assert.match(worker, /"\/manifest\.webmanifest"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("lets iOS open the keyboard from a real tap on the name fields", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(page, /autoFocus/);
  assert.match(page, /type="text"\s+inputMode="text"\s+autoComplete="name"/);
  assert.match(page, /autoCapitalize="words"/);
  assert.match(page, /inputMode="numeric"/);
});

test("includes a dedicated AirPrint-safe one-page Aionis report", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

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
});

test("ships the matching cosmic dashboard artwork for phone and web", async () => {
  const [page, css, manifest] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /aionis-cosmic-body\.png/);
  assert.match(page, /aionis-rhythm\.png/);
  assert.match(page, /className="desktop-nav"/);
  assert.match(page, /className="aionis-trust-ribbon"/);
  assert.match(page, /className="chart-surface-banner no-print"/);
  assert.match(css, /@media screen/);
  assert.match(css, /background: #020711/);
  assert.match(manifest, /Aionis Timeline Formula/);
});

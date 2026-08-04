import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright-core";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const signUp = process.env.E2E_SIGN_UP === "1";
const chromePath = process.env.E2E_CHROME_PATH
  ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!email || !password) {
  throw new Error("Set E2E_EMAIL and E2E_PASSWORD to a disposable Supabase test account.");
}

const outputDirectory = path.resolve("output", "pdf");
const pdfPath = path.join(outputDirectory, "supabase-auth-print-proof.pdf");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
const serviceRoleCredentials = [];
function exposesServiceRole(value) {
  if (/service[_-]?role/i.test(value)) return true;
  const token = value.replace(/^Bearer\s+/i, "");
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload.role === "service_role";
  } catch {
    return false;
  }
}
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("request", (request) => {
  const headers = request.headers();
  const credentials = [headers.apikey, headers.authorization].filter(Boolean);
  if (credentials.some(exposesServiceRole)) {
    serviceRoleCredentials.push(request.url());
  }
});

try {
  let createdPrintPerson = false;
  let deleteVerified = false;
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  if (signUp) {
    await page.getByRole("group", { name: "Authentication mode" })
      .getByRole("button", { name: "Create account", exact: true })
      .click();
  }
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.locator("form").getByRole("button", {
    name: signUp ? "Create account" : "Sign in",
    exact: true,
  }).click();
  await page.getByRole("heading", { name: "People", exact: true }).waitFor();

  const people = page.locator(".person-card .person-main");
  if (await people.count() === 0) {
    await page.getByRole("button", { name: "+ Add person", exact: true }).click();
    await page.getByLabel("Full birth name").fill("Print Proof Person");
    await page.getByLabel("Called name").fill("Proof");
    await page.getByLabel("Date of birth").fill("01/01/2000");
    await page.getByRole("button", { name: "Create chart", exact: true }).click();
    await page.getByRole("button", { name: "Print / PDF", exact: true }).waitFor();
    createdPrintPerson = true;
  } else {
    await people.first().click();
  }
  await page.getByRole("button", { name: "Print / PDF", exact: true }).waitFor();

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("button", { name: "People 1", exact: true })
    .click();
  await page.getByRole("heading", { name: "Map the patterns that shape a lifetime.", exact: true }).waitFor();
  const phoneLayout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  if (phoneLayout.scrollWidth > phoneLayout.clientWidth + 1) {
    throw new Error(`Phone layout overflows horizontally: ${JSON.stringify(phoneLayout)}`);
  }

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Map the patterns that shape a lifetime.", exact: true }).waitFor();
  const pwaState = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return { registered: false, controlled: false };
    const registration = await navigator.serviceWorker.getRegistration();
    return { registered: Boolean(registration), controlled: Boolean(navigator.serviceWorker.controller) };
  });
  if (!pwaState.registered || !pwaState.controlled) {
    throw new Error(`The production PWA was not registered and controlling the refreshed page: ${JSON.stringify(pwaState)}`);
  }

  if (createdPrintPerson) {
    const proofCard = page.locator(".person-card").filter({ hasText: "Print Proof Person" });
    const removeButton = proofCard.getByRole("button", { name: "Remove", exact: true });
    page.once("dialog", (dialog) => dialog.accept());
    await removeButton.click();
    await proofCard.waitFor({ state: "detached" });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator(".client-list, .empty-card").waitFor();
    if (await page.locator(".person-card").filter({ hasText: "Print Proof Person" }).count() !== 0) {
      throw new Error("The deleted person returned after refresh.");
    }
    deleteVerified = true;
  }

  if (serviceRoleCredentials.length > 0) {
    throw new Error(`A service-role credential appeared in browser requests: ${serviceRoleCredentials.join(", ")}`);
  }
  if (consoleErrors.length > 0) {
    throw new Error(`Browser console errors: ${consoleErrors.join(" | ")}`);
  }

  console.log(JSON.stringify({ pdfPath, phoneLayout, pwaState, deleteVerified }));
} finally {
  await browser.close();
}

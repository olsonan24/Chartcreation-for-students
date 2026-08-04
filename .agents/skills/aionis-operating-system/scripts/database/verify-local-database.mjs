import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const COMMITTED_TYPES = path.join(REPOSITORY_ROOT, "lib", "supabase", "database.types.ts");
const SUPABASE_CLI = path.join(REPOSITORY_ROOT, "node_modules", "supabase", "dist", "supabase.js");
const LINK_MARKERS = [
  path.join(REPOSITORY_ROOT, "supabase", ".temp", "project-ref"),
  path.join(REPOSITORY_ROOT, "supabase", ".temp", "project-id"),
];
const FORBIDDEN_REMOTE_ENVIRONMENT = [
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_PROJECT_ID",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
];

export function normalizeGeneratedTypes(value) {
  return value.replace(/\r\n/g, "\n");
}

export function generatedTypesMatch(committed, generated) {
  const normalizedCommitted = normalizeGeneratedTypes(committed);
  const normalizedGenerated = normalizeGeneratedTypes(generated);
  return (
    normalizedCommitted === normalizedGenerated ||
    normalizedCommitted === `${normalizedGenerated}\n` ||
    normalizedGenerated === `${normalizedCommitted}\n`
  );
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
  return result.stdout ?? "";
}

function supabase(args, options) {
  assert.ok(fs.existsSync(SUPABASE_CLI), "repository-pinned Supabase CLI is not installed; run npm ci first");
  return run(process.execPath, [SUPABASE_CLI, ...args], options);
}

function stage(name, callback) {
  process.stdout.write(`\n== ${name} ==\n`);
  try {
    const result = callback();
    process.stdout.write(`PASS: ${name}\n`);
    return result;
  } catch (error) {
    process.stderr.write(`FAIL: ${name}: ${error.message}\n`);
    error.stage = name;
    throw error;
  }
}

function assertLocalOnly() {
  const linkMarker = LINK_MARKERS.find((candidate) => fs.existsSync(candidate));
  assert.equal(
    linkMarker,
    undefined,
    `linked Supabase marker found at ${path.relative(REPOSITORY_ROOT, linkMarker ?? "")}`,
  );

  const exposedCredential = FORBIDDEN_REMOTE_ENVIRONMENT.find((name) => process.env[name]);
  assert.equal(
    exposedCredential,
    undefined,
    `hosted credential environment variable ${exposedCredential} must be unset`,
  );
}

function verifyTypeDrift(generatedTypes, tempDirectory) {
  const committedTypes = fs.readFileSync(COMMITTED_TYPES, "utf8");
  if (generatedTypesMatch(committedTypes, generatedTypes)) return;

  const committedNormalized = path.join(tempDirectory, "committed.database.types.ts");
  const generatedNormalized = path.join(tempDirectory, "generated.database.types.ts");
  fs.writeFileSync(committedNormalized, normalizeGeneratedTypes(committedTypes), "utf8");
  fs.writeFileSync(generatedNormalized, normalizeGeneratedTypes(generatedTypes), "utf8");

  const diff = spawnSync(
    "git",
    ["diff", "--no-index", "--no-ext-diff", "--", committedNormalized, generatedNormalized],
    { cwd: REPOSITORY_ROOT, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  if (diff.stdout) process.stderr.write(diff.stdout);
  if (diff.stderr) process.stderr.write(diff.stderr);
  throw new Error("generated local database types differ materially from lib/supabase/database.types.ts");
}

export function main() {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "aionis-database-verification-"));
  let primaryFailure;
  let cleanupFailure;

  try {
    stage("Remote safety", assertLocalOnly);
    stage("Startup", () => {
      supabase(["stop", "--no-backup"]);
      supabase(["start"], { capture: true });
    });
    stage("Migration application", () => supabase(["db", "reset", "--local", "--no-seed"]));
    stage("Database lint", () =>
      supabase(["db", "lint", "--local", "--schema", "public", "--level", "warning", "--fail-on", "warning"]),
    );
    stage("pgTAP", () =>
      supabase(["test", "db", "supabase/tests/database", "--local"]),
    );
    const generatedTypes = stage("Type generation", () =>
      supabase(["gen", "types", "--local", "--schema", "public"], { capture: true }),
    );
    stage("Type drift", () => verifyTypeDrift(generatedTypes, tempDirectory));
  } catch (error) {
    primaryFailure = error;
  } finally {
    try {
      stage("Cleanup", () => supabase(["stop", "--no-backup"]));
    } catch (error) {
      cleanupFailure = error;
    }
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }

  if (primaryFailure || cleanupFailure) {
    if (primaryFailure) process.stderr.write(`\nDatabase verification failed during ${primaryFailure.stage}.\n`);
    if (cleanupFailure) process.stderr.write("Database verification cleanup also failed.\n");
    process.exitCode = 1;
    return;
  }

  process.stdout.write("\nLocal Supabase database verification passed.\n");
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) main();

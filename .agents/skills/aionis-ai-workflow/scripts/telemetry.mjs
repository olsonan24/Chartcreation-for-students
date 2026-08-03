#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const CATEGORIES = new Set([
  "coding",
  "database",
  "ui-verification",
  "research",
  "release-verification",
  "workflow",
  "other",
]);

export const STATUSES = new Set(["success", "failure", "in-progress"]);

const SAFE_IDENTIFIER = /^[A-Za-z0-9_.:/-]+$/;
const NUMERIC_OPTIONS = new Map([
  ["turns", "turnCount"],
  ["input-tokens", "inputTokens"],
  ["output-tokens", "outputTokens"],
  ["tool-calls", "toolCalls"],
  ["retries", "retryCount"],
  ["compactions", "compactionCount"],
  ["handoffs", "handoffCount"],
  ["cache-hits", "acceptedAnswerCacheHits"],
  ["model-calls-avoided", "modelCallsAvoided"],
]);

const ALLOWED_RECORD_OPTIONS = new Set([
  "task-id",
  "thread-id",
  "category",
  "model",
  "status",
  "opened",
  "tools",
  ...NUMERIC_OPTIONS.keys(),
]);

function assertSafeIdentifier(value, label, { required = false } = {}) {
  if (!value) {
    if (required) throw new Error(`${label} is required.`);
    return null;
  }
  if (!SAFE_IDENTIFIER.test(value)) {
    throw new Error(`${label} must contain only identifier characters.`);
  }
  return value;
}

function parseNonnegativeInteger(value, label) {
  if (value === undefined) return null;
  if (!/^\d+$/.test(value)) throw new Error(`${label} must be a nonnegative integer.`);
  return Number(value);
}

function normalizeRelativePath(root, relativePath) {
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new Error("Opened files must use repository-relative paths.");
  }
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relativePath);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Opened path escapes the repository: ${relativePath}`);
  }
  return { resolved, relative: path.relative(resolvedRoot, resolved).split(path.sep).join("/") };
}

function bytesForRange(filePath, start, end) {
  const text = fs.readFileSync(filePath, "utf8");
  if (start === null) return Buffer.byteLength(text, "utf8");
  const lines = text.split(/\r?\n/);
  if (start < 1 || end < start || end > lines.length) {
    throw new Error(`Invalid opened range ${start}-${end} for ${filePath}.`);
  }
  return Buffer.byteLength(lines.slice(start - 1, end).join("\n"), "utf8");
}

export function parseOpenedSpec(spec, root = process.cwd()) {
  if (!spec) return [];
  return spec
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const rangeMatch = item.match(/^(.*):(\d+)-(\d+)$/);
      const rawPath = rangeMatch ? rangeMatch[1] : item;
      const start = rangeMatch ? Number(rangeMatch[2]) : null;
      const end = rangeMatch ? Number(rangeMatch[3]) : null;
      const normalized = normalizeRelativePath(root, rawPath);
      if (!fs.statSync(normalized.resolved).isFile()) {
        throw new Error(`Opened path is not a file: ${normalized.relative}`);
      }
      return {
        path: normalized.relative,
        range: start === null ? "all" : `${start}-${end}`,
        bytes: bytesForRange(normalized.resolved, start, end),
      };
    });
}

function parseToolSet(value) {
  if (!value) return [];
  const tools = value.split(",").map((item) => item.trim()).filter(Boolean);
  for (const tool of tools) assertSafeIdentifier(tool, "tool name", { required: true });
  return [...new Set(tools)].sort();
}

export function createRecord(options, root = process.cwd(), now = new Date()) {
  for (const key of Object.keys(options)) {
    if (!ALLOWED_RECORD_OPTIONS.has(key)) throw new Error(`Unsupported telemetry field: ${key}`);
  }

  const category = options.category;
  const status = options.status;
  if (!CATEGORIES.has(category)) throw new Error(`Unsupported category: ${category ?? "missing"}`);
  if (!STATUSES.has(status)) throw new Error(`Unsupported status: ${status ?? "missing"}`);

  const openedFiles = parseOpenedSpec(options.opened, root);
  const record = {
    schemaVersion: 1,
    recordedAt: now.toISOString(),
    taskId: assertSafeIdentifier(options["task-id"], "task-id", { required: true }),
    threadId: assertSafeIdentifier(options["thread-id"], "thread-id"),
    category,
    model: assertSafeIdentifier(options.model, "model"),
    status,
    turnCount: 0,
    inputTokens: null,
    outputTokens: null,
    approximateSourceBytes: openedFiles.reduce((total, file) => total + file.bytes, 0),
    filesOpened: openedFiles,
    toolCalls: 0,
    toolSetEnabled: parseToolSet(options.tools),
    retryCount: 0,
    compactionCount: 0,
    handoffCount: 0,
    acceptedAnswerCacheHits: 0,
    modelCallsAvoided: 0,
  };

  for (const [option, field] of NUMERIC_OPTIONS) {
    const value = parseNonnegativeInteger(options[option], option);
    if (value !== null) record[field] = value;
  }

  return record;
}

export function appendRecord(record, logPath) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
}

export function loadRecords(logPath) {
  if (!fs.existsSync(logPath)) return [];
  return fs
    .readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid telemetry JSON on line ${index + 1}.`);
      }
    });
}

function top(records, field, count = 5) {
  return [...records]
    .sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))
    .slice(0, count)
    .filter((record) => (record[field] ?? 0) > 0);
}

function renderTop(records, field, unit) {
  const selected = top(records, field);
  if (selected.length === 0) return "- No nonzero measurements.";
  return selected.map((record) => `- ${record.taskId}: ${record[field]} ${unit}`).join("\n");
}

export function buildMarkdownReport(records) {
  const total = (field) => records.reduce((sum, record) => sum + (record[field] ?? 0), 0);
  const successes = records.filter((record) => record.status === "success").length;
  const failures = records.filter((record) => record.status === "failure").length;
  const exactTokenRecords = records.filter(
    (record) => record.inputTokens !== null || record.outputTokens !== null,
  ).length;
  const sourceBytes = total("approximateSourceBytes");
  const estimatedSourceTokens = Math.ceil(sourceBytes / 4);

  return [
    "# Aionis AI Efficiency Report",
    "",
    `- Records: ${records.length}`,
    `- Success / failure: ${successes} / ${failures}`,
    `- Exact-token coverage: ${exactTokenRecords}/${records.length}`,
    `- Loaded source bytes: ${sourceBytes}`,
    `- Approximate source-token proxy: ${estimatedSourceTokens} (ceil(bytes / 4), not an exact count)`,
    `- Tool calls / retries: ${total("toolCalls")} / ${total("retryCount")}`,
    `- Compactions / handoffs: ${total("compactionCount")} / ${total("handoffCount")}`,
    `- Accepted-answer hits / model calls avoided: ${total("acceptedAnswerCacheHits")} / ${total("modelCallsAvoided")}`,
    "",
    "## Largest source loads",
    "",
    renderTop(records, "approximateSourceBytes", "bytes"),
    "",
    "## Most tool calls",
    "",
    renderTop(records, "toolCalls", "calls"),
    "",
    "## Most retries",
    "",
    renderTop(records, "retryCount", "retries"),
    "",
    "Review these indicators as leads, not proof of waste. The ledger contains no prompts or file contents.",
  ].join("\n");
}

function parseOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith("--") || value === undefined) {
      throw new Error("Options must use --name value pairs.");
    }
    options[flag.slice(2)] = value;
  }
  return options;
}

function defaultLogPath(root) {
  return path.join(root, ".ai-context", "telemetry", "tasks.jsonl");
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  const root = process.cwd();
  const logPath = defaultLogPath(root);

  if (command === "record") {
    const record = createRecord(parseOptions(args), root);
    appendRecord(record, logPath);
    process.stdout.write(`Recorded privacy-safe telemetry for ${record.taskId}.\n`);
    return;
  }

  if (command === "report") {
    if (args.length > 0) throw new Error("report does not accept options.");
    process.stdout.write(`${buildMarkdownReport(loadRecords(logPath))}\n`);
    return;
  }

  throw new Error("Usage: telemetry.mjs <record|report> [--name value ...]");
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  appendRecord,
  buildMarkdownReport,
  createRecord,
  loadRecords,
  parseOpenedSpec,
} from "./telemetry.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "aionis-telemetry-"));
  fs.mkdirSync(path.join(root, "docs"));
  fs.writeFileSync(path.join(root, "docs", "state.md"), "one\ntwo\nthree\nfour\n", "utf8");
  return root;
}

test("measures repository-relative file ranges without storing content", () => {
  const root = fixture();
  const opened = parseOpenedSpec("docs/state.md:2-3", root);
  assert.deepEqual(opened, [{ path: "docs/state.md", range: "2-3", bytes: 9 }]);
});

test("records the required efficiency indicators with unavailable tokens as null", () => {
  const root = fixture();
  const record = createRecord(
    {
      "task-id": "workflow-1",
      "thread-id": "thread-1",
      category: "workflow",
      model: "gpt-5",
      status: "success",
      opened: "docs/state.md:1-2",
      tools: "shell,apply_patch,shell",
      turns: "2",
      "tool-calls": "4",
      retries: "1",
      compactions: "0",
      handoffs: "0",
      "cache-hits": "1",
      "model-calls-avoided": "1"
    },
    root,
    new Date("2026-08-03T12:00:00Z"),
  );

  assert.equal(record.inputTokens, null);
  assert.equal(record.outputTokens, null);
  assert.equal(record.approximateSourceBytes, 7);
  assert.deepEqual(record.toolSetEnabled, ["apply_patch", "shell"]);
  assert.equal(record.retryCount, 1);
  assert.equal(record.acceptedAnswerCacheHits, 1);
});

test("rejects private free-form fields and paths outside the repository", () => {
  const root = fixture();
  assert.throws(
    () => createRecord({ "task-id": "x", category: "workflow", status: "success", prompt: "private" }, root),
    /Unsupported telemetry field/,
  );
  assert.throws(() => parseOpenedSpec("../secret.txt", root), /escapes the repository/);
});

test("persists JSONL summaries and reports visible waste indicators", () => {
  const root = fixture();
  const logPath = path.join(root, ".ai-context", "telemetry", "tasks.jsonl");
  const record = createRecord(
    {
      "task-id": "workflow-2",
      category: "workflow",
      status: "failure",
      opened: "docs/state.md",
      "tool-calls": "7",
      retries: "2",
    },
    root,
  );
  appendRecord(record, logPath);
  const loaded = loadRecords(logPath);
  assert.equal(loaded.length, 1);
  const report = buildMarkdownReport(loaded);
  assert.match(report, /Largest source loads/);
  assert.match(report, /workflow-2: 7 calls/);
  assert.match(report, /Exact-token coverage: 0\/1/);
  assert.doesNotMatch(fs.readFileSync(logPath, "utf8"), /one|two|three|four/);
});

#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../../..");

const requiredFiles = [
  "AGENTS.md",
  ".agents/skills/aionis-ai-workflow/SKILL.md",
  ".agents/skills/aionis-ai-workflow/agents/openai.yaml",
  "docs/ai-context/WORKFLOW.md",
  "docs/ai-context/CRITICAL_STATE.md",
  "docs/ai-context/TOOL_PROFILES.md",
  "docs/ai-context/LEVEL3_GATEWAY_SPEC.md",
  "docs/ai-context/ACCEPTED_ANSWERS.json",
];

const allowedChangePrefixes = [
  ".agents/skills/aionis-ai-workflow/",
  ".agents/skills/aionis-analytics-review/",
  ".agents/skills/aionis-development-dream-review/",
  ".agents/skills/aionis-human-pattern-dream-review/",
  ".agents/skills/aionis-intelligence-review/",
  ".agents/skills/aionis-operating-system/",
  ".agents/skills/aionis-product-planning/",
  ".agents/skills/aionis-release-gating/",
  ".agents/skills/aionis-security-review/",
  "docs/ai-context/",
  "docs/aionis-operating-system/",
];
const allowedExactChanges = new Set([".gitignore", "AGENTS.md", "docs/CURRENT_STATE.md"]);

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const relativePath of requiredFiles) {
  assert(fs.existsSync(path.join(repositoryRoot, relativePath)), `Missing required workflow file: ${relativePath}`);
}

const agents = read("AGENTS.md");
const workflow = read("docs/ai-context/WORKFLOW.md");
const criticalState = read("docs/ai-context/CRITICAL_STATE.md");
const profiles = read("docs/ai-context/TOOL_PROFILES.md");
const gateway = read("docs/ai-context/LEVEL3_GATEWAY_SPEC.md");
const skill = read(".agents/skills/aionis-ai-workflow/SKILL.md");

assert(!skill.includes("TODO"), "Workflow skill still contains TODO placeholders.");
assert(agents.includes("Continue the current thread"), "AGENTS.md lacks the conditional continuation rule.");
assert(agents.includes("Before compaction"), "AGENTS.md lacks the critical-state compaction guard.");
assert(workflow.includes("There is no universal final-answer word limit."), "Task-budget rule is missing.");
assert(workflow.includes("Do not claim that the source transcript explicitly named all 15 rules."), "Transcript-accuracy rule is missing.");
assert(profiles.includes("Coding") && profiles.includes("Release verification"), "Tool profiles are incomplete.");
assert(profiles.includes("cannot unload"), "Tool-envelope limitation is missing.");
assert(gateway.includes("design specification only"), "Level 3 document is not marked as design-only.");
assert(gateway.includes("Level 2 repository workflow") && gateway.includes("Level 3 gateway"), "Level guarantees are not separated.");
assert(Buffer.byteLength(criticalState, "utf8") <= 12_000, "CRITICAL_STATE.md exceeds its 12 KB bound.");

const registry = JSON.parse(read("docs/ai-context/ACCEPTED_ANSWERS.json"));
assert(registry.schemaVersion, "Accepted-answer registry lacks schemaVersion.");
assert(Number.isInteger(registry.maximumEntries) && registry.maximumEntries > 0, "Registry maximumEntries is invalid.");
assert(Array.isArray(registry.entries), "Registry entries must be an array.");
assert(registry.entries.length <= registry.maximumEntries, "Accepted-answer registry exceeds its bound.");

const registryFields = [
  "topic",
  "status",
  "version",
  "source",
  "acceptanceDate",
  "supersededVersion",
  "dependenciesThatInvalidateIt",
  "relevantCommitOrDocumentationVersion",
];
for (const entry of registry.entries) {
  for (const field of registryFields) {
    assert(Object.hasOwn(entry, field), `Registry entry ${entry.topic ?? "unknown"} lacks ${field}.`);
  }
  assert(["accepted", "superseded", "invalidated"].includes(entry.status), `Invalid registry status: ${entry.status}`);
  assert(Array.isArray(entry.dependenciesThatInvalidateIt), `Invalid invalidators for ${entry.topic}.`);
}

const statusOutput = execFileSync("git", ["status", "--porcelain=v1"], {
  cwd: repositoryRoot,
  encoding: "utf8",
});
const changedPaths = statusOutput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.slice(3).replaceAll("\\", "/"));
const outOfScope = changedPaths.filter(
  (changedPath) =>
    !allowedExactChanges.has(changedPath) &&
    !allowedChangePrefixes.some((prefix) => changedPath.startsWith(prefix)),
);
assert(outOfScope.length === 0, `Product/out-of-scope files changed: ${outOfScope.join(", ")}`);

function fileSizeRow(filePath, label) {
  const body = fs.readFileSync(filePath, "utf8");
  return {
    label,
    path: path.relative(repositoryRoot, filePath).split(path.sep).join("/"),
    bytes: Buffer.byteLength(body, "utf8"),
    lines: body.split(/\r?\n/).length,
  };
}

const instructionFiles = [
  fileSizeRow(path.join(repositoryRoot, "AGENTS.md"), "repository scope"),
];
const inheritedAgents = path.resolve(repositoryRoot, "..", "AGENTS.md");
if (fs.existsSync(inheritedAgents)) {
  instructionFiles.unshift(fileSizeRow(inheritedAgents, "inherited workspace scope"));
}
const onDemandSkill = fileSizeRow(
  path.join(repositoryRoot, ".agents", "skills", "aionis-ai-workflow", "SKILL.md"),
  "on-demand skill",
);

process.stdout.write("Aionis AI workflow verification passed.\n");
process.stdout.write("Instruction files in the current directory scope:\n");
for (const row of instructionFiles) {
  process.stdout.write(`- ${row.label}: ${row.path} - ${row.bytes} bytes, ${row.lines} lines\n`);
}
process.stdout.write(`- ${onDemandSkill.label}: ${onDemandSkill.path} - ${onDemandSkill.bytes} bytes, ${onDemandSkill.lines} lines\n`);
process.stdout.write(`Scope check: ${changedPaths.length} workflow path(s), 0 product paths.\n`);

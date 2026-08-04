#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  addAssignment,
  advanceLifecycle,
  atomicWriteJson,
  createHandoff,
  createWorkspaceTemplate,
  decideHandoff,
  findOwnershipCollisions,
  formatReadiness,
  loadTrackedWorkspaces,
  readinessReport,
  recordFailedGate,
  repoRoot,
  resolveInsideRepo,
  setArtifactVersion,
  validateAllTrackedWorkspaces,
  validateWorkspace,
} from './core.mjs'

function usage() {
  return `Aionis development orchestrator

Usage:
  npm run aionis:orchestrator -- init <repo-relative-file> --feature-id <id> --title <title> --owner <owner> [--dry-run]
  npm run aionis:orchestrator -- validate <repo-relative-file>
  npm run aionis:orchestrator -- validate-all
  npm run aionis:orchestrator -- assign <workspace> --payload <assignment-json> [--dry-run]
  npm run aionis:orchestrator -- collisions <workspace>
  npm run aionis:orchestrator -- advance <workspace> --to <state> --actor <actor> --reason <reason> [--evidence <a,b>] [--rollback-release <id> --rollback-version <version>] [--dry-run]
  npm run aionis:orchestrator -- fail-gate <workspace> --gate <gate> --return-to <state> --actor <actor> --reason <reason> [--evidence <a,b>] [--dry-run]
  npm run aionis:orchestrator -- set-version <workspace> --version <version> --actor <actor> --reason <reason> [--dry-run]
  npm run aionis:orchestrator -- handoff-create <workspace> --payload <handoff-json> --actor <producer> [--dry-run]
  npm run aionis:orchestrator -- handoff-decide <workspace> --handoff-id <id> --actor <consumer> --decision <ACCEPTED|REJECTED> [--reason <reason>] [--dry-run]
  npm run aionis:orchestrator -- gates <workspace>
  npm run aionis:orchestrator -- readiness <workspace> [--json]

Every mutation is atomic after validation. Dry-run prints the proposed JSON and writes nothing.
`
}

function parseArgs(argv) {
  const [command, positional, ...rest] = argv
  const options = {}
  for (let index = 0; index < rest.length; index += 1) {
    const key = rest[index]
    if (!key.startsWith('--')) throw new Error(`unexpected argument: ${key}`)
    if (['--dry-run', '--json'].includes(key)) options[key.slice(2)] = true
    else {
      const value = rest[++index]
      if (!value || value.startsWith('--')) throw new Error(`${key} requires a value`)
      options[key.slice(2)] = value
    }
  }
  return { command, positional, options }
}

function required(options, key) {
  if (!options[key]) throw new Error(`--${key} is required`)
  return options[key]
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function workspacePath(input) {
  return resolveInsideRepo(input)
}

function loadWorkspace(input) {
  const file = workspacePath(input)
  if (!fs.existsSync(file)) throw new Error(`workspace does not exist: ${input}`)
  return { file, workspace: readJson(file) }
}

function payloadPath(input) {
  const file = resolveInsideRepo(input)
  if (!fs.existsSync(file)) throw new Error(`payload does not exist: ${input}`)
  return file
}

function allWithCurrent(current) {
  const tracked = loadTrackedWorkspaces()
  const byId = new Map(tracked.map((workspace) => [workspace.feature.featureId, workspace]))
  byId.set(current.feature.featureId, current)
  return [...byId.values()]
}

function outputMutation(file, workspace, dryRun) {
  validateWorkspace(workspace, { allWorkspaces: allWithCurrent(workspace) })
  if (dryRun) {
    process.stdout.write(`${JSON.stringify(workspace, null, 2)}\n`)
    return
  }
  atomicWriteJson(file, workspace)
  console.log(`Updated ${path.relative(repoRoot, file).replaceAll('\\', '/')}`)
}

function evidence(options) {
  return options.evidence ? options.evidence.split(',').map((item) => item.trim()).filter(Boolean) : []
}

function main() {
  const { command, positional, options } = parseArgs(process.argv.slice(2))
  if (!command || ['help', '--help', '-h'].includes(command)) { process.stdout.write(usage()); return }

  if (command === 'init') {
    if (!positional) throw new Error('init requires a repository-relative output file')
    const file = workspacePath(positional)
    if (fs.existsSync(file)) throw new Error(`refusing to overwrite existing workspace: ${positional}`)
    const workspace = createWorkspaceTemplate({ featureId: required(options, 'feature-id'), title: required(options, 'title'), owner: required(options, 'owner'), target: options.target ?? 'DEV_TOOLING', version: options.version ?? '1.0.0' })
    if (options['dry-run']) process.stdout.write(`${JSON.stringify(workspace, null, 2)}\n`)
    else { atomicWriteJson(file, workspace); console.log(`Initialized ${positional}`) }
    return
  }

  if (command === 'validate-all') {
    const result = validateAllTrackedWorkspaces()
    console.log(`Aionis orchestrator validation passed: ${result.count} tracked synthetic workspaces.`)
    return
  }

  if (!positional) throw new Error(`${command} requires a workspace path`)
  const { file, workspace } = loadWorkspace(positional)
  const workspaces = allWithCurrent(workspace)

  if (command === 'validate') {
    const result = validateWorkspace(workspace, { allWorkspaces: workspaces })
    console.log(`Valid ${result.featureId}@${result.artifactVersion}`)
  } else if (command === 'assign') {
    outputMutation(file, addAssignment(workspace, readJson(payloadPath(required(options, 'payload')))), options['dry-run'])
  } else if (command === 'collisions') {
    const collisions = findOwnershipCollisions(workspace)
    process.stdout.write(`${JSON.stringify({ collisions, blocking: collisions.filter((item) => !item.permitted) }, null, 2)}\n`)
    if (collisions.some((item) => !item.permitted)) process.exitCode = 1
  } else if (command === 'advance') {
    const rollbackTarget = options['rollback-release'] || options['rollback-version']
      ? { releaseId: required(options, 'rollback-release'), restoreVersion: required(options, 'rollback-version') }
      : null
    const result = advanceLifecycle(workspace, { to: required(options, 'to'), actor: required(options, 'actor'), reason: required(options, 'reason'), evidenceReferences: evidence(options), rollbackTarget })
    outputMutation(file, result.workspace, options['dry-run'])
    if (!result.accepted) { console.error(result.error); process.exitCode = 1 }
  } else if (command === 'fail-gate') {
    const next = recordFailedGate(workspace, { gate: required(options, 'gate'), returnTo: required(options, 'return-to'), actor: required(options, 'actor'), reason: required(options, 'reason'), evidenceReferences: evidence(options) })
    outputMutation(file, next, options['dry-run'])
  } else if (command === 'set-version') {
    const next = setArtifactVersion(workspace, { version: required(options, 'version'), actor: required(options, 'actor'), reason: required(options, 'reason') })
    outputMutation(file, next, options['dry-run'])
  } else if (command === 'handoff-create') {
    const next = createHandoff(workspace, readJson(payloadPath(required(options, 'payload'))), { actor: required(options, 'actor') })
    outputMutation(file, next, options['dry-run'])
  } else if (command === 'handoff-decide') {
    const next = decideHandoff(workspace, { handoffId: required(options, 'handoff-id'), actor: required(options, 'actor'), decision: required(options, 'decision'), reason: options.reason ?? null })
    outputMutation(file, next, options['dry-run'])
  } else if (command === 'gates') {
    const report = readinessReport(workspace, workspaces)
    process.stdout.write(`${JSON.stringify({ featureId: report.featureId, requiredGates: workspace.feature.requiredGates, missingOrStaleApprovals: report.missingOrStaleApprovals, failedGates: report.failedGates }, null, 2)}\n`)
    if (report.missingOrStaleApprovals.length || report.failedGates.length) process.exitCode = 1
  } else if (command === 'readiness') {
    const report = readinessReport(workspace, workspaces)
    process.stdout.write(options.json ? `${JSON.stringify(report, null, 2)}\n` : formatReadiness(report))
    if (!report.integrationAllowed) process.exitCode = 1
  } else throw new Error(`unknown command: ${command}\n\n${usage()}`)
}

try { main() }
catch (error) {
  console.error(`Aionis orchestrator error: ${error.message}`)
  process.exitCode = 1
}

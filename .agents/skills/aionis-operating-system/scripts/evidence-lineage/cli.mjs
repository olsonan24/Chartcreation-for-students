#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FIXTURE_ROOT,
  SyntheticFixtureRepository,
  buildReproductionPlan,
  calculateDigest,
  compareReproduction,
  formatLineageReport,
  normalizeRepositoryPath,
  registerComponent,
  resolveSupersession,
  resolveRepositoryPath,
  traceAncestors,
  validateEvidenceRecord,
  validateGenerationManifest,
  validateLineageGraph,
  validateRollbackPlan,
  validateStore,
  verifyDigest,
} from './core.mjs'

const defaultStorePath = `${FIXTURE_ROOT}/synthetic-lineage-store.json`

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv
  const options = {}
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token.startsWith('--')) throw new Error(`unexpected argument: ${token}`)
    const key = token.slice(2)
    if (['accept', 'json'].includes(key)) options[key] = true
    else {
      const value = rest[index + 1]
      if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value`)
      options[key] = value
      index += 1
    }
  }
  return { command, options }
}

function required(options, key) {
  if (!options[key]) throw new Error(`--${key} is required`)
  return options[key]
}

function readRepoJson(relativePath) {
  const normalized = normalizeRepositoryPath(relativePath)
  const file = resolveRepositoryPath(normalized)
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`repository input does not exist: ${normalized}`)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { throw new Error(`repository input is not valid JSON: ${normalized}`) }
}

function loadStore(options) {
  return readRepoJson(options.store ?? defaultStorePath)
}

function print(value, options) {
  if (typeof value === 'string' && !options.json) process.stdout.write(value.endsWith('\n') ? value : `${value}\n`)
  else process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

const help = `Aionis evidence-lineage development CLI

Commands:
  validate-all [--store <repo-relative.json>]
  digest --input <repo-relative.json>
  verify-digest --input <repo-relative.json> --digest <sha256:c14n-json-v1:...>
  validate-evidence --record <repo-relative.json> [--id <evidence-id>] [--content <repo-relative.json>]
  register-component --store <fixture-store.json> --component <repo-relative.json> [--accept]
  validate-lineage [--store <repo-relative.json>]
  trace-ancestors --id <node-id> [--store <repo-relative.json>] [--json]
  validate-manifest --id <manifest-id> [--store <repo-relative.json>]
  reproduction-plan --artifact <id> --version <exact-version> [--store <repo-relative.json>]
  compare --artifact <id> --version <exact-version> --actual <repo-relative.json> [--store <repo-relative.json>]
  resolve-supersession --id <record-id> [--store <repo-relative.json>]
  validate-rollback --id <rollback-plan-id> [--store <repo-relative.json>]

All file paths must be repository-relative. Mutation is dry-run by default; --accept
writes only a validated synthetic fixture store under ${FIXTURE_ROOT} using atomic replacement.
`

export function run(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv)
  if (command === 'help' || command === '--help' || command === '-h') { print(help, options); return 0 }
  if (command === 'validate-all') { print(validateStore(loadStore(options), { syntheticFixture: (options.store ?? defaultStorePath).startsWith(`${FIXTURE_ROOT}/`) }), options); return 0 }
  if (command === 'digest') { print({ digest: calculateDigest(readRepoJson(required(options, 'input'))) }, options); return 0 }
  if (command === 'verify-digest') {
    const valid = verifyDigest(readRepoJson(required(options, 'input')), required(options, 'digest'))
    print({ valid }, options)
    return valid ? 0 : 2
  }
  if (command === 'validate-evidence') {
    const loaded = readRepoJson(required(options, 'record'))
    const selected = loaded.evidence ? loaded.evidence.find((entry) => entry.record?.evidenceId === required(options, 'id')) : loaded
    if (!selected) throw new Error(`evidence ID does not resolve: ${options.id}`)
    const record = selected.record ?? selected
    const content = options.content ? readRepoJson(options.content) : selected.content
    if (content === undefined) throw new Error('evidence content is required through --content or the record entry')
    print(validateEvidenceRecord(record, content), options)
    return 0
  }
  if (command === 'register-component') {
    const storePath = required(options, 'store')
    const store = readRepoJson(storePath)
    const component = readRepoJson(required(options, 'component'))
    const result = registerComponent(store, component)
    validateStore(result.store, { syntheticFixture: storePath.startsWith(`${FIXTURE_ROOT}/`) })
    if (options.accept && result.registered) new SyntheticFixtureRepository(storePath).writeAccepted(result.store)
    print({ registered: result.registered, idempotent: result.idempotent, acceptedWrite: Boolean(options.accept && result.registered) }, options)
    return 0
  }
  const store = loadStore(options)
  if (command === 'validate-lineage') { print(validateLineageGraph(store), options); return 0 }
  if (command === 'trace-ancestors') {
    const report = traceAncestors(store, required(options, 'id'))
    print(options.json ? report : formatLineageReport(report), options)
    return 0
  }
  if (command === 'validate-manifest') {
    const manifest = store.manifests.find((item) => item.manifestId === required(options, 'id'))
    if (!manifest) throw new Error(`manifest ID does not resolve: ${options.id}`)
    print(validateGenerationManifest(store, manifest), options)
    return 0
  }
  if (command === 'reproduction-plan') { print(buildReproductionPlan(store, required(options, 'artifact'), required(options, 'version')), options); return 0 }
  if (command === 'compare') {
    const result = compareReproduction(store, required(options, 'artifact'), required(options, 'version'), readRepoJson(required(options, 'actual')))
    print(result, options)
    return result.accepted ? 0 : 2
  }
  if (command === 'resolve-supersession') { print(resolveSupersession(store, required(options, 'id')), options); return 0 }
  if (command === 'validate-rollback') {
    const plan = store.rollbackPlans.find((item) => item.rollbackPlanId === required(options, 'id'))
    if (!plan) throw new Error(`rollback plan ID does not resolve: ${options.id}`)
    print(validateRollbackPlan(store, plan), options)
    return 0
  }
  throw new Error(`unknown evidence-lineage command: ${command}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = run() }
  catch (error) {
    process.stderr.write(`Evidence-lineage command failed: ${error.message}\n`)
    process.exitCode = 1
  }
}

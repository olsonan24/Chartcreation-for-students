import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { repoRoot } from '../orchestrator/core.mjs'

const cli = path.join(repoRoot, '.agents/skills/aionis-operating-system/scripts/evidence-lineage/cli.mjs')
const fixture = 'docs/aionis-operating-system/evidence-lineage/fixtures/synthetic-lineage-store.json'
const golden = 'docs/aionis-operating-system/evidence-lineage/fixtures/golden-digests.json'

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: repoRoot, encoding: 'utf8' })
}

test('CLI validates all tracked synthetic fixtures', () => {
  const result = run(['validate-all'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /"valid": true/)
})

test('CLI validates a selected canonical evidence record', () => {
  const result = run(['validate-evidence', '--record', fixture, '--id', 'synthetic-evidence-source-v1'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /synthetic-evidence-source-v1/)
})

test('CLI emits canonical digest JSON', () => {
  const result = run(['digest', '--input', golden])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /sha256:c14n-json-v1:/)
})

test('CLI traces ancestors in human and JSON forms', () => {
  const human = run(['trace-ancestors', '--id', 'synthetic-conclusion@2.0.0'])
  const json = run(['trace-ancestors', '--id', 'synthetic-conclusion@2.0.0', '--json'])
  assert.equal(human.status, 0, human.stderr)
  assert.match(human.stdout, /Supporting evidence/)
  assert.equal(json.status, 0, json.stderr)
  assert.equal(JSON.parse(json.stdout).startId, 'synthetic-conclusion@2.0.0')
})

test('CLI returns nonzero for invalid digest and unknown rollback ID', () => {
  const digest = run(['verify-digest', '--input', golden, '--digest', 'sha256:c14n-json-v1:0000000000000000000000000000000000000000000000000000000000000000'])
  const rollback = run(['validate-rollback', '--id', 'synthetic-missing'])
  assert.equal(digest.status, 2)
  assert.equal(rollback.status, 1)
  assert.match(rollback.stderr, /does not resolve/)
})

test('CLI refuses repository path escapes without changing fixture bytes', () => {
  const before = fs.readFileSync(path.join(repoRoot, fixture))
  const result = run(['digest', '--input', '../outside.json'])
  const after = fs.readFileSync(path.join(repoRoot, fixture))
  assert.equal(result.status, 1)
  assert.match(result.stderr, /escapes|outside/)
  assert.deepEqual(after, before)
})

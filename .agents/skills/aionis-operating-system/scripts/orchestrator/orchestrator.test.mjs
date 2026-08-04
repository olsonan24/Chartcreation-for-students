import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  addAssignment,
  advanceLifecycle,
  approvalResult,
  assertNoPrivateData,
  createHandoff,
  createWorkspaceTemplate,
  decideHandoff,
  dependencyReport,
  findOwnershipCollisions,
  loadTrackedWorkspaces,
  normalizeRepoPath,
  readinessReport,
  recordFailedGate,
  repoRoot,
  setArtifactVersion,
  validateAllTrackedWorkspaces,
  validateWorkspace,
} from './core.mjs'

const fixtureDir = path.join(repoRoot, 'docs/aionis-operating-system/orchestrator/features')
const cliPath = path.join(repoRoot, '.agents/skills/aionis-operating-system/scripts/orchestrator/cli.mjs')
const now = '2026-08-04T12:00:00Z'

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8'))
}

function ready() { return fixture('synthetic-ready-feature.json') }
function foundation() { return fixture('synthetic-foundation.json') }
function blocked() { return fixture('synthetic-blocked-feature.json') }
function tracked() { return [foundation(), ready(), blocked()] }

function assignment(agentId, allowedPaths) {
  return {
    agentId, version: '1.0.0', featureId: 'SYNTHETIC-ready-feature', artifactVersion: '2.0.0',
    purpose: 'Synthetic collision assignment', target: 'DEV_TOOLING', owner: `${agentId}-owner`,
    requiredInputs: ['synthetic-input'], requiredOutputs: ['synthetic-output'], allowedPaths,
    prohibitedPaths: ['lib/numerology.ts'], allowedTools: ['node'], dependencies: [], requiredChecks: ['synthetic-check'],
    currentGate: 'CODE_GATE', handoffRecipient: 'synthetic-integration-owner', approvalReferences: ['synthetic-ready-code-approval'],
    mayDeploy: false, mayModifyFormulas: false, mayModifyConstitutionalMethodology: false, mayAccessPrivateUserInformation: false,
    integrationContractId: null,
  }
}

function handoff(overrides = {}) {
  return {
    handoffId: 'synthetic-new-handoff', producer: 'synthetic-producer', consumer: 'synthetic-consumer',
    artifactId: 'SYNTHETIC-ready-feature', artifactVersion: '2.0.0', outputReferences: ['synthetic-output'],
    checksCompleted: ['synthetic-check'], knownRisks: [], openQuestions: [], acceptanceStatus: 'PENDING',
    acceptedAt: null, rejectionReason: null, createdAt: now, ...overrides,
  }
}

test('valid feature initialization uses canonical draft state and merged contract shape', () => {
  const workspace = createWorkspaceTemplate({ featureId: 'SYNTHETIC-init', title: 'Synthetic initialization', owner: 'synthetic-owner', now })
  assert.equal(workspace.feature.status, 'DRAFT')
  assert.equal(workspace.feature.target, 'DEV_TOOLING')
  assert.equal(workspace.history.artifactVersions.length, 1)
})

test('invalid feature contract is rejected', () => {
  const workspace = ready()
  delete workspace.feature.analytics
  assert.throws(() => validateWorkspace(workspace, { allWorkspaces: tracked(), now }), /feature contract is invalid/)
})

test('tracked synthetic workspaces validate together', () => {
  assert.equal(validateAllTrackedWorkspaces(fixtureDir, now).count, 3)
})

test('orchestrator evidence-lineage artifact references resolve exact IDs and versions', () => {
  const workspaces = tracked()
  const workspace = workspaces.find((item) => item.feature.featureId === 'SYNTHETIC-ready-feature')
  assert.doesNotThrow(() => validateWorkspace(workspace, { allWorkspaces: workspaces, now }))
  const broken = structuredClone(workspace)
  broken.evidenceLineageReferences.manifestIds.push('synthetic-missing-manifest')
  assert.throws(() => validateWorkspace(broken, { allWorkspaces: workspaces.map((item) => item.feature.featureId === broken.feature.featureId ? broken : item), now }), /unresolved evidence-lineage manifestIds reference/)
})

test('legal lifecycle transition records append-only evidence', () => {
  const workspace = ready()
  workspace.feature.status = 'STAGED'
  workspace.feature.requiredGates = ['RELEASE_GATE']
  workspace.approvals.push({ approvalId: 'synthetic-release-approval', artifactId: workspace.feature.featureId, artifactVersion: workspace.feature.version, scope: 'Synthetic release fixture', gate: 'RELEASE_GATE', approver: { approvedActorReference: 'synthetic-human-reviewer' }, timestamp: now, decision: 'APPROVED', conditions: [], evidenceReferences: ['synthetic-release-evidence'], invalidatedAt: null, invalidationReason: null })
  const result = advanceLifecycle(workspace, { to: 'RELEASE_APPROVED', actor: 'synthetic-owner', reason: 'Release evidence accepted', evidenceReferences: ['synthetic-release-evidence'], now })
  assert.equal(result.accepted, true)
  assert.equal(result.workspace.history.transitions.at(-1).requiredApproval, 'synthetic-release-approval')
})

test('illegal lifecycle transition is rejected and preserved in failed history', () => {
  const workspace = ready()
  workspace.feature.status = 'DRAFT'
  const result = advanceLifecycle(workspace, { to: 'RELEASED', actor: 'synthetic-owner', reason: 'Exercise rejection', now })
  assert.equal(result.accepted, false)
  assert.equal(result.workspace.feature.status, 'DRAFT')
  assert.match(result.error, /illegal lifecycle transition/)
  assert.equal(result.workspace.history.failedTransitions.at(-1).attemptedState, 'RELEASED')
})

test('failed gate returns to documented earlier state without silent advance', () => {
  const workspace = ready()
  workspace.feature.status = 'CODE_APPROVED'
  const next = recordFailedGate(workspace, { gate: 'CODE_GATE', returnTo: 'BUILDING', actor: 'synthetic-reviewer', reason: 'Synthetic check failed', evidenceReferences: ['synthetic-failure-evidence'], now })
  assert.equal(next.feature.status, 'BUILDING')
  assert.equal(next.feature.failedGateHistory.at(-1).returnedToState, 'BUILDING')
  assert.equal(next.gateState.failedGates.at(-1).gate, 'CODE_GATE')
})

test('a later approved gate resolves the active blocker without erasing failure history', () => {
  const workspace = ready()
  workspace.feature.status = 'CODE_APPROVED'
  const returned = recordFailedGate(workspace, { gate: 'CODE_GATE', returnTo: 'BUILDING', actor: 'synthetic-reviewer', reason: 'Synthetic check failed', evidenceReferences: ['synthetic-failure-evidence'], now })
  const advanced = advanceLifecycle(returned, { to: 'CODE_APPROVED', actor: 'synthetic-reviewer', reason: 'Synthetic check corrected', evidenceReferences: ['synthetic-correction-evidence'], now: '2026-08-04T13:00:00Z' })
  assert.equal(advanced.accepted, true)
  assert.equal(advanced.workspace.gateState.failedGates[0].resolvedAt, '2026-08-04T13:00:00Z')
  assert.equal(advanced.workspace.feature.failedGateHistory.length, 1)
})

test('illegal failed-gate return is rejected', () => {
  assert.throws(() => recordFailedGate(ready(), { gate: 'RELEASE_GATE', returnTo: 'DRAFT', actor: 'synthetic-reviewer', reason: 'Invalid return', now }), /illegal failed-gate return/)
})

test('rollback transition preserves release identity and rollback history', () => {
  const workspace = ready()
  workspace.feature.status = 'RELEASED'
  const result = advanceLifecycle(workspace, { to: 'ROLLED_BACK', actor: 'synthetic-owner', reason: 'Synthetic emergency rollback', rollbackTarget: { releaseId: 'synthetic-release', restoreVersion: '1.0.0' }, now })
  assert.equal(result.accepted, true)
  assert.equal(result.workspace.feature.rollbackIdentity.restoreVersion, '1.0.0')
  assert.equal(result.workspace.history.rollbacks.at(-1).releaseId, 'synthetic-release')
})

test('exact-file ownership collision is detected', () => {
  const workspace = ready()
  workspace.assignments = [assignment('synthetic-a', ['synthetic/file.mjs']), assignment('synthetic-b', ['synthetic/file.mjs'])]
  assert.equal(findOwnershipCollisions(workspace)[0].kind, 'EXACT_FILE')
})

test('parent-child ownership collision is detected', () => {
  const workspace = ready()
  workspace.assignments = [assignment('synthetic-a', ['synthetic/area']), assignment('synthetic-b', ['synthetic/area/file.mjs'])]
  assert.equal(findOwnershipCollisions(workspace)[0].kind, 'PARENT_CHILD')
})

test('incompatible glob ownership collision is detected', () => {
  const workspace = ready()
  workspace.assignments = [assignment('synthetic-a', ['synthetic/area/**']), assignment('synthetic-b', ['synthetic/area/tests/**'])]
  assert.equal(findOwnershipCollisions(workspace)[0].kind, 'GLOB_OR_DIRECTORY')
})

test('non-overlapping assignments are parallel safe', () => {
  const workspace = ready()
  workspace.assignments = [assignment('synthetic-a', ['synthetic/a/**']), assignment('synthetic-b', ['synthetic/b/**'])]
  assert.deepEqual(findOwnershipCollisions(workspace), [])
})

test('approved integration overlap identifies the integration owner', () => {
  const workspace = ready()
  workspace.assignments = [assignment('synthetic-a', ['synthetic/shared/**']), assignment('synthetic-b', ['synthetic/shared/file.mjs'])]
  workspace.integrationContracts = [{ integrationContractId: 'synthetic-integration', participants: ['synthetic-a', 'synthetic-b'], overlapPaths: ['synthetic/shared/**'], integrationOwner: 'synthetic-integrator', mergeOrder: ['synthetic-a', 'synthetic-b'], verificationOwner: 'synthetic-verifier' }]
  workspace.assignments.forEach((item) => { item.integrationContractId = 'synthetic-integration' })
  const result = findOwnershipCollisions(workspace)[0]
  assert.equal(result.permitted, true)
  assert.equal(result.integrationOwner, 'synthetic-integrator')
})

test('missing dependency IDs are reported', () => {
  const workspace = ready()
  workspace.implementationPlan.dependencies = [{ featureId: 'SYNTHETIC-missing', type: 'HARD', requiredArtifactVersion: '1.0.0' }]
  assert.equal(dependencyReport([workspace]).missing[0].dependencyId, 'SYNTHETIC-missing')
})

test('hard dependency cycles are rejected deterministically', () => {
  const a = foundation(); const b = ready()
  a.implementationPlan.dependencies = [{ featureId: b.feature.featureId, type: 'HARD', requiredArtifactVersion: b.feature.version }]
  b.implementationPlan.dependencies = [{ featureId: a.feature.featureId, type: 'HARD', requiredArtifactVersion: a.feature.version }]
  assert.ok(dependencyReport([a, b]).cycles.length > 0)
})

test('incomplete hard dependency blocks while soft dependency remains informational', () => {
  const upstream = foundation(); upstream.feature.status = 'BUILDING'
  const hard = ready()
  const soft = blocked(); soft.implementationPlan.dependencies = [{ featureId: upstream.feature.featureId, type: 'SOFT', requiredArtifactVersion: upstream.feature.version }]
  const report = dependencyReport([upstream, hard, soft])
  assert.equal(report.blocked.length, 1)
  assert.equal(report.soft.length, 1)
})

test('producer creates a pending handoff but cannot accept it', () => {
  const workspace = ready(); workspace.handoffs = []
  const created = createHandoff(workspace, handoff(), { actor: 'synthetic-producer', now })
  assert.equal(created.handoffs[0].acceptanceStatus, 'PENDING')
  assert.throws(() => decideHandoff(created, { handoffId: 'synthetic-new-handoff', actor: 'synthetic-producer', decision: 'ACCEPTED', now }), /only the named consumer/)
})

test('consumer acceptance records acceptance time', () => {
  const workspace = ready(); workspace.handoffs = [handoff()]
  const next = decideHandoff(workspace, { handoffId: 'synthetic-new-handoff', actor: 'synthetic-consumer', decision: 'ACCEPTED', now })
  assert.equal(next.handoffs[0].acceptedAt, now)
  assert.equal(next.history.handoffs.at(-1).event, 'HANDOFF_ACCEPTED')
})

test('consumer rejection records reason without acceptance time', () => {
  const workspace = ready(); workspace.handoffs = [handoff()]
  const next = decideHandoff(workspace, { handoffId: 'synthetic-new-handoff', actor: 'synthetic-consumer', decision: 'REJECTED', reason: 'Synthetic output incomplete', now })
  assert.equal(next.handoffs[0].rejectionReason, 'Synthetic output incomplete')
  assert.equal(next.handoffs[0].acceptedAt, null)
})

test('artifact version change invalidates accepted handoff and approval', () => {
  const next = setArtifactVersion(ready(), { version: '3.0.0', actor: 'synthetic-owner', reason: 'Material synthetic change', now })
  assert.equal(next.handoffs[0].acceptanceStatus, 'INVALIDATED')
  assert.ok(next.approvals.filter((item) => item.artifactVersion === '2.0.0').every((item) => item.invalidatedAt === now))
  assert.equal(next.history.artifactVersions.at(-1).supersedes, '2.0.0')
})

test('missing, stale, invalidated, expired, and wrong-gate approvals fail', () => {
  const workspace = ready()
  assert.equal(approvalResult({ ...workspace, approvals: [] }, 'CODE_GATE', now).passed, false)
  assert.equal(approvalResult({ ...workspace, approvals: workspace.approvals.map((item) => ({ ...item, artifactVersion: '0.0.1' })) }, 'CODE_GATE', now).passed, false)
  assert.equal(approvalResult({ ...workspace, approvals: workspace.approvals.map((item) => ({ ...item, invalidatedAt: now })) }, 'CODE_GATE', now).passed, false)
  assert.equal(approvalResult({ ...workspace, approvalMetadata: [{ approvalId: 'synthetic-ready-code-approval', expiresAt: '2026-01-01T00:00:00Z' }] }, 'CODE_GATE', now).passed, false)
  assert.equal(approvalResult(workspace, 'RELEASE_GATE', now).passed, false)
})

test('current matching approval passes', () => {
  const result = approvalResult(ready(), 'CODE_GATE', now)
  assert.equal(result.passed, true)
  assert.equal(result.approvalId, 'synthetic-ready-code-approval')
})

test('privileged boolean without scoped current approval is rejected', () => {
  const workspace = ready()
  workspace.assignments[0].mayDeploy = true
  assert.throws(() => validateWorkspace(workspace, { allWorkspaces: tracked(), now }), /privileged boolean mayDeploy=true/)
})

test('assignment approval references must resolve to current authorizing records', () => {
  const workspace = ready()
  workspace.assignments[0].approvalReferences = ['synthetic-unknown-approval']
  assert.throws(() => validateWorkspace(workspace, { allWorkspaces: tracked(), now }), /references unknown approval/)
  workspace.assignments[0].approvalReferences = ['synthetic-ready-code-old']
  assert.throws(() => validateWorkspace(workspace, { allWorkspaces: tracked(), now }), /references stale approval/)
})

test('integration-ready fixture is allowed and blocked fixture reports exact blockers', () => {
  const all = tracked()
  const positive = readinessReport(all[1], all, now)
  const negative = readinessReport(all[2], all, now)
  assert.equal(positive.integrationAllowed, true)
  assert.equal(negative.integrationAllowed, false)
  assert.ok(negative.blockers.some((item) => item.includes('hard dependency SYNTHETIC-ready-feature')))
  assert.ok(negative.blockers.some((item) => item.includes('handoff synthetic-blocked-handoff')))
  assert.ok(negative.blockers.some((item) => item.includes('CODE_GATE')))
})

test('secret and private-data fields are rejected', () => {
  assert.throws(() => assertNoPrivateData({ dateOfBirth: 'synthetic-value' }), /prohibited secret\/private-data field/)
  assert.throws(() => assertNoPrivateData({ evidence: ['synthetic.user', 'example.test'].join('@') }), /email address/)
})

test('repository path escapes and absolute paths are rejected', () => {
  assert.throws(() => normalizeRepoPath('../outside.json'), /escapes or is outside/)
  assert.throws(() => normalizeRepoPath('C:\\outside.json'), /repository-relative/)
})

test('repeat-run version update is idempotent', () => {
  const workspace = ready()
  assert.deepEqual(setArtifactVersion(workspace, { version: workspace.feature.version, actor: 'synthetic-owner', reason: 'Repeat run', now }), workspace)
})

test('assignment creation rejects collisions and accepts bounded ownership', () => {
  const workspace = ready()
  assert.doesNotThrow(() => addAssignment(workspace, assignment('synthetic-new-worker', ['synthetic/new/**']), now))
  assert.throws(() => addAssignment(workspace, assignment('synthetic-collision-worker', ['synthetic/ready/state/file.mjs']), now), /ownership collision/)
})

test('CLI returns nonzero for blocked readiness and writes nothing during dry-run init', () => {
  const blockedPath = 'docs/aionis-operating-system/orchestrator/features/synthetic-blocked-feature.json'
  const blockedResult = spawnSync(process.execPath, [cliPath, 'readiness', blockedPath, '--json'], { cwd: repoRoot, encoding: 'utf8' })
  assert.equal(blockedResult.status, 1)
  const dryPath = 'docs/aionis-operating-system/orchestrator/features/synthetic-dry-run-only.json'
  const dryResult = spawnSync(process.execPath, [cliPath, 'init', dryPath, '--feature-id', 'SYNTHETIC-dry-run', '--title', 'Synthetic dry run', '--owner', 'synthetic-owner', '--dry-run'], { cwd: repoRoot, encoding: 'utf8' })
  assert.equal(dryResult.status, 0)
  assert.equal(fs.existsSync(path.join(repoRoot, dryPath)), false)
})

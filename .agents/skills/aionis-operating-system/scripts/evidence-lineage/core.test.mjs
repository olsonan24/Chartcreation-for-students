import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import {
  CANONICALIZATION_VERSION,
  InMemoryEvidenceRepository,
  SyntheticFixtureRepository,
  buildReproductionPlan,
  calculateDigest,
  canonicalize,
  compareReproduction,
  createRollbackHistoryRecord,
  emptyStore,
  formatLineageReport,
  registerComponent,
  resolveSupersession,
  traceAncestors,
  validateComponent,
  validateEvidenceRecord,
  validateGenerationManifest,
  validateLineageGraph,
  validateRollbackPlan,
  validateStore,
  verifyDigest,
} from './core.mjs'
import { repoRoot } from '../orchestrator/core.mjs'

const fixturePath = path.join(repoRoot, 'docs/aionis-operating-system/evidence-lineage/fixtures/synthetic-lineage-store.json')
const goldenPath = path.join(repoRoot, 'docs/aionis-operating-system/evidence-lineage/fixtures/golden-digests.json')
const loadStore = () => JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
const clone = (value) => structuredClone(value)

test('tracked synthetic fixture validates with complete registry and manifest', () => {
  const result = validateStore(loadStore(), { syntheticFixture: true })
  assert.deepEqual(result, { valid: true, evidence: 3, artifacts: 2, components: 15, manifests: 2, relationships: 16 })
})

test('valid immutable evidence is accepted', () => {
  const entry = loadStore().evidence[1]
  assert.equal(validateEvidenceRecord(entry.record, entry.content).valid, true)
})

test('mutable evidence is rejected by the merged contract', () => {
  const entry = clone(loadStore().evidence[1])
  entry.record.immutable = false
  assert.throws(() => validateEvidenceRecord(entry.record, entry.content), /contract is invalid/)
})

test('canonical digest matches fixed golden fixture', () => {
  const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'))
  assert.equal(golden.canonicalizationVersion, CANONICALIZATION_VERSION)
  for (const item of golden.cases) assert.equal(calculateDigest(item.content), item.digest)
})

test('object key ordering does not change canonical digest', () => {
  assert.equal(calculateDigest({ b: 2, a: { z: 3, y: 4 } }), calculateDigest({ a: { y: 4, z: 3 }, b: 2 }))
})

test('meaningful content changes alter canonical digest', () => {
  assert.notEqual(calculateDigest({ value: 1 }), calculateDigest({ value: 2 }))
})

test('tampered evidence content is detected', () => {
  const entry = clone(loadStore().evidence[1])
  entry.content.value = 99
  assert.equal(verifyDigest(entry.content, entry.record.contentDigest), false)
  assert.throws(() => validateEvidenceRecord(entry.record, entry.content), /digest mismatch/)
})

test('unsupported and ambiguous canonical values are rejected', () => {
  assert.throws(() => canonicalize({ value: undefined }), /unsupported undefined/)
  assert.throws(() => canonicalize({ value: Number.NaN }), /non-finite/)
  const sparse = []
  sparse[2] = 'synthetic'
  assert.throws(() => canonicalize(sparse), /sparse array/)
  assert.throws(() => canonicalize(new Date()), /unsupported object type/)
})

test('duplicate evidence IDs are rejected', () => {
  const store = loadStore()
  store.evidence.push(clone(store.evidence[0]))
  assert.throws(() => validateStore(store), /duplicate evidence ID/)
})

test('missing lineage references are rejected', () => {
  const store = loadStore()
  store.lineage.push({ relationshipId: 'synthetic-missing', fromId: 'synthetic-conclusion@2.0.0', toId: 'synthetic-missing-evidence', relationshipType: 'supported-by' })
  assert.throws(() => validateLineageGraph(store), /missing referenced ID/)
})

test('duplicate lineage relationship IDs are rejected', () => {
  const store = loadStore()
  store.lineage.push(clone(store.lineage[0]))
  assert.throws(() => validateLineageGraph(store), /duplicate lineage relationship ID/)
})

test('duplicate lineage node IDs across artifact classes are rejected', () => {
  const store = loadStore()
  store.reproductionResults.push({ reproductionResultId: 'synthetic-generation-manifest-v2', artifactId: 'synthetic-conclusion', artifactVersion: '2.0.0', status: 'accepted', recordedAt: '2026-08-04T03:00:00Z' })
  assert.throws(() => validateLineageGraph(store), /duplicate lineage node ID/)
})

test('supporting and contradictory evidence remain separate in reports', () => {
  const report = traceAncestors(loadStore(), 'synthetic-conclusion@2.0.0')
  assert.deepEqual(report.supportingEvidence, ['synthetic-evidence-source-v1', 'synthetic-evidence-source-v0'])
  assert.deepEqual(report.contradictoryEvidence, ['synthetic-evidence-contradiction-v1'])
  assert.match(formatLineageReport(report), /Supporting evidence: synthetic-evidence-source-v1/)
})

test('generated conclusion self-support is rejected transitively', () => {
  const store = loadStore()
  store.lineage.push({ relationshipId: 'synthetic-self-support', fromId: 'synthetic-evidence-source-v1', toId: 'synthetic-conclusion@2.0.0', relationshipType: 'derived-from' })
  assert.throws(() => validateLineageGraph(store), /generated conclusion .* cannot support itself|lineage cycle/)
})

test('invalid lineage cycles are rejected', () => {
  const store = loadStore()
  store.lineage.push({ relationshipId: 'synthetic-cycle', fromId: 'synthetic-conclusion@1.0.0', toId: 'synthetic-conclusion@2.0.0', relationshipType: 'derived-from' })
  assert.throws(() => validateLineageGraph(store), /lineage cycle/)
})

test('valid append-only supersession chain resolves current effective version', () => {
  const result = resolveSupersession(loadStore(), 'synthetic-conclusion@1.0.0')
  assert.equal(result.currentEffectiveId, 'synthetic-conclusion@2.0.0')
  assert.deepEqual(result.history, ['synthetic-conclusion@1.0.0', 'synthetic-conclusion@2.0.0'])
})

test('invalid supersession cycle is rejected', () => {
  const store = loadStore()
  store.supersessions.push({ supersessionId: 'synthetic-cycle', kind: 'artifact', predecessorId: 'synthetic-conclusion@2.0.0', successorId: 'synthetic-conclusion@1.0.0', reason: 'Synthetic invalid cycle', recordedAt: '2026-08-04T03:00:00Z', negativeKnowledge: { retained: false, reason: null, reconsiderationConditions: [] } })
  assert.throws(() => resolveSupersession(store, 'synthetic-conclusion@1.0.0'), /supersession cycle/)
})

test('supersession fork is rejected', () => {
  const store = loadStore()
  store.supersessions.push({ supersessionId: 'synthetic-fork', kind: 'artifact', predecessorId: 'synthetic-conclusion@1.0.0', successorId: 'synthetic-conclusion@2.0.0', reason: 'Synthetic invalid fork', recordedAt: '2026-08-04T03:00:00Z', negativeKnowledge: { retained: false, reason: null, reconsiderationConditions: [] } })
  assert.throws(() => resolveSupersession(store, 'synthetic-conclusion@1.0.0'), /forks silently/)
})

test('negative knowledge requires reason and reconsideration conditions', () => {
  const store = loadStore()
  store.supersessions[0].negativeKnowledge.reconsiderationConditions = []
  assert.throws(() => resolveSupersession(store, 'synthetic-evidence-source-v0'), /negative knowledge requires/)
})

test('complete version registry contains every result-affecting component role', () => {
  const store = loadStore()
  assert.equal(new Set(store.components.map((item) => item.componentType)).size, 15)
  assert.equal(validateGenerationManifest(store, store.manifests[0]).valid, true)
})

test('missing component version blocks manifest validation', () => {
  const store = loadStore()
  store.components = store.components.filter((item) => item.componentType !== 'prompt')
  assert.throws(() => validateGenerationManifest(store, store.manifests[0]), /missing component version/)
})

test('component registry refuses silent latest versions', () => {
  const component = clone(loadStore().components[0])
  component.version = 'latest'
  assert.throws(() => validateComponent(component), /cannot silently use/)
})

test('component registration is repeat-run idempotent but rejects conflicting versions', () => {
  const store = emptyStore()
  const component = loadStore().components[0]
  const first = registerComponent(store, component)
  assert.equal(first.registered, true)
  const second = registerComponent(first.store, component)
  assert.equal(second.idempotent, true)
  const changed = clone(component)
  changed.provenance.sourceIdentity = 'synthetic-different-registry'
  assert.throws(() => registerComponent(first.store, changed), /different content/)
})

test('valid generation manifest binds artifact, evidence, exact components, budgets, and fallback disclosure', () => {
  const store = loadStore()
  assert.equal(validateGenerationManifest(store, store.manifests[0]).manifestId, 'synthetic-generation-manifest-v2')
})

test('missing prompt version is rejected', () => {
  const store = loadStore()
  store.manifests[0].manifest.promptVersion = ''
  assert.throws(() => validateGenerationManifest(store, store.manifests[0]), /contract is invalid/)
})

test('missing generation-manifest evidence ID is rejected', () => {
  const store = loadStore()
  store.manifests[0].manifest.evidenceIds.push('synthetic-missing-evidence')
  assert.throws(() => validateGenerationManifest(store, store.manifests[0]), /missing evidence ID/)
})

test('fallback use requires exact identity and disclosure', () => {
  const store = loadStore()
  store.manifests[0].manifest.fallback = { used: true, provider: null, exactModelId: null, disclosure: '' }
  assert.throws(() => validateGenerationManifest(store, store.manifests[0]), /contract is invalid/)
})

test('deterministic reproduction succeeds only on exact normalized output equality', () => {
  const store = loadStore()
  assert.equal(buildReproductionPlan(store, 'synthetic-conclusion', '2.0.0').exactReproductionExpected, true)
  assert.equal(compareReproduction(store, 'synthetic-conclusion', '2.0.0', { score: 8, label: 'synthetic-current' }).accepted, true)
  assert.equal(compareReproduction(store, 'synthetic-conclusion', '2.0.0', { score: 8, label: 'synthetic-changed' }).accepted, false)
})

test('stochastic reproduction requires an explicit versioned acceptance policy', () => {
  const store = loadStore()
  store.manifests[0].determinism = { kind: 'stochastic', acceptancePolicyVersion: null }
  assert.throws(() => validateGenerationManifest(store, store.manifests[0]), /versioned acceptance policy/)
})

test('stochastic reproduction compares only approved measurable properties', () => {
  const store = loadStore()
  store.manifests[0].determinism = { kind: 'stochastic', acceptancePolicyVersion: '1.0.0' }
  store.manifests[0].manifest.acceptancePolicy.comparisonMethod = 'normalized-exact'
  const accepted = compareReproduction(store, 'synthetic-conclusion', '2.0.0', { score: 8.5, label: 'synthetic-current', unreviewed: 'ignored' })
  const rejected = compareReproduction(store, 'synthetic-conclusion', '2.0.0', { score: 10, label: 'synthetic-current' })
  assert.equal(accepted.accepted, true)
  assert.equal(rejected.accepted, false)
  assert.equal(accepted.variances.length, 2)
})

test('reproduction is blocked by a missing component with exact reasons', () => {
  const store = loadStore()
  store.components = store.components.filter((item) => item.componentType !== 'prompt')
  const plan = buildReproductionPlan(store, 'synthetic-conclusion', '2.0.0')
  assert.equal(plan.possible, false)
  assert.ok(plan.reasons.some((reason) => reason.includes('missing component version')))
})

test('reproduction is blocked by evidence digest mismatch', () => {
  const store = loadStore()
  store.evidence[1].content.value = 70
  const plan = buildReproductionPlan(store, 'synthetic-conclusion', '2.0.0')
  assert.equal(plan.possible, false)
  assert.ok(plan.reasons.some((reason) => reason.includes('digest mismatch')))
})

test('valid rollback plan identifies failed and prior known-good exact versions', () => {
  const store = loadStore()
  const result = validateRollbackPlan(store, store.rollbackPlans[0])
  assert.equal(result.failedKey, 'synthetic-conclusion@2.0.0')
  assert.equal(result.restoredKey, 'synthetic-conclusion@1.0.0')
})

test('rollback without current approval is rejected', () => {
  const store = loadStore()
  store.approvals = []
  assert.throws(() => validateRollbackPlan(store, store.rollbackPlans[0]), /current approved approval/)
})

test('rollback history preserves both failed and restored artifacts', () => {
  const store = loadStore()
  const record = createRollbackHistoryRecord(store, store.rollbackPlans[0], { historyId: 'synthetic-new-history', recordedAt: '2026-08-04T03:00:00Z' })
  assert.equal(record.failedArtifact, 'synthetic-conclusion@2.0.0')
  assert.equal(record.restoredArtifact, 'synthetic-conclusion@1.0.0')
  assert.doesNotThrow(() => validateStore(store))
})

test('cross-tenant evidence linking is rejected', () => {
  const store = loadStore()
  store.evidence[2].record.tenantScope = 'synthetic-tenant-beta'
  assert.throws(() => validateLineageGraph(store), /crosses tenant scope/)
})

test('private evidence cannot route to DEV_TOOLING', () => {
  const entry = clone(loadStore().evidence[1])
  entry.record.target = 'DEV_TOOLING'
  entry.record.knowledgePlane = 'personal'
  entry.record.classification = 'restricted'
  assert.throws(() => validateEvidenceRecord(entry.record, entry.content), /cannot route to DEV_TOOLING/)
})

test('secrets are rejected without echoing their value', () => {
  const entry = clone(loadStore().evidence[1])
  entry.content = { password: 'synthetic-do-not-log' }
  entry.record.contentDigest = calculateDigest(entry.content)
  assert.throws(() => validateEvidenceRecord(entry.record, entry.content), /prohibited secret\/private-data field/)
})

test('tracked fixtures reject non-synthetic identities and private-data fields', () => {
  const store = loadStore()
  store.evidence[0].record.provenance.actorIdentity = 'fixture-actor'
  assert.throws(() => validateStore(store, { syntheticFixture: true }), /clearly synthetic identities/)
  const privateStore = loadStore()
  privateStore.evidence[0].content = { profileText: 'synthetic private fixture' }
  privateStore.evidence[0].record.contentDigest = calculateDigest(privateStore.evidence[0].content)
  assert.throws(() => validateStore(privateStore, { syntheticFixture: true }), /prohibited secret\/private-data field/)
})

test('in-memory adapter is immutable and idempotent for exact repeat acceptance', () => {
  const entry = loadStore().evidence[1]
  const repository = new InMemoryEvidenceRepository()
  assert.equal(repository.acceptEvidence(entry).accepted, true)
  assert.equal(repository.acceptEvidence(entry).idempotent, true)
  const changed = clone(entry)
  changed.content.value = 8
  changed.record.contentDigest = calculateDigest(changed.content)
  assert.throws(() => repository.acceptEvidence(changed), /immutable/)
})

test('accepted and superseded generated artifacts retain immutable manifests', () => {
  const store = loadStore()
  assert.ok(store.artifacts.every((artifact) => artifact.generationManifestId))
  assert.ok(store.artifacts.every((artifact) => store.manifests.some((manifest) => manifest.manifestId === artifact.generationManifestId)))
  const repository = new InMemoryEvidenceRepository()
  const artifact = store.artifacts[1]
  assert.equal(repository.acceptArtifact(artifact).accepted, true)
  assert.equal(repository.acceptArtifact(artifact).idempotent, true)
  const changed = clone(artifact)
  changed.content.score = 9
  changed.contentDigest = calculateDigest(changed.content)
  assert.throws(() => repository.acceptArtifact(changed), /immutable/)
})

test('accepted generated artifact without historical manifest identity is rejected', () => {
  const artifact = clone(loadStore().artifacts[0])
  artifact.generationManifestId = null
  assert.throws(() => new InMemoryEvidenceRepository().acceptArtifact(artifact), /requires its manifest/)
})

test('fixture adapter refuses repository path escapes', () => {
  assert.throws(() => new SyntheticFixtureRepository('../outside.json'), /escapes|outside/)
  assert.throws(() => new SyntheticFixtureRepository('docs/elsewhere.json'), /must remain under/)
})

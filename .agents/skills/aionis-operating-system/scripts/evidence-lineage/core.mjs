import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

export const DIGEST_ALGORITHM = 'sha256'
export const CANONICALIZATION_VERSION = 'c14n-json-v1'
export const DIGEST_PREFIX = `${DIGEST_ALGORITHM}:${CANONICALIZATION_VERSION}:`
export const FIXTURE_ROOT = 'docs/aionis-operating-system/evidence-lineage/fixtures'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(moduleDir, '../../../../..')
const require = createRequire(import.meta.url)
const workboxRequire = createRequire(require.resolve('workbox-build/package.json'))
const Ajv2020 = workboxRequire('ajv/dist/2020').default

const contractPaths = {
  evidence: path.join(repoRoot, 'docs/aionis-operating-system/schemas/evidence-record.schema.json'),
  generation: path.join(repoRoot, 'docs/aionis-operating-system/schemas/generation-manifest.schema.json'),
  approval: path.join(repoRoot, 'docs/aionis-operating-system/schemas/approval-record.schema.json'),
  release: path.join(repoRoot, 'docs/aionis-operating-system/schemas/release-manifest.schema.json'),
}

const componentTypes = Object.freeze([
  'calculation-engine', 'formula-baseline', 'constitution', 'rule-set', 'modifier-set',
  'synthesis-engine', 'prompt', 'model-provider', 'model-identity', 'model-configuration',
  'knowledge-snapshot', 'canonicalization-algorithm', 'evidence-schema',
  'generation-manifest-schema', 'release',
])

const requiredComponentRoles = new Set(componentTypes)
const ancestryRelationships = new Set([
  'supported-by', 'contradicted-by', 'derived-from', 'calculated-with', 'uses-rule',
  'uses-modifier', 'uses-prompt', 'uses-constitution', 'uses-synthesis', 'manifested-by',
  'approved-by', 'released-by', 'supersedes', 'rollback-of', 'restores',
])

const privateKeys = new Set([
  'name', 'fullname', 'calledname', 'dateofbirth', 'dob', 'profile', 'profiletext',
  'email', 'password', 'credential', 'credentials', 'secret', 'token', 'accesstoken',
  'refreshtoken', 'apikey', 'servicerolekey', 'databasepassword',
])

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/i, 'database credential'],
  [/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/, 'JWT'],
  [/\b\d{2}\/\d{2}\/\d{4}\b/, 'DOB-like value'],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, 'email address'],
]

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function normalizeRepositoryPath(input) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('repository path must be a non-empty string')
  const normalized = input.trim().replaceAll('\\', '/')
  if (path.posix.isAbsolute(normalized) || /^[a-zA-Z]:/.test(normalized)) throw new Error(`path must be repository-relative: ${input}`)
  const segments = normalized.split('/')
  if (segments.includes('..') || segments.includes('.git') || segments.includes('')) throw new Error(`path escapes or is outside the repository: ${input}`)
  return normalized.replace(/^\.\//, '').replace(/\/$/, '')
}

export function resolveRepositoryPath(input) {
  const normalized = normalizeRepositoryPath(input)
  const resolved = path.resolve(repoRoot, normalized)
  const relative = path.relative(repoRoot, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`path escapes or is outside the repository: ${input}`)
  return resolved
}

function atomicWriteJson(file, data) {
  const resolved = path.resolve(file)
  const relative = path.relative(repoRoot, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`refusing to write outside repository: ${file}`)
  fs.mkdirSync(path.dirname(resolved), { recursive: true })
  const temporary = `${resolved}.${process.pid}.${Date.now()}.tmp`
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
    fs.renameSync(temporary, resolved)
  } finally { if (fs.existsSync(temporary)) fs.rmSync(temporary) }
}

function createValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  ajv.addFormat('date-time', (value) => typeof value === 'string' && /T/.test(value) && !Number.isNaN(Date.parse(value)))
  const compiled = Object.fromEntries(Object.entries(contractPaths).map(([key, file]) => [key, ajv.compile(readJson(file))]))
  return { ajv, compiled }
}

let validatorCache
function validators() {
  validatorCache ||= createValidators()
  return validatorCache
}

function assertContract(label, type, value) {
  const { ajv, compiled } = validators()
  if (!compiled[type](value)) throw new Error(`${label} contract is invalid: ${ajv.errorsText(compiled[type].errors, { separator: '; ' })}`)
}

function assertJsonString(value, location) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error(`${location} contains an unpaired Unicode surrogate`)
      index += 1
    } else if (code >= 0xdc00 && code <= 0xdfff) throw new Error(`${location} contains an unpaired Unicode surrogate`)
  }
}

export function canonicalize(value) {
  const active = new Set()
  const visit = (item, location) => {
    if (item === null) return 'null'
    if (typeof item === 'string') { assertJsonString(item, location); return JSON.stringify(item) }
    if (typeof item === 'boolean') return item ? 'true' : 'false'
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) throw new Error(`${location} contains a non-finite number`)
      return Object.is(item, -0) ? '0' : JSON.stringify(item)
    }
    if (typeof item !== 'object') throw new Error(`${location} contains unsupported ${typeof item}`)
    if (active.has(item)) throw new Error(`${location} contains a cyclic value`)
    active.add(item)
    try {
      if (Array.isArray(item)) {
        for (let index = 0; index < item.length; index += 1) if (!Object.hasOwn(item, index)) throw new Error(`${location} contains a sparse array`)
        return `[${item.map((entry, index) => visit(entry, `${location}[${index}]`)).join(',')}]`
      }
      const prototype = Object.getPrototypeOf(item)
      if (prototype !== Object.prototype && prototype !== null) throw new Error(`${location} contains an unsupported object type`)
      const symbols = Object.getOwnPropertySymbols(item)
      if (symbols.length) throw new Error(`${location} contains symbol keys`)
      const keys = Object.keys(item).sort()
      return `{${keys.map((key) => {
        assertJsonString(key, `${location} key`)
        return `${JSON.stringify(key)}:${visit(item[key], `${location}.${key}`)}`
      }).join(',')}}`
    } finally { active.delete(item) }
  }
  return visit(value, '$')
}

export function calculateDigest(content) {
  return `${DIGEST_PREFIX}${crypto.createHash(DIGEST_ALGORITHM).update(canonicalize(content), 'utf8').digest('hex')}`
}

export function verifyDigest(content, expectedDigest) {
  if (typeof expectedDigest !== 'string' || !expectedDigest.startsWith(DIGEST_PREFIX)) return false
  const actual = calculateDigest(content)
  const left = Buffer.from(actual)
  const right = Buffer.from(expectedDigest)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function assertNoSecretsOrPrivateData(value, location = 'record') {
  const visit = (item, currentPath) => {
    if (Array.isArray(item)) return item.forEach((entry, index) => visit(entry, `${currentPath}[${index}]`))
    if (item && typeof item === 'object') {
      for (const [key, nested] of Object.entries(item)) {
        const normalized = key.toLowerCase().replaceAll(/[-_]/g, '')
        if (privateKeys.has(normalized)) throw new Error(`${currentPath}.${key} is a prohibited secret/private-data field`)
        visit(nested, `${currentPath}.${key}`)
      }
      return
    }
    if (typeof item === 'string') for (const [pattern, label] of secretPatterns) if (pattern.test(item)) throw new Error(`${currentPath} contains prohibited ${label}`)
  }
  visit(value, location)
}

function assertExactVersion(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must identify an exact version`)
  if (/^(latest|current|default|stable|production)$/i.test(value.trim())) throw new Error(`${label} cannot silently use ${value}`)
}

function assertEvidenceProvenance(record) {
  const required = ['sourceIdentity', 'sourceVersion', 'observedAt', 'actorIdentity', 'deletionPolicyReference']
  for (const key of required) if (!Object.hasOwn(record.provenance, key)) throw new Error(`evidence ${record.evidenceId} provenance is missing ${key}`)
  for (const key of ['sourceIdentity', 'observedAt', 'actorIdentity', 'deletionPolicyReference']) if (typeof record.provenance[key] !== 'string' || !record.provenance[key]) throw new Error(`evidence ${record.evidenceId} provenance ${key} must be non-empty`)
  if (Number.isNaN(Date.parse(record.provenance.observedAt))) throw new Error(`evidence ${record.evidenceId} observedAt is invalid`)
  if (record.provenance.sourceVersion !== null) assertExactVersion(record.provenance.sourceVersion, `evidence ${record.evidenceId} sourceVersion`)
}

export function validateEvidenceRecord(record, content) {
  assertContract(`evidence ${record?.evidenceId ?? '<unknown>'}`, 'evidence', record)
  assertEvidenceProvenance(record)
  assertExactVersion(record.version, `evidence ${record.evidenceId} version`)
  if (!record.accessPolicyId) throw new Error(`evidence ${record.evidenceId} requires an access policy reference`)
  if (!verifyDigest(content, record.contentDigest)) throw new Error(`evidence ${record.evidenceId} content digest mismatch`)
  if (record.target === 'DEV_TOOLING' && (record.knowledgePlane === 'personal' || ['confidential', 'restricted'].includes(record.classification) || ['user-statement', 'user-feedback'].includes(record.sourceType))) throw new Error(`private evidence ${record.evidenceId} cannot route to DEV_TOOLING`)
  assertNoSecretsOrPrivateData(record, `evidence ${record.evidenceId}`)
  assertNoSecretsOrPrivateData(content, `evidence content ${record.evidenceId}`)
  return { valid: true, evidenceId: record.evidenceId }
}

export function validateComponent(component) {
  if (!component || typeof component !== 'object') throw new Error('component record is required')
  const required = ['componentId', 'componentType', 'version', 'effectiveAt', 'supersessionStatus', 'environmentApplicability', 'provenance']
  for (const key of required) if (!Object.hasOwn(component, key)) throw new Error(`component is missing ${key}`)
  if (!componentTypes.includes(component.componentType)) throw new Error(`unsupported component type: ${component.componentType}`)
  assertExactVersion(component.version, `${component.componentId} version`)
  if (!['active', 'superseded', 'withdrawn'].includes(component.supersessionStatus)) throw new Error(`${component.componentId} has invalid supersession status`)
  if (!Array.isArray(component.environmentApplicability) || !component.environmentApplicability.length) throw new Error(`${component.componentId} requires environment applicability`)
  if (component.contentDigest !== null && component.contentDigest !== undefined && !component.contentDigest.startsWith(DIGEST_PREFIX)) throw new Error(`${component.componentId} has unsupported content digest`)
  if (component.approvalRequired && !component.approvalReference) throw new Error(`${component.componentId} requires an approval reference`)
  assertNoSecretsOrPrivateData(component, `component ${component.componentId}`)
  return { valid: true, componentKey: `${component.componentId}@${component.version}` }
}

export function registerComponent(store, component) {
  validateComponent(component)
  const next = structuredClone(store)
  next.components ||= []
  const key = `${component.componentId}@${component.version}`
  const existing = next.components.find((entry) => `${entry.componentId}@${entry.version}` === key)
  if (existing) {
    if (canonicalize(existing) === canonicalize(component)) return { store: next, registered: false, idempotent: true }
    throw new Error(`component version already exists with different content: ${key}`)
  }
  next.components.push(structuredClone(component))
  next.components.sort((a, b) => `${a.componentId}@${a.version}`.localeCompare(`${b.componentId}@${b.version}`))
  return { store: next, registered: true, idempotent: false }
}

function evidenceMap(store) { return new Map((store.evidence ?? []).map((entry) => [entry.record.evidenceId, entry])) }
function artifactKey(record) { return `${record.artifactId}@${record.version}` }
function artifactMap(store) { return new Map((store.artifacts ?? []).map((entry) => [artifactKey(entry), entry])) }
function componentMap(store) { return new Map((store.components ?? []).map((entry) => [`${entry.componentId}@${entry.version}`, entry])) }

export function validateArtifactRecord(artifact) {
  const required = ['artifactId', 'version', 'artifactType', 'knowledgePlane', 'target', 'tenantScope', 'accessScope', 'classification', 'retentionPolicy', 'deletionPolicyReference', 'contentDigest', 'status', 'createdAt', 'actorIdentity', 'content']
  for (const key of required) if (!Object.hasOwn(artifact, key)) throw new Error(`artifact is missing ${key}`)
  assertExactVersion(artifact.version, `${artifact.artifactId} version`)
  if (!['calculation', 'generated-conclusion', 'approval', 'release', 'rollback', 'negative-knowledge', 'synthetic-output'].includes(artifact.artifactType)) throw new Error(`${artifact.artifactId} has unsupported artifact type`)
  if (!['accepted', 'superseded', 'rejected', 'draft'].includes(artifact.status)) throw new Error(`${artifact.artifactId} has invalid status`)
  if (artifact.artifactType === 'generated-conclusion' && artifact.status !== 'draft' && !artifact.generationManifestId) throw new Error(`${artifact.artifactId} accepted or historical generated conclusion requires its manifest`)
  if (!verifyDigest(artifact.content, artifact.contentDigest)) throw new Error(`${artifact.artifactId} artifact content digest mismatch`)
  if (artifact.target === 'DEV_TOOLING' && (artifact.knowledgePlane === 'personal' || ['confidential', 'restricted'].includes(artifact.classification))) throw new Error(`private artifact ${artifact.artifactId} cannot route to DEV_TOOLING`)
  assertNoSecretsOrPrivateData(artifact, `artifact ${artifact.artifactId}`)
  return { valid: true, artifactKey: artifactKey(artifact) }
}

export class InMemoryEvidenceRepository {
  #store
  constructor(initial = emptyStore()) { this.#store = structuredClone(initial) }
  snapshot() { return structuredClone(this.#store) }
  acceptEvidence(entry) {
    validateEvidenceRecord(entry.record, entry.content)
    const existing = this.#store.evidence.find((item) => item.record.evidenceId === entry.record.evidenceId)
    if (existing) {
      if (canonicalize(existing) === canonicalize(entry)) return { accepted: false, idempotent: true, record: structuredClone(existing.record) }
      throw new Error(`evidence ${entry.record.evidenceId} is immutable and cannot be edited in place`)
    }
    this.#store.evidence.push(structuredClone(entry))
    return { accepted: true, idempotent: false, record: structuredClone(entry.record) }
  }
  acceptArtifact(artifact) {
    validateArtifactRecord(artifact)
    const key = artifactKey(artifact)
    const existing = this.#store.artifacts.find((item) => artifactKey(item) === key)
    if (existing) {
      if (canonicalize(existing) === canonicalize(artifact)) return { accepted: false, idempotent: true, artifact: structuredClone(existing) }
      throw new Error(`artifact ${key} is immutable and cannot be edited in place`)
    }
    this.#store.artifacts.push(structuredClone(artifact))
    return { accepted: true, idempotent: false, artifact: structuredClone(artifact) }
  }
}

export class SyntheticFixtureRepository {
  constructor(relativePath) {
    this.relativePath = normalizeRepositoryPath(relativePath)
    if (!this.relativePath.startsWith(`${FIXTURE_ROOT}/`)) throw new Error(`fixture adapter path must remain under ${FIXTURE_ROOT}`)
    this.file = resolveRepositoryPath(this.relativePath)
  }
  load() { return readJson(this.file) }
  validate() { return validateStore(this.load(), { syntheticFixture: true }) }
  writeAccepted(store) {
    validateStore(store, { syntheticFixture: true })
    atomicWriteJson(this.file, store)
    return this.file
  }
}

export function emptyStore() {
  return { schemaVersion: '1.0.0', evidence: [], artifacts: [], components: [], manifests: [], lineage: [], supersessions: [], acceptancePolicies: [], reproductionResults: [], approvals: [], releases: [], rollbackPlans: [], rollbackHistory: [] }
}

function allNodeIds(store) {
  const values = [
    ...(store.evidence ?? []).map((entry) => entry.record.evidenceId),
    ...(store.artifacts ?? []).map(artifactKey),
    ...(store.components ?? []).map((entry) => `${entry.componentId}@${entry.version}`),
    ...(store.manifests ?? []).map((entry) => entry.manifestId),
    ...(store.approvals ?? []).map((entry) => entry.approvalId),
    ...(store.releases ?? []).map((entry) => entry.releaseId),
    ...(store.reproductionResults ?? []).map((entry) => entry.reproductionResultId),
    ...(store.rollbackPlans ?? []).map((entry) => entry.rollbackPlanId),
  ]
  const ids = new Set()
  for (const id of values) {
    if (ids.has(id)) throw new Error(`duplicate lineage node ID: ${id}`)
    ids.add(id)
  }
  return ids
}

export function validateLineageGraph(store) {
  const nodes = allNodeIds(store)
  const relationshipIds = new Set()
  const adjacency = new Map([...nodes].map((id) => [id, []]))
  for (const edge of store.lineage ?? []) {
    if (!edge.relationshipId || !ancestryRelationships.has(edge.relationshipType)) throw new Error('lineage relationship identity and supported type are required')
    if (relationshipIds.has(edge.relationshipId)) throw new Error(`duplicate lineage relationship ID: ${edge.relationshipId}`)
    relationshipIds.add(edge.relationshipId)
    if (!nodes.has(edge.fromId)) throw new Error(`lineage relationship ${edge.relationshipId} has missing referenced ID ${edge.fromId}`)
    if (!nodes.has(edge.toId)) throw new Error(`lineage relationship ${edge.relationshipId} has missing referenced ID ${edge.toId}`)
    if (edge.fromId === edge.toId) throw new Error(`lineage relationship ${edge.relationshipId} is prohibited self-support`)
    adjacency.get(edge.fromId).push(edge.toId)
    const left = resolveScopedNode(store, edge.fromId)
    const right = resolveScopedNode(store, edge.toId)
    if (left?.tenantScope && right?.tenantScope && left.tenantScope !== right.tenantScope) throw new Error(`lineage relationship ${edge.relationshipId} crosses tenant scope`)
  }
  const visiting = new Set()
  const visited = new Set()
  const walk = (id, stack) => {
    if (visiting.has(id)) throw new Error(`lineage cycle detected: ${[...stack.slice(stack.indexOf(id)), id].join(' -> ')}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const next of adjacency.get(id) ?? []) walk(next, [...stack, id])
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of [...nodes].sort()) walk(id, [])
  for (const artifact of store.artifacts ?? []) {
    if (artifact.artifactType !== 'generated-conclusion') continue
    const key = artifactKey(artifact)
    const ancestors = traceAncestors(store, key).transitive.map((item) => item.id)
    if (ancestors.includes(key)) throw new Error(`generated conclusion ${key} cannot support itself`)
  }
  return { valid: true, nodeCount: nodes.size, relationshipCount: relationshipIds.size }
}

function resolveScopedNode(store, id) {
  const evidence = evidenceMap(store).get(id)?.record
  if (evidence) return evidence
  return artifactMap(store).get(id) ?? null
}

export function traceAncestors(store, startId) {
  const nodes = allNodeIds(store)
  if (!nodes.has(startId)) throw new Error(`cannot trace missing ID ${startId}`)
  const edges = (store.lineage ?? []).filter((edge) => ancestryRelationships.has(edge.relationshipType))
  const byFrom = new Map()
  for (const edge of edges) byFrom.set(edge.fromId, [...(byFrom.get(edge.fromId) ?? []), edge])
  const directEdges = [...(byFrom.get(startId) ?? [])].sort((a, b) => a.relationshipId.localeCompare(b.relationshipId))
  const seen = new Map()
  const queue = directEdges.map((edge) => ({ id: edge.toId, depth: 1, relationshipType: edge.relationshipType }))
  while (queue.length) {
    const current = queue.shift()
    if (seen.has(current.id) && seen.get(current.id).depth <= current.depth) continue
    seen.set(current.id, current)
    for (const edge of byFrom.get(current.id) ?? []) queue.push({ id: edge.toId, depth: current.depth + 1, relationshipType: edge.relationshipType })
  }
  const transitive = [...seen.values()].sort((a, b) => a.depth - b.depth || a.id.localeCompare(b.id))
  return {
    startId,
    direct: directEdges.map((edge) => ({ id: edge.toId, relationshipType: edge.relationshipType })),
    transitive,
    supportingEvidence: transitive.filter((item) => item.relationshipType === 'supported-by').map((item) => item.id),
    contradictoryEvidence: transitive.filter((item) => item.relationshipType === 'contradicted-by').map((item) => item.id),
  }
}

export function formatLineageReport(report) {
  const lines = [`Lineage for ${report.startId}`, `Direct ancestors: ${report.direct.length}`, `All ancestors: ${report.transitive.length}`]
  lines.push(`Supporting evidence: ${report.supportingEvidence.join(', ') || 'none'}`)
  lines.push(`Contradictory evidence: ${report.contradictoryEvidence.join(', ') || 'none'}`)
  for (const item of report.transitive) lines.push(`- depth ${item.depth}: ${item.id} (${item.relationshipType})`)
  return `${lines.join('\n')}\n`
}

function validateManifestWrapper(store, wrapper) {
  const required = ['manifestId', 'artifactId', 'artifactVersion', 'manifest', 'componentVersions', 'determinism']
  for (const key of required) if (!Object.hasOwn(wrapper, key)) throw new Error(`generation manifest wrapper is missing ${key}`)
  assertContract(`generation manifest ${wrapper.manifestId}`, 'generation', wrapper.manifest)
  if (wrapper.manifest.findingId !== wrapper.artifactId) throw new Error(`${wrapper.manifestId} findingId does not bind its artifact ID`)
  assertExactVersion(wrapper.artifactVersion, `${wrapper.manifestId} artifact version`)
  const artifact = artifactMap(store).get(`${wrapper.artifactId}@${wrapper.artifactVersion}`)
  if (!artifact) throw new Error(`${wrapper.manifestId} references missing artifact version`)
  if (artifact.generationManifestId !== wrapper.manifestId) throw new Error(`${wrapper.manifestId} is not bound from its artifact`)
  const evidence = evidenceMap(store)
  for (const id of wrapper.manifest.evidenceIds) if (!evidence.has(id)) throw new Error(`${wrapper.manifestId} references missing evidence ID ${id}`)
  const roles = new Map()
  const components = componentMap(store)
  for (const reference of wrapper.componentVersions) {
    if (!requiredComponentRoles.has(reference.role)) throw new Error(`${wrapper.manifestId} has unsupported component role ${reference.role}`)
    if (roles.has(reference.role)) throw new Error(`${wrapper.manifestId} has duplicate component role ${reference.role}`)
    assertExactVersion(reference.version, `${wrapper.manifestId} ${reference.role}`)
    const component = components.get(`${reference.componentId}@${reference.version}`)
    if (!component) throw new Error(`${wrapper.manifestId} references missing component version ${reference.componentId}@${reference.version}`)
    if (component.componentType !== reference.role) throw new Error(`${wrapper.manifestId} component role mismatch for ${reference.componentId}`)
    if (!component.environmentApplicability.includes('all') && !component.environmentApplicability.includes(wrapper.manifest.environment)) throw new Error(`${wrapper.manifestId} component ${reference.componentId}@${reference.version} is unavailable in ${wrapper.manifest.environment}`)
    roles.set(reference.role, reference)
  }
  for (const role of requiredComponentRoles) if (!roles.has(role)) throw new Error(`${wrapper.manifestId} is missing component role ${role}`)
  const exactBindings = {
    'calculation-engine': wrapper.manifest.calculationEngineVersion,
    constitution: wrapper.manifest.constitutionVersion,
    'synthesis-engine': wrapper.manifest.synthesisEngineVersion,
    prompt: wrapper.manifest.promptVersion,
    'model-provider': wrapper.manifest.provider,
    'model-identity': wrapper.manifest.exactModelId,
    'knowledge-snapshot': wrapper.manifest.knowledgeSnapshot,
    release: wrapper.manifest.releaseVersion,
  }
  for (const [role, version] of Object.entries(exactBindings)) if (roles.get(role).version !== version) throw new Error(`${wrapper.manifestId} ${role} does not match the merged manifest`)
  if (roles.get('canonicalization-algorithm').version !== CANONICALIZATION_VERSION) throw new Error(`${wrapper.manifestId} uses an unsupported canonicalization version`)
  const configurationComponent = components.get(`${roles.get('model-configuration').componentId}@${roles.get('model-configuration').version}`)
  if (configurationComponent.contentDigest !== calculateDigest(wrapper.manifest.modelConfiguration)) throw new Error(`${wrapper.manifestId} model configuration digest mismatch`)
  if (wrapper.manifest.fallback.used === false && (wrapper.manifest.fallback.provider !== null || wrapper.manifest.fallback.exactModelId !== null)) throw new Error(`${wrapper.manifestId} must not conceal an unused fallback identity`)
  if (wrapper.determinism.kind === 'stochastic' && !wrapper.determinism.acceptancePolicyVersion) throw new Error(`${wrapper.manifestId} stochastic generation requires a versioned acceptance policy`)
  if (!['deterministic', 'stochastic'].includes(wrapper.determinism.kind)) throw new Error(`${wrapper.manifestId} has invalid determinism kind`)
  return { valid: true, manifestId: wrapper.manifestId }
}

export function validateGenerationManifest(store, wrapper) { return validateManifestWrapper(store, wrapper) }

export function buildReproductionPlan(store, artifactId, version) {
  const reasons = []
  const artifact = artifactMap(store).get(`${artifactId}@${version}`)
  if (!artifact) return { artifactId, artifactVersion: version, possible: false, reasons: ['accepted artifact version is missing'] }
  const wrapper = (store.manifests ?? []).find((item) => item.manifestId === artifact.generationManifestId)
  if (!wrapper) return { artifactId, artifactVersion: version, possible: false, reasons: ['generation manifest is missing'] }
  try { validateManifestWrapper(store, wrapper) } catch (error) { reasons.push(error.message) }
  const evidence = evidenceMap(store)
  for (const id of wrapper.manifest.evidenceIds) {
    const entry = evidence.get(id)
    if (!entry) { reasons.push(`evidence ${id} is missing`); continue }
    if (!verifyDigest(entry.content, entry.record.contentDigest)) reasons.push(`evidence ${id} digest mismatch`)
  }
  const components = componentMap(store)
  for (const reference of wrapper.componentVersions) if (!components.has(`${reference.componentId}@${reference.version}`)) reasons.push(`component ${reference.componentId}@${reference.version} is missing`)
  const stochastic = wrapper.determinism.kind === 'stochastic'
  let policy = null
  if (stochastic) {
    policy = (store.acceptancePolicies ?? []).find((item) => item.policyId === wrapper.manifest.acceptancePolicy.policyId && item.version === wrapper.determinism.acceptancePolicyVersion)
    if (!policy) reasons.push(`acceptance policy ${wrapper.manifest.acceptancePolicy.policyId}@${wrapper.determinism.acceptancePolicyVersion} is missing`)
    else if (!policy.approved) reasons.push(`acceptance policy ${policy.policyId}@${policy.version} is not approved`)
    else if (policy.comparisonMethod !== wrapper.manifest.acceptancePolicy.comparisonMethod) reasons.push(`acceptance policy comparison method does not match manifest`)
  }
  return {
    artifactId, artifactVersion: version, manifestId: wrapper.manifestId,
    deterministic: !stochastic, exactReproductionExpected: !stochastic,
    boundedComparisonRequired: stochastic, fallbackUsed: wrapper.manifest.fallback.used,
    fallbackDisclosure: wrapper.manifest.fallback.disclosure, possible: reasons.length === 0,
    reasons: [...new Set(reasons)].sort(), acceptancePolicy: policy ? { policyId: policy.policyId, version: policy.version } : null,
  }
}

export function normalizeOutput(output) {
  if (typeof output === 'string') return output.normalize('NFC').replaceAll('\r\n', '\n').replaceAll('\r', '\n')
  return canonicalize(output)
}

function valueAtPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, segment) => current?.[segment], value)
}

export function compareReproduction(store, artifactId, version, actualOutput) {
  const plan = buildReproductionPlan(store, artifactId, version)
  if (!plan.possible) return { accepted: false, blocked: true, reasons: plan.reasons, variances: [] }
  const artifact = artifactMap(store).get(`${artifactId}@${version}`)
  if (plan.deterministic) {
    const expected = normalizeOutput(artifact.content)
    const actual = normalizeOutput(actualOutput)
    return { accepted: expected === actual, blocked: false, reasons: expected === actual ? [] : ['deterministic normalized output mismatch'], variances: expected === actual ? [] : [{ metricId: 'normalized-output', accepted: false }] }
  }
  const policy = (store.acceptancePolicies ?? []).find((item) => item.policyId === plan.acceptancePolicy.policyId && item.version === plan.acceptancePolicy.version)
  const variances = policy.metrics.map((metric) => {
    const expected = valueAtPath(artifact.content, metric.path)
    const actual = valueAtPath(actualOutput, metric.path)
    if (metric.kind === 'exact') return { metricId: metric.metricId, expected, actual, accepted: canonicalize(expected) === canonicalize(actual) }
    if (metric.kind === 'numeric-tolerance') {
      if (typeof expected !== 'number' || typeof actual !== 'number') return { metricId: metric.metricId, expectedType: typeof expected, actualType: typeof actual, accepted: false }
      const variance = Math.abs(actual - expected)
      return { metricId: metric.metricId, variance, tolerance: metric.tolerance, accepted: variance <= metric.tolerance }
    }
    if (metric.kind === 'required-key') return { metricId: metric.metricId, accepted: actual !== undefined }
    throw new Error(`unsupported synthetic comparison metric ${metric.kind}`)
  })
  return { accepted: variances.every((item) => item.accepted), blocked: false, reasons: [], variances }
}

function recordExists(store, kind, id) {
  if (kind === 'evidence') return evidenceMap(store).has(id)
  if (kind === 'artifact') return artifactMap(store).has(id)
  throw new Error(`unsupported supersession kind ${kind}`)
}

export function validateSupersessions(store) {
  const ids = new Set()
  const successorByPredecessor = new Map()
  const predecessorBySuccessor = new Map()
  for (const relation of store.supersessions ?? []) {
    if (ids.has(relation.supersessionId)) throw new Error(`duplicate supersession ID: ${relation.supersessionId}`)
    ids.add(relation.supersessionId)
    if (!recordExists(store, relation.kind, relation.predecessorId) || !recordExists(store, relation.kind, relation.successorId)) throw new Error(`${relation.supersessionId} references missing supersession record`)
    if (relation.predecessorId === relation.successorId) throw new Error(`${relation.supersessionId} creates a supersession cycle`)
    if (successorByPredecessor.has(relation.predecessorId)) throw new Error(`supersession chain forks silently at ${relation.predecessorId}`)
    if (predecessorBySuccessor.has(relation.successorId)) throw new Error(`supersession successor ${relation.successorId} has multiple predecessors`)
    successorByPredecessor.set(relation.predecessorId, relation.successorId)
    predecessorBySuccessor.set(relation.successorId, relation.predecessorId)
    if (relation.negativeKnowledge?.retained && (!relation.negativeKnowledge.reason || !relation.negativeKnowledge.reconsiderationConditions?.length)) throw new Error(`${relation.supersessionId} negative knowledge requires reason and reconsideration conditions`)
  }
  for (const start of successorByPredecessor.keys()) {
    const seen = new Set()
    let current = start
    while (successorByPredecessor.has(current)) {
      if (seen.has(current)) throw new Error(`supersession cycle detected at ${current}`)
      seen.add(current)
      current = successorByPredecessor.get(current)
    }
  }
  return { valid: true, forward: successorByPredecessor, backward: predecessorBySuccessor }
}

export function resolveSupersession(store, startId) {
  const { forward, backward } = validateSupersessions(store)
  if (!recordExists(store, 'evidence', startId) && !recordExists(store, 'artifact', startId)) throw new Error(`cannot resolve missing supersession record ${startId}`)
  const history = []
  let root = startId
  while (backward.has(root)) root = backward.get(root)
  let current = root
  history.push(current)
  while (forward.has(current)) { current = forward.get(current); history.push(current) }
  return { requestedId: startId, rootId: root, currentEffectiveId: current, history }
}

export function validateRollbackPlan(store, plan) {
  const required = ['rollbackPlanId', 'failedArtifact', 'priorKnownGoodArtifact', 'reason', 'trigger', 'approvalReference', 'evidenceIds', 'actor', 'timestamp', 'forwardFixStatus', 'restorationStatus', 'postRollbackVerification']
  for (const key of required) if (!Object.hasOwn(plan, key)) throw new Error(`rollback plan is missing ${key}`)
  const artifacts = artifactMap(store)
  const failedKey = `${plan.failedArtifact.artifactId}@${plan.failedArtifact.version}`
  const restoredKey = `${plan.priorKnownGoodArtifact.artifactId}@${plan.priorKnownGoodArtifact.version}`
  if (!artifacts.has(failedKey)) throw new Error(`rollback plan references missing failed artifact ${failedKey}`)
  if (!artifacts.has(restoredKey)) throw new Error(`rollback plan references missing restored artifact ${restoredKey}`)
  if (failedKey === restoredKey) throw new Error('rollback failed and restored versions must differ')
  const approval = (store.approvals ?? []).find((item) => item.approvalId === plan.approvalReference)
  if (!approval || approval.decision !== 'APPROVED' || approval.invalidatedAt) throw new Error(`rollback plan requires a current approved approval record`)
  for (const evidenceId of plan.evidenceIds) if (!evidenceMap(store).has(evidenceId)) throw new Error(`rollback plan references missing evidence ${evidenceId}`)
  if (!plan.postRollbackVerification.checks?.length) throw new Error('rollback plan requires post-rollback verification checks')
  assertNoSecretsOrPrivateData(plan, `rollback plan ${plan.rollbackPlanId}`)
  return { valid: true, rollbackPlanId: plan.rollbackPlanId, failedKey, restoredKey }
}

export function createRollbackHistoryRecord(store, plan, { historyId, recordedAt }) {
  const validation = validateRollbackPlan(store, plan)
  if (!historyId || !recordedAt) throw new Error('rollback history identity and timestamp are required')
  return { historyId, rollbackPlanId: plan.rollbackPlanId, failedArtifact: validation.failedKey, restoredArtifact: validation.restoredKey, reason: plan.reason, actor: plan.actor, recordedAt, restorationStatus: plan.restorationStatus, forwardFixStatus: plan.forwardFixStatus, postRollbackVerification: structuredClone(plan.postRollbackVerification) }
}

function assertUniqueBy(items, selector, label) {
  const seen = new Set()
  for (const item of items ?? []) {
    const value = selector(item)
    if (seen.has(value)) throw new Error(`duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

function assertSyntheticFixture(store) {
  for (const entry of store.evidence ?? []) {
    const identities = [entry.record.evidenceId, entry.record.tenantScope, entry.record.provenance.sourceIdentity, entry.record.provenance.actorIdentity]
    if (identities.some((value) => typeof value !== 'string' || !value.toLowerCase().includes('synthetic'))) throw new Error(`tracked evidence fixtures require clearly synthetic identities`)
  }
  for (const artifact of store.artifacts ?? []) if (![artifact.artifactId, artifact.tenantScope, artifact.actorIdentity].every((value) => value.toLowerCase().includes('synthetic'))) throw new Error(`tracked artifact fixtures require clearly synthetic identities`)
}

export function validateStore(store, { syntheticFixture = false } = {}) {
  if (store?.schemaVersion !== '1.0.0') throw new Error('evidence-lineage store schemaVersion must be 1.0.0')
  assertNoSecretsOrPrivateData(store, 'evidence-lineage store')
  assertUniqueBy(store.evidence, (entry) => entry.record.evidenceId, 'evidence ID')
  for (const entry of store.evidence ?? []) validateEvidenceRecord(entry.record, entry.content)
  assertUniqueBy(store.artifacts, artifactKey, 'artifact version')
  for (const artifact of store.artifacts ?? []) validateArtifactRecord(artifact)
  assertUniqueBy(store.components, (entry) => `${entry.componentId}@${entry.version}`, 'component version')
  for (const component of store.components ?? []) validateComponent(component)
  assertUniqueBy(store.manifests, (entry) => entry.manifestId, 'manifest ID')
  for (const wrapper of store.manifests ?? []) validateManifestWrapper(store, wrapper)
  assertUniqueBy(store.approvals, (entry) => entry.approvalId, 'approval ID')
  for (const approval of store.approvals ?? []) assertContract(`approval ${approval.approvalId}`, 'approval', approval)
  assertUniqueBy(store.releases, (entry) => entry.releaseId, 'release ID')
  for (const release of store.releases ?? []) assertContract(`release ${release.releaseId}`, 'release', release)
  validateLineageGraph(store)
  validateSupersessions(store)
  assertUniqueBy(store.acceptancePolicies, (entry) => `${entry.policyId}@${entry.version}`, 'acceptance policy')
  for (const policy of store.acceptancePolicies ?? []) { assertExactVersion(policy.version, `${policy.policyId} acceptance policy version`); if (!policy.metrics?.length) throw new Error(`${policy.policyId} acceptance policy requires measurable metrics`) }
  assertUniqueBy(store.rollbackPlans, (entry) => entry.rollbackPlanId, 'rollback plan ID')
  for (const plan of store.rollbackPlans ?? []) validateRollbackPlan(store, plan)
  for (const history of store.rollbackHistory ?? []) {
    if (!artifactMap(store).has(history.failedArtifact) || !artifactMap(store).has(history.restoredArtifact)) throw new Error(`${history.historyId} does not preserve failed and restored artifact histories`)
  }
  if (syntheticFixture) assertSyntheticFixture(store)
  return { valid: true, evidence: store.evidence.length, artifacts: store.artifacts.length, components: store.components.length, manifests: store.manifests.length, relationships: store.lineage.length }
}

export const supportedComponentTypes = componentTypes

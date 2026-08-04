import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(moduleDir, '../../../../..')
export const trackedWorkspaceDir = path.join(repoRoot, 'docs/aionis-operating-system/orchestrator/features')

const require = createRequire(import.meta.url)
const workboxRequire = createRequire(require.resolve('workbox-build/package.json'))
const Ajv2020 = workboxRequire('ajv/dist/2020').default

const schemaPaths = {
  workspace: path.join(moduleDir, 'workspace.schema.json'),
  feature: path.join(repoRoot, 'docs/aionis-operating-system/schemas/feature-specification.schema.json'),
  agent: path.join(repoRoot, 'docs/aionis-operating-system/schemas/agent-contract.schema.json'),
  approval: path.join(repoRoot, 'docs/aionis-operating-system/schemas/approval-record.schema.json'),
}

export const lifecycleStates = Object.freeze([
  'DRAFT', 'PLAN_APPROVED', 'BUILDING', 'CODE_APPROVED', 'STAGED',
  'RELEASE_APPROVED', 'RELEASED', 'OBSERVING', 'CLOSED', 'ROLLED_BACK', 'REJECTED',
])

export const forwardTransitions = Object.freeze({
  DRAFT: ['PLAN_APPROVED', 'REJECTED'],
  PLAN_APPROVED: ['BUILDING', 'REJECTED'],
  BUILDING: ['CODE_APPROVED'],
  CODE_APPROVED: ['STAGED'],
  STAGED: ['RELEASE_APPROVED'],
  RELEASE_APPROVED: ['RELEASED'],
  RELEASED: ['OBSERVING', 'ROLLED_BACK'],
  OBSERVING: ['CLOSED'],
  CLOSED: [],
  ROLLED_BACK: [],
  REJECTED: [],
})

export const failedGateReturns = Object.freeze({
  PLAN_GATE: { PLAN_APPROVED: 'DRAFT', BUILDING: 'PLAN_APPROVED' },
  CODE_GATE: { CODE_APPROVED: 'BUILDING', STAGED: 'CODE_APPROVED' },
  RELEASE_GATE: { RELEASE_APPROVED: 'STAGED' },
  DREAM_GATE: {},
})

export const transitionGates = Object.freeze({
  'DRAFT>PLAN_APPROVED': 'PLAN_GATE',
  'BUILDING>CODE_APPROVED': 'CODE_GATE',
  'STAGED>RELEASE_APPROVED': 'RELEASE_GATE',
})

const privilegedFields = Object.freeze([
  'mayDeploy',
  'mayModifyFormulas',
  'mayModifyConstitutionalMethodology',
  'mayAccessPrivateUserInformation',
])

const forbiddenKeys = new Set([
  'name', 'fullname', 'calledname', 'dateofbirth', 'dob', 'profile', 'profilecontent',
  'prompt', 'credential', 'credentials', 'password', 'secret', 'token', 'apikey',
  'service_role_key', 'email',
])

const forbiddenValues = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/i, 'database credential'],
  [/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/, 'JWT'],
  [/\b\d{2}\/\d{2}\/\d{4}\b/, 'DOB-like value'],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, 'email address'],
]

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function createValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  ajv.addFormat('date-time', (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)) && /T/.test(value))
  const validators = {}
  for (const [name, file] of Object.entries(schemaPaths)) validators[name] = ajv.compile(readJson(file))
  return { ajv, validators }
}

let validatorCache
function validators() {
  validatorCache ||= createValidators()
  return validatorCache
}

function validationError(label, validate, ajv) {
  return `${label} contract is invalid: ${ajv.errorsText(validate.errors, { separator: '; ' })}`
}

export function assertNoPrivateData(value, location = 'workspace') {
  const visit = (item, currentPath) => {
    if (Array.isArray(item)) return item.forEach((nested, index) => visit(nested, `${currentPath}[${index}]`))
    if (item && typeof item === 'object') {
      for (const [key, nested] of Object.entries(item)) {
        if (forbiddenKeys.has(key.toLowerCase().replaceAll(/[-_]/g, ''))) throw new Error(`${currentPath}.${key} is a prohibited secret/private-data field`)
        visit(nested, `${currentPath}.${key}`)
      }
      return
    }
    if (typeof item === 'string') {
      for (const [pattern, label] of forbiddenValues) if (pattern.test(item)) throw new Error(`${currentPath} contains ${label}`)
    }
  }
  visit(value, location)
}

export function normalizeRepoPath(input) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('repository path must be a non-empty string')
  const normalized = input.trim().replaceAll('\\', '/')
  if (path.posix.isAbsolute(normalized) || /^[a-zA-Z]:/.test(normalized)) throw new Error(`path must be repository-relative: ${input}`)
  const segments = normalized.split('/')
  if (segments.includes('..') || segments.includes('.git') || segments.includes('')) throw new Error(`path escapes or is outside the repository: ${input}`)
  return normalized.replace(/^\.\//, '').replace(/\/$/, '')
}

export function resolveInsideRepo(input) {
  const normalized = normalizeRepoPath(input)
  const resolved = path.resolve(repoRoot, normalized)
  const relative = path.relative(repoRoot, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`path escapes or is outside the repository: ${input}`)
  return resolved
}

export function atomicWriteJson(file, data) {
  const resolved = path.resolve(file)
  const relative = path.relative(repoRoot, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`refusing to write outside repository: ${file}`)
  fs.mkdirSync(path.dirname(resolved), { recursive: true })
  const temporary = `${resolved}.${process.pid}.${Date.now()}.tmp`
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
    fs.renameSync(temporary, resolved)
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary)
  }
}

function assertUnique(items, value, label) {
  if (items.some((item) => item === value)) throw new Error(`duplicate ${label}: ${value}`)
}

function assertComponentContracts(workspace) {
  const { ajv, validators: compiled } = validators()
  if (!compiled.feature(workspace.feature)) throw new Error(validationError('feature', compiled.feature, ajv))
  for (const assignment of workspace.assignments) if (!compiled.agent(assignment)) throw new Error(validationError(`assignment ${assignment.agentId ?? '<unknown>'}`, compiled.agent, ajv))
  for (const approval of workspace.approvals) if (!compiled.approval(approval)) throw new Error(validationError(`approval ${approval.approvalId ?? '<unknown>'}`, compiled.approval, ajv))
}

function assertWorkspaceSchema(workspace) {
  const { ajv, validators: compiled } = validators()
  if (!compiled.workspace(workspace)) throw new Error(validationError('orchestrator workspace', compiled.workspace, ajv))
}

function assertEvidenceLineageReferences(workspace) {
  const references = workspace.evidenceLineageReferences
  if (!references) return
  const registryFile = resolveInsideRepo(references.registryPath)
  if (!fs.existsSync(registryFile) || !fs.statSync(registryFile).isFile()) throw new Error(`evidence-lineage registry does not resolve: ${references.registryPath}`)
  const registry = readJson(registryFile)
  const available = {
    evidenceIds: new Set((registry.evidence ?? []).map((entry) => entry.record?.evidenceId)),
    manifestIds: new Set((registry.manifests ?? []).map((entry) => entry.manifestId)),
    componentVersions: new Set((registry.components ?? []).map((entry) => `${entry.componentId}@${entry.version}`)),
    reproductionResultIds: new Set((registry.reproductionResults ?? []).map((entry) => entry.reproductionResultId)),
    rollbackPlanIds: new Set((registry.rollbackPlans ?? []).map((entry) => entry.rollbackPlanId)),
  }
  for (const field of ['evidenceIds', 'manifestIds', 'reproductionResultIds', 'rollbackPlanIds']) {
    for (const id of references[field]) if (!available[field].has(id)) throw new Error(`unresolved evidence-lineage ${field} reference: ${id}`)
  }
  for (const component of references.componentVersions) {
    const key = `${component.componentId}@${component.version}`
    if (!available.componentVersions.has(key)) throw new Error(`unresolved evidence-lineage component version reference: ${key}`)
  }
}

function pathRoot(pattern) {
  return normalizeRepoPath(pattern).replace(/\/\*\*?$/, '').replace(/\*.*$/, '').replace(/\/$/, '')
}

function segments(pathValue) {
  return pathValue.split('/').filter(Boolean)
}

function rootsOverlap(a, b) {
  const left = segments(pathRoot(a))
  const right = segments(pathRoot(b))
  const length = Math.min(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    if (left[index] === '*' || right[index] === '*') continue
    if (left[index] !== right[index]) return false
  }
  return true
}

function collisionKind(left, right) {
  const a = normalizeRepoPath(left)
  const b = normalizeRepoPath(right)
  if (a === b && !a.includes('*')) return 'EXACT_FILE'
  const aRoot = pathRoot(a)
  const bRoot = pathRoot(b)
  if (!a.includes('*') && !b.includes('*') && (a.startsWith(`${b}/`) || b.startsWith(`${a}/`))) return 'PARENT_CHILD'
  if (rootsOverlap(a, b) && (a.includes('*') || b.includes('*') || aRoot === bRoot || aRoot.startsWith(`${bRoot}/`) || bRoot.startsWith(`${aRoot}/`))) return 'GLOB_OR_DIRECTORY'
  return null
}

function contractPermitsCollision(workspace, leftAssignment, rightAssignment, leftPath, rightPath) {
  const ids = new Set([leftAssignment.agentId, rightAssignment.agentId])
  return workspace.integrationContracts.find((contract) => {
    if (!contract.integrationOwner || !contract.verificationOwner) return false
    if (leftAssignment.integrationContractId !== contract.integrationContractId || rightAssignment.integrationContractId !== contract.integrationContractId) return false
    if (![...ids].every((id) => contract.participants.includes(id))) return false
    return contract.overlapPaths.some((allowed) => rootsOverlap(allowed, leftPath) && rootsOverlap(allowed, rightPath))
  })
}

export function findOwnershipCollisions(workspace) {
  const collisions = []
  const assignments = [...workspace.assignments].sort((a, b) => a.agentId.localeCompare(b.agentId))
  for (let leftIndex = 0; leftIndex < assignments.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < assignments.length; rightIndex += 1) {
      const left = assignments[leftIndex]
      const right = assignments[rightIndex]
      for (const leftPath of left.allowedPaths) for (const rightPath of right.allowedPaths) {
        const kind = collisionKind(leftPath, rightPath)
        if (!kind) continue
        const integration = contractPermitsCollision(workspace, left, right, leftPath, rightPath)
        collisions.push({
          kind,
          assignments: [left.agentId, right.agentId],
          paths: [leftPath, rightPath],
          permitted: Boolean(integration),
          integrationContractId: integration?.integrationContractId ?? null,
          integrationOwner: integration?.integrationOwner ?? null,
        })
      }
    }
  }
  return collisions
}

export function dependencyReport(workspaces) {
  const byId = new Map(workspaces.map((workspace) => [workspace.feature.featureId, workspace]))
  const missing = []
  const blocked = []
  const completed = []
  const soft = []
  const graph = new Map()

  for (const workspace of workspaces) {
    const id = workspace.feature.featureId
    graph.set(id, [])
    for (const dependency of workspace.implementationPlan.dependencies) {
      const target = byId.get(dependency.featureId)
      if (!target) {
        missing.push({ featureId: id, dependencyId: dependency.featureId, type: dependency.type })
        continue
      }
      if (dependency.type === 'HARD') graph.get(id).push(dependency.featureId)
      const versionMatches = target.feature.version === dependency.requiredArtifactVersion
      const isComplete = ['CLOSED', 'RELEASED', 'OBSERVING'].includes(target.feature.status) && versionMatches
      const detail = { featureId: id, dependencyId: dependency.featureId, requiredArtifactVersion: dependency.requiredArtifactVersion, actualArtifactVersion: target.feature.version, status: target.feature.status }
      if (dependency.type === 'SOFT') soft.push({ ...detail, resolved: isComplete })
      else if (isComplete) completed.push(detail)
      else blocked.push(detail)
    }
  }

  const cycles = []
  const visiting = new Set()
  const visited = new Set()
  const walk = (id, stack) => {
    if (visiting.has(id)) {
      const start = stack.indexOf(id)
      cycles.push([...stack.slice(start), id])
      return
    }
    if (visited.has(id)) return
    visiting.add(id)
    for (const next of graph.get(id) ?? []) walk(next, [...stack, id])
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of [...graph.keys()].sort()) walk(id, [])
  const canonicalCycles = [...new Map(cycles.map((cycle) => [cycle.join('>'), cycle])).values()]
  return { completed, blocked, soft, missing, cycles: canonicalCycles }
}

export function approvalResult(workspace, gate, now = new Date().toISOString(), scope = null) {
  const candidates = workspace.approvals.filter((approval) =>
    approval.artifactId === workspace.feature.featureId
    && approval.artifactVersion === workspace.feature.version
    && approval.gate === gate
    && (!scope || approval.scope === scope),
  )
  const reasons = []
  for (const approval of candidates) {
    if (approval.decision !== 'APPROVED') { reasons.push(`${approval.approvalId}: decision is ${approval.decision}`); continue }
    if (approval.invalidatedAt) { reasons.push(`${approval.approvalId}: invalidated`); continue }
    if (!approval.evidenceReferences.length) { reasons.push(`${approval.approvalId}: missing evidence references`); continue }
    const metadata = workspace.approvalMetadata.find((item) => item.approvalId === approval.approvalId)
    if (metadata?.expiresAt && Date.parse(metadata.expiresAt) <= Date.parse(now)) { reasons.push(`${approval.approvalId}: expired`); continue }
    return { passed: true, approvalId: approval.approvalId, reasons: [] }
  }
  if (!candidates.length) reasons.push(`no approval matches ${workspace.feature.featureId}@${workspace.feature.version} for ${gate}${scope ? ` and ${scope}` : ''}`)
  return { passed: false, approvalId: null, reasons }
}

function assertAssignment(workspace, assignment, now) {
  if (assignment.featureId !== workspace.feature.featureId) throw new Error(`${assignment.agentId} feature ID does not match workspace`)
  if (assignment.artifactVersion !== workspace.feature.version) throw new Error(`${assignment.agentId} has stale artifact version`)
  if (assignment.target !== workspace.feature.target) throw new Error(`${assignment.agentId} target does not match feature target`)
  for (const ownedPath of [...assignment.allowedPaths, ...assignment.prohibitedPaths]) normalizeRepoPath(ownedPath)
  for (const approvalId of assignment.approvalReferences) {
    const approval = workspace.approvals.find((item) => item.approvalId === approvalId)
    if (!approval) throw new Error(`${assignment.agentId} references unknown approval ${approvalId}`)
    if (approval.artifactId !== workspace.feature.featureId || approval.artifactVersion !== workspace.feature.version) throw new Error(`${assignment.agentId} references stale approval ${approvalId}`)
    if (approval.decision !== 'APPROVED' || approval.invalidatedAt) throw new Error(`${assignment.agentId} references non-authorizing approval ${approvalId}`)
    const metadata = workspace.approvalMetadata.find((item) => item.approvalId === approvalId)
    if (metadata?.expiresAt && Date.parse(metadata.expiresAt) <= Date.parse(now)) throw new Error(`${assignment.agentId} references expired approval ${approvalId}`)
  }
  for (const field of privilegedFields) {
    if (!assignment[field]) continue
    const gate = assignment.currentGate === 'NONE' ? 'PLAN_GATE' : assignment.currentGate
    const result = approvalResult(workspace, gate, now, `privilege:${field}`)
    if (!result.passed) throw new Error(`${assignment.agentId} sets privileged boolean ${field}=true without current approval`)
  }
}

export function validateWorkspace(workspace, { allWorkspaces = [workspace], now = new Date().toISOString() } = {}) {
  assertNoPrivateData(workspace)
  assertWorkspaceSchema(workspace)
  assertComponentContracts(workspace)
  assertEvidenceLineageReferences(workspace)
  if (workspace.implementationPlan.artifactId !== workspace.feature.featureId || workspace.implementationPlan.version !== workspace.feature.version) throw new Error('implementation plan identity/version does not match feature')
  if (!workspace.history.artifactVersions.some((entry) => entry.version === workspace.feature.version)) throw new Error('current artifact version is missing from append-only history')

  const assignmentIds = []
  for (const assignment of workspace.assignments) {
    assertUnique(assignmentIds, assignment.agentId, 'assignment ID')
    assignmentIds.push(assignment.agentId)
    assertAssignment(workspace, assignment, now)
  }
  const approvalIds = []
  for (const approval of workspace.approvals) { assertUnique(approvalIds, approval.approvalId, 'approval ID'); approvalIds.push(approval.approvalId) }
  for (const metadata of workspace.approvalMetadata) if (!approvalIds.includes(metadata.approvalId)) throw new Error(`approval metadata references missing approval ${metadata.approvalId}`)

  const handoffIds = []
  for (const handoff of workspace.handoffs) {
    assertUnique(handoffIds, handoff.handoffId, 'handoff ID')
    handoffIds.push(handoff.handoffId)
    if (handoff.acceptanceStatus === 'ACCEPTED' && (!handoff.acceptedAt || handoff.rejectionReason)) throw new Error(`${handoff.handoffId} has invalid accepted state`)
    if (handoff.acceptanceStatus === 'REJECTED' && (!handoff.rejectionReason || handoff.acceptedAt)) throw new Error(`${handoff.handoffId} has invalid rejected state`)
    if (handoff.artifactId !== workspace.feature.featureId) throw new Error(`${handoff.handoffId} has wrong artifact ID`)
  }

  const unpermitted = findOwnershipCollisions(workspace).filter((collision) => !collision.permitted)
  if (unpermitted.length) throw new Error(`ownership collisions: ${unpermitted.map((item) => `${item.kind} ${item.assignments.join('/')} at ${item.paths.join(' <> ')}`).join('; ')}`)
  const dependencies = dependencyReport(allWorkspaces)
  if (dependencies.missing.length) throw new Error(`missing dependency IDs: ${dependencies.missing.map((item) => `${item.featureId}->${item.dependencyId}`).join(', ')}`)
  if (dependencies.cycles.length) throw new Error(`dependency cycles: ${dependencies.cycles.map((cycle) => cycle.join(' -> ')).join('; ')}`)
  return { valid: true, featureId: workspace.feature.featureId, artifactVersion: workspace.feature.version }
}

function transitionAttempt(workspace, { to, actor, reason, evidenceReferences = [], rollbackTarget = null, now = new Date().toISOString() }) {
  if (!lifecycleStates.includes(to)) throw new Error(`unknown lifecycle state: ${to}`)
  if (!actor || !reason) throw new Error('transition actor and reason are required')
  const from = workspace.feature.status
  const requiredApproval = transitionGates[`${from}>${to}`] ?? null
  const base = { previousState: from, timestamp: now, actor, reason, requiredApproval, evidenceReferences, failedGateDetails: null, rollbackTarget }
  const allowed = forwardTransitions[from]?.includes(to)
  if (!allowed) return { accepted: false, error: `illegal lifecycle transition: ${from} -> ${to}`, event: { ...base, attemptedState: to } }
  if (to === 'ROLLED_BACK' && (!rollbackTarget?.releaseId || !rollbackTarget?.restoreVersion)) return { accepted: false, error: 'rollback transition requires releaseId and restoreVersion', event: { ...base, attemptedState: to } }
  if (requiredApproval) {
    const approval = approvalResult(workspace, requiredApproval, now)
    if (!approval.passed) return { accepted: false, error: `required ${requiredApproval} failed: ${approval.reasons.join('; ')}`, event: { ...base, attemptedState: to, failedGateDetails: { gate: requiredApproval, reasons: approval.reasons } } }
    base.requiredApproval = approval.approvalId
    for (const failedGate of workspace.gateState.failedGates.filter((item) => item.gate === requiredApproval && !item.resolvedAt)) {
      failedGate.resolvedAt = now
      failedGate.resolutionEvidenceReferences = [...evidenceReferences]
    }
  }
  return { accepted: true, event: { ...base, newState: to } }
}

export function advanceLifecycle(workspace, options) {
  const next = structuredClone(workspace)
  const attempt = transitionAttempt(next, options)
  if (!attempt.accepted) {
    next.history.failedTransitions.push(attempt.event)
    return { accepted: false, error: attempt.error, workspace: next }
  }
  next.feature.status = options.to
  next.history.transitions.push(attempt.event)
  if (options.to === 'ROLLED_BACK') {
    next.feature.rollbackIdentity = options.rollbackTarget
    next.history.rollbacks.push({ timestamp: attempt.event.timestamp, actor: options.actor, releaseId: options.rollbackTarget.releaseId, restoreVersion: options.rollbackTarget.restoreVersion, reason: options.reason })
  }
  return { accepted: true, workspace: next, event: attempt.event }
}

export function recordFailedGate(workspace, { gate, actor, reason, evidenceReferences = [], returnTo, now = new Date().toISOString() }) {
  const next = structuredClone(workspace)
  const from = next.feature.status
  const expected = failedGateReturns[gate]?.[from]
  if (!expected || expected !== returnTo) throw new Error(`illegal failed-gate return: ${gate} cannot move ${from} -> ${returnTo}`)
  const gateEvent = { gate, failedAt: now, reason, evidenceReferences, resolvedAt: null, resolutionEvidenceReferences: [] }
  next.gateState.failedGates.push(gateEvent)
  next.feature.failedGateHistory.push({ gate, priorState: from, returnedToState: returnTo, failureReason: reason, recordedAt: now })
  next.feature.status = returnTo
  next.history.transitions.push({ previousState: from, newState: returnTo, timestamp: now, actor, reason, requiredApproval: null, evidenceReferences, failedGateDetails: gateEvent, rollbackTarget: null })
  return next
}

export function setArtifactVersion(workspace, { version, actor, reason, now = new Date().toISOString() }) {
  if (!version || version === workspace.feature.version) return structuredClone(workspace)
  const next = structuredClone(workspace)
  const previous = next.feature.version
  next.feature.version = version
  next.implementationPlan.version = version
  for (const assignment of next.assignments) {
    assignment.artifactVersion = version
    assignment.approvalReferences = []
  }
  next.history.artifactVersions.push({ version, recordedAt: now, reason, supersedes: previous })
  for (const approval of next.approvals) {
    if (approval.artifactVersion !== previous || approval.invalidatedAt) continue
    approval.invalidatedAt = now
    approval.invalidationReason = `Artifact superseded by ${version}`
    next.feature.approvalInvalidations.push({ approvalId: approval.approvalId, invalidatedAt: now, reason: approval.invalidationReason })
    next.history.approvalInvalidations.push({ timestamp: now, event: 'APPROVAL_INVALIDATED', approvalId: approval.approvalId, actor, reason: approval.invalidationReason })
  }
  for (const handoff of next.handoffs) {
    if (handoff.artifactVersion !== previous || handoff.acceptanceStatus === 'INVALIDATED') continue
    handoff.acceptanceStatus = 'INVALIDATED'
    handoff.acceptedAt = null
    handoff.rejectionReason = `Artifact superseded by ${version}`
    next.history.handoffs.push({ timestamp: now, event: 'HANDOFF_INVALIDATED', handoffId: handoff.handoffId, actor, reason: handoff.rejectionReason })
  }
  return next
}

export function addAssignment(workspace, assignment, now = new Date().toISOString()) {
  const next = structuredClone(workspace)
  if (next.assignments.some((item) => item.agentId === assignment.agentId)) throw new Error(`duplicate assignment ID: ${assignment.agentId}`)
  next.assignments.push(structuredClone(assignment))
  assertAssignment(next, assignment, now)
  const unpermitted = findOwnershipCollisions(next).filter((collision) => !collision.permitted)
  if (unpermitted.length) throw new Error(`assignment creates ownership collision: ${unpermitted.map((item) => `${item.kind} ${item.paths.join(' <> ')}`).join('; ')}`)
  return next
}

export function createHandoff(workspace, handoff, { actor, now = new Date().toISOString() }) {
  const next = structuredClone(workspace)
  if (handoff.producer !== actor) throw new Error('only the producer may create its handoff')
  if (handoff.acceptanceStatus !== 'PENDING' || handoff.acceptedAt || handoff.rejectionReason) throw new Error('producer cannot complete, accept, or reject a handoff for the consumer')
  if (handoff.artifactId !== next.feature.featureId || handoff.artifactVersion !== next.feature.version) throw new Error('handoff artifact identity/version is stale')
  if (next.handoffs.some((item) => item.handoffId === handoff.handoffId)) throw new Error(`duplicate handoff ID: ${handoff.handoffId}`)
  next.handoffs.push(structuredClone(handoff))
  next.history.handoffs.push({ timestamp: now, event: 'HANDOFF_CREATED', handoffId: handoff.handoffId, actor })
  return next
}

export function decideHandoff(workspace, { handoffId, actor, decision, reason = null, now = new Date().toISOString() }) {
  const next = structuredClone(workspace)
  const handoff = next.handoffs.find((item) => item.handoffId === handoffId)
  if (!handoff) throw new Error(`unknown handoff: ${handoffId}`)
  if (actor !== handoff.consumer) throw new Error('only the named consumer may accept or reject a handoff')
  if (handoff.acceptanceStatus !== 'PENDING') throw new Error(`handoff is not pending: ${handoff.acceptanceStatus}`)
  if (decision === 'ACCEPTED') {
    handoff.acceptanceStatus = 'ACCEPTED'
    handoff.acceptedAt = now
    handoff.rejectionReason = null
  } else if (decision === 'REJECTED') {
    if (!reason) throw new Error('handoff rejection requires a reason')
    handoff.acceptanceStatus = 'REJECTED'
    handoff.acceptedAt = null
    handoff.rejectionReason = reason
  } else throw new Error(`unsupported handoff decision: ${decision}`)
  next.history.handoffs.push({ timestamp: now, event: `HANDOFF_${decision}`, handoffId, actor, reason })
  return next
}

export function readinessReport(workspace, allWorkspaces = [workspace], now = new Date().toISOString()) {
  const dependency = dependencyReport(allWorkspaces)
  const featureDependency = (items) => items.filter((item) => item.featureId === workspace.feature.featureId)
  const collisions = findOwnershipCollisions(workspace).filter((item) => !item.permitted)
  const pendingHandoffs = workspace.handoffs.filter((handoff) => handoff.artifactVersion !== workspace.feature.version || handoff.acceptanceStatus !== 'ACCEPTED')
  const missingChecks = workspace.requiredChecks.filter((check) => !['PASSED', 'NOT_APPLICABLE'].includes(check.status) || (check.status === 'PASSED' && !check.evidenceReferences.length))
  const missingApprovals = workspace.feature.requiredGates.flatMap((gate) => {
    const result = approvalResult(workspace, gate, now)
    return result.passed ? [] : [{ gate, reasons: result.reasons }]
  })
  const failedGates = workspace.gateState.failedGates.filter((gate) => !gate.resolvedAt)
  const unresolvedRisks = workspace.feature.risks.map((risk) => ({ riskId: risk.riskId, summary: risk.summary }))
  const blockers = []
  for (const item of featureDependency(dependency.missing)) blockers.push(`missing dependency ${item.dependencyId}`)
  for (const item of featureDependency(dependency.blocked)) blockers.push(`hard dependency ${item.dependencyId} is ${item.status} at ${item.actualArtifactVersion}`)
  for (const cycle of dependency.cycles.filter((cycle) => cycle.includes(workspace.feature.featureId))) blockers.push(`dependency cycle ${cycle.join(' -> ')}`)
  for (const collision of collisions) blockers.push(`ownership collision ${collision.kind}: ${collision.paths.join(' <> ')}`)
  for (const handoff of pendingHandoffs) blockers.push(`handoff ${handoff.handoffId} is ${handoff.acceptanceStatus}${handoff.artifactVersion !== workspace.feature.version ? ' for a stale version' : ''}`)
  for (const check of missingChecks) blockers.push(`check ${check.checkId} is ${check.status}`)
  for (const approval of missingApprovals) blockers.push(`${approval.gate}: ${approval.reasons.join('; ')}`)
  for (const gate of failedGates) blockers.push(`failed gate ${gate.gate}: ${gate.reason}`)
  for (const risk of unresolvedRisks) blockers.push(`unresolved risk ${risk.riskId}: ${risk.summary}`)
  if (!['CODE_APPROVED', 'STAGED', 'RELEASE_APPROVED', 'RELEASED', 'OBSERVING', 'CLOSED'].includes(workspace.feature.status)) blockers.push(`state ${workspace.feature.status} is not integration-ready`)
  return {
    featureId: workspace.feature.featureId,
    artifactVersion: workspace.feature.version,
    currentState: workspace.feature.status,
    dependencies: { completed: featureDependency(dependency.completed), blocked: featureDependency(dependency.blocked), soft: featureDependency(dependency.soft), missing: featureDependency(dependency.missing), cycles: dependency.cycles.filter((cycle) => cycle.includes(workspace.feature.featureId)) },
    ownershipCollisions: collisions,
    pendingHandoffs,
    missingChecks,
    missingOrStaleApprovals: missingApprovals,
    failedGates,
    unresolvedRisks,
    integrationAllowed: blockers.length === 0,
    blockers,
  }
}

export function formatReadiness(report) {
  const lines = [
    `Feature: ${report.featureId}@${report.artifactVersion}`,
    `State: ${report.currentState}`,
    `Integration allowed: ${report.integrationAllowed ? 'YES' : 'NO'}`,
  ]
  if (report.blockers.length) lines.push('Blockers:', ...report.blockers.map((blocker) => `- ${blocker}`))
  else lines.push('Blockers: none')
  return `${lines.join('\n')}\n`
}

export function loadTrackedWorkspaces(directory = trackedWorkspaceDir) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => readJson(path.join(directory, entry.name)))
}

export function validateAllTrackedWorkspaces(directory = trackedWorkspaceDir, now = new Date().toISOString()) {
  const workspaces = loadTrackedWorkspaces(directory)
  if (!workspaces.length) throw new Error('no tracked orchestrator workspaces found')
  const ids = workspaces.map((workspace) => workspace.feature.featureId)
  if (new Set(ids).size !== ids.length) throw new Error('tracked feature IDs must be unique')
  for (const workspace of workspaces) validateWorkspace(workspace, { allWorkspaces: workspaces, now })
  return { workspaces, count: workspaces.length }
}

export function createWorkspaceTemplate({ featureId, title, owner, target = 'DEV_TOOLING', version = '1.0.0', now = new Date().toISOString() }) {
  if (!featureId || !title || !owner) throw new Error('featureId, title, and owner are required')
  const workspace = {
    schemaVersion: '1.0.0',
    feature: {
      featureId, version, title, status: 'DRAFT', target, owner,
      problem: 'Describe the bounded development problem.', outcome: 'Describe the deterministic outcome.',
      inScope: ['development tooling'], outOfScope: ['student application behavior'],
      acceptanceCriteria: ['Define deterministic acceptance evidence.'], protectedContracts: ['lib/numerology.ts'],
      requiredGates: ['PLAN_GATE', 'CODE_GATE'], risks: [], failedGateHistory: [], approvalInvalidations: [],
      analytics: { applies: false, notApplicableReason: 'Repository-local development tooling only' }, rollbackIdentity: null,
      dataClassification: ['internal'], buildTimeAi: false, runtimeAi: false, rollbackPlanId: null, supersedes: null,
    },
    implementationPlan: { artifactId: featureId, version, summary: 'Complete the bounded implementation plan.', dependencies: [], parallelSafeWith: [], fileOwnershipRecord: 'Define repository-relative ownership before building.' },
    assignments: [], integrationContracts: [], approvals: [], approvalMetadata: [], handoffs: [], requiredChecks: [],
    gateState: { currentGate: 'PLAN_GATE', failedGates: [] },
    history: { transitions: [], failedTransitions: [], handoffs: [], approvalInvalidations: [], artifactVersions: [{ version, recordedAt: now, reason: 'Workspace initialized', supersedes: null }], rollbacks: [] },
  }
  assertNoPrivateData(workspace)
  assertWorkspaceSchema(workspace)
  assertComponentContracts(workspace)
  return workspace
}

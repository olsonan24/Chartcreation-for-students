import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateAllTrackedWorkspaces } from './orchestrator/core.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(scriptDir, '../../../..')
const schemaDir = path.join(repoRoot, 'docs/aionis-operating-system/schemas')
const fixtureDir = path.join(repoRoot, 'docs/aionis-operating-system/fixtures')
const manifestPath = path.join(repoRoot, 'docs/aionis-operating-system/manifests/operating-system-manifest.v1.json')

const require = createRequire(import.meta.url)
const workboxRequire = createRequire(require.resolve('workbox-build/package.json'))
const Ajv2020 = workboxRequire('ajv/dist/2020').default

export const lifecycleTransitions = new Set([
  'DRAFT>PLAN_APPROVED', 'PLAN_APPROVED>BUILDING', 'BUILDING>CODE_APPROVED',
  'CODE_APPROVED>STAGED', 'STAGED>RELEASE_APPROVED', 'RELEASE_APPROVED>RELEASED',
  'RELEASED>OBSERVING', 'OBSERVING>CLOSED', 'RELEASED>ROLLED_BACK',
  'PLAN_APPROVED>DRAFT', 'BUILDING>PLAN_APPROVED', 'CODE_APPROVED>BUILDING',
  'STAGED>CODE_APPROVED', 'RELEASE_APPROVED>STAGED'
])

export function assertLifecycleTransition({ from, to }) {
  if (!lifecycleTransitions.has(`${from}>${to}`)) throw new Error(`illegal lifecycle transition: ${from} -> ${to}`)
}

export function assertApprovalReference(approval, artifact) {
  if (approval.invalidatedAt) throw new Error('approval is invalidated')
  if (approval.decision !== 'APPROVED' && approval.decision !== 'CONDITIONAL') throw new Error('approval decision does not authorize work')
  if (approval.artifactId !== artifact.artifactId || approval.artifactVersion !== artifact.version) throw new Error('stale artifact version')
}

export function assertAnalyticsLink(event, contracts) {
  const contract = contracts.find((item) => item.contractId === event.contractId)
  if (!contract) throw new Error('unknown analytics contract')
  if (contract.version !== event.contractVersion || contract.status !== 'current') throw new Error('stale analytics contract')
  if (contract.eventClass !== event.eventClass || contract.target !== event.target) throw new Error('analytics class or target mismatch')
  if (contract.purposeKey !== event.purposeKey) throw new Error('purpose mismatch')
  if (!contract.eventNames.includes(event.eventName)) throw new Error('event name is not permitted by analytics contract')
  const prohibited = new Set(contract.prohibitedFields.map((field) => field.toLowerCase()))
  const walk = (value) => {
    if (!value || typeof value !== 'object') return
    for (const [key, nested] of Object.entries(value)) {
      if (prohibited.has(key.toLowerCase())) throw new Error(`prohibited analytics field: ${key}`)
      walk(nested)
    }
  }
  walk(event.payload)
  for (const field of Object.keys(event.payload)) {
    if (!contract.permittedFields.includes(field)) throw new Error(`analytics field is not permitted: ${field}`)
  }
}

export function applyOperation(input, operation) {
  const output = structuredClone(input)
  if (!operation) return output
  const segments = operation.path.split('.')
  let cursor = output
  for (const segment of segments.slice(0, -1)) cursor = cursor[segment]
  const key = segments.at(-1)
  if (operation.type === 'remove') delete cursor[key]
  else if (operation.type === 'replace') cursor[key] = operation.value
  else throw new Error(`unsupported fixture operation: ${operation.type}`)
  return output
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  ajv.addFormat('date-time', (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)) && /T/.test(value))
  return ajv
}

function listFiles(dir, predicate = () => true) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? listFiles(full, predicate) : (predicate(full) ? [full] : [])
  })
}

function assertSchemasAndFixtures() {
  const ajv = createAjv()
  const schemas = new Map()
  for (const file of listFiles(schemaDir, (item) => item.endsWith('.schema.json'))) {
    const schema = readJson(file)
    if (!ajv.validateSchema(schema)) throw new Error(`${path.relative(repoRoot, file)} fails Draft 2020-12 meta-validation: ${ajv.errorsText()}`)
    if (!schema['x-contractVersion']) throw new Error(`${path.relative(repoRoot, file)} has no x-contractVersion`)
    ajv.addSchema(schema)
    schemas.set(path.basename(file), schema)
  }

  const validCases = readJson(path.join(fixtureDir, 'valid-contracts.json'))
  const casesById = new Map(validCases.map((item) => [item.caseId, item]))
  for (const item of validCases) {
    const schema = schemas.get(item.schema)
    if (!schema) throw new Error(`${item.caseId} references unknown schema ${item.schema}`)
    const validate = ajv.getSchema(schema.$id)
    if (!validate(item.data)) throw new Error(`${item.caseId} should pass: ${ajv.errorsText(validate.errors)}`)
  }

  const analyticsContracts = validCases.filter((item) => item.schema === 'analytics-contract.schema.json').map((item) => item.data)
  const analyticsClasses = new Set(analyticsContracts.map((item) => item.eventClass))
  if (!analyticsClasses.has('operational') || !analyticsClasses.has('product-and-intelligence')) throw new Error('operational and product/intelligence analytics contracts must remain distinct')
  if (new Set(analyticsContracts.map((item) => item.contractId)).size !== analyticsContracts.length) throw new Error('analytics contract IDs must be unique')
  const approvals = validCases.filter((item) => item.schema === 'approval-record.schema.json').map((item) => item.data)
  for (const agent of validCases.filter((item) => item.schema === 'agent-contract.schema.json').map((item) => item.data)) {
    for (const approvalId of agent.approvalReferences) {
      const approval = approvals.find((item) => item.approvalId === approvalId)
      if (!approval) throw new Error(`unknown approval reference: ${approvalId}`)
      assertApprovalReference(approval, { artifactId: agent.featureId, version: agent.artifactVersion })
    }
  }
  for (const item of readJson(path.join(fixtureDir, 'invalid-contracts.json'))) {
    const base = item.baseCaseId ? casesById.get(item.baseCaseId) : null
    if (item.baseCaseId && !base) throw new Error(`${item.caseId} references missing base case ${item.baseCaseId}`)
    const data = item.validation === 'manifest-schema' ? applyOperation(readJson(manifestPath), item.operation) : (base ? applyOperation(base.data, item.operation) : item.data)
    let error
    try {
      if (item.validation === 'schema' || item.validation === 'manifest-schema') {
        const schema = schemas.get(item.validation === 'manifest-schema' ? 'operating-system-manifest.schema.json' : base.schema)
        const validate = ajv.getSchema(schema.$id)
        if (validate(data)) throw new Error('fixture unexpectedly passed')
        throw new Error(ajv.errorsText(validate.errors))
      }
      if (item.validation === 'lifecycle-transition') assertLifecycleTransition(data)
      else if (item.validation === 'approval-reference') assertApprovalReference(data, item.artifact)
      else if (item.validation === 'analytics-link') assertAnalyticsLink(data, analyticsContracts)
      else throw new Error(`unknown validation mode ${item.validation}`)
    } catch (caught) { error = caught }
    if (!error || !error.message.includes(item.expectedError)) throw new Error(`${item.caseId} failed for the wrong reason: ${error?.message ?? 'no error'}`)
  }
  return { ajv, schemas, validCases }
}

function assertContradictionContracts(schemas) {
  const required = (schemaName, fields) => {
    const present = new Set(schemas.get(schemaName)?.required || [])
    for (const field of fields) if (!present.has(field)) throw new Error(`${schemaName} does not resolve its documented requirement for ${field}`)
  }
  required('agent-contract.schema.json', ['featureId', 'artifactVersion', 'owner', 'dependencies', 'currentGate', 'handoffRecipient', 'approvalReferences'])
  required('feature-specification.schema.json', ['failedGateHistory', 'approvalInvalidations', 'analytics'])
  const lifecycle = new Set(schemas.get('feature-specification.schema.json').$defs.status.enum)
  for (const state of ['OBSERVING', 'ROLLED_BACK']) if (!lifecycle.has(state)) throw new Error(`feature lifecycle omits ${state}`)
  required('dream-proposal.schema.json', ['requestedApprovalGate', 'approvalStatus', 'rollbackTarget', 'contradictoryEvidenceIds', 'sensitivity', 'confidence', 'exactProposedChange', 'reversible', 'history'])
  required('generation-manifest.schema.json', ['provider', 'exactModelId', 'modelConfiguration', 'promptVersion', 'constitutionVersion', 'calculationEngineVersion', 'synthesisEngineVersion', 'evidenceIds', 'timeoutMs', 'retryCeiling', 'tokenBudget', 'costBudget', 'fallback', 'environment', 'releaseVersion', 'confidence', 'acceptancePolicy'])
  required('analytics-contract.schema.json', ['purpose', 'owner', 'lawfulOrConsentBasis', 'tenantHandling', 'permittedFields', 'prohibitedFields', 'sampling', 'aggregation', 'retention', 'deletion', 'access', 'alerts'])
  required('analytics-event.schema.json', ['contractId', 'contractVersion', 'purposeKey', 'payload'])
}

function assertManifest(ajv, schemas) {
  const manifest = readJson(manifestPath)
  const schema = schemas.get('operating-system-manifest.schema.json')
  const validate = ajv.getSchema(schema.$id)
  if (!validate(manifest)) throw new Error(`operating-system manifest fails: ${ajv.errorsText(validate.errors)}`)
  const capabilityIds = new Set()
  for (const capability of manifest.capabilities) {
    if (capabilityIds.has(capability.capabilityId)) throw new Error(`duplicate capability ID: ${capability.capabilityId}`)
    capabilityIds.add(capability.capabilityId)
    if (typeof capability.target !== 'string' || typeof capability.owner !== 'string') throw new Error(`${capability.capabilityId} must have exactly one target and owner`)
    if (!fs.existsSync(path.join(repoRoot, capability.relevantSource))) throw new Error(`capability source does not resolve: ${capability.relevantSource}`)
  }
  for (const capability of manifest.capabilities) for (const dependency of capability.dependencies) if (!capabilityIds.has(dependency)) throw new Error(`${capability.capabilityId} has unknown dependency ${dependency}`)
  for (const document of manifest.documents) if (!fs.existsSync(path.join(repoRoot, document))) throw new Error(`manifest document does not resolve: ${document}`)
  for (const contract of manifest.contracts) {
    const full = path.join(repoRoot, contract.path)
    if (!fs.existsSync(full)) throw new Error(`manifest contract does not resolve: ${contract.path}`)
    const registered = schemas.get(path.basename(full))
    if (!registered || registered['x-contractVersion'] !== contract.version) throw new Error(`stale contract version: ${contract.contractId}`)
  }
  if (new Set(manifest.contracts.map((item) => item.contractId)).size !== manifest.contracts.length) throw new Error('manifest contract IDs must be unique')
}

function assertSkills() {
  const skillsRoot = path.join(repoRoot, '.agents/skills')
  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((item) => item.isDirectory() && item.name.startsWith('aionis-'))) {
    const skillPath = path.join(skillsRoot, entry.name, 'SKILL.md')
    const metadataPath = path.join(skillsRoot, entry.name, 'agents/openai.yaml')
    if (!fs.existsSync(skillPath) || !fs.existsSync(metadataPath)) throw new Error(`${entry.name} is missing required skill files`)
    const skill = fs.readFileSync(skillPath, 'utf8')
    const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!frontmatter) throw new Error(`${entry.name} has invalid frontmatter`)
    const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim()
    const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim()
    if (name !== entry.name || !description) throw new Error(`${entry.name} has invalid name or description metadata`)
    const metadata = fs.readFileSync(metadataPath, 'utf8')
    for (const key of ['display_name:', 'short_description:', 'default_prompt:']) if (!metadata.includes(key)) throw new Error(`${entry.name} metadata lacks ${key}`)
  }
}

function assertMarkdownLinks() {
  const roots = [path.join(repoRoot, 'docs'), path.join(repoRoot, '.agents/skills')]
  for (const file of roots.flatMap((root) => listFiles(root, (item) => item.endsWith('.md')))) {
    const content = fs.readFileSync(file, 'utf8')
    for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const raw = match[1].trim().replace(/^<|>$/g, '')
      if (/^(https?:|mailto:|#)/.test(raw)) continue
      const target = decodeURIComponent(raw.split('#')[0])
      if (target && !fs.existsSync(path.resolve(path.dirname(file), target))) throw new Error(`broken Markdown link in ${path.relative(repoRoot, file)}: ${raw}`)
    }
  }
  for (const protectedPath of ['lib/numerology.ts', 'reference/Pass7-Recreated/Pass/Numerology.cs', 'reference/Pass7-Recreated/Pass/Report.cs', 'reference/Pass7-Recreated/Pass/PdfDocument.cs', 'app/page.tsx', 'app/globals.css']) {
    if (!fs.existsSync(path.join(repoRoot, protectedPath))) throw new Error(`protected path does not resolve: ${protectedPath}`)
  }
}

function gitLines(args) {
  try { return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean) }
  catch { return [] }
}

function assertScope() {
  const base = process.env.AIONIS_BASE_SHA || 'origin/main'
  const changed = new Set([
    ...gitLines(['diff', '--name-only', `${base}...HEAD`]),
    ...gitLines(['diff', '--name-only']),
    ...gitLines(['ls-files', '--others', '--exclude-standard'])
  ].map((item) => item.replaceAll('\\', '/')))
  const allowed = [
    /^docs\/aionis-operating-system\//, /^docs\/ai-context\/CRITICAL_STATE\.md$/, /^docs\/CURRENT_STATE\.md$/,
    /^docs\/FORMULA_GUARDRAILS\.md$/, /^docs\/PRINT_CONTRACT\.md$/, /^\.agents\/skills\/aionis-operating-system\//,
    /^\.github\/workflows\/verify\.yml$/, /^package\.json$/
  ]
  const unauthorized = [...changed].filter((file) => !allowed.some((pattern) => pattern.test(file)))
  if (unauthorized.length) throw new Error(`unauthorized Prompt 3 paths changed: ${unauthorized.join(', ')}`)
  const protectedPatterns = [/^app\//, /^features\//, /^lib\//, /^supabase\//, /^vite\.config\./, /^vercel\.json$/, /^public\//]
  const product = [...changed].filter((file) => protectedPatterns.some((pattern) => pattern.test(file)))
  if (product.length) throw new Error(`application product paths changed: ${product.join(', ')}`)
}

function assertPrivacy() {
  const files = [manifestPath, ...listFiles(fixtureDir, (item) => item.endsWith('.json'))]
  const forbidden = [
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
    [/postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/i, 'database credential'],
    [/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/, 'JWT'],
    [/\b\d{2}\/\d{2}\/\d{4}\b/, 'DOB-like value'],
    [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, 'email address']
  ]
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    for (const [pattern, label] of forbidden) if (pattern.test(content)) throw new Error(`${path.relative(repoRoot, file)} contains ${label}`)
  }
}

function assertAuditAndState() {
  const matrix = readJson(path.join(repoRoot, 'docs/aionis-operating-system/audits/requirement-matrix.json'))
  const entries = matrix.requirements || matrix.entries || matrix
  const statuses = new Set(['IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'MISSING', 'OUTDATED', 'CONTRADICTORY', 'NOT_CURRENTLY_APPLICABLE', 'BLOCKED_BY_DEPENDENCY'])
  for (const entry of entries) if (!statuses.has(entry.status)) throw new Error(`invalid audit status: ${entry.status}`)
  const manifest = readJson(manifestPath)
  const evidenceCapability = manifest.capabilities.find((item) => item.capabilityId === 'evidence-lineage')
  const evidenceRequirements = entries.filter((item) => item.requirement_id?.startsWith('AOS-07-'))
  if (evidenceCapability?.implementationStatus === 'implemented') {
    if (evidenceRequirements.length !== 3 || evidenceRequirements.some((item) => item.status !== 'IMPLEMENTED')) throw new Error('evidence-lineage manifest and AOS-07 audit statuses are inconsistent')
    if (!fs.existsSync(path.join(repoRoot, evidenceCapability.relevantSource))) throw new Error('implemented evidence-lineage capability source does not resolve')
  }
  const conflict = fs.readFileSync(path.join(repoRoot, 'docs/aionis-operating-system/audits/conflict-register.md'), 'utf8')
  for (let index = 1; index <= 7; index += 1) if (!conflict.includes("| `CR-0" + index + "` | RESOLVED |")) throw new Error(`CR-0${index} is not deterministically marked RESOLVED`)
  const state = fs.readFileSync(path.join(repoRoot, 'docs/CURRENT_STATE.md'), 'utf8') + fs.readFileSync(path.join(repoRoot, 'docs/ai-context/CRITICAL_STATE.md'), 'utf8')
  if (evidenceCapability?.implementationStatus === 'implemented' && !state.includes('Evidence Lineage and Reproducibility Milestone')) throw new Error('implemented evidence-lineage capability is missing current-state milestone')
  for (const stale of ['Current documentation branch: `docs/aionis-ai-operating-system`', 'Goal: complete Prompt 1 only', 'Prompts 2 through 12']) if (state.includes(stale)) throw new Error(`stale baseline statement remains: ${stale}`)
  const routing = fs.readFileSync(path.join(repoRoot, 'docs/aionis-operating-system/12-model-routing-cost-and-capacity.md'), 'utf8')
  if (routing.includes('aionis-timeline-v3')) throw new Error('stale PWA cache identifier remains')
}

export function runAllValidations() {
  const { ajv, schemas } = assertSchemasAndFixtures()
  assertContradictionContracts(schemas)
  assertManifest(ajv, schemas)
  assertSkills()
  assertMarkdownLinks()
  assertScope()
  assertPrivacy()
  assertAuditAndState()
  const orchestrator = validateAllTrackedWorkspaces()
  return { schemas: schemas.size, orchestratorWorkspaces: orchestrator.count }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runAllValidations()
  console.log(`Aionis validation passed: ${result.schemas} shared schemas, ${result.orchestratorWorkspaces} orchestrator workspaces, golden fixtures, manifest, inventory, skills, links, scope, privacy, audit state, and contract semantics.`)
}

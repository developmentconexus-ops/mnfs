import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repositoryRoot = resolve(new URL('../', import.meta.url).pathname)
const root = process.env.CONEXUS_ARCH_VERIFY_ROOT
  ? resolve(process.env.CONEXUS_ARCH_VERIFY_ROOT)
  : repositoryRoot
const read = path => readFileSync(resolve(root, path), 'utf8')
const errors = []

const roadmap = read('docs/roadmap.md')
const architecture = read('docs/architecture/index.md')
const contract = read('docs/phases/3n-architecture-verification.md')

const sameArray = (left, right) =>
  left.length === right.length && left.every((value, index) => value === right[index])

const sectionBetween = (text, startMarker, endMarker, label) => {
  const start = text.indexOf(startMarker)
  const end = start < 0 ? -1 : text.indexOf(endMarker, start + startMarker.length)
  if (start < 0 || end < 0) {
    errors.push(`missing ${label} section boundary`)
    return ''
  }
  return text.slice(start + startMarker.length, end)
}

// 3N-S1 — progression boundary.
const roadmapRows = [...roadmap.matchAll(/^\| ([^|]+?) \| ([^|]+?) \|/gm)]
  .map(([, name, status]) => [name.trim(), status.trim()])
const statusByName = new Map(roadmapRows)

for (const phase of ['3A', '3B–3K', '3L', '3M']) {
  if (statusByName.get(phase) !== 'CLOSED') errors.push(`${phase} must remain CLOSED during 3N`)
}

const phase3N = statusByName.get('3N')
const phase3O = statusByName.get('3O')
if (phase3N === 'NEXT / NOT STARTED') {
  if (phase3O !== 'NOT STARTED') errors.push('3O must remain NOT STARTED before 3N closure')
} else if (phase3N === 'CLOSED') {
  if (phase3O !== 'NEXT / NOT STARTED') errors.push('3O must become NEXT / NOT STARTED only after 3N closure')
} else {
  errors.push(`3N has illegal verification-stage status: ${phase3N ?? 'missing'}`)
}

if (statusByName.get('C-018') !== 'NOT RATIFIED') errors.push('C-018 must remain NOT RATIFIED during 3N')
if (statusByName.get('Product implementation') !== 'BLOCKED') errors.push('Product implementation must remain BLOCKED during 3N')

// 3N-S2 — semantic-owner closure.
const expectedOwners = [
  'Identity & Access',
  'Workspace',
  'Project',
  'Builder',
  'Artifact Registry',
  'Connections',
  'Capability Gateway',
  'Brain',
  'Production Agent Runtime (PAR)',
  'Release',
  'Observability & Audit',
  'Attachments & Blob',
  'Managed Application Runtime (MAR)'
]
const ownerSection = sectionBetween(
  architecture,
  '## 4. Semantic owner/module architecture',
  '## 4.1 Closed dependency architecture',
  'semantic owner'
)
const actualOwners = [...ownerSection.matchAll(/^\| \*\*(.+?)\*\* \|/gm)].map(([, owner]) => owner)
if (!sameArray(actualOwners, expectedOwners)) {
  errors.push(`semantic owner set changed: expected ${expectedOwners.join(', ')}; got ${actualOwners.join(', ') || 'none'}`)
}
if (!architecture.includes('recovery meaning remains owner-local; no generic Recovery owner/FSM exists')) {
  errors.push('owner-local recovery law is missing')
}

// 3N-S3 — closed dependency architecture.
const expectedL7 = [
  'CreateProject',
  'SetProjectBinding',
  'QualifyConnection',
  'InceptionInvestigation',
  'BrainHealthProbe',
  'ComposeRelease',
  'PromoteRelease'
]
const l7Match = architecture.match(/contains exactly seven flows:\s*```text\s*([\s\S]*?)```/)
const actualL7 = l7Match
  ? l7Match[1].split('\n').map(line => line.trim()).filter(Boolean)
  : []
if (!sameArray(actualL7, expectedL7)) {
  errors.push(`L7 orchestration set changed: expected ${expectedL7.join(', ')}; got ${actualL7.join(', ') || 'none'}`)
}

if (!architecture.includes('There is exactly one domain dependency inversion:')) {
  errors.push('single domain dependency inversion projection changed')
}

const expectedInfrastructureBoundaries = ['CodingRuntime', 'CredentialBackend', 'BlobStore/CAS', 'GitInfra']
const boundaryMatch = architecture.match(/3D infrastructure boundaries are exactly ([^.]+)\./)
const actualInfrastructureBoundaries = boundaryMatch
  ? [...boundaryMatch[1].matchAll(/`([^`]+)`/g)].map(([, name]) => name)
  : []
if (!sameArray(actualInfrastructureBoundaries, expectedInfrastructureBoundaries)) {
  errors.push(`infrastructure boundary set changed: expected ${expectedInfrastructureBoundaries.join(', ')}; got ${actualInfrastructureBoundaries.join(', ') || 'none'}`)
}

// 3N-S4 — accepted falsifier census and earliest remaining real proof route.
const expectedInvariants = [
  'Workspace isolation bypass through Project/DB/runtime shortcuts',
  'coding crossing a materially insufficient Project Baseline',
  'runtime/session closing Change authority by itself',
  'Plan/tasks/UI state disagreeing with Hub authority without detection',
  'E2B cross-incarnation silent write replay',
  'Brain canonical source accidentally residing in first Project repo',
  'Brain binding silently following new Brain revision',
  'Brain Discovery proposal becoming authority without human publish',
  'AnalyticQuery escaping semantic/SELECT-only boundaries',
  'caller/model selecting arbitrary Connection/effect destination',
  'Gateway duplicate/lost-response replay manufacturing second effect',
  'Gateway unresolved effect bypassed by fresh AgentRun/new admission',
  'Gateway idempotency/reconciliation scope accepted when deliberately under-declared',
  'Product Agent losing exact old Release pins across suspension/restart',
  'Builder/PAR mutable-state leakage',
  'stale RequestContext authority resurrection',
  'provider call occurring without spend reservation',
  'managed sync replaying all missed slots',
  'managed sync recovery depending on effect-capable machinery with no current consumer',
  'telemetry manufacturing F5/terminal truth',
  'Published App authority collapsing into Control Plane',
  'Release AVAILABLE/pointer swap masquerading as SERVED_VERIFIED',
  'migration/EnvironmentConformance drift hidden as success',
  'storage object key bypassing owner authorization',
  'restore without positive generation continuity opening normal PROD',
  'restored stale authority regaining privileged/autonomous/effectful use',
  'post-cutoff canonical Git silently discarded or promoted to current Hub authority',
  'first vertical read model proving itself / unsupported KPI fabricated'
]
const invariantSection = sectionBetween(
  architecture,
  '## 46. Verification invariants carried into 3N / 3O',
  '## 47. Reopen triggers by family',
  'section-46 invariant'
)
const invariantMatch = invariantSection.match(/must be able to falsify at least:\s*```text\s*([\s\S]*?)```/)
const actualInvariants = invariantMatch
  ? invariantMatch[1].split('\n').map(line => line.trim()).filter(Boolean)
  : []
if (!sameArray(actualInvariants, expectedInvariants)) {
  errors.push(`section-46 invariant census changed: expected ${expectedInvariants.length}; got ${actualInvariants.length}`)
}

const routeRows = [...contract.matchAll(/^\| (3N-V\d{2}) \| ([A-Z0-9_]+) \| (.+?) \|$/gm)]
  .map(([, id, stage, falsifier]) => ({ id, stage, falsifier }))
if (routeRows.length !== expectedInvariants.length) {
  errors.push(`3N routing table must contain exactly ${expectedInvariants.length} falsifiers; found ${routeRows.length}`)
}
const routeById = new Map()
for (const row of routeRows) {
  if (routeById.has(row.id)) errors.push(`duplicate 3N routing id: ${row.id}`)
  routeById.set(row.id, row)
}

for (let index = 0; index < expectedInvariants.length; index += 1) {
  const id = `3N-V${String(index + 1).padStart(2, '0')}`
  const expectedStage = index < 24 ? 'FIRST_BUILD' : index < 27 ? 'FIRST_PRODUCTION' : '3O'
  const row = routeById.get(id)
  if (!row) {
    errors.push(`missing 3N routing id: ${id}`)
    continue
  }
  if (row.stage !== expectedStage) errors.push(`${id} must route to ${expectedStage}; got ${row.stage}`)
  if (row.falsifier !== expectedInvariants[index]) errors.push(`${id} falsifier text changed`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('3N architecture verification passed (28 falsifiers: 24 FIRST_BUILD, 3 FIRST_PRODUCTION, 1 3O).')
}

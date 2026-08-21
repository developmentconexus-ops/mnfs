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
const data = read('docs/reference/data-and-persistence.md')
const contract = read('docs/phases/3n-architecture-verification.md')

const sameSet = (left, right) =>
  left.length === right.length &&
  new Set(left).size === left.length &&
  new Set(right).size === right.length &&
  left.every(value => right.includes(value))

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

// 3N-S2 — semantic-owner closure. Closed sets are compared as sets, not presentation order.
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
if (!sameSet(actualOwners, expectedOwners)) {
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
if (!sameSet(actualL7, expectedL7)) {
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
if (!sameSet(actualInfrastructureBoundaries, expectedInfrastructureBoundaries)) {
  errors.push(`infrastructure boundary set changed: expected ${expectedInfrastructureBoundaries.join(', ')}; got ${actualInfrastructureBoundaries.join(', ') || 'none'}`)
}

// 3N-S4 — current-authority coherence.
const staleSpendWording = 'provider call occurring without spend reservation'
if (architecture.includes(staleSpendWording) || contract.includes(staleSpendWording)) {
  errors.push('superseded model-spend reservation wording reappeared after 3L-R1')
}
if (!architecture.includes('provider/model execution escaping finite server-derived call/step/retry/fallback bounds')) {
  errors.push('current bounded F1 model-execution falsifier is missing')
}

const recordSection = sectionBetween(
  data,
  '## 6.5.1 Current durable record inventory',
  '## 6.5.2 Current Tier-2 cross-module FK allowlist — 16',
  'durable record inventory'
)
const declaredRecordCount = Number(recordSection.match(/TOTAL\s+(\d+)/)?.[1] ?? NaN)
const recordRows = [...recordSection.matchAll(/^([a-z]+): (.+)$/gm)]
  .map(([, schema, records]) => ({ schema, records: records.split(' / ').map(value => value.trim()).filter(Boolean) }))
const actualRecordCount = recordRows.reduce((sum, row) => sum + row.records.length, 0)
const declaredArchitectureRecordCount = Number(data.match(/closed at (\d+) record classes/)?.[1] ?? NaN)
if (!Number.isFinite(declaredRecordCount) || actualRecordCount !== declaredRecordCount || declaredRecordCount !== declaredArchitectureRecordCount) {
  errors.push(`durable record inventory count changed: projected=${actualRecordCount}, declared=${declaredRecordCount}, architecture=${declaredArchitectureRecordCount}`)
}

const fkHeadingCount = Number(data.match(/## 6\.5\.2 Current Tier-2 cross-module FK allowlist — (\d+)/)?.[1] ?? NaN)
const fkSection = sectionBetween(
  data,
  '## 6.5.2 Current Tier-2 cross-module FK allowlist — 16',
  'Tier-3 semantic references/digests',
  'Tier-2 FK allowlist'
)
const fkRows = [...fkSection.matchAll(/^\| (\d+) \| `([^`]+)` \|$/gm)]
  .map(([, number, fk]) => ({ number: Number(number), fk }))
if (!Number.isFinite(fkHeadingCount) || fkRows.length !== fkHeadingCount) {
  errors.push(`Tier-2 FK allowlist count changed: projected=${fkRows.length}, declared=${fkHeadingCount}`)
}
if (new Set(fkRows.map(row => row.fk)).size !== fkRows.length) errors.push('Tier-2 FK allowlist contains duplicates')

// 3N-S5 — architecture §46 is the oracle for the explicit minimum and its routing.
const invariantSection = sectionBetween(
  architecture,
  '## 46. Verification invariants carried into 3N / 3O',
  '## 47. Reopen triggers by family',
  'section-46 invariant'
)
const declaredMinimum = Number(invariantSection.match(/Accepted explicit minimum count = (\d+)/)?.[1] ?? NaN)
const invariantMatch = invariantSection.match(/```text\s*([\s\S]*?)```/)
const invariantLines = invariantMatch
  ? invariantMatch[1].split('\n').map(line => line.trim()).filter(Boolean)
  : []

const parseInvariant = line => {
  if (line.startsWith('FIRST_BUILD | ')) {
    return { contractStage: 'FIRST_BUILD', executionStage: 'FIRST_BUILD', falsifier: line.slice('FIRST_BUILD | '.length) }
  }
  if (line.startsWith('FIRST_PRODUCTION | ')) {
    return { contractStage: 'FIRST_PRODUCTION', executionStage: 'FIRST_PRODUCTION', falsifier: line.slice('FIRST_PRODUCTION | '.length) }
  }
  if (line.startsWith('3O_CONTRACT→FIRST_BUILD | ')) {
    return { contractStage: '3O_CONTRACT', executionStage: 'FIRST_BUILD', falsifier: line.slice('3O_CONTRACT→FIRST_BUILD | '.length) }
  }
  errors.push(`invalid section-46 routing syntax: ${line}`)
  return null
}
const invariants = invariantLines.map(parseInvariant).filter(Boolean)
if (!Number.isFinite(declaredMinimum) || invariants.length !== declaredMinimum) {
  errors.push(`section-46 minimum falsifier count changed: projected=${invariants.length}, declared=${declaredMinimum}`)
}
if (new Set(invariants.map(item => item.falsifier)).size !== invariants.length) {
  errors.push('section-46 explicit minimum contains duplicate falsifiers')
}

const routeRows = [...contract.matchAll(/^\| (3N-V\d{2}) \| ([A-Z0-9_]+) \| ([A-Z0-9_]+) \| (.+?) \|$/gm)]
  .map(([, id, contractStage, executionStage, falsifier]) => ({ id, contractStage, executionStage, falsifier }))
if (routeRows.length !== invariants.length) {
  errors.push(`3N routing table must cover the architecture explicit minimum: expected ${invariants.length}, found ${routeRows.length}`)
}
const routeById = new Map()
for (const row of routeRows) {
  if (routeById.has(row.id)) errors.push(`duplicate 3N routing id: ${row.id}`)
  routeById.set(row.id, row)
}

for (let index = 0; index < invariants.length; index += 1) {
  const id = `3N-V${String(index + 1).padStart(2, '0')}`
  const expected = invariants[index]
  const row = routeById.get(id)
  if (!row) {
    errors.push(`missing 3N routing id: ${id}`)
    continue
  }
  if (
    row.contractStage !== expected.contractStage ||
    row.executionStage !== expected.executionStage ||
    row.falsifier !== expected.falsifier
  ) {
    errors.push(`${id} routing differs from architecture authority`)
  }
}

// 3N-S6 — carry every architecture §42 proof family without inventing new Product authority.
const proofSection = sectionBetween(
  architecture,
  '## 42. Downstream proof families not pulled artificially into 3L',
  'Named proof routing remains explicit:',
  'downstream proof families'
)
const proofMatch = proofSection.match(/```text\s*([\s\S]*?)```/)
const proofFamilies = proofMatch
  ? proofMatch[1].split('\n').map(line => line.trim()).filter(Boolean)
  : []
const contractProofSection = sectionBetween(
  contract,
  '## Downstream proof-family coverage',
  '## Lead global-coherence challenge',
  '3N downstream proof-family coverage'
)
const contractProofRows = [...contractProofSection.matchAll(/^\| ([^|]+?) \| ([^|]+?) \|$/gm)]
  .map(([, family, routing]) => ({ family: family.trim(), routing: routing.trim() }))
  .filter(row => row.family !== 'Proof family' && !/^---+$/.test(row.family))
const contractFamilies = contractProofRows.map(row => row.family)
if (!sameSet(proofFamilies, contractFamilies)) {
  const missing = proofFamilies.filter(family => !contractFamilies.includes(family))
  const extra = contractFamilies.filter(family => !proofFamilies.includes(family))
  errors.push(`downstream proof-family coverage missing or extra: missing=${missing.join('; ') || 'none'}; extra=${extra.join('; ') || 'none'}`)
}

const allowedProofRoutes = new Set(['FIRST_BUILD', 'FIRST_PRODUCTION', '3O_CONTRACT → FIRST_BUILD'])
for (const row of contractProofRows) {
  if (!allowedProofRoutes.has(row.routing)) errors.push(`invalid downstream proof-family routing for ${row.family}: ${row.routing}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  const routeCounts = invariants.reduce((counts, item) => {
    const key = `${item.contractStage}→${item.executionStage}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
    return counts
  }, new Map())
  const routeSummary = [...routeCounts.entries()].map(([key, count]) => `${count} ${key}`).join(', ')
  console.log(
    `3N architecture verification passed (${invariants.length} explicit minimum falsifiers: ${routeSummary}; ` +
    `${proofFamilies.length} downstream proof families; data ${actualRecordCount} records/${fkRows.length} Tier-2 FKs).`
  )
}

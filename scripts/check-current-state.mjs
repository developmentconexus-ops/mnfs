import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../', import.meta.url).pathname)
const read = path => readFileSync(resolve(root, path), 'utf8')
const canonical = [
  'docs/index.md',
  'docs/roadmap.md',
  'docs/product/contract.md',
  'docs/architecture/index.md',
  'docs/decisions/index.md',
  'docs/development/engineering-rules.md'
]
const errors = []

for (const path of canonical) if (!existsSync(resolve(root, path))) errors.push(`missing canonical document: ${path}`)

const roadmap = existsSync(resolve(root, 'docs/roadmap.md')) ? read('docs/roadmap.md') : ''
const rows = [...roadmap.matchAll(/^\| ([^|]+?) \| ([^|]+?) \|/gm)].map(([, name, status]) => ({ name: name.trim(), status: status.trim() }))
const byName = new Map(rows.map(row => [row.name, row.status]))
for (const required of ['3A', '3B–3K', '3L', '3M', '3N', '3O', 'C-018', 'Product implementation']) {
  if (!byName.has(required)) errors.push(`roadmap missing status row: ${required}`)
}

const phases = rows.filter(({ name }) => /^3(?:[A-Z]|[A-Z]–3[A-Z])$/.test(name))
const allowedPhaseStatuses = new Set(['CLOSED', 'NEXT / NOT STARTED', 'NOT STARTED'])
for (const { name, status } of phases) if (!allowedPhaseStatuses.has(status)) errors.push(`roadmap invalid phase status for ${name}: ${status}`)
const nextPhases = phases.filter(({ status }) => status === 'NEXT / NOT STARTED')
const firstOpen = phases.findIndex(({ status }) => status !== 'CLOSED')
if (firstOpen < 0) {
  if (nextPhases.length !== 0) errors.push('roadmap cannot contain NEXT after all phases close')
} else {
  if (nextPhases.length !== 1) errors.push(`roadmap must contain exactly one NEXT / NOT STARTED phase; found ${nextPhases.length}`)
  if (phases[firstOpen]?.status !== 'NEXT / NOT STARTED') errors.push('roadmap first non-closed phase must be NEXT / NOT STARTED')
  if (phases.slice(firstOpen + 1).some(({ status }) => status !== 'NOT STARTED')) errors.push('roadmap phases after NEXT must be NOT STARTED')
}
if (byName.get('C-018') === 'RATIFIED' && phases.some(({ status }) => status !== 'CLOSED')) errors.push('C-018 cannot be RATIFIED before all phases close')
if (byName.get('Product implementation') !== 'BLOCKED' && byName.get('C-018') !== 'RATIFIED') errors.push('Product implementation cannot be unblocked before C-018 ratification')

const decisions = existsSync(resolve(root, 'docs/decisions/index.md')) ? read('docs/decisions/index.md') : ''
const decisionRows = [...decisions.matchAll(/^\| (C-[A-Z0-9-]+) \| .*? \| ([^|]+?) \|/gm)].map(([, id, status]) => ({ id, status: status.trim() }))
const controlled = new Set(['CURRENT', 'PRESERVE', 'REFINED', 'PARTIALLY_SUPERSEDED', 'SUPERSEDED', 'DEFERRED', 'REJECTED_F1', 'REOPEN', 'NOT RATIFIED'])
for (const { id, status } of decisionRows) {
  if (![...controlled].some(term => status === term || status.startsWith(`${term} / `) || status.startsWith(`${term} AS `))) {
    errors.push(`${id} has uncontrolled disposition: ${status}`)
  }
}

const bootstrapPaths = ['AGENTS.md', 'docs/index.md', 'docs/roadmap.md']
const bootstrapBytes = bootstrapPaths.reduce((sum, path) => sum + Buffer.byteLength(read(path)), 0)
if (bootstrapBytes > 20 * 1024) errors.push(`bootstrap budget exceeded: ${bootstrapBytes} > 20480`)

for (const path of ['AGENTS.md', 'README.md', 'docs/index.md']) {
  const text = read(path)
  if (!text.includes('roadmap.md')) errors.push(`${path} must route mutable status to docs/roadmap.md`)
  if (/3[A-Z]\s*(?:=|is)\s*(?:NEXT|next)/i.test(text) || /NEXT \/ NOT STARTED/.test(text)) errors.push(`${path} must not restate mutable phase status`)
}

const readme = read('README.md')
if (/NOT RATIFIED|Product implementation\s*=|Current phase/i.test(readme)) errors.push('README.md must remain landing-only')

const product = read('docs/product/contract.md')
for (const stale of ['BT-3N NEXT', 'Package B:** IN PROGRESS', 'Package D Managed Execution             = REDERIVE']) {
  if (product.includes(stale)) errors.push(`Product contract contains stale mutable qualification status: ${stale}`)
}

for (const obsolete of [
  'docs/INDEX.md',
  'docs/ROADMAP.md',
  'docs/PRODUCT.md',
  'docs/ARCHITECTURE.md',
  'docs/DECISIONS.md',
  'docs/OPERATING-MODEL.md',
  'docs/engineering/METHOD.md'
]) {
  if (existsSync(resolve(root, obsolete))) errors.push(`superseded canonical path remains: ${obsolete}`)
}

if (!read('AGENTS.md').includes('REPOSITORY-STANDARD.md')) errors.push('AGENTS.md must cite canonical Repository Standard')
if (!read('docs/development/engineering-rules.md').includes('conexus-methodology')) errors.push('local engineering rules must cite canonical organizational authorities')

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Canonical current state passed (bootstrap_bytes=${bootstrapBytes}).`)
}

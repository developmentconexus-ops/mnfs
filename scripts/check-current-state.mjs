import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../', import.meta.url).pathname)
const canonical = ['docs/INDEX.md', 'docs/PRODUCT.md', 'docs/ARCHITECTURE.md', 'docs/DECISIONS.md', 'docs/ROADMAP.md', 'docs/OPERATING-MODEL.md']
const errors = []

for (const path of canonical) {
  const absolute = resolve(root, path)
  if (!existsSync(absolute)) errors.push(`missing canonical document: ${path}`)
}

const roadmap = existsSync(resolve(root, 'docs/ROADMAP.md')) ? readFileSync(resolve(root, 'docs/ROADMAP.md'), 'utf8') : ''
const rows = [...roadmap.matchAll(/^\| ([^|]+?) \| ([^|]+?) \|/gm)].map(([, name, status]) => ({ name: name.trim(), status: status.trim() }))
const byName = new Map(rows.map(row => [row.name, row.status]))
for (const required of ['3A', '3B–3K', '3L', '3M', '3N', '3O', 'C-018', 'Product implementation']) {
  if (!byName.has(required)) errors.push(`ROADMAP missing status row: ${required}`)
}

const phases = rows.filter(({ name }) => /^3(?:[A-Z]|[A-Z]–3[A-Z])$/.test(name))
const allowedPhaseStatuses = new Set(['CLOSED', 'NEXT / NOT STARTED', 'NOT STARTED'])
for (const { name, status } of phases) {
  if (!allowedPhaseStatuses.has(status)) errors.push(`ROADMAP invalid phase status for ${name}: ${status}`)
}
const nextPhases = phases.filter(({ status }) => status === 'NEXT / NOT STARTED')
const firstOpen = phases.findIndex(({ status }) => status !== 'CLOSED')
if (firstOpen < 0) {
  if (nextPhases.length !== 0) errors.push('ROADMAP cannot contain NEXT after all phases close')
} else {
  if (nextPhases.length !== 1) errors.push(`ROADMAP must contain exactly one NEXT / NOT STARTED phase while phases remain; found ${nextPhases.length}`)
  if (phases[firstOpen]?.status !== 'NEXT / NOT STARTED') errors.push('ROADMAP first non-closed phase must be NEXT / NOT STARTED')
  if (phases.slice(firstOpen + 1).some(({ status }) => status !== 'NOT STARTED')) errors.push('ROADMAP phases after NEXT must be NOT STARTED')
}
if (byName.get('C-018') === 'RATIFIED' && phases.some(({ status }) => status !== 'CLOSED')) errors.push('C-018 cannot be RATIFIED before all phases close')
if (byName.get('Product implementation') !== 'BLOCKED' && byName.get('C-018') !== 'RATIFIED') errors.push('Product implementation cannot be unblocked before C-018 ratification')

const decisions = readFileSync(resolve(root, 'docs/DECISIONS.md'), 'utf8')
const decisionRows = [...decisions.matchAll(/^\| (C-\d{3}) \| .*? \| ([^|]+?) \|/gm)].map(([, id, status]) => ({ id, status: status.trim() }))
const controlledDispositions = new Set(['CURRENT', 'PRESERVE', 'REFINED', 'PARTIALLY_SUPERSEDED', 'SUPERSEDED', 'DEFERRED', 'REJECTED_F1', 'REOPEN'])
for (const { id, status } of decisionRows) {
  if (id === 'C-018') continue
  const disposition = [...controlledDispositions].find(term => status === term || status.startsWith(`${term} / `) || status.startsWith(`${term} AS `))
  if (!disposition) errors.push(`${id} has uncontrolled or promoted disposition: ${status}`)
}

for (const path of ['AGENTS.md', 'README.md', 'docs/INDEX.md']) {
  const text = readFileSync(resolve(root, path), 'utf8')
  if (!text.includes('ROADMAP.md')) errors.push(`${path} must route mutable status to ROADMAP.md`)
  if (/3M\s*(?:=|is)\s*(?:NEXT|next)/i.test(text)) errors.push(`${path} must not restate mutable 3M status`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Canonical current state passed.')
}

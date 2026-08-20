import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../', import.meta.url).pathname)
const canonical = ['docs/INDEX.md', 'docs/PRODUCT.md', 'docs/ARCHITECTURE.md', 'docs/DECISIONS.md', 'docs/ROADMAP.md', 'docs/OPERATING-MODEL.md']
const errors = []
const texts = []

for (const path of canonical) {
  const absolute = resolve(root, path)
  if (!existsSync(absolute)) errors.push(`missing canonical document: ${path}`)
  else texts.push(readFileSync(absolute, 'utf8'))
}

const combined = texts.join('\n')
for (const required of ['3L = CLOSED', '3M = NEXT / NOT STARTED', '3N = NOT STARTED', '3O = NOT STARTED', 'C-018 = NOT RATIFIED', 'Product implementation = BLOCKED']) {
  if (!combined.includes(required)) errors.push(`missing canonical state: ${required}`)
}

const roadmap = existsSync(resolve(root, 'docs/ROADMAP.md')) ? readFileSync(resolve(root, 'docs/ROADMAP.md'), 'utf8') : ''
const nextPhases = roadmap.match(/\bNEXT\s*\/\s*NOT STARTED\b/g) ?? []
if (nextPhases.length !== 1) errors.push(`ROADMAP must contain exactly one NEXT / NOT STARTED phase; found ${nextPhases.length}`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Canonical current state passed.')
}

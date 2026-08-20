import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
const errors = []
const forbiddenLegacy = ['m', 'n', 'f', 's'].join('')

for (const path of tracked) {
  const normalized = path.toLowerCase()
  if (normalized.includes(forbiddenLegacy)) errors.push(`legacy path: ${path}`)
  if (normalized.startsWith('docs/superpowers/')) errors.push(`superseded documentation tree: ${path}`)
  if (/(handoff|dialogue|round|correction-handoff)/i.test(path)) errors.push(`transient path: ${path}`)
  if (/^(ai_dialog|knowledge-migration)\.md$/i.test(path)) errors.push(`temporary root artifact: ${path}`)

  const bytes = readFileSync(new URL(path, root))
  if (!bytes.includes(0) && bytes.toString('utf8').toLowerCase().includes(forbiddenLegacy)) {
    errors.push(`legacy content: ${path}`)
  }
}

const packageJson = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
if (packageJson.name !== 'conexus-os' || packageJson.private !== true) {
  errors.push('package identity must be private conexus-os')
}

for (const forbidden of ['.mnfs/', '.pi/skills/mnfs-plan/', 'bin/mnfs.mjs', 'docs/conexus/current/']) {
  if (tracked.some(path => path.startsWith(forbidden))) errors.push(`forbidden legacy/current-router path: ${forbidden}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Repository hygiene passed (${tracked.length} tracked files).`)
}

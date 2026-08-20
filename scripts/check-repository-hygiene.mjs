import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../', import.meta.url).pathname)
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
const errors = []
const forbiddenLegacy = ['m', 'n', 'f', 's'].join('')
const reviewCandidate = process.env.REVIEW_CANDIDATE_REF || ''
const reviewFile = 'docs/work/current/ai-dialog.md'

if (reviewCandidate) {
  const changed = execFileSync('git', ['diff', '--name-only', `${reviewCandidate}...HEAD`], { cwd: root, encoding: 'utf8' })
    .trim().split('\n').filter(Boolean)
  if (changed.length !== 1 || changed[0] !== reviewFile) {
    errors.push(`review branch must differ from candidate only by ${reviewFile}: ${changed.join(', ') || 'no diff'}`)
  }
  const candidatePaths = execFileSync('git', ['ls-tree', '-r', '--name-only', reviewCandidate], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(Boolean)
  if (candidatePaths.some(path => path.startsWith('docs/work/'))) errors.push('review candidate itself contains docs/work/**')
} else if (existsSync(resolve(root, 'docs/work'))) {
  errors.push('merge candidate/main must not contain docs/work/**')
}

for (const path of tracked) {
  const normalized = path.toLowerCase()
  if (normalized.includes(forbiddenLegacy)) errors.push(`legacy path: ${path}`)
  if (normalized.startsWith('docs/superpowers/')) errors.push(`superseded documentation tree: ${path}`)
  if (/(handoff|dialogue|round|correction-handoff)/i.test(path) && path !== reviewFile) errors.push(`transient path: ${path}`)
  if (/^(ai_dialog|knowledge-migration)\.md$/i.test(path)) errors.push(`temporary root artifact: ${path}`)
  if (normalized.startsWith('docs/work/') && !(reviewCandidate && path === reviewFile)) errors.push(`temporary work path in candidate: ${path}`)

  const bytes = readFileSync(resolve(root, path))
  if (!bytes.includes(0) && bytes.toString('utf8').toLowerCase().includes(forbiddenLegacy)) {
    errors.push(`legacy content: ${path}`)
  }
}

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
if (packageJson.name !== 'conexus-os' || packageJson.private !== true) errors.push('package identity must be private conexus-os')

for (const forbidden of [
  `.${forbiddenLegacy}/`,
  `.pi/skills/${forbiddenLegacy}-plan/`,
  `bin/${forbiddenLegacy}.mjs`,
  'docs/conexus/current/',
  'docs/INDEX.md',
  'docs/ROADMAP.md',
  'docs/PRODUCT.md',
  'docs/ARCHITECTURE.md',
  'docs/DECISIONS.md',
  'docs/OPERATING-MODEL.md',
  'docs/engineering/METHOD.md',
  'docs/engineering/REPOSITORY-WORKFLOW.md'
]) {
  if (tracked.some(path => path.startsWith(forbidden))) errors.push(`forbidden superseded path: ${forbidden}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Repository hygiene passed (${tracked.length} tracked files).`)
}

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { test } from 'node:test'
import { resolve } from 'node:path'

const root = resolve(new URL('../../', import.meta.url).pathname)
const run = script => spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })

test('Conexus OS repository contract is green', () => {
  for (const script of [
    'scripts/check-repository-hygiene.mjs',
    'scripts/check-doc-index.mjs',
    'scripts/check-current-state.mjs',
    'scripts/check-qualification-provenance.mjs'
  ]) {
    execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' })
  }
})

test('repository hygiene guard fires on temporary work contamination', () => {
  const workDir = resolve(root, 'docs/work/current')
  const file = resolve(workDir, 'forbidden-fixture.md')
  const existed = existsSync(file)
  const original = existed ? readFileSync(file, 'utf8') : null
  mkdirSync(workDir, { recursive: true })
  writeFileSync(file, '# temporary review\n')
  try {
    const result = run('scripts/check-repository-hygiene.mjs')
    const output = `${result.stdout}\n${result.stderr}`
    if (result.status === 0 || !output.includes('docs/work')) throw new Error('hygiene negative control did not fire')
  } finally {
    if (existed) writeFileSync(file, original)
    else rmSync(file, { force: true })
  }
})

test('bootstrap/status guard fires when README becomes a phase authority', () => {
  const path = resolve(root, 'README.md')
  const original = readFileSync(path, 'utf8')
  writeFileSync(path, `${original}\n3N = NEXT / NOT STARTED\n`)
  try {
    const result = run('scripts/check-current-state.mjs')
    const output = `${result.stdout}\n${result.stderr}`
    if (result.status === 0 || !output.includes('README.md')) throw new Error('status negative control did not fire')
  } finally {
    writeFileSync(path, original)
  }
})

test('phase progression guard fires when more than one phase is active', () => {
  const path = resolve(root, 'docs/roadmap.md')
  const original = readFileSync(path, 'utf8')
  const mutated = original.replace('| 3N | CLOSED |', '| 3N | OPEN / ACTIVE |')
  if (mutated === original) throw new Error('active-phase negative-control mutation target missing')
  writeFileSync(path, mutated)
  try {
    const result = run('scripts/check-current-state.mjs')
    const output = `${result.stdout}\n${result.stderr}`
    if (result.status === 0 || !output.includes('OPEN / ACTIVE')) throw new Error('active-phase negative control did not fire')
  } finally {
    writeFileSync(path, original)
  }
})

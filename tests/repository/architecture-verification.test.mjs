import assert from 'node:assert/strict'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

const root = resolve(new URL('../../', import.meta.url).pathname)
const script = resolve(root, 'scripts/check-architecture-verification.mjs')
const authorityPaths = [
  'docs/roadmap.md',
  'docs/architecture/index.md',
  'docs/phases/3n-architecture-verification.md'
]

const outputOf = result => `${result.stdout ?? ''}\n${result.stderr ?? ''}`
const run = verificationRoot => spawnSync(process.execPath, [script], {
  cwd: root,
  env: { ...process.env, CONEXUS_ARCH_VERIFY_ROOT: verificationRoot },
  encoding: 'utf8'
})

const fixture = () => {
  const target = mkdtempSync(resolve(tmpdir(), 'conexus-3n-'))
  for (const path of authorityPaths) {
    const destination = resolve(target, path)
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(resolve(root, path), destination)
  }
  return target
}

const mutate = (target, path, from, to) => {
  const absolute = resolve(target, path)
  const original = readFileSync(absolute, 'utf8')
  assert.ok(original.includes(from), `fixture mutation target missing in ${path}`)
  writeFileSync(absolute, original.replace(from, to))
}

const expectRejected = (target, pattern) => {
  const result = run(target)
  const output = outputOf(result)
  assert.notEqual(result.status, 0, `negative control unexpectedly passed:\n${output}`)
  assert.match(output, pattern)
}

test('current 3N architecture verification contract is green', () => {
  const result = run(root)
  assert.equal(result.status, 0, outputOf(result))
})

test('3N owner guard rejects semantic-owner drift', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/architecture/index.md', '| **Workspace** |', '| **Generic Recovery** |')
    expectRejected(target, /semantic owner set changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N dependency guard rejects L7 orchestration drift', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/architecture/index.md', 'PromoteRelease\n```', '```')
    expectRejected(target, /L7 orchestration set changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N invariant guard rejects deletion from the accepted falsifier census', () => {
  const target = fixture()
  try {
    mutate(
      target,
      'docs/architecture/index.md',
      'Gateway idempotency/reconciliation scope accepted when deliberately under-declared\n',
      ''
    )
    expectRejected(target, /section-46 invariant census changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N routing guard rejects a first-production falsifier moved to first-build', () => {
  const target = fixture()
  try {
    mutate(
      target,
      'docs/phases/3n-architecture-verification.md',
      '| 3N-V25 | FIRST_PRODUCTION | restore without positive generation continuity opening normal PROD |',
      '| 3N-V25 | FIRST_BUILD | restore without positive generation continuity opening normal PROD |'
    )
    expectRejected(target, /3N-V25 must route to FIRST_PRODUCTION/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N progression guard rejects premature C-018 ratification', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/roadmap.md', '| C-018 | NOT RATIFIED |', '| C-018 | RATIFIED |')
    expectRejected(target, /C-018 must remain NOT RATIFIED during 3N/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

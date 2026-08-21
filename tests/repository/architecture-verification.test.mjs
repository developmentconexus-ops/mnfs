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
  'docs/phases/3m-failure-recovery-architecture.md',
  'docs/phases/3n-architecture-verification.md',
  'docs/reference/data-and-persistence.md',
  'docs/reference/integrations-and-gateway.md',
  'docs/reference/managed-execution-qualification.md'
]

const outputOf = result => `${result.stdout ?? ''}\n${result.stderr ?? ''}`
const run = verificationRoot => spawnSync(process.execPath, [script, verificationRoot], {
  cwd: root,
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

test('3N current authority uses bounded F1 model execution rather than superseded monetary reservation', () => {
  const architecture = readFileSync(resolve(root, 'docs/architecture/index.md'), 'utf8')
  assert.doesNotMatch(architecture, /provider call occurring without spend reservation/)
  assert.match(architecture, /provider\/model execution escaping finite server-derived call\/step\/retry\/fallback bounds/)
})

test('3N vertical route distinguishes the 3O contract from real first-build execution', () => {
  const contract = readFileSync(resolve(root, 'docs/phases/3n-architecture-verification.md'), 'utf8')
  assert.match(
    contract,
    /\| 3N-V28 \| 3O_CONTRACT \| FIRST_BUILD \| first vertical read model proving itself \/ unsupported KPI fabricated \|/
  )
})

test('3N can verify the current 46-class and 16-FK data closure without Git archaeology', () => {
  const data = readFileSync(resolve(root, 'docs/reference/data-and-persistence.md'), 'utf8')
  assert.match(data, /## 6\.5\.1 Current durable record inventory/)
  assert.match(data, /TOTAL\s+46/)
  assert.match(data, /## 6\.5\.2 Current Tier-2 cross-module FK allowlist — 16/)
  assert.match(data, /Tier-2 is admitted only when/)
  assert.match(data, /\| 16 \| `att\.attachment\.project_id → prj\.project\(id\)` \|/)
})

test('3N carries downstream proof families without inventing a Worker Eval metric contract', () => {
  const architecture = readFileSync(resolve(root, 'docs/architecture/index.md'), 'utf8')
  const contract = readFileSync(resolve(root, 'docs/phases/3n-architecture-verification.md'), 'utf8')
  assert.match(contract, /## Downstream proof-family coverage/)
  assert.match(contract, /Builder UX progressive disclosure/)
  assert.match(contract, /Golden benchmark \/ Worker Eval integration into engineering system/)
  assert.doesNotMatch(architecture, /rework\/correction burden/)
})

test('3N carries current obligations explicitly routed from current owners outside architecture sections 42 and 46', () => {
  const contract = readFileSync(resolve(root, 'docs/phases/3n-architecture-verification.md'), 'utf8')
  assert.match(contract, /## Current 3N-routed obligation intake/)
  assert.match(contract, /authority uniqueness/)
  assert.match(contract, /current-authority serialization × owner isolation/)
  assert.match(contract, /architecture-wide duplicate-authority proof/)
  assert.match(contract, /architecture-wide deciding-evidence completeness/)
  assert.match(contract, /YAGNI deletion challenge/)
})

test('Gateway budget counter is tied to current non-monetary external-effect budgets, not model spend', () => {
  const gateway = readFileSync(resolve(root, 'docs/reference/integrations-and-gateway.md'), 'utf8')
  assert.match(gateway, /`budget_counter`/)
  assert.match(gateway, /Product Agent.*budgets/s)
  assert.match(gateway, /not model-spend authority/)
})

test('3N closure gate requires the operator-authorized roadmap transition on the closure head', () => {
  const contract = readFileSync(resolve(root, 'docs/phases/3n-architecture-verification.md'), 'utf8')
  assert.match(contract, /explicit operator closure authority/)
  assert.match(contract, /3N = CLOSED/)
  assert.match(contract, /3O = NEXT \/ NOT STARTED/)
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

test('3N owner guard rejects loss of owner-local recovery law', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/architecture/index.md', 'recovery meaning remains owner-local; no generic Recovery owner/FSM exists', 'recovery may use a generic Recovery owner')
    expectRejected(target, /owner-local recovery law is missing/)
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

test('3N dependency guard rejects loss of the single domain inversion', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/architecture/index.md', 'There is exactly one domain dependency inversion:', 'There may be domain dependency inversions:')
    expectRejected(target, /single domain dependency inversion projection changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N dependency guard rejects infrastructure-boundary drift', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/architecture/index.md', '`GitInfra`', '`GenericInfra`')
    expectRejected(target, /infrastructure boundary set changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N minimum-falsifier guard rejects deletion from accepted section-46 coverage', () => {
  const target = fixture()
  try {
    mutate(
      target,
      'docs/architecture/index.md',
      'FIRST_BUILD | Gateway idempotency/reconciliation scope accepted when deliberately under-declared\n',
      ''
    )
    expectRejected(target, /section-46 minimum falsifier count changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N spend guard rejects resurrection of superseded monetary reservation wording', () => {
  const target = fixture()
  try {
    mutate(
      target,
      'docs/architecture/index.md',
      'FIRST_BUILD | provider/model execution escaping finite server-derived call/step/retry/fallback bounds\n',
      'FIRST_BUILD | provider call occurring without spend reservation\n'
    )
    expectRejected(target, /superseded model-spend reservation wording/)
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
      '| 3N-V25 | FIRST_PRODUCTION | FIRST_PRODUCTION | restore without positive generation continuity opening normal PROD |',
      '| 3N-V25 | FIRST_BUILD | FIRST_BUILD | restore without positive generation continuity opening normal PROD |'
    )
    expectRejected(target, /3N-V25 routing differs from architecture authority/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N routed-obligation guard rejects loss of a current 3M obligation', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/phases/3m-failure-recovery-architecture.md', 'unknown preservation, ', '')
    expectRejected(target, /3N-routed obligation intake differs from current owners/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N routed-obligation guard rejects loss of CR-1 joint proof routing', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/reference/data-and-persistence.md', '3N/3O must prove both sides together', 'FIRST_BUILD must prove both sides together')
    expectRejected(target, /CR-1 current 3N routing is missing/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N data-closure guard rejects loss of a durable record class', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/reference/data-and-persistence.md', 'audit_record / operational_event\n', 'audit_record\n')
    expectRejected(target, /durable record inventory count changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N data-closure guard rejects an undeclared record schema', () => {
  const target = fixture()
  try {
    mutate(target, 'docs/reference/data-and-persistence.md', 'obs: audit_record / operational_event\n', 'xyz: audit_record / operational_event\n')
    expectRejected(target, /durable record schema closure changed/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N FK guard rejects an endpoint outside the current schema and record inventory', () => {
  const target = fixture()
  try {
    mutate(
      target,
      'docs/reference/data-and-persistence.md',
      '| 16 | `att.attachment.project_id → prj.project(id)` |',
      '| 16 | `xyz.invented_record.nope_id → nowhere.missing(id)` |'
    )
    expectRejected(target, /Tier-2 FK endpoint is outside current data closure/)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
})

test('3N proof-family guard rejects deletion of current UX proof coverage', () => {
  const target = fixture()
  try {
    mutate(
      target,
      'docs/phases/3n-architecture-verification.md',
      '| Builder UX progressive disclosure / platform machinery not primary workflow | FIRST_BUILD |',
      ''
    )
    expectRejected(target, /downstream proof-family coverage missing/)
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

test('3N checker reports an unreadable explicit verification root without a stack trace', () => {
  const missing = resolve(tmpdir(), `conexus-3n-missing-${Date.now()}`)
  const result = run(missing)
  const output = outputOf(result)
  assert.notEqual(result.status, 0)
  assert.match(output, /unable to read verification file/)
  assert.doesNotMatch(output, /node:fs|ENOENT.*at /s)
})

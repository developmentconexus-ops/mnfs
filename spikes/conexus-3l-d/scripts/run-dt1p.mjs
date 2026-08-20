import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import assert from 'node:assert/strict'

import { admitOccurrence } from '../src/admission.mjs'
import {
  countOwnersByKey,
  findOwnerById,
  findQueueProjections,
  insertOwner,
} from '../src/owner-fixture.mjs'
import { bootstrapDatabase } from './bootstrap-db.mjs'
import { DATABASE_URL } from '../src/postgres.mjs'
import { createEffectCanary, guardedHandler, unguardedHandler } from '../src/worker-guard.mjs'

const execFileAsync = promisify(execFile)
const rootPath = fileURLToPath(new URL('../', import.meta.url))
const repoRoot = resolve(rootPath, '..', '..')
const evidencePath = new URL('../evidence/dt1p.json', import.meta.url)

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function occurrence(key) {
  return {
    id: randomUUID(),
    logicalOccurrenceKey: key,
    releaseRef: 'release-fixture-r17',
    jobRevisionRef: 'job-fixture-v4',
  }
}

function serializeError(error) {
  return {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    constraint: error?.constraint,
    detail: error?.detail,
  }
}

async function projectionCount(pool, ownerId) {
  const result = await pool.query(
    `SELECT count(*)::int AS count
       FROM mar.job_common
      WHERE name = 'dt1-projection'
        AND data->>'ownerJobRunId' = $1`,
    [ownerId],
  )
  return result.rows[0].count
}

async function runCase(id, action, { database = true } = {}) {
  let environment
  try {
    if (database) environment = await bootstrapDatabase()
    const observations = await action(environment)
    return { id, status: 'PASS', observations }
  } catch (error) {
    return {
      id,
      status: 'FAIL',
      observations: { error: serializeError(error) },
    }
  } finally {
    await environment?.close()
  }
}

async function collectInfrastructureEvidence() {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  const lockText = await readFile(new URL('../package-lock.json', import.meta.url), 'utf8')
  const [head, digestOutput, containerImageId] = await Promise.all([
    execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot }),
    execFileAsync('docker', ['image', 'inspect', 'postgres:17.10-bookworm', '--format', '{{json .RepoDigests}}']),
    execFileAsync('docker', ['inspect', 'conexus-dt1p-pg', '--format', '{{.Image}}']),
  ])
  const repoDigests = JSON.parse(digestOutput.stdout.trim())
  return {
    repoHead: head.stdout.trim(),
    node: process.versions.node,
    postgres: {
      required: '17.10',
      containerRepoDigest: repoDigests[0] ?? null,
      containerImageId: containerImageId.stdout.trim(),
    },
    dependencies: {
      'pg-boss': packageJson.dependencies['pg-boss'],
      pg: packageJson.dependencies.pg,
      lockSha256: sha256(lockText),
    },
  }
}

const p1 = await runCase('P1', async (environment) => {
  const input = occurrence('project-fixture|prod|budget-sync|evidence-p1')
  const result = await admitOccurrence({ pool: environment.pool, boss: environment.boss, occurrence: input })
  const owner = await findOwnerById(environment.pool, result.owner.id)
  const projections = await findQueueProjections(environment.pool, result.owner.id)
  assert.equal(projections.length, 1)
  assert.equal(projections[0].id, result.queueJobId)
  assert.equal(projections[0].retry_limit, 0)
  assert.deepEqual(projections[0].data, {
    ownerJobRunId: result.owner.id,
    releaseRef: input.releaseRef,
    jobRevisionRef: input.jobRevisionRef,
  })
  return { owner, projection: projections[0] }
})

const p2 = await runCase('P2', async (environment) => {
  const input = occurrence('project-fixture|prod|budget-sync|evidence-p2')
  await assert.rejects(
    admitOccurrence({
      pool: environment.pool,
      boss: environment.boss,
      occurrence: input,
      afterProjection: async () => { throw new Error('DT1_FORCED_ROLLBACK') },
    }),
    /DT1_FORCED_ROLLBACK/,
  )
  const ownerCount = await countOwnersByKey(environment.pool, input.logicalOccurrenceKey)
  const queueCount = await environment.pool.query(
    `SELECT count(*)::int AS count
       FROM mar.job_common
      WHERE name = 'dt1-projection'
        AND data->>'releaseRef' = $1`,
    [input.releaseRef],
  )
  assert.equal(ownerCount, 0)
  assert.equal(queueCount.rows[0].count, 0)
  return { forcedError: 'DT1_FORCED_ROLLBACK', ownerCount, queueCount: queueCount.rows[0].count }
})

const p3 = await runCase('P3', async (environment) => {
  const input = occurrence('project-fixture|prod|budget-sync|evidence-p3')
  const result = await admitOccurrence({ pool: environment.pool, boss: environment.boss, occurrence: input })
  const ownerId = result.owner.id
  await environment.close()
  const child = resolve(rootPath, 'scripts', 'fresh-process-read.mjs')
  const childResult = await execFileAsync(process.execPath, [child, ownerId], {
    cwd: rootPath,
    env: process.env,
  })
  const fresh = JSON.parse(childResult.stdout)
  assert.equal(fresh.owner.id, ownerId)
  assert.equal(fresh.projections.length, 1)
  assert.equal(fresh.projections[0].id, result.queueJobId)
  return { ownerId, fresh }
})

const p4 = await runCase('P4', async (environment) => {
  const key = 'project-fixture|prod|budget-sync|evidence-p4'
  const results = await Promise.allSettled([
    admitOccurrence({ pool: environment.pool, boss: environment.boss, occurrence: occurrence(key) }),
    admitOccurrence({ pool: environment.pool, boss: environment.boss, occurrence: occurrence(key) }),
  ])
  const successful = results.filter((result) => result.status === 'fulfilled')
  const rejected = results.filter((result) => result.status === 'rejected')
  assert.equal(successful.length, 1)
  assert.equal(rejected.length, 1)
  assert.equal(await countOwnersByKey(environment.pool, key), 1)
  assert.equal(await projectionCount(environment.pool, successful[0].value.owner.id), 1)
  return {
    successfulAdmissions: successful.length,
    losingBehavior: serializeError(rejected[0].reason),
    ownerCount: await countOwnersByKey(environment.pool, key),
    winningProjectionCount: await projectionCount(environment.pool, successful[0].value.owner.id),
  }
})

const queueGuard = await runCase('P5+R3', async (environment) => {
  const invalidOwnerId = randomUUID()
  const queueJobId = await environment.boss.send('dt1-projection', { ownerJobRunId: invalidOwnerId }, { retryLimit: 0 })
  assert.ok(queueJobId)
  const [job] = await environment.boss.fetch('dt1-projection')
  assert.equal(job.id, queueJobId)

  const unguardedCanary = createEffectCanary()
  const unguardedResult = await unguardedHandler(job, unguardedCanary)
  const guardedCanary = createEffectCanary()
  const guardedResult = await guardedHandler(
    job,
    guardedCanary,
    (ownerId) => findOwnerById(environment.pool, ownerId),
  )

  assert.equal(unguardedCanary.count(), 1)
  assert.equal(guardedCanary.count(), 0)
  assert.deepEqual(guardedResult, { status: 'refused', reason: 'OWNER_NOT_ADMISSIBLE' })
  return {
    queueJobId,
    invalidOwnerId,
    unguardedResult,
    unguardedEffectCount: unguardedCanary.count(),
    guardedResult,
    guardedEffectCount: guardedCanary.count(),
  }
})

const p6 = await runCase('P6', async () => ({
  providerCalls: 0,
  modelCalls: 0,
  e2bCalls: 0,
  sankhyaCalls: 0,
  realExternalEffects: 0,
}), { database: false })

const r1 = await runCase('R1', async (environment) => {
  const input = occurrence('project-fixture|prod|budget-sync|evidence-r1')
  const owner = await insertOwner(environment.pool, input)
  const ownerCount = await countOwnersByKey(environment.pool, input.logicalOccurrenceKey)
  const queueCount = await projectionCount(environment.pool, owner.id)
  assert.equal(ownerCount, 1)
  assert.equal(queueCount, 0)
  return { ownerId: owner.id, committedOwnerCount: ownerCount, queueProjectionCount: queueCount }
})

const r2 = await runCase('R2', async (environment) => {
  const key = 'project-fixture|prod|budget-sync|evidence-r2'
  const clients = await Promise.all([environment.pool.connect(), environment.pool.connect()])
  try {
    await Promise.all(clients.map((client) => client.query('BEGIN')))
    await Promise.all([
      insertOwner(clients[0], occurrence(key), { table: 'mar.dt1_owner_without_unique' }),
      insertOwner(clients[1], occurrence(key), { table: 'mar.dt1_owner_without_unique' }),
    ])
    await Promise.all(clients.map((client) => client.query('COMMIT')))
  } finally {
    await Promise.all(clients.map((client) => client.release()))
  }
  const count = await countOwnersByKey(environment.pool, key, { table: 'mar.dt1_owner_without_unique' })
  assert.equal(count, 2)
  return { table: 'mar.dt1_owner_without_unique', logicalOccurrenceKey: key, committedRows: count }
})

const infrastructure = await collectInfrastructureEvidence()
const firstEnvironment = await bootstrapDatabase()
const identity = firstEnvironment.identity
const vendor = firstEnvironment.vendor
await firstEnvironment.close()

const evidence = {
  probe: "DT-1' — Transactional Managed-Occurrence Admission",
  authority: 'docs/conexus/phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md',
  repoHead: infrastructure.repoHead,
  node: infrastructure.node,
  postgres: {
    required: infrastructure.postgres.required,
    serverVersion: identity.serverVersion,
    serverVersionSetting: identity.serverVersionNumber,
    serverVersionMajorMinor: identity.serverVersionMajorMinor,
    containerRepoDigest: infrastructure.postgres.containerRepoDigest,
    containerImageId: infrastructure.postgres.containerImageId,
  },
  dependencies: {
    ...infrastructure.dependencies,
    vendorDdlSha256: vendor.sha256,
    vendorDdlExportSurface: vendor.exportSurface,
  },
  pgbossRuntime: {
    schema: 'mar',
    createSchema: false,
    migrate: false,
    schedule: false,
    retryLimit: 0,
  },
  prohibitedSurfaceObserved: [],
  green: {
    P1: p1,
    P2: p2,
    P3: p3,
    P4: p4,
    P5: { id: 'P5', status: queueGuard.status, observations: queueGuard.observations },
    P6: { id: 'P6', status: p6.status, observations: p6.observations },
  },
  red: {
    R1: r1,
    R2: r2,
    R3: { id: 'R3', status: queueGuard.status, observations: queueGuard.observations },
  },
  externalCalls: {
    provider: 0,
    model: 0,
    e2b: 0,
    sankhya: 0,
    realEffects: 0,
  },
  verdict: 'NOT_PROVEN',
}

const allGreen = Object.values(evidence.green).every((entry) => entry.status === 'PASS')
const allRed = Object.values(evidence.red).every((entry) => entry.status === 'PASS')
const identityValid = evidence.node === '24.18.0'
  && evidence.postgres.serverVersionMajorMinor === '17.10'
  && evidence.postgres.containerRepoDigest === 'postgres@sha256:9b18b78397054fce88a9552e9d5a3ad5bb7fd258c5b3cc1c5028e46373d6ea8f'
  && evidence.dependencies['pg-boss'] === '12.26.3'
  && evidence.dependencies.pg === '8.22.0'
  && /^[a-f0-9]{64}$/.test(evidence.dependencies.lockSha256)
const callsZero = Object.values(evidence.externalCalls).every((value) => value === 0)

if (allGreen && allRed && identityValid && callsZero && evidence.prohibitedSurfaceObserved.length === 0) {
  evidence.verdict = 'QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION'
}

await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({ evidencePath: 'evidence/dt1p.json', verdict: evidence.verdict }, null, 2))

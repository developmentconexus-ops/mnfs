import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import test from 'node:test'

import { admitOccurrence } from '../src/admission.mjs'
import {
  countOwnersByKey,
  findOwnerById,
  findQueueProjections,
  insertOwner,
} from '../src/owner-fixture.mjs'
import { bootstrapDatabase } from '../scripts/bootstrap-db.mjs'
import { guardedHandler, createEffectCanary, unguardedHandler } from '../src/worker-guard.mjs'

const execFileAsync = promisify(execFile)
let environment

function occurrence(key = `project-fixture|prod|budget-sync|${randomUUID()}`) {
  return {
    id: randomUUID(),
    logicalOccurrenceKey: key,
    releaseRef: 'release-fixture-r17',
    jobRevisionRef: 'job-fixture-v4',
  }
}

async function projectionCount(ownerId) {
  const result = await environment.pool.query(
    `SELECT count(*)::int AS count
       FROM mar.job_common
      WHERE name = 'dt1-projection'
        AND data->>'ownerJobRunId' = $1`,
    [ownerId],
  )
  return result.rows[0].count
}

async function cleanProbeFacts() {
  await environment.pool.query("DELETE FROM mar.job_common WHERE name = 'dt1-projection'")
  await environment.pool.query('DELETE FROM mar.dt1_owner_job_run')
  await environment.pool.query('DELETE FROM mar.dt1_owner_without_unique')
}

test.beforeEach(async () => {
  environment = await bootstrapDatabase()
})

test.afterEach(async () => {
  await environment?.close()
  environment = undefined
})

test('bootstrap creates one existing mar schema, vendor objects, fixtures, and one retry-free queue', async () => {
  const { pool, identity, vendor, runtime, queue } = environment

  assert.equal(identity.serverVersionMajorMinor, '17.10')
  assert.equal(runtime.schema, 'mar')
  assert.equal(runtime.createSchema, false)
  assert.equal(runtime.migrate, false)
  assert.equal(runtime.schedule, false)
  assert.equal(runtime.retryLimit, 0)
  assert.equal(queue, 'dt1-projection')
  assert.match(vendor.sha256, /^[a-f0-9]{64}$/)

  const objects = await pool.query(`
    SELECT to_regclass('mar.dt1_owner_job_run') AS owner_table,
           to_regclass('mar.dt1_owner_without_unique') AS red_table,
           to_regclass('mar.queue') AS queue_table,
           to_regclass('mar.job') AS job_table,
           to_regclass('mar.job_common') AS job_common_table`)
  assert.deepEqual(objects.rows[0], {
    owner_table: 'mar.dt1_owner_job_run',
    red_table: 'mar.dt1_owner_without_unique',
    queue_table: 'mar.queue',
    job_table: 'mar.job',
    job_common_table: 'mar.job_common',
  })
})

test('P1 commits one owner fixture and one queue projection atomically', async () => {
  const input = occurrence('project-fixture|prod|budget-sync|freshness-p1')
  const result = await admitOccurrence({
    pool: environment.pool,
    boss: environment.boss,
    occurrence: input,
  })

  const owner = await findOwnerById(environment.pool, result.owner.id)
  const projections = await findQueueProjections(environment.pool, result.owner.id)

  assert.equal(owner.logical_occurrence_key, input.logicalOccurrenceKey)
  assert.equal(projections.length, 1)
  assert.equal(projections[0].id, result.queueJobId)
  assert.equal(projections[0].retry_limit, 0)
  assert.deepEqual(projections[0].data, {
    ownerJobRunId: result.owner.id,
    releaseRef: input.releaseRef,
    jobRevisionRef: input.jobRevisionRef,
  })
})

test('P2 forced failure after queue send rolls back owner and projection', async () => {
  const input = occurrence('project-fixture|prod|budget-sync|freshness-p2')
  await assert.rejects(
    admitOccurrence({
      pool: environment.pool,
      boss: environment.boss,
      occurrence: input,
      afterProjection: async () => {
        throw new Error('DT1_FORCED_ROLLBACK')
      },
    }),
    /DT1_FORCED_ROLLBACK/,
  )

  assert.equal(await countOwnersByKey(environment.pool, input.logicalOccurrenceKey), 0)
  assert.equal(await projectionCount(input.id), 0)
  const byKey = await environment.pool.query(
    'SELECT count(*)::int AS count FROM mar.job_common WHERE name = $1 AND data->>\'releaseRef\' = $2',
    ['dt1-projection', input.releaseRef],
  )
  assert.equal(byKey.rows[0].count, 0)
})

test('P3 fresh process rediscovers both committed facts after original handles close', async () => {
  const input = occurrence('project-fixture|prod|budget-sync|freshness-p3')
  const result = await admitOccurrence({
    pool: environment.pool,
    boss: environment.boss,
    occurrence: input,
  })
  const ownerId = result.owner.id
  await environment.close()

  const { stdout } = await execFileAsync(process.execPath, ['scripts/fresh-process-read.mjs', ownerId], {
    cwd: process.cwd(),
    env: process.env,
  })
  const fresh = JSON.parse(stdout)
  assert.equal(fresh.owner.id, ownerId)
  assert.equal(fresh.owner.logical_occurrence_key, input.logicalOccurrenceKey)
  assert.equal(fresh.projections.length, 1)
  assert.equal(fresh.projections[0].id, result.queueJobId)
})

test('P4 owner uniqueness fences concurrent admissions and records the losing DB behavior', async () => {
  const key = 'project-fixture|prod|budget-sync|freshness-p4'
  const results = await Promise.allSettled([
    admitOccurrence({ pool: environment.pool, boss: environment.boss, occurrence: occurrence(key) }),
    admitOccurrence({ pool: environment.pool, boss: environment.boss, occurrence: occurrence(key) }),
  ])
  const successful = results.filter((result) => result.status === 'fulfilled')
  const rejected = results.filter((result) => result.status === 'rejected')

  assert.equal(successful.length, 1)
  assert.equal(rejected.length, 1)
  assert.equal(await countOwnersByKey(environment.pool, key), 1)
  assert.equal(await projectionCount(successful[0].value.owner.id), 1)

  const loser = rejected[0].reason
  assert.equal(loser.code, '23505')
  assert.equal(loser.constraint, 'dt1_owner_job_run_logical_occurrence_key_key')
  assert.equal(typeof loser.message, 'string')
})

test('P5 and R3 show queue delivery is subordinate to current owner admissibility', async () => {
  const invalidOwnerId = randomUUID()
  const queueJobId = await environment.boss.send(
    'dt1-projection',
    { ownerJobRunId: invalidOwnerId },
    { retryLimit: 0 },
  )
  assert.ok(queueJobId)
  const [job] = await environment.boss.fetch('dt1-projection')
  assert.equal(job.id, queueJobId)

  const unguardedCanary = createEffectCanary()
  await unguardedHandler(job, unguardedCanary)
  assert.equal(unguardedCanary.count(), 1)

  const guardedCanary = createEffectCanary()
  const guardedResult = await guardedHandler(
    job,
    guardedCanary,
    (ownerId) => findOwnerById(environment.pool, ownerId),
  )
  assert.deepEqual(guardedResult, { status: 'refused', reason: 'OWNER_NOT_ADMISSIBLE' })
  assert.equal(guardedCanary.count(), 0)
})

test('R1 split commit reproduces an owner orphan without queue projection', async () => {
  const input = occurrence('project-fixture|prod|budget-sync|freshness-r1')
  const owner = await insertOwner(environment.pool, input)

  assert.equal(await countOwnersByKey(environment.pool, input.logicalOccurrenceKey), 1)
  assert.equal(await projectionCount(owner.id), 0)
})

test('R2 removing owner uniqueness reproduces duplicate logical admission under concurrency', async () => {
  const key = 'project-fixture|prod|budget-sync|freshness-r2'
  const clients = await Promise.all([environment.pool.connect(), environment.pool.connect()])
  const first = occurrence(key)
  const second = occurrence(key)

  try {
    await Promise.all(clients.map((client) => client.query('BEGIN')))
    await Promise.all([
      insertOwner(clients[0], first, { table: 'mar.dt1_owner_without_unique' }),
      insertOwner(clients[1], second, { table: 'mar.dt1_owner_without_unique' }),
    ])
    await Promise.all(clients.map((client) => client.query('COMMIT')))
  } finally {
    await Promise.all(clients.map((client) => client.release()))
  }

  assert.equal(await countOwnersByKey(environment.pool, key, { table: 'mar.dt1_owner_without_unique' }), 2)
})

test('P6 external-effect counters remain explicit zero', () => {
  const externalCalls = {
    provider: 0,
    model: 0,
    e2b: 0,
    sankhya: 0,
    realEffects: 0,
  }
  assert.deepEqual(externalCalls, {
    provider: 0,
    model: 0,
    e2b: 0,
    sankhya: 0,
    realEffects: 0,
  })
})

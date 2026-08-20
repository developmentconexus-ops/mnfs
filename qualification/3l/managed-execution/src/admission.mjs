import { asPgBossDb, withTransaction } from './postgres.mjs'
import { insertOwner } from './owner-fixture.mjs'
import { QUEUE_NAME } from './pgboss.mjs'

export async function admitOccurrence({ pool, boss, occurrence, afterProjection } = {}) {
  if (!pool || !boss || !occurrence) {
    throw new Error('DT1_ADMISSION_INPUT_REQUIRED')
  }

  return withTransaction(pool, async (client) => {
    const owner = await insertOwner(client, occurrence)
    const queueJobId = await boss.send(
      QUEUE_NAME,
      {
        ownerJobRunId: owner.id,
        releaseRef: owner.release_ref,
        jobRevisionRef: owner.job_revision_ref,
      },
      {
        db: asPgBossDb(client),
        retryLimit: 0,
      },
    )

    if (queueJobId === null) {
      throw new Error('DT1_QUEUE_PROJECTION_NOT_CREATED')
    }

    if (afterProjection) {
      await afterProjection({ client, owner, queueJobId })
    }

    return { owner, queueJobId }
  })
}

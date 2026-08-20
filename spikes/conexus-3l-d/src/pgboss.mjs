import { PgBoss } from 'pg-boss'

import { DATABASE_URL } from './postgres.mjs'

export const QUEUE_NAME = 'dt1-projection'

export const PG_BOSS_RUNTIME_CONFIG = Object.freeze({
  schema: 'mar',
  createSchema: false,
  migrate: false,
  schedule: false,
  retryLimit: 0,
})

export function createBoss({ connectionString = DATABASE_URL } = {}) {
  return new PgBoss({
    connectionString,
    schema: PG_BOSS_RUNTIME_CONFIG.schema,
    createSchema: PG_BOSS_RUNTIME_CONFIG.createSchema,
    migrate: PG_BOSS_RUNTIME_CONFIG.migrate,
    schedule: PG_BOSS_RUNTIME_CONFIG.schedule,
    supervise: false,
    useListenNotify: false,
  })
}

export async function ensureQueue(boss) {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: PG_BOSS_RUNTIME_CONFIG.retryLimit,
  })
  const queue = await boss.getQueue(QUEUE_NAME)
  if (!queue || queue.retryLimit !== PG_BOSS_RUNTIME_CONFIG.retryLimit) {
    throw new Error('DT1_QUEUE_CONFIGURATION_NOT_CONFIRMED')
  }
  return queue
}

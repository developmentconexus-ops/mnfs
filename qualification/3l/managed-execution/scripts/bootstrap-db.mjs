import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { getConstructionPlans } from 'pg-boss'

import { createBoss, ensureQueue, PG_BOSS_RUNTIME_CONFIG, QUEUE_NAME } from '../src/pgboss.mjs'
import {
  assertScratchDatabase,
  createPool,
  DATABASE_URL,
  databaseIdentity,
} from '../src/postgres.mjs'

const root = new URL('../', import.meta.url)
const rootPath = fileURLToPath(root)
const vendorPath = resolve(rootPath, 'vendor', 'pgboss-12.26.3-mar.sql')
const fixturePath = new URL('../schema/dt1-fixtures.sql', import.meta.url)

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

export async function bootstrapDatabase({ connectionString = DATABASE_URL } = {}) {
  assertScratchDatabase(connectionString)
  const pool = createPool({ connectionString })
  let boss
  let closed = false

  const close = async () => {
    if (closed) return
    closed = true
    await boss?.stop({ graceful: false }).catch(() => {})
    await pool.end()
  }

  try {
    const identityBeforeReset = await databaseIdentity(pool)
    if (identityBeforeReset.serverVersionMajorMinor !== '17.10') {
      throw new Error(`DT1_POSTGRES_VERSION_UNSUPPORTED: ${identityBeforeReset.serverVersionNumber}`)
    }

    await pool.query('DROP SCHEMA IF EXISTS mar CASCADE')
    await pool.query('CREATE SCHEMA mar')

    const vendorSql = getConstructionPlans('mar')
    await writeFile(vendorPath, vendorSql, 'utf8')
    await pool.query(vendorSql)

    const fixtureSql = await readFile(fixturePath, 'utf8')
    await pool.query(fixtureSql)

    boss = createBoss({ connectionString })
    await boss.start()
    await ensureQueue(boss)

    const identity = await databaseIdentity(pool)
    return {
      pool,
      boss,
      close,
      schema: PG_BOSS_RUNTIME_CONFIG.schema,
      queue: QUEUE_NAME,
      runtime: PG_BOSS_RUNTIME_CONFIG,
      identity,
      vendor: {
        path: 'vendor/pgboss-12.26.3-mar.sql',
        exportSurface: 'pg-boss getConstructionPlans("mar")',
        sha256: sha256(vendorSql),
      },
    }
  } catch (error) {
    await close()
    throw error
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await bootstrapDatabase()
  console.log(JSON.stringify({
    schema: result.schema,
    queue: result.queue,
    runtime: result.runtime,
    identity: result.identity,
    vendor: result.vendor,
  }, null, 2))
  await result.close()
}

import { Pool } from 'pg'

export const DATABASE_URL = process.env.DT1_DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:55432/conexus_dt1p'

export function assertScratchDatabase(connectionString = DATABASE_URL) {
  const url = new URL(connectionString)
  if (url.pathname !== '/conexus_dt1p') {
    throw new Error('DT1_SCRATCH_DATABASE_REQUIRED')
  }
}

export function createPool({ connectionString = DATABASE_URL, ...options } = {}) {
  assertScratchDatabase(connectionString)
  return new Pool({
    connectionString,
    max: 12,
    application_name: 'conexus-dt1p',
    ...options,
  })
}

export async function withTransaction(pool, fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

export function asPgBossDb(client) {
  return {
    executeSql: (text, values = []) => client.query(text, values),
  }
}

export async function databaseIdentity(pool) {
  const versionResult = await pool.query('SELECT version() AS server_version, current_database() AS database_name')
  const numberResult = await pool.query('SHOW server_version')
  const serverVersionNumber = numberResult.rows[0].server_version
  return {
    database: versionResult.rows[0].database_name,
    serverVersion: versionResult.rows[0].server_version,
    serverVersionNumber,
    serverVersionMajorMinor: serverVersionNumber.split(' ')[0],
  }
}

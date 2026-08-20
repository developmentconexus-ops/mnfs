const OWNER_TABLE = 'mar.dt1_owner_job_run'
const OWNER_WITHOUT_UNIQUE_TABLE = 'mar.dt1_owner_without_unique'

export async function insertOwner(client, occurrence, { table = OWNER_TABLE } = {}) {
  const isAcceptedOwner = table === OWNER_TABLE
  const returning = isAcceptedOwner
    ? 'id, logical_occurrence_key, release_ref, job_revision_ref, admissible, admitted_at'
    : 'id, logical_occurrence_key, release_ref, job_revision_ref, admitted_at'
  const result = await client.query(
    `INSERT INTO ${table} (
       id, logical_occurrence_key, release_ref, job_revision_ref
     ) VALUES ($1, $2, $3, $4)
     RETURNING ${returning}`,
    [occurrence.id, occurrence.logicalOccurrenceKey, occurrence.releaseRef, occurrence.jobRevisionRef],
  )
  return result.rows[0]
}

export async function findOwnerById(db, ownerId) {
  const result = await db.query(
    `SELECT id, logical_occurrence_key, release_ref, job_revision_ref, admissible, admitted_at
       FROM ${OWNER_TABLE}
      WHERE id = $1`,
    [ownerId],
  )
  return result.rows[0] ?? null
}

export async function findOwnerByKey(db, logicalOccurrenceKey) {
  const result = await db.query(
    `SELECT id, logical_occurrence_key, release_ref, job_revision_ref, admissible, admitted_at
       FROM ${OWNER_TABLE}
      WHERE logical_occurrence_key = $1`,
    [logicalOccurrenceKey],
  )
  return result.rows[0] ?? null
}

export async function setOwnerAdmissible(db, ownerId, admissible) {
  const result = await db.query(
    `UPDATE ${OWNER_TABLE}
        SET admissible = $2
      WHERE id = $1
      RETURNING id, logical_occurrence_key, release_ref, job_revision_ref, admissible, admitted_at`,
    [ownerId, admissible],
  )
  return result.rows[0] ?? null
}

export async function countOwnersByKey(db, logicalOccurrenceKey, { table = OWNER_TABLE } = {}) {
  const result = await db.query(
    `SELECT count(*)::int AS count
       FROM ${table}
      WHERE logical_occurrence_key = $1`,
    [logicalOccurrenceKey],
  )
  return result.rows[0].count
}

export async function findQueueProjections(db, ownerId) {
  const result = await db.query(
    `SELECT id, name, data, state, retry_limit, created_on
       FROM mar.job_common
      WHERE name = 'dt1-projection'
        AND data->>'ownerJobRunId' = $1
      ORDER BY created_on, id`,
    [ownerId],
  )
  return result.rows
}

export { OWNER_TABLE, OWNER_WITHOUT_UNIQUE_TABLE }

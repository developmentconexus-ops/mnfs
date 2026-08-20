import { createPool, DATABASE_URL } from '../src/postgres.mjs'
import { findOwnerById, findQueueProjections } from '../src/owner-fixture.mjs'

const ownerId = process.argv[2]
if (!ownerId) {
  throw new Error('DT1_OWNER_ID_REQUIRED')
}

const pool = createPool({ connectionString: DATABASE_URL, max: 2 })
try {
  const owner = await findOwnerById(pool, ownerId)
  const projections = await findQueueProjections(pool, ownerId)
  console.log(JSON.stringify({ owner, projections }))
} finally {
  await pool.end()
}

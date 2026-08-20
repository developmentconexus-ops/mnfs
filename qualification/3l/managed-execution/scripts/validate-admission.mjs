import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const criteria = JSON.parse(await readFile(new URL('../admission/criteria.json', import.meta.url), 'utf8'))
const evidence = JSON.parse(await readFile(new URL('../evidence/dt1p.json', import.meta.url), 'utf8'))
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const lockText = await readFile(new URL('../package-lock.json', import.meta.url), 'utf8')
const vendorText = await readFile(new URL('../vendor/pgboss-12.26.3-mar.sql', import.meta.url), 'utf8')
const lock = JSON.parse(lockText)

function fail(message) {
  throw new Error(`DT1_ADMISSION_INVALID: ${message}`)
}

function equal(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}

function objectKeys(actual, expected, label) {
  const actualKeys = Object.keys(actual ?? {}).sort()
  const expectedKeys = [...expected].sort()
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    fail(`${label}: keys ${JSON.stringify(actualKeys)} != ${JSON.stringify(expectedKeys)}`)
  }
}

equal(evidence.probe, criteria.probe, 'probe')
equal(evidence.authority, criteria.authority, 'authority')
if (!/^[a-f0-9]{40}$/.test(evidence.repoHead)) fail('repoHead is not an exact commit SHA')
equal(evidence.node, criteria.node, 'Node pin')
equal(evidence.postgres.required, criteria.postgres, 'PostgreSQL pin')
equal(evidence.postgres.serverVersionMajorMinor, criteria.postgres, 'PostgreSQL observed major/minor')
equal(evidence.postgres.containerRepoDigest, 'postgres@sha256:9b18b78397054fce88a9552e9d5a3ad5bb7fd258c5b3cc1c5028e46373d6ea8f', 'PostgreSQL image digest')

equal(evidence.dependencies['pg-boss'], criteria.dependencies['pg-boss'], 'pg-boss pin')
equal(evidence.dependencies.pg, criteria.dependencies.pg, 'pg pin')
if (!/^[a-f0-9]{64}$/.test(evidence.dependencies.lockSha256)) fail('lock SHA-256 is invalid')
equal(evidence.dependencies.lockSha256, createHash('sha256').update(lockText).digest('hex'), 'lock SHA-256')
equal(lock.lockfileVersion, 3, 'lockfileVersion')
equal(lock.packages?.['']?.dependencies?.['pg-boss'], '12.26.3', 'locked root pg-boss')
equal(lock.packages?.['']?.dependencies?.pg, '8.22.0', 'locked root pg')
equal(lock.packages?.['node_modules/pg-boss']?.version, '12.26.3', 'installed pg-boss')
equal(lock.packages?.['node_modules/pg']?.version, '8.22.0', 'installed pg')
if (Object.keys(packageJson.dependencies ?? {}).some((name) => name.startsWith('@mastra/'))) {
  fail('direct @mastra dependency present')
}

for (const [name, script] of Object.entries(packageJson.scripts ?? {})) {
  if (/schedule|cron/i.test(`${name} ${script}`)) fail(`prohibited scheduler term in script ${name}`)
  if (/src\/product|apps?\/|packages?\/product/i.test(`${name} ${script}`)) fail(`Product path in script ${name}`)
}

if (JSON.stringify(evidence.pgbossRuntime) !== JSON.stringify(criteria.pgbossRuntime)) {
  fail('pg-boss runtime configuration differs from criteria')
}
if (evidence.prohibitedSurfaceObserved.length !== 0) fail('prohibited surface was observed')
if (evidence.dependencies.vendorDdlExportSurface !== 'pg-boss getConstructionPlans("mar")') {
  fail('vendor DDL was not recorded as exported through the supported package surface')
}
if (!/^[a-f0-9]{64}$/.test(evidence.dependencies.vendorDdlSha256)) fail('vendor DDL SHA-256 is invalid')
equal(evidence.dependencies.vendorDdlSha256, createHash('sha256').update(vendorText).digest('hex'), 'vendor DDL SHA-256')

objectKeys(evidence.green, criteria.requiredGreenIds, 'green criteria')
objectKeys(evidence.red, criteria.requiredRedIds, 'red criteria')
for (const id of criteria.requiredGreenIds) equal(evidence.green[id].status, 'PASS', `${id} status`)
for (const id of criteria.requiredRedIds) equal(evidence.red[id].status, 'PASS', `${id} status`)

const p1 = evidence.green.P1.observations
if (p1.projection?.retry_limit !== 0) fail('P1 queue retry limit is not zero')
if (evidence.green.P2.observations.ownerCount !== 0 || evidence.green.P2.observations.queueCount !== 0) {
  fail('P2 rollback did not leave both facts absent')
}
if (evidence.green.P3.observations.fresh?.projections?.length !== 1) fail('P3 fresh process did not rediscover one projection')
if (evidence.green.P4.observations.successfulAdmissions !== 1) fail('P4 successful admission count is not one')
if (evidence.green.P4.observations.losingBehavior?.code !== '23505') fail('P4 loser SQLSTATE is not 23505')
if (evidence.green.P4.observations.ownerCount !== 1 || evidence.green.P4.observations.winningProjectionCount !== 1) {
  fail('P4 committed winner facts are not exactly one')
}
if (evidence.green.P5.observations.guardedEffectCount !== 0) fail('P5 guarded path fired an effect')
if (evidence.red.R1.observations.committedOwnerCount !== 1 || evidence.red.R1.observations.queueProjectionCount !== 0) {
  fail('R1 did not reproduce the split-commit orphan')
}
if (evidence.red.R2.observations.committedRows !== 2) fail('R2 did not reproduce duplicate logical admission')
if (evidence.red.R3.observations.unguardedEffectCount !== 1 || evidence.red.R3.observations.guardedEffectCount !== 0) {
  fail('R3 did not demonstrate queue-not-authority control')
}

for (const [key, value] of Object.entries(evidence.externalCalls)) equal(value, 0, `external call counter ${key}`)
for (const [key, value] of Object.entries(evidence.green.P6.observations)) equal(value, 0, `P6 counter ${key}`)

const allRequiredPass = [...criteria.requiredGreenIds, ...criteria.requiredRedIds]
  .every((id) => evidence.green[id]?.status === 'PASS' || evidence.red[id]?.status === 'PASS')
const qualified = allRequiredPass
  && evidence.prohibitedSurfaceObserved.length === 0
  && Object.values(evidence.externalCalls).every((value) => value === 0)
  && evidence.node === '24.18.0'
  && evidence.postgres.serverVersionMajorMinor === '17.10'
  && evidence.postgres.containerRepoDigest?.startsWith('postgres@sha256:')

if (qualified) {
  equal(evidence.verdict, 'QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION', 'qualified verdict')
} else if (!criteria.allowedVerdicts.includes(evidence.verdict)) {
  fail(`non-qualified verdict is not allowed: ${evidence.verdict}`)
}

console.log(JSON.stringify({
  status: 'PASS',
  verdict: evidence.verdict,
  qualified,
  repoHead: evidence.repoHead,
  lockSha256: evidence.dependencies.lockSha256,
}))

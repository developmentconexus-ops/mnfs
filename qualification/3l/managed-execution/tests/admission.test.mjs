import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readJson(relativePath) {
  const text = await readFile(new URL(relativePath, root), 'utf8')
  return JSON.parse(text)
}

test('DT-1 prime admission envelope is exact and excludes prohibited surfaces', async () => {
  const pkg = await readJson('package.json')
  const criteria = await readJson('admission/criteria.json')

  assert.equal(pkg.engines.node, '24.18.0')
  assert.equal(pkg.dependencies['pg-boss'], '12.26.3')
  assert.equal(pkg.dependencies.pg, '8.22.0')
  assert.equal(criteria.postgres, '17.10')
  assert.deepEqual(criteria.pgbossRuntime, {
    schema: 'mar',
    createSchema: false,
    migrate: false,
    schedule: false,
    retryLimit: 0,
  })
  assert.deepEqual(criteria.requiredGreenIds, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'])
  assert.deepEqual(criteria.requiredRedIds, ['R1', 'R2', 'R3'])
  assert.equal(criteria.executionSurface.mastra, false)
  assert.equal(criteria.executionSurface.sankhya, false)
  assert.equal(criteria.executionSurface.realExternalEffects, false)

  for (const dependencyName of Object.keys(pkg.dependencies ?? {})) {
    assert.equal(dependencyName.startsWith('@mastra/'), false)
  }

  for (const [name, script] of Object.entries(pkg.scripts ?? {})) {
    assert.doesNotMatch(`${name} ${script}`, /schedule|cron/i)
    assert.doesNotMatch(`${name} ${script}`, /src\/product|apps?\/|packages?\/product/i)
  }
})

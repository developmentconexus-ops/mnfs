import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
const lockPath = new URL('package-lock.json', root)

function fail(message) {
  throw new Error(`DT1_LOCK_INVALID: ${message}`)
}

let lock
try {
  lock = JSON.parse(await readFile(lockPath, 'utf8'))
} catch (error) {
  fail(`cannot read package-lock.json: ${error.message}`)
}

if (lock.lockfileVersion !== 3) fail(`lockfileVersion=${lock.lockfileVersion}`)

const rootPackage = lock.packages?.['']
if (!rootPackage) fail('root package entry is missing')

if (packageJson.engines?.node !== '24.18.0') fail('package.json Node pin is not 24.18.0')
if (packageJson.dependencies?.['pg-boss'] !== '12.26.3') fail('package.json pg-boss pin is not 12.26.3')
if (packageJson.dependencies?.pg !== '8.22.0') fail('package.json pg pin is not 8.22.0')
if (rootPackage.dependencies?.['pg-boss'] !== '12.26.3') fail('lock root pg-boss pin is not 12.26.3')
if (rootPackage.dependencies?.pg !== '8.22.0') fail('lock root pg pin is not 8.22.0')

for (const name of Object.keys(packageJson.dependencies ?? {})) {
  if (name.startsWith('@mastra/')) fail(`prohibited direct dependency ${name}`)
}

const packages = lock.packages ?? {}
for (const [path, entry] of Object.entries(packages)) {
  if (path === '' || entry?.link) continue
  if (!path.startsWith('node_modules/')) continue
  if (typeof entry.resolved !== 'string' || entry.resolved.length === 0) {
    fail(`${path} is missing resolved metadata`)
  }
  if (typeof entry.integrity !== 'string' || entry.integrity.length === 0) {
    fail(`${path} is missing integrity metadata`)
  }
}

const direct = {
  'pg-boss': packages['node_modules/pg-boss']?.version,
  pg: packages['node_modules/pg']?.version,
}
if (direct['pg-boss'] !== '12.26.3') fail(`installed pg-boss=${direct['pg-boss']}`)
if (direct.pg !== '8.22.0') fail(`installed pg=${direct.pg}`)

console.log(JSON.stringify({
  lockfileVersion: lock.lockfileVersion,
  direct,
  packageCount: Object.keys(packages).length - 1,
  status: 'PASS',
}))

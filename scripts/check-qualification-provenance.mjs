import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../', import.meta.url).pathname)
const read = path => readFileSync(resolve(root, path))
const json = path => JSON.parse(read(path).toString('utf8'))
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const errors = []

const packageB = json('qualification/3l/mastra-runtime/package.json')
const evidenceB = json('qualification/3l/mastra-runtime/evidence/admission.json')
const lockB = read('qualification/3l/mastra-runtime/package-lock.json')
const expectedB = { '@mastra/core': '1.56.0', '@mastra/memory': '1.25.0', '@mastra/pg': '1.19.0' }
if (sha256(lockB) !== '5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0') errors.push('Package-B lock digest drift')
for (const [name, version] of Object.entries(expectedB)) {
  if (packageB.dependencies?.[name] !== version || evidenceB.directPins?.[name] !== version) errors.push(`Package-B pin drift: ${name}`)
}

const packageD = json('qualification/3l/managed-execution/package.json')
const evidenceD = json('qualification/3l/managed-execution/evidence/dt1p.json')
const lockD = read('qualification/3l/managed-execution/package-lock.json')
const vendorDdl = read('qualification/3l/managed-execution/vendor/pgboss-12.26.3-mar.sql')
if (packageD.dependencies?.['pg-boss'] !== '12.26.3' || evidenceD.dependencies?.['pg-boss'] !== '12.26.3') errors.push('Package-D pg-boss pin drift')
if (sha256(lockD) !== evidenceD.dependencies?.lockSha256) errors.push('Package-D lock digest drift')
if (sha256(vendorDdl) !== evidenceD.dependencies?.vendorDdlSha256) errors.push('Package-D vendor DDL digest drift')
if (evidenceD.authority !== 'docs/reference/managed-execution-qualification.md') errors.push('Package-D authority route drift')

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Qualification lock and provenance consistency passed.')
}

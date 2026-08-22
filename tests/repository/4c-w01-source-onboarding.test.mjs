import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { resolve } from 'node:path'

const root = resolve(new URL('../../', import.meta.url).pathname)
const read = p => readFileSync(resolve(root, p), 'utf8')

function operationSection(text, id, nextId) {
  const start = text.indexOf(`x-conexus-4a-id: ${id}`)
  if (start < 0) throw new Error(`missing ${id} in Project wire`)
  const end = nextId ? text.indexOf(`x-conexus-4a-id: ${nextId}`, start) : text.length
  return text.slice(start, end < 0 ? text.length : end)
}

test('W-01 can establish truthful greenfield/brownfield Project source authority before inception', () => {
  const wire = read('contracts/api/product/project-paths.yaml')
  const foundation = read('docs/evidence/4c/foundation-and-coverage.md')
  const inventory = read('docs/evidence/4c/candidate-screen-surface-inventory.md')
  const ledger = read('docs/product/operation-ledger.md')

  if (!foundation.includes('Create/import a Project')) throw new Error('test precondition lost: Journey B no longer requires create/import')
  if (!inventory.includes('Project create / source-association flow')) throw new Error('test precondition lost: W-01 source-association surface is no longer carried')
  if (!ledger.includes('exact greenfield/brownfield Project')) throw new Error('test precondition lost: PRJ-07 no longer covers greenfield/brownfield inception')

  const create = operationSection(wire, 'PRJ-03', 'PRJ-05')
  const inception = operationSection(wire, 'PRJ-07', 'PRJ-08')

  const createBody = create.match(/requestBody:[\s\S]*?(?=\n\s{6}responses:)/)?.[0] ?? ''
  const createProperties = [...createBody.matchAll(/^\s{16}([A-Za-z][A-Za-z0-9_-]*):\s*$/gm)].map(match => match[1])
  const hasCreationSourceInput = createProperties.some(name => /source|repo|repository|import|origin/i.test(name))
  const hasInceptionSourceInput = /requestBody:/.test(inception)
  const hasDedicatedSourceOperation = /\| `PRJ-[0-9]+` \| (?:Import|Associate|Set|Attach)[^|]*(?:Source|Repository|Repo)/i.test(ledger)

  if (!hasCreationSourceInput && !hasInceptionSourceInput && !hasDedicatedSourceOperation) {
    throw new Error('W-01 cannot express brownfield source onboarding: Journey B requires Create/Import and PRJ-07 expects an exact greenfield/brownfield Project, but current Product wire exposes no caller-visible source/repository onboarding authority before inception')
  }
})

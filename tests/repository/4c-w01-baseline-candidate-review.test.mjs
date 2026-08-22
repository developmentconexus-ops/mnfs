import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { resolve } from 'node:path'

const root = resolve(new URL('../../', import.meta.url).pathname)
const read = p => readFileSync(resolve(root, p), 'utf8')

function operationSection(text, id, nextId) {
  const start = text.indexOf(`x-conexus-4a-id: ${id}`)
  if (start < 0) throw new Error(`missing ${id}`)
  const end = nextId ? text.indexOf(`x-conexus-4a-id: ${nextId}`, start) : text.length
  return text.slice(start, end < 0 ? text.length : end)
}

test('W-01 exposes a durable exact candidate Baseline for human review before approval', () => {
  const product = read('docs/product/contract.md')
  const wire = read('contracts/api/product/project-paths.yaml')
  const ledger = read('docs/product/operation-ledger.md')
  const entry = read('contracts/api/product/openapi.yaml')

  if (!product.includes('human checkpoint: “this is what we are building”')) {
    throw new Error('test precondition lost: Journey B no longer requires a human Baseline checkpoint')
  }

  const inception = operationSection(wire, 'PRJ-07', 'PRJ-08')
  if (!inception.includes('candidateBaselineDigest')) throw new Error('test precondition lost: PRJ-07 no longer produces a candidate Baseline subject')
  if (!wire.includes('operationId: ApproveProjectBaselineRevision')) throw new Error('test precondition lost: PRJ-09 approval no longer exists')

  if (!ledger.includes('| `PRJ-23` | `GetProjectBaselineCandidate` |')) {
    throw new Error('4A must admit the exact candidate Baseline re-entry read before 4B can expose it')
  }
  if (!wire.includes('operationId: GetProjectBaselineCandidate') || !wire.includes('x-conexus-4a-id: PRJ-23')) {
    throw new Error('4B Project wire must expose the accepted PRJ-23 candidate Baseline read')
  }
  if (!entry.includes('/api/control/projects/{projectId}/baseline-candidates/{candidateBaselineDigest}:')) {
    throw new Error('canonical Product OAS must route the exact PRJ-23 candidate Baseline path')
  }

  const candidate = operationSection(wire, 'PRJ-23', null)
  for (const required of ['candidateBaselineDigest', 'sourceRevision', 'sourceText', 'applicationRuntimeProfile']) {
    if (!candidate.includes(required)) throw new Error(`PRJ-23 candidate read must expose ${required}`)
  }
  for (const profile of ['MANAGED', 'DEDICATED']) {
    if (!candidate.includes(profile)) throw new Error(`PRJ-23 candidate read must preserve runtime profile ${profile}`)
  }
  if (/ListProjectBaselineCandidates|candidate status|candidateStatus/i.test(candidate)) {
    throw new Error('PRJ-23 must not expand into candidate list/workflow CRUD')
  }
})

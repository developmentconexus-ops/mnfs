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

  if (!product.includes('human checkpoint: “this is what we are building”')) {
    throw new Error('test precondition lost: Journey B no longer requires a human Baseline checkpoint')
  }

  const inception = operationSection(wire, 'PRJ-07', 'PRJ-08')
  const approved = operationSection(wire, 'PRJ-08', 'PRJ-09')

  if (!inception.includes('candidateBaselineDigest')) throw new Error('test precondition lost: PRJ-07 no longer produces a candidate Baseline subject')
  if (!wire.includes('operationId: ApproveProjectBaselineRevision')) throw new Error('test precondition lost: PRJ-09 approval no longer exists')

  const hasDedicatedRead = /\| `PRJ-[0-9]+` \| `Get[^`]*(?:BaselineCandidate|CandidateProjectBaseline)[^`]*`/i.test(ledger)
  const approvedReadCanSelectCandidate = /(candidateBaselineDigest|candidateDigest)/i.test(approved)
  const inceptionProvidesStableProjectGitLocator = /(sourcePath|baselinePath)/i.test(inception) && /sourceRevision/i.test(inception)

  if (!hasDedicatedRead && !approvedReadCanSelectCandidate && !inceptionProvidesStableProjectGitLocator) {
    throw new Error('W-01 cannot re-enter/reload candidate Baseline review: current wire exposes a candidate digest and an approval command but no durable caller-readable exact candidate subject before approval')
  }
})

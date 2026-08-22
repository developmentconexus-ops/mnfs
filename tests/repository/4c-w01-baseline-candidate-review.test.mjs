import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { resolve } from 'node:path'

const root = resolve(new URL('../../', import.meta.url).pathname)
const read = p => readFileSync(resolve(root, p), 'utf8')

test('W-01 exposes a durable exact candidate Baseline for human review before approval', () => {
  const product = read('docs/product/contract.md')
  const wire = read('contracts/api/product/project-paths.yaml')
  const ledger = read('docs/product/operation-ledger.md')

  if (!product.includes('human checkpoint: “this is what we are building”')) {
    throw new Error('test precondition lost: Journey B no longer requires a human Baseline checkpoint')
  }
  if (!wire.includes('candidateBaselineDigest')) throw new Error('test precondition lost: PRJ-07 no longer produces a candidate Baseline subject')
  if (!wire.includes('ApproveProjectBaselineRevision')) throw new Error('test precondition lost: PRJ-09 approval no longer exists')

  const hasDedicatedRead = /\| `PRJ-[0-9]+` \| `Get[^`]*(?:BaselineCandidate|CandidateProjectBaseline)[^`]*`/i.test(ledger)
  const approvedReadCanSelectCandidate = /GetApprovedProjectBaseline[\s\S]{0,2000}(candidateBaselineDigest|candidateDigest)/i.test(wire)
  const projectGitProjectionCanResolveCandidate = /candidateBaselineDigest[\s\S]{0,2500}(sourcePath|baselinePath)[\s\S]{0,2500}sourceRevision/i.test(wire)

  if (!hasDedicatedRead && !approvedReadCanSelectCandidate && !projectGitProjectionCanResolveCandidate) {
    throw new Error('W-01 cannot re-enter/reload candidate Baseline review: current wire exposes a candidate digest and an approval command but no durable caller-readable exact candidate subject before approval')
  }
})

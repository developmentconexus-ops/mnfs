import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { resolve } from 'node:path'

const root = resolve(new URL('../../', import.meta.url).pathname)
const read = path => readFileSync(resolve(root, path), 'utf8')

const removed = new Map([
  ['WS-03', 'UpdateWorkspace'],
  ['WS-06', 'UpdateArea'],
  ['PRJ-04', 'UpdateProject']
])

test('operator-approved 4B-F01 recompiles fixed Product authority to exactly 111 operations', () => {
  const ledger = read('docs/product/operation-ledger.md')
  const sectionStart = ledger.indexOf('# 5. Fixed Conexus platform census')
  const sectionEnd = ledger.indexOf('\n---\n\n## 6. Product-visible Published Application boundary', sectionStart)
  if (sectionStart < 0 || sectionEnd < 0) throw new Error('unable to locate fixed-platform census in operation ledger')

  const fixedSection = ledger.slice(sectionStart, sectionEnd)
  const rows = [...fixedSection.matchAll(/^\| `([A-Z]+-\d+)` \| `([A-Za-z][A-Za-z0-9]+)` \|/gm)]
  if (rows.length !== 111) throw new Error(`expected 111 fixed 4A operations after 4B-F01, found ${rows.length}`)

  for (const [id, operationId] of removed) {
    if (fixedSection.includes(`\`${id}\``) || fixedSection.includes(`\`${operationId}\``)) {
      throw new Error(`removed 4B-F01 operation remains in current 4A census: ${id} ${operationId}`)
    }
  }
})

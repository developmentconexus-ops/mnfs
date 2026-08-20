import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { resolve } from 'node:path'

const root = resolve(new URL('../../', import.meta.url).pathname)

test('Conexus OS repository contract is green', () => {
  execFileSync(process.execPath, ['scripts/check-repository-hygiene.mjs'], { cwd: root, stdio: 'inherit' })
  execFileSync(process.execPath, ['scripts/check-doc-index.mjs'], { cwd: root, stdio: 'inherit' })
  execFileSync(process.execPath, ['scripts/check-current-state.mjs'], { cwd: root, stdio: 'inherit' })
  execFileSync(process.execPath, ['scripts/check-qualification-provenance.mjs'], { cwd: root, stdio: 'inherit' })
})

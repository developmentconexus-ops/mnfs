import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(new URL('../', import.meta.url).pathname)
const errors = []
const tracked = execFileSync('git', ['ls-files', '*.md'], { cwd: root, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean)

for (const path of tracked) {
  const text = readFileSync(resolve(root, path), 'utf8')
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0]
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue
    if (!existsSync(resolve(root, dirname(path), decodeURIComponent(target)))) {
      errors.push(`broken link: ${path} -> ${target}`)
    }
  }
}

const indexPath = resolve(root, 'docs/INDEX.md')
if (!existsSync(indexPath)) errors.push('missing docs/INDEX.md')
else {
  const index = readFileSync(indexPath, 'utf8')
  const permanent = tracked.filter(path =>
    path.startsWith('docs/') &&
    !path.includes('/evidence/') &&
    !path.startsWith('docs/research/mitra/evidence/') &&
    path !== 'docs/INDEX.md'
  )
  for (const path of permanent) {
    const relative = path.slice('docs/'.length)
    if (!index.includes(relative)) errors.push(`orphan narrative document: ${path}`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Documentation index and relative links passed.')
}

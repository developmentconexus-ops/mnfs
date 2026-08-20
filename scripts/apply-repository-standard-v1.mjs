import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'

const root = resolve(new URL('../', import.meta.url).pathname)
const at = path => resolve(root, path)
const normalize = path => path.replaceAll('\\', '/')

const moves = new Map([
  ['docs/ROADMAP.md', 'docs/roadmap.md'],
  ['docs/PRODUCT.md', 'docs/product/contract.md'],
  ['docs/ARCHITECTURE.md', 'docs/architecture/index.md'],
  ['docs/DECISIONS.md', 'docs/decisions/index.md'],
  ['docs/diagrams/INDEX.md', 'docs/diagrams/index.md'],
  ['docs/reference/mastra/INDEX.md', 'docs/reference/mastra/index.md'],
  ['docs/research/INDEX.md', 'docs/research/index.md'],
  ['docs/research/factory-ai/INDEX.md', 'docs/research/factory-ai/index.md'],
  ['docs/research/mastra/INDEX.md', 'docs/research/mastra/index.md'],
  ['docs/research/mitra/INDEX.md', 'docs/research/mitra/index.md'],
  ['docs/phases/3A-authority-baseline.md', 'docs/phases/3a-authority-baseline.md'],
  ['docs/phases/3L-technology-qualification.md', 'docs/phases/3l-technology-qualification.md'],
  ['docs/evidence/qualification/3L', 'docs/evidence/qualification/3l']
])

const routeMoves = new Map([
  ['docs/INDEX.md', 'docs/index.md'],
  ['docs/OPERATING-MODEL.md', 'docs/development/engineering-rules.md'],
  ['docs/engineering/REPOSITORY-WORKFLOW.md', 'docs/development/engineering-rules.md']
])

for (const [from, to] of moves) {
  if (!existsSync(at(from))) throw new Error(`missing migration source: ${from}`)
  if (existsSync(at(to))) throw new Error(`migration target already exists: ${to}`)
  mkdirSync(dirname(at(to)), { recursive: true })
  renameSync(at(from), at(to))
}

const allMoves = new Map([...moves, ...routeMoves])
const reverseMoves = new Map([...moves].map(([from, to]) => [to, from]))
const orderedMoves = [...allMoves.entries()].sort((a, b) => b[0].length - a[0].length)

function mappedPath(oldPath) {
  for (const [from, to] of orderedMoves) {
    if (oldPath === from) return to
    if (oldPath.startsWith(`${from}/`)) return `${to}${oldPath.slice(from.length)}`
  }
  return oldPath
}

function markdownFiles(dir = root, prefix = '') {
  const result = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue
    const abs = resolve(dir, entry.name)
    const rel = normalize(posix.join(prefix, entry.name))
    if (entry.isDirectory()) result.push(...markdownFiles(abs, rel))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) result.push(rel)
  }
  return result
}

function rewriteMarkdownLinks(path) {
  let text = readFileSync(at(path), 'utf8')
  const originalPath = reverseMoves.get(path) ?? path
  text = text.replace(/(\[[^\]]*\]\()([^)#\s]+)(#[^)]*)?(\))/g, (whole, open, target, anchor = '', close) => {
    if (/^(?:https?:|mailto:|#)/i.test(target)) return whole
    let decoded
    try { decoded = decodeURIComponent(target) } catch { decoded = target }
    const oldAbsolute = posix.normalize(posix.join(posix.dirname(originalPath), decoded))
    if (oldAbsolute === 'docs/engineering/METHOD.md') {
      return `${open}https://github.com/developmentconexus-ops/conexus-methodology/blob/main/METHOD.md${anchor}${close}`
    }
    const newAbsolute = mappedPath(oldAbsolute)
    let next = posix.relative(posix.dirname(path), newAbsolute)
    if (!next) next = posix.basename(newAbsolute)
    return `${open}${next}${anchor}${close}`
  })
  writeFileSync(at(path), text)
}

for (const path of markdownFiles()) rewriteMarkdownLinks(path)

const plainReplacements = new Map([
  ['docs/INDEX.md', 'docs/index.md'],
  ['docs/ROADMAP.md', 'docs/roadmap.md'],
  ['docs/PRODUCT.md', 'docs/product/contract.md'],
  ['docs/ARCHITECTURE.md', 'docs/architecture/index.md'],
  ['docs/DECISIONS.md', 'docs/decisions/index.md'],
  ['docs/OPERATING-MODEL.md', 'docs/development/engineering-rules.md'],
  ['docs/engineering/METHOD.md', 'developmentconexus-ops/conexus-methodology/METHOD.md'],
  ['docs/engineering/REPOSITORY-WORKFLOW.md', 'docs/development/engineering-rules.md'],
  ['docs/diagrams/INDEX.md', 'docs/diagrams/index.md'],
  ['docs/reference/mastra/INDEX.md', 'docs/reference/mastra/index.md'],
  ['docs/research/INDEX.md', 'docs/research/index.md'],
  ['docs/research/factory-ai/INDEX.md', 'docs/research/factory-ai/index.md'],
  ['docs/research/mastra/INDEX.md', 'docs/research/mastra/index.md'],
  ['docs/research/mitra/INDEX.md', 'docs/research/mitra/index.md'],
  ['docs/phases/3A-authority-baseline.md', 'docs/phases/3a-authority-baseline.md'],
  ['docs/phases/3L-technology-qualification.md', 'docs/phases/3l-technology-qualification.md'],
  ['docs/evidence/qualification/3L', 'docs/evidence/qualification/3l']
])

for (const path of markdownFiles().filter(path => !path.startsWith('docs/evidence/') && !path.includes('/evidence/') && !path.startsWith('qualification/'))) {
  let text = readFileSync(at(path), 'utf8')
  for (const [from, to] of plainReplacements) text = text.replaceAll(from, to)
  writeFileSync(at(path), text)
}

const productPath = 'docs/product/contract.md'
let product = readFileSync(at(productPath), 'utf8')
const productLines = product.split('\n')
const statusStart = productLines.findIndex(line => line.startsWith('> **Status:**'))
const statusEnd = productLines.findIndex((line, index) => index >= statusStart && line.startsWith('> **Package B:**'))
if (statusStart < 0 || statusEnd < statusStart) throw new Error('Product status header shape changed')
productLines.splice(statusStart, statusEnd - statusStart + 1,
  '> **Semantic authority:** CURRENT / ACCEPTED PRODUCT CONTRACT  ',
  '> **Mutable status:** owned only by [../roadmap.md](../roadmap.md). Accepted technology qualification is summarized in [../phases/3l-technology-qualification.md](../phases/3l-technology-qualification.md).  ',
  '> **Method:** DevelopmentConexus Engineering Method v1.0.0')
product = productLines.join('\n')
const section33 = /# 33\. Qualification-state boundary[\s\S]*?\n---\n\n# 34\. Reopen triggers/
if (!section33.test(product)) throw new Error('Product qualification-state section shape changed')
product = product.replace(section33, '# 33. Qualification-state boundary\n\nThis Product Contract owns required Product meaning, not mutable phase or technology-qualification status. Current stage/implementation authority lives only in [../roadmap.md](../roadmap.md). The accepted bounded 3L outcomes, exact pins, proven properties, unproven properties and requalification triggers live in [../phases/3l-technology-qualification.md](../phases/3l-technology-qualification.md) and the routed qualification references.\n\nFramework/substrate Evidence may strengthen or falsify a realization claim; it never changes Product meaning by implication.\n\n---\n\n# 34. Reopen triggers')
product = product.replace(/^\*\*Next:\*\*.*$/m, '**Current next action:** owned only by [../roadmap.md](../roadmap.md). This accepted Product verdict does not authorize a later phase or implementation by inheritance.')
writeFileSync(at(productPath), product)

for (const obsolete of ['docs/INDEX.md', 'docs/OPERATING-MODEL.md', 'docs/engineering/METHOD.md', 'docs/engineering/REPOSITORY-WORKFLOW.md']) {
  if (existsSync(at(obsolete))) rmSync(at(obsolete), { force: true })
}
if (existsSync(at('docs/engineering')) && readdirSync(at('docs/engineering')).length === 0) rmSync(at('docs/engineering'), { recursive: true, force: true })

console.log('Repository Standard v1 path/link/status transformation applied.')

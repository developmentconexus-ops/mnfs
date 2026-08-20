import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, posix, relative, resolve } from 'node:path'

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

const linkOnlyMoves = new Map([
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

const allMoves = new Map([...moves, ...linkOnlyMoves])
const reverseMoves = new Map([...moves].map(([from, to]) => [to, from]))

function mappedPath(oldPath) {
  const candidates = [...allMoves.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [from, to] of candidates) {
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

const currentDocs = markdownFiles().filter(path =>
  !path.startsWith('docs/evidence/') &&
  !path.includes('/evidence/') &&
  !path.startsWith('qualification/')
)
for (const path of currentDocs) {
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
product = product.replace(section33, `# 33. Qualification-state boundary\n\nThis Product Contract owns required Product meaning, not mutable phase or technology-qualification status. Current stage/implementation authority lives only in [../roadmap.md](../roadmap.md). The accepted bounded 3L outcomes, exact pins, proven properties, unproven properties and requalification triggers live in [../phases/3l-technology-qualification.md](../phases/3l-technology-qualification.md) and the routed qualification references.\n\nFramework/substrate Evidence may strengthen or falsify a realization claim; it never changes Product meaning by implication.\n\n---\n\n# 34. Reopen triggers`)
product = product.replace(/^\*\*Next:\*\*.*$/m, '**Current next action:** owned only by [../roadmap.md](../roadmap.md). This accepted Product verdict does not authorize a later phase or implementation by inheritance.')
writeFileSync(at(productPath), product)

const index = `# Conexus OS Documentation\n\nThis is the canonical task/intention router. Current stage, implementation gate and exact next action live only in [roadmap.md](roadmap.md).\n\n## Fresh-actor route\n\n\`\`\`text\nAGENTS.md\n→ docs/index.md\n→ docs/roadmap.md\n→ 1–2 task-specific owning documents\n\`\`\`\n\nDefault task pack is at most five files. Do not recursively read \`docs/\`, Git history, research, phase history or qualification harnesses before a concrete task requires them.\n\n## Read by task\n\n| Need | Read first | Add only when needed | Do not read by default |\n| --- | --- | --- | --- |\n| Current stage / implementation gate | [roadmap.md](roadmap.md) | [development/engineering-rules.md](development/engineering-rules.md) | research, qualification |\n| Product meaning / scope / journeys | [product/contract.md](product/contract.md) | [decisions/index.md](decisions/index.md) | research, phase history |\n| Architecture overview / owners | [architecture/index.md](architecture/index.md) | one reference below | research, raw Evidence |\n| Builder / Harness | [reference/builder-and-harness.md](reference/builder-and-harness.md) | [reference/security-and-authority.md](reference/security-and-authority.md) | raw qualification |\n| Product Agents / runtime | [reference/runtime-and-agents.md](reference/runtime-and-agents.md) | [reference/mastra/index.md](reference/mastra/index.md) | qualification unless requalifying |\n| Mastra | [reference/mastra/index.md](reference/mastra/index.md) | one mapped Mastra reference; then vendored skill/current docs if material | unrelated research |\n| Brain / knowledge | [reference/brain-and-knowledge.md](reference/brain-and-knowledge.md) | [reference/data-and-persistence.md](reference/data-and-persistence.md) | Mitra unless comparing |\n| Data / Sankhya | [reference/data-and-persistence.md](reference/data-and-persistence.md) | [reference/integrations-and-gateway.md](reference/integrations-and-gateway.md) | runtime qualification |\n| Integrations / Gateway | [reference/integrations-and-gateway.md](reference/integrations-and-gateway.md) | [reference/security-and-authority.md](reference/security-and-authority.md) | raw research |\n| Security / authority | [reference/security-and-authority.md](reference/security-and-authority.md) | [architecture/index.md](architecture/index.md) | implementation history |\n| Release / deployment / failure-recovery | [reference/release-deployment-and-operations.md](reference/release-deployment-and-operations.md) | [roadmap.md](roadmap.md) | future 3M design until opened |\n| Frontend / Product surfaces | [reference/frontend-and-product-surfaces.md](reference/frontend-and-product-surfaces.md) | [product/contract.md](product/contract.md) | qualification |\n| Managed execution | [reference/managed-execution.md](reference/managed-execution.md) | [reference/managed-execution-qualification.md](reference/managed-execution-qualification.md) | unrelated runtime research |\n| Decision rationale / reopen | [decisions/index.md](decisions/index.md) | [phases/3a-authority-baseline.md](phases/3a-authority-baseline.md) | old review rounds in Git |\n| Repository workflow | [development/engineering-rules.md](development/engineering-rules.md) | organizational Method / Repository Standard | Product research |\n| Diagrams | [diagrams/index.md](diagrams/index.md) | owning architecture/reference doc | raw Evidence |\n| Mitra comparison | [research/mitra/index.md](research/mitra/index.md) | full study / influence map | raw observations |\n| Factory AI comparison | [research/factory-ai/index.md](research/factory-ai/index.md) | full study / influence map | unrelated research |\n| Mastra research provenance | [research/mastra/index.md](research/mastra/index.md) | evaluation/provenance | Product authority |\n| Requalify a 3L claim | [phases/3l-technology-qualification.md](phases/3l-technology-qualification.md) | exact routed Evidence/harness | Product implementation history |\n\n## Authority hierarchy\n\n\`\`\`text\naccepted Product / architecture authority\n→ current decision register + roadmap\n→ detailed current technical references\n→ accepted qualification conclusions\n→ reproducible Evidence + exact pinned source\n→ research + historical Git content\n\`\`\`\n\nMechanism is not authority. Research and reviewer findings are Evidence, never implicit Product requirements.\n\n## Organizational authorities\n\n- Engineering reasoning: [DevelopmentConexus Engineering Method v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/METHOD.md).\n- Repository operating envelope: [DevelopmentConexus Repository Standard v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/REPOSITORY-STANDARD.md).\n- Repository-specific rules: [development/engineering-rules.md](development/engineering-rules.md).\n\n## Durable supporting routes\n\n- Phase baselines: [3A](phases/3a-authority-baseline.md), [3L](phases/3l-technology-qualification.md).\n- Research router: [research/index.md](research/index.md).\n- Qualification Evidence summary: [evidence/qualification/3l/summary.md](evidence/qualification/3l/summary.md).\n- Executable qualification harnesses live under \`qualification/3l/\` and are opt-in, never default-read.\n`
writeFileSync(at('docs/index.md'), index)

const engineeringRules = `# Conexus OS Engineering Rules\n\nThis page contains only repository-local specialization. Cross-repository reasoning and repository governance are canonical in:\n\n- [DevelopmentConexus Engineering Method v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/METHOD.md)\n- [DevelopmentConexus Repository Standard v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/REPOSITORY-STANDARD.md)\n\n## Local execution environment\n\nUse Ubuntu WSL2 and a Linux-filesystem worktree. Preserve unowned state. Never reset, clean, stash, force-update or discard work you do not own.\n\n## Conexus-specific material stops\n\nStop and return to the smallest owning decision when work would create/change a Product requirement, semantic owner, trust boundary, structural runtime/database/service/module, delete accepted semantics without a destination, require unauthorized production effects/secrets, or require Product/architecture redesign to make verification pass.\n\nCurrent stage and implementation authorization are owned only by [../roadmap.md](../roadmap.md).\n\n## Framework-sensitive work\n\nFor Mastra-sensitive work, load \`.agents/skills/mastra/SKILL.md\`. Use current Context7/official documentation only when materially useful, and decide version-specific claims from exact pinned package/source/configuration plus bounded Evidence. Research/framework docs never become Product authority.\n\nQualification suites under \`qualification/\` are opt-in and prove only their named claims. Live provider/model/E2B/Sankhya execution requires the authority of the exact proof task; it is never implied by a green root gate.\n\n## Change lifecycle\n\nOne coherent phase/gate owns one branch and PR. Codex may execute autonomously inside accepted boundaries; material findings return to the Lead/operator. Use the canonical isolated Fable review workflow from the Repository Standard and methodology README when independent review is required. Temporary work/review files never merge.\n\nDefine a falsifier before material implementation, show material guards can fire, run focused proof, then run:\n\n\`\`\`bash\nnpm ci\nnpm run verify\n\`\`\`\n\nPublish reviewable changes. Never merge without explicit operator authority.\n`
mkdirSync(at('docs/development'), { recursive: true })
writeFileSync(at('docs/development/engineering-rules.md'), engineeringRules)

const agents = `# Conexus OS — Agent Bootstrap\n\n## Start here\n\n\`\`\`text\nAGENTS.md\n→ docs/index.md\n→ docs/roadmap.md\n→ 1–2 task-specific owning documents\n\`\`\`\n\nDefault pack is at most five files. Do not recursively read \`docs/\`, research, phase history, Git history or qualification harnesses before a concrete task requires them.\n\n## Organizational standards\n\nEngineering reasoning follows \`developmentconexus-ops/conexus-methodology/METHOD.md\` v1.0.0. Repository organization/workflow follows \`developmentconexus-ops/conexus-methodology/REPOSITORY-STANDARD.md\` v1.0.0. Repository-specific rules live in [docs/development/engineering-rules.md](docs/development/engineering-rules.md).\n\nCurrent accepted authority beats historical Git content. Research, code, tests, runtime, framework docs and reviewer output are Evidence/mechanics, not Product authority. Mechanism is not authority.\n\nFor Mastra-sensitive work, load \`.agents/skills/mastra/SKILL.md\`; use Context7/current external docs only when material; decide version-specific claims from exact pinned source/configuration and bounded Evidence.\n\nStop on a material Product/owner/trust/structural-boundary contradiction or unauthorized production effect. Otherwise keep work proportional and autonomous inside accepted boundaries.\n\nUse Ubuntu WSL2 with a Linux-filesystem worktree. Preserve unowned state. Run \`npm ci && npm run verify\` before claiming completion. One coherent phase/gate owns one PR. Never merge without explicit operator authority.\n\nCurrent stage, next action and implementation status live only in [docs/roadmap.md](docs/roadmap.md).\n`
writeFileSync(at('AGENTS.md'), agents)

const readme = `# Conexus OS\n\nConexus OS is an AI-first enterprise platform for building, evolving, and operating governed business applications and Product Agents over real enterprise systems and data, with reusable enterprise knowledge, explicit authority, verifiable engineering, and truthful operational evidence.\n\nPublic route: [https://conexus.fun/conexus](https://conexus.fun/conexus)\n\n## Start here\n\n- [Agent bootstrap](AGENTS.md)\n- [Documentation index](docs/index.md)\n- [Current roadmap](docs/roadmap.md)\n\n## Verification\n\n\`\`\`bash\nnpm ci\nnpm run verify\n\`\`\`\n\nThis README is a landing page only; it owns no mutable program status or architecture authority.\n`
writeFileSync(at('README.md'), readme)

const contributing = `# Contributing to Conexus OS\n\nStart with \`AGENTS.md\`, then \`docs/index.md\`, \`docs/roadmap.md\`, and the smallest task-specific authority pack. Repository workflow follows the DevelopmentConexus Repository Standard v1.0.0; engineering decisions follow the DevelopmentConexus Engineering Method v1.0.0.\n\nUse an Ubuntu WSL2 Linux-filesystem worktree. Create one focused branch/PR for one coherent gate. Define proof before material implementation; show meaningful negative controls can fire; run focused checks and then:\n\n\`\`\`bash\nnpm ci\nnpm run verify\n\`\`\`\n\nFramework, dependency, and live-integration claims require current primary documentation plus exact pinned source/configuration and proportionate Evidence. Research never becomes Product authority without an accepted decision.\n\nDo not infer mutable stage, implementation permission, or merge authorization from history; [docs/roadmap.md](docs/roadmap.md) owns current program status and operator authority owns merge.\n`
writeFileSync(at('CONTRIBUTING.md'), contributing)

for (const obsolete of ['docs/INDEX.md', 'docs/OPERATING-MODEL.md', 'docs/engineering/METHOD.md', 'docs/engineering/REPOSITORY-WORKFLOW.md']) {
  if (existsSync(at(obsolete))) rmSync(at(obsolete), { force: true })
}
if (existsSync(at('docs/engineering')) && readdirSync(at('docs/engineering')).length === 0) rmSync(at('docs/engineering'), { recursive: true, force: true })

const hygiene = `import { execFileSync } from 'node:child_process'\nimport { existsSync, readFileSync } from 'node:fs'\nimport { resolve } from 'node:path'\n\nconst root = resolve(new URL('../', import.meta.url).pathname)\nconst tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\\0').filter(Boolean)\nconst errors = []\nconst forbiddenLegacy = ['m', 'n', 'f', 's'].join('')\nconst reviewCandidate = process.env.REVIEW_CANDIDATE_REF || ''\nconst reviewFile = 'docs/work/current/ai-dialog.md'\n\nif (reviewCandidate) {\n  const changed = execFileSync('git', ['diff', '--name-only', `${reviewCandidate}...HEAD`], { cwd: root, encoding: 'utf8' }).trim().split('\\n').filter(Boolean)\n  if (changed.length !== 1 || changed[0] !== reviewFile) errors.push(`review branch must differ from candidate only by ${reviewFile}: ${changed.join(', ') || 'no diff'}`)\n  const candidatePaths = execFileSync('git', ['ls-tree', '-r', '--name-only', reviewCandidate], { cwd: root, encoding: 'utf8' }).split('\\n').filter(Boolean)\n  if (candidatePaths.some(path => path.startsWith('docs/work/'))) errors.push('review candidate itself contains docs/work/**')\n} else if (existsSync(resolve(root, 'docs/work'))) {\n  errors.push('merge candidate/main must not contain docs/work/**')\n}\n\nfor (const path of tracked) {\n  const normalized = path.toLowerCase()\n  if (normalized.includes(forbiddenLegacy)) errors.push(`legacy path: ${path}`)\n  if (normalized.startsWith('docs/superpowers/')) errors.push(`superseded documentation tree: ${path}`)\n  if (/(handoff|dialogue|round|correction-handoff)/i.test(path) && path !== reviewFile) errors.push(`transient path: ${path}`)\n  if (/^(ai_dialog|knowledge-migration)\\.md$/i.test(path)) errors.push(`temporary root artifact: ${path}`)\n  if (normalized.startsWith('docs/work/') && !(reviewCandidate && path === reviewFile)) errors.push(`temporary work path in candidate: ${path}`)\n\n  const bytes = readFileSync(resolve(root, path))\n  if (!bytes.includes(0) && bytes.toString('utf8').toLowerCase().includes(forbiddenLegacy)) errors.push(`legacy content: ${path}`)\n}\n\nconst packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))\nif (packageJson.name !== 'conexus-os' || packageJson.private !== true) errors.push('package identity must be private conexus-os')\n\nfor (const forbidden of [\n  \`.\${forbiddenLegacy}/\`,\n  \`.pi/skills/\${forbiddenLegacy}-plan/\`,\n  \`bin/\${forbiddenLegacy}.mjs\`,\n  'docs/conexus/current/',\n  'docs/INDEX.md',\n  'docs/ROADMAP.md',\n  'docs/PRODUCT.md',\n  'docs/ARCHITECTURE.md',\n  'docs/DECISIONS.md',\n  'docs/OPERATING-MODEL.md',\n  'docs/engineering/METHOD.md',\n  'docs/engineering/REPOSITORY-WORKFLOW.md'\n]) {\n  if (tracked.some(path => path.startsWith(forbidden))) errors.push(`forbidden superseded path: ${forbidden}`)\n}\n\nif (errors.length) { console.error(errors.join('\\n')); process.exitCode = 1 }\nelse console.log(`Repository hygiene passed (${tracked.length} tracked files).`)\n`
writeFileSync(at('scripts/check-repository-hygiene.mjs'), hygiene)

const docIndex = `import { existsSync, readFileSync } from 'node:fs'\nimport { dirname, resolve } from 'node:path'\nimport { execFileSync } from 'node:child_process'\n\nconst root = resolve(new URL('../', import.meta.url).pathname)\nconst errors = []\nconst tracked = execFileSync('git', ['ls-files', '*.md'], { cwd: root, encoding: 'utf8' }).trim().split('\\n').filter(Boolean)\nconst durable = tracked.filter(path => path.startsWith('docs/') && !path.startsWith('docs/work/') && !path.includes('/evidence/') && !path.startsWith('docs/evidence/'))\nconst links = new Map()\n\nfor (const path of tracked) {\n  const text = readFileSync(resolve(root, path), 'utf8')\n  const outgoing = []\n  for (const match of text.matchAll(/\\[[^\\]]*\\]\\(([^)]+)\\)/g)) {\n    const target = match[1].split('#')[0]\n    if (!target || /^(?:https?:|mailto:)/.test(target)) continue\n    const absolute = resolve(root, dirname(path), decodeURIComponent(target))\n    if (!existsSync(absolute)) errors.push(`broken link: ${path} -> ${target}`)\n    else {\n      const relative = absolute.slice(root.length + 1).replaceAll('\\\\', '/')\n      if (relative.endsWith('.md')) outgoing.push(relative)\n    }\n  }\n  links.set(path, outgoing)\n}\n\nif (!existsSync(resolve(root, 'docs/index.md'))) errors.push('missing docs/index.md')\nelse {\n  const seen = new Set(['docs/index.md'])\n  const queue = ['docs/index.md']\n  while (queue.length) {\n    const current = queue.shift()\n    for (const next of links.get(current) ?? []) if (!seen.has(next)) { seen.add(next); queue.push(next) }\n  }\n  for (const path of durable) if (!seen.has(path)) errors.push(`orphan durable document: ${path}`)\n}\n\nif (errors.length) { console.error(errors.join('\\n')); process.exitCode = 1 }\nelse console.log('Documentation index, reachability, and relative links passed.')\n`
writeFileSync(at('scripts/check-doc-index.mjs'), docIndex)

const currentState = `import { existsSync, readFileSync } from 'node:fs'\nimport { resolve } from 'node:path'\n\nconst root = resolve(new URL('../', import.meta.url).pathname)\nconst read = path => readFileSync(resolve(root, path), 'utf8')\nconst canonical = ['docs/index.md', 'docs/roadmap.md', 'docs/product/contract.md', 'docs/architecture/index.md', 'docs/decisions/index.md', 'docs/development/engineering-rules.md']\nconst errors = []\nfor (const path of canonical) if (!existsSync(resolve(root, path))) errors.push(`missing canonical document: ${path}`)\n\nconst roadmap = existsSync(resolve(root, 'docs/roadmap.md')) ? read('docs/roadmap.md') : ''\nconst rows = [...roadmap.matchAll(/^\\| ([^|]+?) \\| ([^|]+?) \\|/gm)].map(([, name, status]) => ({ name: name.trim(), status: status.trim() }))\nconst byName = new Map(rows.map(row => [row.name, row.status]))\nfor (const required of ['3A', '3B–3K', '3L', '3M', '3N', '3O', 'C-018', 'Product implementation']) if (!byName.has(required)) errors.push(`roadmap missing status row: ${required}`)\nconst phases = rows.filter(({ name }) => /^3(?:[A-Z]|[A-Z]–3[A-Z])$/.test(name))\nconst allowedPhaseStatuses = new Set(['CLOSED', 'NEXT / NOT STARTED', 'NOT STARTED'])\nfor (const { name, status } of phases) if (!allowedPhaseStatuses.has(status)) errors.push(`roadmap invalid phase status for ${name}: ${status}`)\nconst nextPhases = phases.filter(({ status }) => status === 'NEXT / NOT STARTED')\nconst firstOpen = phases.findIndex(({ status }) => status !== 'CLOSED')\nif (firstOpen < 0) { if (nextPhases.length !== 0) errors.push('roadmap cannot contain NEXT after all phases close') }\nelse {\n  if (nextPhases.length !== 1) errors.push(`roadmap must contain exactly one NEXT / NOT STARTED phase; found ${nextPhases.length}`)\n  if (phases[firstOpen]?.status !== 'NEXT / NOT STARTED') errors.push('roadmap first non-closed phase must be NEXT / NOT STARTED')\n  if (phases.slice(firstOpen + 1).some(({ status }) => status !== 'NOT STARTED')) errors.push('roadmap phases after NEXT must be NOT STARTED')\n}\nif (byName.get('C-018') === 'RATIFIED' && phases.some(({ status }) => status !== 'CLOSED')) errors.push('C-018 cannot be RATIFIED before all phases close')\nif (byName.get('Product implementation') !== 'BLOCKED' && byName.get('C-018') !== 'RATIFIED') errors.push('Product implementation cannot be unblocked before C-018 ratification')\n\nconst decisions = existsSync(resolve(root, 'docs/decisions/index.md')) ? read('docs/decisions/index.md') : ''\nconst decisionRows = [...decisions.matchAll(/^\\| (C-[A-Z0-9-]+) \\| .*? \\| ([^|]+?) \\|/gm)].map(([, id, status]) => ({ id, status: status.trim() }))\nconst controlled = new Set(['CURRENT', 'PRESERVE', 'REFINED', 'PARTIALLY_SUPERSEDED', 'SUPERSEDED', 'DEFERRED', 'REJECTED_F1', 'REOPEN', 'NOT RATIFIED'])\nfor (const { id, status } of decisionRows) if (![...controlled].some(term => status === term || status.startsWith(`${term} / `) || status.startsWith(`${term} AS `))) errors.push(`${id} has uncontrolled disposition: ${status}`)\n\nconst bootstrapPaths = ['AGENTS.md', 'docs/index.md', 'docs/roadmap.md']\nconst bootstrapBytes = bootstrapPaths.reduce((sum, path) => sum + Buffer.byteLength(read(path)), 0)\nif (bootstrapBytes > 20 * 1024) errors.push(`bootstrap budget exceeded: ${bootstrapBytes} > 20480`)\n\nfor (const path of ['AGENTS.md', 'README.md', 'docs/index.md']) {\n  const text = read(path)\n  if (!text.includes('roadmap.md')) errors.push(`${path} must route mutable status to docs/roadmap.md`)\n  if (/3M\\s*(?:=|is)\\s*(?:NEXT|next)/i.test(text) || /NEXT \/ NOT STARTED/.test(text)) errors.push(`${path} must not restate mutable phase status`)\n}\nconst readme = read('README.md')\nif (/NOT RATIFIED|Product implementation\\s*=|Current phase/i.test(readme)) errors.push('README.md must remain landing-only')\nconst product = read('docs/product/contract.md')\nfor (const stale of ['BT-3N NEXT', 'Package B:** IN PROGRESS', 'Package D Managed Execution             = REDERIVE']) if (product.includes(stale)) errors.push(`Product contract contains stale mutable qualification status: ${stale}`)\nfor (const obsolete of ['docs/INDEX.md', 'docs/ROADMAP.md', 'docs/PRODUCT.md', 'docs/ARCHITECTURE.md', 'docs/DECISIONS.md', 'docs/OPERATING-MODEL.md', 'docs/engineering/METHOD.md']) if (existsSync(resolve(root, obsolete))) errors.push(`superseded canonical path remains: ${obsolete}`)\n\nif (!read('AGENTS.md').includes('REPOSITORY-STANDARD.md')) errors.push('AGENTS.md must cite canonical Repository Standard')\nif (!read('docs/development/engineering-rules.md').includes('conexus-methodology')) errors.push('local engineering rules must cite canonical organizational authorities')\n\nif (errors.length) { console.error(errors.join('\\n')); process.exitCode = 1 }\nelse console.log(`Canonical current state passed (bootstrap_bytes=${bootstrapBytes}).`)\n`
writeFileSync(at('scripts/check-current-state.mjs'), currentState)

const test = `import { execFileSync, spawnSync } from 'node:child_process'\nimport { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'\nimport { test } from 'node:test'\nimport { resolve } from 'node:path'\n\nconst root = resolve(new URL('../../', import.meta.url).pathname)\nconst run = script => spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })\n\ntest('Conexus OS repository contract is green', () => {\n  for (const script of ['scripts/check-repository-hygiene.mjs', 'scripts/check-doc-index.mjs', 'scripts/check-current-state.mjs', 'scripts/check-qualification-provenance.mjs']) execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' })\n})\n\ntest('repository hygiene guard fires on temporary work contamination', () => {\n  const workDir = resolve(root, 'docs/work/current')\n  const file = resolve(workDir, 'ai-dialog.md')\n  mkdirSync(workDir, { recursive: true })\n  writeFileSync(file, '# temporary review\\n')\n  try {\n    const result = run('scripts/check-repository-hygiene.mjs')\n    if (result.status === 0 || !`${result.stdout}\\n${result.stderr}`.includes('docs/work')) throw new Error('hygiene negative control did not fire')\n  } finally { rmSync(resolve(root, 'docs/work'), { recursive: true, force: true }) }\n})\n\ntest('bootstrap/status guard fires when README becomes a phase authority', () => {\n  const path = resolve(root, 'README.md')\n  const original = readFileSync(path, 'utf8')\n  writeFileSync(path, `${original}\\n3M = NEXT / NOT STARTED\\n`)\n  try {\n    const result = run('scripts/check-current-state.mjs')\n    if (result.status === 0 || !`${result.stdout}\\n${result.stderr}`.includes('README.md')) throw new Error('status negative control did not fire')\n  } finally { writeFileSync(path, original) }\n})\n`
writeFileSync(at('tests/repository/repository-contract.test.mjs'), test)

console.log('Repository Standard v1 transformation applied.')

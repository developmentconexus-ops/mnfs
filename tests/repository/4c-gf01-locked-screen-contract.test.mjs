import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { resolve } from 'node:path'

const root = resolve(new URL('../../', import.meta.url).pathname)
const path = p => resolve(root, p)
const read = p => readFileSync(path(p), 'utf8')

function requireText(text, needle, message) {
  if (!text.includes(needle)) throw new Error(message)
}

test('operator-approved GF-01 H1-R2 is locked and closed through exact P9/P10 trace', () => {
  const htmlPath = 'docs/evidence/4c/gf01-global-frame-wireframe.html'
  const contractPath = 'docs/evidence/4c/gf01-screen-contract.md'
  if (!existsSync(path(contractPath))) throw new Error('GF-01 exact Screen Contract must exist after operator lock')

  const html = read(htmlPath)
  const hypotheses = read('docs/evidence/4c/gf01-structural-hypotheses.md')
  const contract = read(contractPath)
  const ia = read('docs/evidence/4c/candidate-information-architecture.md')
  const roadmap = read('docs/roadmap.md')

  requireText(hypotheses, 'LOCKED / OPERATOR APPROVED', 'GF-01 hypotheses must record the operator-only lock')
  requireText(hypotheses, 'H1-R2', 'GF-01 lock must identify H1-R2 exactly')
  requireText(html, 'LOCKED', 'current GF-01 rendered baseline must show locked status')
  if (html.includes('CANDIDATE · NOT LOCKED')) throw new Error('locked GF-01 HTML must not still claim NOT LOCKED')

  for (const exactTrace of [
    'IAM-01 GetControlPlaneAccessContext',
    'IAM-02 EndSession',
    'WS-02 GetWorkspace',
    'PRJ-02 GetProject',
    'BLD-16 AskConexusAboutContext',
  ]) requireText(contract, exactTrace, `GF-01 Screen Contract missing ${exactTrace}`)

  for (const law of [
    'context switch = NAVIGATION',
    'workspace shortcut = NAVIGATION',
    'drawer/menu/panel open-close = EPHEMERAL_UI',
    'opening the contextual assistant seam MUST NOT invoke BLD-16',
    'workspaceId / projectId = URL_NAVIGATION',
    'Workspace.name / Project.name = SERVER presentation identity',
    'P10 graduated shared patterns = 0',
    'P11 = NOT TRIGGERED SEPARATELY',
  ]) requireText(contract, law, `GF-01 closure missing law: ${law}`)

  requireText(ia, 'GF-01 H1-R2 = LOCKED / OPERATOR APPROVED', 'Control Plane IA must project the GF-01 lock')
  requireText(roadmap, 'GF-01 LOCKED', 'roadmap must show GF-01 locked')
  requireText(roadmap, 'Open `W-01`', 'roadmap must advance only to W-01 after GF-01 closure')
})

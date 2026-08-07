from pathlib import Path

ROOT = Path.cwd()
BP = ROOT / 'docs' / 'product' / 'blueprint'


def load(name):
    p = BP / name
    return p, p.read_text()


def save(p, before, after):
    if before == after:
        raise RuntimeError(f'no change produced for {p}')
    p.write_text(after)


def req(s, old, new, label, count=None):
    if old not in s:
        raise RuntimeError(f'missing locus: {label}')
    return s.replace(old, new, -1 if count is None else count)


def between(s, start, end, replacement, label):
    a = s.find(start)
    if a < 0:
        raise RuntimeError(f'missing start: {label}')
    b = s.find(end, a + len(start))
    if b < 0:
        raise RuntimeError(f'missing end: {label}')
    return s[:a] + replacement + s[b:]

# Section 01: operator experience is workspace-neutral.
p, s = load('01-product-vision.md'); before = s
s = req(s, '- abrir worktrees;', '- materializar isolated mutable workspaces manualmente;', '01 operator workspaces')
save(p, before, s)

# Section 02: anti-model names the semantic mistake, not a Git substrate.
p, s = load('02-domain-model.md'); before = s
s = req(s, '- worktree novo para todo retry;', '- novo physical workspace para todo retry sem necessidade de isolamento adicional;', '02 retry anti-model')
save(p, before, s)

# Section 03: lifecycle semantics use isolated mutable workspace everywhere.
p, s = load('03-lifecycle-flows.md'); before = s
for old, new in [
    ('worktrees', 'isolated mutable workspaces'),
    ('Worktrees', 'Isolated mutable workspaces'),
    ('worktree', 'isolated mutable workspace'),
    ('Worktree', 'Isolated mutable workspace'),
]:
    s = s.replace(old, new)
s = s.replace('| Lease ACTIVE | isolated mutable workspace existe | healthy |', '| current workspace/environment binding | physical mutable workspace exists | healthy |')
s = s.replace('| Lease ACTIVE | isolated mutable workspace ausente | divergence |', '| current workspace/environment binding | physical mutable workspace missing | divergence |')
s = s.replace('| sem Lease | isolated mutable workspace MNFS órfão | divergence |', '| no current workspace binding | MNFS-like mutable workspace orphan | divergence |')
s = s.replace('| Track RELEASED | isolated mutable workspace existe | cleanup divergence |', '| Track RELEASED | bound mutable workspace still exists | cleanup divergence |')
save(p, before, s)

# Section 05: current architecture surfaces are runtime/workspace-neutral.
p, s = load('05-system-architecture.md'); before = s
replacements = [
    ('- Pi project skills;', '- project/runtime skills;'),
    ('- futura Pi extension;', '- future Agent Runtime extension or protocol adapter when selected;'),
    ('- Pi adapter;', '- Agent Runtime adapter;'),
    ('- Treehouse adapter;', '- Mutable Workspace adapter;'),
    ('Porta opcional para memória auxiliar de uma Pi Session.', 'Porta opcional para memória auxiliar de uma Runtime Session.'),
    ('- Pi skills;', '- project/runtime skills;'),
    ('- chama Treehouse diretamente;', '- chama a workspace realization diretamente;'),
    ('→ Pi reasoning', '→ Planner/Actor reasoning'),
    ('facilidade de edição pelo Pi.', 'facilidade de edição por humanos e Actors.'),
    ('## 5.22.2 Pi e extensions', '## 5.22.2 Agent Runtime extensions and packages'),
    ('Pi extensions executam com permissões do processo e podem registrar tools que executam código; somente fontes confiáveis devem ser instaladas. citeturn428383search1turn428383search8', 'Agent Runtime extensions/packages execute inside the authority of their hosting process and may expose executable tools; only reviewed, pinned sources may enter the trusted computing base. The prior Pi extension analysis remains incumbent Evidence in Sections 5.13–5.14.'),
    ('- worktree isolation;', '- isolated mutable workspace boundaries;'),
    ('## Pi failure', '## Agent Runtime failure'),
    ('- Lease permanece;', '- workspace/environment bindings remain until explicit disposition;'),
    ('## Treehouse failure', '## Workspace realization failure'),
    ('- Lease REQUESTED/DIVERGED;', '- workspace/environment binding BLOCKED/DIVERGED;'),
    ('| child Pi process | remote worker runtime |', '| local Agent Runtime execution | remote Agent Runtime execution |'),
    ('| Treehouse local | workspace provisioner |', '| local workspace realization | remote workspace provisioner |'),
    ('│   ├── pi/', '│   ├── agent-runtime/'),
    ('│   ├── treehouse/', '│   ├── workspace/'),
    ('│   └── pi-extension/', '│   └── runtime-extension/'),
    ('4. Pi não é source of truth.', '4. Agent Runtime and Runtime Session state are not source of truth.'),
    ('8. Treehouse não decide ownership.', '8. Workspace realizations do not decide domain ownership.'),
]
for old, new in replacements:
    s = req(s, old, new, f'05 {old[:36]}', count=1)

topology = '''# 5.25 Local Process Topology\n\n## 5.25.1 Lead\n\nThe MNFS Lead is a Role/ActorRun owned by MNFS semantics. Its concrete reasoning/runtime surface is selected separately and may be an interactive Agent Runtime session, a programmatic runtime boundary or a later UI-hosted Actor. Runtime Session identity is observational.\n\n## 5.25.2 MNFS commands\n\nPodem rodar como subprocessos curtos. SQLite coordena estado.\n\n## 5.25.3 Workers\n\nBounded Writer/Reviewer/QA Actors execute through the selected Agent Runtime boundary. A concrete runtime process/session may exist per ActorRun, but MNFS does not require one provider or one process topology constitutionally.\n\n## 5.25.4 Integration\n\nComando/processo MNFS separado ou executado pelo Lead por application service.\n\n## 5.25.5 QA\n\nProcesso/runtime separado quando browser ou ambiente live exigir.\n\n## 5.25.6 Sem daemon obrigatório\n\nReconcile ocorre em startup, status, before dispatch/integration and explicit actions. Continuous watchers enter only when a named notification/coordination consumer proves the need.\n\n---\n\n'''
s = between(s, '# 5.25 Local Process Topology', '# 5.26 Historical / Incumbent Evidence — Roadmap de Integração Pi', topology, '05 local topology')
save(p, before, s)

# Sections 06 and 07: authority/quality talk about semantic workspaces.
for name in ['06-roles-authority.md', '07-quality-evidence.md']:
    p, s = load(name); before = s
    for old, new in [
        ('worktrees', 'isolated mutable workspaces'),
        ('Worktrees', 'Isolated mutable workspaces'),
        ('worktree', 'isolated mutable workspace'),
        ('Worktree', 'Isolated mutable workspace'),
    ]:
        s = s.replace(old, new)
    save(p, before, s)

# Section 08: current recovery observes generic runtime/workspace resources.
p, s = load('08-state-recovery.md'); before = s
for old, new in [
    ('- um worktree desaparece;', '- um bound isolated mutable workspace desaparece;'),
    ('Treehouse:\nworktree não encontrado', 'Workspace realization:\nmutable workspace not found'),
    ('| Visual feedback | Lavish até ser consumido | Pi, MNFS |', '| Visual feedback | presentation surface until consumed | Agent Runtime/presentation adapters, MNFS |'),
    ('- worktree é válido;', '- mutable workspace identity/binding é válido;'),
    ('| Lease REQUESTED | sem worktree | request incompleto | retry ou cancel |', '| workspace binding REQUESTED | sem physical mutable workspace | request incompleto | retry ou cancel |'),
    ('| Lease REQUESTED | worktree correspondente | órfão adotável | validate + adopt |', '| workspace binding REQUESTED | matching physical mutable workspace | órfão adotável | validate + adopt |'),
    ('mark Lease DIVERGED and recreate worktree', 'mark current workspace binding DIVERGED and re-materialize/rebind the mutable workspace'),
    ('- custom worktree pool;', '- custom workspace pool;'),
]:
    s = req(s, old, new, f'08 {old[:36]}')
save(p, before, s)

# Section 09: Pi-specific implementation studies remain historical; current M2/memory rules are runtime-neutral.
p, s = load('09-context-memory.md'); before = s
for old, new in [
    ('# 9.7 Candidato principal — `pi-observational-memory` V3', '# 9.7 Historical / Incumbent Candidate Study — `pi-observational-memory` V3'),
    ('# 9.8 Alternativa — `pi-observational-memory-extension`', '# 9.8 Historical / Incumbent Candidate Study — `pi-observational-memory-extension`'),
    ('# 9.9 Memórias persistentes de repositório', '# 9.9 Historical repository-memory candidate survey'),
    ('# 9.10 Deliberate handoff — `pi-agenticoding`', '# 9.10 Historical handoff reference — `pi-agenticoding`'),
    ('# 9.19 `pi-link`', '# 9.19 Historical transport reference — `pi-link`'),
    ('Pi e MNFS continuam utilizáveis.', 'The studied Pi runtime and MNFS remain usable in this historical scenario.'),
    ('- child Pi process;', '- selected Agent Runtime execution;'),
    ('Só então comparar a abordagem própria com `pi-memctx`.', 'Só então comparar a abordagem própria com suitable runtime/repository retrieval candidates; the prior `pi-memctx` study remains historical reference.'),
    ('- M2 usa child process + CLI;', '- M2 uses durable MNFS state plus the selected concrete Agent Runtime boundary;'),
    ('- `pi-link` adiado.', '- runtime-specific notification transport remains deferred; the prior `pi-link` study is historical reference.'),
    ('5. Pi JSONL é histórico exato da Session.', '5. Exact Runtime Session history, when available, is observational history rather than current domain state.'),
    ('23. Native compaction permanece fallback.', '23. Runtime-native compaction may be a fallback only after a concrete runtime is selected and proven.'),
    ('29. M2 não depende de OM ou `pi-link`.', '29. M2 não depende de OM ou runtime-specific notification transport.'),
]:
    s = req(s, old, new, f'09 {old[:40]}')

communication = '''# 9.20 M2 communication model\n\n```text\nLead\n→ MNFS dispatches a bounded Actor through the selected Agent Runtime using the compiled Actor Pack\n\nWriter Actor\n→ MNFS CLI/API opens/completes Claim\n\nLead dies\n→ Actor and bound workspace/environment may continue according to contract\n\nFresh Lead\n→ SQLite + Git + runtime/workspace/environment observations reconcile\n```\n\nNo message bus, transcript replay, shared OM, project-memory plugin or SDK-host assumption is required by the M2 outcome.\n\n---\n\n'''
s = between(s, '# 9.20 M2 communication model', '# 9.21 Uma memória por concern', communication, '09 M2 communication')

concern = '''# 9.21 Uma memória por concern\n\nDo not activate multiple overlapping Runtime Session memory/compaction plugins for the same Role without an explicit comparison/Decision. The current policy is:\n\n```text\nat most one optional Session Memory Adapter per Role\n+\none canonical MNFS memory/authority system\n+\nexact source-backed recall when material\n```\n\nThis avoids competing context injection, precedence conflicts, token bloat, hidden writes, hook collisions, duplicated background work and stale-memory duplication. Vendor-specific plugins studied earlier remain research/incumbent Evidence until the selected Agent Runtime creates a named consumer.\n\n---\n\n'''
s = between(s, '# 9.21 Uma memória por concern', '# 9.22 Skills, prompts e templates', concern, '09 one memory concern')

matrix = '''# 9.27 Current memory realization matrix\n\n| Mechanism / class | Current disposition | Role in MNFS |\n|---|---|---|\n| Exact Runtime Session history | `ADAPT` when available | observational exact history, never authority |\n| Runtime-native compaction | `REFERENCE / ADAPT` after runtime selection | optional runtime fallback |\n| Session Memory Adapter | `DEFER / SPIKE` until named consumer | optional Lead continuity |\n| Repository Profile / Context Index / Code Map | `OWN` semantics | canonical repository/context knowledge |\n| MNFS SQLite | `ADOPT` | durable operational coordination |\n| Git artifacts | `ADOPT` | canonical versioned code/result/doc identity |\n| Prior Pi JSONL / OM / pi-link / pi-memctx studies | `HISTORICAL / REFERENCE` | incumbent evidence and design patterns only |\n\nNo memory plugin or runtime-specific transport is selected constitutionally by this matrix.\n\n---\n\n'''
s = between(s, '# 9.27 Matriz de adoção', '# 9.28 Impacto no roadmap', matrix, '09 realization matrix')
s = s.replace('- `pi-link`;\n', '- runtime-specific notification transport;\n', 1)
save(p, before, s)

# Section 10: current threat model, TCB, M2 profile and context pack are provider-neutral.
p, s = load('10-security-isolation.md'); before = s
for old, new in [
    ('- uma extensão Pi não revisada entre no trusted computing base;', '- uma third-party Agent Runtime extension não revisada entre no trusted computing base;'),
    ('- Pi extension;', '- Agent Runtime extension;'),
    ('- third-party Pi packages;', '- third-party Agent Runtime packages/extensions;'),
    ('Worker altera arquivo fora do worktree.', 'Worker altera arquivo fora do bound isolated mutable workspace.'),
    ('Pi extension executa com os privilégios do usuário.', 'Third-party Agent Runtime extension may execute with the privileges of its hosting process.'),
    ('- Pi settings;', '- Agent Runtime settings;'),
    ('Sistema acredita estar protegido apenas por worktree, WSL ou container.', 'Sistema acredita estar protegido apenas por mutable-workspace isolation, WSL ou container.'),
    ('   ├── Pi Actor', '   ├── Actor through selected Agent Runtime'),
    ('Cada third-party package adicionado ao Pi pode ampliar a TCB.', 'Cada third-party runtime/extension/package introduzido na execution path pode ampliar a TCB.'),
    ('Para Worker E1:', 'Para o protected local Writer profile:'),
    ('WORKTREE + required toolchain', 'BOUND_MUTABLE_WORKSPACE + required toolchain'),
    ('- worktree;\n- Attempt temp;', '- bound isolated mutable workspace;\n- Attempt temp;'),
    ('- `.pi` security/extensions;', '- selected Agent Runtime security/extensions/config;'),
    ('- sem ser escrito no worktree.', '- sem ser escrito no bound isolated mutable workspace.'),
    ('## 10.29.2 Pi package supply chain', '## 10.29.2 Agent Runtime extension/package supply chain'),
    ('SEC-EXT-001\nPi extensions and packages are pinned and reviewed.', 'SEC-EXT-001\nAgent Runtime extensions and packages are pinned and reviewed.'),
    ('12. Pi packages são trusted code.', '12. Agent Runtime extensions/packages admitted to the execution path are trusted code and therefore pinned/reviewed.'),
]:
    s = req(s, old, new, f'10 {old[:44]}', count=1)

tcb_old = '''- MNFS binary/code;\n- effective policy;\n- SQLite;\n- Pi runtime;\n- loaded Pi extensions;\n- sandbox runtime;\n- process adapter;\n- Treehouse;\n- operating-system enforcement.'''
tcb_new = '''- MNFS binary/code;\n- effective policy;\n- SQLite;\n- selected Agent Runtime boundary and loaded runtime extensions;\n- selected Execution Environment / isolation realization;\n- selected Mutable Workspace realization;\n- process/runtime adapters;\n- operating-system enforcement used by the selected realization.'''
s = req(s, tcb_old, tcb_new, '10 TCB list')

env_lease_old = '''É diferente do Treehouse Lease.\n\n```text\nTreehouse Lease\n→ worktree físico\n\nEnvironment Lease\n→ runtime e recursos de execução\n```\n\nNo M2 local, ambos podem estar vinculados à mesma Track sem exigir um sistema genérico separado.'''
env_lease_new = '''É diferente do binding/lease do isolated mutable workspace. The concrete resource identity is realization-specific:\n\n```text\nWorkspace Binding / Lease\n→ physical isolated mutable workspace\n\nEnvironment Lease\n→ runtime / compute / isolation resources\n```\n\nThe M01 Treehouse Lease is historical incumbent Evidence for the workspace side. M2 may bind workspace and Environment resources to the same Track without requiring a generic provider framework.'''
s = req(s, env_lease_old, env_lease_new, '10 environment lease distinction')

pack_old = '''Environment:\n  E1 LOCAL_SANDBOX\nPolicy hash:\n  sha256:...\nNetwork:\n  OFF\nCredentials:\n  NONE\nAllowed effects:\n  X0, X1\nProtected paths:\n  policy://SEC-POL-004\nEscalation:\n  Effect Request required for X2+'''
pack_new = '''Environment:\n  agentPlacement: <approved CONTROL_SIDE or IN_ENVIRONMENT>\n  isolationBoundary: <approved realization/property>\n  workspaceBinding: <current binding ref>\nExecution policy hash:\n  sha256:...\nNetwork:\n  <contract posture; DENY_ALL for current M2 proof>\nCredentials:\n  NONE for ordinary M2 Writer\nAllowed effects:\n  X0, X1\nProtected paths:\n  policy://SEC-POL-004\nEscalation:\n  Effect Request required for X2+'''
s = req(s, pack_old, pack_new, '10 Security Context Pack')

m2 = '''# 10.35 M2 security slice\n\nM2 does not implement the complete future Security System. It proves one bounded Writer under the selected, evidence-backed local realization.\n\n```text\none bounded Writer Actor\ndoes not mean\nfull host-user authority\n```\n\n## Inclui\n\n- exact workspace/environment binding;\n- explicit cwd/capability boundary where applicable;\n- shell/process invocation controlled by the selected realization;\n- environment allowlist;\n- no raw production credentials;\n- contract-bound network posture, deny-by-default for the current local proof;\n- protected host/policy paths;\n- external effects denied beyond the contract;\n- frozen effective execution/security policy hash;\n- fail-closed initialization;\n- security failure reflected in durable state/Evidence;\n- provider-neutral Git result identity;\n- Fresh Recovery without Session/transcript authority.\n\n## Não inclui\n\n- generic Credential Broker without a named consumer;\n- full Effect Executor;\n- remote/cloud control plane;\n- production access;\n- multi-tenant security;\n- security dashboard.\n\n## Contract reconciliation\n\nProduction M02 only resumes after ARR-S0/S1/S2/(S2W)/S3, substrate-selection Decision and superseding CAP-EXECUTION/MIS-002 authority. Historical AS-02 Evidence may inform the incumbent comparison but is not a current prerequisite or selecting gate.\n\nThe architecture never permits Writer dispatch to degrade silently to unrestricted host execution.\n\n---\n\n'''
s = between(s, '# 10.35 M2 security slice', '# 10.36 Adoption matrix', m2, '10 M2 security slice')
save(p, before, s)

# Section 13: impact taxonomy names the replaceable boundary.
p, s = load('13-documentation-governance.md'); before = s
s = req(s, '| Pi adapter | Spec, adoption record, compatibility |', '| Agent Runtime adapter / selected realization | Spec, sourcing Decision, provenance, compatibility |', '13 impact matrix')
save(p, before, s)

# STATUS tracks the same active correction without opening downstream gates.
p = ROOT / 'docs' / 'tracking' / 'STATUS.md'; before = p.read_text(); s = before
s = s.replace('version: 1.16.0', 'version: 1.17.0') if 'version: 1.16.0' in s else s.replace('version: 1.15.0', 'version: 1.17.0')
s = s.replace('**Current phase:** `ARR P1 — Pre-Spike Reconciliation Review` under Issue #23 / PR #24.', '**Current phase:** `ARR P1 — P1-F02 Constitutional Body Reconciliation / Fresh Review` under Issue #23 / PR #24.')
s = s.replace('**Current P1 tranche:** A1–A4 + B1 implemented and verified in PR #24; finding P1-F01 is the authorized tracking correction required before P1 review can close.', '**Current P1 tranche:** A1–A4 + B1 + P1-F01 implemented/verified; P1-F02 is the active authorized correction removing superseded Pi/Treehouse/fixed-E1 authority from current constitutional bodies before P1 acceptance.')
s = s.replace('ARR P1 A1-A4 + B1 + P1-F01:                 IMPLEMENTED / VERIFIED / REVIEW_REQUIRED', 'ARR P1 A1-A4 + B1 + P1-F01 + P1-F02:       IMPLEMENTED / VERIFIED / FRESH_REVIEW_REQUIRED')
s = s.replace('## Immediate next action — P1 review', '## Immediate next action — P1-F02 fresh review')
s = s.replace('Operator reviews PR #24 and either accepts P1 or requests further changes.', 'A Fresh Reviewer inspects PR #24 after P1-F02 and classifies any remaining current-authority/vendor ambiguity. The Operator accepts P1 only after that review has no Critical/Important findings.')
if before == s:
    raise RuntimeError('no STATUS update produced')
p.write_text(s)

print('Applied second P1-F02 cleanup.')

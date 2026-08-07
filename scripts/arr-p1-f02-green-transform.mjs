#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const bp = (name) => path.join(root, 'docs/product/blueprint', name);

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`missing transform locus: ${label}`);
  return source.replace(from, to);
}

function replaceAllRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`missing transform locus: ${label}`);
  return source.split(from).join(to);
}

function replaceBetween(source, start, end, replacement, label) {
  const a = source.indexOf(start);
  if (a < 0) throw new Error(`missing start locus: ${label}`);
  const b = source.indexOf(end, a + start.length);
  if (b < 0) throw new Error(`missing end locus: ${label}`);
  return `${source.slice(0, a)}${replacement}${source.slice(b)}`;
}

function replaceFrom(source, start, replacement, label) {
  const a = source.indexOf(start);
  if (a < 0) throw new Error(`missing tail locus: ${label}`);
  return `${source.slice(0, a)}${replacement}`;
}

async function edit(name, fn) {
  const file = bp(name);
  const before = await readFile(file, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error(`no change produced for ${name}`);
  await writeFile(file, after, 'utf8');
}

const oldBanner = 'This reconciliation block has precedence over older realization-specific wording in this section. Any conflicting tool-specific statement below is historical realization context, not current constitutional authority.';
const newBanner = 'The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.';
const bannerFiles = [
  '01-product-vision.md', '02-domain-model.md', '03-lifecycle-flows.md', '04-engineering-system.md',
  '05-system-architecture.md', '06-roles-authority.md', '07-quality-evidence.md', '08-state-recovery.md',
  '09-context-memory.md', '10-security-isolation.md', '12-capability-roadmap.md', '13-documentation-governance.md',
];
for (const name of bannerFiles) {
  await edit(name, (source) => replaceRequired(source, oldBanner, newBanner, `${name} reconciliation banner`));
}

// Section 01 — product promise and evolution are provider-neutral.
await edit('01-product-vision.md', (input) => {
  let s = input;
  s = replaceRequired(s,
    'MNFS é uma **development harness planning-first e evidence-driven**, construída sobre Pi, que transforma um objetivo do operador em uma entrega de software planejada, executada, verificada, integrada e comprovada.',
    'MNFS é uma **development harness planning-first e evidence-driven** que governa Agent Runtimes substituíveis e transforma um objetivo do operador em uma entrega de software planejada, executada, verificada, integrada e comprovada.',
    '01 product definition');
  s = replaceRequired(s, 'workers Pi executam em worktrees isolados', 'Actors delimitados executam por um Agent Runtime dentro de isolated mutable workspaces e Execution Environments governados', '01 operator flow');
  s = replaceRequired(s, 'No MNFS Pi-first, a regra é:', 'No MNFS code-first, a regra é:', '01 code-first rule');
  s = replaceAllRequired(s, '- criação de worktrees;', '- materialização e lifecycle de isolated mutable workspaces;', '01 code-owned workspace');
  s = replaceRequired(s, 'Uma skill pode orientar o Pi a:', 'Uma skill pode orientar um Actor a:', '01 skill entrypoint');
  s = replaceRequired(s, '- um substituto do Pi;', '- um substituto de um Agent Runtime;', '01 non-goal runtime');
  s = replaceRequired(s,
    'FirstMate permanece uma referência operacional e uma fonte seletiva de padrões; Pi é o primeiro runtime; Lavish, Treehouse e ferramentas futuras entram por fronteiras estreitas. Nenhum adapter se torna autoridade do domínio.',
    'FirstMate permanece uma referência operacional e uma fonte seletiva de padrões. Agent Runtime, workspace, Execution Environment e presentation realizations entram por fronteiras estreitas e são selecionadas por Evidence e Decision; Pi, Treehouse e Lavish permanecem incumbents/references onde já produziram Evidence. Nenhum adapter se torna autoridade do domínio.',
    '01 realization direction');
  s = replaceAllRequired(s, 'Um worktree verde não prova que o sistema integrado está verde.', 'Um isolated mutable workspace verde não prova que o sistema integrado está verde.', '01 composition invariant');
  s = replaceRequired(s,
    '- Pi executa;\n- Lavish apresenta;\n- Treehouse gerencia worktrees;\n- Herdr apresenta terminais;\n- Git guarda código;\n- SQLite guarda runtime;\n- MNFS decide o estado da missão.',
    '- Agent Runtime executa Actors;\n- presentation adapters apresentam;\n- workspace realizations materializam isolated mutable workspaces;\n- Git guarda código e result identity;\n- SQLite guarda estado operacional;\n- MNFS decide o estado da missão.',
    '01 P12 authority examples');
  s = replaceRequired(s,
    'WSL2\n→ MNFS, Pi, Git, SQLite, worktrees e testes',
    'WSL2\n→ MNFS, Git, SQLite, Agent Runtime selecionado, isolated mutable workspaces e testes',
    '01 today evolution');
  s = replaceRequired(s,
    'Pi Lead\n→ múltiplos Pi workers\n→ Treehouse\n→ integração\n→ gates\n→ QA',
    'MNFS Lead\n→ bounded Actors through the selected Agent Runtime\n→ isolated mutable workspaces + governed Execution Environments\n→ integração\n→ gates\n→ QA',
    '01 next evolution');
  s = replaceRequired(s, 'Pi SDK ou RPC', 'selected Agent Runtime boundary / open protocol or concrete adapter', '01 future runtime boundary');
  return s;
});

// Section 02 — domain entities do not encode a provider.
await edit('02-domain-model.md', (input) => {
  let s = input;
  s = replaceRequired(s, 'Novo Attempt não implica novo worktree.', 'Novo Attempt não implica novo isolated mutable workspace.', '02 attempt workspace');
  s = replaceRequired(s, 'Treehouse administra o lifecycle físico; MNFS administra a semântica.', 'A workspace realization selecionada administra o lifecycle físico; MNFS administra a semântica e a autoridade do binding.', '02 lease realization');
  s = replaceRequired(s,
    'É diferente do Treehouse Lease:\n\n```text\nTreehouse Lease\n→ workspace de código\n\nEnvironment Lease\n→ runtime e recursos de execução\n```',
    'É diferente do workspace binding/lease concreto. O Treehouse Lease provado em M01 é uma realização histórica, não a semântica universal:\n\n```text\nWorkspace Binding / Lease\n→ isolated mutable workspace concreto\n\nEnvironment Lease\n→ runtime e recursos de execução\n```',
    '02 environment lease distinction');
  s = replaceRequired(s, 'Attempts podem reutilizar a mesma sessão e worktree quando contrato, write-set e trust permanecem válidos.', 'Attempts podem reutilizar a mesma Runtime Session e o mesmo isolated mutable workspace quando contrato, write-set e trust permanecem válidos.', '02 attempt reuse');
  s = replaceRequired(s, 'Worker Run representa uma execução concreta de um agente Pi.', 'Worker Run representa uma execução concreta de um Agent Runtime para um ActorRun/Attempt.', '02 worker run');
  s = replaceRequired(s, 'Por padrão reutiliza Write Track e worktree quando a trust boundary continua válida.', 'Por padrão reutiliza Write Track e isolated mutable workspace quando a trust boundary continua válida.', '02 correction workspace');
  s = replaceRequired(s, '| Plan Revision | Pi/Lead | MNFS | — |', '| Plan Revision | Planner/Lead Actor | MNFS | — |', '02 authority plan');
  s = replaceRequired(s, '| Lease | Lead requests | MNFS + Treehouse adapter | MNFS |', '| Workspace/Environment binding or lease | Lead requests | MNFS + selected realization adapter | MNFS |', '02 authority lease');
  s = replaceRequired(s, '| Worker Run | Pi adapter | MNFS observes | MNFS records exit/cancel |', '| Worker Run | Agent Runtime adapter | MNFS observes | MNFS records exit/cancel |', '02 authority worker run');
  s = replaceRequired(s,
    '### Pi\n\nContexto e execução probabilística, nunca domínio autoritativo.\n\n### Treehouse\n\nEstado físico dos worktrees.',
    '### Agent Runtime\n\nContexto e execução probabilística, nunca domínio autoritativo. Runtime Session state é observacional.\n\n### Mutable Workspace realization\n\nEstado físico do isolated mutable workspace e seus bindings. Treehouse/worktree é uma realização histórica/incumbent já provada em M01, não o owner semântico universal.',
    '02 storage boundaries');
  return s;
});

// Section 03 — lifecycle allocates workspace/environment and dispatches via Agent Runtime.
await edit('03-lifecycle-flows.md', (input) => {
  let s = input;
  s = replaceRequired(s, 'WRITE TRACKS + LEASES', 'WRITE TRACKS + WORKSPACE / ENVIRONMENT BINDINGS', '03 overview allocation');
  s = replaceRequired(s, 'DISPATCH DE WORKERS PI', 'DISPATCH DE BOUNDED ACTORS', '03 overview dispatch');
  s = replaceRequired(s, '| Alocação | MNFS + Treehouse | Write Track | Lease ativo | workspace e base válidos |', '| Alocação | MNFS + selected workspace/environment realization | Write Track | bindings/leases válidos | workspace, environment e base válidos |', '03 phase allocation');
  s = replaceRequired(s, '| Dispatch | MNFS + Pi adapter | pack e lease | Worker Run | boot confirmado |', '| Dispatch | MNFS + Agent Runtime adapter | Actor Pack + current bindings | Worker Run | boot confirmado |', '03 phase dispatch');
  s = replaceRequired(s, '- Pi em sessão read-only;', '- Agent Runtime em modo read-only, quando necessário;', '03 investigator runtime');
  s = replaceRequired(s, 'Pi pode raciocinar e propor conteúdo.', 'O Planner Actor pode raciocinar e propor conteúdo.', '03 planner actor');
  s = replaceAllRequired(s, 'Feedback retorna ao Pi.', 'Feedback retorna ao Planner Actor.', '03 planning feedback');
  s = replaceAllRequired(s, 'Pi propõe uma nova revisão completa.', 'O Planner Actor propõe uma nova revisão completa.', '03 planning revision');

  const allocationAndDispatch = `# 3.10 Fluxo F — Alocação do isolated mutable workspace e Execution Environment\n\n## 3.10.1 Solicitação\n\nMNFS registra a intenção de materializar ou vincular o isolated mutable workspace exigido pela Write Track e, quando aplicável, uma Execution Environment Instance. A escolha física pertence à realization selecionada; o lifecycle de domínio pertence ao MNFS.\n\n## 3.10.2 Ordem recomendada\n\nA alocação deve tolerar crash entre o mundo externo e SQLite.\n\nFluxo conceitual:\n\n\`\`\`text\nregistrar intenção de workspace/environment binding\n        ↓\ninvocar a realization selecionada\n        ↓\nobservar e validar o workspace/environment real\n        ↓\npersistir binding/lease e policy identities\n        ↓\nemitir Domain Event correspondente\n\`\`\`\n\nA realization concreta pode ser worktree, COW filesystem, rootfs/disk privado, microVM workspace ou outra opção selecionada por Decision. Nenhuma delas é semântica obrigatória do WriteTrack.\n\n## 3.10.3 Validações\n\n- workspace pertence ao binding atual da Write Track;\n- base Git corresponde ao expected base ou existe Replan/rebase autorizado;\n- workspace não é compartilhado com outro writer quando exclusividade é exigida;\n- Execution Environment e effective policy correspondem às identities aprovadas;\n- write/resource sets não colidem com outro Actor ativo sem serialização explícita;\n- network, credential e effect posture satisfazem o contrato.\n\n## 3.10.4 Saída\n\n\`\`\`text\nWorkspace Binding READY\nEnvironment Lease/Binding READY when applicable\nWrite Track ALLOCATED\n\`\`\`\n\n## 3.10.5 Falhas\n\n### Realization indisponível\n\n\`\`\`text\nALLOCATION_BLOCKED\n\`\`\`\n\nTrack permanece sem dispatch. Não existe fallback silencioso para host irrestrito.\n\n### Recurso físico criado, persistência falhou\n\nRecovery observa o recurso e o classifica como adotável, divergente ou cleanup-pending conforme identity/fence.\n\n### Binding existe, recurso físico desapareceu\n\n\`\`\`text\nDIVERGED\n\`\`\`\n\nNenhum reparo silencioso.\n\n---\n\n# 3.11 Fluxo G — Dispatch e boot do Actor\n\n## 3.11.1 Brief antes do processo/runtime\n\nO Actor não nasce de uma mensagem longa improvisada. O Context Compiler materializa um Role/Execution Pack com authority, target, boundaries, proof e termination contract.\n\n## 3.11.2 Dispatch Packet\n\nExemplo conceitual:\n\n\`\`\`json\n{\n  "missionId": "MIS-002",\n  "milestoneId": "M02",\n  "featureId": "F01",\n  "writeTrackId": "WT-001",\n  "attemptId": "WT-001/A01",\n  "contractHash": "sha256:...",\n  "expectedBaseSha": "...",\n  "workspaceBindingRef": "...",\n  "environmentBindingRef": "...",\n  "executionPolicyHash": "sha256:...",\n  "contextPackRef": "...",\n  "claimCommand": "..."\n}\n\`\`\`\n\nCampos não aplicáveis são omitidos; o packet nunca inventa uma provider identity.\n\n## 3.11.3 Agent Runtime\n\nO Agent Runtime adapter inicia ou conecta o Actor com:\n\n- cwd/boundary exato do isolated mutable workspace quando o runtime executa localmente;\n- environment mínimo e policy compilada;\n- prompt/context por artifact ou protocolo controlado;\n- provider/modelo resolvido por policy separada da autoridade de domínio;\n- outputs/events limitados e observáveis;\n- cancellation explícita;\n- Session ref apenas como observação opcional.\n\n## 3.11.4 Boot checks\n\nAntes de escrever, MNFS confirma:\n\n- contract/authority hashes;\n- target qualificado e Attempt atual;\n- workspace/environment bindings atuais;\n- base Git;\n- write/resource boundaries;\n- effective execution/security policy.\n\n## 3.11.5 Estado\n\n\`\`\`text\nWorker Run STARTING\n→ RUNNING\nWrite Track ACTIVE\nAttempt RUNNING\n\`\`\`\n\n## 3.11.6 Falhas\n\n### Runtime não inicia\n\nAttempt permanece incompleto e a falha é observada; não existe success por process text.\n\n### Base ou binding mismatch\n\nActor não escreve. A Track fica stale/diverged conforme o finding.\n\n### Lead morre após dispatch\n\nO Actor/recurso pode continuar conforme o contrato. Um Fresh Lead recupera por SQLite, Git e observação das realizations, sem depender de transcript.\n\n### Mensagem não chega\n\nEstado durável e artefatos permanecem.\n\n---\n\n`;
  s = replaceBetween(s, '# 3.10 Fluxo F — Alocação do workspace', '# 3.12 Fluxo H — Execução da Write Track', allocationAndDispatch, '03 allocation+dispatch sections');

  s = replaceAllRequired(s, '| Treehouse Lease | M2 |', '| Workspace / Environment binding | M2 |', '03 capability Treehouse lease');
  s = replaceAllRequired(s, '| Pi worker dispatch | M2 |', '| Agent Runtime dispatch | M2 |', '03 capability Pi dispatch');
  s = s.replaceAll('- Treehouse;', '- selected workspace realization;');
  s = s.replaceAll('- Pi session state;', '- Runtime Session state;');
  s = s.replaceAll('| Planning | raciocínio Pi | plan JSON | schema, DAG, hash |', '| Planning | Planner Actor reasoning | plan JSON | schema, DAG, hash |');
  s = s.replaceAll('Nenhum worktree é removido antes de integração ou abandono explícito.', 'Nenhum isolated mutable workspace é liberado antes de integração, abandono ou disposition explícita.');
  s = s.replaceAll('Nenhuma integração é provada apenas em worktrees isolados.', 'Nenhuma integração é provada apenas em isolated mutable workspaces.');
  return s;
});

// Section 04/06/07 — generic workspace/runtime wording where the text is normative.
await edit('04-engineering-system.md', (input) => input.replaceAll('worktree preservado após integração falha', 'isolated mutable workspace preservado após integração falha'));
await edit('06-roles-authority.md', (input) => {
  let s = input;
  s = s.replaceAll('Pi session S-001', 'Runtime Session S-001');
  s = s.replaceAll('Pi session S-002 após restart', 'Runtime Session S-002 após restart');
  s = s.replaceAll('Worker possui permissão de escrever no worktree.', 'Worker possui permissão de escrever apenas no isolated mutable workspace autorizado.');
  s = s.replaceAll('Pi especializado', 'Actor especializado via Agent Runtime');
  s = s.replaceAll('Pi skill/template', 'runtime skill/template');
  s = s.replaceAll('Alterar worktree', 'Alterar isolated mutable workspace');
  return s;
});
await edit('07-quality-evidence.md', (input) => {
  let s = input;
  s = s.replaceAll('Pi worker completes', 'Writer Worker completes');
  s = s.replaceAll('Worktree isolation não resolve esses recursos automaticamente.', 'Isolated mutable workspace não resolve esses recursos automaticamente.');
  s = s.replaceAll('Worktree green não prova integration.', 'Isolated mutable workspace green não prova integration.');
  return s;
});

// Section 05 — current architecture first, vendor material explicitly historical/incumbent.
await edit('05-system-architecture.md', (input) => {
  let s = input;
  const currentDiagram = `# 5.2 Visão arquitetural\n\n\`\`\`text\nWINDOWS — apresentação\n┌──────────────────────────────────────────────────────────────┐\n│ Browser / review surfaces                                   │\n│ Windows Terminal / editor conectado ao WSL                  │\n└──────────────────────────────┬───────────────────────────────┘\n                               │ localhost / terminal\nWSL2 — canonical local host    │\n┌──────────────────────────────▼───────────────────────────────┐\n│ Operator Surface / MNFS Lead                                │\n│        ↓                                                     │\n│ MNFS Modular Monolith                                       │\n│   ├── Sovereign Domain / Authority Kernel                    │\n│   ├── Planning + Context Compiler                            │\n│   ├── Application Services / Gates                           │\n│   ├── SQLite + Artifact Management                           │\n│   └── Concrete External Adapters                             │\n│        ↓                                                     │\n│ Actor Control Plane                                          │\n│   └── selected replaceable Agent Runtime                     │\n│        ↓                                                     │\n│ Execution Environment                                        │\n│   ├── isolated mutable workspace                             │\n│   ├── compute/isolation boundary                             │\n│   ├── network/credential/resource policy                     │\n│   └── result extraction                                      │\n└──────────────────────────────┬───────────────────────────────┘\n                               │\n                               ▼\n                         Git repository\n              baseCommitSha · resultTreeSha · optional commit\n\`\`\`\n\nThe constitutional diagram names semantic boundaries, not a selected runtime/workspace/environment provider.\n\n---\n\n`;
  s = replaceBetween(s, '# 5.2 Visão arquitetural', '# 5.3 Princípios arquiteturais', currentDiagram, '05 current diagram');
  s = replaceRequired(s, 'processos Pi separados para workers', 'Actors executados pelo Agent Runtime selecionado quando processo/runtime separado for necessário', '05 modular monolith runtime');
  s = replaceRequired(s,
    'Mission state          → SQLite / MNFS Core\nCode tree              → Git\nApproved contract      → SQLite + materialização versionada\nWorktree physical      → Treehouse\nAgent reasoning        → Pi\nVisual feedback        → Lavish\nTerminal presentation  → Herdr',
    'Mission state          → SQLite / MNFS Core\nCode / result identity → Git\nApproved contract      → SQLite + materialização versionada\nMutable workspace      → selected workspace realization, observed by MNFS\nAgent execution        → selected Agent Runtime, observed by MNFS\nVisual/terminal output → presentation adapters',
    '05 one authority mapping');
  s = replaceRequired(s, 'CLI, skill Pi, futura extensão e futura UI:', 'CLI, skills, Agent Runtime adapters e futura UI:', '05 thin interfaces');
  s = replaceRequired(s, 'Um processo Pi pode:', 'Uma execução do Agent Runtime pode:', '05 process resource');
  s = replaceRequired(s, '# 5.13 Pi Integration Architecture', '# 5.13 Historical / Incumbent Evidence — Pi Integration Architecture', '05 Pi historical heading');
  s = replaceRequired(s, '# 5.14 Pi Worker Process Adapter', '# 5.14 Historical / Incumbent Evidence — Pi Worker Process Adapter', '05 Pi worker historical heading');
  s = replaceRequired(s, '# 5.15 Treehouse Adapter', '# 5.15 Historical / Incumbent Evidence — Treehouse Adapter', '05 Treehouse historical heading');
  s = replaceRequired(s,
    'Pi oferece quatro formas relevantes de integração:',
    'The following records the Pi integration surface studied/proved before D-012. It is incumbent Evidence for ARR-S1 and does not select the future Agent Runtime. Pi offered four relevant integration forms:',
    '05 Pi reference intro');
  s = replaceRequired(s,
    'Treehouse administra um pool de worktrees reutilizáveis, possui leases duráveis que sobrevivem sem processos e oferece JSON para aquisição e status.',
    'This subsection is historical/incumbent M01 workspace Evidence, not the current WriteTrack definition. Treehouse administra um pool de worktrees reutilizáveis, possui leases duráveis que sobrevivem sem processos e oferece JSON para aquisição e status.',
    '05 Treehouse reference intro');
  s = s.replaceAll('# 5.26 Roadmap de Integração Pi', '# 5.26 Historical / Incumbent Evidence — Roadmap de Integração Pi');
  s = replaceRequired(s,
    '> **O MNFS será inicialmente um modular monolith TypeScript executado no WSL2. Domain Core, Application Services e Engineering System definem a semântica; SQLite guarda estado operacional; Git guarda código e contratos aprovados; Pi executa raciocínio e workers; Treehouse fornece worktrees; Lavish apresenta revisão; Herdr projeta terminais opcionalmente. CLI, skills, extensions e futuras UIs permanecem clientes finos do mesmo core. As fronteiras são desenhadas hoje para permitir evolução a SDK/RPC e cloud, mas nenhuma infraestrutura distribuída será construída antes de o produto local completo provar sua necessidade.**',
    '> **O MNFS começa como um modular monolith TypeScript no WSL2. O Thin Sovereign Semantic Kernel, Application Services e Engineering System definem a semântica; SQLite guarda estado operacional; Git guarda código e result identity; Agent Runtime, isolated mutable workspace, Execution Environment e presentation surfaces são realizations substituíveis selecionadas por Evidence. Adapters e UIs permanecem clientes finos do mesmo core. Nenhuma infraestrutura distribuída ou provider framework é construída antes de um consumidor/proof concreto exigir.**',
    '05 conclusion');
  return s;
});

// Section 08 — recovery reconciles provider-neutral resources; M01 vendor realization is historical evidence.
await edit('08-state-recovery.md', (input) => {
  let s = input;
  s = s.replaceAll('- Treehouse;', '- selected workspace/environment realization;');
  s = s.replaceAll('- Pi sessions;', '- Runtime Sessions;');
  s = replaceRequired(s,
    '| Mission lifecycle | MNFS/SQLite | CLI, Pi, futura UI |\n| Approved Contract | SQLite + artefato versionado | Pi, Git, Lavish |\n| Code tree | Git | MNFS, Worker |\n| Worktree físico | Treehouse + Git | filesystem, MNFS |\n| Lease semântico | MNFS/SQLite | Treehouse |\n| Process existence | sistema operacional | Pi, Herdr |\n| Worker Run state | MNFS/SQLite | process adapter, Pi events, Herdr |',
    '| Mission lifecycle | MNFS/SQLite | CLI, Agent Runtime, futura UI |\n| Approved Contract | SQLite + artefato versionado | Git, presentation/runtime adapters |\n| Code/result tree | Git | MNFS, Worker |\n| Mutable Workspace binding | MNFS + selected workspace/environment observation | filesystem/Git |\n| Workspace/Environment Lease semântico | MNFS/SQLite | selected realization adapter |\n| Process/runtime existence | execution substrate | Agent Runtime adapter |\n| Worker Run state | MNFS/SQLite | Agent Runtime events/process observations |',
    '08 source matrix');
  s = replaceRequired(s, '## 8.3.1 Pi Session Ledger e memória observacional', '## 8.3.1 Runtime Session history e memória observacional', '08 session heading');
  s = replaceRequired(s,
    'O arquivo JSONL da Pi Session é o histórico exato daquele processo conversacional.',
    'Quando o Agent Runtime oferece um ledger/session history exato, ele é Evidence histórica daquela execução e nunca current Mission authority. O Pi JSONL provado anteriormente é um exemplo incumbent dessa categoria.',
    '08 session history');
  s = s.replaceAll('Pi JSONL source entries', 'Exact Runtime Session source entries');
  s = s.replaceAll('Process stdin, Pi queue, WebSocket ou terminal messaging', 'Process stdin, runtime queue/protocol, WebSocket ou terminal messaging');
  s = s.replaceAll('## 8.4.4 Worktree é preservável', '## 8.4.4 Isolated mutable workspace é preservável');
  s = s.replaceAll('Worktree representa trabalho físico.', 'O isolated mutable workspace representa trabalho físico em progresso.');
  s = s.replaceAll('- processo Pi;', '- Agent Runtime/process execution;');
  s = s.replaceAll('Treehouse get', 'selected workspace-realization acquire/materialize');
  s = s.replaceAll('validar worktree', 'validar workspace binding');
  s = s.replaceAll('Worktrees isolam arquivos.', 'Isolated mutable workspaces separam mutation surfaces.');
  s = s.replaceAll('- espera Pi;', '- espera/observa o Agent Runtime;');
  s = s.replaceAll('- Pi lifecycle event;', '- Agent Runtime lifecycle event;');
  s = s.replaceAll('- Treehouse state;', '- workspace/environment realization state;');
  s = s.replaceAll('SQLite Lease ativo, worktree ausente.', 'SQLite binding/lease ativo, mutable workspace ausente.');
  s = s.replaceAll('Worktree MNFS existe, Lease ausente.', 'Mutable workspace MNFS-like existe, binding/lease ausente.');
  s = s.replaceAll('Path não é worktree real.', 'Path/resource não corresponde ao workspace binding esperado.');
  s = s.replaceAll('Worktree dirty inesperadamente.', 'Mutable workspace dirty inesperadamente.');
  s = s.replaceAll('worktree existe', 'mutable workspace existe');
  s = s.replaceAll('worktree ausente', 'mutable workspace ausente');
  s = s.replaceAll('worktree MNFS existe', 'mutable workspace MNFS-like existe');
  s = s.replaceAll('Código permanece no worktree.', 'Código permanece no isolated mutable workspace.');
  s = s.replaceAll('- Worktree diff;', '- Mutable workspace diff/result tree;');
  s = s.replaceAll('- worktree trust.', '- workspace trust.');
  s = s.replaceAll('Dois worktrees podem usar o mesmo:', 'Dois isolated mutable workspaces podem usar o mesmo:');
  s = s.replaceAll('- pode manter worktree;', '- pode manter o isolated mutable workspace;');
  s = s.replaceAll('- worktrees;', '- isolated mutable workspaces;');
  s = s.replaceAll('- released worktrees;', '- released isolated mutable workspaces;');
  s = s.replaceAll('but its Treehouse worktree is missing.', 'but its bound isolated mutable workspace is missing.');
  s = s.replaceAll('inspect Treehouse manually', 'inspect the selected workspace realization');
  s = s.replaceAll('- worktree preservado;', '- isolated mutable workspace preservado;');
  s = s.replaceAll('### DR-04 — Orphan worktree', '### DR-04 — Orphan mutable workspace');
  s = s.replaceAll('### DR-05 — Lease without worktree', '### DR-05 — Binding/Lease without mutable workspace');
  s = s.replaceAll('- Pi;', '- Agent Runtime;');
  s = s.replaceAll('- Treehouse;', '- workspace realization;');
  s = s.replaceAll('→ Pi Worker', '→ Writer Actor through Agent Runtime');
  s = s.replaceAll('- Treehouse adapter;', '- selected workspace adapter;');
  s = s.replaceAll('Treehouse é autoridade física do pool.', 'A selected workspace realization é autoridade somente sobre seu estado físico observado; MNFS conserva a autoridade semântica.');
  s = s.replaceAll('Worktree não é removido com trabalho não classificado.', 'Isolated mutable workspace não é liberado com trabalho não classificado.');
  s = replaceRequired(s,
    '> **O MNFS mantém estado operacional autoritativo em SQLite e reconcilia esse estado com Git, Treehouse, processos, Pi sessions, artifacts e ambientes externos. Operações locais usam transactions; efeitos externos usam Intent–Action–Observation, idempotência, optimistic concurrency, fencing e reconcile. Sessions e processos são substituíveis; worktrees e evidências são preservados; resultados atrasados não sobrescrevem Attempts atuais; divergências permanecem explícitas. Recovery é um produto verificável por drills, não a reconstrução de transcripts nem uma promessa genérica de self-healing.**',
    '> **O MNFS mantém estado operacional autoritativo em SQLite e reconcilia esse estado com Git, Mutable Workspace bindings, Execution Environments, Agent Runtime/process observations, artifacts e sistemas externos. Operações locais usam transactions; efeitos externos usam Intent–Action–Observation, idempotência, optimistic concurrency, fencing e reconcile. Runtime Sessions e processos são substituíveis; workspaces/evidências são preservados conforme policy; resultados atrasados não sobrescrevem Attempts atuais; divergências permanecem explícitas. Recovery é um produto verificável por drills, não reconstrução de transcript.**',
    '08 conclusion');
  s += '\n\n## Historical / Incumbent Evidence — M01 Pi/Treehouse Recovery\n\nM01 provou crash windows, fencing, adoption/release e fresh-process recovery usando a realização concreta Pi + Treehouse. Esses resultados continuam Evidence para as invariantes provider-neutral; detalhes de commands, lease IDs e worktree behavior permanecem nos artifacts/closeout de M01 e não selecionam a futura workspace/runtime realization.\n';
  return s;
});

// Section 09 — memory strata are runtime-neutral; Pi material remains incumbent reference.
await edit('09-context-memory.md', (input) => {
  let s = input;
  s = replaceRequired(s, 'L3 — Exact Pi Session History', 'L3 — Exact Runtime Session History', '09 strata summary');
  s = replaceRequired(s, '# 9.3 O que Pi já oferece', '# 9.3 Historical / Incumbent Runtime Reference — Pi session capabilities', '09 Pi reference heading');
  s = replaceRequired(s,
    '## 9.4.3 L2 — Session Observational Memory\n\nÉ a continuidade probabilística de uma Pi Session.',
    '## 9.4.3 L2 — Session Observational Memory\n\nÉ a continuidade probabilística de uma Runtime Session, quando a realization selecionada oferece ou integra esse recurso.',
    '09 L2 generic');
  s = replaceRequired(s, '## 9.4.4 L3 — Exact Pi Session History', '## 9.4.4 L3 — Exact Runtime Session History', '09 L3 heading');
  s = replaceRequired(s,
    'É o JSONL da Session.\n\nContém fontes exatas de:',
    'É o histórico exato fornecido pela Runtime Session realization, quando disponível. Pi JSONL é o incumbent histórico já estudado.\n\nPode conter fontes exatas de:',
    '09 L3 body');
  s = s.replaceAll('- Pi message queue;', '- runtime queue/protocol;');
  s = replaceRequired(s, 'Não incorporar `@mastra/memory` ao MNFS Pi-first.', 'Não incorporar `@mastra/memory` como segunda autoridade ou framework fundacional sem consumidor nomeado e conformance proof.', '09 Mastra decision');
  s = replaceRequired(s, 'O MNFS adota as ideias arquiteturais e avalia implementação Pi-native.', 'O MNFS adota apenas as ideias arquiteturais; qualquer implementação futura deve encaixar na boundary de Runtime Session sem inverter autoridade.', '09 Mastra direction');
  s = s.replaceAll('→ ADOPT ONLY AFTER AS-01', '→ HISTORICAL CANDIDATE / future spike required before adoption');
  s = s.replaceAll('# 9.26 Architecture Spike AS-01', '# 9.26 Historical / Deferred Candidate Study — AS-01 Session Memory');
  s = s.replaceAll('Executar AS-01 antes de tornar long-running Lead com OM o default.', 'Qualquer futuro default de long-running Session Memory exige um novo bounded spike/Decision sobre a Runtime selecionada.');
  s = replaceRequired(s,
    '> **O MNFS separa memória canônica, contexto compilado, memória observacional, histórico exato da Pi Session e transporte efêmero. SQLite, Git e o Approved Contract permanecem soberanos. Pi JSONL é reutilizado como ledger exato da Session. `pi-observational-memory` V3 é o candidato mais forte para continuidade do Lead, mas entra somente após um Architecture Spike, com Current Authority Snapshot acima da memória, isolamento por Role e nenhuma autoridade sobre completion. Plugins de memória de repositório não serão adotados como fontes concorrentes; seus melhores padrões serão incorporados ao Repository Profile, Context Index e Memory Promotion Gateway. M2 continua simples, sem OM e sem message bus.**',
    '> **O MNFS separa memória canônica, contexto compilado, memória observacional, Exact Runtime Session History e transporte efêmero. SQLite, Git e o Approved Contract permanecem soberanos. Runtime Session history e memory são observacionais, opcionais e substituíveis; nenhuma implementação recebe autoridade sobre completion. Pi JSONL e pi-observational-memory permanecem incumbent/research Evidence, não seleção constitucional. Plugins de memória não viram fontes concorrentes; novos consumidores exigem spike/Decision próprio. M2 permanece independente de OM e de transcript.**',
    '09 conclusion');
  return s;
});

// Section 10 — property-based environments replace E0-E4; vendor material is historical/reference.
await edit('10-security-isolation.md', (input) => {
  let s = input;
  const propertyModel = `# 10.8 Execution Environment property model\n\nThe E0–E4 ordinal ladder is historical vocabulary and is not the current semantic model. An Execution Environment is described by independent properties so capability, locality and security are not conflated.\n\n## 10.8.1 Required properties\n\n\`\`\`text\nagentPlacement       CONTROL_SIDE | IN_ENVIRONMENT\ncomputeLocation      LOCAL_WSL2 | LOCAL_VM | REMOTE | ...\nisolationBoundary   PROCESS | CONTAINER | MICROVM | VM | REMOTE_SANDBOX | ...\nworkspaceModel       WORKTREE | COW_FS | PRIVATE_ROOTFS | VOLUME | ...\npersistence          EPHEMERAL | ATTEMPT | TRACK | REUSABLE\nnetworkPosture       DENY_ALL | ALLOWLIST | BROKERED\ncredentialDelivery   NONE | BROKERED | TEMPORARY_GRANT\nresourceLimits       explicit CPU/memory/process/time limits when required\nresultBoundary       baseCommitSha + resultTreeSha (+ optional resultCommitSha)\nrecoveryCapability   observable/reconcilable external identity and disposition\n\`\`\`\n\nThese properties are domain-visible requirements. They do not imply a provider factory or one adapter per property.\n\n## 10.8.2 Agent placement\n\n`CONTROL_SIDE` is preferred when MNFS can expose a strict brokered capability surface while provider auth remains outside untrusted execution. `IN_ENVIRONMENT` is used when the whole agent must be contained; brokered inference/credentials are preferred over raw secrets.\n\n## 10.8.3 Bounded local Writer baseline\n\nFor the M2 outcome, the selected local realization must prove at minimum:\n\n- exact isolated mutable workspace;\n- protected host reads/writes denied;\n- no raw production credentials;\n- contract-required network posture, default deny for the current M2 proof;\n- child-process containment appropriate to the selected boundary;\n- fail-closed initialization;\n- deterministic Git result extraction;\n- fresh Recovery/Reconcile;\n- safe resource disposition.\n\nThe concrete runtime, process sandbox, microVM or workspace substrate is selected only after ARR Evidence.\n\n---\n\n`;
  s = replaceBetween(s, '# 10.8 Isolation levels', '# 10.9 WSL2 security position', propertyModel, '10 property model');
  s = replaceRequired(s, '# 10.10 Pi security integration', '# 10.10 Historical / Incumbent Runtime Security Reference — Pi', '10 Pi historical');
  s = replaceRequired(s, '# 10.11 Candidate local sandbox', '# 10.11 Historical / Incumbent Evidence — local process sandbox candidate study', '10 process sandbox historical');
  s = s.replaceAll('→ ADOPT ONLY AFTER AS-02', '→ HISTORICAL CANDIDATE; current selection requires ARR-S2 Evidence');
  s = replaceRequired(s, '# 10.13 Remote sandbox market scan', '# 10.13 Historical market/reference scan — remote execution', '10 remote scan historical');
  s = s.replaceAll('E4 ARCHITECTURE REFERENCE', 'HISTORICAL MICROVM ARCHITECTURE REFERENCE');
  const selection = `# 10.14 Environment selection policy\n\n## 10.14.1 Inputs\n\n- Role and Actor placement;\n- repository/code trust;\n- required mutation and proof;\n- isolation and workspace requirements;\n- network/credential/effect posture;\n- services and resource limits;\n- concurrency/duration/cost;\n- host sensitivity and recovery needs.\n\n## 10.14.2 Selection\n\nSelection compiles required properties first, then chooses the lowest sufficient proven realization. Examples:\n\n\`\`\`text\nread-only trusted investigation\n→ CONTROL_SIDE + no mutation + bounded read surface\n\nlocal bounded Writer\n→ isolated mutable workspace + proven local isolation + contract network/credential posture\n\ncomplex reproducible stack\n→ environment-as-code may be added; it is not automatically a security boundary\n\nuntrusted/high-assurance workload\n→ stronger proven isolation boundary, potentially microVM/VM/remote\n\`\`\`\n\n## 10.14.3 Escalation and failure\n\nRisk may require stronger properties. If the required realization is unavailable or cannot prove the contract:\n\n\`\`\`text\nBLOCK / REPLAN\n\`\`\`\n\nNever silently downgrade isolation, credentials, network posture or effect authority.\n\n---\n\n`;
  s = replaceBetween(s, '# 10.14 Environment selection policy', '# 10.15 Filesystem policy', selection, '10 selection policy');
  s = s.replaceAll('WORKTREE_ONLY', 'BOUND_WORKSPACE_ONLY');
  s = s.replaceAll('    - worktree\n', '    - bound isolated mutable workspace\n');
  s = s.replaceAll('    - worktree', '    - bound isolated mutable workspace');
  s = s.replaceAll('exclude from worktree', 'exclude from bound mutable workspace');
  s = s.replaceAll('edit worktree', 'edit bound mutable workspace');
  s = replaceRequired(s, '# 10.34 AS-02 — Local Pi Sandbox on WSL2', '# 10.34 Historical / Incumbent Evidence — AS-02 Local Pi Sandbox on WSL2', '10 AS02 historical heading');
  s = replaceRequired(s,
    'Pi sandbox extension pattern\n+\nAnthropic Sandbox Runtime\n+\nTreehouse worktree',
    'Historical revision-5 realization:\nPi sandbox extension pattern\n+ Anthropic Sandbox Runtime\n+ Treehouse worktree',
    '10 AS02 historical composition');
  s = s.replaceAll('Executar AS-02.', 'Historical AS-02 has already produced incumbent Evidence; current selection proceeds through ARR-S0/S2.');
  s = s.replaceAll('Pi tool interception | Adotar | capability enforcement', 'Pi tool interception | Historical/incumbent Evidence | prior capability-enforcement realization');
  s = s.replaceAll('Pi sandbox example | Adotar como pattern | local integration reference', 'Pi sandbox example | Historical/reference | local integration Evidence');
  s = s.replaceAll('Anthropic Sandbox Runtime | Candidato | E1 OS sandbox', 'Anthropic Sandbox Runtime | Incumbent candidate for ARR-S2 | process-envelope Evidence');
  s = s.replaceAll('Daytona | Future primary candidate | E3 remote workspace', 'Daytona | Historical remote reference | reassess only with fresh provenance');
  s = s.replaceAll('E2B | Future alternative | narrow remote sandbox', 'E2B | remote reference/candidate | fresh provenance required');
  s = s.replaceAll('Firecracker | Future reference | E4 isolation', 'Firecracker | low-level isolation reference | not a selected MNFS realization');
  s = s.replaceAll('- E4 boundary;', '- required isolation boundary;');
  s = s.replaceAll('- E2B;', '- remote sandbox candidate/reference;');
  s = s.replaceAll('- E3/E4 decision;', '- remote/high-assurance isolation Decision;');
  s = s.replaceAll('- E3/E4;', '- remote/high-assurance isolation;');
  s = s.replaceAll('- E1 é o target local do Writer;', '- o local Writer requer property-based isolation proven by ARR Evidence;');
  s = s.replaceAll('- Sandbox Runtime é candidato após AS-02;', '- process sandbox realizations are selected by ARR-S2 Evidence;');
  s = s.replaceAll('- E2B é alternativa;', '- remote sandbox candidates remain deferred until a named consumer;');
  s = s.replaceAll('`/mnt/c` é denied para E1 por default.', '`/mnt/c` is denied by default for the current protected local Writer profile.');
  s = s.replaceAll('M2 não executa unrestricted Pi como definição de sucesso.', 'M2 não executa qualquer Agent Runtime irrestrito como definição de sucesso.');
  s = s.replaceAll('A arquitetura não deve permitir que “spawn Pi worker” signifique “spawn unrestricted Pi under the user account.”', 'A arquitetura não permite que dispatch de um Writer signifique execução irrestrita sob toda a autoridade do usuário host.');
  s = replaceRequired(s,
    '> **O MNFS adota defesa em profundidade e separa Domain Authority, tool capability, process sandbox, execution environment, credential grant, network policy e external-effect gate. O target local do Writer será E1: Treehouse worktree executado por Pi dentro de uma boundary de sistema operacional, com writes allow-only, sensitive reads bloqueados, network off, policy imutável e ausência de production credentials. A integração Pi + Anthropic Sandbox Runtime é candidata e precisa passar pelo AS-02 no WSL2. Dev Containers serão suportados como environment-as-code; Daytona é o principal candidato remoto futuro; E2B é alternativa; Ona e Firecracker são referências. Credentials serão temporárias e process-scoped; external mutations serão governadas por Effect Request, Effect Executor e Effect Receipt. M2 permanecerá simples, mas não poderá equivaler a executar um Pi Worker irrestrito com todos os poderes do usuário.**',
    '> **O MNFS adota defesa em profundidade e separa Domain Authority, Tool Capability, isolation boundary, Execution Environment, Credential Grant, Network/Egress Policy e External Effect Gate. Environments are defined by independent properties rather than E0–E4 levels. The M2 local Writer must use an isolated mutable workspace, fail-closed proven isolation, no raw production credentials, contract-bounded network posture and provider-neutral Git result identity. Concrete process-sandbox/microVM/workspace/runtime realizations are selected only by ARR Evidence and Decision. Credentials are temporary/brokered where possible; external mutations use Effect Request/Executor/Receipt.**',
    '10 conclusion');
  return s;
});

// Section 12 — replace the stale AB1/AS-02/Pi-first roadmap with the accepted ARR path.
await edit('12-capability-roadmap.md', (input) => {
  const tail = `# 12.7 Horizontes atuais\n\n## H0 — Proven Foundation\n\n\`\`\`text\nM0 Foundation Walking Skeleton      ACCEPTED\nM1 Visual Mission Planning          ACCEPTED\n\`\`\`\n\n## H1 — Trusted Local Harness\n\n\`\`\`text\nARR P1 constitutional reconciliation\n→ ARR-S0 Host Capability Probe\n→ ARR-S1 Agent Runtime Conformance\n  + ARR-S2 Local Execution Envelope Conformance\n→ conditional ARR-S2W Workspace Conformance\n→ ARR-S3 Vertical Composition Proof\n→ substrate-selection Decision\n→ CAP-EXECUTION / MIS-002 Opportunity Replan\n→ new M02 R5 Execution Design + implementation\n→ M2 Golden Proof\n\`\`\`\n\n## H2 — Complete Local Software Factory\n\nAfter M2, capabilities expand only from proven consumers: Repository Profile/Engineering System, independent Review/Integration, parallel tracks, adaptive Quality/QA, governed Effects/Delivery, Observability/Evaluation/Calibration.\n\n## H3 — Platform Expansion\n\nWeb/operator surfaces, multi-repository operation and remote/cloud execution remain options/targets whose contracts are created only when earlier local capabilities prove the need.\n\nHorizonte representa confiança e dependency order, não data.\n\n---\n\n# 12.8 Visão resumida\n\n| Item | Nome | Estado atual |\n|---|---|---|\n| M0 | Foundation Walking Skeleton | \`ACCEPTED\` |\n| M1 | Visual Mission Planning | \`ACCEPTED\` |\n| ARR-P1 | Architecture / constitutional reconciliation | \`CURRENT REVIEW / CORRECTION\` |\n| ARR-S0 | Host Capability Probe | \`NEXT POSSIBLE GATED SPIKE\` |\n| ARR-S1 | Agent Runtime Conformance | \`PLANNED AFTER S0\` |\n| ARR-S2 | Local Execution Envelope Conformance | \`PLANNED AFTER S0\` |\n| ARR-S2W | Workspace Conformance | \`CONDITIONAL\` |\n| ARR-S3 | Vertical Composition Proof | \`PLANNED AFTER S1/S2(/S2W)\` |\n| M2 | Secure One-Worker Vertical Slice | \`OPPORTUNITY_REPLAN\` |\n| M3 | Repository Profile and Engineering System | \`PLANNED AFTER M2\` |\n| M4 | Independent Review and Integration | \`PLANNED\` |\n| M5 | Parallel Write Tracks | \`PLANNED\` |\n| M6 | Adaptive Quality and Live QA | \`PLANNED\` |\n| M7–M9 | Effects, Delivery, Observability/Evaluation | \`TARGET\` |\n| M10–M12 | Web, multi-repository, remote/cloud | \`OPTION / TARGET\` |\n\nThe exact current execution gate lives in \`docs/tracking/STATUS.md\`; this roadmap never hard-codes a transient Operator authorization.\n\n---\n\n# 12.9 Current ARR decision program\n\n## ARR-S0 — Host Capability Probe\n\nProduces immutable host facts and coarse capability classes for the canonical WSL2 host. It does not install candidates and does not select a runtime/environment winner.\n\n## ARR-S1 — Agent Runtime Conformance\n\nFreezes a candidate-independent contract after S0, refreshes primary-source provenance, and compares only runtime shapes that can alter the decision. Recovery cannot depend on Session/transcript.\n\n## ARR-S2 — Local Execution Envelope Conformance\n\nUses the same fixture/criteria across eligible process-envelope and microVM-class candidates. It proves host-read/write denial, network/credential posture, containment, fail-closed behavior, workspace semantics, Git fidelity, recovery and cleanup.\n\n## ARR-S2W — Workspace Conformance, conditional\n\nExists only if the selected envelope still needs a separate workspace substrate. Do not stack an extra workspace manager when the environment already supplies sufficient private mutable workspace semantics.\n\n## ARR-S3 — Vertical Composition Proof\n\n\`\`\`text\naccepted fixed Spike contract\n→ provider-neutral M01 semantic core\n→ selected Agent Runtime\n→ selected Execution Environment/workspace\n→ fixed repository change\n→ Claim(baseCommitSha,resultTreeSha)\n→ terminate Lead\n→ Fresh Lead Recovery\n→ deterministic Receipt\n→ MNFS Gate\n→ accepted Git result\n→ idempotent resource disposition\n\`\`\`\n\nS3 is architecture Evidence, not production M02.\n\n---\n\n# 12.10 M2 — Secure One-Worker Vertical Slice\n\n## Estado\n\n\`\`\`text\nOPPORTUNITY_REPLAN\n\`\`\`\n\n## Outcome preservado\n\nA single bounded Writer:\n\n\`\`\`text\nreceives a fresh Authority Snapshot and fixed contract\n→ executes through the selected Agent Runtime\n→ mutates only its isolated mutable workspace inside the approved Execution Environment\n→ produces a durable Claim bound to baseCommitSha/resultTreeSha\n→ survives Lead death through Fresh Recovery\n→ is independently verified by runner-owned Receipt(s)\n→ is accepted only by an MNFS Gate\n→ yields an accepted provider-neutral Git result\n→ resources are safely and idempotently dispositioned\n\`\`\`\n\n## Realization rules\n\n- Worker completion is never acceptance.\n- Runtime Session/transcript is never recovery authority.\n- Agent Runtime, workspace substrate and Execution Environment are selected by post-Spike Decision, not by this Product outcome.\n- Protected execution fails closed.\n- Raw production credentials are denied for the M2 proof.\n- Current network posture is contract-bound and deny-by-default for the local proof.\n- Result identity remains Git-provider-neutral.\n- M01 durable WriteTrack/Attempt/WorkerRun/Claim/fencing semantics are reused where provider-neutral; prior Pi/Treehouse specifics remain historical Evidence.\n\n## Entry before production implementation\n\n- ARR P1 accepted/integrated or exact base includes its accepted tree;\n- ARR-S0/S1/S2 and any applicable S2W accepted;\n- ARR-S3 accepted;\n- substrate selection Decision published;\n- superseding CAP-EXECUTION and MIS-002 revision approved;\n- new M02 R5 Execution Design and implementation plan approved.\n\n## Golden Proof\n\nThe production M2 proof must reproduce the semantic flow established by ARR-S3 using the selected concrete realizations and current authority, including failure/recovery drills and independent Gate acceptance.\n\n## Non-goals\n\n- generic provider/plugin framework without a second consumer;\n- arbitrary production Effects;\n- multiple parallel Writers;\n- Web Console;\n- remote/cloud control plane unless separately selected later.\n\n---\n\n# 12.11 Later Product Milestones\n\nThe original M3–M12 outcomes remain directional, but their detailed contracts are intentionally deferred until M2 Evidence exists. Their ordering principle remains:\n\n\`\`\`text\nRepository-aware engineering governance\n→ independent Review / Integration\n→ safe parallelism\n→ adaptive Quality / live QA\n→ governed external Effects and Delivery\n→ Observability / Evaluation / Calibration\n→ richer Operator surfaces\n→ multi-repository / remote expansion\n\`\`\`\n\nNo later milestone may retroactively turn a candidate substrate into constitutional semantics.\n\n---\n\n# 12.12 Historical roadmap realizations\n\nThe prior roadmap named AB1, AS-02 Local Pi Sandbox, Pi Session AS-01, Treehouse worktrees and fixed E1 as current steps. Those exact choices are preserved in Git history, accepted M01/AS-02 Evidence and superseded ADRs. They are not duplicated here as current roadmap authority because D-012 through D-015 superseded that realization path.\n\nHistorical Evidence remains usable for migration cost, incumbent comparison and regression constraints. It does not select a winner for ARR-S1/S2/S2W.\n\n---\n\n# 12.13 Roadmap invariants\n\n1. Product outcomes are more stable than substrate choices.\n2. Correctness is frozen before decomposition; realization is frozen before bounded execution.\n3. Every Architecture Spike has a candidate-independent contract and deciding Evidence.\n4. Same fixture/criteria apply to compared candidates; changing the contract invalidates prior comparison runs.\n5. Product M2 cannot resume through revision-5 M02.\n6. No Agent Runtime, workspace or Environment winner exists before selecting Decision.\n7. S0 host facts are immutable Evidence; candidate eligibility is recomputed from fresh provenance.\n8. S2W is conditional, not automatic.\n9. S3 must use real selected realizations for deciding Evidence.\n10. CAP-EXECUTION/MIS-002 Replan occurs after deciding Spikes, never by mutating accepted historical versions in place.\n11. Later milestones receive detailed contracts only near execution.\n12. Exact transient execution authority lives in STATUS/Operator gates, not in this generated roadmap.\n\n---\n\n# Decisão resumida da Seção 12\n\n> **M0 e M1 permanecem aceitos. M2 preserva o outcome de um Writer local seguro, recuperável e aceito por Evidence, mas sua realização está em Opportunity Replan. O caminho corrente é ARR P1 → S0 → S1/S2 → S2W somente se necessário → S3 → substrate-selection Decision → CAP-EXECUTION/MIS-002 Replan → novo M02 R5 → M2. Pi, Treehouse, fixed E1 e os antigos AB1/AS-02/AS-01 permanecem historical/incumbent Evidence, não current roadmap authority.**\n`;
  return replaceFrom(input, '# 12.7 Horizontes', tail, '12 current roadmap tail');
});

// Section 13 — documentation governance points to current ARR/P1 rather than historical AB1.
await edit('13-documentation-governance.md', (input) => {
  let s = input;
  s = s.replaceAll('- initiated AB1;', '- initiated the historical architecture-baseline cycle now superseded by ARR;');
  s = s.replaceAll('AB1 não fecha apenas porque o Blueprint foi escrito.', 'Nenhum architecture/reconciliation gate fecha apenas porque o Blueprint foi escrito.');
  s = replaceRequired(s,
    '> **O MNFS trata documentação como parte do control plane. Git guarda a doutrina, decisões, specifications, Standards e guidance; `.mnfs` guarda identidade e contratos/evidence machine-readable; SQLite guarda state operacional. Cada conceito possui um documento owner, Authority e lifecycle. ADRs aceitos e Mission Contracts aprovados não são semanticamente reescritos; mudanças usam supersession ou Replan. O Product Blueprint terá 13 fontes modulares e um agregado gerado. Capability Specs seguem processo KEP/RFC-like; Research permanece Evidence não normativa; Issues e PRs são veículos de trabalho. README e AGENTS.md permanecem curtos; `DOCUMENTATION-MAP.md` é o índice autoritativo. Metadata, CODEOWNERS, docs-impact e CI reduzem drift. AB1 só fecha depois que esse sistema documental estiver publicado, revisado e usado para reconciliar MIS-002.**',
    '> **O MNFS trata documentação como parte do control plane. Git guarda doutrina, Decisions, Specifications, Standards e Guidance; `.mnfs` guarda identity e machine-readable contracts/evidence; SQLite guarda estado operacional. Cada conceito possui owner, Authority e lifecycle. Accepted ADRs/Mission Contracts mudam por supersession/Replan, não por reinterpretação silenciosa. O Product Blueprint possui 13 fontes modulares e aggregate gerado; Research permanece Evidence não normativa; Issues/PRs são veículos de trabalho. A current ARR/P1 reconciliation só pode fechar quando uma Fresh Actor lê as fontes correntes sem encontrar duas arquiteturas concorrentes, todas as projections estão regeneradas e os gates apontam para uma única next action.**',
    '13 conclusion');
  return s;
});

console.log('Applied P1-F02 constitutional body reconciliation.');

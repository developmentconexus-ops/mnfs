---
id: DOC-PRODUCT-BLUEPRINT-09
title: Contexto, Memória, Comunicação e Eficiência de Tokens
document_type: product_blueprint_section
form: explanation
authority: constitutional
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - product blueprint section 9
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-02
tracking_issue: 6
---

# 9. Contexto, Memória, Comunicação e Eficiência de Tokens

## 9.1 Propósito

Esta seção define como o MNFS preserva continuidade sem transformar uma Session, um transcript, um plugin de memória ou uma compactação probabilística em fonte de verdade.

O problema possui quatro dimensões distintas:

1. **Durabilidade:** o que precisa sobreviver a qualquer Session;
2. **Continuidade:** o que ajuda um Actor a permanecer orientado durante trabalho longo;
3. **Precisão:** como recuperar a origem exata quando um resumo é insuficiente;
4. **Eficiência:** como reduzir contexto, latência e custo sem degradar o resultado.

Uma solução inadequada trataria tudo como “memória”.

O MNFS adota uma arquitetura estratificada:

```text
L0 — Authoritative Product and Domain Memory
L1 — Current Authority Snapshot and Compiled Context
L2 — Session Observational Memory
L3 — Exact Pi Session History
L4 — Ephemeral Transport
```

No MNFS:

> **Memória observacional ajuda o agente a lembrar. Estado autoritativo determina o que é verdade agora.**

---

# 9.2 Base de pesquisa

Esta decisão foi baseada em:

- documentação oficial de Sessions, Compaction, Extensions, SDK e RPC do Pi;
- `pi-observational-memory` V3;
- `pi-observational-memory-extension`;
- Mastra Observational Memory;
- `pi-memory`;
- `@josephakern/pi-memory`;
- `pi-memctx`;
- `pi-agenticoding`;
- `pi-link`.

A análise completa está registrada em:

```text
MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1.md
```

## 9.2.1 Limite das evidências

Benchmarks de memória conversacional medem recordação em diálogos extensos.

Eles não comprovam diretamente:

- preservação de estado Git;
- correção de Claims;
- independência de Review;
- ausência de false completion;
- recovery de Workers;
- coordenação de Write Tracks;
- qualidade de software produzido.

Por isso, uma ferramenta promissora continua sendo candidata até passar por um spike específico do MNFS.

---

# 9.3 O que Pi já oferece

## 9.3.1 Session ledger JSONL

Pi persiste Sessions em JSONL.

Cada entry possui `id` e `parentId`, formando uma árvore que preserva branches dentro do mesmo arquivo.

O ledger pode conter:

- user messages;
- assistant messages;
- tool calls;
- tool results;
- compaction entries;
- branch summaries;
- custom messages;
- extension state;
- labels.

Isso fornece o histórico exato da Session.

## 9.3.2 Resume, tree, fork e clone

Pi permite:

- continuar a Session mais recente;
- selecionar uma Session;
- navegar pela árvore;
- criar branch;
- fork;
- clone.

Esses mecanismos preservam continuidade conversacional.

Não substituem o Domain Model do MNFS.

## 9.3.3 Compaction nativa

Pi compacta contexto quando:

- o limite se aproxima;
- ocorre overflow;
- o operador executa `/compact`.

O processo:

1. seleciona um boundary;
2. mantém uma janela recente;
3. resume mensagens anteriores;
4. registra uma Compaction Entry;
5. reconstrói o contexto ativo.

A compactação é lossy.

O histórico original continua no JSONL, mas deixa de estar integralmente no contexto ativo.

## 9.3.4 Extensibilidade

Pi extensions podem:

- interceptar `session_before_compact`;
- substituir o resultado da compactação;
- adicionar entries persistentes;
- registrar tools;
- registrar commands;
- observar lifecycle;
- injetar contexto;
- inspecionar context usage.

Portanto, o MNFS pode experimentar estratégias de memória sem fazer fork do Pi.

## 9.3.5 SDK e RPC

Pi também expõe:

- SDK Node/TypeScript;
- RPC JSONL sobre stdin/stdout;
- streamed events;
- steering;
- follow-ups;
- compaction control;
- session management.

Esses mecanismos serão considerados para controle programático futuro.

M2 continuará com a integração mais estreita capaz de provar o comportamento necessário.

---

# 9.4 Estratos de memória

## 9.4.1 L0 — Authoritative Product and Domain Memory

É a memória canônica.

Fontes:

```text
SQLite
Git
Approved Mission Contracts
ADRs
Product Blueprint
Repository Profile
Engineering Standards
Golden Paths
Decisions
Evidence Bundles
Closeouts
```

Propriedades:

- estruturada;
- validada;
- versionada;
- citável;
- governada por Authority;
- independente de Session;
- capaz de bloquear ou autorizar ações.

Somente L0 pode determinar:

- estado atual;
- contrato vigente;
- Attempt atual;
- Claim aceito;
- Feature fechada;
- Decision válida;
- Waiver ativa.

## 9.4.2 L1 — Current Authority Snapshot e Context Pack

É a projeção autoritativa preparada para um Actor.

Inclui:

```text
target
current lifecycle
current contract hash
current Attempt
current blockers
active Decisions
permitted next actions
Role Contract
Acceptance Criteria
```

É produzido por código a partir de L0.

O Current Authority Snapshot precisa preceder qualquer memória observacional relevante.

## 9.4.3 L2 — Session Observational Memory

É a continuidade probabilística de uma Pi Session.

Pode conter:

- Observations;
- Reflections;
- task continuity;
- constraints recordadas;
- rejected approaches;
- source IDs;
- suggested recall targets.

Propriedades:

- Role-scoped;
- Session ou branch-scoped;
- supporting;
- probabilística;
- compacta;
- substituível;
- desativável;
- nunca autoritativa.

## 9.4.4 L3 — Exact Pi Session History

É o JSONL da Session.

Contém fontes exatas de:

- mensagens;
- tool calls;
- tool outputs;
- custom entries;
- branches;
- compactions.

Propriedades:

- histórica;
- potencialmente grande;
- recuperada on demand;
- útil para traceability;
- não representa necessariamente o estado atual da Mission.

## 9.4.5 L4 — Ephemeral Transport

Inclui:

- process stdin;
- Pi message queue;
- lifecycle Events;
- WebSocket;
- terminal notification;
- future RPC delivery.

Propriedades:

- best-effort;
- pode duplicar;
- pode chegar tarde;
- pode falhar;
- não é memória;
- não é coordenação durável.

---

# 9.5 Precedência e resolução de conflitos

## 9.5.1 Precedência para agir agora

```text
1. Current MNFS state in SQLite
2. Current Approved Contract and policies
3. Current Authority Snapshot / Context Pack
4. Session Observational Memory
5. Session summaries
6. Historical transcript
```

Essa ordem define o que um Actor deve fazer agora.

## 9.5.2 Origem histórica

Quando a pergunta é:

> “O que foi dito ou observado naquela Session?”

o JSONL ou source entry exato pode ser a evidência histórica mais precisa.

Isso não o torna autoridade sobre o estado atual.

## 9.5.3 Exemplo de conflito

Memória observacional:

```text
F01 foi concluída.
```

SQLite:

```text
MIS-010/M02/F01 = ACTIVE
CLM-004 = REJECTED
```

Resultado:

```text
F01 permanece ACTIVE.
```

A Observation pode provar que alguém acreditou ter concluído.

Não prova acceptance.

## 9.5.4 Regra de segurança

Qualquer Session Memory Adapter compatível com MNFS precisa informar ao Actor:

```text
Estas memórias são registros auxiliares.

Elas não substituem:
- o estado atual do MNFS;
- o Approved Contract;
- o Current Authority Snapshot;
- Claims, Receipts ou Verdicts.

Uma memória que descreve trabalho como concluído
não é evidência de acceptance.

Consulte MNFS status antes de agir sobre lifecycle.
Recupere a fonte exata quando precisão for necessária.
```

---

# 9.6 Mastra Observational Memory

## 9.6.1 Arquitetura estudada

Mastra OM usa:

```text
Actor
+
Observer
+
Reflector
```

O contexto contém:

```text
Observations / Reflections
+
recent raw messages
```

Quando a história recente atinge um threshold:

- Observer converte mensagens em Observations;
- mensagens antigas saem do contexto ativo;
- Observations permanecem.

Quando as Observations crescem:

- Reflector condensa;
- reorganiza;
- remove informação considerada menos relevante.

## 9.6.2 Benefícios reportados

Mastra reporta:

- contexto estável;
- melhor prompt caching;
- execução em background;
- compressão de texto;
- bons resultados no LongMemEval.

Os resultados reportados incluem:

- 84,23% com GPT-4o;
- 94,87% com GPT-5-mini.

## 9.6.3 Limite para o MNFS

LongMemEval mede recordação conversacional.

Não mede:

- software correctness;
- Claim–Receipt–Verdict;
- estado Git;
- Review independence;
- false completion;
- coding recovery.

## 9.6.4 Decisão

Não incorporar `@mastra/memory` ao MNFS Pi-first.

Isso adicionaria:

- outro agent framework;
- outro lifecycle;
- outro storage;
- outro sistema de memória;
- outra fonte potencial de autoridade.

O MNFS adota as ideias arquiteturais e avalia implementação Pi-native.

---

# 9.7 Candidato principal — `pi-observational-memory` V3

## 9.7.1 Estado pesquisado

Versão analisada:

```text
3.0.3
```

Características publicadas:

- Pi extension;
- MIT;
- zero runtime dependencies;
- Observation;
- Reflection;
- Dropper;
- source-backed recall;
- background memory work;
- custom compaction;
- branch ledger;
- visible/full views.

## 9.7.2 Lifecycle

```text
turn_end
→ Observer when due
→ Reflector when due
→ Dropper after Reflection

agent_end
→ proactive compaction trigger when due

session_before_compact
→ deterministic rendering
```

A compactação não precisa esperar um model call naquele momento.

## 9.7.3 Ledger

V3 registra entries como:

```text
om.observations.recorded
om.reflections.recorded
om.observations.dropped
```

Observations possuem source IDs.

Reflections referenciam supporting Observations.

Dropped Observations deixam a memória ativa, mas permanecem no histórico do ledger.

## 9.7.4 Recall

A tool `recall` recupera fontes para um Observation ou Reflection ID.

Isso melhora:

- traceability;
- source verification;
- debugging;
- precisão antes de Decision material.

Recall não é semantic search geral.

## 9.7.5 Pontos fortes

- integração nativa ao Pi;
- sem banco externo;
- histórico exato preservado;
- source-backed memory;
- compactação preparada em background;
- inspecionável;
- substituível;
- pode ser desligada;
- encaixa no lifecycle de Session.

## 9.7.6 Riscos

### Probabilistic compression

Observer, Reflector e Dropper são agentes.

Podem:

- omitir;
- distorcer;
- generalizar;
- preservar algo obsoleto;
- classificar relevance incorretamente.

### Completion authority conflict

A renderização padrão publicada orienta que trabalho descrito como concluído não seja refeito, salvo pedido do usuário.

No MNFS:

```text
memory says completed
≠ Claim accepted
```

A configuração padrão não deve ser adotada como autoridade.

### Session scope

A memória vive na Session ou branch.

Não é Repository Memory canônica.

### Upgrade compatibility

V3 não lê o formato V2.

Rollback também não preserva continuidade entre os formatos.

### Cost

Observer, Reflector e Dropper usam model calls.

Sem model override, podem usar o modelo da Session.

### Benchmark gap

Não há evidência publicada suficiente para afirmar benefício líquido no fluxo MNFS.

## 9.7.7 Classificação

```text
CANDIDATE
→ ADOPT ONLY AFTER AS-01
```

Uso inicial proposto:

```text
MNFS Lead only
```

Não habilitar globalmente para todas as Roles.

## 9.7.8 Binding

O MNFS precisa possuir um `SessionMemoryAdapter`.

O Domain Core não importa o package.

A extensão pode ser:

- instalada;
- desativada;
- substituída;
- atualizada;
- removida;

sem migration do Domain State.

---

# 9.8 Alternativa — `pi-observational-memory-extension`

## 9.8.1 Capacidades

A alternativa pesquisada oferece:

- Mastra-style OM;
- session ou project scope;
- local retrieval;
- optional embedding retrieval;
- background buffering;
- secret redaction;
- TUI inspection.

## 9.8.2 Vantagens

- mais recursos de retrieval;
- cross-session/project scope;
- richer memory management.

## 9.8.3 Riscos

- implementação mais jovem;
- project memory concorre com o MNFS;
- retrieval adiciona policy;
- maior superfície;
- risco de cross-Role contamination;
- overlap com Repository Profile e Context Packs.

## 9.8.4 Decisão

```text
DEFER
```

Usar como referência.

Não adotar project-scoped OM agora.

---

# 9.9 Memórias persistentes de repositório

## 9.9.1 `pi-memory`

Fornece semantic search sobre:

- long-term memory;
- daily logs;
- scratchpad.

É útil para memória pessoal e uso geral do Pi.

Não deve ser o core do MNFS.

## 9.9.2 `@josephakern/pi-memory`

Fornece:

- `MEMORY.md` capped;
- páginas por tópico;
- global/project scope;
- strict writeback;
- archive;
- introspection.

Padrões úteis:

- index curto;
- detalhes on demand;
- writeback explícito;
- archive em vez de apagamento silencioso;
- limite de injeção.

Conflito:

- duplicaria Repository Profile;
- Decisions;
- Standards;
- Product Memory.

## 9.9.3 `pi-memctx`

Fornece:

- Markdown memory packs;
- qmd ou grep;
- retrieval;
- auto-learning;
- review queue;
- runbooks;
- Decisions;
- Observations;
- fallback para inspeção real.

É um sistema de memória de workspace sofisticado.

Também sobrepõe diretamente:

- Repository Profile;
- Context Pack Compiler;
- Decisions;
- Code Map;
- Golden Paths;
- Memory Promotion.

## 9.9.4 Decisão

Não adotar outro project-memory system como fonte concorrente.

Reutilizar padrões:

- capped index;
- source-visible Markdown;
- review queue;
- strict writeback;
- secret redaction;
- fallback para inspeção real;
- archive;
- on-demand detail.

---

# 9.10 Deliberate handoff — `pi-agenticoding`

## 9.10.1 Capacidades

Fornece:

- spawn;
- task-scoped notebook;
- handoff;
- topic;
- readonly;
- context-pressure visibility.

A ideia central:

```text
same task
→ isolate noise or use notebook

new task
→ deliberate handoff
```

## 9.10.2 Padrões úteis

- memória limitada à tarefa;
- handoff escrito pelo Actor;
- restart deliberado;
- readonly investigation;
- context-pressure visibility;
- não manter forever memory sem necessidade.

## 9.10.3 Conflito

Sobrepõe:

- Worker spawning;
- Context Packs;
- Handoff Artifacts;
- Investigator Role;
- readonly policy;
- Session rotation.

## 9.10.4 Decisão

```text
ADOPT PRINCIPLES
DO NOT MAKE CORE DEPENDENCY
```

Pode ser usado pessoalmente durante desenvolvimento.

O produto final mantém sua própria semântica.

---

# 9.11 Context Pack

## 9.11.1 Definição

Context Pack é o Artifact compilado pelo MNFS para:

- uma Role;
- um target;
- um Attempt;
- um estado autoritativo.

Observational Memory não substitui o Pack.

## 9.11.2 Estrutura conceitual

```ts
interface ContextPack {
  id: ContextPackId;
  role: ActorRole;
  target: EntityReference;

  contractHash: string;
  expectedBaseSha?: string;

  authoritySnapshotRef: ArtifactRef;

  objective: string;
  acceptanceCriteria: AcceptanceCriterionRef[];

  scope: {
    included: string[];
    excluded: string[];
  };

  writeSet?: string[];
  readContext?: ContextReference[];

  contracts: ArtifactRef[];
  decisions: DecisionRef[];
  standards: StandardBinding[];
  goldenPath?: GoldenPathBinding;
  waivers: WaiverRef[];

  invariants: string[];
  negativePaths: string[];
  examples: ExampleReference[];

  commands: CommandBinding[];
  verificationPlan: VerificationBinding[];

  allowedActions: string[];
  forbiddenActions: string[];
  autonomyBudget: AutonomyBudget;

  outputContract: ArtifactRef;
  escalationProtocol: ArtifactRef;

  generatedAt: string;
  contentHash: string;
}
```

## 9.11.3 Tipos

```text
PLANNING_PACK
INVESTIGATION_PACK
WRITER_PACK
REVIEW_PACK
CORRECTION_PACK
INTEGRATION_PACK
QA_PACK
CLOSEOUT_PACK
HANDOFF_PACK
```

## 9.11.4 Compilação

```text
Approved Contract
+
Current MNFS State
+
Documentation Map
+
Repository Profile
+
Feature / Milestone
+
Decisions
+
Standards
+
Golden Path
+
Git base
+
Code Map
+
Findings
+
Role Contract
→ Context Pack
```

## 9.11.5 Código antes de LLM

Campos mecânicos são compilados por código:

- identities;
- state;
- criteria;
- hashes;
- commands;
- dependencies;
- policy;
- versions.

Campos LLM-produced são marcados.

---

# 9.12 Current Authority Snapshot

## 9.12.1 Objetivo

Neutralizar:

- memória stale;
- transcript antigo;
- Session resumida;
- late Observation;
- Decision superseded;
- false completion.

## 9.12.2 Conteúdo mínimo

```text
repository
mission
target
current contract hash
current phase
current attention
current Attempt
active Claim
current blockers
active Decisions
valid Waivers
next permitted actions
generated_at
source versions
```

## 9.12.3 Injeção

O Snapshot deve ser entregue:

- no início do dispatch;
- no resume;
- depois de Replan;
- depois de Recovery;
- depois de Decision material;
- antes de uma ação de lifecycle.

## 9.12.4 Precedência

Quando Snapshot e Session Memory discordarem:

```text
Snapshot wins
```

Quando o Snapshot parece incorreto:

```text
reconcile
```

Não obedecer à memória.

---

# 9.13 Progressive Disclosure

## 9.13.1 Camadas

```text
Layer 0 — Current Authority Snapshot
Layer 1 — Contract and Criteria
Layer 2 — Local Code and Interfaces
Layer 3 — Standards, Profile and Examples
Layer 4 — Cross-system Context
Layer 5 — Historical Evidence and Recall
```

## 9.13.2 Writer

Recebe:

- Snapshot;
- Writer Pack;
- relevant code;
- Standards;
- Golden Path;
- verification;
- Claim protocol.

Não recebe todo o histórico da Mission.

## 9.13.3 Reviewer

Recebe:

- cold Snapshot;
- fixed SHA;
- Review Pack;
- diff;
- Claim;
- Receipts;
- Findings.

Não recebe Lead OM nem Writer OM.

## 9.13.4 QA

Recebe:

- candidate SHA;
- Journey;
- environment;
- expected observations.

Não recebe a narrativa da implementação.

---

# 9.14 Política de memória por Role

| Role | OM | Razão |
|---|---|---|
| MNFS Lead | Candidata após spike | Session longa e coordenação |
| Planner | Opcional | múltiplas revisões do mesmo plano |
| Investigator | Off | trabalho curto e Artifact-first |
| Writer | Off por default | Pack bounded |
| Writer longo | Condicional | Track multi-dia |
| Reviewer inicial | Off | independência |
| Reviewer remedy | mesma Session | continuidade no mesmo Finding |
| Integrator | Off | processo curto |
| QA | Off/fresh | evitar bias |
| Closeout | Opcional | agregação estruturada domina |

## 9.14.1 Isolation

Nunca compartilhar OM entre:

- duas Write Tracks;
- Lead e Writer;
- Writer e Reviewer;
- Reviewer e QA;
- Missions diferentes.

## 9.14.2 Project-scoped OM

Não é adotada.

Repository truths pertencem ao MNFS.

---

# 9.15 Exact recall

## 9.15.1 Quando usar

Recall é exigido quando uma Observation:

- influencia Decision D3–D5;
- afirma mudança de contrato;
- afirma completion;
- contradiz estado atual;
- preserva detalhe crítico;
- está comprimida demais;
- precisa de traceability.

## 9.15.2 Recall não é broad search

O Actor não deve carregar transcript inteiro.

Recupera somente:

- Observation ID;
- Reflection ID;
- source entries relevantes.

## 9.15.3 Resultado

A fonte recuperada continua histórica.

Para virar estado canônico:

```text
promote through MNFS
```

---

# 9.16 Memory Candidate Promotion Gateway

## 9.16.1 Problema

Uma descoberta útil pode nascer em:

- Session;
- Observation;
- Reflection;
- Investigation;
- Review;
- Finding;
- QA.

Ela não deve ficar perdida.

Também não deve virar verdade canônica automaticamente.

## 9.16.2 Fluxo

```text
Observation / Reflection / Source
        ↓
Memory Candidate
        ↓
source verification
        ↓
classification
        ↓
Authority check
        ↓
canonical target
        ↓
persist
```

## 9.16.3 Targets

- Decision;
- Repository Profile amendment;
- Standard candidate;
- Golden Path improvement;
- Defect Class;
- Review Learning;
- Evidence;
- gardening task.

## 9.16.4 Conceito de comando futuro

```text
mnfs memory propose
```

Inputs:

- source ID;
- exact source;
- proposed target;
- scope;
- rationale.

## 9.16.5 Regra

Session Memory Adapter não escreve diretamente em L0.

---

# 9.17 Session handoff

## 9.17.1 Handoff Pack

Contém:

```text
target
current state
contract
active Decisions
active Tracks
Claims
Findings
Evidence
divergences
next action
risks
```

## 9.17.2 Lead resume

### Mesma Session

Pode usar:

- Pi resume;
- OM;
- Current Authority Snapshot.

### Nova Session

Usa:

- Handoff Pack;
- Current Authority Snapshot;
- Approved Contract.

Não depende de OM.

## 9.17.3 Worker continuation

Novo Worker Run recebe:

- same Attempt ou new Attempt;
- current diff;
- current Pack;
- previous Claim;
- Correction;
- explicit next goal.

## 9.17.4 Deliberate rotation

Boas fronteiras:

- Planning complete;
- execution start;
- Milestone;
- independent Review;
- QA;
- Closeout.

---

# 9.18 Comunicação e mensagens

## 9.18.1 Mensagem não é memória

Mensagens entregam:

- wake-up;
- pointer;
- steering;
- notification.

Estado durável vive em L0.

## 9.18.2 Envelope

```ts
interface MnfsMessage {
  messageId: string;
  type: string;

  sender: ActorRef;
  recipient: ActorRef | RoleRef;
  target: EntityReference;

  attemptId?: AttemptId;
  artifactRefs: ArtifactRef[];
  correlationId: string;

  sentAt: string;
}
```

## 9.18.3 Semântica

```text
at-least-once notification
+
idempotent domain operation
+
durable Artifact
```

Mensagem pode:

- duplicar;
- falhar;
- chegar tarde.

## 9.18.4 Payload

Não trafegar:

- diff completo;
- transcript;
- plano inteiro;
- logs longos;
- Evidence Bundle.

Enviar Artifact refs.

---

# 9.19 `pi-link`

## 9.19.1 Capacidades

`pi-link` fornece:

- WebSocket local;
- terminais nomeados;
- direct chat;
- remote prompts;
- status;
- session-resume helpers.

## 9.19.2 Uso potencial

- despertar Reviewer;
- steering humano;
- enviar pointer para novo Claim;
- visualizar Actors em múltiplos terminais.

## 9.19.3 Limites arquiteturais

Não é source of truth.

Não substitui:

- SQLite;
- outbox;
- command state;
- Claim;
- Decision;
- process supervision.

## 9.19.4 Decisão

```text
DEFER
```

Pode entrar depois como:

```text
NotificationTransportAdapter
```

Fluxo futuro:

```text
durable command in MNFS
→ pi-link frame
→ Actor wakes
→ Actor reads command from MNFS
→ result persists in MNFS
```

## 9.19.5 M2

M2 não depende de `pi-link`.

---

# 9.20 M2 communication model

```text
Lead
→ process adapter starts Pi Worker with Dispatch Packet

Worker
→ MNFS CLI opens/completes Claim

Lead dies
→ Worker and worktree may continue

New Lead
→ SQLite + process/filesystem reconcile
```

Não é necessário:

- message bus;
- WebSocket network;
- shared OM;
- project memory plugin;
- SDK host.

---

# 9.21 Uma memória por concern

Não instalar simultaneamente, para a mesma Role:

```text
pi-observational-memory
+
pi-memory
+
pi-memctx
+
another compaction extension
```

Riscos:

- multiple context injections;
- conflitos de precedência;
- token bloat;
- hidden writes;
- compaction-hook collision;
- múltiplos background agents;
- debugging difícil;
- stale memory duplication.

Política:

```text
one Session Memory Adapter
+
one canonical MNFS memory system
+
exact recall
```

---

# 9.22 Skills, prompts e templates

## 9.22.1 Skills

Skills orientam:

- Role;
- fluxo;
- primeira ação;
- comandos;
- output;
- judgment rubric;
- escalation.

Não armazenam:

- current state;
- current IDs;
- current hash;
- active Findings;
- Lease;
- Claim.

## 9.22.2 Prompt fino

Prompt de dispatch contém:

```text
Role
Target
Current Authority Snapshot ref
Context Pack ref
Output Contract
Budget
Termination condition
Escalation
```

## 9.22.3 Templates

Templates ajudam consistência.

Schemas validam.

Templates não são autoridade.

---

# 9.23 Context Budget

## 9.23.1 Limites

Cada Role possui budget para:

- tokens;
- files;
- symbols;
- Artifacts;
- log size;
- examples;
- history depth;
- tool output.

## 9.23.2 Overflow

Quando exceder:

- dividir;
- indexar;
- carregar on demand;
- criar Investigation;
- produzir summary com source refs;
- gerar outro Pack.

Não truncar conteúdo decisivo silenciosamente.

## 9.23.3 Truncation marker

```text
truncated: true
omitted: ...
full_ref: ...
```

---

# 9.24 Token accounting

## 9.24.1 Unidade

Medir por:

- Mission;
- Milestone;
- Feature;
- Write Track;
- Attempt;
- Worker Run;
- Role;
- provider/model;
- phase.

## 9.24.2 Contadores

```text
actor input tokens
actor output tokens
observer tokens
reflector tokens
dropper tokens
cache reads/writes
estimated cost
duration
turns
tool calls
pack size
compaction count
telemetry coverage
evaluation cost
```

## 9.24.3 Coverage

```text
COMPLETE
PARTIAL
UNKNOWN
```

Somente cobertura completa calibra policy automaticamente.

## 9.24.4 Regra

Economia do Actor não é economia total quando Observer e Reflector consomem mais.

Medir o sistema completo.

---

# 9.25 Eficiência

## 9.25.1 Métricas úteis

- accepted work per total token;
- context loaded versus used;
- compactions per Mission;
- facts lost after compaction;
- exact recalls;
- false-memory rate;
- stale-memory conflicts;
- Correction rounds;
- repeated repository reads;
- time to resume;
- total cost of memory workers;
- latency saved at compaction.

## 9.25.2 Métricas perigosas

Não otimizar isoladamente:

- menor token count;
- maior compression ratio;
- maior Session lifetime;
- menos recalls;
- menos Context;
- menor cost por turn.

Isso pode causar perda de qualidade.

## 9.25.3 Objetivo

> Confiança suficiente com menor custo total de contexto, coordenação e retrabalho.

---

# 9.26 Architecture Spike AS-01

## 9.26.1 Objetivo

Comparar:

```text
A. Pi native compaction
B. pi-observational-memory V3
```

Não comparar vários plugins inicialmente.

## 9.26.2 Ambiente

- WSL2;
- Pi version pinned;
- `pi-observational-memory@3.0.3`;
- test repository;
- known memory model;
- cost tracking;
- debug logs during spike;
- package source reviewed.

## 9.26.3 Cenários

### S1 — Long Lead Session

Forçar múltiplas compactações e verificar:

- objetivo;
- rejected alternatives;
- Operator Decisions;
- blockers;
- next action.

### S2 — Source-backed recall

Recuperar fontes exatas de Observations e Reflections.

### S3 — Knowledge update

Decisão antiga é substituída.

Verificar latest state e history.

### S4 — False completion conflict

OM afirma complete.

SQLite afirma rejected.

SQLite precisa vencer.

### S5 — Contract change

Approved Contract muda.

Novo Snapshot precisa vencer memória antiga.

### S6 — Observer failure

Falhar credentials ou model.

Pi e MNFS continuam utilizáveis.

### S7 — Resume same Session

Fechar e retomar a mesma Session.

### S8 — Brand-new Lead Session

Recuperar somente com Handoff Pack e Snapshot.

### S9 — Role isolation

Writer e Reviewer não recebem Lead OM.

### S10 — Multiple compactions

Executar ao menos três ciclos.

### S11 — Upgrade/rollback

Documentar reset e incompatibilidade V2/V3.

### S12 — Cost and latency

Medir custo completo.

## 9.26.4 Acceptance Criteria

Aceitar somente quando:

1. nenhum critical false memory aparece no corpus;
2. Current Authority sempre vence;
3. source recall funciona;
4. três compactações preservam deciding facts;
5. falha da OM não altera Domain State;
6. nova Session recupera sem OM;
7. Reviewer e QA continuam isolados;
8. custo e latência são medidos;
9. benefício sobre native compaction é material;
10. instalação, upgrade, disable e rollback são documentados.

## 9.26.5 Removal Conditions

Desativar quando:

- false memory material;
- false completion;
- custo maior que benefício;
- falha bloqueia Actor;
- upgrade quebra frequentemente;
- source recall é inconsistente;
- manutenção é desproporcional.

---

# 9.27 Matriz de adoção

| Tool ou mecanismo | Decisão | Papel no MNFS |
|---|---|---|
| Pi JSONL Sessions | Adotar | histórico exato de Session |
| Pi native compaction | Manter | baseline e fallback |
| `pi-observational-memory@3.0.3` | Candidato | Lead Session Memory Adapter |
| Mastra OM package | Não incorporar | referência arquitetural |
| `pi-observational-memory-extension` | Adiar | alternativa de pesquisa |
| `pi-memory` | Não core | memória pessoal opcional |
| `@josephakern/pi-memory` | Reusar padrões | capped index e writeback |
| `pi-memctx` | Referência | retrieval e review queue |
| `pi-agenticoding` | Reusar princípios | handoff deliberado |
| `pi-link` | Adiar | transporte de notificação futuro |
| Pi SDK/RPC | Futuro | controle programático |
| MNFS SQLite | Adotar | coordenação durável |
| Git Artifacts | Adotar | memória canônica versionada |

---

# 9.28 Impacto no roadmap

## M2

Não depende de:

- Observational Memory;
- `pi-link`;
- generic Context Compiler;
- shared project memory;
- SDK host.

M2 usa:

- fixed Writer Pack;
- Dispatch Packet;
- child Pi process;
- CLI;
- SQLite;
- Claim;
- Recovery.

## Pós-M2

Executar AS-01 antes de tornar long-running Lead com OM o default.

## Antes de múltiplos Actors live

Definir durable command/outbox semantics.

Depois avaliar transport adapter.

## Antes de project-wide retrieval

Repository Profile, Context Index e Code Map precisam existir.

Só então comparar a abordagem própria com `pi-memctx`.

---

# 9.29 ADRs decorrentes

Após aprovação desta seção, criar:

## ADR-0004 — Memory strata and session observational memory

Decide:

- memória canônica em SQLite/Git;
- OM como supporting Session Memory;
- Snapshot possui precedência;
- Role isolation;
- plugin somente após spike.

## ADR-0005 — Durable coordination versus ephemeral transport

Decide:

- estado e comandos duráveis no MNFS;
- transporte apenas entrega ou desperta;
- M2 usa child process + CLI;
- `pi-link` adiado.

---

# 9.30 Non-goals

Não construir agora:

- memória universal;
- shared OM entre Roles;
- project-scoped OM;
- vector database;
- RAG obrigatório;
- transcript como state;
- automatic memory promotion;
- Mastra runtime dentro do MNFS;
- múltiplos memory plugins;
- message bus no M2;
- background memory agent por Worker;
- OM como Evidence;
- OM como gate;
- OM como completion authority;
- semantic search antes de Context Index;
- forever memory para trabalho transitório;
- reconstrução integral de transcript a cada restart.

---

# 9.31 Invariantes de contexto e memória

1. L0 é a memória canônica.
2. SQLite e Approved Contract vencem qualquer memória de Session.
3. Current Authority Snapshot precede OM.
4. OM é `SUPPORTING`, nunca `AUTHORITATIVE`.
5. Pi JSONL é histórico exato da Session.
6. História exata não é necessariamente estado atual.
7. Session nova recupera sem OM.
8. Role memory é isolada.
9. Lead OM não chega ao Reviewer.
10. Writer OM não chega ao QA.
11. Project-scoped OM não é adotada.
12. Memory Adapter não escreve Domain State.
13. Memory Candidate não é promovida automaticamente.
14. Completion recordada não é acceptance.
15. Recall é usado quando precisão material é necessária.
16. Mensagem não é memória.
17. Transporte pode falhar sem perder estado.
18. Context Pack continua obrigatório.
19. Pack stale não pode iniciar dispatch.
20. Skills não armazenam current state.
21. Prompt não é contrato.
22. Uma Role possui no máximo um Session Memory Adapter ativo.
23. Native compaction permanece fallback.
24. Plugin third-party é pinned e revisado.
25. Upgrade de memory format exige drill.
26. Observer cost entra no custo total.
27. Compression ratio não substitui correctness.
28. Reviewer inicial permanece cold.
29. M2 não depende de OM ou `pi-link`.
30. Tooling é adotado somente depois de spike com critérios e Removal Conditions.

---

# Decisão resumida da Seção 9

> **O MNFS separa memória canônica, contexto compilado, memória observacional, histórico exato da Pi Session e transporte efêmero. SQLite, Git e o Approved Contract permanecem soberanos. Pi JSONL é reutilizado como ledger exato da Session. `pi-observational-memory` V3 é o candidato mais forte para continuidade do Lead, mas entra somente após um Architecture Spike, com Current Authority Snapshot acima da memória, isolamento por Role e nenhuma autoridade sobre completion. Plugins de memória de repositório não serão adotados como fontes concorrentes; seus melhores padrões serão incorporados ao Repository Profile, Context Index e Memory Promotion Gateway. M2 continua simples, sem OM e sem message bus.**

---

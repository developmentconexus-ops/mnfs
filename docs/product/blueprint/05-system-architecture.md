---
id: DOC-PRODUCT-BLUEPRINT-05
title: Arquitetura do Sistema e Fronteiras dos Componentes
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
  - product blueprint section 5
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-07
tracking_issue: 6
---

## ARR-RECONCILIATION-2026-08-07 — Current system architecture

This reconciliation block has precedence over older realization-specific wording in this section. Any conflicting tool-specific statement below is historical realization context, not current constitutional authority.

The architecture is a Thin Sovereign Semantic Kernel with a **Replaceable Agent Runtime** and a property-based Execution Environment outside the semantic core.

```text
Operator / MNFS domain authority
        ↓
Planning + Context compilation
        ↓
Role / ActorRun boundary
        ↓
replaceable Agent Runtime
        ↓ controlled capability boundary
Execution Environment
  + isolated mutable workspace
  + compute/isolation properties
  + network/credential/resource policy
        ↓
provider-neutral Git result identity
        ↓
Verification / independent Validation / MNFS Gate
```

SQLite remains operational-state authority and Git remains code/result identity. Initial adapters stay concrete; this architecture does not authorize a generic runtime/environment/workspace provider framework without a second production consumer.

---

# 5. Arquitetura do Sistema e Fronteiras dos Componentes

## 5.1 Propósito

Esta seção define como o MNFS será organizado internamente e como seus componentes se relacionam.

O objetivo não é congelar prematuramente uma estrutura de pastas definitiva. É estabelecer fronteiras suficientes para que:

- o domínio não dependa do Pi, Lavish, Treehouse, Herdr ou de um provider específico;
- a CLI, a skill e uma futura interface web usem o mesmo comportamento;
- estado autoritativo não seja duplicado;
- adapters externos possam falhar ou ser substituídos sem alterar a semântica da Mission;
- o sistema permaneça simples no ambiente local;
- a evolução para múltiplos workers, ambientes remotos e cloud não exija reescrever contratos, entidades e gates;
- skills e prompts não se tornem novamente o lugar onde regras operacionais vivem;
- cada componente possua autoridade, input, output e failure behavior explícitos.

A arquitetura inicial é um **modular monolith TypeScript**, executado localmente no WSL2.

Não serão criados microserviços, daemon obrigatório, broker, workflow engine ou API web antes de existir uma necessidade operacional comprovada.

---

# 5.2 Visão arquitetural

```text
WINDOWS — apresentação
┌──────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│   └── Lavish review                                         │
│ Windows Terminal / editor conectado ao WSL                  │
└──────────────────────────────┬───────────────────────────────┘
                               │ localhost / terminal
WSL2 — execução                │
┌──────────────────────────────▼───────────────────────────────┐
│ Pi Lead                                                     │
│   ├── project skills                                        │
│   ├── futura MNFS Pi extension                              │
│   └── MNFS CLI / application services                       │
│                                                              │
│ MNFS Modular Monolith                                       │
│   ├── Domain Core                                           │
│   ├── Application Services                                  │
│   ├── Engineering System                                    │
│   ├── Policy / Gate Engine                                  │
│   ├── Persistence                                           │
│   ├── Artifact Management                                   │
│   └── External Adapters                                     │
│                                                              │
│ Local runtime                                               │
│   ├── SQLite                                                │
│   ├── generated artifacts                                   │
│   ├── logs                                                  │
│   └── process observations                                  │
│                                                              │
│ Worker execution                                            │
│   ├── Treehouse worktree WT-001 → Pi Worker WR-001          │
│   ├── Treehouse worktree WT-002 → Pi Worker WR-002          │
│   └── clean integration workspace                           │
│                                                              │
│ Optional projection                                         │
│   └── Herdr panes / workspaces                              │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
                         Git repository
                 code · commits · approved contracts
                    accepted evidence · documentation
```

---

# 5.3 Princípios arquiteturais

## 5.3.1 Modular monolith first

O MNFS começa como:

```text
um processo ou CLI
+
um package TypeScript
+
um banco SQLite
+
processos Pi separados para workers
```

Módulos internos possuem fronteiras claras, mas continuam no mesmo repositório, package e release.

Isso evita:

- contratos de rede prematuros;
- deploy distribuído;
- observabilidade de serviços;
- consistência entre bancos;
- versionamento de APIs internas;
- filas e retries infraestruturais;
- custo de operação sem benefício atual.

Separação física futura só ocorre quando uma fronteira possuir:

- carga independente;
- lifecycle independente;
- isolamento necessário;
- segundo consumidor remoto;
- necessidade de escala;
- razão de segurança;
- evidência de que a modularização lógica já não é suficiente.

## 5.3.2 Domínio inward, adapters outward

Dependências apontam para dentro:

```text
interfaces / adapters
        ↓
application services
        ↓
domain core
```

O Domain Core não importa:

- Pi SDK;
- comandos Treehouse;
- Lavish;
- Herdr;
- SQLite;
- Git CLI;
- process APIs específicas;
- browser automation;
- provider SDKs.

Essas ferramentas implementam portas definidas pelo MNFS.

## 5.3.3 Uma autoridade por conceito

Exemplos:

```text
Mission state          → SQLite / MNFS Core
Code tree              → Git
Approved contract      → SQLite + materialização versionada
Worktree physical      → Treehouse
Agent reasoning        → Pi
Visual feedback        → Lavish
Terminal presentation  → Herdr
```

Dois componentes podem observar o mesmo fenômeno.

Somente um é autoridade de domínio.

## 5.3.4 CLI e interfaces são finas

CLI, skill Pi, futura extensão e futura UI:

- coletam input;
- chamam application services;
- exibem output;
- não reimplementam regras;
- não escrevem SQLite diretamente;
- não decidem transições;
- não interpretam internals de adapters.

## 5.3.5 Processos são recursos, não domínio

Um processo Pi pode:

- iniciar;
- produzir output;
- ficar idle;
- morrer;
- ser retomado.

Esses fatos são convertidos em observações de `Worker Run`.

O processo não decide:

- Claim accepted;
- Feature closed;
- Milestone passed;
- Mission complete.

## 5.3.6 Artefatos grandes não trafegam em mensagens

Prompts, logs, diffs, plans, traces e evidence bundles vivem em arquivos ou registros referenciáveis.

Interfaces trocam:

```text
identity
status
hash
artifact reference
next action
```

## 5.3.7 Local-first sem local-only

O produto é desenhado para funcionar bem numa máquina e um operador.

As fronteiras preservam a possibilidade de substituir:

```text
SQLite       → PostgreSQL
child process→ remote worker runtime
filesystem   → object storage
CLI/TUI      → web API/client
local events → queue/event stream
```

Mas essas substituições não são implementadas antes da necessidade.

---

# 5.4 Camadas lógicas

## 5.4.1 Interface Layer

Entradas e apresentações para humanos e agentes.

Componentes:

- CLI;
- human-readable output;
- `--json` output;
- Pi project skills;
- futura Pi extension;
- Lavish HTML;
- futura web UI;
- optional Herdr projection.

Responsabilidades:

- validar sintaxe de input;
- converter input externo para commands;
- chamar use cases;
- renderizar responses;
- apresentar next action;
- nunca conter regra de domínio.

## 5.4.2 Application Layer

Coordena casos de uso.

Exemplos:

- initialize repository;
- open Mission;
- save Plan Revision;
- approve contract;
- prepare execution;
- grant Lease;
- dispatch worker;
- open Claim;
- run verification;
- accept Claim;
- reconcile runtime;
- integrate Tracks;
- close Milestone;
- close Mission.

Responsabilidades:

- carregar entidades;
- verificar preconditions;
- chamar Domain Policy;
- coordenar stores e adapters;
- definir transaction boundaries;
- emitir events;
- retornar resultados tipados.

## 5.4.3 Domain Layer

Contém semântica independente de infraestrutura.

Módulos conceituais:

- identity;
- mission;
- planning;
- criteria;
- execution;
- evidence;
- decisions;
- integration;
- QA;
- engineering standards;
- policy;
- transitions.

Responsabilidades:

- invariantes;
- state machines;
- value objects;
- applicability;
- acceptance rules;
- typed errors;
- policy decisions puras.

## 5.4.4 Engineering System Layer

Pode ser implementada inicialmente como módulos de domínio e aplicação, não como serviço separado.

Subcomponentes:

- Standards Registry;
- Golden Path Catalog;
- Repository Profile Resolver;
- Applicability Resolver;
- Policy Compiler;
- Fitness Function Registry;
- Waiver Service;
- Quality Posture Service.

## 5.4.5 Infrastructure Layer

Implementa portas externas.

- SQLite store;
- Git adapter;
- filesystem artifact store;
- process runner;
- Pi adapter;
- process sandbox adapter;
- execution environment adapter;
- credential provider adapter;
- network/egress adapter;
- external-effect adapter;
- OpenTelemetry adapter;
- observability backend adapter;
- evaluation backend adapter;
- notification adapter;
- Treehouse adapter;
- Lavish adapter;
- Herdr adapter;
- browser/QA adapter;
- future no-mistakes adapter.

---

# 5.5 Componentes do MNFS Core

## 5.5.1 Identity Module

Responsável por:

- `repo_id`;
- IDs hierárquicos;
- IDs operacionais;
- parsing;
- normalização;
- uniqueness;
- correlation IDs.

Tipos:

```text
RepositoryId
MissionId
MilestoneId
FeatureId
QualifiedFeatureId
AcceptanceCriterionId
WriteTrackId
AttemptId
WorkerRunId
ClaimId
ReceiptId
VerdictId
FindingId
DecisionId
IntegrationRunId
QaJourneyId
```

Identidades são value objects, não strings espalhadas.

## 5.5.2 Mission Module

Responsável por:

- Mission lifecycle;
- phases;
- attention;
- Mission Acceptance Criteria;
- close conditions;
- cancellation;
- replan binding.

## 5.5.3 Planning Module

Responsável por:

- Mission Plan Content;
- validation;
- dependencies;
- revisions;
- canonical hash;
- questions;
- approval;
- materialization contract.

M1 já implementa uma primeira versão.

## 5.5.4 Criteria Module

Responsável por:

- Criterion ownership;
- hierarchical identity;
- proof type;
- deciding/advisory;
- method of proof;
- applicability;
- evidence coverage;
- state.

## 5.5.5 Execution Module

Responsável por:

- Write Track;
- Lease semantic state;
- Attempt;
- Worker Run;
- dispatch binding;
- execution trust;
- claim lifecycle;
- correction reuse.

## 5.5.6 Evidence Module

Responsável por:

- Evidence Item;
- Receipt;
- Evidence Bundle;
- staleness;
- content hashes;
- provenance;
- coverage.

## 5.5.7 Review and Findings Module

Responsável por:

- Finding;
- severity;
- status;
- correction binding;
- reviewer authority;
- Verdict;
- adjudication.

## 5.5.8 Integration Module

Responsável por:

- Integration Run;
- accepted Tracks;
- candidate SHA;
- merge order;
- composition status;
- integration gate.

## 5.5.9 QA Module

Responsável por:

- QA Journey;
- persona;
- steps;
- observations;
- evidence;
- pass/fail/block;
- SHA binding.

## 5.5.10 Decision Module

Responsável por:

- Decision level;
- required authority;
- options;
- blockers;
- result;
- supersession.

## 5.5.11 Policy Module

Responsável por decisões puras como:

- qual lane;
- qual risco;
- quais gates;
- se transição é legal;
- se Waiver é válida;
- se Receipt está stale;
- se Feature pode fechar;
- se Track pode ser reutilizada;
- se replan é obrigatório.

Policy recebe fatos estruturados.

Não chama ferramentas externas.

---

# 5.6 Engineering System Components

## 5.6.1 Standards Registry

Fonte de Standards conhecidos pelo MNFS.

Responsabilidades:

- registrar versões;
- resolver status;
- validar IDs;
- localizar rationale;
- listar enforcement bindings;
- detectar Standard deprecated;
- expor applicability.

Primeira implementação pode ser:

```text
JSON ou TypeScript data
+
validator
```

Não requer banco ou DSL específico.

## 5.6.2 Golden Path Catalog

Catálogo versionado de rotas preferenciais.

Um Golden Path possui:

```text
id
version
applicability
planning questions
required standards
templates
scaffold actions
verification bindings
evidence requirements
safety-net questions
```

Pode ser armazenado inicialmente em arquivos versionados.

## 5.6.3 Repository Profile Resolver

Combina:

```text
MNFS Constitution
+
Capability Standards
+
Repository bindings
```

Produz uma visão efetiva do repositório.

Responsabilidades:

- carregar Profile;
- validar seções;
- resolver status;
- detectar bindings ausentes;
- impedir dependência silenciosa em `OPEN`;
- disponibilizar comandos e examples.

## 5.6.4 Applicability Resolver

Recebe:

- Feature;
- paths;
- domains;
- effects;
- contracts;
- resources;
- risk signals.

Produz:

- Standards aplicáveis;
- Golden Paths candidatos;
- checks;
- required evidence;
- safety-net requirements;
- review signals.

Versão inicial pode ser declarativa e conservadora.

## 5.6.5 Policy Compiler

Converte decisões de engenharia em um Execution Policy específico da Feature.

Exemplo:

```json
{
  "feature": "MIS-010/M02/F03",
  "goldenPath": "GP-API-ENDPOINT@1",
  "standards": [
    {"id": "API-001", "level": "MUST"},
    {"id": "SEC-003", "level": "MUST"},
    {"id": "OBS-001", "level": "SHOULD"}
  ],
  "checks": [
    "api-schema",
    "breaking-change",
    "boundaries",
    "provider-contract"
  ],
  "review": "MEDIUM",
  "liveQa": true
}
```

## 5.6.6 Fitness Function Runner

Executa checks registrados.

Responsabilidades:

- resolver comando;
- definir cwd;
- definir timeout;
- capturar output;
- produzir Receipt;
- mapear falha para Standard;
- emitir mensagem acionável;
- nunca reinterpretar exit code sem binding.

## 5.6.7 Waiver Service

Responsável por:

- criar;
- aprovar;
- validar;
- expirar;
- revogar;
- listar Waivers;
- verificar controles compensatórios;
- bloquear uso fora de escopo.

## 5.6.8 Quality Posture Service

Agrega Evidence e Findings por Standard e superfície.

Não usa confiança textual do modelo.

Produz:

- estado;
- evidence refs;
- unknowns;
- gaps;
- regressions;
- gardening candidates.

## 5.6.9 Current Authority Snapshot Service

Produz, a partir de SQLite, Git e do Approved Contract, uma visão curta e autoritativa do estado atual que precede qualquer memória observacional.

Inclui:

```text
target
current lifecycle
current Attempt
contract hash
blockers
active Decisions
permitted next actions
```

## 5.6.10 Session Memory Adapter

Porta opcional para memória auxiliar de uma Pi Session.

Pode fornecer Observations, Reflections, source-backed recall, custo e falhas.

Nunca pode alterar estado MNFS, aceitar Claims, fechar Features, modificar contratos ou promover memória automaticamente.

## 5.6.11 Memory Candidate Promotion Service

Recebe uma Observation, Reflection ou fonte exata e propõe sua promoção para um target canônico, como Decision, Repository Profile, Standard candidate, Golden Path improvement, Defect Class, Evidence ou gardening task.

Promoção exige validação e Authority apropriadas.

## 5.6.12 Documentation Manifest and Validator

Mantém o grafo documental do Repository:

- IDs;
- Authority classes;
- status;
- owners;
- relations;
- supersession;
- generated sources;
- review triggers.

Valida metadata, relations, aggregate freshness e Documentation Impact.

## 5.6.13 Product Blueprint Generator

Compõe as 13 Sections canônicas no aggregate `PRODUCT-BLUEPRINT.md`.

O aggregate é projection.

As Sections modulares são a fonte editável.

---

# 5.7 Application Services

## 5.7.1 Project Service

- initialize repository;
- validate identity;
- locate runtime;
- load Profile;
- doctor;
- bootstrap status.

## 5.7.2 Mission Service

- open;
- status;
- pause;
- cancel;
- close;
- aggregate progress.

## 5.7.3 Planning Service

- save revision;
- render;
- review;
- approve;
- materialize;
- initiate Replan.

## 5.7.4 Execution Preparation Service

- resolve actionable Feature;
- resolve standards;
- select Golden Path;
- create Write Tracks;
- create Context Pack;
- create Attempt;
- prepare dispatch.

## 5.7.5 Lease Service

- request;
- activate;
- inspect;
- release;
- reconcile;
- mark divergence.

## 5.7.6 Worker Service

- launch;
- observe;
- cancel;
- continue;
- mark lost;
- reconcile Worker Run.

## 5.7.7 Claim Service

- open;
- complete by worker;
- validate;
- begin verification;
- accept;
- reject;
- supersede.

## 5.7.8 Verification Service

- resolve criteria;
- run Fitness Functions;
- produce Receipts;
- determine deterministic result;
- route review.

## 5.7.9 Review Service

- prepare bounded packet;
- dispatch reviewer;
- persist Findings;
- reconcile Verdict;
- open Correction.

## 5.7.10 Integration Service

- queue Tracks;
- prepare clean workspace;
- compose;
- run checks;
- preserve sources;
- accept candidate.

## 5.7.11 QA Service

- resolve Journeys;
- prepare environment;
- execute;
- persist evidence;
- produce result.

## 5.7.12 Recovery Service

- inspect all authorities;
- compare expected and observed state;
- classify divergence;
- propose repair;
- apply approved repair.

## 5.7.13 Closeout Service

- verify hierarchical criteria;
- generate Evidence Bundle;
- update Quality Posture;
- record Waivers;
- produce Mission summary;
- close.

## 5.7.14 Operator Query Service

- Mission Control projections;
- attention inbox;
- next actions;
- hierarchical status;
- evidence summaries;
- Recovery and Security views.

## 5.7.15 Telemetry Service

- create operation traces;
- record metrics and logs;
- attach correlation IDs;
- enforce telemetry privacy;
- export through optional adapters.

## 5.7.16 Evaluation Service

- persist Evaluation Results;
- run deterministic, human or model-based evaluators;
- validate rubrics;
- track coverage.

## 5.7.17 Experiment Service

- run Golden Missions;
- compare candidates;
- record versions;
- segment results;
- produce Experiment Runs.

## 5.7.18 Calibration Service

- open Calibration Candidate;
- assemble Evidence;
- run shadow/canary;
- record Calibration Decision;
- rollback policy.

## 5.7.19 Notification Service

- create human Attention notifications;
- deduplicate by root cause;
- route to CLI, Lead or future channels;
- never act as inter-process coordination.

---

# 5.8 Persistência e armazenamento

## 5.8.1 Três classes de dados

```text
Repository-owned durable artifacts
Operational state
Generated/runtime artifacts
```

## 5.8.2 Repository-owned durable artifacts

Vivem no Git:

```text
.mnfs/
├── repo.json
├── missions/
│   └── MIS-002/
│       └── plan.json
├── accepted-evidence/
├── decisions/              # quando decisão precisa acompanhar o produto
└── closeouts/
```

Também vivem no Git:

```text
docs/
├── product/
├── adr/
├── design/
├── research/
├── tracking/
├── standards/
├── golden-paths/
└── repository-profile/
```

## 5.8.3 Operational state

Vive fora dos worktrees:

```text
~/.local/state/mnfs/repos/<repo-id>/
├── mnfs.db
├── artifacts/
├── logs/
├── prompts/
├── qa/
└── integration/
```

Pode ser sobrescrito por `MNFS_HOME`.

## 5.8.4 Generated artifacts

Exemplos:

- `review.html`;
- immutable plan snapshots;
- worker prompt files;
- stdout/stderr;
- command outputs;
- screenshots;
- browser traces;
- temporary evidence bundles;
- integration reports.

Nem todo artefato gerado é versionado.

## 5.8.5 Promotion

Um artefato operacional pode ser promovido para Git quando:

- é necessário para auditoria;
- prova aceite;
- explica decisão;
- precisa acompanhar a entrega;
- possui tamanho e formato adequados.

Promotion gera:

- content hash;
- provenance;
- target;
- stable path.

---

# 5.9 SQLite Architecture

## 5.9.1 Função

SQLite é o system of record operacional local.

Não é usado para armazenar todo o conteúdo binário.

## 5.9.2 Princípios

- migrations versionadas;
- foreign keys;
- transactions;
- uniqueness;
- idempotency;
- WAL quando adequado;
- typed repository methods;
- nenhum SQL em CLI ou skill;
- events e state na mesma transaction quando fazem parte do mesmo fato;
- adapters externos nunca escrevem diretamente.

## 5.9.3 Tabelas conceituais futuras

```text
repositories
missions
mission_plan_revisions
milestones
features
acceptance_criteria
write_tracks
leases
attempts
worker_runs
claims
receipts
verdicts
findings
decisions
corrections
integration_runs
qa_journeys
evidence_items
waivers
events
```

Isso é um mapa conceitual.

Não é autorização para criar todas as tabelas antecipadamente.

Cada migration entra com o Milestone que usa a entidade.

## 5.9.4 Transaction boundaries

Exemplos:

```text
Claim row
+
CLAIM_OPENED event
→ mesma transaction
```

```text
Verdict
+
Claim state update
+
VERDICT_RECORDED event
→ mesma transaction
```

Operações externas não participam da transaction SQLite.

Elas exigem intent, compensation e reconcile.

---

# 5.10 Event Architecture

## 5.10.1 Função

Events fornecem:

- auditoria;
- correlação;
- debugging;
- telemetria futura;
- explicação de transições;
- integração futura com UI.

## 5.10.2 Events não são command bus

O core não deve usar eventos internos para evitar chamadas normais entre módulos.

Application Service chama Domain e Store diretamente.

Event é registrado quando um fato relevante ocorreu.

## 5.10.3 Estrutura mínima

```text
event_id
type
entity_type
entity_id
actor
correlation_id
idempotency_key
payload
created_at
```

## 5.10.4 Event payload

Pequeno e estruturado.

Conteúdo grande é referenciado.

## 5.10.5 Futuro

Uma versão cloud pode publicar events depois do commit por outbox.

Não implementar broker local agora.

---

# 5.11 Artifact Architecture

## 5.11.1 Artifact Reference

O domínio referencia artefatos por identidade lógica:

```text
artifact_id
kind
content_hash
storage_ref
```

Evitar paths absolutos em contratos versionados.

## 5.11.2 Artifact Store Port

Conceitualmente:

```ts
interface ArtifactStore {
  put(input: PutArtifactInput): Promise<ArtifactRef>;
  get(ref: ArtifactRef): Promise<ArtifactContent>;
  exists(ref: ArtifactRef): Promise<boolean>;
  promote(ref: ArtifactRef, destination: PromotionTarget): Promise<ArtifactRef>;
}
```

Não criar interface genérica até existir o segundo backend.

No início, um módulo de filesystem com contratos claros é suficiente.

## 5.11.3 Imutabilidade

Artefato identificado por hash não pode mudar sob o mesmo ID.

`review.html` é exceção de projeção estável, não evidence immutable.

Snapshots `rev-N.html` continuam imutáveis.

---

# 5.12 CLI Architecture

## 5.12.1 Papel

A CLI é a API local principal do MNFS.

Usada por:

- operador;
- Pi skills;
- workers;
- scripts;
- testes;
- futura extensão;
- futura UI local.

## 5.12.2 Princípios AXI

Cada comando deve possuir:

- output humano compacto;
- `--json`;
- erro tipado;
- next action;
- empty state explícito;
- truncamento explícito;
- sem prompt interativo quando chamado por agente;
- argumentos longos via arquivo;
- exit codes estáveis.

## 5.12.3 Command families

Visão de produto:

```text
mnfs doctor
mnfs init
mnfs status

mnfs mission ...
mnfs plan ...
mnfs decide ...

mnfs profile ...
mnfs standards ...
mnfs golden-path ...

mnfs track ...
mnfs lease ...
mnfs worker ...
mnfs claim ...

mnfs verify ...
mnfs review ...
mnfs correct ...
mnfs integrate ...
mnfs qa ...
mnfs closeout ...
mnfs recover ...
```

Não implementar todos antecipadamente.

## 5.12.4 CLI command flow

```text
parse args
→ construct command
→ call application service
→ map result
→ render human or JSON
```

A CLI não:

- monta SQL;
- chama Treehouse diretamente;
- altera FSM;
- infere risk;
- lê transcript.

---

# 5.13 Pi Integration Architecture

Pi oferece quatro formas relevantes de integração:

- skills e prompt templates;
- TypeScript extensions;
- RPC mode;
- SDK.

A integração deve evoluir por necessidade, não por entusiasmo técnico. Pi permite que extensões TypeScript registrem tools e commands, observem lifecycle events e interajam com a UI; o SDK oferece sessões programáticas e o modo RPC oferece integração via processo e protocolo JSON. citeturn428383search0turn428383search1turn428383search4

## 5.13.1 Stage 1 — Project skills

Já usado em M1.

Skill orienta Pi a:

- chamar CLI;
- produzir Plan JSON;
- abrir Lavish;
- interpretar feedback.

Adequado quando:

- fluxo é conversacional;
- número de tools custom é pequeno;
- CLI já fornece o controle;
- nenhuma TUI própria é necessária.

## 5.13.2 Stage 2 — Pi worker process adapter

M2.

MNFS inicia Pi como processo separado dentro do worktree.

Adequado para:

- isolamento de contexto;
- lifecycle de worker;
- crash independente;
- logs;
- retries;
- múltiplos processos futuros.

## 5.13.3 Stage 3 — Project-local Pi extension

Entra quando pelo menos duas capabilities precisam de integração programática recorrente.

Pode registrar:

```text
/mnfs
/mnfs-status
/mnfs-resume
```

E tools como:

```text
mnfs_get_context
mnfs_open_claim
mnfs_request_decision
mnfs_report_completion
```

A extensão deve chamar a mesma Application Layer ou CLI.

Não deve criar um segundo state store.

Pi auto-descobre extensões project-local em `.pi/extensions/`, e elas podem registrar tools, commands e lifecycle handlers. citeturn428383search1

## 5.13.4 Stage 4 — SDK host

Entra quando houver um segundo cliente real:

- web app;
- desktop app;
- cloud control plane;
- remote worker host;
- automated pipeline.

SDK permite controlar sessões programaticamente e usar resource loaders, auth, model registry e session management. citeturn428383search0turn428383search7

## 5.13.5 Stage 5 — RPC

Adequado quando:

- host é outra linguagem;
- isolamento por processo é desejado;
- um cliente externo controla Pi;
- web/cloud não deve incorporar diretamente o package Node.

RPC possui protocolo de commands/events e suporte a requests de UI de extensions. citeturn428383search4

## 5.13.6 Regra

O MNFS Core não importa Pi.

O adapter Pi importa o Core ou chama a CLI.

---

# 5.14 Pi Worker Process Adapter

## 5.14.1 Porta conceitual

```ts
interface AgentRuntime {
  start(input: StartWorkerInput): Promise<WorkerProcessRef>;
  inspect(ref: WorkerProcessRef): Promise<WorkerObservation>;
  send(ref: WorkerProcessRef, message: WorkerMessage): Promise<void>;
  cancel(ref: WorkerProcessRef): Promise<void>;
}
```

A interface real deve nascer somente no microdesign de M2 e refletir o comportamento comprovado.

## 5.14.2 Spawn

Princípios:

- executable e args separados;
- `shell: false`;
- `cwd` igual ao worktree;
- prompt via arquivo ou stdin controlado;
- environment allowlist;
- logs em arquivo;
- timeout de boot;
- cancellation explícita;
- nenhuma interpolação de shell.

## 5.14.3 Worker contract

Worker recebe:

- identity;
- contract hash;
- worktree;
- expected base;
- write-set;
- Context Pack;
- command para Claim;
- escalation path.

## 5.14.4 Observações

Adapter pode registrar:

- process started;
- process exited;
- stdout/stderr refs;
- Pi events disponíveis;
- session ref;
- last observation.

Não interpreta texto livre como state transition.

## 5.14.5 Completion

Worker precisa chamar uma operação MNFS explícita.

Process exit sem Claim:

```text
Worker Run EXITED
Claim absent
→ Attempt incomplete
```

---

# 5.15 Treehouse Adapter

Treehouse administra um pool de worktrees reutilizáveis, possui leases duráveis que sobrevivem sem processos e oferece JSON para aquisição e status. Também oferece retorno condicionado por `lease_id`, útil para evitar liberar uma aquisição posterior do mesmo path. citeturn221202view0

## 5.15.1 Responsabilidade

- allocate;
- inspect;
- return;
- report external state.

## 5.15.2 Não responsabilidade

Treehouse não decide:

- Write Track identity;
- Feature ownership;
- acceptance;
- integration;
- cleanup policy de domínio;
- se trabalho pode ser abandonado.

## 5.15.3 Adapter output

```text
path
external_lease_id
lease_holder
leased_at
observed_status
processes
```

## 5.15.4 Fencing

Release automatizado deve usar:

- expected lease ID;
- expected holder;
- exact path.

Path sozinho não é identidade suficiente.

## 5.15.5 Hooks

Treehouse hooks podem preparar dependências.

MNFS não depende inicialmente deles para comportamento crítico, pois a ferramenta documenta que falhas de hooks não falham necessariamente a operação principal. citeturn221202view0

Bootstrap crítico precisa ser verificado pelo MNFS depois da aquisição.

---

# 5.16 Lavish Adapter

## 5.16.1 Papel

Lavish é a superfície visual de feedback.

MNFS continua responsável por:

- structured source;
- validation;
- revision;
- hash;
- approval;
- materialization.

## 5.16.2 Fluxo

```text
structured artifact
→ deterministic HTML
→ Lavish open
→ feedback
→ Pi reasoning
→ new structured artifact
```

## 5.16.3 Adapter

Operações estreitas:

```text
open
poll
end
```

## 5.16.4 Regras

- loopback only;
- HTML escaped;
- nenhuma mutação direta da source;
- feedback é input, não command autorizado;
- aprovação é revalidada no Core;
- stable review path pode coexistir com snapshots imutáveis.

## 5.16.5 Futuro

Uma UI própria pode substituir Lavish sem mudar o Planning Domain.

---

# 5.17 Herdr Adapter

Herdr fornece workspaces, tabs, panes, persistência de terminal e estado visual de agentes; também expõe CLI e socket API para controle e possui integração direta com Pi. citeturn823284search1turn823284search2turn823284search5

## 5.17.1 Papel

- apresentar workers;
- permitir observação;
- facilitar attach;
- mostrar status operacional;
- organizar terminais.

## 5.17.2 Não autoridade

```text
Herdr working
≠ Write Track ACTIVE autoritativa

Herdr done
≠ Claim ACCEPTED

pane missing
≠ Worker definitivamente LOST
```

Herdr é projection.

## 5.17.3 Optionality

O MNFS precisa funcionar sem Herdr.

Se ausente:

- workers continuam;
- logs continuam;
- status CLI continua;
- recovery continua;
- Claims continuam.

## 5.17.4 Integração

Pode entrar depois do worker funcional.

Adapter pode:

- create workspace;
- create pane;
- run command;
- label worker;
- inspect pane;
- attach;
- close presentation.

Não deve ser o processo supervisor autoritativo.

---

# 5.18 Git Adapter

## 5.18.1 Responsabilidade

- resolve repository;
- inspect HEAD;
- branch;
- status;
- diff;
- commit/tree hash;
- merge/rebase;
- changed files;
- ancestry;
- integration candidate;
- promotion of artifacts.

## 5.18.2 Git é autoridade sobre

- code;
- commits;
- tree identity;
- branch history;
- merge result.

## 5.18.3 Git não é autoridade sobre

- Mission state;
- Claim state;
- Verdict;
- process state;
- operator decision.

## 5.18.4 Safety

- comandos por args;
- fixed cwd;
- expected SHA;
- no force by default;
- destructive operations require authority;
- preserve unlanded work;
- integration uses clean workspace.

---

# 5.19 Verification Adapter Architecture

## 5.19.1 Command Runner

Executa comandos do Repository Profile.

Inputs:

```text
command_id
cwd
env
timeout
tree_hash
criterion_refs
```

Outputs:

```text
exit_code
stdout_ref
stderr_ref
duration
result
```

## 5.19.2 Structured Check Adapter

Para checks que produzem JSON ou formato conhecido.

## 5.19.3 Browser QA Adapter

Futuro.

Responsável por:

- start/attach environment;
- execute journey;
- capture screenshot/trace/network;
- return observations.

Não decide Mission.

## 5.19.4 External Provider Adapter

Quando live criteria exigirem API externa.

Precisa definir:

- sandbox;
- credentials;
- idempotency;
- allowed operations;
- cleanup;
- human checkpoint.

---

# 5.20 Repository Profile Architecture

## 5.20.1 Formato

Inicialmente pode ser Markdown com frontmatter ou JSON/YAML estruturado acompanhado de documentação humana.

Critérios de escolha:

- leitura humana;
- validação;
- diff;
- referências;
- estabilidade;
- facilidade de edição pelo Pi.

## 5.20.2 Separação recomendada

```text
docs/repository-profile/
├── PROFILE.md
├── commands.json
├── architecture.json
├── environments.json
├── standards.json
└── golden-path-bindings.json
```

Essa estrutura é conceitual.

O formato final será definido no Milestone correspondente.

## 5.20.3 Profile Resolver output

```text
effective commands
effective standards
effective golden paths
open sections
ratified assumptions
environment capabilities
human gates
```

## 5.20.4 Não duplicação

O Profile referencia Standards e Golden Paths.

Não copia seu texto inteiro.

---

# 5.21 Context Pack Architecture

## 5.21.1 Fonte

Context Pack é compilado de:

- Approved Contract;
- Feature;
- Criteria;
- Repository Profile;
- Standards;
- Golden Path;
- code map;
- decisions;
- active Waivers;
- base SHA.

## 5.21.2 Partes

```text
identity
objective
acceptance criteria
contracts
invariants
negative paths
write-set
read context
examples
engineering rules
verification plan
claim protocol
escalation protocol
hashes
```

## 5.21.3 Determinismo

Partes derivadas mecanicamente precisam ser hasháveis.

Partes produzidas por LLM precisam ser armazenadas como artifact versionado ou content-addressed.

## 5.21.4 Freshness

Pack é stale quando muda:

- contract hash;
- base SHA material;
- Profile binding;
- Standard version;
- Golden Path version;
- Decision relevante;
- write-set.

TTL pode ser advisory.

Conteúdo é autoridade de freshness.

---

# 5.22 Security e Trust Boundaries

## 5.22.1 Modelo local inicial

- um operador;
- uma máquina;
- WSL2;
- repositórios confiáveis;
- packages confiáveis;
- workers considerados falíveis, não maliciosos.

## 5.22.2 Pi e extensions

Pi extensions executam com permissões do processo e podem registrar tools que executam código; somente fontes confiáveis devem ser instaladas. citeturn428383search1turn428383search8

## 5.22.3 WSL2

WSL2 não é sandbox de segurança do MNFS.

Workers podem ter acesso às permissões do usuário.

## 5.22.4 Proteções iniciais

- worktree isolation;
- allowed cwd;
- protected paths;
- tool allowlists quando aplicável;
- no secrets in packs;
- environment allowlist;
- human checkpoint para destrutivo;
- no production write by default;
- safe process arguments;
- audit events.

## 5.22.5 Futuro

Multiuser/cloud exigirá:

- authentication;
- authorization;
- tenancy;
- secret isolation;
- network policy;
- container ou VM sandbox;
- resource limits;
- per-run credentials;
- artifact access control.

Não entra no local MVP.

---

# 5.23 Observabilidade

## 5.23.1 Operador

Precisa ver:

- Mission;
- phase;
- progress;
- active Tracks;
- Worker Runs;
- Claims;
- blockers;
- Decisions;
- divergences;
- next action.

## 5.23.2 Debug

Precisa correlacionar:

```text
Mission
→ Feature
→ Write Track
→ Attempt
→ Worker Run
→ Claim
→ Receipt
→ Verdict
```

## 5.23.3 Signals

- events;
- state tables;
- process observations;
- command durations;
- tokens quando disponíveis;
- adapter errors;
- artifact refs.

## 5.23.4 Logs

Logs não são apresentados integralmente por default.

Status mostra:

- resumo;
- tail relevante;
- artifact link;
- error code.

## 5.23.5 Telemetria futura

- tokens;
- latency;
- retries;
- false completion;
- finding precision;
- review rounds;
- worker utilization;
- Golden Path performance;
- gate false positives;
- Quality Posture change.

---

# 5.24 Failure Isolation

Cada adapter possui failure behavior nomeado.

## Pi failure

- Worker Run LOST/EXITED;
- Claim permanece;
- Lease permanece;
- recovery decide.

## Treehouse failure

- Lease REQUESTED/DIVERGED;
- nenhum novo worker;
- state preservado.

## Lavish failure

- plan revision permanece;
- feedback loop bloqueado;
- CLI pode continuar;
- nenhuma aprovação perdida.

## Herdr failure

- presentation unavailable;
- workers continuam.

## SQLite failure

- operação falha;
- nenhuma transição parcial;
- external side effect pode exigir reconcile.

## Git failure

- integration não avança;
- Tracks preservadas.

## Verification failure

- ERROR/BLOCK;
- não ACCEPT.

---

# 5.25 Local Process Topology

## 5.25.1 Lead

```text
Pi interactive session
+
MNFS skill/extension
+
MNFS CLI
```

## 5.25.2 MNFS commands

Podem rodar como subprocessos curtos.

SQLite coordena estado.

## 5.25.3 Workers

Processos Pi independentes.

Um processo por active Worker Run.

## 5.25.4 Integration

Comando/processo MNFS separado ou executado pelo Lead por application service.

## 5.25.5 QA

Processo separado quando browser ou ambiente live exigir.

## 5.25.6 Sem daemon obrigatório

Reconcile ocorre em:

- startup;
- status;
- antes de dispatch;
- antes de integration;
- ação explícita.

Watcher contínuo entra se a experiência exigir notificação automática.

---

# 5.26 Roadmap de Integração Pi

| Estágio | Capability | Razão |
|---|---|---|
| M1 | project skill | planning conversacional |
| M2 | worker subprocess | execução isolada |
| pós-M2 | project extension | tools/status quando houver repetição |
| futura UI | SDK host | controle programático no mesmo runtime |
| cloud/other language | RPC | process/language boundary |

Pi deliberadamente fornece modos interactive, print/JSON, RPC e SDK, permitindo essa evolução incremental. citeturn428383search3turn428383search0

---

# 5.27 Caminho para Cloud

## 5.27.1 O que permanece

- Domain Model;
- contracts;
- criteria;
- policies;
- Standards;
- Golden Paths;
- Claims;
- Receipts;
- Verdicts;
- Evidence Bundles;
- API semantics.

## 5.27.2 O que muda

| Local | Cloud |
|---|---|
| SQLite | PostgreSQL |
| local filesystem | object storage |
| child Pi process | remote worker runtime |
| Treehouse local | workspace provisioner |
| local credentials | scoped secret service |
| CLI | API + web client |
| local event table | outbox + queue/stream |
| one operator | users/teams/tenants |
| WSL2 | sandboxed compute |

## 5.27.3 Evolução segura

Cloud só começa depois de:

- local product flow comprovado;
- multiple Tracks;
- recovery;
- quality gates;
- clear authority boundaries;
- measured need.

---

# 5.28 Estrutura de código inicial recomendada

```text
src/
├── domain/
│   ├── identity/
│   ├── mission/
│   ├── planning/
│   ├── criteria/
│   ├── execution/
│   ├── evidence/
│   ├── review/
│   ├── integration/
│   ├── qa/
│   ├── decisions/
│   └── engineering/
│
├── application/
│   ├── project/
│   ├── mission/
│   ├── planning/
│   ├── execution/
│   ├── verification/
│   ├── integration/
│   ├── recovery/
│   └── closeout/
│
├── infrastructure/
│   ├── sqlite/
│   ├── filesystem/
│   ├── git/
│   ├── process/
│   ├── pi/
│   ├── sandbox/
│   ├── environments/
│   ├── credentials/
│   ├── effects/
│   ├── telemetry/
│   ├── evaluation/
│   ├── notifications/
│   ├── treehouse/
│   ├── lavish/
│   ├── herdr/
│   └── browser/
│
├── interfaces/
│   ├── cli/
│   └── pi-extension/
│
└── index.ts
```

## Regra YAGNI

Não criar todos esses diretórios vazios agora.

A estrutura representa boundaries.

Diretórios surgem quando o código correspondente existe.

---

# 5.29 Dependency Rules

```text
domain
→ não depende de application, infrastructure ou interfaces

application
→ depende de domain e ports

infrastructure
→ implementa ports; depende de domain types quando necessário

interfaces
→ dependem de application

adapters externos
→ nunca são importados pelo domain
```

Essas regras devem virar Fitness Functions quando a estrutura justificar.

---

# 5.30 Release e Versionamento

## MNFS Core

Semver.

## Engineering Standards

Versionados individualmente.

## Golden Paths

Versionados individualmente.

## Repository Profile

Versionado no Git.

## Mission Contract

Hash de conteúdo.

## Context Pack

Hash de inputs e output.

## Adapter compatibility

Versões e capabilities detectadas por `doctor`.

## Regra

Update do MNFS não pode reinterpretar silenciosamente:

- contrato aprovado;
- Claim existente;
- Verdict anterior;
- Standard version usada.

---

# 5.31 Non-goals arquiteturais

Não construir agora:

- microservices;
- daemon central;
- Redis;
- message broker;
- workflow engine;
- plugin marketplace próprio;
- cloud control plane;
- remote execution;
- generic adapter framework;
- dependency injection container;
- DSL de Standards;
- Graph database;
- universal knowledge base;
- custom terminal multiplexer;
- custom worktree manager;
- custom browser review server;
- abstraction para todo provider existente.

---

# 5.32 Invariantes arquiteturais

1. Domain Core não importa adapters externos.
2. CLI não contém regra de negócio.
3. Skills não alteram state diretamente.
4. Pi não é source of truth.
5. SQLite não armazena código.
6. Git não armazena state operacional transitório.
7. Herdr não decide lifecycle MNFS.
8. Treehouse não decide ownership.
9. Lavish não aprova por conta própria.
10. Process exit não fecha trabalho.
11. Adapter failure não corrompe Domain State.
12. Operação externa e DB são reconciliáveis.
13. Cada efeito externo possui identity e idempotency quando necessário.
14. Artefato decisivo possui hash.
15. Worker executa em cwd explicitamente validado.
16. Prompt grande via artifact, não inline shell.
17. Secrets não entram em Context Pack.
18. Interface humana e JSON usam o mesmo use case.
19. Local architecture permanece substituível sem abstração prematura.
20. Cloud não dita complexidade antes do local proof.

---

# Decisão resumida da Seção 5

> **O MNFS será inicialmente um modular monolith TypeScript executado no WSL2. Domain Core, Application Services e Engineering System definem a semântica; SQLite guarda estado operacional; Git guarda código e contratos aprovados; Pi executa raciocínio e workers; Treehouse fornece worktrees; Lavish apresenta revisão; Herdr projeta terminais opcionalmente. CLI, skills, extensions e futuras UIs permanecem clientes finos do mesmo core. As fronteiras são desenhadas hoje para permitir evolução a SDK/RPC e cloud, mas nenhuma infraestrutura distribuída será construída antes de o produto local completo provar sua necessidade.**

---

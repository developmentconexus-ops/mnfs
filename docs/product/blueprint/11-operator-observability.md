---
id: DOC-PRODUCT-BLUEPRINT-11
title: Experiência do Operador, Interfaces, Observabilidade e Calibração
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
  - product blueprint section 11
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-02
tracking_issue: 6
---

# 11. Experiência do Operador, Interfaces, Observabilidade e Calibração

## 11.1 Propósito

Esta seção define como o MNFS será compreendido, operado, observado e melhorado ao longo do tempo.

Ela responde a quatro perguntas diferentes:

1. **Como o Operator entende e controla uma Mission?**
2. **Como um engenheiro investiga o que ocorreu durante uma execução?**
3. **Como o sistema mede qualidade, custo, fluxo e confiabilidade?**
4. **Como evidências reais alteram modelos, prompts, gates, Golden Paths e policies?**

Essas perguntas não devem ser respondidas pelo mesmo mecanismo.

O MNFS separa quatro planos:

```text
Operator Control Plane
Operational Projection
Observability Plane
Evaluation and Calibration Plane
```

O objetivo é impedir que:

- terminal seja confundido com Mission Control;
- trace seja confundido com Domain State;
- dashboard seja confundido com Evidence;
- log seja confundido com Verdict;
- token count seja confundido com produtividade;
- status de Session seja confundido com Feature status;
- um único score tente representar qualidade, velocidade, custo e confiança;
- uma policy mude automaticamente por dados incompletos;
- o Operator precise acompanhar cada Worker;
- observabilidade capture secrets, código e prompts sem necessidade;
- uma futura UI crie uma segunda implementação das regras do domínio.

No MNFS:

> **A interface apresenta e solicita ações. O Core decide as transições. A telemetria explica o que aconteceu. A calibração decide o que deve mudar no sistema.**

---

# 11.2 Base de pesquisa

Esta seção foi construída a partir de conceitos e implementações de mercado, incluindo:

- Backstage Software Catalog, Software Templates, TechDocs, Notifications e Permissions;
- painel e logs de Sessions do GitHub Copilot coding agent;
- Herdr;
- FirstMate;
- OpenTelemetry e suas Semantic Conventions;
- OpenTelemetry GenAI conventions;
- Langfuse;
- Arize Phoenix e OpenInference;
- DORA 2025;
- DORA Core Model e delivery metrics;
- SPACE Framework.

O relatório detalhado está registrado em:

```text
MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1.md
```

## 11.2.1 Limite das referências

Essas ferramentas resolvem classes diferentes de problema.

- Backstage é developer portal;
- GitHub mostra agent Sessions;
- Herdr mostra processos e terminais;
- OpenTelemetry transporta telemetria;
- Phoenix e Langfuse armazenam traces, evaluations e experiments;
- DORA mede resultados de delivery e capacidades organizacionais;
- SPACE orienta produtividade multidimensional.

O MNFS não copiará uma ferramenta inteira para resolver todas as superfícies.

---

# 11.3 Os quatro planos

## 11.3.1 Operator Control Plane

É a superfície autoritativa para o Operator.

Fonte:

```text
MNFS Core
+
SQLite
+
Approved Artifacts
```

Mostra:

- Mission;
- Milestones;
- Features;
- Acceptance Criteria;
- Claims;
- Decisions;
- gates;
- Evidence;
- external effects;
- Recovery;
- next actions.

Executa:

- approval;
- Decision;
- pause;
- cancel;
- repair;
- Replan;
- Effect authorization;
- Closeout.

## 11.3.2 Operational Projection

Mostra o mundo operacional observado:

- processos;
- Sessions;
- terminals;
- logs;
- foreground commands;
- Treehouse worktrees;
- environments;
- liveness;
- resource use.

Fontes:

- process adapter;
- Pi lifecycle;
- Herdr;
- Treehouse;
- filesystem;
- sandbox.

É uma projeção.

Não decide lifecycle.

## 11.3.3 Observability Plane

Registra sinais técnicos:

- traces;
- spans;
- metrics;
- logs;
- errors;
- tokens;
- cost;
- latency;
- cache;
- tool use;
- memory events;
- sandbox denials.

Pode usar:

- OpenTelemetry;
- OTLP;
- Phoenix;
- Langfuse;
- outro backend futuro.

Não substitui Domain Events.

## 11.3.4 Evaluation and Calibration Plane

Compara qualidade e comportamento ao longo do tempo.

Inclui:

- datasets;
- Golden Missions;
- experiments;
- Evaluation Results;
- human annotations;
- user feedback;
- score distributions;
- Calibration Candidates;
- Calibration Decisions;
- rollout;
- rollback.

---

# 11.4 Princípios da experiência do Operator

## 11.4.1 One liaison

O Operator interage principalmente com o MNFS Lead.

A UI não cria um chat separado com cada Worker por default.

## 11.4.2 Mission-first

A navegação principal é:

```text
Mission
→ Milestone
→ Feature
→ Write Track
→ Attempt
→ Worker Run
```

Não:

```text
terminal
→ process
→ model call
```

Terminal e trace são detalhes sob demanda.

## 11.4.3 Attention-first

A primeira pergunta respondida pela interface é:

> O que precisa da minha atenção agora?

Não:

> Quantos processos estão executando?

## 11.4.4 Evidence-first

Uma conclusão mostra primeiro:

- outcome;
- criteria;
- Evidence;
- Verdict;
- risks;
- limitations.

Logs e transcript ficam abaixo.

## 11.4.5 Progressive disclosure

Default:

- resumo;
- progress;
- blocker;
- next action.

Detalhes:

- contract;
- diff;
- Receipt;
- trace;
- terminal;
- Artifact;
- exact source.

## 11.4.6 Next-action clarity

Toda tela acionável apresenta:

```text
recommended action
why
required authority
impact
alternatives
command or UI action
```

## 11.4.7 No false certainty

A interface diferencia:

```text
UNKNOWN
BLOCKED
FAILED
STALE
DIVERGED
DEGRADED
```

Não reduz tudo a “erro”.

## 11.4.8 Calm automation

O MNFS não interrompe o Operator para progresso normal.

Ele interrompe para:

- Decision;
- material risk;
- Recovery;
- Security;
- approval;
- external effect;
- budget exception;
- completion relevante.

---

# 11.5 Modelo de status

Um único campo `status` é insuficiente.

Cada aggregate relevante expõe:

```ts
interface AggregateStatus {
  lifecycle: string;
  phase: string;
  attention: AttentionState;
  health: HealthState;
  progress: ProgressSummary;
  blockers: BlockerRef[];
  nextAction?: NextAction;
}
```

## 11.5.1 Lifecycle

Exemplos:

```text
OPEN
CLOSED
CANCELLED
ABANDONED
```

## 11.5.2 Phase

Exemplos:

```text
INTAKE
PLANNING
APPROVED
EXECUTING
VERIFYING
CLOSING
```

## 11.5.3 Attention

```text
NONE
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
BUDGET_REQUIRED
DELIVERY_REQUIRED
```

## 11.5.4 Health

```text
HEALTHY
DEGRADED
UNKNOWN
DIVERGED
```

## 11.5.5 Progress

É derivado de:

- critérios;
- Work Tracks;
- Claims;
- gates;
- Integration;
- QA.

Nunca de percentual informado pelo modelo.

---

# 11.6 Operator Home — Mission Control

## 11.6.1 Objetivo

Fornecer visão rápida de todas as Missions relevantes sem exigir inspeção de Sessions.

## 11.6.2 Conteúdo

```text
Active Missions
Attention Inbox
Pending Decisions
Recovery Required
Security Required
Recently Closed Milestones
Active External Effects
Cost and Budget Snapshot
Next Recommended Actions
```

## 11.6.3 Mission card

Cada Mission mostra:

- ID e título;
- phase;
- attention;
- health;
- criteria progress;
- active Tracks;
- blocked entities;
- Decision count;
- cost range;
- last meaningful change;
- next action.

## 11.6.4 Ordenação

Prioridade:

1. Security Required;
2. Recovery Required;
3. Decision Required;
4. Blocked;
5. Review;
6. ordinary progress.

Não ordenar apenas por data de criação.

## 11.6.5 Quiet state

Quando nada exige ação:

```text
No operator action required.
3 Missions progressing autonomously.
```

---

# 11.7 Mission Workspace

## 11.7.1 Header

- Mission ID;
- goal;
- Approved Contract hash;
- lifecycle;
- phase;
- attention;
- health;
- Operator;
- created/updated;
- policy version.

## 11.7.2 Hierarchy

```text
Mission Acceptance Criteria
Milestones
Milestone Criteria
Features
Feature Criteria
Write Tracks
```

## 11.7.3 Views

### Outcome

O que a Mission precisa entregar.

### Plan

Decomposição e DAG.

### Execution

Tracks, Attempts e Workers.

### Quality

Criteria, Claims, Receipts e Verdicts.

### Decisions

Decisions e accepted risks.

### Evidence

Bundles e Artifacts.

### Timeline

Domain Events.

### Observability

Traces e metrics.

### Closeout

Delivered behavior, risks e limitations.

## 11.7.4 Dependency graph

Mostra:

- Milestone dependencies;
- Feature dependencies;
- blockers;
- critical path;
- parallelizable Tracks.

Graph é projeção do contract.

Não pode alterar dependencies diretamente.

---

# 11.8 Plan Review Surface

## 11.8.1 Atual

```text
Plan JSON
→ deterministic HTML
→ Lavish
```

## 11.8.2 Necessidades

- Mission/Milestone/Feature hierarchy;
- criteria at every level;
- dependency graph;
- scope;
- assumptions;
- risks;
- questions;
- Standards;
- Golden Paths;
- Security Environment;
- proof plan;
- version diff;
- exact hash;
- approval action.

## 11.8.3 Feedback

Feedback é convertido em:

- Plan Revision;
- Decision;
- Question answer;
- Replan request.

Não muta o Approved Contract diretamente.

## 11.8.4 Futuro

O Web Console pode incorporar a experiência.

Lavish permanece substituível.

---

# 11.9 Decision Inbox

## 11.9.1 Objetivo

Concentrar somente decisões que exigem Authority humana ou do Lead.

## 11.9.2 Agrupamento

Por:

- Mission;
- Decision level;
- risk;
- age;
- blocked entities;
- deadline;
- required authority.

## 11.9.3 Decision card

Apresenta:

```text
question
why now
options
recommendation
impact
risk
blocked scope
default action
evidence
```

## 11.9.4 Batch decision

Permitida somente quando:

- mesma policy;
- mesmas consequências;
- targets independentes;
- Authority adequada.

Não agrupar decisões materialmente diferentes apenas para reduzir cliques.

## 11.9.5 Decision history

Mostra:

- prior options;
- final choice;
- rationale;
- supersession;
- affected packs;
- rollout result.

---

# 11.10 Execution View

## 11.10.1 Objetivo

Mostrar execução sem obrigar o Operator a administrar processos.

## 11.10.2 Write Track row

- Track ID;
- Feature refs;
- lifecycle;
- trust;
- Lease;
- Environment;
- current Attempt;
- Worker;
- Claim;
- duration;
- context pressure;
- token/cost;
- blocker;
- next action.

## 11.10.3 Worker detail

- Role;
- provider/model;
- Session ref;
- process observation;
- Context Pack;
- contract hash;
- policy hash;
- logs;
- tool calls;
- Security Violations;
- Attempts;
- Claims.

## 11.10.4 Herdr

Quando instalado:

```text
Attach terminal
```

é uma ação opcional.

A interface precisa declarar:

```text
Herdr status is operational projection.
MNFS state remains authoritative.
```

## 11.10.5 Raw terminal

Usado para:

- debugging;
- manual intervention;
- visual inspection;
- command-level details.

Não é a UX primária de Mission Control.

---

# 11.11 Quality and Evidence View

## 11.11.1 Criterion matrix

| Criterion | Level | Proof Type | State | Freshness | Evidence | Authority |
|---|---|---|---|---|---|---|

## 11.11.2 Claim chain

```text
Attempt
→ Claim
→ Receipts
→ Findings
→ Correction
→ Verdict
```

## 11.11.3 Staleness

Evidence stale permanece visível, com:

- invalidating change;
- old target;
- required re-verification.

## 11.11.4 Evidence detail

Mostra:

- provenance;
- content hash;
- producer;
- environment;
- target SHA;
- criterion;
- trust classification;
- Artifact ref.

## 11.11.5 Parent closure

UI explica por que o pai ainda não fechou.

Exemplo:

```text
All 4 Features are closed.
Milestone remains OPEN because:
- M01/AC-02 integration recovery is pending.
```

---

# 11.12 Recovery Center

## 11.12.1 Objetivo

Transformar divergência em ação compreensível.

## 11.12.2 Divergence card

- code;
- expected;
- observed;
- affected entities;
- severity;
- data loss risk;
- safe actions;
- recommended action;
- required Authority.

## 11.12.3 Repair

Default:

```text
dry run
```

Depois:

```text
apply
```

## 11.12.4 Historical repairs

Mostra:

- prior divergence;
- action;
- result;
- actor;
- Evidence;
- recurrence.

## 11.12.5 Recovery health

Não usar “self-healed” como garantia genérica.

Mostrar:

```text
reconciled
partially reconciled
blocked
unknown
```

---

# 11.13 Security and External Effects View

## 11.13.1 Security

Mostra:

- Environment;
- policy hash;
- violations;
- blocked access;
- Credential Grants;
- expiry;
- sensitive Artifact alerts.

## 11.13.2 External Effects

Mostra:

- Effect Request;
- class;
- destination;
- required Authority;
- Credential Grant;
- execution;
- Receipt;
- Reconcile.

## 11.13.3 Production

Production actions recebem visual e wording distintos.

Nunca aparecem como ordinary tool call.

---

# 11.14 Engineering System View

## 11.14.1 Repository Profile

- capabilities;
- commands;
- Environments;
- external systems;
- open sections;
- assumptions;
- ownership.

## 11.14.2 Standards

- ID;
- level;
- status;
- applicability;
- enforcement;
- Evidence;
- false positives;
- version.

## 11.14.3 Golden Paths

- applicability;
- steps;
- templates;
- checks;
- adoption;
- success/failure;
- gaps.

## 11.14.4 Quality Posture

```text
VERIFIED
PARTIAL
MISSING
NOT_APPLICABLE
UNKNOWN
```

Por:

- domain;
- module;
- Standard;
- Repository;
- time.

## 11.14.5 Waivers

- active;
- expired;
- scope;
- compensating controls;
- removal condition.

---

# 11.15 Interface strategy

## 11.15.1 CLI

A CLI permanece:

- canonical local control surface;
- agent-facing API;
- scriptable contract;
- Recovery interface;
- JSON interface.

Toda futura UI usa os mesmos Application Services.

## 11.15.2 Human output

Compacto, legível e orientado a ação.

## 11.15.3 JSON output

Estável, tipado e versionável.

## 11.15.4 Lavish

Usado para structured review.

Não é Domain Store.

## 11.15.5 Herdr

Usado para operational projection.

Não é process/domain authority.

## 11.15.6 Future Web Console

Só entra quando:

- Domain contracts estabilizaram;
- CLI JSON estabilizou;
- multiple surfaces justificam;
- local end-to-end flow foi provado.

Arquitetura:

```text
Application Services
→ local API
→ web client
```

Não duplicar rules no frontend.

---

# 11.16 Future developer portal

Quando o MNFS operar múltiplos repositories e teams, será necessário descobrir:

- ownership;
- components;
- APIs;
- documentation;
- Golden Paths;
- Quality Posture;
- active Missions;
- support channels.

Backstage é uma opção futura porque combina:

- catalog;
- templates;
- docs;
- plugins;
- notifications;
- permissions.

Possibilidades:

```text
MNFS as Backstage plugin
MNFS links from Catalog entities
MNFS Golden Paths as template source
MNFS Quality Posture cards
MNFS docs through TechDocs
```

Não adotar antes de multi-repository need.

---

# 11.17 Notifications

## 11.17.1 Notification versus message

Notification é humana.

Message é Actor transport.

Nenhum dos dois é Domain State.

## 11.17.2 Triggers

- Decision required;
- Approval required;
- Mission blocked;
- Recovery required;
- Security Required;
- external effect unknown;
- budget exceeded;
- Milestone closed;
- Mission closed;
- delivery result.

## 11.17.3 Deduplication

Chave:

```text
target
attention class
root cause
```

## 11.17.4 Noise control

- agrupar sintomas;
- notificar somente ação material;
- não enviar ordinary progress;
- preservar audit;
- mostrar next action.

## 11.17.5 Channels

Inicial:

- CLI;
- Pi Lead;
- terminal notification.

Futuro:

- web inbox;
- Herdr notification;
- Backstage notification;
- email;
- Slack.

---

# 11.18 Domain Events e telemetria

## 11.18.1 Domain Event

Representa fato durável.

```text
PLAN_APPROVED
CLAIM_ACCEPTED
MISSION_CLOSED
```

Propriedades:

- persistido;
- authority-bearing;
- auditable;
- stable schema.

## 11.18.2 Telemetry signal

Representa observação técnica.

```text
model latency
command duration
tool error
token usage
sandbox denial
```

Propriedades:

- high volume;
- retention-controlled;
- exportable;
- optional backend.

## 11.18.3 Regra

Perda do exporter não remove o Domain Event.

Telemetry não altera state.

## 11.18.4 Projection

Um Domain Event pode gerar:

- OTel event;
- span attribute;
- metric increment.

Essa projeção é eventual e idempotente quando possível.

---

# 11.19 OpenTelemetry architecture

## 11.19.1 Decisão

Adotar OpenTelemetry como:

- instrumentation API;
- trace/metric/log model;
- OTLP export protocol;
- backend-neutral integration.

## 11.19.2 Não adotar como domínio

OTel não define:

- Mission lifecycle;
- Claim acceptance;
- criteria;
- Authority;
- gates.

## 11.19.3 SDK e exporter

Primeira arquitetura:

```text
MNFS instrumentation
→ OTel SDK
→ optional OTLP exporter
→ Phoenix / Langfuse / Collector
```

Sem exporter:

- local execution funciona;
- counters essenciais podem continuar no MNFS.

## 11.19.4 Sampling

Domain Events:

```text
never sampled away
```

Telemetry:

- errors and security may be always-on;
- successful high-volume spans may be sampled later;
- local MVP records bounded execution spans.

## 11.19.5 Resource attributes

```text
service.name = mnfs
service.version
deployment.environment
host/runtime identity
repository ID when policy permits
```

---

# 11.20 Trace model

## 11.20.1 Não usar uma Mission inteira como um span

Mission pode durar horas ou dias.

Um span não deve ficar aberto por todo o lifecycle.

## 11.20.2 Operation trace

Criar um trace por operação bounded:

- Plan Revision generation;
- worker execution;
- verification;
- review;
- integration;
- QA Journey;
- Recovery repair;
- external effect.

## 11.20.3 Correlation

Todos carregam MNFS IDs.

```text
mnfs.repository.id
mnfs.mission.id
mnfs.milestone.id
mnfs.feature.id
mnfs.write_track.id
mnfs.attempt.id
mnfs.worker_run.id
mnfs.claim.id
mnfs.role
mnfs.contract.hash
mnfs.policy.hash
mnfs.context_pack.hash
```

## 11.20.4 Exemplo de trace

```text
mnfs.worker.run
├── mnfs.authority_snapshot.load
├── mnfs.context_pack.load
├── gen_ai.invoke_agent
│   ├── gen_ai.chat
│   ├── gen_ai.execute_tool
│   └── gen_ai.execute_tool
├── mnfs.claim.open
└── mnfs.worker.complete
```

## 11.20.5 Span links

Usar links para relacionar:

- Review com Worker Run;
- Correction com Finding;
- Integration com várias Tracks;
- new Worker Run com Attempt anterior;
- Closeout com Milestone bundles.

## 11.20.6 Trace ID não é Domain ID

Trace ID é técnico e temporário.

Mission ID é estável.

---

# 11.21 Semantic conventions

## 11.21.1 Namespace MNFS

MNFS mantém um namespace interno estável:

```text
mnfs.*
```

## 11.21.2 Standards externos

Mapear quando aplicável:

- standard errors;
- HTTP;
- database;
- messaging;
- CI/CD;
- GenAI;
- service/resource.

## 11.21.3 GenAI conventions

Campos úteis:

- agent;
- workflow;
- conversation;
- provider;
- model;
- operation;
- tool;
- tokens;
- cache.

As convenções ainda evoluem.

## 11.21.4 Mapping version

Registrar:

```text
mnfs.telemetry.mapping.version
```

Mudança de convenção externa não causa migration de Domain State.

## 11.21.5 OpenInference

Pode ser usado por Phoenix.

É mapping de backend, não modelo canônico.

---

# 11.22 Telemetria de LLMs e agentes

## 11.22.1 Identity

- Role;
- model;
- provider;
- effort;
- Worker Run;
- Session ref;
- prompt/Role Contract version;
- Context Pack hash.

## 11.22.2 Tokens

- input;
- output;
- reasoning;
- cache read;
- cache creation;
- Observer;
- Reflector;
- Dropper.

## 11.22.3 Timing

- queue;
- first token;
- total generation;
- tool wait;
- total Worker Run;
- compaction;
- memory work.

## 11.22.4 Tool calls

- tool ID;
- arguments classification;
- duration;
- result class;
- error;
- Effect class;
- sandbox result.

## 11.22.5 Context

- Pack size;
- file count;
- Artifact count;
- truncation;
- stale event;
- exact recalls;
- Session compactions.

## 11.22.6 Output content

Não capturar raw content por default.

Capturar:

- hash;
- size;
- type;
- Artifact ref;
- result classification.

---

# 11.23 Privacy e security da telemetria

## 11.23.1 Default capture

- IDs;
- hashes;
- timestamps;
- durations;
- state/result classes;
- model/provider;
- token counters;
- tool IDs;
- error types;
- versions;
- Artifact refs.

## 11.23.2 Default exclusion

- raw prompts;
- system instructions;
- model outputs;
- code;
- diff;
- credentials;
- customer data;
- secret-bearing logs.

## 11.23.3 Scoped content mode

Pode ser ativado para:

- test fixture;
- Architecture Spike;
- isolated debugging;
- curated evaluation.

Exige:

- policy;
- redaction;
- retention;
- access;
- consent/awareness.

## 11.23.4 Backend boundary

OTLP exporter recebe somente conteúdo permitido.

Não enviar tudo e confiar apenas no backend para redaction.

## 11.23.5 Retention

Definir por signal:

- Domain Events;
- traces;
- logs;
- evaluation data;
- raw debugging content;
- security evidence.

---

# 11.24 Backends candidatos

## 11.24.1 Phoenix

Pontos fortes:

- open-source;
- local/self-hosted;
- OTLP collector;
- trace UI;
- OpenInference;
- datasets;
- experiments;
- human/code/LLM evaluation;
- agent trajectory support.

Classificação:

```text
PRIMARY LOCAL CANDIDATE
```

## 11.24.2 Langfuse

Pontos fortes:

- traces;
- Sessions;
- observations;
- scores;
- score configs;
- annotation queues;
- code evaluators;
- LLM judges;
- datasets;
- experiments;
- dashboards;
- APIs;
- OTLP;
- self-host/cloud.

Classificação:

```text
PRIMARY FULL-LIFECYCLE CANDIDATE
```

## 11.24.3 Decisão

Não escolher somente por feature checklist.

Executar AS-03.

## 11.24.4 Abstraction

Adotar OTLP antes de um backend-specific SDK para core telemetry.

Backend SDK específico pode ser usado apenas para capability não disponível por OTLP, atrás de adapter.

---

# 11.25 Evaluation Result

## 11.25.1 Definição

Registra uma avaliação de qualidade ou comportamento.

```ts
interface EvaluationResult {
  id: EvaluationResultId;

  target:
    | TraceRef
    | SpanRef
    | WorkerRunId
    | ClaimId
    | MissionId
    | ExperimentRunId;

  evaluator:
    | 'DETERMINISTIC'
    | 'HUMAN'
    | 'LLM_JUDGE'
    | 'USER_FEEDBACK';

  rubricId: string;
  rubricVersion: number;

  value:
    | number
    | boolean
    | string;

  valueType:
    | 'NUMERIC'
    | 'BOOLEAN'
    | 'CATEGORICAL'
    | 'TEXT';

  evidenceRefs: ArtifactRef[];
  modelBinding?: string;

  coverage:
    | 'COMPLETE'
    | 'PARTIAL'
    | 'UNKNOWN';

  createdAt: string;
}
```

## 11.25.2 Não é Verdict

Evaluation Result pode informar:

- experiment;
- Calibration;
- Quality Posture;
- investigation.

Não fecha Domain Entity automaticamente.

## 11.25.3 Score schema

Rubrics e categories são versionadas.

Evitar score sem significado operacional.

---

# 11.26 Evaluation methods

## 11.26.1 Deterministic

Usar para:

- exact match;
- schema;
- JSON;
- state;
- timeout;
- counts;
- rule conformance.

## 11.26.2 Human

Usar para:

- Operator trust;
- UX;
- architecture;
- usefulness;
- nuanced correctness;
- ground truth.

## 11.26.3 LLM Judge

Usar para:

- scalable rubric;
- semantic classification;
- qualitative dimensions.

Precisa de:

- judge model/version;
- rubric;
- sample calibration;
- human agreement checks;
- cost;
- bias monitoring.

Não é autoridade única para high-risk gates.

## 11.26.4 User feedback

Usar como signal.

Não confundir satisfação momentânea com correctness.

## 11.26.5 Multiple evaluators

Compare agreement quando uma policy depende da avaliação.

---

# 11.27 Golden Missions Dataset

## 11.27.1 Definição

Coleção canônica de cenários para avaliar o MNFS.

## 11.27.2 Categorias

```text
PLANNING
IMPLEMENTATION
REVIEW
INTEGRATION
RECOVERY
MEMORY
SECURITY
QA
EXTERNAL_EFFECT
CLOSEOUT
```

## 11.27.3 Dataset Item

```ts
interface GoldenMissionCase {
  id: string;
  category: string;
  repositoryFixtureRef: string;
  input: ArtifactRef;
  expectedDomainOutcomes: string[];
  prohibitedOutcomes: string[];
  requiredEvidence: string[];
  risk: string;
  sensitivity: string;
  source: string;
  version: number;
}
```

## 11.27.4 Fontes

- accepted Missions;
- escaped defects;
- false completion;
- Findings;
- Recovery drills;
- Security drills;
- Operator feedback;
- adapter failures;
- Replans.

## 11.27.5 Curadoria

Real trace vira candidate.

Antes de entrar:

- redact;
- normalize;
- classify;
- define expected;
- human review;
- version.

---

# 11.28 Experiments

## 11.28.1 Objetivo

Comparar mudanças usando os mesmos cenários.

## 11.28.2 Variables

- model;
- provider;
- effort;
- Role Contract;
- prompt;
- memory adapter;
- Context strategy;
- Golden Path;
- gate policy;
- Review policy;
- sandbox;
- timeout;
- parallelism.

## 11.28.3 Fixed inputs

Mesmo:

- dataset;
- fixture;
- expected outcome;
- policy scope;
- evaluation rubric.

## 11.28.4 Outputs

- deterministic outcomes;
- Evaluation Results;
- false completion;
- defects;
- cost;
- latency;
- retry;
- context size;
- human rating;
- Coverage.

## 11.28.5 Reproducibility

Registrar:

- MNFS version;
- policy version;
- model/provider;
- package versions;
- fixture SHA;
- Environment;
- dataset version;
- evaluator versions.

## 11.28.6 Segmentation

Comparar por:

- Role;
- risk;
- task class;
- Repository;
- language;
- context size;
- environment.

Média global pode esconder regressão crítica.

---

# 11.29 Online e offline evaluation loop

```text
live Mission
→ trace / Evidence / feedback
→ Dataset Candidate
→ curated Dataset Item
→ offline Experiment
→ Calibration Candidate
→ shadow
→ canary
→ Calibration Decision
→ rollout or rollback
```

## 11.29.1 Offline

Antes de:

- model change;
- prompt change;
- policy change;
- memory change;
- Golden Path change;
- gate change.

## 11.29.2 Online

Monitora:

- regressions;
- drift;
- cost;
- unexpected classes;
- real usage.

## 11.29.3 Shadow

Candidate policy produz decisão hipotética.

Não controla execução.

## 11.29.4 Canary

Controla subset low-risk.

## 11.29.5 Full

Somente após acceptance criteria.

---

# 11.30 Calibration

## 11.30.1 Definition

Calibration altera bindings e policies usando Evidence.

Targets:

- model routing;
- effort;
- Context budget;
- memory;
- gates;
- Review;
- Golden Path;
- timeout;
- retry;
- parallelism;
- Environment.

## 11.30.2 Calibration Candidate

Origem:

- experiment;
- repeated Finding;
- cost anomaly;
- failure;
- Operator feedback;
- posture gap;
- security signal.

## 11.30.3 Calibration Decision

```ts
interface CalibrationDecision {
  id: CalibrationDecisionId;

  targetPolicy: string;
  currentVersion: string;
  candidateVersion: string;

  evidenceRefs: ArtifactRef[];
  datasetRefs: string[];
  experimentRefs: string[];

  expectedBenefit: string;
  risks: string[];
  segments: string[];

  rollout:
    | 'SHADOW'
    | 'CANARY'
    | 'FULL';

  rollbackConditions: string[];
  requiredAuthority: ActorRole;

  result:
    | 'PROPOSED'
    | 'APPROVED'
    | 'REJECTED'
    | 'ROLLED_BACK';
}
```

## 11.30.4 No self-tuning initially

Policy não é reescrita automaticamente a partir de dashboards.

Mudança exige:

- Evidence;
- coverage;
- segmentation;
- Decision;
- version;
- rollback.

## 11.30.5 Future bounded automation

Somente para low-risk parameter e com:

- complete coverage;
- fixed bounds;
- canary;
- automatic rollback;
- audit.

---

# 11.31 Measurement strategy

## 11.31.1 Why before metric

Toda métrica declara:

```text
decision it informs
owner
collection method
coverage
failure modes
action thresholds
```

Sem decisão associada, não coletar por default.

## 11.31.2 Não criar score universal

Qualidade, custo, velocidade e experiência possuem trade-offs.

Um número único esconderia esses trade-offs.

---

# 11.32 Dimensões de métricas

## 11.32.1 Outcome and Quality

- criteria satisfaction;
- false completion rate;
- escaped defects;
- reopened Features;
- accepted risks;
- user outcome;
- integration failures;
- QA failure.

## 11.32.2 Flow and Reliability

- Mission lead time;
- active time;
- waiting time;
- Decision wait;
- queue time;
- Recovery time;
- divergence rate;
- Effect unknown rate;
- delivery recovery.

## 11.32.3 Efficiency and Cost

- total tokens;
- provider cost;
- memory-worker cost;
- command runtime;
- human intervention;
- rework;
- unused context;
- repeated reads;
- idle time.

## 11.32.4 Operator and Developer Experience

- interruption count;
- Decision clarity;
- manual interventions;
- time to understand status;
- perceived trust;
- satisfaction;
- cognitive load;
- collaboration impact.

## 11.32.5 Engineering Health

- Standard coverage;
- Quality Posture;
- Waiver age;
- Golden Path adoption;
- gardening debt;
- documentation health;
- security posture.

---

# 11.33 DORA e SPACE

## 11.33.1 DORA

Usar quando houver delivery real:

- change lead time;
- deployment frequency;
- change fail percentage;
- failed deployment recovery time;
- reliability/SLO context.

Não usar para classificar Worker individual.

## 11.33.2 DORA 2025 insight

AI amplifica strengths e weaknesses do sistema.

Portanto:

```text
more AI activity
≠ better delivery
```

Underlying engineering system é decisivo.

## 11.33.3 SPACE

Usar como lente para:

- Satisfaction and well-being;
- Performance;
- Activity;
- Communication and collaboration;
- Efficiency and flow.

## 11.33.4 Regra

Métrica de activity nunca representa produtividade sozinha.

---

# 11.34 Vanity and dangerous metrics

Não otimizar diretamente:

- lines of code;
- commits;
- tool calls;
- Workers spawned;
- parallel Tracks;
- Session length;
- minimum tokens;
- Findings count;
- gate count;
- activity time;
- model confidence.

Podem ser diagnostic signals.

Não success criteria globais.

---

# 11.35 Attention e alerting

## 11.35.1 Attention classes

```text
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
BUDGET_REQUIRED
DELIVERY_REQUIRED
```

## 11.35.2 Alert metrics

- actionability;
- false positive;
- duplicate rate;
- ignored rate;
- acknowledge time;
- resolve time.

## 11.35.3 Root-cause grouping

Um blocker pode gerar muitos sintomas.

Mostrar o root cause uma vez.

## 11.35.4 Alert storm

Quando múltiplos Actors falham pela mesma dependência:

```text
one grouped incident
+
affected entities
```

---

# 11.36 Observability failure

## 11.36.1 Export failure

- Domain State continua;
- telemetry marked degraded;
- bounded buffer;
- no secret-heavy fallback log;
- optional retry.

## 11.36.2 Backend unavailable

Local CLI/status continua.

## 11.36.3 Partial coverage

Dashboard declara:

```text
PARTIAL
```

Não exibe falso total.

## 11.36.4 Clock inconsistency

Usar timestamps e correlation IDs.

Não inferir order somente por wall-clock quando Events oferecem sequence.

---

# 11.37 AS-03 — Observability and Calibration Backend Spike

## 11.37.1 Objetivo

Comparar:

```text
A. Local SQLite/CLI baseline
B. OTel → Phoenix
C. OTel → Langfuse
```

## 11.37.2 Demo flow

```text
Mission
→ Plan
→ Worker Run
→ model/tool calls
→ Claim
→ Verification
→ Recovery drill
→ Closeout
```

## 11.37.3 Acceptance Criteria

1. traces correlacionam com MNFS IDs;
2. Domain Events continuam corretos sem backend;
3. nenhum raw secret, prompt ou code é exportado por default;
4. token, latency, error e tool data são visíveis;
5. continuidade cross-trace é consultável;
6. Evaluation Results podem ser anexados;
7. datasets e experiments comparam candidates;
8. self-host local é documentado;
9. export failure não corrompe execução;
10. overhead é medido;
11. retention/deletion são possíveis;
12. disable/replace são claros.

## 11.37.4 Comparison

- setup;
- TS integration;
- OTLP;
- trace UX;
- sessions;
- tokens/cost;
- annotations;
- evaluators;
- datasets;
- experiments;
- API;
- self-host;
- privacy;
- maintenance;
- upgrades.

## 11.37.5 Resultado

Pode decidir:

- Phoenix default opcional;
- Langfuse default opcional;
- ambos suportados por OTLP;
- local-only até nova necessidade.

---

# 11.38 M2 observability slice

M2 inclui:

- Domain Events;
- CLI status;
- JSON output;
- Worker Run timestamps;
- process result;
- log Artifact refs;
- Claim transition Events;
- token counters quando disponíveis;
- duration;
- adapter errors;
- Recovery Report.

M2 não inclui:

- Web Console;
- OTel Collector;
- Phoenix;
- Langfuse;
- dashboards;
- datasets;
- experiments;
- Calibration engine;
- DORA reporting.

---

# 11.39 Matriz de adoção

| Tool/concept | Decisão | Papel no MNFS |
|---|---|---|
| CLI | Adotar | canonical control surface |
| Lavish | Adotar | structured visual review |
| Herdr | Opcional | operational terminal projection |
| FirstMate | Referência | one liaison and crew visibility |
| GitHub agent dashboard | Referência | Session-monitoring UX |
| Backstage | Adiar/referência | future multi-repo portal |
| OpenTelemetry | Adotar | telemetry interchange |
| OTel Collector | Futuro opcional | routing/export |
| Phoenix | Candidato | local trace/evaluation backend |
| Langfuse | Candidato | full trace/evaluation backend |
| DORA | Adotar seletivamente | delivery outcomes |
| SPACE | Adotar como lente | multidimensional productivity |
| MNFS Web Console | Futuro | integrated operator UI |

---

# 11.40 Impacto nas seções anteriores

## Seção 1

Adicionar princípio:

> Measurement exists to inform a decision, not to manufacture activity.

## Seção 2

Adicionar entidades:

- Evaluation Result;
- Evaluation Dataset;
- Experiment Run;
- Calibration Decision;
- Attention Item.

## Seção 5

Adicionar:

- Operator Query Service;
- Telemetry Service;
- OTel Export Adapter;
- Evaluation Service;
- Experiment Service;
- Calibration Service;
- Notification Adapter.

## Seção 7

Clarificar:

```text
Evaluation Result
≠ Domain Verdict
```

## Seção 8

Telemetry loss não altera Domain State.

## Seção 9

Token/cost data inclui memory workers e coverage.

## Seção 10

Telemetry respeita security/redaction policy.

---

# 11.41 ADRs decorrentes

Após aprovação:

## ADR-0009 — Operator control plane and presentation surfaces

Decide:

- Mission-first;
- CLI canonical;
- Lavish structured review;
- Herdr optional;
- Web Console futuro;
- Session view não define Domain State.

## ADR-0010 — Telemetry model and OpenTelemetry export

Decide:

- Domain Events separados;
- OpenTelemetry adotado;
- `mnfs.*` namespace;
- raw content off por default;
- exporters opcionais.

## ADR-0011 — Evaluation and calibration framework

Decide:

- datasets e experiments;
- Evaluation Result separado de Verdict;
- nenhuma productivity score universal;
- Calibration Decision;
- shadow/canary/rollback.

---

# 11.42 Non-goals

Não construir agora:

- Web Console antes do Core;
- Backstage instance;
- custom observability database;
- custom trace protocol;
- custom dashboard engine;
- universal productivity score;
- automatic self-tuning;
- model leaderboard global;
- raw prompt logging por default;
- user surveillance;
- individual Worker ranking;
- token minimization como objective;
- one giant Mission trace;
- alert para todo Event;
- terminal como source of truth;
- telemetry backend obrigatório no M2;
- Langfuse/Phoenix-specific Domain Model;
- DORA metrics antes de delivery real.

---

# 11.43 Invariantes

1. Operator Control Plane é Mission-first.
2. CLI permanece canonical local command surface.
3. UI não contém Domain Rules.
4. Lavish é structured review, não store.
5. Herdr é projection, não authority.
6. Session status não é Feature status.
7. Domain Events e telemetry são diferentes.
8. Domain Events não são sampled away.
9. Telemetry loss não altera Domain State.
10. OpenTelemetry é interchange, não Domain Model.
11. `mnfs.*` é namespace interno estável.
12. GenAI convention change não migra Domain State.
13. Mission inteira não é um span longo.
14. Operation traces usam correlation IDs.
15. Trace ID não substitui Mission ID.
16. Raw prompt, output e code são off por default.
17. Secrets nunca são enviados à telemetry.
18. Backend failure não causa secret-heavy fallback.
19. Observation não é Evaluation.
20. Evaluation Result não é Verdict.
21. LLM Judge não é authority única para high-risk gate.
22. Dataset item é versionado e curated.
23. Production traces não entram cegamente em dataset.
24. Experiment registra versions e fixture.
25. Calibration exige Evidence.
26. Policy não self-tunes no MVP.
27. Shadow precede material rollout quando aplicável.
28. Canary possui rollback.
29. Métrica declara qual Decision informa.
30. Não existe productivity score universal.
31. Activity não representa productivity sozinha.
32. DORA não ranqueia Worker.
33. Alert é agrupado por root cause.
34. Quiet automation é default.
35. Operator vê next action.
36. Unknown permanece explícito.
37. Phoenix e Langfuse são adapters opcionais.
38. AS-03 decide backend com critérios.
39. M2 funciona sem observability backend.
40. Observabilidade serve entendimento; Calibration serve mudança controlada.

---

# Decisão resumida da Seção 11

> **O MNFS separa Operator Control Plane, Operational Projection, Observability Plane e Evaluation/Calibration Plane. O Operator navega por Missions, critérios, Decisions, Evidence e next actions; Sessions, terminais e traces permanecem detalhes. CLI é a interface canônica local, Lavish é a superfície de revisão estruturada, Herdr é projeção opcional e uma Web Console só entra após os contratos do Core estabilizarem. OpenTelemetry é adotado como padrão de instrumentação e exportação, com namespace `mnfs.*` estável e raw content desativado por default. Phoenix e Langfuse são backends candidatos avaliados pelo AS-03. A calibração usa Golden Missions, datasets, experiments e Calibration Decisions com shadow, canary e rollback. Métricas são multidimensionais e orientadas a decisões; o MNFS não cria um score universal de produtividade nem otimiza atividade em vez de outcome.**

---

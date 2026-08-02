---
id: DOC-PRODUCT-BLUEPRINT-02
title: Modelo de Domínio Canônico
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
  - product blueprint section 2
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-02
tracking_issue: 6
---

# 2. Modelo de Domínio Canônico

## 2.1 Propósito

O modelo de domínio define as entidades, relações, identidades, estados e autoridades que formam o MNFS.

Ele existe para garantir que:

- planejamento e execução usem o mesmo vocabulário;
- agentes diferentes não atribuam significados diferentes aos mesmos termos;
- cada estado tenha uma autoridade clara;
- nenhuma ferramenta externa se torne acidentalmente fonte de verdade;
- milestones futuros ampliem o produto sem reescrever conceitos anteriores;
- o sistema consiga ser recuperado sem depender da memória de uma sessão;
- uma declaração de conclusão não seja confundida com aceitação;
- paralelismo, correção, integração e QA permaneçam rastreáveis.

Este modelo representa o **produto-alvo**, não uma afirmação de que todas as entidades já estão implementadas.

---

## 2.2 Princípios de modelagem

### 2.2.1 Identidade não é estado

Toda entidade persistente possui uma identidade estável.

Mudanças de sessão, processo, modelo, worktree, retry, branch ou terminal não alteram automaticamente a identidade da missão, milestone, feature ou write track.

### 2.2.2 Estado operacional não deve ser inferido

O MNFS não deriva estado autoritativo de terminal, transcript, ausência de atividade, exit code isolado ou narrativa.

### 2.2.3 Pais agregam; filhos provam

Mission, Milestone e Feature são aceitos somente quando seus próprios critérios e as provas requeridas nos níveis filhos e de composição foram satisfeitos.

### 2.2.4 Uma entidade deve representar uma responsabilidade

Não usar um único objeto genérico chamado `Task` para representar todos os conceitos.

### 2.2.5 Eventos registram fatos; não substituem o estado atual

MNFS mantém estado atual em tabelas e eventos append-only para auditoria.

---

## 2.3 Visão geral das entidades

```text
Repository
│
├── Engineering System
│   ├── Engineering Standards
│   ├── Golden Paths
│   ├── Policy Rules
│   ├── Fitness Functions
│   ├── Safety Nets
│   ├── Waivers
│   └── Quality Posture
│
├── Repository Profile
│
├── Mission
│   │
│   ├── Plan Revisions
│   ├── Decisions
│   ├── Acceptance Criteria
│   ├── Milestones
│   │   │
│   │   ├── Acceptance Criteria
│   │   └── Features
│   │       │
│   │       ├── Acceptance Criteria
│   │       ├── Write Tracks
│   │       │   ├── Lease
│   │       │   ├── Execution Environment
│   │       │   ├── Environment Lease
│   │       │   ├── Credential Grants
│   │       │   ├── Effect Requests / Receipts
│   │       │   ├── Attempts
│   │       │   │   └── Worker Runs
│   │       │   ├── Claims
│   │       │   ├── Corrections
│   │       │   └── Security Violations
│   │       ├── Findings
│   │       └── Verdicts
│   ├── Integration Runs
│   ├── QA Journeys
│   ├── Evidence Bundles
│   ├── Evaluation Results
│   ├── Experiment Runs
│   ├── Calibration Decisions
│   └── Attention Items
└── Defect Classes / Learnings
```

---

## 2.4 Repository

Repository representa um repositório de produto controlado pelo MNFS.

Possui identidade estável em `.mnfs/repo.json`. Git é autoridade sobre código e commits; SQLite é autoridade sobre estado operacional.

---

## 2.5 Repository Profile

Repository Profile contém os bindings específicos do repositório necessários para executar o método MNFS:

- build;
- testes;
- lint;
- bootstrap;
- composition roots;
- integrações;
- regras locais;
- ambientes;
- jornadas.

Estados de conhecimento:

```text
RATIFIED
ASSUMED
OPEN
DEPRECATED
```

Uma lane não pode depender silenciosamente de uma seção `OPEN`.

### 2.5.1 Engineering Standard

Regra normativa sobre como software deve ser projetado, implementado, verificado ou operado.

Exemplos:

- dependências permitidas entre camadas;
- contratos de API;
- regras de migration;
- boundary validation;
- observabilidade obrigatória;
- métodos mínimos de prova.

### 2.5.2 Golden Path

Caminho preferencial e executável para uma classe recorrente de mudança.

Um Golden Path pode fornecer:

- perguntas de planejamento;
- templates;
- scaffolding;
- sequência de passos;
- critérios;
- checks;
- exemplos;
- rollback ou recovery.

### 2.5.3 Policy Rule e Fitness Function

Policy Rule é a representação executável de uma regra.

Fitness Function é o check contínuo que mede ou bloqueia desvio arquitetural, de contrato ou de qualidade.

### 2.5.4 Waiver

Exceção explícita, limitada e auditável a uma regra.

Possui:

- regra afetada;
- escopo;
- justificativa;
- autoridade;
- controles compensatórios;
- expiração ou condição de remoção.

### 2.5.5 Quality Posture

Visão baseada em evidência sobre quais capacidades do repositório estão:

```text
VERIFIED
PARTIAL
MISSING
NOT_APPLICABLE
UNKNOWN
```

Não é uma nota estética. É um mapa de cobertura e dívida do sistema de engenharia.

---

## 2.6 Mission

Mission é a unidade principal de intenção e resultado do MNFS.

Identidade:

```text
MIS-001
MIS-002
```

Uma Mission contém:

- objetivo;
- critérios de aceitação obrigatórios;
- escopo;
- assumptions;
- riscos;
- milestones;
- decisões;
- contrato aprovado;
- evidência final;
- closeout.

Dimensões de estado:

```text
lifecycle = OPEN | CLOSED | CANCELLED
phase = INTAKE | PLANNING | APPROVED | EXECUTING | VERIFYING | CLOSING
attention = NORMAL | BLOCKED | NEEDS_OPERATOR | DEGRADED
```

Toda Mission deve possuir critérios de aceitação próprios antes da aprovação do contrato. Esses critérios provam o resultado global da missão e não podem ser substituídos apenas pela soma dos critérios das milestones.

---

## 2.7 Mission Plan Revision

Mission Plan Revision é uma proposta estruturada e imutável de contrato.

Estados:

```text
DRAFT
SUPERSEDED
APPROVED
```

Revisões são append-only, content-addressed e aprovadas por hash exato.

---

## 2.8 Approved Mission Contract

Approved Mission Contract é a revisão oficialmente aprovada para execução.

Materialização:

```text
.mnfs/missions/<mission-id>/plan.json
```

Workers, dispatches, claims e gates são vinculados ao hash desse contrato.

---

## 2.9 Milestone

Milestone é um checkpoint de capacidade dentro de uma Mission.

Identidade plenamente qualificada:

```text
MIS-002/M01
MIS-002/M02
```

O ID `M01` é local à Mission.

Uma Milestone contém obrigatoriamente:

- outcome;
- dependências;
- features;
- critérios de aceitação próprios;
- requisitos de integração;
- QA exigido;
- evidência de fechamento.

Os critérios da Milestone provam a capacidade composta entregue naquele nível. Eles não podem ser substituídos pela simples soma dos critérios das Features.

---

## 2.10 Feature

Feature é a menor unidade planejada de comportamento com outcome e critérios de aceitação próprios.

### Identidade

Feature pertence obrigatoriamente a uma Milestone.

A identidade plenamente qualificada é:

```text
MIS-002/M01/F01
MIS-002/M01/F02
MIS-002/M02/F01
```

O identificador local `F01` precisa ser único apenas dentro da Milestone proprietária.

Duas Milestones diferentes podem conter uma Feature local `F01` sem colisão:

```text
MIS-002/M01/F01
MIS-002/M02/F01
```

Toda referência persistida, mensagem, claim, finding, receipt ou verdict deve usar a identidade plenamente qualificada, ou carregar separadamente:

```text
mission_id
milestone_id
feature_id
```

Nunca usar apenas `F01` fora do contexto inequívoco da Milestone.

### Dependências

Dependências dentro da mesma Milestone podem usar o identificador local quando o schema e o contexto forem inequívocos.

Dependências entre Milestones devem usar a identidade plenamente qualificada:

```text
MIS-002/M02/F01 depends on MIS-002/M01/F02
```

### Conteúdo obrigatório

- título;
- outcome;
- critérios de aceitação;
- dependências;
- invariantes;
- negativos;
- contratos referenciados;
- ownership;
- write-set esperado;
- verification map;
- riscos específicos.

### Relação com Write Track

Uma Feature não é automaticamente um Write Track:

```text
1 Feature → 1 Write Track
1 Feature → N Write Tracks
N Features → 1 Write Track
```

---

## 2.11 Acceptance Criterion

Acceptance Criterion é uma afirmação verificável obrigatória para aceitar uma entidade.

### Existência obrigatória

Acceptance Criteria **devem existir em todos os três níveis**:

- Mission;
- Milestone;
- Feature.

Não existe Mission, Milestone ou Feature executável sem ao menos um critério de aceitação válido.

Antes de aprovação ou dispatch, o MNFS deve rejeitar:

- Mission sem critérios;
- Milestone sem critérios;
- Feature sem critérios;
- critério vazio;
- critério sem método de prova;
- critério puramente narrativo ou não observável.

### Identidade hierárquica

Exemplos:

```text
MIS-002/AC-01
MIS-002/M01/AC-01
MIS-002/M01/F01/AC-01
```

O ID local do critério é único dentro da entidade proprietária.

### Responsabilidade por nível

#### Critério de Mission

Prova que o objetivo global foi alcançado.

Exemplo:

```text
MIS-002/AC-01
Um novo processo lead recupera integralmente a missão e seu estado operacional.
```

#### Critério de Milestone

Prova que o conjunto de Features compõe uma capacidade coerente.

Exemplo:

```text
MIS-002/M01/AC-01
Lease e Claim persistem e permanecem consistentes após reinício.
```

#### Critério de Feature

Prova o comportamento delimitado da Feature.

Exemplo:

```text
MIS-002/M01/F01/AC-01
Uma segunda concessão de lease para a mesma write track falha com erro tipado.
```

### Critérios de níveis diferentes não são redundantes

Critérios de Feature provam unidades locais.

Critérios de Milestone provam composição, integração e outcome intermediário.

Critérios de Mission provam o resultado global e a experiência final.

Pais não são automaticamente aceitos apenas porque todos os filhos passaram.

### Tipos conceituais

```text
STATIC
EXECUTABLE
LIVE
JUDGMENT
```

Todo critério deve declarar ou permitir resolver:

- tipo;
- método de prova;
- ambiente;
- autoridade;
- deciding ou advisory;
- evidência esperada.

### Invariantes

- toda Mission possui critérios;
- toda Milestone possui critérios;
- toda Feature possui critérios;
- nenhum trabalho é despachado sem critérios;
- todo critério possui método de prova;
- critério não pode ser encerrado por narrativa;
- critérios live não viram mocks silenciosamente;
- critérios judgment exigem autoridade apropriada;
- critérios de pai e filho são avaliados separadamente.

---

## 2.12 Write Track

Write Track é a unidade independente de mutação concorrente e integração.

Identidade:

```text
WT-001
```

Está vinculada a uma ou mais Features plenamente qualificadas.

Lifecycle conceitual:

```text
PLANNED
ALLOCATED
ACTIVE
CLAIMED
NEEDS_CORRECTION
ACCEPTED
INTEGRATED
ABANDONED
RELEASED
```

Trust:

```text
VALID
STALE_BASE
OUT_OF_SCOPE
CONTAMINATED
DIVERGED
UNKNOWN
```

Novo Attempt não implica novo worktree.

---

## 2.13 Lease

Lease é autorização temporária e exclusiva para uso de um workspace físico.

Lifecycle:

```text
REQUESTED
ACTIVE
RELEASE_PENDING
RELEASED
DIVERGED
```

Treehouse administra o lifecycle físico; MNFS administra a semântica.

### 2.13.1 Execution Environment

Execution Environment é o runtime no qual tools, código e serviços de um Actor executam.

Pode ser:

```text
HOST_INSPECTION
LOCAL_SANDBOX
DEV_CONTAINER
REMOTE_CONTAINER
REMOTE_VM
MICROVM
```

A Environment possui identity, policy hash, resource limits, network policy e adapter.

### 2.13.2 Environment Lease

Environment Lease autoriza temporariamente uma Write Track ou Actor a usar uma Execution Environment Instance.

É diferente do Treehouse Lease:

```text
Treehouse Lease
→ workspace de código

Environment Lease
→ runtime e recursos de execução
```

### 2.13.3 Credential Grant

Credential Grant disponibiliza uma identidade limitada a um Actor, target, action scope e período.

SQLite guarda metadata e reference, nunca o secret em plaintext.

### 2.13.4 Effect Request e Effect Receipt

Effect Request governa uma mutation externa antes de executá-la.

Effect Receipt registra o resultado observado e permite Reconcile.

### 2.13.5 Security Violation

Security Violation registra uma tentativa bloqueada ou desvio de policy.

Ela não presume malícia e pode revelar policy incompleta, dependency behavior ou prompt injection.

---

## 2.14 Attempt

Attempt é uma tentativa lógica de produzir ou corrigir o resultado de uma Write Track.

Identidade:

```text
WT-001/A01
WT-001/A02
```

Attempts podem reutilizar a mesma sessão e worktree quando contrato, write-set e trust permanecem válidos.

---

## 2.15 Worker Run

Worker Run representa uma execução concreta de um agente Pi.

Lifecycle:

```text
STARTING
RUNNING
IDLE
EXITED
LOST
CANCELLED
```

Exit code ou fim do processo não significa aceitação.

---

## 2.16 Claim

Claim é a declaração estruturada de que um worker acredita ter produzido um resultado verificável.

Lifecycle:

```text
OPEN
COMPLETED_BY_WORKER
UNDER_VERIFICATION
ACCEPTED
REJECTED
SUPERSEDED
ABANDONED
```

Claim referencia obrigatoriamente:

- Mission;
- Milestone;
- Feature plenamente qualificada;
- contract hash;
- Write Track;
- Attempt;
- lease;
- base SHA;
- result tree/commit;
- critérios reivindicados;
- evidências.

---

## 2.17 Receipt

Receipt é um registro imutável de verificação executada por autoridade controlada pelo MNFS.

É ligado ao critério, Claim, tree hash, ambiente e comando executado.

---

## 2.18 Verdict

Verdict é a decisão registrada por autoridade habilitada após considerar Claims, Receipts, Findings e políticas.

Resultados:

```text
ACCEPT
REJECT
BLOCK
ERROR
```

---

## 2.19 Finding

Finding é um problema, risco ou questão identificado durante verificação, review, integração ou QA.

Severidades:

```text
BLOCKING
IMPORTANT
SUGGESTION
NIT
QUESTION
```

Finding bloqueante precisa de evidência verificável.

---

## 2.20 Decision

Decision registra uma escolha necessária para que a Mission prossiga.

Mudança de escopo, contrato, arquitetura, orçamento, risco aceito ou operação irreversível exige decisão do operador.

---

## 2.21 Correction

Correction é trabalho delimitado destinado a resolver Findings sem reabrir desnecessariamente toda a Feature.

Por padrão reutiliza Write Track e worktree quando a trust boundary continua válida.

---

## 2.22 Integration Run

Integration Run representa a composição controlada de Write Tracks aceitas.

Ocorre em workspace limpo e prova que partes isoladamente verdes formam um sistema verde.

---

## 2.23 QA Journey

QA Journey é validação comportamental pela perspectiva do usuário ou consumidor.

É vinculada ao SHA integrado e não pode ser substituída por mocks quando o critério é real ou user-facing.

---

## 2.24 Evidence Item

Evidence Item é unidade imutável de prova ligada a critério, target e SHA.

---

## 2.25 Evidence Bundle

Evidence Bundle consolida provas necessárias para justificar aceite ou fechamento.

---

## 2.26 Defect Class

Defect Class representa padrão recorrente de falha que merece prevenção reutilizável.

---

## 2.27 Event

Event é fato imutável registrado sobre ação ou transição significativa.

Estado atual permanece em tabelas; eventos preservam auditoria.

---

## 2.27.1 Evaluation Result

Evaluation Result registra um julgamento de qualidade sobre um Trace, Span, Worker Run, Claim, Mission ou Experiment Run.

Pode ser produzido por:

- código determinístico;
- humano;
- LLM Judge;
- user feedback.

Não é Domain Verdict por si só.

## 2.27.2 Evaluation Dataset

Evaluation Dataset contém cenários versionados usados em experiments e regressions.

Golden Missions são o dataset canônico do MNFS.

## 2.27.3 Experiment Run

Experiment Run executa uma policy, model, prompt, Golden Path ou configuração candidata contra um dataset fixo e registra quality, cost, latency, failures e coverage.

## 2.27.4 Calibration Decision

Calibration Decision autoriza, rejeita ou reverte uma mudança em model routing, Context, memory, gates, Golden Paths, timeouts, parallelism ou Environment.

## 2.27.5 Attention Item

Attention Item é uma projeção acionável para Operator ou Lead.

Tipos incluem:

```text
REVIEW
DECISION_REQUIRED
BLOCKED
RECOVERY_REQUIRED
SECURITY_REQUIRED
BUDGET_REQUIRED
DELIVERY_REQUIRED
```

Attention não é lifecycle.

## 2.27.6 Product Roadmap Milestone

Product Roadmap Milestone entrega uma capability reutilizável do MNFS e possui Entry Gate, Golden Proof, Exit Criteria e Non-goals.

Não deve ser confundido com um Milestone interno de Mission.

## 2.27.7 Architecture Spike

Architecture Spike é uma investigação delimitada para resolver incerteza material antes de um Product Milestone.

Produz Evidence e Decision.

Não é delivery.

## 2.28 Actors e papéis

- Operator;
- MNFS Lead;
- Planner;
- Investigator;
- Writer Worker;
- Reviewer;
- Verification Runner;
- QA Actor;
- Integrator.

Papéis não são acoplados a providers específicos.

---

## 2.29 Autoridades por entidade

| Entidade | Pode propor | Pode persistir | Pode aceitar/encerrar |
|---|---|---|---|
| Mission | Operator/Lead | MNFS | Operator/MNFS closeout |
| Plan Revision | Pi/Lead | MNFS | — |
| Approved Contract | Operator requests | MNFS | Operator-authorized gate |
| Milestone | Planner | MNFS | MNFS gate |
| Feature | Planner | MNFS | MNFS gate |
| Write Track | Lead/orchestrator | MNFS | MNFS/integrator |
| Lease | Lead requests | MNFS + Treehouse adapter | MNFS |
| Attempt | Lead/policy | MNFS | MNFS |
| Worker Run | Pi adapter | MNFS observes | MNFS records exit/cancel |
| Claim | Worker | MNFS validates/persists | MNFS gate |
| Receipt | Runner | MNFS | — |
| Verdict | Gate authority | MNFS | Authority defined by risk |
| Finding | Reviewer/QA/runner | MNFS | Reviewer/gate/hub policy |
| Decision | Lead/Operator | MNFS | Required authority |
| Integration Run | Integrator | MNFS | Integration gate |
| QA Journey | QA policy | MNFS | QA gate |
| Evidence Bundle | MNFS | MNFS/Git | Closing authority |

---

## 2.30 Estado autoritativo e armazenamento

### Git

Código, commits, branches, contratos aprovados, evidência aceita, ADRs e documentação.

### SQLite

Estado operacional atual, missões, revisões, leases, tracks, attempts, runs, claims, findings, decisões e eventos.

### Runtime artifacts

Logs, prompts, HTML, screenshots, traces e outputs temporários.

### Pi

Contexto e execução probabilística, nunca domínio autoritativo.

### Treehouse

Estado físico dos worktrees.

### Lavish

Feedback visual temporário.

### Herdr

Apresentação operacional de terminais.

---

## 2.31 Regras de agregação

Mission, Milestone e Feature agregam filhos, mas possuem critérios próprios obrigatórios.

Nenhum pai é aceito apenas pela soma automática dos filhos.

Status deve apresentar:

- lifecycle;
- phase;
- attention;
- contagens;
- blocker;
- next action.

---

## 2.32 Status de implementação do modelo

| Entidade | Milestone de implementação |
|---|---|
| Repository Identity | M0 — implementado |
| Mission | M0 — implementado parcialmente |
| Event | M0 — implementado parcialmente |
| Plan Revision | M1 — implementado |
| Approved Mission Contract | M1 — implementado |
| Mission/Milestone/Feature Criteria | M1 — conteúdo inicial; enforcement será ampliado |
| Repository Profile | futuro |
| Milestone runtime | futuro |
| Feature runtime | futuro |
| Write Track | M2 |
| Lease | M2 |
| Attempt | M2 |
| Worker Run | M2 |
| Claim | M2 |
| Recovery View | M2 |
| Finding | M3 |
| Correction | M3 |
| Reviewer Verdict | M3 |
| Integration Run | M4 |
| Receipt | M5 |
| QA Journey | M5 |
| Evidence Bundle | M5/M6 |
| Defect Class | M5/M6 |

---

## 2.33 Exemplo hierárquico completo

```text
MIS-020
├── AC-01
├── M01
│   ├── AC-01
│   ├── F01
│   │   ├── AC-01
│   │   └── WT-001
│   └── F02
│       ├── AC-01
│       └── WT-002
└── M02
    ├── AC-01
    └── F01
        ├── AC-01
        └── WT-003
```

Identidades:

```text
MIS-020
MIS-020/M01
MIS-020/M01/F01
MIS-020/M01/F01/AC-01
MIS-020/M02/F01
MIS-020/M02/F01/AC-01
```

---

## 2.34 Anti-modelos proibidos

- Feature identificada somente como `F01` fora do contexto da Milestone;
- Feature tratada como filha direta da Mission;
- Acceptance Criteria opcionais em Mission, Milestone ou Feature;
- `Task` universal;
- sessão como identidade do trabalho;
- exit code como conclusão;
- worktree novo para todo retry;
- Claim como aceite;
- teste isolado como fechamento de Feature;
- Milestone marcada manualmente como concluída;
- transcript como memória;
- ferramenta externa como autoridade de domínio.

---

# Decisões resumidas

> **Features pertencem obrigatoriamente a Milestones. Sua identidade canônica é hierárquica: `Mission/Milestone/Feature`, por exemplo `MIS-002/M01/F01`.**

> **Acceptance Criteria são obrigatórios em Mission, Milestone e Feature. Cada nível prova seu próprio outcome; critérios de filhos não substituem os critérios de composição e resultado dos pais.**

---

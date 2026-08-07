---
id: DOC-MNFS-CAPABILITY-REALIZATION-METHOD
title: MNFS Capability Realization Method
document_type: development_method
form: reference
authority: standard_policy
status: accepted
version: 1.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - product milestone planning method
  - blueprint-to-build traceability
  - capability readiness gates
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-07
---

# MNFS Capability Realization Method

## 1. Propósito

Esta metodologia define como o MNFS transforma:

```text
Operator intent
+
Product Blueprint
+
ADRs / Decisions
+
Roadmap
+
Research
+
Engineering Standards
+
Repository evidence
```

em:

```text
Capability requirements
→ Capability + architecture + sourcing design
→ Validation Baseline
→ Mission Contract
→ bounded decomposition
→ Execution Design
→ agent execution
→ Verification / Validation
→ Evidence
→ Closeout / Learning
```

Ela existe para responder:

> **Como garantir que, ao planejar e implementar um Product Milestone, todos os aspectos relevantes do sistema sejam avaliados, alocados, executados, verificados e preservados sem depender da memória do Lead ou da continuidade de uma Session?**

Documentação abundante não garante execução correta. O método cria:

- cobertura;
- rastreabilidade;
- gates;
- ownership;
- change impact;
- orphan detection;
- planejamento executável por Actors de contexto limitado;
- fechamento baseado em Evidence.

No MNFS:

> **Nada relevante deve ser lembrado informalmente. Deve ser descoberto por applicability, alocado por traceability, entregue por um contrato executável e fechado por Evidence.**

O MCRM permanece um único método. `DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` não cria uma metodologia paralela; ele especializa R3–R6 para execução por agentes.

---

# 2. A lacuna que este método resolve

O Product Blueprint descreve o sistema completo.

O Roadmap descreve:

- ordem;
- outcome;
- proof;
- dependencies.

Mas ainda existe uma distância entre:

```text
“M2 precisa ser seguro, recuperável e governado”
```

e:

```text
quais requisitos exatos entram?
o que significa correto antes de escolher a implementação?
qual arquitetura está autorizada?
o que devemos OWN / ADOPT / ADAPT?
quem implementa?
em qual Milestone / Feature?
qual bounded unit um Fresh Actor consegue executar?
qual contexto ele recebe?
qual código realiza?
qual proof começa RED?
qual Evidence fecha?
quando parar, escalar ou Replan?
```

Sem método, os riscos são:

- Section importante não ser consultada;
- requisito constitucional não ser alocado;
- Capability Spec incompleta;
- solução contaminar a definição de correctness;
- Mission Plan focar somente no happy path;
- segurança e Recovery entrarem tarde;
- Feature existir sem parent requirement;
- task existir sem upward contribution;
- test existir sem critério;
- critério existir sem proof;
- code change não possuir rationale;
- Worker receber uma decisão arquitetural escondida;
- Context Pack carregar informação demais ou omitir Authority;
- retry cego virar progresso aparente;
- Session completion virar false completion;
- documentação divergir;
- roadmap ser “consultado”, mas não governar a execução.

---

# 3. Fundamentos

## 3.1 Requirements traceability

Práticas de systems engineering usam requisitos com IDs únicos e rastreabilidade bidirecional para ligar necessidades superiores a design, implementação e verificação.

A matriz precisa identificar:

- source;
- parent;
- allocation;
- realization;
- verification method;
- Evidence;
- result;
- missing relationships.

## 3.2 Verification e Validation

Verification responde:

> O produto foi construído conforme os requisitos?

Validation responde:

> O produto resolve a necessidade correta do stakeholder?

O MNFS preserva ambas:

```text
Verification
→ code/system satisfies contract

Validation
→ Mission outcome satisfies Operator intent
```

## 3.3 Capability design

Capability não trivial precisa de:

- goals;
- non-goals;
- requirements;
- alternatives;
- architecture;
- sourcing;
- failure modes;
- security;
- Recovery;
- proof plan;
- graduation criteria;
- upgrade/downgrade;
- rollout/rollback.

## 3.4 Outcome-based applicability

O MNFS não copia checklists universais. Ele resolve applicability para a Capability atual e exige rationale para `NOT_APPLICABLE` ou `DEFERRED`.

## 3.5 Agent-first execution

Structured docs, execution plans, cross-links, ownership, fresh context e automated checks reduzem dependência de memória externa. O método transforma esses documentos em inputs obrigatórios para Context Compilation e execution readiness.

---

# 4. Nome e posição na hierarquia

Nome canônico:

```text
MNFS Capability Realization Method
```

Abreviação:

```text
MCRM
```

Posição documental:

```text
Product Blueprint / Decisions
        ↓
Capability Realization Method
        ↓
Capability Specification
        ↓
Validation Baseline
        ↓
Product Milestone Mission Contract
        ↓
Execution Design
        ↓
Implementation / Verification / Evidence
```

O método não substitui:

- Product Blueprint;
- Roadmap;
- Capability Spec;
- Mission Contract;
- Engineering Standards;
- Development Governance Method.

Ele define como esses elementos são usados juntos.

---

# 5. Conceito central: Coverage Graph

O MNFS mantém um grafo de cobertura.

```text
Operator Need
    ↓
Blueprint Clause / ADR / Standard / Decision
    ↓
Capability Requirement
    ↓
Product Milestone Outcome
    ↓
Mission Acceptance Criterion
    ↓
Mission Milestone Criterion
    ↓
Feature Criterion
    ↓
Execution Unit / Design Element
    ↓
Implementation Element
    ↓
Verification Method
    ↓
Receipt / Evidence
    ↓
Verdict / Closeout
```

A relação é bidirecional.

De cima para baixo:

> Como este requisito será realizado e provado?

De baixo para cima:

> Por que este código, teste, documento ou ferramenta existe?

Um bounded execution unit também precisa demonstrar sua contribuição ascendente:

```text
Feature / unit criterion
  CONTRIBUTES_TO
Milestone criterion / requirement
  CONTRIBUTES_TO
Mission criterion / outcome
```

---

# 6. Tipos de nós

## 6.1 Source Requirement

Origem normativa, como:

```text
Blueprint Clause
ADR / Decision
Engineering Standard
Security Policy
Roadmap Outcome
Repository Profile
Approved Operator Decision
```

## 6.2 Capability Requirement

Requisito derivado para uma capability reutilizável.

## 6.3 Milestone Requirement

Outcome ou constraint do Product Roadmap Milestone.

## 6.4 Mission Criterion

Critério global da Mission.

## 6.5 Mission Milestone Criterion

Critério de composição e outcome intermediário.

## 6.6 Feature Criterion

Critério bounded da Feature.

## 6.7 Design Element

Módulo, adapter, state machine, schema, interface, flow, policy ou execution contract que realiza um requisito.

## 6.8 Implementation Element

Code path, migration, configuration, template ou script.

## 6.9 Verification Element

- TEST;
- INSPECTION;
- ANALYSIS;
- DEMONSTRATION;
- REVIEW;
- LIVE_QA;
- FAILURE_DRILL;
- SECURITY_DRILL.

## 6.10 Evidence Element

Receipt, report, trace, screenshot, result, artifact hash ou Verdict.

---

# 7. Relações obrigatórias

```text
DERIVED_FROM
ALLOCATED_TO
CONTRIBUTES_TO
REALIZED_BY
VERIFIED_BY
VALIDATED_BY
EVIDENCED_BY
SUPERSEDES
DEPENDS_ON
DEFERRED_TO
CONSTRAINED_BY
```

## 7.1 Exemplo provider-neutral

```text
CAP-EXEC-REQ-007 Frozen Effective Environment Policy
  DERIVED_FROM
DOC-PRODUCT-BLUEPRINT-10
  ALLOCATED_TO
current Mission criterion
  REALIZED_BY
selected Execution Environment realization
  VERIFIED_BY
security conformance proof
  EVIDENCED_BY
bound Receipt / acceptance Evidence
```

---

# 8. Coverage states

Cada requirement ou concern possui estado:

```text
UNASSESSED
APPLICABLE
ALLOCATED
DESIGNED
IMPLEMENTED
VERIFIED
VALIDATED
DEFERRED
NOT_APPLICABLE
BLOCKED
SUPERSEDED
```

## 8.1 UNASSESSED

Ainda não foi avaliado. Impede Planning Readiness.

## 8.2 APPLICABLE

Relevante, mas ainda sem allocation. Impede Contract Readiness.

## 8.3 ALLOCATED

Possui target de Mission/Milestone/Feature.

## 8.4 DESIGNED

Possui design element e verification plan.

## 8.5 IMPLEMENTED

Implementation element existe. Não implica verified.

## 8.6 VERIFIED

Requisito técnico provado.

## 8.7 VALIDATED

Outcome confirmado contra necessidade superior.

## 8.8 DEFERRED

Será realizado em Product Milestone futuro. Exige destination, rationale, risk, Authority e ausência de contradição com o outcome atual.

## 8.9 NOT_APPLICABLE

Exige rationale verificável. Não pode ser usado apenas para reduzir trabalho.

## 8.10 BLOCKED

A cobertura não pode avançar.

## 8.11 SUPERSEDED

Requirement foi substituído por Decision ou nova versão.

---

# 9. Orphan detection

## 9.1 Orphan source requirement

Requirement relevante sem allocation. Impede Readiness.

## 9.2 Orphan Feature / execution unit

Feature ou bounded unit sem parent capability/criterion pode indicar:

- scope creep;
- gold plating;
- requirement ausente;
- decomposição incorreta.

## 9.3 Orphan implementation

Code ou migration sem requirement/design link exige classificação.

## 9.4 Orphan verification

Test/check que não prova critério, Standard, regression ou risk conhecido exige disposition.

## 9.5 Orphan requirement at closeout

Requirement sem Evidence ou disposition impede closure.

## 9.6 Orphan Evidence

Evidence sem target, criterion ou provenance não decide.

---

# 10. O ciclo MCRM

```text
R0 Baseline
→ R1 Applicability
→ R2 Requirements
→ R3 Capability + Architecture + Sourcing Design
→ R4 Contract Readiness
   ├─ R4A — Validation Baseline
   └─ R4B — Decomposition and Allocation
→ R5 Execution Design & Readiness
→ R6 Agent Execution Loop with Continuous Coverage
→ R7 Verification and Validation
→ R8 Closeout and Learning
```

R4A/R4B são subfases lógicas. O lifecycle externo continua R0–R8; não existe um segundo método paralelo.

---

# 11. R0 — Baseline

## 11.1 Objetivo

Congelar os inputs usados para planejar a Capability.

## 11.2 Inputs

- Product Blueprint version;
- accepted ADR/Decision set;
- Development Governance Method;
- Layered Agent Execution Planning Design quando aplicável;
- roadmap version;
- applicable Standards;
- Repository Profile;
- Research Reports;
- prior Evidence;
- prior Findings;
- Product Milestone definition.

## 11.3 Artifact

```text
Capability Baseline Manifest
```

## 11.4 Gate R0

- sources atuais;
- nenhum source normativo `STALE`;
- versions resolvidas;
- conflicting Decisions ausentes;
- Product Milestone status permite Planning.

---

# 12. R1 — Applicability Scan

## 12.1 Objetivo

Obrigar o Planning a perguntar:

> Quais partes do produto podem ser afetadas?

Não significa que todas exigem implementação. Significa que todas são avaliadas.

## 12.2 Capability Impact Domains

Toda Capability avalia:

### Product and outcome

- Operator need;
- Mission outcome;
- product promise;
- non-goals.

### Domain model

- entities;
- identities;
- relationships;
- invariants;
- lifecycle.

### State and persistence

- SQLite/operational state;
- schema;
- migrations;
- transactions;
- Events;
- generated Artifacts.

### External operations

- Git;
- Agent Runtime;
- Execution Environment;
- providers;
- APIs;
- filesystem;
- network.

### Failure and Recovery

- crash windows;
- idempotency;
- fencing;
- late arrival;
- Reconcile;
- rollback.

### Security

- trust boundary;
- Environment;
- filesystem;
- network;
- credentials;
- external effects;
- supply chain.

### Quality and Evidence

- Acceptance Criteria;
- proof types;
- gates;
- Receipts;
- Review;
- QA;
- staleness.

### Concurrency and resources

- ownership;
- write-set;
- shared resources;
- serialization;
- races.

### Context and memory

- Authority Snapshot;
- Context Pack;
- Runtime Session policy;
- handoff;
- stale context;
- progressive disclosure.

### Operator experience

- status;
- attention;
- Decisions;
- next action;
- error model;
- CLI/JSON;
- visual surface.

### Observability and Calibration

- Domain Events;
- traces;
- metrics;
- tokens/cost;
- Evaluation;
- experiment impact.

### Engineering System

- Repository Profile;
- Standard;
- Golden Path;
- Fitness Function;
- Waiver.

### Compatibility and evolution

- upgrade;
- downgrade;
- existing state;
- version skew;
- data migration;
- tool compatibility;
- dependency replacement/removal.

### Documentation

- Blueprint;
- ADR;
- Spec;
- Roadmap;
- Profile;
- Reference;
- how-to;
- AGENTS;
- documentation impact.

### Execution planning

- repository localization;
- execution-unit size;
- Context Compiler inputs;
- tools/capabilities;
- budgets;
- termination;
- independent validation;
- handoff;
- Replan triggers.

## 12.3 Artifact

```text
Capability Applicability Matrix
```

Exemplo:

| Domain | State | Rationale | Output |
|---|---|---|---|
| Security | Applicable | Worker executes untrusted repo/tool code | Environment policy + security proof |
| Credentials | Not Applicable | Current bounded task requires none | Explicit NONE posture |
| Observability backend | Deferred | Local receipts/events are sufficient now | Deferred target |
| Runtime Session continuity | Not Applicable | Fresh recovery is mandatory | Session observational only |
| Recovery | Applicable | Lead/process crash is a deciding proof | Mission criteria + drills |

## 12.4 Gate R1

Nenhuma linha `UNASSESSED`.

`NOT_APPLICABLE` e `DEFERRED` possuem rationale. Deferred targets existem no Roadmap.

---

# 13. R2 — Requirements Derivation

## 13.1 Objetivo

Transformar sources e applicability em requirements únicos, testáveis e traceable.

## 13.2 Requirement quality

Cada requirement deve ser:

- uniquely identified;
- necessary;
- clear;
- bounded;
- consistent;
- feasible;
- verifiable;
- traceable to parent;
- free of hidden implementation where not required.

## 13.3 Requirement classes

```text
FUNCTIONAL
STATE
SECURITY
RECOVERY
QUALITY
PERFORMANCE
OPERABILITY
COMPATIBILITY
DOCUMENTATION
CONSTRAINT
```

## 13.4 Derived requirements

Arquitetura pode criar requirements que não aparecem literalmente no higher-level source. Derived requirement precisa de rationale, source Decision/design, ausência de scope expansion silenciosa e approval quando material.

## 13.5 Gate R2

- every requirement has parent/source;
- every MUST has planned verification;
- no duplicates;
- no contradictions;
- no unbounded wording;
- no hidden Operator Decision.

---

# 14. R3 — Capability + Architecture + Sourcing Design

## 14.1 Objetivo

Projetar a capability completa antes de assumir implementação e decidir explicitamente quais responsabilidades pertencem ao MNFS versus substrates externos.

## 14.2 Spec sections

- Summary;
- Motivation;
- Goals;
- Non-goals;
- Operator Stories;
- Domain Changes;
- Architecture;
- State and Recovery;
- Security and Privacy;
- Interfaces;
- Standards;
- Observability;
- Test Plan;
- Golden Proof;
- Graduation;
- Upgrade/Downgrade;
- Rollout/Rollback;
- Risks;
- Alternatives;
- Open Questions.

## 14.3 Sourcing vocabulary

Toda material realization usa uma disposition explícita:

```text
OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT
```

Para cada decisão material, registrar quando aplicável:

- named consumer;
- machinery eliminated;
- authority boundary;
- candidate/baseline comparison;
- supported/public integration boundary;
- version/provenance;
- license/sovereignty impact;
- proof required before adoption;
- upgrade policy;
- removal/replacement conditions.

A regra é capability-first:

> MNFS owns differentiated semantics and authority; commodity machinery is reused when a replaceable substrate removes meaningful machinery without becoming a second authority.

## 14.4 Requirement allocation

A Spec liga cada Capability Requirement a:

- design elements;
- verification methods;
- Product Milestone slice;
- future/deferred target.

## 14.5 Artifact set

Canonical source:

```text
docs/capabilities/CAP-*/SPEC.md
docs/capabilities/CAP-*/TRACEABILITY.json
```

Generated projection:

```text
docs/capabilities/CAP-*/COVERAGE.md
```

Evitar múltiplos source documents duplicando conteúdo.

## 14.6 Gate R3 — Capability Readiness

- goals/non-goals complete;
- requirements complete enough;
- impact matrix complete;
- architecture satisfies requirements;
- sourcing decisions/dispositions complete enough;
- no duplicate authority introduced;
- failure modes named;
- security and Recovery addressed;
- Golden Proof executable;
- graduation criteria exist;
- no high-impact open question;
- alternatives evaluated;
- scope fits Product Milestone.

---

# 15. R4 — Contract Readiness

R4 preserva o papel de transformar Capability aceita em commitment bounded, mas correctness é definido antes da decomposition.

## 15.1 R4A — Validation Baseline

### Objetivo

Definir:

> **O que precisa ser verdade para a Mission atual estar correta, independentemente de como ela será decomposta ou implementada?**

Mission Acceptance Criteria + Verification Plans exercem o papel de Validation Contract; não existe uma segunda entidade authoritative apenas para renomear esse conceito.

### Required outputs

- Mission-level correctness statements;
- Verification Plans;
- negative assertions / invariants;
- parent outcome validation scenarios;
- Golden Proof;
- deciding recovery/security/failure drills;
- explicit non-goals.

### Gate R4A

Correctness precisa ser reviewable sem depender de uma estrutura planejada de Features ou de uma ferramenta escolhida.

Critério que apenas repete uma escolha de implementação deve ser desafiado, salvo quando a implementação é ela própria constraint aprovada.

## 15.2 R4B — Decomposition and Allocation

Somente depois de R4A coerente o Planning cria bounded decomposition.

```text
Capability Requirement
→ Mission Criterion
→ Mission Milestone Criterion
→ Feature Criterion
→ bounded execution units when needed
```

Rules:

- all Product Milestone MUST requirements allocated or dispositioned;
- parent criteria preserve composition/outcome;
- child criteria do not substitute parent criteria;
- no Feature/unit without parent;
- child work declares `CONTRIBUTES_TO` upward lineage;
- proof method copied by reference, not improvised;
- deferred requirements remain outside current Mission scope;
- non-goals become exclusions;
- dependency graph must be satisfiable;
- no implementation unit exists only because it is technically interesting.

## 15.3 Mission Planning Pack

Generated input for Planning:

```text
Product Milestone
Capability Spec
Applicable Requirements
Validation Baseline
Impact Matrix
Open Questions
Required ADRs / Decisions
Required Spikes
Required Golden Proof
Required Failure Drills
Required Documentation
```

## 15.4 Gate R4 — Contract Readiness

- scope satisfies Product Milestone outcome;
- R4A Validation Baseline reviewed;
- every applicable MUST allocated;
- criteria hierarchy complete;
- contribution lineage complete;
- dependencies satisfiable;
- proof coverage complete;
- required Environment properties resolved enough for the next phase;
- required pre-contract Spikes completed;
- Operator Decisions resolved;
- non-goals explicit;
- exact visual review possible.

---

# 16. R5 — Execution Design & Readiness

## 16.1 Objetivo

Definir como implementar o próximo Mission Milestone sem redesenhar silenciosamente a Capability, e compilar trabalho suficientemente claro para um Actor de contexto fresco.

## 16.2 Inputs

- Approved Mission Contract;
- accepted Capability Spec;
- Validation Baseline;
- requirements allocated to Milestone;
- current code;
- ADRs/Decisions;
- Repository Profile;
- selected/allowed Environment realization;
- selected/allowed Agent Runtime boundary quando já decidido;
- prior Evidence and Findings.

## 16.3 Contents

O R5 preserva o microdesign clássico e acrescenta execution planning:

- repository localization evidence;
- exact ou bounded files/modules/loci;
- state transitions;
- schemas/migrations;
- interfaces consumed/produced;
- adapter behavior;
- transaction boundaries;
- failure windows;
- selected sourcing realization/provenance;
- Execution Graph;
- unit sizing rationale;
- dependency order;
- write/resource sets;
- shared-resource serialization;
- Environment/tool/capability contract;
- Context Compiler plan;
- proof-first sequence;
- TDD sequence quando TEST é o deciding proof adequado;
- retry/hypothesis policy;
- budget classes;
- success/block/escalation/Replan termination;
- handoff/recovery expectations;
- parallelism classification;
- observability;
- security;
- rollout/rollback;
- docs impact;
- exact verification commands ou bounded procedure.

## 16.4 Execution Unit Contract role

Cada bounded implementation unit recebe um contrato compilado, normalmente no Writer Pack, com:

- Mission/Milestone/Feature target;
- current Attempt / ActorRun binding;
- contract/policy/result-base hashes;
- bounded purpose;
- upward lineage;
- preconditions;
- repository/localization evidence;
- write/resource boundary;
- interface constraints;
- Engineering constraints;
- Environment/tool/security contract;
- sourcing constraints;
- Verification contract;
- output contract;
- finite budget;
- termination states.

Isso é um papel compilado; não exige nova entidade de domínio sem Evidence de lifecycle próprio.

## 16.5 Fresh Actor readiness

R5 não passa se a seguinte afirmação for falsa:

> **A technically capable Fresh Actor with no prior conversation can receive the compiled pack, orient itself, prove the starting baseline, execute the bounded unit, know when it must stop, and produce a structurally valid Claim.**

Authority crítica nunca é lazy context. Contexto opcional grande usa progressive disclosure.

## 16.6 Termination vocabulary

Cada unit declara explicitamente:

```text
SUCCESS
BLOCKED
ESCALATE
HANDOFF_REQUIRED
REPLAN_REQUIRED
```

- `SUCCESS`: proofs locais deciding concluídos + output/Claim válido; nunca “o modelo acha que terminou”.
- `BLOCKED`: prerequisite/environment/tool necessário não pode ser resolvido dentro da Authority atual.
- `ESCALATE`: ambiguity/budget/failure threshold exige Lead/Operator attention sem necessariamente alterar o contrato.
- `HANDOFF_REQUIRED`: contexto/runtime budget chegou ao limite, mas existe estado coerente suficiente para continuar com Fresh Actor; não equivale a sucesso.
- `REPLAN_REQUIRED`: correctness, architecture, security, material scope ou contract precisa mudar.

## 16.7 Planning Completeness projection

Não criar outra checklist manual. A projection é compilada de:

```text
MCRM Applicability
+ Validation coverage
+ Capability/Architecture sourcing
+ Repository Profile
+ R5 design
+ Execution Environment policy
+ Verification Plans
```

Ela precisa cobrir, quando aplicável:

- product/outcome;
- Validation;
- domain;
- state/persistence;
- API/contracts;
- architecture;
- sourcing;
- repository localization;
- security;
- Environment;
- credentials/network/effects;
- Recovery/idempotency;
- concurrency/resources;
- write boundary;
- context;
- tools/capabilities;
- verification;
- independent review;
- integration;
- live QA;
- observability;
- compatibility/migrations;
- rollout/rollback;
- documentation;
- budgets/termination;
- handoff;
- Replan triggers.

Cada concern deve resolver para authoritative source, `NOT_APPLICABLE + rationale` ou `DEFERRED + destination/rationale`.

## 16.8 Gate R5 — Implementation Readiness

- design covers criteria;
- no architectural contradiction;
- no unresolved data/security migration;
- repository loci are known enough or Investigation is explicitly allocated;
- tests/proofs can be executed;
- Environment available;
- external tool behavior known enough;
- selected dependencies/provenance resolve;
- write/resource boundaries reviewable;
- context/termination/handoff defined;
- rollback/recovery named;
- no speculative platform work;
- Fresh Actor readiness passes;
- Execution Planning Completeness has no unexplained blank concern.

---

# 17. R6 — Agent Execution Loop with Continuous Coverage

## 17.1 Objetivo

Manter traceability durante execução e impedir que tactical adaptation altere Authority silenciosamente.

## 17.2 Fresh Actor orientation

Antes de mutation protegida:

```text
validate Current Authority Snapshot / hashes
→ validate target / Attempt / ActorRun
→ validate Git base + workspace + Environment identity
→ load role-specific eager context
→ inspect planned loci / bounded localization
→ execute baseline/smoke/RED proof
→ classify divergence
→ begin tactical execution
```

Session resume pode acelerar, mas não é prerequisite de correctness.

## 17.3 Execution loop

```text
OBSERVE
→ HYPOTHESIZE
→ PROBE / TEST
→ CLASSIFY
→ ACT
→ RE-VERIFY
```

L0 correctness e L1 realization não mudam dentro do Worker. L3 tactical plan pode adaptar dentro de L0–L2 bounds.

## 17.4 Proof-first

Proof-first é universal. TDD é requerido quando `TEST` é o deciding proof correto e um failing test significativo pode ser estabelecido antes da implementação.

Outros métodos continuam válidos:

```text
ANALYSIS
INSPECTION
DEMONSTRATION
REVIEW
LIVE_QA
FAILURE_DRILL
SECURITY_DRILL
```

## 17.5 Retry policy

Mechanical retry só ocorre quando:

- falha é transient/mechanical;
- ação é segura/idempotentemente fenced;
- policy autoriza;
- finite retry budget permanece.

Hypothesis retry exige observação nova e hipótese materialmente diferente. Repetir a mesma ideia com mudança cosmética não conta como progresso.

Budget exhaustion nunca vira success.

## 17.6 Write Track / role pack

Writer Pack inclui pelo menos:

- requirement/criterion IDs;
- target/upward lineage;
- design elements;
- write/resource boundary;
- interfaces;
- Environment/tool contract;
- proofs;
- docs impact;
- forbidden scope;
- output contract;
- termination conditions.

Outros roles recebem packs próprios:

- Investigator: question/evidence/source/read/effect boundary;
- Planner: Validation Baseline, open decisions, architecture/sourcing constraints;
- Reviewer/Validator: criteria, Evidence, diff/result identity, no-write-by-default;
- Integrator: accepted child results + composition criteria;
- QA: journey/persona/environment/outcome criteria.

## 17.7 Change declaration

Cada Claim declara:

```text
requirements addressed
criteria claimed
design deviations
files/areas changed
tests/evidence
documentation impact
new derived requirements
unknowns
result identity
```

## 17.8 New discovery taxonomy

Durante implementação, uma nova necessidade é classificada antes de ser incorporada:

```text
TACTICAL_DETAIL
LOCALIZATION_CORRECTION
DERIVED_REQUIREMENT
CORRECTION
MISSING_IMPLEMENTATION_UNIT
ARCHITECTURE_CHANGE
SECURITY_OR_EFFECT_ESCALATION
CONTRACT_OR_OUTCOME_CHANGE
ENVIRONMENT_DIVERGENCE
FUTURE_IMPROVEMENT
```

Material architecture/security/outcome change exige Decision/Replan antes de mutation correspondente.

## 17.9 Independent validation

```text
Writer
→ Claim
→ deterministic Runner / Receipts
→ independent Reviewer / Validator when required
→ Findings
→ Correction / new Feature / Replan
→ MNFS Gate
```

Implementer completion nunca concede acceptance.

## 17.10 Parallelism

Parallel execution é permitido apenas quando dependency e resource analysis demonstram independência. Conceitualmente:

```text
SERIAL
SAFE_PARALLEL
RESOURCE_SERIALIZED
```

Mais agentes disponíveis não é Evidence de que parallelism é benéfico.

## 17.11 Handoff

Quando `HANDOFF_REQUIRED`, o próximo Actor recebe current truth compilada:

- authority hash;
- target/lifecycle state;
- accepted prior result;
- current Attempt state;
- Findings/blockers;
- Evidence refs;
- next permitted action;
- relevant observational hypothesis.

Transcript não é Authority.

## 17.12 Gate R6 — Claim Coverage

Antes de Claim admission:

- changed files tied to target;
- no unexplained out-of-scope change;
- requirement IDs resolve;
- docs impact declared;
- derived requirement dispositioned;
- current contract/policy hashes used;
- result identity bound;
- blocked/handoff/budget state não foi convertido em PASS.

---

# 18. R7 — Verification and Validation

## 18.1 Verification matrix

Para cada MUST:

| Requirement | Criterion | Method | Test/Review/Journey | Target | Result | Evidence |
|---|---|---|---|---|---|---|

## 18.2 Methods

```text
TEST
ANALYSIS
INSPECTION
DEMONSTRATION
REVIEW
LIVE_QA
FAILURE_DRILL
SECURITY_DRILL
```

## 18.3 Validation matrix

Para cada higher-level outcome:

| Operator need/outcome | Validation scenario | Environment | Result | Evidence |
|---|---|---|---|---|

## 18.4 Independence and composition

R7 verifica que:

- Worker self-assessment não foi aceito como Evidence deciding;
- required fresh/independent review foi realmente independente;
- accepted child units foram compostas no nível de Milestone;
- Mission closure retorna à Validation Baseline original;
- Evidence está bound ao contract/result/environment correto.

## 18.5 Gate R7

- every deciding requirement verified;
- every parent outcome validated;
- Evidence fresh;
- no orphan requirement;
- no false completion;
- deviations approved;
- coverage state complete;
- deciding drills executed;
- documentation current.

---

# 19. R8 — Closeout and Learning

## 19.1 Objetivo

Fechar Product Milestone e melhorar o sistema de planejamento.

## 19.2 Closeout report

- Product Milestone outcome;
- requirements coverage;
- Golden Proof;
- Evidence;
- deferred items;
- non-goals preserved;
- incidents;
- operator feedback;
- cost/latency;
- documentation updates;
- new Standards/Golden Paths;
- roadmap assumptions.

## 19.3 Coverage states at closeout

Allowed:

```text
VERIFIED
VALIDATED
DEFERRED
NOT_APPLICABLE
SUPERSEDED
```

Not allowed para requirement deciding:

```text
UNASSESSED
APPLICABLE
ALLOCATED
DESIGNED
IMPLEMENTED
BLOCKED
```

## 19.4 Learning promotion

Recurring or important learning may become:

- ADR / Decision;
- Standard;
- Golden Path change;
- Profile update;
- Research addendum;
- Roadmap Decision;
- Golden Mission / Evaluation item;
- Context Compiler improvement;
- retry/budget default candidate.

Learning não altera policy automaticamente; Calibration permanece governada.

## 19.5 Gate R8 — Product Milestone Exit

- Exit Criteria pass;
- coverage graph closed;
- Golden Proof pass;
- no orphan MUST;
- docs/ADRs updated;
- accepted Evidence bundle;
- roadmap reassessed;
- next Product Milestone assumptions reviewed.

---

# 20. Readiness gates resumidos

| Gate | Nome | Pergunta |
|---|---|---|
| R0 | Baseline | Estamos usando as fontes atuais corretas? |
| R1 | Applicability | Avaliamos todos os domains relevantes? |
| R2 | Requirements | Os requirements são completos, testáveis e traceable? |
| R3 | Capability Readiness | Capability, architecture e sourcing estão coerentes e prováveis? |
| R4 | Contract Readiness | Correctness foi definida antes da decomposition e todo scope necessário foi alocado? |
| R5 | Execution Readiness | Um Fresh Actor pode executar sem decisões ocultas nem transcript anterior? |
| R6 | Claim Coverage | O implementation delta permaneceu dentro da Authority e ligado ao contrato? |
| R7 | V&V Readiness | Tudo foi verificado e o outcome composto foi validado? |
| R8 | Milestone Exit | A capability foi provada, documentada e aprendida? |

---

# 21. Planning Coverage e Execution Completeness

O MNFS gera projections, não fontes paralelas de verdade.

Planning Coverage responde:

```text
source requirements
applicability
allocations
proof plans
design coverage
open blockers
R0-R5 readiness
```

Execution Planning Completeness responde se os concerns aplicáveis para bounded execution foram explicitamente cobertos ou dispositioned.

Isso responde objetivamente:

> O que falta antes de começar?

---

# 22. Machine-readable traceability

## 22.1 Primeiro formato

Começar com JSON/YAML versionado. Não criar graph database.

Exemplo:

```yaml
requirements:
  - id: CAP-EXEC-REQ-007
    source:
      - DOC-PRODUCT-BLUEPRINT-10
      - current execution-environment Decision
    allocated_to:
      - current Mission criterion
    realized_by:
      - selected environment policy binding
    verified_by:
      - security conformance proof
    evidenced_by: []
    state: DESIGNED
```

## 22.2 Generated views

- coverage report;
- missing links;
- impact report;
- requirement matrix;
- execution completeness projection;
- closeout matrix.

## 22.3 Why not only Markdown

Markdown explains. Structured manifest permits:

- validation;
- queries;
- coverage;
- stale detection;
- change propagation;
- Context Pack compilation.

---

# 23. Automated checks

Initial/future validators detect, conforme maturidade:

- duplicate requirement IDs;
- missing parent;
- unresolved source;
- applicable requirement without allocation;
- MUST without verification method;
- Feature/unit without parent;
- criterion without requirement;
- missing contribution lineage;
- test/evidence ref missing;
- deferred without target;
- N/A without rationale;
- accepted requirement with incomplete coverage;
- stale source version;
- Capability Spec missing required section;
- Mission Contract missing parent criteria;
- R4B decomposition without R4A Validation Baseline;
- R5 with unresolved execution-critical placeholders;
- missing termination/handoff rules;
- stale Authority Snapshot/pack;
- changed files outside approved write boundary;
- code path ownership;
- generated projection freshness;
- Standard applicability;
- documentation impact.

Automation checks structural completeness. Human/independent review checks whether the relationships and design are correct.

---

# 24. Roles

## Operator

- approves Product Milestone contract;
- decides material scope/trade-offs;
- accepts deferral with product impact;
- approves material Replan;
- validates outcome where required.

## MNFS Lead

- runs the method;
- owns coverage completeness;
- consolidates questions;
- prevents bypass of gates;
- routes Findings.

## Investigator

- resolves bounded unknowns/localization/questions;
- produces Evidence, not implementation authority.

## Planner / Capability Author

- derives requirements;
- completes applicability;
- writes Capability Spec;
- proposes sourcing/allocation;
- compiles bounded execution design.

## Architect / Reviewer

- reviews design coverage;
- challenges N/A/deferred;
- finds orphan requirements and speculative design.

## Writer

- realizes allocated requirements;
- declares deviations/docs impact;
- produces Claim, never acceptance.

## Verification Runner

- produces requirement-linked Receipts.

## Reviewer / Validator

- judges Evidence/criteria independently;
- produces Findings;
- has no write authority by default.

## Integrator

- composes accepted child results against parent criteria.

## QA Actor

- validates higher-level/user-facing outcome.

## Documentation Maintainer

- validates owners, relations and sources.

---

# 25. Decision rules

## 25.1 No blank cells

Every concern e requirement é addressed, deferred, N/A, blocked ou superseded.

## 25.2 No unowned deferment

Deferred exige target Product Milestone, owner, risk e rationale.

## 25.3 No Feature/unit without lineage

Every bounded work unit traces upward.

## 25.4 No MUST without proof

Every MUST has proof planned before approval.

## 25.5 No design without requirement/risk

Material design element traces to requirement, risk, Standard ou enabling constraint.

## 25.6 No test theater

Verification must prove a requirement or failure mode.

## 25.7 No closure from child count

Validation of parent outcome remains required.

## 25.8 Correctness before decomposition

R4B não pode definir retroativamente aquilo que R4A deveria ter congelado.

## 25.9 Frozen authority, adaptive tactics

Worker pode adaptar local implementation strategy dentro de bounds, mas não alterar criteria, architecture, security, sourcing material ou effect authority silenciosamente.

## 25.10 No infinite retry

Retries/hypotheses possuem finite policy e escalation.

## 25.11 No transcript authority

Fresh recovery e handoff usam structured current truth; Session continuity é optimization.

## 25.12 No self-acceptance

Writer completion/Claim não aceita Feature/Milestone/Mission.

---

# 26. Example — M2 após Architecture Realization Review

## 26.1 Source clauses

```text
Claim is not Verdict
Isolated work must be composed
Authority and isolation are complementary
Recovery and Reconcile
Current Authority Snapshot
Property-based Execution Environment
Provider-neutral Git result boundary
Validation-first planning
Thin Sovereign Semantic Kernel + selective substrates
```

## 26.2 Provider-neutral requirements

Exemplos:

```text
One Write Track has at most one active current Attempt.
Worker/process completion shall not accept the Claim.
Claim/result lineage shall bind exact Git base/result identity.
Fresh Lead shall recover authoritative state without transcript.
External resource release shall be fenced/idempotent.
Writer mutation shall occur only inside the current isolated mutable workspace.
Writer shall execute under the frozen effective Environment Policy bound to the Attempt.
Network/credentials/effects shall match the approved Environment contract.
Environment startup failure shall fail closed.
Only the MNFS Gate may perform the governed acceptance transition.
```

O runtime concreto, sandbox/envelope concreto e workspace substrate são realization decisions selecionadas por Evidence; eles não pertencem ao requirement quando não são product constraints.

## 26.3 Allocation

```text
Mission AC
→ complete secure execution/recovery outcome

Milestone ACs
→ durable execution semantics
→ governed Writer/environment/result acceptance

Features / execution units
→ bounded adapters/state/worker/gate behavior
```

## 26.4 Design

```text
Sovereign semantic core
Agent Runtime boundary selected by conformance Evidence
Execution Environment realization selected by conformance Evidence
Workspace binding
Claim / Recovery / Verification / Gate services
```

## 26.5 Verification

```text
unit/FSM tests
transaction tests
runtime conformance
execution-environment security conformance
fresh-process Recovery drills
result-tree lineage
integration proof
vertical Golden Proof
```

## 26.6 Result

Se um deciding security/recovery requirement não tiver allocation, design, proof owner e Evidence path, Planning/Execution Readiness permanece bloqueada. Não depende de o Lead lembrar manualmente uma seção do Blueprint.

---

# 27. Integração com Roadmap, Capability, Mission e Execution Design

O Roadmap define:

```text
what capability
why now
dependencies
Golden Proof
Exit Criteria
Non-goals
```

O MCRM define:

```text
how to prove planning completeness
how to define correctness before decomposition
how to allocate requirements
how to source implementation responsibly
how to compile bounded Actor work
how to trace implementation
how to close with Evidence
```

O Capability Spec define:

```text
complete reusable capability + architecture design
```

O Mission Contract define:

```text
what is committed now
```

O R5 Execution Design define:

```text
how the next Mission Milestone is safely executable by bounded Actors
```

---

# 28. Integração com o MNFS futuro

## 28.1 Planning Compiler

Inputs:

- Product Milestone;
- Blueprint version;
- ADR/Decision set;
- Standards;
- Profile;
- prior Evidence.

Outputs:

- Baseline Manifest;
- Applicability Matrix draft;
- requirement candidates;
- Validation Baseline draft;
- open questions;
- required Spikes;
- Planning Coverage Report.

## 28.2 Traceability Service

Maintains links and coverage states.

## 28.3 Readiness Gate Service

Evaluates R0–R8.

## 28.4 Change Impact Service

```text
source change
→ impacted capabilities
→ impacted Missions
→ stale Packs / designs
→ tests/evidence to rerun
```

## 28.5 Context Compiler

Uses the traceability graph, Role Contract, Authority Snapshot e execution design para incluir eager high-signal context e tornar optional context discoverable.

---

# 29. YAGNI implementation

## Now

Use:

- Capability Spec template;
- structured traceability manifest;
- TypeScript/Node validator;
- generated Coverage Report;
- human/independent review;
- GitHub CI;
- explicit execution plans.

## Later

Consider:

- SQLite projection;
- CLI commands;
- graph visualization;
- automated change impact;
- code symbol links;
- Web Console.

## Do not build now

- graph database;
- DOORS replacement;
- SysML platform;
- universal requirements engine;
- AI auto-approval;
- semantic completeness oracle;
- hundreds of mandatory checklist rows;
- generic provider framework without a second consumer.

---

# 30. Canonical files

```text
docs/product/CAPABILITY-REALIZATION-METHOD.md

docs/capabilities/CAP-*/
├── SPEC.md
├── TRACEABILITY.json
└── COVERAGE.md          # generated
```

Global schemas permanecem pequenos e versionados. Generated projections nunca substituem suas canonical sources.

---

# 31. Change Impact

A material change declara, quando aplicável:

```yaml
requirements_impact:
  status: NONE | UPDATED | NEW_REQUIREMENT | REPLAN_REQUIRED
  affected:
    - CAP-...
    - MIS-...
  rationale: ...
```

Execution discovery também declara design deviation, new derived requirement, docs impact e unknowns no Claim/Handoff correspondente.

---

# 32. Method governance

Este método é Standard/Policy.

Changes:

- clarification → patch;
- new mandatory gate → material policy change;
- removal of bidirectional traceability → constitutional impact;
- tooling change without semantic change → implementation Decision.

Metrics úteis:

- missing requirements found before implementation;
- requirements found late;
- orphan Feature/unit rate;
- planning time;
- Replan rate;
- false-completion rate;
- handoff failure rate;
- repeated-hypothesis rate;
- documentation drift;
- coverage false positives;
- Operator confidence.

Se o método virar ceremony sem information gain, simplificar preservando invariants.

---

# 33. Adoption / evolution sequence

Para uma Capability material:

```text
1. establish R0 Baseline
2. complete R1 Applicability
3. derive R2 Requirements
4. complete R3 Capability + Architecture + Sourcing
5. define R4A Validation Baseline
6. perform adversarial correctness review
7. complete R4B decomposition/allocation
8. complete R5 Execution Design & Readiness
9. approve bounded execution authority
10. execute R6 with continuous coverage
11. run R7 Verification / Validation
12. close R8 and promote governed learning
```

Architecture Spikes usam o mesmo discipline, mas seu output é Evidence/Decision input, não product delivery.

---

# 34. Non-goals

Este método não é:

- waterfall;
- big design up front para cada linha;
- demanda de especificar completamente Milestones distantes;
- universal compliance checklist;
- substitute for iteration;
- ban on discovery during implementation;
- guarantee de que requirements estão corretos;
- graph database project;
- motivo para atrasar tiny low-risk change;
- script estático que impede tactical adaptation;
- autorização para Worker “figure it out” fora de bounds.

Rigor é proporcional a:

- impact;
- risk;
- irreversibility;
- architectural reach;
- number of consumers;
- external effect.

Uma tiny change pode usar reduced lane preservando lineage, authority e proof.

---

# 35. Invariants

1. Every Product Milestone has a baseline.
2. Every domain in the Applicability Scan is assessed.
3. No blank applicability state.
4. Every applicable MUST has a unique ID.
5. Every requirement traces upward.
6. Every requirement is allocated or dispositioned.
7. Every deciding requirement has planned proof.
8. Every Feature/execution unit traces to a parent outcome.
9. Every material design element has rationale.
10. Every Claim declares requirements addressed.
11. Every Evidence item has a target and provenance.
12. Every deferment has a future target and risk.
13. `NOT_APPLICABLE` requires rationale.
14. Requirements are traced bidirectionally.
15. Verification and Validation are distinct.
16. Parent validation is not child-count aggregation.
17. Change impact propagates through the graph.
18. A stale source can stale downstream artifacts/packs.
19. Planning Readiness is a Gate, not an opinion.
20. Closeout requires complete deciding coverage.
21. Structured traceability is source; coverage/completeness reports are projections.
22. Human/independent review judges correctness of links and outcomes.
23. Automation judges structural completeness and freshness.
24. The method scales rigor by risk.
25. The method is simplified when it adds ceremony without value.
26. Correctness is defined before decomposition.
27. Runtime Session is never required to reconstruct Authority.
28. Frozen Authority cannot be silently changed by tactical execution.
29. Blocked, escalation, budget exhaustion or handoff cannot be converted into success.
30. Implementer self-assessment never grants acceptance.

---

# Decisão resumida

> **O MNFS Capability Realization Method transforma Product intent em execução através de um Coverage Graph bidirecional e um único lifecycle R0–R8. Correctness é definida em R4A antes da decomposition em R4B. R3 inclui architecture e capability-first sourcing. R5 compila Execution Design suficiente para um Fresh Actor trabalhar sem conversa anterior, com explicit Environment/tool/write/resource boundaries, proof, budgets, termination e handoff. R6 permite tactical adaptation dentro de frozen Authority, exige continuous coverage e separa Claim de independent Verification/Validation. Todo requirement relevante é identificado, alocado, realizado e provado — ou recebe disposition explícita. Readiness e closeout são Gates baseados em Evidence, não opinião ou Session continuity.**

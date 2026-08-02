---
id: DOC-MNFS-CAPABILITY-REALIZATION-METHOD
title: MNFS Capability Realization Method
document_type: development_method
form: reference
authority: standard_policy
status: accepted
version: 1.0.0
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
tracking_issue: 6
---

# MNFS Capability Realization Method

## 1. Propósito

Esta metodologia define como o MNFS transforma:

```text
Product Blueprint
+
ADRs
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
Capability Spec
→ Mission Contract
→ Milestone/Feature Criteria
→ Microdesign
→ Implementation
→ Verification
→ Evidence
→ Closeout
```

Ela existe para responder:

> **Como garantir que, ao planejar e implementar um Product Milestone, todos os aspectos relevantes do sistema sejam avaliados, alocados, verificados e preservados sem depender da memória do Lead?**

Documentação abundante não garante execução correta.

O método cria:

- cobertura;
- rastreabilidade;
- gates;
- ownership;
- change impact;
- orphan detection;
- fechamento baseado em Evidence.

No MNFS:

> **Nada relevante deve ser lembrado informalmente. Deve ser descoberto por applicability, alocado por traceability e fechado por Evidence.**

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
quem os implementa?
em qual Milestone?
qual código realiza?
qual teste prova?
qual Evidence fecha?
```

Sem método, os riscos são:

- Section importante não ser consultada;
- requisito constitucional não ser alocado;
- Capability Spec incompleta;
- Mission Plan focar somente no happy path;
- segurança e Recovery entrarem tarde;
- Feature existir sem parent requirement;
- test existir sem critério;
- critério existir sem proof;
- code change não possuir rationale;
- documentação divergir;
- roadmap ser “consultado”, mas não governar a execução.

---

# 3. Fundamentos externos adotados

## 3.1 Requirements traceability

Práticas de systems engineering usam requisitos com IDs únicos e rastreabilidade bidirecional para ligar necessidades superiores a design, implementação e verificação.

A matriz precisa identificar:

- source;
- parent;
- verification method;
- test/evidence;
- result;
- missing relationships.

## 3.2 Verification and validation matrices

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

## 3.3 KEP/RFC-style capability design

Capability não trivial precisa de:

- goals;
- non-goals;
- design;
- test plan;
- graduation criteria;
- upgrade/downgrade;
- monitoring;
- implementation history.

## 3.4 Outcome-based practice profiles

Frameworks como SSDF são úteis como conjuntos de outcomes e tasks adaptáveis.

O MNFS não copia checklists inteiras.

Ele resolve applicability para a Capability atual.

## 3.5 Agent-first repository

Structured docs, execution plans, cross-links, ownership e automated checks reduzem dependência de contexto externo.

O método transforma esses documentos em inputs obrigatórios de Planning.

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
Product Blueprint
        ↓
Capability Realization Method
        ↓
Capability Specification
        ↓
Product Milestone Mission Contract
        ↓
Milestone Microdesign
        ↓
Implementation and Evidence
```

O método não substitui:

- Product Blueprint;
- Roadmap;
- Capability Spec;
- Mission Contract;
- Engineering Standards.

Ele define como esses elementos são usados juntos.

---

# 5. Conceito central: Coverage Graph

O MNFS mantém um grafo de cobertura.

```text
Operator Need
    ↓
Blueprint Clause / ADR / Standard
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
Design Element
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

---

# 6. Tipos de nós

## 6.1 Source Requirement

Origem normativa.

Pode vir de:

```text
Blueprint Clause
ADR
Engineering Standard
Security Policy
Roadmap Outcome
Repository Profile
Approved Operator Decision
```

## 6.2 Capability Requirement

Requisito derivado para uma capability reutilizável.

Exemplo:

```text
CAP-EXEC-REQ-007
A Writer process shall execute under a frozen Environment Policy.
```

## 6.3 Milestone Requirement

Outcome ou constraint do Product Roadmap Milestone.

## 6.4 Mission Criterion

Critério global da Mission de implementação.

## 6.5 Mission Milestone Criterion

Critério de composição e outcome intermediário.

## 6.6 Feature Criterion

Critério bounded da Feature.

## 6.7 Design Element

Módulo, adapter, state machine, schema, interface ou flow que realiza um requisito.

## 6.8 Implementation Element

Code path, migration, configuration, template ou script.

## 6.9 Verification Element

- test;
- inspection;
- analysis;
- demonstration;
- QA Journey;
- failure drill;
- security spike;
- review.

## 6.10 Evidence Element

Receipt, report, trace, screenshot, result ou Verdict.

---

# 7. Relações obrigatórias

```text
DERIVED_FROM
ALLOCATED_TO
REALIZED_BY
VERIFIED_BY
VALIDATED_BY
EVIDENCED_BY
SUPERSEDES
DEPENDS_ON
DEFERRED_TO
CONSTRAINED_BY
```

## 7.1 Exemplo

```text
PB-P14 Authority and isolation
  DERIVED_TO
CAP-EXEC-REQ-007 Frozen Environment Policy
  ALLOCATED_TO
MIS-002/M01/AC-03
  REALIZED_BY
SandboxPolicyResolver
  VERIFIED_BY
AS-02/S09
  EVIDENCED_BY
REC-AS02-009
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

Ainda não foi avaliado.

Impede Planning Readiness.

## 8.2 APPLICABLE

Relevante, mas ainda sem allocation.

Impede Contract Readiness.

## 8.3 ALLOCATED

Possui target de Mission/Milestone/Feature.

## 8.4 DESIGNED

Possui design element e verification plan.

## 8.5 IMPLEMENTED

Implementation element existe.

Não implica verified.

## 8.6 VERIFIED

Requisito técnico provado.

## 8.7 VALIDATED

Outcome confirmado contra necessidade superior.

## 8.8 DEFERRED

Será realizado em Product Milestone futuro.

Exige:

- destination;
- rationale;
- risk;
- Authority;
- no contradiction with current outcome.

## 8.9 NOT_APPLICABLE

Exige rationale verificável.

Não pode ser escolhido para reduzir trabalho sem análise.

## 8.10 BLOCKED

A cobertura não pode avançar.

## 8.11 SUPERSEDED

Requirement foi substituído por Decision ou nova version.

---

# 9. Orphan detection

## 9.1 Orphan source requirement

Requirement relevante sem allocation.

```text
source
→ no lower-level consumer
```

Impede Readiness.

## 9.2 Orphan Feature

Feature sem parent capability/criterion.

Pode indicar:

- scope creep;
- gold plating;
- requirement ausente;
- decomposição incorreta.

## 9.3 Orphan implementation

Code ou migration sem requirement/design link.

Não significa automaticamente que o código é inválido.

Exige classificação.

## 9.4 Orphan verification

Test/check que não prova critério, Standard, regression ou risk conhecido.

Pode ser:

- útil;
- redundant;
- stale;
- accidental.

## 9.5 Orphan requirement at closeout

Requirement sem Evidence ou disposition.

Impede closure.

## 9.6 Orphan Evidence

Evidence sem target, criterion ou provenance.

Não decide.

---

# 10. O ciclo MCRM

```text
R0 Baseline
→ R1 Applicability
→ R2 Requirements
→ R3 Capability Design
→ R4 Contract Allocation
→ R5 Implementation Design
→ R6 Build and Continuous Coverage
→ R7 Verification and Validation
→ R8 Closeout and Learning
```

---

# 11. R0 — Baseline

## 11.1 Objetivo

Congelar os inputs usados para planejar a Capability.

## 11.2 Inputs

- Product Blueprint version;
- accepted ADR set;
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

Exemplo:

```yaml
capability: CAP-EXECUTION
blueprint_version: 1.0.0
roadmap_version: 2
adrs:
  - ADR-0001
  - ADR-0002
  - ADR-0003
  - ADR-0006
  - ADR-0009
standards: []
repository_profile: null
research:
  - MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1
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

Não significa que todas exigem implementação.

Significa que todas são avaliadas.

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

- SQLite;
- schema;
- migrations;
- transactions;
- Events;
- generated Artifacts.

### External operations

- Git;
- Treehouse;
- Pi;
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
- Session policy;
- handoff;
- stale context.

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
- tokens;
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
- tool compatibility.

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

## 12.3 Artifact

```text
Capability Applicability Matrix
```

Exemplo:

| Domain | State | Rationale | Output |
|---|---|---|---|
| Security | Applicable | Worker process touches host | AS-02 + E1 policy |
| Credentials | Not Applicable | Fixed M2 task needs none | Explicit NONE grant |
| Observability backend | Deferred | M2 local counters sufficient | Deferred to M9 |
| Memory | Not Applicable | bounded Writer, no long Session need | Pi native only |
| Recovery | Applicable | Lead/process crash is core proof | M2/M02 criteria |

## 12.4 Gate R1

Nenhuma linha `UNASSESSED`.

`NOT_APPLICABLE` e `DEFERRED` possuem rationale.

Deferred targets existem no Roadmap.

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

## 13.4 Structure

```yaml
id: CAP-EXEC-REQ-007
class: SECURITY
statement: >
  The Writer process shall execute under the Environment
  Policy hash bound to its Attempt.
source:
  - PB-10.10
  - ADR-0006
rationale: Prevent active-policy tampering and fail-open execution.
verification_method:
  - TEST
  - INSPECTION
priority: MUST
```

## 13.5 Derived requirements

Arquitetura pode criar requirements que não aparecem literalmente no higher-level source.

Exemplo:

```text
Treehouse reuses paths
→ Lease release needs external lease ID fencing
```

Derived requirement precisa:

- rationale;
- source Decision/design;
- no scope expansion;
- approval.

## 13.6 Gate R2

- every requirement has parent/source;
- every MUST has planned verification;
- no duplicates;
- no contradictions;
- no unbounded wording;
- no hidden Operator Decision.

---

# 14. R3 — Capability Specification

## 14.1 Objetivo

Projetar a capability completa antes de assumir implementação.

## 14.2 Spec sections

Usar o processo aprovado na Section 13:

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

## 14.3 Requirement allocation

A Spec liga cada Capability Requirement a:

- design elements;
- verification methods;
- Product Milestone slice;
- future/deferred target.

## 14.4 Artifact set

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

## 14.5 Gate R3 — Capability Readiness

- goals/non-goals complete;
- requirements complete enough;
- impact matrix complete;
- design satisfies requirements;
- failure modes named;
- security and Recovery addressed;
- Golden Proof executable;
- graduation criteria exist;
- no high-impact open question;
- alternatives evaluated;
- scope fits Product Milestone.

---

# 15. R4 — Mission Contract Allocation

## 15.1 Objetivo

Transformar Capability Spec aceita em commitment bounded.

## 15.2 Allocation

```text
Capability Requirement
→ Mission Criterion
→ Mission Milestone Criterion
→ Feature Criterion
```

## 15.3 Rules

- all Product Milestone MUST requirements allocated or dispositioned;
- parent criteria preserve composition/outcome;
- Feature criteria do not substitute parent criteria;
- no Feature without parent;
- proof method copied by reference, not improvised;
- deferred requirements remain outside current Mission scope;
- non-goals become exclusions.

## 15.4 Mission Planning Pack

Generated input for Planning:

```text
Product Milestone
Capability Spec
Applicable Requirements
Impact Matrix
Open Questions
Required ADRs
Required Spikes
Required Golden Proof
Required Failure Drills
Required Documentation
```

## 15.5 Gate R4 — Contract Readiness

- scope satisfies Product Milestone outcome;
- every applicable MUST allocated;
- criteria hierarchy complete;
- dependencies satisfiable;
- proof coverage complete;
- Security Environment resolved;
- required Spikes completed;
- Operator Decisions resolved;
- non-goals explicit;
- exact visual review possible.

---

# 16. R5 — Milestone Microdesign

## 16.1 Objetivo

Definir como implementar o próximo Mission Milestone sem redesenhar a Capability.

## 16.2 Inputs

- Approved Mission Contract;
- accepted Capability Spec;
- requirements allocated to Milestone;
- current code;
- ADRs;
- Profile;
- Environment;
- prior Evidence.

## 16.3 Contents

- files/modules;
- state transitions;
- schemas/migrations;
- interfaces;
- adapter behavior;
- transaction boundaries;
- failure windows;
- test plan;
- observability;
- security;
- rollout;
- docs impact;
- exact verification commands.

## 16.4 Design Coverage Review

Para cada requirement do Milestone:

```text
design element?
verification element?
failure behavior?
documentation impact?
```

## 16.5 Gate R5 — Implementation Readiness

- design covers criteria;
- no architectural contradiction;
- no unresolved data/security migration;
- tests can be written;
- environment available;
- external tool behavior known;
- rollback/recovery named;
- no speculative platform work.

---

# 17. R6 — Build with Continuous Coverage

## 17.1 Objetivo

Manter traceability durante implementação, não somente antes e depois.

## 17.2 Write Track Pack

Inclui:

- requirement/criterion IDs;
- design elements;
- write-set;
- tests;
- docs impact;
- forbidden scope;
- output contract.

## 17.3 Change declaration

Cada Claim declara:

```text
requirements addressed
criteria claimed
design deviations
files changed
tests/evidence
documentation impact
new derived requirements
unknowns
```

## 17.4 New discovery

Durante implementação, uma nova necessidade pode ser:

```text
implementation detail
derived requirement
scope expansion
architecture decision
defect
future improvement
```

Ela é classificada antes de ser incorporada.

## 17.5 Coverage update

Traceability changes with:

- design change;
- criterion change;
- test added;
- new Finding;
- Replan;
- requirement supersession.

## 17.6 Gate R6

Antes de Claim admission:

- changed files tied to target;
- no unexplained out-of-scope change;
- requirement IDs resolve;
- docs impact declared;
- derived requirement dispositioned;
- current contract hash used.

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

## 18.4 Gate R7

- every deciding requirement verified;
- every parent outcome validated;
- Evidence fresh;
- no orphan requirement;
- no false completion;
- deviations approved;
- coverage state complete;
- failure drills executed;
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

Not allowed:

```text
UNASSESSED
APPLICABLE
ALLOCATED
DESIGNED
IMPLEMENTED
BLOCKED
```

para requirement deciding do Milestone.

## 19.4 Learning promotion

Recurring or important learning may become:

- ADR;
- Standard;
- Golden Path change;
- Profile update;
- Research addendum;
- Roadmap Decision;
- Golden Mission dataset item.

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
| R3 | Capability Readiness | A capability está desenhada e possui Golden Proof? |
| R4 | Contract Readiness | O scope atual aloca tudo que precisa entregar? |
| R5 | Implementation Readiness | O próximo Milestone pode ser implementado sem decisões ocultas? |
| R6 | Claim Coverage | O implementation delta permanece ligado ao contrato? |
| R7 | V&V Readiness | Tudo foi verificado e o outcome foi validado? |
| R8 | Milestone Exit | A capability foi provada, documentada e aprendida? |

---

# 21. Planning Coverage Report

O MNFS gera uma projection de cobertura.

```text
M2 Planning Coverage

Source requirements:        47
Applicable:                 31
Not applicable:             10
Deferred:                    6
Unassessed:                  0

Applicable allocated:       31/31
Requirements with proof:    31/31
Requirements with design:   31/31
Open blocking questions:     0
Documentation owners:       complete
Golden Proof:               executable

Readiness:
R0 PASS
R1 PASS
R2 PASS
R3 PASS
R4 BLOCKED — AS-02 not accepted
```

Isso responde objetivamente:

> O que falta antes de começar?

---

# 22. Machine-readable traceability

## 22.1 Primeiro formato

Começar com YAML ou JSON versionado.

Não criar graph database.

Exemplo:

```yaml
requirements:
  - id: CAP-EXEC-REQ-007
    source:
      - PB-P14
      - ADR-0006
    allocated_to:
      - MIS-002/M01/AC-03
    realized_by:
      - src/application/execution/security-policy.ts
    verified_by:
      - AS-02/S09
      - TEST-SEC-014
    evidenced_by: []
    state: DESIGNED
```

## 22.2 Generated views

- coverage report;
- missing links;
- impact report;
- requirement matrix;
- closeout matrix.

## 22.3 Why not only Markdown

Markdown explains.

Structured manifest permits:

- validation;
- queries;
- coverage;
- stale detection;
- change propagation;
- Context Pack compilation.

---

# 23. Automated checks

Initial validator detects:

- duplicate requirement IDs;
- missing parent;
- unresolved source;
- applicable requirement without allocation;
- MUST without verification method;
- Feature without parent;
- criterion without requirement;
- test/evidence ref missing;
- deferred without target;
- N/A without rationale;
- accepted requirement with incomplete coverage;
- stale source version;
- Capability Spec missing required section;
- Mission Contract missing parent criteria.

Future:

- code path ownership;
- changed files against traceability;
- generated Coverage Report freshness;
- Standard applicability;
- requirement impact on Context Packs;
- docs impact.

Automation checks completeness of relationships.

Human review checks whether relationships are correct.

---

# 24. Roles

## Operator

- approves Product Milestone contract;
- decides material scope/trade-offs;
- accepts deferral with product impact;
- validates outcome.

## MNFS Lead

- runs the method;
- owns coverage completeness;
- consolidates questions;
- prevents bypass of gates.

## Planner / Capability Author

- derives requirements;
- completes applicability;
- writes Capability Spec;
- proposes allocation.

## Architect / Reviewer

- reviews design coverage;
- challenges N/A/deferred;
- finds orphan requirements and speculative design.

## Writer

- realizes allocated requirements;
- declares deviations and docs impact.

## Verification Runner

- produces requirement-linked Receipts.

## QA Actor

- validates higher-level outcome.

## Documentation Maintainer

- validates owners, relations and sources.

---

# 25. Decision rules

## 25.1 No blank cells

Every concern and requirement is:

- addressed;
- deferred;
- N/A;
- blocked;
- superseded.

Never blank.

## 25.2 No unowned deferment

Deferred requires:

- target Product Milestone;
- owner;
- risk;
- rationale.

## 25.3 No Feature without lineage

Every Feature traces upward.

## 25.4 No MUST without proof

Every MUST has proof planned before approval.

## 25.5 No design without requirement

Material design element traces to:

- requirement;
- risk;
- Standard;
- enabling constraint.

## 25.6 No test theater

Verification must prove a requirement or failure mode.

## 25.7 No closure from child count

Validation of parent outcome remains required.

---

# 26. Example — M2

## 26.1 Source clauses

```text
PB-P3   Claim is not Verdict
PB-P6   Integration/composition honesty
PB-P14  Authority and isolation
PB-8    Recovery and reconcile
PB-9    Current Authority Snapshot
PB-10   E1 Security Environment
PB-12   M2 Golden Proof
ADR-0002 SQLite state
ADR-0003 Worktree per Track
```

## 26.2 Derived requirements

```text
CAP-EXEC-REQ-001
One Write Track has at most one active current Attempt.

CAP-EXEC-REQ-002
Worker exit shall not accept the Claim.

CAP-EXEC-REQ-003
Claim and Event shall commit atomically.

CAP-EXEC-REQ-004
Fresh Lead shall recover state without transcript.

CAP-EXEC-REQ-005
Lease release shall be fenced and idempotent.

CAP-EXEC-REQ-006
Worker shall execute in the leased worktree.

CAP-EXEC-REQ-007
Worker shall execute under the frozen E1 policy.

CAP-EXEC-REQ-008
Network and credentials shall be absent.

CAP-EXEC-REQ-009
Sandbox failure shall fail closed.

CAP-EXEC-REQ-010
Only Gate acceptance shall transition Claim to accepted.
```

## 26.3 Allocation

```text
MIS-002 Mission AC
→ complete secure execution/recovery outcome

MIS-002/M01 AC
→ durable state and Lease correctness

MIS-002/M02 AC
→ real Worker, E1 security and fresh-Lead recovery

Features
→ adapter/state/worker/gate bounded behavior
```

## 26.4 Design

```text
LeaseService
WorkerService
SandboxPolicyResolver
PiProcessAdapter
ClaimService
RecoveryService
MinimalVerificationService
```

## 26.5 Verification

```text
unit FSM tests
transaction tests
Treehouse real acceptance
AS-02 security scenarios
DR-01 Lead crash
DR-03 duplicate Lease
DR-11 exit without Claim
fresh-process WSL2 Golden Proof
```

## 26.6 Result

Se `CAP-EXEC-REQ-007` não tiver:

- allocation;
- design;
- AS-02 Evidence;

o M2 Planning Coverage fica bloqueado.

Não depende de o Lead “lembrar da Section 10”.

---

# 27. Integração com o Roadmap

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
how to allocate requirements
how to trace implementation
how to close with Evidence
```

O Capability Spec define:

```text
complete reusable design
```

O Mission Contract define:

```text
what is committed now
```

O Microdesign define:

```text
how the next Mission Milestone is implemented
```

---

# 28. Integração com o MNFS futuro

O próprio MNFS pode automatizar o método.

## 28.1 Planning Compiler

Inputs:

- Product Milestone;
- Blueprint version;
- ADR set;
- Standards;
- Profile;
- prior Evidence.

Outputs:

- Baseline Manifest;
- Applicability Matrix draft;
- requirement candidates;
- open questions;
- required Spikes;
- Planning Coverage Report.

## 28.2 Traceability Service

Maintains links and coverage states.

## 28.3 Readiness Gate Service

Evaluates R0–R8.

## 28.4 Change Impact Service

When a source changes:

```text
source requirement
→ impacted capabilities
→ impacted Missions
→ stale Packs
→ tests/evidence to rerun
```

## 28.5 Context Compiler

Uses the traceability graph to include only applicable content.

---

# 29. YAGNI implementation

## Now

Use:

- Capability Spec template;
- YAML traceability manifest;
- TypeScript validator;
- generated Coverage Report;
- human review;
- GitHub CI.

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
- hundreds of mandatory checklist rows.

---

# 30. Canonical files proposed

```text
docs/product/CAPABILITY-REALIZATION-METHOD.md

docs/capabilities/template.md

docs/capabilities/CAP-*/
├── SPEC.md
├── TRACEABILITY.json
└── COVERAGE.md          # generated
```

Global schemas:

```text
schemas/capability-traceability.schema.json
```

Validator:

```text
src/documentation/validate-traceability.ts
```

Names and locations remain subject to canonical publication design.

---

# 31. Addition to Documentation Impact

A material change also declares:

```yaml
requirements_impact:
  status: NONE | UPDATED | NEW_REQUIREMENT | REPLAN_REQUIRED
  affected:
    - CAP-...
    - MIS-...
  rationale: ...
```

This may later merge with Documentation Impact into a single Change Impact declaration.

---

# 32. Method governance

This method is an A4 Standard/Policy.

Changes:

- clarification → patch;
- new mandatory gate → material policy change;
- removal of bidirectional traceability → constitutional impact;
- tooling change without semantic change → implementation Decision.

The method itself must be evaluated.

Metrics:

- missing requirements found before implementation;
- requirements found late;
- orphan Feature rate;
- planning time;
- replan rate;
- false-completion rate;
- documentation drift;
- coverage false positives;
- Operator confidence.

If the method becomes ceremony without information gain, simplify it.

---

# 33. Adoption sequence

After Product Blueprint publication:

```text
1. Approve this method
2. Add it to Documentation Map
3. Create Capability Spec template
4. Create Traceability schema
5. Model M2 source requirements
6. Generate M2 Applicability Matrix
7. Generate M2 Planning Coverage Report
8. Replan MIS-002
9. Run R0–R4
10. Execute AS-02
11. Approve new MIS-002 revision
12. Start implementation only after R4 passes
```

---

# 34. Non-goals

This method is not:

- waterfall;
- big design up front for every line;
- a demand to fully specify distant Product Milestones;
- a universal compliance checklist;
- a substitute for iteration;
- a ban on discovery during implementation;
- a guarantee that requirements are correct;
- a graph database project;
- a reason to delay a tiny low-risk change.

Rigor is proportional to:

- impact;
- risk;
- irreversibility;
- architectural reach;
- number of consumers;
- external effect.

A tiny change may use a reduced lane while preserving lineage and proof.

---

# 35. Invariants

1. Every Product Milestone has a baseline.
2. Every domain in the Applicability Scan is assessed.
3. No blank applicability state.
4. Every applicable MUST has a unique ID.
5. Every requirement traces upward.
6. Every requirement is allocated or dispositioned.
7. Every deciding requirement has planned proof.
8. Every Feature traces to a parent outcome.
9. Every material design element has rationale.
10. Every Claim declares requirements addressed.
11. Every Evidence item has a target.
12. Every deferment has a future target and risk.
13. `NOT_APPLICABLE` requires rationale.
14. Requirements are traced bidirectionally.
15. Verification and Validation are distinct.
16. Parent validation is not child-count aggregation.
17. Change impact propagates through the graph.
18. A stale source can stale downstream artifacts.
19. Planning Readiness is a Gate, not an opinion.
20. Closeout requires complete deciding coverage.
21. Structured traceability is source; coverage report is projection.
22. Human review judges correctness of links.
23. Automation judges structural completeness.
24. The method scales rigor by risk.
25. The method is simplified when it adds ceremony without value.

---

# Decisão resumida

> **O MNFS Capability Realization Method transforma o Product Blueprint em execução através de um Coverage Graph bidirecional. Cada Product Milestone passa por Baseline, Applicability Scan, Requirements Derivation, Capability Spec, Mission Allocation, Microdesign, Continuous Coverage, Verification/Validation e Closeout. Todo requirement relevante é identificado, alocado, realizado e provado — ou recebe uma disposition explícita. Readiness Gates impedem que implementação comece com domains não avaliados, requisitos órfãos, critérios sem prova ou decisões ocultas. A primeira implementação será leve: Capability Spec, `TRACEABILITY.json`, validator TypeScript e Coverage Report gerado. Assim, a Harness não depende de alguém lembrar os 13 capítulos; o próprio sistema demonstra o que foi levado em conta e o que ainda falta.**

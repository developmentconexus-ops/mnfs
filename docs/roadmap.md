---
id: DOC-CAPABILITY-ROADMAP
title: MNFS Capability Roadmap
document_type: product_roadmap
form: reference
authority: generated_projection
status: generated
version: 2.0.0
owners:
  - developmentconexus-ops
generated_from:
  - DOC-PRODUCT-BLUEPRINT-12
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
---

<!-- GENERATED — DO NOT EDIT
Source: docs/product/blueprint/12-capability-roadmap.md
Generator: scripts/generate-roadmap.mjs
Generator version: 2
-->

# MNFS capability roadmap

**Status:** M2 Opportunity Replan — Architecture Realization Review  
**Version:** 2.0.0  
**Current program:** ARR-S0 → ARR-S1/ARR-S2 → conditional ARR-S2W → ARR-S3 → evidence-backed M2 Replan  
**Exact execution authority:** see `docs/tracking/STATUS.md`

> Edit the canonical Product Blueprint Section 12 and regenerate this projection. The roadmap describes product/program sequence; the exact bounded execution gate is tracking authority and must not be hard-coded here.

---

## ARR-RECONCILIATION-2026-08-07 — Current M2 Opportunity-Replan path

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

Product M2 preserves the secure one-Worker vertical-slice outcome while its realization follows the accepted Architecture Realization Review path:

```text
ARR-S0  Host Capability Probe
→ ARR-S1 Agent Runtime Conformance
  + ARR-S2 Local Execution Envelope Conformance
→ ARR-S2W Workspace comparison only if S2 requires it
→ ARR-S3 Vertical Composition Proof
→ substrate selection Decision
→ superseding CAP-EXECUTION / MIS-002 Replan
→ new M02 R5 Execution Design + implementation plan
```

Revision-5 M02 is a superseded execution path and must not be implemented. Named runtimes/environments remain candidates or historical Evidence until their deciding spike/Decision.

---

# 12. Roadmap de Capacidades e Ordem de Implementação

## 12.1 Propósito

Esta seção transforma o Product Blueprint em uma sequência de implementação capaz de:

- entregar valor progressivamente;
- provar as decisões arquiteturais;
- impedir abstrações prematuras;
- evitar que a plataforma cresça antes do fluxo principal funcionar;
- preservar o que já foi implementado;
- reconciliar contratos anteriores com a arquitetura atual;
- distinguir compromisso de direção estratégica;
- manter cada avanço verificável;
- permitir mudança de ordem baseada em Evidence;
- impedir que datas ou listas de componentes substituam resultados.

O roadmap não é uma lista fixa de features.

Ele é:

> **Uma sequência de capacidades cumulativas, cada uma encerrada por uma prova ponta a ponta que reduz um risco específico do produto.**

A unidade principal é o **Product Roadmap Milestone**.

Ele é diferente de um Milestone interno de Mission.

```text
Product Roadmap:
M2 — Secure One-Worker Vertical Slice

Mission:
MIS-002/M01
MIS-002/M02
```

Essa distinção é obrigatória em toda documentação.

---

# 12.2 Base de pesquisa

A estrutura do roadmap foi construída a partir de:

- walking skeleton;
- vertical slicing;
- evolutionary architecture;
- architecture fitness functions;
- minimum viable platform;
- platform-as-a-product;
- Golden Paths;
- paved roads;
- safety nets;
- guardrails;
- manual checkpoints;
- DORA platform-engineering capabilities;
- Backstage Software Templates;
- roadmaps orientados a outcomes e proofs.

A análise completa está registrada em:

```text
MNFS-RESEARCH-CAPABILITY-ROADMAP-v1.md
```

## 12.2.1 Princípios extraídos

### Walking skeleton

Primeiro provar o fluxo completo com profundidade mínima.

### Vertical slice

Cada Product Milestone atravessa as camadas necessárias para demonstrar uma capacidade observável.

### Evolutionary architecture

Arquitetura evolui com feedback, fitness functions e decisões explícitas.

### Minimum viable platform

Começar pelo workflow mais importante e construir apenas o suficiente para torná-lo demonstravelmente melhor.

### Platform as product

O valor é medido por task success, confiabilidade, segurança, carga cognitiva e experiência do usuário da plataforma.

### Golden Path growth

```text
fixed path
→ one real Golden Path
→ small proven catalog
→ multi-repository platform
```

Não começar pelo catálogo.

---

# 12.3 Limitações do roadmap anterior

O roadmap inicial M0–M6 foi uma boa espinha dorsal para iniciar o projeto.

Ele estabeleceu:

```text
M0 Foundation
M1 Visual Planning
M2 One Worker
M3 Review
M4 Parallelism
M5 Adaptive Quality
M6 Delivery and Calibration
```

Entretanto, foi criado antes das decisões atuais sobre:

- Domain Model canônico;
- critérios obrigatórios em Mission, Milestone e Feature;
- Engineering System;
- Repository Profile;
- Golden Paths;
- Context Packs;
- memória observacional;
- Security Environments;
- Credential Grants;
- External Effects;
- Evidence Bundles;
- Operator Control Plane;
- OpenTelemetry;
- Evaluation e Calibration;
- multi-repository Software Factory;
- remote/cloud execution.

Ele não deve ser descartado.

Deve ser **evoluído preservando sua intenção**.

---

# 12.4 Avaliação do estado atual

## 12.4.1 M0 — Foundation Walking Skeleton

Estado:

```text
ACCEPTED
```

Capacidades comprovadas:

- canonical WSL2 environment;
- doctor;
- Repository Identity;
- runtime fora dos worktrees;
- SQLite;
- Mission persistence;
- fresh-process recovery;
- CLI;
- tests.

Golden proof já executado:

```text
initialize repository
→ open Mission
→ terminate process
→ new process reads same Mission
```

## 12.4.2 M1 — Visual Mission Planning

Estado:

```text
ACCEPTED
```

Capacidades comprovadas:

- structured Mission Plan;
- revisions;
- canonical content hash;
- deterministic HTML;
- Lavish review;
- feedback loop;
- exact-hash approval;
- Approved Contract materialization.

## 12.4.3 MIS-002 revision 3

Estado histórico:

```text
APPROVED UNDER THE PRE-BLUEPRINT ARCHITECTURE
```

O contrato continua válido como registro histórico.

Ele não deve ser editado silenciosamente.

Entretanto, ficou **arquiteturalmente stale** porque não inclui integralmente:

- Milestone Acceptance Criteria;
- Feature identity plenamente qualificada;
- Attempt identity;
- Worker Run identity;
- Environment Profile;
- local sandbox boundary;
- policy hash;
- Current Authority Snapshot;
- Intent–Action–Observation completo;
- fencing;
- expanded Recovery taxonomy;
- fail-closed security;
- Effect default;
- Security drill.

Também exclui explicitamente isolamento além de worktree, o que conflita com o princípio atual:

```text
one Pi Worker
≠ unrestricted user process
```

Conclusão:

```text
MIS-002 revision 3
→ preserve
→ supersede through Replan
→ never mutate in place
```

---

# 12.5 Unidade do roadmap

## 12.5.1 Product Roadmap Milestone

Entrega uma capacidade reutilizável do MNFS.

Cada Product Milestone contém:

```text
Outcome
Operator-visible value
Entry Criteria
Capabilities
Golden Proof
Exit Criteria
Non-goals
Dependencies
Architecture Spikes
Telemetry Baseline
Replan Triggers
```

## 12.5.2 Architecture Spike

Investiga uma incerteza material.

Produz:

- Research Report;
- tested candidate;
- evidence;
- recommendation;
- ADR;
- Removal Conditions.

Não é delivery.

## 12.5.3 Enabler

Capacidade interna pequena necessária por um slice.

Precisa possuir consumidor nomeado.

## 12.5.4 Golden Proof

É o cenário real que demonstra a capacidade do Product Milestone.

Não é somente uma test suite.

Pode combinar:

- automated tests;
- canonical environment;
- real adapter;
- failure drill;
- fresh process;
- Evidence Bundle;
- Operator observation.

---

# 12.6 Estados de confiança

## ACCEPTED

Implementado, verificado e encerrado.

## COMMITTED

É o próximo Product Milestone e possui contrato próximo ou aprovado.

## PLANNED

Sequência e outcome são conhecidos.

O Mission Contract detalhado será criado próximo da execução.

## TARGET

Direção desejada com dependências identificadas.

Pode ser dividida ou reordenada.

## OPTION

Possibilidade estratégica.

Não é compromisso.

## DEFERRED

Explicitamente fora dos horizontes atuais.

## REMOVED

Retirado do roadmap com rationale.

---

# 12.7 Horizontes atuais

## H0 — Proven Foundation

```text
M0 Foundation Walking Skeleton      ACCEPTED
M1 Visual Mission Planning          ACCEPTED
```

## H1 — Trusted Local Harness

```text
ARR P1 constitutional reconciliation
→ ARR-S0 Host Capability Probe
→ ARR-S1 Agent Runtime Conformance
  + ARR-S2 Local Execution Envelope Conformance
→ conditional ARR-S2W Workspace Conformance
→ ARR-S3 Vertical Composition Proof
→ substrate-selection Decision
→ CAP-EXECUTION / MIS-002 Opportunity Replan
→ new M02 R5 Execution Design + implementation
→ M2 Golden Proof
```

## H2 — Complete Local Software Factory

After M2, capabilities expand only from proven consumers: Repository Profile/Engineering System, independent Review/Integration, parallel tracks, adaptive Quality/QA, governed Effects/Delivery, Observability/Evaluation/Calibration.

## H3 — Platform Expansion

Web/operator surfaces, multi-repository operation and remote/cloud execution remain options/targets whose contracts are created only when earlier local capabilities prove the need.

Horizonte representa confiança e dependency order, não data.

---

# 12.8 Visão resumida

| Item | Nome | Estado atual |
|---|---|---|
| M0 | Foundation Walking Skeleton | `ACCEPTED` |
| M1 | Visual Mission Planning | `ACCEPTED` |
| ARR-P1 | Architecture / constitutional reconciliation | `CURRENT REVIEW / CORRECTION` |
| ARR-S0 | Host Capability Probe | `NEXT POSSIBLE GATED SPIKE` |
| ARR-S1 | Agent Runtime Conformance | `PLANNED AFTER S0` |
| ARR-S2 | Local Execution Envelope Conformance | `PLANNED AFTER S0` |
| ARR-S2W | Workspace Conformance | `CONDITIONAL` |
| ARR-S3 | Vertical Composition Proof | `PLANNED AFTER S1/S2(/S2W)` |
| M2 | Secure One-Worker Vertical Slice | `OPPORTUNITY_REPLAN` |
| M3 | Repository Profile and Engineering System | `PLANNED AFTER M2` |
| M4 | Independent Review and Integration | `PLANNED` |
| M5 | Parallel Write Tracks | `PLANNED` |
| M6 | Adaptive Quality and Live QA | `PLANNED` |
| M7–M9 | Effects, Delivery, Observability/Evaluation | `TARGET` |
| M10–M12 | Web, multi-repository, remote/cloud | `OPTION / TARGET` |

The exact current execution gate lives in `docs/tracking/STATUS.md`; this roadmap never hard-codes a transient Operator authorization.

---

# 12.9 Current ARR decision program

## ARR-S0 — Host Capability Probe

Produces immutable host facts and coarse capability classes for the canonical WSL2 host. It does not install candidates and does not select a runtime/environment winner.

## ARR-S1 — Agent Runtime Conformance

Freezes a candidate-independent contract after S0, refreshes primary-source provenance, and compares only runtime shapes that can alter the decision. Recovery cannot depend on Session/transcript.

## ARR-S2 — Local Execution Envelope Conformance

Uses the same fixture/criteria across eligible process-envelope and microVM-class candidates. It proves host-read/write denial, network/credential posture, containment, fail-closed behavior, workspace semantics, Git fidelity, recovery and cleanup.

## ARR-S2W — Workspace Conformance, conditional

Exists only if the selected envelope still needs a separate workspace substrate. Do not stack an extra workspace manager when the environment already supplies sufficient private mutable workspace semantics.

## ARR-S3 — Vertical Composition Proof

```text
accepted fixed Spike contract
→ provider-neutral M01 semantic core
→ selected Agent Runtime
→ selected Execution Environment/workspace
→ fixed repository change
→ Claim(baseCommitSha,resultTreeSha)
→ terminate Lead
→ Fresh Lead Recovery
→ deterministic Receipt
→ MNFS Gate
→ accepted Git result
→ idempotent resource disposition
```

S3 is architecture Evidence, not production M02.

---

# 12.10 M2 — Secure One-Worker Vertical Slice

## Estado

```text
OPPORTUNITY_REPLAN
```

## Outcome preservado

A single bounded Writer:

```text
receives a fresh Authority Snapshot and fixed contract
→ executes through the selected Agent Runtime
→ mutates only its isolated mutable workspace inside the approved Execution Environment
→ produces a durable Claim bound to baseCommitSha/resultTreeSha
→ survives Lead death through Fresh Recovery
→ is independently verified by runner-owned Receipt(s)
→ is accepted only by an MNFS Gate
→ yields an accepted provider-neutral Git result
→ resources are safely and idempotently dispositioned
```

## Realization rules

- Worker completion is never acceptance.
- Runtime Session/transcript is never recovery authority.
- Agent Runtime, workspace substrate and Execution Environment are selected by post-Spike Decision, not by this Product outcome.
- Protected execution fails closed.
- Raw production credentials are denied for the M2 proof.
- Current network posture is contract-bound and deny-by-default for the local proof.
- Result identity remains Git-provider-neutral.
- M01 durable WriteTrack/Attempt/WorkerRun/Claim/fencing semantics are reused where provider-neutral; prior Pi/Treehouse specifics remain historical Evidence.

## Entry before production implementation

- ARR P1 accepted/integrated or exact base includes its accepted tree;
- ARR-S0/S1/S2 and any applicable S2W accepted;
- ARR-S3 accepted;
- substrate selection Decision published;
- superseding CAP-EXECUTION and MIS-002 revision approved;
- new M02 R5 Execution Design and implementation plan approved.

## Golden Proof

The production M2 proof must reproduce the semantic flow established by ARR-S3 using the selected concrete realizations and current authority, including failure/recovery drills and independent Gate acceptance.

## Non-goals

- generic provider/plugin framework without a second consumer;
- arbitrary production Effects;
- multiple parallel Writers;
- Web Console;
- remote/cloud control plane unless separately selected later.

---

# 12.11 Later Product Milestones

The original M3–M12 outcomes remain directional, but their detailed contracts are intentionally deferred until M2 Evidence exists. Their ordering principle remains:

```text
Repository-aware engineering governance
→ independent Review / Integration
→ safe parallelism
→ adaptive Quality / live QA
→ governed external Effects and Delivery
→ Observability / Evaluation / Calibration
→ richer Operator surfaces
→ multi-repository / remote expansion
```

No later milestone may retroactively turn a candidate substrate into constitutional semantics.

---

# 12.12 Historical roadmap realizations

The prior roadmap named AB1, AS-02 Local Pi Sandbox, Pi Session AS-01, Treehouse worktrees and fixed E1 as current steps. Those exact choices are preserved in Git history, accepted M01/AS-02 Evidence and superseded ADRs. They are not duplicated here as current roadmap authority because D-012 through D-015 superseded that realization path.

Historical Evidence remains usable for migration cost, incumbent comparison and regression constraints. It does not select a winner for ARR-S1/S2/S2W.

---

# 12.13 Roadmap invariants

1. Product outcomes are more stable than substrate choices.
2. Correctness is frozen before decomposition; realization is frozen before bounded execution.
3. Every Architecture Spike has a candidate-independent contract and deciding Evidence.
4. Same fixture/criteria apply to compared candidates; changing the contract invalidates prior comparison runs.
5. Product M2 cannot resume through revision-5 M02.
6. No Agent Runtime, workspace or Environment winner exists before selecting Decision.
7. S0 host facts are immutable Evidence; candidate eligibility is recomputed from fresh provenance.
8. S2W is conditional, not automatic.
9. S3 must use real selected realizations for deciding Evidence.
10. CAP-EXECUTION/MIS-002 Replan occurs after deciding Spikes, never by mutating accepted historical versions in place.
11. Later milestones receive detailed contracts only near execution.
12. Exact transient execution authority lives in STATUS/Operator gates, not in this generated roadmap.

---

# Decisão resumida da Seção 12

> **M0 e M1 permanecem aceitos. M2 preserva o outcome de um Writer local seguro, recuperável e aceito por Evidence, mas sua realização está em Opportunity Replan. O caminho corrente é ARR P1 → S0 → S1/S2 → S2W somente se necessário → S3 → substrate-selection Decision → CAP-EXECUTION/MIS-002 Replan → novo M02 R5 → M2. Pi, Treehouse, fixed E1 e os antigos AB1/AS-02/AS-01 permanecem historical/incumbent Evidence, não current roadmap authority.**

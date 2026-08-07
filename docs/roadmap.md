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
---

<!-- GENERATED — DO NOT EDIT
Source: docs/product/blueprint/12-capability-roadmap.md
Generator: scripts/generate-roadmap.mjs
Generator version: 1
-->

# MNFS capability roadmap

**Status:** Accepted architecture baseline  
**Version:** 2.0.0  
**Current gate:** AB1 — Architecture Baseline and Contract Reconciliation

> Edit the canonical Product Blueprint Section 12 and regenerate this projection.

---

## ARR-RECONCILIATION-2026-08-07 — Current M2 Opportunity-Replan path

This reconciliation block has precedence over older realization-specific wording in this section. Any conflicting tool-specific statement below is historical realization context, not current constitutional authority.

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

# 12.7 Horizontes

## H0 — Proven Foundation

```text
M0
M1
```

A intenção pode ser persistida e aprovada.

## H1 — Trusted Local Harness

```text
AB1
AS-02
M2
M3
AS-01
M4
```

Resultado:

- um Repository;
- local;
- um Writer;
- um Reviewer;
- execution segura;
- Repository-aware;
- recoverable;
- governed.

## H2 — Complete Local Software Factory

```text
M5
M6
M7
M8
M9
```

Resultado:

- parallel work;
- Integration;
- live QA;
- external effects;
- delivery;
- empirical Calibration.

## H3 — Platform Expansion

```text
M10
M11
AS-04
M12
```

Resultado:

- integrated Web Console;
- multi-repository platform;
- remote/cloud execution;
- teams and tenants.

Horizonte representa confiança.

Não representa data.

---

# 12.8 Visão resumida

| Item | Nome | Estado |
|---|---|---|
| M0 | Foundation Walking Skeleton | `ACCEPTED` |
| M1 | Visual Mission Planning | `ACCEPTED` |
| AB1 | Architecture Baseline and Contract Reconciliation | `CURRENT GATE` |
| AS-02 | Local Pi Sandbox on WSL2 | `PREREQUISITE` |
| M2 | Secure One-Worker Vertical Slice | `COMMITTED` |
| M3 | Repository Profile and Engineering System v1 | `PLANNED` |
| AS-01 | Pi Session Memory and Messaging | `PLANNED SPIKE` |
| M4 | Independent Review and Local Correction | `PLANNED` |
| M5 | Parallel Write Tracks and Integration | `PLANNED` |
| M6 | Adaptive Quality, Evidence and Live QA | `PLANNED` |
| M7 | Credentials, External Integrations and Effects | `TARGET` |
| M8 | Delivery, Closeout and Operational Proof | `TARGET` |
| M9 | Observability, Evaluation and Calibration | `TARGET` |
| M10 | Operator Web Console and DevEx | `OPTION` |
| M11 | Multi-Repository Software Factory | `OPTION` |
| AS-04 | Remote Execution Environment | `FUTURE SPIKE` |
| M12 | Remote Execution and Cloud Control Plane | `OPTION` |

---

# 12.9 AB1 — Architecture Baseline and Contract Reconciliation

## Estado

```text
CURRENT GATE
```

## Outcome

A arquitetura necessária para retomar implementação está documentada, reconciliada e versionada.

## Valor

Evita que M2 implemente uma versão localmente correta de uma arquitetura que já foi superada pelas decisões do Product Blueprint.

## Entry Criteria

- M0 accepted;
- M1 accepted;
- Issue arquitetural aberta;
- Product Blueprint em elaboração.

## Capabilities e deliverables

### AB1.C1 Product Blueprint

Seções 1–13.

### AB1.C2 Canonical supporting documents

- Domain Model;
- End-to-End Flows;
- Quality and Evidence;
- Research Maps;
- Documentation Map.

### AB1.C3 ADR set

Criar e consolidar, conforme as decisões aprovadas:

```text
ADR-0004 Memory strata
ADR-0005 Durable coordination versus transport
ADR-0006 Security planes
ADR-0007 Credential Grants and Effects
ADR-0008 Execution Environments
ADR-0009 Operator surfaces
ADR-0010 Telemetry and OTel
ADR-0011 Evaluation and Calibration
```

Outras ADRs podem ser separadas se o conteúdo ficar amplo demais.

### AB1.C4 Roadmap v2

Substituir o roadmap raso atual.

### AB1.C5 Contract reconciliation

- preservar MIS-002 revision 3;
- abrir Replan;
- gerar nova revision;
- revisar visualmente;
- aprovar novo hash.

### AB1.C6 Documentation authority map

Definir:

- source of truth;
- owner;
- update triggers;
- review cadence;
- relationship between docs.

## Golden Proof

Um novo Lead, sem o transcript desta conversa, consegue:

1. localizar o Product Blueprint;
2. entender o estado do produto;
3. identificar o próximo Product Milestone;
4. localizar os ADRs;
5. explicar por que MIS-002 precisa de Replan;
6. iniciar o processo correto sem inventar arquitetura.

## Exit Criteria

- Seções 1–13 aprovadas;
- nenhuma contradição material entre Blueprint, ADRs e roadmap;
- Roadmap v2 versionado;
- M2 contract reconciliado ou formalmente aguardando AS-02;
- todos os novos conceitos possuem source of truth;
- old docs são atualizados, superseded ou marcados historical;
- next action é inequívoca.

## Non-goals

- implementar M2;
- escrever todos os capability specs futuros;
- definir todos os Standards;
- fechar cloud architecture;
- criar Web Console.

---

# 12.10 AS-02 — Local Pi Sandbox on WSL2

## Timing

```text
before the unrestricted M2 Worker proof
```

## Objetivo

Decidir se:

```text
Pi sandbox extension pattern
+
Anthropic Sandbox Runtime
+
Treehouse
+
WSL2
```

é uma boundary local suficiente para E1.

## Output

- acceptance test report;
- performance;
- bypass analysis;
- toolchain compatibility;
- policy;
- adapter recommendation;
- ADR-0006 decision.

## Blocking

M2 pode desenvolver partes puramente de domínio e fake adapters em paralelo.

A prova real do Worker não pode fechar antes do AS-02 ou de uma alternativa aprovada.

---

# 12.11 M2 — Secure One-Worker Vertical Slice

## Estado

```text
COMMITTED AFTER CONTRACT RECONCILIATION
```

## Outcome

Um único Pi Worker executa uma tarefa fixa e determinística dentro de:

- Treehouse worktree;
- approved E1 Environment;
- frozen Security Policy;

produz um Claim durável, sobrevive ao restart do Lead e é aceito somente por um MNFS Gate.

## Valor para o Operator

O Operator pode delegar uma tarefa bounded sem:

- perder state;
- confiar no texto do processo;
- depender do transcript;
- conceder autoridade total do usuário;
- administrar worktree manualmente.

## Entry Criteria

- AB1 closed;
- new MIS-002 revision approved;
- ADRs aplicáveis;
- Treehouse healthy;
- Pi version pinned;
- AS-02 accepted ou equivalent boundary approved;
- fixed demo task;
- canonical WSL2 healthy;
- milestone and feature criteria present.

## Capability slices

### M2.C1 Qualified execution identity

- `MIS-002/M01/F01`;
- Write Track;
- Attempt;
- Worker Run;
- Claim;
- version fields;
- typed errors.

### M2.C2 Treehouse Lease

- Intent;
- acquire;
- inspect;
- release;
- fencing;
- idempotency;
- orphan detection.

### M2.C3 Minimal Local Security Profile

- E1 Environment;
- policy hash;
- explicit `cwd`;
- `shell: false`;
- environment allowlist;
- write allowlist;
- sensitive read deny;
- network off;
- no credentials;
- X0/X1 only;
- no fail-open.

### M2.C4 Fixed Writer Pack

- Current Authority Snapshot;
- qualified target;
- contract hash;
- task;
- write-set;
- output contract;
- Claim command;
- security policy ref;
- termination condition.

### M2.C5 Pi Worker Process Adapter

- start;
- observe;
- cancel;
- logs;
- process identity;
- Session ref when available;
- exit classification;
- no transcript parsing.

### M2.C6 Durable Claim

- Claim transaction;
- Claim Event;
- worker completion;
- no acceptance;
- result tree;
- criteria refs.

### M2.C7 Minimal verification and Gate

- deterministic demo check;
- Receipt;
- explicit Claim acceptance;
- wrong SHA and invalid transition rejection.

### M2.C8 Recovery

- fresh Lead;
- Lease/Attempt/Worker Run/Claim reconcile;
- late result protection;
- no duplicate;
- divergence report;
- recommended next action.

## Golden Proof

```text
initialize canonical repository
→ approve reconciled MIS-002
→ grant Treehouse Lease
→ create E1 Environment
→ launch sandboxed Pi Worker
→ Worker performs fixed edit
→ Worker opens and completes Claim
→ kill Lead
→ start fresh Lead
→ recover same Track, Lease, Attempt, Worker Run and Claim
→ verify protected sentinels were inaccessible
→ execute deterministic verification
→ accept Claim through Gate
→ release Environment and Treehouse Lease idempotently
```

## Required failure drills

- duplicate Lease;
- orphan worktree;
- Lease without worktree;
- Worker exit without Claim;
- Lead crash;
- late completion;
- stale Claim;
- sandbox unavailable;
- sandbox violation;
- release repeat.

## Exit Criteria

- Mission Criteria satisfied;
- all M2 Mission Milestone Criteria satisfied;
- all Feature Criteria satisfied;
- no host escape;
- no secret access;
- network denied;
- no duplicate Claim;
- no transcript parsing;
- no Herdr dependency;
- fresh-process WSL2 proof;
- human and JSON CLI stable;
- Evidence preserved;
- release idempotent.

## Non-goals

- arbitrary task text;
- independent Reviewer;
- multiple Workers;
- Integration queue;
- OM;
- `pi-link`;
- Web Console;
- remote Environment;
- production effect;
- generic Engineering System.

## Replan Triggers

- AS-02 fails;
- Treehouse lifecycle differs materially;
- Pi process cannot be observed safely;
- fixed task cannot prove boundaries;
- security exceptions become broad;
- Claim schema requires contract change.

---

# 12.12 M3 — Repository Profile and Engineering System v1

## Estado

```text
PLANNED
```

## Outcome

MNFS consegue compreender um Repository, selecionar um Golden Path e executar uma Feature real sem depender de tarefa hardcoded ou prompt manual reconstruído.

## Valor para o Operator

A Harness deixa de ser uma demonstração e se torna útil para um workflow real do Repository.

## Entry Criteria

- M2 accepted;
- one real Repository or realistic fixture;
- stable E1 boundary;
- one recurring task class selected.

## Capabilities

### M3.C1 Bootstrap

- stack detection;
- command discovery;
- architecture clues;
- contracts;
- Environments;
- external systems;
- open questions.

### M3.C2 Repository Profile v1

- build/test/typecheck;
- modules;
- protected paths;
- resource declarations;
- Environment bindings;
- live QA capability;
- ratified assumptions.

### M3.C3 Standards Registry v1

Candidates:

```text
CORE-001
ARCH-001
TEST-001
INT-001
SEC baseline
```

### M3.C4 Golden Path v1

Preferred:

```text
GP-BUGFIX
```

Rationale:

- high frequency;
- bounded;
- regression proof;
- low external effect;
- exercises real context.

Alternative `GP-API-ENDPOINT` requires a stronger fixture justification.

### M3.C5 Context Compiler v1

- Current Authority Snapshot;
- Role Contract;
- Profile;
- Standards;
- Golden Path;
- code refs;
- command bindings;
- Security Profile.

### M3.C6 Fitness Runner v1

- command binding;
- Receipt;
- Standard mapping;
- actionable diagnostics.

### M3.C7 Real Writer

- non-hardcoded Feature;
- Profile-driven;
- Claim;
- deterministic proof.

### M3.C8 Context Index v1

- Artifacts;
- Profile sections;
- symbols and paths;
- exact refs;
- no vector database.

## Golden Proof

Onboard um segundo Repository ou fixture realista, compilar Profile, selecionar o Golden Path e entregar um bug fix real com regression proof sem instruções hardcoded do MNFS.

## Exit Criteria

- nenhuma section obrigatória silenciosamente `OPEN`;
- Golden Path reduz trabalho manual;
- Context Pack é compilado;
- Fitness Functions produzem Receipts;
- new Session understands Repository from Artifacts;
- one real Feature accepted;
- no duplicate project-memory source.

## Non-goals

- large Standards catalog;
- multiple Golden Paths;
- semantic search;
- remote execution;
- independent Reviewer;
- portal.

## Replan Triggers

- Profile becomes repository ontology;
- Golden Path only works for MNFS itself;
- code discovery requires unbounded LLM scan;
- Standards cause high false-positive rate.

---

# 12.13 AS-01 — Pi Session Memory and Messaging

## Timing

```text
end of M3
```

## Reason

Antes de avaliar Observational Memory, precisamos ter:

- Current Authority Snapshot;
- Handoff Pack;
- Context Pack;
- exact domain state;
- Role isolation.

## Output

- native compaction baseline;
- `pi-observational-memory` result;
- cost;
- false-memory test;
- Role policy;
- ADR-0004;
- decision on `pi-link`.

AS-01 não bloqueia M4 se o fallback permanecer Pi native compaction.

---

# 12.14 M4 — Independent Review and Local Correction

## Estado

```text
PLANNED
```

## Outcome

Um Claim é avaliado por um Reviewer independente, rejeitado com Findings confirmados, corrigido na mesma Write Track válida e aceito por delta verification.

## Valor para o Operator

A Harness encontra e corrige problemas sem exigir review manual do Operator nem restart amplo da Feature.

## Entry Criteria

- M3 accepted;
- stable Context Packs;
- result tree identity;
- deterministic runner;
- Role isolation;
- review target and rubric.

## Capabilities

- risk classification v1;
- Review Pack;
- cold Reviewer;
- Finding;
- severity;
- anchor-or-abstain;
- Verdict;
- contested flow;
- Correction Contract;
- new Attempt;
- same worktree reuse;
- same Session reuse when valid;
- delta verification;
- anti-loop v1;
- Reviewer telemetry.

## Golden Proof

Uma Feature deliberadamente defeituosa passa pelos checks locais do Writer, é rejeitada pelo Reviewer por um Finding confirmado, corrigida no mesmo Track e aceita após re-review do delta.

## Exit Criteria

- Reviewer não recebe Writer OM;
- Finding possui locus e Evidence;
- Reviewer não implementa;
- Correction não amplia scope;
- old Claim remains historical;
- new tree receives new Evidence;
- retry bounded;
- operator not interrupted for local correction.

## Non-goals

- dual Review universal;
- multiple Tracks;
- browser QA;
- full risk compiler;
- model voting.

## Replan Triggers

- Review Findings mostly mechanical;
- Reviewer context becomes unbounded;
- same-worktree correction contaminates Evidence;
- repeated false positives.

---

# 12.15 M5 — Parallel Write Tracks and Integration

## Estado

```text
PLANNED
```

## Outcome

Duas Write Tracks independentes executam em paralelo, respeitam ownership e resources, e compõem um candidate verificável num workspace limpo.

## Valor para o Operator

O MNFS obtém concurrency real sem perder trabalho, esconder conflitos ou depender de merge manual tardio.

## Entry Criteria

- M4 accepted;
- stable Claim/Correction;
- resource declarations;
- Integration Criteria;
- two suitable Features.

## Capabilities

- write-set ownership;
- seam ownership;
- two Workers;
- Environment per Track;
- resource reservation mínimo;
- concurrency/fencing;
- serial Integration queue;
- clean Integration workspace;
- base CAS;
- merge order;
- conflict taxonomy;
- composition Receipts;
- Integration Verdict;
- worktree preservation;
- optional Herdr projection.

## Golden Proof

Duas Features disjuntas executam em paralelo, produzem Claims aceitos, integram serialmente e satisfazem um Milestone Criterion de composição.

Segundo cenário:

```text
semantic conflict
→ no automatic merge
→ explicit return to correction/replan
```

## Exit Criteria

- no write collision;
- resources isolated or serialized;
- accepted Track changed → stale;
- candidate reproducible;
- semantic conflict preserved;
- source worktrees retained;
- Herdr optional;
- Milestone Criteria prove composition.

## Non-goals

- Worker pool;
- scheduler;
- parallel Integration;
- remote Workers;
- auto-scaling;
- fleet UI.

## Replan Triggers

- resource isolation dominates implementation;
- integration queue requires distributed coordinator;
- two-Track proof does not generalize to the selected Repository.

---

# 12.16 M6 — Adaptive Quality, Evidence and Live QA

## Estado

```text
PLANNED
```

## Outcome

MNFS compila uma Gate DAG proporcional ao risco, decide critérios com Evidence fresca, valida comportamento user-facing e fecha a hierarquia corretamente.

## Valor para o Operator

O resultado entregue é provado no nível de produto, não somente no nível de arquivos ou testes locais.

## Entry Criteria

- M5 accepted;
- Integration candidate;
- criteria hierarchy;
- Environment binding;
- one user-facing flow.

## Capabilities

- full Acceptance Criterion model;
- STATIC/EXECUTABLE/LIVE/JUDGMENT;
- Verification Plan;
- Evidence Item;
- complete Receipt;
- freshness;
- staleness;
- adaptive Gate DAG;
- targeted second Reviewer;
- QA Journey;
- browser/API adapter;
- Evidence Bundle;
- hierarchical closure;
- accepted risk;
- anti-loop v2;
- false-completion taxonomy.

## Golden Proof

Uma user-facing capability atravessa múltiplos components, integra, executa QA real e fecha Feature, Milestone e Mission somente depois dos critérios próprios de cada nível.

Segundo cenário:

```text
Receipt created
→ code changes
→ Receipt becomes stale
→ closure is blocked
```

## Exit Criteria

- no `PASS_WITH_ASSUMPTION`;
- live seam is real;
- parent criteria separate;
- provenance resolves;
- stale Evidence rejected;
- QA failure creates Correction;
- Bundle explains acceptance;
- gate cost measured.

## Non-goals

- production deployment;
- universal browser suite;
- external observability backend;
- compliance platform;
- full credential broker.

## Replan Triggers

- gate stack adds no unique information;
- QA environment is not reproducible;
- Evidence volume becomes operationally excessive;
- live criteria cannot be bounded.

---

# 12.17 M7 — Credentials, External Integrations and Effects

## Estado

```text
TARGET
```

## Outcome

MNFS utiliza um provider sandbox ou shared non-production resource com credentials scoped e External Effect lifecycle durável.

## Valor para o Operator

Agentes passam a executar integrações úteis sem receber poder amplo de cloud, GitHub ou produção.

## Entry Criteria

- M6 accepted;
- stable Security Environment;
- Effect model;
- real sandbox provider;
- Credential Requirement defined.

## Capabilities

- Credential Requirement;
- Credential Grant;
- optional 1Password/SOPS binding;
- workload identity design;
- provider sandbox;
- Network Policy;
- Effect Request;
- Effect Executor;
- Effect Receipt;
- unknown-effect Reconcile;
- Security Violation;
- incident flow;
- Dev Container binding v1.

## Golden Proof

Um Actor solicita um efeito num provider sandbox, recebe credential temporária scoped por um executor separado, executa uma operação idempotente, registra Receipt e reconcilia um timeout simulado sem duplicar o efeito.

## Exit Criteria

- no secret in Packs/logs/OM;
- no production credential for Writer;
- correct Effect class;
- unknown effect reconciled;
- credential expires;
- network enforced;
- Evidence preserved;
- policy violation visible.

## Non-goals

- production automation;
- enterprise secret manager;
- universal multi-cloud broker;
- remote Workers.

## Replan Triggers

- provider lacks safe sandbox;
- credential delivery requires broad host exposure;
- Effect cannot be made observable or idempotent;
- network policy is too permissive.

---

# 12.18 M8 — Delivery, Closeout and Operational Proof

## Estado

```text
TARGET
```

## Outcome

Uma Mission aceita cria delivery artifact, passa por PR/CI, preserva Evidence e fecha com resultado operacional auditável.

## Valor para o Operator

O lifecycle termina em entrega verificável, não em código local aguardando trabalho manual.

## Entry Criteria

- M7 accepted;
- candidate integrated;
- delivery binding;
- Effect Authority;
- CI observable.

## Capabilities

- Delivery Gate;
- branch/PR Effect Request;
- optional no-mistakes adapter;
- CI observation;
- OIDC/workload identity when applicable;
- failed-delivery reconcile;
- Mission Evidence Bundle;
- Closeout;
- delivered SHA;
- release notes;
- known limitations;
- rollback/recovery;
- Quality Posture delta.

## Golden Proof

MNFS cria uma PR a partir do candidate, observa CI, processa uma falha, abre Correction, atualiza a PR e fecha a Mission somente após Evidence completa.

## Exit Criteria

- Effect Authority respected;
- CI binds candidate SHA;
- unknown state reconciled;
- closeout covers criteria;
- risks/Waivers included;
- work preserved;
- final summary accurate;
- delivery receipt present.

## Non-goals

- production deployment by default;
- all provider delivery adapters;
- organization-wide compliance;
- release train.

## Replan Triggers

- no-mistakes duplicates authority;
- CI cannot be correlated to SHA;
- provider API requires unsafe credentials;
- delivery dominates core architecture.

---

# 12.19 M9 — Observability, Evaluation and Calibration

## Estado

```text
TARGET
```

## Outcome

MNFS explica execuções por telemetria vendor-neutral, compara candidates em Golden Missions e altera policy através de Calibration Decisions.

## Valor para o Operator

A Harness passa a melhorar por Evidence, não por preferência, marketing de modelos ou intuição isolada.

## Entry Criteria

- M8 full flow;
- stable Domain Events;
- accepted Missions;
- dataset candidates;
- telemetry privacy policy.

## Capabilities

- `mnfs.*` semantic attributes;
- OpenTelemetry;
- OTLP;
- AS-03;
- Phoenix/Langfuse adapter decision;
- Golden Missions;
- Evaluation Result;
- deterministic/human/LLM evaluators;
- Experiment Run;
- segmentation;
- Calibration Candidate;
- Calibration Decision;
- shadow/canary/rollback;
- cost/quality scorecard;
- alert quality.

## Golden Proof

Executar a mesma Golden Mission sob duas configurações, comparar quality, false completion, cost e latency, aprovar candidate por Calibration Decision, aplicar em shadow/canary e fazer rollback quando um threshold de regressão for introduzido.

## Exit Criteria

- Domain State independent from backend;
- raw sensitive content off;
- reproducible experiments;
- Evaluation ≠ Verdict;
- no universal score;
- evidence-backed policy;
- rollback proven;
- coverage explicit.

## Non-goals

- autonomous self-tuning;
- individual engineer ranking;
- mandatory SaaS;
- enterprise DORA program;
- raw prompt warehouse.

## Replan Triggers

- backend maintenance exceeds value;
- OTel conventions unstable for required fields;
- evaluator agreement too low;
- datasets lack representative coverage.

---

# 12.20 M10 — Operator Web Console and DevEx

## Estado

```text
OPTION
```

## Outcome

O Operator controla o lifecycle local completo por uma interface Mission-first integrada aos mesmos Application Services da CLI.

## Valor para o Operator

A operação se torna mais visual e acessível sem sacrificar Authority, explainability e CLI automation.

## Entry Criteria

- M8 accepted;
- stable CLI JSON;
- stable Application Services;
- operator workflows measured;
- UI need proven.

## Capabilities

- local API;
- Mission Control;
- Mission Workspace;
- Decision Inbox;
- Execution;
- Quality/Evidence;
- Recovery;
- Security/Effects;
- Engineering System;
- Calibration Lab;
- Audit;
- notifications;
- Herdr attach;
- Lavish integration or replacement Decision.

## Golden Proof

O Operator conclui uma Mission pela Web Console e uma segunda client Session observa o mesmo estado via CLI, sem divergência ou frontend-owned rules.

## Exit Criteria

- no duplicated domain logic;
- consistent UI/CLI state;
- accessibility;
- usable latency;
- recoverable UI failure;
- actions show Authority;
- Evidence-first completion.

## Non-goals

- multi-tenant SaaS;
- mobile app;
- custom terminal emulator;
- Backstage dependency;
- frontend-only state machine.

## Replan Triggers

- CLI remains sufficient;
- user research does not show value;
- web server complicates local security;
- Application Services are not stable.

---

# 12.21 M11 — Multi-Repository Software Factory

## Estado

```text
OPTION
```

## Outcome

MNFS governa múltiplos repositories, reusable Golden Paths, ownership, documentation e Engineering Standards como produto de plataforma.

## Valor

A Harness evolui para Software Factory reutilizável.

## Entry Criteria

- multiple real Repositories;
- repeated Profile patterns;
- repeated Golden Paths;
- demand from multiple users/teams;
- local platform stable.

## Capabilities

- Repository Catalog;
- ownership;
- Profile inheritance;
- Golden Path Catalog;
- Software Templates;
- scorecards;
- documentation portal;
- cross-repo contracts;
- shared Standards;
- contribution model;
- notifications;
- permissions;
- AS-05.

## Golden Proof

Dois repositories materialmente diferentes são onboarded, usam Standards e Golden Paths compartilhados sem duplicação de configuration e entregam uma Feature cada.

## Exit Criteria

- platform not bottleneck;
- contribution model works;
- inheritance explainable;
- repository-specific bindings preserved;
- adoption and task success measured;
- portal not authority.

## Non-goals

- universal repository ontology;
- forced adoption;
- enterprise marketplace;
- remote multi-tenant compute.

## Replan Triggers

- only one Repository continues using MNFS;
- inheritance becomes more complex than explicit config;
- Backstage/custom portal has no proven customer.

---

# 12.22 AS-04 — Remote Execution Environment

## Timing

```text
before detailed M12 contract
```

## Candidates

- Daytona;
- E2B;
- VM provider;
- self-hosted runner.

## Questions

- persistent workspace;
- Pi integration;
- isolation;
- credentials;
- network;
- snapshots;
- cost;
- resume;
- filesystem;
- observability;
- reconcile;
- vendor lock-in.

## Output

- adapter recommendation;
- E3/E4 decision;
- threat model;
- cost model;
- migration path;
- Removal Conditions.

---

# 12.23 M12 — Remote Execution and Cloud Control Plane

## Estado

```text
OPTION
```

## Outcome

MNFS executa Workers remotamente com forte isolamento e shared control-plane state, preservando as semânticas do produto local.

## Valor

Suporta equipes, maior concurrency e untrusted workloads sem depender de uma máquina WSL2.

## Entry Criteria

- local Software Factory proven;
- scaling/security need;
- Environment Adapter stable;
- user/team requirements;
- cost model;
- AS-04.

## Capabilities

- remote Environment Adapter;
- Pi SDK/RPC host;
- PostgreSQL;
- object storage;
- outbox/queue;
- workload identity;
- E3/E4;
- users;
- teams;
- tenants;
- RBAC/capabilities;
- audit;
- quota;
- cost;
- cloud Recovery;
- remote telemetry.

## Golden Proof

Dois remote Workers executam Tracks isolados, sobrevivem ao restart do control plane, integram pelo mesmo Claim/Evidence/Gate model e não acessam filesystem, credentials ou tenant state um do outro.

## Exit Criteria

- local/remote semantics match;
- tenant isolation;
- delivery/reconcile;
- quotas;
- cost visibility;
- disaster recovery;
- no local-only assumptions;
- independent security review.

## Non-goals

- custom Firecracker platform;
- all clouds;
- unlimited autoscaling;
- complete compliance at first release.

## Replan Triggers

- local product does not need scale;
- cost does not justify remote;
- provider semantics leak into domain;
- security isolation cannot be proven.

---

# 12.24 Capability Dependency Graph

```text
M0 Foundation
        ↓
M1 Planning
        ↓
AB1 Architecture Baseline
        ↓
AS-02 Local Sandbox
        ↓
M2 Secure One Worker
        ↓
M3 Profile + Engineering System
        ↓
AS-01 Session Memory
        ↓
M4 Review + Correction
        ↓
M5 Parallel + Integration
        ↓
M6 Quality + Live QA
        ↓
M7 Credentials + Effects
        ↓
M8 Delivery + Closeout
        ↓
M9 Observability + Calibration
       ├──────────────────┐
       ↓                  ↓
M10 Web Console      M11 Multi-Repo Factory
       └──────────────┬──────────────────┘
                      ↓
                 AS-04 Remote
                      ↓
                 M12 Cloud
```

M10 e M11 podem trocar de ordem.

A decisão depende de:

- operator demand;
- number of repositories;
- number of users;
- CLI friction;
- adoption evidence.

---

# 12.25 Por que esta ordem

## 12.25.1 M2 antes do Engineering System genérico

Precisamos provar o loop físico real antes de generalizá-lo.

## 12.25.2 Engineering System antes de arbitrary tasks

Sem Profile e Golden Path, cada task vira prompt improvisado.

## 12.25.3 Review antes de parallelism

Primeiro aprender a julgar e corrigir uma Track.

Depois multiplicar Writers.

## 12.25.4 Parallelism antes do Quality System completo

Parallelism cria um problema real de composição para o Integration Gate e Milestone Criteria.

## 12.25.5 Quality antes de external effects

Antes de conceder credentials e network, o Harness precisa saber verificar resultados.

## 12.25.6 External Effects antes de Delivery

PR, CI e deploy são External Effects especializados.

## 12.25.7 Delivery antes de Calibration completa

Calibration precisa observar o lifecycle completo e outcomes reais.

## 12.25.8 CLI antes de Web Console

A interface visual deve compor contracts estáveis, não inventá-los.

## 12.25.9 Local antes de cloud

Cloud amplifica:

- state;
- security;
- cost;
- concurrency;
- operations.

As semânticas precisam estar provadas localmente.

---

# 12.26 Architecture Runway Policy

O MNFS constrói somente a arquitetura necessária para o próximo proof.

Exemplos:

```text
M2:
Minimal Security Profile
not full Credential Broker

M3:
Repository Profile v1
not universal repository ontology

M4:
one Reviewer path
not review marketplace

M5:
serial Integration queue
not distributed scheduler

M7:
one provider sandbox
not universal cloud adapter

M9:
optional OTLP
not observability platform
```

## Regra

Um Enabler sem consumidor no Product Milestone atual ou seguinte é candidato a deferimento.

---

# 12.27 Product Milestone Contract

Antes de iniciar cada Product Milestone, uma Mission ou conjunto de Missions precisa materializar:

- Product Milestone outcome;
- Mission hierarchy;
- criteria at all levels;
- proof;
- risks;
- non-goals;
- architecture spikes;
- tools;
- Removal Conditions;
- canonical environment;
- docs affected.

O Product Roadmap não substitui o Mission Contract.

---

# 12.28 Entry Gate

Um Product Milestone só inicia quando:

- dependencies estão accepted;
- critical Spikes foram decididos;
- contract é satisfatível;
- Environment existe;
- Golden Proof é executável;
- required tools estão disponíveis;
- Security baseline existe;
- documentação não contradiz o plano;
- Operator aprova o contrato aplicável.

---

# 12.29 Exit Gate

Um Product Milestone só fecha quando:

- seus próprios Acceptance Criteria são satisfeitos;
- Golden Proof foi executado;
- fresh Evidence existe;
- failure drills aplicáveis passam;
- Security/Recovery criteria passam;
- implementation e docs correspondem;
- ADRs estão atualizadas;
- non-goals permaneceram fora;
- assumptions do próximo Milestone foram reavaliadas.

Merge não é Exit Gate.

---

# 12.30 Release Strategy

## 12.30.1 Pre-1.0

O produto permanece pre-1.0 até possuir pelo menos:

- M8 accepted;
- end-to-end delivery;
- Recovery;
- Security;
- upgrade policy;
- one real Repository usage period.

## 12.30.2 Candidate 1.0

Possível definição:

```text
M0–M8 accepted
+
critical drills green
+
documentation complete
+
upgrade compatibility
+
real Repository evidence
```

M9 pode ser incluído se observability/calibration for considerada operabilidade essencial.

Isso será uma Decision futura.

## 12.30.3 SemVer

Milestones não precisam mapear um-para-um para versions.

Não prometer números agora.

---

# 12.31 Roadmap Change Protocol

Mudança de roadmap é uma Product Decision.

Registra:

- Evidence;
- reason;
- affected Product Milestones;
- dependencies;
- work preserved;
- work invalidated;
- new order;
- confidence state;
- risk.

## Mudanças permitidas

- split;
- merge;
- reorder;
- defer;
- remove;
- add;
- replace tool;
- change Golden Proof.

## Mudanças proibidas

- alterar accepted history silenciosamente;
- mudar outcome mantendo o mesmo nome sem Decision;
- começar downstream sem Entry Gate;
- adicionar ferramenta sem consumer;
- transformar Option em Commitment sem Evidence.

---

# 12.32 Tool Adoption Lifecycle

```text
RESEARCHED
→ CANDIDATE
→ SPIKE
→ PILOT
→ ADOPTED
→ DEPRECATED
→ REMOVED
```

Todo tool adotado possui:

- consumer;
- adapter;
- exact version;
- capability;
- proof;
- operational owner;
- Removal Conditions;
- replacement path.

---

# 12.33 Telemetry por horizonte

## H1

Medir:

- correctness;
- Worker/Lead Recovery;
- false completion;
- operator intervention;
- security violations;
- latency;
- token coverage.

## H2

Adicionar:

- conflict rate;
- Integration delay;
- parallel efficiency;
- Evidence coverage;
- QA defects;
- Effect unknowns;
- delivery stability;
- cost.

## H3

Adicionar:

- adoption;
- retention;
- task success;
- DevEx;
- Golden Path usage;
- cross-repo health;
- platform cost;
- DORA where applicable.

---

# 12.34 Immediate Execution Sequence

Após aprovação de Sections 12 e 13:

```text
1. Consolidate Product Blueprint
2. Write canonical GitHub documents
3. Create ADR-0004 through ADR-0012
4. Replace docs/roadmap.md
5. Create Documentation Map
6. Create capability-spec backlog
7. Preserve MIS-002 revision 3
8. Open Replan for MIS-002
9. Execute AS-02
10. Approve new MIS-002 revision
11. Begin M2 implementation
```

## Regra

Não começar a implementar M2 contra revision 3 e corrigir a arquitetura “durante o caminho”.

Isso recriaria drift logo após documentarmos como evitá-lo.

---

# 12.35 Non-goals

O roadmap não contém:

- datas inventadas;
- estimativas sem velocity;
- team allocation fictícia;
- commitment de cloud;
- obligation de Backstage;
- obligation de Phoenix ou Langfuse;
- universal Standards catalog;
- microservice plan;
- multi-year fixed design;
- every possible adapter;
- every possible Golden Path;
- automatic AI maturity level;
- marketing maturity score.

---

# 12.36 Invariantes do roadmap

1. Roadmap é orientado a capabilities.
2. Cada Product Milestone possui Golden Proof.
3. Cada Product Milestone possui critérios próprios.
4. Merge não fecha Product Milestone.
5. M0 e M1 permanecem accepted history.
6. MIS-002 revision 3 não é editada.
7. M2 exige contract reconciliation.
8. M2 não executa unrestricted Pi.
9. Security baseline precede real Writer proof.
10. Arbitrary tasks dependem de Repository Profile.
11. Review precede parallelism.
12. Parallelism possui Integration proof.
13. Live QA precede production-oriented effects.
14. External Effects precedem Delivery automation.
15. Delivery precede full Calibration.
16. CLI precede Web Console.
17. Local semantics precedem cloud.
18. Architecture Spike não é product delivery.
19. Tooling passa por adoption lifecycle.
20. Enabler possui consumer.
21. Horizon não é data.
22. Option não é commitment.
23. Roadmap change é Decision.
24. Accepted history não é reescrita.
25. Product Milestone e Mission Milestone não são confundidos.
26. Entry Gate precede implementation.
27. Exit Gate exige Evidence.
28. Non-goals são vinculantes.
29. Future capability não dita abstração prematura.
30. O roadmap é reavaliado após cada Product Milestone.

---

# Decisão resumida da Seção 12

> **O MNFS adota um roadmap de capacidades cumulativas e proofs, organizado em quatro horizontes. M0 e M1 permanecem aceitos. O próximo passo é o Architecture Baseline Gate AB1, seguido do AS-02 e de um M2 reconciliado e seguro. Repository Profile e Engineering System entram antes de tarefas arbitrárias; Review antes de paralelismo; paralelismo antes do Quality System completo; qualidade antes de External Effects; Delivery antes de Calibration; CLI antes de Web Console; local antes de cloud. Product Milestones possuem Entry Gate, Golden Proof, Exit Criteria e Non-goals. Architecture Spikes são decisões delimitadas, não entrega. O roadmap pode mudar por Evidence e Decision, mas nunca reescreve silenciosamente a história aceita.**

---

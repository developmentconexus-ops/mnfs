---
id: DOC-PRODUCT-BLUEPRINT-13
title: Governança Documental, Fontes de Verdade e Protocolo de Evolução
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
  - product blueprint section 13
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-07
tracking_issue: 6
---

## ARR-RECONCILIATION-2026-08-07 — Current development/documentation governance

This reconciliation block has precedence over older realization-specific wording in this section. Any conflicting tool-specific statement below is historical realization context, not current constitutional authority.

The Development Governance Method and accepted **Layered Agent Execution Planning** design govern how architecture inquiry, Decisions and bounded execution relate. MCRM remains the single Capability Realization lifecycle; execution-planning completeness is a derived projection rather than a second manual checklist.

The tooling registry is a projection of capability-realization Decisions, never architecture authority. Accepted Decisions/ADRs/specifications/contracts remain canonical sources; generated Blueprint/Roadmap/Coverage artifacts must be regenerated and checked from their editable sources.

Plan approval may be bound to exact reviewed hashes/blobs. Superseded historical documents are preserved as history instead of silently rewritten into a different decision.

---

# 13. Governança Documental, Fontes de Verdade e Protocolo de Evolução

## 13.1 Propósito

Esta seção define como o conhecimento do MNFS é:

- criado;
- classificado;
- revisado;
- aprovado;
- versionado;
- localizado;
- consumido;
- atualizado;
- superseded;
- arquivado;
- validado;
- promovido;
- mantido coerente com código e runtime.

O objetivo é impedir que:

- múltiplos documentos governem o mesmo conceito;
- uma conversa se torne arquitetura implícita;
- uma issue seja tratada como especificação;
- um tracking file seja tratado como doutrina;
- um Research Report seja tratado como decisão;
- uma decisão aceita seja silenciosamente reescrita;
- um Mission Contract aprovado seja editado manualmente;
- agentes precisem ler todos os documentos;
- AGENTS.md volte a carregar a doutrina inteira;
- o Product Blueprint se torne um Markdown monolítico impossível de manter;
- HTML gerado seja confundido com fonte;
- documentação fique verde na CI enquanto contradiz o produto;
- conhecimento rejeitado desapareça e seja redescoberto;
- documentação sem owner permaneça indefinidamente;
- código altere comportamento sem declarar impacto documental.

No MNFS:

> **Documentação canônica é parte do control plane do produto. Ela precisa de identidade, Authority, lifecycle, ownership, versionamento e checks, assim como o código.**

---

# 13.2 Base de pesquisa

Esta seção foi construída a partir de padrões e implementações de mercado, incluindo:

- Diátaxis;
- Architecture Decision Records;
- MADR;
- Kubernetes Enhancement Proposals;
- Python PEP lifecycle;
- RFC processes;
- Backstage TechDocs;
- docs-as-code;
- GitHub CODEOWNERS;
- repositories com proposal history preservada;
- presubmit checks para metadata e Markdown.

O relatório completo está registrado em:

```text
MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1.md
```

## 13.2.1 Conclusões principais

### Diátaxis

Tutorial, how-to, reference e explanation atendem necessidades diferentes.

Essa classificação governa a **forma de leitura**.

### ADR

Uma decisão arquitetural é registrada com:

- contexto;
- alternativas;
- escolha;
- consequências;
- rationale;
- supersession.

Essa classificação governa a **história decisória**.

### KEP/RFC

Uma capability não trivial exige:

- proposta comum;
- goals;
- non-goals;
- design;
- test plan;
- rollout;
- graduation;
- history;
- owners.

Essa classificação governa a **evolução do produto**.

### Docs as Code

A fonte vive com o produto, passa por Git review e gera projections.

### CODEOWNERS

Ownership documental pode participar do merge gate.

### PEP lifecycle

Rejected, superseded e withdrawn permanecem descobríveis.

O MNFS adota esses princípios sem importar toda a burocracia de grandes comunidades.

---

# 13.3 Documentação como sistema de governança

A documentação MNFS possui cinco propriedades obrigatórias.

## 13.3.1 Identity

Todo documento canônico possui ID estável.

## 13.3.2 Authority

O documento declara o que pode governar.

## 13.3.3 Lifecycle

O documento declara seu estado.

## 13.3.4 Ownership

Existe responsável por aceitar mudanças.

## 13.3.5 Validation

Estrutura, links, relações e projections são verificáveis.

## 13.3.6 Não basta existir

Um documento sem:

- owner;
- source-of-truth scope;
- update trigger;
- consumer;
- status;

é candidato a documentação morta.

---

# 13.4 Dois eixos de classificação

Documentos são classificados por dois eixos independentes.

## 13.4.1 Authority class

Define o que o documento governa.

## 13.4.2 Reader form

Define qual necessidade de leitura atende.

```text
Authority
×
Diátaxis form
```

Exemplos:

| Documento | Authority | Form |
|---|---|---|
| Product Blueprint | Constitutional | Explanation |
| CLI command reference | Reference | Reference |
| Run M2 locally | Guidance | How-to |
| Learn the Mission lifecycle | Guidance | Tutorial |
| ADR-0006 | Decision | Explanation |
| Security Standard | Standard | Reference + Explanation |
| Mission plan | Contract | Reference |
| Research report | Research | Explanation |

A forma não eleva Authority.

Um how-to nunca supera um ADR.

---

# 13.5 Classes de Authority

## A0 — Constitutional

Exemplos:

- Product Blueprint;
- Documentation Governance;
- constitutional invariants.

Pode governar:

- produto;
- domínio;
- authority hierarchy;
- source-of-truth model;
- non-goals;
- evolução geral.

## A1 — Decision

Exemplos:

- ADR;
- Calibration Decision;
- material Roadmap Decision.

Pode governar:

- uma escolha específica;
- suas alternativas;
- consequências;
- supersession.

## A2 — Specification

Exemplos:

- Capability Spec;
- Architecture Spike spec;
- schema specification;
- protocol specification.

Pode governar:

- design completo de uma capability;
- test plan;
- rollout;
- graduation.

## A3 — Contract

Exemplos:

- Approved Mission Contract;
- API contract;
- accepted Environment Spec;
- Closeout contract.

Pode governar:

- commitment scoped;
- critérios;
- exact version/hash;
- execução daquela unidade.

## A4 — Standard / Policy

Exemplos:

- Engineering Standard;
- Golden Path;
- Security Policy;
- Repository Profile binding.

Pode governar:

- regra aplicável;
- preferred path;
- enforcement;
- exception.

## A5 — Reference

Exemplos:

- CLI reference;
- schema reference;
- state-machine reference;
- compatibility matrix.

Pode governar:

- descrição exata da machinery atual.

Não define por que a machinery existe quando isso pertence a ADR ou Blueprint.

## A6 — Guidance

Exemplos:

- tutorial;
- how-to;
- runbook;
- contributor guide.

Pode governar:

- sequência recomendada de uso.

Não altera contrato nem arquitetura.

## A7 — Evidence

Exemplos:

- drill report;
- test report;
- accepted Evidence Bundle;
- benchmark result;
- closeout.

Pode governar:

- o que foi observado;
- sob quais condições;
- por quem;
- contra qual target.

## A8 — Tracking

Exemplos:

- GitHub issue;
- STATUS.md;
- implementation checklist;
- project board.

Pode governar:

- coordenação atual.

Nunca governa arquitetura isoladamente.

## A9 — Research / Historical

Exemplos:

- market research;
- legacy map;
- rejected proposal;
- superseded plan;
- historical field evidence.

Pode governar:

- histórico;
- análise;
- fontes;
- limitações.

Não se torna normative por existir.

## A10 — Generated Projection

Exemplos:

- aggregate Blueprint;
- review HTML;
- rendered site;
- generated API reference;
- diagram projection.

Não possui Authority independente.

Sua Authority deriva da fonte.

---

# 13.6 Hierarquia de Authority

Quando existe conflito:

```text
1. Accepted ADR específico para a decisão
2. Current Product Blueprint constitutional rule
3. Current accepted Capability Spec
4. Current Approved Contract para o scope
5. Current Standard / Policy / Repository Profile
6. Current implementation-derived Reference
7. Guidance
8. Tracking
9. Research / Historical
10. Generated Projection follows its source
```

Essa hierarquia não autoriza contradição silenciosa.

Conflito material produz:

```text
DOCUMENTATION_DIVERGENCE
```

Ações possíveis:

- corrigir doc stale;
- criar ADR;
- Replan;
- atualizar Capability Spec;
- bloquear dispatch;
- abrir Finding;
- aceitar risco documental temporário.

---

# 13.7 Regra “um conceito, um owner”

Cada conceito durável possui um documento proprietário.

| Conceito | Fonte proprietária |
|---|---|
| Product promise | Product Blueprint |
| Constitutional principles | Product Blueprint |
| Domain hierarchy | Product Blueprint / Domain Model section |
| Specific architecture decision | ADR |
| Complete reusable capability | Capability Spec |
| Product sequence | Roadmap |
| Scoped implementation commitment | Approved Mission Contract |
| Current runtime state | SQLite |
| Repository commands/bindings | Repository Profile |
| Engineering rule | Engineering Standard |
| Preferred path | Golden Path |
| CLI syntax | CLI reference/help |
| Current project coordination | Tracking |
| Observed proof | Evidence Artifact |
| Market/legacy analysis | Research Report |
| Implementation detail | Code + Reference |

Outros documentos:

- linkam;
- resumem;
- explicam;
- aplicam.

Não redefinem.

---

# 13.8 Fonte de verdade por storage

## 13.8.1 Git

Fonte canônica para:

- Product Blueprint;
- ADRs;
- Capability Specs;
- Roadmap;
- Standards;
- Golden Paths;
- Repository Profile source;
- Reference;
- Guidance;
- Research;
- accepted repository-owned Evidence;
- generated-source manifests.

## 13.8.2 `.mnfs/`

Fonte canônica para artifacts machine-readable que precisam acompanhar o Repository:

- Repository Identity;
- Approved Mission Contracts;
- promoted accepted Evidence;
- Closeouts;
- future machine manifests.

`.mnfs/` não é o lugar principal de prosa de produto.

## 13.8.3 SQLite

Fonte canônica operacional para:

- current lifecycle;
- active revisions;
- Attempts;
- Worker Runs;
- Claims;
- Receipts;
- Findings;
- Decisions;
- Events;
- Leases;
- runtime Artifact refs.

SQLite não define doutrina.

## 13.8.4 Runtime Artifact Store

Contém:

- logs;
- prompts;
- generated HTML;
- traces;
- screenshots;
- command outputs;
- temporary Evidence.

Promovido quando necessário.

## 13.8.5 GitHub issue e PR

Issue:

- problem/work container;
- discussion;
- tracking;
- links.

PR:

- proposed change;
- review vehicle;
- CI.

O resultado canônico está no documento merged, não no comentário.

## 13.8.6 Session e Observational Memory

Session:

- reasoning continuity;
- exact conversational history.

Observational Memory:

- supporting compressed context.

Nenhuma governa produto até promoção.

---

# 13.9 Layout documental proposto

```text
README.md
AGENTS.md
CONTRIBUTING.md
CHANGELOG.md

.github/
├── CODEOWNERS
├── pull_request_template.md
└── workflows/
    └── docs.yml

docs/
├── DOCUMENTATION-MAP.md
├── roadmap.md
│
├── product/
│   ├── README.md
│   ├── blueprint/
│   │   ├── 01-product-vision.md
│   │   ├── 02-domain-model.md
│   │   ├── 03-lifecycle-flows.md
│   │   ├── 04-engineering-system.md
│   │   ├── 05-system-architecture.md
│   │   ├── 06-roles-authority.md
│   │   ├── 07-quality-evidence.md
│   │   ├── 08-state-recovery.md
│   │   ├── 09-context-memory.md
│   │   ├── 10-security-isolation.md
│   │   ├── 11-operator-observability.md
│   │   ├── 12-capability-roadmap.md
│   │   └── 13-documentation-governance.md
│   └── PRODUCT-BLUEPRINT.md
│
├── adr/
│   ├── README.md
│   ├── template.md
│   └── 0001-*.md
│
├── capabilities/
│   ├── README.md
│   ├── template.md
│   └── CAP-*/
│       ├── SPEC.md
│       ├── TEST-PLAN.md
│       └── IMPLEMENTATION-HISTORY.md
│
├── standards/
├── golden-paths/
├── repository-profile/
├── reference/
├── how-to/
├── tutorials/
├── explanation/
├── research/
├── design/
├── tracking/
│   └── archive/
└── history/

.mnfs/
├── repo.json
├── missions/
│   └── MIS-*/
│       ├── plan.json
│       ├── accepted-evidence/
│       └── closeout.json
└── accepted-evidence/
```

## 13.9.1 YAGNI

Não criar diretórios vazios apenas para satisfazer o diagrama.

Criar cada diretório quando existir seu primeiro documento canônico.

---

# 13.10 Product Blueprint modular

O Blueprint completo cresceu para centenas de milhares de caracteres.

Um único arquivo como fonte editável causaria:

- conflitos;
- revisão ampla;
- difícil ownership;
- contexto excessivo;
- navegação ruim;
- maior risco de edição acidental.

Decisão:

```text
canonical editable source
→ 13 modular section files

generated publication
→ PRODUCT-BLUEPRINT.md
```

## 13.10.1 Source files

Cada Section:

- possui ID;
- metadata;
- own status;
- stable heading;
- relations;
- review triggers.

## 13.10.2 Aggregate

`PRODUCT-BLUEPRINT.md`:

- é generated;
- inclui warning;
- inclui version;
- inclui source hashes;
- não é editado diretamente;
- é verificado pela CI;
- é a versão conveniente para leitura e export.

## 13.10.3 Publication

Uma futura static site ou TechDocs consome as mesmas fontes.

O site nunca substitui Git.

---

# 13.11 Metadata schema

Documentos canônicos Markdown usam frontmatter estruturado quando aplicável.

```yaml
---
id: DOC-PRODUCT-BLUEPRINT-01
title: Product Vision
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
  - product promise
  - constitutional principles
supersedes: []
superseded_by: null
related:
  - ADR-0001
review_triggers:
  - product promise changes
  - authority model changes
last_reviewed: 2026-08-02
tracking_issue: 6
---
```

## 13.11.1 Required fields

Por classe:

```text
id
title
document_type
authority
status
owners
version or revision
source_of_truth_for
related
```

## 13.11.2 Optional

```text
form
approvers
implementation_status
supersedes
superseded_by
review_triggers
last_reviewed
generated_from
tracking_issue
canonical_environment
```

## 13.11.3 Rules

- IDs únicos;
- owners existentes;
- relations resolvíveis;
- allowed status por class;
- generated docs declaram source;
- accepted normative docs não ficam sem owner;
- Research declara non-normative;
- Tracking declara no architecture authority.

---

# 13.12 Lifecycle por classe

## 13.12.1 ADR

```text
PROPOSED
ACCEPTED
REJECTED
SUPERSEDED
DEPRECATED
```

## 13.12.2 Capability Spec

```text
DRAFT
PROPOSED
ACCEPTED
IMPLEMENTING
IMPLEMENTED
DEFERRED
SUPERSEDED
WITHDRAWN
```

## 13.12.3 Product Blueprint

```text
DRAFT
PROPOSED
ACCEPTED
SUPERSEDED
```

A versão atual aceita permanece ACTIVE implicitamente.

## 13.12.4 Standard

```text
CANDIDATE
PILOT
RATIFIED
ENFORCED
DEPRECATED
SUPERSEDED
```

## 13.12.5 Golden Path

```text
DRAFT
PILOT
ACTIVE
DEPRECATED
RETIRED
```

## 13.12.6 Research

```text
DRAFT
PUBLISHED
SUPERSEDED
HISTORICAL
```

## 13.12.7 Tracking

```text
CURRENT
COMPLETED
ARCHIVED
```

## 13.12.8 Generated

```text
GENERATED
```

## 13.12.9 Implementation status

Quando necessário, separado:

```text
PLANNED
PARTIAL
IMPLEMENTED
VERIFIED
```

Uma Spec pode estar `ACCEPTED` e `implementation_status: PLANNED`.

---

# 13.13 ADR process

## 13.13.1 Quando criar

ADR é obrigatório quando a mudança:

- altera boundary arquitetural;
- escolhe ou remove tool material;
- altera source-of-truth;
- altera persistence;
- altera security model;
- altera execution topology;
- altera contract strategy;
- possui trade-off durável;
- precisa sobreviver à Mission atual.

## 13.13.2 Quando não criar

Não usar ADR para:

- naming local;
- refactor rotineiro;
- implementation detail já coberto;
- progresso;
- Research sem decisão;
- escolha facilmente reversível sem impacto.

## 13.13.3 Template MNFS

```text
Title
Status
Date
Context and Problem Statement
Decision Drivers
Considered Options
Decision Outcome
Positive Consequences
Negative Consequences
Risks
Validation
Migration / Rollback
Supersedes / Superseded By
Related Documents
```

## 13.13.4 Imutabilidade semântica

Após `ACCEPTED`, permitido:

- typo;
- link repair;
- metadata;
- successor link;
- non-semantic clarification.

Proibido:

- trocar escolha;
- remover downside;
- reescrever rationale;
- apagar alternativa;
- adaptar à implementação acidental.

Mudança semântica:

```text
new ADR
→ supersedes old ADR
```

---

# 13.14 Product Blueprint evolution

O Blueprint é living constitutional documentation.

Não é immutable como ADR.

É versionado e governado.

## 13.14.1 B0 — Editorial

- spelling;
- formatting;
- link;
- sem mudança de meaning.

Review:

- docs owner.

Version:

- optional patch.

## 13.14.2 B1 — Clarification

Explica melhor regra existente sem alterar:

- behavior;
- Authority;
- scope;
- source-of-truth.

Review:

- owner;
- ADR consistency.

Version:

- patch.

## 13.14.3 B2 — Material extension

Adiciona:

- capability;
- rule;
- subsystem;
- compatible extension.

Exige:

- architecture issue;
- related ADR quando há choice;
- affected-document analysis;
- Operator approval.

Version:

- minor.

## 13.14.4 B3 — Constitutional change

Altera:

- product promise;
- Authority hierarchy;
- source-of-truth;
- constitutional invariant;
- primary Domain Model;
- fundamental local/cloud boundary.

Exige:

- explicit architecture proposal;
- alternatives;
- adversarial review;
- migration/reconciliation;
- Operator approval.

Version:

- major.

## 13.14.5 Changelog

B1–B3 registra:

- version;
- date;
- changed Sections;
- reason;
- ADRs;
- affected Specs;
- affected Missions;
- migration.

## 13.14.6 Accepted baselines

Major accepted baseline recebe:

- Git tag or release marker;
- generated aggregate;
- changelog;
- source hashes.

Git history preserva versões anteriores.

---

# 13.15 Capability Specification process

Capability Spec é o equivalente MNFS de uma KEP/RFC.

## 13.15.1 Required sections

```text
Metadata
Summary
Motivation
Goals
Non-goals
Operator Stories
Domain Changes
Architecture
State and Recovery
Security and Privacy
Interfaces
Engineering Standards
Observability
Test Plan
Golden Proof
Graduation Criteria
Upgrade/Downgrade
Rollout/Rollback
Dependencies
Risks
Alternatives
Implementation History
Open Questions
```

## 13.15.2 Lifecycle

```text
DRAFT
→ PROPOSED
→ ACCEPTED
→ IMPLEMENTING
→ IMPLEMENTED
```

Alternativas:

```text
DEFERRED
WITHDRAWN
SUPERSEDED
```

## 13.15.3 Issue relation

Issue:

- tracking;
- discussion;
- implementation links.

Spec:

- canonical proposal.

## 13.15.4 Mission relation

Spec:

- reusable capability.

Mission Contract:

- implementation commitment scoped.

Mission referencia:

- Spec ID;
- version/hash;
- partial/full scope.

---

# 13.16 Mission Contract governance

Approved revisions são immutable.

## 13.16.1 Draft

Vive em:

- SQLite;
- generated artifacts;
- Lavish projection.

## 13.16.2 Approval

- exact hash;
- Operator authority;
- materialization under `.mnfs/missions`.

## 13.16.3 Change

Material change:

```text
new revision
→ review
→ approval
→ active-work reconciliation
```

## 13.16.4 Proibições

- editar `plan.json` manualmente;
- alterar criteria after dispatch;
- apagar old revision;
- reinterpretar Claim under new contract;
- usar Git commit alone como approval.

## 13.16.5 MIS-002

Revision 3:

- historical accepted artifact;
- not deleted;
- superseded after Replan;
- retained for architecture history.

---

# 13.17 Engineering Standards

Cada Standard possui:

- ID;
- version;
- domain;
- statement;
- level;
- status;
- applicability;
- rationale;
- enforcement;
- Evidence;
- exception policy;
- owner.

## 13.17.1 Rule

Standard não é copiado integralmente para:

- Golden Path;
- Profile;
- Mission.

Eles referenciam versão.

## 13.17.2 Change

Material change increments version.

Active Missions remain bound to effective version unless Replan/policy decides otherwise.

---

# 13.18 Golden Paths

Cada Golden Path possui:

- ID;
- version;
- applicability;
- planning questions;
- required Standards;
- templates;
- actions;
- checks;
- Evidence;
- Safety Nets;
- deviations;
- owner;
- metrics.

Golden Path não redefine Standard.

Ele compõe Standards num path.

---

# 13.19 Repository Profile

Owns Repository-specific bindings:

- commands;
- architecture modules;
- environments;
- contracts;
- resources;
- external systems;
- ratified assumptions;
- Profile-specific bindings.

Não owns:

- universal constitution;
- Mission state;
- global tool doctrine;
- temporary logs.

Profile semantic change invalidates affected Context Packs.

---

# 13.20 Research governance

Research Report deve conter:

```text
Question
Date
Scope
Sources
Method
Findings
Evidence
Uncertainties
Recommendation
Limitations
Adoption status
```

## 13.20.1 Authority

Research:

```text
PUBLISHED
≠ ADOPTED
```

Adoption exige:

- ADR;
- Blueprint;
- Spec;
- Standard;
- Roadmap Decision.

## 13.20.2 Updates

Não reescrever old research para parecer correto.

Criar:

- new version;
- addendum;
- superseding report.

---

# 13.21 Tracking e GitHub

## 13.21.1 Tracking role

Tracking mostra:

- current progress;
- open work;
- checklist;
- assigned owner;
- blockers;
- next action.

## 13.21.2 Issue

Issue é work container.

Não é source-of-truth final.

## 13.21.3 PR

PR é:

- proposed diff;
- review;
- CI;
- merge vehicle.

Merged file é canonical.

## 13.21.4 Comment

Um comentário pode registrar uma decisão provisória.

Para governar:

```text
promote to canonical source
```

## 13.21.5 Architecture Issue #6

Issue #6:

- initiated AB1;
- defines deliverables;
- tracks approval.

Após canonical publication:

- link final documents;
- update checklist;
- remain open until MIS-002 reconciliation and explicit M2 unblock.

---

# 13.22 Generated documentation

Generated files possuem header:

```text
GENERATED — DO NOT EDIT

Source:
Generator:
Generator version:
Source hash:
Generated at:
```

## 13.22.1 Examples

- PRODUCT-BLUEPRINT.md;
- review.html;
- CLI reference;
- schema reference;
- static site;
- Mermaid generated diagram.

## 13.22.2 CI

Verifica:

- source exists;
- source hash;
- generated content fresh;
- no manual-only delta.

## 13.22.3 Authority

Generated projection inherits source Authority.

---

# 13.23 Entrypoints

## 13.23.1 README.md

Audience:

```text
human newcomer
```

Contém:

- what MNFS is;
- current maturity;
- canonical environment;
- quick start;
- core docs links;
- current Product Milestone;
- limitations.

Não contém toda arquitetura.

## 13.23.2 AGENTS.md

Audience:

```text
all coding agents
```

Contém somente:

- first commands;
- hard rules;
- safety;
- source links;
- verification;
- docs-impact rule;
- prohibited shortcuts.

AGENTS.md:

```text
index
≠ doctrine
```

## 13.23.3 DOCUMENTATION-MAP.md

Audience:

- humans;
- Leads;
- Planners;
- Context Pack Compiler.

Contém:

- Authority model;
- source catalog;
- read order;
- owners;
- versions;
- status;
- supersession;
- generated docs;
- update protocol.

---

# 13.24 Read order

## 13.24.1 New human

```text
README
→ Documentation Map
→ Product Blueprint overview
→ Roadmap
→ relevant Capability Spec
→ related ADRs
```

## 13.24.2 Architecture contributor

```text
Documentation Map
→ complete Product Blueprint
→ ADR log
→ Capability Specs
→ Research
→ active architecture issue
```

## 13.24.3 MNFS Lead

```text
AGENTS.md
→ mnfs status / Current Authority Snapshot
→ Approved Mission Contract
→ Handoff/Context Pack
→ relevant Capability Spec
→ related ADRs
```

## 13.24.4 Writer

```text
Current Authority Snapshot
→ Writer Pack
→ exact code/contracts
```

No full Blueprint by default.

## 13.24.5 Reviewer

```text
Review Pack
→ fixed target
→ criteria
→ Standards
→ relevant Spec/ADR
```

No Writer transcript/OM.

## 13.24.6 QA

```text
QA Pack
→ Journey
→ Environment
→ expected observations
```

---

# 13.25 Documentation Impact declaration

Todo PR e Claim de mudança declara:

```yaml
documentation_impact:
  status: NONE | UPDATED | FOLLOW_UP_REQUIRED
  affected:
    - DOC-...
  rationale: ...
  follow_up: ...
```

## 13.25.1 NONE

Precisa de rationale específico.

## 13.25.2 UPDATED

Lista fontes canônicas atualizadas.

## 13.25.3 FOLLOW_UP_REQUIRED

Permitido quando:

- não é seguro concluir docs no mesmo change;
- issue existe;
- owner existe;
- contradiction material não é introduzida;
- trigger é definido.

## 13.25.4 Invalid

```text
No docs needed.
```

sem rationale não é declaração válida para change material.

---

# 13.26 Impact matrix

| Mudança | Docs a avaliar |
|---|---|
| Domain Entity/FSM | Blueprint, Spec, ADR, Reference |
| CLI | Reference, how-to, AGENTS bootstrap |
| SQLite schema | Spec, migration reference, Recovery |
| Pi adapter | Spec, adoption record, compatibility |
| Security policy | ADR, Section 10, Profile, runbook |
| Standard | Standard, Paths, Profile bindings |
| Golden Path | Path, templates, examples |
| API/schema | contract, reference, consumers, migration |
| Environment | Profile, setup, Security |
| External tool version | Research/adoption, notices, doctor |
| Mission scope | Plan Revision |
| Roadmap order/outcome | Roadmap Decision |
| Operator UI | Spec, reference, accessibility |
| Telemetry | ADR, mapping reference, privacy |
| Memory adapter | ADR, spike report, Role policy |

Inicialmente, review guidance.

Checks determinísticos entram progressivamente.

---

# 13.27 Documentation CI

## 13.27.1 Initial

```text
markdownlint
link validation
frontmatter schema
unique IDs
relation target validation
allowed statuses
owner required
ADR numbering/index
supersession consistency
Blueprint aggregate freshness
Documentation Map coverage
Mission contract schema
hierarchical ID validation
generated header validation
docs-impact declaration
no unresolved placeholder in accepted normative docs
```

## 13.27.2 Future

- generated CLI reference;
- schema docs;
- Profile binding validation;
- Standard/Golden Path refs;
- code-change impact rules;
- Artifact refs;
- diagram generation;
- spell/style.

## 13.27.3 Limite

CI prova estrutura.

Não prova toda semântica.

Owner review continua obrigatório.

---

# 13.28 Ownership

## 13.28.1 CODEOWNERS initial

Proteger:

```text
/docs/product/
/docs/adr/
/docs/capabilities/
/docs/standards/
/docs/golden-paths/
/docs/repository-profile/
/.mnfs/
/.github/CODEOWNERS
AGENTS.md
```

## 13.28.2 Single-owner stage

Current owner:

```text
developmentconexus-ops
```

Operator approval remains separate from Git permission.

## 13.28.3 Future

Ownership pode evoluir para:

- platform;
- security;
- capability owners;
- repository owners;
- documentation maintainers.

---

# 13.29 Review levels

## D0 — Editorial

- typo;
- formatting;
- link.

## D1 — Guidance/reference update

- current command;
- how-to;
- example.

Requires owner review.

## D2 — Specification/Standard update

Requires:

- owner;
- affected reviewers;
- impact analysis.

## D3 — Architectural Decision

Requires:

- ADR process;
- alternatives;
- validation;
- approver.

## D4 — Constitutional change

Requires:

- Blueprint B3;
- architecture issue;
- adversarial review;
- Operator approval;
- reconciliation.

## D5 — Contract approval

Requires exact-hash Operator approval through MNFS.

---

# 13.30 Freshness

## 13.30.1 Change-triggered default

Review on:

- API change;
- adapter change;
- Product Milestone close;
- incident;
- Security change;
- Standard change;
- Mission reveals contradiction;
- dependency/provider update.

## 13.30.2 Time-triggered

Use where external reality changes without code:

- tool compatibility;
- provider docs;
- security assumptions;
- runbooks;
- external links;
- support matrix.

## 13.30.3 Research

Create new report.

Do not continuously mutate historical conclusions.

## 13.30.4 States

```text
CURRENT
REVIEW_REQUIRED
STALE
SUPERSEDED
UNKNOWN
```

Stale normative source may block dependent work.

Stale guidance usually creates debt.

---

# 13.31 Documentation debt

Debt sources:

- docs-impact follow-up;
- broken link;
- stale reference;
- missing owner;
- contradiction;
- missing how-to;
- outdated screenshot;
- missing implementation history;
- ungenerated projection.

Represent as:

- Finding;
- GitHub issue;
- gardening task;
- Standard candidate.

Do not leave durable debt only as hidden TODO.

---

# 13.32 Supersession, archive e deletion

## 13.32.1 Supersession

Keep original path when possible.

Add:

- status;
- banner;
- successor link;
- reason.

## 13.32.2 Archive

Tracking may move to:

```text
docs/tracking/archive/
```

## 13.32.3 Delete

Allowed when:

- generated;
- accidental duplicate;
- no historical value;
- secret removal;
- legal/security necessity.

Rejected or superseded architecture normally remains.

---

# 13.33 Versioning

## Product Blueprint

```text
MAJOR
→ constitutional change

MINOR
→ material compatible extension

PATCH
→ clarification/editorial
```

## ADR

ID + immutable history.

## Capability Spec

Version/revision + accepted hash when implementation binds.

## Standards/Golden Paths

Individual version.

## Repository Profile

Git version + schema version.

## Mission Contract

Revision + content hash.

## Generated reference

Implementation SHA + generator version.

---

# 13.34 Change protocol

```text
detect change need
→ identify canonical owner
→ classify D/B level
→ open issue/proposal if material
→ edit source
→ update relations/dependents
→ run docs checks
→ owner review
→ Operator approval if required
→ merge
→ regenerate projections
→ invalidate Context Packs
→ reconcile active Missions
```

Se docs e implementation divergem:

```text
investigate authority
```

Não alterar docs automaticamente para legitimar código acidental.

---

# 13.35 Context Pack integration

Context Pack Compiler usa:

- Documentation Map;
- Authority;
- status;
- relationship;
- target;
- Role;
- version.

Exclui por default:

- superseded;
- rejected;
- historical;
- tracking;
- unrelated research.

Pode incluí-los em:

- Investigation;
- architecture review;
- history analysis.

Não faz crawl indiscriminado de Markdown.

---

# 13.36 Security

- secrets forbidden;
- sensitive incidents in restricted Artifacts;
- external docs are untrusted data;
- documentation build dependencies pinned;
- generated HTML sanitized;
- diagram/plugin code reviewed;
- Security/CODEOWNERS protected;
- Workers cannot alter active policy through docs;
- telemetry content rules also apply.

---

# 13.37 Tooling inicial

Usar:

- Markdown;
- YAML frontmatter;
- TypeScript validator;
- markdownlint;
- link checker;
- aggregate generator;
- GitHub Actions;
- CODEOWNERS.

Não usar agora:

- CMS;
- docs database;
- graph database;
- Backstage;
- Docusaurus;
- MkDocs site;
- search cluster;
- custom RFC portal.

Um site entra quando GitHub discovery deixar de ser suficiente.

---

# 13.38 Documentation Map deliverable

`docs/DOCUMENTATION-MAP.md` será um documento canônico separado contendo:

1. Authority hierarchy;
2. storage boundaries;
3. canonical catalog;
4. current versions/status;
5. owners;
6. read paths;
7. superseded docs;
8. generated projections;
9. change impact;
10. checks;
11. current architecture phase;
12. immediate next action.

O Map é reference/navigation.

Não redefine os documentos que indexa.

---

# 13.39 Architecture Baseline publication sequence

Após aprovação desta Section:

```text
1. Create architecture branch
2. Split Blueprint into 13 modular sources
3. Generate aggregate
4. Create Documentation Map
5. Publish Research Reports
6. Create ADR template/log
7. Create ADR-0004–0012
8. Replace roadmap
9. Create Capability Spec template
10. Create metadata schema/validator
11. Add CODEOWNERS
12. Add docs-impact PR template
13. Add docs CI
14. Update README
15. Update AGENTS
16. Update STATUS
17. Open architecture PR
18. Review/adversarial pass
19. Merge
20. Replan MIS-002
```

AB1 não fecha apenas porque o Blueprint foi escrito.

Fecha quando o sistema documental canônico estiver versionado e reconciliado.

---

# 13.40 ADR decorrente

## ADR-0012 — Documentation authority, lifecycle and generated Product Blueprint

Decide:

- Authority classes;
- Git/`.mnfs`/SQLite boundaries;
- modular Blueprint;
- generated aggregate;
- ADR immutability;
- Capability Spec process;
- Documentation Map;
- docs-impact;
- ownership;
- CI;
- change protocol.

---

# 13.41 Non-goals

Não construir agora:

- enterprise knowledge platform;
- central documentation service;
- docs database;
- semantic search;
- RAG over all docs;
- Backstage instance;
- public documentation site;
- custom RFC application;
- automated semantic truth checker;
- universal ontology;
- calendar review for every file;
- policy that blocks all changes with documentation warning;
- duplicate content for every audience;
- AGENTS.md monolith;
- deletion of rejected history;
- editing generated aggregate manually.

---

# 13.42 Invariantes documentais

1. Git owns canonical product documentation.
2. SQLite owns operational state.
3. `.mnfs` owns repository machine artifacts.
4. Issue is tracking, not final authority.
5. PR is change vehicle, not authority.
6. Conversation is not canonical.
7. Research is not decision.
8. Tracking is not doctrine.
9. Generated projection owns nothing independently.
10. One concept has one canonical owner.
11. Other docs link instead of redefining.
12. Authority and Diátaxis form are separate.
13. Accepted ADR semantic outcome is immutable.
14. ADR changes through supersession.
15. Approved Mission revision is immutable.
16. Mission changes through Replan.
17. Rejected/superseded history remains discoverable.
18. Blueprint is modular at source.
19. Aggregate Blueprint is generated.
20. README remains concise.
21. AGENTS.md remains concise.
22. Documentation Map is the discovery index.
23. Canonical docs have metadata.
24. Accepted normative docs have owner.
25. Relations resolve.
26. Status is class-constrained.
27. Capability Specs use goals/non-goals/proof.
28. Standards and Golden Paths are independently versioned.
29. Research promotion is explicit.
30. Every material change declares docs impact.
31. Follow-up debt is tracked.
32. CI validates structure and projections.
33. Owner review validates meaning.
34. Stale normative docs may block work.
35. Context Packs exclude superseded content by default.
36. Workers do not read the full Blueprint by default.
37. Security policy cannot be mutated through docs by active Worker.
38. Major Blueprint change requires Operator approval.
39. Documentation change can invalidate Context Packs.
40. Documentation is maintained as part of product delivery.

---

# Decisão resumida da Seção 13

> **O MNFS trata documentação como parte do control plane. Git guarda a doutrina, decisões, specifications, Standards e guidance; `.mnfs` guarda identidade e contratos/evidence machine-readable; SQLite guarda state operacional. Cada conceito possui um documento owner, Authority e lifecycle. ADRs aceitos e Mission Contracts aprovados não são semanticamente reescritos; mudanças usam supersession ou Replan. O Product Blueprint terá 13 fontes modulares e um agregado gerado. Capability Specs seguem processo KEP/RFC-like; Research permanece Evidence não normativa; Issues e PRs são veículos de trabalho. README e AGENTS.md permanecem curtos; `DOCUMENTATION-MAP.md` é o índice autoritativo. Metadata, CODEOWNERS, docs-impact e CI reduzem drift. AB1 só fecha depois que esse sistema documental estiver publicado, revisado e usado para reconciliar MIS-002.**

# 3K-R1 — Frontend / Product Architecture Final Closure

**Status:** APPROVED / CLOSED pelo operador em 2026-08-18  
**Fase:** 3K — Frontend / Product Architecture  
**Authority:** fechamento final aprovado de 3K  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** este documento fecha 3K, mas não constitui C-018, não encerra a Fase 3 completa, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

O Conexus F1 encerra Frontend / Product Architecture com um produto **agent-first, simple by default, inspectable by design e authority-preserving**: Workspace e Project permanecem shells distintos; Build é a work surface dominante; truth aparece no contexto onde importa e Evidence permite drill-down; o primeiro vertical prova composição real sem transformar Sankhya/mirror em law global; Product Agents são Project-owned e autorados pelo mesmo Builder/Change/Release lifecycle; Workspace pode projetar um catálogo cross-Project de Agents sem assumir ownership; e nenhuma UI, catalog, runtime, read model, scheduler, Agent editor ou tool layer vira segunda authority. O fechamento interno e o único review adversarial externo encontraram **Material Finding = 0**.

---

## 1. Authority e provenance

3K-R1 fecha, sem reabrir estruturalmente:

- `3K-01 — Product Model, Project Shell, Build Workspace & Inspectability`;
- `3K-02 — Trust, Decision & Observable Truth`;
- `3K-03 — First Vertical Composition & Data Path`;
- `3K-04 — Product Agent Authoring, Management & Use Journey`;
- `3A-R8 — Project Baseline & Change Engineering Coherence`;
- `3A-R9 — Managed Job / Deterministic Sync Dispatch Reconciliation`;
- C-001/C-003/C-005/C-006/C-007/C-010/C-011/C-012/C-013/C-014/C-015/C-016/C-017;
- prior closed 3B–3J authorities cited by the above.

Review evidence, **NON-AUTHORITATIVE**:

- `3K-FABLE-PACKAGE-final-product-architecture-review.md`;
- `3K-FABLE-DIALOGUE-final-product-architecture-review.md`.

O único independent final challenger retornou:

```text
CURRENT STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS
Material findings = NONE
reopen 3B–3J = NONE
new module required = 0
new durable record required = 0
new database/schema required = 0
```

Review evidence não cria authority; as correções sobreviventes são adjudicadas abaixo.

---

## 2. Internal closure + external challenger

### 2.1 Internal completeness/deletion check

Antes do Fable, 3K foi reavaliada contra C-001/C-003/3A-R6 e prior authority.

Resultado:

```text
Workspace / Project selection + creation                    = COVERED
Inception / Project Baseline                                = COVERED
Change / correctness / progress                             = COVERED
Finding / Evidence / verifier feedback                      = COVERED
human decision families                                     = COVERED
Connections administration/use/qualification journey        = COVERED
Brain binding/use                                            = COVERED
Preview / review                                             = COVERED
Release / Promotion / rollback                               = COVERED
Production Agent definition/use                              = COVERED
MANAGED application access/serving                           = COVERED
runtime/operational timeline                                 = COVERED
permissions/access-management                                = COVERED
first vertical / data path                                   = COVERED
Project duplication semantics                                = already closed by C-014
Workspace Agents catalog dependency                          = read/public projection; no new L7 use case
Material Finding                                             = 0
```

### 2.2 Final independent adversarial review

O Fable atacou explicitamente:

```text
owner / authority contradictions
hidden second truth
missing F1 journeys
Workspace Agents catalog overreach
ToolProjection / UniversalTool drift
manual + AI authoring split
Mastra Editor/Stored Agent authority leak
Builder source-aware vs Product Agent source-aware
first-vertical distortion
false-green presentation
sync/job overengineering
missing module/record/DB pressure
```

Nenhum ataque sobreviveu ao teste de materialidade.

---

## 3. Non-material corrections adjudicadas

As cinco correções do review externo são aceitas como **NON-MATERIAL**.

### 3.1 LEDGER navigation links

Restaurar os links corretos:

```text
3C-R1
→ 3C-R1-cross-review-closure.md

3G-01
→ 3G-01-approval-request-lifecycle-claim-binding-state-architecture.md

3G-05
→ 3G-05-production-agent-run-approval-trigger-continuation-architecture.md
```

Isto é navigation housekeeping. Nenhuma authority muda.

### 3.2 3G-R1 wording restoration

No summary do LEDGER, restaurar:

```text
DEDICATED old exact Release is not invalid merely because newer exists
```

A authority de 3G-R1 já permaneceu intacta; apenas o summary sofreu wording drift.

### 3.3 3I-02 / 3I-05 wording restoration

O LEDGER deve preservar o meaning já congelado nas authorities de 3I:

```text
guest ActorRun model-provider / LLM-provider key = deleted from guest baseline

business/application external execution remains Gateway-owned
platform-control egress uses only named owner-specific adapters
```

A exact authority continua em 3I-02/3I-05; o ledger não pode comprimir o summary a ponto de perder essas distinções.

### 3.4 Workspace Agents attention/pending counts

Clarificação final de 3K-04:

> **Workspace → Agents pode projetar counts/attention/pending indicators somente para discovery/attention routing. Eles nunca constituem Approval Center, decision inbox ou surface cross-Project que possa executar a decisão. O claim/decision continua no exact owner context e toda mutation reentra pela authority correspondente.**

Portanto:

```text
Workspace Agents attention
= discovery projection
!= decision authority
!= aggregate Approval Center
```

3K-02 §17 permanece intacta.

### 3.5 Structured Agent mutation without LLM

Clarificação final de 3K-04:

> **Uma structured/manual Agent mutation que dispense coding-model call continua integralmente dentro do mesmo Change/work graph e da matriz de commit de C-017/C-014; eliminar o LLM não elimina Work Unit/Change authority, diff, checkpoint, proof ou canonical commit quando `writeSet != ∅`.**

Logo:

```text
structured edit without coding LLM
→ same Change
→ applicable Work Unit/work graph
→ exact candidate diff
→ C-017/C-014 commit matrix
→ verification/checkpoint
→ Release
```

Não existe fast path de mutação fora do governance graph.

---

## 4. Final product model

### Workspace shell

Conceitualmente:

```text
Workspace
├── Projects
├── Agents           ← access-filtered cross-Project catalog/projection
├── Brain
├── Connections
├── Members
└── Settings
```

`Workspace → Agents` não possui Product Agents, Release ou runtime; somente projeta recursos Project-owned que o caller atual pode descobrir.

### Project shell

Conceitualmente:

```text
Project
├── Build
├── Data
├── Capabilities
├── Integrations
├── Agents
├── Brain
├── Versions
├── Activity
└── Settings
```

Project continua a unidade intencional de software/produto.

---

## 5. Build / Golden Path law

Build permanece:

```text
Project-scoped navigation
+
Preview-dominant work surface
+
contextual/retractable Conexus
+
Preview | Code | Diff lenses
```

Golden Path não exige operar machinery interna como:

```text
ActorRun
Gateway
CAS
digests
Mastra internals
E2B internals
queue/lease/scheduler mechanics
```

Esses detalhes continuam progressivamente inspecionáveis quando materialmente úteis.

---

## 6. Truth / Evidence law

3K fecha preservando:

```text
UI = projection, never authority
observation != verification
loading != empty != failed != partial
Preview ready != verified/live
Release AVAILABLE != Live
pointer swapped != SERVED_VERIFIED
AgentRun COMPLETED != all effects succeeded
no Finding != verified
missing cost != zero
SENT_NO_RESPONSE != external actor failure
OUTCOME_UNKNOWN != safe retry
```

Human decision families permanecem context-local:

```text
Change checkpoint   → Build
Effect approval     → exact Agent/operational owner context
Publish / rollback  → Versions / Publish
Access mutation     → Settings / Access owner context
```

Nenhum universal Approval/Trust/Status Center nasce no F1.

---

## 7. First vertical law

O primeiro vertical continua:

```text
Analisador Inteligente de Orçamentos
external source              = Sankhya for this case
product mode                 = read-only analytics
runtime analytical path      = derived Project analytical read model
source anchor                = live Gateway reads for discovery/qualification/
                               reconciliation/verification/Evidence
UI access                    = registered read-only Query capabilities
Brain                        = semantic definitions/caveats + Project binding
Product Agent                = not required
external/business WRITE      = 0
historical benchmark         != current operational truth
sync                          = required for this vertical
```

Platform law permanece:

```text
Conexus default live/mirror/hybrid strategy = NONE
Project Baseline chooses data path for current consumer/slice
Connector declares provider capabilities
```

Sankhya/mirror nunca viram ERP-wide Conexus doctrine.

---

## 8. Managed sync composition

O `job/v1` trigger disparado por 3K-03 foi resolvido por 3A-R9:

```text
job/v1                    = Project-scoped artifact
runtime owner             = Managed Application Runtime
occurrence record         = mar.job_run
Gateway caller            = MANAGED_JOB
schedule authority        = exact active served Release composition
scheduler/queue           = derived/reconstructible mechanics
F1 recurrence             = manual + fixed interval
concurrency               = single-flight / coalesce
restart gap               = one catch-up, not missed-slot backlog
privileged arbitrary code = REJECT F1
workflow/scheduler domain = REJECT F1
```

`CX-MANAGED-JOB-01` permanece MUST QUALIFY em 3L.

---

## 9. Product Agent final law

Product Agents permanecem:

```text
Project-owned
git-first
canonical agent/v1
Release-pinned
Production Agent Runtime realized by qualified Mastra substrate
```

Agent Builder é:

```text
specialized Build experience
!= AgentBuilderModule
!= AgentBuilderRuntime
!= second authoring DB
```

Manual/structured + natural language:

```text
→ same Change
→ same candidate AgentDefinition
→ same verification
→ same Release
```

Mastra Stored/Editor/latest/current config nunca vira authority concorrente.

---

## 10. ToolProjection law

Product Agent recebe somente ToolProjection compilada a partir de owners já existentes.

Current source families podem incluir:

```text
Project Query Capability
Project Action Capability
Integration Operation
explicitly admitted platform-native tool on real consumer
```

Rejeitado:

```text
UniversalTool domain
generic execute(anySlug, anyInput)
hidden tool/capability widening
MCP/A2A/agent-as-tool by optionality alone
```

Quando Agent intent revela capability ausente, o Builder pode **propor** expandir a same Change; nunca cria dependência/permission/effect escondido.

---

## 11. Builder context vs Product Agent context

Boundary final:

```text
Builder / Agent Builder authoring
= source-aware, scoped to current Change

Product Agent runtime
= product/context-aware
```

Product Agent não recebe por default:

```text
repo
source code
shell
filesystem
browser/computer-use
raw credentials
raw DB/network power
```

Published app pode fornecer typed contextual refs/hints, mas esses hints não são authority e material facts continuam obtidos por governed tools/capabilities.

---

## 12. Interactive / headless Agents

Um único Product Agent concept pode ser usado como:

```text
interactive conversation
manual invocation
SCHEDULE headless execution
```

EVENT permanece consumer/Decision-Loop gated conforme prior authority.

Nem todo Agent precisa chat e nem todo app recebe universal chat widget.

Published Agent interaction surface pertence ao produto do Project; runtime/session semantics permanecem platform-governed.

---

## 13. Workspace Agents catalog final boundary

Workspace catalog existe porque há consumidor organizacional real e C-003 AGT-2 exige central de agents.

Mas:

```text
Workspace catalog
= access-filtered cross-Project projection
= discover / inspect / attention-route

Workspace catalog
!= owner of AgentDefinition
!= Release owner
!= mutation authority
!= fleet runtime
!= Approval Center
```

Mutation entra no owning Project / Agent / Change context.

Caching/materialized inventory que exija durable current-state authority retorna ao Decision Loop; não está aprovado por 3K.

---

## 14. YAGNI / deletion result

3K fecha rejeitando/deferindo sem current consumer:

```text
Workspace-owned Agent fleet/runtime
AgentBuilder module/database/runtime
UniversalTool domain
universal chat widget
Jobs/Automation top-level product area
workflow engine / workflow DSL
cron/RRULE/business-calendar engine
EVENT ingress
Product multi-agent/subagents/network
MCP/A2A/agent-as-tool
Skills/Goals baseline authoring
Semantic Recall / Observational Memory by default
Product Agent repo/shell/browser power
cross-Project decision inbox
Trust Center / universal status/approval score
```

Deletion test do final reviewer encontrou `NONE` adicional a remover.

---

## 15. Reopen triggers

Reabrir 3K apenas por evidence material, como:

- named workload que torne context-local decisions insuficientes e exija aggregate decision surface;
- real cross-Project Agent operations que não caibam em catalog projection;
- real agent fleet lifecycle/governance que exija owner/current-state authority adicional;
- new user audience/role model que não caiba nas current surfaces;
- public/embed/third-party product surface que mude trust presentation;
- real Product Agent source/browser/workspace consumer;
- EVENT/multi-agent/MCP/A2A consumer que mude product authoring/use model;
- Product user evidence mostrando que current progressive disclosure não permite decisão segura;
- first vertical/product consumer que invalide current navigation or data-path composition laws;
- implementation/3L proof demonstrando que current product claim não é realizável sem mudar authority.

Preference, framework feature, visual taste or symmetry não reabrem 3K.

---

## 16. Final verdict

```text
3K-01 = APPROVED
3K-02 = APPROVED
3K-03 = APPROVED
3K-04 = APPROVED
3K-R1 = APPROVED / CLOSED
3K = CLOSED / APPROVED

internal closure Material Finding = 0
final independent Fable Material Finding = 0
non-material corrections = 5 / adjudicated

reopen 3B–3J = NONE
new module required = 0
new durable record required = 0
new database/schema required = 0
new workflow/approval/truth engine required = 0

implementation = BLOCKED
C-018 = NOT YET RATIFIED
PR #40 merge = NOT AUTHORIZED

NEXT = 3L — Technology Qualification
```

## 17. 3L handoff

3L executa somente probes capazes de falsificar assumptions tecnológicas load-bearing já aprovadas.

Current required families permanecem, no mínimo:

```text
CX-SBX-E2B-01
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
CX-MANAGED-JOB-01
3I-03 model-spend interception/retry/usage/cost-envelope subset
Verification Observability deciding-evidence subset
```

3L não reabre product architecture por preferência de framework. Material qualification failure reabre primeiro a menor substrate/realization assumption que foi falsificada.

---

## Decisão final ratificada

> **Frontend / Product Architecture fecha porque o Conexus apresenta ao operador um produto simples e agent-first sem criar uma segunda camada de truth: Build conduz a construção, owner facts conduzem trust, Evidence permite inspectability, Project governa software/Agents, Workspace agrega somente discovery autorizada, Release governa o que está ativo, Gateway governa capabilities/effects, e o primeiro vertical prova composição real sem contaminar a plataforma com regras do primeiro ERP. O único review externo final confirmou a estrutura com zero Material Findings; as cinco observações sobreviventes foram apenas restaurações/clarificações não-materiais incorporadas neste fechamento.**
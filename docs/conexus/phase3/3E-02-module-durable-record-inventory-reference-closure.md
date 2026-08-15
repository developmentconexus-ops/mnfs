# 3E-02 — Module Durable Record Inventory & Reference Closure

**Status:** APROVADO pelo operador em 2026-08-15  
**Fase:** 3E — Data Architecture  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3, não autoriza implementação, merge ou PR readiness.

## Decisão em uma frase

O Conexus F1 fecha um **piso explícito de 46 classes de records duráveis em 13 schemas de `hub_control`**, com ownership por módulo, distinção entre opaque IDs, digests content-addressed, generations/CAS e runtime refs, uma **allowlist fechada de 16 FKs Tier-2**, sem espelhos mutáveis de authority alheia, e com Project bindings, Connection ownership/qualification e Artifact Registry scopes materializados conforme as boundaries aprovadas em 3C/3D/3E-01.

---

## 1. Autoridade e inputs

Esta decisão reconcilia e ratifica, com a precedência indicada abaixo:

- C-000..C-017;
- 3B CLOSED;
- 3C-01..3C-15 + 3C-R1;
- 3D-01..3D-04 + 3D-R1;
- 3E-01 — Hub Control Data Ownership & Persistence Boundaries;
- `3E-FABLE-R1-durable-record-inventory-review.md` — review não-autoritativo;
- `3E-FABLE-R1.1-iam-workspace-inventory-correction.md` — correção não-autoritativa;
- `3E-FABLE-R1.2-project-connections-inventory-correction.md` — correção não-autoritativa;
- `3E-FABLE-R1.3-connections-registry-inventory-correction.md` — correção não-autoritativa.

Precedência dos reviews somente como inputs de síntese:

```text
R1.3 > R1.2 > R1.1 > R1
```

Esta decisão é a authority resultante. Onde este documento divergir dos reviews, este documento prevalece.

---

## 2. Regra de admissão de records duráveis

Uma nova classe de record durável só entra no F1 quando todas as condições forem satisfeitas:

```text
1. existe owner único já aprovado;
2. existe consumidor/invariante atual que exige durabilidade;
3. o estado não é derivável de outra authority suficiente;
4. não é espelho de current-state owned por outro módulo;
5. não é apenas estado interno de substrate/provider/CAS;
6. não cria abstraction/framework genérico sem consumidor real.
```

Portanto:

> **46 classes é piso fechado do escopo arquitetural atual, não licença para criar qualquer tabela conveniente.**

Nova classe exige Decision Loop / Finding admitido. Uma migration não cria authority por si só.

---

## 3. Inventário F1 — 46 classes

Nomes abaixo são semânticos. Colunas finais, tipos, índices e DDL pertencem à realização posterior.

### `iam` — Identity & Access — 7

```text
account
session
workspace_membership
area_membership
area_project_grant
account_project_grant
published_app_access
```

Semântica:

- `account` e `session` realizam identidade/authentication server-side;
- `workspace_membership` = Account ↔ Workspace + role do scope;
- `area_membership` = Account ↔ Area + papel organizacional aplicável;
- `area_project_grant` = Area → Project + role de Control Plane;
- `account_project_grant` = Account → Project + role de Control Plane;
- `published_app_access` = relação independente Account ↔ Project na superfície PUBLISHED_APP, com role set fechado do app;
- CONTROL_PLANE e PUBLISHED_APP nunca são conflados;
- PREVIEW reutiliza authority de Control Plane + precondition/permission específica e não recebe árvore própria de membership.

Não existe `GenericGrant`, relationship graph, subject-relation-object table ou role-assignment genérico.

### `ws` — Workspace — 2

```text
workspace
area
```

`Area` é estrutura organizacional owned pelo Workspace; não é módulo, software ou Project.

### `prj` — Project — 5

```text
project
approved_baseline
brain_binding
connection_binding
config_contract_revision
```

Semântica:

- `project` owns identity/lifecycle/Workspace scope/canonical repo association facts necessários;
- `approved_baseline` registra/pina a authority do Baseline aprovado;
- `brain_binding` materializa **ProjectBrainBinding**, concreto e tipado;
- `connection_binding` materializa **ProjectConnectionBinding**, concreto e tipado;
- `config_contract_revision` é revisão append-oriented do Project Config Contract, com conteúdo por digest/ref e authority sobre a revisão ativa;
- não existe `GenericProjectBinding` nem settings bag.

#### Emenda ratificada pelo operador — ConnectionRevision pin obrigatório

`ProjectConnectionBinding` deve preservar semanticamente:

```text
project
purpose
consumer environment/surface
connection identity
EXACT ConnectionRevision ref
```

A revisão exata é obrigatória porque várias `ConnectionRevision`s da mesma Connection podem coexistir e permanecer pinadas/qualificadas independentemente.

```text
connection_id
!=
connection_revision_ref
```

Tanto `connection_id` quanto `connection_revision_ref` permanecem **Tier-3 refs opacos**, sem FK cross-module. O binding expressa intent pinado; Connections/Gateway/Release continuam responsáveis por existência atual, qualification, revogação, eligibility e conformance.

### `bld` — Builder — 8

```text
change
contract_revision
plan_revision
work_unit
actor_run
coding_session
finding
change_acceptance
```

- `Change` é boundary durável pública do Builder;
- `contract_revision` e `plan_revision` preservam revisões pinadas quando aplicável;
- `WorkUnit`, `ActorRun`, `CodingSession` e `Finding` permanecem Builder-owned;
- `change_acceptance` é input imutável/estável para composição de Release;
- detalhes cognitivos/runtime de Mastra/E2B não são copiados para `bld.*`.

### `reg` — Artifact Registry — 2

```text
artifact
artifact_revision
```

`artifact` preserva o mapa fechado kind→scope de 3C-06:

```text
integration                                → PLATFORM
brain                                      → WORKSPACE
query | action | job | agent | brain-binding → PROJECT
```

O Registry é único, mas não Project-only.

Forma mínima aprovada:

- kind fechado;
- slug/logical identity;
- scope identity condicional por kind;
- `integration` não cria FK artificial para uma entidade Platform;
- `brain` ancora Workspace;
- kinds Project-scoped ancoram Project;
- `scopeType` é função fechada do kind; não nasce registry configurável de scopes/kinds.

`artifact_revision` continua imutável por digest + provenance + payload ref no CAS.

### `con` — Connections — 3

```text
connection
connection_revision
connection_qualification
```

#### `connection`

Um único conceito, com scope fechado:

```text
ownerScope = WORKSPACE | PROJECT
```

Representação física deve preservar mecanicamente:

```text
WORKSPACE → Workspace válido, sem project ref
PROJECT   → Project válido, sem workspace copy duplicada
```

Pode ser realizado por refs condicionais + CHECK/XOR equivalente. Não criar `WorkspaceConnection` e `ProjectConnection` como classes distintas, `owner_id` polimórfico genérico ou resource/scope engine.

Credential material permanece fora do domínio; `connection` guarda somente credential backend/ref + logical grant version/facts necessários.

#### `connection_revision`

Configuração semântica não secreta imutável, incluindo pin da ConnectorDefinition exata, external target/environment e config operacional relevante.

#### `connection_qualification`

Classe append-only aprovada porque:

- `ConnectionRevision` é imutável;
- várias revisions podem coexistir;
- qualification é repetível;
- grant lógico pode mudar sem nova ConnectionRevision;
- overwrite na Connection destruiria história necessária.

Qualification preserva semanticamente informação equivalente a:

```text
ConnectionRevision
+ ConnectorDefinitionRevision (derivável/pinada pela revision)
+ CredentialBinding/Grant Version
+ External Target (derivável/pinado pela revision)
+ PASS | FAIL
+ evidence/sanitized diagnostic refs
+ occurrence/time identity
```

Não existe record por probe técnico. Uma qualification semântica pode executar N probes físicos.

Health atual permanece projeção/estado operacional derivável do próprio owner; `HEALTHY != ALLOW`.

### `gw` — Capability Gateway — 3

```text
effect_attempt
idempotency_claim
budget_counter
```

Sem expansão nesta decisão.

- effect attempt = persist-before-effect + pins exatos + traffic/outcome/receipt linkage;
- idempotency = claim durável/UNIQUE no escopo correto;
- budget counter = durable somente onde authority atual exige;
- receipt não nasce como aggregate separado;
- reads comuns e DENY comum não ganham ledger de effect.

### `brn` — Brain — 3

```text
knowledge_proposal
health
binding_validation
```

- published Brain payload/revision pertence ao Registry/CAS, não a uma segunda `BrainRevision` table competing authority;
- `knowledge_proposal` sustenta machine-proposes/human-publishes;
- `health` preserva fatos/observações suficientes para reducer/versioned health interpretation;
- current health é derivável, não segunda source of truth;
- `binding_validation` preserva prova/conformance por binding revision.

### `par` — Production Agent Runtime — 4

```text
conversation
agent_run
approval_request
agent_trigger
```

- Conversation identity/policy é Conexus; messages/thread mechanics ficam em `mastra_par`;
- AgentRun possui composition pins + runtime correlation refs; checkpoint payload fica no substrate;
- ApprovalRequest é Conexus authority, exact-effect-bound e single-claim;
- AgentTrigger F1 realiza SCHEDULE; EVENT permanece reservado até consumer real;
- automation cursor mínimo pode viver no trigger quando necessário;
- agent memory e workflow snapshots não são duplicados em `par.*`.

### `rel` — Release — 3

```text
release
promotion
active_pointer
```

- Release pina ReleaseManifest digest e representa composição imutável;
- Promotion é tentativa auditável append-oriented;
- active pointer `(project, PROD) + generation` é única authority de serving composition;
- EnvironmentConformance não vira tabela genérica separada no F1;
- migration ledger físico continua no database alvo / runner apropriado.

### `mar` — Managed Application Runtime — 2

```text
serving_route
job_run
```

- serving route = route→Project/environment operational mapping, sem espelho de active Release;
- job_run = lifecycle operacional de job/v1, version-locked à revisão pinada;
- queue/scheduler substrate continua seam interno e não vira domain record/module apenas por existir async work.

### `obs` — Observability & Audit — 2

```text
audit_record
operational_event
```

- `audit_record` = histórico durável append-oriented; fail-closed quando audit-required;
- `operational_event` = telemetry platform-wide com provenance/dedup/correlation/retention;
- lineage/timeline/cost projections podem existir derivadas, nunca authority atual;
- zero FK de/para domains;
- observability nunca decide autorização nem lifecycle atual de outro módulo.

### `att` — Attachments — 2

```text
attachment
blob
```

- `attachment` = logical/application identity, Project scope, lifecycle/metadata/retention e blob ref;
- `blob` = metadata/refcount/generation **exclusivamente do backing de Attachments**, conforme C-015/3C-14;
- `att.blob` **não é registry global do BlobStore/CAS** e não coordena lifecycle/refcount de Registry, Release, Evidence, Observability ou Backup;
- igualdade física de digest entre domínios não cria shared domain ownership;
- cross-domain global refcount permanece proibido/deferido.

---

## 4. Identidade e referências

### Opaque IDs

Usar para identidade durável owned por domínio, por exemplo:

```text
account / session / memberships / grants
workspace / area / project
change / work_unit / actor_run / finding
artifact / connection / connection_revision
conversation / agent_run / approval_request / trigger
release / promotion
serving_route / job_run
attachment
audit_record / operational_event
```

### Content-addressed digests

Usar para conteúdo/revisão imutável:

```text
ArtifactRevision
ReleaseManifest
frontend dist
BrainPack / brain-binding
correctness/config/baseline/plan revisions quando content-addressed
ChangeAcceptance
approval envelope hash
receipt/evidence payloads
blob bytes
```

Digest nunca recebe FK Tier-2.

### Generation / CAS

Usar somente quando o owner possui current state concorrente que exige optimistic concurrency, por exemplo:

```text
rel.active_pointer
att.attachment / att.blob GC state
bld.finding transition generation quando aplicável
gw.budget_counter
```

### Provider/runtime refs

Refs de Mastra, E2B, provider message IDs, trace/span IDs etc. são correlação somente:

```text
runtime ref != domain identity
```

Sem FK para substrate/provider.

---

## 5. Allowlist fechada — 16 FKs Tier-2

Regras herdadas de 3E-01:

```text
- alvo = PK/identidade estrutural estável;
- RESTRICT / NO ACTION;
- nunca CASCADE / SET NULL;
- FK não concede authority nem autoriza SQL cross-schema;
- ausência continua sendo default;
- nova FK exige Decision Loop.
```

Allowlist F1:

| # | FK Tier-2 |
|---|---|
| 1 | `iam.workspace_membership.workspace_id → ws.workspace(id)` |
| 2 | `iam.area_membership.area_id → ws.area(id)` |
| 3 | `iam.area_project_grant.area_id → ws.area(id)` |
| 4 | `iam.area_project_grant.project_id → prj.project(id)` |
| 5 | `iam.account_project_grant.project_id → prj.project(id)` |
| 6 | `iam.published_app_access.project_id → prj.project(id)` |
| 7 | `prj.project.workspace_id → ws.workspace(id)` |
| 8 | `con.connection.workspace_id → ws.workspace(id)` quando `ownerScope=WORKSPACE` |
| 9 | `con.connection.project_id → prj.project(id)` quando `ownerScope=PROJECT` |
| 10 | `reg.artifact.workspace_id → ws.workspace(id)` quando `kind=brain` |
| 11 | `reg.artifact.project_id → prj.project(id)` para kinds PROJECT-scoped |
| 12 | `bld.change.project_id → prj.project(id)` |
| 13 | `rel.release.project_id → prj.project(id)` |
| 14 | `rel.active_pointer.project_id → prj.project(id)` |
| 15 | `mar.serving_route.project_id → prj.project(id)` |
| 16 | `att.attachment.project_id → prj.project(id)` |

FKs intra-schema permanecem Tier 1 e não entram nesta allowlist.

### Rejeições nominais importantes

Permanecem Tier 3 / sem FK cross-module:

```text
prj.connection_binding → con.connection
prj.connection_binding → exact ConnectionRevision
prj.brain_binding → Registry/Brain revision digest
gw.effect_attempt ↔ par.approval_request
mar.job_run → Release revision/composition
bld/reg/brn refs por digest
qualquer ref de/para obs.*
qualquer ref de/para mastra_*
qualquer FK sobre digest
```

A ausência de FK nesses casos é intencional: authority/eligibility é revalidada pelo owner/boundary correta; referential integrity não deve fingir live authorization.

---

## 6. Historical pin × mutable mirror

Regra final:

```text
PIN HISTÓRICO
→ registra exact revision/digest/ref usada naquela ocorrência
→ permitido/obrigatório

MUTABLE MIRROR DE OUTRO OWNER
→ tenta manter cópia atual sincronizada com authority alheia
→ proibido
```

Exemplos corretos:

- `agent_run` pina composição exata;
- `job_run` pina revisão exata;
- `effect_attempt` pina revisão/config/ConnectionRevision exatas;
- `ProjectConnectionBinding` pina Connection + exact ConnectionRevision;
- Promotion/Release pinam digests/evidence exatos.

Exemplos proibidos:

- MAR duplicar active Release digest como current truth;
- Project duplicar current serving Release;
- OBS current-state tables decidirem lifecycle de domain;
- Registry duplicar Connection operational state;
- Attachments `blob` virar refcount global de todos os bytes da plataforma.

---

## 7. Explicitamente não construir

Esta decisão rejeita/defer sem consumer/failure class atual:

```text
GenericGrant / relationship graph / subject-relation-object
role assignment engine/custom roles
Preview membership tree
GenericProjectBinding / BindingEngine
ProjectSettings bag
generic resource/scope ownership engine
WorkspaceConnection + ProjectConnection classes separadas
qualification state sobrescrito em Connection/ConnectionRevision
record por probe técnico
generic qualification workflow
three registries by scope
configurable artifact-kind/scope registry
standalone qualification/health daemon machinery beyond current records
Evidence table as generic authority
ReleaseRecord second source of truth
EnvironmentConformance generic table
read/effect ledger for ordinary reads
persistent READ_* rate limiter by default
generic automation_state
generic job schedule record before recurring job consumer
event sourcing / CQRS / outbox-inbox / saga framework
soft-delete framework
cross-domain global CAS refcount
```

Projection/materialized-view/query optimization pode aparecer mais tarde sem virar authority nova, desde que reconstruível e owner semantics permaneçam intactas.

---

## 8. Findings roteados

### F3E02-R1 — Mastra `workflowDefinitions`

Mastra pode persistir dynamic workflow definitions no substrate. Isso nunca vira authoring authority Conexus.

Owner posterior:

```text
3H / 3L
→ runtime realization + CX-AGENT-MASTRA-01 probe
```

O probe deve provar que definitions/runtime state do substrate não bypassam Artifact Registry/Release pins.

### F3E02-R2 — CredentialBackend physical storage

`con.*` guarda somente credential backend/ref + logical grant/version facts necessários. Secret custody físico pertence à infra boundary `CredentialBackend`.

Owner posterior:

```text
3I / implementation of credential infrastructure
```

3E-02 não congela secret table/provider/crypto storage layout.

---

## 9. O que permanece aberto

3E-02 **não** congela:

```text
final SQL columns/types/indexes
ORM/query-builder choice
exact physical migration files
DTO/API/envelope shapes → 3F
complete FSM/state taxonomy → 3G
runtime/queue/Mastra mechanics → 3H
DB roles/RLS/threat hardening → 3I
deployment/backup/DNS/host procedures → 3J
technology qualification/probes → 3L
failure/recovery machinery → 3M
```

Também não autoriza criar os 46 records imediatamente; implementation só será autorizada pela governança posterior apropriada.

---

## 10. Resultado e próximo gate

Ratificado:

```text
3E-01 = APPROVED
3E-02 = APPROVED

46 durable record classes
16 Tier-2 cross-module FKs
Project bindings concretos e pinados
Connection WORKSPACE|PROJECT + append-only Qualification
Registry PLATFORM|WORKSPACE|PROJECT scopes por kind
OBS/Mastra fora de domain referential authority
Attachments blob metadata sem global CAS ownership
```

Próximo passo:

```text
3E-R1 — Data Architecture Cross-Review
```

3E-R1 deve validar 3E-01 + 3E-02 contra o intake de 3D-R1, procurar omissão/contradição material e decidir se Data Architecture pode ser CLOSED antes de abrir 3F.

3E permanece **EM ANDAMENTO** até esse cross-review/closure. Nenhuma implementação de produto é autorizada.
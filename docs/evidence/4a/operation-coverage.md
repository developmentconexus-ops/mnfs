# 4A Evidence — Product Operation Coverage

> **Kind:** Evidence / supporting proof, not Product authority.
> **Candidate authority under test:** `docs/product/operation-ledger.md` + `docs/product/permission-contract.md` + `docs/product/budget-analyzer-contract.md`.
> **Status:** 4A OPEN / CENSUS+SUBTRACTION+CONSISTENCY PROOF COMPLETE / INDEPENDENT REVIEW PENDING.

This Evidence attacks the completed operation candidate against the accepted 15 Product journeys, 13 semantic owners, closed 46 durable record classes, first Budget Analyzer semantic contract and whole-product negative laws. It tests both missing Product capability and CRUD/mechanism inflation.

---

## 1. Test rule

Persistence does not manufacture Product CRUD.

Every accepted durable record class must have one disposition:

```text
DIRECT      current Product consumer needs exact owner operation/read
PROJECTION  visible only through purpose-built owner/Product projection
INTERNAL    owner/runtime state intentionally not caller-controlled
CARRIER     byte/transport/property usable only through an owning operation
```

Failure conditions:

```text
real user/headless intent with no admitted operation
record exposed only because CRUD symmetry suggests it
foreign owner state mirrored into a generic API
mechanism promoted to Product authority
operation lacking principal/authority/scope/outcome/current-state closure
Project capability admitted through arbitrary/mutable/global executor
```

---

## 2. 46 durable record-class disposition

### Identity & Access — 7

| Record | Disposition | Product home |
| --- | --- | --- |
| `iam.account` | DIRECT/PROJECTION | Control Plane access context; trusted Account provisioning |
| `iam.session` | DIRECT | current access context / EndSession; OIDC token is not session authority |
| `iam.workspace_membership` | DIRECT | Workspace member reads/add/remove |
| `iam.area_membership` | DIRECT | Area membership administration |
| `iam.area_project_grant` | DIRECT | Area→Project grant/revoke |
| `iam.account_project_grant` | DIRECT | Account→Project grant/revoke |
| `iam.published_app_access` | DIRECT | Published-App context + List/Set/Revoke access; grant/role-change CRUD split subtracted |

Result: `7/7 CLOSED_CANDIDATE`.

### Workspace — 2

| Record | Disposition | Product home |
| --- | --- | --- |
| `ws.workspace` | DIRECT | Create/Get/Update Workspace |
| `ws.area` | DIRECT | List/Create/Update Area |

No deletion operation is inferred from persistence existence.

Result: `2/2 CLOSED_CANDIDATE`.

### Project — 5

| Record | Disposition | Product home |
| --- | --- | --- |
| `prj.project` | DIRECT | Project lifecycle/read/duplicate |
| `prj.approved_baseline` | DIRECT | Get/approve exact Baseline revision |
| `prj.brain_binding` | DIRECT | Get/Set/Clear exact binding |
| `prj.connection_binding` | DIRECT | List/Set/Remove exact binding |
| `prj.config_contract_revision` | INTERNAL/PROJECTION | exact Release/Baseline composition; no standalone mutable config CRUD |

Result: `5/5 CLOSED_CANDIDATE`.

### Builder — 8

| Record | Disposition | Product home |
| --- | --- | --- |
| `bld.change` | DIRECT | List/Get/Create Change |
| `bld.contract_revision` | INTERNAL/PROJECTION | exact Change/Baseline/plan proof identity; no generic contract CRUD |
| `bld.plan_revision` | DIRECT | Get Plan + exact checkpoint decision |
| `bld.work_unit` | INTERNAL/PROJECTION | GetChangeExecutionDetail/progress; caller does not create arbitrary WorkUnits |
| `bld.actor_run` | INTERNAL/PROJECTION | execution detail/observability; runtime admission owner-only |
| `bld.coding_session` | INTERNAL | persistent cognitive/runtime relationship; no session-resume Product authority |
| `bld.finding` | DIRECT | list/get/close under current Evidence/owner authority |
| `bld.change_acceptance` | INTERNAL CURRENT-PROOF FACT | no generic AcceptChange; exact checkpoints/verifier/Builder settlement feed owner-controlled Release composition |

Result: `8/8 CLOSED_CANDIDATE`.

### Artifact Registry — 2

| Record | Disposition | Product home |
| --- | --- | --- |
| `reg.artifact` | PROJECTION | Project Capability/Agent/Brain/Release semantic projections |
| `reg.artifact_revision` | PROJECTION | immutable exact revisions through owning Product resources |

No Universal Artifact CRUD is admitted.

Result: `2/2 CLOSED_CANDIDATE`.

### Connections — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `con.connection` | DIRECT | Connection lifecycle/read |
| `con.connection_revision` | DIRECT/PROJECTION | revise/read exact Connection identity |
| `con.connection_qualification` | DIRECT/PROJECTION | qualification proof + detailed status/evidence read |

Result: `3/3 CLOSED_CANDIDATE`.

### Gateway — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `gw.effect_attempt` | DIRECT INSPECTION | Get/List exact EffectAttempt receipts/outcomes; business command remains owner-specific Project operation |
| `gw.idempotency_claim` | INTERNAL | no caller claims/retries generic idempotency |
| `gw.budget_counter` | INTERNAL/PROJECTION | runtime enforcement; usage/cost truth only through owner/OBS projection |

Result: `3/3 CLOSED_CANDIDATE`.

### Brain — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `brn.knowledge_proposal` | DIRECT | proposal intake/review/decision |
| `brn.health` | DIRECT READ / INTERNAL PROBE | GetBrainHealth; BrainHealthProbe is owner/proof orchestration, not Product command |
| `brn.binding_validation` | INTERNAL/PROJECTION | exact ProjectBrainBinding health/conformance; no mutable foreign mirror |

Result: `3/3 CLOSED_CANDIDATE`.

### Production Agent Runtime — 4

| Record | Disposition | Product home |
| --- | --- | --- |
| `par.conversation` | DIRECT | Conversation lifecycle/use |
| `par.agent_run` | DIRECT | exact interactive/headless execution + run inspection |
| `par.approval_request` | DIRECT | exact sealed approval subject/read/decision |
| `par.agent_trigger` | DIRECT | schedule trigger inspect/revise/enable/disable |

Authored Agent definition remains Project Git/Artifact/Release through Builder, not PAR CRUD.

Result: `4/4 CLOSED_CANDIDATE`.

### Release — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `rel.release` | DIRECT READ / OWNER-COMPOSE | Versions/read; immutable composition is owner/system transition after accepted proof |
| `rel.promotion` | DIRECT | promotion history/current decision |
| `rel.active_pointer` | PROJECTION | GetProjectServingState; caller cannot set pointer directly |

Result: `3/3 CLOSED_CANDIDATE`.

### Managed Application Runtime — 2

| Record | Disposition | Product home |
| --- | --- | --- |
| `mar.serving_route` | INTERNAL/PROJECTION | exact active Release serving; no route CRUD Product domain |
| `mar.job_run` | DIRECT | managed run read + bounded manual occurrence |

Result: `2/2 CLOSED_CANDIDATE`.

### Observability & Audit — 2

| Record | Disposition | Product home |
| --- | --- | --- |
| `obs.audit_record` | DIRECT READ | authorized immutable audit inspection |
| `obs.operational_event` | PROJECTION | Project Activity/execution observation; never current owner truth |

Result: `2/2 CLOSED_CANDIDATE`.

### Attachments & Blob — 2

| Record | Disposition | Product home |
| --- | --- | --- |
| `att.attachment` | CARRIER / OWNER-BOUND | exact owning Product operation where bytes are admitted |
| `att.blob` | INTERNAL CARRIER | digest/storage mechanics; key/path never authorization |

No global File Manager, UploadAnyFile or GetBlobByStorageKey Product operation is admitted.

Result: `2/2 CLOSED_CANDIDATE`.

### Total

```text
record classes checked = 46/46
unclassified = 0
record class requiring generic CRUD only by persistence symmetry = 0
mutable foreign-owner mirror required = 0
```

---

## 3. 13-owner boundary check

| Owner | Product operation/projection exists | Inflation explicitly prevented |
| --- | --- | --- |
| I&A | yes | Keycloak/provider claims excluded; app grant/role CRUD split merged |
| Workspace | yes | no generic organization tree |
| Project | yes | no hidden/default Project/resource registry |
| Builder | yes | WorkUnit/ActorRun/CodingSession subordinate; no generic AcceptChange |
| Artifact Registry | semantic projections only | no Universal Artifact API |
| Connections | yes | no generic Secret/provider executor |
| Gateway | effect inspection + internal execution | no second business command/retry API |
| Brain | yes | no RAG/memory/policy owner; probe remains internal |
| PAR | runtime semantics only | no authored Agent CRUD duplication |
| Release | yes | composition/pointer/served truth owner-controlled |
| OBS/Audit | read/evidence projection | no current business-state authority |
| Attachments/Blob | operation carrier | no global file owner |
| MAR | job-run/serving projection | no scheduler/workflow Product domain |

Result: `13/13 owner boundaries preserved`.

---

## 4. Whole-product scenario cross-check

| Scenario class | Operation/protocol home | Result |
| --- | --- | --- |
| establish Account/session/Workspace | IAM + Workspace; OIDC separate | COVERED |
| Project inception / Baseline | Project + InceptionInvestigation | COVERED |
| tiny safe Change | Builder Change/Plan/proof | COVERED |
| large Change / checkpoints | Builder + `project.review` | COVERED |
| inspect Preview/Code/Diff/Evidence | Builder purpose-built reads | COVERED |
| unhealthy/stale Connection | Connection qualification/read + exact Project binding | COVERED |
| external read/effect capability | exact Project Query/Action/Integration grammar + Gateway | COVERED |
| Brain discovery/review/publication | Brain proposal/review/publish | COVERED |
| Brain health changes after Agent admission | current Brain health recheck; no stale Agent grant | COVERED |
| static Query | exact Release-pinned Project Query | COVERED |
| AnalyticQuery | fixed Brain-governed read regime with exact caller routes | COVERED |
| publish/use app | Release/Promotion/app access + exact `Ops(R)` | COVERED |
| Product Agent author/evolve | Builder Change path; no PAR definition CRUD | COVERED |
| Product Agent conversation/run | PAR exact active Release/Conversation/AgentRun | COVERED |
| effect approval | exact ApprovalRequest + current eligibility + Gateway atomic effect admission | COVERED |
| unresolved external effect | Gateway effect fence + EffectAttempt inspection | COVERED |
| managed sync/job | exact job artifact + MAR occurrence/run | COVERED |
| Project archive | Project command; no implicit unpublish/trigger stop | COVERED |
| Project duplicate | DuplicateProject; no-data/no-credential/no-binding defaults | COVERED |
| rollback | another governed PromoteRelease to eligible prior Release | COVERED |
| app access independence | separate Published-App authorization plane | COVERED |
| unauthorized private bytes | owner authorization before byte retrieval | COVERED |
| backup/restore/emergency stop | operational control, intentionally non-Product | COVERED AS NON-PRODUCT |
| DEDICATED future consumer | semantic trust contract exists; concrete operations deferred to first real consumer | DEFERRED HONESTLY |
| SaaS private reachability | future requirement class only | DEFERRED HONESTLY |
| Budget Analyzer business results | operator-approved R1–R6 semantic set + `BUD-01/02` | COVERED |

Result: accepted 15 journeys + whole-product negative laws have an operation/protocol/non-Product home with no remaining semantic blocker.

---

## 5. Subtractive attack — applied

### S1 — Published-App access CRUD symmetry

```text
GrantPublishedAppAccess
ChangePublishedAppAccessRole
```

Both mutate the same `iam.published_app_access` Product meaning under the same administration authority. Exact create/update/precondition wire behavior can differ later without creating two Product meanings.

Applied:

```text
IAM-15 SetPublishedAppAccess
IAM-17 RevokePublishedAppAccess
IAM-16 removed from admitted census
```

Result: `-1 fixed platform operation`.

### S2 — Brain health probe

Users need current Brain health truth; owner/runtime needs proof orchestration. Current authority does not require a human `RunBrainHealthProbe` Product command.

Applied:

```text
BRN-10 GetBrainHealth = Product read
BRN-11 RunBrainHealthProbe = SYSTEM owner/proof orchestration
```

Result: `-1 fixed platform operation`.

### S3 — Release composition

Current Product meaning has explicit governed Promotion after verified/accepted proof. Immutable Release composition is an owner transition and is rechecked by Promotion; a separate human Compose command would expose mechanism as authority.

Applied:

```text
REL-03 ComposeRelease = SYSTEM owner transition
REL-01/02 Release reads = Product
REL-06 PromoteRelease = explicit consequential Product decision
```

Result: `-1 fixed platform operation`; `release.compose` remains rejected as an ordinary Permission.

### S4 — Connection qualification detail

`GetConnectionQualification` preserves exact revision/environment Evidence and `configured != qualified != bound != healthy` without hiding detail in a generic Connection summary.

Result: KEEP.

### S5 — EffectAttempt list/detail

Cross-origin effect investigation needs a Gateway-owned receipt/effect Evidence projection without teaching each business owner a second effect schema.

Result: KEEP under `audit.read`; no retry authority.

### S6 — list/detail pairs

Retained only where detail is materially richer, immutable or exact-subject scoped. No general list/get symmetry law exists.

Result: KEEP subject to later 4B/4C falsification.

---

## 6. Exact census consistency proof

### 6.1 Fixed platform prefix census

```text
IAM = 16
WS  =  6
PRJ = 22
BLD = 17
BRN = 11
CON =  9
REL =  7
PAR = 16
GW  =  2
MAR =  3
OBS =  5
----------------
TOTAL = 114
```

Independent subtractive equation:

```text
initial admitted candidate = 117
S1 semantic merge          =  -1
S2 Brain probe internal    =  -1
S3 Release compose internal=  -1
---------------------------------
N_platform                 = 114
```

Both derivations converge.

### 6.2 First vertical census

```text
BUD-01 AnalyzePendingBudgets
BUD-02 ListPendingBudgets
N_budget = 2
```

The two operations cover all approved R1–R6 results:

```text
BUD-01 → R1 summary + R2 seller + R3 customer + R4 aging + R5 month
BUD-02 → R6 pageable drilldown
unsupported/deferred F1 results → no operation
```

### 6.3 Permission census

The operation ledger maps all concrete operations to the frozen candidate vocabulary in `permission-contract.md`:

```text
ordinary Permissions = 25
fixed platform operations with auth route = 114/114
Budget operations with auth route          = 2/2
new global Permission per Project business operation = 0
```

### 6.4 Per-operation closure census

The grouped authority matrix in `operation-ledger.md` is exhaustive over the exact admitted IDs.

```text
semantic owner                   114/114
consumer                         114/114
principal / ingress              114/114
Permission / special condition   114/114
scope / containment              114/114
outcome profile                  114/114
current-authority route          114/114
idempotency/concurrency profile  114/114

Budget operations all fields     2/2
```

No admitted fixed operation is absent from the matrix and no removed/internal operation is counted by the exact prefix sets.

---

## 7. Project capability grammar consistency proof

The grammar survives the first vertical without becoming a universal executor:

```text
exact Release R
→ exact finite Ops(R)
→ registered Query / Action / honest Integration Operation only
→ exact caller + authority + Project/app/binding scope
→ exact positive + negative proof
```

Negative controls:

```text
execute(anySlug,anyInput)                = REJECT
execute(anySql)                          = REJECT
execute(anyProviderOperation)            = REJECT
caller-selected Connection/target URL    = REJECT
mutable-latest operation                 = REJECT
unregistered Product-Agent tool          = REJECT
```

Budget Analyzer specifically proves the grammar can express a real app with two exact `Query` operations without inventing generic dimension/metric/SQL authority.

---

## 8. Budget semantic blocker closure

`4A-BUDGET-01` / prior `4A-F05` is CLOSED by explicit operator approval on 2026-08-21.

Accepted semantic decisions include:

```text
Product focus           pending-budget intelligence
Budget                  Brain-admitted Budget document
Pending                 current pending Budget with no admitted conversion relation proving otherwise
source mappings         initial Sankhya Evidence, not Product meaning
as_of                   system-resolved source/reconciliation coordinate; no arbitrary historical query
Budget age              canonical Budget business date → as_of; DTALTER is not age authority
aging bands             0–3 / 4–7 / 8–30 / 31+
results                 R1–R6
margin                  unsupported
heuristic probability   rejected
conversion metrics      deferred until separately proved/admitted
operations              BUD-01 + BUD-02
```

A later field/code mapping correction remains a Brain/source-proof correction unless Evidence genuinely falsifies the Product semantic meaning.

---

## 9. Material findings disposition

```text
4A-F01 CLOSED
one fake global platform+future-app operation count rejected
→ N_platform + exact Ops(R) grammar + N_budget

4A-F02 CLOSED
Product Agent authoring duplication rejected
→ authored Agent remains Builder Change/Release; PAR runtime only

4A-F03 CLOSED
Blueprint/Forge owner/API invention rejected
→ planning-harness behavior stays Project/Builder design input

4A-F04 CLOSED
persistence-driven CRUD inflation rejected
→ 46/46 record classes classified

4A-F05 CLOSED / OPERATOR APPROVED
Budget Analyzer semantic inventory fixed truthfully
→ R1–R6 + BUD-01/02; unsupported claims remain unsupported

4A-F06 CLOSED_CANDIDATE
operation authority fields could remain narrative/incomplete
→ complete 114/114 + 2/2 grouped authority/current-state/IC mapping

4A-F07 CLOSED_CANDIDATE
candidate Permission vocabulary had unresolved AnalyticQuery route
→ no new analyticquery.execute; exact CP/PA/PAR routes closed
```

---

## 10. Proof conclusion before independent challenge

```text
fixed platform census             = 114
Project capability grammar        = closed exact-Release admission law
Budget Analyzer census            = 2
ordinary Permission vocabulary    = 25
record-class classification       = 46/46
owner-boundary classification     = 13/13
orphan concrete operations        = 0
speculative concrete operations   = 0
known unresolved semantic blockers= 0
```

The semantic/census/subtractive/consistency candidate is complete enough for an independent adversarial challenge over the **exact consolidated 4A HEAD**.

This Evidence does not ratify 4A, open 4B or authorize Product implementation.
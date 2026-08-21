# 4A Evidence — Product Operation Coverage

> **Kind:** Evidence / supporting proof, not Product authority.
> **Candidate authority under test:** `docs/product/operation-ledger.md` + `docs/product/permission-contract.md`.
> **Status:** 4A OPEN / pre-independent-review.

This evidence attacks the operation candidate against the accepted 15 Product journeys, the 13 semantic owners, the closed 46 durable record classes and the whole-product scenario laws. It is intended to detect both missing Product capability and CRUD/mechanism inflation.

---

## 1. Test rule

A durable record class does **not** require a direct Product CRUD operation.

Each accepted class must have one of these dispositions:

```text
DIRECT
→ current Product consumer needs exact owner operation/read

PROJECTION
→ visible only through a purpose-built owner/Product projection

INTERNAL
→ owner/runtime state intentionally not caller-controlled

CARRIER
→ reusable byte/transport/property used only through owning operation
```

Failure conditions:

```text
real user/headless intent with no admitted operation
record exposed only because CRUD symmetry suggests it
foreign owner state mirrored into a generic API
mechanism promoted to Product authority
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
| `iam.published_app_access` | DIRECT | independent Published-App access context/admin |

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
| `prj.config_contract_revision` | INTERNAL/PROJECTION | exact Release/Baseline composition; no standalone mutable config API required |

Result: `5/5 CLOSED_CANDIDATE`.

### Builder — 8

| Record | Disposition | Product home |
| --- | --- | --- |
| `bld.change` | DIRECT | List/Get/Create Change |
| `bld.contract_revision` | INTERNAL/PROJECTION | exact Change/Baseline/plan proof identity; no generic contract CRUD |
| `bld.plan_revision` | DIRECT | Get Plan + exact checkpoint decision |
| `bld.work_unit` | INTERNAL/PROJECTION | GetChangeExecutionDetail/progress; user does not create arbitrary WorkUnits |
| `bld.actor_run` | INTERNAL/PROJECTION | execution detail/observability; runtime admission owner-only |
| `bld.coding_session` | INTERNAL | persistent cognitive/runtime relationship; no session-resume Product authority |
| `bld.finding` | DIRECT | list/get/close under current Evidence/owner authority |
| `bld.change_acceptance` | INTERNAL CURRENT-PROOF FACT | no generic AcceptChange; exact checkpoints/verifier/owner settlement + ComposeRelease proof use |

Result: `8/8 CLOSED_CANDIDATE`; direct CRUD inflation avoided for five owner/mechanism classes.

### Artifact Registry — 2

| Record | Disposition | Product home |
| --- | --- | --- |
| `reg.artifact` | PROJECTION | Project Capabilities/Agent/Brain/Release semantic projections |
| `reg.artifact_revision` | PROJECTION | immutable exact revisions through owning Product resources |

No Universal Artifact CRUD is admitted.

Result: `2/2 CLOSED_CANDIDATE`.

### Connections — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `con.connection` | DIRECT | Connection lifecycle/read |
| `con.connection_revision` | DIRECT/PROJECTION | revise/read exact Connection identity |
| `con.connection_qualification` | DIRECT/PROJECTION | qualification action + detailed status/evidence read |

Result: `3/3 CLOSED_CANDIDATE`.

### Gateway — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `gw.effect_attempt` | DIRECT INSPECTION | Get/List exact EffectAttempt receipts/outcomes; business command remains owner-specific Project operation |
| `gw.idempotency_claim` | INTERNAL | no caller claims/retries generic idempotency |
| `gw.budget_counter` | INTERNAL/PROJECTION | runtime enforcement; usage/cost truth exposed through OBS/owner-specific projection, not counter CRUD |

Result: `3/3 CLOSED_CANDIDATE`.

### Brain — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `brn.knowledge_proposal` | DIRECT | proposal intake/review/decision |
| `brn.health` | DIRECT READ / INTERNAL PROBE | GetBrainHealth; probe orchestration may remain owner/internal |
| `brn.binding_validation` | INTERNAL/PROJECTION | surfaced on exact ProjectBrainBinding health/conformance, not mutable foreign state |

Result: `3/3 CLOSED_CANDIDATE`.

### Production Agent Runtime — 4

| Record | Disposition | Product home |
| --- | --- | --- |
| `par.conversation` | DIRECT | Conversation lifecycle/use |
| `par.agent_run` | DIRECT | exact interactive/headless execution + run inspection |
| `par.approval_request` | DIRECT | exact sealed approval subject/read/decision |
| `par.agent_trigger` | DIRECT | schedule trigger inspect/revise/enable/disable |

Agent authored definition is **not** a PAR record; it remains Project Git/Artifact/Release through Builder.

Result: `4/4 CLOSED_CANDIDATE`.

### Release — 3

| Record | Disposition | Product home |
| --- | --- | --- |
| `rel.release` | DIRECT READ / OWNER-COMPOSE | Versions/read; exact composition after accepted proof |
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
| `att.blob` | INTERNAL CARRIER | digest/storage mechanics; storage key/path never authorization |

No global File Manager, UploadAnyFile or GetBlobByStorageKey operation is admitted.

Result: `2/2 CLOSED_CANDIDATE`.

### Total

```text
record classes checked = 46 / 46
unclassified = 0
record class requiring generic CRUD only by persistence symmetry = 0
mutable foreign-owner mirror required = 0
```

---

## 3. 13-owner operation boundary check

| Owner | Product operation/projection exists | Mechanism inflation found? |
| --- | --- | --- |
| I&A | yes | Keycloak/provider claims explicitly excluded |
| Workspace | yes | no generic organization tree |
| Project | yes | no hidden/default Project/resource registry |
| Builder | yes | WorkUnit/ActorRun/CodingSession remain subordinate |
| Artifact Registry | semantic projections only | no Universal Artifact API |
| Connections | yes | no generic Secret/provider executor |
| Gateway | effect inspection + internal execution | no second business command API |
| Brain | yes | no RAG/memory/policy owner |
| PAR | runtime semantics only | no authored Agent CRUD duplication |
| Release | yes | pointer/served truth owner-controlled |
| OBS/Audit | read/evidence projection | no current business-state authority |
| Attachments/Blob | operation carrier | no global file owner |
| MAR | job-run/serving projection | no scheduler/workflow Product domain |

Result: `13/13 owner boundaries preserved`.

---

## 4. Whole-product scenario cross-check

The accepted whole-product scenario and negative laws were re-walked against the operation candidate.

| Scenario class | Operation/protocol home | Result |
| --- | --- | --- |
| establish Account/session/Workspace | IAM + Workspace; OIDC separate | COVERED |
| Project inception / Baseline | Project + InceptionInvestigation | COVERED |
| tiny safe Change | Builder Change/Plan/proof | COVERED |
| large Change / checkpoints | Builder + project.review | COVERED |
| inspect Preview/Code/Diff/Evidence | Builder purpose-built reads | COVERED |
| unhealthy/stale Connection | Connection qualification/read + exact Project binding | COVERED |
| external read/effect capability | exact Project Query/Action/Integration grammar + Gateway | COVERED |
| Brain discovery/review/publication | Brain proposal/review/publish | COVERED |
| Brain health changes after Agent admission | current Brain health owner recheck; no stale Agent grant | COVERED |
| static Query | exact Release-pinned Project Query | COVERED |
| AnalyticQuery | separate Brain-governed read regime | COVERED |
| publish/use app | Release/Promotion/app access + exact `Ops(R)` | COVERED |
| Product Agent author/evolve | Builder Change path; no PAR definition CRUD | COVERED |
| Product Agent conversation/run | PAR exact active Release/Conversation/AgentRun | COVERED |
| effect approval | exact ApprovalRequest + current eligibility + Gateway atomic claim | COVERED |
| unresolved external effect | Gateway internal fence + EffectAttempt inspection | COVERED |
| managed sync/job | exact job artifact + MAR occurrence/run | COVERED |
| Project archive | Project command; no implicit unpublish/trigger stop | COVERED |
| Project duplicate | DuplicateProject; no-data/no-credential/default laws | COVERED |
| rollback | another governed PromoteRelease to eligible prior Release | COVERED |
| app access independence | separate Published-App access plane | COVERED |
| unauthorized private bytes | owner authorization before byte retrieval | COVERED |
| backup/restore/emergency stop | operational control, intentionally not ordinary Product API | COVERED AS NON-PRODUCT |
| DEDICATED future consumer | semantic trust contract current; concrete operations deferred to first real consumer | DEFERRED HONESTLY |
| SaaS private reachability | future requirement class only | DEFERRED HONESTLY |
| Budget Analyzer business results | Project Query grammar exists, exact semantic inventory absent | **BLOCKED 4A-BUDGET-01** |

No new fixed platform operation was discovered by this pass outside the known Budget Analyzer semantic blocker.

---

## 5. Subtractive attack — first pass

### S1 — Published-App access upsert symmetry

Candidate:

```text
GrantPublishedAppAccess
ChangePublishedAppAccessRole
```

Observation: both write the same `iam.published_app_access` meaning and use the same semantic administration authority. Separate create/update wire semantics can be preserved in 4B without requiring two Product meanings.

Recommended candidate correction:

```text
SetPublishedAppAccess(account, exact app, role, expected-current?)
RevokePublishedAppAccess(...)
```

Disposition: **MERGE RECOMMENDED** (`-1 fixed platform op`).

### S2 — BrainHealthProbe caller command

`BrainHealthProbe` is an accepted L7 owner orchestration flow, but current Product authority does not require a human caller command. The user needs current Brain health truth; owner/runtime needs an internal probe path.

Recommended correction:

```text
GetBrainHealth              = Product read
RunBrainHealthProbe         = INTERNAL owner orchestration
```

Disposition: **REMOVE FROM FIXED PRODUCT CENSUS** (`-1`).

### S3 — ComposeRelease caller command

Accepted Journey C states that after verification the exact candidate becomes an immutable Release, while **Promotion** is the explicit governed operator decision. Current Product authority does not require a separate human `ComposeRelease` command merely because the L7 flow exists.

Recommended correction:

```text
ComposeRelease              = INTERNAL/OWNER transition gated by current accepted proof
List/Get Release            = Product reads
PromoteRelease              = explicit Product consequential decision
```

Disposition: **REMOVE FROM FIXED PRODUCT CENSUS** (`-1`).

Consequence: ordinary Permission `release.compose` should also be removed unless a later Product interaction proves a separate human composition capability.

### S4 — Connection qualification read

`GetConnectionQualification` carries exact revision/environment Evidence that does not fit safely into a generic Connection summary without either overfetching or hiding `configured != qualified != bound != healthy` semantics.

Disposition: **KEEP**.

### S5 — EffectAttempt list

Effects can originate Product Agent, human Project Action/Integration and managed-job paths. A project/run-scoped list is useful for investigation without teaching every originating owner a parallel effect-receipt schema.

Disposition: **KEEP**, but authorization remains `audit.read`/exact source disclosure and gives no retry authority.

### S6 — list/get pairs

List/detail pairs are retained only where the detail representation is materially richer/immutable/exact-subject scoped. No rule admits CRUD completeness by default.

Disposition: **KEEP FOR 4C/4B FALSIFICATION**, subject to later screen/wire evidence.

---

## 6. Post-subtraction candidate size

Before the first subtraction, the operation candidate had 117 `ADMIT_CANDIDATE` rows.

Applying S1–S3 gives:

```text
117
- 1  Published-App access semantic merge
- 1  BrainHealthProbe → INTERNAL
- 1  ComposeRelease → INTERNAL
= 114 fixed platform operation candidates
```

```text
N_platform candidate = 114
status = NOT FROZEN / NOT RATIFIED
```

The count may still shrink or expand if Permission mapping, frontend realization or independent challenge finds a material semantic issue. The number itself is not a target.

---

## 7. Current material findings

```text
4A-F01 CLOSED_CANDIDATE
one global operation census was structurally wrong for a software platform
→ fixed platform N_platform + exact Project Ops(R) grammar + first-vertical N_budget

4A-F02 CLOSED_CANDIDATE
Product Agent authoring could have duplicated Project/Builder authority
→ authoring remains Change/Release path; PAR owns runtime only

4A-F03 CLOSED_CANDIDATE
Paved-road planning names could have become new semantic owners
→ Blueprint/Forge owner/API invention rejected; behavior remains Project/Builder design input

4A-F04 CLOSED_CANDIDATE
persistence inventory could have driven generic CRUD
→ 46/46 records explicitly direct/projection/internal/carrier classified

4A-F05 OPEN
exact Budget Analyzer Product-visible semantic/result inventory is absent
→ N_budget cannot be frozen without operator Product/Brain semantic decision
```

---

## 8. Next proof steps

```text
1. apply the S1–S3 semantic corrections to the operation ledger
2. remove `release.compose` from candidate ordinary Permissions
3. complete operation → Permission/special-condition matrix
4. bind idempotency / CR-1 / audit-required / current-proof obligations
5. resolve 4A-F05 / 4A-BUDGET-01 with operator semantic decision
6. then produce executable census consistency guard
7. independent Fable review on exact candidate
```

No 4B/OpenAPI/frontend/SDK/runtime/Product implementation is authorized by this Evidence.
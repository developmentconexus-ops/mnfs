# 3A-R11 — Round-3 Closure-Keyed Coherence Review

**Status:** COMPLETE / BOUNDED PROJECTION CORRECTION REQUIRED  
**Checkpoint:** 3A-R11 — Whole-Product Authority Rebaseline  
**Reviewed HEAD:** `9be9a92fbda9e5d43e391eb6d1002371ebd46b6e`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Implementation:** BLOCKED  
**Package B:** PAUSED / NOT OPENED  

This review is R11 self-review Evidence, not new Product/architecture authority. It was performed after the independently reviewed FBL-01..17 corrections were applied by Codex.

---

## 1. Verification result before closure-keyed pass

The Codex correction commit changed only:

```text
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/current/DECISION-RECONCILIATION.md
docs/conexus/current/PRODUCT-CONTRACT.md
docs/conexus/current/README.md
docs/conexus/phase3/LEDGER.md
```

No Product implementation bytes were added.

Exact-HEAD CI was green:

```text
Documentation                         = SUCCESS
npm run verify                        = SUCCESS
Conexus 3L Package A non-billable     = SUCCESS
Conexus 3L Package A Lock Bootstrap   = SUCCESS
billable/live qualification jobs      = NOT re-run
```

The FBL findings were independently checked against the corrected bytes. `FBL-01..17` are represented with the required authority strength, including:

```text
pinned ConnectionRevision == active target revision
Product-Agent SCHEDULE no-backlog/consume-on-skip semantics
Archive != unpublish/stop
Audit-required FAIL CLOSED triad
Brain critical-health/content-security laws
single non-terminal Promotion + maintenance-block survival
MANAGED_JOB Gateway caller amendment
CR-1 / closed cross-owner atomicities
Builder custody/cancel/lineage/fresh-verifier laws
mandatory tasks.md SHARE gate / four Brain digests / TDD*-first Discovery
universal QA-DB migration gate + periodic drift + no rebuild at promote
probe IDs / router / status / Product inspectability / future seams
```

Therefore the independent Fable review was acted upon correctly.

---

## 2. Why another pass was required

Fable's process finding was correct: prior R11 completeness checks were keyed off the R11 census and then off their own corrections. That can prove a correction set without proving the accepted architecture corpus was fully projected.

This pass instead used accepted **phase closures as an external checklist**:

```text
3C-R1
3D-R1
3E-R1 + 3E-02
3F-R1
3G-R1 + 3G-04/05/08 where load-bearing
3H-R1
3I-R1 + 3I-04 where load-bearing
3J-R1 + 3J-02
3K-R1
```

For every closure family the question was:

> Does the four-file current tree expose the current load-bearing meaning strongly enough that a Fresh Actor does not have to discover an unknown-unknown by archaeological reading, while still routing full detail to the semantic home?

Result:

```text
accepted architecture contradiction             = 0
architecture reopen required                     = NO
new Product requirement                          = 0
new module/record/database/framework              = 0
FBL-01..17 regression                             = 0
additional current-tree projection findings       = 8
```

---

# 3. Additional projection findings

## R3C-01 — MATERIAL PROJECTION CONTRADICTION — Connection ownership scope

### Defect

The current tree repeatedly says or implies:

```text
Workspace owns Connections
Connection = Workspace-owned
```

including structural-law / Product wording and C-007 reconciliation.

### Accepted authority

`3C-07 — Connections Module Boundary` deliberately refined the earlier 3B/C-007 shape after a material finding:

```text
Connection.ownerScope = WORKSPACE | PROJECT
```

Both scopes have real F1 consumers. The alternatives "always Workspace" and "always Project" were explicitly rejected.

Current semantic law:

```text
ConnectorDefinition                     → PLATFORM / Registry
Connection                              → Connections owner
Connection ownerScope                   → WORKSPACE | PROJECT
ProjectConnectionBinding                → Project intent to consume exact ConnectionRevision
Workspace-scoped Connection             → reusable organizational resource
Project-scoped Connection               → private Project dependency
provider                                -X-> determines scope
```

A Project-scoped Connection is not implicitly reusable by sibling Projects. Workspace-scoped Connection is not implicitly usable merely because the Project shares the Workspace.

### Required correction

Correct all four current-tree projections so that:

```text
Brain = Workspace-scoped
Connection ownerScope = WORKSPACE | PROJECT
Project consumption = explicit exact ProjectConnectionBinding
```

Do not create `WorkspaceConnection` / `ProjectConnection` classes or a generic resource-scope engine.

**Reopen:** NONE.

---

## R3C-02 — REQUIRED NOMENCLATURE CORRECTION — Brain `EVIDENCE_SPEC`

### Defect

The current tree still names Brain content classes:

```text
SEMANTIC | KNOWLEDGE | EVIDENCE
```

### Accepted authority

`3C-R1` explicitly renamed the Brain content class to:

```text
EVIDENCE_SPEC
```

so that:

```text
Brain EVIDENCE_SPEC
→ what should count as / require proof

Builder / verification Evidence
→ actual collected proof refs/digests/facts
```

### Required correction

Every canonical current-tree occurrence that names the Brain class must say:

```text
SEMANTIC | KNOWLEDGE | EVIDENCE_SPEC
```

Preserve ordinary `Evidence` as the actual proof concept.

**Reopen:** NONE.

---

## R3C-03 — REQUIRED ARCHITECTURE PROJECTION — Dependency closure

### Defect

`ARCHITECTURE-BASELINE.md` has owner/runtime maps but does not expose the accepted Dependency Architecture closure strongly enough. A Fresh Actor cannot discover the exceptional orchestration/inversion topology from the current tree.

### Accepted authority

`3D-R1` closes:

```text
acyclic modular-monolith import graph
direct narrow in-process calls by default
module/runtime → L7 = prohibited
L7 universal mediator = prohibited
```

Exactly seven F1 control-plane orchestration flows:

```text
CreateProject
SetProjectBinding
QualifyConnection
InceptionInvestigation
BrainHealthProbe
ComposeRelease
PromoteRelease
```

Only one F1 domain dependency inversion:

```text
Gateway defines narrow effect-approval claim capability
PAR owns ApprovalRequest authority and implements it
composition root wires it
```

Exactly four frozen infrastructure boundaries from 3D:

```text
CodingRuntime
CredentialBackend
BlobStore/CAS
GitInfra
```

Later `3A-R9` amends the Gateway caller surfaces with `MANAGED_JOB`; it does not create an eighth L7 orchestration flow.

### Required correction

Add one compact Dependency Architecture section to `ARCHITECTURE-BASELINE.md` with the laws above and route full import matrix/detail to 3D-R1.

Do not create ApplicationLayerModule, mediator, bus, provider framework or additional port abstractions.

**Reopen:** NONE.

---

## R3C-04 — REQUIRED ARCHITECTURE PROJECTION — Closed Data Architecture inventory

### Defect

The current tree explains physical truth classes but does not expose that 3E closed the F1 durable-state inventory. This makes future readers vulnerable to inventing records/FKs as implementation convenience.

### Accepted authority

`3E-R1` / `3E-02` freeze:

```text
hub_control owner schemas = 13
F1 durable record classes = 46
Tier-2 cross-module FK allowlist = exactly 16
Tier-3 refs/digests = default for non-structural cross-owner references
shared/common schema = NONE
mutable current-state mirrors of another owner = FORBIDDEN
new durable class or new Tier-2 FK = Decision Loop / material Finding
```

The current 13 owner schemas are:

```text
iam ws prj bld reg con gw brn par rel mar obs att
```

Do not copy the entire 46-record table into the current tree. A compact closed-inventory statement plus pointer to 3E-02 is sufficient.

### Required correction

Add a compact Data Closure subsection to `ARCHITECTURE-BASELINE.md` and a corresponding current-generation note in `DECISION-RECONCILIATION.md`.

**Reopen:** NONE.

---

## R3C-05 — REQUIRED ARCHITECTURE PROJECTION — Contract/version/public-failure closure

### Defect

The Decision Registry currently says only "owner-specific payloads / INTERNAL vs INDEPENDENT / exact approval / concrete bindings / public failure semantics". The Architecture Baseline does not expose the load-bearing current contract architecture.

### Accepted authority

`3F-R1` freezes at minimum:

```text
LIVE SURFACE = INTERNAL | INDEPENDENT
CONDITIONAL = routing state only
persistence alone != contract

VERSION-GAP MODE
= PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD

payload families remain owner-specific
UniversalRequest/Response/Status/InternalFailure = NONE
```

Approval:

```text
one ApprovalRequest
= one human decision
= one exact sealed effect subject
```

Bindings:

```text
ProjectConnectionBinding
ProjectBrainBinding
```

Public behavior-code baseline:

```text
CLIENT_OUTDATED
CAS_CONFLICT
CAPABILITY_UNAVAILABLE_HEALTH
NOT_FOUND
OPERATION_REJECTED
VALIDATION_FAILED
MANIFEST_INVALID
OUTPUT_CONTRACT_VIOLATION
INTERNAL_ERROR
```

`code` is the semantic consumer-behavior key; HTTP status/transport metadata do not form a competing public behavior taxonomy.

### Required correction

Add a compact Contracts/API closure section to `ARCHITECTURE-BASELINE.md`. Keep detailed DTO/wire/schema spelling routed to 3F/Realization.

**Reopen:** NONE.

---

## R3C-06 — REQUIRED ARCHITECTURE/PRODUCT PROJECTION — PlanningDepth × RigorProfile

### Defect

The current tree says planning is proportional, but omits the exact two state axes already ratified.

### Accepted authority

`3G-04` freezes orthogonal axes:

```text
PlanningDepth = DIRECT | LIGHT | FULL
RigorProfile  = FAST | BOUNDED | CONTROLLED
```

They answer different questions and do not imply one another:

```text
DIRECT + CONTROLLED = valid
FULL + BOUNDED      = valid
```

PlanningDepth floor is checkpoint authority; RigorProfile is calculated from current effect/diff/environment signals. Unknown never lowers rigor. No 3×3 workflow matrix or authoritative LLM classifier exists.

### Required correction

Add the exact axes and orthogonality to Product/Architecture Plan sections, without forcing this vocabulary on normal user UI.

**Reopen:** NONE.

---

## R3C-07 — REQUIRED ARCHITECTURE PROJECTION — DEDICATED semantics already decided

### Defect

The current tree correctly states `ApplicationRuntimeProfile = MANAGED | DEDICATED`, but underprojects two already-approved semantic boundaries and can make DEDICATED look more deferred than it is.

### Accepted authority

#### A. DEDICATED network/application independence — 3C-R1 / 3C-12

```text
Gateway-only
= Conexus-governed business/application capability boundary
!= universal network stack of every DEDICATED product
```

A DEDICATED runtime may own product-specific server/network behavior. When it consumes Conexus-custodied capabilities, it must use explicit bindings/contracts/Platform Services and receives no Connection/Hub/Vault credential by inheritance.

DEDICATED may own its own application data plane/runtime. It is not forced onto MANAGED Project Data merely because it is a Conexus Project.

#### B. DEDICATED trusted exchange — 3F-06 + 3I-04

This semantic contract is **CURRENT**, while physical DEDICATED deployment remains deferred:

```text
principal              = DedicatedApplicationPrincipal
client auth            = private_key_jwt
signed assertion binds = exact ReleaseRef
access token           = short-lived signed bearer
current recheck        = credentialGeneration + Project/Release containment
                         + Release-pinned service composition
                         + current owner/security gates
F1 mode                = SERVICE_SCOPED only
```

A valid token is recent authentication + exact Release assertion, never an authorization snapshot. USER_DELEGATED, refresh token/session store, DPoP/mTLS/fleet/install identity remain deferred/rejected unless their triggers fire.

### Required correction

Add this compact semantic distinction to `ARCHITECTURE-BASELINE.md` and ensure `PRODUCT-CONTRACT.md` does not describe DEDICATED as though all runtime/network/data behavior were Gateway/MANAGED-owned.

**Reopen:** NONE.

---

## R3C-08 — REQUIRED OPERATIONS PROJECTION — first-installation recovery contract

### Defect

The Architecture Baseline projects single-host/manual restore and pre-production restore proof, but omits the numeric first-installation contract frozen by 3J-02.

### Accepted authority

First-installation only:

```text
RPO <= 6 hours
RTO <= 8 hours
```

Recovery set is class-based, including:

```text
hub_control
all production Project DBs
mastra_par
non-reconstructible digest-addressed bytes
CredentialBackend ciphertext backing
provider-independent canonical Git recovery bundles
recovery manifests
```

`mastra_builder` is not REQUIRED by default because loss may force FRESH_BASE without deleting current authority.

Before first production activation:

```text
complete successful restore from real off-host protected generation = REQUIRED
whole-Hub emergency-stop drill = REQUIRED
```

These numbers are first-installation operations authority, not a SaaS-wide SLA.

### Required correction

Add the exact RPO/RTO and recovery-set distinction to `ARCHITECTURE-BASELINE.md` / current README first-production summary as appropriate.

**Reopen:** NONE.

---

# 4. Closure families with no additional surviving finding

After the FBL corrections, no additional projection contradiction/load-bearing omission requiring this bounded round was found in:

```text
3G owner-local lifecycle / AgentRun / Gateway effect / Release race laws beyond R3C-06
3H Builder/PAR realization, isolation, RequestContext, F5 and verifier laws
3I current authorization, custody, spend, CR-1, trust-zone and least-privilege laws beyond R3C-07
3K Product truth/inspectability/first-vertical/Product-Agent laws
```

The R11 tree correctly keeps detailed semantic homes authoritative rather than cloning every state transition/proof obligation.

---

# 5. Adjudication

```text
R3C-01 Connection scope              = CORRECT_PROJECTION / mandatory
R3C-02 Brain EVIDENCE_SPEC           = CORRECT_PROJECTION / mandatory
R3C-03 Dependency closure            = CORRECT_PROJECTION / mandatory
R3C-04 Data closed inventory         = CORRECT_PROJECTION / mandatory
R3C-05 Contracts/API closure         = CORRECT_PROJECTION / mandatory
R3C-06 PlanningDepth × Rigor         = CORRECT_PROJECTION / mandatory
R3C-07 DEDICATED semantics           = CORRECT_PROJECTION / mandatory
R3C-08 RPO/RTO recovery contract     = CORRECT_PROJECTION / mandatory

architecture reopen                  = NONE
new Product requirement              = 0
new domain/module/record/database    = 0
new generic mechanism/framework      = 0
Package B                            = REMAINS PAUSED
R11-H                                = BLOCKED until correction + fresh re-coherence
```

The desired correction is **small semantic projection**, not a second architecture specification. Full detail remains in the accepted semantic homes named above.

---

# 6. Exact next action

```text
apply R3C-01..08 to the four-file current tree
+ keep LEDGER in R11 ACTIVE / Package B PAUSED state
→ npm run verify
→ fresh closure-keyed spot-check
→ Fresh Actor re-review
→ only then R11-H operator ratification
```

No second independent Fable review is required by this finding package because these are direct accepted-authority projection corrections discovered during the post-Fable re-coherence that Fable itself required. Any correction that appears to need new authority must stop and return to adjudication instead of being implemented.

# 3A-R11 — Codex Round-3.1 Closure-Keyed Projection Correction Handoff

**Status:** EXECUTION HANDOFF / NON-AUTHORITATIVE  
**Checkpoint:** 3A-R11 — Whole-Product Authority Rebaseline  
**Expected starting HEAD:** `1b049adc017bfca140330a43babc9cf23726c2ba` — revalidate; never trust this SHA if branch moved  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Package B:** PAUSED / NOT OPENED  
**Implementation:** BLOCKED  

> This handoff is bootstrap only, never authority. Start from repo routing/Method and read the accepted authority named by the adjudicated finding package before editing.

---

## 1. Mission

Apply exactly the bounded projection corrections in:

```text
docs/conexus/phase3/3A-R11-round3-closure-keyed-coherence.md
```

The accepted set is:

```text
R3C-01 Connection ownerScope = WORKSPACE | PROJECT
R3C-02 Brain EVIDENCE_SPEC nomenclature
R3C-03 Dependency closure projection
R3C-04 closed Data Architecture inventory projection
R3C-05 Contracts/API closure projection
R3C-06 PlanningDepth × RigorProfile exact axes
R3C-07 DEDICATED semantic/runtime/trusted-exchange projection
R3C-08 first-installation RPO/RTO + recovery contract projection
```

These are **projection corrections only**. No accepted architecture is reopened.

---

## 2. Files allowed to change

Normal correction scope:

```text
docs/conexus/current/README.md
docs/conexus/current/PRODUCT-CONTRACT.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/current/DECISION-RECONCILIATION.md
docs/conexus/phase3/LEDGER.md
```

Do not edit detailed accepted C-/3A–3K authority to make it match a summary. The current tree must match the detailed authority.

Do not touch Product code, dependencies, workflows, probes or Package-B harnesses.

---

## 3. Required corrections

### R3C-01 — Connection scope

Remove every universal statement equivalent to:

```text
Workspace owns Connections
Connection = Workspace-owned only
```

Replace with the accepted 3C-07 semantics:

```text
Connections module owns Connection semantic lifecycle
Connection.ownerScope = WORKSPACE | PROJECT
Workspace-scoped Connection = reusable organizational resource
Project-scoped Connection = private Project resource
Project use of an exact ConnectionRevision = explicit ProjectConnectionBinding
provider does not determine scope
cross-Workspace use = denied
Project-scoped Connection is not implicitly reusable by siblings
```

Do not create two Connection classes or generic scope machinery.

`Workspace` Product surfaces may expose Workspace-scoped Connections; a Project surface may expose its private Project-scoped Connections/bindings without changing owner semantics.

Update the C-007 disposition in Decision Reconciliation so it no longer says only `Workspace Connection`.

### R3C-02 — Brain EVIDENCE_SPEC

Canonical current terminology:

```text
SEMANTIC | KNOWLEDGE | EVIDENCE_SPEC
```

Never use `EVIDENCE` as the Brain content-class name in current-tree normative lists.

Preserve:

```text
Brain EVIDENCE_SPEC = specification of what/how to prove
Builder/verification Evidence = actual collected proof
```

Do not rename historical authority files.

### R3C-03 — Dependency closure

Add one compact section to `ARCHITECTURE-BASELINE.md` that exposes:

```text
acyclic modular-monolith import graph
direct narrow in-process calls by default
module/runtime → L7 prohibited
L7 universal mediator prohibited
```

Exactly seven control-plane orchestration flows:

```text
CreateProject
SetProjectBinding
QualifyConnection
InceptionInvestigation
BrainHealthProbe
ComposeRelease
PromoteRelease
```

Only one domain dependency inversion:

```text
Gateway defines narrow approval-claim capability
PAR owns ApprovalRequest and implements it
composition root wires it
```

Exactly four 3D infrastructure boundaries:

```text
CodingRuntime
CredentialBackend
BlobStore/CAS
GitInfra
```

Clarify:

```text
3A-R9 MANAGED_JOB = later Gateway caller-surface amendment
!= eighth L7 orchestration flow
```

Do not copy full import matrix or invent ports/adapters.

### R3C-04 — Data closure

Add compact closure facts:

```text
hub_control owner schemas = 13
schemas = iam ws prj bld reg con gw brn par rel mar obs att
F1 durable record classes = 46
Tier-2 cross-module FK allowlist = exactly 16
Tier-3 refs/digests = default for non-structural cross-owner refs
shared/common schema = none
mutable current-state mirror of another owner = forbidden
new durable class or new Tier-2 FK = Decision Loop / material Finding
```

Do not copy all 46 classes or 16 FK rows into the current baseline; point to 3E-02 for exact inventory.

### R3C-05 — Contracts/API closure

Add a compact Contracts/API section to Architecture Baseline:

```text
LIVE SURFACE = INTERNAL | INDEPENDENT
CONDITIONAL = routing only
persistence alone != contract
VERSION-GAP = PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD
owner-specific payload families; no UniversalRequest/Response/Status/InternalFailure
```

Approval:

```text
one ApprovalRequest = one human decision = one exact sealed effect subject
```

Bindings remain concrete:

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

`code` is the semantic consumer-behavior key; HTTP/transport is not a second taxonomy.

Do not freeze HTTP routes/DTO spelling.

### R3C-06 — PlanningDepth × RigorProfile

Current exact axes:

```text
PlanningDepth = DIRECT | LIGHT | FULL
RigorProfile  = FAST | BOUNDED | CONTROLLED
```

They are orthogonal:

```text
DIRECT + CONTROLLED valid
FULL + BOUNDED valid
```

PlanningDepth floor is human-checkpoint/Change authority. Rigor is calculated from current effect/diff/environment signals. Unknown never lowers rigor. Both gates must pass for dispatch. No 3×3 matrix / PlanningEngine / LLM-authoritative classifier.

Add to Product Plan and Architecture Builder/behavior section. Do not make enum names mandatory normal-user vocabulary.

### R3C-07 — DEDICATED semantics

Current Product/architecture must distinguish:

```text
ApplicationRuntimeProfile = MANAGED | DEDICATED
```

For DEDICATED:

```text
runtime/data plane may be application-owned/independently executable
product-specific network behavior may be owned by DEDICATED app
Gateway-only = Conexus-governed capability boundary
Gateway-only != universal DEDICATED network stack
Conexus-owned capabilities require explicit binding/Platform Service
no Connection/Hub/Vault credential by inheritance
```

Also project the already-approved trusted exchange semantics even though physical deployment remains deferred:

```text
principal              = DedicatedApplicationPrincipal
client auth            = private_key_jwt
signed assertion binds = exact ReleaseRef
access token           = short-lived signed bearer
recheck                = credentialGeneration + Project/Release containment
                         + Release-pinned service composition
                         + current owner/security gates
F1 mode                = SERVICE_SCOPED only
```

Clarify:

```text
DEDICATED semantic/trust contract = CURRENT
DEDICATED physical deployment     = DEFERRED until first real deployment
```

Do not add auth records/session store/refresh-token/DPoP/mTLS/fleet machinery.

### R3C-08 — first-installation recovery

Add the exact accepted first-installation operations contract:

```text
RPO <= 6h
RTO <= 8h
```

Compact recovery set:

```text
REQUIRED
- hub_control
- all production Project DBs
- mastra_par
- non-reconstructible digest-addressed bytes
- CredentialBackend ciphertext backing
- provider-independent canonical Git recovery bundles
- recovery manifests

NOT REQUIRED BY DEFAULT
- mastra_builder
- E2B/validation/cache/reconstructible state
```

Preserve:

```text
complete restore proof from real off-host protected generation before first production
whole-Hub emergency-stop drill before first production
```

Numbers are first-installation operations contract, not SaaS SLA.

---

## 4. Status/router requirements during correction

Before correction is verified, the repo must not claim R11-H is ready.

Update the candidate/current status and `LEDGER` honestly to a shape equivalent to:

```text
3A-R11 ACTIVE
ROUND-3 FABLE CORRECTIONS APPLIED
CLOSURE-KEYED PASS FOUND R3C-01..08
ROUND-3.1 PROJECTION CORRECTION IN PROGRESS / then APPLIED
R11-H BLOCKED until GPT authority review verifies the correction
Package B PAUSED / NOT OPENED
```

Do **not** set:

```text
R11-H NEXT / ready
R11 APPROVED/CLOSED
current tree = CURRENT authority
Package B NEXT/OPEN
```

Only GPT authority review may mark the mechanical correction verified; only explicit operator ratification may promote the current tree.

---

## 5. Required verification

After edits:

```text
npm run verify
```

Also search the four current files for negative/stale forms:

```text
"Workspace owns Brain/Connections"      → must be absent as universal law
"Workspace-owned concrete relationship" → must be absent as universal Connection definition
"SEMANTIC | KNOWLEDGE | EVIDENCE"       → must not survive as Brain class list
"R11-H ... NEXT"                        → must not claim readiness before GPT review
```

Positive search/inspection must establish all R3C-01..08 facts.

Do not rerun billable/provider-live 3L probes; these are documentation/projection corrections.

---

## 6. Stop conditions

Stop and report instead of inventing if any correction appears to require:

```text
new Product requirement
architecture reopen
new module/record/schema/database
new public API meaning
new trust principal
new runtime profile
new qualification claim
new probe/billable run
Package B execution
```

---

## 7. Completion report

When done, report/persist enough evidence for GPT to verify:

```text
starting HEAD
final HEAD
files changed
one-line mapping R3C-01..08 → edited section(s)
npm run verify result
stale-string search result
confirmation: no product code / no Package B / no merge
```

Do not call the current tree ratified/current. Do not mark R11-H complete.

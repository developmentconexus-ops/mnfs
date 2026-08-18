# 3A-R11-E — Whole-Product Coherence Pass

**Status:** ROUND 1 COMPLETE / PROJECTION CORRECTIONS REQUIRED  
**Authority:** R11 review Evidence; findings are not new Product requirements  
**Reviewed candidates:**

- `docs/conexus/current/DECISION-RECONCILIATION.md`
- `docs/conexus/current/PRODUCT-CONTRACT.md`
- `docs/conexus/current/ARCHITECTURE-BASELINE.md`

**Detailed authority sampled/checked:** C-001/C-003/C-011/C-013/C-014, 3A-R5..R10, 3B, 3C–3J closures, 3K-01..04/R1, 3L-Q0/Package A.

---

## 1. Review question

> **Can a Fresh Actor read the three R11 candidates and reconstruct the accepted Conexus Product/architecture without losing still-current obligations, resurrecting stale mechanisms, inventing duplicate authority, or overstating technology proof?**

Round 1 outcome:

```text
material accepted-authority contradiction        = NONE FOUND
material architecture/product reopen              = NONE
false owner / duplicate owner                      = NONE FOUND
qualification overstatement requiring reopen       = NONE FOUND
future dormant machinery introduced                = NONE FOUND
projection/completeness corrections required       = YES
```

The corrections below are defects in the **R11 compilation**, not findings against the accepted architecture.

---

## 2. C-003 requirement reconciliation

R11 deliberately does not preserve historical mechanism wording when later accepted authority changed it. The requirement intent matrix below exists to ensure the Product/Architecture candidates still carry every live obligation.

### HAR — Builder/Harness

| Requirement | Current disposition | R11 action |
|---|---|---|
| HAR-1 worker turn / SYNC→BUILD→SHARE / one commit / disposable sandbox | **PARTIALLY SUPERSEDED** | Preserve Hub-mediated work/result custody and bounded WorkUnit result; current runtime is persistent Change CodingSession. Current Git law = one canonical result commit per bounded WorkUnit, not cognitive/session reset. |
| HAR-2 scope separate from build; audit against real data | **PRESERVE / REFINED** | Product Contract already has Inception/Discovery; keep source/data proof via current Hub/Gateway authority. |
| HAR-3 human checkpoint mechanically enforced | **CURRENT** | Already represented; exact checkpoint remains owner/hub authority. |
| HAR-4 versioned planning docs/memory | **REFINED / CURRENT** | Baseline + current plan + `tasks.md` purpose-memory semantics must remain visible; `tasks.md` is not operational authority. |
| HAR-5 byte/version-controlled scaffold + escape hatch | **CURRENT** | Architecture Baseline should carry scaffold ownership/conformance more explicitly. |
| HAR-6 engineering as template/gates, not manual governance | **CURRENT** | Keep as scaffold/platform invariant. |
| HAR-7 approvable visual plan | **CURRENT** | Product Contract currently under-represents this F1 experience. Add Plan/visual dependency view when planning depth warrants it. |
| HAR-8 live execution checklist + typed progress + tasks.md | **CURRENT / REFINED** | Product/Architecture candidates under-represent current Hub-owned checklist + UI projection + tasks.md purpose memory. |
| HAR-9 known limitations + numeric/verifiable acceptance | **CURRENT** | Make explicit in Change/verification Product journey. |
| HAR-10 fresh worker per unit + independent validator | **PARTIALLY SUPERSEDED** | Fresh cognitive reset is superseded; independent material verifier and externalized authority survive. |
| HAR-11 multi-model by role | **REFINED / CURRENT OBJECTIVE** | Preserve runtime/model identity and role-specific model policy; different-provider verifier is not a universal invariant after current runtime reconciliation. |

### REG — Artifact/Registry

| Requirement | Current disposition | R11 action |
|---|---|---|
| REG-1 build privileged vs runtime restricted | **CURRENT / REFINED** | Already represented through owners/roles/Gateway; no single SDK implementation forced. |
| REG-2 stable slug, not numeric ID | **CURRENT** | Add concise Artifact identity law to Architecture Baseline. |
| REG-3 real bind parameters | **CURRENT** | Detailed C-005 contract remains semantic home; no need to duplicate parser grammar everywhere. |
| REG-4 list→update/create provisioning | **SUPERSEDED AS REGISTRY AUTHORING MECHANISM** | Git-first compilation/deployment is current; do not resurrect mutable registration API. |
| REG-5 one response envelope | **SUPERSEDED** | 3F explicitly rejects a UniversalEnvelope; Decision Reconciliation should route this stale requirement explicitly. |

### DAT — Data

All four Product/correctness intents survive in refined form: Project data isolation, migration-as-gate, ephemeral validation/fixtures and UTF-8 correctness. Later 3E/3J own exact environment/role/restore semantics.

### INT — Integrations

INT-1..5 remain preserved/refined through Connector/Connection/Binding/Gateway/Discovery laws.

`INT-6 — managed tunnel for on-prem` is an explicit **F2/SaaS-direction requirement**, but no current topology justifies a tunnel implementation F1. The future Product seam must remain visible as **SaaS-to-private/on-prem reachability**, with mechanism rederived when the SaaS topology is real.

### CER — Brain

| Requirement | Current disposition | R11 action |
|---|---|---|
| CER-1 company/group Brain context | **REFINED** | Workspace Brain + explicit ProjectBrainBinding; live inheritance rejected. |
| CER-2 structured versioned editable Brain | **CURRENT** | Already represented. |
| CER-3 assisted discovery/interview | **CURRENT** | Product Contract under-represents this F1 capability; add source-aware machine-propose/human-decide Brain Discovery. |
| CER-4 project discovery → Brain feedback | **CURRENT** | KnowledgeProposal journey present; keep explicit. |
| CER-5 deterministic layered context | **REFINED / CURRENT** | Architecture owns exact role/context composition; no implicit group inheritance. |

C-011 additionally requires the current `AnalyticQuery` second read regime, Brain health/drift honesty and deterministic context budgeting. Architecture Baseline should carry these at current-property level.

### AGT — Product Agents

| Requirement | Current disposition | R11 action |
|---|---|---|
| AGT-1 first-class Agent | **CURRENT** | Covered. |
| AGT-2 central Agent management | **CURRENT / REFINED** | Project owner + Workspace access-filtered catalog; covered. |
| AGT-3 cron/webhook headless with service identity | **PARTIALLY SUPERSEDED** | Headless survives; SCHEDULE admitted; EVENT/webhook deferred; runtime Agent is not authorization principal. Route stale wording explicitly. |
| AGT-4 Platform Consultant | **CURRENT / REFINED** | Product Contract should explicitly preserve contextual Conexus/Platform Consultant capability; platform knowledge is Builder-owned platform knowledge, not Workspace Brain. |
| AGT-5 embeddable Agent session | **CURRENT PRODUCT INTENT / MECHANISM REFINED** | Project-designed interactive Agent surface + Conversation/AgentRun survives; historical `AgentTaskSession`/handshake transport is not current authority. |

### PUB — Published runtime

| Requirement | Current disposition | R11 action |
|---|---|---|
| PUB-1 environment config + restricted runtime SDK | **CURRENT / REFINED** | Release config contract/runtime injection semantics should be made more explicit in Architecture Baseline. |
| PUB-2 token in URL fragment/refresh | **SUPERSEDED** | Current C-015/3I server-side opaque session/cookie boundary must be routed explicitly in Decision Reconciliation. |
| PUB-3 read/write RBAC/scoped administration | **CURRENT / REFINED** | Covered by current Published App access authority. |
| PUB-4 chat embed handshake | **MECHANISM SUPERSEDED / PRODUCT INTENT PRESERVED** | Product Agent interaction may be embedded/contextual; exact historical postMessage state machine is not current authority and no universal widget exists. |
| PUB-5 private storage default | **CURRENT / REFINED** | Product/Architecture candidates should make private-by-default owner-scoped blob access explicit; storage prefix mechanics are realization. |

### CIC — Lifecycle

| Requirement | Current disposition | R11 action |
|---|---|---|
| CIC-1 branch/change integration model | **CURRENT / REFINED** | Architecture Baseline should preserve branch-per-Change + one canonical result commit per WorkUnit + Hub remote Git authority + no force/rebase. |
| CIC-2 PROD as forked Project | **SUPERSEDED WORDING / CURRENT INTENT** | Current meaning = isolated PROD environment/database of the **same Project**, created/admitted by Release lifecycle. |
| CIC-3 named promote steps; failures become work | **CURRENT / REFINED** | Architecture Baseline should preserve current Promotion state/evidence/recovery shape more explicitly. |
| CIC-4 duplicate Project asks about data, default no data | **CURRENT** | Missing from Product Contract. Add copy semantics: code/config/declarations yes; DB/credentials/Connection bindings no; data default no. |

### OBS — Product observability

| Requirement | Current disposition | R11 action |
|---|---|---|
| OBS-1 cost/tokens by execution/model/Project visible | **CURRENT / REFINED** | Product Contract says cost truth but omits explicit visibility. Add tokens + USD + duration per run/turn where available and aggregate by session/Project, preserving missing/inferred/reconciled states. |
| OBS-2 empty/loading/failure distinct | **CURRENT** | Covered and strengthened by 3K-02. |
| OBS-3 structured run/tool/duration/result log | **CURRENT / REFINED** | Architecture already carries causal observations, but add user-facing activity/cost projection law if useful. |

C-013's historical single `agent_event` table/type is **not** current durable-record authority after 3E/3K reconciliation. The current OBS inventory/owner records must be referenced instead; do not resurrect `agent_event` as a generic event owner/table.

### SEG — Security

| Requirement | Current disposition | R11 action |
|---|---|---|
| SEG-1 secret never client/repo/chat | **CURRENT / STRENGTHENED** | Covered. |
| SEG-2 server-side tenancy boundary | **CURRENT / STRENGTHENED** | Covered. |
| SEG-3 explicit privilege/no implicit admin | **CURRENT / promoted earlier than original F2** | 3I makes current authorization a first-production requirement. |
| SEG-4 “no formal threat model/security beyond basic F1” | **SUPERSEDED** | 3I explicitly owns current security/trust architecture; Decision Reconciliation should route this stale scope rule so it cannot suppress current 3I obligations. |

### QUA — Builder quality

| Requirement | Current disposition | R11 action |
|---|---|---|
| QUA-1 Golden benchmark | **CURRENT** | Budget Analyzer benchmark represented. |
| QUA-2 UI-call smoke / honest failures | **CURRENT / implementation-dependent** | Remains first-slice conformance; not pulled artificially into 3L. |
| QUA-3 item-by-item final review | **CURRENT / refined into Change assertions/verification/completeness** | Make known limitations + original accepted criteria traceability explicit. |
| QUA-4 Conexus Worker Eval | **CURRENT INTENT / CANDIDATE SET REFINED** | Architecture Baseline under-represents the eval capability. Preserve real-task runtime/model comparison; Pi×Claude historical matchup is not current mandatory pair. |

---

## 3. Projection findings

### F-R11-E-01 — trust-zone count drift

**Severity:** non-material projection defect  
**Against accepted authority:** yes, candidate wording only  
**Reopen:** no

`DECISION-RECONCILIATION.md` says “five trust zones”. 3I-05 defines six logical security classifications:

```text
Z1 Browser / Client
Z2 Trusted Hub Control
Z3 Guest Execution
Z4 DEDICATED External Application
Z5 External Provider / Enterprise
Z6 Trusted Data / Storage Infrastructure
```

**Correction:** `five` → `six`; preserve that zones are classifications, not deployment units.

### F-R11-E-02 — Brain source placement ambiguity

**Severity:** non-material but authority-sensitive projection defect  
**Reopen:** no

`ARCHITECTURE-BASELINE.md` lists `brain source where Workspace Brain repository boundary applies` under **Project Git**, which can be read as allowing canonical Workspace Brain source inside a Project repo.

Current C-011/C-014 law:

```text
Workspace/group Brain canonical source
→ its own group/Workspace Git tree/repo
→ never the first Project repo

Project repo
→ ProjectBrainBinding / overrides/local realization
```

**Correction:** split `Project Git` and `Workspace Brain Git` explicitly.

### F-R11-E-03 — Plan/checklist/purpose-memory underrepresented

**Severity:** completeness defect  
**Reopen:** no

Still-current HAR-7/HAR-8/C-013/C-017 meaning is not explicit enough in the Product Contract/Architecture Baseline.

Current law to restore:

```text
material Change may have approvable visual Plan + dependency/work-unit view
Hub/Postgres owns live plan-item state
worker/model proposes plan-item transitions
UI projects typed current progress
worker death → interrupted state honest
`tasks.md` = durable purpose/context memory, not operational status authority
structured tasks status block must not contradict Hub plan state
```

### F-R11-E-04 — cost/tokens visibility compressed too far

**Severity:** Product completeness defect  
**Reopen:** no

Product Contract preserves `missing cost != zero` but does not explicitly preserve OBS-1/C-013 user capability:

```text
per run/turn/model:
  tokens
  USD/cost state
  duration

rollup:
  session/run
  Project
  period
```

C-013 also separates reported/inferred/missing usage and calculated/provider/reconciled cost. UI must not convert missing to zero.

### F-R11-E-05 — Brain assisted Discovery underrepresented

**Severity:** Product completeness defect  
**Reopen:** no

CER-3/C-011 F1 current capability must be explicit:

```text
source metadata/dictionary + directed profiling
→ LLM/machine proposes semantic mapping
→ provenance badge / hypothesis
→ human interview resolves what cannot be inferred
→ only reviewed publication becomes Brain authority
```

Discovery uses Hub/Gateway source access; ERP credentials never go into E2B just to discover Brain semantics.

### F-R11-E-06 — `AnalyticQuery` omitted from current product/architecture projection

**Severity:** completeness defect  
**Reopen:** no

C-011 explicitly admitted a second read regime:

```text
static registered Query
OR
Brain-bound restricted AnalyticQuery
```

Current v0 law includes semantic IDs only, one curated dataset per query, restricted AST/SELECT-only proof and Project query role. First Budget Analyzer does not need to use AnalyticQuery merely to exercise it.

### F-R11-E-07 — Project duplication missing

**Severity:** Product completeness defect  
**Reopen:** no

C-014 current law:

```text
Duplicate Project
→ copy code + config schema + declarations
→ NEVER copy DB
→ NEVER copy credentials
→ NEVER copy Connection bindings
→ rebind explicitly in destination
→ ask about data, default = NO DATA
```

Product Contract must carry this F1 journey/scenario.

### F-R11-E-08 — current Git/Change result model underrepresented

**Severity:** architecture completeness defect  
**Reopen:** no

Current C-014/C-017 law survives the runtime move:

```text
logical branch per Change
worker may create temporary local commits
one canonical result commit per bounded WorkUnit
Hub owns remote push
no force/rebase as normal integration path
conflict → explicit business/owner resolution, not hidden rewrite
```

This does not mean one fresh cognitive worker/session per WorkUnit.

### F-R11-E-09 — Release/environment/config/migration mechanics too compressed

**Severity:** architecture completeness defect  
**Reopen:** no

The current Architecture Baseline preserves Release invariants but is too shallow for a source-of-truth entrypoint. Current C-014 must remain discoverable without archaeology, including:

```text
ReleaseManifest exact composition root
candidate/release state distinct from promotion/environment state
EnvironmentConformance against target reality
DEV / RunPreview / PROD distinctions
PROD = same Project isolated environment, not forked logical Project
config contract identity != secret material rotation
production migrations forward-only
backward-compatible vs maintenance-required migration branches
pre-migration backup + exact recovery semantics
CAS conflict / served-digest mismatch remain honest terminal/recovery states
```

Exact SQL/schema remains derived implementation.

### F-R11-E-10 — Platform Consultant capability too implicit

**Severity:** Product completeness defect  
**Reopen:** no

AGT-4 was deliberately closed by 3A-R7:

```text
Platform Consultant / contextual Conexus assistance
= Builder-owned capability presented in Control Plane

platform knowledge
!= Workspace Brain content
```

Product Contract should say this explicitly rather than relying on generic “Builder assistance”.

### F-R11-E-11 — storage privacy property underrepresented

**Severity:** Product/security completeness defect  
**Reopen:** no

PUB-5/C-016 current intent survives:

```text
private by default
owner/current authorization controls access
public exposure only explicit admitted Product policy
storage/provider key/path/prefix != semantic identity/authorization
```

Historical tenant-prefix mechanism is not architectural authority.

### F-R11-E-12 — Worker Eval capability underrepresented

**Severity:** engineering-system completeness defect  
**Reopen:** no

QUA-4 current intent survives:

> Conexus keeps a real-task evaluation suite to compare coding runtime/model realizations and gate a challenger when the primary runtime is materially questioned.

Historical `Pi × Claude Agent SDK` is not the permanent matchup. Current 3A-R5 baseline uses Mastra primary and Pi fallback/challenger only on structural qualification failure; model/runtime comparisons must use current candidates/authority.

### F-R11-E-13 — stale historical mechanisms need more explicit negative routing

**Severity:** archaeology-prevention completeness defect  
**Reopen:** no

Decision Reconciliation should explicitly route at least:

```text
C-003 REG-5 one response envelope
→ superseded by 3F owner-specific contracts / no UniversalEnvelope

C-003 AGT-3 webhook/EVENT as mandatory F1 + service identity
→ headless preserved; SCHEDULE admitted; EVENT deferred; Agent runtime is not auth principal

C-003 PUB-2 URL-fragment token
→ superseded by C-015/3I server-side opaque session/cookie authority

C-003 PUB-4 exact chat postMessage handshake
→ historical mechanism; current Project-designed Product Agent interaction surface

C-003 CIC-2 “PROD = forked Project”
→ current meaning = isolated environment of same Project

C-003 SEG-4 “no formal threat/security architecture F1”
→ superseded by accepted 3I security/trust architecture

C-013 generic `agent_event` durable table/owner
→ superseded/refined by current 3E/OBS durable inventory + owner-specific facts
```

### F-R11-E-14 — SaaS→private/on-prem reachability future seam missing

**Severity:** future-preservation completeness defect  
**Reopen:** no

C-003 INT-6 preserves a real Phase-2 need class: a SaaS Conexus installation may need governed reachability to private/on-prem enterprise systems.

Do **not** preserve “managed tunnel” as mandatory technology. Preserve the future requirement/seam:

```text
SaaS selected
+ target enterprise system is private/on-prem
→ decide authenticated private reachability/custody topology
```

No tunnel infrastructure F1.

---

## 4. No material Product↔Architecture owner mismatch found

The following cross-document compositions are coherent in Round 1:

```text
Workspace Product root               ↔ 3B/Workspace owner
Project Product unit                 ↔ Project owner / Project DB / Release
Builder Product journey              ↔ Builder owner + Mastra/E2B mechanism
Brain Product meaning                ↔ Brain owner + explicit Project binding
Connection Product meaning           ↔ Connections owner + Gateway last-mile
Capability/Product effect            ↔ owner contract + Gateway execution
Published App Product access         ↔ separate app authority context
Product Agent authoring              ↔ Project/Builder/Registry/Release
Product Agent runtime                ↔ PAR exact projection + Gateway effects
Managed sync                         ↔ MAR + Release-derived schedule + Gateway
Release/serving truth                ↔ Release/Promotion + F5/serving proof
Observation/Evidence                 ↔ OBS projections without owner takeover
```

No new module/domain/database is required to correct Round-1 findings.

---

## 5. Qualification-strength coherence

Round 1 found no candidate statement that requires architecture reopen, but the final tree must continue to distinguish:

```text
ARCHITECTURE CURRENT
!= QUALIFIED
```

Current correct strength:

```text
Builder Mastra            = qualified only for Package-A tested properties
E2B                       = qualified with mandatory physical-incarnation guard
Codex OAuth               = qualified for Package-A tested path
Builder OM                = evaluated / keep off
Product Agent Mastra      = architecture current / Package B not qualified
same-process role isolation= architecture current / Package B not qualified
model spend mechanism     = architecture obligation / Package C not qualified
managed execution         = architecture semantics / Package D not qualified
pg-boss                   = candidate only
Deciding Evidence path    = architecture shape / Package E not qualified
first-prod topology       = architecture current / activation proofs remain
```

---

## 6. Future/YAGNI coherence

No candidate creates dormant implementation for the future classes currently named.

Round-1 correction only adds missing **semantic seams/triggers**, never modules:

```text
SaaS↔private/on-prem reachability
advanced memory
EVENT triggers
DEDICATED physical deployment
cross-Workspace exchange
multi-repo
stronger HA/PITR
external enterprise IAM
public/embed
browser/workspace Agent capability
```

---

## 7. Round-1 verdict

```text
material Product/architecture finding  = 0
accepted-authority reopen               = 0
R11 candidate projection findings       = 14
all 14 correctable without new authority= YES
```

Outcome:

> **CURRENT ACCEPTED STRUCTURE CONFIRMED; R11 CURRENT-TREE CANDIDATES REQUIRE COMPLETENESS/WORDING CORRECTIONS BEFORE FRESH SELF-REVIEW.**

---

## 8. Exact next action

1. Correct `DECISION-RECONCILIATION.md` for F-R11-E-01 and F-R11-E-13.
2. Enrich `PRODUCT-CONTRACT.md` for F-R11-E-03/04/05/06/07/10/11/14.
3. Enrich/correct `ARCHITECTURE-BASELINE.md` for F-R11-E-02/03/04/05/06/08/09/11/12.
4. Re-run R11-E Round 2 as a cold contradiction/completeness pass.
5. Only if Round 2 is clean, proceed to R11-F Fresh self-review.

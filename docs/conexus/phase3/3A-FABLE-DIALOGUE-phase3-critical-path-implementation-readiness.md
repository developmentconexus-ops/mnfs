# 3A Fable Dialogue — Phase 3 Critical Path & Implementation Readiness

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3A — Architecture Reconciliation, continuous through C-018  
**Candidate:** cross-phase routing/depth checkpoint; no new authority ID is created by this file  
**Important:** this file does **not** alter approved 3B..3I-03 authority, does not ratify the DEDICATED candidate, does not update `LEDGER.md`, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

---

## 1. Why this checkpoint exists

Phase 3 has already resolved most of the expensive structural questions:

```text
3B — System Context & Boundaries                 CLOSED / APPROVED
3C — Domain / Module Architecture                CLOSED / APPROVED
3D — Dependency Architecture                    CLOSED / APPROVED
3E — Data Architecture                          CLOSED / APPROVED
3F — Contracts & API Architecture               CLOSED / APPROVED
3G — Behavioral / State Architecture            CLOSED / APPROVED
3H — Runtime & Agent Architecture               CLOSED / APPROVED
3I — Security / Authority Architecture           IN PROGRESS
```

The remaining planned phases are still required:

```text
3I — remaining Security / Authority
3J — Deployment / Operations Architecture
3K — Frontend / Product Architecture
3L — Technology Qualification
3M — Failure & Recovery Architecture
3N — Architecture Verification
3O — Vertical Architecture Proof Contract
C-018 — Architecture Synthesis / Phase 3 closure
```

The operator has clarified two simultaneous constraints:

1. **do not start product implementation early** merely because the company needs value soon;
2. **do not spend equivalent depth on reversible/speculative questions** when that does not reduce the risk of building the real Conexus.

The correct question for the remainder is therefore:

> **What must be decided or qualified before implementation so that coding actors do not silently decide what Conexus is, while everything safely reversible or consumer-gated is explicitly deferred rather than exhaustively designed now?**

This is not a deadline exception to the DevelopmentConexus Engineering Method. It is an application of its proportionality, stop and `DEFER SAFELY` rules.

---

## 2. Applicable method law

DevelopmentConexus Engineering Method v1.0.0 already requires:

```text
smallest sustainable solution
preserve essential complexity
remove accidental complexity
depth proportional to materiality / irreversibility / uncertainty / blast radius
prepare the seam, not the entire future capability
proof strategy before implementation
DEFER SAFELY when current work can proceed with trigger + later owner
stop when evidence is sufficient for the claim and no material contradiction remains
```

It also defines as material, among other things:

```text
invariant / correctness
ownership / architectural boundary
public contract / persistent data meaning
security / trust boundary
external or irreversible effect
concurrency / recovery / temporal correctness
hard-to-reverse technology/topology commitment
```

Therefore this checkpoint does not weaken correctness obligations. It changes only **where full depth is still justified before C-018**.

---

## 3. Non-negotiable execution boundary

Until the architecture closure and later realization-planning gate described below:

```text
NO product implementation
NO product schema/DDL implementation
NO product HTTP/API implementation
NO product frontend implementation
NO product deployment rollout
NO coding actor filling architectural gaps by convenience
```

Technology qualification probes later admitted by 3L are a separate bounded class. They may execute only after the relevant architectural decisions are frozen and only to falsify load-bearing technology assumptions; they are not permission to begin product implementation opportunistically.

Conversation/review remains planning/architecture/evidence. Future coding actors — human or agentic — execute only against accepted architecture + accepted realization plan. Runtime/tool choice of the coding actor is not architecture authority.

---

## 4. C-018 is not immediate permission to code

The earlier shorthand:

```text
C-018
→ implementation
```

is too compressed for the operator's intended governance.

Candidate corrected progression:

```text
Phase 3 decisions / qualification / verification
        ↓
3O Vertical Architecture Proof Contract
        ↓
C-018 Architecture Synthesis / Phase 3 closure
        ↓
POST-C-018 IMPLEMENTATION REALIZATION PLANNING GATE
        ↓
accepted executable implementation plan(s)
        ↓
product implementation by coding actors
        ↓
implementation evidence / review / Findings
```

The post-C-018 gate does **not** reopen architecture by default. It translates accepted architecture into exact implementation form.

It must define, where applicable:

```text
repository/package/module layout
exact TypeScript/public internal interfaces
exact HTTP routes / wire contracts
exact DB columns/types/constraints/indexes/DDL
migration ordering
exact auth/session/request mechanics
exact config/env contracts
exact selected library/version bindings from 3L
exact frontend routes/components/data flows
exact runtime wiring
exact observability wiring
implementation dependency/order
negative/positive test matrix
vertical slice sequence
acceptance/evidence requirements
```

These details are not automatically Phase-3 architectural decisions. If realization planning discovers a material owner/boundary/durable-meaning/trust contradiction, that is a Finding and returns to the applicable Decision Loop before code proceeds.

No name/phase number for this later gate is frozen here; avoid inventing process taxonomy before review.

---

## 5. Three allowed classification outcomes for remaining work

Every remaining question in 3I–3O should terminate as one of:

### A. MUST DECIDE BEFORE IMPLEMENTATION

Use when leaving the question open would force the implementation actor to choose a material property, or when an incorrect choice creates expensive structural retrofit.

Typical triggers:

```text
owner / authority / module boundary
persistent data meaning / durable lifecycle
cross-module dependency direction
public/external contract meaning
security/trust boundary
first-production topology commitment
recovery semantics that may require new durable state
what the F1 product actually includes/excludes
technology assumption whose failure invalidates approved architecture
end-to-end proof/acceptance property
```

A `MUST DECIDE` item may include a required 3L qualification proof. If the architecture cannot honestly close without that proof, the item remains a C-018 blocker until qualified.

### B. DEFER SAFELY

Use only when all are true:

```text
current owner/boundary/invariant remains unambiguous
no current named consumer requires the capability
later addition can use an existing seam without duplicating authority
no current durable data/contract must be shaped around the future capability
first useful F1 / first production launch does not depend on it
revisit trigger is explicit
later owner/stage is explicit where known
```

Examples include exact calibration values, optional framework features, later scale machinery and operational refinements whose absence does not change current semantics.

`DEFER SAFELY` is durable routing, not forgetting.

### C. REJECT F1

Use when the item is speculative capability or generic machinery with no current consumer/failure class and keeping it conceptually open would tempt implementation to build it.

Examples:

```text
service mesh merely for optionality
fleet machinery before install base
multi-region before availability requirement
universal workflow/identity/quota/event engine
parallelism machinery before parallel consumer
optional model/memory features merely because framework supports them
```

Re-entry is by Decision Loop under real evidence.

---

## 6. Decision test applied to every remaining question

Ask in order:

1. **Would a coding actor otherwise have to choose owner, authority, durable meaning, trust boundary or public contract?**
   - yes → MUST DECIDE.

2. **Would the wrong choice force migration across modules/schema/history/external clients or create a security retrofit?**
   - yes → MUST DECIDE.

3. **Does the first F1 product or first production deployment depend on the answer?**
   - yes → MUST DECIDE at the appropriate abstraction depth.

4. **Does approved architecture rely on a technology behavior that may not hold in the pinned implementation?**
   - yes → MUST DECIDE + 3L proof before relying on it.

5. **Can the question be answered later behind an existing seam without changing current authority/durable contracts?**
   - yes and no current consumer → DEFER SAFELY.

6. **Is the proposed capability/machinery only future optionality?**
   - yes → REJECT F1 unless an accepted requirement already makes it current.

Depth stops when the material property is unambiguous and proof/reopen conditions are adequate. Exact implementation spelling then belongs to realization planning/implementation.

---

## 7. Candidate classification — remaining 3I

### 7.1 DEDICATED Trusted Exchange

**MUST DECIDE BEFORE IMPLEMENTATION.**

Reason:

```text
external trust boundary
non-human principal authentication
credential/revocation meaning
exact Release binding
server-to-platform authority
```

This family is already substantially converged by the current non-authoritative dialogue + independent Fable review. Finish it now; do not expand into fleet/federation/attestation machinery.

Expected bounded F1 result after consolidation:

```text
Project-derived DedicatedApplicationPrincipal
one current Project-scoped asymmetric credential
private_key_jwt client authentication family
short-lived signed bearer access token
exact ReleaseRef validated during authenticated token request and sealed in token
current credential-generation recheck
SERVICE_SCOPED only
no refresh token
no DPoP F1
no mTLS PKI F1
no fleet/per-install/per-Release credential F1
no binary attestation F1
```

Exact libraries/algorithms/TTL values → 3L/realization, unless qualification proves a material contradiction.

### 7.2 Trust Zones & Crossings / Hub egress / telemetry

**MUST DECIDE BEFORE IMPLEMENTATION, but as one bounded security-closure package unless evidence forces split.**

Need to freeze only properties that determine who can talk to whom and what authority may cross:

```text
browser ↔ Hub
Hub ↔ E2B
Hub ↔ model provider
Hub/Gateway ↔ enterprise/external systems
MANAGED runtime ↔ Hub/platform services
DEDICATED runtime ↔ Hub/platform services
telemetry producer ↔ telemetry ingest/observation
control-plane egress vs guest/app egress
secret-bearing vs non-secret crossings
```

Must answer:

```text
which crossings exist F1
which side authenticates whom
what credential/capability class crosses
whether direct browser/guest/provider paths are forbidden
which crossings are fail-closed
what telemetry can never become authority
```

Defer safely:

```text
exact firewall syntax
exact proxy product
exact OTel exporter/Collector topology
exact baggage attribute spelling
advanced DEDICATED network policy beyond first deployment
Product Agent browser/workspace/code execution until a named consumer enables it
```

### 7.3 `hub_control` least-privilege realization

**MUST DECIDE BEFORE IMPLEMENTATION at the role/isolation-property level.**

Because one PostgreSQL database physically hosts 13 owner schemas, implementation must not be free to give the application one omnipotent login that destroys module ownership mechanically.

Before C-018 define at least:

```text
which runtime/process role may access which owner schemas
no direct cross-module table/internal access
migration/owner/runtime privilege separation
no superuser/BYPASSRLS convenience in normal runtime
Builder/PAR substrate stores remain separate from hub_control authority
credential/backup roles do not become ordinary Hub runtime authority
```

Exact PostgreSQL `GRANT`, role names, connection-pool spelling and migration SQL belong to realization planning/implementation, with 3L only where a PostgreSQL behavior itself is load-bearing.

### 7.4 3I closure

After the three families above, run one bounded 3I closure review:

```text
missing trust boundary?
duplicate authorization authority?
secret path accidentally widened?
current revocation path missing?
new durable security record secretly required?
```

If none, close 3I. Do not manufacture further security topics from generic threat catalogs.

---

## 8. Candidate classification — 3J Deployment / Operations

3J remains required. It should answer **the first real production topology**, not every future topology.

### MUST DECIDE BEFORE IMPLEMENTATION

```text
first Hub deployment shape
single-host vs required process split baseline/trigger
where Hub modular monolith runs
where PostgreSQL/hub_control/project DBs run under existing C-006/C-014 laws
where Builder/PAR Mastra substrate stores run
E2B control connectivity
MANAGED application serving path
DEDICATED external boundary sufficient for F1 even if first launch is MANAGED
TLS/ingress boundary
platform operational secret injection/custody
startup/shutdown/restart expectations
upgrade/deploy sequence at a material level
backup ownership + required backup set
restore proof responsibility
whole-Hub emergency stop physical procedure required by 3I-01
host loss / restart honesty
what must be available for first internal production use
```

Target should prefer the smallest safe first topology, plausibly a single trusted Hub host plus the already-required external services, unless evidence requires more isolation.

### DEFER SAFELY / REJECT F1 unless triggered

```text
Kubernetes
service mesh
multi-region
active-active
automatic failover
horizontal Hub scaling
fleet scheduler
blue/green framework
canary framework
multi-cloud abstraction
external Vault/KMS/HSM absent security/compliance trigger
advanced DEDICATED deployment fleet
PITR/HA machinery beyond accepted first-launch RPO/RTO needs
```

3J must leave explicit reopen triggers for measured availability, install-base and compliance needs.

---

## 9. Candidate classification — 3K Frontend / Product Architecture

3K is **not optional**. A platform engine without an explicit F1 product surface would force implementation actors to invent the product.

### MUST DECIDE BEFORE IMPLEMENTATION

3K must identify the first useful F1 product shape and the minimum operator/user surfaces necessary to operate the already-approved architecture.

At minimum classify/navigate the product experience for:

```text
Workspace / Project selection and creation
Project Inception / Baseline approval
Change creation / intent / correctness review
Builder progress / Work Units / ActorRuns at user-relevant abstraction
Finding / evidence / verifier feedback
human approvals
Connections administration/qualification
Brain binding/use surface where needed
Preview/review
Release composition / Promotion / rollback operator flow
Production Agent definition/use
MANAGED application access/serving
runtime/operational timeline sufficient for trust and diagnosis
permissions/access-management surfaces required by current role model
```

3K must also select the **first useful product vertical** that 3O will later use as the end-to-end proof target. The exact business use case must come from canonical product objectives/operator approval; this checkpoint does not invent it.

### DEFER SAFELY

```text
pixel-perfect visual design
complete design system
all future dashboards
all empty/error states before a surface is in first vertical
advanced analytics UX
fleet/customer administration not in F1
mobile-native UI absent consumer
full UX for deferred capabilities
```

Exact component implementation and styling live in post-C-018 realization planning, while navigation, user-visible authority and required workflows belong to 3K.

---

## 10. Candidate classification — 3L Technology Qualification

3L is where architecture assumptions become physically credible. It must remain **targeted qualification**, not early product implementation.

### 10.1 MUST QUALIFY before C-018 when failure could invalidate the architecture

At minimum sweep the already-routed load-bearing probes:

```text
CX-SBX-E2B-01
→ E2B/Workspace sandbox properties needed by C-008 / Builder

CX-BUILDER-MASTRA-01
→ AgentController/Workspace/session/tool/runtime behavior needed by 3H-01

CX-AGENT-MASTRA-01
→ direct Product Agent, suspend/resume, schedules/memory isolation behavior needed by 3H-02

CX-RUNTIME-ISOLATION-01
→ Builder/PAR stores/PubSub/global mutable state isolation needed by 3H-03

3I-03 model-spend qualification subset
→ every physical model attempt can be intercepted/bounded or hidden retries disabled
→ missing usage does not silently become settlement authority

Verification Observability/E2B evidence subset
→ required evidence can actually be captured/correlated for material verification
```

The exact probe set may be reduced if a claim is already sufficiently evidenced by current primary source + selected pinned version and does not require execution to falsify, but **no load-bearing unknown may be converted into truth for convenience**.

### 10.2 Qualification can be consumer-gated

Do not require every optional technology path before first implementation.

Examples that may be `DEFER SAFELY` until their consumer exists:

```text
DEDICATED OAuth library/DPoP/mTLS beyond the selected F1 mechanism when DEDICATED is not in first vertical
Semantic Recall / Observational Memory / Memory Extractors
Durable Agent
multi-agent/network
Mastra Platform deployment products
optional external OTel stack
browser/workspace Product Agent capability
```

A selected mechanism that is part of first deployment or first vertical cannot use this escape hatch.

### 10.3 No product-code creep

3L probes should be:

```text
bounded
throwaway or retained as explicit conformance harness where useful
property-focused
separate from product feature implementation
accepted/rejected by named criteria
```

A probe failure produces a Finding/reopen. It does not authorize improvising the product architecture inside the probe.

---

## 11. Candidate classification — 3M Failure & Recovery

3M should close failure classes that may change owner facts, durable lifecycle or safe restart semantics. It should **not** pre-write every operational runbook.

### MUST DECIDE BEFORE IMPLEMENTATION

Evaluate at least:

```text
Builder ActorRun / CodingSession / E2B process loss
Production Agent admitted-but-undispatched / active-process loss / resume snapshot loss
outstanding model-spend liability after crash
Gateway OUTCOME_UNKNOWN / reconciliation authority boundary
Promotion partial failure / pointer already swapped / maintenance-block survival
output/blob custody partial failure / orphan-vs-dangling authority
Hub restart while durable work exists
PostgreSQL restore/recovery relationship to owner histories
whole-Hub emergency-stop recovery handoff
```

For each, ask only:

> Do existing owner facts and already-approved states permit safe recovery, or is a new durable state/owner/boundary required?

If existing facts suffice, freeze the recovery property and route exact procedures/runbooks/retry timings to 3J/realization/operations.

### DEFER SAFELY

```text
retention/GC optimization
age-window orphan cleanup
advanced automated failover
complex repair UI
rare repeated-quiescence policy absent real recurrence
commercial SLA-specific RTO/RPO beyond first launch
```

Any new durable recovery record/entity requires a concrete failure schedule and applicable 3E/owner Decision Loop.

---

## 12. 3N Architecture Verification is mandatory and compact

3N is the point where the full design is attacked globally rather than accumulating more local design.

### MUST DO before C-018

One global coherence review should attempt to falsify at least:

```text
missing or duplicate authority
circular module dependency
cross-schema/internal-access contradiction
runtime substrate becoming domain authority
two lifecycles owning the same terminal truth
security control that no path actually enforces
Release/composition/runtime mismatch
MANAGED vs DEDICATED contradiction
Builder vs Production Agent semantic collision
C-013 admission pattern duplicated as UniversalAttempt
first topology unable to realize trust/data boundaries
first product surface requiring an authority that architecture never defined
required recovery path needing hidden durable state
3L finding left unresolved
```

Use a fresh independent challenger proportional to the cross-system blast radius.

3N should not create new features. Findings reopen only the decisions actually implicated.

---

## 13. 3O is the architecture-to-realization bridge

3O must define the **first vertical architecture proof contract**, not implement it.

### MUST DEFINE before C-018

The contract should traverse enough of both factory and application platform to prove the product is Conexus rather than a manually wired app.

Abstract shape:

```text
approved Project/Baseline authority
→ Change + correctness contract
→ Builder dispatch
→ ActorRun / real coding runtime boundary
→ isolated mutable workspace/sandbox
→ result/evidence/verifier path
→ Release composition
→ Promotion / serving
→ real MANAGED application or other first-approved runtime profile
→ authenticated user/principal
→ Production Agent / Platform Service path where in first vertical
→ real Connection/Gateway/business data path where in first vertical
→ observable evidence proving exact identities and authority transitions
```

3K chooses the first useful business/product vertical; 3O turns it into explicit architecture proof obligations.

3O must state:

```text
exact architectural claims the vertical must prove
what real integrations are required vs what may be isolated fixture evidence
which paths must be negative-tested
which failures must be demonstrated to fire
what constitutes NOT_PROVEN/INCONCLUSIVE
what implementation work is intentionally outside the first vertical
```

3O is not the detailed implementation task list. That belongs to the post-C-018 realization planning gate.

---

## 14. Candidate C-018 closure rule

C-018 may close Phase 3 only if all are true:

```text
remaining MUST DECIDE items are ratified
required load-bearing 3L qualification has passed or is honestly represented as an explicit blocking Finding
3M found no unresolved durable/recovery contradiction
3N global coherence has no unresolved Material Finding
3O vertical proof contract is accepted
all DEFER SAFELY items have owner/trigger and do not leak hidden decisions into implementation
F1 BUILD / DEFER / REJECT boundary is explicit enough for realization planning
```

C-018 should synthesize, not duplicate, all detailed decisions.

C-018 does **not** by itself authorize product code. It authorizes transition to exact implementation realization planning unless the operator explicitly chooses otherwise in a later decision.

---

## 15. Post-C-018 Implementation Realization Planning Gate

Purpose:

> Convert accepted architecture into executable coding plans without allowing implementation tools to reinterpret the product.

Minimum outputs as applicable:

```text
1. repository/package/module map
2. exact persistence design per approved record class
3. exact migrations and constraints
4. exact internal/public APIs and DTOs
5. exact HTTP/wire layout
6. exact authentication/session/credential realization
7. exact selected technology/library versions
8. exact deployment/config realization
9. exact frontend route/component/data architecture
10. exact test/conformance matrix
11. implementation ordering and dependency graph
12. bounded vertical slices / milestones
13. acceptance evidence required after each slice
14. architectural Finding/escalation rule for coding actors
```

Coding actor rule:

```text
implementation detail inside accepted plan
→ actor may decide locally when reversible and architecture-preserving

owner/boundary/public contract/durable meaning/trust/topology contradiction
→ STOP that expansion
→ Finding
→ return to architecture/decision
```

This preserves the intended collaboration:

```text
architecture + planning + review
→ authoritative design/control function

Claude Code / Codex / human coding actor
→ execution function

code/tests/runtime evidence
→ proof or Finding
```

The names of coding tools are operational choices, not permanent Conexus architecture.

---

## 16. Candidate accelerated sequence

If review confirms this checkpoint:

```text
NOW
→ ratify Phase-3 Critical Path / Implementation Readiness rule under 3A reconciliation

THEN
→ finish DEDICATED Trusted Exchange already under review
→ one bounded remaining 3I Security Closure package
→ 3I closure

→ 3J First Production Topology / Operations package
→ 3K First Useful Product / Product Surface package

→ 3L only load-bearing technology qualification
→ resolve any Findings

→ 3M structural failure/recovery closure
→ 3N global coherence review
→ 3O vertical architecture proof contract
→ C-018 Architecture Synthesis

THEN, still before product code
→ post-C-018 Implementation Realization Planning Gate
→ accepted executable implementation plans

ONLY THEN
→ product implementation
```

This sequence does not collapse phases. It removes unnecessary microdecision depth inside them.

---

## 17. Explicit anti-acceleration mistakes

The acceleration rule must never be interpreted as:

```text
skip 3J because deployment is implementation
skip 3K because UI can be invented while coding
skip 3L and trust documentation only
skip 3M because recovery can be fixed later
skip 3N because local reviews already passed
skip 3O and let first implementation define the vertical
let C-018 silently authorize coding without a realization plan
use deadline to convert UNKNOWN into assumption
push exact owner/schema/API decisions onto Claude Code/Codex
```

Nor should it become a new process framework with dozens of readiness artifacts. The smallest durable form is a routing/depth law + existing phase authorities + one later executable realization plan family.

---

## 18. Expected reduction in accidental work

This checkpoint intentionally cuts depth on examples already visible in the live ledger:

```text
exact OTel attribute names
optional Collector/Sentry/Spotlight topology
orphan-GC policies
Durable Agent/multi-agent features
Semantic Recall/OM without consumer
exact SQL lock spelling
exact HTTP layout before realization
fleet/retirement/multi-install
DPoP/mTLS without current trigger
pools/failover/shared resources
break-glass machinery without incident
advanced purge/retention
Mastra Platform optional deployment product
```

But preserves depth on:

```text
trust crossings
least-privilege boundaries
first deployment topology
first product workflow/surface
runtime/buildability probes
structural crash/recovery semantics
global coherence
vertical proof contract
```

---

## 19. Proof strategy for this checkpoint itself

Before ratification, attempt to falsify:

1. **Missing-phase test:** does any 3J..3O phase become optional? It must not.
2. **Architecture-leak test:** can a coding actor still be forced to choose a material owner/boundary/durable/public-contract/security property? If yes, critical-path classification is too shallow.
3. **Overdesign test:** is a deferred item being pulled forward only because it may someday exist? If yes, remove it.
4. **Retrofit test:** can a `DEFER SAFELY` item later require rewriting current authority/history/contracts/schema rather than using an existing seam? If yes, it is not safely deferred.
5. **3L honesty test:** does C-018 depend on an unqualified runtime/provider behavior? If yes, add/retain a probe blocker.
6. **Product test:** could implementation build the backend correctly but invent a materially different Conexus user/product experience because 3K is vague? If yes, deepen 3K.
7. **Recovery test:** could restart/partial failure force a new durable entity after implementation starts? If foreseeable now, deepen 3M.
8. **C-018 gate test:** could product code begin without exact schema/API/package/migration/test planning? Under this candidate, no — realization planning remains a separate gate.
9. **Process-bloat test:** did this checkpoint create a parallel methodology or mandatory artifact taxonomy? It must not.
10. **Deadline-truth test:** is any Unknown called true merely to accelerate? It must not.

---

## 20. Candidate disposition

```text
prior approved architecture reopen             = NONE
DevelopmentConexus Method change              = NONE
3J..3O deletion                               = NONE
product implementation before C-018           = FORBIDDEN
product implementation immediately after C-018= NOT AUTOMATIC
post-C-018 realization planning                = REQUIRED candidate gate
phase-depth policy                             = proportional critical path
classification outcomes                       = MUST DECIDE | DEFER SAFELY | REJECT F1
3L load-bearing probes                         = retained
first product vertical selection               = 3K
vertical architecture proof contract           = 3O
implementation tool authority                  = NONE
new Hub module                                 = 0
new durable domain record                      = 0
new product capability                         = 0
```

If independent review converges, this candidate should be ratified as a **3A reconciliation/routing authority** before continuing the remaining Phase-3 families. Exact authority ID should be allocated only after review confirms there is no existing numbering conflict.

---

## 21. Fable independent-review instructions

Fable: reconstruct repository authority independently through `AGENTS.md` and the canonical read order. Do not trust this synthesis.

Attack especially:

1. whether this checkpoint is a legitimate application of the DevelopmentConexus Method or an unauthorized process-framework amendment;
2. whether 3A continuous Architecture Reconciliation is the correct owner vs LEDGER-only routing vs a new C-decision;
3. whether any `MUST DECIDE` family above is actually safe to defer;
4. whether any proposed `DEFER SAFELY` item would create expensive schema/authority/contract retrofit later;
5. whether 3J scope is sufficient to launch the first real internal Conexus without smuggling HA/fleet complexity;
6. whether 3K must define more/less product architecture before implementation actors can work safely;
7. whether required 3L probes must execute before C-018, and which exact current routed probes are truly architecture blockers vs consumer-gated;
8. whether 3M can safely focus on “does existing durable state suffice?” instead of pre-writing full runbooks;
9. whether 3N + 3O as compact closure/proof stages are sufficient;
10. whether C-018 can honestly close architecture before exact schema/API/file structure, provided a post-C-018 realization-planning gate exists;
11. whether that realization-planning gate is necessary or merely ceremony, and whether it risks becoming a second architecture authority;
12. whether coding actors would still have any material architectural choices after the proposed gates;
13. whether the candidate accidentally changes existing authority saying implementation is not authorized during Phase 3;
14. whether the currently converged DEDICATED exchange should still finish before adopting this critical-path checkpoint or can follow it;
15. classify the open items in current `LEDGER.md` adversarially against `MUST DECIDE | DEFER SAFELY | REJECT F1`, especially anything the candidate misclassified or omitted;
16. identify the smallest corrected rule that preserves rigor while materially shortening the path to a buildable first Conexus.

No external research is required unless a load-bearing claim unexpectedly depends on current third-party behavior; this is primarily a repository-authority/method coherence review.

Append below this section, commit/push. **Do not alter LEDGER, approved authority, product code or the DEDICATED dialogue. Do not create a new authority ID.**

# 3A-R11-E — Whole-Product Coherence Round 2

**Status:** COMPLETE / CLEAN FOR FRESH-ACTOR REVIEW  
**Authority:** R11 review Evidence; not final Product authority  
**Reviewed HEAD parent:** `3e547023eaaffd8ac65e1ca07d9cc2c2f55f662e`  
**Reviewed candidates:**

- `docs/conexus/current/DECISION-RECONCILIATION.md`
- `docs/conexus/current/PRODUCT-CONTRACT.md`
- `docs/conexus/current/ARCHITECTURE-BASELINE.md`

Round 2 was intentionally performed after Round-1 corrections rather than treating the candidates' own completeness declarations as proof.

---

## 1. Review question

> **After Round-1 corrections, does the current candidate tree preserve the accepted whole Product and current architecture without stale-mechanism inheritance, duplicate/missing authority, future overbuilding or qualification overstatement?**

Verdict:

```text
Round-1 projection findings verified corrected = 14 / 14
new material Product finding                   = 0
new material architecture finding              = 0
accepted-authority contradiction                = 0
owner duplication/missing owner                = 0
material Decision Loop reopen                  = 0
qualification overstatement                    = 0
future dormant machinery introduced            = 0
R11-F Fresh Actor review                       = ADMITTED
```

---

## 2. Round-1 finding closure matrix

| Finding | Round-2 disposition | Evidence in current candidates |
|---|---|---|
| F-R11-E-01 trust-zone count | **CLOSED** | Decision Registry + Architecture define **six** logical classifications Z1–Z6, not five. |
| F-R11-E-02 Brain source placement | **CLOSED** | Architecture explicitly separates `Project Git` from `Workspace Brain Git`; canonical Brain source is independent from first Project repo. |
| F-R11-E-03 Plan/checklist/tasks | **CLOSED** | Product has Plan + live checklist + `tasks.md`; Architecture owns Plan/current plan state in Builder/Hub and keeps `tasks.md` purpose-only. |
| F-R11-E-04 cost/tokens visibility | **CLOSED** | Product exposes per-run/model tokens/cost/duration and rollups with missing/inferred/reconciled honesty; Architecture defines usage/cost state classes and projections. |
| F-R11-E-05 Brain assisted Discovery | **CLOSED** | Product and Architecture include source metadata/profiling → machine proposal → human interview → reviewed publication. |
| F-R11-E-06 AnalyticQuery | **CLOSED** | Product/Architecture preserve static Query vs restricted Brain-bound AnalyticQuery regimes; runtime LLM cannot invent arbitrary SQL/join topology. |
| F-R11-E-07 Project duplication | **CLOSED** | Product + Architecture preserve copy source/config/declarations, no DB/credentials/Connection bindings, data default = no copy. |
| F-R11-E-08 Git/Change result model | **CLOSED** | Architecture states logical branch per Change, temporary local commits allowed, one canonical result commit per bounded WorkUnit, Hub remote push, no hidden force/rebase. |
| F-R11-E-09 Release/environment/config/migration detail | **CLOSED** | Architecture restores ReleaseManifest composition root, separate candidate/promotion planes, EnvironmentConformance, DEV/Preview/PROD, config-vs-secret axes, migration branches, CAS and served verification. |
| F-R11-E-10 Platform Consultant | **CLOSED** | Product explicitly models contextual Conexus/Platform Consultant as Builder-owned Control Plane capability; platform knowledge != Workspace Brain. |
| F-R11-E-11 private storage | **CLOSED** | Product/Architecture say private by default; owner/current authorization governs byte access; provider key/path does not grant authority. |
| F-R11-E-12 Worker Eval | **CLOSED** | Product/Architecture preserve Golden benchmark + Conexus Worker Eval, while rejecting historical Pi×Claude pair as permanent selection. |
| F-R11-E-13 stale historical mechanisms | **CLOSED** | Decision Registry explicitly routes UniversalEnvelope, mutable artifact registration, EVENT/webhook mandate, URL-fragment auth, postMessage handshake, PROD fork wording, SEG-4 and generic `agent_event`. |
| F-R11-E-14 SaaS↔on-prem reachability | **CLOSED** | Product/Registry/Architecture preserve future authenticated private reachability seam without selecting/deploying tunnel infrastructure F1. |

---

## 3. Cold owner-coherence check

### Workspace / Project

```text
Workspace = sovereign isolation / shared resource root
Project   = independent Product/software lifecycle unit
```

No current candidate gives Workspace direct ownership of Project-internal Change/Release/business data or gives Project implicit ownership/use of Workspace Brain/Connections.

### Builder

```text
Builder owner facts
→ Change / Plan / WorkUnit / ActorRun / Finding / CodingSession relationship

Mastra/E2B
→ execution mechanics only
```

No runtime completion, thread or sandbox state is presented as Change authority.

### Brain

```text
Workspace Brain Git
→ Brain semantic authority/publication
→ Registry immutable revision
→ explicit ProjectBrainBinding
→ Release exact pin
```

Project Git carries binding/refinement/local realization, not canonical Workspace Brain source.

### Connections / Gateway

```text
Connections = logical Connection/qualification/credential handle
Project = binding intent
CredentialBackend = secret-byte mechanism
Gateway = execution/effect/replay/credential last-mile
```

No duplicate generic Secret/Integration execution owner appears.

### Product Agent

```text
Project/Registry/Release = authored immutable Agent definition/composition
PAR = Conversation/AgentRun/Approval/Trigger runtime owner facts
Mastra = runtime mechanism
Gateway = external effect authority
I&A = current authorization
```

No Stored Agent/latest/editor/runtime state becomes Product authority.

### Managed execution

```text
MAR = admitted application/job runtime occurrence
Release = exact schedule/job composition authority
Project/Gateway = business/data/effect authorities
queue/scheduler = reconstructible mechanism
```

No Automation/Workflow/Scheduler domain was created.

### Release / serving

```text
Artifact AVAILABLE
!= Release AVAILABLE
!= Promotion/current pointer
!= SERVED_VERIFIED
```

No frontend/runtime observation is allowed to manufacture serving truth.

---

## 4. Product↔Architecture journey coherence

The Product journeys now have structural homes without adding duplicate modules:

```text
A Workspace access
→ I&A + Workspace

B Inception/Baseline
→ Project + Builder checkpoint

C Plan/build/verify/publish
→ Builder + Git + Registry + Release

D Brain Discovery
→ Brain + Gateway/source reads + human publication

E Brain bind/feedback
→ Brain + Project binding + Release

F Connection/Integration
→ Connections + Project binding + Gateway

G Query/AnalyticQuery
→ Artifact/Brain + Gateway + Project read authority

H Published Application
→ Release + MAR + Published App authorization

I/J Product Agent authoring/use
→ Builder/Project/Registry/Release + PAR

K exact effect approval
→ PAR owner exact subject + I&A currentness + Gateway

L managed sync/job
→ Release + MAR + Gateway/Project

M Project duplication
→ Project/source-copy workflow with explicit new binding/data authority

N Budget Analyzer
→ Brain + Connection + managed sync + Project read model + Queries + Release

O maintenance/reusable learning
→ Change/Builder + KnowledgeProposal/Brain
```

No journey requires a new semantic owner.

---

## 5. Technology-strength cold check

The three candidates consistently distinguish architecture from deciding Evidence.

```text
Node/TS Hub                         ARCHITECTURE CURRENT
PostgreSQL 17                       ARCHITECTURE CURRENT
Mastra Builder tested A-properties  QUALIFIED only for tested properties
E2B                                 QUALIFIED WITH REQUIRED GUARD
Codex OAuth                         QUALIFIED only for tested A path
Builder OM                          EVALUATED / KEEP OFF
Product Agent Mastra                ARCHITECTURE CURRENT / B NOT QUALIFIED
same-process Builder/PAR            ARCHITECTURE CURRENT / B NOT QUALIFIED
model spend mechanism               ARCHITECTURE OBLIGATION / C NOT QUALIFIED
managed execution                   ARCHITECTURE SEMANTICS / D NOT QUALIFIED
pg-boss 12.26.3                     CANDIDATE ONLY
Deciding Evidence surfaces          ARCHITECTURE SHAPE / E NOT QUALIFIED
first-production topology           ARCHITECTURE CURRENT / activation proofs pending
```

No candidate claims Package B–E success.

---

## 6. Historical resurrection check

The current tree explicitly prevents the highest-risk stale inheritances:

```text
Pi primary Builder                                      NO
fresh cognitive reset every WU                          NO
guest LLM provider credential                           NO
Vercel AI SDK Product Agent authority                   NO
Mastra Stored/Editor/latest Agent authority              NO
pg-boss as schedule authority                           NO
UniversalEnvelope                                       NO
mutable artifact registration API as authoring authority NO
EVENT/webhook mandatory F1                              NO
Product Agent runtime as authorization principal        NO
URL-fragment Published App auth                         NO
PROD as forked logical Project                          NO
“security later because internal F1”                    NO
generic agent_event owner/table                         NO
memory/RAG as Brain authority                           NO
public Internet first-installation ingress               NO
```

Historical documents remain available for rationale/provenance but these mechanisms do not control current realization.

---

## 7. Future/YAGNI check

Current candidates preserve real future seams while rejecting dormant implementation.

Examples:

```text
SaaS / private-on-prem reachability
multi-repo
cross-Workspace exchange
DEDICATED physical deployment
HA/PITR
advanced Agent memory
EVENT triggers
Durable Agent reconnect
Agent-as-tool/subagents
MCP/A2A external clients
Agent browser/source/workspace access
Connection failover
Vault/KMS/HSM
SSO/SCIM/passkeys
public/embed
richer app roles/data scope
Brain RAG/index
```

None has acquired a new F1 module/table/service/engine merely because it is visible as future.

---

## 8. Residual Unknown/Deferred remain honest

Round 2 does not close:

```text
Package B Product Agent + Cross-Runtime deciding Evidence
Package C Model Economics / Enforcement deciding Evidence
Package D Managed Execution deciding Evidence
Package E Deciding Evidence qualification
3M Failure & Recovery sufficiency
3N final independent architecture verification
3O vertical proof contract
C-018
F3B-R1 canonical Product repo/cutover
post-C-018 derived Realization Planning
implementation-dependent first-slice probes
```

No missing result was converted to PASS.

---

## 9. Round-2 verdict

> **CURRENT ACCEPTED STRUCTURE CONFIRMED. The R11 Product Contract, Architecture Baseline and Decision Reconciliation candidates are coherent enough to be tested as a Fresh Actor discovery tree.**

```text
material finding              = 0
material reopen               = 0
remaining Round-1 projection finding = 0
R11-F Fresh Actor review      = NEXT
Fable review                  = NOT YET RUN
final operator ratification   = NOT YET
Package B                     = PAUSED
```

---

## 10. Exact next action

1. Create `docs/conexus/current/README.md` candidate as the short current entrypoint/router.
2. Perform R11-F Fresh Actor review using the four-file current tree instead of conversation memory/history.
3. If the Fresh Actor test is clean, prepare and run the independent Fable whole-product review required by R11-G.

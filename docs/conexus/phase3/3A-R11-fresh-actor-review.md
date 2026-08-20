# 3A-R11-F — Fresh Actor Review

**Status:** COMPLETE / PASS FOR INDEPENDENT FABLE REVIEW  
**Authority:** R11 self-review Evidence; explicitly not independent review  
**Reviewed candidate tree:** `docs/conexus/current/`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  

---

## 1. Review protocol

The review deliberately treats the R11 current tree as if the reader had no conversation memory and did not reconstruct the Product chronologically from C-000..C-017 / 3A..3L.

Input pack:

```text
DevelopmentConexus Engineering Method
Documentation Map principles

docs/conexus/current/README.md
docs/conexus/current/PRODUCT-CONTRACT.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/current/DECISION-RECONCILIATION.md
```

Historical/detail authority may be opened **after** the current tree identifies the detailed semantic home or when exact rationale/proof is needed. It is a failure if old documents are required merely to discover the current Product/architecture/status.

This review is a fresh-context self-review, not the independent challenge required by the Method/R11. Fable remains required next.

---

## 2. Fresh Actor questions

### Q1 — What is Conexus?

**PASS.**

The current tree yields one coherent answer:

> AI-first enterprise platform for building/evolving/operating business applications and Product Agents over real enterprise systems/data, with governed enterprise Brain, authority-preserving engineering and truthful Evidence.

Four Product strengths are explicit:

```text
Builder / Harness
Enterprise Brain
Applications / Capabilities / Integrations
Product Agents
```

No historical framework is needed to understand the Product.

### Q2 — What is F1 and what is the first proof?

**PASS.**

```text
F1 = internal/company-first platform
future = SaaS direction preserved by seams/triggers
first vertical = Budget Analyzer / Sankhya
first vertical = read-only analytics
Product Agent/external write = not artificially required
```

### Q3 — What are the Product's primary concepts and journeys?

**PASS.**

Product Contract exposes current concepts including:

```text
Account / Workspace / Area
Project / Baseline / Change / Plan
live checklist / tasks-purpose memory
Brain / Discovery / AnalyticQuery
Connection / Capability / Integration
Artifact / Release / Promotion
Build / Platform Consultant / RunPreview
Published Application
Product Agent / Conversation / AgentRun / ApprovalRequest / Trigger
Managed Job
Finding / Evidence / Environment / private blobs
```

Whole journeys cover Inception, Build, Brain Discovery/publication, Connection, Query/AnalyticQuery, Release, app use, Agent authoring/use/approval, managed sync, Project duplication, first vertical and maintenance.

### Q4 — What are the semantic owners?

**PASS.**

Architecture gives one current owner map:

```text
Identity & Access
Workspace
Project
Builder
Artifact Registry
Connections
Capability Gateway
Brain
Production Agent Runtime
Release
Observability & Audit
Attachments & Blob
Managed Application Runtime
```

It explicitly says these do not imply separate services/processes/databases.

No missing generic Workflow/Tool/Secret/Budget/Status owner is inferred.

### Q5 — Where does durable truth live?

**PASS.**

The current tree clearly separates:

```text
Project Git
Workspace Brain Git
hub_control PostgreSQL
Project DB
mastra_builder
mastra_par
Artifact/Blob/CAS backing
CredentialBackend backing
backup material
```

`Project Git != Workspace Brain Git` is explicit, fixing the highest-risk Round-1 source-placement ambiguity.

### Q6 — How does the Builder currently work?

**PASS.**

Without C-002 archaeology the current tree yields:

```text
Change
→ persistent Change-scoped CodingSession
→ Mastra AgentController
→ BuilderMastra
→ Workspace
→ E2B
```

And simultaneously preserves:

```text
Change != WorkUnit != ActorRun
Hub owns Plan/current state/correctness
runtime state never authority
independent material verifier remains
Builder OM = OFF
E2B physical-incarnation guard mandatory
```

Pi is clearly historical/fallback-only, not current primary runtime.

### Q7 — How does Product Agent currently work?

**PASS.**

Current path is discoverable directly:

```text
exact active Release
→ RuntimeAgentProjection
→ ParMastra
→ direct Mastra Agent
→ bounded ToolProjection
→ Conexus owners / Gateway
```

The tree explicitly rejects Stored Agent/editor/latest authority and distinguishes Product AgentRun from Builder ActorRun and EffectAttempt.

### Q8 — Is Product Agent technology already proven?

**PASS — answer is NO.**

The qualification matrix is unambiguous:

```text
direct Mastra Product Agent = ARCHITECTURE CURRENT / PACKAGE B NOT QUALIFIED
same-process Builder/PAR    = ARCHITECTURE CURRENT / PACKAGE B NOT QUALIFIED
```

A Fresh Actor cannot reasonably mistake architecture selection for deciding Evidence.

### Q9 — What has actually been qualified?

**PASS.**

```text
Q0 = COMPLETE
Package A = COMPLETE
Mastra Builder tested properties = PASS
E2B = PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD
native Codex OAuth = PASS for tested A path
Builder OM = EVALUATED / KEEP OFF
```

Packages B–E remain unproven.

### Q10 — Who owns external effects and credentials?

**PASS.**

```text
Workspace → Connection
Project → explicit binding intent
Connections → logical state/qualification/credential handle
CredentialBackend → secret-byte/crypto mechanism
Gateway → current effect admission/replay/credential last-mile
```

The tree forbids guest/browser/chat/Project durable credential inheritance.

### Q11 — What is Brain and what is it not?

**PASS.**

```text
Brain = Workspace published SEMANTIC / KNOWLEDGE / EVIDENCE authority
canonical source = Workspace Brain Git
Project use = explicit pinned binding
Discovery = machine propose / human decide
feedback = KnowledgeProposal / human publication
```

Explicit negatives:

```text
Brain != memory
Brain != RAG/index
Brain != Project DB
Brain != telemetry/security policy
```

### Q12 — How are analytical reads represented?

**PASS.**

Two regimes are discoverable:

```text
static registered Query
restricted Brain-bound AnalyticQuery
```

AnalyticQuery is bounded by semantic IDs, curated dataset, restricted plan/AST, SELECT-only proof and Project read-only authority. Runtime LLM is not free to invent physical SQL/join topology.

### Q13 — How are Plan/checklist/tasks represented?

**PASS.**

```text
Plan = approvable current Change decomposition where needed
Hub = current plan-item/state authority
worker/model = proposal source
UI = projection
worker death = honest interrupted state
`tasks.md` = durable purpose/context memory, not operational truth
```

### Q14 — How do Git results work now that CodingSession is persistent?

**PASS.**

```text
logical branch per Change
worker may create temporary local commits
one canonical result commit per bounded WorkUnit
Hub owns remote push/integration
no hidden force/rebase normal path
```

No contradiction with persistent Change-scoped cognition is implied.

### Q15 — How do Release, environment and migration fit together?

**PASS.**

A Fresh Actor can distinguish:

```text
ReleaseManifest exact composition
candidate/release state
Promotion/environment state
EnvironmentConformance
BuildValidationDB / DEV / Preview / PROD
PROD = same Project isolated environment
configContractDigest != secret rotation
backward-compatible vs maintenance-required migrations
production migration forward-only
CAS conflict
SERVED_VERIFIED
```

### Q16 — What is the first-production topology?

**PASS.**

```text
existing company physical server
→ Windows host
→ dedicated Linux production guest
→ one Node/TS Hub process
→ co-located but capability-isolated PostgreSQL/Mastra/backings
```

Ingress is private LAN/existing corporate VPN + HTTPS; public Internet ingress F1 = none.

The tree explicitly says this is first-installation architecture, not universal SaaS topology.

### Q17 — What are the trust zones?

**PASS.**

Exactly six logical classifications are discoverable:

```text
Z1 Browser / Client
Z2 Trusted Hub Control
Z3 Guest Execution
Z4 DEDICATED External Application
Z5 External Provider / Enterprise
Z6 Trusted Data / Storage Infrastructure
```

They are classifications, not required deployment units.

### Q18 — How are cost/tokens handled?

**PASS.**

The current tree exposes both Product transparency and architecture enforcement:

```text
visible token/cost/duration/provenance states
missing != zero
reported != inferred
calculated != provider-reported != reconciled

owner-local model spend
→ durable maximum-liability reservation
→ commit
→ physical provider call
```

Package C still owns mechanism qualification.

### Q19 — What happens to telemetry/F5?

**PASS.**

```text
owner-control F5 proposal != Operational Telemetry
runtime/trace/provider IDs = observations/correlation
owner dispatch context = effective terminal target
required Evidence missing = NOT_PROVEN
```

No telemetry reconstruction of owner truth is allowed.

### Q20 — What is intentionally future instead of forgotten?

**PASS.**

The tree preserves explicit seams for SaaS, SaaS↔on-prem reachability, multi-repo, cross-Workspace exchange, DEDICATED physical placement, HA/PITR, advanced Agent memory, EVENT, Durable Agent, Agent networks, MCP/A2A, Agent browser/source access, Connection failover, KMS, SSO/SCIM, public/embed, richer app roles and Brain RAG/index.

It simultaneously forbids dormant F1 machinery for those futures.

### Q21 — Which major old ideas must not resurrect?

**PASS.**

Decision Registry/README directly route or reject:

```text
Pi primary Builder
fresh cognitive reset each WU
guest LLM key
Vercel AI SDK Product Agent authority
Stored/editor/latest Agent authority
Mission/Milestone/Fleet
UniversalEnvelope
mutable artifact registration authoring API
mandatory webhook/EVENT
URL-fragment app auth
PROD as separate forked Project
“security later because internal F1”
generic agent_event owner/table
memory/RAG as Brain authority
public Internet first-installation ingress
```

No history search is required to know these are stale.

### Q22 — What is current status and next action?

**PASS.**

```text
3L Q0 = COMPLETE
Package A = COMPLETE
R11 = ACTIVE
Package B = PAUSED
Packages C–E = NOT STARTED
3M–3O = NOT STARTED
C-018 = NOT RATIFIED
implementation = BLOCKED
```

Exact next action is independent Fable review after this Fresh Actor PASS.

---

## 3. Archaeology test

To answer Q1–Q22, the reviewer did **not need to open historical C-002/C-010/C-013/C-014/3H files to discover current state**.

Historical/detail authority remains useful for:

```text
exact rationale
exact normative wording not projected in current tree
reopen analysis
proof/adjudication provenance
implementation assumption investigation
```

That is the intended role.

Verdict:

```text
current-state archaeology required = NO
historical corpus still reachable   = YES
```

---

## 4. Expected pre-ratification integration gap

The repository bootstrap is **not yet rewired**:

```text
AGENTS.md
DOCUMENTATION-MAP.md
docs/conexus/DECISOES.md
docs/conexus/phase3/LEDGER.md
```

still reflect the pre-R11 active discovery path/status in places.

This is **not classified as a Product/architecture finding** because the approved R11 plan intentionally delays repository-wide authority rewiring until the current candidates pass coherence + independent Fable + adjudication + operator ratification.

The current README explicitly warns that the R11 activation record governs the temporary routing and that stale `Package B NEXT` wording must not start Package B.

Required finalization after successful R11-H:

```text
rewire AGENTS / Documentation Map
reduce DECISOES to historical/provenance role
update LEDGER to reconciled current route
change current/* candidate status to ratified current authority
```

If final rewiring is not performed after ratification, R11 is incomplete.

---

## 5. Fresh Actor success test

A Fresh Actor using the current tree reaches all of the following without conversation memory:

```text
Conexus Product identity / non-product boundary                     PASS
F1 vs future SaaS direction                                        PASS
Workspace / Project / Change / Plan model                           PASS
current semantic owners                                             PASS
Builder current runtime                                             PASS
Product Agent current architecture                                  PASS
Brain current authority / Discovery / AnalyticQuery                 PASS
Connection/Gateway/credential authority                             PASS
Release/environment/migration/serving semantics                     PASS
Published App authority separation                                  PASS
cost/tokens/Evidence/F5 truth                                        PASS
six trust zones                                                      PASS
first-production topology                                            PASS
technology qualified-vs-pending distinction                          PASS
future seams vs rejected F1 machinery                                PASS
historical supersession routing                                      PASS
program status / blockers / next action                              PASS
```

---

## 6. R11-F verdict

> **PASS — the four-file current tree is sufficient as a Fresh Actor current-state discovery surface and is ready for the independent Fable whole-product challenge required by R11-G.**

```text
material finding                  = 0
projection finding                = 0
expected integration action       = final bootstrap/status rewiring after ratification
independent review                = STILL REQUIRED
Package B                         = PAUSED
implementation                    = BLOCKED
```

This is self-review Evidence only. It cannot substitute for Fable.

---

## 7. Exact next action

> **Prepare a bounded independent Fable review request over the four current candidates + R11 coherence/fresh-review Evidence. Ask Fable to attack omissions, false supersession, stale mechanics, Product↔architecture mismatch, missing future seam, YAGNI violations, qualification overstatement and incorrectly compiled Package-B prerequisites. Adjudicate every material Fable finding before requesting final operator ratification.**

# Conexus — Whole-Product Contract

> **Status:** CANDIDATE / R11-C — NOT YET CURRENT AUTHORITY  
> **Parent checkpoint:** `3A-R11 — Whole-Product Authority Rebaseline`  
> **Method:** DevelopmentConexus Engineering Method v1.0.0  
> **Implementation:** BLOCKED  
> **C-018:** NOT YET RATIFIED  
> **Package B:** PAUSED / NOT OPENED  

This candidate consolidates **what the Conexus product is, what it must mean, what users can do with it, which whole-product journeys must compose correctly, and which future capabilities are deliberately not part of the F1 baseline**.

It is derived from accepted product/system authority, especially C-001/C-003, 3B, 3K and the owner/state/security boundaries of 3C–3J. It does **not** replace those detailed semantic homes and does not turn runtime/provider mechanics into Product authority.

Until R11 whole-product coherence, independent Fable review, finding adjudication and final operator ratification are complete, this file remains a candidate projection.

---

# 1. North Star

> **Conexus is an AI-first enterprise software platform that helps people build, evolve and operate business applications and Product Agents over real enterprise systems and data, while preserving explicit business knowledge, governed authority, verifiable engineering and truthful operational evidence.**

The platform combines four product strengths that must remain coherent rather than becoming four separate products:

```text
1. Conexus Builder / Harness
   → build and evolve software through governed agentic engineering

2. Enterprise Brain
   → reusable, published business meaning and knowledge above individual Projects

3. Business Applications / Capabilities / Integrations
   → turn ERP and external-system data/capabilities into useful software

4. Product Agents
   → Project-owned AI capabilities that reason and act only through governed product context/tools
```

The user experience is:

```text
agent-first
+
simple by default
+
inspectable by design
+
authority-preserving
```

The operator should normally describe business intent and inspect the result, without being forced to operate runtime internals. When trust, debugging, review or risk demands more depth, the product exposes the real resources, changes, proofs and technical detail needed to understand what happened.

---

# 2. Product strategy and first proof

## 2.1 F1 — internal/company-first platform

F1 is the first complete usable Conexus platform operated internally to build and deliver real business software.

It is not an open self-service SaaS launch. There is no F1 requirement for public self-signup or billing merely because those capabilities may exist later.

The architecture must not create a dead end for the explicit later SaaS objective, but F1 pays only for capabilities with current product value or an accepted safety/architecture need.

## 2.2 Later SaaS direction

Opening Conexus as a SaaS platform remains an accepted Product direction from C-001.

That direction does **not** authorize today:

```text
self-signup
billing platform
marketplace/ecosystem
pooled customer policy complexity
universal plugin framework
speculative cross-customer sharing
```

Those capabilities require their own consumers, requirements and decisions when the SaaS transition is actually pursued.

## 2.3 First vertical

The first vertical remains:

> **Analisador Inteligente de Orçamentos — Sankhya**

It is both:

- a useful real business application; and
- a permanent Builder quality benchmark against the known Mitra result and later Conexus versions.

The first vertical is intentionally **read-only analytics**. It does not require a Product Agent, external write or business automation merely to exercise infrastructure.

---

# 3. What Conexus is not

F1 is deliberately not:

```text
an ERP replacement
an unrestricted database console
a generic integration/iPaaS platform
a generic workflow/BPM engine
a universal automation/scheduler product
a generic RAG/vector/knowledge platform
a universal policy/authorization engine
a marketplace of plugins/apps/agents
a generic Agent fleet runtime
a low-code form/workflow builder
an IDE as the primary Product experience
a black-box chat that hides real resources/truth
a native-mobile-first product
an unrestricted autonomous-agent platform
```

Mechanisms may be reused internally where justified, but shared machinery must never absorb Product/business authority by convenience.

---

# 4. Primary users and actors

The Product does not require every installation to use the same job titles, but F1 must support these meaningful user classes.

## 4.1 Workspace owner / platform operator

A trusted human who can establish and administer a Workspace, create/authorize Projects, manage Workspace resources and oversee the software being built and served.

Administrative authority never means automatic right to consume every business capability/data set in every Published Application.

## 4.2 Project administrator / builder operator

A person authorized to create/evolve a Project, manage its Baseline, Changes, bindings, access, candidate verification and Releases according to current permissions/gates.

The normal Product path is agent-assisted; source/code/diff remain inspectable where useful.

## 4.3 Project contributor / reviewer

A person who may participate in Project evolution, inspect Change/Preview/Evidence and take only the actions their current authority permits.

## 4.4 Published Application user

A business user who consumes the application/capabilities delivered by a Project.

Published Application access is independent from Control Plane/Builder access.

A business user may legitimately use an application without seeing source, Changes, Builder internals or Releases.

## 4.5 Product Agent user

A Published Application or admitted headless consumer that interacts with an exact active Project-owned Product Agent under the Published App/runtime authority applicable to that invocation.

## 4.6 Approver / decision maker

A current eligible human principal presented with one **exact** decision subject — for example a Change checkpoint, effect approval, Promotion or access mutation — in the owner context that actually governs that decision.

There is no universal Approval Center that flattens all decision meanings.

## 4.7 Auditor / technical investigator

A person with authority to inspect history, Evidence, provenance, Findings, runs, receipts and diagnostic detail without turning observations/logs into current-state authority.

---

# 5. Core Product model

## 5.1 Account

One global Conexus human identity.

An Account may participate in multiple Workspaces. Shared Account membership never creates cross-Workspace data/resource authority.

## 5.2 Workspace

The sovereign Product isolation/organization root presented to the user.

A Workspace may represent a company, customer, laboratory or personal initiative.

Workspace-owned resources include at least:

```text
Projects
Brain
Connections
organizational Areas/membership context
access-filtered cross-Project Agent catalog
```

A Workspace does not own every Project-internal artifact/runtime record merely because the Project belongs to it.

## 5.3 Area

Optional organizational grouping of people inside a Workspace.

Area is not software and does not own Project lifecycle, source, data, Release, Brain revision or Connection binding.

Organizational access and technical dependency/binding are separate graphs.

## 5.4 Project

The independent unit of software/product lifecycle inside a Workspace.

A Project may contain:

```text
frontend/application surfaces
business data/read models
Queries / Actions
integrations/bindings
Product Agents
managed jobs when needed
artifacts
Releases
```

These are not separate Projects merely because their technology/runtime differs.

A new Project is justified by independent product evolution, Release/data ownership or lifecycle — not by technical layer count.

F1 has one canonical source repository per Project. Multi-repo Project support is deferred until a real consumer makes it necessary.

## 5.5 Project Baseline

The approved, versioned statement of the Project's current intended architecture/product meaning sufficient for the work being undertaken.

The readable specification lives in Project Git; the Hub records which exact revision/digest is approved.

The Baseline is:

```text
SPEC-ANCHORED
LIVING
INCREMENTAL
```

It is not Big Design Up Front. It must be sufficient for the current Change, not complete for every possible future feature.

A coding actor must never be forced to invent a material Project-level architecture decision because the current Baseline omitted something required by the Change.

## 5.6 Change

A bounded, verifiable unit of Project evolution describing **what must become true**.

Change owns current intent/correctness/checkpoint semantics. It is distinct from:

```text
Work Unit   → bounded work decomposition
ActorRun    → concrete Builder execution episode
```

These internals can be progressively inspected without becoming the normal Product vocabulary for every user.

## 5.7 Brain

The Workspace-scoped canonical source of reusable business meaning and governed knowledge.

The Brain can contain closed content classes:

```text
SEMANTIC
→ datasets, entities, dimensions, measures, metrics, grain, relationships

KNOWLEDGE
→ glossary, business rules, caveats, processes, policies/context

EVIDENCE
→ provenance specifications, assertions, verification requirements, golden cases
```

Brain is not:

```text
agent memory
RAG/vector index
Project DB
telemetry store
security policy engine
```

The Brain is published/versioned. A Project uses it through an explicit `ProjectBrainBinding`; a new Brain revision never silently changes a Project or active Release.

## 5.8 Connection

A Workspace-owned concrete relationship to an external system/environment using a versioned Connector definition, qualification facts and an opaque credential relationship.

Project use requires explicit typed `ProjectConnectionBinding`.

A Project never receives the durable credential material. It refers to logical bindings; trusted platform owners resolve actual secret/material and external destination at the permitted boundary.

## 5.9 Capability

A real Project capability that software/users/Agents can invoke through the governed platform.

F1 Product vocabulary includes at least:

```text
Query
Action
```

Capabilities have explicit input/output/effect/access meaning and are implemented from immutable registered revisions/Release composition.

Capability is not a universal object that erases the owners of Integration Operations or other future tool families.

## 5.10 Integration

The Project view of explicitly bound external-system capability.

Workspace owns Connection; Project owns the binding/use. Connector/provider protocol remains mechanism; business meaning remains with the consumer/Project/Brain owners that use it.

## 5.11 Artifact / immutable revision

Git contains authored source; the Artifact Registry contains immutable compiled revisions/digests/availability needed for governed composition.

An artifact's existence/availability does not make it active in production.

## 5.12 Release

The immutable exact composition of Project outputs/bindings/configuration/runtime facts eligible to be served.

A Release is never resolved by mutable `latest` semantics for governed execution.

Key distinction:

```text
candidate verified
!= Release AVAILABLE
!= Promotion approved
!= pointer switched
!= SERVED_VERIFIED
```

## 5.13 Promotion

The governed act/process of moving an exact Release toward the target serving environment under current conformance/authorization/gates.

Rollback is another governed Promotion to an eligible prior composition. It does not pretend to rewind business data automatically.

## 5.14 Build

The primary Project construction workspace.

Product hierarchy:

```text
Project navigation
+
Preview-dominant work surface
+
contextual/retractable Conexus Builder assistance
+
Preview | Code | Diff lenses
```

Build is agent-first, not agent-only.

## 5.15 RunPreview

An exact candidate/result surface for controlled inspection before production serving.

```text
Preview ready
!= verified
!= active Release
!= Published App
```

Preview belongs to the construction/Control Plane authority context and never silently reuses production credentials/audience/data authority.

## 5.16 Published Application

The product/business runtime served from an exact active Project Release.

Its access/roles/business capabilities are independent from Control Plane/Builder access.

`Open App` is an explicit transition from the Control Plane into the Published Application authority context.

## 5.17 Product Agent

A Project-owned, git-first, Release-pinned AI product resource whose canonical authoring contract is the Conexus Agent definition (`agent/v1`).

Product Agent semantics include:

```text
identity / purpose
instructions / behavioral intent
model policy
bounded tools/capabilities
Brain/context relationship
admitted memory policy
interaction mode/surface intent
policies / approvals / budgets
verification / known limitations
```

Manual/structured authoring and natural-language authoring must converge on the **same Change, same candidate definition and same Release path**.

There is no independent runtime/editor Agent authority.

## 5.18 Conversation

Conexus identity for a user-facing Product Agent conversation when a conversational interaction exists.

Conversation is not a provider session/thread identifier and does not imply authority beyond the active Project/Agent/user context.

## 5.19 Product AgentRun

One admitted, exact-pinned Product Agent execution.

It is distinct from Builder ActorRun and from a Gateway external EffectAttempt.

```text
AgentRun COMPLETED
!= every external effect succeeded
```

## 5.20 ApprovalRequest

The exact durable approval wait/subject owned by the appropriate Product Agent/owner path.

Approval always binds the exact sealed proposal subject. Approval never authorizes changed arguments, a newer proposal or a different effect merely because the user had approved something similar.

## 5.21 AgentTrigger

Owner-managed trigger semantics for headless Product Agent execution.

Current F1 admitted trigger family is bounded; `SCHEDULE` is accepted where used. `EVENT` remains deferred until a real consumer/contract exists.

Interactive and headless Agents remain the same Product Agent concept rather than separate `ChatAgent`/`AutomationAgent` domains.

## 5.22 Managed Job / job run

A Project-scoped managed-execution capability used when a deterministic/background function is a real Project requirement.

The first F1 `job/v1` consumer is governed sync, not arbitrary privileged Project code.

A job run is a durable Project occurrence; queue/scheduler technology is reconstructible mechanism, not Product authority.

## 5.23 Finding

Durable Project/Change problem or contradiction that survives the runtime/actor that discovered it where needed.

A worker/model can originate a Finding; it does not own acceptance/closure authority merely because it discovered the issue.

## 5.24 Evidence

Bound, provenance-preserving proof over facts/results/receipts/tests/decisions needed to support a claim.

Agent prose, absence of a Finding, a green UI badge or a telemetry trace alone is never sufficient Evidence merely by existence.

## 5.25 Environment

Project software/business data is realized in explicit environments such as DEV and PROD when present.

Validation databases are temporary proof fixtures, not a mandatory permanent TEST environment.

Preview is a candidate-serving concept, not a third persistent business environment.

---

# 6. Ownership map users may rely on

| Meaning | Product owner / authority |
|---|---|
| global human identity/session/access relationships | Identity & Access |
| Workspace/Area organizational identity/lifecycle | Workspace |
| Project identity/lifecycle/Baseline/binding intent | Project |
| Change/WorkUnit/Builder execution/Findings | Builder |
| authored source | Project Git |
| immutable compiled artifact revision | Artifact Registry |
| reusable enterprise meaning/knowledge | Brain |
| external-system account/environment relationship | Connections |
| external effect / credential last-mile / replay safety | Capability Gateway |
| Product Agent Conversation/AgentRun/Approval/Trigger | Production Agent Runtime |
| active Project composition/version | Release + Promotion/serving authority |
| Published Application business data | Project Database / external source according to declared Product semantics |
| managed background Project occurrence | Managed Application Runtime |
| operational observation/audit projection | Observability & Audit, never business-state replacement |
| exact attachment authority | owner record; shared bytes/storage never create cross-owner access |

Visual composition of several meanings on one screen never merges these owners.

---

# 7. Whole-Product journey A — first access and Workspace

```text
trusted operator provisions Account
→ user establishes authenticated session
→ current authority resolves available Workspace context
→ user enters or creates an authorized Workspace
→ Workspace shell exposes Projects / Agents catalog / Brain / Connections / administration
```

Product laws:

- no public self-signup F1;
- Workspace membership does not reveal every Project/Agent automatically;
- Workspace Agent catalog is access-filtered server-side;
- Workspace Agent catalog is discovery/attention projection, not a fleet owner or Approval Center;
- Brain/Connections are Workspace-owned; Project mutation still occurs in the owning Project.

---

# 8. Whole-Product journey B — new Project / Inception / Baseline

```text
Workspace
→ Create Project
→ establish/associate canonical Project source repository
→ Inception / Discovery
→ inspect business objective, users, constraints, source systems, real data when relevant
→ propose Project Baseline
→ human checkpoint: “this is what we are building”
→ approved Baseline digest becomes the current Project authority
→ initial Changes may begin
```

For brownfield software, Discovery includes current code/contracts/architecture/data reality.

Product laws:

- Inception is not a fake Change merely to fit a lifecycle;
- investigation may precede final Baseline meaning;
- material assumptions stay explicit;
- the approved Baseline is incremental and may evolve through later governed revision;
- future completeness is not a prerequisite for first useful Change.

---

# 9. Whole-Product journey C — build/evolve a Project

```text
user states business/product intent
→ Conexus establishes or updates a Change
→ current Baseline + relevant authority are pinned
→ discovery/planning proportional to risk/uncertainty
→ user checkpoint when required
→ Builder executes bounded Work Units/ActorRuns
→ code/data/capability/integration/agent candidates evolve inside approved scope
→ mechanical tests + runtime observation + assertions/Evidence
→ material verifier independent from implementer when required
→ candidate becomes honestly VERIFIED or remains failed/blocked/unverified
→ RunPreview permits controlled review
→ exact Release can be composed
→ governed Promotion
→ serving verification
→ SERVED_VERIFIED
```

Important distinctions:

```text
model says done                 != Change accepted
Work Unit completed             != Change verified
Preview ready                   != verified
Release AVAILABLE               != live
pointer switched                != served verified
0 Findings                      != verified
```

When runtime discovery reveals a material Project-architecture change, the Builder must stop before silently crossing the current Baseline boundary and return through Finding/Replan/Handoff/checkpoint.

---

# 10. Whole-Product journey D — Brain lifecycle and reuse

```text
Workspace establishes/publishes Brain meaning
→ exact immutable Brain revision is compiled/available
→ Project explicitly binds one revision through ProjectBrainBinding
→ Project proves local realization/conformance where required
→ Release pins exact binding/composition
→ runtime receives only the effective bounded Brain slice it needs
```

When new knowledge is discovered:

```text
Project / Builder / Product Agent / human
→ KnowledgeProposal
→ Brain owner review
→ human publish decision
→ new Brain revision AVAILABLE
→ existing Projects see UPDATE_AVAILABLE
→ each Project independently evaluates/rebinds/revalidates/promotes
```

Never:

```text
agent memory → silently writes Brain
a new Brain revision → silently changes every Project
RAG result → becomes published truth
Project-local implementation → becomes company semantic truth without review
```

---

# 11. Whole-Product journey E — Connection / Integration

```text
Workspace chooses/configures a Connector-backed Connection
→ secret is entered through dedicated write-only administration path
→ Connection is semantically qualified against the real external environment
→ Project explicitly binds Connection/environment through ProjectConnectionBinding
→ Release pins the exact Project binding/composition
→ Project capability/Agent/job invokes only admitted operation through the Gateway
→ Gateway resolves current binding, permission/policy/effect/credential and external destination
→ result/receipt/provenance returns to owning Product flow
```

Product laws:

```text
Connection configured != qualified
qualified != bound
bound != currently healthy
healthy != current caller authorized
```

No secret is pasted into chat, stored in Project Git, exposed to browser or delivered as durable provider credential to a Builder/Product Agent guest.

A broken Connection blocks/represents its real state. The platform never silently selects another “similar” Connection.

---

# 12. Whole-Product journey F — Data and Capabilities

A Project may consume external facts, own Project-native data or create derived/read-model data according to its approved Baseline.

No universal integration data path exists.

```text
LIVE
DERIVED / MIRRORED
HYBRID
```

are architectural composition families, not a global Product setting/FSM.

The Project Baseline selects the minimum data path needed by the current product slice based on source capabilities, latency/freshness/history/volume/consistency/cost/proof needs.

Business access occurs through governed typed Capabilities rather than unrestricted browser/Agent SQL/network access.

Data inspectability is a Product capability; ad-hoc authority-bypassing mutation is not.

---

# 13. Whole-Product journey G — Publish and use a business application

```text
verified candidate
→ Release composition
→ required current approvals/conformance
→ Promotion
→ target serving pointer changes when safe
→ served content is independently checked
→ SERVED_VERIFIED
→ Published Application is available under its own access authority
```

Published Application user:

```text
authenticates as one Account
→ Published App access is resolved independently from Project/Control Plane access
→ user invokes only current permitted business capabilities
→ backend/Gateway applies actual domain/policy/effect rules
```

A Project administrator can administer Published App access without automatically receiving all business data/capabilities.

A Published App user can use business software without receiving source/Builder access.

---

# 14. Whole-Product journey H — create/evolve a Product Agent

Product Agent authoring is Project evolution, not a parallel platform.

Entry points may include:

```text
Project → Agents → New Agent
Project → Agent → Change with Conexus
Project → Build → “I want an agent that…”
```

All converge:

```text
intent
→ same Change lifecycle
→ dependency analysis
→ existing Capabilities/Integrations/Brain identified
→ missing dependencies made explicit
→ material scope widening shown at checkpoint
→ structured/manual and natural-language changes create same candidate Agent definition
→ candidate diff/verification/test
→ exact immutable revision
→ Release
→ Promotion
→ active Product Agent only when serving authority says so
```

There is no:

```text
ManualAgentDefinition
AIAgentDefinition
MastraStoredAgent authority
AgentBuilder database
Agent-specific Publish authority
```

Structured edits that do not need a coding-model call still stay inside the same Change/work graph, diff/proof/commit/Release laws.

---

# 15. Whole-Product journey I — use a Product Agent

## 15.1 Interactive

```text
Published App user
→ Project-designed Agent interaction surface
→ bounded typed app context/refs
→ Conversation
→ admitted exact-pinned AgentRun
→ active Product Agent reasons with admitted context + ToolProjection
→ current facts resolved through governed capabilities
→ response/effect receipts shown truthfully
```

Browser/app context is a hint/ref, not business truth. Material facts are resolved through owners/capabilities.

## 15.2 Headless / scheduled

```text
admitted AgentTrigger
→ stable intended occurrence
→ AgentRun admission/pinning
→ direct Product Agent execution
```

Scheduled runs are threadless by default unless a real conversation/memory requirement exists.

`EVENT` triggers remain absent from F1 until a real consumer/contract is accepted.

## 15.3 Product Agent default authority surface

Product Agent is **product/context-aware**, not source/host-aware by default.

It does not automatically receive:

```text
Project repository/source
shell/filesystem
browser/computer-use
raw network
raw database access
raw credentials
Builder workspace
platform internals
```

Those capabilities require a named Product consumer and applicable trust/qualification decision.

---

# 16. Whole-Product journey J — exact effect approval

When a Product Agent proposes an action that requires human approval:

```text
Agent produces exact governed proposal
→ owner persists exact sealed subject
→ ApprovalRequest waits
→ eligible current human sees exactly what is being authorized
→ ALLOW_ONCE or DENY/expiry/stale outcome
```

On `ALLOW_ONCE`:

```text
same exact proposal/args
→ current authority/gates rechecked
→ Gateway effect admission
→ exact idempotency/effect identity
→ one external effect attempt under owner safety
```

Never:

```text
approve proposal A
→ execute changed proposal B

runtime retry
→ effect retry authority

provider/trace says success
→ owner manufactures success without required receipt/current facts
```

`OUTCOME_UNKNOWN` remains an honest state requiring reconciliation rather than blind replay.

---

# 17. Whole-Product journey K — managed sync/job

The first F1 managed-job consumer is source sync needed by a real Project, not a generic automation platform.

```text
exact active Release contains admitted job/v1 composition
→ schedule projection is derived
→ manual or fixed-interval occurrence
→ Managed Application Runtime admits job run
→ job coordinates only governed Project/Gateway capabilities
→ Project read model/state updated according to its Baseline
→ occurrence/result/provenance recorded
```

Current F1 laws:

```text
single-flight / coalesce
one catch-up after downtime
not replay every missed slot
no arbitrary privileged Project code
no workflow/scheduler business domain
```

Exact queue/scheduler technology remains qualification/realization mechanics.

---

# 18. Whole-Product journey L — first vertical Budget Analyzer

The first vertical concretely composes the platform without forcing every subsystem into the demo.

```text
Workspace: Metal Nobre
│
├── Brain
│   └── budget/pending/conversion definitions + caveats
│
├── Connection
│   └── Sankhya environment
│
└── Project: Budget Analyzer
    ├── Project Baseline
    ├── ProjectBrainBinding
    ├── ProjectConnectionBinding
    ├── governed sync
    ├── Project analytical read model
    ├── registered read-only Query Capabilities
    ├── frontend dashboard
    └── Release / Published Application
```

Approved data path for this Project:

```text
Sankhya
→ Gateway live reads for Discovery / qualification / reconciliation / verification / Evidence

Sankhya
→ governed sync
→ Project Database derived analytical read model
→ registered read-only Queries
→ dashboard runtime
```

Truth laws:

```text
Project DB != Sankhya source authority
Project DB != Brain semantic authority
read model existence != proof of sync completeness
historical benchmark != current operational truth
```

The product must reject/fence unsupported semantics rather than fabricate a KPI. The known cost/margin caveat from the benchmark is an example of the behavior expected: if the source/Brain cannot support the claim, Conexus says so.

For this vertical:

```text
Product Agent required       = NO
external/business WRITE      = NO
business automation          = NO
```

The `Agents` surface may honestly be empty.

---

# 19. Whole-Product journey M — maintenance and iterative evolution

After a Project is live:

```text
new business request / bug / source change / Finding / Brain update
→ create Change
→ pin current Baseline + Release-relevant context
→ investigate current reality
→ update Baseline only if material Project meaning changed
→ build/verify candidate
→ Release/Promotion
→ served verification
```

Learnings that deserve broader company reuse do not stay trapped in invisible session memory:

```text
Project discovery
→ explicit KnowledgeProposal when appropriate
→ Brain review/publication
→ other Projects receive update availability
→ each independently evaluates adoption
```

The same rule applies to platform engineering improvements: a repeated failure class may improve scaffold/gates/platform seams, but one local workaround never becomes universal framework by convenience.

---

# 20. Product truth and inspectability laws

The UI may simplify words and layout; it must not simplify away material semantics.

## 20.1 Request/data truth

```text
loading
!= successful empty
!= failed
!= partial
```

Where interpretation depends on it, expose current source/environment/freshness/coverage/provenance.

## 20.2 Build truth

```text
model narration
!= Hub-owned progress

0 Findings
!= verified
```

## 20.3 Preview truth

```text
Preview ready
!= VERIFIED
!= Release AVAILABLE
!= active production
```

## 20.4 Release truth

```text
AVAILABLE
!= Promotion approved
!= pointer swapped
!= SERVED_VERIFIED
```

The Product says `Live`/`Served` only when the owner has actually reached the applicable served-verification fact.

## 20.5 Product Agent/effect truth

```text
AgentRun completed
!= every effect succeeded

SENT_NO_RESPONSE
!= external actor definitively failed

missing spend/usage
!= zero

OUTCOME_UNKNOWN
!= safe retry
```

## 20.6 Observation truth

```text
runtime/provider/trace/telemetry observation
!= owner verification/terminal truth
```

Evidence drill-down may include these observations with their provenance; they never become authority because they are visually persuasive.

---

# 21. Authorization and trust laws visible at Product level

1. One Account identity can participate in multiple Workspaces.
2. Workspace is deny-by-default isolation root.
3. Same Workspace does not imply every Project/Brain/Connection/Agent can be used.
4. Control Plane, Preview and Published Application authority are independent.
5. Project admin does not automatically become application business user/admin.
6. Published App user does not automatically gain Project/Builder access.
7. Managing access does not imply exercising all business access.
8. Client/browser/model-provided IDs/roles/approval state never create authority.
9. Current mutable authority is rechecked server-side at the real control point.
10. Historical Release/run/approval facts remain immutable but do not resurrect revoked current authority.
11. Product Agent/runtime identity is not a Conexus authorization principal.
12. Durable credentials remain with trusted owners; Project/browser/Agent guest gets no durable secret by inheritance.

The F1 Published Application role set remains the accepted closed set `{admin, member}` unless a later material Product decision explicitly changes it. It is separate from Control Plane role/grant semantics.

---

# 22. F1 / CURRENT Product scope

F1 includes the following Product capabilities as current target Product scope even when some technology-specific qualification is still pending:

```text
Account/session/current access authority
Workspace + optional Areas
Project lifecycle
Project Inception / Baseline approval
Change-based governed evolution
agent-first Build workspace
Preview / Code / Diff inspectability
Data inspectability
Query / Action Capabilities
Artifact Registry / exact Release composition
Connections + explicit Project bindings
Capability Gateway / governed external effects
Workspace Brain + ProjectBrainBinding
Product Agent authoring/management/use
Workspace access-filtered Agent catalog
Conversation / AgentRun / exact ApprovalRequest
manual/SCHEDULE Product Agent invocation when applicable
Managed Application Runtime for admitted managed jobs/sync
Versions / Promotion / rollback / served verification
Activity / Findings / Evidence / causal diagnostics
Published Application serving and independent app access
attachments/private storage where Product needs them
first-installation backup/restore/emergency-stop correctness
first vertical Budget Analyzer
per-run/model/spend truth and enforcement obligations
honest operational/data/verification presentation
```

F1 Product scope does **not** mean every item is required by the first Budget Analyzer Project. The first vertical deliberately exercises only the capabilities its Product needs.

---

# 23. NEXT / ADMITTED Product direction

These are real accepted directions/consumers but are not permission to build speculative infrastructure ahead of the current gates.

## 23.1 SaaS opening

Conexus is intended to evolve from the internal/company-first platform into a SaaS offering.

The future SaaS transition may require explicit decisions around onboarding, billing, customer operations, deployment/isolation/economics and support. None are inferred automatically from the F1 internal deployment.

## 23.2 Product Agent expansion across real Projects

F1 already supports the Product Agent concept. Broader Agent use across purchasing, pricing, CRM, sales, operations and other real Projects is an admitted Product direction **only through named Project consumers**, not a generic Agent fleet mandate.

## 23.3 Brain growth by real company use

Brain is designed to grow incrementally as Projects discover/publish reusable business meaning. Broader namespaces/domains come from actual business consumers, not prebuilt ontology completeness.

---

# 24. FUTURE / DEFERRED capabilities and seams

These capabilities are deliberately visible so the platform does not forget them, but F1 creates no dormant machinery merely to reserve optionality.

| Future capability | Current seam / reopen trigger |
|---|---|
| public SaaS self-signup/billing | explicit Phase-2 Product objective; reopen when SaaS program is selected |
| multi-repo Project | Project/repository boundary already isolated; reopen on real Project requiring independent repos |
| cross-Workspace Brain/Connection/package sharing | current same-Workspace boundary; reopen on named exchange consumer + consent/provenance/policy requirement |
| DEDICATED physical deployment | runtime profile seam exists; reopen on first real DEDICATED deployment consumer |
| stronger HA/PITR/multi-host topology | current backup/restore boundaries; reopen on measured RPO/RTO/availability requirement |
| external SLA monitoring/paging | observability/ops seam; reopen on real SLA/on-call consumer |
| Product Agent Working/Agent Memory | PAR memory-policy seam; reopen on named consumer + eval |
| Product Agent Semantic Recall | memory seam; reopen on eval/consumer proving value and safety |
| Product Agent Observational Memory | memory seam; reopen on eval/consumer; Builder OM result does not auto-enable Product Agent OM |
| Memory Extractors | memory seam; reopen on named durable consumer/authority-safe workflow |
| Durable Agent reconnect-to-same-stream | direct Agent runtime boundary; reopen when real UX requires reattachment to same in-flight stream |
| EVENT Product Agent triggers | AgentTrigger/connector seam; reopen on concrete event source/consumer/failure semantics |
| Agent-as-tool / subagents / agent networks | ToolProjection seam; reopen on named product composition need + isolation/effect proof |
| MCP/A2A/external Agent clients | owner APIs/capabilities are addressable; add adapter only when client exists |
| Product Agent browser/computer-use/workspace/source access | runtime trust/tool seam; reopen on named Agent needing it + security/qualification |
| Connection pools/failover | explicit binding/Connection lifecycle; reopen on measured availability/throughput need |
| external Vault/KMS/HSM / per-secret DEK | CredentialBackend seam; reopen on compliance/host-compromise/selective-rekey requirement |
| SSO / SCIM / passkeys | Identity boundary; reopen on customer/enterprise requirement |
| public/embed user flows | Published App ingress/auth seam; reopen on named external/public consumer |
| richer app roles/data-scoping | Published App access owner; reopen on real business role/audience need beyond current closed F1 set |
| vector/RAG index for Brain | derived-index seam; reopen when deterministic selection no longer satisfies measured retrieval need |
| generic Project cloning/export | Project/resource boundaries; reopen on named portability/copy workflow |
| external/cross-company Brain federation | Brain publication/binding seam; reopen on explicit trust/ownership consumer |

Deferred means **not now**, not “never”.

---

# 25. REJECTED / SUPERSEDED F1 inheritance

The following must not appear in F1 just because they exist in historical documents/frameworks:

```text
Pi as primary Builder runtime
guest Product/Builder model-provider key
fresh cognitive reset for every Builder Work Unit
Vercel AI SDK light loop as current Product Agent authority
Mastra Stored/Editor/latest Agent authority
Mission/Milestone/Fleet work model
generic workflow engine
generic scheduler/automation business domain
arbitrary privileged Project job code
universal ResourceBinding engine
universal Tool domain / execute(anySlug)
universal Status/FSM/Envelope
shared mutable cross-Project DB/runtime state
memory/RAG framework as Brain authority
browser/frontend authorization authority
mandatory Agent/chat widget in every app
Product Agent repo/shell/browser/raw-network access by default
public Internet ingress for the first F1 installation
a Product Agent added artificially to the Budget Analyzer
an analytical mirror forced on every future Project/ERP
a global Agent fleet owner at Workspace level
```

Reintroduction requires material Evidence and the smallest applicable Decision Loop; framework popularity or historical presence is not enough.

---

# 26. Product invariants

1. **Workspace isolation:** a Workspace is a sovereign isolation root; common Account identity never creates cross-Workspace authority.
2. **Project independence:** a Project owns one coherent product/software lifecycle; technical layers do not automatically become separate Projects.
3. **Baseline authority:** material Project intent is pinned by an approved Baseline; a coding actor never silently invents missing material architecture.
4. **Change truth:** Change describes what must become true; Work Unit and ActorRun do not replace that meaning.
5. **Mechanism ≠ authority:** runtime/framework/storage/provider mechanics never gain Product ownership merely because they persist state.
6. **Git ≠ runtime state:** Git authors content; Hub owns operational authority; Project DB owns business data; Registry/CAS owns immutable outputs/bytes according to owner boundaries.
7. **Explicit reuse:** Workspace Brain/Connections are shared only through explicit typed Project bindings; no same-Workspace implicit use.
8. **No cross-Project mutable reach:** one Project does not directly query/mutate another Project's DB/source/runtime internals.
9. **Brain truth:** Brain is canonical published business meaning, not agent memory, RAG result or Project-local implementation.
10. **No live inheritance:** new Brain/Connection/config source change never silently changes an active Project Release.
11. **Credentials stay trusted:** durable secrets never become Project/browser/chat/Agent guest data.
12. **Gateway effects:** all governed external effects cross Gateway current authority; runtime retry never grants effect retry authority.
13. **Exact approval:** human approval binds one exact subject/proposal; changed content requires new authority.
14. **Current authorization:** current mutable authorization is rechecked at protected control points; historical pins never resurrect revoked authority.
15. **Surface isolation:** Control Plane, Preview and Published App permissions are separate.
16. **Administer ≠ use:** administrative access does not automatically confer business data/capability use.
17. **Immutable Product Agent authoring:** Product Agent source/manual/AI authoring converges to one candidate/revision/Release authority.
18. **Bounded Product Agent tools:** Product Agents receive an exact Release-derived ToolProjection, never generic hidden capability power.
19. **Product Agent runtime context:** Product Agent is product/context-aware by default, not source/host-aware.
20. **Release exactness:** governed execution is based on exact immutable Release composition, never mutable `latest`.
21. **Truthful serving:** Build/Preview/AVAILABLE/pointer-swapped states never masquerade as `SERVED_VERIFIED`.
22. **Observation ≠ verification:** model narration, runtime/provider traces and telemetry cannot manufacture terminal/verified Product truth.
23. **Unknown stays unknown:** missing/partial/ambiguous data, usage, cost or effect outcomes never become zero/success by convenience.
24. **Derived data honesty:** a Project read model never becomes its own source/correctness proof.
25. **First vertical does not become platform doctrine:** Sankhya/sync/read-model choices for Budget Analyzer do not dictate every ERP/Project.
26. **Future seams without dormant machinery:** an evidenced future capability preserves its boundary/trigger without empty F1 modules/tables/services/frameworks.
27. **Selected ≠ qualified:** Product architecture may select a technology path, but the Product may not claim load-bearing behavior proven until deciding Evidence exists.
28. **No fake completeness:** a Product surface may honestly be empty/unsupported; infrastructure is never exercised with fake Product features solely to make a demo look complete.

---

# 27. Whole-Product scenario gate

Any Architecture Baseline, Realization Plan or implementation must be able to explain these scenarios without contradictory owners/truth.

| Scenario | Required Product truth |
|---|---|
| Account belongs to two Workspaces | identities may be shared; resources/data/authority do not cross by implication |
| Workspace member has no Project grant | Project/resources remain undiscoverable/unusable according to current access rules |
| Create greenfield Project | empty Project → Discovery → Baseline candidate → human approval → initial Change |
| Import brownfield Project | current repo/system reality is discovered before target meaning is assumed |
| Tiny safe Change | proportional DIRECT/LIGHT path may avoid needless planning but never bypass applicable authority/proof |
| Material architecture discovery during coding | stop before crossing Baseline boundary → Finding/Replan/Handoff/checkpoint |
| Builder session survives several Work Units | cognitive continuity may survive; each ActorRun remains bounded/auditable; session history never authority |
| Builder physical sandbox dies | no silent write replay onto a different unobserved physical incarnation |
| New Brain revision published | existing Project remains on old pinned binding until explicit adoption/revalidation/Release |
| Project discovers reusable business rule | KnowledgeProposal → human Brain review; no memory self-publish |
| Same Workspace has several Connections | Project uses only explicitly bound compatible Connection/environment |
| Connection secret rotates compatibly | secret can rotate without source/app rewrite; semantics/identity remain stable if current authority says compatible |
| Connection becomes unhealthy | capability becomes honestly unavailable/degraded; no silent fallback to another Connection |
| Project needs new external operation | Connector/Connection/Project binding/Release/policy must admit it; existence at provider does not grant authority |
| Publish candidate | verification/Release/Promotion/serving states remain distinct until SERVED_VERIFIED |
| Rollback | new governed Promotion to eligible old composition; no promise to reverse business data automatically |
| Business user uses app but cannot build | Published App access works without Control Plane/Project access |
| Project admin manages app users but lacks business role | administration can proceed without silently granting business data/capability use |
| Create Product Agent manually | structured edit remains same Change/diff/proof/Release path |
| Create Product Agent by natural language | same canonical Agent definition and Release path; no hidden AI-only authority |
| Agent intent needs missing Action | Builder exposes scope/permission/effect widening before adding it to Change |
| Agent uses page context | page supplies typed refs/hints; material fact is re-resolved through governed tools |
| Agent asks to execute unprojected capability | fail closed; generic `execute(anySlug)` does not exist |
| Agent proposes effect requiring approval | exact proposal is sealed; ALLOW_ONCE applies only to exact same subject/args after current rechecks |
| Duplicate/restarted Agent runtime | runtime retry cannot manufacture duplicate effect authority |
| Provider acceptance is ambiguous | `OUTCOME_UNKNOWN`; no blind automatic replay |
| Scheduled Agent fires after restart | stable intended occurrence is admitted; no fake Conversation history by default |
| EVENT trigger has no accepted consumer | absent/unsupported, not a decorative switch |
| Managed sync misses downtime slots | at most one catch-up according to current law; no missed-slot backlog replay |
| Telemetry says success but owner fact missing | Product remains NOT_PROVEN/pending/unknown according to owner semantics |
| Dashboard query fails | UI shows failure, never “0 results/no data” |
| Read model covers only part of source | coverage/partiality remains visible; derived count is not presented as universal total |
| Budget Analyzer has unsupported margin source | omit/block/qualify metric honestly; never fabricate a number to match benchmark |
| First vertical has no Product Agent | Agents surface may show honest empty state; no fake Agent is created |
| Future DEDICATED customer appears | reopen physical deployment decision through existing profile seam; no prebuilt unused stack assumed |
| SaaS transition begins | reopen onboarding/billing/deployment/customer-ops requirements without rewriting F1 Product meaning by accident |

A proposed Product concept/module/service with no justification from these scenarios, another accepted invariant or a named real consumer is presumptively YAGNI.

---

# 28. F1 success criterion

Conexus F1 is Product-complete when a real operator/company can, under accepted technical/operational proof:

```text
establish Workspace and controlled access
→ create or connect a Project
→ perform Discovery/Inception
→ approve a sufficient Project Baseline
→ ask Conexus to build/evolve a real business product
→ inspect Preview / Data / Capabilities / Integrations / Brain / Agents / Versions / Activity
→ use real enterprise knowledge through a governed Brain binding
→ use real external systems through qualified Connections + explicit Project bindings
→ verify changes against mechanical/runtime/business evidence
→ create exact immutable Releases
→ promote and prove what is actually served
→ let business users access the Published Application independently from Builder access
→ create/evolve a Project-owned Product Agent through the same Change/Release lifecycle
→ let that Agent reason through bounded governed tools and exact approvals when needed
→ run admitted background sync/job work without inventing a workflow platform
→ observe truthful cost/state/provenance/failures without false-green UI
→ restore/recover the first installation without fabricating business authority
→ reproduce the Budget Analyzer vertical with real Sankhya-derived data and honest semantic limitations
```

without requiring:

```text
open SaaS signup/billing
cross-Workspace sharing
multi-repo Projects
DEDICATED physical deployment
generic workflow engine
advanced Agent memory
EVENT triggers
generic Agent fleet
external Vault/KMS
public/embed runtime
SSO/SCIM
universal plugin/tool/resource frameworks
```

---

# 29. Qualification-state boundary

This Product Contract states **required Product meaning**, not proof that every chosen substrate already works.

Current deciding status at R11-C:

```text
3L Q0                                      = COMPLETE
Package A Builder Substrate + Cognition    = COMPLETE
Mastra Builder persistence                 = PASS for tested properties
E2B Builder substrate                      = PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD
native Codex OAuth                         = PASS for tested Package-A path
Builder Observational Memory               = EVALUATED / KEEP OFF

Package B Product Agent + Cross-Runtime    = PAUSED / NOT OPENED by R11
Package C Model Economics/Enforcement      = NOT STARTED
Package D Managed Execution                = NOT STARTED
Package E Deciding Evidence                = NOT STARTED
3M/3N/3O                                   = NOT STARTED
```

Therefore the Product Contract may say Product Agents, model-spend enforcement, managed jobs and deciding Evidence are F1 Product/architecture obligations, while the Architecture Baseline must still label their technology-specific realization as qualification-pending where applicable.

---

# 30. Reopen triggers

Reopen only the smallest implicated Product/architecture decision when material Evidence shows, for example:

```text
changed Product requirement/ownership
named new Product consumer that current F1 cannot represent
current module/owner cannot represent a required meaning without duplication
new trust/authority boundary
new irreversible/external effect class
real scale/availability/compliance constraint invalidates current seam
provider/framework behavior falsifies a load-bearing assumption
first implementation proves current boundary structurally unworkable
SaaS transition creates concrete onboarding/billing/customer-isolation needs
cross-Workspace or multi-repo requirement becomes real
Product Agent requires browser/source/workspace/advanced-memory capability with real consumer
DEDICATED deployment receives first real consumer
```

Do not reopen for:

```text
framework popularity
newer package/major version alone
reviewer preference
hypothetical enterprise features
“future-proofing” without consumer
an old historical decision still existing in Git
```

---

# 31. Authority provenance

This candidate is primarily derived from:

```text
C-001 — Product vision / scope
C-003 — ratified Product/F1 requirements
3B-01..17 — System Context & Boundaries
3A-R7/R8/R9/R10 — current cross-phase reconciliation
3C-R1 — module/owner closure
3D-R1 — dependency closure
3E-R1 — data authority closure
3F-R1 — contracts/API closure
3G-R1 — behavioral/state closure
3H-R1 — runtime/agent closure
3I-R1 — security/authority closure
3J-R1 — first-installation deployment/operations closure
3K-01 — Project/Build/inspectability Product model
3K-02 — truth/Evidence Product laws
3K-03 — first vertical/data path
3K-04 — Product Agent authoring/use/catalog journey
3K-R1 — final Product Architecture closure
3L-Q0 + 3L-A — current qualification routing/evidence
R11-A census + R11-B candidate reconciliation
```

Detailed semantic authority remains in those homes until and unless R11 final ratification explicitly changes the repository discovery path.

---

# 32. R11-C candidate verdict

```text
Product North Star explicit                         = YES
Product/system non-boundary explicit                = YES
users/actors represented                            = YES
core Product concepts represented                   = YES
major capabilities represented                      = YES
Builder whole journey represented                   = YES
Brain whole journey represented                     = YES
Connection/Integration whole journey represented    = YES
Published Application journey represented           = YES
Product Agent authoring/use/approval represented    = YES
managed sync/job journey represented                = YES
first vertical represented                          = YES
maintenance/feedback loop represented               = YES
F1/NEXT/FUTURE/REJECTED separated                   = YES
Product invariants explicit                         = YES
whole-product scenario gate present                 = YES
technology qualification not overstated             = YES
new Product authority invented intentionally         = NO
```

**Next:** derive `ARCHITECTURE-BASELINE.md` from this Product Contract + accepted 3B–3J semantic authority + R11-B decision reconciliation + current 3L Evidence. The Architecture Baseline must state how the current Product is structurally realized **without promoting unqualified technology assumptions to fact**.

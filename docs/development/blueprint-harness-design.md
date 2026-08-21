# Conexus Blueprint Harness — Design Input

> **Status:** DESIGN INPUT / NON-AUTHORITATIVE PRODUCT VOCABULARY
> **Purpose:** reconstruct the externally observable planning/research/review behavior that produced the Marketplace Central, MetalDocs and Conexus OS planning quality, so Conexus can later realize an equivalent provider-independent harness over its accepted Builder/Mastra boundaries.
> **Authority:** current Product/architecture authority remains in the routed owning documents. The working names `Blueprint` and `Forge` are not Product vocabulary until 4A deliberately admits them.

## 1. Decision question

> How can Conexus make high-quality software planning and implementation repeatable by turning the strongest practices discovered across current projects into a governed harness, while keeping semantic authority in Conexus/Git/Hub rather than in an LLM prompt, model memory or Mastra runtime state?

The target is **not** to copy hidden ChatGPT prompts, private chain-of-thought, provider internals or one model's behavior.

The target is to reproduce the useful **external protocol and system properties**:

```text
bounded context
+ repository-current authority
+ explicit research/source hierarchy
+ progressive ambiguity reduction
+ exact decision ownership
+ staged artifact production
+ proof before downstream mechanism
+ independent challenge
+ operator ratification
+ smallest-authority reopen
+ execution only after readiness
```

If the quality depends on an unrecoverable hidden prompt, the design has failed. The method must survive model/provider replacement.

---

## 2. The core compilation model

The harness treats software creation as progressive compilation of intent:

```text
human intent
→ Product meaning
→ owners / trust / authority
→ operations / Permissions / scopes
→ executable wire
→ interaction / frontend realization
→ Project Paved Road + runtime/persistence realization
→ whole-system golden flows
→ implementation graph
→ constrained agent execution
→ independent verification
→ Evidence
→ Release
```

Every stage reduces ambiguity. A downstream actor may not silently invent an upstream semantic decision.

```text
missing required authority
→ STOP
→ identify smallest owning stage/decision
→ reopen only that authority
→ recompile affected downstream artifacts
```

This is deliberately different from a giant prompt that asks one model to design and build the system in one pass.

---

## 3. Four conceptual layers

Working names only until Product admission:

### 3.1 Engineering Method

Answers:

> **How should Conexus reason?**

Current parent authority remains the DevelopmentConexus Engineering Method: evidence-first, root cause, Global Maximum, YAGNI, mechanism != authority, falsifiable proof, adversarial review, bounded reopen.

### 3.2 Blueprint Harness

Answers:

> **How does Conexus turn an idea or material Change into sufficiently exact software authority before code?**

It owns planning orchestration mechanics, context compilation, research routing, stage artifact production, independent challenge and operator gates. It owns no business semantic meaning itself.

### 3.3 Project Paved Road

Answers:

> **Which repeated technical decisions and invariants are already materialized so coding agents do not reinvent them?**

It includes the versioned scaffold, generated contracts, platform-controlled SDK/contracts, security/default mechanics, verification gates and bounded escape hatch.

### 3.4 Forge / Execution Harness

Answers:

> **How does an admitted implementation graph become verified code and immutable Release output?**

Current accepted Builder, Change, Plan, CodingSession, WorkUnit, ActorRun, Git custody, independent verification and Release architecture provide the starting authority. `Forge` remains a working name only.

---

## 4. Blueprint Harness control loop

The smallest useful planning control loop is:

```text
1. establish current task + authority root
2. compile bounded context pack
3. state decision question / protected property
4. identify known / inferred / unknown / deferred
5. research only material unknowns
6. propose smallest coherent candidate
7. test candidate against accepted authority + negative cases
8. produce/update canonical artifact
9. independent challenge when material
10. Lead adjudication
11. operator decision when authority changes or gate closes
12. advance one stage OR reopen smallest implicated authority
```

The harness must expose progress and findings to the operator without depending on disclosure of private model chain-of-thought.

Useful user-visible progress is:

```text
what is being established
what evidence changed the candidate
what material contradiction was found
what remains unresolved
what exact artifact/gate is current
```

Private scratch reasoning is never an authority artifact.

---

## 5. Authority Router

Every fresh planning/execution actor begins from a bounded route, not recursive repository ingestion.

Baseline pattern learned from the current repositories:

```text
AGENTS.md
→ docs/index.md
→ docs/roadmap.md
→ 1–2 task-specific owning authorities
→ additional Evidence only when the concrete question requires it
```

The harness must mechanically distinguish:

```text
CURRENT AUTHORITY
SUPPORTING REFERENCE
EVIDENCE
RESEARCH
HISTORICAL PROVENANCE
TEMPORARY REVIEW / WORK
```

A reviewer comment, web search result, framework document, old PR or model response cannot outrank current accepted Product/architecture authority merely because it is recent or detailed.

The context compiler should prefer **minimal sufficient context** over maximum context.

---

## 6. Context Compiler

For each bounded task the Hub compiles an exact context manifest, conceptually:

```text
ContextManifest
  task / stage / Change identity
  exact ProjectBaselineDigest where applicable
  current roadmap/gate identity
  exact owning authority refs/digests
  exact accepted decision refs required by the task
  current unknown/falsifier set
  relevant evidence refs
  permitted tool/capability set
  output contract
  stop/reopen conditions
```

The model receives the rendered content needed to reason, but the manifest identity is Hub-owned.

Rules:

- no implicit `latest` authority;
- no whole-repository dump by default;
- prior conversation prose is context, not authority;
- exact accepted artifacts outrank narrative recollection;
- stale context cannot silently survive a material rebind;
- coding/review actors receive different context packs when independence requires it.

Mastra `RequestContext` may carry correlation/configuration/reference data for a run, but current Conexus authority must be re-read/resolved through owners. RequestContext never becomes the authoritative ContextManifest by persistence accident.

---

## 7. Research Harness

Research is a first-class bounded activity, not ad hoc browsing.

### 7.1 Source ladder

For a material technical claim, prefer:

```text
1. current repository authority / executable current facts
2. normative standard/specification
3. exact official documentation for the selected/current version
4. exact official source/release/security advisory
5. mature implementation / first-party example
6. production research / high-quality independent evidence
7. community discussion for discovery only
```

Sibling projects and Mitra are references, never authority for Conexus.

### 7.2 Claim states

Every material unresolved claim should be classifiable as:

```text
KNOWN
INFERRED
UNKNOWN
DEFERRED
```

A decision must not silently promote `INFERRED` into `KNOWN`.

### 7.3 Technology disposition

Material technology/mechanism decisions use:

```text
ADOPT | ADAPT | BUILD | DEFER | STOP
```

A custom `BUILD` requires:

- exact gap not solved by current standard/library/platform capability;
- named defect/property being protected;
- smallest custom surface;
- owner/lifecycle;
- replacement/removal condition;
- negative proof.

### 7.4 Freshness

Time-sensitive claims such as framework APIs, exact releases, security advisories, dependency support, model/provider behavior and platform limits require current verification at the stage where they become deciding.

Context7 may accelerate retrieval for libraries such as Mastra, but exact deciding claims remain grounded in current official docs/source and bounded Evidence.

---

## 8. Artifact compiler

The harness must create durable artifacts rather than leaving key decisions trapped in chat.

Depending on project/stage, canonical artifacts can include:

```text
Product contract / journeys
semantic-owner and boundary authority
identity / principal / Permission contract
persistence/data ownership contract
integration/effect authority
Product operation ledger
canonical executable wire / OpenAPI
frontend interaction map
low-fidelity wireframe proof
Project Paved Road contract
runtime / persistence / deployment contract
golden-flow and negative-flow inventory
implementation execution graph
Evidence / qualification records
Decision amendments / reopen triggers
```

Artifact names are repository/profile decisions. The required property is one canonical home per meaning, not one universal directory layout.

The roadmap is the sole mutable program/gate authority in repositories that adopt the current Repository Standard profile.

---

## 9. Planning stage protocol

The exact stage graph is compiled from Product/profile needs rather than copied blindly from one repository, but the current strongest default for a new substantial software product is:

```text
Product / system definition
→ semantic boundaries / owners
→ identity / authority / data / integrations
→ complete Product operation surface
→ executable wire
→ frontend interaction realization
→ Project Paved Road + runtime/persistence realization
→ whole-system coherence + golden flows
→ transition/cutover when a real current system exists
→ implementation graph
→ adversarial implementation-readiness
```

A lightweight/bounded Change may consume already-accepted upstream authority instead of replaying project inception.

Current `PlanningDepth = DIRECT | LIGHT | FULL` and `RigorProfile = FAST | BOUNDED | CONTROLLED` remain independent accepted axes. The harness should use accepted current floors and risk to determine how much explicit ceremony/proof is required; the model may not downgrade those gates by convenience.

---

## 10. Independent challenge protocol

Material review uses role separation rather than provider names:

```text
LEAD / AUTHOR
!=
INDEPENDENT CHALLENGER
!=
MATERIAL VERIFIER where execution evidence is required
```

The same model family may be usable for low-risk work if independence is still real, but the harness should be able to select a different model/provider for material challenge. Exact policy belongs to later qualification/evaluation.

### 10.1 Review branch property

Current repository pattern remains strong:

```text
candidate branch exact HEAD
→ isolated review/<gate>-fable style branch
→ only bounded temporary review artifact differs
→ reviewer sees exact candidate
→ review output = Evidence
→ Lead adjudicates
→ accepted corrections land on candidate
→ review branch never merges
```

### 10.2 Reviewer is not authority

The challenger may find:

```text
missing invariant
contradiction
unfalsifiable claim
scope excess
speculative mechanism
security gap
owner ambiguity
consumer without capability
capability without consumer
```

It cannot create Product requirements by assertion. Every finding is adjudicated against current authority and Evidence.

### 10.3 Second review round

A second round is justified when material corrections changed the reviewed property enough that the prior challenge no longer covers it. It is not ritual.

---

## 11. Operator relationship

The harness is not fully autonomous governance.

The operator remains the explicit authority for material Product/architecture acceptance, stage ratification, merge when repository law requires it, and final Product execution grant.

The harness should minimize unnecessary questions by using current context and Evidence, but it must surface genuine Product choices rather than bury them in implementation.

Good operator interaction is:

```text
system derives what can be derived
→ presents exact decision / trade-off when human judgment is required
→ records decision in canonical authority
→ continues from the new exact authority
```

---

## 12. Project Paved Road contract

The current accepted frontend architecture already requires a versioned deterministic scaffold that is **infrastructure-rich / Product-feature-poor**.

The Phase-4 target should generalize that property across the Project software surface.

### 12.1 Ownership classes

Preserve the accepted conceptual classification:

```text
GENERATED
→ reproducible; agent does not hand-own divergent semantics

PLATFORM-CONTRACT
→ app-visible seam controlled by Conexus; agent consumes but cannot silently weaken invariant

APP-OWNED
→ Project-specific Product/business source the Builder may legitimately evolve
```

### 12.2 Scaffold

A software Project should start from an exact versioned scaffold/profile rather than an empty repository plus model taste.

The scaffold should materialize only proven repeated infrastructure and seams, not speculative Product features.

### 12.3 Backend Paved Road

Candidate property classes to realize only after 4A–4C expose exact needs:

```text
canonical generated wire binding
request/current-authority context
session/auth integration
scope/containment resolution seams
Problem/error mapping
ETag / conditional request mechanics
idempotency mechanics
structured configuration
trace/log correlation
Gateway/platform capability client seams
verification hooks
```

This list is a design inventory, not preselection of package APIs.

### 12.4 Frontend Paved Road

Candidate property classes:

```text
generated Product transport
same-origin session/credential mechanics
Problem decoding
ETag/idempotency carriage where admitted
TanStack query-key and invalidation conventions
honest loading/empty/unknown/partial/stale patterns
security/CSP defaults
browser test harness
```

The frontend SDK must not become a second Product/business authority.

### 12.5 Data / Persistence Kit

Prefer a bounded persistence kit over a universal ORM/repository abstraction.

Candidate responsibilities:

```text
owner/schema boundaries
migration lifecycle
transaction primitives required by accepted invariants
connection/capability acquisition
constraint/index conventions tied to real properties
test database fixtures
migration/schema-drift verification
read-model patterns where current architecture requires them
```

Avoid speculative `GenericRepository<T>`/universal entity abstractions.

### 12.6 Integration / Gateway Kit

Project code should consume governed capability seams rather than receive raw Connection credentials or arbitrary target selection.

Generated/app-facing clients remain bounded by exact Project/Release/binding authority.

### 12.7 Verification Kit

The Paved Road includes executable gates, not only helper libraries.

Applicable checks may include:

```text
format / type / lint
unit
integration
wire/codegen drift
owner/boundary guards
authorization isolation
migration/schema drift
security/supply-chain
negative controls
golden-flow assertions
source/read-model reconciliation
```

A check is admitted because it protects an accepted property, not to maximize test count.

### 12.8 Escape hatch

A real Project may require leaving the Paved Road.

The escape hatch must:

```text
name the unmet property/consumer
show why current paved mechanism is insufficient
preserve non-degradable platform/security contracts
update Project Baseline when material
add the smallest required mechanism
add proof/reopen/removal conditions
```

Escape is explicit architecture, never silent SDK bypass.

---

## 13. Proposed Phase-4 placement

The Paved Road must be exact **before** 4F creates the implementation graph.

4D should therefore own four bounded closures:

```text
4D-A — Project Scaffold & Ownership Contract
4D-B — Backend / Frontend / Data / Integration / Verification Paved-Road Contract
4D-C — Exact Runtime / Persistence / Dependency / Deployment Selection
4D-D — Paved-Road Conformance, Versioning, Escape-Hatch & Evaluation Contract
```

4D receives protected properties from 4A Product semantics, 4B wire and 4C frontend interactions. It may not invent SDK features first and search for consumers later.

4F must bind every implementation slice to an exact admitted scaffold/Paved-Road version or an explicit approved escape-hatch decision.

---

## 14. Mastra realization mapping — conceptual only

Mastra remains an execution mechanism, never Blueprint/Product authority.

The current accepted mapping supports the following future realization direction:

### 14.1 Hub-owned planning state

Hub owns:

```text
current stage/gate
accepted artifact identities
operator decisions
current Plan/checklist
Findings and Evidence admission
reopen state
exact context-manifest identity
```

Mastra runtime records, thread state, Workflow snapshots or RequestContext never decide these facts.

### 14.2 Cognitive roles

Mastra can provide runtime mechanics for bounded roles such as:

```text
Planning Lead
Independent Challenger
Research/analysis turn under Lead control
Material Verifier during execution
```

Do not create a fleet of specialist Agents without a measured need. Role separation is a protected property; agent count is a mechanism.

### 14.3 Conversation continuity

A planning session may use a persistent cognitive thread where continuity materially helps, but canonical knowledge lives in accepted artifacts/Hub facts.

Model memory may summarize; it may not silently become Product/architecture authority.

### 14.4 Tool surface

Planning/coding agents receive explicit Conexus-governed capabilities such as:

```text
read exact repository authority
Git/PR candidate operations within admission
web/official-doc research
Context7 retrieval
current source/version inspection
test/verification execution
bounded artifact authoring
review Evidence submission
```

Tool authorization is server-derived. Prompt text cannot widen it.

### 14.5 Workflows

Do **not** model the whole engineering method as one giant Mastra Workflow merely for visual symmetry.

Hub owns the stage graph and decision state. Mastra Workflow is appropriate only for a real deterministic/mechanical subflow whose checkpoint/restart semantics are proven useful, for example a bounded qualification sequence or reproducible proof packaging.

### 14.6 Approval/suspension

Mastra suspension/approval mechanics may help pause cognition/execution, but operator ratification and owner-specific approval remain Conexus authority. Framework resume does not prove current permission or current candidate validity.

### 14.7 Exact version/API selection

No new Mastra package/API pin is selected by this design input. When a Phase-4 property requires implementation, revalidate current Context7 docs, official Mastra docs/source/releases/security and affected qualification triggers before admission.

---

## 15. Learning corpus from current repositories

Marketplace Central, MetalDocs and Conexus OS should be treated as **retrospective engineering/evaluation corpus**, not templates to copy.

Useful extracted strengths include:

### Marketplace Central

```text
complete Product operation/Permission census
canonical executable OAD before frontend
frontend as API/authority falsifier
operation ↔ UX coverage
low-fidelity wireframe proof
no screen-shaped API repair
```

### MetalDocs

```text
exact wire before frontend
complete operation-consumer closure
runtime only after wire/frontend consumers
whole-system coherence
golden flows
transition/cutover as explicit stage when relevant
implementation graph
final adversarial readiness
```

### Conexus OS

```text
semantic owners / trust boundaries
mechanism != authority
technology qualification
proof routing / falsifiers
review Evidence isolation
smallest-authority reopen
recovery/current-authority discipline
Builder / runtime separation
```

The organization-level protocol should synthesize these properties and be validated on new projects rather than copying each repository's stage names or document shapes.

---

## 16. Blueprint Harness evaluation

To avoid declaring the planning harness good because its prose looks sophisticated, Conexus needs a planning-quality eval.

The first benchmark corpus can replay bounded historical decision problems from the three current repositories.

Candidate measurable failure classes:

```text
invented Product operation without authority
accepted interaction with no operation/capability home
duplicate semantic owner
Permission invented from UI convenience
provider mechanism promoted to Product meaning
screen-shaped API introduced to close UX gap
runtime/dependency selected before consumer/property
historical/research evidence promoted over current repository authority
unknown collapsed into fact
reviewer finding treated as automatic requirement
material negative path missing
stage closed with unresolved material contradiction
implementation graph contains work unsupported by accepted contracts
```

Useful outcome metrics are property-based, not aesthetic scores:

```text
material authority violations = 0
unresolved contract gaps at final readiness = 0
invented unsupported operations = 0
known material falsifiers with no proof route = 0
silent downstream repair of upstream contract = 0
exact-source/citation coverage for deciding research = complete where required
```

Quality can additionally compare operator corrections/reopens required versus prior harness versions, but the benchmark must not reward document volume.

---

## 17. Non-goals

This design does not authorize:

- a new Product owner named Blueprint, Forge, Workflow or PlanningEngine;
- one giant deterministic workflow for all projects;
- a universal fixed stage sequence for every Change;
- hidden model memory as canonical knowledge;
- provider-specific Product semantics;
- SDK/package APIs before 4D has exact consumers/properties;
- a generic ORM/repository framework;
- replacing operator ratification with model consensus;
- Product implementation while Phase 4 is open.

---

## 18. Acceptance path for this design input

This document is an input, not a stage ratification.

The safe progression is:

```text
4A
→ decide whether/how planning/execution modes become admitted Product capability/vocabulary

4B/4C
→ expose exact wire and human interaction requirements the harness must support

4D
→ ratify concrete Paved Road, scaffold, SDKs, runtime and Mastra realization

4E
→ prove the composed planning→execution handoff and golden flows

4F
→ bind exact Paved-Road versions into R1–R7 implementation graph

4G
→ independently attack the complete readiness system
```

The desired end state is simple to state:

> **The coding agent should spend its degrees of freedom on Project-specific Product logic, not on repeatedly deciding foundational engineering, security, transport, persistence and verification conventions that Conexus can correctly precompile.**

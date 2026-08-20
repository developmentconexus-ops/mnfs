# 3K ChatGPT Dialogue — Product Model, Navigation & Golden Path

**Status:** NON-AUTHORITATIVE DIALOGUE / REVIEW INPUT  
**Phase:** 3K — Frontend / Product Architecture  
**Package:** A — Product Model, Navigation & Golden Path  
**Authority base reviewed:** PR #40 branch `agent/conexus-phase-3-system-design` at `a0634ffa1c88184e8f82e3ff518b30bb550965bf`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Important:** this file does not create `3K-01`, does not alter `LEDGER.md`, does not reopen 3B–3J, does not constitute C-018 and does not authorize product implementation, merge or PR readiness.

---

## 1. Scope

This package resolves one coherent product question:

> **What model does the user see, and how does the user move from intent to a real usable product without having to understand Conexus internal architecture?**

It owns only product-model/navigation/journey decisions needed before implementation.

It does **not** own:

- exact approval/risk/evidence/status presentation — Package B;
- first vertical scope or Sankhya live-read vs mirror/sync — Package C;
- pixel design, final copy, component tree, breakpoints, CSS or design-system realization — post-C-018 Realization Planning;
- runtime/framework behavior — 3L;
- structural recovery semantics — 3M;
- global verification — 3N;
- vertical proof criteria — 3O.

Authority anchors include C-001/C-003, C-012..C-017, 3A-R6, 3A-R7 and closed 3B–3J, especially 3B-14/15, 3C-02/03/04/05/07/09/10/11/15, 3F-04, 3G-R1, 3H-R1 and 3I-05.

---

## 2. Root cause

Two superficially attractive product shapes are structurally wrong for Conexus.

### Failure A — module-console product

```text
sidebar
├── Builder
├── Registry
├── Gateway
├── Runtime
├── Observability
├── Release
└── ...
```

This leaks implementation/module architecture into the product. It makes robust internals become user ceremony and encourages coding actors to mirror backend boundaries in navigation.

### Failure B — prompt-only magic box

```text
one chat
→ everything else hidden
```

This preserves directness but hides durable product truths that users must be able to inspect and govern: Workspace Brain, Connections, Project intent/bindings, product versions, Product Agents and the distinction between Control Plane, Preview and published use.

### Root cause

> **The product needs a user-centered journey abstraction that hides implementation machinery without hiding durable resources, authority boundaries or real product state.**

---

## 3. Target invariants

### P1 — Journey first, modules never become the IA by default

Navigation follows user intent and durable product concepts, not the 3C module graph.

### P2 — Workspace is the organizational shell

The Workspace is the user's company/tenant context. It visibly owns reusable organizational resources such as Brain and Workspace-scoped Connections while Projects remain independent software units.

### P3 — Project is the software/product working context

A Project is where the user creates/evolves a product. Project-scoped navigation may group capabilities for comprehension, but a UI grouping never becomes a new domain owner or durable aggregate.

### P4 — Build is the Golden Path center

For creating/evolving software, the normal user journey is one continuous Conexus-assisted build experience:

```text
intent
→ understanding/discovery
→ baseline/change checkpoint
→ build
→ comprehensible progress
→ preview
→ verification readiness
→ publish
→ use
```

Package B decides exact truth/risk presentation inside the checkpoints.

### P5 — Contextual first, dedicated administration second

Brain and Connections are invoked contextually from the build journey when needed, but also have dedicated Workspace-level administration surfaces because they are reusable durable resources with their own lifecycle.

### P6 — Production use is not Control Plane use

Control Plane, PREVIEW and PUBLISHED_APP remain visibly distinct user contexts over the same Account. A convenient navigation transition never implies authority inheritance.

### P7 — Internal machinery is progressive disclosure

`WorkUnit`, `ActorRun`, `RigorProfile`, digests, CAS generations, Mastra sessions/threads and E2B identities are not primary navigation/product concepts.

They may appear in diagnostic/detail views when useful, but the Golden Path must not require them.

### P8 — Hide complexity != hide truth

This package may simplify vocabulary/placement, but it may not merge or conceal material truth. Package B owns the exact never-hide contract.

---

## 4. Alternatives

### Alternative A — Journey-first shell + contextual resources + dedicated resource administration

**Candidate adopted for challenge.**

Shape:

```text
Account
→ Workspace
   ├── Projects                  # primary work entry
   ├── Brain                     # shared organizational knowledge
   ├── Connections               # shared/project external resources
   └── administration/access     # exact trust surfaces in Package B

Project
   ├── Build                     # default creation/evolution journey
   ├── Product                   # user-facing composition: app/agents/context
   ├── Versions / Publish        # releases, active version, production entry
   └── access/admin              # exact trust surfaces in Package B

Published product surface
→ distinct use context
```

The names above are semantic labels, not final copy or route names.

### Alternative B — Backend/module-oriented control console

**REJECT F1.**

It exposes accidental complexity, creates navigation coupled to module decomposition and would make future module refactors product migrations.

### Alternative C — Single chat/prompt canvas with no first-class durable resource surfaces

**REJECT as complete product architecture.**

A prompt-first build surface is valuable and is preserved inside Alternative A, but using it as the entire product would make Brain/Connections/versioning/agents/authority difficult to inspect, govern and reuse.

### Alternative D — Separate mini-products for Factory, Application Platform and Agents

**REJECT.**

C-001 and the closed architecture define one platform and one factory. Separate portals would recreate two factories/products by presentation even if they shared backend code.

---

## 5. Workspace product model

### 5.1 Entry

After central Account authentication, the Control Plane resolves accessible Workspace context server-side.

Normal entry:

```text
Account
→ choose/resume authorized Workspace
→ Workspace product shell
```

Workspace creation is available only to currently authorized principals. Creating a Workspace does not require creating Brain content, a Connection or a Project immediately.

An empty Workspace is valid.

### 5.2 Primary Workspace surfaces

#### Projects — primary

Projects are the primary working entry because they are the independent software/product units.

The Workspace default view should make it cheap to:

```text
resume current Project
create Project
understand which products exist
```

It does not need a generic analytics dashboard before there is a real consumer.

#### Brain — first-class Workspace surface

Brain must be visibly above Projects because this is the P1 strategic distinction of Conexus.

The dedicated Brain surface must be capable, at product-architecture level, of making these truths understandable:

```text
published organizational knowledge exists independently of a Project
machine may propose knowledge
human publishes organizational truth
published revision != automatically adopted by a Project
provenance/health matter when relevant
```

The surface may organize content by business domain/namespace, but 3K does not define a full Brain IDE.

A future second real Project should be able to adopt the already-published Brain without any architectural change. No synthetic second Project is created to demonstrate this.

#### Connections — first-class Workspace surface

Connections have a dedicated surface because they are real external resources with identity, credential lifecycle, revisions, qualification and health.

The product should allow users to understand at least:

```text
what real system/account/environment is connected
whether the Connection is WORKSPACE or PROJECT owned
whether it has been qualified
whether current health blocks a use
which Projects currently choose to bind it when that information is useful
```

Credential material never appears in chat. Secret entry uses the dedicated write-only administration journey already required by security authority.

#### Access / organization administration

The Workspace needs a place for organization/access management because Workspace memberships/Areas/grants exist in F1, but exact access-management information architecture and truth presentation are Package B.

No generic enterprise administration portal is introduced here.

### 5.3 What does not become Workspace top-level navigation in F1

```text
Product Agents fleet
Jobs
Artifacts
ActorRuns
WorkUnits
Findings
Runtime instances
Sandboxes
Deployments
Observability backends
Registry
Gateway
```

These are project-scoped capabilities, internal mechanics or diagnostic concepts. A later aggregate surface needs a named consumer.

---

## 6. Project product model

### 6.1 Project creation

`Create Project` creates the Project container and immediately enters Inception/Discovery.

The user is **not** forced through a technical wizard asking upfront for stack, runtime, orchestration, database shape or other choices already owned by the platform/architecture.

The first interaction is product intent.

```text
New Project
→ “What do you want to build / change in the business?”
→ Conexus-assisted Inception
```

### 6.2 Project-level presentation planes

The minimum stable product grouping is:

#### A. Build — primary/default

Owns the normal user experience of understanding and evolving software.

It presents one contextual **Conexus build conversation/assistance surface** rather than forcing the user to choose between “Platform Consultant”, “Builder agent”, “planner” or runtime personalities.

The runtime/role may change internally; the user is interacting with Conexus under the current Workspace/Project authority.

Build is where these journeys occur:

```text
Inception
Project Baseline review entry
Change intent
planning when applicable
build progress
preview/review
verification readiness
```

Detailed approval/truth/status rules belong to Package B.

#### B. Product — what this Project actually contains

This is a presentation grouping, not a new domain aggregate.

It makes the Project's actual product composition legible at user level, for example when present:

```text
MANAGED application surface
Product Agents
current Brain adoption/binding summary
current Connection binding summary
other first-class product capabilities that have a real consumer
```

A capability does not earn permanent navigation merely because its artifact kind exists.

`job/v1`/Automations do not become a permanent product section unless Package C or another real consumer triggers them.

#### C. Versions / Publish — product history and active production entry

Users need a stable place to understand versions/releases and the currently active product.

The normal Golden Path still exposes one simple material action such as `Publish`; the user is not forced to perform separate ceremonies merely because Release and Promotion are distinct internally.

The deeper surface may expose:

```text
available product versions
which version is active
publish history
rollback entry when eligible
Open app / production entry
```

Package B defines exact publish/rollback trust presentation.

#### D. Access / administration

Project Control access and Published App access remain separate authority domains. Their management surfaces are required, but detailed presentation is Package B.

### 6.3 No new `Product` owner

`Product` above is only a UI grouping.

It does not create:

```text
ProductModule
ProductAggregate
ProductSurface record
AppRegistry parallel to Project/Release
```

Project, Release, PAR, Brain, Connections and MAR retain their closed owners.

---

## 7. Golden Path — new Project

### Step 1 — select/create Workspace

User enters the authorized Workspace context.

### Step 2 — create Project from intent

A Project container is created. The Build surface opens immediately.

### Step 3 — Inception inside one continuous Build experience

Conexus asks only what is useful to understand the product/problem.

It may:

- clarify users/outcome/constraints;
- inspect existing code for brownfield;
- perform governed data discovery when applicable;
- use Workspace Brain context that is explicitly admitted;
- identify that a Connection or Brain decision is missing.

The user should not need to know which internal actor/runtime performs each step.

### Step 4 — resolve resources contextually

If a required external system is not configured/bound:

```text
Build journey
→ contextual action: choose/create/test Connection
→ dedicated Connections flow
→ return to the same Project journey
```

If organizational knowledge is missing:

```text
Build journey
→ Conexus may propose Brain knowledge
→ human reviews/publishes in the Brain governance surface
→ Project explicitly adopts/binds the approved revision
→ return to the same Project journey
```

The resource surfaces remain independently reachable later for administration.

### Step 5 — Project Baseline checkpoint

Conexus presents a user-level statement equivalent to:

> **This is what Conexus understands we are building.**

The underlying object is the Project Baseline authority. The Golden Path does not require the user to read Git commits/digests/runtime objects.

The summary must be able to reveal relevant scope, constraints, bound organizational context and known assumptions. Package B defines the exact trust/approval contract.

### Step 6 — initial Change(s)

After Baseline approval, construction proceeds through Change authority.

The user may see `Change` as the meaningful evolution unit/history, but `WorkUnit`/`ActorRun` remain advanced/internal by default.

Minimal execution remains possible:

```text
one user intent
→ one Change
→ minimal sufficient execution
```

No ceremony is created merely to visualize backend machinery.

### Step 7 — build progress

The same Build context shows comprehensible progress and allows the user to continue interacting with Conexus.

A live plan/checklist can be shown at user-relevant abstraction, but Package B determines honest status/proof rules.

### Step 8 — Preview

Preview belongs in the Build/review journey, associated with the exact candidate being reviewed.

Conceptually:

```text
Build candidate
→ Preview
→ user review
```

Preview is visibly not production. It does not inherit Published App membership/data authority merely for convenience.

Exact split-pane/modal/new-tab layout is Realization Planning.

### Step 9 — Publish

When the candidate is eligible, a clear material action starts the Promotion journey.

The user should think:

```text
“publish this verified version”
```

not:

```text
“create ReleaseManifest → approve PromotionRecord → CAS generation …”
```

Package B defines what material truth must be shown before the action.

### Step 10 — real use

After successful serving verification, the Project shows a clear entry to the active published product.

`Open app` or equivalent is a transition into **PUBLISHED_APP**, not an extension of Control Plane authority.

---

## 8. Golden Path — later Change

The maintenance loop stays direct:

```text
open Project
→ Build
→ tell Conexus what should change
→ Conexus understands/scopes
→ proportional checkpoint
→ build
→ preview/proof
→ publish
```

A user should not create Work Units, choose validators, choose RigorProfile or operate an orchestration graph manually.

Past Changes and Versions remain inspectable as product history.

This preserves Mitra-like directness while retaining stronger Conexus authority/proof underneath.

---

## 9. Brain in the Golden Path

Brain has two complementary product faces.

### Dedicated Workspace governance face

For curating/publishing organizational knowledge and reviewing proposals.

### Contextual Project consumption face

Inside a Project, the user sees the Brain as **organizational context this Project has explicitly adopted**, not as a copy of knowledge inside the Project.

The Project surface may present simple language such as:

```text
Company knowledge: Metal Nobre Brain
Update available
Health issue affecting “margin”
```

while digests/revision IDs are progressive detail.

Critical product laws:

```text
Brain published != Project adopted
Brain updated != active app changed
Brain health issue != Git knowledge silently rewritten
Project-local refinement/override != Workspace truth silently changed
```

---

## 10. Connections in the Golden Path

Connection authoring/binding follows 3F-04's product-experience requirement: Git-first/immutable/CAS machinery remains invisible during normal use.

The user experiences explicit choices such as:

```text
ERP for Preview: Sankhya Homologação
ERP for Production: Sankhya Produção
```

not:

```text
ConnectionRevision cr_…
expectedCurrentBindingRef …
source commit …
```

Exact revision/provenance remains available in detail/audit views.

No fallback/inheritance is implied by the UI:

```text
PREVIEW missing -X-> silently use DEV
PROD missing    -X-> silently use PREVIEW
```

Qualification/health is visible when material but does not become a Project-owned snapshot or a new binding authority.

---

## 11. Platform Consultant surface

3A-R7 has already frozen owner/scope. 3K must not invent a global Product Agent.

Candidate surface law:

> **Platform Consultant is experienced as contextual Conexus assistance inside Inception/Build and platform-guidance moments, not as a separately managed global agent object.**

Consequences:

```text
no global “Platform Agent” page
no PLATFORM-scoped AgentDefinition
no hidden Workspace/Project
no separate PAR lifecycle
no cross-Workspace memory/authority
```

The user should not need to decide whether a question is “for the Consultant” or “for the Builder” when both are part of the same software-building journey.

Platform knowledge may be distinguished in provenance/detail when material, but it is not mixed with Workspace Brain truth.

---

## 12. Product Agents surface

Product Agents are first-class **inside a Project**.

Control Plane management must make it possible to understand, at product level:

```text
which Product Agents belong to the Project
which version/composition is active through Release
what user-facing role each agent has
whether a current product surface uses it
```

The UI does not expose Mastra Agent/Workflow/Thread storage as authority.

### Manage vs use

A material separation is preserved:

```text
Control Plane
→ define/evolve/manage Product Agent as part of Project software

PREVIEW
→ test candidate product behavior under preview authority

PUBLISHED_APP / published product surface
→ real production use under active Release and published-app authority
```

A Control Plane test conversation must never masquerade as production use.

For the first vertical, an in-app Product Agent conversation is the natural production-use surface.

A future agent-only product may reuse the same law with a dedicated published product conversation surface. It does not require a global Agent portal now.

### Triggers/memory

`SCHEDULE` administration and advanced memory do not earn permanent F1 navigation until a real first-vertical/product consumer requires them.

EVENT/notification inbox remains disabled/deferred under existing authority.

---

## 13. Published MANAGED application access

The published app is a separate product surface, even when current deployment uses the same Hub/origin mechanics internally.

Two legitimate user journeys exist:

### Control Plane user who also has app access

```text
Project / active version
→ Open app
→ PUBLISHED_APP authorization is resolved independently
```

Project authority never substitutes for app access.

### App-only user

An Account may reach the published app directly through its app URL/entry path without receiving Workspace/Project Control Plane navigation.

```text
published app URL
→ Account authentication if needed
→ PUBLISHED_APP access resolution
→ app
```

A global `My Apps` launcher is **DEFER SAFELY** until multiple app-only destinations/users create a real navigation need.

This keeps F1 direct without blocking the later SaaS experience.

---

## 14. Progressive-disclosure vocabulary

### Primary user concepts

The Golden Path may rely on:

```text
Workspace
Brain
Connection
Project
what we are building / Project Baseline concept
Change / requested change
Product / App
Product Agent
Preview
Version / Release as user product history
Publish
```

Exact copy may be simplified in realization so long as authority is not changed.

### Secondary/diagnostic concepts

Shown only when useful for trust/diagnosis/advanced operation:

```text
Finding
Evidence detail
Work Unit
ActorRun
runtime/provider identities
digests/revisions
contract revisions
ReleaseManifest internals
Promotion step details
```

### Never primary Golden Path concepts

```text
Mastra AgentController Session
Mastra thread/run IDs
E2B sandbox lifecycle
RigorProfile tuning
CAS generations
Gateway internals
Registry internals
module names
```

---

## 15. Explicit boundaries with Package B

Package A decides **where the user encounters the decision/truth**.

Package B decides **what truth the surface must show and how it avoids misleading the user**.

Examples:

```text
Baseline checkpoint exists in Build                 → A
exact approval subject / known limitations          → B

progress lives in Build                             → A
honest mapping of states/evidence                    → B

Publish is Golden Path action                       → A
permission/dependency/migration diff presentation   → B

Versions surface exists                             → A
AVAILABLE vs ACTIVE vs SERVED_VERIFIED semantics    → B

Access admin surfaces exist                         → A
roles/surface separation/diff truth                 → B
```

No duplicate decision should be created across packages.

---

## 16. DEFER SAFELY

```text
pixel-perfect Control Plane design
final navigation labels/icons/routes
responsive/layout details
complete design system work
workspace analytics dashboard
home widgets with no current decision consumer
global My Apps launcher
cross-Project Product Agent fleet/operations view
generic artifact explorer
Jobs/Automations permanent navigation until a real job exists
SCHEDULE admin depth until a Product Agent consumes it
advanced Agent Memory UI
notification center
EVENT/Signal/Inbox UI
public/embed journeys
DEDICATED deployment/operator portal
multi-install/fleet UX
marketplace/template gallery
self-signup/billing/SaaS onboarding
cross-Project Brain reuse demo before the second real Project
```

Triggers remain the named consumers/authority triggers already defined by prior decisions.

---

## 17. REJECT F1

```text
module graph as sidebar
separate Factory product/portal
separate Agent Platform product/portal
global Product Agent object/agent fleet as primary shell
Mission/Milestone orchestration board
manual WorkUnit/ActorRun graph editor
workflow designer
user-facing RigorProfile tuning
Platform Consultant as global persistent Product Agent
hidden Workspace/Project for platform assistance
automatic Brain inheritance in Projects
implicit Connection inheritance/fallback
Control Plane access implying app access
Preview using production authority by convenience
production app embedded inside Control Plane as the same authority surface
fake second Project only to demonstrate Brain reuse
permanent Jobs/Events UI without consumer
```

---

## 18. Proof strategy before implementation

This package should be falsified at architecture maturity using four role/journey walkthroughs.

### W1 — first builder/operator vertical

```text
Account
→ Workspace
→ create Project
→ Inception
→ resolve Brain/Connection context
→ Baseline
→ Change/build
→ Preview
→ Publish
→ Open real app
```

Pass criteria:

- no required internal runtime/module concept in the normal journey;
- no silent binding/adoption;
- no missing authority surface;
- no second factory/product created by presentation.

### W2 — Project contributor without production-app access

Must be able to:

```text
enter Control Plane
work on Project
review Preview if authorized
```

and must **not** gain production app access merely because of Project access.

### W3 — app-only user

Must be able to:

```text
reach published app directly
use it under PUBLISHED_APP authorization
```

without being shown source, Changes, Brain admin, Connections admin, Releases or other Control Plane surfaces.

### W4 — Workspace resource change

Update/publish Brain or update/qualify a Connection.

Pass criteria:

```text
resource current state may change
-X-> active Release silently changes composition
-X-> Project binding silently changes
-X-> production app authority silently broadens
```

### Structural deletion tests

Delete the dedicated Brain surface:
→ organizational reuse/publication becomes hidden inside Projects — fails P1/P5.

Delete the dedicated Connections surface:
→ credential/qualification/resource lifecycle becomes chat-local or Project-local — fails P5.

Delete Build as coherent journey:
→ user must manually stitch Inception/Change/Plan/Preview machinery — fails directness.

Merge Published App into Control Plane authority:
→ violates closed authorization/trust boundaries.

Expose every internal record as primary navigation:
→ preserves backend implementation instead of product intent — accidental complexity.

---

## 19. Adversarial checks

The challenger should especially attack these assumptions:

1. Does `Product` presentation grouping accidentally create a hidden new owner/aggregate?
2. Is Workspace-level Brain sufficiently prominent to preserve C-001 P1, or does the Build-centric experience still make knowledge feel Project-local?
3. Does contextual resource resolution accidentally imply auto-binding/auto-adoption?
4. Does one unified Build conversation improperly merge Project Inception authority with Builder authority, or can the same UI present distinct owner decisions safely?
5. Is `Versions / Publish` too much ceremony, or is it the minimum durable surface required by Release history/rollback/current product truth?
6. Does project-scoped Product Agent management satisfy AGT-2 without reconstructing a global agent fleet?
7. Is app-only direct entry sufficient for first production, or is a global launcher a material F1 requirement?
8. Is there any 3A-R6 §8 product surface omitted by this package that cannot safely wait for Package B/C?
9. Does any proposal here silently require a new durable record/module/contract?
10. Does any product choice contradict C-012 frontend/scaffold authority or the three authorization surfaces of 3B/3C/3I?

---

## 20. Reopen triggers

Reopen this package only on material evidence such as:

- a second real Project proves the Workspace Brain/Connection navigation cannot support reuse without a new product boundary;
- a real agent-only Project requires a production-use surface that cannot fit the manage/preview/published-use separation;
- a real multi-app Project requires a new product-surface model rather than a reversible UI grouping;
- first DEDICATED product requires a different user journey/operational boundary;
- first public/embed consumer changes browser/user journey authority;
- multiple app-only user destinations make direct URL entry materially insufficient;
- a named job/automation consumer requires a first-class product surface;
- implementation evidence shows progressive disclosure hides a truth users must act on;
- realization cannot preserve the three authorization contexts without changing current authority.

Preference, visual fashion, framework conventions or competitor feature parity do not reopen the architecture.

---

## 21. Candidate outcome

For adversarial review, the current candidate is:

```text
ALTERNATIVE A = GLOBAL MAXIMUM CANDIDATE

Workspace-centered shell
+ Projects as primary work entry
+ Brain and Connections as first-class Workspace resources
+ Build-centered continuous Golden Path
+ contextual resource use with dedicated resource administration
+ Product Agents Project-scoped
+ Platform Consultant contextual inside Build/Inception
+ Versions/Publish as secondary product-history/activation surface
+ PREVIEW and PUBLISHED_APP visibly distinct from Control Plane
+ internal machinery progressively disclosed
+ no global agent/jobs/module/orchestration consoles without consumer
```

No authority is created until independent Fable challenge, technical confrontation, consolidated candidate and explicit operator approval.
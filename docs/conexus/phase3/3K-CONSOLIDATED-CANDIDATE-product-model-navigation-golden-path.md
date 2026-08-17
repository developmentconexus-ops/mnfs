# 3K Consolidated Candidate — Package A: Product Model, Navigation & Golden Path

**Status:** NON-AUTHORITATIVE CONSOLIDATED CANDIDATE  
**Phase:** 3K — Frontend / Product Architecture  
**Package:** A — Product Model, Navigation & Golden Path  
**Authority reconstructed through:** PR #40 branch `agent/conexus-phase-3-system-design` at `76ab16ffa36285b72617ab72206f01520e6b8721`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Inputs:** `3K-CHATGPT-DIALOGUE-product-model-navigation-golden-path.md` + `3K-FABLE-DIALOGUE-product-model-navigation-golden-path.md`  
**Important:** this file does not create `3K-01`, does not alter `LEDGER.md`, does not reopen 3B–3J, does not constitute C-018 and does not authorize product implementation, merge or PR readiness. It is the single Package A candidate presented for operator ratification.

---

## 1. Outcome

Package A remains structurally confirmed after independent adversarial review.

```text
preferred product structure = Workspace-centered + journey-first
module-console IA           = REJECT F1
prompt-only hidden-resource = REJECT as complete architecture
separate Factory/App/Agent portals = REJECT
Round 2                     = NOT REQUIRED
```

The review found two valid bounded coverage gaps and one material claim that does **not** survive confrontation against stronger accepted authority.

---

## 2. Finding adjudication

### F-A1 — Control Plane × Published App origin/trust-zone adjudication

**Disposition: REJECT finding as misrouted; accept wording cleanup only.**

The finding relies on `GP-6` from the non-authoritative 3K intake. Accepted authority already owns the property:

- C-015 declares the F1 browser-origin/trust baseline;
- 3I-05 explicitly places Control Plane, PREVIEW and PUBLISHED_APP browsers in the logical `Browser / Client` trust zone;
- 3I-05 states that a **new browser origin/cross-origin capability is a Decision Loop/security-contract change**, not an app/product-UI convenience;
- 3J-01 owns the first production serving/ingress shape and routes concrete host/DNS/TLS/proxy spelling to Realization Planning.

Therefore 3K Package A owns only the **user-observable separation of contexts and navigation transitions**. It does not gain authority to decide a new browser trust topology or fire a subdomain/cross-origin trigger.

Correction retained:

> Remove wording that appears to presume a concrete origin implementation. The product law is simply that Control Plane, PREVIEW and PUBLISHED_APP are visibly distinct authorization/use contexts; exact origin/routing remains under C-015/3I-05/3J-01 and Realization. Any new cross-origin capability returns to the applicable Decision Loop.

### F-A2 — Entry / first-run journey

**Disposition: ACCEPT bounded correction.**

C-015 already fixes the authentication mechanics: operator-created Account, single-use setup credential, mandatory credential change, no self-signup F1. 3A-R6 requires Workspace selection/creation and access surfaces. Package A must place this in the product journey so implementation does not invent first access.

Final journey-level rule:

```text
operator provisions Account
→ user receives single-use setup credential through the approved separate channel
→ first login requires credential replacement
→ authenticated Control Plane resolves authorized Workspace access
→ if no Workspace exists and the principal is authorized to create one, Workspace creation is offered
→ otherwise user chooses/resumes an authorized Workspace
```

No hidden/default Workspace is created merely for convenience. Account provisioning and authentication remain Identity & Access authority; 3K owns only product placement/journey.

### F-A3 — Archive / unpublish / trigger-disable UX

**Disposition: ACCEPT bounded routing correction.**

These surfaces are not unconditional F1 navigation. Package C must determine whether the first vertical actually requires any of them.

```text
first vertical requires archive/unpublish/trigger-disable user action
→ Package C identifies the named consumer/use case
→ 3K must provide the minimum journey-level surface consistent with existing owner semantics

no first-vertical consumer
→ DEFER SAFELY
→ trigger: first real consumer requiring the operation
→ owner: 3K product journey over existing domain semantics
```

No generic lifecycle console is created now.

---

## 3. Final Package A product structure

The original Package A structure is preserved with the corrections above.

### Workspace shell

```text
Account
→ Workspace
   ├── Projects
   ├── Brain
   ├── Connections
   └── access / organization administration
```

Rules:

- Workspace is the visible organizational/tenancy shell.
- Brain is a first-class Workspace resource above Projects; published knowledge never silently becomes Project-adopted knowledge.
- Connections are first-class durable external resources; credential entry stays dedicated/write-only and never travels through chat.
- Projects remain independent software/product units.
- No generic analytics/admin dashboard is required without a real consumer.

### Project shell

```text
Project
   ├── Build
   ├── Product
   ├── Versions / Publish
   └── access / administration
```

Rules:

- `Build` is the default creation/evolution journey.
- `Product` is presentation grouping only; it creates no new module, aggregate, record or authority.
- `Versions / Publish` gives stable access to product versions, active production, publish history, rollback entry when eligible and production entry.
- Project Control access and Published App access remain distinct authority contexts.

### No top-level internal machinery

The Golden Path does not make these primary navigation concepts:

```text
ActorRun
WorkUnit
RigorProfile
Registry
Gateway
runtime instance
sandbox
Mastra session/thread
CAS generation
artifact digest
```

They may appear only as progressive diagnostic/detail information when materially useful.

---

## 4. Entry and Golden Path

### 4.1 First access

Use the first-run journey in F-A2 before normal Workspace entry.

### 4.2 New Project

```text
choose/create authorized Workspace
→ Create Project
→ Build opens from product/business intent
→ Conexus-assisted Inception / Discovery
→ resolve missing Brain/Connection context through their dedicated surfaces and return
→ Project Baseline review/approval
→ initial Change(s)
→ plan/progress at user-relevant abstraction
→ Preview
→ verification readiness
→ Publish
→ SERVED_VERIFIED production entry
→ real PUBLISHED_APP use
```

### 4.3 Inception guardrail

Inception may use assistance, code inspection and governed discovery where already admitted by authority, but Package A does **not** create or require a new durable `InceptionInvestigation`/pre-Change execution lifecycle.

```text
product journey may include investigation
!= new durable execution object/owner/state machine
```

If realization evidence later proves a new pre-Change execution shape materially necessary, it returns to the applicable Decision Loop.

### 4.4 Planning/progress guardrail

C-017 remains exact:

```text
when a Change requires planning
→ the approved visual plan is pinned by revision/digest
→ dispatch follows the approved-plan law
→ the user-facing Build surface exposes the plan/checklist at an appropriate abstraction
```

Package B decides honest status/proof presentation. Package A does not weaken HAR-7/HAR-4 into an optional plan when planning is applicable.

### 4.5 Preview and production

PREVIEW and PUBLISHED_APP are visibly distinct user contexts and do not inherit one another's authorization by navigation convenience.

`Open app` is a transition to PUBLISHED_APP use, not an editable Builder/Control Plane state.

Exact browser-origin/routing mechanics are **not** a 3K decision; existing C-015/3I-05/3J-01 authority applies.

---

## 5. Platform Consultant

Preserve 3A-R7 exactly:

- one contextual Conexus assistance experience may be presented inside Build/Inception;
- Platform Consultant semantics remain Builder-owned and Control-Plane-presented;
- no global Product Agent, hidden Workspace/Project, global principal, global durable memory or independent PAR lifecycle;
- platform knowledge remains distinct from tenant Workspace Brain;
- users are not forced to choose Consultant vs Builder vs planner/runtime personalities.

The conversation carries assistance; authority-bearing actions still occur through their existing approval/resource surfaces.

---

## 6. Brain and Connections in the journey

### Brain

```text
Workspace publishes organizational knowledge
Project explicitly adopts/binds it
Brain update != Project update
Project update != active Release update
```

Use simple product language by default; revision/digest/provenance remains available in detail when material.

### Connections

Normal product choices may be simple, e.g. Preview/Production target selection, but:

```text
missing target != fallback
PREVIEW != PROD
binding != qualification
credential != chat context
```

Git/CAS/revision mechanics remain hidden from the Golden Path without hiding real target/health/provenance when material.

---

## 7. Product Agents and published use

- Product Agents remain Project-scoped and Release-pinned.
- Definition/management belongs to the Project product context.
- Preview/test use is distinct from production use.
- Production use occurs through the published product context, including an app-embedded or dedicated conversational surface when the actual product is agent-centric.
- No Workspace-global Agent fleet is created F1.
- Advanced memory UI remains deferred.
- SCHEDULE/trigger administration remains consumer-gated; no permanent automation surface is created merely because the semantic exists.

App-only users may reach the published app through its real production entry and authenticate without receiving Control Plane navigation/authority. A global `My Apps` launcher remains deferred until a real multi-app/app-only consumer makes it useful.

---

## 8. Package routing reconciliation

The earlier five-block intake is coverage input, not package authority. The approved working decomposition remains three coherent packages:

```text
Package A — Product Model, Navigation & Golden Path
→ GP placement/journeys
→ Workspace asset placement/journeys (Brain, Connections, Product Agents, Consultant)
→ progressive-disclosure law
→ first-run/entry
→ Preview/Publish/use transitions

Package B — Trust, Decision & Observable Truth
→ exact approval subject/presentation
→ permission/dependency widening
→ access-management truth across distinct contexts
→ status/evidence/findings/verifier/cost/error/timeline/known-limitations presentation
→ never-hide contract

Package C — First Vertical Composition & Data Path
→ caso 1 composition
→ live Gateway read vs mirror/sync
→ job/v1 trigger adjudication
→ no invented WRITE/effect
→ benchmark comparability
→ determines whether conditional archive/unpublish/trigger-disable surfaces have a real first-vertical consumer
```

This mapping supersedes the intake's suggested `3K-01..3K-05` decomposition as workflow shape; the intake remains non-authoritative coverage evidence. Final 3K closure must verify no material sweep item is orphaned.

---

## 9. DEFER SAFELY

```text
pixel-perfect UI / final copy / routes / component tree / design-system realization
complete Brain IDE
generic Workspace analytics dashboard
global app launcher until a real multi-app/app-only consumer
Product Agent fleet/global ops center
advanced Product Agent memory UI
Jobs/SCHEDULE/automation navigation absent a real consumer
archive/unpublish/trigger-disable absent first-vertical consumer
future fleet/customer administration
DEDICATED product UX until first real DEDICATED consumer
public/embed/mobile/i18n/notification-center surfaces absent a real consumer
deep recovery UX beyond journey pointers owned later
log/export UI detail beyond the F1 trust/timeline floor
```

Each deferred capability returns only on its named consumer/authority trigger.

---

## 10. REJECT F1

```text
backend/module graph as product sidebar
prompt-only product that hides durable resources
separate Factory / App Platform / Agent portals
global Platform Consultant/Product Agent
hidden Workspace/Project for platform assistance
Mission/Milestone/WorkUnit/ActorRun orchestration console in Golden Path
generic workflow designer
user-editable Rigor
second/universal frontend status FSM
automatic Brain or Connection inheritance/fallback
Project Control access implying Published App access
Preview presented as production
credentials through chat
top-level Registry/Gateway/Runtime/Observability surfaces
permanent Jobs/Automations surface without consumer
new Product aggregate/owner created only for UI grouping
```

---

## 11. Proof / falsification before authority

Package A is falsified if any of the following cannot be represented without changing accepted ownership/authority:

1. operator first access → authenticated Workspace entry without hidden tenant creation;
2. authorized operator creates a Project and reaches intent → Build → Preview → Publish → real app;
3. Project contributor can build/preview without automatically receiving Published App use authority;
4. app-only user can use the published app without receiving Control Plane authority;
5. Workspace resource manager can update Brain/Connection without silently changing an active Project/Release;
6. later Change repeats the same user-centered journey without exposing WorkUnit/ActorRun orchestration;
7. a future second real Project can adopt existing Workspace Brain without redesign;
8. any new cross-origin browser requirement is forced back through the existing security Decision Loop instead of being invented by 3K/implementation.

---

## 12. Reopen triggers

Reopen Package A only on material evidence such as:

- a real second Project proves Workspace-resource navigation inadequate;
- a real agent-only product cannot fit the current manage/preview/production separation;
- a real multi-app Project needs a materially different user grouping;
- first DEDICATED product journey;
- named public/embed consumer;
- real cross-Project agent operations consumer;
- multiple app-only products make a launcher materially useful;
- a user-critical task cannot be completed without surfacing internal machinery;
- a simplification would require hiding material authority/truth;
- security authority is explicitly reopened and changes browser-origin/trust topology.

---

## 13. Ratification boundary

If the operator approves this consolidated Package A:

```text
Package A = APPROVED CONCEPTUALLY
→ create authoritative 3K-01 from this candidate + accepted authority
→ update LEDGER accordingly
→ proceed to Package B independent analysis
```

Until that explicit approval, this remains non-authoritative review/consolidation input.

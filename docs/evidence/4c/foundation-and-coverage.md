# 4C — Frontend Foundation and Coverage

> **Status:** CANDIDATE EVIDENCE / 4C-0 → 4C-3
> **Authority:** evidence derived from current accepted Product/architecture authority; this document does not create Product meaning, operations, DTOs, routes, screens, authorization or implementation authority.
> **Method:** `docs/development/frontend-product-experience-planning-method.md` v2.1 through the Conexus-specific 4C contract.

This record closes the smallest pre-IA foundation required before 4C may propose navigation, screens or structural wireframes.

```text
4C-0 bounded authority recovery
→ 4C-1 actors / needs / assumptions
→ 4C-2 end-to-end human flows
→ 4C-3 frontend coverage + operation consumer/disposition census
```

No 4C-4 information architecture, 4C-5 screen inventory, 4C-8 wireframe, 4D Paved Road/runtime choice or Product implementation is performed here.

---

## 1. 4C-0 — Bounded authority recovery

The foundation uses the smallest current pack needed for the question:

| Source | Role in this foundation | Authority posture |
| --- | --- | --- |
| `docs/phases/4c-frontend-interaction-and-authority-realization.md` | Conexus 4C laws, working order and proof boundary | current 4C contract accepted by the operator for this stage |
| `docs/development/frontend-product-experience-planning-method.md` | reusable authority-to-UX planning method | methodology, not Product authority |
| `docs/product/contract.md` | accepted human actors, Product journeys and truth laws | accepted Product authority |
| `docs/product/operation-ledger.md` | exact concrete operation census, principals, ingress, owners and authority matrix | accepted 4A Product authority, including `4B-F01` correction |
| `docs/reference/frontend-and-product-surfaces.md` | accepted semantic frontend surfaces and projection laws | accepted architecture/reference authority |

The exact 4B request/response/path schema is deliberately not re-read at this foundation gate because 4C-0→4C-3 does not yet bind a concrete screen/control to wire mechanics. Exact 4B wire is loaded only when a concrete interaction reaches the 4C-7F / 4C-9 feasibility and Screen Contract gates.

Recovered fixed facts:

```text
fixed Conexus platform Product operations = 111
first Budget Analyzer Project operations  = 2
ordinary Permissions                       = 25
Technical Ingress                          = protocol-only / Product-count impact 0
frontend/cache                             = projection only
Workspace/Project semantic surfaces        = current; exact labels/order/components not yet selected
```

No new Product operation, owner, Permission, principal, trust boundary or runtime mechanism is admitted by 4C-0.

---

## 2. 4C-1 — Accepted human actor contexts and outcome needs

4C recovers the seven accepted human actor contexts from the Product contract. These are **not** converted into speculative personas.

| Accepted actor context | Outcome-oriented need preserved from current Product authority |
| --- | --- |
| Workspace owner / platform operator | Establish/administer a Workspace, create/authorize Projects, manage Workspace resources and oversee software being built/served without administrative authority implying business access to every Published Application. |
| Project administrator / Builder operator | Create/evolve a Project, manage Baseline/Changes/bindings/access and drive candidate verification/Release through current gates. |
| Project contributor / reviewer | Participate in Project evolution and inspect/review Plan, Change, Preview and Evidence while taking only currently authorized actions. |
| Published Application user | Use a business application/capability delivered by an exact active Project Release without acquiring Builder/source authority. |
| Product Agent user | Interact with an exact active Project-owned Product Agent through its admitted Product surface and current app/runtime authority. |
| Approver / decision maker | Inspect one exact owner-specific decision subject and decide it only while currently eligible; surface visibility does not confer decision authority. |
| Auditor / technical investigator | Inspect history, Evidence, provenance, Findings, run/effect observations, cost and receipts without telemetry becoming current owner truth. |

### 2.1 Evidence/assumption register

Accepted Product semantics are facts, not assumptions. Two UX questions remain deliberately open because the bounded authority pack does not prove them:

| ID | Assumption / evidence gap | Evidence level | Influences | Planned probe | Status |
| --- | --- | --- | --- | --- | --- |
| `4C-A01` | Phase-3 Workspace/Project semantic surface groupings are useful seeds for later IA, but do not by themselves prove final navigation labels, order or grouping. | accepted architecture gives semantics; human findability choice remains unevaluated | 4C-4 global IA / first global-frame block | compare task/mental-model fit and operator visual walkthrough before any `LOCKED` IA | OPEN |
| `4C-A02` | Relative task frequency/urgency and resulting navigation/layout priority are not established by the bounded Product authority pack. | no direct frequency/analytics evidence recovered in 4C-0 | 4C-4 IA, later density/layout hypotheses | use the smallest available operator/user/reference evidence when the affected block is designed | OPEN |

These open UX assumptions do **not** justify new Product authority. They block final 4C closure if still material and unresolved, but they do not block 4C-3 coverage closure.

---

## 3. 4C-2 — Accepted end-to-end Product flow inventory

The Product contract already owns fifteen whole-product journeys. 4C preserves them as the human/product flow foundation rather than inventing page-shaped flows.

| Journey | Accepted flow intent that 4C must keep operable | Material truth to preserve in later UX |
| --- | --- | --- |
| A — first access / Workspace | Trusted provisioning/authentication establishes current Workspace context for an admitted human. | No F1 public signup; shared Account identity does not create cross-Workspace authority. |
| B — Project Inception / Baseline | Create/import a Project, establish current source/context and reach an approved incremental Project Baseline. | Inception is not a fake Change; material Project-level uncertainty returns to explicit Baseline/decision authority. |
| C — Plan / build / verify / publish | User intent becomes a bounded Change, proportional planning/execution, inspectable progress/Preview/diff/Evidence, verification and governed Release/Promotion. | Model narration is not Hub progress; Preview ready, VERIFIED, Release AVAILABLE and live serving remain distinct. |
| D — Brain assisted Discovery | Governed read-only source discovery/profiling produces candidate semantic mappings with provenance for human resolution. | Proposed/inferred knowledge is not confirmed authority; unsupported mapping remains hypothesis. |
| E — Brain publish / bind / feedback | Reviewed Brain knowledge becomes an immutable revision and a Project explicitly binds an exact revision. | No memory self-publish and no mutable live inheritance. |
| F — Connection / Integration | A scoped Connection is configured through trusted write-only credential handling, qualified against the real environment and explicitly bound for Project use. | Credential material does not move into browser/chat/Project Git; scope and binding remain explicit. |
| G — Data / static Query / AnalyticQuery | A Project uses the smallest admitted read path: exact registered Query and/or governed semantic AnalyticQuery where current authority allows it. | No universal LIVE/MIRROR/HYBRID product switch, arbitrary runtime SQL or unconstrained join topology. |
| H — Publish and use business application | Verified Project output becomes an exact Release, passes current conformance/Promotion/serving proof and is consumed as a Published Application. | Control Plane/Builder authority and Published-App business authority remain independent. |
| I — create/evolve Product Agent | Product-Agent authoring entry points converge on the same governed Change/candidate/diff/proof/Release path. | No second Agent-definition authority or direct provider/runtime authoring shortcut. |
| J — use Product Agent | An admitted user interacts with an exact active Project-owned Agent; interactive Published-App use and admitted headless use remain distinct surfaces. | Product Agent gains no automatic repo/shell/browser/raw-network/raw-DB/raw-secret/Builder authority. |
| K — exact effect approval | An exact effect proposal is sealed, exposed to a currently eligible approver, decided against that exact subject and revalidated before effect admission. | Changed proposal requires new authority; ambiguous outcome is not blind replay. |
| L — managed sync/job | An admitted `job/v1` in the active Release produces governed job occurrences/JobRuns through MAR. | Queue/scheduler/redelivery mechanics do not become a generic scheduler Product domain. |
| M — duplicate Project | Duplicate a Project's source/config/declarations into a destination while preserving explicit authority boundaries. | Default is no data; credentials/bindings are not cloned and destination authority must be rebound explicitly. |
| N — first vertical Budget Analyzer | Metal Nobre Workspace + Brain + Sankhya Connection/binding/read model support the exact Budget Analyzer registered Queries and Published-App result. | First vertical stays read-only; result truth/freshness/coverage/coordinates remain honest and no Product Agent/write/automation is added just to exercise infrastructure. |
| O — maintenance and reusable learning | New request, bug, source change, Finding or Brain update returns through a governed Change against current accepted context and proof. | Reusable learning is projected through its correct owners rather than creating hidden mutable agent memory/Product authority. |

The journey inventory does not yet choose routes, navigation depth, page/drawer boundaries or visual composition.

---

## 4. 4C-3 — Frontend reachability and consumer/disposition census

### 4.1 Derivation rule

Frontend reachability is derived from the **current complete 4A authority matrix**, not from operation names or imagined screens:

```text
fixed operation has HUMAN browser ingress `/ CP` or `/ PA`
→ frontend-reachable concrete operation

fixed operation has no `/ CP` or `/ PA` route
→ no browser consumer is invented
→ explicit disposition required
```

Multi-route operations count once in the fixed Product census. In particular, `BRN-12 RunAnalyticQuery` has CP/PA/Agent routes but is one fixed Product operation.

### 4.2 Fixed-platform family census

| Family | Fixed operations | Frontend-reachable now | Explicit no-direct-browser disposition |
| --- | ---: | ---: | ---: |
| Identity & Access | 16 | 16 | 0 |
| Workspace | 4 | 4 | 0 |
| Project | 21 | 21 | 0 |
| Builder | 17 | 17 | 0 |
| Brain | 11 | 11 | 0 |
| Connections | 9 | 9 | 0 |
| Release / Promotion / serving | 7 | 7 | 0 |
| Product Agent Runtime | 16 | 15 | 1 |
| Gateway inspection | 2 | 2 | 0 |
| Managed Application Runtime | 3 | 3 | 0 |
| Observability & Audit | 5 | 5 | 0 |
| **Fixed total** | **111** | **110** | **1** |

The sole fixed operation without a current browser-human route is:

```text
PAR-05 RunProductAgentHeadless
principal / ingress = HUMAN_ACCOUNT_SESSION / HEADLESS
4C disposition      = NOT-HUMAN-FACING for direct browser UX
```

`NOT-HUMAN-FACING` here means **no direct browser UI consumer**. It does not erase the accepted authenticated human principal or the HEADLESS Product surface.

4C therefore must not invent a page, button or user need merely to make `PAR-05` appear in browser coverage.

### 4.3 First Budget Analyzer

Both concrete first-vertical operations are explicitly Published-App human consumers:

```text
BUD-01 AnalyzePendingBudgets = PUBLISHED_APP_HUMAN / PA
BUD-02 ListPendingBudgets    = PUBLISHED_APP_HUMAN / PA
```

So:

```text
Budget concrete operations      = 2
Budget frontend-reachable       = 2
Budget non-browser disposition  = 0
```

### 4.4 Semantic consumer contexts — not routes/screens

At this stage operations may be grouped only by already-accepted semantic consumer context. The grouping does **not** freeze IA or screen inventory:

```text
Control Plane shell / session context
Workspace administration and access
Project lifecycle / Baseline / bindings / inspectability
Builder / review / Preview / source / Evidence
Brain discovery / review / publication / analytic use
Connections / qualification
Release / Promotion / serving state
Published Application business use
Published-App Product-Agent conversation
owner-specific approval context (CP or PA where admitted)
Product-Agent trigger administration
Gateway effect evidence
managed job inspection/run-now
Project activity / usage / audit investigation
Budget Analyzer Published Application
```

Two intentional non-decisions are preserved:

1. `PAR-08..10` are frontend-reachable, but their exact Control-Plane versus Published-App UX home is a later 4C interaction/IA decision constrained by current authority; this is not a 4A/4B gap.
2. Semantic Workspace/Project surfaces are current architecture inputs, but final labels/order/navigation are not frozen by this census.

---

## 5. Foundation falsifiers and findings

The foundation would fail and reopen the smallest owner if any of these become true:

```text
accepted Journey A-O cannot be represented without new Product meaning
fixed operation matrix fails to classify all 111 concrete operations
browser-reachable operation has no possible human Product context
PAR-05 requires fabricated browser UX to satisfy a count
Budget BUD-01/02 lose their exact PA human consumer
frontend coverage requires a screen-shaped/BFF operation or parallel DTO authority
```

Current 4C-0→4C-3 derivation exposes **no material upstream 4A/4B contradiction**. The open items `4C-A01` and `4C-A02` are UX/IA evidence questions and remain explicitly non-authoritative until later operator adjudication.

---

## 6. Exact closure assertions

```text
human_actor_contexts = 7
accepted_human_product_flows = 15
fixed_platform_operations = 111
fixed_frontend_reachable = 110
fixed_not_human_facing = 1 (PAR-05 RunProductAgentHeadless)
budget_frontend_reachable = 2
total_frontend_reachable_concrete_operations = 112
invented_frontend_product_operations = 0
invented_user_needs_for_orphan_coverage = 0
screen_shaped_api_authority = 0
parallel_frontend_product_dto_authority = 0
material_upstream_finding_4c_0_to_3 = 0
```

## 7. Next bounded action

After this foundation is mechanically green, the next 4C action is **4C-4 — Candidate Information Architecture + terminology glossary**.

4C-4 must use the seven actor contexts, fifteen accepted journeys, 112 frontend-reachable concrete operations and the two open UX evidence questions as inputs. It must not begin from the Phase-3 shell as a pre-approved navbar, and it must remain `CANDIDATE` until a later rendered global-frame block is explicitly `LOCKED` by the operator.

Do not begin 4C-5 screen inventory, 4C-8 wireframes, 4D or Product implementation by inheritance from this foundation.

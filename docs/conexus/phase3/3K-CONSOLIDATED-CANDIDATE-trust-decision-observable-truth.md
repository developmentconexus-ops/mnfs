# 3K Consolidated Candidate — Package B: Trust, Decision & Observable Truth

**Status:** NON-AUTHORITATIVE CONSOLIDATED CANDIDATE  
**Phase:** 3K — Frontend / Product Architecture  
**Package:** B — Trust, Decision & Observable Truth  
**Authority reconstructed through:** PR #40 branch `agent/conexus-phase-3-system-design` at `ebef3699178a614fdacd0c621133c5ef6fb46e98`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Inputs:** `3K-CHATGPT-DIALOGUE-trust-decision-observable-truth.md` + `3K-FABLE-DIALOGUE-trust-decision-observable-truth.md`  
**Important:** this file does not create a numbered 3K decision, does not alter `LEDGER.md`, does not ratify Package A or Package B, does not reopen 3B–3J, does not constitute C-018 and does not authorize product implementation, merge or PR readiness. It is the single Package B candidate presented for operator ratification.

---

## 1. Outcome

Package B remains structurally confirmed after independent adversarial review.

```text
preferred product structure = context-local truth surfaces + shared visual grammar
Trust / Approval Center      = REJECT F1
universal frontend FSM       = REJECT F1
chat-only decision authority = REJECT
raw architecture console     = REJECT F1
new module / durable owner   = 0
Round 2                      = NOT REQUIRED
```

Fable found two bounded material omissions. Both are valid, additive, already supported by stronger accepted authority and incorporated below. No prior authority needs reopening.

---

## 2. Finding adjudication

### F-B1 — Platform-published vs tenant/user content provenance

**Disposition: ACCEPT bounded correction.**

3A-R7 already requires platform knowledge to remain distinct from tenant-owned Workspace Brain content and includes an explicit proof obligation that source/provenance be auditable enough to distinguish platform-published knowledge from tenant/user content.

Package A owns **where** platform assistance and tenant Brain appear in the journey. Package B owns the presentation-level truth that must not be hidden when the distinction matters.

Final law:

```text
platform-published Conexus knowledge
!= tenant / Workspace Brain content
!= user-authored/project content
```

Where assistance/knowledge provenance could affect trust or a decision, the product must preserve this distinction in user-observable presentation. Friendly labels are allowed; silently merging the sources is not.

This creates no new knowledge owner, record, taxonomy or artifact class.

### F-B2 — Honest request state: empty != loading != failed

**Disposition: ACCEPT bounded correction.**

C-012 already freezes Honest UI through `RequestState<T> × DataMeta`, `EmptyState.reason`, `unknown != 0` and product-invariant tests. Package B must carry the user-observable law so coding actors cannot render unresolved/failed requests as legitimate empty business state.

Final law:

```text
loading / unresolved
!= successful empty result
!= failed request
!= partial result
```

An empty business state is admissible only from a successful owner-derived result that positively establishes emptiness. A failed/unresolved request cannot be rendered as “no data”. Where the owner provides an empty reason, the surface preserves it.

No second request-state FSM is created; the UI projects the existing `RequestState<T>` contract.

### N-B3 — Permission widening wording

**Disposition: ACCEPT wording cleanup.**

Do not present `scope widened` as though it were one of C-015's exact enumerated baseline examples. Package B instead states:

```text
C-015 named widening classes
+ any additional widening class produced by applicable approved authority
→ must not be hidden at the promote gate
```

No new permission taxonomy is created by 3K.

### N-B4 — Checklist vocabulary

**Disposition: ACCEPT single-source cleanup.**

Package B does not freeze or enumerate a second checklist status set. The Build surface projects the exact C-013/C-017 owner vocabulary and preserves materially distinct states without deriving completion from model/worker prose.

### N-B5 — Cost presentation axes

**Disposition: ACCEPT precision cleanup.**

C-013's independent axes remain independent:

```text
usage_state
× calculation_state
× reconciliation_state
```

Product presentation may summarize them, but it must not collapse missingness or overwrite one axis with another. 3K creates no new cost state machine.

### N-B6 — Progressive-disclosure ownership

**Disposition: ACCEPT single-statement discipline.**

Package A owns the general progressive-disclosure/product-navigation law. Package B does not create a second copy. Package B owns only the complementary **never-hide truth boundary**: simplification may hide internal machinery, never material authority, uncertainty, provenance or decision input.

---

## 3. Root invariant

> **The frontend simplifies presentation, never meaning: every material state, decision and proof remains owner-derived and context-local, while the product uses one coherent visual grammar so users can decide and understand without operating Conexus internals.**

Consequences:

```text
shared component / layout / visual grammar = mechanism
semantic source / lifecycle / authority     = owner-local
```

A shared component never creates `UniversalStatus`, `UniversalDecision`, `TrustRecord`, `ApprovalCenter` or another durable authority.

---

## 4. Product placement

Package B adds no top-level product section by default.

### Build

Carries trust/truth required to create and evolve software:

```text
Change checkpoint
approved plan when applicable
plan/checklist progress projection
verification/assertion coverage
Findings + required route/action
known limitations
cost/duration where useful
entry to deeper authorized diagnostics
```

`WorkUnit`, `ActorRun`, runtime/provider/session IDs and digests remain progressive detail unless materially useful for diagnosis/trust.

### Versions / Publish

Carries:

```text
candidate version / current active version
verification readiness
promotion target
permission widening evidence
dependency widening evidence
migration / maintenance-required implications
known limitations relevant to promotion
promotion progress
SERVED_VERIFIED truth
rollback eligibility + data consequences
```

### Access / Administration

Access surfaces show the exact owner/context being changed, for example:

```text
principal/account
Workspace / Project
CONTROL_PLANE / PUBLISHED_APP context when material
current relationship/role
proposed mutation
read-only server-derived capability consequences when useful
```

Raw capability lists are never editable authority input. No generic ACL/policy engine UI is introduced.

### Product Agent / published use

Interactive effect approval appears in the active user context as the exact `ApprovalRequest` decision surface.

For trigger-origin/non-interactive AgentRuns with no active conversation, pending approval may be projected from the owner facts in the relevant Project/AgentRun operational context. This does not create a global approval inbox or duplicate approval lifecycle.

A cross-project approval inbox returns only when a real operator workload proves it useful; any future aggregate remains a projection over owner facts, never approval authority.

### Diagnostics

C-013 Run Timeline remains the F1 deep causal diagnostic surface under existing authorization. Normal product surfaces may show bounded summaries derived from the same facts; they do not persist a second telemetry/status store.

---

## 5. Four decision families

The product uses one visual language but preserves four semantic families.

### D1 — Change checkpoint

C-017 remains exact: every Change receives a human checkpoint before coding; proportionality changes depth, not existence.

The user must be able to understand, proportionally:

```text
what Conexus understands should change
business outcome / intent
current assertions/contract
known assumptions, unknowns and BLOCKED facts
required discovery/access facts when applicable
approved visual plan when PlanningDepth requires it
material risk/effect signals requiring deeper scrutiny
```

Conceptual presentation depth:

```text
FAST       → compact review
BOUNDED    → contract + applicable plan/evidence
CONTROLLED → contract + plan + discovery/proof/risk detail
```

These are presentation depths, not a user-selectable rigor control. Approval binds current owner-controlled contract/plan identities, never a model paraphrase.

### D2 — Exact effect approval

3F-03 remains authority.

```text
sealed ApprovalRequest subject
→ verify commitment
→ family-specific controlled projector
→ sanitized decision surface
```

When applicable, the human can inspect before decision:

```text
effect family/type
target / Connection / external actor
exact unit count + identities
final material content/value
Project/business scope
expiry
```

Large sets use deterministic bounded preview + exact count + access to the full authoritative set before decision.

Prohibited:

```text
model-selected representative sample
stored editable approval card
approval of assistant prose instead of sealed subject
approval reused as generic permission
```

Conversation may carry explanation; it never owns the approval.

### D3 — Publish / rollback gate

Promotion is one coherent human decision surface composing existing owner-derived evidence, not multiple new approval engines.

Before promotion, show when applicable:

```text
candidate version
current active version
target environment
verification/assertion state
C-015 permission widening evidence
C-016 dependency widening evidence
Connection/config/binding blockers
migration class
maintenance-required impact
known limitations
rollback eligibility and data caveat
```

#### Permission widening

All widening classes produced by applicable approved permission authority must be unmistakable and must not be hidden behind advanced detail. 3K does not mint a new widening taxonomy.

#### Dependency widening

When C-016's dependency proposal applies, present its approved material meaning: package/version, reason/capability, relevant direct/transitive change and material install/native/license/security information already produced by the owner contract.

#### Maintenance-required

Before approval, the user must understand that normal serving may be blocked until a safe forward-fix/restore/promotion path completes, and that ordinary rollback may be mechanically unavailable.

#### Rollback

Rollback uses the same gate family and mechanically derived eligibility. Preserve at least:

```text
which prior composition becomes active
whether schema compatibility permits it
rollback re-points composition; it does not restore data
```

### D4 — Access mutation

Security-sensitive access mutation shows exact pre-state + proposed change under its owner context.

Example conceptual shape:

```text
Account: Ana
Context: Project X / Published App
Current role: member
Proposed role: admin
```

Capability consequences may be shown only as server-derived explanation. Proposed new authority never participates in authorizing its own mutation; 3I-01 remains enforcement authority.

No F1 four-eyes workflow or generic policy engine is created.

---

## 6. Observable truth laws

### 6.1 UI is projection

```text
owner facts
→ server-derived/product projection
→ UI

UI state/cache/model narration
-X-> domain/security authority
```

No cross-owner frontend status field or store becomes platform truth.

### 6.2 Owner state spaces remain distinct

The product never implies:

```text
Change ACCEPTED
= WorkUnit delivery
= ActorRun completion
= verification
= Release AVAILABLE
= Promotion pointer swap
= SERVED_VERIFIED
```

Nor:

```text
ApprovalRequest ALLOW_ONCE
= effect admitted
= request sent
= response received
= effect succeeded
```

Nor:

```text
AgentRun COMPLETED = all proposed effects succeeded
Connection qualified = bound = healthy = authorized
no Finding = verified
```

### 6.3 Delivery completion

When end-to-end delivery truth matters, use the already-authoritative ladder:

```text
WORK_COMPLETED
→ RESULT_PERSISTED
→ VERIFIED
→ DEPLOYED
→ SERVED_VERIFIED
```

A product is labeled live/served only when applicable authority reaches `SERVED_VERIFIED`. HTTP 200, pointer swap, model narration or build completion are insufficient.

### 6.4 Honest request state

```text
loading/unresolved
!= successful empty
!= failed
!= partial
```

Successful empty requires positive owner-derived success evidence. Failed/unresolved requests never become “no data”. Exact `RequestState<T>` mechanics stay C-012-owned.

### 6.5 Build progress

The normal progress surface is plan/checklist-centered. It projects exact C-013/C-017 owner vocabulary; no second status vocabulary is frozen here.

Worker/model prose cannot mark work complete. Deeper WorkUnit/ActorRun attempts appear only when materially useful.

### 6.6 Verification

The user can answer:

```text
what had to be proven?
which assertions have accepted proof?
which failed?
which are BLOCKED / UNVERIFIED?
what evidence supports each verdict?
```

`UNVERIFIED` on a MUST assertion never receives success presentation.

Validator/reviewer output remains diagnostic until the applicable hub/human acceptance path produces authority-grade evidence.

### 6.7 Findings

Finding surfaces explain:

```text
problem
assertion/scope affected
severity/impact
supporting evidence
current route
owner status
```

They project the C-017 Finding lifecycle; validator never fixes its own finding and UI never creates another one.

### 6.8 Evidence provenance

Friendly product language may be used, but trust classes cannot be flattened.

Conceptually:

```text
verified by Conexus       → owner-authoritative acceptance/proof
observed in runtime       → diagnostic observation
external response observed→ only when authority actually has RESPONSE_RECEIVED
not verified / unavailable
```

Provider/guest observation never receives owner-verified treatment by presentation convenience.

### 6.9 Knowledge/content provenance

Where material to trust/decision:

```text
platform-published Conexus context
!= Workspace Brain / tenant knowledge
!= user/project-authored content
```

The user need not see internal artifact kinds/digests by default, but the distinction and relevant provenance remain legible/auditable.

---

## 7. Cost and spend truth

Package B projects C-013 + 3I-03; it does not redefine accounting.

Where useful, show:

```text
tokens
USD
run/session duration
```

The presentation must preserve missingness across the independent authoritative axes:

```text
usage_state
× calculation_state
× reconciliation_state
```

Therefore:

```text
missing usage != 0 tokens
missing price != $0
conservative reserved liability != exact actual cost
provider-reported != calculated != reconciled
```

Aggregates are information, never execution/budget authority.

Budget/cost-envelope blockage must be presented as honest non-execution/blockage, not as generic model failure after hidden dispatch.

Exact copy and visualization are Realization Planning.

---

## 8. Failure / effect truth

### Public failures

3F-05 public codes remain machine keys; user-facing language is sanitized/localized. `correlationId` remains the support/diagnostic bridge.

No module names, stack, SQL, secret or internal path crosses into product error detail.

### Traffic state

Preserve C-016 exactly:

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

Without `RESPONSE_RECEIVED`, the product must not attribute the failure **to the external actor**. It may identify the intended target/dispatch context without falsely saying that actor rejected or caused the failure.

### `OUTCOME_UNKNOWN`

`OUTCOME_UNKNOWN` is first-class ambiguity, never generic failure and never automatic retry permission.

```text
physical effect may already have happened
→ do not offer generic retry/re-send as safe
→ recovery/reconciliation remains owner/3M concern
```

### `PARTIAL`

Multi-unit partial outcome cannot be hidden behind a single success/failure label. Preserve owner-derived succeeded/rejected/unprocessed/unknown breakdown as applicable.

### `MANIFEST_INVALID`

Show only public identifiers/diagnostics admitted by 3F-05 and the exact compile/promote contract; exact diagnostic fields remain contract/Realization work.

---

## 9. Archive / lifecycle / degradation honesty

Where Package C proves the first vertical needs archive/unpublish/trigger-disable surfaces, the product must preserve:

```text
ARCHIVE
!= UNPUBLISH
!= stop serving
!= cancel admitted runs
!= disable enabled triggers
```

If stopping an automation is required, explicit trigger `DISABLE` is the narrowing action defined by existing owner semantics.

If no first-vertical consumer exists, the surface remains DEFER SAFELY.

Capability-local degradation must remain local and explicit. No platform-wide availability state/orchestrator is created merely to make a cleaner UI.

---

## 10. Never-hide contract

Progressive disclosure is Package A's general product law. Package B freezes the complementary truth floor.

When material to the current decision/action, the product may not conceal:

```text
exact decision subject / what will be executed
permission widening
dependency widening
external-effect attempted/receipt/PARTIAL/OUTCOME_UNKNOWN truth
unknown != zero / missingness
verification vs observation provenance
platform-published vs tenant/user content provenance
SERVED_VERIFIED vs merely built/deployed
maintenance/degradation that changes what the user may safely assume
known limitations at delivery/promotion
current authorization context when it changes meaning
successful empty vs loading/failed/partial request state
```

Internal IDs, runtime mechanics and digests may remain collapsed unless needed to explain/prove one of those truths.

---

## 11. Package routing

```text
Package A — Product Model, Navigation & Golden Path
→ where journeys/surfaces live
→ overall progressive-disclosure placement law

Package B — Trust, Decision & Observable Truth
→ what must be shown/trusted at decisions
→ honest state/provenance/failure/cost/limitations laws
→ no duplicate authority

Package C — First Vertical Composition & Data Path
→ decides which conditional surfaces have a real first-vertical consumer
→ decides live-read vs mirror/sync and job/v1 trigger
→ no invented WRITE/effect

3L
→ technology behavior needed to realize/prove approved properties

3M
→ recovery/reconciliation semantics

3N / 3O
→ global verification / vertical architecture proof

Realization Planning
→ routes/components/layout/copy/tokens/exact diagnostic presentation
```

---

## 12. DEFER SAFELY

```text
global approval/pending-work inbox until real cross-context operator consumer
generic Trust/Governance center
full observability dashboard / analytics
log/export UI detail beyond C-013 F1 floor
advanced cost analytics / billing portal
cross-project security administration
notification center / external alerting without consumer
exact component tree / layout / copy / visual tokens
recovery UI beyond truthful entry/pointer until 3M semantics are closed
archive/unpublish/trigger-disable absent first-vertical consumer
```

---

## 13. REJECT F1

```text
UniversalStatus / frontend semantic FSM
TrustRecord / ApprovalCenter as new authority
generic ApprovalService/engine created for presentation
chat/model prose as authority-bearing decision subject
frontend-owned authorization/capability state
optimistic UI that upgrades domain truth
"Done" before owner proof permits it
"Live" before SERVED_VERIFIED
"No data" from unresolved/failed request
missing cost/count/coverage rendered as zero
provider/guest observation rendered as verified
permission/dependency widening hidden behind advanced details
generic retry button for OUTCOME_UNKNOWN
raw architecture objects as normal Golden Path ceremony
generic ACL/policy editor
```

---

## 14. Proof / falsification before authority

Package B is falsified if any of these cannot be represented without creating duplicate authority or hiding material truth:

1. a FAST Change stays compact while still binding the exact current contract/plan identities;
2. a large effect ApprovalRequest allows exact inspection without editable/model-selected authority;
3. a promote with permission/dependency widening cannot proceed without material evidence being visible;
4. maintenance-required promotion cannot look like normal reversible deployment;
5. `AgentRun COMPLETED + effect OUTCOME_UNKNOWN` can be shown without collapsing either truth;
6. pointer swapped but serving digest unverified cannot be labeled live;
7. failed/unresolved data request cannot render as successful empty state;
8. provider/guest observation cannot render as Conexus-verified evidence;
9. platform-published consultant knowledge remains distinguishable from tenant/user content when provenance matters;
10. missing usage/price/reconciliation state cannot become false `$0` or exactness;
11. trigger-origin pending ApprovalRequest can be reached from owner facts without a new global approval authority;
12. adding a future aggregate pending-work view would be an additive projection, not a rewrite of decision ownership.

---

## 15. Reopen triggers

Reopen Package B only on material evidence such as:

- real cross-project/operator workload requiring an aggregate pending-decision projection;
- a fifth materially different human-decision family not representable by context-local owner projectors;
- real public/embed consumer changing trust/decision presentation requirements;
- a new authorization model beyond the closed F1 role/audience model;
- implementation evidence proving owner-local projectors cannot provide coherent product truth without duplicate state;
- a real billing/commercial consumer requiring new cost semantics rather than presentation;
- 3M recovery semantics introducing a user-critical truth not representable by the current never-hide boundary.

Visual preference, dashboard preference or desire for symmetry does not reopen.

---

## 16. Ratification boundary

Independent Fable verdict after challenge:

```text
ACCEPT WITH BOUNDED CORRECTIONS
Material Findings = 2
prior authority reopen = NO
Round 2 = NO
Global Maximum = SUSTAINED
```

Both material corrections and the four non-material cleanups are incorporated in this consolidated candidate.

If the operator approves Package B together with the applicable Package A ratification sequence:

```text
Package B = APPROVED CONCEPTUALLY
→ materialize numbered 3K authority according to the ratified package-to-decision mapping
→ update LEDGER
→ continue to Package C
```

Until explicit operator approval, this file remains non-authoritative review/consolidation input.
# 4C — Frontend Interaction & Authority Realization

Current mutable status and exact next action live only in [../roadmap.md](../roadmap.md). This document owns the bounded 4C contract for deriving the browser Product from accepted 4A Product authority and accepted 4B executable wire authority without inventing Product meaning, transport authority, authorization or runtime mechanism in frontend planning.

## 1. Decision question

> What is the smallest complete human-experience and frontend-authority contract that lets accepted human Product journeys become coherent, operator-reviewed browser interactions while every material read/write remains bidirectionally traceable to accepted Product/wire authority?

4C is frontend Product/interaction realization. It is not Product implementation, final visual design, component-library design, Paved-Road selection, runtime selection or persistence design.

## 2. Root failures to prevent

4C must prevent both failure classes:

```text
accepted backend/wire authority
→ mechanically mirrored screens/navigation
→ technically connected but incoherent human Product
```

and:

```text
attractive screen/interaction
→ missing accepted truth/operation
→ frontend invents endpoint / DTO / authorization / lifecycle / state
→ screen convenience becomes Product authority
```

Therefore:

```text
backend coherence != UX coherence
UX coherence != authority to change backend meaning
```

Both must close before 4D.

## 3. Binding inputs

Derive only from current accepted repository authority, principally:

- [Phase 4 Implementation Readiness Program](4-implementation-readiness-program.md);
- [4A Product Surface & Authority Contract](4a-product-surface-and-authority-contract.md);
- [Product Operation Ledger](../product/operation-ledger.md);
- [Permission Contract](../product/permission-contract.md);
- [4B Executable Wire Contract](4b-executable-wire-contract.md);
- [Executable Wire Contract](../product/wire-contract.md);
- [Frontend and Product Surfaces](../reference/frontend-and-product-surfaces.md);
- one exact owning Product/security/reference document only when a concrete frontend question requires it.

The operator-approved **Frontend Product Experience Planning Method v2.1** is adopted as reusable planning methodology, not as independent Conexus Product authority. This 4C contract is the Conexus-specific profile that preserves repository authority, Phase-4 boundaries and exact 4A/4B contracts.

External references, design systems, mature products, framework documentation and reviewer findings are Evidence. They may challenge or inform interaction hypotheses but cannot add Product meaning.

Current fixed upstream facts include:

```text
fixed Conexus platform Product operations = 111
first Budget Analyzer Project operations  = 2
ordinary Permissions                       = 25
Technical Ingress HTTP operations          = 3 / Product-count impact 0
canonical fixed Product wire               = 111 ↔ 111 schema-closed
parallel Product DTO authority              = forbidden
```

## 4. Core derivation law

Frontend planning is bidirectional.

```text
accepted Product journey
→ actor/context
→ human need / desired outcome
→ end-to-end flow
→ candidate frontend context
→ semantic surface / route
→ material interaction
→ exact admitted operation/read truth
→ semantic owner + Permission/scope
→ exact 4B wire
```

and in reverse:

```text
frontend-reachable admitted operation
→ real human consumer
→ material interaction
→ semantic surface / route
→ end-to-end flow
→ human need / accepted Product journey
```

A one-way trace is insufficient because it can hide orphan operations, fabricated user needs or invented UI behavior.

## 5. Interaction classification law

Every material interaction must be classified before implementation topology is derived:

```text
PRODUCT_READ
PRODUCT_COMMAND
PROJECT_CAPABILITY
TECHNICAL_INGRESS
LOCAL_UI
NAVIGATION
PROJECTION_ONLY
```

Rules:

- `PRODUCT_READ`, `PRODUCT_COMMAND` and `PROJECT_CAPABILITY` require exact accepted Product authority and exact canonical/generated wire consumption where network transport applies;
- `TECHNICAL_INGRESS` remains protocol/technical boundary and never enters the 111 Product census by UI convenience;
- `LOCAL_UI`, `NAVIGATION` and `PROJECTION_ONLY` must not receive fabricated Product operations merely because a control exists;
- OIDC/Keycloak protocol mechanics remain authentication protocol, not Product operation authority.

## 6. Human evidence and assumptions

4C must begin from human goals rather than screen inventory.

For every material human actor/context, derive where available:

```text
trigger / situation
need / job
intended outcome
frequency / urgency
information needed for safe decision
common friction / handoff
```

Direct user/operator/domain Evidence is preferred. A material assumption may influence a candidate only when explicitly registered with:

```text
assumption
evidence level
influenced block(s)
planned adversarial probe
OPEN | VALIDATED | REJECTED
```

Unresolved material assumptions block 4C closure.

Access roles are not automatically UX personas.

## 7. Coverage and orphan disposition

Before layout selection, 4C must classify frontend reachability and consumer coverage.

For every accepted human capability and every concrete operation with a plausible human consumer, derive:

```text
human need / capability
semantic owner
flow
candidate frontend context
reads
writes
Permission / scope / disclosure obligations
UX truth/failure obligations
frontend disposition
```

A backend/application operation without a discovered human need must resolve by exactly one of:

```text
A. evidenced real human need + frontend home
B. operator-adjudicated NOT-HUMAN-FACING or DEFERRED disposition
C. UPSTREAM finding that accepted capability is excess/misaligned
```

Forbidden:

```text
orphan operation
→ invent user need
→ invent screen
→ claim coverage
```

Required closure eventually includes:

```text
frontend-reachable admitted concrete operations with consumers = complete
frontend-nonreachable human-class operations with explicit disposition = complete
invented user needs to consume orphan operations = 0
invented frontend Product operations = 0
```

## 8. Information architecture before screen composition

4C must derive candidate information architecture from user mental models, tasks and relationships rather than backend package/domain topology.

Where material, evaluate:

```text
user-facing terminology
primary objects/tasks
frequent tasks
relationships
browse hierarchy
search/filter/findability
cross-links
global vs contextual navigation
primary vs secondary destinations
accepted future seams
```

Existing semantic Workspace/Project surfaces are authority inputs, not automatic navbar labels/order. Exact labels/order/components remain realization questions until operator-adjudicated here.

Future seams may shape extensibility but cannot create live routes/screens without current authority.

## 9. Candidate surfaces and routes

Screens derive from human flows + candidate IA, not endpoint count.

Distinguish only where materially useful:

```text
route/page
material region inside a route
drawer/modal
inline composition region
alternate view of one collection
material state variant
```

A separate material surface is justified when one or more of these change materially:

```text
primary semantic truth
safe user action
write owner
identity source
concurrency/idempotency behavior
content exactness/integrity
security/disclosure context
recovery path
viewer/editor mode
```

Do not split surfaces for implementation-file convenience or cosmetic layout differences.

## 10. Reference study and competing hypotheses

Reference study is conditional, not ceremonial.

Use bounded current references only when a material block is unfamiliar, high-impact or structurally ambiguous. Analyze the same user task/pattern rather than visual fashion. Separate:

```text
SOURCE OBSERVATION
INFERENCE
CONEXUS CANDIDATE DECISION
```

When real structural ambiguity exists, compare 2–3 plausible hypotheses against criteria such as task completion, recognition, comparison, scanability, density, scale, preview need, context preservation, failure recovery, accessibility, responsive viability and backend-truth fit.

Do not manufacture alternatives where one conventional structure is clearly sufficient; record the bounded reason instead.

## 11. Authority feasibility preflight before structural lock

Before a leading structural candidate can be presented for operator `LOCKED`, it must pass a lightweight authority-feasibility preflight.

At minimum, every material region/action must establish:

```text
required read truth exists or FINDING
required Product operation exists or FINDING
required identity source exists or FINDING
Permission/scope/disclosure class exists or FINDING
concurrency/idempotency obligation known where applicable
material outcome/failure classes known where applicable
```

This is deliberately lighter than the full Screen Contract. It prevents operator-locking a structure that already depends on nonexistent Product authority without allowing backend shape to dictate UX.

## 12. Rendered structural wireframe + operator-only lock

Each material block requires a rendered/viewable low-fidelity structural artifact before it becomes baseline authority.

The artifact proves/exposes structure, not brand design. It should make inspectable where relevant:

```text
hierarchy and reading order
major regions / relative proportions
navigation placement
information grouping
collection representation
primary/secondary action placement
density / progressive disclosure
error/conflict/recovery region placement
responsive transformation
keyboard/focus plausibility
heading/label structure
non-drag path for essential interactions
```

Decision vocabulary:

```text
LOCKED       operator-approved current planning baseline; operator-only
CANDIDATE    plausible leading structure; not approved
FINDING      material unresolved question/contradiction
REJECTED     considered and deliberately not selected
DEFERRED     accepted future seam without current consumer
NOT-HUMAN-FACING explicit no-direct-human-consumer disposition
```

Assistant, reviewer and tool output MUST NOT set `LOCKED`.

The next dependent material block may not inherit the current block as baseline until the operator sets `LOCKED`, unless the operator explicitly authorizes parallel candidate progression. Parallel candidate work does not silently promote dependencies to authority.

## 13. Exact Screen Contract

After structural lock, every material screen/region/control must receive exact vertical trace where relevant:

```text
GOAL / USER FLOW
ROUTE / SURFACE
INFORMATION-HIERARCHY ROLE
INTERACTION CLASS
OWNER + READ TRUTH
WRITE CONTROL / admitted operationId
IDENTITY SOURCE
CLIENT STATE CLASS
CANONICAL / GENERATED WIRE CONSUMPTION
MATERIAL STATES / FAILURES
FAILURE MESSAGE INTENT
SUCCESS CONSEQUENCE
AUTHZ / DISCLOSURE
CONCURRENCY / IDEMPOTENCY carriage when applicable
PROOF / FALSIFIER
FORBIDDEN FRONTEND AUTHORITY
BACKEND SUFFICIENCY
```

Failure-message intent states what the user must understand and what safe next action must remain possible. It is not final copywriting.

No screen/control may be marked ready while its exact trace contains a material `FINDING`.

## 14. Generated transport law

All Product network interaction must preserve 4B custody:

```text
accepted 4A semantics
→ canonical 4B machine-readable wire
→ GENERATED transport/type projection
→ frontend consumer
```

Forbidden:

```text
hand-written parallel Product request/response DTOs
screen-specific transport schemas as co-authority
copy-pasted Product Problem enums
client interfaces that widen/narrow canonical semantics
```

4C proves that frontend consumers can be defined against generated projection semantics. It does not select the final generator, SDK wrapper or Paved-Road API.

The 4B Kubb 5.0.0 result remains **empirical viability Evidence only**. 4C must not promote Kubb to final 4D Paved Road by implication.

## 15. Client-state ownership

Every material state belongs to the smallest honest class:

```text
SERVER
URL_NAVIGATION
FORM_DRAFT
EPHEMERAL_UI
```

A fifth class is admitted only when a real interaction demonstrates that none of these can preserve the required property honestly.

Rules:

- server-owned Product truth is projected/cached, never independently re-owned by frontend;
- URL/navigation state is explicit when it materially defines shareable/findable navigation context;
- form draft may preserve user input without becoming committed Product truth;
- ephemeral UI state may control local presentation without becoming lifecycle/business state;
- unknown, known-empty, partial, stale, denied, ambiguous outcome and dependency-unavailable classes remain distinguishable where accepted authority requires them;
- optimistic UI may not fabricate consequential business success or current authorization.

Framework mechanics may support these classes but do not define Product authority.

## 16. Browser authentication/session boundary

4C must realize browser interaction around the accepted C-015 refinement without moving authorization into the client:

```text
Keycloak/OIDC
→ human authentication protocol
→ Conexus Account/session
→ current Conexus membership/grant/Published-App authorization
```

Frontend planning must make material UX distinguish where applicable:

```text
unauthenticated / authentication-required
authenticated but denied
absent or intentionally non-disclosable
session expiry / reauthentication
revoked or narrowed current authority
```

Hidden/disabled controls are UX/disclosure behavior only. They never authorize an operation.

## 17. Derived interaction-pattern vocabulary

Reusable interaction patterns are derived from locked evidence rather than invented upfront.

A shared candidate pattern may graduate only when repeated locked consumers share the same purpose, state ownership, protected semantics, accessibility requirements and failure/recovery class.

4C may close **pattern semantics**, for example a repeated stale-write or non-disclosable interaction behavior. 4C MUST NOT preselect component APIs, hooks, stores, package utilities or SDK abstractions.

Those realization mechanics are 4D inputs.

## 18. Interactive low-fidelity prototype

Use an interactive prototype only when material cross-screen interaction, state transitions or recovery behavior need realistic falsification.

The smallest useful default may be plain deterministic browser technology and local fixtures. Prototype code is Evidence, never Product implementation.

A fixture prototype may prove/expose:

```text
navigation coherence
interaction coherence
hierarchy/density comprehension
state/failure comprehensibility
recovery discoverability
responsive/accessibility plausibility
```

It MUST NOT be cited as proof that:

```text
backend behavior exists
authorization is implemented
wire/runtime integration works
concurrency/idempotency is enforced
external effects reconcile correctly
```

Material controls must be inspectable rather than decorative dead UI when the prototype claims to exercise their interaction flow.

## 19. Accessibility and responsive behavior are structural

A candidate cannot be operator-locked when its interaction model has no plausible accessible or responsive realization.

Structural planning must consider where relevant:

```text
keyboard navigation
semantic control choice
focus/read order
heading hierarchy
labels/instructions/error association
non-color-only meaning
screen-reader comprehensibility
target viability
responsive reflow
non-drag alternative for essential interaction
```

Responsive planning must define what stays primary, stacks, collapses, becomes contextual navigation/drawer, becomes locally scrollable and remains always reachable. Responsive transformation cannot change Product semantics or hide the only material action.

## 20. Feature/package topology boundary

Only after goals, IA, material interactions, state ownership, generated consumers and repeated interaction semantics are accepted may 4C derive the smallest feature/package topology needed to preserve those boundaries during later implementation.

Derivation law:

```text
locked semantic surfaces
+ interaction ownership
+ state ownership
+ generated transport consumers
+ repeated protected patterns
→ feature/package boundary candidate
```

4C may define ownership/cohesion boundaries and forbidden dependencies. It MUST NOT select final framework wrappers, SDK helper APIs, state libraries, design systems, codegen package implementation, router/runtime package versions or 4D scaffold mechanics.

## 21. Conexus 4C working order

Use this order:

```text
4C-0  bounded authority recovery
4C-1  actors / needs / assumption register
4C-2  end-to-end human-flow inventory
4C-3  frontend coverage + operation-consumer/disposition census
4C-4  candidate information architecture + terminology glossary
4C-5  candidate screen/material-surface inventory

PER MATERIAL BLOCK
4C-6  reference study when triggered
4C-7  competing structural hypotheses when ambiguity is real
4C-7F authority-feasibility preflight
4C-8  rendered structural wireframe + operator visual adjudication
4C-9  exact Screen Contract / bidirectional trace
4C-10 bounded interaction-pattern consolidation
4C-11 interactive realization only when material

ASSEMBLED CLOSURE
4C-12 whole-product adversarial UX + architecture walkthrough
4C-13 generated-consumption + state/auth + feature-topology closure
4C-14 independent Fable review + Lead adjudication
→ explicit operator 4C ratification
```

A finding returns only to the smallest affected block/stage unless it falsifies a global assumption or accepted upstream authority.

## 22. Minimum logical artifact set

Repositories may consolidate records. 4C needs logical records for:

```text
bounded authority map
actor/need + assumption register
end-to-end flow inventory
frontend coverage / operation disposition matrix
candidate IA + terminology
material block ledger
reference/hypothesis notes only where triggered
rendered structural wireframes
Screen Contracts / bidirectional trace
interaction-pattern vocabulary
interactive prototype only where material
adversarial findings
feature/package topology result
independent review + Lead adjudication
```

Do not create one file per row merely for ceremony.

## 23. Falsifiable proof package

4C cannot close because wireframes look coherent. The candidate must prove at least:

1. **Human-goal closure** — every admitted material human goal has a complete end-to-end frontend flow or explicit upstream finding.
2. **Frontend reachability closure** — every frontend-reachable admitted concrete Product operation has a real consumer and every non-frontend human-class operation has explicit disposition.
3. **No fabricated consumer closure** — no user need/screen exists solely to consume an orphan operation.
4. **Bidirectional authority closure** — every material Product read/write traces to one accepted owner/operation and exact 4B wire; every material screen control traces back to an accepted human need.
5. **No invented Product closure** — invented frontend Product operations = 0; screen-shaped/BFF Product authority = 0.
6. **Generated transport closure** — parallel handwritten Product DTO/schema authority = 0.
7. **State-ownership closure** — server truth independently re-owned by frontend = 0; every material client state has an explicit class.
8. **Truth/outcome closure** — material unknown/empty/partial/stale/denied/ambiguous/dependency states are not dishonestly collapsed.
9. **Identity/authorization closure** — navigation identities have accepted sources; client visibility never substitutes for authorization; Keycloak authentication never becomes Conexus grant authority.
10. **Structural UX closure** — material IA/blocks are operator-locked after rendered review, not inferred from backend topology or assistant preference.
11. **Assumption closure** — unresolved material assumptions = 0.
12. **Accessibility/responsive closure** — no operator-locked material structure lacks a plausible accessible/responsive realization.
13. **Pattern/YAGNI closure** — shared frontend patterns derive from repeated protected semantics; speculative helpers/components/SDK abstractions = 0.
14. **Feature-boundary closure** — feature/package topology is derived from accepted interaction ownership without selecting 4D implementation mechanism.
15. **Budget Analyzer proving instance** — both accepted Budget Analyzer operations are consumed/dispositioned by the exact first-vertical frontend journey without generic analytics semantics.
16. **Negative challenge** — deliberately proposed convenience API, frontend auth evaluator, client lifecycle owner, parallel DTO, backend-shaped navigation and fixture-proves-backend claims fail for the expected reason.
17. **Independent challenge** — Fable review + Lead adjudication converge with no unresolved material 4C finding before operator ratification.

## 24. Explicit non-scope

4C MUST NOT:

```text
begin Product implementation
begin 4D
select final Project Paved Road/runtime
select final code generator merely because 4B proved viability
select concrete frontend SDK/helper APIs
select final state-management library
select component-library/design-system package
select backend router/framework
select ORM/query builder or physical persistence
change Product meaning to simplify a screen
create screen-shaped/BFF Product API
create parallel Product DTO/schema authority
implement Keycloak/session authorization mechanics
implement handlers, migrations, Sankhya sync or Product frontend
claim fixture prototype proves runtime/backend behavior
require final brand/visual design to close 4C unless separately operator-required
```

Visual design may occur later. If it changes locked IA, material fields/actions, reading order, region priority, density class, responsive structure or workflow meaning, the smallest affected 4C block must be re-adjudicated rather than silently redesigned.

## 25. Stop / reopen conditions

STOP and reopen only the smallest owning authority when:

- a real accepted human goal cannot be completed without a Product capability absent from 4A;
- a material interaction requires truth or semantics the canonical 4B wire cannot express;
- an accepted operation cannot obtain a coherent human consumer without fabricating need;
- a locked candidate requires an identity/scope/disclosure rule contradictory to accepted authority;
- generated consumption cannot preserve 4B semantics without a second editable transport authority;
- a Product read/write would require frontend-owned lifecycle, authorization or business truth;
- Budget Analyzer interaction requires analytics/history meaning not admitted upstream;
- a real interaction proves accepted IA/frontend Phase-3 semantics materially contradictory rather than merely requiring realization choice.

Do not reopen 4A/4B for visual preference, component convenience, route aesthetics, framework ergonomics, reference-product symmetry or hypothetical future scale.

## 26. Exit condition

4C can close only when the exact candidate establishes:

```text
complete human-goal / end-to-end flow inventory
+ complete frontend operation consumer/disposition census
+ operator-adjudicated information architecture and material structural blocks
+ complete Screen Contracts / bidirectional 4A↔4B trace
+ generated transport consumption law with zero parallel Product DTO authority
+ explicit state ownership and honest material truth/outcome UX
+ browser authentication/session interaction boundary without client authorization authority
+ accessibility/responsive structural viability
+ derived interaction-pattern vocabulary without premature component/SDK design
+ feature/package topology derived only after interaction closure
+ exact Budget Analyzer frontend proving instance
+ zero invented frontend Product operations
+ zero screen-shaped/BFF Product authority
+ zero unresolved material assumptions/findings
+ whole-4C adversarial proof
+ independent Fable review and Lead adjudication
+ repository verification green
+ explicit operator 4C ratification
```

4C closure makes the accepted frontend interaction/authority model eligible as an input to **4D**. It does **not** make Product implementation eligible and does not authorize any Product code.
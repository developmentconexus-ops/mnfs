# 4A — Product Surface & Authority Contract

Current mutable status and exact next action live only in [../roadmap.md](../roadmap.md). This document owns the bounded 4A contract for deriving the complete admitted F1 Product operation surface from already-accepted Product and architecture authority.

## 1. Decision question

> What is the smallest complete Product operation and authorization contract that lets every accepted F1 human/headless consumer use Conexus without forcing backend, frontend or runtime implementation to invent Product meaning locally?

4A is semantic/product authority work. It is not HTTP design and it is not implementation.

## 2. Root cause to prevent

The failure class is:

```text
screen / handler / worker needs behavior
→ no canonical Product operation exists
→ local code invents endpoint, Permission, DTO, scope or outcome
→ implementation convenience silently becomes Product authority
```

4A must make that impossible for admitted F1 capability.

## 3. Inputs

Derive only from current accepted authority, principally:

- [Product Contract](../product/contract.md);
- [Architecture overview](../architecture/index.md);
- current owning technical references routed from those documents;
- [Decision Register](../decisions/index.md);
- C-015 Keycloak refinement;
- accepted 3N/3O falsifiers and proof obligations;
- [Phase 4 Implementation Readiness Program](4-implementation-readiness-program.md).

Research, sibling repositories and reviewer findings may inform method or expose questions, but they are not Conexus Product authority.

### 3.1 Non-authoritative planning-harness hypothesis to adjudicate

The [Blueprint Harness design input](../development/blueprint-harness-design.md) records a provider-independent reconstruction of the strongest planning/research/review/Paved-Road behavior observed across current project work.

It is deliberately **not** an accepted Product contract. In particular, the working names `Blueprint` and `Forge`, any proposed planning/execution mode, and any candidate harness-facing operation must pass the same 4A admission law as every other Product interaction:

```text
real accepted/current F1 meaning
+ real consumer
+ one semantic owner
+ safe authority/scope
+ falsifiable behavior
```

If the useful behavior can remain internal Builder orchestration without becoming a Product capability, 4A must keep it internal rather than inventing a mode/API for symmetry.

## 4. Required canonical output

4A must produce one canonical durable Product operation ledger under `docs/product/` before 4B opens.

Because Conexus is a **software platform that publishes Project-defined applications**, closure is not one dishonest global number pretending that all future application business operations are already known. The ledger must close three distinct surfaces:

### 4.1 Closed Conexus platform operation census

A finite exact census of Conexus-owned F1 Product operations whose meanings are fixed by the platform itself, including applicable Control Plane, platform administration, Builder/Brain/Connections/Release, Published-App platform access, Product-Agent runtime and other current platform semantics.

```text
platform operations = N_platform
platform operations with owner/consumer/authority closure = N_platform
orphaned platform operations = 0
speculative platform operations = 0
```

`N_platform` emerges from derivation and is frozen only when closure is proven.

### 4.2 Project-defined capability operation grammar

Project business applications can define exact Release-pinned operations that cannot be globally pre-enumerated by Conexus without defeating the Product model. 4A must therefore define the closed **admission grammar and authority law** for Project-defined operations, including the accepted capability regimes such as:

```text
registered Query
registered Action
provider-aware Integration Operation where honestly required
Brain-bound AnalyticQuery where explicitly admitted
```

This grammar must establish how an exact Project/Release operation gains one owner, input/output meaning, caller/consumer, scope, authorization route, effect/read regime, current binding dependencies and proof obligations. The runtime may execute only operations admitted by the exact active Release/tool/capability projection; there is no global `execute(anySlug, anyInput)` authority.

Every concrete software-publishing Release still has a finite exact operation set:

```text
exact Release R
→ exact Project-defined Product operation set Ops(R)
→ every operation has canonical semantic authority + generated/conforming wire
→ no mutable-latest or unregistered operation
```

4B will choose the executable wire representation of this grammar; 4A owns only its semantic/admission contract.

### 4.3 First-vertical concrete application census

The first Budget Analyzer is a current named Product consumer, so 4A must derive its exact Project-defined Product operation census rather than leave the grammar unexercised.

```text
Budget Analyzer operations = N_budget
supported Product-visible analytical result/capability homes = complete
operations admitted only to exercise platform machinery = 0
```

`N_budget` must emerge from the accepted Budget Analyzer semantics and 3O result/proof boundary; it is not chosen to resemble another repository and it does not become the universal operation count for future Projects.

### 4.4 Per-operation closure fields

For every concrete admitted operation in the fixed platform census and first-vertical census, and for every concrete operation admitted later through the Project capability grammar, the authority must derive at least:

```text
operation semantic name
Product surface / ingress class
semantic owner
consumer class(es)
principal / actor class
ordinary Permission or explicit special authenticated/system condition
scope / containment root
read | command | decision | other exact semantic class
current-authority / eligibility requirements
disclosure behavior
knowledge/freshness/outcome semantics
idempotency requirement where consequential intake can repeat
concurrency/precondition requirement where stale authority/state matters
exact owner facts changed or read
cross-owner authority dependencies
proof/falsifier route
explicit non-effects / forbidden shortcuts where material
```

Names in this list are fields of the semantic ledger, not a requirement for one database table or one HTTP schema.

## 5. Surface separation

4A must classify every externally reachable interaction into the correct authority class and prevent mixing:

```text
Control Plane Conexus platform operation
!= Published Application platform/access operation
!= exact Project-defined application capability operation
!= Product Agent interaction/headless Product surface
!= Technical Ingress / provider protocol
!= OIDC / Keycloak authentication protocol
!= internal owner/substrate/runtime mechanic
```

An internal owner method, queue event, provider callback or framework route is not promoted to a Product operation merely because software must execute it.

Conversely, an accepted Product interaction may not disappear into an undocumented internal mechanism.

## 6. Operation admission law

An operation is admitted only when all are true:

1. current accepted F1 Product meaning or an exact admitted Project/Release Product contract requires it;
2. exactly one semantic owner owns its primary meaning;
3. at least one real current consumer class exists;
4. its authority/scope can be expressed without inventing a new hidden policy domain;
5. it is not merely provider/framework/runtime choreography;
6. it cannot be represented more truthfully as an existing admitted operation/read model;
7. its positive and material negative behavior can later be falsified.

No operation is admitted solely for possible SaaS, future provider, future UI, planning-mode symmetry, framework symmetry or because an SDK/workflow could expose it elegantly.

A Project-defined operation is not platform authority merely because Conexus hosts or executes it. Its exact semantic meaning remains Project/Product authority closed into the exact Release.

## 7. Permission and principal derivation

4A must derive, not guess:

- the closed ordinary Permission vocabulary needed by fixed Conexus platform operations;
- the authorization-admission law Project-defined operations use without inventing a universal policy language;
- any special `authenticated`/system condition that is not an ordinary Permission;
- the principal/actor classes that can actually invoke each Product surface;
- exact Workspace/Project/Published-App containment and cross-surface non-implications.

Keycloak proves human authentication only. Keycloak roles, groups, organizations and Authorization Services do not define Conexus ordinary Permissions or Product grants.

Permission vocabulary should be semantic and stable enough for backend/frontend contracts without becoming a universal policy language.

## 8. Scope and disclosure law

Every operation must state the authority root from which current access is derived. Client-supplied identifiers are references only; server authority resolves current containment and grants.

4A must explicitly decide where the accepted security model distinguishes outcomes such as:

```text
401 unauthenticated
403 authenticated but denied
404 absent or intentionally non-disclosable
409 state/conflict
412 stale precondition/current-authority conflict
422 admitted validation/business-input failure
503 required dependency unavailable
```

These are semantic outcome classes at 4A. Exact Problem schema/code spelling belongs to 4B.

Unknown or non-disclosable state must never be converted into a convenient positive/negative answer.

## 9. Reads, commands and consequential behavior

4A must distinguish at least:

- ordinary current reads;
- creation/change commands;
- owner-specific decision/approval operations where current Product authority actually exposes them;
- consequential operations that require idempotency/reconciliation semantics;
- system-owned transitions that are not direct Product commands.

A lifecycle state does not imply one public operation per transition.

No generic `Approve`, `Execute`, `Sync`, `Retry`, `Refresh`, `SetStatus` or other convenience verb is admitted unless the owning Product contract genuinely has that meaning.

## 10. Current-authority and concurrency semantics

For security-sensitive or stale-state-sensitive operations, the ledger must identify the protected property before 4B chooses carriers or 4D chooses database/Paved-Road primitives.

Examples of semantic requirements already accepted include:

```text
current mutable authority must be rechecked through protected commit
stale grant cannot authorize a security-sensitive mutation
exact Release/binding revisions cannot silently follow latest
ambiguous effect cannot be blind-replayed
```

4A records which operations require these properties. It does not select SQL isolation, lock shape, ETag syntax, SDK helper or transaction framework.

## 11. Consumer coverage

Before 4A can close, every concrete admitted operation must have at least one named consumer class, for example:

```text
Control Plane human UX
Published Application human UX
Product Agent user/headless consumer
Dedicated Application service principal where current semantic surface exists
platform operator/admin UX
system-owned transition invoked only through an existing Product command
```

The exact consumer taxonomy must be derived from current Product authority; this list is illustrative, not an additional actor contract.

Required closure properties:

```text
platform operations = N_platform
platform operations with consumer class = N_platform
orphaned platform operations = 0

Budget Analyzer operations = N_budget
Budget Analyzer operations with consumer class = N_budget
orphaned Budget Analyzer operations = 0

Project capability grammar admits only exact Release-pinned operations with a named consumer/authority route
operations admitted only for speculative future = 0
```

The numeric censuses must emerge from derivation. They must not be chosen in advance or copied from another repository.

## 12. 4A proof package

4A is not accepted because a large list exists. The candidate must prove at least:

1. **Platform census closure** — every fixed Conexus platform operation name is unique and every admitted fixed F1 platform interaction maps to exactly one operation or explicit non-Product protocol/mechanic.
2. **Project capability grammar closure** — every Project-defined operation must be exact-Release admitted and owner/consumer/authority/proof closed; arbitrary/mutable/unregistered capability execution fails the grammar.
3. **First-vertical closure** — every Budget Analyzer user-visible capability/result path maps to an exact Project-defined operation or explicit unsupported disposition, with no operation added merely to exercise infrastructure.
4. **Owner closure** — each operation has one primary semantic owner; no generic API/Gateway/UI/PlanningHarness owner absorbs business meaning.
5. **Permission closure** — every protected operation has one current authorization route; no frontend visibility, prompt role or Keycloak claim substitutes for it.
6. **Scope closure** — Workspace/Project/Published-App containment is explicit and cross-scope use fails closed.
7. **Consumer closure** — no concrete admitted Product operation is orphaned.
8. **Ingress closure** — platform Product API, Published-App, exact Project capabilities, Product-Agent, Technical Ingress, OIDC and internal planning/runtime mechanics cannot be silently collapsed.
9. **Outcome closure** — known-empty/unknown/unsupported/partial and consequential accepted/pending/rejected/ambiguous classes remain distinct wherever current authority requires them.
10. **Idempotency/concurrency routing** — every operation that can reach an accepted idempotency or stale-current-authority obligation is marked before wire/runtime mechanism selection.
11. **Negative challenge** — deliberately proposed convenience operations such as generic sync/retry/approve, global `execute(anySlug, anyInput)`, screen-shaped endpoints or speculative planning-mode operations must be rejected unless current Product authority proves a real semantic gap.

Proof may use a small executable census/consistency guard if useful, but tooling is proof mechanics, not Product authority.

## 13. 4A working order

Use this order:

```text
1. recover accepted user/consumer journeys
2. enumerate material platform user/headless intents
3. map each intent to semantic owner
4. derive fixed Conexus platform operation/read model/command meaning
5. derive the Project-defined capability admission grammar
6. derive the first Budget Analyzer exact application operation census from accepted vertical semantics
7. derive principal + Permission + scope
8. derive outcome/disclosure/current-authority obligations
9. classify platform vs Published-App vs exact Project capability vs Technical Ingress vs protocol/mechanic
10. explicitly adjudicate planning/execution-harness interactions: Product capability or internal Builder mechanic
11. deduplicate overlapping operations
12. attack for missing and speculative operations
13. freeze exact censuses only after closure
```

Do not begin with routes, REST nouns, React screens, database tables, SDK methods or framework controllers.

## 14. Explicit non-scope

4A MUST NOT:

```text
create OpenAPI paths or schemas
select HTTP router/framework
select ORM/query builder
select physical PostgreSQL tables/indexes
select queue/scheduler implementation
select exact Node OIDC library or Keycloak version
create React routes/components
select router/form/design-system packages
define concrete backend/frontend/data SDK APIs
instantiate the Blueprint Harness in Mastra
create screen-shaped/BFF API
implement Product handlers
implement migrations
implement Sankhya integration
start R1–R7
```

Those decisions are routed to later Phase-4 stages.

## 15. Stop / reopen conditions

STOP and reopen only the smallest owning authority when:

- one accepted F1 journey cannot be expressed by any fixed platform operation, exact Project capability or explicit non-Product protocol/mechanic without inventing new Product meaning;
- two owners appear to own the same operation meaning;
- a required Permission/scope contradicts accepted I&A authority;
- a required Product interaction exists only as a provider/internal mechanic with no safe Product boundary;
- the Project-defined capability grammar cannot express a real accepted application operation without becoming an unsafe universal executor;
- an accepted 3N/3O falsifier becomes impossible to route from the proposed surface;
- closing either concrete census requires a new semantic owner, trust boundary or Product capability not already accepted.

Do not reopen for naming preference, REST aesthetics, sibling-repository symmetry, framework elegance or imagined future scale.

## 16. Exit condition

4A can close only when the exact candidate establishes:

```text
complete fixed Conexus platform operation census
+ closed Project-defined capability operation grammar
+ complete first Budget Analyzer application operation census
+ complete principal/Permission/scope mapping for concrete operations
+ complete owner mapping
+ complete current consumer mapping
+ complete ingress classification
+ explicit disposition of planning/execution-harness interactions as Product or internal mechanics
+ routed idempotency/concurrency/disclosure/outcome obligations
+ zero speculative/orphan concrete Product operations
+ internal/adversarial challenge passed
+ repository verification green
+ operator ratification explicit
```

Only then may 4B convert the accepted semantics into executable wire authority.
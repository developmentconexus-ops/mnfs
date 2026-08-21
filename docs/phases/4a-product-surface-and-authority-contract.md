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

## 4. Required canonical output

4A must produce one canonical durable Product operation ledger under `docs/product/` before 4B opens.

The ledger must enumerate every admitted F1 Product operation exactly once and derive, for each operation, at least:

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
Control Plane Product operation
!= Published Application Product capability/operation
!= Product Agent interaction/headless Product surface
!= Technical Ingress / provider protocol
!= OIDC / Keycloak authentication protocol
!= internal owner/substrate/runtime mechanic
```

An internal owner method, queue event, provider callback or framework route is not promoted to a Product operation merely because software must execute it.

Conversely, an accepted Product interaction may not disappear into an undocumented internal mechanism.

## 6. Operation admission law

An operation is admitted only when all are true:

1. current accepted F1 Product meaning requires it;
2. exactly one semantic owner owns its primary meaning;
3. at least one real current consumer class exists;
4. its authority/scope can be expressed without inventing a new hidden policy domain;
5. it is not merely provider/framework/runtime choreography;
6. it cannot be represented more truthfully as an existing admitted operation/read model;
7. its positive and material negative behavior can later be falsified.

No operation is admitted solely for possible SaaS, future provider, future UI or framework symmetry.

## 7. Permission and principal derivation

4A must derive, not guess:

- the closed ordinary Permission vocabulary needed by admitted F1 Product operations;
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

For security-sensitive or stale-state-sensitive operations, the ledger must identify the protected property before 4B chooses carriers or 4D chooses database primitives.

Examples of semantic requirements already accepted include:

```text
current mutable authority must be rechecked through protected commit
stale grant cannot authorize a security-sensitive mutation
exact Release/binding revisions cannot silently follow latest
ambiguous effect cannot be blind-replayed
```

4A records which operations require these properties. It does not select SQL isolation, lock shape, ETag syntax or transaction framework.

## 11. Consumer coverage

Before 4A can close, every admitted operation must have at least one named consumer class, for example:

```text
Control Plane human UX
Published Application human UX
Product Agent user/headless consumer
platform operator/admin UX
system-owned transition invoked only through an existing Product command
```

The exact consumer taxonomy must be derived from current Product authority; this list is illustrative, not an additional actor contract.

Required closure property:

```text
admitted Product operations = N
operations with consumer class = N
orphaned admitted operations = 0
operations admitted only for speculative future = 0
```

The numeric census `N` must emerge from derivation. It must not be chosen in advance or copied from another repository.

## 12. 4A proof package

4A is not accepted because a large list exists. The candidate must prove at least:

1. **Census closure** — every operation name is unique and every admitted F1 interaction maps to exactly one operation or explicit non-Product protocol/mechanic.
2. **Owner closure** — each operation has one primary semantic owner; no generic API/Gateway/UI owner absorbs business meaning.
3. **Permission closure** — every protected operation has one current authorization route; no frontend visibility or Keycloak claim substitutes for it.
4. **Scope closure** — Workspace/Project/Published-App containment is explicit and cross-scope use fails closed.
5. **Consumer closure** — no admitted Product operation is orphaned.
6. **Ingress closure** — Product API, Published-App, Product-Agent, Technical Ingress, OIDC and internal mechanics cannot be silently collapsed.
7. **Outcome closure** — known-empty/unknown/unsupported/partial and consequential accepted/pending/rejected/ambiguous classes remain distinct wherever current authority requires them.
8. **Idempotency/concurrency routing** — every operation that can reach an accepted idempotency or stale-current-authority obligation is marked before wire/runtime mechanism selection.
9. **Negative challenge** — deliberately proposed convenience operations such as generic sync/retry/approve or screen-shaped endpoints must be rejected unless current Product authority proves a real semantic gap.

Proof may use a small executable census/consistency guard if useful, but tooling is proof mechanics, not Product authority.

## 13. 4A working order

Use this order:

```text
1. recover accepted user/consumer journeys
2. enumerate material user/headless intents
3. map each intent to semantic owner
4. derive required operation/read model/command meaning
5. derive principal + Permission + scope
6. derive outcome/disclosure/current-authority obligations
7. classify Product vs Published-App vs Technical Ingress vs protocol/mechanic
8. deduplicate overlapping operations
9. attack for missing and speculative operations
10. freeze exact census only after closure
```

Do not begin with routes, REST nouns, React screens, database tables or framework controllers.

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
create screen-shaped/BFF API
implement Product handlers
implement migrations
implement Sankhya integration
start R1–R7
```

Those decisions are routed to later Phase-4 stages.

## 15. Stop / reopen conditions

STOP and reopen only the smallest owning authority when:

- one accepted F1 journey cannot be expressed by any operation without inventing new Product meaning;
- two owners appear to own the same operation meaning;
- a required Permission/scope contradicts accepted I&A authority;
- a required Product interaction exists only as a provider/internal mechanic with no safe Product boundary;
- an accepted 3N/3O falsifier becomes impossible to route from the proposed surface;
- closing the operation census requires a new semantic owner, trust boundary or Product capability not already accepted.

Do not reopen for naming preference, REST aesthetics, sibling-repository symmetry or imagined future scale.

## 16. Exit condition

4A can close only when the exact candidate establishes:

```text
complete admitted F1 Product operation census
+ complete principal/Permission/scope mapping
+ complete owner mapping
+ complete current consumer mapping
+ complete ingress classification
+ routed idempotency/concurrency/disclosure/outcome obligations
+ zero speculative/orphan Product operations
+ internal/adversarial challenge passed
+ repository verification green
+ operator ratification explicit
```

Only then may 4B convert the accepted semantics into executable wire authority.

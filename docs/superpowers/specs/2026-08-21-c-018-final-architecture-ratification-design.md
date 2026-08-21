# C-018 — Final Product Architecture Ratification Design

> Design/specification only. This file does not ratify C-018, authorize Product implementation, select realization mechanics, or reopen accepted phases by preference.

## Context

Current repository authority on `main` after Phase 3O closure is:

```text
3A–3O = CLOSED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
```

C-018 is the final Product architecture ratification gate. The accepted Product and architecture have already passed the staged Decision Loop, technology qualification, failure/recovery closure, whole-architecture verification, and first-vertical proof-contract challenge. C-018 therefore must not become a third architecture redesign or a ceremonial replay of 3N/3O.

## Goal

Define the smallest ratification continuity gate that can answer one question:

> Has the complete accepted Product architecture reached final ratification with no unresolved material contradiction, while preserving every implementation-dependent proof obligation and without converting ratification itself into implementation authority?

A positive C-018 result ratifies the accepted architecture as the current implementation target. It does not prove implementation-dependent properties that current authority intentionally routes to FIRST_BUILD or FIRST_PRODUCTION.

## Authority boundary

C-018 derives from current authority only:

- `docs/roadmap.md` for current stage and implementation gate;
- `docs/decisions/index.md` for C-018 meaning and decision disposition;
- `docs/architecture/index.md` for the current accepted structural projection;
- the already-closed 3A–3O authorities by reference, without recursively replaying their review history.

Research, historical Git content, qualification harnesses, reviewer output, and runtime/framework behavior remain Evidence or mechanism. They cannot create new Product requirements inside C-018.

C-018 must stop and return to the smallest owning decision only if current Evidence exposes a material Product, semantic-owner, trust-boundary, structural, or qualification contradiction. Preference for a different architecture is not a reopen trigger.

## Approaches considered

### A. Ratification continuity gate — selected

Verify continuity from all closed phases into one final architecture target, preserve routed future proof, keep Product implementation blocked, and require explicit operator ratification.

Why selected:

- preserves the completed 3N whole-architecture challenge rather than duplicating it;
- preserves the completed 3O vertical proof-contract challenge rather than simulating Product execution;
- minimizes new authority surface;
- makes the final decision explicit without weakening future falsification.

### B. New whole-architecture review

Rejected by default. A new global review would duplicate 3N and part of 3O without a new material falsifier. It becomes justified only if C-018 work itself exposes a real contradiction that the accepted authorities do not already resolve.

### C. Ratification plus immediate implementation authorization

Rejected. Current roadmap authority requires all of the following before Product implementation can begin:

```text
C-018 ratification
+
Realization Planning
+
explicit execution authority
```

Therefore:

```text
C-018 = RATIFIED
!=
Product implementation authorized
```

## Status model

### Opening state

Opening C-018 should make the gate visible without promoting its decision:

```text
3A–3O = CLOSED
C-018 = OPEN / RATIFICATION REVIEW
Product implementation = BLOCKED
```

`OPEN / RATIFICATION REVIEW` is a gate status only. It must not be interpreted as partial ratification.

### Ratified state

Only after every ratification condition is satisfied and the operator explicitly ratifies:

```text
3A–3O = CLOSED
C-018 = RATIFIED / OPERATOR RATIFIED
Product implementation = BLOCKED
```

Implementation remains blocked after C-018. A later Realization Planning / execution-authority gate must deliberately change Product implementation status.

## Ratification contract

C-018 may ratify only if all of the following are true on one exact candidate head.

### R1 — phase continuity

Every phase 3A–3O remains closed with its accepted result intact. C-018 may not silently reopen, supersede, or reinterpret an accepted phase.

Falsifier:

- a closed phase result is absent, contradicted, or weakened in current authority.

### R2 — architecture continuity

The current Product/architecture target remains internally coherent across the current decision register and architecture projection.

Falsifier:

- a current Product requirement lacks an owning architecture destination;
- two current owners claim the same semantic authority;
- a current structural or trust-boundary law contradicts another current law;
- a qualification state is promoted beyond its accepted tested scope.

### R3 — unresolved-contradiction closure

No material contradiction from 3N, 3O, or current authority remains unresolved.

Falsifier:

- a material finding still requires a Product/core-architecture/qualification reopen;
- C-018 discovers a new material contradiction and proceeds anyway.

### R4 — downstream proof preservation

All properties intentionally routed to FIRST_BUILD or FIRST_PRODUCTION remain mandatory and reachable from current authority.

Falsifier:

- C-018 treats deferred implementation-dependent proof as already proven;
- a routed proof family, 3N obligation, 3O contract obligation, or qualification remainder disappears by omission.

### R5 — no new architecture by ratification

C-018 creates no new Product requirement, semantic owner, trust boundary, runtime/database/framework choice, KPI meaning, deployment mechanism, or implementation detail merely to make ratification convenient.

Falsifier:

- the ratification package changes architecture instead of ratifying it, without entering the smallest owning Decision Loop.

### R6 — deny-only implementation gate

`Product implementation` remains `BLOCKED` both while C-018 is open and after it is ratified.

Falsifier:

- ratifying C-018 alone can mechanically or textually unblock Product implementation.

### R7 — repository and verification closure

The ratification candidate contains no temporary review material, preserves repository workflow constraints, and passes:

```text
npm ci
npm run verify
```

on the exact candidate head.

## Repository mechanism

C-018 should use one coherent branch and one Draft PR:

```text
branch: arch/c-018-final-ratification
base:   current main
```

Planned durable changes are intentionally small:

```text
docs/phases/c-018-final-architecture-ratification.md
docs/roadmap.md
docs/decisions/index.md
docs/index.md
scripts/check-current-state.mjs
tests/repository/repository-contract.test.mjs
```

The exact implementation may touch fewer files if existing mechanisms already enforce a condition. No generic ratification engine or new domain object is justified.

## Guard design

The current implementation guard must be tightened so that:

```text
C-018 RATIFIED
```

is necessary but not sufficient to unblock Product implementation.

The smallest current rule is deny-only:

```text
until a later authorized Realization Planning / execution gate changes it,
Product implementation must remain BLOCKED regardless of C-018 status.
```

C-018 does not need to invent the future authorization mechanism. It only prevents accidental early release.

A negative control should prove that changing Product implementation away from `BLOCKED` during either C-018 open or ratified state causes repository verification to fail.

## Review strategy

Do not automatically run another whole-architecture Fable review.

Independent review becomes required only if C-018 candidate work introduces or exposes a material Product, architecture, owner, trust-boundary, or qualification contradiction. Otherwise C-018 relies on the already-completed independent challenges in 3N and 3O and performs continuity/ratification only.

If an independent review is triggered, reviewer output remains Evidence and must use the isolated temporary review-channel workflow.

## Non-scope

C-018 does not:

- implement Product code;
- execute live Sankhya, runtime, deployment, migration, or production effects;
- run FIRST_BUILD/FIRST_PRODUCTION proofs early;
- choose exact runtime packages, deployment topology, database placement, sync mechanics, or framework patterns beyond already accepted/qualified authority;
- create a new Realization Planning phase/status unless current authority separately requires one;
- unblock Product implementation;
- delete or collapse forward proof obligations for convenience.

## Stop conditions

Stop C-018 and reopen only the smallest implicated owner/decision if current Evidence shows any of the following:

- a current Product requirement has no coherent architecture owner/boundary;
- current authorities contain a material semantic-owner or trust-boundary contradiction;
- accepted architecture depends on a qualification claim beyond its tested scope;
- a FIRST_BUILD/FIRST_PRODUCTION property can no longer be genuinely falsified within the accepted architecture;
- ratification would require a new Product requirement, semantic owner, trust boundary, or architecture mechanism.

## Success state

C-018 succeeds only when the operator explicitly ratifies the exact green candidate after the continuity contract above is satisfied.

The durable post-ratification state is:

```text
3A–3O = CLOSED
C-018 = RATIFIED / OPERATOR RATIFIED
Product implementation = BLOCKED
```

The next work after C-018 is Realization Planning under a separately authorized gate. Product implementation remains blocked until Realization Planning and explicit execution authority are satisfied.

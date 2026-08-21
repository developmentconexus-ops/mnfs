# Phase 4 — Implementation Readiness Program

Current mutable status and exact next action live only in [../roadmap.md](../roadmap.md). This document defines the stable purpose, order and exit law of the post-architecture readiness program. It does not authorize Product implementation.

## 1. Decision

Accepted Phase-3 architecture and accepted Realization Planning are necessary but not sufficient to begin Product code.

The implementation gate is refined as:

```text
accepted Product / architecture authority
→ 4A Product Surface & Authority Contract
→ 4B Executable Wire Contract
→ 4C Frontend Interaction & Authority Realization
→ 4D Runtime / Persistence / Process / Deployment Realization
→ 4E Whole-System Coherence & Golden Flows
→ 4F Implementation Program & Execution Graph
→ 4G Adversarial Implementation Readiness
→ explicit operator Product execution grant
→ Product implementation eligible
```

This is an implementation-readiness refinement, not a reopen of C-018 or 3A–3O by preference. Earlier authority reopens only when a concrete Phase-4 falsifier proves it materially incomplete or contradictory.

## 2. Why Phase 4 exists

The architecture currently fixes Product meaning, semantic owners, trust boundaries, persistence classes, runtime families, security and proof obligations. It does not yet provide one complete executable Product surface from which backend, frontend and runtime can be realized without inventing contract decisions during coding.

The program prevents this failure mode:

```text
implementation starts
→ screen or handler needs missing capability
→ developer invents endpoint / Permission / DTO / state / owner locally
→ implementation convenience becomes new Product authority
```

Instead:

```text
frontend need or runtime need
→ exact admitted Product operation / owner / Permission / wire contract exists
→ realize it

missing contract
→ STOP
→ reopen only the smallest owning Phase-4 or earlier authority
```

## 3. Program laws

The following are binding throughout 4A–4G:

```text
repository current authority > Phase-4 derivation > implementation mechanics
Product meaning before wire
wire before frontend topology
frontend interaction before server/runtime mechanism selection
mechanism != authority
frontend visibility != authorization
provider protocol != Product operation
technical ingress != Product API
unknown / partial / unsupported != zero / success
no screen-shaped second API authority
no manual parallel DTO authority
no operation without a current consumer class
no consumer interaction without an admitted operation/capability
no dependency before a concrete consumer/property
proof before implementation
```

A stage may discover a bounded upstream defect. It may not silently repair it in a downstream mechanism.

## 4. 4A — Product Surface & Authority Contract

4A derives the complete admitted F1 Product operation surface from current Product/architecture authority before HTTP shape or frontend design.

It owns:

- Product operation census;
- operation semantics and owner;
- actor/principal classes actually admitted by F1;
- ordinary Permission vocabulary and special authenticated/system conditions where current authority requires them;
- Workspace / Project / Published-App / other exact scope rules;
- read versus consequential command semantics;
- current-authority, eligibility and disclosure requirements;
- knowledge/freshness/outcome classes that must remain distinguishable;
- idempotency and concurrency/precondition requirements at semantic level;
- Product API versus Published-App capability versus Technical Ingress versus internal-mechanic separation;
- consumer-class coverage for every admitted operation.

4A does not choose paths, HTTP methods, router/framework, database schema, frontend package topology or deployment mechanics.

Owning contract: [4a-product-surface-and-authority-contract.md](4a-product-surface-and-authority-contract.md).

## 5. 4B — Executable Wire Contract

4B converts accepted 4A semantics into one canonical machine-readable wire authority.

It closes, where applicable:

```text
operationId
method + path
request/response schemas
Problem codes
headers / cookies
pagination
ETag / If-Match / If-None-Match
Idempotency-Key
exact-byte / upload boundaries
authentication/session carriage
Product versus Technical Ingress routing
mechanically generated client/server projections
```

OpenAPI is the preferred Product wire authority where it fits the accepted surface. 4B remains router/runtime neutral and does not select database or deployment mechanics.

A frontend or backend implementation may not maintain a second hand-written wire/DTO authority.

## 6. 4C — Frontend Interaction & Authority Realization

4C derives the browser Product from 4A/4B rather than inventing backend capability from screens.

The derivation is bidirectional:

```text
Product journey → semantic owner → admitted operation/read model → UX home
frontend interaction → admitted operation → semantic owner → accepted Product journey
```

4C closes:

- human goals and workflows;
- App Shell / information architecture;
- semantic route/screen meanings;
- complete operation-to-consumer mapping for frontend-reachable operations;
- state ownership: server, URL/navigation, form draft, ephemeral UI and any proved additional class;
- honest unknown/partial/stale/outcome UX;
- generated transport consumption;
- browser auth/session interaction boundaries;
- low-fidelity wireframe proof sufficient to expose missing or invented capability;
- feature/package topology only after the interaction model is accepted.

Target proof includes:

```text
all frontend-reachable admitted operations covered
orphaned frontend operations = 0
invented frontend operations = 0
material interaction without admitted operation = 0
```

4C may expose a real 4A/4B gap. It must reopen that smallest contract rather than create a screen-shaped/BFF authority.

## 7. 4D — Runtime / Persistence / Process / Deployment Realization

Only after Product surface, wire and frontend consumers are known does 4D select concrete realization mechanics.

4D owns exact choices such as, when a current consumer requires them:

- Node/TypeScript module/package topology;
- API framework/router and exact supported versions;
- exact Keycloak release and standards-compliant Node OIDC client;
- PostgreSQL physical schema/tables/indexes/constraints;
- owner-role capabilities and transaction/concurrency primitives including CR-1 realization;
- migration tooling;
- Gateway and Sankhya/Oracle adapters;
- MAR queue/scheduler/job mechanics;
- process/binary topology;
- configuration/secrets;
- startup/readiness/shutdown;
- network/trust deployment realization;
- observability mechanics required by admitted proof/operation properties;
- backup/recovery mechanisms required by the accepted first-production contract.

Every material technology decision follows [Evidence-Grounded Realization Engineering](../development/production-realization-guide.md): protected property → strongest current evidence → `ADOPT | ADAPT | BUILD | DEFER | STOP` → proof.

4D must not add a platform capability merely because a selected framework provides it.

## 8. 4E — Whole-System Coherence & Golden Flows

4E verifies that Product semantics, wire, frontend and runtime realization form one system before an implementation graph is authorized.

It composes representative positive and negative flows across real boundaries. The first Budget Analyzer path remains mandatory:

```text
Keycloak authentication
→ Conexus session/current authorization
→ Workspace
→ Project
→ Brain binding
→ Sankhya Connection binding
→ governed sync
→ Project read model
→ registered Query
→ exact Release / serving
→ Published Application
→ independent live-source reconciliation
```

Negative flows must demonstrate fail-closed behavior for materially reachable classes such as wrong Workspace, revoked/narrowed authority, stale Release, wrong Connection, unsupported semantic meaning, partial/unverifiable source coverage, invalid serving bytes and recovery/continuity faults at their owning stage.

3N falsifiers and `3O-P1..P7` remain routed proof obligations; 4E composes them with the concrete 4A–4D realization instead of creating a new Proof owner.

## 9. 4F — Implementation Program & Execution Graph

4F converts accepted realization into bounded implementation work.

The accepted [Realization Planning — First Build](realization-planning.md) becomes an **execution skeleton/input** here, not direct authority to code after Phase 3.

4F must rederive R1–R7 against the now-exact 4A–4E contracts. Each implementation slice receives, at minimum:

- exact Product operations/consumers it realizes;
- owning modules and allowed persistence surfaces;
- exact wire contracts and generated projections;
- frontend consumers where applicable;
- admitted dependencies and version pins;
- migrations/config/process surfaces allowed to change;
- proof/falsifier obligations;
- prerequisites and stop/reopen triggers;
- completion criteria.

No slice may be kept merely because it appeared in the earlier planning skeleton if 4A–4E Evidence shows a smaller or different graph is correct.

## 10. 4G — Adversarial Implementation Readiness

4G is the final independent attack before Product execution can become eligible.

The review must challenge at least:

```text
orphan operation
consumer without operation
invented frontend operation
missing Permission/scope
Permission broader than accepted authority
owner duplication
screen-shaped API
parallel DTO/wire authority
runtime mechanism without consumer
persistence class without owner/invariant
technology/dependency without proved property
unfalsifiable golden flow
R1–R7 ordering contradiction
Phase-3 falsifier no longer reachable by a real proof path
```

Findings are Evidence, not automatic requirements. Material findings reopen only the smallest implicated authority and require operator adjudication where they change an accepted decision.

## 11. Final implementation eligibility

Product implementation remains blocked until all are true:

```text
4A CLOSED / OPERATOR-RATIFIED
4B CLOSED / OPERATOR-RATIFIED
4C CLOSED / OPERATOR-RATIFIED
4D CLOSED / OPERATOR-RATIFIED
4E CLOSED / OPERATOR-RATIFIED
4F CLOSED / OPERATOR-RATIFIED
4G CLOSED / independent challenge converged
repository current authority coherent on exact integrated main
operator Product execution authorization explicit
```

No architecture ratification, Realization Planning acceptance, CI success, PR merge, reviewer approval or framework qualification implicitly satisfies the final operator execution grant.

## 12. Reopen and YAGNI law

Phase 4 does not reopen Phase 3 to improve aesthetics, copy sibling repositories or prebuild future optionality.

A reopen requires material Evidence that the accepted authority cannot express or safely falsify a real current F1 requirement.

The program must prefer:

```text
complete required contract
+ smallest realization
+ explicit future seam
- speculative operation
- speculative screen
- speculative dependency
- speculative abstraction
```

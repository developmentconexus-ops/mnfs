# 3D-02 — Fable Independent Capability Gateway Dependency Review Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Phase:** 3D — Dependency Architecture  
**Target:** 3D-02 — Capability Gateway Dependency Architecture  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Prepared against:** `1f41d81057067e83c692677c7c13cf1f7694606a`  
**Important:** this file is a reviewer brief. It is not C-018, not a 3D Decision, not architecture authority, and does not authorize implementation, merge, PR readiness, or 3E.

---

## 1. Role

Act again as an **independent Senior/Staff/Principal Software Engineer and Software Architect**.

Do not rubber-stamp 3D-01. `3D-01-macro-dependency-architecture.md` is now approved architecture authority for bounded work, but **Authority freezes execution, not inquiry**. If stronger evidence exposes a material flaw, raise a Finding rather than silently designing around it.

Reason down to implementation reality:

- TypeScript package/import direction;
- what object/function would actually call what;
- what facts would cross each boundary;
- which facts are immutable refs versus revocable authority;
- where TOCTOU can actually occur;
- what module would need to import which types/values;
- where a direct table/internal access shortcut would be tempting;
- where testability/replaceability is real versus ceremonial.

Do not implement product code.

---

## 2. Mandatory authority reconstruction

Before reviewing 3D-02:

1. read `AGENTS.md` and follow its read order;
2. read `docs/conexus/phase3/LEDGER.md` early;
3. reconstruct C-000..C-017 from `docs/conexus/DECISOES.md` and linked authorities as needed;
4. read all of 3D-01;
5. read the previous independent review, but treat it as non-authoritative input only.

Minimum task-specific authorities:

```text
docs/conexus/phase3/3D-01-macro-dependency-architecture.md
docs/conexus/phase3/3D-FABLE-R0-independent-dependency-review.md
docs/conexus/phase3/3C-R1-cross-review-closure.md
docs/conexus/phase3/3C-08-capability-gateway-module-boundary.md
docs/conexus/phase3/3C-07-connections-module-boundary.md
docs/conexus/phase3/3C-10-production-agent-runtime-module-boundary.md
docs/conexus/phase3/3C-15-managed-application-runtime-boundary.md
docs/conexus/phase3/3C-11-release-module-boundary.md
docs/conexus/phase3/3C-06-artifact-registry-module-boundary.md
docs/conexus/phase3/3C-04-project-module-boundary.md
docs/conexus/phase3/3C-02-identity-access-module-boundary.md
docs/conexus/phase3/3C-09-brain-module-boundary.md
docs/conexus/phase3/3C-05-builder-module-boundary.md
docs/conexus/phase3/3C-13-observability-audit-module-boundary.md
docs/conexus/phase3/3A-R5-builder-coding-runtime-reassessment.md
```

Follow any additional precedence/read links those authorities require.

Do not use conversation memory as authority.

---

## 3. Frozen baseline from 3D-01 — challenge only through Finding

3D-01 currently freezes, among other things:

```text
import graph must be a DAG
direct in-process call is default when one-way and safe
application/use-case orchestration is exceptional and named
cross-module tables/internals access is forbidden
immutable/content-addressed facts may travel
revocable authority is revalidated at the owner near execution
Gateway may directly consume narrow projections from:
  Identity & Access
  Project
  Artifact Registry
  Connections
  Release
Production Agent Runtime → Gateway is allowed
Gateway → Production Agent Runtime direct import is forbidden
approval requires one narrow dependency-inversion capability
Release → Builder direct import is forbidden
shared transaction atomicity may cross owners without crossing data ownership
shared substrate must not create hidden mutable coupling
```

Your job is to determine whether this macro shape remains correct when the **Gateway hot path** is designed concretely enough to expose hidden cycles, TOCTOU, god-module pressure or authority duplication.

---

## 4. Core question

Answer:

> **Exactly which authoritative facts may Capability Gateway depend on directly, which caller facts must arrive as narrow context/ref, which facts must be revalidated at execution time, and what is the smallest dependency shape that preserves fail-closed admission without turning Gateway into a policy/god module?**

---

## 5. Required review questions

### A. Direct owner dependencies

For each proposed direct edge, determine whether it is truly necessary:

```text
Gateway → Identity & Access
Gateway → Project
Gateway → Artifact Registry
Gateway → Connections
Gateway → Release
Gateway → Observability
```

For each edge answer:

- exact current consumer/failure class;
- exact narrow fact/projection required;
- whether the Gateway needs a current owner lookup or an immutable caller-provided ref would suffice;
- whether the lookup can create a reverse dependency elsewhere;
- what must explicitly remain outside the projection.

Do not create an interface merely because the owner is another module.

### B. Caller surfaces

Review separately:

```text
Builder → Gateway
Production Agent Runtime → Gateway
Managed Application Runtime → Gateway
QualifyConnectionUseCase → Gateway
AnalyticQueryUseCase / Brain probe orchestration → Gateway
```

What minimal context/ref does each caller provide?

What must the Gateway derive/revalidate itself?

Do **not** invent a `UniversalExecutionContext` or one generic caller envelope unless a real common semantic core proves necessary.

### C. Approval revalidation capability

3D-01 admits exactly one domain dependency inversion for approval revalidation.

Attack it adversarially.

Determine:

- what fact must be checked atomically/near-atomically;
- what exact execution identity it must bind to;
- whether approval can be consumed/replayed/stale/revoked;
- whether the Gateway must only ask `valid?` or needs claim/consume semantics;
- where the transaction boundary belongs conceptually;
- whether the port can stay approval-specific rather than become generic authority verification;
- whether another architecture removes TOCTOU with less machinery.

Do not freeze TypeScript syntax unless it changes the architecture.

### D. Release / candidate resolution

3C-08 uses `releaseOrCandidatePermits`.

Define the dependency problem precisely for:

```text
Published/Managed runtime
Production Agent Runtime
Builder candidate/discovery
Connection qualification
Brain probes
```

Questions:

- when must Gateway consult current `active Release`?
- when should caller pass an immutable candidate/composition ref instead?
- how do we avoid making Release aware of Builder/Gateway callers?
- how do we prevent a stale active pointer from being treated as immutable context?
- is one `ActiveReleaseComposition` projection sufficient, or does it risk turning Release into a runtime policy aggregator?

### E. Project bindings

Gateway needs Project binding authority without importing Project internals.

Determine the smallest facts needed for:

```text
ProjectConnectionBinding
ProjectBrainBinding where relevant
Project Config/runtime profile where relevant
same-Workspace validation
logical slot → exact revision resolution
```

Be explicit about what belongs to Project versus Connections/Brain/Release.

### F. Connections and credential custody

Attack the proposed `Gateway → Connections` edge.

Gateway needs enough to execute without turning Connections into an external-call proxy or letting Gateway own Connection lifecycle.

Review:

```text
ConnectionRevision
ConnectorDefinition ref
target/environment
CredentialHandle/logical grant relationship
qualification/eligibility
health
revocation
credential backend resolution
```

Which are pinned?
Which are revocable?
Which must be checked on every effect/read versus only at qualification/promotion?

Preserve:

```text
Connection owns reachability/qualification semantics
Gateway owns physical controlled execution
credential backend owns secret material
```

### G. Artifact Registry

Gateway must resolve exact executable definition/classification without Registry becoming execution authority.

Determine the minimum projection for:

```text
query
action
integration / ConnectorOperation
possibly job-originated capability calls
agent ToolProjection execution path
```

Check whether output/input schema, effect classification, approvalFloor, idempotency semantics and executor classification belong entirely to compiled ArtifactRevision projection or require another semantic owner lookup.

Do not move domain meaning into Registry merely to simplify Gateway.

### H. Budgets, rate limits and admission state

3C-08 says budget definition stays in owners/policy while Gateway enforces physical limits where necessary.

This is a god-module pressure point.

Answer:

- who defines each current budget class;
- what Gateway actually owns versus consumes;
- what must be durable for effect budgets;
- what may stay lightweight for reads;
- whether Gateway may own a small admission ledger without becoming budget policy authority;
- how budget reservation, approval, idempotency and physical effect claim compose atomically enough to prevent overspend/double effect;
- what belongs later to 3E/3G rather than 3D.

### I. Preconditions / idempotency / OUTCOME_UNKNOWN

Review the dependency implications of:

```text
precondition semantics owned by capability/domain contract
physical precondition enforcement owned by Gateway
idempotency identity
effect claim
traffic_state
receipt
OUTCOME_UNKNOWN
retry eligibility
```

Identify which facts are parameters from a compiled capability versus current owner lookups.

Do not turn Gateway into business-rule engine.

### J. Observability and audit

Gateway emits `GATEWAY_AUTHORITY` evidence and material effect audit.

Check whether:

```text
Gateway → Observability
```

is enough, and ensure no correctness/authorization path depends on reading Observability back as authority.

Audit-required fail-closed must be represented without making Observability a policy owner.

### K. Transaction and TOCTOU map

Produce a concrete TOCTOU analysis for at least:

```text
session/access revoked during call
active Release changes during call
Connection credential/grant revoked during call
approval revoked/consumed during call
budget consumed concurrently
idempotency duplicate racing
precondition changes between read and effect
```

For each, classify:

```text
must be same transaction / same atomic admission
must be revalidated immediately before effect
can tolerate bounded stale read
immutable ref — no revalidation required
belongs to external-system concurrency contract
```

Do not invent distributed transaction machinery.

### L. Gateway god-module falsification

The previous review identified Gateway as the module most likely to become a god module by accretion.

Give the strongest argument that the current Gateway boundary is too broad.

Try to split it or shrink it.

Then show whether the split actually eliminates more machinery than it creates.

Pay special attention to whether:

```text
Admission + Execution
```

should remain together as 3C-08 decided or whether new evidence creates a material Finding.

If no Finding, state why the boundary remains globally preferable.

---

## 6. External comparison / global optimum

Do fresh research when it can change a decision. Prefer primary sources.

Use the empirical Mitra corpus already in the repo and compare with current relevant architecture patterns such as, when decision-relevant:

```text
Factory.ai
Mastra
Kubernetes authn/authz/admission
Envoy ext_authz / policy enforcement boundaries
Backstage permission/plugin contracts
Nango/credential connection boundaries
Stripe/idempotency/effect APIs
mature modular-monolith references
```

Do not cargo-cult these systems.

For each external pattern used, say explicitly:

```text
what fact/pattern is observed
what Conexus decision it supports or challenges
why the transfer is valid despite product differences
```

If external best practice conflicts with current authority but does not improve the Conexus use case, reject it explicitly.

---

## 7. YAGNI / anti-overengineering

Actively try to avoid introducing:

```text
PolicyEngine
AuthorizationProvider framework
UniversalAdmissionContext
CallerAuthorityVerifier generic
CapabilityInvocation universal bus
command/event bus
workflow engine
executor plugin registry
generic ContextProvider
read-model package per owner
repository interface ceremony
microservices/network hops
```

A new abstraction must identify its current consumer and named failure class.

---

## 8. Deliverable

Create a non-authoritative independent review at:

```text
docs/conexus/phase3/3D-FABLE-R1-capability-gateway-dependency-review.md
```

The review must include:

1. verdict;
2. reconstructed authority;
3. exact proposed Gateway dependency graph;
4. direct dependencies with justification;
5. per-caller context model at semantic level;
6. approval revalidation dependency shape;
7. Release/candidate resolution rules;
8. Project/Connection/Registry projection boundaries;
9. budget/admission ownership split;
10. TOCTOU matrix;
11. allowed/forbidden import edges involving Gateway;
12. interfaces/ports rejected as overengineering;
13. Findings classified against current authority;
14. external comparison with decision value;
15. strongest counterargument and attempted falsification;
16. exact recommendation for what 3D-02 should freeze versus defer to 3E/3F/3G/3H/3I/3M.

Do not update `LEDGER.md`.
Do not modify approved decision docs.
Do not implement product code.
Do not merge.
Do not mark PR ready.
Do not start 3E.

Commit and push only the review artifact to the existing branch, then report the resulting commit SHA.

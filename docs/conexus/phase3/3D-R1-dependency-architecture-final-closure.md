# 3D-R1 — Dependency Architecture Final Closure

**Status:** APPROVED / CLOSED by operator on 2026-08-15  
**Phase:** 3D — Dependency Architecture  
**Authority:** final reconciliation of 3D-01..3D-04 after adversarial cross-review  
**Important:** this decision does not constitute C-018, does not close Phase 3, does not authorize product implementation, merge, or PR readiness.

## Decision in one sentence

Dependency Architecture is **CLOSED / APPROVED**: the Conexus F1 Hub remains a modular monolith with an acyclic module import graph, direct narrow in-process calls by default, seven exceptional control-plane orchestration flows, one narrow domain inversion for effect approval claim, four justified infrastructure boundaries, strict module-owned data/invariant boundaries, and no speculative bus/provider/workflow abstractions.

---

## 1. Authority and reconciliation

This closure reconciles:

- C-000..C-017;
- 3B CLOSED;
- 3C CLOSED + 3C-R1;
- 3A-R5;
- 3D-01 — Macro Dependency Architecture;
- 3D-02 — Capability Gateway Dependency Architecture;
- 3D-03 — Application / Use-case Orchestration;
- 3D-04 — Remaining Module Dependency Closure;
- `3D-FABLE-R4-final-dependency-cross-review.md` as non-authoritative adversarial input.

Where earlier 3C dependency intentions are broader than the final graph, **3D-04 is the import-graph authority**. Ownership from 3C remains unchanged.

---

## 2. Final structural proof

The final graph has a strict topological order:

```text
OBS
< {IAM, WS, REG, RIGOR}
< {ATT, CON, BRN, PRJ}
< REL
< GW
< {BLD, PAR}
< MAR
< L7 / control-plane boundaries
```

The final cross-review checked every module edge and found **28/28 strict downward edges**. Therefore the import graph is acyclic.

Normative consequences:

```text
circular module imports        = prohibited
cross-module table access      = prohibited
deep imports into internals    = prohibited
module/runtime → L7            = prohibited
L7 as universal mediator       = prohibited
```

Observability remains a sink/leaf for emits and historical evidence; it never becomes current domain authority.

---

## 3. Default dependency rule

The default remains:

```text
Module A
→ narrow public internal API / projection of Module B
```

when the dependency is one-way and authority-safe.

Do not introduce by default:

```text
IModulePort
Adapter per module
CommandBus
Mediator
ServiceLocator
ApplicationService framework
EventBus
WorkflowEngine
```

A port or inversion must pay for a real failure class or replaceable substrate.

---

## 4. Application / use-case orchestration

Application orchestration is **control-plane-only** and stateless.

Exactly seven named F1 cross-owner flows are admitted:

```text
CreateProject
SetProjectBinding
QualifyConnection
InceptionInvestigation
BrainHealthProbe
ComposeRelease
PromoteRelease
```

Rules:

- modules/runtimes never invoke L7;
- use cases do not nest by default;
- use cases may own ordering and cross-owner atomic coordination;
- domain truth/invariants remain in their module owners;
- no orchestration transaction remains open across external I/O;
- adding a new use case requires re-applying the 3D-01 admission test.

Deletion-test formulation:

> Removing a use case may lose the coordinated flow; it must never remove the underlying domain truth.

`AnalyticQuery` is explicitly **not** an L7 use case:

```text
PAR → Brain + Gateway
MAR → Brain + Gateway
```

with the narrow `MAR → Brain` dependency approved for runtime analytic compilation/health projections.

---

## 5. Capability Gateway dependency boundary

Gateway remains the single MANAGED Admission + Execution boundary for governed Project Data / external capability execution.

Direct public dependencies:

```text
GW → I&A
GW → Project
GW → Artifact Registry
GW → Connections
GW → Release
```

It does not import Builder, PAR, MAR, Brain, Attachments, or their internals to inspect authority.

Surface-specific composition source remains normative:

```text
PUBLISHED_APP  → active Release pins
AGENT_RUN      → run-pinned composition
BUILDER        → approved Change/current Project intent
QUALIFICATION  → exact ConnectionRevision / ConnectorDefinition
```

Immutable/content-addressed facts may travel by ref. Revocable/material authority is revalidated at the relevant enforcement boundary.

---

## 6. Approval inversion

The **only domain dependency inversion in F1** remains the effect-approval capability:

```text
Gateway defines narrow approval-claim capability
PAR owns ApprovalRequest authority and implements it
composition root wires the dependency
```

Semantics:

- approval is bound to the exact effect/execution identity;
- effect approval is single-claim/replay-safe;
- the claim is atomically related to the admitted effect attempt;
- Gateway never reads PAR approval tables directly;
- no generic authority-provider framework is created.

Exact TypeScript signatures remain a 3F concern.

---

## 7. Final I&A rule

I&A is directly resolved at three current boundaries:

```text
L7 / Control Plane
Managed Application Runtime
Capability Gateway
```

Interior modules do not re-resolve the principal by importing I&A.

This rule does not mean `authorized=true` snapshots are universally trusted: Gateway still revalidates revocable/material authority where 3D-02 requires last-mile revalidation.

Guard notes:

- when `AgentTrigger EVENT` is activated, its external ingress must explicitly declare its authn/trust boundary;
- DEDICATED Platform Services identity exchange remains a 3F/3I problem.

---

## 8. Final module import matrix summary

Allowed structural module dependencies:

```text
Project      → Workspace

Connections  → Registry
Brain        → Registry

Release      → Project / Registry / Connections / Brain / Rigor

Gateway      → I&A / Project / Registry / Connections / Release
             → narrow approval capability implemented by PAR

Builder      → Project / Brain / Registry / Gateway / Rigor

PAR          → Release / Registry / Brain / Gateway

MAR          → I&A / Attachments / Brain / Release / Gateway / PAR
```

Most modules also emit to Observability/Audit through its public sink capability.

Explicitly absent examples:

```text
Release -X-> Builder
Release -X-> MAR
MAR     -X-> Project
MAR     -X-> Registry
Project -X-> Brain / Connections
Connections -X-> Gateway
Builder -X-> I&A
PAR     -X-> I&A
Attachments -X-> I&A
```

Cross-owner flows that would otherwise require reverse imports are handled by the seven named control-plane use cases.

---

## 9. Infrastructure boundaries and YAGNI closure

Only four infrastructure boundaries are frozen by 3D:

```text
CodingRuntime
CredentialBackend
BlobStore/CAS
GitInfra
```

Each has a real current consumer/failure class.

Deliberate non-boundaries:

```text
MigrationRunner
→ internal Release seam

job/v1 queue/scheduler machinery
→ internal MAR seam until 3H/3L proves a concrete substrate need

shared JobQueue/Scheduler port
→ rejected for F1

generic provider framework
→ rejected
```

A second real consumer with matching operational requirements may reopen the decision later.

---

## 10. Cross-module transaction rule

A single PostgreSQL transaction may span operations of multiple owners only for a real atomic invariant.

Current F1 example:

```text
CreateProject
BEGIN
  Project-owned operation
  I&A-owned initial grant operation
COMMIT
```

Rules:

```text
shared transaction != shared table ownership
```

- each module executes only its own persistence operations;
- no module writes another module's tables;
- no transaction remains open across external network I/O;
- physical transaction-context realization belongs to 3E.

---

## 11. Known routed work — does not reopen 3D

| Item | Later owner |
|---|---|
| AgentRun in-flight policy narrowing after stricter Release | 3G / 3I |
| MAR route→Project serving mapping representation | 3E / 3J |
| Archived Project with active Release behavior | 3G / 3I |
| Project binding contracts | 3F |
| DEDICATED identity/authority exchange | 3F / 3I |
| DEDICATED egress/network policy | 3I / 3J |
| MANAGED/DEDICATED deployment topology | 3J |
| Mastra runtime/storage isolation realization | 3E / 3H |
| Mastra telemetry ↔ Conexus correlation | 3H / 3L |
| Verification Observability realization | 3H / 3L / 3N |
| job/v1 queue/scheduler substrate | 3H / 3L on concrete need |
| canonical product repo/cutover | 3A/operator before implementation |

No routed item changes the final dependency graph unless a future material Finding explicitly reopens it.

---

## 12. Intake to 3E — Data Architecture

3E may now start without re-deciding module ownership or dependency direction.

Minimum intake from 3D:

```text
1. physical data ownership/schema boundaries per module
2. Gateway admission/effect ledger
   - budget enforcement state
   - idempotency claims
   - admitted attempt / traffic state / receipt linkage
3. atomic realization of CreateProject cross-owner transaction
4. atomic relationship between effect approval claim and Gateway admission
5. physical representation of MAR route→Project serving mapping
6. Observability/Audit persistence and derived lineage projections
7. Mastra substrate storage partition/isolation between Builder and PAR
8. representation of approved narrow public projections/refs
9. no cross-owner persistence shortcut that recreates hidden authority
```

3E must not create shared database ownership merely because F1 uses one PostgreSQL.

---

## 13. Anti-overengineering guardrail carried forward

Closing 3D does not authorize:

```text
microservices
ApplicationLayerModule
EventBus / CommandBus
workflow DSL / workflow engine
universal mediator
generic binding framework
policy engine / OPA / Cedar / OpenFGA
JobModule / SchedulerModule
shared JobQueue abstraction
MigrationRunner provider framework
UniversalExecutionContext
CallerAuthorityVerifier framework
Gateway split / AdmissionCore
Kafka / Kubernetes / Temporal by default
outbox/inbox for hypothetical local communication
```

These return only with a named current consumer/failure class.

---

## 14. Formal closure

Operator approval on 2026-08-15 ratifies:

```text
3D-01 = APPROVED
3D-02 = APPROVED
3D-03 = APPROVED
3D-04 = APPROVED
3D-R1 = APPROVED

3D — Dependency Architecture = CLOSED / APPROVED
3E — Data Architecture = NEXT
```

Phase 3 as a whole remains open until C-018. No product implementation is authorized by this closure.

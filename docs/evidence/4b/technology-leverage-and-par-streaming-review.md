# 4B Evidence — Technology leverage and PAR streaming review

> **Status:** OPERATOR-APPROVED BOUNDED EVIDENCE / NOT TECHNOLOGY-SELECTION AUTHORITY  
> **Phase:** 4B — Executable Wire Contract  
> **Scope:** realization leverage relevant to the next Product Agent Runtime wire slice  
> **Implementation:** BLOCKED  
> **Authority:** current Product/architecture/4A/4B authority remains above this Evidence

## 1. Question

Before freezing `PAR-01 → PAR-16`, does current upstream technology Evidence show that Conexus would create unnecessary custom runtime/frontend/sandbox/scheduler machinery by treating previously qualified framework primitives too narrowly?

The review is intentionally bounded. It may:

```text
clarify a 4B wire boundary
identify native mechanics that 4D should prefer/evaluate
turn an old exact pin into a repin checkpoint
identify a real requalification trigger
```

It may not:

```text
change Product meaning
reopen accepted owners by preference
select a 4D runtime/framework/database/codegen stack early
install Product dependencies
implement PAR/Builder/MAR
turn a current upstream feature into Product authority
```

## 2. Method

The current realization companion already states the governing order:

```text
current Conexus property
→ standard/native/mature mechanism
→ ADOPT | ADAPT | BUILD | DEFER | STOP
```

and requires an exact evidenced gap before `BUILD`.

This review sharpens how that rule is applied in practice:

```text
framework has a bug
-X-> automatically build a replacement

framework exposes more capability than Conexus needs
-X-> automatically wrap/reimplement all of it

framework solves the required mechanism safely enough behind a narrow owner boundary
→ prefer native adoption

one Conexus semantic invariant remains outside framework responsibility
→ keep only that thin boundary
```

For each candidate mechanism, weigh:

1. native fit to the protected property;
2. whether adoption moves Product/owner authority;
3. reachable F1 risk rather than hypothetical maximum risk;
4. custom code and operational machinery eliminated;
5. maturity/current upstream maintenance;
6. ability to pin and falsify the few material failure classes;
7. reversibility behind the existing semantic boundary.

## 3. Evidence basis

### Repository/current authority

- `docs/development/production-realization-guide.md` — adopt/adapt/build/defer/stop law.
- `docs/reference/mastra/framework-findings.md` — framework-first 3L correction and native Mastra map.
- `docs/reference/mastra/current-mapping.md` — current Conexus/Mastra ownership split.
- `docs/reference/mastra/qualification-and-reopen-triggers.md` — exact requalification triggers and current defect-class guards.
- `docs/reference/runtime-and-agents.md` — PAR/Builder runtime semantics.
- `docs/reference/builder-and-harness.md` — current Builder → Mastra Workspace → E2B line.
- `docs/reference/managed-execution.md` — current pg-boss private MAR substrate.
- `docs/reference/frontend-and-product-surfaces.md` — React/TypeScript/Vite/TanStack current paved-road direction.
- `.agents/skills/mastra/SKILL.md` — vendored official Mastra skill v2.1.0, which explicitly requires current docs/source verification before Mastra implementation.

### Current upstream / documentation Evidence observed on 2026-08-22

Mastra / Context7:

- Context7 library `/mastra-ai/mastra` current docs for `Agent.stream()`, stream chunks, `DurableAgent`, schedules, Workspace/E2B and `@mastra/ai-sdk` integration.
- Mastra `Agent.stream()` exposes typed event chunks including text, sources, tool calls/results, approval/suspension, finish/error and optional reasoning/raw material.
- `@mastra/ai-sdk` converts Mastra streams to AI SDK UI streams and supports React `useChat` integration.
- `DurableAgent` provides cache/PubSub-backed resumable event streams with `stream`, `observe`, `resume` and recovery surfaces.
- Mastra Workspace has a provider contract implemented by `@mastra/e2b`; current E2B integration supplies sandbox lifecycle, commands, networking, processes/mounts and reconnect/retry mechanics.
- Mastra schedules support agent/workflow scheduling, cron/timezone and threadless/threaded agent modes.

Current Mastra public release material used as freshness Evidence:

- `https://mastra.ai/blog/ai-sdk-v7-support` — AI SDK v7 integration and UI stream helpers, 2026-08-18.
- `https://mastra.ai/blog/introducing-durable-agents` — resumable streams for disconnect/refresh/network-loss, 2026-06-26.
- `https://mastra.ai/blog/introducing-schedules-for-agents-and-workflows` — current native scheduling API, 2026-07-08.
- `https://mastra.ai/blog/introducing-remote-sandboxes` — Mastra Workspace remote sandbox support including E2B, 2026-03-11.
- `https://mastra.ai/blog/introducing-ephemeral-sandbox-deploys` — current E2B/Daytona/Vercel sandbox deployment capability, 2026-08-05.

Other current release Evidence:

- PostgreSQL versioning policy on 2026-08-22: PostgreSQL 18.6 is supported/current major; PostgreSQL 17.11 remains supported through 2029. `https://www.postgresql.org/support/versioning/`
- Node.js releases on 2026-08-22: Node 24.19.0 is LTS; Node 26.7.0 is Current. `https://nodejs.org/en/about/previous-releases`
- pg-boss npm on 2026-08-22: latest `12.27.0`; requires PostgreSQL 13+ and Node 22.12+. `https://www.npmjs.com/package/pg-boss`

Version labels above are freshness Evidence only. No volatile version becomes current Conexus selection through this document.

## 4. Finding A — PAR should consume more native Mastra mechanics

### 4.1 Direct Agent remains correct

No current Evidence defeats the accepted direct-agent baseline:

```text
exact active Conexus Release
→ RuntimeAgentProjection
→ direct Mastra Agent
→ Conexus AgentRun
```

A universal Workflow wrapper remains unjustified.

### 4.2 Streaming is a first-class mechanism, not a final-text convenience

Current Mastra streams expose materially useful lifecycle information:

```text
text chunks
sources/files
Tool call input/call/result
approval/suspension
finish/error
optional reasoning/raw provider material
```

Therefore a PAR wire that models only:

```text
POST turn
→ wait
→ final JSON response
```

would unnecessarily fight the selected runtime and weaken the Product experience.

The preferred realization candidate is:

```text
Conexus Product authority
→ Conversation / AgentRun / ApprovalRequest owner facts
→ thin safe stream projection
→ Mastra native Agent stream
→ @mastra/ai-sdk / AI SDK UI Message Stream (SSE)
→ React useChat
```

This does **not** mean publishing Mastra's raw protocol as Conexus Product authority.

### 4.3 Product-owned IDs remain sovereign

The following remain mechanics/correlation only:

```text
Mastra runId
Mastra toolCallId
Mastra threadId
Mastra RequestContext
provider IDs
runtime snapshots
raw provider chunks
```

They must not replace:

```text
ConversationId
AgentRunId
ApprovalRequestId
ReleaseRef
Conexus current authority
Gateway EffectAttempt truth
```

### 4.4 HITL should reuse native pause/resume

Mastra native tool approval/suspension remains the preferred mechanical pause.

Conexus keeps only the semantic gap the framework cannot own:

```text
Mastra proposes exact tool call
→ PAR persists exact sealed ApprovalRequest
→ currently eligible human sees safe exact subject
→ PAR decides/revalidates current authority
→ owner maps the accepted decision back to the suspended runtime
→ Gateway rechecks effect authority before escape
```

No custom Conexus suspension engine is justified by current Evidence.

### 4.5 Raw reasoning is not Product authority

Mastra can stream reasoning-related chunks. That capability does not make raw hidden reasoning a Conexus Product contract.

Default disposition:

```text
raw reasoning/provider internals = runtime/private
safe user-visible progress/status = explicit Product projection when admitted
```

No 4B operation may require exposing private chain-of-thought merely because the runtime can produce it.

## 5. Finding B — DurableAgent is now a strong ADOPT candidate, not a rejected mechanism

3L deferred DurableAgent because the then-current F1 proof did not require active-run same-stream reconnect/recovery.

The next PAR consumer changes the relevance of the capability. Current DurableAgent directly solves a real user-experience mechanism:

```text
stream starts
→ browser refresh/network disconnect
→ run continues
→ client observes/replays missed stream events
```

The bounded disposition is therefore:

```text
DurableAgent = STRONG 4D ADOPT CANDIDATE
not yet current runtime authority
not yet enabled
```

### 5.1 Proportional qualification

The existence of historical/upstream defects is not a reason to build a replacement durable runtime.

For the two defect classes already recorded by repository authority:

```text
raw auth-token persistence
concurrent resume duplicate execution
```

the proportional admission is:

```text
select exact source/package containing the fixes
+ run the bounded affected probes
+ admit only the properties actually consumed
```

rather than:

```text
framework once had a defect
→ build Conexus durable execution framework
```

### 5.2 Do not silently broaden the promise

Adopting resumable client streams does not automatically promise:

```text
cross-process HA
same-stream survival after host crash
automatic re-drive of every active AgentRun
multi-region continuity
```

Those claims require their own real consumer and proof. 4D may stage DurableAgent adoption proportionally.

## 6. Finding C — Builder should prefer Mastra Workspace + native E2B adapter

Current architecture already routes:

```text
BuilderMastra
→ Mastra Workspace
→ E2B
```

Current Mastra exposes `WorkspaceSandbox` as the provider abstraction and `@mastra/e2b` implements it.

Therefore a large additional Conexus `SandboxProvider` abstraction would likely be duplicate indirection:

```text
Conexus sandbox abstraction
→ Mastra sandbox abstraction
→ E2B SDK
```

Preferred 4D candidate:

```text
Conexus Builder owner/admission
→ smallest physical-incarnation/custody guard
→ Mastra Workspace
→ @mastra/e2b
→ E2B
```

The custom seam remains only where Conexus has distinct semantic responsibility, especially:

```text
expected physical incarnation == actual incarnation
late/cancelled output cannot regain authority
Hub custody precedes producedOutputRef authority
runtime continuation never authorizes itself
```

File/process/network/sandbox lifecycle mechanics should be inherited from Mastra/E2B where the exact selected versions satisfy the property.

## 7. Finding D — MAR should use pg-boss as mechanics, not recreate a queue platform

Current pg-boss selection remains structurally well matched:

```text
PostgreSQL-backed work presentation/claim
scheduling
retry/backoff
concurrency/singleton mechanics
```

Conexus still owns:

```text
JobRun semantic occurrence
exact Release/job pins
single-flight meaning
freshness-derived one-current-catch-up law
owner terminal truth
```

No current Evidence justifies building:

```text
ConexusQueueEngine
ConexusSchedulerEngine
ConexusRetryEngine
```

The historical `12.26.3` pin becomes a repin checkpoint; current `12.27.0` is freshness Evidence, not an accepted execution pin.

## 8. Finding E — frontend should specialize tools instead of forcing one state library to do everything

Current React/TypeScript/Vite/TanStack direction remains coherent.

Preferred responsibility split for 4D evaluation:

```text
ordinary HTTP/server state
→ generated Product client + TanStack Query

Product Agent conversational stream
→ Mastra stream adapter + AI SDK UI stream + @ai-sdk/react useChat
```

This avoids inventing a custom stream state machine and avoids forcing ordinary query-cache semantics onto a purpose-built conversational stream.

The canonical OpenAPI authority should also be evaluated as the source for generated implementation clients/types/hooks. A future codegen choice (for example Orval/Kubb/Hey API or a smaller proven equivalent) belongs to 4D and must be tested against the real Conexus OAS rather than selected by popularity.

## 9. Finding F — current infrastructure pins need repin, not architectural loyalty

### Node

Current Evidence favors retaining the Node 24 LTS line for realization unless an exact dependency requires otherwise:

```text
Node 24 = LTS
Node 26 = Current
```

No benefit is established for moving a first production realization to the Current line merely because it is newer.

### PostgreSQL

PostgreSQL 17 remains supported and remains current architecture until explicitly changed by proper authority.

However, because Product implementation has not started and PostgreSQL 18 is now the current supported major, 4D should compare the actual Conexus dependency/proof set on 18 before inheriting 17 mechanically:

```text
Mastra PostgreSQL storage
pg-boss
selected driver/query layer
owner-role isolation
transactions/concurrency
migration tooling
required extensions
```

Disposition:

```text
PG17 = current architecture / historical deciding proof baseline
PG18 = 4D repin candidate
```

This document does not change the architecture major.

### Authentication

No current Evidence defeats the Keycloak decision. It remains a good example of adopting mature authentication mechanics while keeping Conexus Product authorization sovereign.

Exact Keycloak and standards-compliant OIDC client versions remain 4D/R1 admission work.

## 10. Native-first realization law carried forward

For the realization choices reviewed here, the practical default becomes:

```text
ADOPT native mature mechanism
→ if one real Conexus semantic gap remains, ADAPT through the thinnest boundary
→ BUILD only when a named property cannot be satisfied by native/standard/mature mechanisms
```

Before any custom runtime/sandbox/scheduler/stream/client framework is introduced, 4D must identify:

```text
the exact current consumer
+ the protected property
+ the native mechanism considered
+ the concrete evidenced gap
+ why a thin adapter is insufficient
```

This is an application of the existing realization method, not a new Product requirement.

## 11. What this review does not change

No accepted owner is reopened.

No current operation census changes:

```text
N_platform = 111
schema-closed = 85 / 111
```

No framework/runtime/database/codegen version is selected for Product implementation.

Current literal `IF_MATCH` remains:

```text
{ PRJ-12, PAR-14 }
```

Product implementation remains blocked.

DurableAgent remains unenabled until its exact consumed properties are requalified against the selected source/package.

PostgreSQL 17 remains current architecture until a later authorized realization decision changes it.

## 12. Consequence for the next PAR design

Before opening PAR TDD, the final 4B design must account for the fact that the selected runtime can produce a live structured stream.

The design should close the minimum Product-visible semantics for:

```text
turn/headless intake
AgentRun identity/provenance
stream-compatible accepted response/continuation semantics
safe user-visible output/progress projection
ApprovalRequest creation/decision while a run is suspended
terminal/error truth without inferring owner completion from transport closure
```

It should deliberately **not** freeze:

```text
Mastra raw chunk union as Product API
Mastra runId/toolCallId/threadId as Product identity
raw reasoning as a Product entitlement
DurableAgent cache/PubSub/storage topology
React component library
backend framework
codegen tool
physical persistence schema
```

The next action is therefore to present and approve the revised bounded PAR wire design, then open the expected RED for `PAR-01` only after that design is accepted.

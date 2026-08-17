# 3H — ChatGPT ↔ Fable Dialogue — Builder Coding Runtime Realization

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-01 — Builder Coding Runtime Realization & Session/Sandbox Mapping`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `86803274f00939623b53a40bf160efb93a851ae2`  
**Important:** review/co-design only. This file is not authority, does not approve/create 3H-01, does not constitute C-018, and does not authorize product implementation, LEDGER changes, merge or PR readiness.

---

## 0. Review protocol

1. Reconstruct authority independently from `AGENTS.md` and follow its read order. Do not treat this dialogue, prompts, conversation memory or prior review files as authority.
2. Apply **DevelopmentConexus Engineering Method v1.0.0** from `docs/engineering/standards/root-cause-global-maximum-method.md` in full: Evidence → Known/Inferred/Unknown/Deferred → Root Cause → Invariant → Alternatives → Global Maximum → complexity/YAGNI → authority/boundary → enforcement → proof → adversarial challenge → decision/reopen triggers.
3. Read at minimum, as applicable:
   - `docs/conexus/DECISOES.md`;
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3A-R5-builder-coding-runtime-reassessment.md`;
   - `docs/conexus/phase3/3C-05-builder-module-boundary.md`;
   - `docs/conexus/phase3/3C-13-observability-audit-module-boundary.md`;
   - `docs/conexus/phase3/3C-R1-cross-review-closure.md`;
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`;
   - `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md`;
   - `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`;
   - `docs/conexus/phase3/3E-R1-data-architecture-final-closure.md`;
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`;
   - `docs/conexus/phase3/3F-R1-contracts-api-architecture-final-closure.md`;
   - `docs/conexus/phase3/3G-02-builder-change-finding-lifecycle-contract-revision-closure-architecture.md`;
   - `docs/conexus/phase3/3G-03-builder-work-unit-actor-run-execution-lifecycle-architecture.md`;
   - `docs/conexus/phase3/3G-R1-behavioral-state-architecture-final-closure.md`;
   - `docs/conexus/23-modelo-engenharia.md` where C-017 detail is load-bearing;
   - Mitra/Factory research only as evidence/reference, never authority/template.
4. Approved architecture is the baseline, not dogma. Reopen an approved decision only for a **material Finding** with a concrete failure class and a globally superior correction.
5. Do not reopen for naming, symmetry, framework preference, convenience, or hypothetical optionality.
6. Fable acts as an **independent Senior/Staff/Principal Software Engineer + Software Architect**, not as a summarizer. Attack the proposal down to authority, source-state provenance, concurrency, crash/restart, process loss, sandbox reincarnation, stale cognition, cancellation, late writes, output admission, observability, cost and product realization.
7. When a claim depends on current Mastra behavior, verify it with Context7 `/mastra-ai/mastra` and primary Mastra source/docs as necessary. When a claim depends on E2B behavior, verify current primary E2B sources or the exact current `@mastra/e2b` implementation where that is the mechanism under review. Do not rely on model memory for unstable APIs/capabilities.
8. Append numbered rounds. Do not silently rewrite another actor's round. If the file becomes too large, create `...-R2.md` preserving prior history.
9. ChatGPT↔Fable agreement is **not operator approval**. Only the operator can ratify a candidate authority.
10. Apply YAGNI aggressively. Do not introduce a session engine, workflow engine, queue, lease/fencing system, retry engine, candidate service, sandbox pool, runtime-state mirror, universal execution object, snapshot manager or new durable record without a current consumer/failure class.
11. Mastra Code / AgentController + Mastra Workspace + E2B is already the approved Builder realization from 3A-R5. This dialogue may challenge its realization or even reopen it on material evidence, but must not casually rerun a framework preference contest.
12. `Workspace` without qualifier means Conexus tenant. Always say **Mastra Workspace** for the runtime/filesystem/sandbox primitive.
13. No `LEDGER.md`, approved authority or product-code changes while this dialogue remains unresolved.
14. Fable may commit/push **only appended content to this dialogue file** for its round unless a continuation file is necessary.

---

# Round 1 — ChatGPT

## 1. Decision target

3H-01 should decide the smallest sustainable runtime realization for the already-approved Builder model:

```text
Builder
→ CodingRuntime boundary
→ Mastra Code / AgentController
→ CodingSession cognition
→ Mastra Workspace
→ E2B
```

while preserving the already-approved distinctions:

```text
Change lifetime
!= CodingSession lifetime
!= Work Unit lifetime
!= ActorRun lifetime
!= AgentController live Session lifetime
!= Mastra thread lifetime/mechanics
!= E2B sandbox lifetime
```

The decision must close, as one coherent package:

```text
Change ↔ CodingSession mapping
CodingSession ↔ current AgentController Session/thread mapping
Work Unit / ActorRun ↔ runtime-turn mechanics
working-tree continuity across ActorRuns
Mastra Workspace / E2B scoping
sandbox reconnect / pause / reincarnation semantics
cancel / physical interrupt boundary
background-process ownership/quiescence
fresh verifier realization
runtime IDs / correlation / observability
F5 produced-output handoff boundary
liveness interface needed now vs failure/recovery deferred to 3M
```

It should **not** decide:

```text
credential/secret/egress trust topology                    → 3I
process/host placement, supervision, TLS/DNS               → 3J
product/status/approval UX                                  → 3K
exact package versions and technology conformance           → 3L
orphan timeout/calibration and full recovery policy         → 3M
architecture-wide proof                                     → 3N/3O
```

---

## 2. Authority already fixed before 3H-01

### 2.1 Builder owns meaning; runtime owns mechanics

Builder remains authority for:

```text
Change
correctness contract and exact revision
approved Plan when present
Work Unit identity/bounded authority
ActorRun identity/attempt facts
Finding routing
Evidence admission
budgets/rigor/authority pins
produced-output admission
accepted delivery
Change closure
```

Mastra/E2B cannot close or rewrite any of these.

Core law:

```text
harness says done
!= ActorRun DELIVERED
!= Work Unit acceptedDelivery
!= Change ACCEPTED
```

### 2.2 Persistent cognition is Change-scoped by default

3A-R5 already froze:

```text
same Change → continue coding session by default
new Change  → fresh coding session by default
material verifier → fresh independent session/context
```

A new Work Unit or ActorRun does not automatically reset cognition.

### 2.3 Work Unit and ActorRun remain distinct from runtime session

3G-03 already freezes:

```text
Work Unit = immutable bounded work authority
ActorRun  = one concrete Builder-admitted attempt
CodingSession = separate continuity/correlation concept
```

ActorRun has at most one exact write-once produced output and one write-once terminal disposition:

```text
DELIVERED | FAILED | CANCELLED
```

Work Unit accepts at most one exact delivery.

### 2.4 Runtime loss does not invent domain truth

3G-03 already requires explicit authoritative terminalization of orphaned/non-continuable ActorRuns, while detection mechanics remain 3H/3M. Late runtime output after a terminal disposition cannot regain Builder authority.

### 2.5 Remote Git authority remains outside the guest

3A-R5/C-008 preserve:

```text
sandbox/harness → local Git mechanics
Hub             → remote fetch/push/PR/integration authority
```

This dialogue does not give E2B a remote-write credential merely because Mastra Code understands Git.

---

## 3. Current external evidence verified for this round

The following are **evidence about current mechanism**, not product authority.

### M1 — AgentController live Session is not a durable domain object

Current Mastra AgentController docs state that a `Session` is a live/in-memory runtime object. Its event bus, arbitrary session state, permission rules/grants, pending approvals, suspensions, follow-ups, run state and stream state do not automatically survive controller/process recreation.

With persistent storage, stored threads/messages and selected thread settings survive.

Implication to test:

```text
CodingSession cannot safely be defined as identity-equal to the live Session object
```

Source family:

- `docs/src/content/en/reference/agent-controller/session.mdx`
- Context7 `/mastra-ai/mastra`

### M2 — persisted thread can be rebound after recreation

Current AgentController supports `createSession({ resourceId, scope, threadId, ... })`; supplying an exact `threadId` binds/switches the live session to that stored thread. `session.thread.switch()` also hydrates an existing owned thread.

Implication:

```text
logical CodingSession continuity can survive a clean controller restart without serializing the full live Session internals
```

### M3 — session-specific Mastra Workspace is supported

Current `createSession()` accepts a `workspace` override and AgentController can resolve the workspace a session runs against.

Implication:

```text
one CodingSession-scoped execution workspace can be realized without making a global Mastra Workspace the owner of Builder scope
```

Whether that is the best actual realization remains for Fable/3L to challenge.

### M4 — E2B adapter has logical identity and reconnect/recreate behavior

Current `@mastra/e2b` implementation uses a logical sandbox `id`, attempts to find/reconnect an existing E2B sandbox, pauses on `stop()`, and contains dead-sandbox retry behavior that can reset/restart the sandbox operation path.

It explicitly distinguishes its logical Mastra sandbox id from the underlying E2B `sandboxId`.

Implication:

```text
same Mastra logical id
!= proof of same physical sandbox incarnation/filesystem lineage
```

Current source family:

- `workspaces/e2b/src/sandbox/index.ts`

### M5 — E2B pause may preserve more than files

The current Mastra E2B adapter documents its `stop()` path as E2B pause, preserving VM filesystem, memory and running processes, with FUSE mounts reconciled on resume.

Implication:

```text
sandbox pause/resume can preserve useful execution state
but can also preserve stale/background writers
```

This is important for ActorRun-boundary contamination analysis.

### M6 — AgentController abort is physical run control, not authority

Current Session exposes `abort()` for the active run. The existence/success of that method cannot itself define Conexus `CANCELLED` truth.

---

## 4. Root cause

3A-R5 deliberately decoupled four lifetimes, but 3H must prevent implementation from recoupling them accidentally.

Without an explicit realization law, the implementation can drift into one or more of these defects:

```text
live AgentController Session becomes CodingSession authority
thread/model/mode/grant settings become Builder authority
Mastra run id becomes ActorRun identity
sandbox liveness becomes ActorRun lifecycle truth
same logical E2B id is mistaken for same physical workspace
runtime auto-retry silently creates a new sandbox incarnation
persistent scratch becomes accepted source merely because it survived
failed/cancelled ActorRun leaves background writers contaminating later work
cancel API success/failure rewrites domain cancellation
new ActorRun blindly restarts a model/tool episode after ambiguous runtime loss
fresh verifier inherits implementer cognition or write authority
runtime output becomes accepted delivery without Builder F5 admission
```

The structural defect class is:

> **runtime continuity and convenience are allowed to carry authority that belongs to Builder durable facts.**

---

## 5. Target invariants

Candidate invariants for Fable to attack:

1. `CodingSession` is a Builder-owned durable continuity/correlation identity; no provider runtime object is its identity authority.
2. A live `AgentController Session` is an incarnation/mechanism of a CodingSession, not the CodingSession itself.
3. Persistent Mastra thread/history may preserve cognition, but current Conexus authority is reintroduced/revalidated at each ActorRun dispatch.
4. `ActorRun` never identity-maps to a Mastra run/turn/session or E2B sandbox.
5. Mastra mode/model/grant/task/approval state never substitutes for approved Plan, exact runtime/model pins, Builder authority or approval authority.
6. `Mastra Workspace` / E2B state is mutable execution state, never accepted software truth by survival alone.
7. A logical sandbox id never proves physical-incarnation continuity; physical/provider refs are correlation only.
8. Runtime/provider completion never equals produced-output presentation or delivery acceptance.
9. Cancellation truth is committed by Builder/current authority; physical abort is a subordinate best-effort/enforcement mechanic.
10. Late output/tool activity after terminal authority cannot regain Builder/Gateway authority.
11. Fresh verifier is cognitively independent from implementer history and mechanically prevented from mutating the judged candidate at the required rigor.
12. No new runtime/checkpoint/retry/sandbox orchestration engine is created unless the current mechanism cannot satisfy a named invariant.

The most controversial remaining invariant is intentionally **not yet frozen**:

> What exact non-authoritative working-tree state may survive from one ActorRun into another under the same CodingSession/Work Unit?

That question is load-bearing and must be resolved by this dialogue rather than hidden in implementation.

---

## 6. Proposed conceptual mapping

Candidate topology:

```text
Project
└── Change C184
    ├── CodingSession CS184                 # Builder durable identity
    │   ├── Mastra persistent thread T91    # cognitive/runtime ref
    │   ├── live Session S1                 # process incarnation
    │   ├── live Session S2                 # later incarnation after restart
    │   └── Mastra Workspace                # execution primitive
    │       └── E2B logical sandbox lineage
    │           ├── physical sandbox E1
    │           └── physical sandbox E2?    # only if reincarnated/recreated
    │
    ├── Work Unit W1
    │   ├── ActorRun A1
    │   └── ActorRun A2?                    # same bounded work retry when admitted
    └── Work Unit W2?
        └── ActorRun A3
```

Non-equalities:

```text
CodingSession
!= AgentController Session
!= Mastra thread
!= Mastra run
!= Mastra Workspace
!= E2B logical sandbox id
!= E2B physical sandbox id

ActorRun
!= Mastra model/tool turn
!= AgentController run
```

### 6.1 Candidate persistence role of `bld.coding_session`

`bld.coding_session` should preserve only Builder-owned continuity/correlation facts necessary to recover/rebind the chosen runtime, for example conceptually:

```text
CodingSession identity
owning Change
current/active runtime kind/version refs when applicable
opaque Mastra thread/session correlation refs
opaque sandbox logical/physical refs when useful
creation/supersession facts only if needed
```

It must **not** copy Mastra thread contents, task state, mode state, permissions, stream state or checkpoint internals into Hub tables.

Exact columns remain implementation.

---

## 7. AgentController restart realization

### 7.1 Clean restart while no ActorRun is live

Candidate:

```text
Hub/AgentController process restarts
→ read CodingSession correlation
→ recreate AgentController
→ create live Session bound to stored threadId
→ attach/resolve CodingSession-scoped Mastra Workspace
→ reapply current Conexus runtime/tool/model authority as needed
→ same CodingSession continues
```

A new CodingSession is not required merely because a Node process restarted.

### 7.2 Process loss during active ActorRun

Do **not** promise transparent mid-ActorRun resurrection merely because thread history survived.

Candidate minimum:

```text
active A1
→ AgentController process lost
→ A1 remains non-terminal until liveness/recovery authority acts
→ no blind re-send/replay of the same model/tool episode as A1
→ 3H supplies observable/reconnect/interrupt mechanics
→ 3M decides final orphan/recovery policy
```

If exact produced output had already been durably presented under 3G-03, Builder may recover judgment of that same output without rerunning the agent.

If no durable output exists and runtime execution cannot be truthfully recovered, later owner may terminalize A1 and admit A2 under normal same-WU gates.

No durable coding workflow/checkpoint engine is added solely to erase this bounded failure window.

---

## 8. Working-tree continuity across ActorRuns — main unresolved design pressure

This is the part Fable should attack hardest.

Two credible realizations exist inside current authority.

### Alternative WT-A — ActorRun starts from exact clean Builder-admitted source every time

```text
A1 fails/cancels
→ unaccepted source edits discarded/quarantined
→ A2 starts from exact admitted base
```

Benefits:

- simplest provenance;
- strongest attempt isolation;
- easy replay/audit reasoning.

Costs:

- throws away useful partial implementation after transient runtime/model failure;
- weakens the practical value of persistent Change-scoped cognition/workspace;
- may force redundant edits and tokens;
- could turn ActorRun into an unnecessarily heavy clean-room boundary not required by 3G-03.

### Alternative WT-B — CodingSession owns a non-authoritative mutable working lineage across compatible ActorRuns

```text
A1 edits working tree
→ A1 fails before delivery
→ scratch remains non-authoritative
→ A2 may continue same scratch only when current WU/Change authority remains compatible
→ final exact candidate still passes Builder produced-output/delivery admission
```

Benefits:

- captures the main practical value of persistent coding;
- avoids throwing away bounded partial work after runtime interruption;
- no new snapshot/candidate system.

Risks:

- A2 output may contain edits physically authored during A1;
- cancellation/replan/current-authority changes can make scratch stale;
- orphan background processes may continue mutating it;
- sandbox reincarnation can silently lose it;
- source provenance can become ambiguous if the Hub pretends A2 alone authored the result.

My current recommendation is **WT-B with explicit non-authority and reconciliation laws**, not WT-A, because ActorRun is an execution/audit attempt boundary rather than a clean-room authorship boundary.

Candidate law:

> A compatible successor ActorRun may inherit non-authoritative working state from the same CodingSession/Work Unit lineage. Persistence of scratch does not make it delivery or Evidence. Before any produced-output presentation, Builder still validates exact canonical output identity and reconciles actual read/write/effect scope against current bounded authority. Material contract/decomposition change, authority narrowing, unsafe cancellation cause, uncertain sandbox continuity or contamination evidence forces reset/quarantine/reconstruction before new write authority.

Fable should try to prove this is either too weak or unnecessarily strong.

No `WorkspaceSnapshot`, `ScratchRevision`, `Candidate` durable class or generic checkpoint is proposed.

---

## 9. Mastra Workspace / E2B scoping

Candidate logical ownership:

```text
Conexus CodingSessionId
→ determines execution-workspace scope
```

not:

```text
Mastra thread happens to exist
→ therefore thread owns Builder workspace authority
```

Current AgentController can receive a session-specific `workspace`, which is a direct realization candidate.

### 9.1 One current write-capable sandbox lineage per CodingSession

F1 is serial by default. Candidate:

```text
one CodingSession
→ at most one current write-capable sandbox lineage
```

This does not require a lease system while the accepted topology remains single-writer.

### 9.2 Logical id versus physical incarnation

Record/correlate both where necessary:

```text
Mastra/E2B logical sandbox id
physical E2B sandboxId
```

If the physical sandbox changes unexpectedly:

```text
E1 → E2
```

that is a new physical incarnation. Runtime must not claim filesystem/process continuity merely because the logical id is unchanged.

### 9.3 Reuse versus recreate

Reuse is desirable when safe because caches, dependencies, setup and local investigation are valuable.

Recreate/reset is required when continuity cannot be trusted under current authority.

No blanket policy:

```text
new ActorRun = new VM
```

and no opposite fiction:

```text
same CodingSession = same VM forever
```

---

## 10. E2B dead-sandbox auto-retry — provider overreach hazard

The current Mastra E2B implementation contains operation-level dead-sandbox retry behavior.

That is acceptable for a commodity operation only if it cannot create a false semantic continuity claim.

Candidate invariant:

```text
provider/adapter retry may retry a runtime operation
-X-> may silently re-dispatch a Builder ActorRun
-X-> may claim old filesystem/process state still exists after physical reincarnation
-X-> may repeat governed external effects outside Gateway authority
```

`CX-BUILDER-MASTRA-01` must explicitly observe this failure class.

If current adapter behavior cannot expose enough information to distinguish continuity from reincarnation, the smallest correction may be a narrow local guard/wrapper. Do **not** prebuild that wrapper before the probe shows the need.

---

## 11. Background processes and quiescence

E2B/Workspace can keep background processes alive across turns and, under pause semantics, potentially across pause/resume.

Therefore ActorRun terminalization does not mechanically imply:

```text
all processes started during that ActorRun are dead
```

### 11.1 Candidate default ownership

A background process started as part of an ActorRun is **ActorRun-scoped by default** unless a current consumer explicitly admits a longer-lived CodingSession process.

Examples:

```text
build/test/watch command during A1 → A1 scoped
ad-hoc dev server during A1        → A1 scoped by default
```

Do not create `ProcessRegistry` or `SessionDaemon` now.

### 11.2 Quiescence before successor write authority

Before a successor ActorRun receives write authority in the same mutable sandbox, runtime must have sufficient basis that no prior terminal ActorRun retains write-capable activity that can race the successor.

Possible mechanics are implementation/probe concerns:

```text
tracked process termination
sandbox process inspection
workspace reset
sandbox recreate
```

Architecture only freezes the property:

```text
terminal A1 + successor A2
-X-> overlapping unknown write authority in same source tree
```

If quiescence cannot be established, fail closed on sandbox reuse and route to recovery/recreate rather than inventing a lease/fencing subsystem in F1.

Fable should challenge whether this property belongs in 3H, 3M, or both.

---

## 12. Cancellation / interrupt boundary

3G owns cancellation truth; 3H owns physical interrupt realization.

Candidate order:

```text
applicable Builder/current authority commits or guards CANCELLED
→ CodingRuntime requests physical abort
→ AgentController `session.abort()` / process kill as applicable
→ cleanup/quiescence observation
```

Core law:

```text
physical abort succeeds
!= ActorRun CANCELLED authority

physical abort fails
-X-> undo ActorRun CANCELLED
```

After terminal cancellation:

```text
late model output
late tool event
late filesystem mutation observation
```

may be telemetry/quarantine evidence but cannot present a new Builder output or initiate new governed effects from that ActorRun.

If delivery already won the 3G terminal race first, later cancellation cannot rewrite history.

---

## 13. Runtime liveness seam — decide only what 3H needs

3H should freeze the **capability shape**, not a heartbeat policy.

CodingRuntime realization must provide enough observable/control mechanics for later failure handling to determine or investigate, as applicable:

```text
runtime/session correlation refs
current known run ref
sandbox logical + physical refs when available
ability to inspect/reconnect runtime/sandbox
ability to request interrupt
ability to observe command/process completion/failure
ability to identify provider-reported missing/dead sandbox
structured runtime events/correlation
```

3H should **not** freeze:

```text
30s heartbeat
N missed heartbeats = FAILED
specific timeout value
automatic orphan terminal reason enum
lease/fencing
```

Those remain 3M/calibration unless a current Mastra/E2B limitation makes an architectural correction unavoidable.

---

## 14. Current authority must be reintroduced at ActorRun dispatch

Persistent thread cognition inevitably contains stale historical facts.

At each ActorRun dispatch, the Hub/Builder must supply/reapply current exact execution context required by C-017/3G, including as applicable:

```text
current contract revision
current Work Unit identity/scope/sets/fulfills
current approved Plan revision when applicable
current Actor Pack / standards snapshot
runtime/model/provider pins when load-bearing
current tool/capability surface
current budget/rigor context
current binding/environment refs applicable to Builder
correlation identities
```

Candidate law:

```text
thread remembers old X
current admitted ActorRun says Y
→ Y controls execution/admission
```

Mastra thread settings such as model/mode/OM configuration may be useful runtime defaults, but cannot override exact current pins.

---

## 15. Mastra local mechanics explicitly remain non-authority

Current AgentController exposes mechanics including modes, model selection, session permissions/grants, tasks/display state, approval/suspension handling and run control.

Candidate classifications:

```text
Mastra plan/build mode        → local execution tactic
Mastra task/todo state        → scratch/local tactic
Mastra selected model         → runtime setting; current Conexus pin wins when load-bearing
Mastra session grant          → defense-in-depth/local convenience only
Mastra permission policy      → defense-in-depth only
Mastra tool approval          → never Conexus business/effect approval authority
Mastra display state          → UI/runtime projection only
```

No synchronization engine mirrors these into `hub_control`.

---

## 16. Produced-output / F5 handoff

Mastra may edit/test/refine freely before Builder presentation.

The authority crossing remains:

```text
runtime/harness
→ typed F5 producer proposal
→ exact canonical output identity
→ Builder validates presentation under current ActorRun
→ `ActorRun.producedOutputRef = X` write-once
→ Builder delivery judgment
→ atomic `DELIVERED + WorkUnit.acceptedDelivery` where applicable
```

Never:

```text
Mastra final message = producedOutputRef
process exit 0       = DELIVERED
E2B files exist      = acceptedDelivery
Mastra task done     = Change accepted
```

Runtime transport can be shared; semantic handoff remains owner-specific. No `UniversalRuntimeResult` or `UniversalExecutionEnvelope`.

---

## 17. Fresh verifier realization

3A-R5/C-017 already require independent cognition when an agentic verifier is material.

Candidate minimum:

```text
exact candidate/output identity
→ new verifier CodingSession/AgentController Session
→ fresh Mastra thread/context
→ no implementer transcript/thread
→ verifier-specific restricted tool surface
→ no write/fix authority over candidate
→ verifier ActorRun/report
→ Builder/Hub decides Finding/Evidence admission
```

Freshness means **independent context**, not automatically another provider.

### 17.1 Same physical E2B sandbox?

Do not mandate a second VM by symmetry.

It is admissible only if the realization can prove the verifier cannot mutate the judged candidate or contaminate the implementer workspace under the required rigor.

If that proof is not achievable with a shared physical sandbox, separate/recreated sandbox becomes necessary by failure class, not preference.

This belongs in `CX-BUILDER-MASTRA-01` / 3L.

---

## 18. Observability and correlation

Conexus IDs remain authoritative correlation roots:

```text
changeId
workUnitId
actorRunId
codingSessionId
findingId
```

Runtime refs remain opaque observations:

```text
Mastra session/thread/run/toolCall refs
traceId/spanId
Mastra Workspace id
E2B logical sandbox id
E2B physical sandboxId
process IDs
provider request IDs
```

Observability should connect them causally without turning OBS or runtime state into current domain truth.

Candidate examples:

```text
Builder: A1 CANCELLED                    # domain truth
Mastra: run aborted / stream ended       # runtime observation
E2B: process 993 still alive             # runtime observation/finding input
OBS: correlates all three                # historical/operational projection
```

No `UniversalActivity` entity.

---

## 19. Alternatives

### Alternative A — live AgentController Session is the CodingSession

**Reject candidate.**

Current live Session state is process-local in material respects. Identity-coupling Builder semantics to that object makes clean restart a domain event and encourages Mastra-local grants/approvals/state to become authority.

### Alternative B — mirror/serialize full AgentController state into Hub

**Reject candidate.**

Creates a second session/checkpoint engine, hard-couples to beta/internal framework structure, duplicates storage and migration semantics, and still cannot make an in-flight model/tool side effect exactly replayable.

### Alternative C — fresh thread + fresh sandbox per ActorRun

**Reject candidate unless Fable finds a material invariant requiring it.**

It destroys the main continuity benefit already accepted by 3A-R5 and turns ActorRun into a clean-room cognition/environment boundary without current evidence.

### Alternative D — Change-scoped logical CodingSession + persistent thread + controlled mutable sandbox lineage + ephemeral live Session incarnations

**Recommended candidate.**

It preserves useful cognition and workspace continuity while keeping all authoritative admission/delivery/terminal facts in Builder.

### Alternative E — custom Conexus coding-runtime/session/workspace engine wrapping Mastra heavily

**Reject now.**

Only introduce a narrow wrapper at the exact failed mechanism if `CX-BUILDER-MASTRA-01` proves Mastra/E2B cannot preserve an invariant directly.

---

## 20. Crash / concurrency schedules Fable must attack

### S1 — clean Hub restart while idle

```text
CS184 exists + T91 stored + E1 paused/running
→ Hub process dies
→ new process
→ recreate live Session bound to T91
→ reconnect E1 if still same physical incarnation
```

Question: what exact current authority must be rehydrated versus safely reused from thread settings?

### S2 — process dies mid-ActorRun before any output presentation

```text
A1 non-terminal
→ live Session lost
→ E1 may still exist / may still have processes
```

No automatic A1 replay. What is the smallest safe liveness/recovery seam?

### S3 — process dies after exact output X is durably presented but before delivery judgment

```text
A1.producedOutputRef = X
→ crash
→ restart
→ judge same X/A1
```

No new ActorRun should be required solely for Builder judgment recovery.

### S4 — E2B E1 dies; adapter logical id reconnect path creates E2

Can implementation detect the physical-incarnation change before assuming files/processes survive?

### S5 — dead-sandbox operation retry after a filesystem-mutating command

Could retry repeat a non-idempotent local command or hide whether the first command ran? What must remain runtime-local vs Builder-visible?

### S6 — A1 fails after useful partial edits; A2 is admitted for same WU

Should A2 continue scratch or reconstruct from last admitted source? Attack WT-A vs WT-B with concrete failure classes and token/rework cost.

### S7 — A1 cancelled while a background watcher/dev server remains alive

How do we prevent late writes from racing A2 without inventing a process/lease subsystem?

### S8 — semantic contract revision while CodingSession thread and E2B scratch contain old assumptions

Does 3A-R5's fresh-session trigger plus source reconciliation suffice? Must the physical sandbox also be recreated, reset, or only conditionally?

### S9 — delivery wins milliseconds before cancellation

3G terminal truth wins; physical abort arrives later. Ensure runtime mechanics cannot rewrite delivered history.

### S10 — cancellation wins, but late Mastra output arrives

Late output must not present/admit; if retained, only telemetry/quarantine.

### S11 — verifier shares E2B but has read-only tool surface

Can shell/filesystem behavior still mutate candidate indirectly? If yes, tool-level restriction is insufficient and isolation requirement changes.

### S12 — thread contains old model/mode/permission settings after current ActorRun pins changed

Show current authority actually overrides/restores those mechanics rather than merely asking the model to obey.

### S13 — two Hub processes accidentally recreate same CodingSession concurrently

F1 topology is single-writer, but does current architecture need any extra guard now, or is multi-writer genuinely 3J/reopen territory? Do not add distributed fencing without a current topology requirement.

---

## 21. Candidate proof strategy before implementation

`CX-BUILDER-MASTRA-01` should be able to falsify at least:

1. stored thread preserves required cognition across clean AgentController recreation;
2. live Session loss does not erase/change Builder CodingSession identity;
3. current ActorRun context/pins override stale thread mode/model/tool settings;
4. Mastra local grants/permissions cannot grant Conexus capability authority;
5. same physical E2B sandbox can be identified/reconnected when it truly survives;
6. physical E2B reincarnation is detectable and is never mistaken for filesystem/process continuity;
7. dead-sandbox adapter retry cannot silently cause Builder attempt replay or false continuity;
8. cancellation authority blocks late runtime output from F5 presentation;
9. physical abort failure does not undo Conexus cancellation truth;
10. background/write-capable activity from a terminal ActorRun cannot race successor write authority;
11. exact produced output is durable/canonical before Builder records presentation;
12. Hub crash after output presentation can resume judgment of same X/A1 without rerunning agent;
13. fresh verifier receives no implementer transcript/thread state;
14. verifier mutation attempt mechanically fails under the chosen realization;
15. sandbox/runtime refs correlate cleanly with Conexus IDs and Observability without becoming domain identity;
16. no Mastra Goal/task/plan/completion can close Work Unit/Change by itself;
17. if WT-B is adopted, inherited scratch after transient ActorRun failure remains non-authoritative and is reconciled before delivery;
18. if authority/contract changes materially, stale scratch cannot silently enter a newly admitted output.

Controls must be shown firing. Happy-path existence is insufficient.

---

## 22. YAGNI audit

Candidate intends:

```text
new module                    0
new durable record class      0
new Tier-2 FK                 0
new cross-owner atomicity     0
new workflow/checkpoint engine 0
new queue/scheduler           0
new lease/fencing subsystem   0
new retry engine              0
new sandbox pool              0
new snapshot manager          0
new universal runtime object  0
new E2B adapter/wrapper        0 unless probe proves failure
```

Explicitly do not build now:

```text
SessionStrategyRegistry
RuntimeProviderRegistry
UniversalRun / UniversalAttempt
WorkspaceSnapshot domain object
ScratchRevision domain object
CandidateService / Candidate table
ProcessRegistry / ProcessLease
SandboxPool
multi-agent coding fleet
best-of-N
parallel same-WU attempts
Observational Memory baseline
Pi production adapter in parallel
provider-neutral sandbox framework beyond existing justified CodingRuntime seam
```

---

## 23. Strongest arguments against the recommendation

Fable should not spend the round confirming the obvious. Attack at least these:

### A — `CodingSession` may be unnecessary duplicate durability

Could the stored Mastra thread itself be sufficient durable correlation, making `bld.coding_session` redundant? 3E already approved the record, but Fable should test whether 3H is inventing semantics that do not change a decision. If the record remains justified, state exactly what Conexus fact it owns that the runtime thread cannot.

### B — WT-B may blur attempt provenance too much

If A2 delivers bytes partially authored by A1's failed attempt, is `ActorRun` still an honest attempt record? Could this break budget/accounting, causal debugging or cancellation expectations? Produce a concrete consumer before forcing WT-A.

### C — WT-A may be accidental complexity disguised as provenance

Resetting source every ActorRun could destroy useful work and reintroduce the rediscovery/rework that 3A-R5 intentionally removed. Show whether exact source isolation is actually required by any accepted invariant.

### D — quiescence may secretly be a lease problem

If background processes can survive cancellation/pause, is “prove no old writer” possible without fencing, or does single-writer + process cleanup/recreate solve it cheaply? Attack with kill/reconnect races.

### E — AgentController may already have a stronger native session identity than this proposal credits

Current API exposes stable session ids/owner ids and persisted SessionRecord-related identity. Verify whether that materially changes the conclusion that `CodingSession != live Session`, or only supplies a useful runtime ref.

### F — current E2B adapter retry may be too magical for authoritative coding

If it can recreate a sandbox underneath an operation, maybe a thin Conexus guard is required **now**, not merely after 3L. Determine whether architecture can safely defer the wrapper while still claiming buildability.

### G — per-session Workspace override may be the wrong realization

Could static AgentController Workspace + resolver keyed by CodingSession be simpler/better, or does resolver interaction with LSP/mounts create current limitations? Verify current Mastra behavior before selecting the realization. Architecture should freeze only what is load-bearing.

---

## 24. Falsification questions for Fable

For every material finding use:

```text
claim challenged
counterexample / failure class
authority affected
current external evidence if unstable
smallest correction
Global Maximum effect
reopen required? yes/no
later owner if deferred
```

### A. Scope and authority

1. Is 3H-01 correctly one package, or does it combine separable decisions whose failure classes/owners differ materially?
2. Which parts are already fully determined by 3A-R5/3G-03 and should be demoted from “decision” to realization consequence?
3. Does any candidate rule accidentally make Mastra/E2B a second authority over Change, WU, ActorRun, output, Git or acceptance?
4. Does `bld.coding_session` own a real Conexus fact, or is 3H overloading an approved record with unnecessary lifecycle semantics?

### B. AgentController Session / thread

5. Verify current persistence boundaries. Can a live Session truly be reconstructed around the same persisted thread after restart without hidden loss that invalidates “persistent coding session”?
6. Is `CodingSession = logical durable identity + thread ref + runtime incarnations` the smallest correct mapping?
7. Is there any current AgentController state beyond thread/messages that must become durable Conexus state for Builder correctness?
8. Do mode/model/thread settings create TOCTOU or stale-authority risks when a new ActorRun has different pins?
9. What must be mechanically reapplied versus merely restated in prompt context?

### C. Working-tree continuity

10. Choose or refine WT-A vs WT-B. Which is the Global Maximum under persistent Change-scoped coding?
11. Construct a concrete false-success if partial non-authoritative scratch crosses A1→A2.
12. Construct a concrete avoidable rework/cost if every ActorRun resets to a clean base.
13. Is ActorRun an authorship boundary, execution-attempt boundary, budget boundary, or some combination? What does accepted authority actually require?
14. If A1 failed after 90% of implementation and no effect ambiguity exists, can A2 safely continue without lying about provenance?
15. If A1 is CANCELLED by user but the WU remains current, should partial scratch survive? Does cancellation reason affect this?
16. If Finding/contract revision changes scope, what minimum reconciliation makes old scratch safe or forces discard?
17. Can `git diff`/writeSet reconciliation at produced-output admission fully compensate for inherited scratch, or are there hidden effects/state outside Git?

### D. Sandbox lifetime and E2B

18. Verify current `@mastra/e2b` reconnect/pause/retry behavior against source.
19. Can logical-id reuse ever attach to a different physical E2B sandbox without a detectable `sandboxId` change?
20. Can dead-sandbox retry repeat a shell operation after uncertain execution? If yes, what operations are actually exposed to that retry path?
21. Is a narrow wrapper/guard architecturally required now, or correctly probe-gated for 3L?
22. What exact current consumer justifies one sandbox lineage per CodingSession rather than per Change/ActorRun/thread?
23. Is per-session `workspace` override the cleanest realization, or should architecture leave this unfrozen and let 3L choose among equivalent Mastra mechanisms?
24. Could sandbox pause preserving memory/processes create a security or stale-writer problem that belongs to 3I rather than 3H?

### E. Liveness / interruption / quiescence

25. What is the minimum liveness interface 3H must require so 3M can recover honestly?
26. Does current AgentController/E2B expose enough to know whether an ActorRun can still produce output after process loss?
27. Is “terminal A1 must not leave unknown write-capable activity racing A2” enforceable without leases?
28. Can process cleanup plus sandbox recreate be the fail-closed fallback?
29. Is background process ActorRun-scope the correct default, or is a current coding use case (preview/dev server) genuinely CodingSession-scoped?
30. Does cancel truth need to be committed before physical abort, or can those operations race under a different safe ordering?

### F. Fresh verifier

31. Does fresh thread/session provide sufficient cognitive independence?
32. Under E2B/shell tooling, can a supposedly read-only verifier mutate the candidate indirectly even if write tools are omitted?
33. What is the smallest mechanical non-mutation proof?
34. Does that proof force a separate sandbox/clone, or can permissions/filesystem mode/source materialization suffice?
35. Should verifier share dependency/build caches while keeping candidate immutable, or is this implementation optimization only?

### G. Handoff / observability

36. Is F5 exact output presentation enough to separate runtime success from Builder delivery, or is a runtime-specific handoff record/event required?
37. Can Mastra structured events/trace ids be mapped directly into Conexus OBS without introducing a second event ontology?
38. Which runtime IDs are worth persisting on `bld.coding_session`/`actor_run`, and which should remain telemetry only?
39. Can runtime provider metadata ever be trusted for sandbox-incarnation continuity, or must Hub observe/verify it another way?

### H. Buildability / YAGNI

40. Is there any missing current failure class that requires a new durable record, queue, lease, checkpoint, candidate object or sandbox wrapper?
41. Which proposed rule is speculative and should be deleted?
42. Which deferred item is actually load-bearing for a realizable F1 and must be pulled into 3H-01?
43. Does this remain realistically implementable with current Mastra Code/AgentController + Mastra Workspace + E2B, or is the architecture papering over an unsupported API/lifetime assumption?
44. Strongest argument for rejecting the entire recommended Alternative D.
45. Final recommendation: `CURRENT STRUCTURE CONFIRMED`, `RESTRUCTURE NOW`, `TRANSITIONAL SOLUTION`, `STOP/SPLIT PREREQUISITE`, or `DEFER SAFELY`.
46. State whether 3H-01 is ready for ChatGPT consolidation/operator review or requires another adversarial round.

Do not modify earlier content, `LEDGER.md`, approved authority or product code. Append your round to this dialogue and commit/push only the dialogue change.

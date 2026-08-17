# 3H — ChatGPT ↔ Fable Dialogue — Builder Coding Runtime Realization — R3

**Status:** FINAL CONSOLIDATION / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-01 — Builder Coding Runtime Realization & Session/Sandbox Mapping`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `8447d687da25e272c31b9978af0a41eacdb43b87`  
**Continuation of:**
- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization.md`
- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization-R2.md`

**Important:** this file is the final ChatGPT consolidation of the adversarial dialogue. It is not authority, does not approve/create 3H-01, does not update `LEDGER.md`, does not constitute C-018, and does not authorize implementation, merge or PR readiness. Operator ratification remains required.

---

## 0. Protocol / provenance

This consolidation preserves the protocol used throughout Phase 3:

1. reconstruct authority from `AGENTS.md` and its required read chain;
2. apply DevelopmentConexus Engineering Method v1.0.0;
3. treat approved 3A–3G architecture as baseline, reopening only for a material Finding with a concrete failure class and globally superior correction;
4. treat current Mastra/E2B behavior as evidence, not authority;
5. no new durable record/module/engine/queue/lease/workflow/scheduler/wrapper without a current failure class;
6. ChatGPT↔Fable agreement is not operator approval.

Round 1 and Round 2 established:

```text
material Finding against approved 3A–3G authority = NONE
reopen required                                  = NONE
Alternative D                                    = GLOBAL MAXIMUM
WT-B                                              = ADOPTED with explicit admission
3H-01                                             = ready after bounded final refinements
```

Round 2 — Fable additionally verified current Mastra/E2B facts V13–V15 and required six refinements `FBL-R2-01..06`. This R3 incorporates all six.

---

# Round 3 — ChatGPT — Final Consolidation

## 1. Final verdict

### Method outcome

> **CURRENT STRUCTURE CONFIRMED.**

No material Finding requires reopening:

- 3A-R5 Builder runtime selection/lifetime law;
- 3C-05 Builder ownership;
- 3C-13 Observability & Audit boundary;
- 3D-R1 dependency architecture;
- 3E-01/3E-02 data ownership/inventory;
- 3F contract architecture;
- 3G-02 Change/authority serialization;
- 3G-03 Work Unit / ActorRun semantics;
- 3G-R1 behavioral closure.

3H-01 is a **realization decision** over those authorities, not a new orchestration ontology.

### Target invariant

```text
Conexus owns:
meaning + identity + admission + current authority + output presentation + terminal truth.

Mastra/E2B own:
cognition/runtime/session/workspace/sandbox/process mechanics.

Runtime continuity
!= domain authority
!= permission
!= accepted output
!= correctness
!= Release truth.
```

The load-bearing lifetime law remains:

```text
Change lifetime
!= CodingSession lifetime
!= AgentController live Session lifetime
!= ActorRun lifetime
!= Mastra run/turn lifetime
!= Mastra Workspace lifetime
!= E2B physical sandbox lifetime
```

---

## 2. CodingSession realization law

`bld.coding_session` is the Builder-owned durable identity for one admitted cognitive/runtime lineage inside a Change.

It is realized by:

```text
CodingSession
→ one stored Mastra thread as the normal persistent cognitive substrate
→ zero or more ephemeral AgentController live-Session incarnations
→ one current write-capable sandbox lineage when implementation execution is admitted
```

Therefore:

```text
CodingSession
!= AgentController Session
!= Mastra thread
!= Mastra run
!= Mastra Workspace
!= E2B sandbox
```

The Mastra thread is a runtime ref used to preserve context. The `CodingSession` remains the Builder/domain identity.

### 2.1 Clean process restart

A clean restart while no ActorRun is active does not create a new CodingSession merely because the AgentController process died.

Realization consequence:

```text
recreate controller
→ recreate/rebind live Session to stored thread
→ reconstruct current runtime configuration from Conexus authority
→ continue same CodingSession when still admissible
```

### 2.2 Mid-ActorRun process loss

F1 does not promise transparent mid-ActorRun continuation after loss of the live AgentController process.

```text
process loss during ActorRun
→ no implicit replay/resurrection of the same execution episode
→ Builder orphan/liveness path applies
→ 3G-03 guarded terminalization remains authority
→ later successor ActorRun only if currently admissible
```

Exact detection/calibration remains 3M/implementation.

---

## 3. Session-state authority prohibition

Conexus does **not** persist or restore AgentController live-session state as a carrier of authority.

Forbidden authority carriers include, as applicable:

```text
live session permission/grant state
pending Mastra approval state
pending suspension state
run/stream state
mode/model residue
arbitrary session state
```

Restart/rebind means:

```text
persistent cognitive thread
+
current Conexus authority reapplied mechanically
```

not:

```text
serialized old live Session
→ restored as authority
```

### 3.1 Unconditional load-bearing configuration application

At every ActorRun dispatch/rebind, the load-bearing runtime configuration is **unconditionally applied from current Conexus authority** through the runtime API.

This includes, as applicable:

```text
model pin
provider pin
reasoning/runtime pin
mode
permission/tool surface
Observational Memory = OFF baseline
subagent model selection when applicable
```

No read-compare-maybe-write optimization is authority-safe for this set.

Persisted thread settings may remain as runtime residue, but they are never consulted as current authority.

Prompt/context restatement carries knowledge. Mechanical runtime configuration carries execution authority.

---

## 4. Builder dispatch always reintroduces current authority

Persistent cognition can contain stale facts. Therefore every ActorRun receives a fresh current dispatch context from Builder.

Applicable dispatch facts include:

```text
ActorRun identity
Work Unit / role authority
current contract revision / semantic pins
scope/readSet/writeSet/effectSet as applicable
model/provider/runtime pins
approved tool surface
budget/correlation facts
source-lineage disposition
expected runtime/sandbox refs where load-bearing
```

Law:

```text
stored thread memory says X
current admitted ActorRun authority says Y
→ Y wins mechanically
```

The runtime cannot turn historical cognition into current authorization.

---

## 5. Mastra Workspace scope

The execution workspace scope is determined by `CodingSession` authority and imposed by the Hub/runtime realization.

Current evidence favors a per-session Mastra Workspace instance/override because that mechanism cleanly scopes execution while preserving currently useful Workspace capabilities. Exact API/version choice remains 3L.

Architecture freezes only:

> one implementation CodingSession owns at most one current write-capable sandbox lineage in serial F1.

No SandboxPool, WorkspaceRegistry or generic provider framework follows from this law.

---

## 6. Logical sandbox identity versus physical incarnation

Mastra/E2B logical identity does not prove physical continuity.

```text
Mastra logical sandbox id
!= E2B physical sandboxId
!= continuity proof
```

A paused/resumed physical sandbox may remain the same incarnation. A lost sandbox may be recreated under the same logical id.

Therefore physical-incarnation observability is a required CodingRuntime capability for write-capable execution.

### 6.1 Required observations

For write-capable lineage execution, the realization must support:

```text
observe current physical sandboxId
bind ActorRun execution to observed sandboxId
compare expected/observed incarnation at required control points
```

Inability to observe the physical incarnation is itself insufficient basis for continuity.

### 6.2 Stored refs are expectations, not current truth

Every stored runtime ref in `bld.*` is a correlation/history fact and an expectation to re-verify against live observation, never authority over current runtime state.

This includes, as applicable:

```text
Mastra thread ref
logical sandbox ref
last-verified physical sandboxId
Mastra run ref
provider runtime ref
```

The runtime is observed again before the ref participates in a new authority decision.

---

## 7. ActorRun source-lineage disposition

Every write-capable ActorRun has one immutable source-lineage disposition at admission:

```text
FRESH_BASE
CONTINUE_LINEAGE
```

Exact persisted field name is implementation detail; the semantic fact is required because conditions permitting continuity are not the same as Builder **admitting** continuity.

No third `PARTIAL_RESET` mode is justified.

### 7.1 FRESH_BASE

`FRESH_BASE` means the ActorRun begins from an exact Builder-admitted base/candidate identity rather than inheriting predecessor mutable scratch.

A new physical sandbox is not mandatory when the existing sandbox can be safely reset/materialized to that exact base. The authoritative requirement is base identity, not VM novelty.

### 7.2 CONTINUE_LINEAGE

`CONTINUE_LINEAGE` permits reuse of non-authoritative working-tree/sandbox scratch across ActorRun boundaries only when Builder explicitly admits it.

Required positive gates include, as applicable:

```text
current authority/contract/decomposition compatibility
applicable Work Unit or admitted successor-WU compatibility
positive admissible basis for predecessor failure if predecessor = FAILED
explicit applicable-authority admission if predecessor = CANCELLED
physical-incarnation continuity verified
quiescence established
no material contamination evidence
```

Scratch remains non-authoritative even when continued.

### 7.3 FAILED asymmetry

`FAILED` does not itself mean "safe to continue".

Continuation after a FAILED predecessor requires positive Builder-admissible basis from already-admitted evidence, for example a concrete operational/tooling failure known not to invalidate scratch continuity.

A bare/unknown/orphan `FAILED` cannot be reinterpreted post-hoc as "probably transient".

```text
FAILED + known compatible basis → CONTINUE_LINEAGE may be admitted
FAILED + unknown basis          → FRESH_BASE
```

No retry/cause policy engine is introduced.

### 7.4 CANCELLED asymmetry

A CANCELLED predecessor never enables scratch inheritance by default.

Because cancellation is deliberate and its motive may be outside machine-readable facts:

```text
CANCELLED predecessor
→ CONTINUE_LINEAGE requires explicit applicable-authority admission
→ otherwise FRESH_BASE
```

Cancellation can also independently trigger a fresh cognitive CodingSession under existing 3A-R5 contamination/material-revision rules when warranted; this is not automatic.

---

## 8. Immutable disposition / binding failure law

`FBL-R2-01` is accepted.

The disposition recorded/admitted for an ActorRun is immutable.

If `CONTINUE_LINEAGE` was admitted but its final execution gates fail when the runtime binds to the physical sandbox — for example:

```text
physical sandboxId mismatch
quiescence failure
continuity no longer observable
material contamination discovered
```

then the runtime must **not silently degrade** that ActorRun to `FRESH_BASE`.

Correct behavior:

```text
CONTINUE_LINEAGE cannot be realized
→ ActorRun does not proceed under a different disposition
→ admission aborts if execution has not begun, or ActorRun terminates with appropriate typed basis
→ successor ActorRun may later be admitted as FRESH_BASE
```

This keeps the immutable dispatch record truthful.

---

## 9. Incarnation checking and silent E2B recreation

Current evidence shows the E2B adapter's dead-sandbox process-spawn path may retry once after recreation, without a recreation callback and without a configuration option to disable that retry.

Therefore the earlier hypothetical "disable adapter retry" realization option is removed.

### 9.1 Architecture property

The CodingRuntime realization must make physical execution attributable to an observed sandbox incarnation strongly enough that:

> after an unacknowledged physical-incarnation change, no second write-capable operation is admitted under the false continuity assumption.

A currently plausible realization is:

```text
binding-time physical sandboxId observation
+
pre/post write-capable-operation comparison
```

Exact check frequency/batching remains 3L against the pinned version.

### 9.2 Narrow-wrapper trigger

No custom E2B wrapper is required merely for symmetry.

A narrow guard/wrapper becomes required only if qualification proves that completed write-capable operations cannot be reliably attributed to a physical incarnation with the available observation surface.

```text
incarnation attribution proven without wrapper
→ no wrapper

incarnation attribution impossible/ambiguous
→ smallest guard that surfaces/fences recreation
```

This is a falsifiable 3L trigger, not speculative abstraction.

---

## 10. Working-tree continuity versus authority

WT-B is the accepted candidate:

> non-authoritative scratch may survive across ActorRuns when continuity is explicitly admitted; canonical truth and proof do not derive from scratch survival.

This preserves the value of 3A-R5 persistent cognition and practical coding continuity without treating ActorRun as a mandatory byte-reset boundary.

WT-A — forced clean admitted base before every ActorRun — is rejected as unnecessary F1 complexity because ActorRun is an attempt/audit boundary, not the canonical Work Unit commit boundary.

### 10.1 Hidden mutable state remains non-proof

Inherited environments may contain:

```text
node_modules
build caches
untracked/generated files
process state
environment mutations
other local scratch
```

This does not make them authoritative.

Material proof/verification remains anchored to exact candidate identity and the applicable clean/reproducible verification/compose controls. A dirty inherited workspace cannot become deciding correctness evidence merely because tests happened to pass there.

---

## 11. Quiescence law

Before a successor ActorRun is admitted with `CONTINUE_LINEAGE`, the prior write-capable execution must be quiescent with respect to that mutable tree.

Property:

```text
terminal predecessor ActorRun
+
successor CONTINUE_LINEAGE
→ no unknown predecessor-owned activity capable of mutating the reused tree
```

This is a 3H property and dispatch-gate placement. Repeated recovery policy remains 3M.

### 11.1 Quiescence inspection surface

Tracked process termination alone is insufficient.

The qualified basis must address, for the qualified sandbox/template:

```text
tracked background processes
untracked/self-daemonized processes
live process table / equivalent sandbox-level inspection
deferred-execution facilities capable of later mutation
  e.g. cron / at / systemd timers / equivalent mechanisms present in the template
```

If the qualified environment contains a write-capable scheduling surface that cannot be inspected/neutralized reliably, `CONTINUE_LINEAGE` cannot rely on inspection; reset/recreate becomes the safe basis.

### 11.2 Fail-closed fallback

```text
quiescence proven       → reuse may proceed if all other gates pass
quiescence not provable → reset/recreate/quarantine; no continued write authority
```

No lease or fencing subsystem is introduced for serial F1.

### 11.3 Threat boundary

Quiescence protects provenance against **accidental residual writers** from prior execution.

A malicious guest intentionally defeating inspection is not solved by ever-growing quiescence heuristics. That adversary belongs to sandbox isolation, trust/security topology, verification and 3I controls.

This prevents recreate-always paranoia from being smuggled into the architecture without a matching threat model.

---

## 12. Output custody before Builder presentation

Runtime completion is not Builder delivery.

An exact ActorRun output may be presented to Builder only after its content is durably resolvable outside the disposable sandbox/runtime state.

Law:

```text
runtime produces exact output X
→ transfer/establish Hub-side durable custody of content resolving to X
→ verify identity/content binding
→ only then (or atomically with that custody establishment) record producedOutputRef = X
```

A presentation whose bytes/content cannot be custody-verified is refused rather than recorded.

Possible typed mechanisms remain governed by existing authority (e.g. SHARE bundle / Git/CAS-equivalent Hub-owned storage). Exact transport/schema stays implementation/3L.

This adds no universal Candidate/Delivery entity.

### 12.1 Write-once presentation

Once `ActorRun.producedOutputRef = X` is admitted, it never changes to Y.

Crash after durable presentation can resume judgment of the same X without rerunning the agent.

---

## 13. Cancel / physical interrupt ordering

Cancellation truth is committed in Builder authority first; physical interruption follows as runtime mechanics.

```text
Builder terminalizes ActorRun CANCELLED
→ request AgentController/session abort
→ terminate/inspect ActorRun-owned processes as applicable
→ late runtime output cannot regain authority
```

If physical abort fails, the ActorRun remains CANCELLED.

Late output is telemetry/quarantine only.

Quiescence still must be established before any reused mutable lineage receives future write authority.

---

## 14. Background process lifetime

Default F1:

```text
agent-spawned background process
→ ActorRun-owned
```

It may survive multiple model/tool turns inside the same ActorRun, but it does not automatically gain CodingSession lifetime.

A future session-owned persistent preview/server requires a concrete consumer and later Decision Loop; no ProcessRegistry/SessionDaemon exists now.

---

## 15. Fresh verifier realization

Fresh verifier independence has two distinct requirements.

### 15.1 Cognitive independence

Material verifier uses a fresh verifier CodingSession/live Session/thread, with no implementer transcript or implementer session state.

### 15.2 Mutable-workspace independence

A material verifier never executes inside the implementer's live mutable workspace.

The verifier judges exact candidate identity X using:

```text
fresh materialization of X in an independent execution environment
```

when execution is required, or no sandbox when the verification is purely non-executing/read-only.

The key proof is not "verifier can never write anywhere". It is:

```text
verifier report binds to exact candidate identity X
+
verification materialization cannot mutate the implementer's live lineage
+
Builder later verifies the judged/delivered content still resolves to X
```

Dependency/build cache sharing may exist only through mechanisms that do not reintroduce shared mutable candidate state. Exact optimization remains 3L.

---

## 16. Runtime liveness/control capability surface

3H-01 requires the `CodingRuntime` realization to expose sufficient mechanics for owner-side control and later recovery reasoning, including as applicable:

```text
create/rebind live coding session to exact persistent thread
resolve CodingSession-scoped Mastra Workspace
send/continue runtime work
abort active run
observe runtime run ref
observe logical sandbox ref
observe current physical sandboxId for write-capable execution
enumerate/terminate runtime-tracked processes
inspect sufficient sandbox/process/deferred-execution state for quiescence, or fail closed
obtain runtime/trace correlation refs
observe enough liveness/reconnect information for 3M to judge orphan/recovery paths
```

Exact interfaces/method names stay implementation/3L.

No generic `LivenessService`, lease table or heartbeat FSM is created.

---

## 17. Observability / correlation

Conexus IDs remain domain/correlation authority.

Mastra/E2B/runtime IDs are opaque refs and operational observations only.

```text
ChangeId / WorkUnitId / ActorRunId / CodingSessionId
→ authoritative domain correlation

Mastra thread/run/session refs
E2B logical/physical refs
trace/span/tool/PID/provider refs
→ runtime correlation / telemetry
```

Mastra `agent_end complete` or equivalent runtime completion is `PROVIDER_OBSERVED` telemetry, never an ActorRun/WorkUnit success fact.

No second runtime event ontology is introduced; runtime events map into existing OBS semantics with versioned mapping when implemented.

---

## 18. F5 handoff realization

Runtime→Builder output remains a typed owner-specific proposal/handoff under existing F5 semantics.

Minimum law:

```text
runtime proposes exact output X
→ custody/identity checks
→ Builder admits write-once producedOutputRef X
→ Builder later performs existing delivery judgment
```

No `UniversalRuntimeResult`, `CandidateService`, runtime handoff ledger or universal delivery record is required.

---

## 19. Failure/recovery partition

3H decides what the runtime must expose and what continuity assumptions are valid.

3M decides recovery policy when the runtime says continuity/liveness is lost or ambiguous.

```text
3H:
what can be observed/controlled?
what must be pinned/reverified?
what continuity is safe to assume?
what must fail closed?

3M:
when do we call a run orphaned/lost?
which terminal reason follows?
how long do we wait?
can custody/state be repaired?
what operator/reconciliation path applies?
```

No numeric timeout belongs in 3H-01.

---

## 20. Technology qualification obligations — `CX-BUILDER-MASTRA-01`

3H-01 does not qualify a library version; it defines what 3L must falsify.

The probe/qualification suite must show controls **firing**, not only happy paths.

Required obligations include the existing P1–P24 from prior rounds plus the following final refinements:

```text
P25 dirty inherited workspace produces evidence that would fail on clean X
    → divergence is surfaced by verifier/compose/canonical proof anchor;
      dirty-local pass does not become deciding proof

P26 terminal predecessor plants deferred execution (cron/at/timer equivalent)
    → quiescence gate fires and CONTINUE_LINEAGE is refused until neutralized/recreated

P27 stored thread poisoned with:
      - stale model/provider selection
      - permissive permission/tool state where representable
      - OM re-enabled
      - stale subagent model selection
    → dispatch mechanically overwrites current load-bearing values

P28 ActorRun admitted CONTINUE_LINEAGE; binding later fails continuity/quiescence/incarnation gate
    → ActorRun never silently executes as FRESH_BASE
    → abort/terminal path fires; successor may be freshly admitted

P29 completed write-capable sandbox operation is attributable to a physical sandbox incarnation
    → forced dead-sandbox/recreation case either proves attribution via observation
      or triggers the narrow-wrapper requirement
```

Additionally preserve the earlier required cases for:

```text
clean AgentController restart with thread rebind
mid-run process loss without implicit replay
E2B pause/resume same physical incarnation
E2B physical reincarnation detection
late output after FAILED/CANCELLED
Hub-side custody before producedOutputRef
untracked daemon quiescence failure
fresh verifier mutation isolation
stale authority/config override
output already durably presented → resume judgment of same X
```

Qualification failure reopens the substrate/realization choice first, not Builder domain semantics automatically.

---

## 21. Explicitly not built by 3H-01

```text
new module                          = 0
new durable record class            = 0
new shared scheduler                = 0
new queue                           = 0
new workflow engine                 = 0
new retry engine                    = 0
new lease/fencing subsystem         = 0
new checkpoint engine               = 0
new generic runtime registry        = 0
new provider framework              = 0
new SandboxPool                     = 0
new ProcessRegistry                 = 0
new Candidate/Delivery service      = 0
mandatory E2B wrapper               = 0 unless 3L attribution probe proves it necessary
sandbox snapshot manager            = 0
parallel Builder execution          = 0
best-of-N                           = 0
Observational Memory                = OFF baseline
```

This is the minimum realization that closes the named current failure classes.

---

## 22. Deferred ownership

### 3I — Security / Authority

```text
credential custody
provider/E2B API keys
network/egress policy
server-side capability expiry enforcement
trust boundary against malicious guest
approver/cancel eligibility
```

### 3J — Deployment / Operations

```text
same/separate physical processes
auto-pause/timeout/cost tuning
worker counts/supervision
shutdown topology
backup/restore policy where applicable
```

### 3K — Frontend / Product

```text
progress labels
retry/recovery presentation
approval/cancel UX
technical drill-down presentation
```

### 3L — Technology Qualification

```text
exact Mastra/E2B versions and APIs
incarnation attribution mechanism
per-session Workspace realization
LSP/mounts/current resolver limitations
cache sharing
quiescence inspection implementation
narrow-wrapper trigger verification
```

### 3M — Failure & Recovery

```text
orphan detection policy/numeric timeout
lost sandbox/session recovery
repeated quiescence failure policy
corrupt/missing custody recovery
terminal reason/calibration
operator reconciliation
```

No deferred item above is required to change the 3H-01 semantic partition.

---

## 23. Adversarial alternative comparison — final

### Alternative A — `CodingSession = AgentController live Session`

**REJECT.** Couples Builder identity to process-local runtime state and cannot survive clean process recreation honestly.

### Alternative B — serialize/restore full AgentController live-session state

**REJECT.** Creates stale-authority resurrection, vendor-internal coupling and a second pseudo-checkpoint/session engine.

### Alternative C — fresh cognitive session + fresh sandbox for every ActorRun

**REJECT.** Simpler locally but destroys the persistent-cognition value already ratified in 3A-R5, while not eliminating custody, verifier or delivery-boundary requirements.

### Alternative D — Builder durable CodingSession + persistent cognitive thread + explicit ActorRun lineage admission + observable E2B incarnations

**ADOPT / GLOBAL MAXIMUM.** Preserves essential continuity while keeping authority, proofs and terminal truth outside the runtime substrate.

### Alternative E — heavy custom runtime/E2B wrapper from day one

**REJECT / DEFER.** Current failure classes require observability and fail-closed laws, not a provider framework. A narrow wrapper is created only if 3L proves incarnation attribution impossible otherwise.

---

## 24. Reopen triggers

3H-01 should be reopened only on evidence such as:

```text
Mastra cannot rebind persistent cognitive context without requiring its live Session as authority
Mastra cannot accept current runtime configuration mechanically at dispatch
E2B physical incarnation cannot be observed/attributed even with a narrow guard
qualified sandbox cannot provide a safe reset/recreate path
Hub-side custody of exact output cannot be established without introducing a materially different architecture
fresh verifier cannot be isolated from implementer mutable state at acceptable cost
measured F1 execution requires parallel/multi-lineage semantics that serial design cannot satisfy
```

Framework preference, symmetry, generic optionality or a cleaner abstraction alone are not reopen triggers.

---

## 25. Final consistency check against 3C–3G

### 3C-05

Builder still owns Change/Plan/WU/ActorRun/validation/Finding/closure. Runtime receives bounded authority only.

### 3D-R1

No dependency inversion or generic shared infrastructure added. `CodingRuntime` remains the frozen infra boundary.

### 3E

No new durable record class/FK. Existing `bld.coding_session` and `bld.actor_run` are sufficient. Mastra storage remains opaque/isolated.

### 3F

Runtime output remains F5 proposal/handoff; producer never self-authorizes acceptance. No universal envelope/event/status created.

### 3G-02

Builder authority mutations remain serialized under the Change-owned root; external runtime I/O does not occur inside the authority transaction.

### 3G-03

ActorRun remains one concrete immutable attempt; terminal facts stay write-once; output presentation is exact/write-once; retry is a new ActorRun; external-effect safety remains Gateway-owned.

No contradiction found.

---

## 26. Final recommendation to operator

```text
Material Finding against approved authority = NONE
Reopen required                              = NONE
Alternative D                               = GLOBAL MAXIMUM
WT-B                                        = ADOPTED with explicit immutable admission
FBL-R1-01..06                               = INCORPORATED
FBL-R2-01..06                               = INCORPORATED
P25..P29                                    = INCORPORATED
New infrastructure                          = NONE
Overengineering finding                     = NONE
YAGNI violation                             = NONE found
Buildability with current substrate         = CREDIBLE, qualification still required by 3L
3H-01 candidate status                      = READY FOR OPERATOR DECISION
```

### Candidate decision sentence

> **3H-01 — Builder Coding Runtime Realization & Session/Sandbox Mapping:** Conexus `CodingSession` is the durable Builder-owned cognitive/runtime lineage for a Change and is realized by a persistent Mastra thread plus ephemeral AgentController live-session incarnations and at most one current write-capable Mastra Workspace/E2B lineage in serial F1. Every ActorRun reintroduces current Conexus authority mechanically and admits immutable `FRESH_BASE` or `CONTINUE_LINEAGE` source semantics; runtime/session/thread/sandbox state never becomes authority. Mutable scratch may cross ActorRun boundaries only under explicit positive Builder admission, verified physical-incarnation continuity and quiescence; unknown or cancelled continuity fails closed. Physical E2B incarnation is observable and reverified, stored runtime refs remain correlation expectations only, and silent recreation cannot authorize continued execution. Exact output must enter Hub-side durable custody before Builder records its write-once presentation. Cancellation truth precedes best-effort physical interrupt. Material verification uses fresh cognition and a fresh materialization of the exact candidate rather than the implementer live mutable workspace. Runtime liveness/control mechanics are exposed through the existing `CodingRuntime` boundary; exact failure/recovery policy stays 3M and exact Mastra/E2B mechanisms remain subject to `CX-BUILDER-MASTRA-01` in 3L. No new workflow engine, queue, scheduler, lease, retry engine, checkpoint engine, provider framework or mandatory E2B wrapper is introduced.

This file remains non-authoritative until explicit operator ratification.

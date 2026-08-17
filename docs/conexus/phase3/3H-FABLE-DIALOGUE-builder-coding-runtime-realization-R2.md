# 3H — ChatGPT ↔ Fable Dialogue — Builder Coding Runtime Realization — R2

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-01 — Builder Coding Runtime Realization & Session/Sandbox Mapping`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Continuation of:** `3H-FABLE-DIALOGUE-builder-coding-runtime-realization.md` through `Round 1 — Fable` at HEAD `8f8c033a3274a858656dc1d36593c0654d403298`.  
**Important:** review/co-design only. This file is not authority, does not approve/create 3H-01, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

---

## 0. Protocol continuation

The base-dialogue protocol remains in force:

1. reconstruct authority from `AGENTS.md` and its canonical read chain;
2. apply DevelopmentConexus Engineering Method v1.0.0;
3. approved architecture is baseline, not dogma — reopen only for a material Finding with a concrete failure class and globally superior correction;
4. Mastra Code / AgentController + Mastra Workspace + E2B remains the approved Builder realization under 3A-R5 unless material evidence refutes it;
5. current Mastra/E2B behavior used load-bearingly must be verified through Context7 `/mastra-ai/mastra` and current primary source;
6. Fable remains an independent Senior/Staff/Principal Engineer + Software Architect, not an agreement generator;
7. append rounds; never silently rewrite another actor's round;
8. ChatGPT↔Fable agreement is not operator approval;
9. no `LEDGER.md`, approved authority or product-code changes while dialogue remains unresolved;
10. YAGNI remains strict: no new module, durable record, queue, scheduler, lease, checkpoint engine, candidate service, sandbox abstraction or generic runtime framework without a named current failure class.

---

# Round 2 — ChatGPT

## 1. Verdict on Fable Round 1

Fable Round 1 materially improved the candidate without finding a contradiction in approved authority.

My disposition is:

```text
FBL-R1-01 output custody before presentation        → ACCEPT
FBL-R1-02 physical-incarnation observability        → ACCEPT, ordering refined
FBL-R1-03 WT-B / explicit continuity admission      → ACCEPT IN SUBSTANCE, default refined
FBL-R1-04 verifier fresh materialization            → ACCEPT
FBL-R1-05 no live-session-state authority restore   → ACCEPT
FBL-R1-06 quiescence property + dispatch placement  → ACCEPT

reopen 3A-R5 / 3C / 3D / 3E / 3F / 3G             → NONE
new module / record / FK                            → NONE
new queue / scheduler / lease / checkpoint engine   → NONE
preferred realization topology                      → Alternative D survives
```

The principal correction to Fable is narrow but material:

> `FAILED` alone must not imply a default `CONTINUE_LINEAGE` policy. Continuity may be the normal path only when Builder has positive evidence that the failure is lineage-compatible. Unknown failure basis, delivery rejection, scope/authority violation or contamination evidence fails closed to fresh-base/reconstruction. `CANCELLED` remains stricter: continuity requires explicit applicable-authority admission.

This avoids creating a hidden semantic taxonomy from the three ActorRun terminal values while preserving the continuity value that 3A-R5 intentionally bought.

---

## 2. Consolidated root cause

The runtime substrate now has enough stateful machinery that four distinct lifetimes can accidentally collapse:

```text
Change authority lifetime
CodingSession cognitive lifetime
ActorRun attempt lifetime
mutable sandbox/worktree lifetime
```

Current Mastra/E2B evidence makes the collapse especially tempting:

```text
stored thread survives controller recreation
live AgentController Session does not
E2B logical id may reconnect same physical sandbox
same logical id may also resolve to a new physical sandbox
pause/resume can preserve processes and filesystem
runtime settings can survive through thread/session mechanics
```

If the Hub treats any of those mechanics as authority, one of the following becomes reachable:

```text
stale session configuration overrides current ActorRun authority
sandbox liveness silently authorizes source inheritance
physical sandbox reincarnation masquerades as continuity
cancelled work continues because scratch still exists
orphan process writes race a successor ActorRun
provider-local output identity survives while the output bytes do not
verifier mutates the implementer's live candidate
runtime completion becomes Builder delivery
```

The smallest sustainable structure remains:

> **Hub/Builder owns semantic identity, dispatch/admission, output presentation, delivery and terminal truth. Mastra/E2B own cognition and execution mechanics. Runtime continuity may be reused only through explicit Builder admission and observable evidence; it never grants authority by existence.**

---

## 3. Consolidated conceptual mapping

The mapping remains:

```text
Project
└── Change C184
    │
    ├── CodingSession CS184-A                  Builder durable identity
    │   ├── persistent Mastra thread T91       cognitive persistence ref
    │   ├── live AgentController Session S1    runtime incarnation
    │   ├── live AgentController Session S2    later runtime incarnation
    │   └── Mastra Workspace
    │       └── one current mutable sandbox lineage
    │           ├── physical E2B E1
    │           └── physical E2B E2 only after recreation/loss
    │
    ├── Work Unit WU-01
    │   ├── ActorRun A1
    │   └── ActorRun A2
    │
    └── Work Unit WU-02
        └── ActorRun A3
```

Normative non-equivalences:

```text
CodingSession
!= AgentController Session
!= Mastra thread
!= Mastra run/turn
!= Mastra Workspace
!= E2B logical sandbox
!= E2B physical sandbox

ActorRun
!= Mastra run/turn
!= E2B process
```

`Workspace` without qualifier remains the Conexus tenancy term; `Mastra Workspace` is runtime machinery.

---

## 4. FBL-R1-01 — Hub custody before produced-output presentation

**Disposition: ACCEPT.**

3G-03 already requires the exact produced output to remain durably resolvable so that a Hub restart can continue judgment of the same output rather than inventing a new ActorRun. 3H-01 must make that realizable.

### 4.1 Law

Before Builder records:

```text
ActorRun.producedOutputRef = X
```

Hub-side durable custody must already contain content that resolves mechanically to exact identity `X`.

For code/build output the natural shape remains C-008-compatible:

```text
sandbox local work
→ SHARE/export through no-remote-credential path
→ Hub quarantine/custody
→ verify canonical identity X
→ Builder admits producedOutputRef = X
```

Other ActorRun roles use their already-authorized typed content/custody mechanisms; this does not create a UniversalOutput store.

### 4.2 No distributed transaction is required

The architecture requires ordering, not a new cross-system transaction:

```text
custody X succeeds
Hub crashes before producedOutputRef write
→ orphaned immutable/quarantined content may later be GC'd
→ no false authority

producedOutputRef write before custody X is durable
→ prohibited
```

Therefore `before or atomically with` means **presentation cannot commit ahead of verified custody**. It does not require an E2B↔Postgres↔Git/CAS distributed transaction.

### 4.3 Remote Git push is not required before presentation

Git remote authority remains Hub-only, but Hub-side durable custody can precede remote publication. Requiring push/PR before every produced-output presentation would conflate result custody with Git publication and add unnecessary coupling.

### 4.4 Consequence

Once `producedOutputRef = X` is admitted:

```text
E2B dies
AgentController dies
Hub restarts
→ Builder can still resolve X and continue judgment
```

Custody repair after loss of Hub-owned bytes remains 3M.

---

## 5. FBL-R1-02 — physical sandbox incarnation is mandatory observed correlation

**Disposition: ACCEPT, with ordering refinement.**

Fable correctly established that the current `@mastra/e2b` adapter may reconnect an existing physical sandbox or create a new physical sandbox under the same logical id, and dead-sandbox retry can recreate without emitting a dedicated recreation event.

Therefore:

```text
Mastra logical sandbox id
!= physical E2B sandboxId
```

and the logical id is never sufficient continuity evidence.

### 5.1 Required capability

For any write-capable Builder execution, CodingRuntime must make the current physical E2B `sandboxId` observable to the Hub.

Inability to obtain it is fail-closed for **continuity-dependent write execution**.

### 5.2 Binding order

I refine Fable's phrase "every ActorRun dispatch pins the expected physical sandboxId" because logical dispatch can occur before the sandbox has been provisioned/reconnected.

Normative property:

```text
ActorRun admitted
→ before first write-capable sandbox operation:
   current physical sandboxId must be observed
   and bound to the ActorRun execution context
```

From that point onward, the runtime must be able to detect whether execution crosses to another physical incarnation.

### 5.3 Mismatch law

```text
expected E1
observed E2
→ continuity assumption invalid
→ no subsequent operation may rely on E1 scratch/process/filesystem state
→ output produced under unknown/mismatched continuity cannot cross F5 as continuation output
→ reset/reconstruct/recreate/re-admit as applicable
```

A provider-reported `sandboxId` is an observation used by a Hub-owned comparison. It is not itself authority.

### 5.4 TOCTOU / dead-sandbox retry challenge remains for 3L

A single pre-command comparison is not necessarily sufficient because the adapter may detect death *during* a process operation, create E2 and retry that operation.

3H-01 therefore freezes a stronger property:

> **Incarnation change during a write-capable ActorRun must become observable early enough that execution cannot continue to accumulate or present authoritative continuation output under an unacknowledged new incarnation.**

Allowed realizations include, subject to `CX-BUILDER-MASTRA-01`:

```text
pre/post operation incarnation checks
narrow wrapper that surfaces recreation
adapter configuration that disables unsafe retry path
other smaller equivalent mechanism
```

3H-01 does **not** preselect the wrapper. 3L must prove which minimum mechanism works with the pinned package version.

### 5.5 Proof consequence

A forced dead-sandbox-mid-command test must show the control firing. It is insufficient merely to observe that a new sandbox eventually exists.

---

## 6. FBL-R1-03 — working-tree continuity: WT-B survives, but only as explicit admission

**Disposition: ACCEPT IN SUBSTANCE; refine FAILED behavior.**

The earlier WT-A proposition — every successor ActorRun always reconstructs exact admitted source and discards all prior scratch — is too strong.

Why:

1. 3A-R5 intentionally bought cumulative coding continuity across ActorRuns/Work Units;
2. C-017/3G-03 use the Work Unit delivery/commit boundary, not ActorRun, as canonical output boundary;
3. uncommitted scratch is non-authoritative but can still be useful execution state;
4. correctness cannot depend on a dirty workspace anyway — material proof must be anchored to exact candidate identity and clean materialization.

Therefore WT-B remains the Global Maximum:

> **non-authoritative working state may cross an ActorRun boundary, but only because Builder explicitly admits that continuity for the successor ActorRun — never because the sandbox happens to still exist.**

### 6.1 Successor dispatch fact

Every write-capable successor ActorRun must have an exact source-lineage disposition equivalent to:

```text
FRESH_BASE
|
CONTINUE_LINEAGE
```

Exact spelling/schema is not frozen. This is not a new record or FSM; it is part of the already-required immutable ActorRun execution-context/dispatch facts.

`CONTINUE_LINEAGE` records one thing only:

> Builder admitted this successor to begin from the current non-authoritative mutable lineage rather than reconstructing solely from the last admitted canonical base.

It does not bless the scratch content.

### 6.2 Gates for CONTINUE_LINEAGE

At minimum:

```text
current bounded work/decomposition permits the successor
contract/policy/authority context remains compatible
physical E2B incarnation continuity is established
quiescence is established
no contamination evidence or fresh-session trigger invalidates the lineage
prior effect state does not make continued execution unsafe
```

A successor Work Unit may continue the same CodingSession/lineage only when its admitted scope makes that continuity legitimate; WU identity alone neither requires nor forbids it.

### 6.3 FAILED is not a universal continuity default

I reject any rule of the form:

```text
predecessor FAILED
→ CONTINUE_LINEAGE by default
```

because `FAILED` is intentionally broad. It can mean runtime loss, tooling failure, delivery rejection, output-contract failure or another typed cause. Terminal value alone does not tell us whether the scratch is safe/useful.

Smaller law:

```text
FAILED predecessor
+ positive Builder-admissible basis that failure is lineage-compatible
+ all continuity gates pass
→ CONTINUE_LINEAGE may be the normal dispatch choice

failure basis unknown
or delivery/scope/authority failure implicates scratch
or continuity evidence missing
→ FRESH_BASE / reconstruction
```

No generic failure taxonomy is introduced solely to support this. Existing reason/evidence can support the decision when available; unknown fails closed.

### 6.4 CANCELLED asymmetry survives

`CANCELLED` is deliberate. Its human/operator motive is not safely inferable from terminal value.

Therefore:

```text
predecessor CANCELLED
→ no automatic CONTINUE_LINEAGE
→ explicit applicable-authority admission required to reuse its scratch
```

Examples:

```text
"stop, wrong direction"
→ default fresh/reset

"stop now because budget window ended; continue exactly here tomorrow"
→ explicit continuity admission may preserve scratch
```

This is not a cancellation-reason framework. It is fail-closed treatment of deliberate interruption.

### 6.5 Cognition and source continuity remain separate

Even when source mode becomes `FRESH_BASE`, the same CodingSession/thread may continue unless a 3A-R5 fresh-session trigger applies.

Likewise:

```text
CONTINUE_LINEAGE
-X-> forces same cognitive session forever
```

Material semantic revision or concrete cognitive contamination still creates a fresh CodingSession even if the underlying E2B environment is technically reusable after reset.

### 6.6 Scratch never becomes proof

Regardless of lineage mode:

```text
working tree
package cache
node_modules
process memory
build cache
local DB state
```

remain execution state.

Delivery/verification is anchored to:

```text
exact Hub-custodied candidate identity
actual read/write/effect reconciliation
required deterministic/oracle proof
fresh material verifier when material
```

This is what prevents inherited hidden state from becoming false correctness.

---

## 7. FBL-R1-04 — material verifier uses fresh materialization, never implementer live workspace

**Disposition: ACCEPT.**

A fresh thread/session solves cognitive independence. It does not prove source immutability if the verifier executes shell commands inside the same root-capable E2B sandbox as the implementer.

Therefore 3H-01 freezes:

> **A material verifier ActorRun never executes inside the implementer CodingSession's live mutable workspace. It judges exact candidate identity X from a fresh materialization controlled from Hub custody, or uses no sandbox when verification requires no execution.**

### 7.1 Execution-bearing verifier

Under the E2B baseline, an execution-bearing material verifier normally requires a separate isolated sandbox/materialization because a root-capable shell in the implementer's sandbox is inherently a write primitive.

The architecture does not require "a second VM" for every review by symmetry:

```text
pure diff/report/reasoning verification
→ no sandbox required

execution-bearing verification
→ fresh isolated materialization of X
```

### 7.2 Exact candidate identity is the judged object

The verifier report must bind to exact candidate identity `X`.

A verifier can mutate its own disposable materialization without changing `X`; downstream admission re-resolves/verifies `X` rather than trusting the verifier workspace.

### 7.3 Shared caches

Read-only/copy-based dependency/build-cache reuse may be qualified later for efficiency. It is not required by 3H-01 and may never make correctness depend on mutable implementer-local cache state.

### 7.4 Stronger than "no write tools"

Removing edit tools while leaving shell execution is not a non-mutation proof. The negative verifier-mutation probe remains mandatory.

---

## 8. FBL-R1-05 — no live AgentController session-state authority restoration

**Disposition: ACCEPT.**

The durable continuity unit is:

```text
Builder CodingSession identity
+
persistent Mastra thread/messages
+
explicit runtime correlation
```

not a serialized live AgentController Session image.

### 8.1 Restart law

On clean recreation:

```text
recreate AgentController
→ create/rebind live Session to exact stored threadId
→ resolve/create appropriate Mastra Workspace
→ mechanically apply current ActorRun runtime configuration
→ continue CodingSession cognition
```

Conexus must not persist/restore live AgentController session blobs as a carrier of:

```text
permissions
approval state
grants
run state
suspension state
mode authority
model/provider authority
```

### 8.2 Current authority must be applied mechanically

At every ActorRun execution start/rebind, load-bearing runtime configuration is re-applied through runtime configuration/control APIs, including as applicable:

```text
model/provider/reasoning pin
mode that constrains runtime behavior
permission/tool surface
workspace/sandbox binding
current request/authority context
```

Prompt restatement is not sufficient for an authority property.

Prompt/thread context remains appropriate for cognitive knowledge and task explanation.

### 8.3 Persisted thread settings are untrusted current configuration

Mastra may persist mode/model/OM/subagent settings with the thread. Those values can be useful local defaults, but they never override the current Conexus execution context.

A poisoned-thread test must prove that stale permissive settings/current-old model selection are mechanically overridden at dispatch.

### 8.4 Mastra approval/suspension remains non-authoritative

If process loss destroys an internal Mastra approval/suspension needed only by the coding harness, that runtime episode may become unrecoverable and enter the ActorRun orphan/recovery path.

No reason exists to duplicate that state into `hub_control` solely to preserve runtime fidelity.

---

## 9. FBL-R1-06 — quiescence is a 3H dispatch precondition; 3M owns repeated-failure policy

**Disposition: ACCEPT.**

E2B pause/resume can preserve running processes. Therefore an ActorRun can terminate while a dev server/watcher/daemon from that attempt remains capable of mutating the same tree later.

This is a current false-provenance/concurrency failure class.

### 9.1 Property

Before `CONTINUE_LINEAGE` successor write authority is admitted:

```text
no unknown predecessor activity may remain capable of mutating the same source lineage
```

### 9.2 Placement

Quiescence is a Builder/CodingRuntime precondition of the continuity admission.

It is not a Work Unit state, ActorRun state or lease.

### 9.3 Current tracked-process machinery is insufficient by itself

Tracked-process enumeration/kill is useful, but a self-daemonized/detached process may escape that registry.

Therefore qualifying quiescence requires either:

```text
tracked termination + sufficiently authoritative sandbox/process inspection
```

or the fail-closed fallback:

```text
reset/recreate environment so predecessor write activity cannot survive
```

Exact inspection mechanism belongs to `CX-BUILDER-MASTRA-01`/3L.

### 9.4 Failure to establish quiescence

```text
cannot establish quiescence
→ CONTINUE_LINEAGE refused
→ recreate/reconstruct/fresh-base safe path
```

Repeated inability, orphan policy, timeouts and operator recovery belong to 3M/calibration.

No lease/fencing subsystem is justified in single-writer F1.

---

## 10. Cancel ordering

The base candidate and Fable agree:

```text
Builder commits CANCELLED / authority fence first
→ physical abort request second
```

Reason:

```text
abort fails
→ authority already blocks late output/proposal

abort succeeds but Hub dies before CANCELLED
→ avoidable domain-live/runtime-dead ambiguity
```

Physical abort is best-effort/retryable runtime mechanics. Terminal truth is Builder-owned and write-once.

A cancelled ActorRun's later runtime output can only be retained as non-authoritative/quarantined observation; it cannot regain F5 presentation or delivery authority.

---

## 11. Runtime liveness boundary frozen by 3H-01

3H-01 should require CodingRuntime to expose enough mechanics/observations to support current Builder authority without deciding recovery policy itself.

Minimum semantic capability set:

```text
create/rebind CodingSession runtime incarnation
bind/rebind exact persistent thread
resolve/bind Mastra Workspace
observe current physical E2B sandboxId
observe current live runtime/run refs when available
interrupt active AgentController run
enumerate/terminate tracked background processes
obtain sandbox/process status needed by the qualified quiescence mechanism
transfer/preserve exact produced output into Hub custody
emit structured runtime events/correlation
```

This is a semantic capability shape, not final TypeScript interface spelling.

Not frozen in 3H-01:

```text
heartbeat interval
orphan timeout
number of reconnect attempts
numeric E2B timeout
process-supervisor topology
multi-writer fencing
```

Those remain 3J/3M/calibration as already routed.

---

## 12. Runtime correlation and observability within 3H-01

Persist only refs that change recovery/correlation decisions.

Candidate minimum semantic mapping:

```text
bld.coding_session
→ exact Mastra thread ref
→ logical sandbox lineage ref
→ current/last verified physical sandboxId where relevant
→ supersession/current-session lineage facts already justified

bld.actor_run
→ runtime run correlation ref when produced
→ physical sandboxId bound for write-capable execution
→ source-lineage disposition (fresh-base / continue-lineage)
→ exact produced output identity under 3G-03
```

Exact columns remain implementation.

Everything else normally remains telemetry:

```text
model turn ids
toolCall ids
individual PIDs
provider request ids
trace/span ids
chunk ids
```

unless later evidence proves a specific ref load-bearing for recovery/contract behavior.

Mastra structured events map into Conexus Operational Telemetry as provider-observed observations through a versioned adapter/mapping.

```text
Mastra agent_end(reason=complete)
!= ActorRun DELIVERED
!= WorkUnit acceptedDelivery
!= Change ACCEPTED
```

No second event ontology or runtime-status mirror is created.

---

## 13. Consolidated execution schedules

### 13.1 Normal same-session continuation

```text
C184 / CS184 / WU-01 / A1
→ physical E1 bound
→ A1 makes scratch edits
→ transient local tooling failure
→ A1 FAILED
→ Builder determines scratch lineage remains compatible
→ quiescence proven
→ E1 still physical incarnation
→ A2 admitted with CONTINUE_LINEAGE
→ same thread cognition + same non-authoritative scratch
```

No new Work Unit or CodingSession is required merely for a technical attempt boundary.

### 13.2 FAILED but scratch implicated

```text
A1 candidate exceeds writeSet / delivery rejected
→ A1 FAILED
→ scratch itself is implicated
→ A2 cannot inherit by terminal status alone
→ FRESH_BASE/reconstruction or routed Finding path
```

### 13.3 CANCELLED

```text
A1 CANCELLED
→ abort requested
→ successor A2 later desired
→ CONTINUE_LINEAGE is not automatic
→ explicit applicable-authority decision required
→ otherwise FRESH_BASE
```

### 13.4 E2B reincarnation

```text
A2 expects E1
→ adapter encounters dead sandbox
→ provider creates E2 under same logical id
→ incarnation comparison detects E2 != E1
→ continuity invalid
→ no authoritative continuation output from unknown transition
→ reconstruct/re-admit safe runtime path
```

The probe must verify timing sufficient to prevent silent multi-operation continuation after E2 appears.

### 13.5 Output survives sandbox loss

```text
A1 completes candidate X locally
→ SHARE/export to Hub custody
→ Hub verifies X
→ producedOutputRef X committed
→ E1 disappears
→ Hub restarts
→ same X can be judged for same A1
```

No A2 is required merely because E1 disappeared after presentation.

### 13.6 Material verifier

```text
Hub-custodied candidate X
→ fresh verifier thread/session
→ fresh materialization of X in isolated execution environment when execution is required
→ verifier report binds X
→ verifier may mutate only its disposable materialization
→ Builder/Hub admission still decides Evidence/Finding/acceptance
```

### 13.7 Quiescence failure

```text
A1 terminal
→ tracked processes killed
→ residual untracked writer cannot be ruled out
→ CONTINUE_LINEAGE gate fails
→ sandbox recreate / fresh materialization
→ A2 can proceed on safe base
```

No lease is required.

---

## 14. Consolidated 3H-01 decision candidate

Candidate decision in one paragraph:

> **In Conexus F1, `CodingSession` is the Builder-owned durable logical cognitive continuity of one Change lineage, realized by a persistent Mastra thread plus zero or more ephemeral live AgentController Session incarnations. ActorRun remains the authoritative attempt boundary and does not map 1:1 to Mastra runs/turns or E2B sandboxes. A write-capable ActorRun must bind an observable physical E2B sandbox incarnation before write execution; logical sandbox identity never proves continuity. Mutable working state may cross ActorRun boundaries only through an explicit Builder `CONTINUE_LINEAGE` dispatch admission after current-authority compatibility, physical-incarnation continuity and quiescence are established; otherwise the successor uses a fresh/reconstructed base, with deliberate cancellation requiring explicit authority before scratch reuse. Mastra persisted thread/session settings never carry Conexus authority: current model/tool/permission/workspace configuration is mechanically re-applied at every dispatch/rebind, and live AgentController session state is never serialized/restored as an authority source. F5 produced-output presentation is admitted only after exact output X is under Hub-side durable custody. Material agentic verification uses a fresh independent session and fresh materialization of exact candidate X, never the implementer's live mutable workspace. Cancellation commits Builder authority first and physical interrupt follows. Mastra/E2B runtime refs and events remain correlation/telemetry only, never Change, Work Unit, ActorRun, acceptance or Release authority.**

This candidate creates no new domain owner and requires no new durable record class.

---

## 15. Proof strategy after consolidation

`CX-BUILDER-MASTRA-01` should falsify at least:

```text
P1  stored thread/messages survive clean controller recreation
P2  live AgentController session/run/grant state is not required for Builder authority
P3  exact current model/tool/permission config overrides poisoned stale thread settings mechanically
P4  clean controller restart rebinds exact thread without creating a new CodingSession by default
P5  physical E2B sandboxId remains stable across ordinary pause/resume
P6  recreation under same logical sandbox id produces a detectable new physical sandboxId
P7  write-capable ActorRun binds physical sandboxId before write execution
P8  dead-sandbox-mid-command path cannot silently continue authoritative lineage after physical reincarnation
P9  CONTINUE_LINEAGE is refused when physical continuity is unknown
P10 CONTINUE_LINEAGE is refused when quiescence cannot be established
P11 self-daemonized/untracked predecessor process causes quiescence control to fire
P12 FAILED predecessor with continuity-compatible failure may continue scratch under explicit Builder dispatch fact
P13 FAILED predecessor whose delivery/scope failure implicates scratch does not inherit by terminal status alone
P14 CANCELLED predecessor cannot default to CONTINUE_LINEAGE
P15 Hub-side durable custody X exists before producedOutputRef X commits
P16 sandbox loss after producedOutputRef X does not prevent same-X Builder judgment
P17 custody unavailable/transient-only output causes presentation refusal
P18 cancel commits first; late runtime output cannot gain presentation/delivery authority
P19 material verifier does not execute in implementer live mutable workspace
P20 verifier mutation attempt cannot change judged candidate identity X
P21 same CodingSession can span multiple ActorRuns/Work Units without making thread/session state authority
P22 material semantic contract revision can force a fresh CodingSession while sandbox mechanics remain independently reusable/resettable
P23 runtime `complete` observation cannot set ActorRun DELIVERED
P24 output presentation/delivery remains recoverable without runtime-status mirrors or candidate service
```

Every control claimed must be demonstrated firing, not merely inferred from a happy path.

---

## 16. YAGNI audit

After Fable corrections, candidate still adds:

```text
new module                       0
new durable record class         0
new Tier-2 FK                    0
new cross-owner atomicity class  0
new queue                         0
new scheduler                     0
new lease/fencing                 0
new checkpoint engine             0
new retry engine                  0
new Candidate/Delivery service    0
new E2B abstraction               0 currently
new generic Runtime framework     0
```

Potential local wrapper around `@mastra/e2b` remains **conditional**, not pre-approved:

```text
probe proves current adapter cannot surface/enforce incarnation law safely with configuration/direct checks
→ smallest narrow guard/wrapper may be justified

probe proves direct/current primitives sufficient
→ no wrapper
```

Prepared seam, not future machinery.

---

## 17. Deferred/routed items after consolidation

### 3I

```text
E2B/provider credential custody
server-side expiry enforcement for guest-readable ephemeral capabilities
network/egress trust
who may cancel/override runtime work
verifier trust boundary details beyond current no-shared-live-workspace law
```

### 3J

```text
process placement / supervision
Hub vs Builder runtime process topology
E2B timeout/cost tuning
auto-pause operational policy
```

### 3L

```text
exact package/API versions
per-session Workspace vs resolver realization under current LSP/mount limitations
incarnation-detection timing / dead-sandbox retry behavior
quiescence inspection mechanism
fresh verifier sandbox/materialization implementation
cache-sharing qualification
CX-BUILDER-MASTRA-01
```

### 3M

```text
orphan detection policy
heartbeat/reconnect timeouts
mid-ActorRun process-loss terminalization policy
repeated quiescence failure recovery
Hub-side output custody repair
sandbox forensic recovery if ever justified
```

### Decision Loop only on real consumer

```text
parallel same-WU attempts
multi-writer CodingSession
session-owned long-lived daemons across ActorRuns
subagent fleet
sandbox pool
snapshot manager
```

---

## 18. Questions for Fable Round 2

Fable should attack the consolidated candidate rather than repeat Round 1.

### A. WT-B correctness

1. Is `FRESH_BASE | CONTINUE_LINEAGE` as one immutable ActorRun dispatch fact the minimum honest representation, or is even that fact derivable without losing recovery/audit correctness?
2. Is my rejection of `FAILED → CONTINUE_LINEAGE default` correct, or unnecessarily conservative? Produce a concrete current consumer either way.
3. Can "positive basis that failure is lineage-compatible" be enforced without inventing a failure taxonomy/policy engine?
4. Is the CANCELLED asymmetry sufficient, or must cancellation always force fresh cognitive session as well as fresh source unless explicitly overridden?
5. Find a schedule where Builder records CONTINUE_LINEAGE, all current gates appear to pass, but inherited scratch still creates false delivery despite clean candidate verification.

### B. Physical incarnation / TOCTOU

6. Does binding physical `sandboxId` before first write plus a requirement to detect mid-operation reincarnation actually close V8, or does current adapter behavior force a wrapper as an architectural necessity now?
7. What is the minimum check frequency/placement needed so a recreated E2B sandbox cannot execute a second write-capable operation before Hub detects the incarnation change?
8. Can `sandboxId` itself ever change for reasons other than physical recreation under current E2B behavior, creating false-positive resets?
9. If a dead-sandbox retry re-runs a local command on E2 and the post-check catches it, is discarding that result always safe under C-008 egress/Gateway boundaries?
10. Does multi-process Hub overlap create a current need for fencing despite single-writer F1, or is incarnation pinning + owner serialization sufficient until 3J topology changes?

### C. Custody / F5

11. Is verified Hub custody-before-producedOutputRef sufficient to realize 3G-03 crash recovery without a durable handoff record?
12. Can Hub quarantine/CAS/Git-local custody satisfy this law without requiring remote Git push?
13. Is there a race where immutable content X is in Hub custody but later becomes unresolvable before Builder judgment, forcing a new architecture fact rather than 3M repair?
14. Does any current ActorRun role require a different custody law that makes this too code-centric?

### D. Quiescence

15. Is "no unknown predecessor write-capable activity" too strong to prove without always recreating the sandbox?
16. Can current E2B/Mastra primitives provide sufficiently external process inspection against a root-capable guest, or should 3H-01 choose recreate as the only admissible quiescence fallback for unknown activity?
17. Construct a daemon/process schedule that survives the proposed inspection/reset path and corrupts A2 without being detected.
18. Does quiescence need to cover only source writes or also BuildValidationDatabase, port listeners, filesystem mounts and other mutable environment state? Which of these is actually current/load-bearing?

### E. Verifier independence

19. Is "material verifier never executes in implementer live mutable workspace" the correct minimum, or does it overconstrain FAST/BOUNDED verification?
20. For execution-bearing verification under current E2B baseline, is a separate sandbox materially required, or can a stronger immutable materialization inside another environment satisfy the law without a new VM?
21. Does candidate identity X + fresh materialization close hidden dependency/cache contamination, or must verifier environment identity also be pinned into Evidence for material assertions?
22. Is fresh cognitive thread plus fresh materialization sufficient independence when the same model/provider is used, consistent with C-017?

### F. Session-state restoration

23. Are there any live AgentController states that must be persisted to make CodingSession continuity product-realistic, despite the prohibition — e.g. mode, todo, local planning state — or are thread/messages enough for F1?
24. Can thread-persisted mode/model/OM settings be safely used as non-authoritative preferences after current pins are mechanically applied, or should they be reset entirely?
25. Does no live-state restore make mid-ActorRun controller crash recovery too lossy for F1, or is new ActorRun/orphan recovery the correct boundary?

### G. Scope / Global Maximum

26. Which of FBL-R1-01..06 did ChatGPT over-accept and should be demoted back to probe/implementation?
27. Which remaining candidate section is accidental complexity and can be deleted?
28. Is `bld.coding_session` still independently justified after the consolidated mapping, or can it collapse into Change without losing fresh-session supersession/verifier distinctions?
29. Does the consolidated 3H-01 create any hidden second authority in a runtime correlation field?
30. Strongest argument that Alternative D is no longer the Global Maximum after all corrections.
31. Final recommendation: `CURRENT STRUCTURE CONFIRMED`, `RESTRUCTURE NOW`, `TRANSITIONAL SOLUTION`, `STOP/SPLIT PREREQUISITE`, or `DEFER SAFELY`.
32. State whether the consolidated 3H-01 is ready for operator decision, or requires a further Round 3.

For every material finding use:

```text
claim challenged
counterexample / failure class
authority affected
evidence / source
smallest correction
Global Maximum effect
reopen required? yes/no
later owner if deferred
```

Do not modify the previous dialogue file, `LEDGER.md`, approved authority or product code. Append `Round 2 — Fable` to this R2 file and commit/push only this dialogue change.

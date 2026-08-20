# 3L Package B — Architecture-Lead Final Closure

**Status:** `CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES`  
**Phase:** 3L — Technology Qualification  
**Package:** B — Product Agent + Cross-Runtime  
**Authority:** [3L-R1 — Framework-Native Proportional Qualification Rebaseline](3L-R1-framework-native-proportional-qualification-rebaseline.md)  
**Exact final executor HEAD:** `b712dc289a82feb8f0f5edc9d9d579ad18848226`  
**Package-B lock SHA-256:** `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`  
**Pinned stack:** `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL `17.10`, Node `24.18.0`  
**Product implementation:** `BLOCKED`  
**C-018:** `NOT RATIFIED`  
**PR #40 merge:** `NOT AUTHORIZED`

## 1. Final verdict

```text
Package B
= CLOSED
= QUALIFIED FOR CURRENT F1 TESTED PROPERTIES

CX-AGENT-MASTRA-01
= QUALIFIED FOR CURRENT F1 TESTED PROPERTIES

CX-RUNTIME-ISOLATION-01
= QUALIFIED_SAME_PROCESS
  FOR ENABLED F1 SURFACES

PROCESS_SPLIT_REQUIRED
= NO

CURRENT PRODUCT / AUTHORITY ARCHITECTURE
= CONFIRMED

Product implementation correctness
= NOT CLAIMED
```

This closure does not authorize Product code, Package D/E execution, 3M, C-018, PR readiness or merge.

## 2. Evidence chain accepted

```text
B0
= PASS / lead-adjudicated admission and exact lock

BT-1
= PASS / exact direct code-defined Agent authority closure

BT-2
= PASS / explicit Conversation and Memory thread/resource isolation

BT-3
= framework continuation behavior characterized

BT-3A
= native post-merge RequestContext schema/closed-view hypothesis rejected

BT-3N
= PASS / PASS_NATIVE_HITL_OWNER_BOUNDARY

BT-4N
= PASS / PASS_NATIVE_SCHEDULE_INGRESS

BT-5N
= PASS / QUALIFIED_SAME_PROCESS
```

The final BT-5N runtime was executed in fresh CI against PostgreSQL `17.10` and the unchanged exact Package-B lock.

## 3. BT-5N deciding result

The corrected public-surface probe instantiated in one Node process:

```text
BuilderMastra
→ Builder PostgreSQL schema
→ Builder public Mastra PubSub proxy / configured transport
→ Builder Agent, tool, workflow, memory and schedule registries

ParMastra
→ separate PAR PostgreSQL schema
→ separate PAR public Mastra PubSub proxy / configured transport
→ separate PAR Agent, tool, workflow, memory and schedule registries
```

The meaningful RED controls fired:

```text
mutable role wiring guard
→ pubsub shared identity rejected
→ store shared identity rejected
→ Agent shared identity rejected
→ Memory shared identity rejected

intentional shared-PubSub fixture
→ Builder-tagged event reached both role observers
→ cross-role bleed demonstrated
```

The positive candidate then established:

```text
registry isolation                    = PASS
schedule-row isolation                = PASS
workflow-run isolation                = PASS
workflow PubSub isolation             = PASS
Agent thread-stream isolation         = PASS
attached Agent execution              = PASS
standalone/ephemeral fallback required= NO
provider calls                        = 0
real external effects                 = 0
```

Observed candidate details:

```text
Builder workflow executions = 1
PAR workflow executions     = 1
Builder local model calls   = 1
PAR local model calls       = 1
Builder saw PAR runId       = NO
PAR saw Builder runId       = NO
opposite schedule lookups   = null
opposite workflow-run lookup= null
```

Fresh Package-B CI completed:

```text
tests = 28
pass  = 28
fail  = 0
```

Documentation, Package A and Package-A lock-bootstrap workflows also completed successfully on the same executor HEAD.

## 4. Adjudication of the intermediate probe corrections

The first PostgreSQL-backed attempt failed because the test compared the Agent PubSub to the raw configured transport object. Exact runtime behavior exposes a role-local public Mastra PubSub proxy. The corrected assertion compares the attached Agent to its owning Mastra public PubSub surface and separately retains the raw configured transport for cross-role delivery controls.

This correction is accepted because it preserves the actual invariant:

```text
Builder runtime PubSub identity
!=
PAR runtime PubSub identity
```

It does not weaken the test to “any object is acceptable.” The final probe still proves cross-role behavior through public workflow and Agent thread-stream paths.

The Agent test was also changed from `generate()` to `stream()` because `subscribeToThread()` observes the thread-stream path. This is a correction toward the exact capability being qualified, not a change in Product semantics.

A timing-sensitive assertion on the total number of Builder events after the PAR run was removed, while the causal isolation assertion remained:

```text
Builder event stream contains PAR runId = false
PAR event stream contains Builder runId = false
```

That is the stronger and less flaky invariant.

## 5. Same-process realization accepted

The current F1 realization is:

```text
one Node process
├── BuilderMastra role instance
│   ├── mastra_builder store/schema
│   ├── role-local PubSub identity
│   └── Builder-only registries/surfaces
│
└── ParMastra role instance
    ├── mastra_par store/schema
    ├── role-local PubSub identity
    └── PAR-only registries/surfaces
```

No RuntimeBus, EventBus, queue, process protocol or separate service is justified.

Process split remains an explicit future trigger, not dormant F1 machinery.

## 6. Enabled and deferred process-global surfaces

### Enabled F1 global surface qualified

```text
AgentThreadStreamRuntime module singleton
→ mutable state partitioned by PubSub identity
→ qualified through distinct role PubSubs and public Agent.subscribeToThread paths
```

### Deferred globals not qualified and not admitted

```text
module-level scorer/evaluation hooks
DurableAgent globalRunRegistry/cache/stream PubSub
Observational Memory activeOps/static buffering maps
```

These do not force process split because no named F1 consumer enables them.

Requalification is mandatory before enabling any of those facilities in a same-process Builder/PAR topology.

A future shared external PubSub/broker also requires qualification of explicit per-role namespaces/key prefixes before adoption.

## 7. Package-B realization now closed

```text
Product Agent baseline
= exact Release
→ RuntimeAgentProjection
→ direct code-defined Mastra Agent

Conversation baseline
= explicit Conexus-derived thread/resource identities
→ native Mastra Memory substrate

approval baseline
= native requireApproval mechanics
→ PAR ApprovalRequest/current owner truth
→ boundary recheck

schedule baseline
= native Mastra Scheduler
→ deterministic one-step Workflow ingress
→ guarded PAR admission

role topology
= BuilderMastra + ParMastra in one process
→ separate stores/schemas/PubSubs/registries
```

## 8. What remains downstream

Package-B closure proves technology feasibility for the current architecture. It does not prove future Product implementation conformance.

The preserved downstream proof inventory still includes:

```text
exact Release/RuntimeAgentProjection construction
PAR AgentRun owner transactions
ApprovalRequest exact sealed subject
Gateway replay/idempotency/effect admission
current authorization serialization
TriggerRevision and owner occurrence cursor
single-flight / SKIPPED / no backlog
trigger update/disable × fire races
F5 owner control vs telemetry
first-build physical least privilege
```

Those obligations remain routed to Realization Planning, first-build conformance, 3M, Package E and 3N as already established.

## 9. Global-Maximum conclusion

```text
Direct Agent                               = ADOPT
native HITL                                = ADOPT
native Scheduler + narrow Workflow ingress = ADOPT
same-process role instances                = ADOPT
custom scheduler                           = REJECT / YAGNI
process split                              = NOT REQUIRED
DurableAgent baseline                      = DEFER SAFELY
universal Workflow wrapping                = REJECT F1
advanced memory / OM                       = DEFER SAFELY
Package C hard monetary machinery          = DEFER SAFELY
```

The selected realization uses more native Mastra behavior, preserves Conexus authority at owner boundaries and introduces no speculative infrastructure.

## 10. Exact next action

> Project this closure into the current tree and then perform one Architecture-Lead proportional rederivation of the remaining 3L Packages D and E. Do not execute either package by inheritance.

The next architectural question is:

```text
For Package D and Package E separately:

If the package is removed from pre-C-018 qualification,
would a later coding actor have to silently choose a material
owner/boundary/technology behavior, or could a load-bearing
technology assumption fail only after expensive retrofit?
```

Only the smallest positive answer remains in 3L.

# 3L-B — BT-5N Architecture-Lead Adjudication

**Status:** `NOT PROVEN / BOUNDED HARNESS CORRECTION REQUIRED / PACKAGE B OPEN`  
**Phase:** 3L — Technology Qualification  
**Scope:** Package B — BuilderMastra ↔ ParMastra same-process role isolation  
**Execution authority:** [3L-R1 — Framework-Native Proportional Qualification Rebaseline](3L-R1-framework-native-proportional-qualification-rebaseline.md)  
**Executor Evidence:**
- `spikes/conexus-3l-b/evidence/bt5n-source.json`
- `spikes/conexus-3l-b/evidence/bt5n.json`
- `spikes/conexus-3l-b/tests/bt5n-role-instance-isolation.test.mjs`
- `spikes/conexus-3l-b/fixtures/bt5n-role-fixtures.mjs`

**Exact executor HEAD:** `340b60b59e5b61bf353e7d38359bf3bca1a03430`  
**Package-B lock SHA-256:** `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`  
**Pinned stack:** `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL `17.10`, Node `24.18.0`  
**Product implementation:** `BLOCKED`  
**C-018:** `NOT RATIFIED`  
**PR #40 merge:** `NOT AUTHORIZED`

## 1. Verdict

```text
BT-5N
= NOT PROVEN
= BOUNDED HARNESS CORRECTION REQUIRED

PROCESS_SPLIT_REQUIRED
= NOT ESTABLISHED

QUALIFIED_SAME_PROCESS
= NOT YET ESTABLISHED

CURRENT PRODUCT / AUTHORITY ARCHITECTURE
= NOT REOPENED

Package B
= IN PROGRESS / NOT CLOSED
```

The executor was correct not to invent a PASS from its local environment. Fresh Package-B CI later reached the PostgreSQL-backed positive path and exposed one concrete failure. That failure occurs before the substantive cross-role behavior assertions complete and does not, by itself, establish process-global bleed or require process separation.

## 2. Evidence that remains accepted

The following executor/source findings are useful and preserved:

```text
exact Package-B lock                  = PASS
Mastra skill / exact-source admission = PASS
shared-PubSub negative control        = FIRED
separate raw PubSub delivery control  = PASS
configured registries/stores/schedules= source-admitted as instance-local
scorer/eval globals                    = DEFERRED / NOT ADMITTED
DurableAgent globals                   = DEFERRED / NOT ADMITTED
Observational Memory globals           = DEFERRED / NOT ADMITTED
provider/model API calls               = 0
E2B calls                              = 0
real external effects                  = 0
```

The negative control is meaningful: intentionally sharing one mutable PubSub identity allows a Builder-tagged event to reach the PAR observer. Therefore explicit identity separation remains a real wiring requirement rather than documentation ceremony.

## 3. Fresh-CI failure and root cause

Fresh Package-B CI executed the PostgreSQL-backed positive test and failed at:

```js
assert.equal(builder.agent.getPubSub(), builder.pubsub)
```

The fixture currently constructs each Agent without supplying the already-created role PubSub:

```js
const agent = new Agent({
  ...
  memory,
  editor: false
})

const mastra = new Mastra({
  ...
  pubsub,
  agents: { [agentKey]: agent }
})
```

The test simultaneously expects the Agent's resolved PubSub to be reference-identical to that explicit role PubSub.

This creates a concrete harness inconsistency:

```text
expected explicit Agent PubSub identity
+
Agent fixture omits public pubsub configuration
+
relies on framework inheritance/default behavior
```

Mastra's public Agent configuration admits an explicit `pubsub` option for thread-signal/runtime coordination. The exact pinned source admission also established that an Agent resolves its own PubSub before inherited/Mastra/default paths. The smallest scientifically valid correction is therefore to wire the same role PubSub explicitly into both the Agent and its owning Mastra instance, then rerun the existing behavioral isolation proof.

This is not a Product mechanism change. It is a correction to make the probe exercise the already-approved explicit-role wiring rather than an implicit inheritance path.

## 4. Why process split is not justified

The observed failure proves only:

```text
implicit Agent PubSub resolution
!= exact configured Mastra PubSub object identity
```

It does not prove:

```text
Builder events reach PAR
PAR events reach Builder
Builder storage reaches PAR schema
PAR registry resolves Builder resources
enabled process-global state aliases across roles
```

Those are the load-bearing properties. They remain unexecuted past the early assertion in fresh CI.

Therefore:

```text
single-process architecture failure = NOT ESTABLISHED
process split trigger               = NOT FIRED
```

## 5. Authorized bounded correction

Execute one continuous inline correction against the unchanged lock:

```text
exact AgentConfig/public-source check
→ explicitly pass role pubsub into Agent constructor
→ retain exact same pubsub on owning Mastra
→ retain identity assertions
→ execute the full PostgreSQL-backed behavioral test
→ adjudicate actual cross-role behavior
```

Required discriminant:

```text
if explicit Agent pubsub is supported and identity/behavior pass
→ continue full BT-5N proof

if explicit Agent pubsub is unsupported in exact 1.56.0
→ STOP / SOURCE CONTRADICTION

if explicitly wired Agent still resolves another PubSub
→ STOP / MATERIAL FRAMEWORK BEHAVIOR

if cross-role behavior bleeds after explicit wiring
→ PROCESS_SPLIT_REQUIRED candidate / return Evidence

if all enabled F1 paths remain isolated
→ QUALIFIED_SAME_PROCESS candidate / return Evidence
```

No test assertion may be removed merely to obtain GREEN. A test may be changed only if exact source proves it encodes a non-contractual mechanism rather than the accepted isolation invariant; such a change requires recorded justification and an equivalent behavioral falsifier.

## 6. Execution mode correction

The correction is serial and shares one lock, one worktree, one PostgreSQL fixture and one evolving test state.

```text
EXECUTION MODE = INLINE
```

Use one continuous Codex session with `superpowers:executing-plans`.

Do not use:

```text
subagent-driven-development
parallel agents
fresh subagent per task
```

unless the Architecture Lead explicitly reauthorizes that mode for genuinely independent work.

## 7. State after adjudication

```text
BT-1  = PASS
BT-2  = PASS
BT-3  = FRAMEWORK BEHAVIOR CHARACTERIZED
BT-3A = NATIVE SCHEMA/CLOSED-VIEW HYPOTHESIS REJECTED
BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
BT-5N = NOT PROVEN / BOUNDED HARNESS CORRECTION NEXT

CX-AGENT-MASTRA-01
= PARTIALLY QUALIFIED

CX-RUNTIME-ISOLATION-01
= NOT PROVEN

Package B
= IN PROGRESS / NOT CLOSED

Package C
= DEFER SAFELY / NOT EXECUTED
```

## 8. Exact next action

> Execute only the bounded BT-5N inline correction under `docs/superpowers/plans/2026-08-19-conexus-3l-b-bt5n-inline-correction.md`, return fresh Evidence and STOP for Architecture-Lead / Package-B closure adjudication.

Do not execute Package C, D, E, 3M, C-018, Product implementation, PR readiness or merge.
# 3L Package B — Codex Final Projection Handoff

**Status:** `EXECUTION AUTHORIZED / INLINE ONLY`  
**Authority:** [3L-B final lead closure](3L-B-final-lead-closure.md)  
**Scope:** mechanical Evidence/status projection only  
**Package B runtime probes:** `COMPLETE`  
**Product implementation:** `BLOCKED`  
**C-018:** `NOT RATIFIED`  
**Merge:** `NOT AUTHORIZED`

## Execution mode

```text
INLINE ONLY
```

Use one continuous Codex session with:

```text
superpowers:executing-plans
```

Do not use:

```text
superpowers:subagent-driven-development
parallel agents
fresh agent per task
```

This is a small serial projection over one already-green result.

## Bootstrap

Repository:

```text
developmentconexus-ops/mnfs
```

Branch:

```text
agent/conexus-phase-3-system-design
```

PR:

```text
#40
```

Start with `git fetch` and revalidate remote HEAD/PR. This handoff is bootstrap, never authority. Read `AGENTS.md`, canonical current routing, `3L-R1`, and `3L-B-final-lead-closure.md` before editing.

## Exact accepted outcome

```text
BT-5N
= PASS / LEAD-ADJUDICATED
= QUALIFIED_SAME_PROCESS

Package B
= CLOSED / LEAD-ADJUDICATED
= QUALIFIED FOR CURRENT F1 TESTED PROPERTIES

CX-AGENT-MASTRA-01
= QUALIFIED FOR CURRENT F1 TESTED PROPERTIES

CX-RUNTIME-ISOLATION-01
= QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES

Package C
= DEFER SAFELY / NOT EXECUTED

Packages D/E
= NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION
```

## Allowed files

Update only what is required to project the accepted result:

```text
spikes/conexus-3l-b/evidence/bt5n.json
scripts/test-conexus-3l-r1-routing.mjs
docs/conexus/current/README.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/current/DECISION-RECONCILIATION.md
docs/conexus/phase3/LEDGER.md
docs/conexus/phase3/3L-B-technology-qualification.md
```

Do not alter the now-green BT-5N fixture/test unless a fresh reproducible failure appears.

## Task 1 — Finalize BT-5N Evidence from fresh CI

Replace the stale `NOT_PROVEN` artifact with the actual fresh-CI observation from executor HEAD:

```text
b712dc289a82feb8f0f5edc9d9d579ad18848226
```

Required final Evidence values:

```text
verdict                         = QUALIFIED_SAME_PROCESS
roleInstancesDistinct           = PASS
storeSchemas.builder            = mastra_bt5n_builder_8deb5a7e7107
storeSchemas.par                = mastra_bt5n_par_8deb5a7e7107
pubsubInstancesDistinct         = PASS
sharedPubSubNegativeControl     = FIRED
registryIsolation               = PASS
persistentStoreIsolation        = PASS
workflowPubSubIsolation         = PASS
attachedAgentExecution          = PASS
moduleDefaultOrGlobalCanary     = PASS_FOR_ENABLED_F1_SURFACE
Builder workflow executions     = 1
PAR workflow executions         = 1
Builder local model calls       = 1
PAR local model calls           = 1
provider calls                  = 0
E2B calls                       = 0
real external effects           = 0
```

Preserve deferred/requalification triggers for:

```text
scorer/evaluation hooks
DurableAgent global registry/cache/PubSub
Observational Memory globals
shared external broker without role namespaces
```

The Evidence must say that same-process qualification applies only to currently enabled F1 Mastra surfaces.

## Task 2 — Extend router fitness RED → GREEN

Before changing routers, extend `scripts/test-conexus-3l-r1-routing.mjs` to require all four current-tree documents to state:

```text
Package B CLOSED
BT-5N PASS / LEAD-ADJUDICATED / QUALIFIED_SAME_PROCESS
CX-RUNTIME-ISOLATION-01 QUALIFIED_SAME_PROCESS
Package C DEFER SAFELY
Packages D/E REDERIVATION REQUIRED / NOT EXECUTED
Product implementation BLOCKED
C-018 NOT RATIFIED
```

The test must also reject stale forms such as:

```text
BT-5N NOT_PROVEN
BT-5N adjudication pending
Package B IN PROGRESS
Package D NEXT by inheritance
Package E NEXT by inheritance
```

Run the router test and capture RED against the stale tree.

Then project the exact accepted outcome into:

```text
current README
current Architecture Baseline
current Decision Reconciliation
Phase-3 LEDGER
Package-B qualification record
```

Run the router test again and capture GREEN.

## Task 3 — Verify and stop

Run:

```bash
cd spikes/conexus-3l-b
npm run verify

cd ../..
npm run verify
```

Push to the same PR branch and wait for fresh CI:

```text
Conexus 3L Package B = SUCCESS
Documentation = SUCCESS
```

Then STOP.

Do not execute or design Package D/E in this Codex pass. Their proportional rederivation belongs to Architecture Lead/operator discussion.

## Forbidden

```text
Package C execution
Package D execution
Package E execution
3M
C-018
Product code
new dependency
new module/schema/database
process split
PR ready
merge
```

## Completion report

Return:

```text
final HEAD:
PR state:
execution mode = INLINE:
BT-5N final Evidence:
router RED:
router GREEN:
Package B status:
CX-AGENT-MASTRA-01:
CX-RUNTIME-ISOLATION-01:
Package C:
Packages D/E:
Package-B npm run verify:
root npm run verify:
fresh CI:
Findings:
C-018 = NOT RATIFIED
Product implementation = BLOCKED
merge = NOT PERFORMED
```

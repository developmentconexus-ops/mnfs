# 3L-A — Builder Substrate + Cognition Qualification

**Status:** IN PROGRESS  
**Fase:** 3L — Technology Qualification  
**Package:** A — Builder Substrate + Cognition  
**Authority:** 3A-R10 + 3L-Q0 + current 3H-01/3I authority  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** este package é qualification/evidence-only; não é product implementation, não constitui C-018 e não autoriza merge do PR #40.

## 1. Admission record

```text
Q0 authority commit                 = 176da36992ecb4dd5fc56e76f603ec33ca0c74c8
Package A bootstrap commit          = 15fa4de06423e8942f472a4878d80287b7a72b91
lock materialization commit         = 2e096b82661bf44a8396b5e6169a07b7fad0e8b4
Node                                = 24.18.0
npm                                 = 11.16.0
spike lockfileVersion               = 3
spike package-lock SHA-256          = 6b506f505567d82dd94653fca14bb5bc6b7b5b2d5138f83b34123d02e93cb0ce
@mastra/core                        = 1.55.0
@mastra/e2b                         = 0.7.0
@mastra/memory                      = 1.24.0
@mastra/pg                          = 1.18.1
e2b SDK resolved transitively       = 2.40.0
supply-chain Q0 deny-set            = PASS
package lifecycle scripts at lock   = DISABLED
```

This closes only byte identity/admission. No technology behavior is green merely because the lock resolved.

## 2. Compiled Package A scope

Package A adjudicates three evidence families without merging them into one verdict:

```text
A1 — CX-BUILDER-MASTRA-01
A2 — CX-SBX-E2B-01 compiled against current Mastra Builder authority
A3 — CX-BUILDER-COGNITION-01 (persistent thread OM OFF × OM ON)
```

### A1 — Mastra local/persistent runtime subset

First executable subset:

```text
P1  stored thread/messages survive clean controller recreation
P3  poisoned persisted runtime settings can be mechanically overridden by current dispatch config
P4  exact thread is re-bound after clean controller recreation without creating new Conexus CodingSession meaning
P21 same cognitive thread can span multiple runtime executions without making runtime state authority
P27 stale model / OM / subagent selections are mechanically replaceable where the pinned API exposes them
```

These probes use real pinned Mastra packages and PostgreSQL. They do not use a fake persistence result to claim Postgres behavior.

### A2 — E2B live subset

Load-bearing provider criteria include at minimum:

```text
compiled current Builder workload can execute in the E2B machine envelope
physical sandboxId is observable
ordinary pause/resume continuity is attributable
silent reincarnation is detectable
write-capable operation can be bound to physical incarnation
network/egress policy fires fail-closed
durable/model/ERP/Git-write/Hub-DB credentials are absent from guest
quiescence detects tracked + untracked/self-daemonized + deferred mutation surfaces available in the qualified template
SYNC/SHARE output can be recovered into Hub-side custody
private RunPreview shape is feasible without anonymous public authority
cancel/child-process/teardown/lifecycle observations are available
resource/time/cost viability is measured, with no historical 45-minute law revived
```

A2 requires a live E2B account/API credential. If no approved credential is available to the execution environment, affected criteria remain `NOT_PROVEN`; source inspection is supplementary evidence only.

### A3 — Builder cognition / OM

Required comparison:

```text
A0 = persistent Change-scoped thread + OM OFF
A1 = same task/runtime/provider class + OM ON
```

Required deciding dimensions:

```text
correctness
forgotten/stale requirement incidence
rediscovery/repeated reads
rework/Findings
context/token use
Observer/Reflector model spend
wall clock / latency
restart continuity
Builder↔PAR isolation implications
stale-authority adversarial fixture
human intervention
```

A3 requires real model-bearing execution. Missing provider/model credential or unqualified spend path means `NOT_PROVEN`, never a synthetic PASS.

## 3. Execution order inside Package A

```text
A0 lock closure              = COMPLETE
↓
A1 Mastra/Postgres probes    = NEXT
↓ adjudicate
A2 E2B live probes           = NOT STARTED
↓ adjudicate
A3 OM cognition comparison   = NOT STARTED
↓ adjudicate
Package A internal completeness/deletion check
↓
operator + ChatGPT Package A verdict
```

A2/A3 may not be replaced by mocks. If external credentials are absent, the package remains open with explicit `NOT_PROVEN` criteria until evidence exists or the smallest current assumption is adjudicated another way.

## 4. Current verdict matrix

| Track | State | Deciding evidence |
|---|---|---|
| Lock / supply-chain identity | PASS | GitHub Actions lock bootstrap + committed lock digest |
| A1 Mastra/Postgres runtime | NOT PROVEN YET | executable pinned-package probes |
| A2 E2B live substrate | NOT PROVEN YET | real provider-side probe required |
| A3 OM cognition | NOT PROVEN YET | real model-bearing A0×A1 comparison required |
| Package A overall | IN PROGRESS | no package verdict before all required criteria are adjudicated |

## 5. Guardrails

```text
no product code
no mandatory E2B wrapper before failure proves need
no Pi revival as parallel harness
no generic sandbox benchmark
no OM enablement by feature enthusiasm
no mock/fake PASS for external integration
no hidden model call outside 3I-03 accounting
no Product Agent memory expansion in Package A
```

Fable is not used as a Package A coauthor by default. Per operator-approved workflow, the independent challenger remains reserved for the complete 3L package unless a separately bounded coding-agent task is explicitly justified and instructed without architecture discretion.

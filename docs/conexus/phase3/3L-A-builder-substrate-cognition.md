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

Executed against the exact Package A lock with PostgreSQL `17.10` and `@mastra/core 1.55.0` / `@mastra/pg 1.18.1`.

Current executable results:

```text
P1/P4  exact thread + stored messages survive clean controller/store recreation   = PASS
P2     live AgentController tool grants do not survive clean controller restart    = PASS
P3     stale persisted mode/model is restorable residue but current dispatch wins  = PASS
P21    fresh live Session identity can rebind the same persistent cognitive thread = PASS
P27a   stale OM observer/reflector selections can be mechanically replaced         = PASS
P27b   stale subagent setting persists in thread metadata but is NOT reactivated
       by clean Session recreation; current dispatch overwrites the persisted key   = PASS / CHARACTERIZED
```

Important P27b nuance from the pinned runtime:

```text
session.subagents.model.set(...)
→ persists subagentModelId in thread settings

clean Session recreation
→ Session.loadMetadata() does not hydrate subagentModelId back into live state
→ live subagent model reads null rather than stale value

current dispatch set(...)
→ writes current live state + replaces persisted thread setting
```

Therefore the current pinned behavior is safer than the original stale-reactivation fixture assumed. No architecture correction is required for this nuance; the invariant remains that current Conexus dispatch controls the effective subagent selection.

A1 deciding run evidence reached `6 tests / 6 pass / 0 fail` in the Package A workflow after the characterization correction. A1 is **PASS for the executable local/persistent subset**. Criteria requiring E2B physical behavior remain A2 and are not borrowed into this verdict.

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

#### A2 pinned-adapter contract evidence

Executable source-bound probes against `@mastra/e2b 0.7.0` established:

```text
E2BProcessManager.spawn(...)
→ routes through sandbox.retryOnDead(...)

recognized dead-sandbox error
→ handleSandboxTimeout()
→ status becomes stopped / attached physical sandbox cleared
→ ensureRunning()
→ E2BSandbox.start()
→ reconnect matching logical metadata if physical sandbox still exists
   OR create another physical sandbox under the same logical mastra-sandbox-id
→ repeat the original operation once
```

The exact lock produced `3 tests / 3 pass / 0 fail` for this control-flow characterization.

##### F-3L-A-01 — automatic write retry can cross physical incarnation

**State:** OPEN / MATERIAL CANDIDATE — live provider confirmation still required before adjudication.

Current source + executable contract evidence shows that the stock adapter has an automatic dead-sandbox retry below the Conexus ActorRun physical-incarnation gate. If provider loss makes the prior physical sandbox unavailable, the retry path can create a replacement physical sandbox and repeat the write-capable operation before returning control to Conexus.

This directly touches 3H-01 `P7/P8/P29`:

```text
Conexus admitted write on physical A
↓
adapter operation sees sandbox-dead
↓
adapter may provision/reconnect physical B
↓
adapter repeats operation on B
↓
Conexus regains control only after operation result
```

If confirmed live:

```text
stock @mastra/e2b write path = insufficient as-is for P7/P8/P29
3H-01 architecture           = NOT reopened
narrow-wrapper trigger       = FIRED
smallest guard must prevent a replacement-incarnation write from being
accepted/executed as silent continuation of the original ActorRun operation
```

No wrapper/guard is ratified or implemented by this evidence record. The smallest correction is adjudicated only after live evidence.

#### A2 live admission status

A live probe harness now exists and is fail-closed. The first run after the operator reported adding `E2B_API_KEY` still observed an empty Actions secret context:

```text
E2B_API_KEY in GitHub runner = FALSE
live sandbox created         = FALSE
provider spend incurred      = FALSE
A2 live verdict              = NOT_PROVEN / CREDENTIAL NOT ADMITTED
```

This is not an E2B technology failure. Repository/environment secret routing must be corrected before live deciding evidence runs.

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
A0 lock closure                         = COMPLETE / PASS
↓
A1 Mastra/Postgres executable subset    = COMPLETE / PASS
↓ adjudicated local subset
A2 adapter contract                     = COMPLETE / FINDING CANDIDATE F-3L-A-01
A2 E2B live provider evidence           = BLOCKED / SECRET NOT ADMITTED TO RUNNER
↓ live evidence + adjudication required
A3 OM cognition comparison              = NOT STARTED
↓ adjudicate
Package A internal completeness/deletion check
↓
operator + ChatGPT Package A verdict
```

A2/A3 may not be replaced by mocks. If external credentials are absent, the package remains open with explicit `NOT_PROVEN` criteria until evidence exists or the smallest current assumption is adjudicated another way.

## 4. Current verdict matrix

| Track | State | Deciding evidence |
|---|---|---|
| Lock / supply-chain identity | **PASS** | GitHub Actions lock bootstrap + committed lock digest |
| A1 Mastra/Postgres runtime | **PASS — executable local subset** | 6/6 pinned-package probes on PostgreSQL 17.10 |
| A2 E2B adapter contract | **PASS characterization / F-3L-A-01 OPEN** | 3/3 pinned adapter control-flow probes + pinned source |
| A2 E2B live substrate | **NOT_PROVEN — credential not admitted** | live provider-side probe exists but no sandbox was created |
| A3 OM cognition | **NOT_PROVEN YET** | real model-bearing A0×A1 comparison required |
| Package A overall | **IN PROGRESS** | no package verdict before all required criteria are adjudicated |

## 5. Guardrails

```text
no product code
no mandatory E2B wrapper before live finding adjudication
no Pi revival as parallel harness
no generic sandbox benchmark
no OM enablement by feature enthusiasm
no mock/fake PASS for external integration
no hidden model call outside 3I-03 accounting
no Product Agent memory expansion in Package A
```

Fable is not used as a Package A coauthor by default. Per operator-approved workflow, the independent challenger remains reserved for the complete 3L package unless a separately bounded coding-agent task is explicitly justified and instructed without architecture discretion.

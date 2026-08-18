# 3L-A — Builder Substrate + Cognition Qualification

**Status:** IN PROGRESS / A1 COMPLETE-PASS / A2 COMPLETE-PASS WITH REQUIRED GUARD / A3 ADMITTED-PREPARED / BILLABLE RUNS NOT STARTED  
**Fase:** 3L — Technology Qualification  
**Package:** A — Builder Substrate + Cognition  
**Authority:** 3A-R10 + 3L-Q0 + current 3H-01/3H-03/3I authority  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** este package é qualification/evidence-only; não é product implementation, não constitui C-018 e não autoriza merge do PR #40.

## 1. Admission record

```text
Q0 authority commit                 = 176da36992ecb4dd5fc56e76f603ec33ca0c74c8
Package A bootstrap commit          = 15fa4de06423e8942f472a4878d80287b7a72b91
A1/A2 lock materialization commit   = 2e096b82661bf44a8396b5e6169a07b7fad0e8b4
A1/A2 deciding authority commit     = e2c245809ccc55e7437a61fe6438d58e6bce8791
A3 adapter-pin commit               = 8fe34aaca753574f8873587822307bec1852727f
A3 lock materialization commit      = f86f7bddab7640192538b97008a7a4f3ba194fbf
Node                                = 24.18.0
npm                                 = 11.16.0
spike lockfileVersion               = 3
A1/A2 package-lock SHA-256          = 6b506f505567d82dd94653fca14bb5bc6b7b5b2d5138f83b34123d02e93cb0ce
A3 package-lock SHA-256             = 70975a4b3aadc453959bd36835c1c4ad3edc320c862a9ebfb6ace7feb4fd1864
@mastra/core                        = 1.55.0
@mastra/e2b                         = 0.7.0
@mastra/memory                      = 1.24.0
@mastra/pg                          = 1.18.1
e2b SDK resolved transitively       = 2.40.0
@openrouter/ai-sdk-provider-v6      = npm:@openrouter/ai-sdk-provider@2.10.0
supply-chain Q0 deny-set            = PASS
package lifecycle scripts at lock   = DISABLED
```

Evidence remains bound to the exact bytes that produced it. A3's additional OpenRouter adapter does not reinterpret A1/A2 evidence against a new lock.

## 2. Compiled Package A scope and proportionality

```text
A1 — CX-BUILDER-MASTRA-01
A2 — CX-SBX-E2B-01 compiled against current Mastra Builder authority
A3 — CX-BUILDER-COGNITION-01 (persistent thread OM OFF × OM ON)
```

A1 and A2 are adjudicated. A3 is admitted and its non-billable fixtures/contracts are prepared; the four model-bearing runs have not started.

Package A follows the already-approved proportional-security/YAGNI posture:

> prove properties that can invalidate the first useful Conexus Builder, apply the smallest required guard when a failure class fires, and route deeper hardening to its existing later gate instead of expanding 3L-A into a general security program.

This means a control is not added merely because it is theoretically desirable. Current security/model-spend obligations remain preserved in C-016 / 3I / Package C and downstream conformance, without being prematurely implemented here.

---

## 3. A1 — Mastra local/persistent runtime — COMPLETE / PASS

Executed against the exact Package A lock with PostgreSQL `17.10`, `@mastra/core 1.55.0` and `@mastra/pg 1.18.1`.

```text
P1/P4  exact thread + stored messages survive clean controller/store recreation   = PASS
P2     live AgentController tool grants do not survive clean controller restart    = PASS
P3     stale persisted mode/model is restorable residue but current dispatch wins  = PASS
P21    fresh live Session identity can rebind the same persistent cognitive thread = PASS
P27a   stale OM observer/reflector selections can be mechanically replaced         = PASS
P27b   stale subagent setting persists in thread metadata but is NOT reactivated
       by clean Session recreation; current dispatch overwrites the persisted key   = PASS / CHARACTERIZED
```

Pinned-runtime nuance:

```text
session.subagents.model.set(...)
→ persists subagentModelId in thread settings

clean Session recreation
→ Session.loadMetadata() does not hydrate subagentModelId into live state
→ live subagent model reads null rather than stale value

current dispatch set(...)
→ updates current live state and replaces persisted thread setting
```

This behavior is compatible with the current authority-currentness invariant. No architecture correction is required.

Latest deciding A1 execution:

```text
6 tests / 6 pass / 0 fail
```

A1 proves persistent cognition/runtime mechanics only. It does not borrow E2B physical behavior or model-bearing Builder quality from A2/A3.

---

## 4. A2 — E2B Builder substrate — COMPLETE / PASS WITH REQUIRED NARROW GUARD

### 4.1 Qualified substrate identity

The exact Builder machine definition was pinned and built rather than relying on a mutable base alias.

```text
qualified template name        = conexus-3l-a-builder-1309c097b7979014
qualified template SHA-256     = 1309c097b7979014d8e37e03cb4bc2424d1f95ae40b3a81994a9175ef1a89d2c
qualified E2B template ID      = 7ezun152y8jtqxf7llpl
first observed build ID        = 0b70fff1-4438-41ce-b795-69f538a502c1
Node                           = v24.18.0
Git                            = 2.39.5
Chromium                       = 151.0.7922.137
PostgreSQL                     = 17.10 / package 17.10-1.pgdg12+1
envd                            = 0.6.13
CPU                            = 2 vCPU
memory                         = 4096 MiB
provider disk allocation       = 13495 MiB
```

An initial template attempt exposed that `postgresql-17` from the live PGDG repository had already moved to `17.11`. Q0 forbids interpreting a mutable package stream as exact identity, so the test was not relaxed. Acquisition was corrected to the official PostgreSQL archive and exact package `17.10-1.pgdg12+1`, producing the qualified template digest/ID above.

Observed first-build / warm-run timings are evidence, not permanent architecture limits:

```text
first template build observed  ≈ 20.4 s
sandbox ready observed         = sub-second in successful warm runs
PG17.10 ready observed         ≈ 1.2–2.3 s in successful runs
provider CPU/memory/disk metrics surface = FIRING
```

No P95 claim is made from this bounded qualification sample and the historical 45-minute cutoff is not revived as architecture law.

### 4.2 Durable-secret custody — PASS

Live guest inspection confirmed that runner/provider credentials do not enter the sandbox environment, including:

```text
E2B_API_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
OPENROUTER_API_KEY
GITHUB_TOKEN
```

Model-provider credentials are not part of A2 and remain control-side under current 3I authority.

### 4.3 Physical continuity and attribution — PASS WITH REQUIRED GUARD

Ordinary E2B pause/resume preserved the same provider physical `sandboxId` and filesystem continuity.

The stock `@mastra/e2b 0.7.0` adapter was proven to contain this path:

```text
E2BProcessManager.spawn(...)
→ retryOnDead(...)
→ recognized dead sandbox
→ clear old attached physical sandbox
→ ensureRunning()
→ reconnect old physical if it still exists
   OR create a replacement physical sandbox
→ repeat the original operation once
```

#### F-3L-A-01 — automatic write retry can cross physical incarnation

**State:** CONFIRMED LIVE / RESOLVED FOR QUALIFICATION BY SMALLEST GUARD.

Live provider execution proved that a write-capable command can be retried successfully by the stock adapter on a new physical sandbox before control returns to Conexus.

Therefore:

```text
stock @mastra/e2b write path
= FAIL AS-IS for 3H-01 P7/P8/P29

E2B substrate
= NOT rejected

3H-01 architecture
= NOT reopened

narrow physical-incarnation guard trigger
= FIRED / QUALIFIED
```

A qualification-only guard was implemented under `spikes/conexus-3l-a/` and tested RED→GREEN. Local and live evidence proves the minimum required behavior:

```text
bind owner operation to exact physical sandboxId
↓
physical sandbox dies before write completion
↓
write fails instead of being silently replayed on replacement
↓
lineage becomes quarantined
↓
subsequent write on poisoned lineage is rejected without provider I/O
↓
CONTINUE_LINEAGE presented against replacement physical sandboxId
→ mismatch rejected before write
```

**Realization consequence:** the first product Builder write-capable E2B path MUST include semantically equivalent physical-incarnation protection. The exact spike class/API is not product architecture and need not be copied verbatim.

### 4.4 Egress/network — PASS WITH KNOWN C-008 DNS EXCEPTION

Live tests established:

```text
deny-all + explicit allowlist                 = FIRING
explicitly allowed private HTTPS target       = reachable
redirect from allowed target to denied target = BLOCKED after first hop
non-DNS TCP/853 escape                        = BLOCKED by application-response proof
provider-side traffic token transform         = not exposed as guest env secret
```

The test also reproduced the limitation already frozen in C-008:

```text
public DNS TCP/53 remains reachable under deny-all
```

This is **not a new Finding**. Current qualification is precisely that native E2B enforcement is adequate for the accepted C-008 F1 threat model with this known limitation preserved. No additional network-hardening branch is opened in Package A.

### 4.5 Private RunPreview substrate — PASS

With `allowPublicTraffic:false`:

```text
anonymous external HTTP          = 403
traffic-token authenticated HTTP = 200
authenticated WebSocket upgrade  = 101 / PASS
```

This proves the private HTTP/WebSocket substrate needed by RunPreview. It does not implement the Hub authenticated reverse proxy; that remains Realization/downstream conformance work.

### 4.6 Quiescence, cancel, child process and teardown — PASS

Live tests established that the qualified machine exposes and allows control of the relevant predecessor-mutation surfaces:

```text
tracked command cancellation   = FIRING
surviving child if present      = observable / controllable
self-daemonized deferred writer = observable before reuse
provider sandbox teardown       = observable and controllable
```

Base-OS timers are not treated as a failure merely because they exist. The required law is limited to residual activity capable of mutating the admitted Builder lineage before continuation/reuse.

### 4.7 SYNC/SHARE custody — PASS

A live synthetic git lineage produced a result bundle inside the sandbox, transferred exact bundle bytes into runner/Hub-side custody, destroyed the sandbox, and verified/imported the bundle after sandbox loss.

Representative evidence:

```text
bundle SHA-256              = 576a009a0014a83bb833d26acbc8fdba6e5ef2b71692d6e30d85795209f2666c
bundle bytes                = 511
changed paths               = app.txt, result.txt
verified after sandbox loss = TRUE
```

This proves the E2B→Hub custody primitive. Actual product quarantine repository, validation and push/PR remain owned by the approved Hub flow.

### 4.8 BuildValidationDatabase — PASS

The qualified sandbox successfully instantiated the synthetic BuildValidationDatabase profile:

```text
PostgreSQL       = 17.10
encoding         = UTF8
locale provider  = builtin
builtin locale   = C.UTF-8
pt-BR collation  = ICU
listen_addresses = 127.0.0.1
public PG port   = NONE
```

Role-negative evidence proved the current synthetic least-privilege shape. This remains build validation only; it does not create a second DEV authority or authorize real ERP credentials inside E2B.

### 4.9 Orphan reconciliation — PASS

A sandbox carrying an owner metadata marker was recoverable through provider inventory after the local SDK handle was discarded. The exact physical sandbox ID was recovered, destroyed and confirmed absent provider-side.

Owner metadata + provider inventory are therefore sufficient substrate mechanics for the approved orphan-reconciliation path. Durable owner truth remains Hub-owned.

### 4.10 A2 final adjudication

Latest deciding suite:

```text
A2 live tests          = 10 / 10 PASS
A1 local runtime tests = PASS
adapter contract tests = PASS
physical guard tests   = PASS
Package A workflow     = SUCCESS
lock bootstrap         = SUCCESS
Documentation          = SUCCESS
```

A2 outcome:

```text
E2B Builder sandbox substrate                         = QUALIFIED FOR CURRENT F1 SHAPE
stock Mastra E2B write retry across physical identity = NOT ACCEPTABLE AS-IS
narrow physical-incarnation guard                     = REQUIRED REALIZATION CONSTRAINT
known public DNS TCP/53 exception                     = ACCEPTED / CHARACTERIZED C-008 LIMITATION
new domain/module/database/workflow                    = 0
architecture reopen                                   = NONE
```

A2 does not prove Builder effectiveness, OM benefit, full model-spend enforcement or downstream product conformance. Those stay in their already-routed gates.

---

## 5. A3 — Builder cognition / Observational Memory — ADMITTED / PREPARED

### 5.1 Question being decided

A3 exists to answer one bounded product question:

> **Does Observational Memory materially improve the long-running Change-scoped Builder enough to justify carrying it into F1?**

It is not a memory-framework benchmark and it is not a security exercise.

Current baseline remains:

```text
OM = OFF
```

A3 may qualify OM as a candidate; it cannot enable OM by itself.

### 5.2 Exact experiment identity

```text
Actor                       = openrouter/anthropic/claude-sonnet-5
Actor route                 = Anthropic only / provider fallback disabled
OM Observer + Reflector     = openrouter/google/gemini-3.5-flash
OM route                    = Google AI Studio only / provider fallback disabled
OpenRouter adapter          = 2.10.0
A3 lock SHA-256             = 70975a4b3aadc453959bd36835c1c4ad3edc320c862a9ebfb6ace7feb4fd1864
E2B qualified template ID   = 7ezun152y8jtqxf7llpl
primary Actor runs          = exactly 4
qualification spend ceiling = finite, <= USD 10.00
```

The spend ceiling is a **probe-cost guard**, not product security architecture and not a substitute for Package C.

No additional key-shape, account-security or production credential-hardening requirement is introduced by A3. Those concerns remain where they were already routed.

### 5.3 Paired fixtures

```text
Fixture A — long-context authority-currentness
  A0 = OM OFF
  A1 = OM ON

Fixture B — deterministic coding effectiveness
  B0 = OM OFF
  B1 = OM ON
```

The same Actor model/provider class, task, current authority and starting fixture are used inside each pair. We do not repeat samples until a preferred result appears.

Fixture A contains substantial earlier context plus an explicit supersession:

```text
historical/stale rule = X
current authority     = Y
required outcome      = Y wins
```

Following stale `X` is a correctness failure regardless of token savings.

Fixture B is a synthetic TypeScript repository with a red deterministic baseline. Only the authorized implementation path may change, and the final candidate must pass the independent test command while preserving the current authority (`unknown != zero`).

### 5.4 OM shape under test

A3 uses the pinned Mastra Code semantic shape with lower thresholds only so OM actually fires in this bounded experiment:

```text
scope                                = thread
observation.messageTokens            = 8000
observation.bufferTokens             = 0.2
observation.bufferActivation         = 0.8
observation.previousObserverTokens   = 1000
observation.blockAfter               = 2
reflection.observationTokens         = 2000
reflection.bufferActivation          = 0.5
reflection.blockAfter                = 1.1
activateAfterIdle                    = auto
activateOnProviderChange             = true
semantic/vector recall               = OFF
memory extractors                    = OFF
working-memory expansion             = OFF
```

These thresholds are qualification mechanics, not future production defaults.

### 5.5 Deciding evidence

A3 records only dimensions useful to the V1 decision:

```text
correctness / current-authority adherence
forgotten requirements
rediscovery/repeated reads
coding verifier result and unexpected changed paths
rework / failed-test cycles
tool-call count
Actor token usage
Observer/Reflector usage
wall-clock latency
OM cycles/errors
```

Missing evidence remains `NOT_PROVEN`; it is never converted to zero or PASS.

### 5.6 F-3L-A-02 — OM hidden retries

Source inspection of the pinned `@mastra/memory 1.24.0` established that Observer/Reflector have retry behavior not controlled by the main Agent's `maxRetries=0`.

This matters, but **Package A will not build a generic model gateway/proxy to solve it**.

```text
A3 responsibility = measure whether OM is worth carrying
Package C responsibility = prove owner-local admission/retry/usage/cost semantics
```

Therefore a positive A3 result means only:

```text
COGNITIVELY QUALIFIED CANDIDATE
```

If Package C cannot gate/account the OM billable path with the smallest sustainable mechanism, OM remains OFF for F1.

### 5.7 A3 decision rule

```text
material benefit + no current-authority regression
→ COGNITIVELY QUALIFIED CANDIDATE; continue to Package C proof

no material benefit
→ KEEP OM OFF

stale-authority regression
→ REJECT current OM realization for F1

missing/interrupted deciding evidence
→ NOT_PROVEN
```

No A3 result creates a memory service, reopens domain semantics or triggers a generic framework comparison.

### 5.8 Current A3 state

```text
exact dependency closure      = COMPLETE
non-billable fixture contracts= COMPLETE / under CI
billable model calls           = 0
OpenRouter qualification key   = NOT YET PRESENT
four primary runs              = NOT STARTED
OM baseline                    = OFF
```

---

## 6. Execution order inside Package A

```text
A0 lock closure                      = COMPLETE / PASS
↓
A1 Mastra/Postgres runtime mechanics = COMPLETE / PASS
↓
A2 E2B Builder substrate             = COMPLETE / PASS WITH REQUIRED GUARD
↓
A3 OM cognition comparison           = ADMITTED / PREPARED / BILLABLE RUNS NEXT
↓ adjudicate
Package A internal completeness/deletion check
↓
operator + ChatGPT Package A verdict
```

---

## 7. Current verdict matrix

| Track | State | Deciding evidence |
|---|---|---|
| Lock / supply-chain identity | **PASS** | exact committed locks + supply-chain gate |
| A1 Mastra/Postgres runtime | **PASS** | 6/6 pinned-package local/persistent probes |
| A2 stock E2B adapter write reincarnation | **FAIL AS-IS / FINDING CONFIRMED** | source + contract + live physical replacement write |
| A2 narrow physical-incarnation guard | **PASS / REQUIRED** | RED→GREEN local + live provider proof |
| A2 E2B Builder substrate overall | **PASS WITH REQUIRED GUARD + KNOWN DNS EXCEPTION** | 10/10 live suite + exact template/resource/network/DB/custody evidence |
| A3 OM cognition | **ADMITTED / NOT_PROVEN** | non-billable fixtures ready; four real paired runs still required |
| Package A overall | **IN PROGRESS** | A3 remains before package verdict |

## 8. Guardrails

```text
prove first useful V1, not theoretical maximum hardening
no product code
spike guard != product implementation
no Pi revival as parallel harness
no generic sandbox/framework benchmark
no OM enablement by enthusiasm
no mock/fake PASS for model-bearing cognition
no new security subsystem without a fired F1 failure class
preserve deferred security/model-spend obligations in their existing gates
no Product Agent memory expansion in Package A
```

Fable is not used as a Package A coauthor by default. Per operator-approved workflow, the independent challenger remains reserved for the complete 3L package unless a separately bounded coding-agent task is explicitly justified and instructed without architecture discretion.

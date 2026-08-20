# 3L-A — Builder Substrate + Cognition Qualification

**Status:** COMPLETE / A1 PASS / A2 PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD / A3 EVALUATED — NOT_PROVEN FOR OM ENABLEMENT / KEEP OM OFF
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
A3 Codex OAuth realignment commit   = 99d12284d3b09948ea13b9f14fe41b4838996e56
latest-stable repin commit          = 01ef4e0128b69d27136c3e426eab82af89605566
latest-stable lock commit           = ce204d587a221c755c0eab8c302c78c4ec2cad4a
A3 current-lock binding commit      = 3a82aaef064e4fa3fb443e8f6392ef884d110cf3
A3 harness RED commit               = 5c54f28e
A3 harness GREEN commit             = 9b5788a7
A3 live-source commit               = aa1b1fea
A3 manual-only workflow commit      = a543bf1
Node                                = 24.18.0
npm                                 = 11.16.0
spike lockfileVersion               = 3
A1/A2 original package-lock SHA-256 = 6b506f505567d82dd94653fca14bb5bc6b7b5b2d5138f83b34123d02e93cb0ce
current package-lock SHA-256        = 7f61c6c74ad92b23abd0fb44353bc63f444ab01dd3b62d23cec7d7de4b1051d5
@mastra/code-sdk                    = 1.1.2
@mastra/core                        = 1.56.0
@mastra/e2b                         = 0.8.0
@mastra/memory                      = 1.25.0
@mastra/pg                          = 1.19.0
e2b SDK resolved transitively       = 2.40.0
supply-chain Q0 deny-set            = PASS
package lifecycle scripts at lock   = DISABLED
```

Evidence remains bound to the exact bytes that produced it. Historical A1/A2 deciding/live evidence keeps its original lock identity; the approved latest-stable repin is a separate affected-surface requalification and does not relabel old live evidence as new bytes.

## 2. Compiled Package A scope and proportionality

```text
A1 — CX-BUILDER-MASTRA-01
A2 — CX-SBX-E2B-01 compiled against current Mastra Builder authority
A3 — CX-BUILDER-COGNITION-01 (persistent thread OM OFF × OM ON)
```

A1, A2 and A3 are adjudicated. The native Codex OAuth smoke passed for both exact model IDs and the four model-bearing conditions ran exactly once in the fixed order `A0 → A1 → B0 → B1`. A3 did not prove material net benefit from OM, so the Package A baseline remains `OM = OFF`.

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

Original deciding A1 execution:

```text
6 tests / 6 pass / 0 fail
```

Latest-stable regression on `@mastra/core 1.56.0` + `@mastra/pg 1.19.0` under the current lock:

```text
P1/P4 + P2 + P3 + P21 + P27a + P27b = 6 / 6 PASS
regression finding                     = NONE
```

The same six persisted-runtime invariants therefore remain qualified on the current stable family. A1 proves persistent cognition/runtime mechanics only. It does not borrow E2B physical behavior or model-bearing Builder quality from A2/A3.

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

Live guest inspection confirmed that runner/provider credentials present during A2 did not enter the sandbox environment, including:

```text
E2B_API_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
OPENROUTER_API_KEY
GITHUB_TOKEN
```

The OpenRouter name above is historical A2 negative evidence only; OpenRouter is no longer part of the admitted A3 realization. Model-provider credentials remain control-side under current 3I authority.

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

Latest-stable affected-surface regression on `@mastra/e2b 0.8.0`:

```text
adapter retry characterization = 3 / 3 PASS
physical-incarnation guard     = 5 / 5 PASS
transitive e2b SDK             = 2.40.0 / UNCHANGED
0.8.0 release delta            = peer-floor + Code Mode tool-name reuse
lifecycle/retry/network delta  = NONE IDENTIFIED in 0.8.0 release record
```

Therefore the expensive provider-live suite is not replayed merely because the wrapper package version changed. Historical A2 live evidence remains explicitly bound to its original adapter bytes; the changed wrapper surfaces that could affect the confirmed reincarnation finding/guard were requalified on 0.8.0, while the physical E2B SDK and previously qualified provider-side lifecycle/network substrate stayed unchanged.

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
historical A2 live tests                  = 10 / 10 PASS
current A1 latest-stable regression       = 6 / 6 PASS
current @mastra/e2b 0.8 adapter regression= 3 / 3 PASS
current physical-incarnation guard        = 5 / 5 PASS
current A3 non-billable contracts         = 15 / 15 PASS
current Codex OAuth imports               = PASS
current live-script syntax checks         = PASS
Package A workflow                        = SUCCESS
lock bootstrap                            = SUCCESS
Documentation / npm run verify            = SUCCESS
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

## 5. A3 — Builder cognition / Observational Memory — COMPLETE / KEEP OM OFF

### 5.1 Question being decided

A3 exists to answer one bounded product question:

> **Does Observational Memory materially improve the long-running Change-scoped Builder enough to justify carrying it into F1?**

It is not a memory-framework benchmark, provider bake-off or security exercise.

Current baseline remains:

```text
OM = OFF
```

A3 may qualify OM as a candidate; it cannot enable OM by itself.

### 5.2 Realization reconciliation — OpenRouter removed

The earlier A3 preparation used an OpenRouter + Anthropic/Google path only as a qualification realization candidate. Before any model-bearing A3 call occurred, source inspection of the exact Mastra Code family established that the selected Builder substrate already contains native ChatGPT/Codex subscription OAuth:

```text
@mastra/code-sdk 1.1.2
→ openai-codex OAuth provider
→ device-code start/poll
→ AuthStorage / CredentialStore
→ auto-refresh
→ openaiCodexProvider(...)
→ ChatGPT Codex backend
```

No A3 billable/model call was executed on the superseded OpenRouter path. Therefore:

```text
OpenRouter A3 realization = DELETED BEFORE DECIDING EXECUTION
architecture reopen       = NONE
Q0 reopen                 = NONE
```

Q0 already requires the package record to freeze the actual provider/model/adapter path; this section is the Package A repin required by that law.

### 5.3 Exact current experiment identity

```text
credential path             = ChatGPT/Codex subscription OAuth
OAuth implementation        = native Mastra Code openai-codex
@mastra/code-sdk            = 1.1.2
Actor                       = openai/gpt-5.6-sol
OM Observer + Reflector     = openai/gpt-5.6-luna
reasoning/thinking level    = medium
A3 lock SHA-256             = 7f61c6c74ad92b23abd0fb44353bc63f444ab01dd3b62d23cec7d7de4b1051d5
E2B qualified template ID   = 7ezun152y8jtqxf7llpl
primary Actor runs          = exactly 4
OAuth smoke                 = Sol + Luna before the four primary runs
```

Primary-source evidence observed at admission time stated that GPT-5.6 Sol and Luna were available in Codex for eligible paid ChatGPT plans and that Luna was the fastest / lowest-cost GPT-5.6 tier. That vendor statement remained candidate evidence until the deciding device OAuth smoke admitted both exact model IDs for the operator's actual subscription.

A3 intentionally uses:

```text
Sol  → main Builder actor, where coding/current-authority capability is decisive
Luna → Observer/Reflector, where speed and lower subscription-credit consumption are preferred
```

No model winner is promoted beyond this package by naming it here.

### 5.4 OAuth execution shape

A3 uses the native device flow and does not require the operator to copy an access/refresh token into chat or GitHub secrets.

```text
startCodexDeviceLogin()
→ URL + one-time code
→ operator signs in/approves
→ pollCodexDeviceLogin()
→ temporary OAuth credential in runner AuthStorage
→ smoke Sol
→ smoke Luna
→ A0 → A1 → B0 → B1
→ runner ends; qualification credential disappears
```

The OAuth credential remains control-side and never enters E2B.

Persistent/multi-user credential custody for product realization remains governed by 3I-02 and is not implemented by this spike.

### 5.5 Paired fixtures

```text
Fixture A — long-context authority-currentness
  A0 = OM OFF
  A1 = OM ON

Fixture B — deterministic coding effectiveness
  B0 = OM OFF
  B1 = OM ON
```

The same Actor model, task, current authority and starting fixture are used inside each pair. We do not repeat samples until a preferred result appears. OM ON differs only by enabling the admitted OM path with Luna Observer/Reflector.

Fixture A contains substantial earlier context plus an explicit supersession:

```text
historical/stale rule = X
current authority     = Y
required outcome      = Y wins
```

Following stale `X` is a correctness failure regardless of token savings.

Fixture B is a synthetic repository with a red deterministic baseline. Only the authorized implementation path may change, and the final candidate must pass the independent test command while preserving the current authority (`unknown != zero`).

### 5.6 OM shape under test

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

### 5.7 Deciding evidence

A3 records only dimensions useful to the V1 decision:

```text
correctness / current-authority adherence
forgotten requirements
rediscovery/repeated reads when observable
coding verifier result and unexpected changed paths
rework / failed-test cycles when observable
tool-call count
Actor token usage when exposed
Observer/Reflector cycles/errors
wall-clock latency
```

Per-call USD cost is not asserted for this subscription path. If exact token/credit usage is not exposed by the admitted surface, it remains `MISSING`; it is never converted to zero.

### 5.8 F-3L-A-02 — OM hidden retries

Historical source inspection of `@mastra/memory 1.24.0` established that Observer/Reflector had retry behavior not controlled by the main Agent's `maxRetries=0`. Package A is now pinned to `@mastra/memory 1.25.0`; Package C must re-inspect/requalify the exact 1.25.0 attempt/admission surface rather than inheriting the old mechanism claim. A3 does not require that retry shape to remain unchanged.

This matters, but **Package A will not build a generic model gateway/proxy to solve it**.

```text
A3 responsibility = measure whether OM is worth carrying
Package C responsibility = prove owner-local admission/retry/usage/cost semantics
```

Therefore a positive A3 result means only:

```text
COGNITIVELY QUALIFIED CANDIDATE
```

If Package C cannot gate/account the OM model-bearing path with the smallest sustainable mechanism, OM remains OFF for F1.

### 5.9 A3 decision rule

```text
material benefit + no current-authority regression
→ COGNITIVELY QUALIFIED CANDIDATE; continue to Package C proof

no material benefit
→ KEEP OM OFF

stale-authority regression
→ REJECT current OM realization for F1

OAuth/model unavailable for actual subscription
→ NOT_PROVEN for current realization; adjudicate smallest repin only

missing/interrupted deciding evidence
→ NOT_PROVEN
```

No A3 result creates a memory service, reopens domain semantics or triggers a generic framework comparison.

### 5.10 Harness RED → GREEN and exact-head verification

The first one-shot attempt was correctly stopped before OAuth/model execution by two admission defects:

```text
RED workflow run / job = 32183161901 / 95860710246
answer-only Workspace  = missing; AgentController requires a valid Workspace
OM model settings      = emitted unsupported maxOutputTokens
```

The smallest correction added a local skills-only Mastra `Workspace` for answer-only conditions, kept coding conditions on E2B, and removed only the unsupported OM field. Tasks, fixtures, thresholds, ordering and deciding criteria did not change.

```text
GREEN workflow run / job       = 32183719481 / 95862460416
exact current-head run / job   = 32183918352 / 95863079100
A1 current-lock regression     = 6 / 6 PASS
A2 adapter regression          = 3 / 3 PASS
physical-incarnation guard     = 5 / 5 PASS
A3 non-billable contracts      = 15 / 15 PASS
OAuth imports + syntax checks  = PASS
```

The exact CI environment used Node `24.18.0`, npm `11.16.0` and PostgreSQL `17.10`. Local Node 26 checks were supplementary only; exact CI is deciding.

### 5.11 OAuth smoke and four primary runs

```text
live workflow run / job        = 32183868645 / 95863091782
live source commit             = aa1b1feaf45bc9933c48e58d7d667dce56019b60
Codex OAuth smoke — Sol        = PASS
Codex OAuth smoke — Luna       = PASS
primary execution order        = A0 → A1 → B0 → B1
primary conditions completed   = 4 / 4, exactly once
selective replay               = NONE
```

| Condition | Correctness | Admissibility | Actor usage | Tools | Wall time | OM evidence |
|---|---:|---:|---:|---:|---:|---|
| A0 — authority, OM OFF | PASS | PASS | 23,414 total tokens | 0 | 2,709 ms | none expected |
| A1 — authority, OM ON | PASS | **FAIL — `OM_DID_NOT_FIRE`** | 23,414 total tokens | 0 | 32,464 ms | zero observation/reflection events |
| B0 — coding, OM OFF | PASS | PASS | 72,685 total tokens | 3 | 15,607 ms | none expected |
| B1 — coding, OM ON | PASS | PASS | 50,938 total tokens | 3 | 29,605 ms | one observation cycle; no reflection |

Both authority conditions returned exactly the four required current-authority lines with no stale-authority violation. Both coding conditions changed only `src/budget.mjs`, preserved `unknown != zero` and passed the independent verifier with zero tool errors. B1 used fewer Actor tokens than B0, but took about 90% longer; Observer/Reflector usage remained `MISSING`, never zero. A1 produced no OM cycle or measurable benefit. The live job therefore ended non-success on the explicit A1 admissibility rule, not because OAuth, transport or the harness failed.

Deciding artifact:

```text
artifact name                 = conexus-3l-a3-cognition
GitHub artifact ID            = 9342196774
artifact archive digest       = sha256:e1b21fe164478f46543f8431729b188fbdae4df4616699befb04ce53b41ac55b
a3-cognition-result.json SHA  = 03aee81e06374964e16a2519a063d591acb2ef913e39292ecb3c9adbea65a232
```

### 5.12 A3 adjudication

```text
CX-BUILDER-COGNITION-01       = EVALUATED
current OM realization        = NOT COGNITIVELY QUALIFIED
material net benefit          = NOT_PROVEN
current-authority regression  = NONE
OM baseline                   = KEEP OFF
Package C OM carry-forward    = NONE unless a later Decision Loop re-admits it
architecture reopen           = NONE
```

`MUST EVALUATE` is satisfied; it never meant `MUST ENABLE`. The mixed B-pair signal cannot outweigh A1 inadmissibility, materially higher latency and missing OM-model usage evidence. No repeat was performed to manufacture a preferred result.

---

## 6. Execution order inside Package A

```text
A0 lock closure                      = COMPLETE / PASS
↓
A1 Mastra/Postgres runtime mechanics = COMPLETE / PASS
↓
A2 E2B Builder substrate             = COMPLETE / PASS WITH REQUIRED GUARD
↓
A3 native Codex OAuth smoke          = COMPLETE / SOL + LUNA PASS
↓
A3 OM cognition comparison           = COMPLETE / A0 → A1 → B0 → B1 ONCE
↓
A3 adjudication                      = NOT_PROVEN FOR ENABLEMENT / KEEP OM OFF
↓
Package A completeness/deletion check= COMPLETE / PASS
↓
Package A verdict                    = COMPLETE
```

---

## 7. Current verdict matrix

| Track | State | Deciding evidence |
|---|---|---|
| Lock / supply-chain identity | **PASS** | latest-stable exact lock `7f61c6c7…` + supply-chain gate |
| A1 Mastra/Postgres runtime | **PASS** | original 6/6 + latest-stable 1.56/1.19 regression 6/6 |
| A2 stock E2B adapter write reincarnation | **FAIL AS-IS / FINDING CONFIRMED** | source + contract + live physical replacement write |
| A2 narrow physical-incarnation guard | **PASS / REQUIRED** | original RED→GREEN + live proof; 0.8 regression 5/5 |
| A2 E2B Builder substrate overall | **PASS WITH REQUIRED GUARD + KNOWN DNS EXCEPTION** | 10/10 live suite + exact template/resource/network/DB/custody evidence |
| A3 Codex OAuth path | **PASS** | native pinned surface; device smoke admitted exact Sol + Luna IDs |
| A3 OM cognition | **EVALUATED / NOT_PROVEN FOR ENABLEMENT / KEEP OFF** | four fixed-order conditions exactly once; A1 `OM_DID_NOT_FIRE`; no current-authority regression |
| Package A overall | **COMPLETE** | A1 PASS; A2 PASS WITH REQUIRED GUARD; A3 KEEP OM OFF |

## 8. Package A completeness/deletion check

```text
A1 criteria accounted                              = YES
A2 criteria accounted                              = YES
A3 MUST EVALUATE accounted                         = YES
OM product code/config/dependency authority added  = 0
new domain/module/durable record/database/workflow = 0
product implementation                             = 0
required physical-incarnation guard preserved      = YES
superseded OpenRouter realization retained         = NO
one-shot workflow left auto-triggered               = NO / manual-only restored
selective model-bearing replay                      = 0
Material Finding against approved architecture      = NONE
prior architecture reopen                           = NONE
Package A verdict                                   = COMPLETE
```

The narrow physical-incarnation guard remains a required future realization constraint, not product code from this package. The current OM realization is deleted from the F1 candidate path by keeping the already-approved baseline OFF; no OM subsystem is carried forward by implication.

---

## 9. Guardrails

```text
prove first useful V1, not theoretical maximum hardening
no product code
spike guard != product implementation
no Pi revival as parallel harness
Pi/source references are challenger/evidence only
no generic sandbox/framework/provider benchmark
no OpenRouter fallback hidden behind Codex OAuth
no OM enablement by enthusiasm
no mock/fake PASS for model-bearing cognition
no new security subsystem without a fired F1 failure class
preserve deferred security/model-spend obligations in their existing gates
no Product Agent memory expansion in Package A
```

Fable is not used as a Package A coauthor by default. Per operator-approved workflow, the independent challenger remains reserved for the complete 3L package unless a separately bounded coding-agent task is explicitly justified and instructed without architecture discretion.

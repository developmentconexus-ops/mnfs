# 3L-A — Builder Substrate + Cognition Qualification

**Status:** IN PROGRESS / A1 COMPLETE-PASS / A2 COMPLETE-PASS WITH REQUIRED GUARD / A3 NEXT  
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
current A1/A2 deciding HEAD          = 1664483577376164826526dbde73c6607a7ce89d
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

This closes exact identity/admission for the current Package A evidence. Version resolution alone never constitutes behavioral proof.

## 2. Compiled Package A scope

```text
A1 — CX-BUILDER-MASTRA-01
A2 — CX-SBX-E2B-01 compiled against current Mastra Builder authority
A3 — CX-BUILDER-COGNITION-01 (persistent thread OM OFF × OM ON)
```

A1 and A2 are now adjudicated independently. A3 remains the only open track in Package A.

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

The stock `@mastra/e2b 0.7.0` adapter was also proven to contain this path:

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

A qualification-only guard was then implemented under `spikes/conexus-3l-a/` and tested RED→GREEN. Local and live evidence proves the minimum required behavior:

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

**Realization consequence:** the first product Builder write-capable E2B path MUST include a semantically equivalent physical-incarnation guard. The exact spike class/API is not product architecture and need not be copied verbatim; the enforced behavior above is the qualification result.

### 4.4 Egress/network — PASS WITH KNOWN C-008 DNS EXCEPTION

Live tests established:

```text
deny-all + explicit allowlist                = FIRING
explicitly allowed private HTTPS target       = reachable
redirect from allowed target to denied target = BLOCKED after first hop
non-DNS TCP/853 escape                        = BLOCKED by application-response proof
provider-side traffic token transform         = not exposed as guest env secret
```

The test also reproduced the limitation already frozen in C-008:

```text
public DNS TCP/53 remains reachable under deny-all
```

This is **not a new Finding** and is not silently converted into a generic egress PASS. Current qualification is precisely:

> native E2B egress enforcement is adequate for the accepted C-008 threat model when current known DNS behavior is preserved as an explicit limitation; redirects and tested non-DNS escape surfaces fail closed.

A future provider/network semantic change requires affected network criteria to be requalified.

### 4.5 Private RunPreview substrate — PASS

With `allowPublicTraffic:false`:

```text
anonymous external HTTP                = 403
traffic-token authenticated HTTP       = 200
authenticated WebSocket upgrade        = 101 / PASS
```

This proves the private HTTP/WebSocket substrate needed by RunPreview. It does not implement or replace the approved Hub authenticated reverse proxy; that remains Realization/downstream conformance work.

### 4.6 Quiescence, cancel, child process and teardown — PASS

Live tests established that the qualified machine exposes and allows control of the relevant predecessor-mutation surfaces:

```text
tracked command cancellation       = FIRING
surviving child if present          = observable through process table / controllable
self-daemonized deferred writer     = observable before reuse
provider sandbox teardown           = observable and controllable
```

Facility inventory on the qualified template also characterized:

```text
crontab = absent
atq     = absent
PID 1   = systemd
base OS systemd timers = present
```

Quiescence does not mean deleting harmless base-OS timers. The required law remains detection/control of residual activity capable of mutating the admitted Builder lineage before continuation/reuse.

### 4.7 SYNC/SHARE custody — PASS

A live synthetic git lineage produced a result bundle inside the sandbox, transferred exact bundle bytes into runner/Hub-side custody, destroyed the sandbox, and then verified/imported the bundle after sandbox loss.

Latest representative evidence:

```text
bundle SHA-256                 = 576a009a0014a83bb833d26acbc8fdba6e5ef2b71692d6e30d85795209f2666c
bundle bytes                   = 511
changed paths                  = app.txt, result.txt
verified after sandbox loss    = TRUE
```

This proves the E2B→Hub custody primitive. Actual product quarantine repository, validation, push/PR and authority transitions remain owned by the approved Hub flow.

### 4.8 BuildValidationDatabase — PASS

The qualified sandbox successfully instantiated the synthetic BuildValidationDatabase profile with:

```text
PostgreSQL                     = 17.10
encoding                       = UTF8
locale provider                = builtin
builtin locale                 = C.UTF-8
pt-BR collation                = ICU
listen_addresses               = 127.0.0.1
public/guest-exposed PG port   = NONE
```

Role-negative evidence:

```text
owner      = NOLOGIN / NOSUPERUSER / NOCREATEDB / NOCREATEROLE
migrator   = LOGIN / non-superuser / can assume owner only for migration fixture
query      = LOGIN / read-only / write denied
action     = LOGIN / DML capability / DDL denied / owner assumption denied
```

This remains synthetic build validation only; it does not create a second DEV authority or authorize real ERP/data credentials inside E2B.

### 4.9 Orphan reconciliation — PASS

A sandbox created with an owner metadata marker was recoverable through provider inventory after discarding the original local SDK handle. Reconciliation recovered the exact physical sandbox ID, destroyed it, and confirmed provider-side disappearance.

Therefore owner metadata + provider inventory are sufficient substrate mechanics for the approved orphan-reconciliation path. Durable owner truth remains Hub-owned, not provider-owned.

### 4.10 A2 final adjudication

Latest deciding live suite at HEAD `1664483577376164826526dbde73c6607a7ce89d`:

```text
A2 live tests              = 10 / 10 PASS
A1 local runtime tests     = PASS
adapter contract tests     = PASS
physical guard tests       = PASS
Package A workflow         = SUCCESS
lock bootstrap             = SUCCESS
Documentation              = SUCCESS
```

A2 outcome:

```text
E2B as Builder sandbox substrate                         = QUALIFIED FOR CURRENT F1 SHAPE
stock Mastra E2B write retry across physical incarnation = NOT ACCEPTABLE AS-IS
qualified narrow physical-incarnation write guard        = REQUIRED REALIZATION CONSTRAINT
known public DNS TCP/53 exception                         = ACCEPTED / CHARACTERIZED C-008 LIMITATION
new domain/module/database/workflow                       = 0
architecture reopen                                      = NONE
```

What A2 does **not** prove:

```text
model-bearing Builder effectiveness
Observational Memory net benefit
full model-spend enforcement
permanent production package pins
full product Hub reverse-proxy implementation
first-build Golden Budget Analyzer conformance
```

Those remain A3 / Package C / post-C018 first-build gates as already routed.

---

## 5. A3 — Builder cognition / Observational Memory — NEXT / NOT STARTED

Required comparison remains:

```text
A0 = persistent Change-scoped thread + OM OFF
A1 = same task/runtime/provider/model class + OM ON
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

A3 requires real model-bearing execution. A synthetic model, mocked reasoning result or hidden unbounded model call cannot produce a PASS.

Before the first billable A3 call, its own bounded admission record MUST freeze at least:

```text
provider
exact model identity
provider/adapter path
model parameters/reasoning controls
max calls/runs
max input/output envelope
retry policy
Observer/Reflector model identity
usage/cost capture path
finite qualification spend envelope
```

The A3 qualification budget is a probe guard, not product model-spend implementation and not a substitute for Package C.

---

## 6. Execution order inside Package A

```text
A0 lock closure                         = COMPLETE / PASS
↓
A1 Mastra/Postgres runtime mechanics    = COMPLETE / PASS
↓
A2 E2B Builder substrate                = COMPLETE / PASS WITH REQUIRED GUARD
↓
A3 OM cognition comparison              = NEXT / NOT STARTED
↓ adjudicate
Package A internal completeness/deletion check
↓
operator + ChatGPT Package A verdict
```

---

## 7. Current verdict matrix

| Track | State | Deciding evidence |
|---|---|---|
| Lock / supply-chain identity | **PASS** | exact committed lock + supply-chain gate |
| A1 Mastra/Postgres runtime | **PASS** | 6/6 pinned-package local/persistent probes |
| A2 stock E2B adapter write reincarnation | **FAIL AS-IS / FINDING CONFIRMED** | source + contract + live physical replacement write |
| A2 narrow physical-incarnation guard | **PASS / REQUIRED** | RED→GREEN local + live provider proof |
| A2 E2B Builder substrate overall | **PASS WITH REQUIRED GUARD + KNOWN DNS EXCEPTION** | 10/10 latest live suite + exact template/resource/network/DB/custody evidence |
| A3 OM cognition | **NOT_PROVEN YET / NEXT** | real bounded model-bearing A0×A1 comparison required |
| Package A overall | **IN PROGRESS** | A3 remains before package verdict |

## 8. Guardrails

```text
no product code
spike guard != product implementation
no Pi revival as parallel harness
no generic sandbox benchmark
no OM enablement by feature enthusiasm
no mock/fake PASS for model-bearing cognition
no hidden/unbounded model call outside A3 admission and later 3I-03/Package C proof
no Product Agent memory expansion in Package A
```

Fable is not used as a Package A coauthor by default. Per operator-approved workflow, the independent challenger remains reserved for the complete 3L package unless a separately bounded coding-agent task is explicitly justified and instructed without architecture discretion.

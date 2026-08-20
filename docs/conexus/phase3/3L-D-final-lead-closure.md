# 3L Package D — Architecture-Lead Final Closure

**Status:** `CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED TRANSACTIONAL-ADMISSION PROPERTY`

**Phase:** 3L — Technology Qualification

**Package:** D — Managed Execution

**Authority:** [3L-R2 — Managed Execution & Deciding Evidence Proportional Rederivation](3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md)

**Reviewed executor HEAD:** `ab6b1841e585b9cafbf8ea04290505832fa1b952`

**Deciding Evidence:** [`spikes/conexus-3l-d/evidence/dt1p.json`](../../../spikes/conexus-3l-d/evidence/dt1p.json)

**Product implementation:** `BLOCKED`

**C-018:** `NOT RATIFIED`

**3L:** `IN PROGRESS`

## 1. Final adjudication

```text
DT-1'
= EXECUTED
= EVIDENCE ACCEPTED
= QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION

Material Finding
= 0

Package D
= CLOSED / LEAD-ADJUDICATED
= QUALIFIED FOR CURRENT F1 TESTED TRANSACTIONAL-ADMISSION PROPERTY

Product implementation correctness
= NOT CLAIMED
```

The Architecture Lead reviewed executor commit `ab6b1841e585b9cafbf8ea04290505832fa1b952`. That commit is exactly one commit over the prior authority projection and changes only `spikes/conexus-3l-d/**`. The accepted Evidence is bounded to the DT-1' criteria and does not promote the spike or its fixture schema to Product implementation.

## 2. Accepted execution identity

```text
Node                    = 24.18.0
PostgreSQL              = 17.10
pg-boss                 = 12.26.3
pg                      = 8.22.0
package-lock SHA-256    = c9d9e0362cbf03d5290ff2639049fc95d03ff5df11287ae3f870775b432a4fd3
exported vendor DDL SHA = 9b5b191f613733ae68fd43a455ce986a89e5ba4c369dc33eb148230b74a647f9
```

Accepted pg-boss runtime configuration:

```text
schema       = mar
createSchema = false
migrate      = false
schedule     = false
retryLimit   = 0
```

The vendor DDL was exported through the pinned pg-boss `getConstructionPlans("mar")` surface. Runtime vendor migration and scheduler ownership were not admitted.

## 3. Deciding results

### GREEN

```text
P1 = PASS — owner fixture + queue projection commit atomically
P2 = PASS — forced rollback leaves neither fact
P3 = PASS — committed facts are rediscovered by a fresh process
P4 = PASS — one concurrent winner; loser fails closed with SQLSTATE 23505
P5 = PASS — inadmissible owner blocks the guarded physical-effect canary
P6 = PASS — provider/model/E2B/Sankhya/real external effect calls = 0
```

### RED / counterexamples

```text
R1 = PASS — split commits reproduce owner-without-queue lost window
R2 = PASS — removing owner uniqueness reproduces duplicate admission
R3 = PASS — unguarded queue trust fires the canary; owner guard blocks it
```

The negative controls fired before the corresponding protected result was trusted.

## 4. Same physical transaction confirmed

The accepted harness composes both writes through one physical PostgreSQL transaction:

```text
withTransaction(pool)
→ acquire one pg.Client
→ BEGIN
→ owner INSERT through that client
→ boss.send(..., { db: asPgBossDb(the same client) })
→ COMMIT
```

P2 injects a failure after the queue projection and proves the same transaction rolls back both owner and queue facts. P1 and P4 prove the positive atomic and concurrent paths under the exact pinned stack.

## 5. Queue is mechanics, never authority

```text
owner-derived logical occurrence uniqueness
= primary correctness fence

pg-boss job / queue state
= private MAR projection mechanics
!= Product occurrence, Release, due-work or effect authority
```

P5/R3 provide the deciding counterexample: the same queue work fires the unguarded canary but is refused before effect when current owner admissibility is checked. Queue delivery alone therefore cannot authorize execution.

## 6. Bounded proof nuances — non-material

Two proof nuances are recorded without reopening Package D or requiring another probe:

1. P3 proves committed durability plus fresh-process rediscovery after the original handles close. It is not a literal `SIGKILL` test. Recovery of a physically `RUNNING` worker after process loss remains routed to 3M.
2. P6 is bounded by the isolated dependency/execution surface of DT-1'. It proves zero calls through that admitted surface; it is not a general network interceptor.

These nuances narrow claim wording only. They do not invalidate the accepted transactional-admission Evidence.

## 7. Product correctness not claimed

DT-1' does not implement or qualify:

```text
Product MAR owner/table/constraint realization
real Release / Promotion / SERVED_VERIFIED path
real Project sync / cursor / ETL
real Gateway / Connection / Sankhya behavior
real provider/model/E2B behavior
cron, delayed occurrence or rolling future JobRun
full retry/cancel/timeout/partial-progress recovery
RUNNING-orphan recovery
full architecture-wide conformance
```

The closure qualifies only the current F1 tested PostgreSQL/pg-boss transactional managed-occurrence admission property.

## 8. Preserved downstream obligations

```text
fixed-interval owner reconciliation implementation          → FIRST-BUILD
single-flight/coalesce implementation                       → FIRST-BUILD
exact logical-occurrence-key spelling                       → Realization Planning / FIRST-BUILD
retry preserving exact Release/job pins                     → FIRST-BUILD
owner cancel intent                                         → FIRST-BUILD + 3M
cooperative interruption                                    → FIRST-BUILD
timeout / partial progress                                  → FIRST-BUILD + 3M
RUNNING orphan recovery                                     → 3M
MANAGED_JOB Gateway last-mile revalidation                  → FIRST-BUILD security/Gateway
Release SERVED_VERIFIED integration                         → FIRST-BUILD / Release
actual sync / Sankhya / Project DB realization              → FIRST-BUILD / 3N / 3O as routed
```

No outbox, scheduler/automation domain, new durable owner record or Package F is admitted.

## 9. Closure consequence

```text
Package D = CLOSED / LEAD-ADJUDICATED
remaining Package-D pre-C-018 technology question = 0
additional Package-D probe = NOT JUSTIFIED
3L closure = NOT YET
final independent Fable review = REQUIRED NEXT
3M = NOT YET OPENED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
```

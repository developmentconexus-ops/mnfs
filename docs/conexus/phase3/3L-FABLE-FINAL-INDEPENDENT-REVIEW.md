# 3L — Final Independent Fable Review

**Status:** `INDEPENDENT REVIEW OUTPUT / NON-AUTHORITATIVE / AWAITING ARCHITECTURE-LEAD ADJUDICATION`

**Phase:** 3L — Technology Qualification

**Role:** Independent Principal/Staff Software Architect reviewer

**Reviewed HEAD:** `d61c1060780eaa81727fbeb7980b6f784918f1cb`

**Branch:** `agent/conexus-phase-3-system-design`

**Verdict:** `BOUNDED CORRECTION REQUIRED`

**Product implementation:** `BLOCKED`

**C-018:** `NOT RATIFIED`

**3L:** `IN PROGRESS / NOT CLOSED BY THIS REVIEW`

**3M:** `NOT OPENED BY THIS REVIEW`

This document is a review output. It is not acceptance authority, does not close 3L, does not open 3M, does not ratify C-018, does not authorize Product implementation and does not change PR #40.

---

## 1. HEAD reconstruction

The branch state was rebuilt from the repository before any handoff claim was accepted.

```text
git remote -v                     = origin https://github.com/developmentconexus-ops/mnfs.git
git fetch --all --prune           = executed
git rev-parse HEAD                = d61c1060780eaa81727fbeb7980b6f784918f1cb
git rev-parse --abbrev-ref HEAD   = agent/conexus-phase-3-system-design
git rev-parse origin/agent/...    = d61c1060780eaa81727fbeb7980b6f784918f1cb
```

Local HEAD, remote branch tip and the expected HEAD stated in the prompt agree exactly. No divergence, no rebase, no local commit ahead of origin.

Working tree at review start:

```text
?? docs/conexus/design-system/
?? skills-lock.json
```

Both are untracked and pre-existing; neither was created, modified or committed by this review, and neither is part of the reviewed bytes.

### 1.1 Delta from the handoff basis

The handoff was prepared after executor commit `ab6b1841e585b9cafbf8ea04290505832fa1b952`. The delta from that commit to the reviewed HEAD is exactly one commit, `d61c106 docs(3l): project Package D closure`:

```text
M  docs/conexus/current/README.md
A  docs/conexus/phase3/3L-D-final-lead-closure.md
A  docs/conexus/phase3/3L-FABLE-FINAL-INDEPENDENT-REVIEW-HANDOFF.md
A  docs/conexus/phase3/3L-preclosure-completeness-deletion-check.md
M  docs/conexus/phase3/LEDGER.md
5 files changed, 626 insertions(+), 30 deletions(-)
```

The delta is documentation only. No Product code, no dependency, no spike bytes and no probe were added after the executor commit.

### 1.2 Evidence provenance chain verified

```text
spikes/conexus-3l-d/evidence/dt1p.json  repoHead = b7232aab722b4abf5c03e2dbf9df48857d6821ee
git rev-parse ab6b1841e585b9cafbf8ea04290505832fa1b952^ = b7232aab722b4abf5c03e2dbf9df48857d6821ee
```

The Evidence records the HEAD that existed while the probe ran, which is the exact parent of the commit that introduced the spike. `ab6b184` touches only `spikes/conexus-3l-d/**` (18 files, 2064 insertions). The lineage is coherent; no evidence file claims a commit it could not have observed.

### 1.3 Branch scope check

```text
git diff --name-only main...HEAD | awk -F/ '{print $1}' | sort | uniq -c
  12 .agents
   3 .github
   1 AGENTS.md
 199 docs
   1 package.json
   6 scripts
  70 spikes
```

No `src/`, `apps/` or `packages/` Product path is touched on the branch. `Product implementation = BLOCKED` is true of the tree, not only of the documents.

---

## 2. Authority reconstruction actually performed

Read in the mandated order, following links to exact detail where material:

```text
AGENTS.md
docs/conexus/current/README.md
docs/conexus/current/ARCHITECTURE-BASELINE.md          (targeted: route block, qualification table, header)
docs/conexus/current/DECISION-RECONCILIATION.md        (targeted: current 3L projection lines)
docs/conexus/phase3/LEDGER.md
docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md   (topology, migration lineage, FK tiers)
docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md   (MAR durable inventory)
docs/conexus/phase3/3L-Q0-qualification-manifest.md
docs/conexus/phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md   (routing/supersession surface)
docs/conexus/phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md   (full)
docs/conexus/phase3/3L-A-builder-substrate-cognition.md
docs/conexus/phase3/3L-B-final-lead-closure.md
docs/conexus/phase3/3L-D-final-lead-closure.md
docs/conexus/phase3/3L-preclosure-completeness-deletion-check.md
spikes/conexus-3l-d/admission/criteria.json
spikes/conexus-3l-d/evidence/dt1p.json
spikes/conexus-3l-d/src/*.mjs
spikes/conexus-3l-d/scripts/*.mjs
spikes/conexus-3l-d/schema/dt1-fixtures.sql
spikes/conexus-3l-d/vendor/pgboss-12.26.3-mar.sql
spikes/conexus-3l-d/package.json
scripts/test-conexus-3l-r1-routing.mjs
package.json
```

The handoff was used as bootstrap only. Every claim below is anchored to repository bytes at the reviewed HEAD.

### 2.1 Boundaries honoured

```text
Product code implemented        = NO
DT-1' or any probe executed     = NO
npm run verify executed         = NO
dependency installed/pinned     = NO
@mastra/observability acquired  = NO
3M started                      = NO
C-018 ratified                  = NO
3L marked closed                = NO
PR #40 inspected or modified    = NO
current/README, LEDGER, 3L-R1, 3L-R2, Package-D closure, completeness check, C-018 modified = NO
```

`scripts/test-conexus-3l-r1-routing.mjs` was **read**, not executed. Its outcome below is derived by static comparison of its assertions against the exact document bytes at HEAD, not by running it.

---

## 3. DT-1' explicit challenge

Each accepted claim was tested against source and Evidence.

| Accepted claim | Verified in source/Evidence | Result |
|---|---|---|
| same `pg.Client` transaction adapter | `src/postgres.mjs` `withTransaction` acquires one client, `BEGIN`/`COMMIT` on it; `asPgBossDb(client)` wraps that same client as `executeSql` | CONFIRMED |
| owner `INSERT` + `boss.send` in the same transaction | `src/admission.mjs` calls `insertOwner(client, …)` then `boss.send(…, { db: asPgBossDb(client) })` inside the same `withTransaction` callback | CONFIRMED |
| forced rollback of both facts | P2 injects `DT1_FORCED_ROLLBACK` via `afterProjection` after the send; Evidence `ownerCount 0 / queueCount 0`. This is the deciding proof that the queue insert really is inside the caller transaction | CONFIRMED |
| SQLSTATE 23505 concurrent loser | P4 runs two `admitOccurrence` on distinct pool clients; Evidence records `code 23505`, `constraint dt1_owner_job_run_logical_occurrence_key_key`, `successfulAdmissions 1`, `ownerCount 1`, `winningProjectionCount 1`. The owner `INSERT` precedes the send, so the loser fails closed before any queue projection | CONFIRMED |
| queue-without-owner negative control | P5/R3 send a job carrying a non-existent `ownerJobRunId`, `boss.fetch` it, then run the same job through `unguardedHandler` and `guardedHandler`; unguarded fires the canary once, guarded refuses `OWNER_NOT_ADMISSIBLE` with zero effects | CONFIRMED |
| R1/R2/R3 counterexamples | R1 commits the owner row alone via the pool (auto-commit) and observes `queueProjectionCount 0`; R2 uses `mar.dt1_owner_without_unique` and commits 2 rows for one logical key; R3 is the unguarded half of the P5 experiment | CONFIRMED |
| `pg-boss schema=mar` | `src/pgboss.mjs` `PG_BOSS_RUNTIME_CONFIG.schema = 'mar'`; the exported vendor DDL creates every object under `mar.` | CONFIRMED |
| `createSchema=false` / `migrate=false` / `schedule=false` / `retryLimit=0` | `src/pgboss.mjs:7-16`; `ensureQueue` re-reads the queue and throws `DT1_QUEUE_CONFIGURATION_NOT_CONFIRMED` unless `retryLimit === 0`; P1 Evidence shows `retry_limit 0` on the committed row | CONFIRMED |
| exported exact-version vendor DDL | `bootstrap-db.mjs` exports via `getConstructionPlans('mar')` from the pinned package and hashes the exact bytes; `validate-admission.mjs` re-hashes the committed file and compares | CONFIRMED as a provenance record. It is a self-consistency record, not an independent pin: the file is rewritten from the installed package on every bootstrap. The version fence is the separate lock check, which is present and sufficient |
| exact Node/PostgreSQL/pg-boss/pg/lock/image identity | Evidence records Node `24.18.0`, live `server_version` `17.10`, container repo digest and image id, `pg-boss 12.26.3`, `pg 8.22.0`, lock SHA-256; `verify-lock.mjs` additionally requires `resolved` + `integrity` on every locked package | CONFIRMED |
| zero Product implementation claim | Fixtures are `mar.dt1_owner_job_run` / `mar.dt1_owner_without_unique`, marked `testOnly` / `notProductDdl`; `assertScratchDatabase` hard-fails unless the database is `conexus_dt1p` | CONFIRMED |

### 3.1 The two recorded proof nuances

**P3 = committed durability + fresh-process rediscovery, not literal `SIGKILL`.** Accurate as recorded. `run-dt1p.mjs` P3 commits, calls `environment.close()` (`boss.stop({graceful:false})` + `pool.end()`), then `execFile`s `scripts/fresh-process-read.mjs` as a separate OS process which reconnects and reads both facts. This proves durability across process boundaries; it does not prove recovery of a physically `RUNNING` worker. The closure states exactly that and routes `RUNNING`-orphan recovery to 3M. No overstatement.

**P6 = bounded isolated dependency/execution surface, not general network interception.** The stated bound is accurate but incomplete in one respect, recorded as `F-04` below: P6 is not a measurement of the admitted surface, it is an asserted constant.

### 3.2 What the probe does not touch — checked, not assumed

`boss.work()` was never exercised; the probe uses `boss.fetch()` and then calls `guardedHandler` / `unguardedHandler` directly. The guard is harness-authored code, so P5/R3 demonstrate that the control *can fire*, not a pg-boss property. This is the correct proportional shape — `AGENTS.md` requires proving a control can fire, and worker dispatch, ack, retry, cancel and timeout are explicitly routed to FIRST-BUILD/3M by `3L-R2 §10` and the Package-D closure §8. Not a Finding.

---

## 4. Proportional deletion challenge

Each deleted current-path item was tested against exact current authority for residual load-bearing status before C-018.

| Deleted item | Challenge result |
|---|---|
| Package C hard USD reservation/cost-envelope probe | SURVIVES DELETION. `3L-R1` / README §8 keep a mandatory bounded posture (allowlist, no fallback cascade, finite step/retry limits, provider caps, truthful `MISSING != ZERO`) and name explicit reopen triggers. Nothing is silently unbounded |
| old delayed/future-occurrence/cron DT-1 route | SURVIVES DELETION. Superseded in full by `3L-R2 §6`, which replaced pre-admission with immediate freshness-driven reconciliation |
| pg-boss cron catch-up qualification | SURVIVES DELETION as a *probe*. F1 never uses pg-boss cron as admission authority. The underlying one-catch-up law is not deleted: `3L-R2 §7` freezes it and `§17 Preserved` retains `one catch-up / no N-slot backlog`. See `F-01` for the one place this is not projected |
| rolling future JobRun | SURVIVES DELETION. Rejected by `3L-R2 §6` and listed in README §12 non-architecture |
| Package E runtime exporter/backend probe | SURVIVES DELETION. `@mastra/observability` is unpinned and not C-016 admitted; any pre-C-018 probe would exercise a synthetic composition. `3L-R2 §15` routes each Package-E criterion to a named later owner |
| full historical Package-B proof inventory | SURVIVES DELETION. `B1-01..B4-18` are explicitly retained as a preserved downstream inventory, not literal pre-C-018 execution |
| DurableAgent | SURVIVES DELETION. Deferred with a named requalification trigger; Package-B §6 makes enablement conditional |
| Builder/PAR process split | SURVIVES DELETION. BT-5N established `QUALIFIED_SAME_PROCESS` for enabled surfaces with the RED shared-PubSub control firing; split remains a future trigger |
| OTel Collector / Sentry / Spotlight / ClickHouse | SURVIVES DELETION. No named consumer or failure class |
| new scheduler/automation domain | SURVIVES DELETION. Rejected consistently by 3A-R9, 3L-R2 and README §12 |
| outbox | SURVIVES DELETION. The persist→enqueue gap that motivates an outbox is exactly what P1/P2 close inside one transaction, and R1 reproduces the failure class the outbox would otherwise be needed for |
| Package F | SURVIVES DELETION. No residual question was found that a new Package could answer without Product bytes that do not yet exist |

**No deletion challenge succeeded.** I could not identify a deleted item that is still load-bearing before C-018 with an exact authority, a concrete counterexample and insufficient downstream routing.

---

## 5. Findings

### F-01

**Severity:** `MATERIAL`

**Category:** current-tree projection incomplete / enforced verification gate asserts the negation of the accepted closure

**Exact authority/Evidence:**

- `AGENTS.md` § Verification — default final verification is `npm run verify`
- `package.json` — `verify` → `docs:check` → `docs:test` → `node scripts/test-conexus-3l-r1-routing.mjs`
- `scripts/test-conexus-3l-r1-routing.mjs:28-36` — `acceptedCurrentOutcomePatterns`, including at line 34 `packagesDE: /Packages D\/E\s*=\s*NOT EXECUTED\s*\/\s*REQUIRE PROPORTIONAL REDERIVATION/iu`
- `scripts/test-conexus-3l-r1-routing.mjs:74-75` — that pattern set is asserted with `assert.match` against **each** of `readme`, `architecture`, `reconciliation`, `ledger`, with the message `must project accepted current outcome: packagesDE`
- `docs/conexus/current/ARCHITECTURE-BASELINE.md:1475, 2284, 2285, 2338, 2342, 2349, 2596`
- `docs/conexus/current/DECISION-RECONCILIATION.md:370, 378, 544`
- `docs/conexus/phase3/3L-D-final-lead-closure.md §1` — `Package D = CLOSED / LEAD-ADJUDICATED`

**Failure/counterexample:**

The repository's own mechanical gate requires all four current router documents to contain, as an **accepted current outcome**, the string `Packages D/E = NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION`. Package D is now `CLOSED / LEAD-ADJUDICATED`. The gate is currently green only because that string is still physically present in every one of the four files.

Two of the three named current authority documents still state the superseded status in current-state voice:

- `ARCHITECTURE-BASELINE.md:2284` — `| managed sync/job semantics | **NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION** | … Package D is not admitted by inheritance |`
- `ARCHITECTURE-BASELINE.md:2285` — `| pg-boss 12.26.3 | **PACKAGE D CANDIDATE / NOT AUTHORITY** | one-catch-up law must be proved |`
- `ARCHITECTURE-BASELINE.md:2349` — `Packages D/E remain NOT EXECUTED and require proportional rederivation before any admission.`
- `ARCHITECTURE-BASELINE.md:2596` — a directive telling the reader not to execute D/E, Product implementation, C-018 ratification or merge by inheritance
- `DECISION-RECONCILIATION.md:370, 378, 544` — the same current-state assertion

`current/README.md:72` supersedes exactly one literal string, `Packages D/E = NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION`. That named supersession does **not** cover `ARCHITECTURE-BASELINE.md:2285`, which is a different string and additionally states an outstanding qualification precondition — `one-catch-up law must be proved` — that the preclosure deletion check §4 removed from the current critical path (`pg-boss cron catch-up qualification`) and that 3L will never perform.

The projection asymmetry is verifiable inside one block. `ARCHITECTURE-BASELINE.md:2325-2334` was updated for Package B (`CLOSED / LEAD-ADJUDICATED`, full BT detail, `CX-AGENT-MASTRA-01`, `CX-RUNTIME-ISOLATION-01`) while the Package D/E rows a few lines below at `2337-2342` were left at `NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION`. The Package-B closure §10 made "project this closure into the current tree" its exact next action; the Package-D closure has no equivalent projection into these two files.

The trap is concrete and two-sided. An actor who correctly removes the now-historical string from `ARCHITECTURE-BASELINE.md:1475` or `DECISION-RECONCILIATION.md:378` **breaks `npm run verify`**. An actor who leaves it preserves a false current-state claim inside a named current authority. Either way the actor must silently choose between the repository's mandated verification and the repository's accepted closure. The same script already contains the correct idiom for this situation — `historicalBt5nRoutePattern` at line 22, which asserts an *explicitly labeled historical* route — and that idiom was applied to `README.md:72` and `LEDGER.md:267` but never extended to the D/E pattern or to the remaining two documents.

**Why material:**

This is not documentation drift. It is the repository's own current-state gate encoding the negation of the accepted Package-D closure, and actively obstructing the corrective projection. The preclosure completeness check asserts `remaining material 3L technology question = 0`; that is true of the *technology* question set, and I did not falsify it. But 3L cannot be declared closed while the enforced verification gate and two of three current authority documents assert that its final Package was never executed. This is precisely the class the handoff names — a state in which a later actor must decide a material authority question silently.

**Smallest disposition:**

1. Reclassify `packagesDE` in `scripts/test-conexus-3l-r1-routing.mjs` from `acceptedCurrentOutcomePatterns` to an explicitly-labeled-historical assertion, mirroring `historicalBt5nRoutePattern`.
2. Project the Package-D closure and the Package-E deferral into `docs/conexus/current/ARCHITECTURE-BASELINE.md` (header, route block at `2337-2349`, qualification-table rows `2284-2285` including replacing the `one-catch-up law must be proved` precondition with its FIRST-BUILD routing, `1475`, and `2596`) and into `docs/conexus/current/DECISION-RECONCILIATION.md:370, 378, 544`.

No probe, no Package, no dependency and no Product code.

**New Product requirement?** `NO`

**Architecture reopen?** `NONE`

---

### F-02

**Severity:** `NON_MATERIAL`

**Category:** qualification-criterion status not projected into the current router

**Exact authority/Evidence:**

- `docs/conexus/phase3/LEDGER.md:340` — `CX-MANAGED-JOB-01 = MUST QUALIFY in 3L` (3A-R9 projection)
- `docs/conexus/phase3/LEDGER.md:252, 1711` — `CX-MANAGED-JOB-01 current pre-C-018 tested subset = QUALIFIED by DT-1'`
- `docs/conexus/current/README.md` — contains `CX-AGENT-MASTRA-01` and `CX-RUNTIME-ISOLATION-01`; contains **zero** occurrences of `CX-MANAGED-JOB-01`
- `docs/conexus/current/ARCHITECTURE-BASELINE.md:2339` — the only occurrence anywhere in `docs/conexus/current/`, and it sits inside the stale Package-D block covered by `F-01`

**Failure/counterexample:**

`CX-MANAGED-JOB-01` is a 3L qualification criterion declared `MUST QUALIFY in 3L`. It closes 3L with only a tested subset qualified. The current-tree router names the final status of its two sibling criteria (`CX-AGENT-MASTRA-01`, `CX-RUNTIME-ISOLATION-01`) in the §13 program-state block, but never names `CX-MANAGED-JOB-01` at all. An actor reading only the router must infer its status from `Package D = CLOSED`, and that inference is broader than the Package-D closure permits — exactly the overstatement 3L is designed to prevent.

**Why non-material:**

The residual is genuinely routed, so nothing is orphaned: `LEDGER.md:1392` routes `job/v1` / deterministic sync dispatch to FIRST-BUILD / 3M / 3N / 3O, and the Package-D closure §8 enumerates every preserved obligation. The defect is router legibility, not a missing decision.

**Smallest disposition:** one line in `current/README.md §13` and the LEDGER 3L projection blocks, e.g. `CX-MANAGED-JOB-01 = QUALIFIED FOR CURRENT F1 TESTED TRANSACTIONAL-ADMISSION SUBSET / REMAINDER ROUTED FIRST-BUILD + 3M`. Fold into the `F-01` correction.

**New Product requirement?** `NO`

**Architecture reopen?** `NONE`

---

### F-03

**Severity:** `NON_MATERIAL`

**Category:** incomplete reproduction provenance

**Exact authority/Evidence:**

- `AGENTS.md` § Conexus framework/technology execution protocol — "Record enough provenance to reproduce the claim: … commands/configuration"
- `spikes/conexus-3l-d/src/pgboss.mjs:22-23` — the constructed `PgBoss` also receives `supervise: false` and `useListenNotify: false`
- `spikes/conexus-3l-d/evidence/dt1p.json` `pgbossRuntime` — records only `schema, createSchema, migrate, schedule, retryLimit`
- `spikes/conexus-3l-d/admission/criteria.json` `pgbossRuntime` — the same five keys
- `spikes/conexus-3l-d/scripts/validate-admission.mjs` — compares the two five-key objects by exact `JSON.stringify`, so the two extra options can never be surfaced by the gate
- `docs/conexus/phase3/3L-D-final-lead-closure.md §2` — reproduces the same five keys as the accepted runtime configuration

**Failure/counterexample:**

`supervise: false` disables pg-boss maintenance and `useListenNotify: false` forces polling instead of `LISTEN`/`NOTIFY`. Both are real runtime-behaviour switches actually used to produce the accepted Evidence, and neither appears in the admission record, the Evidence or the closure. A reproducer following the recorded configuration would construct a differently-behaving pg-boss instance.

**Why non-material:**

No accepted claim depends on either option. P1/P2/P4 are transaction-scoped, P3 reads committed rows from a fresh process, P5/R3 call handlers directly, and R1/R2 do not involve pg-boss delivery. The accepted verdict is unaffected.

**Smallest disposition:** add both keys to the recorded runtime configuration in the closure §2, and to `criteria.json` / Evidence if the Architecture Lead wants the gate to fence them. No re-execution required — the values are literal constants in committed source.

**New Product requirement?** `NO`

**Architecture reopen?** `NONE`

---

### F-04

**Severity:** `NON_MATERIAL`

**Category:** claim precision — attested constant presented as an observed result

**Exact authority/Evidence:**

- `spikes/conexus-3l-d/scripts/run-dt1p.mjs:209-215` — `const p6 = await runCase('P6', async () => ({ providerCalls: 0, modelCalls: 0, e2bCalls: 0, sankhyaCalls: 0, realExternalEffects: 0 }), { database: false })`
- `spikes/conexus-3l-d/scripts/run-dt1p.mjs:276` — `prohibitedSurfaceObserved: []`, a literal
- `spikes/conexus-3l-d/scripts/run-dt1p.mjs:310` and `spikes/conexus-3l-d/scripts/validate-admission.mjs` — both gates test those literals, so neither gate can ever fail
- `docs/conexus/phase3/3L-D-final-lead-closure.md §6`, nuance 2 — records the bound as "zero calls through that admitted surface … not a general network interceptor"

**Failure/counterexample:**

P6 and `prohibitedSurfaceObserved` are asserted by construction, not instrumented. The recorded nuance describes a *surface* bound but not the *attestation* nature: the closure says P6 proves zero calls through the admitted surface, when in fact nothing counts calls. A reader could reasonably believe a counter was instrumented and read zero.

**Why non-material:**

The substantive claim is true and is established structurally rather than by P6. The spike's declared dependency closure is `pg-boss` + `pg` only (`spikes/conexus-3l-d/package.json`), `verify-lock.mjs` enforces both direct pins plus `resolved` + `integrity` on every locked package and rejects any `@mastra/*` direct dependency, `assertScratchDatabase` hard-fails outside `conexus_dt1p`, and no source file under `spikes/conexus-3l-d/{src,scripts,tests}` imports a provider, model, E2B, Sankhya or HTTP client. The conclusion survives; only its stated basis is imprecise.

**Smallest disposition:** one clause in the closure §6 stating that P6 and `prohibitedSurfaceObserved` are surface attestations whose real support is the enforced dependency closure, not runtime call counters.

**New Product requirement?** `NO`

**Architecture reopen?** `NONE`

---

### F-05

**Severity:** `NON_MATERIAL`

**Category:** unrouted realization constraint in the exported vendor DDL

**Exact authority/Evidence:**

- `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md §3` — `uma lineage do hub_control` / `DDL transacional como baseline`
- `docs/conexus/phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md §5.3` — vendor SQL is "folded into the ONE ordered hub_control migration lineage", and "Conexus code must not hand-edit pg-boss internals to create a forked schema"
- `spikes/conexus-3l-d/vendor/pgboss-12.26.3-mar.sql:2` — `BEGIN;`
- `spikes/conexus-3l-d/vendor/pgboss-12.26.3-mar.sql:413` — `COMMIT;`
- `spikes/conexus-3l-d/scripts/bootstrap-db.mjs` — applies the file as one `pool.query(vendorSql)`, i.e. standalone, never nested inside another transaction

**Failure/counterexample:**

The exact exported artifact carries its own transaction wrapper. Folded verbatim into a migration runner that has already opened a transaction, PostgreSQL emits `WARNING: there is already a transaction in progress` for the nested `BEGIN` and then the embedded `COMMIT` terminates the *runner's* transaction mid-migration. A later failure inside that migration would no longer roll back the vendor DDL, leaving `hub_control` partially migrated in violation of the transactional-DDL baseline — and it manifests as a warning, not an error, so it can pass unnoticed. `3L-R2 §5.4` names three controls (version change, object collision, runtime schema mutation); none of them names the transaction-wrapper case.

**Why non-material:**

It requires no probe: the fact is statically determinable from the committed artifact, as done here. Removing the outer wrapper changes no object definition and therefore does not "fork the vendor schema", so the two 3L-R2 clauses are reconcilable without a Decision Loop. DT-1' already demonstrated that the file applies cleanly as a standalone unit. It is a first-build realization constraint, not an open technology question.

**Smallest disposition:** one row in the Package-D closure §8 preserved obligations — `vendor DDL transaction-wrapper handling in the hub_control lineage → FIRST-BUILD`.

**New Product requirement?** `NO`

**Architecture reopen?** `NONE`

---

### F-06

**Severity:** `NON_MATERIAL`

**Category:** admission record incomplete against its own manifest

**Exact authority/Evidence:**

- `docs/conexus/phase3/3L-Q0-qualification-manifest.md §14` — the pre-execution admission record must capture `Q0 revision / commit`, `3L-R2 revision / commit`, `current repo HEAD` and `known UNKNOWN/PARTIAL facts`, among others
- `spikes/conexus-3l-d/admission/criteria.json` — records the two authority documents by **path only**, records `repoBranch` but no repo HEAD, and carries no `known UNKNOWN/PARTIAL` block
- `spikes/conexus-3l-d/scripts/validate-admission.mjs` — enforces `repoHead` on the *Evidence* only, never on the *criteria*

**Failure/counterexample:**

Four of the eleven listed contents are absent from the admission record, and the gate does not object, so an admission record could be authored against unpinned authority revisions.

**Why non-material:**

The provenance is reconstructible in practice: `criteria.json` and `evidence/dt1p.json` were committed together in `ab6b184`, whose tree pins the exact bytes of both authority documents, and `3L-R2 §18` carries the full `KNOWN / INFERRED / UNKNOWN / DEFERRED` ledger that `criteria.json` points at. No accepted claim is weakened.

**Smallest disposition:** add the four fields at the next Package admission, or record in the closure that they are satisfied by the committing tree plus `3L-R2 §18`.

**New Product requirement?** `NO`

**Architecture reopen?** `NONE`

---

### F-07

**Severity:** `NON_MATERIAL`

**Category:** presentation defect in the current-tree router header

**Exact authority/Evidence:**

- `docs/conexus/current/README.md:11` — the `**Package D:**` line has no trailing hard break, while lines `10` (`Package B`) and `12` (`Package E`) both end with the two-space Markdown line break

**Failure/counterexample:**

The Package D and Package E status lines render merged into a single line in the accepted current-state router header.

**Why non-material:**

Presentation only; both statuses are individually correct and are repeated verbatim in README §1 and §10.

**Smallest disposition:** restore the two-space hard break at `README.md:11`.

**New Product requirement?** `NO`

**Architecture reopen?** `NONE`

---

## 6. Mandatory adversarial questions

**A. Did Package A or Package B overstate qualification?**

`NO`. Package A grades itself `A2 PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD`, `A3 EVALUATED / NOT_PROVEN FOR ENABLEMENT / KEEP OM OFF`, and keeps a named C-008 DNS exception rather than smoothing it. Its A3 table records an outright `FAIL — OM_DID_NOT_FIRE` in the A1 cell instead of suppressing it. Package B binds every verdict to tested properties, names the one enabled process-global surface (`AgentThreadStreamRuntime` singleton, partitioned by PubSub identity) and lists three deferred globals that require requalification before enablement. Package B §4 also discloses that the first PostgreSQL-backed BT-5N attempt failed and explains why the corrected assertion is stronger rather than weaker. Both closures state `Product implementation correctness = NOT CLAIMED`.

**B. Is Package C deferral safe for actual F1 without permitting unbounded execution?**

`YES`. The deferral removes cost-optimisation machinery, not bounds. The mandatory bounded posture — explicit provider/model allowlist, no automatic fallback cascade, bounded/disabled hidden retries, strict retry limits, explicit Agent/loop/tool-step limits, provider/account caps where available, truthful `MISSING != ZERO` telemetry, truthful visible failure — remains in force in README §8 and the preclosure check §2, with named reopen triggers. Deferring reservation machinery is not the same as permitting unbounded execution.

**C. Does DT-1' genuinely prove the remaining Package-D substrate property?**

`YES`, for the property actually claimed. P2 is the decisive result: an injected failure *after* `boss.send` rolls back the queue projection, which can only happen if the send genuinely executed on the caller's client. P4 shows the owner uniqueness fence firing first and failing closed. R1/R2/R3 reproduce each failure class before the corresponding protected result is trusted. The bounded nuances in §3.1 do not touch the claimed property.

**D. Did Package D accidentally promote pg-boss queue/timer state to Product authority?**

`NO`. The correctness fence is the owner-side unique constraint on `logical_occurrence_key`, not the queue. `boss.send(...) === null` throws `DT1_QUEUE_PROJECTION_NOT_CREATED` inside the transaction, so a null return can never commit as a successful admission. P5/R3 provide the deciding counterexample that queue delivery alone does not authorize an effect. The closure §5 and `3L-R2 §4` both restate `queue/timer state != admission authority`, and README §5 carries it as a current authority truth.

**E. Is placement of pg-boss private substrate objects in the existing `mar` schema coherent with 3E-01/3E-02?**

`YES`, and it is verifiable rather than assumed. `3E-02` fixes MAR's durable record inventory at exactly two entries, `serving_route` and `job_run`, and states explicitly that `queue/scheduler substrate continua seam interno e não vira domain record/module apenas por existir async work`. The exported vendor DDL creates `mar.job`, `mar.job_common`, `mar.job_dependency`, `mar.queue`, `mar.queue_stats`, `mar.schedule`, `mar.subscription`, `mar.version`, `mar.bam`, `mar.warning`, the type `mar.job_state`, and the functions `mar.create_queue`, `mar.delete_queue`, `mar.job_table_format`, `mar.job_table_run`, `mar.job_table_run_async`. Intersected against `{serving_route, job_run}` the collision set is **empty**. `3E-01 §2` also forbids a `shared`/`common` schema and requires exactly one module owner per schema; both are respected. The one unrouted realization constraint is `F-05`.

**F. Is Package E truly safely deferable before C-018?**

`YES`. `@mastra/observability` is unpinned and not C-016 admitted; acquiring it now to satisfy sequence would violate Q0 §6. Any pre-C-018 exporter probe would exercise a synthetic Product composition — no `obs.operational_event` owner, no F5 verifier, no owner dispatch context to bind trust against — and would prove the fixture rather than the Product. `3L-R2 §15` routes each Package-E criterion to a named later owner, and the `NOT_PROVEN / INCONCLUSIVE` law for missing evidence is preserved.

**G. Is treatment of `@mastra/observability` honest: named future dependency, unpinned and not yet C-016 admitted?**

`YES`. `3L-R2 §13` states it as a factual correction to the earlier basis, records that `@mastra/core 1.56.0` ships public contracts, types and a no-op path rather than the concrete implementation, notes that passing a plain config object can silently disable observability with a logger warning, and marks the package `VERSION UNPINNED / C-016 admission NOT PERFORMED / lock closure NOT FROZEN`. It also rejects hand-implementing the entrypoint to dodge the dependency. This is the honest form.

**H. Is any still-current load-bearing 3L technology uncertainty orphaned?**

`NO`. Every candidate I tested resolves to one of: qualified with a bounded verdict; deferred with a named trigger and owner; or deleted with a superseded premise. I specifically probed the co-residency of pg-boss with the two Mastra role instances inside one Hub process and could not construct a named failure class — the substrates use separate databases (`hub_control` versus `mastra_builder` / `mastra_par`), share no process-global state, and no authority conditions qualification on their interaction. Without a concrete counterexample that is a preference, not a Finding.

**I. Was any historical criterion deleted merely for convenience rather than superseded or explicitly routed?**

`NO` for the current path — see §4, where all twelve deletion challenges failed. One residual precision point: `ARCHITECTURE-BASELINE.md:2285` still carries the deleted `one-catch-up law must be proved` precondition, which is a projection defect covered by `F-01` rather than an improper deletion. The one-catch-up *law* itself is preserved by `3L-R2 §7` and `§17`.

**J. Is any extra Package or probe being retained only for ceremony?**

`NO`. No Package or probe survives past its deciding question. Package C and Package E are deferred rather than executed hollow; Package F is explicitly refused. `3L-R2 §10` also refuses to re-probe facts already resolved from pinned source (`retryLimit=0`, `job.signal`, transaction adapters, cron catch-up insufficiency), which is the correct direction.

**K. Did 3L introduce dormant future infrastructure?**

`NO` in the Conexus surface. No new module, owner, durable record class, schema, database, scheduler domain, outbox or observability backend was created. The one physical dormancy is vendor baggage — `mar.schedule` and `mar.subscription` exist because they are part of the pg-boss package schema — and `3L-R2 §5.1` and `§6` name that fact in advance and neutralize it with `schedule=false` plus no admitted schedule API consumer. Disclosed vendor baggage under an explicit non-use rule is not dormant Conexus machinery.

**L. Can 3L close and 3M begin without coding actors silently deciding a material technology or authority question?**

`NOT YET`. Technology-wise, yes — I could not find an orphaned load-bearing pre-C-018 technology question, and no additional Package or probe is justified. Authority-wise, not while `F-01` stands: a later actor reaching `ARCHITECTURE-BASELINE.md` or `DECISION-RECONCILIATION.md` finds Package D asserted as never executed and pg-boss conditioned on a proof that will never happen, and an actor who corrects those files breaks the mandated `npm run verify`. That is a silent authority decision, and it is bounded and mechanical to remove.

---

## 7. Verdict matrix

| Dimension | Result |
|---|---|
| HEAD reconstruction | `d61c1060780eaa81727fbeb7980b6f784918f1cb` verified against origin |
| Evidence provenance | COHERENT — evidence `repoHead` is the exact parent of the spike commit |
| Package A qualification claim | PROPORTIONAL / NOT OVERSTATED |
| Package B qualification claim | PROPORTIONAL / NOT OVERSTATED |
| Package C deferral | SAFE / BOUNDED POSTURE PRESERVED |
| Package D — DT-1' claim vs Evidence | CLAIM WITHIN EVIDENCE |
| Package D — same-transaction composition | CONFIRMED (P2 decisive) |
| Package D — queue-not-authority | CONFIRMED (P5/R3 counterexample) |
| Package D — `mar` placement vs 3E-01/3E-02 | COHERENT / collision set empty |
| Package E deferral | SAFE / BASIS HONEST |
| Deletion challenge (12 items) | NO CHALLENGE SUCCEEDED |
| Orphaned load-bearing technology question | NONE FOUND |
| Dormant Conexus infrastructure | NONE |
| Additional Package justified | NO |
| Additional pre-C-018 probe justified | NO |
| Current-tree projection completeness | **DEFECTIVE — F-01** |
| Enforced verification gate vs accepted closure | **CONTRADICTORY — F-01** |
| Architecture reopen required | NO |
| New Product requirement | NONE |

---

## 8. Required final output

```text
Material Findings: 1
Non-material Findings: 6
New Product requirements: 0
Architecture reopen required: NO
```

Verdict:

```text
BOUNDED CORRECTION REQUIRED
```

The correction is documentation projection plus one routing-test reclassification. It requires no probe, no Package, no dependency acquisition and no Product code.

Explicit answers:

```text
Can 3L close? CONDITIONAL
Is another Package justified? NO
Is another pre-C-018 probe justified? NO
Can 3M start after Architecture-Lead adjudication? CONDITIONAL
Is Product implementation authorized? NO
Is C-018 ratified? NO
```

`CONDITIONAL` means: after the Architecture Lead disposes of `F-01` — reclassify `packagesDE` in `scripts/test-conexus-3l-r1-routing.mjs` and project the Package-D closure and Package-E deferral into `ARCHITECTURE-BASELINE.md` and `DECISION-RECONCILIATION.md` — 3L may close on the existing Evidence, and 3M may open. No further qualification work is required.

---

## 9. Strongest counterargument against my own verdict

**The strongest case against `BOUNDED CORRECTION REQUIRED` is that `F-01` should have been graded `NON_MATERIAL`, making the correct verdict `3L STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS`.**

The argument runs: the falsification target set by the handoff is that 3L is *proportionally complete* and may close *without another qualification Package or pre-C-018 probe*. I failed to falsify that proposition on every technical axis — twelve deletion challenges, twelve adversarial questions, and a line-level audit of the DT-1' harness, criteria, Evidence and vendor DDL. `F-01` concerns none of it: it is a projection lag in two derived documents plus one regex in a doc-consistency script, and `ARCHITECTURE-BASELINE.md`'s own preamble pre-declares that when the projection conflicts with an accepted detailed home, *the projection is defective*, not the decision. `AGENTS.md` and `current/README.md §1` both force the router to be read first, and the router carries an explicit precedence warning naming the superseded string. On that reading, the authority system already handles the conflict by design, and I graded a self-correcting condition as material — importing exactly the ceremony that 3L has been disciplined about deleting.

**Why I did not adopt it.** Two facts resist it. First, `ARCHITECTURE-BASELINE.md:2285` is not covered by the README's named supersession: it is a different string and it states a qualification precondition (`one-catch-up law must be proved`) that was *deleted from the current path*, so the self-correcting mechanism the counterargument relies on does not actually reach it. Second, and decisively, the conflict is not passive — `scripts/test-conexus-3l-r1-routing.mjs:34,75` makes the stale status a **passing condition of `npm run verify`**, which `AGENTS.md` designates as default final verification. A defect that the repository's own gate would reject the fix for is no longer self-correcting; it is load-bearing in the wrong direction.

That said, the counterargument is strong enough that I record the distinction plainly rather than blur it: **the technology conclusion of 3L survived every falsification attempt I could construct, and `F-01` is an authority-projection defect, not a qualification defect.** If the Architecture Lead judges the router's precedence warning sufficient and treats the verification-gate regex as trivially amendable, `3L STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS` is a defensible adjudication and I would not contest it.

**Second-strongest counterargument, recorded for completeness.** I could not independently re-execute DT-1' — the handoff forbids it, and the probe requires Docker plus a PostgreSQL 17.10 container, with no CI workflow for Package D (`.github/workflows/` contains `conexus-3l-a.yml`, `conexus-3l-a-lock.yml`, `conexus-3l-b.yml`, `docs.yml`, and nothing for 3L-D). Package B was accepted on fresh-CI evidence bound to an executor HEAD; Package D was accepted on a single local run. My confirmation of P1–P6 and R1–R3 is therefore a reading of harness source against recorded Evidence plus a verification of their internal consistency — not an independent reproduction. No authority requires CI for Package D, the recorded identity pins (image digest, lock SHA-256, live `server_version`, Node version) are sufficient for reproduction, and the harness gates are strict enough that fabricated Evidence would also have to defeat `validate-admission.mjs`. I record the asymmetry rather than convert it into a Finding, because I can name no failure it produces.

---

## 10. Boundary restatement

```text
3L closed by this review        = NO
3M opened by this review        = NO
C-018 ratified by this review   = NO
Product implementation          = BLOCKED
PR #40                          = UNCHANGED / DRAFT / NO MERGE
authority modified              = NONE
probe executed                  = NONE
dependency installed            = NONE
```

Adjudication belongs to the Architecture Lead and the operator. This review returns Findings and a verdict; it does not act on them.

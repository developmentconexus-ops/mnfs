# Conexus DT-1' Transactional Managed-Occurrence Admission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **EXECUTION STATUS: NOT AUTHORIZED.** This file is a Codex execution handoff/plan only. Do not install dependencies, create the spike, start PostgreSQL, execute tests, stage, commit, push, change PR state, or run DT-1' until the operator explicitly authorizes DT-1' execution after reviewing `3L-R2` and this plan.

**Goal:** Produce deciding Evidence for exactly one Package-D question: whether PostgreSQL 17.10 + pg-boss 12.26.3 can atomically and fail-closed compose one synthetic MAR owner occurrence with one pg-boss queue projection inside the existing `mar` schema, including rollback, restart, race, and queue-not-authority negative controls.

**Architecture:** Build an isolated qualification spike under `spikes/conexus-3l-d/`, not Product code. A scratch PostgreSQL 17.10 database contains one existing owner schema named `mar`; exact pg-boss 12.26.3 vendor DDL is exported through a supported pg-boss surface and applied as externally managed substrate DDL in that same schema. Synthetic MAR owner fixtures and a transaction-scoped `pg` adapter prove the composition; a guarded worker canary proves queue delivery alone cannot authorize physical work.

**Tech Stack:** Node.js 24.18.0; npm/package-lock v3; `pg-boss` 12.26.3; `pg` 8.22.0 direct probe pin; PostgreSQL 17.10; Node built-in `node:test`; Docker only as the disposable PostgreSQL host if the execution environment has Docker.

**Spec:** `docs/conexus/phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md`

## Global Constraints

- Current repo authority wins over this plan; re-read `AGENTS.md` → Engineering Method → current router → `3L-R2` immediately before execution.
- Revalidate PR #40 branch/HEAD before any mutation. If authority or `3L-R2` changed, stop and rederive the affected task before continuing.
- Product implementation remains **BLOCKED**. `C-018` remains **NOT RATIFIED**.
- This is an isolated qualification spike only; no Product MAR implementation, Product migration, Project sync, Gateway, Release/Promotion, Sankhya, provider/model, Mastra, E2B, or real external effect is permitted.
- Do not add `@mastra/*`; Package E remains deferred.
- Direct probe pins: `pg-boss=12.26.3`, `pg=8.22.0`, Node `24.18.0`, PostgreSQL `17.10`.
- Dependency acquisition requires the existing C-016 / 3L-Q0 supply-chain admission. No `latest`, mutable alias, floating direct pin, or unrecorded lock closure.
- Runtime pg-boss config is exactly subordinate mechanics: `schema: 'mar'`, `createSchema: false`, `migrate: false`, `schedule: false`.
- Do not use `boss.schedule()`, cron, `startAfter`, rolling future JobRuns, a JobSchedule/ScheduleOccurrence record, a custom scheduler, outbox, workflow engine, retry engine, or third Mastra instance.
- pg-boss automatic retry is disabled for the probe: queue/job configuration uses `retryLimit: 0`.
- `boss.send(...) === null` is a fail-closed projection failure, never success.
- Owner-side uniqueness is the primary correctness fence; pg-boss queue policy/singleton behavior may only be defense in depth.
- The synthetic owner table must be visibly test-only (for example `mar.dt1_owner_job_run`) and must not be described as final Product DDL.
- Vendor pg-boss DDL must be generated/exported from the exact installed package through a supported package surface; do not hand-copy or hand-fork vendor table/function definitions.
- PostgreSQL image identity must be recorded from the actually running image plus `SELECT version()`; a mutable Docker tag alone is not deciding identity.
- All P1–P6 GREEN assertions and R1–R3 RED controls must be represented in machine-readable Evidence.
- `providerCalls = modelCalls = e2bCalls = sankhyaCalls = realExternalEffects = 0` must be explicit Evidence assertions.
- A failed material criterion does not authorize redesign inside the spike. Record a Finding and stop for Architecture-Lead adjudication.
- Git safety: execution authorization does **not** imply stage/commit/push authorization. Do not `git add`, commit, push, change PR metadata, or merge unless the operator separately authorizes that exact Git action.

---

## File Structure

The executor should create only this spike-local structure unless a concrete test requires a smaller equivalent split:

```text
spikes/conexus-3l-d/
├── package.json
├── package-lock.json                    # generated only after authorized exact acquisition
├── admission/
│   └── criteria.json                    # exact P1–P6 / R1–R3 + pins + prohibited surfaces
├── evidence/
│   └── dt1p.json                        # generated deciding Evidence
├── vendor/
│   └── pgboss-12.26.3-mar.sql           # exact supported export, not hand-authored vendor DDL
├── schema/
│   └── dt1-fixtures.sql                 # synthetic owner + RED-only fixture tables
├── src/
│   ├── postgres.mjs                     # pool, transaction helper, DB identity query
│   ├── pgboss.mjs                       # exact pg-boss construction/queue bootstrap
│   ├── admission.mjs                    # owner INSERT + queue projection in one transaction
│   ├── owner-fixture.mjs                # owner lookup/admissibility fixture functions
│   └── worker-guard.mjs                 # guarded/unguarded effect-canary handlers
├── scripts/
│   ├── verify-lock.mjs                  # pins/integrities/forbidden dependencies
│   ├── validate-admission.mjs           # criteria/evidence/verdict consistency
│   ├── bootstrap-db.mjs                 # exact scratch schema + vendor SQL + fixture SQL
│   ├── fresh-process-read.mjs           # P3 fresh-process discovery helper
│   └── run-dt1p.mjs                     # deterministic evidence orchestrator
└── tests/
    ├── admission.test.mjs               # admission metadata and forbidden-surface checks
    └── dt1p-transactional-admission.test.mjs
```

No file above is a Product module. `schema/dt1-fixtures.sql` and `vendor/` exist only to make the qualification claim reproducible.

---

### Task 1: Revalidate authority and create the exact Package-D admission envelope

**Files:**
- Create: `spikes/conexus-3l-d/package.json`
- Create: `spikes/conexus-3l-d/admission/criteria.json`
- Create: `spikes/conexus-3l-d/scripts/verify-lock.mjs`
- Create after authorized acquisition: `spikes/conexus-3l-d/package-lock.json`
- Test: `spikes/conexus-3l-d/tests/admission.test.mjs`

**Interfaces:**
- Consumes: current repo HEAD, `3L-R2`, Q0/C-016 dependency-admission rules.
- Produces: exact probe pins and a machine-readable criteria envelope that every later task reads.

- [ ] **Step 1: Revalidate the execution gate before touching the spike**

Run read-only:

```bash
git fetch origin
git status --short --branch
git rev-parse HEAD
git rev-parse origin/agent/conexus-phase-3-system-design
```

Expected: local execution basis is the current PR #40 branch head or an explicitly reviewed descendant. Then read, in order:

```text
AGENTS.md
docs/engineering/standards/root-cause-global-maximum-method.md
docs/DOCUMENTATION-MAP.md
docs/conexus/current/README.md
docs/conexus/phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md
docs/conexus/phase3/3L-Q0-qualification-manifest.md
```

Stop if `3L-R2` no longer says `DT-1'` is the Package-D bounded probe or if explicit operator execution authorization is absent.

- [ ] **Step 2: Write the failing admission metadata test first**

Create `tests/admission.test.mjs` using `node:test` and assert `package.json`/`criteria.json` contain exactly:

```js
assert.equal(pkg.engines.node, '24.18.0')
assert.equal(pkg.dependencies['pg-boss'], '12.26.3')
assert.equal(pkg.dependencies.pg, '8.22.0')
assert.equal(criteria.postgres, '17.10')
assert.deepEqual(criteria.pgbossRuntime, {
  schema: 'mar',
  createSchema: false,
  migrate: false,
  schedule: false,
  retryLimit: 0,
})
assert.deepEqual(criteria.requiredGreenIds, ['P1','P2','P3','P4','P5','P6'])
assert.deepEqual(criteria.requiredRedIds, ['R1','R2','R3'])
assert.equal(criteria.executionSurface.mastra, false)
assert.equal(criteria.executionSurface.sankhya, false)
assert.equal(criteria.executionSurface.realExternalEffects, false)
```

Also assert no direct dependency name starts with `@mastra/` and no package script contains `schedule`, `cron`, or Product application paths.

- [ ] **Step 3: Run the test and verify RED**

```bash
cd spikes/conexus-3l-d
node --test tests/admission.test.mjs
```

Expected: FAIL because the package/criteria files do not exist yet.

- [ ] **Step 4: Create the minimal exact package and criteria envelope**

`package.json` must use:

```json
{
  "name": "@developmentconexus/conexus-3l-package-d",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": "24.18.0" },
  "scripts": {
    "test": "node --test --test-concurrency=1 tests/*.test.mjs",
    "verify:lock": "node scripts/verify-lock.mjs",
    "verify:admission": "node scripts/validate-admission.mjs",
    "verify": "npm run verify:lock && npm run verify:admission && npm test"
  },
  "dependencies": {
    "pg-boss": "12.26.3",
    "pg": "8.22.0"
  }
}
```

`criteria.json` must enumerate P1–P6/R1–R3 exactly as `3L-R2` states, plus the prohibited surfaces and the exact authority path.

- [ ] **Step 5: Perform the authorized dependency acquisition and freeze the lock**

Only after explicit execution authorization and C-016 admission:

```bash
npm install --package-lock-only --ignore-scripts
npm ci --ignore-scripts
npm ls --all
sha256sum package-lock.json
```

Expected: direct pins exactly `pg-boss@12.26.3` and `pg@8.22.0`; transitive closure fully frozen in `package-lock.json`.

`verify-lock.mjs` must parse `package-lock.json` and fail if:

```text
pg-boss != 12.26.3
root pg != 8.22.0
lockfileVersion != 3
any direct @mastra/* dependency exists
package integrity/resolved metadata required by npm lock is missing
```

- [ ] **Step 6: Run admission + lock verification GREEN**

```bash
npm run verify:lock
node --test tests/admission.test.mjs
```

Expected: PASS. Do not stage or commit.

---

### Task 2: Bootstrap one scratch PostgreSQL 17.10 `mar` schema with exact vendor DDL

**Files:**
- Create: `spikes/conexus-3l-d/vendor/pgboss-12.26.3-mar.sql`
- Create: `spikes/conexus-3l-d/schema/dt1-fixtures.sql`
- Create: `spikes/conexus-3l-d/src/postgres.mjs`
- Create: `spikes/conexus-3l-d/src/pgboss.mjs`
- Create: `spikes/conexus-3l-d/scripts/bootstrap-db.mjs`
- Modify: `spikes/conexus-3l-d/tests/dt1p-transactional-admission.test.mjs`

**Interfaces:**
- Produces `pool`, `withTransaction(fn)`, `databaseIdentity()`, `createBoss()`, and a reproducible scratch schema with pg-boss + synthetic owner fixtures.

- [ ] **Step 1: Start a disposable exact PostgreSQL 17.10 host and record physical identity**

Preferred if Docker is available:

```bash
docker pull postgres:17.10-bookworm
docker image inspect postgres:17.10-bookworm --format '{{json .RepoDigests}}'
docker run --rm -d --name conexus-dt1p-pg \
  -e POSTGRES_PASSWORD=dt1p \
  -e POSTGRES_DB=conexus_dt1p \
  -p 55432:5432 \
  postgres:17.10-bookworm
```

Do not treat the tag as deciding identity; capture the returned repository digest. Query:

```sql
SELECT version();
SHOW server_version;
```

Expected server major/minor: PostgreSQL 17.10. If the environment cannot run the exact pin, verdict is `NOT_PROVEN`; do not substitute PG18/PGLite.

- [ ] **Step 2: Write a failing bootstrap test**

Assert after bootstrap:

```sql
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mar';
SELECT to_regclass('mar.dt1_owner_job_run');
SELECT to_regclass('mar.queue');
SELECT to_regclass('mar.job');
```

and assert `createBoss()` resolves with configuration equivalent to:

```js
{
  schema: 'mar',
  createSchema: false,
  migrate: false,
  schedule: false,
}
```

Run; expected FAIL before bootstrap artifacts exist.

- [ ] **Step 3: Export exact pg-boss 12.26.3 SQL through a supported package surface**

Use the installed package's documented CLI/static SQL utility to export the exact schema/migration SQL for schema `mar`. Do not manually reproduce vendor DDL from GitHub source and do not alter table/function semantics.

Save the exact export as:

```text
vendor/pgboss-12.26.3-mar.sql
```

Record in Evidence the command/API used and SHA-256 of this file.

If the exact installed package cannot export/apply its supported DDL to an existing `mar` schema without unsupported edits, stop with `MATERIAL_REALIZATION_FAILURE`; do not fork pg-boss internals.

- [ ] **Step 4: Create only synthetic owner/RED fixtures**

`schema/dt1-fixtures.sql` must create test-only tables equivalent to:

```sql
CREATE TABLE mar.dt1_owner_job_run (
  id uuid PRIMARY KEY,
  logical_occurrence_key text NOT NULL UNIQUE,
  release_ref text NOT NULL,
  job_revision_ref text NOT NULL,
  admissible boolean NOT NULL DEFAULT true,
  admitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mar.dt1_owner_without_unique (
  id uuid PRIMARY KEY,
  logical_occurrence_key text NOT NULL,
  release_ref text NOT NULL,
  job_revision_ref text NOT NULL,
  admitted_at timestamptz NOT NULL DEFAULT now()
);
```

Do not claim these are final Product table/column names. They exist only for P/R fixtures.

- [ ] **Step 5: Implement scratch DB helpers and bootstrap**

`src/postgres.mjs`:

```js
export async function withTransaction(pool, fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export function asPgBossDb(client) {
  return { executeSql: (text, values = []) => client.query(text, values) }
}
```

`src/pgboss.mjs` constructs pg-boss against the scratch DB with the exact subordinate config and no scheduler.

`bootstrap-db.mjs` must:

```text
DROP/CREATE scratch schema only in the disposable DB
CREATE SCHEMA mar
apply exact vendor SQL
apply dt1 fixture SQL
start pg-boss with migrate=false/schedule=false
create exactly one test queue with retryLimit=0
stop cleanly
```

- [ ] **Step 6: Re-run bootstrap test GREEN**

Expected: exact PG identity recorded, `mar` exists, vendor objects exist, owner fixtures exist, and `boss.start()` succeeds without runtime migrations.

---

### Task 3: Implement the single-transaction owner + queue admission seam

**Files:**
- Create: `spikes/conexus-3l-d/src/owner-fixture.mjs`
- Create: `spikes/conexus-3l-d/src/admission.mjs`
- Modify: `spikes/conexus-3l-d/tests/dt1p-transactional-admission.test.mjs`

**Interfaces:**
- Produces `admitOccurrence({ pool, boss, occurrence })` and owner lookup functions used by P1/P2/P4/P5.

- [ ] **Step 1: Write P1 failing test**

Given one occurrence:

```js
const occurrence = {
  id: randomUUID(),
  logicalOccurrenceKey: 'project-fixture|prod|budget-sync|freshness-001',
  releaseRef: 'release-fixture-r17',
  jobRevisionRef: 'job-fixture-v4',
}
```

call `admitOccurrence`, then query both `mar.dt1_owner_job_run` and the pg-boss queue. Assert one owner row and exactly one queue projection referencing only the owner fixture ID/pins.

- [ ] **Step 2: Implement minimal atomic admission**

The core must follow this order inside `withTransaction`:

```js
const owner = await insertOwner(client, occurrence) // owner UNIQUE is primary fence
const jobId = await boss.send(
  QUEUE_NAME,
  { ownerJobRunId: owner.id },
  { db: asPgBossDb(client), retryLimit: 0 }
)
if (jobId === null) {
  throw new Error('DT1_QUEUE_PROJECTION_NOT_CREATED')
}
return { owner, queueJobId: jobId }
```

Do not derive authorization from `jobId`, queue state, or a queue policy.

- [ ] **Step 3: Run P1 GREEN**

Expected: one transaction commits both facts.

- [ ] **Step 4: Write and run P2 forced-rollback test**

Inject a deterministic failure after `boss.send()` but before COMMIT. Expected after rollback:

```text
owner rows for key = 0
queue rows for projection = 0
```

This proves transaction rollback, not merely cleanup-after-failure.

---

### Task 4: Prove fresh-process rediscovery after commit (P3)

**Files:**
- Create: `spikes/conexus-3l-d/scripts/fresh-process-read.mjs`
- Modify: `spikes/conexus-3l-d/tests/dt1p-transactional-admission.test.mjs`

**Interfaces:**
- `fresh-process-read.mjs <owner-id>` opens a new Node process/new PG pool and prints JSON with owner + queue projection facts.

- [ ] **Step 1: Write P3 test using a child process**

After a successful `admitOccurrence`, dispose the original pg-boss/pool objects. Spawn:

```bash
node scripts/fresh-process-read.mjs <owner-id>
```

The child must create new connections and must not receive in-memory owner/queue objects.

- [ ] **Step 2: Implement the fresh-process reader**

Query owner state and the pg-boss projection from PostgreSQL, emit one JSON object, close all handles.

- [ ] **Step 3: Verify P3 GREEN**

Expected child JSON proves both committed facts are independently discoverable after the original process state is gone.

---

### Task 5: Prove owner-side concurrency fencing and exact losing behavior (P4)

**Files:**
- Modify: `spikes/conexus-3l-d/tests/dt1p-transactional-admission.test.mjs`
- Modify: `spikes/conexus-3l-d/src/admission.mjs` only if the test exposes a config/API-local defect.

**Interfaces:**
- Same `admitOccurrence` called concurrently through independent connections.

- [ ] **Step 1: Write the concurrency test**

Launch two admissions for the same `logicalOccurrenceKey` but distinct synthetic row IDs from two independent transactions using `Promise.allSettled`.

Assert after settlement:

```text
committed owner rows for key = 1
queue projections for the winning owner = 1
successful admissions = 1
losing admission = rejected/fail-closed
```

Capture the loser's exact PostgreSQL `code`, constraint name where available, and library error shape into test output for Evidence.

- [ ] **Step 2: Run P4**

Do not change the owner UNIQUE constraint to make the library “win” the race. Owner uniqueness is the protected fence.

Expected: exactly one committed logical occurrence; losing transaction does not commit an owner-only orphan or second projection.

---

### Task 6: Prove queue delivery cannot authorize physical work (P5 + R3)

**Files:**
- Create: `spikes/conexus-3l-d/src/worker-guard.mjs`
- Modify: `spikes/conexus-3l-d/tests/dt1p-transactional-admission.test.mjs`

**Interfaces:**
- Produces `unguardedHandler(job, canary)` for RED only and `guardedHandler(job, canary, ownerReader)` for the accepted path.

- [ ] **Step 1: Implement an in-memory physical-effect canary**

Use no network/filesystem/ERP effect. Example:

```js
export function createEffectCanary() {
  let count = 0
  return {
    fire() { count += 1 },
    count() { return count },
  }
}
```

- [ ] **Step 2: Write R3 negative control first**

Inject a queue job referencing a nonexistent or `admissible=false` owner fixture. Run the explicitly RED-only unguarded handler and assert `canary.count() === 1`.

This demonstrates the failure class; never report this RED fixture as acceptable Product behavior.

- [ ] **Step 3: Implement the guarded handler**

Before `canary.fire()`, it must resolve the owner fixture by `ownerJobRunId` and require current synthetic admissibility. Missing/revoked owner returns a refused result and leaves the canary untouched.

- [ ] **Step 4: Run P5 GREEN**

Against the same invalid queue job, assert:

```text
owner admissible = false/missing
canary count = 0
worker result = refused before effect
```

This proves queue row existence is subordinate mechanics, not current execution authority.

---

### Task 7: Fire R1 and R2 negative controls without changing the accepted path

**Files:**
- Modify: `spikes/conexus-3l-d/tests/dt1p-transactional-admission.test.mjs`

**Interfaces:**
- Uses deliberately defective fixture paths only; they must not be callable from `admitOccurrence`.

- [ ] **Step 1: R1 — reproduce the persist→enqueue lost window**

In a RED-only fixture:

```text
transaction A: INSERT synthetic owner row → COMMIT
simulate process stop/throw before any boss.send()
fresh read: owner exists, queue projection absent
```

Assert the orphan state is reachable. Do not “repair” it inside R1; the purpose is to falsify the split-commit design.

- [ ] **Step 2: R2 — reproduce duplicate logical admission without the owner fence**

Use `mar.dt1_owner_without_unique`, not the accepted owner table. Two independent transactions insert the same logical key. Assert two committed rows exist. No Product schema constraint is modified.

- [ ] **Step 3: Re-run the accepted P1/P2/P4 path after RED controls**

Expected: RED controls fire only in defective fixtures; accepted `mar.dt1_owner_job_run` path remains one-owner/one-projection and rollback-safe.

---

### Task 8: Produce deterministic deciding Evidence and an admissible verdict

**Files:**
- Create: `spikes/conexus-3l-d/scripts/run-dt1p.mjs`
- Create: `spikes/conexus-3l-d/scripts/validate-admission.mjs`
- Generate: `spikes/conexus-3l-d/evidence/dt1p.json`

**Interfaces:**
- `run-dt1p.mjs` orchestrates the exact test/evidence sequence and writes JSON.
- `validate-admission.mjs` independently recomputes whether the evidence supports one allowed verdict.

- [ ] **Step 1: Implement Evidence schema in the orchestrator**

The generated JSON must include at least:

```json
{
  "probe": "DT-1' — Transactional Managed-Occurrence Admission",
  "authority": "docs/conexus/phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md",
  "repoHead": "<exact sha at execution>",
  "node": "24.18.0",
  "postgres": {
    "required": "17.10",
    "serverVersion": "<SELECT version()>",
    "containerRepoDigest": "<actual running image digest>"
  },
  "dependencies": {
    "pg-boss": "12.26.3",
    "pg": "8.22.0",
    "lockSha256": "<sha256>"
  },
  "pgbossRuntime": {
    "schema": "mar",
    "createSchema": false,
    "migrate": false,
    "schedule": false,
    "retryLimit": 0
  },
  "green": {},
  "red": {},
  "externalCalls": {
    "provider": 0,
    "model": 0,
    "e2b": 0,
    "sankhya": 0,
    "realEffects": 0
  },
  "verdict": "<allowed verdict>"
}
```

Each P/R entry carries `PASS|FAIL|NOT_PROVEN`, exact observations and error/SQLSTATE data where relevant.

- [ ] **Step 2: Implement fail-closed verdict calculation**

`QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION` is allowed only if:

```text
P1..P6 = PASS
R1..R3 = PASS (failure class successfully demonstrated and accepted path blocks it)
all external call counters = 0
pins/lock/PG identity valid
no prohibited surface observed
```

Otherwise choose only the narrowest truthful allowed result:

```text
NARROW_RECONCILIATION_REQUIRED
PG_BOSS_REJECTED_FOR_CURRENT_F1
NOT_PROVEN
MATERIAL_REALIZATION_FAILURE
```

The script must never upgrade missing Evidence to PASS.

- [ ] **Step 3: Run the complete spike verification**

```bash
cd spikes/conexus-3l-d
npm run verify
```

Expected: tests and admission validator agree with the generated Evidence.

- [ ] **Step 4: Run repository verification**

From repo root:

```bash
npm run verify
```

Expected: PASS. If repository verification fails for a reason introduced by the spike, fix only the bounded spike defect and rerun. If it exposes an authority contradiction, stop with a Finding.

- [ ] **Step 5: Inspect scope before any Git action**

```bash
git status --short
git diff -- spikes/conexus-3l-d
```

Expected modified/untracked scope: only the explicitly authorized Package-D spike/evidence files. Do **not** stage, commit or push without separate operator authorization.

---

### Task 9: Return Evidence for Architecture-Lead adjudication; do not auto-close Package D

**Files:**
- No additional file is required unless the existing evidence validator itself found a defect.

**Interfaces:**
- Consumes `evidence/dt1p.json` + test logs + exact lock/image identity.
- Produces an operator/Architecture-Lead review packet, not a new Product decision.

- [ ] **Step 1: Report exact executor identity and evidence result**

Return:

```text
repo HEAD used
working-tree scope
package-lock SHA-256
pg-boss / pg / Node pins
PostgreSQL actual version + image digest
P1..P6 results
R1..R3 results
external call counters
proposed allowed verdict
all residual Unknown/Deferred facts
```

- [ ] **Step 2: Stop**

Do not update `docs/conexus/current/README.md`, `LEDGER.md`, `3L-R2`, Package-D status, C-018, or PR state from executor inference. The Architecture Lead adjudicates Evidence against current authority first; the operator controls any subsequent ratification/Git publication.

---

## Plan Self-Review Checklist

The Architecture Lead checked this plan against `3L-R2` before filing it:

```text
P1..P6 represented                          = YES
R1..R3 represented                          = YES
real external effects excluded              = YES
Mastra/Package E excluded                    = YES
cron/startAfter/future JobRun excluded       = YES
existing mar schema required                 = YES
vendor DDL externally managed                = YES
same-transaction adapter explicit            = YES
owner uniqueness primary fence               = YES
send(null) fail-closed                        = YES
fresh-process proof explicit                  = YES
race losing behavior recorded                 = YES
queue-not-authority RED→GREEN control          = YES
lock + PG physical identity evidence           = YES
RUNNING-orphan/full Product recovery excluded  = YES
Git mutation requires separate authorization   = YES
Product implementation authorization           = NO
DT-1' execution authorization from this plan   = NO
```

## Execution Handoff

This plan is intentionally filed before execution. Current next gate:

> **Operator reviews `3L-R2` + this Codex plan and explicitly authorizes DT-1' execution.**

Only after that authorization should Codex start at Task 1. After the probe, Codex returns Evidence and stops; Package D does not close by executor self-assertion.

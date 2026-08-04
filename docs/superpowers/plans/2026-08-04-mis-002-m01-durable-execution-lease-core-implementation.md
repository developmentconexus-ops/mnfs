---
id: PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
title: MIS-002 M01 Durable Execution and Lease Core Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: current
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-MIS-002-M01-R5-APPROVAL
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - REVIEW-MIS-002-M01-R5-FINAL
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - CAP-EXECUTION
  - ACCEPTANCE-M2-UNBLOCK
tracking_issue: 16
last_reviewed: 2026-08-04
---

# MIS-002 M01 Durable Execution and Lease Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the accepted `MIS-002/M01` durable execution, independent source, Treehouse Lease, Claim and read-only Recovery foundation without launching Pi or implementing M02 acceptance behavior.

**Architecture:** SQLite remains the sole semantic authority through one `SqliteStore` connection and focused stores sharing a bounded transaction object. Each Attempt receives an independent Linux-local Git source at its exact base commit; Treehouse 2.1.1 operates only inside that no-origin controlled-HOME boundary. External grant and release actions use durable intent, a token-bound `LeaseActionRunner`, fresh Treehouse/Git observations and fenced semantic commits.

**Tech Stack:** Node.js 24.18.0+, TypeScript 5.9 with strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes, `node:sqlite`, `node:test`, Git CLI, Treehouse 2.1.1, Ubuntu WSL2, canonical JSON and SHA-256.

## Global Constraints

- Govern all work by approved MIS-002 revision 5: `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`.
- Implement exactly `CAP-EXEC-REQ-001`, `002`, `004`, `005`, `006`, `007` and `008`; do not pull M02 requirements into M01.
- Preserve accepted microdesign `DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE` version `0.6.1`.
- Keep one `DatabaseSync` connection and one transaction authority per command; focused stores may not open databases.
- Use `BEGIN IMMEDIATE`, bounded `SQLITE_BUSY` retry and optimistic row versions; never loop indefinitely.
- Every semantic mutation and matching versioned Domain Event commits in the same SQLite transaction.
- Never perform Git, filesystem scans, Treehouse actions, process waits or model calls inside a domain transaction.
- The canonical checkout is read-only and is never Treehouse cwd.
- Every Attempt source is Linux-owned, independent, exact-base, no-origin, no-alternates, no shared common directory and no hardlinked canonical object.
- Treehouse execution requires candidate SHA-256 `c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3`, semantic version `2.1.1`, accepted capabilities and accepted command shapes.
- Treehouse receives controlled HOME/XDG/config/hooks, Linux-only PATH, disabled global/system Git configuration, closed stdin, bounded output, timeout and `shell: false`.
- Never use Treehouse force, destroy, broad prune, human stderr as state or a direct Git fallback in the same Lease operation.
- A `LeaseActionRunner` STARTED grant with inconclusive outcome never causes an automatic second `treehouse get`.
- Dirty, ambiguous, stale, escaped, duplicate or unclassified work is preserved and blocks destructive action.
- Plain `mnfs recover` is byte-for-byte non-mutating for SQLite, sources, worktrees, Treehouse state and helper state.
- M01 may create only Claim `OPEN`; completion, Receipt, Gate and acceptance belong to M02.
- Pi launch, production SEC-E1 creation, Authority Snapshot, Writer Pack, Integration, QA and delivery remain prohibited.
- Real Treehouse commands run only after all deterministic gates pass and only from an explicit canonical WSL2 acceptance task.
- Keep PR #17 draft and unmerged. Automatic merge is not authorized.

---

## Target File Set

### New production files

```text
src/execution/ids.ts
src/execution/model.ts
src/execution/transitions.ts
src/store/sqlite-transaction.ts
src/store/sqlite-maintenance.ts
src/store/event-store.ts
src/store/execution-store.ts
src/adapters/process-identity.ts
src/adapters/git-worktree.ts
src/adapters/execution-source.ts
src/adapters/treehouse.ts
src/runtime/durable-artifact.ts
src/runtime/lease-action-protocol.ts
src/runtime/lease-action-runner.ts
src/runtime/lease-action-entry.ts
src/services/execution-service.ts
src/services/claim-service.ts
src/services/lease-service.ts
src/services/recovery-service.ts
bin/mnfs-lease-action.mjs
```

### New tests

```text
tests/execution/ids.test.ts
tests/execution/transitions.test.ts
tests/store/sqlite-transaction.test.ts
tests/store/sqlite-maintenance.test.ts
tests/store/migration-v4.test.ts
tests/store/execution-store.test.ts
tests/adapters/process-identity.test.ts
tests/adapters/git-worktree.test.ts
tests/adapters/execution-source.test.ts
tests/adapters/treehouse.test.ts
tests/runtime/durable-artifact.test.ts
tests/runtime/lease-action-protocol.test.ts
tests/runtime/lease-action-runner.test.ts
tests/services/execution-service.test.ts
tests/services/claim-service.test.ts
tests/services/lease-service-grant.test.ts
tests/services/lease-service-release.test.ts
tests/services/recovery-service.test.ts
tests/cli/execution-args.test.ts
tests/cli/execution-main.test.ts
tests/integration/m01-fresh-process.test.ts
tests/integration/m01-composition.test.ts
```

### Existing files modified

```text
package.json
src/domain/errors.ts
src/domain/types.ts
src/store/migrations.ts
src/store/sqlite-store.ts
src/runtime/paths.ts
src/cli/args.ts
src/cli/main.ts
src/cli/entry.ts
tests/store/sqlite-store.test.ts
tests/cli/args.test.ts
tests/cli/main.test.ts
docs/DOCUMENTATION-MAP.md
docs/tracking/STATUS.md
docs/tracking/WORKLOG.md
```

---

## Frozen Public Types

The tasks may split implementation details, but these public shapes remain stable unless a reviewed plan revision changes them.

```ts
export type WriteTrackId = `WT-${string}`;
export type AttemptId = `${WriteTrackId}/A${string}`;
export type WorkerRunId = `${AttemptId}/WR${string}`;
export type ClaimId = `${AttemptId}/CLM${string}`;
export type LeaseId = `LSE-${string}`;

export type WriteTrackStatus = 'ACTIVE' | 'CLAIMED' | 'ABANDONED';
export type AttemptStatus = 'OPEN' | 'SUPERSEDED' | 'CLOSED' | 'CANCELLED';
export type SourceStatus = 'REQUESTED' | 'READY' | 'DIVERGED';
export type WorkerRunStatus = 'STARTING' | 'RUNNING' | 'IDLE' | 'EXITED' | 'LOST' | 'CANCELLED';
export type ClaimStatus = 'OPEN';
export type LeaseStatus = 'REQUESTED' | 'ACTIVE' | 'RELEASE_PENDING' | 'RELEASED' | 'DIVERGED';
export type LeaseActionKind = 'GRANT' | 'RELEASE';
export type LeaseActionPhase = 'CLAIMED' | 'STARTED' | 'FINISHED';
export type GitObjectFormat = 'sha1' | 'sha256';

export interface ProcessIdentity {
  readonly bootId: string;
  readonly pid: number;
  readonly startTicks: string;
}
```

```ts
export interface OpenWriteTrackInput {
  readonly missionId: 'MIS-002';
  readonly milestoneQualifiedId: 'MIS-002/M01';
  readonly featureQualifiedId: string;
  readonly contractHash: string;
  readonly baseCommitSha: string;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

export interface GrantLeaseInput {
  readonly trackId: WriteTrackId;
  readonly expectedTrackVersion: number;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

export interface ReleaseLeaseInput {
  readonly leaseId: LeaseId;
  readonly expectedVersion: number;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

export interface OpenClaimInput {
  readonly trackId: WriteTrackId;
  readonly attemptId: AttemptId;
  readonly workerRunId: WorkerRunId;
  readonly leaseId: LeaseId;
  readonly expectedTrackVersion: number;
  readonly expectedAttemptVersion: number;
  readonly expectedRunVersion: number;
  readonly expectedLeaseVersion: number;
  readonly idempotencyKey: string;
  readonly baseCommitSha: string;
  readonly resultTreeSha: string;
  readonly claimedCriterionIds: readonly string[];
  readonly occurredAt: string;
}
```

---

### Task 1: Domain identities, models, transitions and error vocabulary

**Files:**
- Create: `src/execution/ids.ts`
- Create: `src/execution/model.ts`
- Create: `src/execution/transitions.ts`
- Modify: `src/domain/errors.ts`
- Test: `tests/execution/ids.test.ts`
- Test: `tests/execution/transitions.test.ts`

**Interfaces:**
- Consumes: accepted type shapes and lifecycle states from microdesign 0.6.1.
- Produces: branded string validators, immutable entity interfaces, transition guards and complete stable M01 error codes.

- [ ] **Step 1: Write identity RED tests**

```ts
test('allocates stable parent-relative execution identities', () => {
  assert.equal(formatWriteTrackId(1), 'WT-001');
  assert.equal(formatAttemptId('WT-001', 1), 'WT-001/A01');
  assert.equal(formatWorkerRunId('WT-001/A01', 2), 'WT-001/A01/WR02');
  assert.equal(formatClaimId('WT-001/A01', 3), 'WT-001/A01/CLM03');
  assert.equal(formatLeaseId(7), 'LSE-007');
});

test('rejects malformed and cross-parent identities', () => {
  assert.throws(() => requireAttemptId('A01'));
  assert.throws(() => requireWorkerRunId('WT-002/A01/WR01', 'WT-001/A01'));
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
npm run build --silent && node --test dist/tests/execution/ids.test.js
```

Expected: FAIL because `src/execution/ids.ts` does not exist.

- [ ] **Step 3: Implement exact ID formatting and validation**

```ts
const WRITE_TRACK = /^WT-(\d{3,})$/;
const ATTEMPT = /^(WT-\d{3,})\/A(\d{2,})$/;
const WORKER_RUN = /^(WT-\d{3,}\/A\d{2,})\/WR(\d{2,})$/;
const CLAIM = /^(WT-\d{3,}\/A\d{2,})\/CLM(\d{2,})$/;
const LEASE = /^LSE-(\d{3,})$/;

export function formatWriteTrackId(value: number): WriteTrackId {
  return `WT-${String(requirePositiveInteger(value)).padStart(3, '0')}`;
}
```

Implement equivalent exact formatters and parent-aware validators for Attempt, Run, Claim and Lease.

- [ ] **Step 4: Write transition RED tests**

Cover every legal and illegal transition. At minimum:

```ts
assert.equal(requireAttemptTransition('OPEN', 'SUPERSEDED'), 'SUPERSEDED');
assert.throws(() => requireAttemptTransition('SUPERSEDED', 'OPEN'));
assert.equal(requireLeaseTransition('ACTIVE', 'RELEASE_PENDING'), 'RELEASE_PENDING');
assert.throws(() => requireLeaseTransition('DIVERGED', 'ACTIVE'));
```

- [ ] **Step 5: Implement immutable entity interfaces and transition tables**

Use literal transition maps:

```ts
const ATTEMPT_TRANSITIONS = {
  OPEN: new Set(['SUPERSEDED', 'CLOSED', 'CANCELLED']),
  SUPERSEDED: new Set(),
  CLOSED: new Set(),
  CANCELLED: new Set(),
} as const;
```

Model every persisted timestamp and version explicitly; do not use `Date` objects in domain entities.

- [ ] **Step 6: Add all accepted M01 error codes**

Extend `MnfsErrorCode` with the exact codes listed in microdesign section 18. Give usage errors exit code 2 only at the parser boundary; domain failures remain exit code 1.

- [ ] **Step 7: Run focused and root tests**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/execution/ids.test.js dist/tests/execution/transitions.test.js
npm run test:unit
```

Expected: PASS with all pre-M01 tests unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/execution src/domain/errors.ts tests/execution
git commit -m "feat: define M01 execution domain"
```

---

### Task 2: Shared SQLite transaction and versioned Event boundary

**Files:**
- Create: `src/store/sqlite-transaction.ts`
- Create: `src/store/event-store.ts`
- Modify: `src/store/sqlite-store.ts`
- Modify: `src/domain/types.ts`
- Test: `tests/store/sqlite-transaction.test.ts`
- Modify: `tests/store/sqlite-store.test.ts`

**Interfaces:**
- Consumes: one existing `DatabaseSync` opened by `SqliteStore`.
- Produces: `SqliteTransaction.run<T>()`, bounded busy retry, `EventStore.append()` and version-aware Event reads without opening another connection.

- [ ] **Step 1: Write RED for one shared connection and rollback**

```ts
test('focused stores share one transaction and roll back state plus event', () => {
  const harness = openStoreHarness();
  assert.throws(() => harness.transaction.run(() => {
    harness.database.prepare("INSERT INTO missions ...").run(...);
    harness.events.append(invalidDuplicateEvent);
  }));
  assert.equal(harness.database.prepare('SELECT count(*) AS n FROM missions').get().n, 0);
});
```

- [ ] **Step 2: Run RED**

```bash
npm run build --silent && node --test dist/tests/store/sqlite-transaction.test.js
```

Expected: FAIL because transaction and Event stores do not exist.

- [ ] **Step 3: Implement bounded `SqliteTransaction`**

```ts
export interface SqliteTransactionOptions {
  readonly maxBusyAttempts: number;
  readonly sleep: (milliseconds: number) => void;
}

export class SqliteTransaction {
  constructor(readonly database: DatabaseSync, readonly options: SqliteTransactionOptions) {}

  run<T>(operation: () => T): T {
    // BEGIN IMMEDIATE; retry only SQLITE_BUSY before operation execution;
    // COMMIT on success; ROLLBACK on failure; never retry user code after it started.
  }
}
```

Use deterministic test sleeps and a production synchronous sleep implemented with `Atomics.wait` on a private `SharedArrayBuffer`. Retry delays are exactly `5`, `10`, `20` milliseconds and then `CONCURRENCY_CONFLICT`.

- [ ] **Step 4: Implement `EventStore` with payload version**

```ts
export interface AppendEventInput {
  readonly eventId: string;
  readonly type: MissionEvent['type'];
  readonly payloadSchemaVersion: number;
  readonly missionId: string;
  readonly occurredAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
}
```

Insert canonical JSON and expose `listEvents()` including `payloadSchemaVersion`.

- [ ] **Step 5: Refactor existing mission/plan operations**

Replace `SqliteStore.#transaction` and direct Event SQL with the shared transaction and Event store. Keep existing public methods and output shapes except that `MissionEvent` now includes `payloadSchemaVersion: 1`.

- [ ] **Step 6: Verify old behavior and pre-v4 compatibility fixture**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/sqlite-transaction.test.js dist/tests/store/sqlite-store.test.js
npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git add src/store/sqlite-transaction.ts src/store/event-store.ts src/store/sqlite-store.ts src/domain/types.ts tests/store
git commit -m "refactor: centralize SQLite transactions and events"
```

---

### Task 3: Migration maintenance gate, consistent backup and schema-version fencing

**Files:**
- Create: `src/store/sqlite-maintenance.ts`
- Modify: `src/store/migrations.ts`
- Modify: `src/store/sqlite-store.ts`
- Test: `tests/store/sqlite-maintenance.test.ts`

**Interfaces:**
- Consumes: database path, open `DatabaseSync`, supported schema version `4`.
- Produces: maintenance lock, consistent backup metadata, ordered/gap-free version validation and read/write mode gates.

- [ ] **Step 1: Write maintenance RED tests**

Prove:

```ts
await createVerifiedBackup({ source, destination, expectedUserVersion: 3 });
assert.equal(openBackup(destination).integrityCheck, 'ok');
assert.throws(() => assertSupportedSchema({ applied: [1, 3], userVersion: 3, write: true }));
assert.throws(() => assertSupportedSchema({ applied: [1, 2, 3, 4, 5], userVersion: 5, write: true }));
```

Also start a second maintenance acquisition against the same database path and expect `SCHEMA_MIGRATION_INVALID` without mutation.

- [ ] **Step 2: Run RED**

```bash
npm run build --silent && node --test dist/tests/store/sqlite-maintenance.test.js
```

- [ ] **Step 3: Implement maintenance lock**

Use an exclusive lock file beside the database:

```text
<database>.maintenance.lock
```

Create with `openSync(path, 'wx', 0o600)`, write canonical owner metadata, fsync file and directory, and remove only when the same process identity owns it. An existing or malformed lock blocks; no age-only stealing.

- [ ] **Step 4: Implement verified `node:sqlite backup()` flow**

```ts
export async function createVerifiedBackup(input: {
  readonly source: DatabaseSync;
  readonly sourcePath: string;
  readonly destinationPath: string;
}): Promise<BackupEvidence>;
```

After `backup()`: fsync destination, reopen it, require `PRAGMA integrity_check = ok`, record SHA-256, size, user version, migration rows, mission/plan/event counts and exact approved contract hashes.

- [ ] **Step 5: Implement schema support checks**

Require applied versions to equal `[1, 2, 3]` before migration or `[1, 2, 3, 4]` after. Read mode may open an equal supported schema only; write mode rejects anything newer or gapful.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/sqlite-maintenance.test.js
npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git add src/store/sqlite-maintenance.ts src/store/migrations.ts src/store/sqlite-store.ts tests/store/sqlite-maintenance.test.ts
git commit -m "feat: add migration maintenance and backup gate"
```

---

### Task 4: Migration v4 Events rebuild and execution schema

**Files:**
- Modify: `src/store/migrations.ts`
- Test: `tests/store/migration-v4.test.ts`
- Modify: `tests/store/sqlite-store.test.ts`

**Interfaces:**
- Consumes: v3 database under maintenance gate and verified backup.
- Produces: schema v4, payload-versioned Events, execution tables/indexes/FKs, migration row 4 and `user_version = 4`.

- [ ] **Step 1: Write RED fixtures**

Create four input databases:

```text
empty new database
M0 database with MISSION_OPENED
M1/v3 database with plan revisions and approvals
exact MIS-002 revision-5 database preserving revision 3 history
```

Assert migration preserves Event IDs, seq, payload bytes, timestamps, mission rows, every plan revision and approved hashes.

- [ ] **Step 2: Write schema and downgrade RED tests**

Require tables/indexes/FKs from microdesign section 9. Open a copied v4 database with a compiled pre-v4 insert helper and prove its mission mutation rolls back because the required Event payload version is absent.

- [ ] **Step 3: Run RED**

```bash
npm run build --silent && node --test dist/tests/store/migration-v4.test.js
```

- [ ] **Step 4: Implement the generalized Events rebuild**

Use `events_v4`; never rename the old table first. Copy with literal payload version `1`, verify counts/hashes/seq bounds, drop old table, rename, recreate indexes, run `foreign_key_check` and `integrity_check`, then write migration 4 and user version.

- [ ] **Step 5: Create execution tables and constraints**

Implement the accepted columns, state checks, unique parent tuples and partial indexes exactly. Include:

```sql
UNIQUE(id, write_track_id, contract_hash)
UNIQUE(id, attempt_id, contract_hash)
UNIQUE(id, attempt_id, write_track_id, contract_hash)
```

and the Claim ancestry FKs from microdesign 0.6.1.

- [ ] **Step 6: Prove transaction rollback**

Inject a failure after `events_v4` population and require the original v3 schema/data to remain intact and migration 4 absent.

- [ ] **Step 7: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/migration-v4.test.js dist/tests/store/sqlite-store.test.js
npm run verify
```

- [ ] **Step 8: Commit**

```bash
git add src/store/migrations.ts tests/store/migration-v4.test.ts tests/store/sqlite-store.test.ts
git commit -m "feat: add M01 schema migration v4"
```

---

### Task 5: ExecutionStore relational persistence and idempotency

**Files:**
- Create: `src/store/execution-store.ts`
- Modify: `src/store/sqlite-store.ts`
- Test: `tests/store/execution-store.test.ts`

**Interfaces:**
- Consumes: shared `DatabaseSync`, `SqliteTransaction`, `EventStore`, accepted domain models.
- Produces: transaction-scoped insert/load/CAS primitives; no external adapter calls and no independent transaction ownership.

- [ ] **Step 1: Write RED for sequence allocation and relational invariants**

Prove sequential `WT-001`, `LSE-001`, parent-relative ordinals and unique current rows. Insert deliberate cross-Track and cross-Attempt Claim references through SQL and require FK failure.

- [ ] **Step 2: Write RED for idempotency**

```ts
assert.deepEqual(store.insertClaim(first), store.insertClaim(first));
assert.throws(() => store.insertClaim({ ...first, resultTreeSha: otherTree }), {
  code: 'CLAIM_IDEMPOTENCY_CONFLICT',
});
```

Cover grant and release key/input pairs equivalently.

- [ ] **Step 3: Implement row codecs and exact queries**

Create private row converters that validate enum fields and nullable state combinations. A malformed persisted row throws `INTERNAL_ERROR`; it is never silently coerced.

- [ ] **Step 4: Implement CAS methods**

Each mutable update includes `WHERE id = ? AND version = ?` and increments the version. Zero changed rows throws `CONCURRENCY_CONFLICT`.

- [ ] **Step 5: Integrate into `SqliteStore` composition root**

Expose focused stores through service construction, not public raw database access:

```ts
store.execution
store.events
store.transaction
```

Keep fields readonly and connection-owned by `SqliteStore`.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/execution-store.test.js
npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git add src/store/execution-store.ts src/store/sqlite-store.ts tests/store/execution-store.test.ts
git commit -m "feat: persist M01 execution entities"
```

---

### Task 6: ExecutionService Track, Attempt and Worker Run lifecycle

**Files:**
- Create: `src/services/execution-service.ts`
- Test: `tests/services/execution-service.test.ts`

**Interfaces:**
- Consumes: approved plan lookup, Git base observation interface, ExecutionStore and EventStore.
- Produces: `openWriteTrack`, `replaceWorkerRun`, `supersedeAttempt`, `abandonWriteTrack`, `getWriteTrack`.

- [ ] **Step 1: Write RED for exact contract and target binding**

Reject:

```text
non-latest approved contract hash
unknown Mission/Milestone/Feature
Feature outside M01
criterion allocation mismatch
base SHA not a commit
```

- [ ] **Step 2: Write RED for atomic Track + Attempt**

`openWriteTrack` creates Track, A01, `WRITE_TRACK_OPENED`, `ATTEMPT_OPENED` in one transaction. Inject duplicate Event ID and prove no Track or Attempt remains.

- [ ] **Step 3: Implement `openWriteTrack`**

Canonical input hash includes mission, milestone, feature, contract, object format and base commit. Repeating same key/input returns the existing lineage; different input conflicts.

- [ ] **Step 4: Implement atomic Run replacement**

```ts
replaceWorkerRun({ attemptId, expectedAttemptVersion, previousRunDisposition, occurredAt })
```

If a current Run exists, terminalize it and insert the next ordinal with two Events in one transaction. A stale expected version changes nothing.

- [ ] **Step 5: Implement Attempt supersession and Track abandonment guards**

Supersession requires no current Run, Claim or Lease and source/worktree observations classified clean/preserved. Abandonment requires the accepted guards and preserved Evidence.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/execution-service.test.js
npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git add src/services/execution-service.ts tests/services/execution-service.test.ts
git commit -m "feat: add execution lifecycle service"
```

---

### Task 7: Linux process identity and read-only Git observation

**Files:**
- Create: `src/adapters/process-identity.ts`
- Create: `src/adapters/git-worktree.ts`
- Test: `tests/adapters/process-identity.test.ts`
- Test: `tests/adapters/git-worktree.test.ts`

**Interfaces:**
- Produces: exact boot/PID/start-ticks observation and strict read-only Git/source/worktree snapshots.

- [ ] **Step 1: Write process identity RED tests**

Use `/proc` fixture files to prove parsing of `/proc/sys/kernel/random/boot_id` and field 22 of `/proc/<pid>/stat`, including process names containing spaces and parentheses. PID reuse with different start ticks must compare unequal.

- [ ] **Step 2: Implement `ProcessIdentityInspector`**

```ts
export interface ProcessIdentityInspector {
  current(): ProcessIdentity;
  observe(pid: number): ProcessIdentity | undefined;
  equals(left: ProcessIdentity, right: ProcessIdentity): boolean;
}
```

Reject non-Linux and mounted control paths with typed errors.

- [ ] **Step 3: Write Git observation RED tests**

Prove exact commands only, NUL-delimited status parsing, duplicate worktree/path rejection, SHA/object type validation and canonical snapshots. Add a spy test that fails if `write-tree`, fetch, checkout, reset, clean, commit or ref mutation is requested.

- [ ] **Step 4: Implement strict Git runner boundary**

Use `spawn` argument arrays, controlled env, closed stdin, bounds/timeouts and raw bytes. Provide:

```ts
observeRepository(path)
observeWorktrees(sourcePath)
requireCommit(sourcePath, sha)
requireTree(sourcePath, sha)
```

- [ ] **Step 5: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/adapters/process-identity.test.js dist/tests/adapters/git-worktree.test.js
npm run test:unit
```

- [ ] **Step 6: Commit**

```bash
git add src/adapters/process-identity.ts src/adapters/git-worktree.ts tests/adapters
git commit -m "feat: add trusted process and Git observation"
```

---

### Task 8: Attempt-owned independent execution source

**Files:**
- Create: `src/adapters/execution-source.ts`
- Modify: `src/runtime/paths.ts`
- Test: `tests/adapters/execution-source.test.ts`

**Interfaces:**
- Consumes: canonical checkout, Attempt identity/base/object format, Git observer, runtime root.
- Produces: `ExecutionSourceObservation` with READY fingerprint or typed divergence; never calls Treehouse.

- [ ] **Step 1: Add safe path derivation RED tests**

```ts
resolveExecutionSourceRoot(runtimeRoot, 'WT-001/A01')
// => <runtimeRoot>/execution-sources/WT-001/A01/source
```

Reject malformed IDs, `/mnt`, symlink escapes and an existing unrecognized final path.

- [ ] **Step 2: Write network-off materialization RED test**

Create a canonical repo with an `origin` pointing to an executable trap. Run source preparation with credential helper and network proxy traps. Require success without invoking any trap.

- [ ] **Step 3: Implement local independent transfer**

Use an explicit local Git command sequence that copies objects, never shares them. One acceptable frozen sequence is:

```text
git clone --no-hardlinks --no-checkout --no-local <canonical-path> <temp-path>
git -C <temp-path> remote remove origin
git -C <temp-path> checkout -B main <base-sha>
```

Before accepting this sequence in code, the tests must prove no alternates, no shared common dir and no canonical/temp object inode equality. If the installed Git does not satisfy the proof, fail and revise the plan rather than weakening the checks.

- [ ] **Step 4: Implement controlled config and fingerprint**

Set empty hooks path, remove remotes, verify object format/base/tree/status/config, hash the canonical observation and source observation into one canonical fingerprint, then atomically rename temp to final.

- [ ] **Step 5: Implement crash recovery cases**

Recognized temp metadata contains Track, Attempt, contract, base and nonce. Only matching incomplete temp may be removed. Matching complete final commits READY; conflict marks DIVERGED and preserves.

- [ ] **Step 6: Prove canonical checkout unchanged and object independence**

Snapshot Git/config/filesystem before and after. Sample every loose object and all pack/index files; matching inode/device with canonical storage fails `EXECUTION_SOURCE_SHARED_OBJECTS`.

- [ ] **Step 7: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/adapters/execution-source.test.js
npm run test:unit
```

- [ ] **Step 8: Commit**

```bash
git add src/adapters/execution-source.ts src/runtime/paths.ts tests/adapters/execution-source.test.ts
git commit -m "feat: materialize independent Attempt sources"
```

---

### Task 9: Production Treehouse adapter inside the accepted TC-01 boundary

**Files:**
- Create: `src/adapters/treehouse.ts`
- Test: `tests/adapters/treehouse.test.ts`

**Interfaces:**
- Consumes: READY source, Attempt-owned HOME/XDG/pool/hooks, exact candidate provenance.
- Produces: strict acquisition/status/release observations; no semantic decisions.

- [ ] **Step 1: Port strict parser RED tests from TC-01**

Rewrite as production TypeScript tests. Cover invalid UTF-8, extra JSON, duplicate paths, mismatched holder/ID, non-zero exit, mounted/escaped paths and contaminated output.

- [ ] **Step 2: Write freshness RED tests**

Any change in executable bytes, version, capabilities, Git, Node, WSL identity, env shape or command shape must fail before the protected command.

- [ ] **Step 3: Implement candidate discovery and controlled environment**

Use exact semantic version `2.1.1`, accepted SHA, capability inspection and generated Treehouse config. The environment is constructed from an allowlist and contains no inherited HOME, XDG, credentials, proxy or arbitrary variable.

- [ ] **Step 4: Implement exact operations**

```ts
acquire({ sourcePath, holder, controlPaths }): Promise<TreehouseLeaseObservation>
status({ sourcePath, controlPaths }): Promise<readonly TreehouseStatusItem[]>
release({ sourcePath, worktreePath, leaseId, holder, controlPaths }): Promise<ProcessObservation>
```

Release process output remains advisory until status/Git observation.

- [ ] **Step 5: Static anti-pattern test**

Read `src/adapters/treehouse.ts` and fail on `--force`, `destroy`, `prune`, `shell: true`, `exec(`, broad `process.env` spread or stderr regex classification.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/adapters/treehouse.test.js
npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git add src/adapters/treehouse.ts tests/adapters/treehouse.test.ts
git commit -m "feat: add production Treehouse adapter"
```

---

### Task 10: Durable Artifact writer and Lease action protocol

**Files:**
- Create: `src/runtime/durable-artifact.ts`
- Create: `src/runtime/lease-action-protocol.ts`
- Test: `tests/runtime/durable-artifact.test.ts`
- Test: `tests/runtime/lease-action-protocol.test.ts`

**Interfaces:**
- Produces: canonical immutable operation files and crash-durable STARTED/FINISHED Artifact readers/writers.

- [ ] **Step 1: Write durability RED test**

Spy on file operations and require:

```text
exclusive temp create
write all bytes
fsync temp
close
rename
fsync parent directory
```

Existing final files are immutable and cause conflict unless bytes/hash exactly match.

- [ ] **Step 2: Define strict operation schema**

```ts
export interface LeaseActionOperation {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly kind: 'GRANT' | 'RELEASE';
  readonly treehouseExecutable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly stdoutLimitBytes: number;
  readonly stderrLimitBytes: number;
  readonly startedPath: string;
  readonly resultPath: string;
}
```

Validate exact action-specific argv and contained Artifact paths. Operation files are mode `0400` after publication.

- [ ] **Step 3: Define STARTED and FINISHED records**

STARTED includes token, process identity, operation SHA and timestamp. FINISHED includes process result metadata plus stdout/stderr Artifact refs and hashes; complete raw outputs remain bounded separate files.

- [ ] **Step 4: Implement strict readers**

Fatal UTF-8, one JSON value, schema validation, canonical path containment, token/hash match and symlink refusal.

- [ ] **Step 5: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/runtime/durable-artifact.test.js dist/tests/runtime/lease-action-protocol.test.js
npm run test:unit
```

- [ ] **Step 6: Commit**

```bash
git add src/runtime/durable-artifact.ts src/runtime/lease-action-protocol.ts tests/runtime
git commit -m "feat: define durable Lease action protocol"
```

---

### Task 11: Trusted LeaseActionRunner executable

**Files:**
- Create: `src/runtime/lease-action-runner.ts`
- Create: `src/runtime/lease-action-entry.ts`
- Create: `bin/mnfs-lease-action.mjs`
- Modify: `package.json`
- Test: `tests/runtime/lease-action-runner.test.ts`

**Interfaces:**
- Consumes: one immutable operation file path.
- Produces: one STARTED record before external invocation and one FINISHED record after; never opens MNFS SQLite.

- [ ] **Step 1: Write RED for STARTED-before-spawn ordering**

Inject a runner whose spawn assertion requires the STARTED file to exist and validate. The test fails if spawn happens first.

- [ ] **Step 2: Write RED for exactly one invocation**

Run the helper twice against the same operation. The second process must detect immutable existing STARTED/FINISHED records and perform zero Treehouse calls.

- [ ] **Step 3: Implement the helper**

```ts
export async function runLeaseAction(operationPath: string, dependencies: RunnerDependencies): Promise<number>;
```

Open operation with no symlink following, validate mode/ownership/containment, write STARTED, spawn one process group with closed stdin and bounds, write stdout/stderr plus FINISHED, return a stable exit class.

- [ ] **Step 4: Implement timeout/process-group termination**

Port the reviewed Linux process-group behavior from TC-01 into focused production code; do not import spike modules. Prove descendants die on timeout.

- [ ] **Step 5: Wire executable**

`bin/mnfs-lease-action.mjs` imports compiled `dist/src/runtime/lease-action-entry.js`. Add a private package script used only by tests; do not add a user-facing CLI command.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/runtime/lease-action-runner.test.js
npm run verify
```

- [ ] **Step 7: Commit**

```bash
git add src/runtime/lease-action-runner.ts src/runtime/lease-action-entry.ts bin/mnfs-lease-action.mjs package.json tests/runtime/lease-action-runner.test.ts
git commit -m "feat: add trusted Lease action runner"
```

---

### Task 12: LeaseService grant Intent–Action–Observation

**Files:**
- Create: `src/services/lease-service.ts`
- Test: `tests/services/lease-service-grant.test.ts`

**Interfaces:**
- Consumes: ExecutionStore, ExecutionSourceAdapter, TreehouseAdapter, Git observer, process inspector, action protocol/spawner.
- Produces: idempotent `grantLease(input): Promise<Lease>`.

- [ ] **Step 1: Write RED crash-window matrix**

Use a table-driven test for:

```text
intent only
claimed token before helper
helper STARTED before Treehouse result
external Lease before semantic commit
semantic commit before response
one exact existing holder match
multiple matches
same key/different input
two concurrent same-key calls
```

Count Treehouse calls; every safe case is exactly 0 or 1, never 2.

- [ ] **Step 2: Implement grant input hash and deterministic holder**

Canonical input binds Track, Attempt, generation, contract, base, source fingerprint, holder, Treehouse candidate and command shape. Holder uses repository identity hash plus Lease/generation and contains only safe characters.

- [ ] **Step 3: Implement intent transaction**

Insert/reuse `REQUESTED` Lease plus `LEASE_REQUESTED`. Same key/input returns current semantic row; conflict fails.

- [ ] **Step 4: Implement observe-before-action**

Fresh status first. One exact matching external Lease validates and commits ACTIVE; duplicates or inconsistent identity become DIVERGED/UNKNOWN without acquisition.

- [ ] **Step 5: Implement token claim and helper launch**

Persist expected paths and owner identity with `LEASE_ACTION_CLAIMED`, publish operation, spawn helper, then observe helper/status/Git. A STARTED inconclusive grant returns `LEASE_ACTION_INCONCLUSIVE` and preserves all state.

- [ ] **Step 6: Implement semantic completion**

Only fresh exact physical observation moves `REQUESTED → ACTIVE`, records external fields and `LEASE_GRANTED`. FINISHED exit code alone never decides success.

- [ ] **Step 7: Prove concurrent at-most-once**

Use two independent `SqliteStore` instances against one database and a barrier around token claim. Assert one external acquisition and one ACTIVE Lease.

- [ ] **Step 8: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/lease-service-grant.test.js
npm run test:unit
```

- [ ] **Step 9: Commit**

```bash
git add src/services/lease-service.ts tests/services/lease-service-grant.test.ts
git commit -m "feat: implement fenced Lease grant"
```

---

### Task 13: LeaseService conditional release and preservation

**Files:**
- Modify: `src/services/lease-service.ts`
- Test: `tests/services/lease-service-release.test.ts`

**Interfaces:**
- Produces: idempotent `releaseLease(input): Promise<Lease>` with no destructive fallback.

- [ ] **Step 1: Write release RED matrix**

Cover:

```text
clean exact release
wrong internal generation
wrong external ID
wrong holder
wrong Attempt/source/path
dirty tracked file
untracked file
ignored file discovered by filesystem observation
live current Run
current Claim
RELEASE_PENDING retry
helper STARTED and surviving
physical release before semantic commit
missing/unmanaged path
duplicate status identity
same key/different input
```

- [ ] **Step 2: Implement full preflight**

Load exact ancestry and expected version, verify no current Run/Claim, process absence, source fingerprint, worktree containment, clean Git plus unclassified filesystem checks and fresh exact Treehouse status before writing release intent.

- [ ] **Step 3: Implement release intent/key**

`ACTIVE → RELEASE_PENDING` plus release key/hash and `LEASE_RELEASE_REQUESTED` in one transaction.

- [ ] **Step 4: Implement helper-backed conditional return**

Publish exact `return <path> --if-lease-id <id> --if-lease-holder <holder>` operation. Never add `--force` or another command.

- [ ] **Step 5: Implement post-observation classification**

Managed available path with no Lease commits RELEASED. Exact Lease still present may allow a same-fence conditional retry only when helper is not live. Missing/unmanaged, identity drift or ambiguity commits DIVERGED and preserves work/evidence.

- [ ] **Step 6: Verify static no-destruction contract**

Source scan fails on reset, clean, force, destroy, prune or deletion of worktree/source paths inside product release code.

- [ ] **Step 7: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/lease-service-release.test.js
npm run test:unit
```

- [ ] **Step 8: Commit**

```bash
git add src/services/lease-service.ts tests/services/lease-service-release.test.ts
git commit -m "feat: implement fenced Lease release"
```

---

### Task 14: ClaimService atomic OPEN Claim

**Files:**
- Create: `src/services/claim-service.ts`
- Test: `tests/services/claim-service.test.ts`

**Interfaces:**
- Consumes: exact current Track/Attempt/Run/Lease lineage, approved criteria lookup, READY source Git validation.
- Produces: idempotent `openClaim(input): Claim` only.

- [ ] **Step 1: Write RED validation matrix**

Reject stale versions, non-current Attempt/Run, inactive or cross-lineage Lease, wrong contract/base, SHA not a tree, tree absent from exact source, empty/duplicate/out-of-Feature criteria and existing current Claim.

- [ ] **Step 2: Write atomicity RED**

Inject Event uniqueness failure and Track CAS failure; prove Claim row, Track state and Event all roll back.

- [ ] **Step 3: Implement canonical input hash**

Bind exact lineage IDs, versions, contract, base, result tree and sorted criterion identities. Preserve criterion array canonical order after duplicate-free validation.

- [ ] **Step 4: Implement one transaction**

Insert Claim `OPEN`, transition Track `ACTIVE → CLAIMED`, append `CLAIM_OPENED`, increment versions and return the Claim. Same key/input replays; different input conflicts.

- [ ] **Step 5: Prove M02 boundaries**

Static test requires no public method for Claim completion, verification, acceptance, rejection or abandonment in M01.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/claim-service.test.js
npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git add src/services/claim-service.ts tests/services/claim-service.test.ts
git commit -m "feat: open atomic durable Claims"
```

---

### Task 15: Read-only RecoveryService and deterministic report

**Files:**
- Create: `src/services/recovery-service.ts`
- Test: `tests/services/recovery-service.test.ts`

**Interfaces:**
- Consumes: semantic state plus source/helper/process/Treehouse/Git observations.
- Produces: deterministic `RecoveryReport` and optional content-addressed report Artifact outside domain state.

- [ ] **Step 1: Write RED taxonomy tests**

Cover `HEALTHY`, `ADOPTABLE`, `LD-01` through `LD-07`, `SD-01`, `SD-02` and `UNKNOWN`. Duplicate ID/path/holder/helper must preserve every candidate and never select the first.

- [ ] **Step 2: Write non-mutation RED**

Hash database, source, worktree, helper artifacts and Treehouse status before/after `recover`. Require exact equality and no Domain Event growth.

- [ ] **Step 3: Implement one-to-one matching**

Index status by external ID, canonical path and holder. Any non-bijective mapping is a divergence. Corroborate with common directory and Attempt source fingerprint.

- [ ] **Step 4: Implement report shape**

```ts
export interface RecoveryReport {
  readonly schemaVersion: 1;
  readonly observedAt: string;
  readonly repositoryId: string;
  readonly trackId?: WriteTrackId;
  readonly expected: readonly RecoveryExpected[];
  readonly observed: readonly RecoveryCandidate[];
  readonly classifications: readonly RecoveryClassification[];
  readonly blockers: readonly string[];
  readonly safeActions: readonly string[];
  readonly requiredAuthority: 'NONE' | 'ORIGINAL_OPERATION' | 'OPERATOR';
  readonly nextAction: string;
}
```

Sort by qualified identity and canonical path. Hash canonical JSON when writing an Artifact.

- [ ] **Step 5: Prove no repair API**

Static test fails if RecoveryService imports ExecutionStore mutation methods, action runner spawn, Treehouse acquire/release or filesystem removal.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/recovery-service.test.js
npm run test:unit
```

- [ ] **Step 7: Commit**

```bash
git add src/services/recovery-service.ts tests/services/recovery-service.test.ts
git commit -m "feat: add read-only execution recovery"
```

---

### Task 16: M01 CLI contracts and production composition

**Files:**
- Modify: `src/cli/args.ts`
- Modify: `src/cli/main.ts`
- Modify: `src/cli/entry.ts`
- Modify: `src/runtime/paths.ts`
- Test: `tests/cli/execution-args.test.ts`
- Test: `tests/cli/execution-main.test.ts`
- Modify: `tests/cli/args.test.ts`
- Modify: `tests/cli/main.test.ts`

**Interfaces:**
- Produces exact commands from microdesign section 17 with human/JSON output, typed errors, stable exit class and concrete next action.

- [ ] **Step 1: Write parser RED tests**

Accepted forms:

```text
track open --mission MIS-002 --milestone M01 --feature F01 --contract sha256:... --base <sha> --idempotency-key <key> [--json]
track show --track WT-001 [--json]
track abandon --track WT-001 --expected-version <n> [--json]
lease grant --track WT-001 --expected-version <n> --idempotency-key <key> [--json]
lease show --lease LSE-001 [--json]
lease release --lease LSE-001 --expected-version <n> --idempotency-key <key> [--json]
recover [--track WT-001] [--json]
```

Reject duplicates, unknown flags, missing values, invalid positive integers, malformed IDs/hashes and positional extras.

- [ ] **Step 2: Extend `ParsedCommand` and usage**

Keep the existing strict union. Do not add a generic map/router framework.

- [ ] **Step 3: Write CLI dependency/output RED tests**

For every command, assert one service invocation, stable JSON, human identity/version/hash visibility and a concrete next command. Errors preserve MnfsError code and remediation.

- [ ] **Step 4: Implement `runCli` branches**

Use typed inputs and explicit formatters. `recover` human output lists classifications and next action without hiding candidates.

- [ ] **Step 5: Compose production services in `entry.ts`**

Open one `SqliteStore`, construct focused stores/services/adapters with runtime paths, close after awaited command completion. Do not initialize Treehouse for commands that do not require it.

- [ ] **Step 6: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/cli/execution-args.test.js dist/tests/cli/execution-main.test.js dist/tests/cli/args.test.js dist/tests/cli/main.test.js
npm run verify
```

- [ ] **Step 7: Commit**

```bash
git add src/cli src/runtime/paths.ts tests/cli
git commit -m "feat: expose M01 execution CLI"
```

---

### Task 17: Fresh-process and deterministic M01 composition proof

**Files:**
- Create: `tests/integration/m01-fresh-process.test.ts`
- Create: `tests/integration/m01-composition.test.ts`
- Modify: `package.json` only when an explicit focused script is useful; root `test:unit` must continue discovering all compiled tests.

**Interfaces:**
- Consumes: complete deterministic M01 implementation with fake Treehouse/action process boundaries.
- Produces: proof of recovery, crash windows, no duplicates and preserved M0/M1 history across independent Node processes.

- [ ] **Step 1: Build a revision-5 fixture**

Create a real temporary canonical Git repo and runtime database containing M0/M1 state plus exact approved MIS-002 revision 5. Use fake Treehouse executables that implement strict JSON and action counters.

- [ ] **Step 2: Implement Scenario A subprocess proof**

Across independent CLI processes:

```text
open Track/A01 at exact base
materialize independent source
grant Lease
terminate at each source/token/helper/action window
recover with a fresh process
complete fenced release
abandon Track
repeat release and recover final state
```

Assert canonical repo unchanged, at-most-one acquisition per grant intent and no product cleanup of preserved sources outside explicit fixture teardown.

- [ ] **Step 3: Implement Scenario B subprocess proof**

```text
open second Track/A01/WR01
materialize source
grant Lease
open Claim against exact tree and criteria
close process
fresh process recovers identical lineage and no duplicate current entity
```

Claim remains OPEN and resources preserved for M02.

- [ ] **Step 4: Prove migration and downgrade in a fresh binary process**

Copy a v3 database, invoke current CLI to migrate, reopen and compare historical rows. Invoke a compiled pre-v4 mutation helper and prove rollback/no row drift.

- [ ] **Step 5: Run full deterministic gate**

```bash
npm ci
npm run verify
```

Record Node/npm/Git versions, product count, AS-02 count, TC-01 count, total M01 tests, docs count and exact head.

- [ ] **Step 6: Adversarial source scan**

Fail on production Treehouse cwd equal to project root, inherited environment spread, force/destroy/prune, automatic removal during Recovery, Claim acceptance methods or Pi imports in M01 files.

- [ ] **Step 7: Commit**

```bash
git add tests/integration package.json
git commit -m "test: prove M01 fresh-process composition"
```

---

### Task 18: Canonical WSL2 adapter proof, documentation and implementation gate

**Files:**
- Create: `docs/acceptance/2026-08-XX-mis-002-m01-durable-execution-lease-core.md`
- Modify: `docs/capabilities/CAP-EXECUTION/TRACEABILITY.json`
- Regenerate: `docs/capabilities/CAP-EXECUTION/COVERAGE.md`
- Modify: `docs/DOCUMENTATION-MAP.md`
- Modify: `docs/tracking/STATUS.md`
- Modify: `docs/tracking/WORKLOG.md`
- Modify: PR #17 description

**Interfaces:**
- Consumes: exact-head deterministic implementation and accepted Treehouse candidate.
- Produces: canonical M01 Evidence and an explicit Operator gate; does not start M02.

- [ ] **Step 1: Preflight exact candidate and checkout**

Require canonical Ubuntu WSL2, Linux-owned checkout, clean exact branch head, full `npm ci && npm run verify`, Treehouse 2.1.1 accepted SHA and no candidate drift.

- [ ] **Step 2: Execute only the approved real Scenario A**

Use a disposable M01 product fixture with an `origin` on the canonical source and prove the production `ExecutionSourceAdapter` creates an independent no-origin Attempt source. Invoke real Treehouse only through `LeaseActionRunner` and the production `LeaseService`.

- [ ] **Step 3: Perform real crash drills**

At minimum:

```text
source REQUESTED before final rename
helper claimed before STARTED
helper STARTED during grant
external Lease before semantic commit
release pending before helper
physical release before semantic commit
```

A fresh CLI process must classify and continue safely. An inconclusive started grant must stop and preserve rather than issue another `get`.

- [ ] **Step 4: Verify release and cleanup boundary**

Release only the exact clean disposable Lease. Preserve all product Evidence first. Trusted fixture cleanup removes only registered disposable paths and retains the acceptance report and hashes.

- [ ] **Step 5: Promote Evidence and traceability**

For each M01 requirement, update `realizedBy`, `verifiedBy`, `evidencedBy` and state only to the level actually proved. Do not claim M02 or full CAP-EXECUTION graduation.

- [ ] **Step 6: Run final exact-head CI**

```bash
npm ci
npm run verify
```

Wait for GitHub Actions on the PR synthetic merge commit and record all counts, versions and canonical IDs.

- [ ] **Step 7: Request explicit implementation acceptance**

Present:

```text
M01 deterministic proof
M01 canonical WSL2 proof
all seven criterion results
migration/rollback evidence
remaining limitations
PR diff and CI
```

Do not mark M01 complete, merge PR #17 or start M02 without a separate exact Operator decision.

- [ ] **Step 8: Commit documentation**

```bash
git add docs .mnfs
# Include generated coverage only when its source traceability changed.
git commit -m "docs: record M01 implementation evidence"
```

---

## Plan Self-Review Checklist

### Spec coverage

| Accepted microdesign area | Plan task |
|---|---|
| IDs, states, errors | 1 |
| one transaction/Event authority | 2 |
| maintenance/backup/version gate | 3 |
| migration v4 and schema | 4 |
| persistence/FKs/idempotency | 5 |
| Track/Attempt/Run lifecycle | 6 |
| process and Git observation | 7 |
| independent no-origin source | 8 |
| exact Treehouse adapter | 9 |
| durable action protocol | 10 |
| trusted helper | 11 |
| grant IAO | 12 |
| release IAO and preservation | 13 |
| Claim OPEN atomicity | 14 |
| read-only Recovery | 15 |
| CLI/composition root | 16 |
| fresh-process deterministic proof | 17 |
| real WSL2 proof and closeout gate | 18 |

All seven M01 requirements and every Critical/Important Task 14 correction have at least one implementation task and one explicit proof.

### Explicitly absent

```text
Pi imports or process launch
SEC-E1 production creation
Worker completion
Claim transition beyond OPEN
Receipt
Gate/Verdict
Integration or delivery
scheduler, broker or generic action registry
force/destroy/prune
automatic Recovery repair
```

### Execution boundary

This plan is ready for review, not execution. Production implementation remains prohibited until the Operator approves this exact plan version and separately authorizes the first TDD task.

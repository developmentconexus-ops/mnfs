---
id: PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
title: MIS-002 M01 Durable Execution and Lease Core Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: current
version: 1.0.1
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

**Architecture:** SQLite remains the sole semantic authority through one `SqliteStore` connection and focused stores sharing one transaction object. Each Attempt receives an independent Linux-local Git source at its exact base commit; Treehouse 2.1.1 operates only inside that no-origin controlled-HOME boundary. External grant and release actions use durable intent, a token-bound `LeaseActionRunner`, fresh Treehouse/Git observations and fenced semantic commits.

**Tech Stack:** Node.js 24.18.0+, TypeScript 5.9 strict mode, `node:sqlite`, `node:test`, Git CLI, Treehouse 2.1.1, Ubuntu WSL2, canonical JSON and SHA-256.

## Global Constraints

- Govern all work by approved MIS-002 revision 5: `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`.
- Implement exactly `CAP-EXEC-REQ-001`, `002`, `004`, `005`, `006`, `007` and `008`.
- Preserve accepted microdesign `DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE` version `0.6.1`.
- Keep one `DatabaseSync` connection and one transaction authority per command.
- Use `BEGIN IMMEDIATE`, bounded `SQLITE_BUSY` retry and optimistic row versions.
- Commit every semantic mutation and matching versioned Domain Event atomically.
- Never execute Git, Treehouse, filesystem scans, process waits or model calls inside a domain transaction.
- Never use the canonical checkout as Treehouse cwd.
- Every Attempt source is Linux-owned, exact-base, no-origin, no-alternates, no shared common directory and no hardlinked canonical object.
- Require Treehouse SHA-256 `c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3`, version `2.1.1`, accepted capabilities and accepted command shapes.
- Treehouse receives controlled HOME/XDG/config/hooks, Linux-only PATH, disabled global/system Git config, closed stdin, bounded output, timeout and `shell: false`.
- Never use force, destroy, broad prune, stderr text as state or direct Git fallback inside the same Lease operation.
- Never automatically repeat `treehouse get` after durable STARTED evidence with an inconclusive outcome.
- Preserve dirty, ambiguous, stale, escaped, duplicate and unclassified work.
- Keep plain `mnfs recover` byte-for-byte non-mutating for domain SQLite and managed resources.
- M01 may create Claim `OPEN` only. Pi, SEC-E1 production creation, Worker completion, Receipt, Gate, Integration, QA and delivery remain outside scope.
- Run real Treehouse commands only in the final explicit WSL2 acceptance task after all deterministic gates pass.
- Keep PR #17 draft and unmerged. Automatic merge is not authorized.

---

## Frozen Public Interfaces

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

### Task 1: Domain model, identities, transitions, errors and test fixtures

**Files:**
- Create: `src/execution/ids.ts`
- Create: `src/execution/model.ts`
- Create: `src/execution/transitions.ts`
- Modify: `src/domain/errors.ts`
- Create: `tests/support/m01-fixtures.ts`
- Create: `tests/execution/ids.test.ts`
- Create: `tests/execution/transitions.test.ts`

**Interfaces:**
- Produces exact entity types, ID formatters/validators, lifecycle guards and reusable deterministic builders.

- [ ] **Step 1: Write failing identity tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatAttemptId,
  formatClaimId,
  formatLeaseId,
  formatWorkerRunId,
  formatWriteTrackId,
  requireWorkerRunId,
} from '../../src/execution/ids.js';

test('formats stable parent-relative M01 identities', () => {
  assert.equal(formatWriteTrackId(1), 'WT-001');
  assert.equal(formatAttemptId('WT-001', 1), 'WT-001/A01');
  assert.equal(formatWorkerRunId('WT-001/A01', 2), 'WT-001/A01/WR02');
  assert.equal(formatClaimId('WT-001/A01', 3), 'WT-001/A01/CLM03');
  assert.equal(formatLeaseId(7), 'LSE-007');
  assert.throws(() => requireWorkerRunId('WT-002/A01/WR01', 'WT-001/A01'));
});
```

- [ ] **Step 2: Run RED**

```bash
npm run build --silent && node --test dist/tests/execution/ids.test.js
```

Expected: module-not-found failure for `src/execution/ids.ts`.

- [ ] **Step 3: Implement exact ID functions**

```ts
const WRITE_TRACK_PATTERN = /^WT-(\d{3,})$/;
const ATTEMPT_PATTERN = /^(WT-\d{3,})\/A(\d{2,})$/;
const WORKER_RUN_PATTERN = /^(WT-\d{3,}\/A\d{2,})\/WR(\d{2,})$/;
const CLAIM_PATTERN = /^(WT-\d{3,}\/A\d{2,})\/CLM(\d{2,})$/;
const LEASE_PATTERN = /^LSE-(\d{3,})$/;
```

Every formatter rejects non-positive/non-integer input. Every validator returns the branded string and verifies the expected parent when supplied.

- [ ] **Step 4: Write and implement transition tests**

Use exhaustive tables. Examples:

```ts
assert.equal(requireAttemptTransition('OPEN', 'SUPERSEDED'), 'SUPERSEDED');
assert.throws(() => requireAttemptTransition('SUPERSEDED', 'OPEN'));
assert.equal(requireLeaseTransition('ACTIVE', 'RELEASE_PENDING'), 'RELEASE_PENDING');
assert.throws(() => requireLeaseTransition('DIVERGED', 'ACTIVE'));
```

Implement literal transition maps and immutable entity interfaces. Persist timestamps as ISO strings and versions as positive integers.

- [ ] **Step 5: Add the complete accepted M01 error union**

Copy the exact codes from accepted microdesign section 18 into `MnfsErrorCode`. Domain errors use exit code 1; parser misuse remains exit code 2.

- [ ] **Step 6: Add deterministic fixture builders**

`tests/support/m01-fixtures.ts` exports fixed timestamps, contract/Treehouse hashes, IDs, entity builders and a `withTemporaryDirectory` helper. Builders reject unknown override keys through TypeScript typing.

- [ ] **Step 7: Verify**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/execution/ids.test.js dist/tests/execution/transitions.test.js
npm run test:unit
```

- [ ] **Step 8: Commit**

```bash
git add src/execution src/domain/errors.ts tests/support/m01-fixtures.ts tests/execution
git commit -m "feat: define M01 execution domain"
```

---

### Task 2: Production process runner, durable Artifact writer and process identity

**Files:**
- Create: `src/runtime/process-runner.ts`
- Create: `src/runtime/durable-artifact.ts`
- Create: `src/adapters/process-identity.ts`
- Create: `tests/runtime/process-runner.test.ts`
- Create: `tests/runtime/durable-artifact.test.ts`
- Create: `tests/adapters/process-identity.test.ts`

**Interfaces:**

```ts
export interface ProcessSpec {
  readonly executable: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly stdoutLimitBytes: number;
  readonly stderrLimitBytes: number;
}

export interface ProcessResult {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: Buffer;
  readonly stderr: Buffer;
  readonly timedOut: boolean;
}
```

- [ ] **Step 1: Write runner RED tests**

Prove raw-byte stdout/stderr preservation, closed stdin, `shell: false`, exact cwd/env, output bounds, spawn failure and Linux process-group timeout that kills a grandchild.

- [ ] **Step 2: Implement the bounded runner**

Use `spawn` with `detached: true` on Linux. On timeout/output overflow send `SIGTERM` to `-pid`, wait the fixed grace period, then send `SIGKILL` to `-pid`. Never retry or fall back.

- [ ] **Step 3: Write durable-write RED test**

Require this observed order:

```text
open exclusive temp
write complete bytes
fsync temp
close temp
rename temp to final
fsync parent directory
```

- [ ] **Step 4: Implement immutable durable Artifact publication**

Expose `writeDurableFile(path, bytes, mode)` and `readRegularFileNoSymlink(path)`. An existing final file succeeds only when its exact bytes match; otherwise throw `INTERNAL_ERROR`.

- [ ] **Step 5: Write and implement process identity tests**

Parse boot ID and `/proc/<pid>/stat` field 22 correctly even when process names contain spaces and parentheses. `observe(pid)` returns `undefined` only for a genuinely absent process. Equality requires boot ID, PID and start ticks.

- [ ] **Step 6: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/runtime/process-runner.test.js dist/tests/runtime/durable-artifact.test.js dist/tests/adapters/process-identity.test.js
npm run test:unit
git add src/runtime src/adapters/process-identity.ts tests/runtime tests/adapters/process-identity.test.ts
git commit -m "feat: add trusted runtime primitives"
```

---

### Task 3: Shared SQLite transaction authority

**Files:**
- Create: `src/store/sqlite-transaction.ts`
- Modify: `src/store/sqlite-store.ts`
- Create: `tests/store/sqlite-transaction.test.ts`
- Modify: `tests/store/sqlite-store.test.ts`

**Interfaces:**

```ts
export class SqliteTransaction {
  constructor(
    readonly database: DatabaseSync,
    readonly sleep: (milliseconds: number) => void,
  );
  run<T>(operation: () => T): T;
}
```

- [ ] **Step 1: Write RED for commit, rollback and bounded busy retry**

Prove transaction success, rollback after state insert, no retry after user code starts and `SQLITE_BUSY` delays exactly `5`, `10`, `20` milliseconds before `CONCURRENCY_CONFLICT`.

- [ ] **Step 2: Implement `BEGIN IMMEDIATE` authority**

Retry only the `BEGIN IMMEDIATE` call. Once it succeeds, execute user code exactly once. Commit once; rollback only while `database.isTransaction` is true.

- [ ] **Step 3: Refactor `SqliteStore` without schema change**

Replace private transaction logic with one shared `SqliteTransaction`. Keep all existing v3 Event SQL and public behavior unchanged in this task.

- [ ] **Step 4: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/sqlite-transaction.test.js dist/tests/store/sqlite-store.test.js
npm run test:unit
git add src/store/sqlite-transaction.ts src/store/sqlite-store.ts tests/store
git commit -m "refactor: centralize SQLite transaction authority"
```

---

### Task 4: Maintenance gate, consistent backup and schema-version checks

**Files:**
- Create: `src/store/sqlite-maintenance.ts`
- Modify: `src/store/sqlite-store.ts`
- Create: `tests/store/sqlite-maintenance.test.ts`

**Interfaces:**

```ts
export async function ensureDatabaseReady(input: {
  readonly databasePath: string;
  readonly writeMode: boolean;
  readonly processIdentity: ProcessIdentity;
  readonly now: string;
}): Promise<DatabaseReadiness>;
```

- [ ] **Step 1: Write maintenance lock RED tests**

Use `<database>.maintenance.lock`, exclusive create mode `0600`, canonical owner metadata and file/directory fsync. A second owner, malformed file or symlink blocks; age alone never steals the lock.

- [ ] **Step 2: Write backup RED tests**

Use `node:sqlite backup()` to create a consistent destination. Reopen it, require `integrity_check = ok`, hash it and record user version, migration rows, table counts and approved contract hashes.

- [ ] **Step 3: Implement schema support checks**

Before v4 accept only applied `[1,2,3]` and `user_version` `0` or `3`. After v4 accept `[1,2,3,4]` and `user_version = 4`. Reject gaps and newer schemas in write mode with `SCHEMA_VERSION_UNSUPPORTED`.

- [ ] **Step 4: Separate readiness from store opening**

`SqliteStore.openCurrent(path)` opens only a schema already verified current. CLI/service composition must call and await `ensureDatabaseReady` before opening write mode. Test-only creation uses the same readiness function.

- [ ] **Step 5: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/sqlite-maintenance.test.js
npm run test:unit
git add src/store/sqlite-maintenance.ts src/store/sqlite-store.ts tests/store/sqlite-maintenance.test.ts
git commit -m "feat: add SQLite maintenance and backup gate"
```

---

### Task 5: Migration v4, versioned Events and execution schema

**Files:**
- Create: `src/store/event-store.ts`
- Modify: `src/store/migrations.ts`
- Modify: `src/store/sqlite-store.ts`
- Modify: `src/domain/types.ts`
- Create: `tests/store/migration-v4.test.ts`
- Modify: `tests/store/sqlite-store.test.ts`

**Interfaces:**

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

- [ ] **Step 1: Build four exact RED database fixtures**

Create empty, M0, M1/v3 and exact MIS-002 revision-5 databases. Capture Event IDs/seq/payload bytes/timestamps, Mission rows, plan revisions and approved hashes before migration.

- [ ] **Step 2: Write RED for the generalized Events rebuild**

Require `event_types(type,payload_schema_version)`, required Event payload version without default, preserved rows with version `1`, rebuilt indexes and valid FKs.

- [ ] **Step 3: Write RED for execution tables**

Require exact columns/checks/unique parent tuples/partial indexes from accepted microdesign section 9. Insert cross-Track/cross-Attempt Claim ancestry and expect FK failure.

- [ ] **Step 4: Implement migration v4**

Create `events_v4`, copy and verify historical rows, drop old events, rename, recreate indexes, create execution tables, run `foreign_key_check` and `integrity_check`, insert migration 4 and set `user_version = 4` in the same maintenance operation.

- [ ] **Step 5: Implement `EventStore` and refactor existing mutations**

All Mission/Plan/M01 Event writes use `payload_schema_version = 1` and canonical JSON through the shared transaction. `MissionEvent` includes `payloadSchemaVersion`.

- [ ] **Step 6: Prove downgrade and rollback**

A compiled pre-v4 mutation helper against a v4 copy must fail its required Event insert and roll back its Mission/Plan mutation. An injected migration failure must leave v3 unchanged and migration 4 absent.

- [ ] **Step 7: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/migration-v4.test.js dist/tests/store/sqlite-store.test.js
npm run verify
git add src/store/event-store.ts src/store/migrations.ts src/store/sqlite-store.ts src/domain/types.ts tests/store
git commit -m "feat: add M01 schema migration v4"
```

---

### Task 6: ExecutionStore persistence, ancestry and idempotency

**Files:**
- Create: `src/store/execution-store.ts`
- Modify: `src/store/sqlite-store.ts`
- Create: `tests/store/execution-store.test.ts`

- [ ] **Step 1: Write RED for allocation/current-row invariants**

Prove `WT-001`, `LSE-001`, parent-relative Attempt/Run/Claim ordinals and one current Track/Feature, Attempt/Track, Run/Attempt, Lease/Track and Claim/Attempt.

- [ ] **Step 2: Write RED for ancestry and base binding**

Direct SQL attempts to attach another Track's Lease or another Attempt's Run to a Claim must fail. Claim base must match its Attempt composite key.

- [ ] **Step 3: Write RED for idempotency and CAS**

Same key/same input returns prior semantic row. Same key/different canonical input throws the matching conflict. Every mutable update uses expected version and zero rows means `CONCURRENCY_CONFLICT`.

- [ ] **Step 4: Implement strict row codecs and focused methods**

Malformed persisted enum/state/nullability combinations throw `INTERNAL_ERROR`; no coercion or fallback. Stores share `database`, `transaction` and `events` from `SqliteStore` and never open another connection.

- [ ] **Step 5: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/store/execution-store.test.js
npm run test:unit
git add src/store/execution-store.ts src/store/sqlite-store.ts tests/store/execution-store.test.ts
git commit -m "feat: persist M01 execution entities"
```

---

### Task 7: ExecutionService Track, Attempt and Worker Run lifecycle

**Files:**
- Create: `src/services/execution-service.ts`
- Create: `tests/services/execution-service.test.ts`

- [ ] **Step 1: Write exact-authority RED tests**

Reject non-latest contract hash, unknown qualified target, target outside M01, missing requirement allocation and base SHA that is not a Git commit.

- [ ] **Step 2: Write atomic Track/A01 RED test**

`openWriteTrack` commits Track, A01, `WRITE_TRACK_OPENED` and `ATTEMPT_OPENED` together. Duplicate Event injection leaves no Track or Attempt.

- [ ] **Step 3: Implement Track/A01 and input replay**

Canonical input binds target, contract, object format and base commit. Same key/input returns existing lineage; different input conflicts.

- [ ] **Step 4: Implement atomic Run replacement**

Terminalize the current Run and create the next Run/Event pair in one transaction. Preserve Attempt identity. Stale expected version changes nothing.

- [ ] **Step 5: Implement Attempt supersession and Track abandonment guards**

Supersession requires no current Run/Claim/Lease and clean preserved source/worktree observations. Abandonment requires all accepted guards and never releases resources implicitly.

- [ ] **Step 6: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/execution-service.test.js
npm run test:unit
git add src/services/execution-service.ts tests/services/execution-service.test.ts
git commit -m "feat: add M01 execution lifecycle service"
```

---

### Task 8: Read-only Git observation and independent Attempt source

**Files:**
- Create: `src/adapters/git-worktree.ts`
- Create: `src/adapters/execution-source.ts`
- Modify: `src/runtime/paths.ts`
- Create: `tests/adapters/git-worktree.test.ts`
- Create: `tests/adapters/execution-source.test.ts`

- [ ] **Step 1: Write Git observer RED tests**

Permit only exact read operations: `rev-parse`, `status --porcelain=v1 -z --untracked-files=all`, `worktree list --porcelain`, `remote`, and `cat-file`. Reject duplicate paths and any request for `write-tree`, fetch, checkout, reset, clean, commit or ref mutation.

- [ ] **Step 2: Implement canonical Git observations**

Expose `observeRepository`, `observeWorktrees`, `requireCommit` and `requireTree` using the production process runner and controlled Git env.

- [ ] **Step 3: Write source-path and network-off RED tests**

Derive `<runtime>/execution-sources/<track>/<attempt>/source`; reject malformed IDs, mounts, symlinks and unrecognized existing finals. Create network/credential traps and require local source preparation without invoking them.

- [ ] **Step 4: Implement exact local transfer sequence**

```text
git init --object-format=<format> <temp>
git -C <temp> -c protocol.file.allow=always fetch --no-tags --no-write-fetch-head <canonical-absolute-path> <base-sha>
git -C <temp> update-ref refs/heads/main <base-sha>
git -C <temp> checkout -B main <base-sha>
```

Use disabled global/system config, empty hooks, no credential helper and no proxy variables. Do not persist a remote.

- [ ] **Step 5: Verify independent storage and fingerprint**

Require zero remotes, no alternates, distinct common/object dirs, no identical `(device,inode)` for loose/pack/index object files, exact base/tree/object format and clean status. Verify canonical checkout snapshots before/after are identical. Publish temp-to-final atomically and persist READY only after observation.

- [ ] **Step 6: Implement crash classifications**

Recognized incomplete temp may be removed after inspection. Matching complete final commits READY. Conflicting final/source/config/base becomes DIVERGED and is preserved.

- [ ] **Step 7: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/adapters/git-worktree.test.js dist/tests/adapters/execution-source.test.js
npm run test:unit
git add src/adapters/git-worktree.ts src/adapters/execution-source.ts src/runtime/paths.ts tests/adapters
git commit -m "feat: create independent Attempt execution sources"
```

---

### Task 9: Production Treehouse adapter

**Files:**
- Create: `src/adapters/treehouse.ts`
- Create: `tests/adapters/treehouse.test.ts`

- [ ] **Step 1: Port TC-01 strict parser RED cases to TypeScript**

Cover invalid UTF-8, extra JSON, non-zero exit, duplicate paths, mismatched holder/ID, mounted/escaped paths and inconsistent status items.

- [ ] **Step 2: Write candidate freshness RED tests**

Executable bytes, semantic version, capabilities, Git, Node, WSL identity, environment shape and command-shape drift must fail before a protected operation.

- [ ] **Step 3: Implement controlled provenance and environment**

Resolve the executable path, hash bytes, accept only `2.1.1` with optional lowercase raw `v`, require accepted capabilities and build an allowlisted environment with Attempt-owned HOME/XDG/pool/hooks.

- [ ] **Step 4: Implement exact operations**

```ts
acquire(input): Promise<TreehouseLeaseObservation>;
status(input): Promise<readonly TreehouseStatusItem[]>;
release(input): Promise<ProcessResult>;
```

Use only accepted argv. Release output remains advisory until fresh status/Git observation.

- [ ] **Step 5: Add static anti-pattern test**

Fail on `--force`, `destroy`, `prune`, `shell: true`, `exec(`, inherited environment spread, stderr regex state or canonical checkout cwd.

- [ ] **Step 6: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/adapters/treehouse.test.js
npm run test:unit
git add src/adapters/treehouse.ts tests/adapters/treehouse.test.ts
git commit -m "feat: add production Treehouse adapter"
```

---

### Task 10: Lease action protocol and trusted helper

**Files:**
- Create: `src/runtime/lease-action-protocol.ts`
- Create: `src/runtime/lease-action-runner.ts`
- Create: `src/runtime/lease-action-entry.ts`
- Create: `bin/mnfs-lease-action.mjs`
- Modify: `package.json`
- Create: `tests/runtime/lease-action-protocol.test.ts`
- Create: `tests/runtime/lease-action-runner.test.ts`

**Interfaces:**

```ts
export interface LeaseActionOperation {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly kind: 'GRANT' | 'RELEASE';
  readonly executable: string;
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

- [ ] **Step 1: Write protocol RED tests**

Validate exact action argv/cwd/env hashes, token/path containment, immutable mode `0400`, fatal UTF-8, one JSON value and no symlink targets.

- [ ] **Step 2: Define STARTED and FINISHED records**

STARTED binds token, operation hash and helper process identity. FINISHED binds token, process metadata and bounded stdout/stderr Artifact hashes/refs.

- [ ] **Step 3: Write STARTED-before-spawn and exactly-once RED tests**

The injected spawn checks that STARTED is already durably readable. Re-running the same operation performs zero additional Treehouse calls.

- [ ] **Step 4: Implement helper and executable entry**

The helper never opens MNFS SQLite. It validates operation ownership/mode, writes STARTED, invokes exactly one process, writes bounded outputs/FINISHED and exits with a stable class. Descendant process groups die on timeout.

- [ ] **Step 5: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/runtime/lease-action-protocol.test.js dist/tests/runtime/lease-action-runner.test.js
npm run verify
git add src/runtime/lease-action-protocol.ts src/runtime/lease-action-runner.ts src/runtime/lease-action-entry.ts bin/mnfs-lease-action.mjs package.json tests/runtime
git commit -m "feat: add trusted Lease action runner"
```

---

### Task 11: LeaseService grant and release IAO

**Files:**
- Create: `src/services/lease-service.ts`
- Create: `tests/services/lease-service-grant.test.ts`
- Create: `tests/services/lease-service-release.test.ts`

- [ ] **Step 1: Write grant crash-window RED matrix**

Cover intent only, token before helper, STARTED before result, external Lease before semantic commit, commit before response, exact existing match, duplicate matches, same-key conflict and two concurrent callers. Count external calls; no safe case exceeds one.

- [ ] **Step 2: Implement grant intent, observation and action claim**

Canonical input binds Track/Attempt/generation/contract/base/source/holder/candidate/command shape. Insert/reuse REQUESTED plus Event, observe first, commit one exact match, otherwise CAS-claim token and publish/spawn helper.

- [ ] **Step 3: Implement grant completion rules**

Only fresh exact Treehouse/Git state commits ACTIVE. STARTED with no decisive outcome throws `LEASE_ACTION_INCONCLUSIVE` and preserves state. Same key/different input conflicts.

- [ ] **Step 4: Prove concurrent at-most-once**

Use two independent `SqliteStore` instances and a token-claim barrier. Require one acquisition and one ACTIVE Lease.

- [ ] **Step 5: Write release RED matrix**

Cover wrong internal/external/source/helper fence, tracked/untracked/ignored changes, live Run, current Claim, pending retry, surviving helper, physical release before semantic commit, missing/unmanaged path, duplicate identity and idempotency conflict.

- [ ] **Step 6: Implement release preflight and conditional helper action**

Observe exact ancestry, process absence, source/worktree, Git/filesystem and Treehouse state before `ACTIVE → RELEASE_PENDING`. Publish only `return <path> --if-lease-id <id> --if-lease-holder <holder>`.

- [ ] **Step 7: Implement release classification**

Managed available path with no Lease commits RELEASED. Exact Lease still present may allow only same-fence conditional retry after helper absence. Missing/unmanaged/ambiguous/drift becomes DIVERGED and preserves work/evidence.

- [ ] **Step 8: Add no-destruction static test and verify**

Fail on reset, clean, force, destroy, prune or product deletion of source/worktree paths.

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/lease-service-grant.test.js dist/tests/services/lease-service-release.test.js
npm run test:unit
git add src/services/lease-service.ts tests/services/lease-service-grant.test.ts tests/services/lease-service-release.test.ts
git commit -m "feat: implement fenced Lease lifecycle"
```

---

### Task 12: ClaimService and read-only RecoveryService

**Files:**
- Create: `src/services/claim-service.ts`
- Create: `src/services/recovery-service.ts`
- Create: `tests/services/claim-service.test.ts`
- Create: `tests/services/recovery-service.test.ts`

- [ ] **Step 1: Write Claim RED validation/atomicity matrix**

Reject stale versions, non-current lineage, cross-lineage Lease, wrong contract/base, non-tree/missing tree, empty/duplicate/out-of-Feature criteria and current Claim. Inject Event and CAS failures and prove no Claim/Track/Event partial mutation.

- [ ] **Step 2: Implement Claim OPEN transaction**

Canonical input binds exact IDs/versions/contract/base/tree/criteria. Insert Claim OPEN, transition Track ACTIVE→CLAIMED and append `CLAIM_OPENED` atomically. Same key/input replays; conflict fails. Expose no completion/acceptance methods.

- [ ] **Step 3: Write Recovery taxonomy and non-mutation RED tests**

Cover `HEALTHY`, `ADOPTABLE`, `LD-01`–`LD-07`, `SD-01`, `SD-02`, `UNKNOWN`, duplicate identity and multiple helper candidates. Hash SQLite/resources before and after and require equality/no Event growth.

- [ ] **Step 4: Implement deterministic one-to-one Recovery report**

Index candidates by token, external ID, canonical path and holder. Non-bijective maps are divergence. Output every candidate, blocker, safe action, required authority and concrete next action; optional Artifact uses canonical JSON hash outside domain state.

- [ ] **Step 5: Add static Recovery boundary test and verify**

Fail if Recovery imports mutation methods, helper spawn, acquire/release or removal.

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/services/claim-service.test.js dist/tests/services/recovery-service.test.js
npm run test:unit
git add src/services/claim-service.ts src/services/recovery-service.ts tests/services
git commit -m "feat: add Claims and read-only Recovery"
```

---

### Task 13: M01 CLI and production composition root

**Files:**
- Modify: `src/cli/args.ts`
- Modify: `src/cli/main.ts`
- Modify: `src/cli/entry.ts`
- Modify: `src/runtime/paths.ts`
- Create: `tests/cli/execution-args.test.ts`
- Create: `tests/cli/execution-main.test.ts`
- Modify: `tests/cli/args.test.ts`
- Modify: `tests/cli/main.test.ts`

- [ ] **Step 1: Write strict parser RED tests**

Accept only:

```text
track open --mission MIS-002 --milestone M01 --feature F01 --contract <hash> --base <sha> --idempotency-key <key> [--json]
track show --track WT-001 [--json]
track abandon --track WT-001 --expected-version <positive-int> [--json]
lease grant --track WT-001 --expected-version <positive-int> --idempotency-key <key> [--json]
lease show --lease LSE-001 [--json]
lease release --lease LSE-001 --expected-version <positive-int> --idempotency-key <key> [--json]
recover [--track WT-001] [--json]
```

Reject duplicate/unknown flags, missing values, malformed IDs/hashes/integers and positional extras.

- [ ] **Step 2: Extend the existing strict command union**

Do not add a router framework or DI container. Keep one explicit branch per command.

- [ ] **Step 3: Write output/dependency RED tests**

Assert one service call, stable JSON, human identity/version/hash visibility, typed error and concrete next action for every command.

- [ ] **Step 4: Compose production dependencies**

Await `ensureDatabaseReady`, open one current `SqliteStore`, build focused services/adapters and close after command completion. Do not discover Treehouse for commands that do not need it.

- [ ] **Step 5: Verify and commit**

```bash
npm run typecheck
npm run build --silent && node --test dist/tests/cli/execution-args.test.js dist/tests/cli/execution-main.test.js dist/tests/cli/args.test.js dist/tests/cli/main.test.js
npm run verify
git add src/cli src/runtime/paths.ts tests/cli
git commit -m "feat: expose M01 execution CLI"
```

---

### Task 14: Fresh-process deterministic composition, real WSL2 proof and closeout gate

**Files:**
- Create: `tests/integration/m01-fresh-process.test.ts`
- Create: `tests/integration/m01-composition.test.ts`
- Create after successful canonical run: `docs/acceptance/2026-08-04-mis-002-m01-implementation.md`
- Modify after proof: `docs/capabilities/CAP-EXECUTION/TRACEABILITY.json`
- Regenerate after proof: `docs/capabilities/CAP-EXECUTION/COVERAGE.md`
- Modify after proof: `docs/DOCUMENTATION-MAP.md`
- Modify after proof: `docs/tracking/STATUS.md`
- Modify after proof: `docs/tracking/WORKLOG.md`
- Modify after proof: PR #17 description

- [ ] **Step 1: Implement deterministic Scenario A across independent processes**

Create exact revision-5 SQLite/Git fixture and fake strict Treehouse. Open Track/A01, create independent source, grant, terminate at every source/token/helper/action window, recover fresh, release cleanly, abandon Track and prove repeated release idempotency.

- [ ] **Step 2: Implement deterministic Scenario B**

Open second Track/A01/WR01, create source, grant, open Claim against exact tree/criteria, close process and recover identical lineage with no duplicate current entity. Keep Claim OPEN and resources preserved for M02.

- [ ] **Step 3: Prove migration/downgrade/fresh binary**

Migrate a v3 copy, compare all historical rows/hashes and reopen current. Run compiled pre-v4 helper against a v4 copy and prove rollback/no drift.

- [ ] **Step 4: Run deterministic global gate and adversarial scan**

```bash
npm ci
npm run verify
```

Record product/AS-02/TC-01/M01/docs counts and exact head. Fail source scan on project-root Treehouse cwd, environment spread, force/destroy/prune, Recovery mutation, Claim acceptance or Pi import.

- [ ] **Step 5: Perform canonical WSL2 preflight**

Require Linux-owned clean exact head, full gate, Treehouse accepted SHA/version/capabilities and no host/command-shape drift.

- [ ] **Step 6: Execute real production Scenario A only**

Use a disposable canonical source with `origin`; prove production source becomes independent/no-origin and real Treehouse is invoked only through `LeaseActionRunner`/`LeaseService`. Run source REQUESTED, token-before-STARTED, STARTED grant, external-before-commit, release-pending and physical-before-semantic crash drills with fresh-process reconciliation.

- [ ] **Step 7: Preserve Evidence and perform trusted fixture cleanup**

Release only exact clean disposable Lease, finalize Evidence first, remove only registered fixture resources and retain acceptance report plus hashes. An inconclusive grant remains preserved and blocks cleanup.

- [ ] **Step 8: Promote only observed traceability and request Operator acceptance**

Update each M01 requirement's `realizedBy`, `verifiedBy`, `evidencedBy` and state only to the proof achieved. Run final exact-head GitHub Actions. Present all seven criteria, migration/rollback, runtime proof, limitations and PR diff. Do not mark M01 complete, merge PR #17 or start M02 without a separate exact Operator decision.

- [ ] **Step 9: Commit deterministic tests and later proof docs separately**

```bash
git add tests/integration
git commit -m "test: prove M01 fresh-process composition"
```

After the real proof:

```bash
git add docs .mnfs
git commit -m "docs: record M01 implementation evidence"
```

---

## Self-Review

### Coverage map

| Accepted design area | Task |
|---|---|
| IDs, states, errors and fixtures | 1 |
| process/durability/process identity | 2 |
| transaction authority | 3 |
| maintenance/backup/version gate | 4 |
| migration v4 and versioned Events | 5 |
| persistence, ancestry and idempotency | 6 |
| Track/Attempt/Run lifecycle | 7 |
| independent source and Git observation | 8 |
| exact Treehouse boundary | 9 |
| durable action helper | 10 |
| grant/release IAO and fencing | 11 |
| Claim OPEN and read-only Recovery | 12 |
| CLI/composition | 13 |
| deterministic plus real proof and closeout gate | 14 |

Every M01 requirement and every Task 14 Critical/Important correction has an implementation task and explicit proof.

### Placeholder and scope scan

The plan contains no `TODO`, `TBD`, symbolic date, deferred implementation phrase or unspecified test request. It explicitly excludes Pi, SEC-E1 production creation, Claim completion, Receipt, Gate, Integration, scheduler, broker, force/destroy/prune and automatic Recovery repair.

### Execution boundary

This plan is ready for review, not execution. Production implementation remains prohibited until the Operator approves exact plan version `1.0.1` and separately authorizes Task 1 RED.

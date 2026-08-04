---
id: DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
title: MIS-002 M01 Durable Execution and Lease Core
document_type: microdesign
form: explanation
authority: specification
status: proposed
version: 0.5.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DOC-CAPABILITY-ROADMAP
  - CAP-EXECUTION
  - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - ACCEPTANCE-M2-UNBLOCK
tracking_issue: 16
last_reviewed: 2026-08-04
---

# MIS-002/M01 — Durable Execution and Lease Core

## 1. Decision summary

M01 adds the smallest durable execution foundation required by the approved M2 contract:

```text
contract-bound Write Track
→ one current Attempt
→ distinct Worker Run identity
→ atomic durable Claim
→ local no-origin execution source
→ Treehouse Lease Intent–Action–Observation
→ fenced and non-destructive release
→ read-only Recovery/Reconcile
```

Authority remains explicit:

```text
Approved Mission Contract
→ execution scope and exact contract hash

SQLite
→ semantic execution, idempotency and Lease state

Git
→ source commit, result tree and code observations

ExecutionSourceAdapter
→ Track-owned local backing repository with no remote

Treehouse
→ managed worktree and external Lease identity

MNFS services
→ validation, transactions, action ownership, fencing and Recovery
```

M01 does not launch Pi. It persists the identities and invariants that M02 will consume for the real E1 Worker.

TC-01 produced canonical WSL2 `ACCEPT` Evidence for Treehouse `2.1.1` under the exact no-origin, controlled-HOME boundary. Version `0.5.0` makes that same boundary mandatory for production use. This design remains `proposed` until the Operator explicitly approves this exact version.

## 2. Approved baseline

```text
Mission:             MIS-002
Mission revision:    5
Schema:              2
Approved contract:   sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3
Capability:          CAP-EXECUTION 0.1.0 accepted
SEC-E1 definition:   sha256:f3dfca19f39bdd733f414831834a380b997e4938c10669c89a034cd9ad9c2471
R0-R4:               PASS
R5:                  IN_PROGRESS
TC-01 Verdict:       ACCEPT
```

M01 owns exactly:

```text
CAP-EXEC-REQ-001
CAP-EXEC-REQ-002
CAP-EXEC-REQ-004
CAP-EXEC-REQ-005
CAP-EXEC-REQ-006
CAP-EXEC-REQ-007
CAP-EXEC-REQ-008
```

M01 is constrained to one qualified Feature per Write Track. The broader Blueprint cardinalities remain future capability.

## 3. Outcome and proof boundary

M01 proves:

- one current Track for the bounded Feature;
- at most one current non-terminal Attempt per Track;
- Worker Run replacement without rewriting Attempt identity;
- Claim and matching Event atomicity;
- exact contract and lineage binding across Track, Attempt, Run, Lease and Claim;
- exact Attempt base commit and validated Claim result tree;
- no-origin local execution-source materialization without changing the canonical checkout;
- every Lease grant/release crash window;
- single-owner external action and duplicate acquisition prevention;
- internal and external release fencing;
- no dirty or unclassified work destroyed;
- orphan worktree and Lease-without-worktree reporting;
- fresh-process recovery without transcript or terminal parsing.

Canonical proof uses sequential Tracks:

```text
Track A
→ local execution source
→ grant/recovery/fenced clean release
→ explicit empty-Track abandonment

Track B
→ local execution source
→ Worker Run identity + atomic Claim
→ preserved for M02 disposition
```

Trusted test-fixture cleanup happens after Evidence and outside product semantics.

## 4. Non-goals

M01 does not implement Pi launch, production SEC-E1 creation, Current Authority Snapshot, Writer Pack, Worker completion, Receipt, Gate, Claim disposition, parallel Tracks, scheduler, generic lock service, Saga/workflow engine, broker, remote execution, credentials, network effects, destructive Recovery, Treehouse force/destroy/prune, Integration, delivery or Issue #15.

The Lease action owner is a narrow M01 safety mechanism, not a generic resource-reservation capability.

## 5. Architecture and authority

```text
CLI / future Lead
        |
        v
ExecutionService ─────────────┐
ClaimService ─────────────────┼── SqliteStore composition root
LeaseService ─────────────────┤          |
RecoveryService ──────────────┘          +── execution persistence
        |                                +── append-only Events
        |                                +── approved-contract lookup
        |
        +── ExecutionSourceAdapter
        +── TreehouseAdapter
        +── GitWorktreeInspector
        +── ProcessIdentityInspector
```

Rules:

1. services own semantic workflows;
2. stores own local atomicity;
3. adapters return observations, never domain state;
4. no external action occurs inside the domain SQLite transaction;
5. grant/release use Intent–Action–Observation;
6. an external action has one durable owner at a time;
7. Recovery is non-mutating by default;
8. ambiguous or destructive repair requires explicit authority;
9. the canonical checkout is observed but never used as Treehouse backing repository;
10. production behavior must remain inside the accepted TC-01 boundary.

| Concern | Authority |
|---|---|
| execution scope | Approved Mission Contract |
| semantic lifecycle | MNFS SQLite |
| canonical source commit | Git in canonical checkout |
| execution backing repository | MNFS-owned local Git repository |
| physical worktree | Treehouse + Git |
| semantic Lease | MNFS SQLite |
| external Lease ID/holder | Treehouse observation |
| process identity for action ownership | Linux process observation |
| Worker Run lifecycle | MNFS SQLite |
| Claim lifecycle | MNFS SQLite |
| acceptance | M02 MNFS Gate |

## 6. Production execution-source boundary

Treehouse must never run directly against the canonical checkout because that checkout normally has `origin`, while the accepted TC-01 boundary has no remote and no network or credential behavior.

`ExecutionSourceAdapter.prepare` receives:

```text
repository ID
Track ID
canonical checkout path
exact approved base commit SHA
Git object format
```

It creates or reopens a deterministic Track-owned repository below the Linux MNFS runtime root:

```text
<runtime-root>/execution-sources/<track-id>/source
```

Required properties:

- materialized only through local Git object transfer from the canonical checkout;
- no network protocol and no credential helper;
- no configured remotes after preparation;
- exactly one local `main` base ref and detached/clean base commit observation;
- exact `base_commit_sha` and `HEAD^{tree}` verified;
- canonical checkout snapshot equal before and after preparation;
- Linux-owned path, no symlink escape and no `/mnt` path;
- reusable only while Track, contract hash, object format and base commit remain exact;
- preserved until explicit Track disposition.

Treehouse receives this local repository as cwd. Its pool and HOME are Track-owned runtime paths. Treehouse user configuration is generated by MNFS under the controlled HOME and contains only the absolute pool root and approved non-hook settings. `XDG_CONFIG_HOME`, global Git config, system Git config and arbitrary host environment variables are absent or explicitly controlled. User-level Treehouse hooks cannot participate.

A mismatch, remote, unexpected config, changed base, changed canonical checkout or source-path escape fails before acquisition.

## 7. Identities and lifecycle

Stable public identities are allocated transactionally:

```text
Write Track  WT-001
Attempt      WT-001/A01
Worker Run   WT-001/A01/WR01
Claim        WT-001/A01/CLM01
Lease        LSE-001
```

```sql
CREATE TABLE entity_sequences (
  kind TEXT PRIMARY KEY CHECK (kind IN ('WRITE_TRACK', 'LEASE')),
  next_value INTEGER NOT NULL CHECK (next_value > 0)
);
```

Attempt, Run and Claim ordinals are parent-relative. Timestamp is never identity.

### Write Track

```text
ACTIVE
CLAIMED
ABANDONED
```

`ACTIVE` is created with A01. Opening a Claim moves it to `CLAIMED` atomically. `ACTIVE → ABANDONED` requires:

- no current Claim;
- no current Worker Run;
- no current Lease, or latest Lease `RELEASED`;
- no unclassified work;
- preserved required Evidence.

Lease release never silently closes a Track.

### Attempt

```text
OPEN
SUPERSEDED
CLOSED
CANCELLED
```

Only `OPEN` is current. Attempt owns `git_object_format` and `base_commit_sha`. Supersession atomically transitions the prior Attempt, creates the next ordinal and records both Events.

### Worker Run

```text
STARTING
RUNNING
IDLE
EXITED
LOST
CANCELLED
```

Only `STARTING`, `RUNNING` and `IDLE` are current. Replacement atomically terminalizes the previous current Run and inserts the next ordinal without changing Attempt identity. M01 exercises these interfaces through controlled observations; Pi starts in M02.

### Claim

```text
OPEN
COMPLETED_BY_WORKER
UNDER_VERIFICATION
ACCEPTED
REJECTED
SUPERSEDED
ABANDONED
```

M01 authorizes `OPEN` creation only. A Claim is bound to the exact Track lineage, current Attempt, selected Worker Run, active Lease, Attempt base commit and a verified Git tree object. It does not receive a fake disposition for cleanup.

### Lease

```text
REQUESTED
ACTIVE
RELEASE_PENDING
RELEASED
DIVERGED
```

`DIVERGED` remains current and blocks another Lease until explicit disposition.

## 8. Migration v4 and downgrade boundary

Migration v4 is additive except for the controlled `events` rebuild. It is tested against empty, M0, M1/v3 and exact revision-5 databases.

Before mutation:

1. close other MNFS writers;
2. create a byte-for-byte SQLite backup outside the migration transaction;
3. record database hash, schema version, approved contract hashes and row counts;
4. run `PRAGMA integrity_check` and require `ok`;
5. require the applied migration set to be exactly supported and gap-free;
6. reject a database newer than this binary in write mode.

The Events rebuild follows the SQLite generalized table-rebuild sequence:

1. create and seed `event_types`;
2. create `events_v4` with final constraints;
3. copy every existing Event with `payload_schema_version = 1` and preserved `seq`;
4. compare counts, IDs, payload hashes and sequence bounds;
5. drop old `events`;
6. rename `events_v4` to `events`;
7. recreate indexes;
8. run `PRAGMA foreign_key_check` and `PRAGMA integrity_check` before commit;
9. insert schema migration version 4 in the same transaction.

### Versioned Event registry

```sql
CREATE TABLE event_types (
  type TEXT NOT NULL,
  payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version > 0),
  PRIMARY KEY (type, payload_schema_version)
);
```

`events` gains:

```text
payload_schema_version INTEGER NOT NULL
FOREIGN KEY(type, payload_schema_version)
  REFERENCES event_types(type, payload_schema_version)
```

There is deliberately no default. Pre-v4 binaries omit this required column; every supported M0/M1 mutation already commits its matching Event in the same transaction, so the Event insert fails and the legacy mutation rolls back. This is the concrete downgrade write fence. Direct out-of-band SQL is not a supported product interface.

Existing version-1 types:

```text
MISSION_OPENED
PLAN_REVISION_SAVED
PLAN_APPROVED
```

M01 version-1 types:

```text
WRITE_TRACK_OPENED
WRITE_TRACK_ABANDONED
ATTEMPT_OPENED
ATTEMPT_SUPERSEDED
WORKER_RUN_OPENED
WORKER_RUN_STATE_CHANGED
CLAIM_OPENED
LEASE_REQUESTED
LEASE_ACTION_CLAIMED
LEASE_GRANTED
LEASE_RELEASE_REQUESTED
LEASE_RELEASED
LEASE_DIVERGED
RECOVERY_OBSERVED
```

Event payload version is immutable per Event. Adding a future payload version inserts another registry row; it never rewrites historical Events.

Rollback after schema v4 restores the recorded backup. Running a pre-v4 writer against the migrated database is prohibited even though its supported command mutations fail closed.

## 9. Relational model

### `write_tracks`

```text
id                      TEXT PRIMARY KEY
mission_id              TEXT NOT NULL REFERENCES missions(id)
milestone_qualified_id  TEXT NOT NULL
feature_qualified_id    TEXT NOT NULL
contract_hash           TEXT NOT NULL
git_object_format       TEXT NOT NULL CHECK IN ('sha1', 'sha256')
status                  TEXT NOT NULL
version                 INTEGER NOT NULL DEFAULT 1
created_at              TEXT NOT NULL
updated_at              TEXT NOT NULL
UNIQUE(id, contract_hash)
```

```sql
CREATE UNIQUE INDEX write_tracks_one_current_per_feature
ON write_tracks(mission_id, feature_qualified_id)
WHERE status IN ('ACTIVE', 'CLAIMED');
```

### `attempts`

```text
id, write_track_id, ordinal, contract_hash,
git_object_format, base_commit_sha, status,
version, created_at, updated_at
UNIQUE(write_track_id, ordinal)
UNIQUE(id, contract_hash)
UNIQUE(id, write_track_id, contract_hash)
UNIQUE(id, contract_hash, base_commit_sha)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
```

`base_commit_sha` is validated as a commit object in the Track execution source and its length must match `git_object_format`.

```sql
CREATE UNIQUE INDEX attempts_one_open_per_track
ON attempts(write_track_id)
WHERE status = 'OPEN';
```

### `worker_runs`

```text
id, attempt_id, ordinal, contract_hash, status,
process_boot_id, process_id, process_start_ticks,
process_started_at, exit_code,
version, created_at, updated_at
UNIQUE(attempt_id, ordinal)
UNIQUE(id, contract_hash)
UNIQUE(id, attempt_id, contract_hash)
FOREIGN KEY(attempt_id, contract_hash)
  REFERENCES attempts(id, contract_hash)
```

State-dependent validation requires complete process identity for `RUNNING` and `IDLE`; `EXITED` requires a recorded exit observation. PID alone is never a fence.

```sql
CREATE UNIQUE INDEX worker_runs_one_current_per_attempt
ON worker_runs(attempt_id)
WHERE status IN ('STARTING', 'RUNNING', 'IDLE');
```

### `leases`

```text
id, write_track_id, contract_hash, generation, status,
grant_idempotency_key, grant_input_hash,
holder, external_lease_id, worktree_path, external_leased_at,
action_kind, action_token,
action_owner_boot_id, action_owner_pid, action_owner_start_ticks,
release_requested_at, release_observed_at,
last_observed_at, last_error_code, last_error_ref,
version, created_at, updated_at
UNIQUE(write_track_id, generation)
UNIQUE(grant_idempotency_key)
UNIQUE(external_lease_id)
UNIQUE(id, contract_hash)
UNIQUE(id, write_track_id, contract_hash)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
```

`grant_input_hash` binds Track, generation, contract hash, base commit, holder, execution-source identity, Treehouse candidate and command-shape hash. Same key with different input is `LEASE_IDEMPOTENCY_CONFLICT`.

Lease invariants:

- `REQUESTED`: semantic intent exists; external identity may be absent; one action owner or none;
- `ACTIVE`: exact external ID, holder, path and leased timestamp are present; action owner cleared;
- `RELEASE_PENDING`: external identity retained and release intent persisted;
- `RELEASED`: external identity retained for audit, release observation recorded, action owner cleared;
- `DIVERGED`: all known semantic and physical observations are preserved.

```sql
CREATE UNIQUE INDEX leases_one_current_per_track
ON leases(write_track_id)
WHERE status IN ('REQUESTED', 'ACTIVE', 'RELEASE_PENDING', 'DIVERGED');

CREATE UNIQUE INDEX leases_one_action_token
ON leases(action_token)
WHERE action_token IS NOT NULL;
```

### `claims`

```text
id, write_track_id, attempt_id, worker_run_id, lease_id,
contract_hash, ordinal, status,
idempotency_key, input_hash,
base_commit_sha, result_tree_sha,
claimed_criteria_json, version, created_at, updated_at
UNIQUE(attempt_id, ordinal)
UNIQUE(idempotency_key)
UNIQUE(id, contract_hash)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
FOREIGN KEY(attempt_id, write_track_id, contract_hash)
  REFERENCES attempts(id, write_track_id, contract_hash)
FOREIGN KEY(worker_run_id, attempt_id, contract_hash)
  REFERENCES worker_runs(id, attempt_id, contract_hash)
FOREIGN KEY(lease_id, write_track_id, contract_hash)
  REFERENCES leases(id, write_track_id, contract_hash)
FOREIGN KEY(attempt_id, contract_hash, base_commit_sha)
  REFERENCES attempts(id, contract_hash, base_commit_sha)
```

These keys prove both exact contract and exact ancestry. A same-contract entity from another Track or Attempt cannot be attached to the Claim.

`result_tree_sha` must resolve as a Git `tree` object in the exact Track execution source. `claimed_criteria_json` is a canonical non-empty, duplicate-free array of criteria owned by the approved qualified Feature.

```sql
CREATE UNIQUE INDEX claims_one_current_per_attempt
ON claims(attempt_id)
WHERE status IN ('OPEN', 'COMPLETED_BY_WORKER', 'UNDER_VERIFICATION');
```

## 10. Transactions, idempotency and concurrency

All domain persistence shares one `DatabaseSync` connection owned by `SqliteStore`. Focused stores cannot open another domain database.

Use short `BEGIN IMMEDIATE` transactions. A competing writer can receive `SQLITE_BUSY`; retries are bounded with small jitter and end in a typed error. Mutable rows carry `version`; updates use compare-and-swap and zero rows produce `CONCURRENCY_CONFLICT`.

Atomic operations:

```text
Track + Attempt A01 + Events
Attempt supersession + new Attempt + Events
old current Run terminalization + replacement Run + Events
Track abandonment + Event
Claim OPEN + Track CLAIMED + Event
Lease intent/state transition + Event
```

Every idempotent command stores an input hash. Same key and same input returns the prior semantic result. Same key and different input fails. Event IDs are allocated once with the semantic operation and retries do not append duplicate facts.

No model, Git, Treehouse, filesystem scan or process wait occurs inside the domain transaction.

## 11. Lease action ownership

A durable Lease intent does not itself authorize every caller to perform the external action.

Before `get` or `return`, `LeaseService` claims one action owner using a CAS transaction and records:

```text
action_kind
action_token
Linux boot ID
PID
process start ticks
LEASE_ACTION_CLAIMED Event
```

Rules:

- only the caller whose exact action token was committed may invoke Treehouse;
- another caller with the same idempotency key observes the current owner;
- exact live owner → `LEASE_OPERATION_IN_PROGRESS`, no external action;
- owner absent or PID/start identity changed → fresh process may CAS takeover after first observing Treehouse state;
- owner identity unknown → block; never use a time-only expiry;
- if exact external Lease already exists, recovery commits the semantic outcome without another `get`;
- if release already completed physically, recovery commits `RELEASED` without another `return`;
- action ownership is cleared only with observed semantic completion or recorded divergence.

This is Lease-specific coordination and cannot be reused as a generic scheduler or resource registry.

## 12. Service boundaries

### `ExecutionService`

- resolve the exact latest approved contract and qualified target;
- resolve canonical Git object format and exact base commit;
- open Track and A01 atomically;
- prepare/revalidate the Track-owned no-origin execution source;
- replace a Worker Run atomically without rewriting Attempt identity;
- supersede an Attempt atomically when explicitly authorized;
- abandon an empty Track only after resource and Evidence guards;
- load the complete Track lineage.

### `ClaimService`

`openClaim` requires expected versions for Track, Attempt, Run and Lease; exact current lineage; exact contract hash; Attempt base commit; active matching Lease; result SHA resolving to a tree in the execution source; criteria owned by the Feature; and no current Claim.

It inserts Claim, moves Track to `CLAIMED` and writes `CLAIM_OPENED` in one transaction. Same idempotency key/input returns the existing Claim; conflicting input fails. No other Claim transition exists in M01.

### `LeaseService`

Only production component permitted to call `TreehouseAdapter`. It owns execution-source preflight, action ownership, grant/release IAO, semantic observation and fencing.

### `RecoveryService`

Loads expected state and adapter observations and produces a read-only report. It never acquires, returns, prunes, destroys, clears an action owner or changes semantic state.

Original operation services may apply narrowly defined repairs after re-observing current state and acquiring the exact action ownership.

## 13. Observation adapters

Canonical TC-01 Evidence accepted:

```text
Treehouse semantic version:       2.1.1
Observed executable realpath:     /usr/local/bin/treehouse
Treehouse executable SHA-256:     sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
Accepted command-shape SHA-256:   sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
Canonical Verdict:                ACCEPT — 15/15 PASS, no limitation
```

Accepted commands:

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <id> --if-lease-holder <holder>
```

Treehouse process contract:

- exact executable realpath, bytes, semantic version and capabilities before every protected operation;
- one lowercase raw `v` prefix may be canonicalized; other version text fails;
- exact argv, `shell: false`, closed stdin, explicit cwd, timeout and bounded output;
- controlled Linux-only PATH;
- Track-owned HOME and Treehouse user config with no hooks;
- disabled global/system Git configuration and credential prompts;
- no arbitrary host environment, XDG config, Windows path or mount;
- strict UTF-8 JSON for acquisition/status;
- fresh status plus Git/filesystem observations for semantic decisions;
- no force, destroy, broad prune, stderr-state inference or Git fallback;
- cwd is always the verified no-origin execution source.

Any change in candidate bytes/version/capabilities, Git, Node, Ubuntu/WSL identity, environment shape or command shape invalidates reuse and returns the adapter to conformance review.

The observed executable path is Evidence, not a globally fixed installation path; production resolves the path but requires the accepted bytes.

### Git observation boundary

`GitWorktreeInspector` is read-only and permits only exact commands such as:

```text
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse --git-common-dir
git rev-parse --show-object-format
git status --porcelain=v1 -z --untracked-files=all
git worktree list --porcelain
git cat-file -e <sha>^{commit}
git cat-file -e <sha>^{tree}
git cat-file -t <sha>
```

It does not use `write-tree`, reset, clean, checkout, commit, fetch or ref mutation. Materializing a future Worker result tree belongs to a separate trusted M02 operation, not this inspector.

Repository and observation equality use canonical JSON: object key order is irrelevant; array order, paths, modes, bytes and hashes remain semantic.

## 14. Lease grant IAO

For `WT-001`, generation 1:

```text
grant_idempotency_key = lease:grant:WT-001:g1
holder = mnfs-<repo-id-hash>-lse001-g1
```

Flow:

```text
1. validate Track, Attempt, contract, base and Treehouse freshness
2. prepare/revalidate no-origin execution source and controlled HOME/pool
3. transaction: insert/reuse LSE-001 REQUESTED + LEASE_REQUESTED
4. observe Treehouse by deterministic holder
5. one exact match → validate and commit ACTIVE
6. no match → claim exact action owner
7. invoke JSON acquisition once
8. validate path containment, linked-worktree ownership, Lease ID, holder and source
9. fresh status and Git observation
10. transaction: REQUESTED → ACTIVE + external identity + LEASE_GRANTED; clear owner
```

Crash windows:

- Intent only: original retry observes, claims owner and may acquire.
- Owner claimed before action: live owner blocks another action; dead owner can be safely taken over.
- External Lease before semantic commit: deterministic holder and fresh status recover the exact allocation without another acquisition.
- Commit before response: retry returns ACTIVE.
- Multiple external matches, conflicting input or ambiguous owner: DIVERGED or blocked; no further acquisition.

Generic Recovery never adopts or claims action ownership.

## 15. Lease release

Preconditions:

- ACTIVE Lease with expected version and generation;
- exact internal ID, external ID, holder, path and source identity;
- Treehouse freshness unchanged;
- no current Worker Run and no matching live process;
- no current Claim;
- worktree path is the exact linked worktree;
- Git status is clean and source/worktree observations contain no unclassified mutation;
- fresh Treehouse status matches the exact Lease.

Dirty or ambiguous work returns `LEASE_RELEASE_BLOCKED_DIRTY` or `LEASE_RELEASE_BLOCKED_UNKNOWN` without invoking Treehouse.

Flow:

```text
1. reconcile local and physical preconditions
2. transaction: ACTIVE → RELEASE_PENDING + LEASE_RELEASE_REQUESTED
3. claim exact RELEASE action owner
4. conditional Treehouse return
5. fresh status and Git/filesystem observation
6. managed path available with no Lease:
   transaction RELEASE_PENDING → RELEASED + LEASE_RELEASED; clear owner
7. different identity, missing/unmanaged path or insufficient observation:
   transaction → DIVERGED + LEASE_DIVERGED; preserve work and owner evidence
```

Retry:

- RELEASED returns the prior semantic result.
- RELEASE_PENDING always observes before considering another return.
- exact live action owner blocks a competing caller.
- dead owner may be taken over only after observation and CAS.
- matching current Lease may retry the same conditional return.
- different ID, holder, generation or path is `LEASE_FENCE_CONFLICT`.
- managed available path proves completion.
- missing/unmanaged path is `LD-05`, never automatic success.

After release, the empty Track remains `ACTIVE` until explicit abandonment.

## 16. Recovery and one-to-one reconciliation

`mnfs recover [--track WT-001]` is read-only.

Reconcile canonicalizes every path, validates containment and compares current semantic Leases with Treehouse status using this order:

1. exact external Lease ID;
2. exact holder and path as corroborating fields;
3. exact Git common directory and execution-source ownership;
4. process list and worktree state.

External IDs, paths and holders must map one-to-one. Duplicate IDs, duplicate paths, multiple holder matches, malformed status items or path escapes are `UNKNOWN`/`DIVERGED`; no first-match selection is allowed.

| Code | Meaning | Default action |
|---|---|---|
| `HEALTHY` | exact semantic/physical identity match | none |
| `ADOPTABLE` | REQUESTED plus same input has exactly one matching external Lease | original grant retry may commit |
| `LD-01` | current semantic Lease, external Lease absent | block |
| `LD-02` | MNFS-like external worktree/Lease without semantic owner | preserve/operator decision |
| `LD-03` | external Lease ID differs | block |
| `LD-04` | holder differs | block |
| `LD-05` | path missing, unmanaged, escaped or not a real linked worktree | preserve/operator decision |
| `LD-06` | duplicate or non-bijective external identity | preserve/operator decision |
| `UNKNOWN` | observation insufficient or action owner cannot be proven | block |

Reports contain expected state, every observed candidate, observation hashes, severity, safe actions, recommendation and required authority. Plain recovery changes nothing.

## 17. CLI

```text
mnfs track open
  --mission MIS-002 --milestone M01 --feature F01
  --contract sha256:... [--json]

mnfs track show --track WT-001 [--json]
mnfs track abandon --track WT-001 --expected-version <n> [--json]

mnfs lease grant
  --track WT-001 --idempotency-key <key> [--json]

mnfs lease show --lease LSE-001 [--json]

mnfs lease release
  --lease LSE-001 --expected-version <n>
  --idempotency-key <key> [--json]

mnfs recover [--track WT-001] [--json]
```

Run and Claim services remain typed internal interfaces exercised by tests; production commands arrive in M02.

Every exposed command has stable human/JSON output, typed error, stable exit class and concrete next action.

## 18. Errors

```text
EXECUTION_TARGET_INVALID
EXECUTION_CONTRACT_CONFLICT
EXECUTION_SOURCE_INVALID
EXECUTION_SOURCE_CHANGED
EXECUTION_SOURCE_REMOTE_PRESENT
SCHEMA_VERSION_UNSUPPORTED
SCHEMA_MIGRATION_INVALID
WRITE_TRACK_CONFLICT
WRITE_TRACK_NOT_ABANDONABLE
ATTEMPT_CONFLICT
WORKER_RUN_CONFLICT
CLAIM_CONFLICT
CLAIM_IDEMPOTENCY_CONFLICT
CLAIM_RESULT_TREE_INVALID
CONCURRENCY_CONFLICT
LEASE_CONFLICT
LEASE_IDEMPOTENCY_CONFLICT
LEASE_OPERATION_IN_PROGRESS
LEASE_OPERATION_OWNER_UNKNOWN
LEASE_FENCE_CONFLICT
LEASE_RELEASE_BLOCKED_DIRTY
LEASE_RELEASE_BLOCKED_UNKNOWN
TREEHOUSE_NOT_FOUND
TREEHOUSE_VERSION_UNSUPPORTED
TREEHOUSE_COMMAND_FAILED
TREEHOUSE_TIMEOUT
TREEHOUSE_OUTPUT_INVALID
TREEHOUSE_OBSERVATION_CONFLICT
GIT_WORKTREE_INVALID
GIT_OBJECT_INVALID
RECOVERY_DIVERGENCE
```

Raw output is stored only by bounded Artifact reference when required.

## 19. Design coverage matrix

| Requirement | Design | Failure | Verification |
|---|---|---|---|
| REQ-001 | Attempt lifecycle + unique partial index + atomic supersession | duplicate OPEN rollback | unit/migration/fresh process |
| REQ-002 | separate Attempt/Run IDs + atomic replacement | new Run preserves Attempt/history | replacement and late-owner tests |
| REQ-004 | Claim/Track/Event transaction + idempotency | Event/state failure rolls back | injected conflict and duplicate-key tests |
| REQ-005 | exact approval lookup + base commit + lineage FKs | stale contract, cross-lineage or wrong base rejected | service/FK/Replan tests |
| REQ-006 | no-origin source + action ownership + Lease IAO | every owner/action crash window classified | unit matrix + accepted TC-01 Evidence |
| REQ-007 | generation + input hash + process/action fence + external fence | stale caller cannot release; dirty preserved | unit matrix + TC-01 S08–S11 |
| REQ-008 | bijective read-only Reconcile + LD taxonomy | ambiguity blocks and preserves | DR-04/DR-05/duplicate identity/fresh process |

All seven requirements now have exact state, service, failure and proof coverage. The external candidate uncertainty is closed; explicit Operator approval of this version remains the R5 gate.

## 20. Verification

TDD is mandatory.

### Migration

- empty, M0, M1/v3 and exact revision-5 databases;
- backup and preflight failure;
- Event IDs, sequence, payloads and counts preserved;
- `payload_schema_version` copied as 1;
- all indexes and FKs recreated;
- `foreign_key_check` and `integrity_check` pass;
- migration rollback leaves v3 unchanged;
- pre-v4 command write fails and its transaction rolls back;
- newer schema rejected in write mode;
- fresh v4 process recovers exact M0/M1 state.

### Domain and relational integrity

- ID allocation and lifecycle transitions;
- one current Track/Feature, Attempt/Track, Run/Attempt, Lease/Track and Claim/Attempt;
- cross-Track Lease and cross-Attempt Run cannot attach to Claim;
- Attempt base commit and Claim base equality;
- result SHA must be a tree in the exact source;
- Track abandonment guards;
- optimistic conflicts;
- Claim/Event and Track/Attempt atomicity;
- idempotency same-input replay and different-input conflict.

### Execution source and adapters

- canonical checkout unchanged before/after source preparation;
- local transfer works with network disabled and credential helpers rejected;
- prepared source has no remote and exact base;
- controlled HOME contains no hooks or inherited config;
- Treehouse never receives canonical checkout cwd;
- mandatory candidate freshness and command-shape validation;
- read-only Git allowlist contains no `write-tree`, fetch or mutation.

### Lease and Recovery

- every grant/release crash window;
- two simultaneous same-key grants invoke Treehouse at most once;
- live action owner blocks; dead exact owner can be taken over; unknown owner blocks;
- external completion before semantic commit is recovered without duplicate action;
- stale internal/external fence rejected;
- dirty and ambiguous work preserved;
- exact one-to-one reconciliation;
- duplicate ID/path/holder classified, never first-matched;
- Recovery is byte-for-byte non-mutating.

### Canonical proof

```text
Scenario A
A1 open Track + Attempt at exact base; materialize no-origin source; grant
A2 terminate at each named owner/action window; fresh process reconciles
A3 fenced clean release; explicit Track abandonment
A4 recover ABANDONED Track and RELEASED Lease; repeated release is idempotent

Scenario B
B1 open next Track + Attempt + Run identity; materialize source; grant
B2 atomic Claim bound to exact lineage, base and result tree
B3 fresh process recovers identical Track/Attempt/Run/Lease/Claim
product cleanup: none; preserved for M02
trusted test-fixture cleanup: after Evidence, outside product semantics
```

Pi and production SEC-E1 dispatch remain absent.

## 21. Observability, security and rollback

Record Domain Events with payload version, durations, adapter exit classes, bounded Artifact refs, execution-source identity, Treehouse version/hash, action-owner identity, Recovery classifications, entity versions and next action.

Security invariants:

- canonical checkout is never Treehouse cwd;
- no-origin execution source;
- local object transfer only;
- no network or credential helper;
- controlled HOME/config with no Treehouse hooks;
- exact argv/cwd/env and no shell interpolation;
- no force, destroy or prune;
- strict untrusted-output validation;
- realpath and ownership verification;
- ambiguous identity fails closed;
- no secret reads or unbounded logs.

Rollout:

```text
accepted TC-01 Evidence
→ final review and Operator approval of 0.5.0
→ separate implementation plan
→ migration/domain with fakes
→ execution-source proof
→ real grant/recovery/release
→ M01 composition proof
```

Rollback restores the pre-migration backup or performs a separately reviewed forward repair. It never performs automatic worktree cleanup. Execution sources and worktrees remain preserved until explicit safe disposition.

## 22. Target files

```text
src/execution/ids.ts
src/execution/model.ts
src/execution/transitions.ts
src/store/sqlite-transaction.ts
src/store/execution-store.ts
src/adapters/execution-source.ts
src/adapters/treehouse.ts
src/adapters/git-worktree.ts
src/adapters/process-identity.ts
src/services/execution-service.ts
src/services/claim-service.ts
src/services/lease-service.ts
src/services/recovery-service.ts
src/cli/args.ts
src/cli/main.ts
src/cli/entry.ts
src/domain/errors.ts
src/store/migrations.ts
src/store/sqlite-store.ts
```

Tests mirror responsibilities. The implementation plan may refine filenames without changing behavior, authority or the no-origin boundary.

## 23. R5 gate and impact

R5 remains `IN_PROGRESS` until the Operator explicitly approves this exact microdesign version.

```text
Research:                    PUBLISHED
TC-01 protocol:              ACCEPTED
TC-01 canonical Evidence:    ACCEPT — 15/15 PASS, cleanup COMPLETED
Treehouse candidate:         ACCEPTED ONLY INSIDE PROVED BOUNDARY
M01 microdesign:             PROPOSED — version 0.5.0
M01 implementation:          PROHIBITED
Pi Worker dispatch:          PROHIBITED
Current gate:                explicit Operator decision on version 0.5.0
```

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
    - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
    - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
    - DOC-PRODUCT-BLUEPRINT-02
    - DOC-PRODUCT-BLUEPRINT-08
    - DOC-PROJECT-STATUS
    - TRACKING-WORKLOG
  rationale: "Final R5 review closes the production no-origin boundary, relational lineage, migration downgrade fence, Lease action ownership and exact Recovery matching."
  follow_up:
    issue: 16

requirements_impact:
  status: UPDATED
  affected:
    - CAP-EXEC-REQ-001
    - CAP-EXEC-REQ-002
    - CAP-EXEC-REQ-004
    - CAP-EXEC-REQ-005
    - CAP-EXEC-REQ-006
    - CAP-EXEC-REQ-007
    - CAP-EXEC-REQ-008
  rationale: "Every M01 requirement has exact final proposed state, service, failure and verification coverage; implementation remains prohibited pending Operator approval."
```

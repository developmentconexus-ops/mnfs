---
id: DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
title: MIS-002 M01 Durable Execution and Lease Core
document_type: microdesign
form: explanation
authority: specification
status: proposed
version: 0.6.0
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
→ Attempt-owned no-origin execution source
→ distinct Worker Run identity
→ atomic durable Claim
→ Treehouse Lease Intent–Action–Observation
→ trusted action helper and external fencing
→ non-destructive release
→ read-only Recovery/Reconcile
```

Authority remains explicit:

```text
Approved Mission Contract
→ execution scope and exact contract hash

SQLite
→ semantic execution, idempotency and Lease state

Git
→ canonical base commit, result tree and code observations

ExecutionSourceAdapter
→ Attempt-owned independent local Git repository with no remote

Treehouse
→ managed worktree and external Lease identity

LeaseActionRunner
→ one bounded external Treehouse invocation and durable raw result

MNFS services
→ validation, transactions, action ownership, fencing and Recovery
```

M01 does not launch Pi. It persists the identities and invariants that M02 will consume for the real E1 Worker.

TC-01 produced canonical WSL2 `ACCEPT` Evidence for Treehouse `2.1.1` under a no-origin, controlled-HOME boundary. Version `0.6.0` makes that same boundary mandatory for production use and closes the final R5 review findings. This design remains `proposed` until the Operator explicitly approves this exact version.

## 2. Approved baseline and owned requirements

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

M01 is constrained to one qualified Feature per Write Track. Multiple Features per Track, parallel Tracks and generic resource reservations remain later capability.

## 3. Outcome and proof boundary

M01 proves:

- one current Track for the bounded Feature;
- at most one current non-terminal Attempt per Track;
- Worker Run replacement without rewriting Attempt identity;
- Claim and matching Domain Event atomicity;
- exact contract and ancestry binding across Track, Attempt, Run, Lease and Claim;
- exact Attempt base commit and validated Claim result tree;
- idempotent Attempt-owned source materialization without mutating the canonical checkout;
- no-origin, independent Git object storage and controlled hook/config boundary;
- every source, Lease grant and Lease release crash window;
- at most one live helper for one external action token;
- no automatic repetition of an inconclusive acquisition;
- internal and external release fencing;
- no dirty or unclassified work destroyed;
- orphan worktree and Lease-without-worktree reporting;
- fresh-process recovery without transcript or terminal parsing.

Canonical proof uses sequential Tracks:

```text
Track A
→ Attempt A01 + independent local source
→ grant/recovery/fenced clean release
→ explicit empty-Track abandonment

Track B
→ Attempt A01 + independent local source
→ Worker Run identity + atomic Claim
→ preserved for M02 disposition
```

Trusted test-fixture cleanup happens after Evidence and outside product semantics.

## 4. Non-goals

M01 does not implement Pi launch, production SEC-E1 creation, Current Authority Snapshot, Writer Pack, Worker completion, Receipt, Gate, Claim disposition, parallel Tracks, scheduler, generic lock service, Saga/workflow engine, broker, remote execution, credentials, network effects, destructive Recovery, Treehouse force/destroy/prune, Integration, delivery or Issue #15.

The Lease action token and helper are narrow external-operation safety mechanisms, not a reusable scheduler or resource registry.

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
        +── LeaseActionRunner
        +── ProcessIdentityInspector
```

Rules:

1. services own semantic workflows;
2. stores own local atomicity;
3. adapters return observations, never domain state;
4. no Git, filesystem scan, Treehouse action or process wait occurs inside a domain transaction;
5. source preparation and Lease grant/release use explicit Intent–Action–Observation;
6. one external action token has at most one live trusted helper;
7. Recovery is non-mutating by default;
8. ambiguous or destructive repair requires explicit authority;
9. the canonical checkout is observed but never used as Treehouse backing repository;
10. production behavior must remain inside the accepted TC-01 boundary.

| Concern | Authority |
|---|---|
| execution scope | Approved Mission Contract |
| semantic lifecycle | MNFS SQLite |
| canonical source commit | Git in canonical checkout |
| execution backing repository | MNFS-owned independent local Git repository |
| physical worktree | Treehouse + Git |
| semantic Lease | MNFS SQLite |
| external Lease ID/holder | Treehouse observation |
| external action execution | trusted LeaseActionRunner observation |
| process identity | Linux boot ID + PID + start ticks |
| Worker Run lifecycle | MNFS SQLite |
| Claim lifecycle | MNFS SQLite |
| acceptance | M02 MNFS Gate |

## 6. Attempt-owned execution source

Treehouse must never run directly against the canonical checkout. The canonical checkout normally has `origin`; the accepted TC-01 boundary had no remote, no network and no credential behavior.

`ExecutionSourceAdapter.prepare` receives:

```text
repository ID
Track ID
Attempt ID
canonical checkout path
exact approved base commit SHA
Git object format
```

It creates or reopens:

```text
<runtime-root>/execution-sources/<track-id>/<attempt-id>/source
```

### Source Intent–Action–Observation

```text
1. transaction: Attempt source_status = REQUESTED + EXECUTION_SOURCE_REQUESTED
2. create a sibling temporary repository under the same Linux parent
3. transfer only local Git objects using an explicit controlled Git environment
4. create local main at the exact base commit and materialize a clean working tree
5. remove every remote and reject executable hooks or inherited hook paths
6. verify independent common dir/object database, no alternates and no hardlinks to canonical objects
7. verify exact object format, HEAD, HEAD^{tree}, clean status and zero remotes
8. compare the canonical checkout snapshot before/after
9. atomically rename the completed temporary source to the final deterministic path
10. transaction: source_status = READY + fingerprint + EXECUTION_SOURCE_READY
```

Required properties:

- Linux-owned path with no symlink or `/mnt` escape;
- only local object transfer; no URL, network protocol or credential helper;
- `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, prompts disabled and controlled empty hooks path;
- no remote, alternates file, shared common directory, borrowed object store or hardlinked object file;
- local `main` points to the exact base commit and is the clean current branch expected by Treehouse;
- exact `base_commit_sha`, `HEAD^{tree}` and object format verified;
- canonical checkout byte/Git snapshot equal before and after;
- final path is immutable for the Attempt and preserved until explicit Track disposition.

Crash handling:

- REQUESTED with no final path: remove only a recognized Track-scoped incomplete temp after inspection, then retry;
- complete final path with matching fingerprint: commit READY without rebuilding;
- conflicting final path, unexpected remote/config/object sharing or canonical source mutation: mark source `DIVERGED` and preserve;
- source READY can never be silently repointed to another base.

Attempt supersession requires no current Run, Claim or Lease and creates a new Attempt-owned source. It never resets the prior source in place.

Treehouse receives the READY source as cwd. Pool, HOME, XDG config and empty hooks directory are Attempt-owned runtime paths. Treehouse user config contains only the absolute pool root and approved non-hook settings. Arbitrary host variables and user-level Treehouse hooks cannot participate.

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
- preserved required Evidence and source observations.

Lease release never silently closes a Track.

### Attempt

```text
OPEN
SUPERSEDED
CLOSED
CANCELLED
```

Independent source state:

```text
REQUESTED
READY
DIVERGED
```

Only `OPEN` is current. Attempt owns object format, exact base commit, source path and source fingerprint. Supersession atomically transitions the prior Attempt, creates the next ordinal and records both Events after physical preconditions prove no current resource or unclassified work.

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

M01 authorizes `OPEN` creation only. A Claim is bound to the exact Track, current Attempt, selected Worker Run, active Lease, Attempt base commit and a verified Git tree object. It does not receive a fake disposition for cleanup.

### Lease

```text
REQUESTED
ACTIVE
RELEASE_PENDING
RELEASED
DIVERGED
```

A Lease belongs to one Track and the exact current Attempt/source generation. `DIVERGED` remains current and blocks another Lease until explicit disposition.

## 8. Migration v4 and downgrade boundary

Migration v4 is additive except for a controlled `events` rebuild. It is tested against empty, M0, M1/v3 and exact revision-5 databases.

Before mutation:

1. close other MNFS writers;
2. create a byte-for-byte SQLite backup outside the migration transaction;
3. record database hash, schema/user version, approved contract hashes and row counts;
4. run `PRAGMA integrity_check` and require `ok`;
5. require the applied migration set to be supported, ordered and gap-free;
6. reject a database newer than this binary in write mode.

The Events rebuild follows the SQLite generalized table-rebuild sequence:

1. create and seed `event_types`;
2. create `events_v4` with final constraints;
3. copy every existing Event with `payload_schema_version = 1` and preserved `seq`;
4. compare counts, Event IDs, payload hashes and sequence bounds;
5. drop old `events`;
6. rename `events_v4` to `events`;
7. recreate indexes;
8. run `PRAGMA foreign_key_check` and `PRAGMA integrity_check` before commit;
9. insert migration 4 and set `PRAGMA user_version = 4` in the same maintenance operation.

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

There is deliberately no default. Pre-v4 binaries omit this required column; every supported M0/M1 mutation commits its matching Event in the same transaction, so Event insertion fails and the legacy mutation rolls back. This is the concrete downgrade write fence. Direct out-of-band SQL is not a supported product interface.

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
EXECUTION_SOURCE_REQUESTED
EXECUTION_SOURCE_READY
EXECUTION_SOURCE_DIVERGED
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

Event payload version is immutable per Event. A future version adds another registry row and never rewrites history.

Rollback after schema v4 restores the recorded backup. Running a pre-v4 writer against the migrated database is prohibited even though supported old command mutations fail closed.

## 9. Relational model

### `write_tracks`

```text
id                      TEXT PRIMARY KEY
mission_id              TEXT NOT NULL REFERENCES missions(id)
milestone_qualified_id  TEXT NOT NULL
feature_qualified_id    TEXT NOT NULL
contract_hash           TEXT NOT NULL
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
git_object_format, base_commit_sha,
source_status, source_path, source_fingerprint,
status, version, created_at, updated_at
UNIQUE(write_track_id, ordinal)
UNIQUE(id, contract_hash)
UNIQUE(id, write_track_id, contract_hash)
UNIQUE(id, contract_hash, base_commit_sha)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
CHECK (git_object_format IN ('sha1', 'sha256'))
```

State rules:

- REQUESTED source: final identity may be null, but deterministic expected path is derivable;
- READY source: absolute contained path and fingerprint are required;
- DIVERGED source: all observations and error Artifact refs are preserved;
- SHA length must match object format;
- base SHA resolves as a commit in both canonical repository and READY source.

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

Complete process identity is required for `RUNNING` and `IDLE`; `EXITED` requires an exit observation. PID alone is never a fence.

```sql
CREATE UNIQUE INDEX worker_runs_one_current_per_attempt
ON worker_runs(attempt_id)
WHERE status IN ('STARTING', 'RUNNING', 'IDLE');
```

### `leases`

```text
id, write_track_id, attempt_id, contract_hash, generation, status,
grant_idempotency_key, grant_input_hash,
release_idempotency_key, release_input_hash,
holder, external_lease_id, worktree_path, external_leased_at,
action_kind, action_token, action_phase,
action_owner_boot_id, action_owner_pid, action_owner_start_ticks,
action_runner_boot_id, action_runner_pid, action_runner_start_ticks,
action_started_ref, action_result_ref,
release_requested_at, release_observed_at,
last_observed_at, last_error_code, last_error_ref,
version, created_at, updated_at
UNIQUE(write_track_id, generation)
UNIQUE(grant_idempotency_key)
UNIQUE(release_idempotency_key)
UNIQUE(external_lease_id)
UNIQUE(id, contract_hash)
UNIQUE(id, write_track_id, contract_hash)
UNIQUE(id, attempt_id, write_track_id, contract_hash)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
FOREIGN KEY(attempt_id, write_track_id, contract_hash)
  REFERENCES attempts(id, write_track_id, contract_hash)
```

`grant_input_hash` binds Track, Attempt, generation, contract hash, base commit, source fingerprint, holder, Treehouse candidate and command-shape hash.

`release_input_hash` binds Lease identity, expected version/generation, Attempt/source, external ID, holder, path, Treehouse candidate and command-shape hash.

Same key/same input returns the prior semantic outcome. Same key/different input is `LEASE_IDEMPOTENCY_CONFLICT`.

Lease state rules:

- `REQUESTED`: grant intent exists; external identity may be absent;
- `ACTIVE`: exact external ID, holder, path and leased timestamp are present;
- `RELEASE_PENDING`: external identity retained and release intent/key persisted;
- `RELEASED`: external identity retained for audit and release observation recorded;
- `DIVERGED`: every known semantic, helper and physical observation is preserved.

Action state rules:

- `action_kind` is `GRANT` or `RELEASE` only while an action is unresolved;
- `action_phase` is `CLAIMED`, `STARTED` or `FINISHED`;
- token is unique and binds the exact input hash;
- `STARTED` requires a durable started Artifact written before Treehouse invocation;
- `FINISHED` requires a bounded result Artifact;
- action fields clear only with semantic completion; divergence preserves them.

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
FOREIGN KEY(lease_id, attempt_id, write_track_id, contract_hash)
  REFERENCES leases(id, attempt_id, write_track_id, contract_hash)
FOREIGN KEY(attempt_id, contract_hash, base_commit_sha)
  REFERENCES attempts(id, contract_hash, base_commit_sha)
```

These keys prove exact contract and exact ancestry. A same-contract entity from another Track or Attempt cannot be attached to a Claim.

`result_tree_sha` must resolve as a Git `tree` object in the exact READY execution source. `claimed_criteria_json` is a canonical non-empty, duplicate-free array of criteria owned by the approved qualified Feature.

```sql
CREATE UNIQUE INDEX claims_one_current_per_attempt
ON claims(attempt_id)
WHERE status IN ('OPEN', 'COMPLETED_BY_WORKER', 'UNDER_VERIFICATION');
```

## 10. Transactions, idempotency and concurrency

All domain persistence shares one `DatabaseSync` connection owned by `SqliteStore`. Focused stores cannot open another domain database.

Use short `BEGIN IMMEDIATE` transactions. `SQLITE_BUSY` retries are bounded with small jitter and end in a typed error. Mutable rows carry `version`; updates use compare-and-swap and zero rows produce `CONCURRENCY_CONFLICT`.

Atomic operations:

```text
Track + Attempt A01 + Events
Attempt source intent/state + Event
Attempt supersession + new Attempt + Events
old current Run terminalization + replacement Run + Events
Track abandonment + Event
Claim OPEN + Track CLAIMED + Event
Lease intent/state transition + Event
Lease action-token claim + Event
```

Every idempotent command stores an input hash. Same key/same input returns the prior semantic result. Same key/different input fails. Event IDs are allocated once with the semantic operation and retries do not append duplicate facts.

No model, Git, Treehouse, filesystem scan or process wait occurs inside the domain transaction.

## 11. Trusted LeaseActionRunner

A durable Lease intent does not authorize every caller to invoke Treehouse. Only a trusted helper bound to the committed action token may execute one external command.

### Claim and launch

```text
1. LeaseService CAS-claims action_kind + action_token + exact input hash
2. record owner Lead boot ID/PID/start ticks and LEASE_ACTION_CLAIMED
3. spawn the fixed LeaseActionRunner with a token-scoped operation file
4. runner writes and fsyncs STARTED Artifact before invoking Treehouse
5. runner records its boot ID/PID/start ticks in the Artifact
6. runner invokes exactly one accepted Treehouse command
7. runner writes bounded raw result + FINISHED Artifact and exits
8. LeaseService or a fresh process observes helper Artifact, Treehouse and Git
9. semantic transaction commits outcome or divergence
```

The runner does not mutate domain SQLite. Its operation file is immutable, run-scoped, outside Worker authority and contains only exact argv/cwd/env hashes and Artifact destinations.

### Recovery rules

- exact live Lead before helper launch blocks takeover;
- exact live helper blocks every competing action;
- owner dead and no helper/STARTED Artifact means the action was not started; after fresh status observation a caller may CAS a new token;
- STARTED Artifact means Treehouse may have been invoked;
- GRANT STARTED with no decisive exact Lease outcome is `UNKNOWN` and is never automatically invoked again;
- GRANT STARTED with one exact matching Lease commits `ACTIVE` without another `get`;
- RELEASE STARTED observes first; conditional return may be retried only when the exact current Lease remains, no helper is live and the same release input/fence still holds;
- FINISHED result is advisory until fresh Treehouse/Git state confirms semantics;
- missing, conflicting or non-bijective helper/process evidence blocks;
- clock age alone never authorizes takeover.

This closes the parent-death/child-survival window while remaining a narrow M01 mechanism.

## 12. Service boundaries

### `ExecutionService`

- resolve exact latest approved contract and qualified target;
- resolve canonical Git object format and exact base commit;
- open Track and A01 atomically;
- resume or prepare the Attempt-owned independent no-origin source;
- replace Worker Run atomically without rewriting Attempt identity;
- supersede Attempt atomically only after physical/resource guards;
- abandon empty Track only after resource, source and Evidence guards;
- load complete Track lineage.

### `ClaimService`

`openClaim` requires expected versions for Track, Attempt, Run and Lease; exact current ancestry; exact contract; Attempt base commit; READY source; active matching Lease; result SHA resolving to a tree in that source; criteria owned by the Feature; and no current Claim.

It inserts Claim, moves Track to `CLAIMED` and writes `CLAIM_OPENED` in one transaction. Same idempotency key/input returns the existing Claim; conflicting input fails. No other Claim transition exists in M01.

### `LeaseService`

Only component permitted to prepare a Treehouse operation and consume LeaseActionRunner results. It owns source preflight, action-token ownership, grant/release IAO, semantic observation and fencing.

### `RecoveryService`

Loads expected state, source/helper/process/Treehouse/Git observations and produces a read-only report. It never creates a source, claims an action token, launches a helper, acquires, returns, prunes, destroys, clears ownership or changes semantic state.

Original operation services may apply narrowly defined repairs only after fresh observation and exact idempotency/fencing validation.

## 13. Observation adapters

Canonical TC-01 Evidence accepted:

```text
Treehouse semantic version:       2.1.1
Observed executable realpath:     /usr/local/bin/treehouse
Treehouse executable SHA-256:     sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
Accepted command-shape SHA-256:   sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
Canonical Verdict:                ACCEPT — 15/15 PASS, no limitation
```

Accepted Treehouse commands:

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
- Attempt-owned HOME, XDG config, pool and empty hooks directory;
- disabled global/system Git configuration and credential prompts;
- no arbitrary host environment, Windows path or mount;
- strict UTF-8 JSON for acquisition/status;
- fresh status plus Git/filesystem observations for semantic decisions;
- no force, destroy, broad prune, stderr-state inference or Git fallback;
- cwd is always the verified READY no-origin source.

Any change in candidate bytes/version/capabilities, Git, Node, Ubuntu/WSL identity, environment shape or command shape invalidates reuse and returns the adapter to conformance review.

The observed executable path is Evidence, not a fixed install path; production resolves the path but requires the accepted bytes.

### Git observation boundary

`GitWorktreeInspector` is read-only and permits only exact commands such as:

```text
git rev-parse HEAD
git rev-parse HEAD^{tree}
git rev-parse --git-common-dir
git rev-parse --show-object-format
git status --porcelain=v1 -z --untracked-files=all
git worktree list --porcelain
git remote
git cat-file -e <sha>^{commit}
git cat-file -e <sha>^{tree}
git cat-file -t <sha>
```

It does not use `write-tree`, reset, clean, checkout, commit, fetch or ref mutation. Future Worker-result tree materialization belongs to a separate trusted M02 operation.

Repository and observation equality use canonical JSON: object key order is irrelevant; array order, paths, modes, bytes and hashes remain semantic.

## 14. Lease grant IAO

For `WT-001/A01`, generation 1:

```text
grant_idempotency_key = lease:grant:WT-001:A01:g1
holder = mnfs-<repo-id-hash>-lse001-g1
```

Flow:

```text
1. validate Track, current Attempt, READY source, contract, base and Treehouse freshness
2. validate controlled HOME/pool/config and source fingerprint
3. transaction: insert/reuse LSE-001 REQUESTED + LEASE_REQUESTED
4. observe Treehouse by deterministic holder and exact source ownership
5. one exact match → validate and commit ACTIVE
6. no match → claim action token and launch trusted helper
7. helper records STARTED and invokes JSON acquisition once
8. observe helper result, path containment, linked-worktree ownership, Lease ID, holder and source
9. fresh status and Git observation
10. transaction: REQUESTED → ACTIVE + external identity + LEASE_GRANTED
```

Crash windows:

- Intent only: retry observes and may safely claim a token.
- Token claimed before helper STARTED: exact live owner blocks; dead owner with no helper/start Artifact can be replaced after observation.
- Helper STARTED before external completion: another `get` is prohibited until the outcome is decisive.
- External Lease before semantic commit: exact holder/status recovers allocation without another acquisition.
- Commit before response: same key/input returns ACTIVE.
- Multiple matches, conflicting input, helper ambiguity or non-bijective identity: DIVERGED/UNKNOWN; no further acquisition.

Generic Recovery never adopts or claims an action token.

## 15. Lease release

Preconditions:

- ACTIVE Lease with expected version and generation;
- exact Track, Attempt, source, internal ID, external ID, holder and path;
- matching release idempotency key/input;
- Treehouse freshness unchanged;
- no current Worker Run and no matching live process;
- no current Claim;
- exact linked worktree;
- clean Git status and no unclassified source/worktree mutation;
- fresh Treehouse status matches the exact Lease.

Dirty or ambiguous work returns `LEASE_RELEASE_BLOCKED_DIRTY` or `LEASE_RELEASE_BLOCKED_UNKNOWN` without invoking Treehouse.

Flow:

```text
1. reconcile semantic, helper and physical preconditions
2. transaction: ACTIVE → RELEASE_PENDING + release key/hash + LEASE_RELEASE_REQUESTED
3. claim RELEASE action token and launch helper
4. helper records STARTED and performs conditional return
5. fresh helper/status/Git/filesystem observation
6. managed path available with no Lease:
   transaction RELEASE_PENDING → RELEASED + LEASE_RELEASED
7. different identity, missing/unmanaged path or insufficient observation:
   transaction → DIVERGED + LEASE_DIVERGED; preserve work and action evidence
```

Retry:

- RELEASED with same key/input returns prior result.
- same key with different input conflicts.
- RELEASE_PENDING always observes before considering another return.
- exact live helper blocks a competing caller.
- STARTED release can retry the conditional command only under the exact same fence and decisive observation rules.
- different ID, holder, generation, Attempt, source or path is `LEASE_FENCE_CONFLICT`.
- managed available path proves completion.
- missing/unmanaged path is `LD-05`, never automatic success.

After release, the empty Track remains `ACTIVE` until explicit abandonment.

## 16. Recovery and one-to-one reconciliation

`mnfs recover [--track WT-001]` is read-only.

Reconcile canonicalizes paths, validates containment and compares semantic Leases with helper, Treehouse, Git and process observations in this order:

1. exact action token/helper process and Artifact chain;
2. exact external Lease ID;
3. exact holder and path as corroborating fields;
4. exact Git common directory and Attempt source ownership;
5. process list and worktree state.

External IDs, paths, holders and helper tokens must map one-to-one. Duplicate IDs, duplicate paths, multiple holder matches, multiple helpers, malformed items or path escapes are `UNKNOWN`/`DIVERGED`; no first-match selection is allowed.

| Code | Meaning | Default action |
|---|---|---|
| `HEALTHY` | exact semantic/helper/physical identity match | none |
| `ADOPTABLE` | REQUESTED same-input grant has exactly one matching external Lease | original grant retry may commit |
| `LD-01` | current semantic Lease, external Lease absent | block |
| `LD-02` | MNFS-like external worktree/Lease without semantic owner | preserve/operator decision |
| `LD-03` | external Lease ID differs | block |
| `LD-04` | holder differs | block |
| `LD-05` | path missing, unmanaged, escaped or not a real linked worktree | preserve/operator decision |
| `LD-06` | duplicate or non-bijective external identity | preserve/operator decision |
| `LD-07` | action/helper state inconclusive | preserve/wait/operator decision |
| `SD-01` | source REQUESTED but final source absent | original source operation may retry |
| `SD-02` | source path/fingerprint/base/config differs | preserve/operator decision |
| `UNKNOWN` | observation insufficient | block |

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
EXECUTION_SOURCE_SHARED_OBJECTS
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
LEASE_ACTION_INCONCLUSIVE
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

## 19. Constructive coverage matrix

| Requirement | Final proposed design | Failure behavior | Required proof |
|---|---|---|---|
| REQ-001 | Attempt lifecycle, unique partial index, atomic supersession | duplicate OPEN or stale version rolls back | unit, migration and fresh process |
| REQ-002 | separate Attempt/Run IDs and atomic Run replacement | replacement preserves Attempt/history; stale Run fenced | replacement and process-identity tests |
| REQ-004 | Claim + Track + versioned Event transaction and idempotency | Event/state failure leaves no mutation | injected rollback and duplicate-key tests |
| REQ-005 | approval lookup, exact base, ancestry FKs and tree validation | stale contract, cross-lineage, wrong base/tree rejected | service, FK, Git object and Replan tests |
| REQ-006 | source IAO + helper-backed Lease IAO | every source/token/helper/action crash window classified | unit matrix + accepted TC-01 Evidence |
| REQ-007 | generation, grant/release input hashes, helper/process/external fences | stale caller cannot release; inconclusive action blocks; dirty preserved | unit matrix + TC-01 S08–S11 |
| REQ-008 | source/helper/Lease one-to-one read-only Reconcile | ambiguity blocks and preserves | DR-04/DR-05, duplicate identity and fresh process |

All seven requirements have exact final proposed state, service, failure and proof coverage. The remaining R5 gate is the Operator decision on this version.

## 20. Verification requirements

TDD is mandatory.

### Migration

- empty, M0, M1/v3 and exact revision-5 databases;
- backup and preflight failure;
- Event IDs, sequence, payloads and counts preserved;
- `payload_schema_version` copied as 1;
- indexes and foreign keys recreated;
- `foreign_key_check` and `integrity_check` pass;
- migration rollback leaves v3 unchanged;
- pre-v4 command write fails and transaction rolls back;
- newer schema rejected in write mode;
- fresh v4 process recovers exact M0/M1 state.

### Domain and relational integrity

- ID allocation and every legal/illegal transition;
- one current Track/Feature, Attempt/Track, Run/Attempt, Lease/Track and Claim/Attempt;
- atomic Attempt supersession and Run replacement;
- cross-Track Lease and cross-Attempt Run cannot attach to Claim;
- Attempt base commit and Claim base equality;
- result SHA must be a tree in the exact READY source;
- Track abandonment guards;
- optimistic conflicts;
- Claim/Event and Track/Attempt atomicity;
- grant/release/Claim same-input replay and different-input conflict.

### Execution source

- canonical checkout unchanged before/after;
- local transfer works with network disabled and credential helpers rejected;
- no remote, alternates, shared common dir, hardlinked objects or executable hooks;
- current `main`, exact base/object format/tree and clean status;
- REQUESTED crash, complete-temp, matching-final and conflicting-final cases;
- controlled HOME/XDG/config contains no inherited hooks;
- Treehouse never receives canonical checkout cwd.

### Action helper and Lease

- operation file exact and immutable;
- STARTED durable before Treehouse invocation;
- FINISHED bounded and advisory;
- parent death before spawn, during spawn, after STARTED, after Treehouse and after semantic commit;
- surviving helper is discovered by token and process identity;
- two simultaneous same-key grants invoke Treehouse at most once;
- an inconclusive STARTED grant never causes a second `get`;
- exact external completion is semantically recovered;
- conditional release retry remains fenced;
- stale internal/external/source/helper fence rejected;
- dirty and ambiguous work preserved.

### Recovery

- exact one-to-one matching;
- duplicate ID/path/holder/helper classified, never first-matched;
- source and Lease divergences reported independently;
- Recovery is byte-for-byte non-mutating;
- output includes every candidate, Evidence refs and concrete authority/next action.

### Canonical M01 proof

```text
Scenario A
A1 open Track + Attempt at exact base; materialize independent no-origin source; grant
A2 terminate at every source/helper/action window; fresh process reconciles
A3 fenced clean release; explicit Track abandonment
A4 recover ABANDONED Track and RELEASED Lease; repeated release is idempotent

Scenario B
B1 open next Track + Attempt + Run; materialize source; grant
B2 atomic Claim bound to exact ancestry, base and result tree
B3 fresh process recovers identical Track/Attempt/Run/Lease/Claim
product cleanup: none; preserved for M02
trusted test-fixture cleanup: after Evidence, outside product semantics
```

Pi and production SEC-E1 dispatch remain absent.

## 21. Observability, security and rollback

Record versioned Domain Events, durations, adapter exit classes, bounded Artifact refs, source fingerprint, Treehouse version/hash, action token/helper identity, Recovery classifications, entity versions and concrete next action.

Security invariants:

- canonical checkout is never Treehouse cwd;
- Attempt source has no remotes, shared objects, alternates or executable hooks;
- local object transfer only, network and credential helpers disabled;
- controlled HOME/XDG/config/hook path;
- exact argv/cwd/env and no shell interpolation;
- no force, destroy or prune;
- strict untrusted-output validation;
- realpath and ownership verification;
- ambiguous or inconclusive identity fails closed;
- no secret reads or unbounded logs.

Rollout:

```text
accepted TC-01 Evidence
→ final review and Operator approval of 0.6.0
→ separate implementation plan
→ migration/domain with fakes
→ source/helper proofs
→ real grant/recovery/release
→ M01 composition proof
```

Rollback restores the pre-migration backup or performs a separately reviewed forward repair. It never automatically removes a source or worktree. Execution sources, helper Artifacts and worktrees remain preserved until explicit safe disposition.

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
src/runtime/lease-action-runner.ts
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

Tests mirror responsibilities. The implementation plan may refine filenames without changing behavior, authority or the proved no-origin boundary.

## 23. R5 gate and impact

R5 remains `IN_PROGRESS` until the Operator explicitly approves this exact microdesign version.

```text
Research:                    PUBLISHED
TC-01 protocol:              ACCEPTED
TC-01 canonical Evidence:    ACCEPT — 15/15 PASS, cleanup COMPLETED
Treehouse candidate:         ACCEPTED ONLY INSIDE PROVED BOUNDARY
Task 14 review:              COMPLETE / OPERATOR DECISION PENDING
M01 microdesign:             PROPOSED — version 0.6.0
M01 implementation:          PROHIBITED
Pi Worker dispatch:          PROHIBITED
Current gate:                explicit Operator decision on version 0.6.0
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
  rationale: "Final R5 review closes the production no-origin/source boundary, versioned Events, relational ancestry, migration downgrade fence, trusted action-helper crash windows and exact Recovery matching."
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

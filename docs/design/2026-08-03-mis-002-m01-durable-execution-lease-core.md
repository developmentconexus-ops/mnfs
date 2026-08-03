---
id: DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
title: MIS-002 M01 Durable Execution and Lease Core
document_type: microdesign
form: explanation
authority: specification
status: proposed
version: 0.1.0
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
  - ACCEPTANCE-M2-UNBLOCK
tracking_issue: 16
last_reviewed: 2026-08-03
---

# MIS-002/M01 — Durable Execution and Lease Core

## 1. Decision summary

M01 will add the smallest durable execution foundation required by the approved M2 contract:

```text
contract-bound Write Track
→ one current Attempt
→ distinct Worker Run identity
→ durable Claim transaction
→ Treehouse Lease Intent–Action–Observation
→ fenced release
→ read-only Recovery/Reconcile
```

The selected architecture is:

```text
SQLite
→ authoritative semantic state and Domain Events

Treehouse
→ physical managed-worktree and external Lease state

Git/filesystem
→ observed code-tree state

MNFS application services
→ transitions, contract validation, idempotency, fencing and Recovery
```

M01 does not launch Pi. It persists the identity model that M02 will use for the real E1 Worker.

This design remains `proposed`. R5 cannot pass until TC-01 produces acceptable canonical WSL2 evidence and the Operator explicitly approves the final microdesign.

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
```

M01 owns:

```text
CAP-EXEC-REQ-001
CAP-EXEC-REQ-002
CAP-EXEC-REQ-004
CAP-EXEC-REQ-005
CAP-EXEC-REQ-006
CAP-EXEC-REQ-007
CAP-EXEC-REQ-008
```

## 3. Outcome

MNFS possesses a durable, contract-bound execution identity model and can acquire, observe, reconcile and release one Treehouse Lease through explicit external-operation semantics.

The M01 composition proof demonstrates that:

- SQLite lifecycle state and matching Domain Events remain coherent;
- one Write Track has at most one current non-terminal Attempt;
- Worker Run replacement never rewrites Attempt identity;
- Claim creation is atomic with its Event;
- Attempt, Worker Run and Claim remain bound to the exact approved contract;
- Lease grant and release survive all named crash windows;
- stale holders cannot release a newer external Lease;
- orphan worktrees and Leases without worktrees are reported without automatic destruction;
- a fresh process recovers the same identities and safe next action.

## 4. Non-goals

M01 does not implement:

- Pi process launch;
- production SEC-E1 Environment creation;
- Current Authority Snapshot or Writer Pack;
- Worker completion semantics;
- deterministic Receipt or Claim Acceptance Gate;
- multiple current Workers or parallel Write Tracks;
- generic scheduler, Saga engine, workflow framework or message broker;
- generalized resource reservation;
- automatic orphan adoption or destruction;
- Treehouse prune, destroy or force return;
- remote execution;
- Issue #15 repository-identity reattachment;
- automatic merge or delivery.

## 5. Options considered

### 5.1 Extend the existing `SqliteStore` with all behavior

Rejected. It would combine M0/M1 persistence, M2 execution state, external process calls and Recovery in one file and one responsibility boundary.

### 5.2 Domain services plus focused stores and adapters

Selected.

```text
CLI / future Lead
        |
        v
ExecutionService ─────────────┐
ClaimService ─────────────────┼── shared SQLite composition root
LeaseService ─────────────────┤          |
RecoveryService ──────────────┘          +── execution store
        |                                +── Event store
        |                                +── approved-contract lookup
        |
        +── TreehouseAdapter
        +── GitWorktreeInspector
```

### 5.3 Generic durable-workflow framework

Rejected. It creates a second lifecycle model without removing the need to design MNFS identities, transactions, fencing, crash windows or Evidence.

## 6. Authority boundaries

| Concern | Authority |
|---|---|
| Approved execution scope | approved Mission Contract |
| Semantic lifecycle | MNFS SQLite |
| Code tree and SHA | Git |
| Physical managed worktree | Treehouse + Git |
| Semantic Lease | MNFS SQLite |
| External Lease ID/holder | Treehouse observation |
| Process existence | operating system; M02 |
| Worker Run lifecycle | MNFS SQLite |
| Claim lifecycle | MNFS SQLite |
| Acceptance | future MNFS Gate; M02 |
| Human output | presentation only |

An adapter observation can cause a semantic transition only through a validated MNFS service operation.

## 7. Domain identities

M01 uses stable human-readable identities allocated inside a SQLite write transaction.

```text
Write Track:  WT-001
Attempt:      WT-001/A01
Worker Run:   WT-001/A01/WR01
Claim:        WT-001/A01/CLM01
Lease:        LSE-001
```

A small `entity_sequences` table allocates the numeric components for:

```text
WRITE_TRACK
LEASE
```

Attempt, Worker Run and Claim ordinals are allocated relative to their parent.

Timestamp is never the only identity or deduplication key.

## 8. Lifecycle model

### 8.1 Write Track

M01 persisted states:

```text
ACTIVE
CLAIMED
ABANDONED
```

`ACTIVE` is created with Attempt A01. Opening a Claim moves the Track to `CLAIMED` in the same transaction. Acceptance and Integration states belong to later milestones.

### 8.2 Attempt

```text
OPEN
SUPERSEDED
CLOSED
CANCELLED
```

Only `OPEN` is current and non-terminal in M01.

A new Worker Run does not create a new Attempt. A new Attempt requires an explicit supersession decision.

### 8.3 Worker Run

```text
STARTING
RUNNING
IDLE
EXITED
LOST
CANCELLED
```

M01 persists identity, replacement history and typed transitions using fake process observations. Real Pi launch begins in M02.

### 8.4 Claim

The schema recognizes the accepted capability lifecycle:

```text
OPEN
COMPLETED_BY_WORKER
UNDER_VERIFICATION
ACCEPTED
REJECTED
SUPERSEDED
ABANDONED
```

M01 authorizes creation of `OPEN` Claims only. Later transitions remain prohibited until their owning M02 services exist.

### 8.5 Lease

```text
REQUESTED
ACTIVE
RELEASE_PENDING
RELEASED
DIVERGED
```

`DIVERGED` remains non-terminal and blocks acquisition of another Lease for the same Track until explicit disposition.

## 9. SQLite migration v4

Migration v4 is additive except for a controlled rebuild of the existing Events table.

It must be tested against:

- an empty database;
- an M0 database;
- an M1 schema-v2 database;
- the exact approved MIS-002 revision 5 fixture;
- migration failure rollback.

### 9.1 Event type registry

The existing Events table uses a hard-coded type `CHECK`. M01 introduces multiple types and M02 will introduce additional approved types.

Migration v4 creates:

```sql
CREATE TABLE event_types (
  type TEXT PRIMARY KEY,
  payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version > 0)
);
```

It seeds existing and M01 event types, then rebuilds `events` with:

```text
type REFERENCES event_types(type)
```

The remaining Event shape stays stable:

```text
seq
event_id
type
mission_id
occurred_at
payload_json
```

This registry is not a message broker or generic event bus. Payload ownership and semantic transitions remain explicit code.

M01 Event types:

```text
WRITE_TRACK_OPENED
ATTEMPT_OPENED
ATTEMPT_SUPERSEDED
WORKER_RUN_OPENED
WORKER_RUN_STATE_CHANGED
CLAIM_OPENED
LEASE_REQUESTED
LEASE_GRANTED
LEASE_RELEASE_REQUESTED
LEASE_RELEASED
LEASE_DIVERGED
RECOVERY_OBSERVED
```

### 9.2 `write_tracks`

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

A Write Track targets exactly one qualified Feature in M01. Multi-Feature tracks remain unimplemented until a real consumer requires them.

### 9.3 `attempts`

```text
id              TEXT PRIMARY KEY
write_track_id  TEXT NOT NULL
ordinal         INTEGER NOT NULL
contract_hash   TEXT NOT NULL
status          TEXT NOT NULL
version         INTEGER NOT NULL DEFAULT 1
created_at      TEXT NOT NULL
updated_at      TEXT NOT NULL
UNIQUE(write_track_id, ordinal)
UNIQUE(id, contract_hash)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
```

Currentness invariant:

```sql
CREATE UNIQUE INDEX attempts_one_open_per_track
ON attempts(write_track_id)
WHERE status = 'OPEN';
```

No `is_current` column exists.

### 9.4 `worker_runs`

```text
id                  TEXT PRIMARY KEY
attempt_id          TEXT NOT NULL
ordinal             INTEGER NOT NULL
contract_hash       TEXT NOT NULL
status              TEXT NOT NULL
process_id          INTEGER
process_started_at  TEXT
exit_code           INTEGER
version             INTEGER NOT NULL DEFAULT 1
created_at          TEXT NOT NULL
updated_at          TEXT NOT NULL
UNIQUE(attempt_id, ordinal)
UNIQUE(id, contract_hash)
FOREIGN KEY(attempt_id, contract_hash)
  REFERENCES attempts(id, contract_hash)
```

```sql
CREATE UNIQUE INDEX worker_runs_one_current_per_attempt
ON worker_runs(attempt_id)
WHERE status IN ('STARTING', 'RUNNING', 'IDLE');
```

### 9.5 `leases`

```text
id                  TEXT PRIMARY KEY
write_track_id      TEXT NOT NULL
contract_hash       TEXT NOT NULL
generation          INTEGER NOT NULL
status              TEXT NOT NULL
idempotency_key     TEXT NOT NULL UNIQUE
holder              TEXT NOT NULL
external_lease_id   TEXT
worktree_path       TEXT
external_leased_at  TEXT
last_observed_at    TEXT
last_error_code     TEXT
last_error_ref      TEXT
version             INTEGER NOT NULL DEFAULT 1
created_at          TEXT NOT NULL
updated_at          TEXT NOT NULL
UNIQUE(write_track_id, generation)
UNIQUE(external_lease_id)
UNIQUE(id, contract_hash)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
```

```sql
CREATE UNIQUE INDEX leases_one_current_per_track
ON leases(write_track_id)
WHERE status IN ('REQUESTED', 'ACTIVE', 'RELEASE_PENDING', 'DIVERGED');
```

External fields remain null while `REQUESTED` has not been observed successfully.

### 9.6 `claims`

```text
id                       TEXT PRIMARY KEY
write_track_id           TEXT NOT NULL
attempt_id               TEXT NOT NULL
worker_run_id            TEXT NOT NULL
lease_id                 TEXT NOT NULL
contract_hash            TEXT NOT NULL
ordinal                  INTEGER NOT NULL
status                   TEXT NOT NULL
base_sha                 TEXT NOT NULL
result_tree_sha          TEXT
claimed_criteria_json    TEXT NOT NULL CHECK (json_valid(claimed_criteria_json))
version                  INTEGER NOT NULL DEFAULT 1
created_at               TEXT NOT NULL
updated_at               TEXT NOT NULL
UNIQUE(attempt_id, ordinal)
UNIQUE(id, contract_hash)
FOREIGN KEY(write_track_id, contract_hash)
  REFERENCES write_tracks(id, contract_hash)
FOREIGN KEY(attempt_id, contract_hash)
  REFERENCES attempts(id, contract_hash)
FOREIGN KEY(worker_run_id, contract_hash)
  REFERENCES worker_runs(id, contract_hash)
FOREIGN KEY(lease_id, contract_hash)
  REFERENCES leases(id, contract_hash)
```

```sql
CREATE UNIQUE INDEX claims_one_current_per_attempt
ON claims(attempt_id)
WHERE status IN ('OPEN', 'COMPLETED_BY_WORKER', 'UNDER_VERIFICATION');
```

M01 writes `OPEN` only.

## 10. Transaction and concurrency rules

### 10.1 One transaction owner

All repositories share one `DatabaseSync` connection owned by the existing `SqliteStore` composition root.

The new `SqliteExecutionStore` receives that connection and cannot open another database independently.

### 10.2 Short local transactions

Use `BEGIN IMMEDIATE` for coordinated writes. No Git, Treehouse, process or model operation runs inside a SQLite transaction.

### 10.3 Optimistic concurrency

Mutable entities carry `version`.

Updates use compare-and-swap:

```sql
UPDATE ...
SET ..., version = version + 1
WHERE id = ? AND version = ?;
```

Zero affected rows produces `CONCURRENCY_CONFLICT`.

### 10.4 Atomic local facts

Related state and Event commit together.

Examples:

```text
Write Track + Attempt A01
→ one transaction with WRITE_TRACK_OPENED and ATTEMPT_OPENED

Claim OPEN + Track CLAIMED + CLAIM_OPENED
→ one transaction
```

## 11. Contract binding

`ExecutionService.openWriteTrack` loads the latest approved Mission Plan and requires:

- Mission is `MIS-002`;
- approved revision is 5 or a later explicitly compatible Replan;
- exact current hash equals the supplied hash;
- Milestone and Feature qualified identities exist;
- target belongs to `MIS-002/M01`;
- requirement allocations for the target remain current.

Every Attempt, Worker Run, Lease and Claim copies the exact contract hash and is protected by composite parent relationships.

A stale or mismatched hash fails before durable mutation with:

```text
EXECUTION_CONTRACT_CONFLICT
```

A Replan does not rewrite existing entities. It makes new dispatch/preparation fail until the active work is explicitly reconciled.

## 12. Application services

### 12.1 `ExecutionService`

Responsibilities:

- validate target against the approved contract;
- open one Write Track and Attempt A01 atomically;
- open replacement Worker Run identity under the same Attempt;
- supersede an Attempt only through explicit policy input;
- load complete Track state for status and Recovery.

It does not call Treehouse.

### 12.2 `ClaimService`

`openClaim` requires:

- current Track and Attempt;
- current Worker Run identity;
- active matching Lease;
- exact contract hash;
- valid base SHA and claimed criterion refs;
- no current Claim.

It inserts Claim, moves Track to `CLAIMED` and writes `CLAIM_OPENED` in one transaction.

It cannot complete or accept a Claim in M01.

### 12.3 `LeaseService`

Owns grant and release workflows across SQLite and Treehouse.

It is the only production component permitted to call `TreehouseAdapter`.

### 12.4 `RecoveryService`

Loads expected MNFS state, calls observation adapters and produces a read-only report.

It never calls Treehouse return, destroy, prune or acquisition.

## 13. Treehouse adapter contract

The candidate adapter is blocked on TC-01.

Expected command surface at the accepted version:

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <id> --if-lease-holder <holder>
```

Process rules:

- exact executable resolved during preflight;
- exact supported version and executable hash;
- argument arrays and `shell: false`;
- stdin closed;
- explicit cwd;
- environment allowlist including `PATH`, `HOME`, `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0` and locale;
- bounded stdout/stderr;
- named timeout/spawn/exit/output errors;
- strict JSON validation for acquisition and status;
- no force, destroy or prune;
- no regex-derived domain state;
- no direct Git worktree fallback inside the same operation.

The fixed M2 fixture has no `origin`; hidden fetch is not accepted.

## 14. Lease grant — Intent–Action–Observation

### 14.1 Deterministic operation identity

For Track `WT-001`, generation 1:

```text
idempotency_key = lease:grant:WT-001:g1
holder = mnfs-<repo-hash>-lse001-g1
```

The holder is lowercase, bounded and derived from Repository identity, internal Lease identity and generation.

### 14.2 Flow

```text
1. validate current Track, Attempt and contract
2. transaction:
   - allocate LSE-001 generation 1
   - insert REQUESTED
   - emit LEASE_REQUESTED
3. commit
4. inspect Treehouse status for the exact holder
5. if one exact matching Lease exists:
   - validate identity and adopt the observation
6. otherwise execute get --lease --json
7. validate realpath, Lease ID, holder and repository ownership
8. transaction with expected Lease version:
   - REQUESTED → ACTIVE
   - persist external identity and path
   - emit LEASE_GRANTED
9. return semantic Lease
```

### 14.3 Crash windows

#### After Intent, before external acquisition

Fresh retry finds `REQUESTED` and no matching holder. It may execute acquisition using the same operation identity.

#### After external acquisition, before semantic commit

Fresh retry finds exactly one external Lease by deterministic holder and completes `REQUESTED → ACTIVE`. It does not call `get` again.

#### After semantic commit, before response

Fresh retry returns the existing ACTIVE Lease.

#### Multiple matching holders or conflicting input

Mark/report `DIVERGED`; do not acquire another worktree.

## 15. Lease release

### 15.1 Local preconditions

Before creating release Intent:

- semantic Lease is `ACTIVE`;
- expected internal version and generation match;
- external Lease ID, holder and path are complete;
- no current Worker Run is `STARTING`, `RUNNING` or `IDLE`;
- no unpreserved current Claim or unknown work exists;
- Git inspector proves the worktree is clean;
- current Treehouse observation matches exact external identity.

A dirty worktree returns:

```text
LEASE_RELEASE_BLOCKED_DIRTY
```

No Treehouse return command is invoked.

### 15.2 Flow

```text
1. validate preconditions and fresh observation
2. transaction:
   - ACTIVE → RELEASE_PENDING
   - emit LEASE_RELEASE_REQUESTED
3. commit
4. invoke conditional Treehouse return
5. observe status again
6. if the managed path is available with no Lease identity:
   transaction:
   - RELEASE_PENDING → RELEASED
   - emit LEASE_RELEASED
7. otherwise persist/report DIVERGED
```

### 15.3 Retry and idempotency

- `RELEASED` returns the previous semantic result.
- `RELEASE_PENDING` always observes before deciding whether to retry return.
- a matching Lease still present may be retried with the same external fence;
- a different Lease ID or holder is `LEASE_FENCE_CONFLICT` and never released;
- a managed available path proves release completion;
- a missing or unmanaged path is `LD-05`, not automatic success;
- broad stderr patterns never decide idempotency.

## 16. Recovery and Reconcile

### 16.1 Read-only default

```text
mnfs recover
mnfs recover --track WT-001
```

reads MNFS state and observes Treehouse/Git. It performs no resource mutation.

### 16.2 Classifications

| Code | Meaning | Default action |
|---|---|---|
| `HEALTHY` | semantic and physical identity match | none |
| `ADOPTABLE` | REQUESTED Intent matches exactly one external holder | retry original grant operation |
| `LD-01` | active/releasing semantic Lease but physical Lease absent | block protected action |
| `LD-02` | MNFS-like external Lease/worktree with no semantic Lease | preserve and request decision |
| `LD-03` | external Lease ID differs | block release/dispatch |
| `LD-04` | holder differs | block release/dispatch |
| `LD-05` | path absent, unmanaged or not a valid linked worktree | preserve evidence and request decision |
| `UNKNOWN` | observation insufficient | block rather than infer health |

### 16.3 Report

```ts
interface RecoveryReport {
  repositoryId: string;
  observedAt: string;
  contractHash: string;
  tracks: TrackRecoveryObservation[];
  summary: {
    healthy: number;
    divergences: number;
    blocked: number;
  };
}
```

Each observation includes expected state, observed state, classification, severity, safe actions, recommended next action and required authority.

A matching `REQUESTED` Lease is only adopted by retrying the original grant service with its idempotency key. Generic Recovery remains non-mutating.

## 17. CLI surface

M01 exposes only Operator/Lead operations required for its bounded proof:

```text
mnfs track open
  --mission MIS-002
  --milestone M01
  --feature F01
  --contract sha256:...
  [--json]

mnfs track show --track WT-001 [--json]

mnfs lease grant --track WT-001 [--json]
mnfs lease show --lease LSE-001 [--json]
mnfs lease release --lease LSE-001 --expected-version <n> [--json]

mnfs recover [--track WT-001] [--json]
```

Worker Run and Claim services are implemented behind typed application interfaces and exercised in automated tests. Their production CLI commands arrive with M02, when real Worker authority and output contracts exist.

Every exposed command provides stable human output, stable JSON, a typed error, exit class and exact next action.

## 18. Error taxonomy

Initial M01 codes:

```text
EXECUTION_TARGET_INVALID
EXECUTION_CONTRACT_CONFLICT
WRITE_TRACK_CONFLICT
ATTEMPT_CONFLICT
WORKER_RUN_CONFLICT
CLAIM_CONFLICT
CONCURRENCY_CONFLICT
LEASE_CONFLICT
LEASE_IDEMPOTENCY_CONFLICT
LEASE_FENCE_CONFLICT
LEASE_RELEASE_BLOCKED_DIRTY
TREEHOUSE_NOT_FOUND
TREEHOUSE_VERSION_UNSUPPORTED
TREEHOUSE_COMMAND_FAILED
TREEHOUSE_TIMEOUT
TREEHOUSE_OUTPUT_INVALID
TREEHOUSE_OBSERVATION_CONFLICT
RECOVERY_DIVERGENCE
```

Errors include bounded structured details and remediation. Raw external output is stored by artifact reference when needed, not copied unbounded into SQLite or CLI JSON.

## 19. Design Coverage Matrix

| Requirement | Design element | Failure behavior | Verification |
|---|---|---|---|
| `CAP-EXEC-REQ-001` | `attempts` lifecycle + unique partial index | second OPEN Attempt rolls back with typed conflict | unit, migration, fresh-process recovery |
| `CAP-EXEC-REQ-002` | separate Attempt and Worker Run tables/identities | replacement creates new Run; old history immutable | unit transition and replacement tests |
| `CAP-EXEC-REQ-004` | `ClaimService.openClaim` transaction | Event or state failure rolls back all mutations | injected Event conflict and rollback test |
| `CAP-EXEC-REQ-005` | approval lookup + copied hash + composite relationships | stale or mixed hash rejected before commit | service, FK and Replan-staleness tests |
| `CAP-EXEC-REQ-006` | `LeaseService` IAO protocol | crash leaves REQUESTED or recoverable external holder | unit crash-window matrix + TC-01 + real WSL2 |
| `CAP-EXEC-REQ-007` | generation, idempotency key, external ID and holder conditional return | stale holder/ID cannot release; dirty work preserved | unit fencing + TC-01 S08-S11 |
| `CAP-EXEC-REQ-008` | read-only `RecoveryService` and LD taxonomy | unknown/divergent state blocks; no destruction | DR-04, DR-05, fresh-process report test |

No M01 requirement lacks a proposed design or verification element. TC-01 remains the blocking external-behavior proof.

## 20. Test strategy

Behavior changes follow red → observed failure → minimal green → refactor.

### 20.1 Domain and store tests

- identity allocation and formatting;
- lifecycle transition tables;
- one OPEN Attempt per Track;
- one current Worker Run per Attempt;
- one current Lease per Track;
- one current Claim per Attempt;
- optimistic version conflict;
- composite contract mismatch;
- Claim/Event atomicity;
- Track/Attempt creation atomicity;
- all invalid writes leave no Event or partial row.

### 20.2 Migration tests

- empty database to v4;
- M0 v1 database to v4;
- M1 v3 database to v4;
- exact revision 3 history and revision 5 contract preserved;
- existing Event sequence and payload preserved;
- migration failure rolls back;
- fresh process reads all preserved state.

### 20.3 Fake-adapter service tests

- every Lease crash window;
- identical retry returns prior result;
- same idempotency key with conflicting intent fails;
- multiple matching holders diverge;
- stale internal version fails before external action;
- stale external ID/holder never releases;
- dirty worktree invokes no Treehouse command;
- `RELEASE_PENDING` restart observes before retry;
- missing path remains divergent;
- Recovery makes no mutation.

### 20.4 TC-01

Execute the proposed conformance protocol on canonical WSL2 before R5 approval.

### 20.5 M01 canonical proof

```text
process A
→ open WT-001 + A01
→ create WR01 identity
→ persist Lease REQUESTED
→ acquire exact Treehouse Lease
→ create OPEN Claim atomically
→ terminate process

process B
→ recover same Track, Attempt, Run, Claim and Lease
→ report healthy identity
→ reject duplicate Attempt and Lease
→ release only after clean/fenced checks

process C
→ recover RELEASED state
→ repeated release returns same semantic result
→ no duplicate rows, Events or physical Lease
```

Pi and SEC-E1 are not invoked.

## 21. Observability

M01 records locally:

- Domain Events;
- operation timestamps and durations;
- adapter exit class;
- bounded stdout/stderr artifact refs;
- external executable/version/hash;
- Recovery classification;
- current entity versions;
- next action.

No external telemetry backend is required.

## 22. Security

- no Worker is launched;
- Treehouse subprocess uses explicit executable, argv, cwd and environment;
- no shell interpolation;
- no credential environment allowlist beyond what TC-01 explicitly proves necessary;
- fixed fixture has no `origin`;
- adapter never uses force/destroy/prune;
- external output is untrusted and strictly validated;
- source checkout and worktree realpaths are verified;
- missing or ambiguous identity fails closed;
- logs and errors are bounded and contain no secret reads.

## 23. Rollout and rollback

### Rollout

```text
1. TC-01 conformance
2. final microdesign review and Operator approval
3. implementation plan
4. migration/domain with fake adapters
5. real Treehouse grant
6. real Recovery
7. fenced release
8. M01 composition proof
```

### Disable

A failed Treehouse preflight disables real Lease operations while preserving M0/M1 and fake-adapter tests.

### Rollback

Before applying migration v4 to a canonical runtime:

- create a SQLite backup;
- verify integrity;
- record schema and contract hashes.

If implementation must be disabled after migration, the runtime remains readable and M0/M1 planning remains available. Downgrading to a binary that cannot understand schema v4 is prohibited; rollback uses the database backup or a forward repair.

No automatic worktree cleanup occurs during rollback.

## 24. Target file boundaries

Proposed production files:

```text
src/execution/ids.ts
src/execution/model.ts
src/execution/transitions.ts
src/store/sqlite-transaction.ts
src/store/execution-store.ts
src/adapters/treehouse.ts
src/adapters/git-worktree.ts
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

Corresponding tests mirror each responsibility. The implementation plan may refine exact names without changing architecture or authority.

## 25. R5 gate

R5 remains `IN_PROGRESS` until:

- TC-01 has an accepted or explicitly limited Verdict;
- its findings are incorporated into this design;
- every M01 criterion remains covered;
- migration and adapter signatures receive adversarial review;
- no blocking external-tool question remains;
- the Operator explicitly approves the final microdesign.

Current boundary:

```text
Research:            PUBLISHED
TC-01 protocol:      PROPOSED / EXECUTION AUTHORIZED
M01 microdesign:     PROPOSED
M01 implementation: PROHIBITED
Pi Worker dispatch:  PROHIBITED
```

## 26. Documentation and requirements impact

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
    - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
    - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
    - DOC-PROJECT-STATUS
    - TRACKING-WORKLOG
  rationale: "R5 defines the bounded M01 state, transaction, adapter, Recovery and proof design."
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
  rationale: "Every M01 requirement now has a proposed design, failure behavior and verification element; TC-01 remains blocking Evidence."
```

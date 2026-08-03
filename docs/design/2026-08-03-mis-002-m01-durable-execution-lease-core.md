---
id: DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
title: MIS-002 M01 Durable Execution and Lease Core
document_type: microdesign
form: explanation
authority: specification
status: proposed
version: 0.2.0
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

M01 adds the smallest durable execution foundation required by the approved M2 contract:

```text
contract-bound Write Track
→ one current Attempt
→ distinct Worker Run identity
→ atomic durable Claim
→ Treehouse Lease Intent–Action–Observation
→ fenced and non-destructive release
→ read-only Recovery/Reconcile
```

Authority remains explicit:

```text
SQLite
→ semantic execution and Lease state

Treehouse
→ managed worktree and external Lease identity

Git/filesystem
→ code-tree observations

MNFS services
→ contract validation, transitions, idempotency, fencing and Recovery
```

M01 does not launch Pi. It persists the identities and invariants that M02 will consume for the real E1 Worker.

This design remains `proposed`. R5 cannot pass until TC-01 produces acceptable canonical WSL2 evidence, its findings are incorporated and the Operator explicitly approves the final microdesign.

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

## 3. Outcome and proof boundary

M01 is successful when MNFS possesses a durable, contract-bound execution identity model and can acquire, observe, reconcile and release one Treehouse Lease through explicit external-operation semantics.

The proof must establish:

- one active Track for the bounded Feature;
- at most one current non-terminal Attempt per Track;
- Worker Run replacement without rewriting Attempt identity;
- Claim and `CLAIM_OPENED` Event atomicity;
- exact contract binding on Attempt, Worker Run, Lease and Claim;
- all Lease grant/release crash windows;
- internal and external release fencing;
- no dirty or unclassified work destroyed;
- orphan worktree and Lease-without-worktree reporting;
- fresh-process recovery without transcript or terminal parsing.

Claim and release are not falsely composed in one unsafe scenario. The canonical M01 proof uses **sequential isolated Tracks**:

```text
Track A
→ proves Lease grant, crash recovery, fenced clean release and repeated-release idempotency

Track B
→ proves Worker Run identity, atomic Claim creation and fresh-process preservation
→ remains preserved; product release waits for M02 Claim disposition
```

Only one Track is current at a time. Trusted test cleanup of disposable fixtures happens outside product semantics after Evidence is captured.

## 4. Non-goals

M01 does not implement:

- Pi process launch;
- production SEC-E1 Environment creation;
- Current Authority Snapshot or Writer Pack;
- Worker completion;
- Receipt or Claim Acceptance Gate;
- Claim acceptance, rejection or verification transitions;
- parallel Write Tracks or worker pools;
- scheduler, Saga engine, workflow framework or message broker;
- generalized resource reservations;
- automatic orphan adoption or destruction;
- Treehouse prune, destroy or force return;
- remote execution;
- Issue #15 repository-identity recovery;
- merge, Integration or delivery.

## 5. Selected architecture

```text
CLI / future Lead
        |
        v
ExecutionService ─────────────┐
ClaimService ─────────────────┼── SqliteStore composition root
LeaseService ─────────────────┤          |
RecoveryService ──────────────┘          +── execution persistence
        |                                +── Event persistence
        |                                +── approved-contract lookup
        |
        +── TreehouseAdapter
        +── GitWorktreeInspector
```

Rules:

1. Application services own workflows and semantic transitions.
2. SQLite repositories own local atomicity.
3. Adapters return observations, never domain state.
4. No external action runs inside a SQLite transaction.
5. Grant and release use Intent–Action–Observation.
6. Recovery compares expected semantic state with observed physical state.
7. Generic Recovery is non-mutating.
8. Destructive or ambiguous repair requires explicit authority.

Rejected alternatives:

- one monolithic store containing persistence and external operations;
- separate database per subsystem;
- Treehouse private state as MNFS authority;
- human-output parsing as state;
- new worktree per retry;
- generic durable-workflow infrastructure.

## 6. Domain identities

Stable public IDs are allocated inside SQLite write transactions:

```text
Write Track:  WT-001
Attempt:      WT-001/A01
Worker Run:   WT-001/A01/WR01
Claim:        WT-001/A01/CLM01
Lease:        LSE-001
```

A narrow sequence table supports repository-wide IDs:

```sql
CREATE TABLE entity_sequences (
  kind TEXT PRIMARY KEY CHECK (kind IN ('WRITE_TRACK', 'LEASE')),
  next_value INTEGER NOT NULL CHECK (next_value > 0)
);
```

Attempt, Worker Run and Claim ordinals are allocated relative to the parent under the same write transaction. Timestamp is never the only identity or deduplication key.

## 7. Lifecycle model

### Write Track

```text
ACTIVE
CLAIMED
ABANDONED
```

`ACTIVE` is created atomically with Attempt A01. Opening a Claim moves the Track to `CLAIMED`. Later acceptance and integration states remain outside M01.

### Attempt

```text
OPEN
SUPERSEDED
CLOSED
CANCELLED
```

Only `OPEN` is current and non-terminal. A replacement Worker Run stays inside the same Attempt. A new Attempt requires explicit supersession.

### Worker Run

```text
STARTING
RUNNING
IDLE
EXITED
LOST
CANCELLED
```

M01 persists identity and replacement history using injected process observations. Real Pi launch begins in M02.

### Claim

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

M01 authorizes `OPEN` creation only. It does not expose a product transition that would fake completion or acceptance merely to enable cleanup.

### Lease

```text
REQUESTED
ACTIVE
RELEASE_PENDING
RELEASED
DIVERGED
```

`DIVERGED` remains non-terminal and blocks a new Lease for the Track until explicit disposition.

## 8. Migration v4

Migration v4 is additive except for a controlled Events-table rebuild. It is tested against empty, M0, M1/v3 and exact MIS-002 revision-5 databases.

### Event type registry

The current Events table has a hard-coded type `CHECK`. M01 introduces several types and M02 will introduce more approved domain facts.

```sql
CREATE TABLE event_types (
  type TEXT PRIMARY KEY,
  payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version > 0)
);
```

Migration seeds existing and M01 types and rebuilds `events` so `type` references `event_types(type)`. The existing Event columns and sequence are preserved.

M01 types:

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

This is a fixed registry, not a broker or generic event bus.

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

M01 targets one qualified Feature per Track. Multi-Feature Tracks wait for a proven consumer.

### `attempts`

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

```sql
CREATE UNIQUE INDEX attempts_one_open_per_track
ON attempts(write_track_id)
WHERE status = 'OPEN';
```

There is no `is_current` column.

### `worker_runs`

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

### `leases`

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

External fields remain null until a valid external observation exists.

### `claims`

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
result_tree_sha          TEXT NOT NULL
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

Application validation requires `base_sha` and `result_tree_sha` to be lowercase hexadecimal Git object IDs of 40 or 64 characters. Claimed criteria are a canonical non-empty array resolving to the Track's approved Feature.

## 9. Transactions and concurrency

All repositories share one `DatabaseSync` connection owned by the current `SqliteStore` composition root. The focused execution store cannot open its own database.

Use short `BEGIN IMMEDIATE` transactions. Git, Treehouse, process and model calls never occur inside them.

Mutable entities carry `version`; updates use compare-and-swap. Zero affected rows produces `CONCURRENCY_CONFLICT`.

Atomic local operations include:

```text
Write Track + Attempt A01 + two Events
Claim OPEN + Track CLAIMED + CLAIM_OPENED Event
state transition + matching Domain Event
```

Any insert/Event failure rolls back the complete semantic change.

## 10. Contract binding

`ExecutionService.openWriteTrack` loads the latest approved Mission Plan and requires:

- Mission `MIS-002` is open;
- exact supplied hash is the latest approved contract hash;
- Milestone and Feature qualified identities resolve;
- target belongs to `MIS-002/M01`;
- requirement allocations remain current.

Every Attempt, Worker Run, Lease and Claim copies that hash and is protected by composite parent relationships.

A stale or mixed hash fails before durable mutation with:

```text
EXECUTION_CONTRACT_CONFLICT
```

A Replan never rewrites existing runtime entities. New preparation is blocked until active work is explicitly reconciled.

## 11. Service boundaries

### `ExecutionService`

- validates the approved target;
- opens one Track and Attempt A01 atomically;
- creates replacement Worker Run identity under the same Attempt;
- supports explicit Attempt supersession later without rewriting history;
- returns complete Track state.

It does not call Treehouse.

### `ClaimService`

`openClaim` requires:

- current Track, Attempt and Worker Run;
- ACTIVE matching Lease;
- exact contract hash;
- valid base/result Git object IDs;
- claimed criteria owned by the Feature;
- no current Claim.

It inserts Claim, moves Track to `CLAIMED` and writes `CLAIM_OPENED` in one transaction. It cannot complete, accept, reject or abandon Claims in M01.

### `LeaseService`

Owns grant and release across SQLite and Treehouse. It is the only production component permitted to call `TreehouseAdapter`.

### `RecoveryService`

Loads expected MNFS state, calls observation adapters and produces a read-only report. It never acquires, returns, prunes or destroys a worktree.

## 12. Observation adapters

### Treehouse candidate

TC-01 must prove the installed binary supports:

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <id> --if-lease-holder <holder>
```

Process contract:

- pinned version and executable hash;
- exact executable and argument arrays;
- `shell: false` and closed stdin;
- explicit cwd and bounded timeout;
- environment allowlist with `PATH`, `HOME`, locale, `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`;
- bounded output artifact refs;
- strict JSON acquisition/status validation;
- no force, destroy or prune;
- no human-output regex as domain state;
- no direct Git-worktree fallback inside the same operation.

The fixed fixture has no `origin`; hidden fetch is not accepted.

### `GitWorktreeInspector`

Uses argument arrays and explicit cwd for:

```text
git rev-parse --show-toplevel
git rev-parse --git-common-dir
git rev-parse --git-dir
git status --porcelain=v1 --untracked-files=all
git rev-parse HEAD
git rev-parse <tree-ish>^{tree}
```

It canonicalizes realpaths, uses optional locks disabled and returns structured observations. It never resets, cleans, commits or changes refs.

## 13. Lease grant — Intent–Action–Observation

For `WT-001`, generation 1:

```text
idempotency_key = lease:grant:WT-001:g1
holder = mnfs-<repo-hash>-lse001-g1
```

The holder is lowercase, bounded and deterministic.

Flow:

```text
1. validate Track, Attempt and contract
2. transaction:
   - allocate LSE-001 generation 1
   - insert REQUESTED
   - emit LEASE_REQUESTED
3. commit
4. inspect status for exact holder
5. if exactly one match exists, validate and use the observation
6. otherwise execute get --lease --json
7. validate realpath, Lease ID, holder and repository ownership
8. transaction with expected Lease version:
   - REQUESTED → ACTIVE
   - persist external identity/path
   - emit LEASE_GRANTED
9. return semantic Lease
```

Crash behavior:

- Intent without external Lease: same operation may acquire.
- External Lease before semantic commit: exact deterministic holder is rediscovered and adopted by retrying the original grant operation.
- Semantic commit before response: retry returns existing ACTIVE Lease.
- Multiple matches or input conflict: report/mark DIVERGED; never acquire another worktree.

Generic Recovery does not perform adoption.

## 14. Lease release

Local preconditions:

- Lease ACTIVE with matching version/generation;
- complete external Lease ID, holder and path;
- no current Worker Run in `STARTING`, `RUNNING` or `IDLE`;
- Track has no current Claim and no unclassified work;
- Git inspector proves clean worktree;
- fresh Treehouse observation matches exact external identity.

A dirty worktree returns `LEASE_RELEASE_BLOCKED_DIRTY` without calling Treehouse.

Flow:

```text
1. validate local and physical preconditions
2. transaction:
   - ACTIVE → RELEASE_PENDING
   - emit LEASE_RELEASE_REQUESTED
3. commit
4. invoke conditional Treehouse return
5. observe status again
6. if managed path is available with no Lease identity:
   transaction:
   - RELEASE_PENDING → RELEASED
   - emit LEASE_RELEASED
7. otherwise persist/report DIVERGED
```

Retry rules:

- RELEASED returns the prior semantic result.
- RELEASE_PENDING observes before any retry.
- Same matching external Lease may retry conditional return.
- Different Lease ID or holder is `LEASE_FENCE_CONFLICT` and is never released.
- Managed available path proves completion.
- Missing or unmanaged path is `LD-05`, not automatic success.
- stderr text never decides idempotency.

## 15. Recovery and Reconcile

```text
mnfs recover
mnfs recover --track WT-001
```

is read-only for MNFS state and physical worktrees.

Classifications:

| Code | Meaning | Default action |
|---|---|---|
| `HEALTHY` | semantic and physical identity match | none |
| `ADOPTABLE` | REQUESTED Intent matches exactly one external holder | retry original grant operation |
| `LD-01` | semantic Lease current but physical Lease absent | block protected action |
| `LD-02` | MNFS-like external Lease/worktree without semantic Lease | preserve and request decision |
| `LD-03` | external Lease ID differs | block release/dispatch |
| `LD-04` | holder differs | block release/dispatch |
| `LD-05` | path absent, unmanaged or invalid | preserve Evidence and request decision |
| `UNKNOWN` | observation insufficient | block rather than infer health |

Reports include expected, observed, classification, severity, safe actions, recommended action and required authority. `RECOVERY_OBSERVED` may be emitted only by an explicit durable record command; plain `recover` does not mutate.

## 16. CLI surface

M01 exposes bounded Lead operations:

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

Worker Run and Claim services remain typed internal interfaces exercised by tests. Their production CLI arrives in M02 with real Worker authority and output contracts.

Every exposed command has stable human output, JSON, typed error, exit class and concrete next action.

## 17. Error taxonomy

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
GIT_WORKTREE_INVALID
RECOVERY_DIVERGENCE
```

Errors contain bounded structured details and remediation. Raw external output is referenced as an artifact when needed.

## 18. Design Coverage Matrix

| Requirement | Design element | Failure behavior | Verification |
|---|---|---|---|
| `CAP-EXEC-REQ-001` | Attempt lifecycle + partial unique index | second OPEN Attempt rolls back | unit, migration, fresh process |
| `CAP-EXEC-REQ-002` | separate Attempt/Worker Run tables and IDs | replacement creates new Run; old history immutable | transition and replacement tests |
| `CAP-EXEC-REQ-004` | `ClaimService.openClaim` transaction | Event or state failure rolls back all | injected conflict and rollback |
| `CAP-EXEC-REQ-005` | approval lookup + copied hash + composite relations | stale/mixed hash rejected pre-commit | service, FK and Replan-stale tests |
| `CAP-EXEC-REQ-006` | LeaseService IAO | crash leaves REQUESTED or exact recoverable holder | crash matrix, TC-01, WSL2 |
| `CAP-EXEC-REQ-007` | generation, operation key, Lease ID and holder fence | stale holder/ID cannot release; dirty work preserved | unit + TC-01 S08-S11 |
| `CAP-EXEC-REQ-008` | read-only Recovery and LD taxonomy | ambiguity blocks; no destruction | DR-04, DR-05, fresh-process report |

All seven requirements have a proposed design, failure behavior and proof. TC-01 remains the blocking external-behavior input.

## 19. Verification strategy

Behavior work follows red → observed failure → minimal green → refactor.

### Deterministic tests

- identity allocation and formatting;
- lifecycle transition tables;
- one current Track per Feature;
- one OPEN Attempt per Track;
- one current Worker Run per Attempt;
- one current Lease per Track;
- one current Claim per Attempt;
- optimistic version conflicts;
- composite contract mismatch;
- Claim/Event and Track/Attempt atomicity;
- invalid writes leave no partial row or Event.

### Migration tests

- empty, M0 and M1/v3 databases;
- exact revision-3 history and revision-5 contract preserved;
- Event sequence/payload preserved;
- migration failure rollback;
- fresh-process read after migration.

### Fake-adapter service tests

- all grant/release crash windows;
- retry returns previous semantic result;
- conflicting operation intent fails;
- multiple matching holders diverge;
- stale internal version fails before external action;
- stale external identity never releases;
- dirty work invokes no return;
- RELEASE_PENDING observes before retry;
- missing path diverges;
- Recovery makes no mutation.

### TC-01

Execute the accepted protocol on canonical WSL2 before R5 approval.

### Canonical M01 proof

```text
Scenario A — releasable Track
process A1: open Track A + Attempt; grant Lease; terminate after named crash window
process A2: recover same identities; reject duplicates; fenced clean release
process A3: recover RELEASED; repeated release returns same semantic result

Scenario B — claimed Track
process B1: open Track B + Attempt + Worker Run identity; grant Lease; create Claim atomically
process B2: recover same Track, Attempt, Run, Lease and Claim; prove no duplicate current work
product cleanup: none; fixture is preserved pending M02 disposition
trusted test cleanup: only after Evidence, outside product semantics
```

Pi and SEC-E1 are not invoked.

## 20. Observability and security

Record locally:

- Domain Events;
- timestamps and durations;
- adapter exit class;
- bounded output artifact refs;
- executable version/hash;
- Recovery classifications;
- entity versions and next action.

Security rules:

- no Worker launch;
- exact subprocess argv/cwd/env;
- no shell interpolation;
- fixture without `origin`;
- no force/destroy/prune;
- external output untrusted and strictly validated;
- source and worktree realpaths verified;
- missing/ambiguous identity fails closed;
- no secret reads or unbounded logs.

## 21. Rollout and rollback

Rollout sequence:

```text
TC-01
→ final design review and Operator approval
→ implementation plan
→ migration/domain with fakes
→ real grant
→ real Recovery
→ fenced release
→ M01 composition proof
```

Before canonical migration v4:

- create SQLite backup;
- run integrity check;
- record schema and contract hashes.

If real Treehouse preflight fails, real Lease operations remain disabled while M0/M1 and fake-adapter verification continue.

A schema-v4 database is not opened for write by an older binary. Rollback uses the backup or a forward repair; it never performs automatic worktree cleanup.

## 22. Target file boundaries

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

Tests mirror each responsibility. An implementation plan may refine filenames without changing authority or behavior.

## 23. R5 gate

R5 remains `IN_PROGRESS` until:

- TC-01 has an accepted or explicitly limited Verdict;
- findings are incorporated;
- migration and adapter signatures receive adversarial review;
- no external-tool decision remains open;
- the Operator explicitly approves the final microdesign.

```text
Research:            PUBLISHED
TC-01 protocol:      PROPOSED / EXECUTION AUTHORIZED
M01 microdesign:     PROPOSED
M01 implementation: PROHIBITED
Pi Worker dispatch:  PROHIBITED
```

## 24. Change impact

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
    - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
    - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
    - DOC-PROJECT-STATUS
    - TRACKING-WORKLOG
  rationale: "R5 defines bounded M01 state, transaction, adapter, Recovery and proof design."
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
  rationale: "Every M01 requirement has a proposed design and proof; TC-01 remains blocking Evidence."
```

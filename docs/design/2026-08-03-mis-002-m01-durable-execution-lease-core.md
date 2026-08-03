---
id: DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
title: MIS-002 M01 Durable Execution and Lease Core
document_type: microdesign
form: explanation
authority: specification
status: proposed
version: 0.3.0
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

This design remains `proposed`. R5 cannot pass until TC-01 produces acceptable WSL2 evidence, its findings are incorporated and the Operator explicitly approves the final microdesign.

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

M01 owns `CAP-EXEC-REQ-001`, `002`, `004`, `005`, `006`, `007` and `008`.

## 3. Outcome and proof boundary

M01 proves:

- one active Track for the bounded Feature;
- at most one current non-terminal Attempt per Track;
- Worker Run replacement without rewriting Attempt identity;
- Claim and `CLAIM_OPENED` Event atomicity;
- exact contract binding on Attempt, Worker Run, Lease and Claim;
- every Lease grant/release crash window;
- internal and external release fencing;
- no dirty or unclassified work destroyed;
- orphan worktree and Lease-without-worktree reporting;
- fresh-process recovery without transcript or terminal parsing.

Claim and release are not falsely composed in one unsafe scenario. The canonical proof uses sequential Tracks:

```text
Track A
→ grant/recovery/fenced clean release
→ explicit empty-Track abandonment

Track B
→ Worker Run identity + atomic Claim
→ preserved for M02 disposition
```

Only one Track is current for the Feature at a time. Trusted disposable-fixture cleanup happens after Evidence and outside product semantics.

## 4. Non-goals

M01 does not implement Pi launch, production SEC-E1 creation, Authority Snapshot, Writer Pack, Worker completion, Receipt, Gate, Claim disposition, parallel Tracks, scheduler, Saga/workflow engine, broker, generic resource reservations, destructive Recovery, Treehouse force/destroy/prune, remote execution, Issue #15, Integration or delivery.

## 5. Architecture and authority

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

1. services own semantic workflows;
2. stores own local atomicity;
3. adapters return observations, never domain state;
4. no external action occurs inside a SQLite transaction;
5. grant/release use Intent–Action–Observation;
6. Recovery is non-mutating by default;
7. ambiguous or destructive repair requires explicit authority.

| Concern | Authority |
|---|---|
| execution scope | Approved Mission Contract |
| semantic lifecycle | MNFS SQLite |
| code/tree SHA | Git |
| physical worktree | Treehouse + Git |
| semantic Lease | MNFS SQLite |
| external Lease ID/holder | Treehouse observation |
| Worker Run lifecycle | MNFS SQLite |
| Claim lifecycle | MNFS SQLite |
| acceptance | M02 MNFS Gate |

## 6. Identities and lifecycle

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

`ACTIVE` is created with A01. Opening a Claim moves it to `CLAIMED` atomically. `ACTIVE → ABANDONED` is allowed only when:

- no current Claim exists;
- no current Worker Run is active;
- no current Lease exists, or its latest Lease is `RELEASED`;
- worktree state has no unclassified work.

Abandonment is explicit; Lease release does not silently close a Track.

### Attempt

```text
OPEN
SUPERSEDED
CLOSED
CANCELLED
```

Only `OPEN` is current. A replacement Run stays inside the same Attempt.

### Worker Run

```text
STARTING
RUNNING
IDLE
EXITED
LOST
CANCELLED
```

M01 persists identity and replacement history using injected observations. Pi starts in M02.

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

M01 authorizes `OPEN` creation only. It does not add a fake Claim disposition for cleanup.

### Lease

```text
REQUESTED
ACTIVE
RELEASE_PENDING
RELEASED
DIVERGED
```

`DIVERGED` blocks a new Lease pending explicit disposition.

## 7. Migration v4

Migration v4 is additive except for a controlled Events-table rebuild. It is tested against empty, M0, M1/v3 and exact revision-5 databases.

### Event registry

Create `event_types(type PRIMARY KEY, payload_schema_version)`; seed existing and M01 types; rebuild `events.type` as a foreign key while preserving sequence, payload and timestamps.

M01 types:

```text
WRITE_TRACK_OPENED
WRITE_TRACK_ABANDONED
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

This is a fixed registry, not an event bus.

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
id, write_track_id, ordinal, contract_hash, status,
version, created_at, updated_at
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

No `is_current` column exists.

### `worker_runs`

```text
id, attempt_id, ordinal, contract_hash, status,
process_id, process_started_at, exit_code,
version, created_at, updated_at
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
id, write_track_id, contract_hash, generation, status,
idempotency_key, holder, external_lease_id, worktree_path,
external_leased_at, last_observed_at, last_error_code,
last_error_ref, version, created_at, updated_at
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

### `claims`

```text
id, write_track_id, attempt_id, worker_run_id, lease_id,
contract_hash, ordinal, status, base_sha, result_tree_sha,
claimed_criteria_json, version, created_at, updated_at
UNIQUE(attempt_id, ordinal)
UNIQUE(id, contract_hash)
```

Composite foreign keys bind Track, Attempt, Run and Lease to the same contract hash.

```sql
CREATE UNIQUE INDEX claims_one_current_per_attempt
ON claims(attempt_id)
WHERE status IN ('OPEN', 'COMPLETED_BY_WORKER', 'UNDER_VERIFICATION');
```

`base_sha` and `result_tree_sha` are lowercase 40- or 64-character Git object IDs. Claimed criteria are a canonical non-empty array resolving to the approved Feature.

## 8. Transactions, concurrency and contract binding

All persistence shares one `DatabaseSync` connection owned by the current `SqliteStore` composition root. Focused stores cannot open another database.

Use short `BEGIN IMMEDIATE` transactions. Mutable rows carry `version`; updates use compare-and-swap and zero rows produce `CONCURRENCY_CONFLICT`.

Atomic operations:

```text
Track + Attempt A01 + Events
Track abandonment + Event
Claim OPEN + Track CLAIMED + Event
state transition + Event
```

`ExecutionService.openWriteTrack` requires the exact latest approved contract hash and resolves Mission/Milestone/Feature identities and current allocations. Attempts, Runs, Leases and Claims copy the hash and composite relationships prevent mixed-hash children.

Stale authority fails before mutation with `EXECUTION_CONTRACT_CONFLICT`. Replan never rewrites existing runtime rows.

## 9. Service boundaries

### `ExecutionService`

- validate approved target;
- open Track and A01 atomically;
- create replacement Run identity inside the same Attempt;
- explicitly supersede Attempts when later authorized;
- explicitly abandon an empty Track after resource release;
- load complete Track state.

`abandonWriteTrack` requires expected version, no current Claim, no active Run, no current Lease and no unclassified work. It writes `WRITE_TRACK_ABANDONED` atomically.

### `ClaimService`

`openClaim` requires current Track/Attempt/Run, ACTIVE matching Lease, exact contract hash, valid base/result objects, criteria owned by the Feature and no current Claim. It inserts Claim, moves Track to `CLAIMED` and writes `CLAIM_OPENED` atomically. No other Claim transition exists in M01.

### `LeaseService`

Only production component permitted to call `TreehouseAdapter`. Owns grant/release IAO.

### `RecoveryService`

Loads expected state and adapter observations; produces a read-only report. It never acquires, returns, prunes or destroys.

## 10. Observation adapters

TC-01 must prove the exact installed Treehouse binary supports:

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <id> --if-lease-holder <holder>
```

Treehouse process contract:

- pinned version and executable hash;
- exact argv, `shell: false`, closed stdin;
- explicit cwd, timeout and bounded output;
- allowlisted environment with `PATH`, `HOME`, locale, `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`;
- strict JSON for acquisition/status;
- no force, destroy or prune;
- no stderr regex as state;
- no direct Git fallback inside the same operation;
- fixed fixture without `origin`.

`GitWorktreeInspector` uses read-only argv for `rev-parse`, `status --porcelain`, HEAD and tree resolution. It canonicalizes realpaths and never resets, cleans, commits or changes refs.

## 11. Lease grant IAO

For `WT-001`, generation 1:

```text
idempotency_key = lease:grant:WT-001:g1
holder = mnfs-<repo-hash>-lse001-g1
```

Flow:

```text
1. validate Track/Attempt/contract
2. transaction: LSE-001 REQUESTED + LEASE_REQUESTED
3. inspect exact holder
4. use one exact existing match, otherwise invoke JSON acquisition
5. validate realpath, Lease ID, holder and repository ownership
6. transaction: REQUESTED → ACTIVE + external identity + LEASE_GRANTED
```

Crash windows:

- Intent only: same operation may acquire.
- External Lease before commit: deterministic holder is rediscovered; original grant retry completes semantic commit.
- Commit before response: retry returns ACTIVE.
- multiple matches/conflicting input: DIVERGED; no second acquisition.

Generic Recovery never adopts.

## 12. Lease release

Preconditions:

- ACTIVE Lease with matching version/generation;
- complete external identity;
- no active Run;
- no current Claim;
- no unclassified work;
- clean Git observation;
- matching fresh Treehouse observation.

Dirty work returns `LEASE_RELEASE_BLOCKED_DIRTY` without invoking Treehouse.

Flow:

```text
1. validate local/physical preconditions
2. transaction: ACTIVE → RELEASE_PENDING + Event
3. conditional Treehouse return
4. fresh status observation
5. managed path available with no Lease:
   transaction RELEASE_PENDING → RELEASED + Event
6. otherwise DIVERGED
```

Retry:

- RELEASED returns previous semantic result.
- RELEASE_PENDING observes before retry.
- matching Lease may retry the same conditional return.
- different ID/holder is `LEASE_FENCE_CONFLICT`.
- managed available path proves completion.
- missing/unmanaged path is `LD-05`, not automatic success.

After release, the empty Track remains `ACTIVE` until the explicit `track abandon` transition succeeds.

## 13. Recovery

`mnfs recover [--track WT-001]` is read-only.

| Code | Meaning | Default action |
|---|---|---|
| `HEALTHY` | semantic/physical identity match | none |
| `ADOPTABLE` | REQUESTED matches one exact holder | retry original grant |
| `LD-01` | semantic Lease current, physical Lease absent | block |
| `LD-02` | MNFS-like external resource without semantic Lease | preserve/decision |
| `LD-03` | Lease ID differs | block |
| `LD-04` | holder differs | block |
| `LD-05` | path missing, unmanaged or invalid | preserve/decision |
| `UNKNOWN` | observation insufficient | block |

Reports contain expected, observed, severity, safe actions, recommendation and required authority. Plain recovery makes no state change.

## 14. CLI

```text
mnfs track open
  --mission MIS-002 --milestone M01 --feature F01
  --contract sha256:... [--json]

mnfs track show --track WT-001 [--json]
mnfs track abandon --track WT-001 --expected-version <n> [--json]

mnfs lease grant --track WT-001 [--json]
mnfs lease show --lease LSE-001 [--json]
mnfs lease release --lease LSE-001 --expected-version <n> [--json]

mnfs recover [--track WT-001] [--json]
```

Run and Claim services remain typed internal interfaces exercised by tests; production commands arrive in M02.

Every exposed command has stable human/JSON output, typed error, exit class and next action.

## 15. Errors

```text
EXECUTION_TARGET_INVALID
EXECUTION_CONTRACT_CONFLICT
WRITE_TRACK_CONFLICT
WRITE_TRACK_NOT_ABANDONABLE
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

Raw output is stored by bounded Artifact reference when necessary.

## 16. Design Coverage Matrix

| Requirement | Design | Failure | Verification |
|---|---|---|---|
| REQ-001 | Attempt lifecycle + partial index | duplicate OPEN rollback | unit/migration/fresh process |
| REQ-002 | separate Attempt/Run IDs | new Run preserves Attempt/history | replacement tests |
| REQ-004 | Claim transaction | Event/state failure rolls back | injected conflict |
| REQ-005 | approval lookup + hash + composite FKs | stale/mixed hash rejected | service/FK/Replan tests |
| REQ-006 | Lease IAO | REQUESTED or recoverable holder after crash | crash matrix/TC-01/WSL2 |
| REQ-007 | generation + operation key + external fence | stale ID/holder cannot release; dirty preserved | unit + TC-01 S08–S11 |
| REQ-008 | read-only Recovery + LD taxonomy | ambiguity blocks; no destruction | DR-04/DR-05/fresh process |

All seven have proposed design, failure behavior and proof. TC-01 remains blocking.

## 17. Verification

TDD is mandatory.

Deterministic coverage:

- ID allocation;
- lifecycle transitions;
- one current Track/Feature, Attempt/Track, Run/Attempt, Lease/Track and Claim/Attempt;
- Track abandonment guards;
- optimistic conflicts;
- composite hash mismatch;
- Claim/Event and Track/Attempt atomicity;
- migration from empty, M0 and M1/v3;
- exact revision-3/revision-5 preservation;
- every grant/release crash window;
- stale fence and dirty-worktree behavior;
- Recovery non-mutation.

Canonical proof:

```text
Scenario A
A1 open Track + Attempt; grant; terminate at named crash window
A2 recover; reject duplicates; fenced clean release; explicit Track abandonment
A3 recover ABANDONED Track and RELEASED Lease; repeated release is idempotent

Scenario B
B1 open next Track + Attempt + Run identity; grant; atomic Claim
B2 recover identical Track/Attempt/Run/Lease/Claim; no duplicate current work
product cleanup: none; preserved for M02
trusted fixture cleanup: after Evidence, outside product semantics
```

Pi/SEC-E1 are absent.

## 18. Observability, security and rollback

Record Domain Events, durations, adapter exit classes, bounded output refs, executable version/hash, Recovery classifications, entity versions and next action.

Security:

- exact argv/cwd/env; no shell interpolation;
- fixture without origin;
- no force/destroy/prune;
- strict untrusted-output validation;
- realpath verification;
- ambiguous identity fails closed;
- no secret reads or unbounded logs.

Rollout:

```text
TC-01
→ final review/Operator approval
→ implementation plan
→ domain/migration with fakes
→ real grant/recovery/release
→ M01 composition proof
```

Before migration v4: backup SQLite, run integrity check and record schema/contract hashes. Older binaries cannot write schema v4. Rollback uses backup or forward repair and never performs automatic worktree cleanup.

## 19. Target files

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

Tests mirror responsibilities. The implementation plan may refine filenames without changing behavior or authority.

## 20. R5 gate and impact

R5 remains `IN_PROGRESS` until TC-01 Verdict, finding reconciliation, adversarial review and explicit Operator approval.

```text
Research:            PUBLISHED
TC-01 protocol:      PROPOSED / EXECUTION AUTHORIZED
M01 microdesign:     PROPOSED
M01 implementation: PROHIBITED
Pi Worker dispatch:  PROHIBITED
```

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
    - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
    - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
    - DOC-DOCUMENTATION-MAP
    - DOC-PROJECT-STATUS
    - TRACKING-WORKLOG
  rationale: "R5 defines bounded M01 state, transactions, adapters, Recovery and proof."
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
  rationale: "Every M01 requirement has proposed design and proof; TC-01 remains blocking Evidence."
```

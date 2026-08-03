---
id: DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
title: MNFS Research — M01 Durable Execution and Lease Core
 document_type: research_report
form: explanation
authority: research_historical
status: published
source_manifest: MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.sources.json
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - research evidence for MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
related:
  - CAP-EXECUTION
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DOC-CAPABILITY-ROADMAP
  - ACCEPTANCE-M2-UNBLOCK
last_reviewed: 2026-08-03
tracking_issue: 16
---

# MNFS Research — M01 Durable Execution and Lease Core

**Status:** Published research evidence for MCRM R5  
**Date:** 2026-08-03  
**Scope:** Validate the proposed architecture for `MIS-002/M01` before its Milestone Microdesign becomes implementation authority

---

# 1. Executive conclusion

The central MNFS direction is sound:

```text
repository-owned doctrine and contracts
+
durable local operational state
+
replaceable agent/runtime adapters
+
explicit execution and security boundaries
+
independent verification and acceptance
```

The evidence supports keeping MNFS as its own domain control plane rather than reducing it to a wrapper around Pi, Treehouse, a terminal multiplexer or a generic workflow framework.

The correct M01 boundary is:

```text
SQLite
→ semantic authority for Write Track, Attempt, Worker Run, Claim and Lease

Treehouse
→ physical authority for managed worktrees and external lease identity

Git/filesystem
→ physical code-tree observations

MNFS services
→ transaction rules, contract binding, idempotency, fencing and Reconcile
```

The proposed M01 design should proceed with five corrections:

1. **Treehouse requires a production-adapter conformance protocol before implementation.** Its CLI is capable of stable lease identity and conditional release, but acquisition may fetch, status may heal internal metadata and return may reset a worktree.
2. **Currentness should derive from lifecycle state and unique partial indexes**, not a second `is_current` flag that can diverge.
3. **Contract binding should be enforced in both application logic and composite database relationships.**
4. **One SQLite connection remains the transaction authority**, while persistence code is split into focused stores rather than extending one monolithic file indefinitely.
5. **Pi and SEC-E1 production dispatch remain in M02.** M01 implements the durable identity and Lease foundation only.

No reviewed source justifies adopting a scheduler, Temporal, LangGraph, a message broker, distributed consensus, an ORM or a generic Saga engine for M01.

---

# 2. Research questions

This report evaluates:

1. Is repository-owned doctrine and structured planning the correct foundation for an agentic development harness?
2. Should operational lifecycle state remain in SQLite?
3. Should Pi, Treehouse or another external tool own MNFS execution state?
4. What recovery model is appropriate for one local Worker?
5. What must be proven before using Treehouse as the production Lease adapter?
6. Which abstractions are necessary now, and which are premature?

---

# 3. Repository knowledge and contracts

OpenAI's harness-engineering report describes an agent-first repository in which human work moves from manual coding toward environment design, specification, tools, guardrails and feedback loops. It emphasizes working depth-first, turning missing capabilities into enforceable repository assets, and making repository knowledge the system of record. [openai-harness-engineering]

This supports the MNFS chain:

```text
Product Blueprint
→ ADR
→ Capability Spec
→ Approved Mission Contract
→ Milestone Microdesign
→ Implementation Plan
→ Evidence
```

The result should not be interpreted as "more documentation is always better." The useful property is that architecture, constraints, commands and proof become discoverable and mechanically checkable without transcript dependence.

The Anthropic long-running-agent harness examples reinforce three compatible patterns: criteria begin in a failing state, evaluation is performed by a fresh context without write tools, and progress/handoff is persisted to disk and Git instead of living only in a conversation. [anthropic-long-running]

MNFS generalizes those patterns into durable domain objects:

```text
criterion default-fail
→ Worker Claim
→ runner-owned Receipt
→ Gate Verdict
```

This is stricter than trusting an agent's final message or test summary.

---

# 4. Evaluation and proof architecture

Anthropic's agent-evaluation guidance distinguishes transcript grading from outcome grading and recommends layered automated, model-based and human evaluation. It specifically treats code-based outcome verification as the first line of defense while reserving human and model judgment for the parts that need them. [anthropic-agent-evals]

For M01, nearly every deciding criterion is deterministic:

- database invariants;
- transaction rollback;
- content-hash binding;
- external Lease identity;
- crash-window recovery;
- dirty-worktree preservation;
- stale-holder rejection;
- divergence classification.

Therefore M01 should prefer code-based tests, inspection and real WSL2 demonstrations. Model judgment is not needed for its Gate R5 or implementation proof.

The result also validates the MNFS rule:

> Worker output is an input to verification, not a Verdict.

---

# 5. Pi boundary

Pi provides the right extension surfaces for the future Worker runtime:

- lifecycle events;
- custom tools;
- commands;
- dynamic tool inventory;
- project-local extensions;
- `--no-builtin-tools`;
- explicit extension loading. [pi-extensions] [pi-usage]

However, Pi extensions run with the full permissions of the host user. Its documentation explicitly treats extensions as trusted arbitrary code. [pi-extensions]

Consequences:

1. Pi cannot be the MNFS security boundary.
2. Pi Session state cannot be the execution lifecycle authority.
3. Pi tools must be brokered through the approved Environment policy.
4. M01 should persist Worker Run identity without launching Pi.
5. M02 should load only the pinned auth integration and the exact reviewed MNFS extension, with built-ins and extension discovery disabled.

This preserves Pi as a replaceable reasoning/runtime component instead of coupling product doctrine to one agent implementation.

---

# 6. Comparison with orchestrators and agent distros

## 6.1 OpenAI Symphony

Symphony validates several MNFS concepts:

- repository-owned workflow policy;
- isolated per-item workspace;
- distinct run attempts;
- typed lifecycle phases;
- reconciliation before dispatch;
- operator-visible observability;
- no claim that process exit automatically means business completion. [openai-symphony]

Symphony intentionally permits restart recovery from tracker and filesystem without restoring exact in-memory scheduler state. That is appropriate for its tracker-driven service specification, but it does not satisfy MNFS M2, where Lease, Attempt, Worker Run and Claim identities must survive Lead replacement exactly.

Therefore Symphony is a useful orchestration reference, not a persistence model for MNFS.

## 6.2 Firstmate

Firstmate validates worktree-per-task, visible supervision and a single coordinating agent. It explicitly describes itself as an agent distribution rather than a harness or domain control plane. [firstmate]

MNFS should reuse operational and UX lessons from Firstmate while retaining its own lifecycle, contract and Evidence model.

## 6.3 Generic workflow frameworks

A checkpointed graph or workflow engine could store execution progress, but it would introduce a second lifecycle vocabulary beside MNFS:

```text
framework thread/checkpoint/node state
versus
MNFS Track/Attempt/Run/Claim/Lease state
```

M01 contains one local Writer path and one external resource. A workflow framework would not eliminate the need to design the domain, crash windows, Treehouse fencing or database invariants. It would primarily add translation and operational dependencies.

Disposition:

```text
use durable-execution concepts
→ do not adopt a workflow framework in M01
```

---

# 7. SQLite as local operational authority

SQLite directly supports the M01 consistency model.

## 7.1 One current entity by lifecycle state

Unique partial indexes enforce uniqueness only for rows matching a predicate. This is the correct primitive for invariants such as one current non-terminal Attempt per Write Track. [sqlite-partial-index]

Recommended form:

```sql
CREATE UNIQUE INDEX attempts_one_open_per_track
ON attempts(write_track_id)
WHERE status = 'OPEN';
```

This is preferable to storing both `status` and `is_current`.

## 7.2 Composite contract binding

SQLite supports composite foreign keys when the parent key is a matching primary or unique key. [sqlite-foreign-keys]

This allows the database to reject a Worker Run or Claim whose `contract_hash` differs from its parent Attempt.

## 7.3 Transactions and concurrency

The current product already uses:

- WAL;
- foreign keys;
- short `BEGIN IMMEDIATE` transactions;
- atomic state plus Event writes;
- process-independent recovery.

M01 remains a local, low-writer-concurrency workload. The limiting property that WAL permits only one writer at a time is acceptable because M01 explicitly excludes parallel Write Tracks.

Disposition:

```text
keep SQLite
→ split persistence responsibilities
→ preserve one connection and one transaction authority
```

PostgreSQL, Redis locks or distributed consensus are not justified.

---

# 8. Git worktree boundary

Git documents that linked worktrees share most refs and repository configuration while keeping selected per-worktree metadata. It recommends using Git commands such as `git rev-parse --git-path` instead of assuming internal paths. [git-worktree]

Consequences for M01:

- a worktree is filesystem/code isolation, not process or credential isolation;
- the source repository and linked worktree share sensitive Git metadata;
- the adapter must discover and validate real paths;
- worktree cleanliness must be inspected before release;
- no release may silently discard unclassified work;
- the Treehouse pool and source checkout must be observed separately.

This confirms ADR-0003 and ADR-0006 rather than replacing either.

---

# 9. Treehouse production-adapter findings

Treehouse 2.1.x provides exactly the external identity primitives M01 needs:

- durable process-independent Lease;
- immutable external `lease_id`;
- optional holder;
- JSON acquisition output;
- JSON status output;
- conditional return using expected Lease ID and holder;
- atomic internal state writes;
- conservative recovery when state is corrupt. [treehouse-get] [treehouse-status] [treehouse-return] [treehouse-pool] [treehouse-state] [treehouse-changelog]

But source inspection identifies material behavior that must be proven against the installed binary.

## 9.1 Acquisition may fetch

When an `origin` remote exists, Treehouse acquisition may run `git fetch`. [treehouse-pool]

The fixed M2 Golden Proof denies network and credentials. Therefore its fixture must have no remote, or a future Treehouse capability must explicitly disable fetch. M01 must not normalize hidden network access.

## 9.2 Acquisition may touch ignore configuration

The CLI attempts to ensure the pool location is ignored. [treehouse-get]

TC-01 must prove the selected pool configuration does not modify the source checkout.

## 9.3 Status can heal Treehouse metadata

Treehouse status/list may normalize its own state under the Treehouse lock. [treehouse-status] [treehouse-pool]

MNFS Recovery remains read-only with respect to MNFS state and physical worktrees, but documentation must not falsely claim that invoking Treehouse status is byte-for-byte read-only for Treehouse's private metadata.

## 9.4 Return is potentially destructive

Treehouse return may detach and reset the worktree before clearing its reservation. Conditional release protects identity, but it does not replace MNFS preconditions. [treehouse-return] [treehouse-pool]

MNFS must require:

```text
correct internal Lease and generation
AND matching external Lease ID and holder
AND no active Worker Run
AND no unpreserved Claim/work
AND clean worktree
```

The production adapter must never use force.

## 9.5 External release is not assumed idempotent

MNFS provides semantic idempotency through its Lease state and fresh status observation. It must not infer `ALREADY_RELEASED` from a broad regular expression over human stderr.

Conclusion:

> Treehouse remains the preferred physical workspace adapter, but TC-01 is a blocking R5 input.

---

# 10. Sandbox boundary

Anthropic Sandbox Runtime provides OS-level filesystem and network enforcement using Bubblewrap on Linux and proxy-based network filtering. It also documents Linux-specific behavior for literal paths, Unix sockets, mandatory deny paths and user-namespace policy. [sandbox-runtime]

The project is explicitly a Beta Research Preview whose APIs may change. [sandbox-runtime]

Consequences:

- keep exact version pinning;
- bind policy hashes;
- fail closed;
- prohibit weaker modes for the accepted E1 path;
- rerun Evidence after relevant dependency or host changes;
- keep production E1 dispatch in M02;
- do not let M01's domain design depend on Sandbox Runtime internals.

This preserves adapter replaceability.

---

# 11. Recommended M01 architecture

```text
CLI / future Lead
        |
        v
ExecutionService ─────────────┐
LeaseService ─────────────────┼── SqliteStore composition root
RecoveryService ──────────────┘          |
        |                                +── execution persistence
        |                                +── Event persistence
        |                                +── approved-contract lookup
        |
        +── TreehouseAdapter
        +── GitWorktreeInspector
```

Rules:

1. Application services own workflows and transitions.
2. SQLite stores own local atomicity.
3. Adapters return observations, not domain state.
4. No external action occurs inside a SQLite transaction.
5. Lease grant/release follow Intent–Action–Observation.
6. Recovery compares expected semantic state with observed physical state.
7. Repair is read-only by default and destructive action requires explicit authority.
8. Worker process launch remains absent.

---

# 12. Adopted design decisions

## D1 — No duplicate currentness flag

Current Attempt and current Lease are derived from non-terminal lifecycle states and unique partial indexes.

## D2 — Double contract enforcement

Services verify the current approved contract, and the schema uses composite parent relationships to prevent mixed-hash children.

## D3 — Focused execution store, shared connection

The existing `SqliteStore` remains the composition root and public compatibility surface. New execution persistence moves into a focused module using the same `DatabaseSync` connection.

## D4 — Event type registry instead of repeated hard-coded CHECK rebuilds

M01 introduces several new Domain Event types and M02 will introduce more. A small seeded `event_types` table keeps database enforcement without converting the Events table into unrestricted text or repeatedly rebuilding it for each new type.

This is not a generic event bus: payloads remain domain-owned and no delivery subsystem is added.

## D5 — Treehouse identity used as external fencing input

MNFS stores its own Lease identity and generation plus Treehouse `lease_id`, holder and path. Release validates both semantic and physical identity.

## D6 — No hidden network in the Golden Proof

TC-01 and M2 use a dedicated local fixture repository without `origin`.

## D7 — No automatic orphan adoption or destruction

Recovery classifies `LD-01` through `LD-05`, reports safe actions and preserves work. A retried grant may finalize an exact holder-matching `REQUESTED` intent; generic Recovery does not mutate.

## D8 — Pi and E1 dispatch deferred to M02

M01 persists Worker Run and Claim identity for domain continuity but performs no Pi launch.

---

# 13. Rejected alternatives

| Alternative | Disposition | Reason |
|---|---|---|
| Directly expand one monolithic `SqliteStore` file | Rejected | mixes M0/M1 persistence with external-operation workflows and Recovery |
| Separate database per subsystem | Rejected | breaks atomic Event/state relationships and creates multiple authorities |
| Treehouse state file as MNFS authority | Rejected | private external implementation and competing lifecycle semantics |
| Parse human Treehouse output as state | Rejected | brittle and unnecessary when JSON identity surfaces exist |
| One new worktree per retry | Rejected | violates Write Track/Attempt separation |
| Generic Saga engine | Rejected | one real external operation and no second consumer |
| Message broker/outbox | Rejected | no durable transport problem in M01 |
| LangGraph/Temporal | Rejected | second workflow state model and premature infrastructure |
| PostgreSQL/Redis | Rejected | local one-writer slice does not require distributed state |
| Pi Session as recovery memory | Rejected | process/session state is replaceable and non-authoritative |
| Unrestricted Worker followed by tests | Rejected | tests do not compensate for host authority or secret exposure |

---

# 14. Risks that remain before R5 PASS

## Blocking

- TC-01 has not yet executed against the installed canonical Treehouse binary.
- Exact Treehouse holder constraints and repeated-release outputs remain observations to record, not assumptions.
- The final migration and adapter signatures require adversarial review after TC-01.

## Non-blocking for the design branch

- Issue #15 repository-identity reattachment remains separate.
- Production SEC-E1 and Pi process integration remain M02.
- Generalized Receipt, Review and Integration remain later Product Milestones.

---

# 15. Final recommendation

Proceed with a dedicated M01 R5 branch and draft PR containing:

1. this research report and source manifest;
2. TC-01 conformance protocol;
3. proposed M01 microdesign;
4. Design Coverage Matrix;
5. tracking updates.

Execute TC-01 before approving the microdesign. If conformance fails materially, revise the adapter or improve Treehouse upstream rather than hiding the behavior behind parsing or broad exceptions.

Only after the final microdesign receives explicit Operator approval should MNFS create an implementation plan and begin F01 through TDD.

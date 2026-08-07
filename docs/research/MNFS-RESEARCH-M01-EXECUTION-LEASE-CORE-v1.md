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

MNFS should remain its own domain control plane rather than becoming a wrapper around Pi, Treehouse, terminal presentation or a generic workflow framework.

The correct M01 authority split is:

```text
SQLite
→ semantic authority for Write Track, Attempt, Worker Run, Claim and Lease

Treehouse
→ physical authority for managed worktrees and external Lease identity

Git/filesystem
→ physical code-tree observations

MNFS services
→ contract binding, transactions, idempotency, fencing and Reconcile
```

The proposed design should proceed with five corrections:

1. Treehouse requires a production-adapter conformance protocol before implementation.
2. Currentness derives from lifecycle state and unique partial indexes, not a second `is_current` flag.
3. Contract binding is enforced in application logic and relational constraints.
4. One SQLite connection remains transaction authority while focused stores replace continued monolithic growth.
5. Pi and production SEC-E1 dispatch remain in `MIS-002/M02`.

No reviewed source justifies a scheduler, Temporal, LangGraph, message broker, distributed consensus, ORM or generic Saga engine for M01.

---

# 2. Repository knowledge and contracts

OpenAI's harness-engineering report describes an agent-first repository in which human effort shifts toward environment design, specifications, tools, guardrails and feedback loops. It emphasizes depth-first capability growth and turning missing capabilities into repository-owned, enforceable assets. [openai-harness-engineering]

This supports the MNFS authority chain:

```text
Product Blueprint
→ ADR
→ Capability Spec
→ Approved Mission Contract
→ Milestone Microdesign
→ Implementation Plan
→ Evidence
```

The value is not documentation volume. The value is that architecture, constraints, commands and proof remain discoverable and mechanically checkable without transcript dependence.

Anthropic's long-running harness examples reinforce default-failing criteria, fresh evaluation contexts without write authority and durable progress/handoff artifacts. [anthropic-long-running]

MNFS extends that pattern:

```text
criterion default-fail
→ Worker Claim
→ runner-owned Receipt
→ Gate Verdict
```

---

# 3. Evaluation and proof

Anthropic's evaluation guidance distinguishes transcript grading from outcome grading and recommends code-based verification as the first line of defense. [anthropic-agent-evals]

M01 criteria are predominantly deterministic:

- database invariants;
- transaction rollback;
- exact contract-hash binding;
- external Lease identity;
- crash-window recovery;
- dirty-worktree preservation;
- stale-holder rejection;
- divergence classification.

M01 therefore uses tests, inspection and real WSL2 demonstrations. Model self-assessment is not deciding Evidence.

---

# 4. Pi boundary

Pi provides appropriate future runtime surfaces: lifecycle events, custom tools, commands, dynamic tool inventory, project-local extensions, builtin-tool disabling and explicit extension loading. [pi-extensions] [pi-usage]

Pi extensions are trusted code running with the host user's permissions. [pi-extensions]

Consequences:

1. Pi is not the MNFS security boundary.
2. Pi Session state is not lifecycle authority.
3. Pi tools must be brokered under the approved Environment policy.
4. M01 persists Worker Run identity without launching Pi.
5. M02 loads only reviewed, pinned extensions and disables uncontrolled tool discovery.

---

# 5. Comparison with adjacent systems

## OpenAI Symphony

Symphony validates repository-owned workflow policy, per-item workspaces, attempts, reconciliation and operator-visible status. [openai-symphony]

Its tracker/filesystem recovery model is appropriate for its scope, but MNFS requires exact durable Lease, Attempt, Worker Run and Claim identities. Symphony is therefore an orchestration reference, not the MNFS persistence model.

## Firstmate

Firstmate validates worktree-per-task operation, visible supervision and a single coordinating agent. [firstmate]

It is an agent distribution rather than a governed domain control plane. MNFS should reuse operational lessons while retaining its own contracts, lifecycle and Evidence model.

## Generic workflow frameworks

A checkpointed workflow framework would create a second lifecycle vocabulary beside MNFS:

```text
framework thread/checkpoint/node state
versus
MNFS Track/Attempt/Run/Claim/Lease state
```

It would not remove the need to design crash windows, Treehouse fencing or database invariants. M01 adopts durable-execution concepts without adopting a workflow engine.

---

# 6. SQLite as operational authority

SQLite directly supports M01.

Unique partial indexes enforce one non-terminal entity for a parent without duplicating currentness fields. [sqlite-partial-index]

```sql
CREATE UNIQUE INDEX attempts_one_open_per_track
ON attempts(write_track_id)
WHERE status = 'OPEN';
```

Composite foreign keys allow child entities to be bound to the same contract hash as their parent when a matching unique parent key exists. [sqlite-foreign-keys]

The current product already uses WAL, foreign keys, short `BEGIN IMMEDIATE` transactions, atomic state plus Event writes and fresh-process recovery. M01 excludes parallel Write Tracks, so SQLite's single-writer model remains appropriate.

Disposition:

```text
keep SQLite
→ keep one connection and one transaction owner
→ split focused persistence responsibilities
```

---

# 7. Git worktree boundary

Git documents that linked worktrees share repository state while retaining selected per-worktree metadata. It recommends resolving internal paths with Git commands rather than assumptions. [git-worktree]

Therefore:

- worktree isolation is not process, credential or network isolation;
- source and linked worktree share sensitive Git metadata;
- adapters resolve real paths explicitly;
- cleanliness is inspected before release;
- unclassified work is never silently discarded;
- source checkout and Treehouse pool are observed separately.

---

# 8. Treehouse findings

Treehouse 2.1.x provides the external primitives M01 needs:

- durable process-independent Lease;
- immutable `lease_id`;
- optional holder;
- JSON acquisition and status;
- conditional return using expected Lease ID and holder;
- atomic internal state persistence;
- conservative recovery after corrupt state. [treehouse-get] [treehouse-status] [treehouse-return] [treehouse-pool] [treehouse-state] [treehouse-changelog]

Source inspection also identifies material behaviors that require TC-01 evidence.

## Acquisition may fetch

When an `origin` exists, acquisition may invoke `git fetch`. [treehouse-pool]

The fixed M2 proof denies network and credentials. Its fixture must therefore have no remote unless a future approved Treehouse capability disables fetch explicitly.

## Acquisition may touch ignore configuration

The CLI attempts to ensure that the pool location is ignored. [treehouse-get]

TC-01 must prove the chosen configuration does not mutate the source checkout unexpectedly.

## Status may heal private Treehouse metadata

Status/list may normalize Treehouse's own state under its lock. [treehouse-status] [treehouse-pool]

MNFS Recovery remains read-only regarding MNFS state and physical work, but documentation must not claim Treehouse private metadata is byte-for-byte unchanged.

## Return is potentially destructive

Return may detach and reset the worktree before clearing its Lease. Conditional identity checks are necessary but insufficient. [treehouse-return] [treehouse-pool]

MNFS release requires:

```text
correct internal Lease and generation
AND matching external Lease ID and holder
AND no active Worker Run
AND no unpreserved Claim or work
AND clean worktree
```

The adapter never uses force.

## External release is not assumed idempotent

Semantic idempotency comes from MNFS state plus fresh Treehouse observation. Human stderr is not authoritative and broad regex classification is prohibited.

Conclusion:

> Treehouse remains the preferred physical workspace adapter, but TC-01 is a blocking R5 input.

---

# 9. Sandbox boundary

Anthropic Sandbox Runtime supplies OS-level filesystem and network enforcement and documents Linux-specific limitations. It is explicitly a Beta Research Preview. [sandbox-runtime]

Consequences:

- exact version pinning;
- policy-hash binding;
- fail-closed startup;
- no weaker mode for accepted E1;
- revalidation after relevant dependency or host change;
- production dispatch remains in M02;
- M01 domain design does not depend on Sandbox Runtime internals.

---

# 10. Recommended architecture

```text
CLI / future Lead
        |
        v
ExecutionService ─────────────┐
LeaseService ─────────────────┼── shared SQLite composition root
RecoveryService ──────────────┘          |
        |                                +── execution persistence
        |                                +── Event persistence
        |                                +── approved-contract lookup
        |
        +── TreehouseAdapter
        +── GitWorktreeInspector
```

Rules:

1. Application services own workflows and state transitions.
2. SQLite stores own local atomicity.
3. Adapters return observations, never domain state.
4. External actions never run inside SQLite transactions.
5. Grant and release follow Intent–Action–Observation.
6. Recovery compares semantic expectation with physical observation.
7. Repair is read-only by default; destructive action requires explicit authority.
8. No Pi process is launched in M01.

---

# 11. Adopted decisions

- **No duplicate currentness flag:** lifecycle states plus unique partial indexes define current entities.
- **Double contract enforcement:** services validate current approval; composite relationships prevent mixed-hash children.
- **Focused stores, shared connection:** retain one transaction authority while reducing file responsibility.
- **Small Event type registry:** preserve database-enforced event names without rebuilding a hard-coded CHECK for every new milestone; this is not a broker or generic event bus.
- **External fencing:** store internal Lease identity and generation with Treehouse Lease ID, holder and path.
- **No hidden network:** TC-01 and M2 use a local fixture without `origin`.
- **No automatic orphan adoption or destruction:** Recovery reports `LD-01` through `LD-05`; only a retried exact intent may complete its own adoption.
- **Pi and E1 dispatch deferred:** Worker Run and Claim identity exist in M01, execution begins in M02.

---

# 12. Rejected alternatives

| Alternative | Disposition | Reason |
|---|---|---|
| Expand one monolithic store file | Rejected | mixes persistence, external operations and Recovery |
| Separate database per subsystem | Rejected | breaks atomic state/Event relationships |
| Treehouse state file as MNFS authority | Rejected | private external implementation and competing semantics |
| Parse human Treehouse output | Rejected | brittle; JSON identity surfaces exist |
| New worktree per retry | Rejected | violates Write Track/Attempt separation |
| Generic Saga or message broker | Rejected | no second proven consumer |
| LangGraph or Temporal | Rejected | duplicate workflow-state model and premature infrastructure |
| PostgreSQL or Redis | Rejected | local one-Writer slice does not require distributed state |
| Pi Session as Recovery memory | Rejected | Session is replaceable and non-authoritative |
| Unrestricted Worker followed by tests | Rejected | tests do not compensate for host authority or secret exposure |

---

# 13. Remaining R5 blockers

- TC-01 has not executed against the canonical installed Treehouse binary.
- Exact holder, dirty-worktree and repeated-release behavior remains evidence to collect.
- Final migration and adapter signatures require adversarial review after TC-01.

Issue #15 remains separate. Production Pi/SEC-E1 integration remains M02. Generalized Receipt, Review and Integration remain later Product Milestones.

---

# 14. Recommendation

Proceed in the dedicated Issue #16 branch with:

1. this report and its validated source manifest;
2. TC-01 production-adapter conformance protocol;
3. proposed M01 microdesign and Design Coverage Matrix;
4. project tracking updates.

Execute TC-01 before approving the microdesign. A material conformance failure requires revising the adapter or improving Treehouse upstream rather than hiding behavior behind parsing or broad exceptions.

Only after explicit Operator approval of the final microdesign may MNFS create an implementation plan and begin F01 through TDD.

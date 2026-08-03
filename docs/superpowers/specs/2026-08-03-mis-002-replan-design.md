---
id: DESIGN-MIS-002-REPLAN
title: MIS-002 schema v2 Replan and M2 readiness reconciliation
document_type: microdesign
form: explanation
authority: specification
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DOC-CAPABILITY-ROADMAP
  - CAP-EXECUTION
  - EVID-PLAN-CONTRACT-SCHEMA-V2
  - ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2
tracking_issue: 9
last_reviewed: 2026-08-03
---

# MIS-002 schema v2 Replan and M2 readiness reconciliation

## 1. Decision summary

Issue #9 will reconcile the accepted architecture baseline, the accepted AS-02 evidence and the immutable historical `MIS-002` revision 3 into one new schema-v2 Mission Plan Revision.

The selected approach is:

```text
reconcile canonical coverage
→ resolve Capability Readiness R3
→ author a two-Milestone MIS-002 schema-v2 Replan
→ review through Lavish
→ approve the exact new content hash
→ replace proposed allocation with approved allocation
→ recalculate R0–R4
→ record an explicit Operator M2-unblock decision
```

This work does not implement the M2 Worker. It creates the governed contract and the evidence necessary to decide whether implementation may begin.

## 2. Authoritative inputs

The Replan is derived from the following hierarchy:

1. accepted Product Blueprint;
2. accepted ADRs and MCRM;
3. accepted capability roadmap M2 definition;
4. `CAP-EXECUTION` Specification and machine-readable traceability;
5. accepted Plan Contract schema v2 evidence;
6. accepted AS-02 report;
7. historical `MIS-002` revision 3.

Historical revision 3 remains immutable:

```text
Git blob SHA: 6b79117fe66cd5c9c8142099828812f470ce20de
Revision:     3
Content hash: sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1
```

The new revision must be created through the existing Replan flow using that exact approved content hash as `expectedPreviousHash`. No file edit may rewrite revision 3 in place.

## 3. Problem being solved

The current canonical repository contains three different states that must be reconciled before M2:

- the Product Blueprint and roadmap define the complete secure one-Worker outcome;
- `CAP-EXECUTION/TRACEABILITY.json` allocates 28 requirements but still contains pre-AS-02 blocker language;
- `MIS-002` revision 3 preserves the original vertical-slice intent but predates schema-v2 criteria, Attempt and Worker Run identity, E1 security, Current Authority Snapshot, complete recovery and runner-owned proof.

A structurally valid document set is not sufficient. The method requires semantic freshness, bidirectional allocation and an explicit readiness decision.

## 4. Invariants

The following rules are non-negotiable:

1. revision 3 remains byte-for-byte unchanged;
2. the Replan uses `schemaVersion: 2`;
3. Mission, Milestone and Feature criteria are all present and independently decidable;
4. every applicable M2 MUST requirement is allocated or explicitly dispositioned;
5. proof methods come from the Capability Spec and traceability, not from ad hoc plan wording;
6. no Feature exists without parent outcome and requirement lineage;
7. no child-count aggregation accepts a Milestone or Mission;
8. Worker completion is never Claim acceptance;
9. Pi process state, transcripts and messages are never authoritative lifecycle state;
10. real Worker dispatch is fail-closed under E1;
11. no deciding criterion depends on Herdr, Observational Memory, `pi-link`, remote execution or an external observability backend;
12. R0–R4 are recalculated mechanically after exact-hash approval;
13. M2 remains blocked until the Operator explicitly records an unblock decision.

## 5. Stage A — semantic coverage reconciliation

### 5.1 AS-02 evidence update

`CAP-EXECUTION/TRACEABILITY.json` must stop claiming that AS-02 has not executed.

The reconciliation will:

- add `ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2` as evidence for the security requirements that consume AS-02;
- remove `AS-02 not executed` from requirements `CAP-EXEC-REQ-010` through `CAP-EXEC-REQ-013`;
- remove `BLOCK-AS-02` from `blockingItems`;
- update `nextSequence` so it begins with Capability review and Replan;
- update R4 reason so the remaining contract blocker is the unavailable approved schema-v2 Replan;
- regenerate `COVERAGE.md` from the structured source.

AS-02 evidence does not by itself mark the future M2 implementation as `VERIFIED`. Requirements remain at the highest honest pre-implementation state, because the spike proves the candidate boundary while M2 must still bind and exercise that boundary in the actual execution flow.

### 5.2 Receipt roadmap clarification

The Blueprint roadmap requires a deterministic runner-owned Receipt in M2, while the domain implementation-status table currently places the generic Receipt capability at M5.

The canonical interpretation will be made explicit:

```text
M2
→ one bounded Minimal Deterministic Receipt for the fixed Golden Proof

M5 and later
→ generalized Receipt, Evidence, Integration and QA capability
```

This is a clarification of realization depth, not a transfer of the complete quality subsystem into M2.

## 6. Stage B — Capability Readiness R3

`CAP-EXECUTION` remains `proposed`; therefore R3 cannot be changed to `PASS` solely because AS-02 passed.

Before the Mission contract is approved, the Operator reviews the Capability Spec against the MCRM R3 checklist:

- goals and non-goals are complete;
- all 28 requirements have sources and planned proofs;
- applicability has no unassessed domain;
- state, security, recovery and external-operation failure modes are named;
- Golden Proof is executable;
- upgrade, rollback and removal behavior exist;
- no high-impact open question remains;
- scope remains the fixed secure one-Worker slice.

After explicit Operator acceptance:

- `CAP-EXECUTION` status changes from `proposed` to `accepted`;
- R3 changes to `PASS` with a reason tied to the accepted Spec version;
- generated coverage is refreshed;
- R4 remains blocked until the exact Replan hash is approved.

## 7. Stage C — Mission structure

The Replan keeps two Mission Milestones. This preserves the roadmap and existing proposed allocations while avoiding an overloaded implementation through bounded Features.

```text
MIS-002
├── M01 — Durable Execution and Lease Core
└── M02 — Governed E1 Worker, Recovery and Acceptance
```

A third Mission Milestone was considered and rejected. It would require broad allocation churn without adding a distinct Product outcome that cannot be represented by Feature boundaries and Milestone composition criteria.

## 8. M01 — Durable Execution and Lease Core

### 8.1 Outcome

MNFS possesses a durable, contract-bound execution identity model and can acquire, observe, reconcile and release one Treehouse Lease through explicit external-operation semantics.

### 8.2 Requirement allocation

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

### 8.3 Features

#### MIS-002/M01/F01 — Execution identity and persistence

Delivers:

- Write Track identity;
- one current non-terminal Attempt invariant;
- distinct Worker Run identity;
- durable Claim identity and state;
- contract-hash binding;
- version and typed conflict fields;
- Claim/Event atomicity;
- forward migration and fresh-process recovery.

#### MIS-002/M01/F02 — Treehouse Lease lifecycle

Depends on `MIS-002/M01/F01`.

Delivers:

- semantic Lease identity distinct from the external Treehouse identity;
- Intent–Action–Observation for grant and release;
- idempotency keys;
- internal/external identity fencing;
- exact-path inspect and release;
- typed duplicate and stale-holder conflicts.

#### MIS-002/M01/F03 — Lease reconciliation foundation

Depends on `MIS-002/M01/F01` and `MIS-002/M01/F02`.

Delivers:

- orphan-worktree detection;
- Lease-without-worktree detection;
- read-only divergence report by default;
- no automatic destruction of unlanded work;
- safe recommended next action;
- restart-stable reconciliation.

### 8.4 Milestone composition proof

M01 is not accepted merely because its Features pass. Its own criteria prove that SQLite state, Domain Events and the observed Treehouse resource remain coherent across crash windows, retries and a fresh Lead process.

## 9. M02 — Governed E1 Worker, Recovery and Acceptance

### 9.1 Outcome

One Pi Worker executes the fixed deterministic task in a leased worktree under the accepted E1 boundary, produces a durable Claim, survives Lead replacement, receives runner-owned deterministic proof and is accepted only by an MNFS Gate.

### 9.2 Requirement allocation

M02 owns:

```text
CAP-EXEC-REQ-003
CAP-EXEC-REQ-009
CAP-EXEC-REQ-010
CAP-EXEC-REQ-011
CAP-EXEC-REQ-012
CAP-EXEC-REQ-013
CAP-EXEC-REQ-014
CAP-EXEC-REQ-015
CAP-EXEC-REQ-016
CAP-EXEC-REQ-017
CAP-EXEC-REQ-018
CAP-EXEC-REQ-019
CAP-EXEC-REQ-020
CAP-EXEC-REQ-021
CAP-EXEC-REQ-022
```

### 9.3 Features

#### MIS-002/M02/F01 — E1 Environment and secure dispatch

Delivers:

- leased-worktree `cwd`;
- approved E1 Environment binding;
- fail-closed Sandbox Runtime initialization;
- first-party seven-tool broker;
- explicit Worker environment allowlist;
- filesystem write boundary;
- protected read and metadata denial;
- network off;
- no credentials;
- no X2+ external effect.

#### MIS-002/M02/F02 — Current Authority Snapshot and fixed Writer Pack

Can be developed independently after M01 and composes with F01 before dispatch.

Delivers:

- qualified target;
- current approved contract hash;
- current Attempt and blockers;
- fixed task;
- declared write-set;
- policy reference;
- output and Claim contract;
- termination condition;
- freshness checks before Worker start.

#### MIS-002/M02/F03 — Pi Worker process and durable Claim

Depends on `MIS-002/M02/F01` and `MIS-002/M02/F02`.

Delivers:

- process start, observation and cancellation;
- Worker Run persistence;
- exit classification;
- no transcript parsing;
- fixed repository edit;
- structured Claim creation and completion;
- process exit and Worker completion without acceptance.

#### MIS-002/M02/F04 — Fresh-Lead recovery and Attempt fencing

Depends on `MIS-002/M02/F03`.

Delivers:

- recovery of Track, Lease, Environment, Attempt, Worker Run and Claim;
- active-run-without-process classification;
- no duplicate current Attempt or Claim;
- late result recording without current-state mutation;
- work preservation and explicit operator attention when required.

#### MIS-002/M02/F05 — Minimal verification, Gate and safe release

Depends on `MIS-002/M02/F04`.

Delivers:

- one cold deterministic verification against the result tree;
- runner-owned Minimal Receipt;
- contract, tree, environment and verifier freshness bindings;
- explicit Claim Acceptance Gate;
- wrong hash, wrong tree and stale Evidence rejection or block;
- resource preservation before acceptance or abandonment;
- idempotent Environment and Treehouse release after safe disposition.

### 9.4 Milestone composition proof

M02 criteria execute the real fixed flow in canonical WSL2 and prove that the security boundary, Worker, Claim, recovery, Receipt, Gate and cleanup compose as one recoverable system.

## 10. Mission-level allocation

The Mission owns cross-cutting and final-outcome requirements:

```text
CAP-EXEC-REQ-023 — stable human and JSON CLI, typed errors and next action
CAP-EXEC-REQ-024 — Domain Events and local log/duration/error/token references
CAP-EXEC-REQ-025 — required recovery and security drills on canonical WSL2
CAP-EXEC-REQ-026 — schema-v2 hierarchical criteria and qualified identities
CAP-EXEC-REQ-027 — requirements and documentation impact remain current
CAP-EXEC-REQ-028 — no deciding dependency on deferred/optional systems
```

Mission criteria validate the complete Operator outcome and do not duplicate individual Feature checks.

## 11. Environment and Security Policy binding

The accepted AS-02 report records an effective compiled policy hash:

```text
sha256:886eb0f1fb5c2087d0b5bf16a51f399dc1ffb9a75aab16d4900a9ffe6ab57797
```

That value includes run-specific resolved paths and is evidence for the accepted AS-02 run. It is not a reusable universal M2 policy-definition hash.

Before Replan approval, Issue #9 publishes a stable machine-readable definition at:

```text
policies/SEC-E1.json
```

The Mission binding uses:

```text
environmentRef: ENV-E1
securityPolicyRef: SEC-E1
securityPolicyHash: hash of the stable canonical SEC-E1 definition
```

Each Attempt additionally persists and validates:

- the stable policy-definition hash bound by the contract;
- the effective compiled policy hash after run-specific paths are resolved.

A mismatch in either binding prevents Worker start. The AS-02 run hash remains provenance, not the future contract's semantic policy hash.

## 12. Golden Proof

The Mission Golden Proof is:

```text
start from the approved MIS-002 schema-v2 contract
→ create one Write Track and current Attempt
→ persist Lease intent
→ acquire and observe one Treehouse Lease
→ compile and validate E1 from the approved SEC-E1 definition
→ compile a fresh Current Authority Snapshot and fixed Writer Pack
→ launch the sandboxed Pi Worker in the leased worktree
→ perform the fixed deterministic edit
→ persist and complete a structured Claim
→ terminate the Lead
→ start a fresh Lead
→ recover the same Track, Lease, Environment, Attempt, Worker Run and Claim
→ prove protected resources and network remained inaccessible
→ run deterministic cold verification against the result tree
→ produce a runner-owned Minimal Receipt
→ accept the Claim through the MNFS Gate
→ preserve evidence
→ release Environment and Treehouse Lease idempotently
```

## 13. Required drills

The contract includes planned proof for:

- duplicate Lease;
- Intent persisted before external acquisition;
- external worktree created before semantic commit;
- orphan worktree;
- Lease without worktree;
- Worker exit without Claim;
- Lead crash;
- active Worker Run without process;
- late result from superseded Attempt;
- stale Claim or Receipt;
- sandbox unavailable;
- sandbox violation;
- policy-definition mismatch;
- effective-policy mismatch;
- repeated release;
- release attempt by stale Lease holder.

## 14. Documentation and requirement impact

The Replan work updates at minimum:

- `CAP-EXECUTION/SPEC.md`;
- `CAP-EXECUTION/TRACEABILITY.json`;
- generated `CAP-EXECUTION/COVERAGE.md`;
- the domain-model implementation-status clarification for Minimal Receipt;
- generated Product Blueprint aggregate;
- `policies/SEC-E1.json` and its explanatory reference;
- Issue #9 tracking and closeout evidence;
- the materialized `MIS-002` contract only after exact-hash approval.

Requirement impact is `UPDATED` for `CAP-EXEC-REQ-010` through `013`, `019`, `026` and `027`, and for any requirement whose approved allocation target changes from a proposed reference to a real criterion identity.

## 15. Approval and readiness sequence

The exact sequence is:

1. update AS-02 evidence and remove stale blocker language;
2. clarify the Minimal Receipt realization boundary;
3. regenerate and validate coverage;
4. perform explicit Operator review of `CAP-EXECUTION`;
5. mark the Capability Spec accepted and obtain R3 `PASS`;
6. draft the complete schema-v2 Replan against revision-3 hash;
7. validate and render every deciding field in Lavish;
8. resolve all blocking questions;
9. approve only the exact current Replan hash;
10. materialize the new approved contract while retaining revision 3 in history;
11. replace proposed allocations with the exact approved criterion identities;
12. regenerate coverage and recalculate R0–R4;
13. record an explicit Operator decision on M2 unblock.

No step infers approval from previous conversation, CI success or document status alone.

## 16. Alternatives considered

### Three Mission Milestones

Rejected because it would move recovery and Gate requirements away from their existing M02 allocation without producing a distinct outcome that Feature boundaries cannot represent.

### Preserve revision-3 two-Milestone content with only schema conversion

Rejected because it would omit the accepted architecture changes and create a syntactically v2 but semantically stale contract.

### Copy the AS-02 effective policy hash into the Mission contract

Rejected because that hash includes run-specific resolved paths and cannot represent a stable semantic policy definition for future Attempts.

### Start M2 domain implementation before R3/R4

Rejected for Issue #9. Although the roadmap allows isolated domain work while a spike is pending, AS-02 is now complete and the remaining work is governance reconciliation. Starting implementation would bypass the current MCRM gate rather than reduce an external uncertainty.

## 17. Acceptance of this design

This design is accepted by the Operator as the implementation-planning basis for Issue #9. It freezes:

- two Mission Milestones;
- the Feature decomposition and dependencies;
- the exact requirement allocation by level;
- semantic coverage reconciliation before Replan approval;
- explicit R3 review before R4;
- stable SEC-E1 definition hash separated from per-Attempt effective policy hash;
- Minimal Receipt in M2 and generalized Evidence capability later;
- no M2 unblock until exact-hash approval and fresh R0–R4 calculation.

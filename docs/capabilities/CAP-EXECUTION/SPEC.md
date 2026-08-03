---
id: CAP-EXECUTION
title: Governed local Worker execution
document_type: capability_spec
form: explanation
authority: specification
status: accepted
implementation_status: planned
version: 0.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - secure one-worker execution capability
  - M2 reusable execution design
related:
  - DOC-PRODUCT-BLUEPRINT-05
  - DOC-PRODUCT-BLUEPRINT-07
  - DOC-PRODUCT-BLUEPRINT-08
  - DOC-PRODUCT-BLUEPRINT-09
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-12
  - ADR-0002
  - ADR-0003
  - ADR-0005
  - ADR-0006
  - ACCEPTANCE-CAP-EXECUTION-R3
tracking_issue: 6
last_reviewed: 2026-08-03
---

# CAP-EXECUTION — Governed local Worker execution

## Summary

This capability lets MNFS execute one Pi Writer inside a leased Treehouse worktree and an approved local execution boundary, persist a Claim independently from the process, recover from Lead restart and accept work only through an MNFS Gate.

M2 is the first bounded realization. The capability is intentionally designed to grow later without importing parallel scheduling, remote environments or external effects into the first slice.

## Motivation

Directly launching Pi under the user account would prove only that a process can edit files. MNFS must instead prove:

```text
approved intent
→ bounded context and authority
→ isolated execution
→ durable Claim
→ independent verification
→ restart recovery
→ explicit acceptance
```

The existing `MIS-002` revision 3 captures much of the original execution intent, but predates Milestone criteria, Attempt/Worker Run identity, Current Authority Snapshot and the E1 security boundary.

## Goals

- allocate one Treehouse worktree to one Write Track;
- bind an Attempt and Worker Run to an exact approved contract;
- execute a fixed deterministic task through Pi;
- enforce a frozen E1 local security policy;
- persist a Claim and Events transactionally;
- distinguish process exit, worker completion, Claim and acceptance;
- recover state from a fresh Lead without transcript parsing;
- produce a deterministic Receipt and Gate Verdict;
- release resources idempotently only after safe disposition;
- expose stable human and JSON CLI behavior.

## Non-goals

- arbitrary operator tasks;
- multiple concurrent Workers;
- independent Reviewer;
- Integration queue;
- browser QA;
- Observational Memory;
- `pi-link`;
- Herdr as a deciding dependency;
- remote sandboxes;
- credentials;
- network access;
- external or production effects;
- Web Console;
- general scheduler.

## Operator story

As the Operator, I approve a bounded Mission contract and ask MNFS to execute the fixed M2 proof. I can terminate the Lead, start another Lead, see the same Track/Lease/Attempt/Worker/Claim state, verify that the Worker did not access protected resources, run the required Gate and release the worktree safely.

## Domain changes

The M2 realization needs:

- qualified Feature identity;
- Write Track;
- Lease;
- Execution Environment binding;
- Attempt;
- Worker Run;
- Claim;
- Receipt;
- Gate Verdict;
- Security Violation;
- Domain Events.

Current schema evolution must preserve M0/M1 data.

## Architecture

```text
Mission Contract
→ Execution Preparation Service
→ Treehouse Lease Adapter
→ E1 Process Sandbox Adapter
→ Current Authority Snapshot
→ Fixed Writer Pack
→ Pi Process Adapter
→ Claim Service
→ Recovery Service
→ Verification Runner
→ Claim Acceptance Gate
```

### Authority

- Pi reasons and executes tools;
- Treehouse owns physical worktree lifecycle;
- sandbox adapter enforces process boundary;
- SQLite owns operational lifecycle;
- Git owns code tree;
- MNFS Gate owns acceptance;
- Operator owns contract approval and material exceptions.

### Transaction boundaries

Local state changes and matching Domain Events commit together.

External Treehouse/process/sandbox actions use:

```text
Intent
→ external action
→ observation
→ semantic commit
→ Reconcile
```

## State and recovery

Required divergence cases include:

- Lease requested without worktree;
- worktree without Lease;
- active Worker Run without process;
- process exit without Claim;
- Claim bound to wrong contract/tree;
- late completion from superseded Attempt;
- release repeated;
- sandbox unavailable;
- policy hash mismatch.

Recovery is read-only by default and recommends safe actions.

## Security and privacy

M2 target is E1:

- repository in Linux filesystem;
- writes limited to worktree and approved temp/cache;
- sensitive home and Windows mounts denied;
- network denied;
- no credentials;
- Docker/privileged sockets denied;
- active policy outside Worker write authority;
- sandbox startup fails closed;
- logs and Artifacts contain no secrets.

AS-02 accepted the candidate real Pi + WSL2 boundary. Run `as02-20260803t144645276z-7048d3` completed with verdict `ACCEPT`, effective policy hash `sha256:886eb0f1fb5c2087d0b5bf16a51f399dc1ffb9a75aab16d4900a9ffe6ab57797`, WSL restart status `PASS` and an empty drift set (`no drift`). This evidence proves the candidate boundary; M2 must still bind and exercise the accepted `SEC-E1` definition in the actual execution flow.

## Interfaces

Expected CLI families:

```text
mnfs lease ...
mnfs worker ...
mnfs claim ...
mnfs recover ...
mnfs verify ...
```

Exact command design belongs to the reconciled Mission microdesign.

Every command provides:

- human output;
- `--json`;
- typed error;
- next action;
- stable exit class.

## Engineering Standards

Initial applicable candidate rules:

- worker completion is never acceptance;
- write is limited to the declared Track;
- network is denied by default;
- active policy is immutable to the Worker;
- external effects are denied;
- durable state survives process restart;
- messages are notifications;
- generated or temporary evidence is content-addressed when promoted.

## Observability

M2 records locally:

- Domain Events;
- timestamps;
- Worker Run duration;
- process result;
- adapter errors;
- log Artifact refs;
- token counters when Pi exposes them;
- Security Violations;
- Recovery Report.

No external observability backend is required.

## Test plan

### Deterministic tests

- FSM transitions;
- transaction rollback;
- idempotency;
- concurrency/version conflicts;
- Claim/Event atomicity;
- wrong contract/tree rejection;
- JSON contract.

### Adapter tests

- fake Treehouse;
- fake Pi process;
- fake sandbox;
- real Treehouse in WSL2;
- real Pi fixed task;
- AS-02 sandbox scenarios.

### Failure drills

- Lead crash;
- Worker exit without Claim;
- duplicate Lease;
- orphan worktree;
- Lease without worktree;
- late result;
- stale Claim;
- sandbox unavailable;
- blocked secret/network access;
- repeated release.

## Golden Proof

```text
initialize canonical repository
→ approve reconciled MIS-002
→ grant Treehouse Lease
→ create E1 Environment
→ launch sandboxed Pi Worker
→ fixed edit
→ durable Claim
→ kill Lead
→ fresh Lead recovers exact state
→ protected sentinels remain inaccessible
→ deterministic Receipt
→ explicit Gate acceptance
→ idempotent Environment/Lease release
```

## Graduation criteria

The capability is implemented for M2 when:

- all applicable MUST requirements in `TRACEABILITY.json` are verified or validated;
- Mission, Milestone and Feature criteria are satisfied;
- Golden Proof passes on canonical WSL2;
- required Security and Recovery drills pass;
- no Herdr, transcript, OM, network or credential dependency exists;
- Evidence and docs are current.

## Upgrade and downgrade

Schema evolution must:

- preserve M0/M1 Missions and plan revisions;
- keep approved revision 3 readable;
- introduce a new schema version for hierarchical criteria;
- reject unsupported newer state in write mode;
- provide tested forward migration.

Downgrade behavior must be explicit before applying schema migration.

## Rollout and rollback

Rollout:

1. fake adapters and domain tests;
2. real Treehouse;
3. AS-02;
4. real Pi fixed task;
5. fresh-Lead proof.

Rollback:

- disable real Worker dispatch;
- preserve SQLite and worktree state;
- retain M0/M1 planning;
- select another sandbox adapter if AS-02 fails.

## Dependencies

- accepted Product Blueprint;
- ADR-0002, ADR-0003, ADR-0005 and ADR-0006;
- Plan Contract schema capable of Milestone criteria and qualified identity;
- Treehouse on canonical WSL2;
- pinned Pi runtime;
- AS-02 result;
- Capability Realization R0–R4.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Treehouse behavior differs in WSL2 | narrow adapter, fake tests and real acceptance |
| crash creates orphan | Intent–Action–Observation and Reconcile |
| Worker text is treated as state | all state changes through MNFS commands |
| sandbox exceptions become broad | AS-02 deny tests and fail-closed policy |
| existing Plan schema cannot express the contract | explicit schema v2 prerequisite before Replan |
| code grows into scheduler | fixed one-Worker non-goals |
| recovery depends on Pi Session | fresh Lead proof without transcript |

## Alternatives considered

- direct unrestricted Pi process — rejected;
- container-only security — insufficient;
- remote sandbox for M2 — excessive;
- implement review/parallelism in M2 — violates walking-skeleton scope;
- edit approved `MIS-002` revision 3 — prohibited.

## Implementation history

- 2026-08-01: `MIS-002` revision 3 approved under pre-Blueprint architecture.
- 2026-08-02: Product Blueprint and Capability Realization Method approved.
- 2026-08-02: this Capability Spec proposed for the Architecture Baseline.
- 2026-08-03: AS-02 run `as02-20260803t144645276z-7048d3` accepted the local Pi E1 candidate boundary; restart `PASS`, no drift, cleanup complete.
- 2026-08-03: Operator supplied `CAP_EXECUTION_ACCEPT version=0.1.0`; the Capability Spec was accepted for R3 while implementation remained `planned`.
- Next: MIS-002 schema-v2 Replan, Lavish review and exact-hash approval.

## Open questions

No product decision should remain hidden. Current blockers are listed in `COVERAGE.md`.

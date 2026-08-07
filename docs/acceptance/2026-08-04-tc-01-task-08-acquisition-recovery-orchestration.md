---
id: ACCEPTANCE-TC-01-TASK-08-ACQUISITION-RECOVERY-ORCHESTRATION
title: TC-01 Task 8 Acquisition and Recovery Orchestration Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-07-ATOMIC-EVIDENCE-STORE
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-04
---

# TC-01 Task 8 — Acquisition and Recovery Orchestration Evidence

## Authority

The Operator requested continuation after the Task 7 checkpoint with:

```text
Seguir
```

The request authorized Task 8 of the accepted TC-01 plan. It does not authorize Task 9, the full real Treehouse scenario suite, M01 production implementation or Pi Worker dispatch.

## Purpose

Task 8 connects the deterministic provenance, Treehouse client, Git observers and Evidence interfaces into one sequential scenario runner.

```text
exact fixture and provenance
→ S01 identity gate
→ S02 one durable acquisition
→ S03/S04 command and mutation observations
→ S05 fresh-process rediscovery
→ S06 exact status identity
→ S13 private-state safety
→ S14 process-contract audit
→ S15 freshness gate
```

Release and fencing scenarios S07 through S12 remain explicitly blocked until Task 9 rather than being silently treated as executed.

## RED proof

Commit:

```text
c43df45087c3eef912625691511b61379b848bff
```

Canonical workflow:

```text
Workflow: 30904269882
Job:      91975550995
Result:   EXPECTED FAILURE
```

Observed failure:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/scenario-runner.mjs
```

All thirty-five previously accepted TC-01 tests remained green. The new scenario suite failed only because the required runner did not exist.

## GREEN implementation

Implementation commit:

```text
3c8a65dc2cbf1783a6ea219360af00dd3e37351b
```

Added:

```text
spikes/tc-01/src/scenario-runner.mjs
spikes/tc-01/tests/scenario-runner.test.mjs
```

The module exports:

```js
TC01_SCENARIO_IDS
runTc01Scenarios(input)
```

`TC01_SCENARIO_IDS` is one frozen canonical registry containing exactly `TC01-S01` through `TC01-S15` in numeric order.

## Sequential fail-closed model

Every scenario is persisted through the injected scenario-record factory and Evidence store in canonical order.

A material failure establishes a dependency barrier:

```text
S01 failure or BLOCKED
→ S02-S13 BLOCKED

S02 failure
→ S03-S13 BLOCKED

S03-S06 material failure
→ every later Lease-dependent scenario through S13 BLOCKED
```

S14 and S15 still execute because process-contract inspection and freshness checks do not require a valid acquired Lease.

Exceptions are never converted to PASS. The runner stores a bounded error observation with name, stable code when available and message.

## S01 — provenance and capability identity

S01 requires:

- provenance schema version 1;
- canonical WSL2 identity;
- non-empty Ubuntu, kernel, Git and Treehouse versions;
- exact Treehouse executable path and SHA-256 identity;
- all four required Treehouse capabilities.

Tool, version, filesystem or WSL mismatches become `BLOCKED`; other malformed Evidence becomes `FAIL`.

## S02 — one strict acquisition

Before acquisition, the runner captures:

- source repository snapshot;
- external pool snapshot;
- Treehouse private-state observation.

It then performs exactly one injected Lease acquisition and requires:

- deterministic holder match;
- non-empty path, Lease ID and acquisition timestamp;
- linked-worktree proof;
- equal Git common-directory identity;
- clean source and leased worktree;
- fresh JSON status matching path, Lease ID, holder and `leased` state.

The leased-worktree snapshot is retained for later private-state comparison.

## S03 and S04 — external effects

S03 reads the trusted Git wrapper log, rejects any `fetch` invocation and requires zero Git remotes in the disposable source repository.

S04 requires:

```text
source repository snapshot unchanged
external pool snapshot changed
linked-worktree/common-dir proof still present
```

This distinguishes the expected external pool effect from an unexpected mutation of the source checkout.

## S05 — fresh-process recovery

S05 creates a new injected Treehouse client instance and calls only status observation.

The new client receives no in-memory acquisition result beyond the persisted expected path, holder and Lease ID inputs supplied by the run context. The runner never invokes a second acquisition.

Recovery passes only when fresh status rediscovers the exact leased item by canonical path with unchanged Lease identity and holder.

## S06 — exact JSON status identity

S06 performs another fresh status observation through the original client boundary and requires exact equality for:

```text
path
status = leased
Lease ID
holder
```

Human process output is not consulted by the runner.

## S07–S12 boundary

Task 8 emits explicit `BLOCKED` records for S07 through S12 with dependency `TC01-TASK-09` when acquisition scenarios are otherwise healthy.

When an earlier material failure exists, those scenarios instead name the exact failed prerequisite. This prevents a pending implementation from being mistaken for a successful or skipped conformance proof.

## S13 — private-state normalization safety

S13 observes fresh Lease identity, Treehouse private state, source state and leased-worktree state.

A private-state digest change is accepted only as the explicit limitation:

```text
TREEHOUSE_PRIVATE_STATE_NORMALIZATION
```

and only when all of the following remain unchanged:

- Lease path, ID and holder;
- source repository snapshot;
- leased-worktree snapshot.

A coincident Lease or repository-content change is `FAIL`.

## S14 — process-contract inspection

S14 inspects every injected command Evidence metadata record and requires:

- `shell: false`;
- `stdin: closed`;
- positive bounded timeout;
- stdout and stderr limits no greater than 65,536 bytes;
- an exact approved environment-key set.

At least one command Evidence record is required. Invalid command IDs are reported explicitly in scenario observations.

## S15 — Evidence freshness

S15 binds the prior acceptance to:

```text
Treehouse executable hash
Treehouse version
Git version
kernel release
Ubuntu release
command-shape hash
```

Any changed field makes the prior acceptance stale and returns `BLOCKED`. The changed fields are emitted in deterministic lexical order; unchanged identity returns PASS.

## Canonical CI proof

```text
PR merge commit: 3005f80e66bb56a5ecc6ceac11d64f976cef1e8c
Workflow:        30904478744
Job:             91976228067
Environment:     Ubuntu 24.04.4, Node.js 24.18.0, npm 11.16.0, Git 2.54.0
Command:         npm ci && npm run verify
Result:          PASS
```

Verified results:

```text
npm audit:                       0 vulnerabilities
typecheck:                       PASS
product tests:                   95/95 PASS
AS-02 deterministic tests:      119/119 PASS
TC-01 deterministic tests:      40/40 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 83 canonical IDs
```

The five new tests prove:

1. exact frozen S01-S15 registration, single acquisition and fresh-client recovery without a second `get`;
2. S02 material failure blocks S03-S13 while S14/S15 still execute;
3. S13 rejects private-state change accompanied by worktree mutation;
4. S14 rejects process Evidence that violates the shell-free contract;
5. S15 blocks silent reuse after executable or command-shape drift.

## Influence on the MNFS harness

The harness now has deterministic dependency semantics rather than a flat list of commands:

```text
external state established
→ dependent proof may execute

external state not established
→ dependent proof receives explicit BLOCKED Evidence
```

This prevents:

- recovery from calling acquisition again and creating another Lease;
- tests continuing with a fabricated Lease after acquisition failure;
- missing release scenarios appearing as PASS;
- private Treehouse self-healing hiding worktree or identity changes;
- unsafe process metadata being ignored because lifecycle scenarios passed;
- stale host/tooling Evidence being reused silently.

## Decision

```text
TC-01 Task 8:       ACCEPTED
TC-01 Task 9:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Task 9 will replace the temporary S07-S12 blocked records with deterministic release, stale-ID fencing, stale-holder fencing, dirty-worktree preservation, repeated-release classification and missing/unmanaged-path scenarios. It must begin with fresh RED tests and may not execute the real Treehouse scenario suite yet.

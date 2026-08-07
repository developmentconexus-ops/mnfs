---
id: ACCEPTANCE-TC-01-TASK-09-RELEASE-FENCING-PRESERVATION
title: TC-01 Task 9 Release Fencing and Work Preservation Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-08-ACQUISITION-RECOVERY-ORCHESTRATION
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-04
---

# TC-01 Task 9 — Release Fencing and Work Preservation Evidence

## Authority

The Operator requested continuation after the Task 8 checkpoint with:

```text
Okay vamos seguir
```

The request authorized Task 9 of the accepted TC-01 plan. It does not authorize Task 10, execution against the real installed Treehouse binary, M01 production implementation or Pi Worker dispatch.

## Purpose

Task 9 replaces the former S07-S12 placeholder blockers with deterministic lifecycle proofs for conditional release, external Lease fencing, dirty-worktree preservation, idempotent semantic release and divergence classification.

```text
exact current Lease
→ independent preflight
→ conditional operation
→ fresh status and repository observation
→ semantic classification
→ trusted cleanup only after intact-state proof
```

Process exit codes and Treehouse banners remain observations, not lifecycle authority.

## RED proof

Test commit:

```text
351bcfae83289785cfba80865cb2bdce5566237f
```

Canonical workflow:

```text
Workflow: 30906122521
Job:      91981482747
Result:   EXPECTED FAILURE
```

Observed TC-01 result:

```text
Tests: 44
Pass:  39
Fail:  5
```

The five failures were the exact missing Task 9 capability:

- the normal scenario matrix still emitted `BLOCKED` for S07-S12 instead of PASS;
- S07 did not detect exit-zero release with the exact Lease still present;
- S08 did not enforce non-zero stale-ID rejection plus unchanged Lease/worktree state;
- S09 did not detect a stale-holder operation that mutated the Lease despite non-zero exit;
- S10 did not detect dirty-sentinel removal or Lease release.

All previously accepted product, AS-02 and TC-01 behavior remained green. The RED failure came from the approved placeholders in `scenario-runner.mjs`, not from an import, syntax or fixture defect.

## GREEN implementation

Implementation commit:

```text
5c0c2a9aa872cd827c91fdfcd5f6cbf891c77a94
```

Modified:

```text
spikes/tc-01/src/scenario-runner.mjs
spikes/tc-01/tests/scenario-runner.test.mjs
```

The runner now executes all S01-S15 deterministically. S07-S12 no longer depend on synthetic Task 9 blocker records.

## Sequential Lease isolation

The normal scenario path acquires five separate external Lease observations:

```text
S02 → acquisition/recovery proof
S08 → stale Lease ID proof
S09 → stale holder proof
S10 → dirty-worktree proof
S13 → private-state observation proof
```

Every acquisition must produce a previously unseen Lease ID. A reused identity fails closed before the scenario can mutate or clean up the worktree.

A scenario that successfully releases a Lease never reuses that old identity as current state. A later mutation-heavy scenario begins only after a fresh acquisition is observed and linked to the fixture repository.

## Trusted release preflight

Every exact release or trusted cleanup requires:

- the exact current path, Lease ID and holder;
- fresh status showing `leased` with the same identity;
- zero controlled processes;
- a clean worktree snapshot;
- source repository snapshots before and after;
- ordinary conditional return only, with no force/destroy/prune authority;
- fresh post-operation status before semantic success is declared.

The helper does not accept exit code zero alone. The path must be absent from status or available with no Lease identity, and no newer Lease may occupy it.

## S07 — correct conditional release

S07:

1. captures the exact acquired Lease;
2. verifies clean worktree and zero processes;
3. invokes conditional return with the exact Lease ID and holder;
4. requires a fresh status observation;
5. passes only when the old Lease is absent or the path is available without Lease metadata;
6. proves the source checkout is unchanged;
7. stores the successful semantic result for S11.

An adversarial test returns exit code zero while leaving the Lease intact. S07 correctly returns FAIL and blocks later mutation-heavy scenarios.

## S08 — stale external Lease ID fencing

S08 acquires a new Lease, then invokes return with:

```text
lease ID: stale-<current-lease-id>
holder:   exact current holder
```

PASS requires:

- non-zero process exit;
- fresh status with the exact current Lease unchanged;
- byte/digest-identical worktree snapshot;
- no release or reset effect;
- exact trusted cleanup only after those proofs.

An adversarial exit-zero stale-ID response produces FAIL even when the process text claims success.

## S09 — stale holder fencing

S09 acquires another new Lease, then invokes return with:

```text
lease ID: exact current Lease ID
holder:   <exact-holder>-stale
```

PASS requires the same non-zero and unchanged-state evidence as S08. A non-zero process result that nevertheless clears or changes the current Lease produces FAIL. Exit status cannot conceal a fencing bypass.

## S10 — dirty-worktree preservation

S10 acquires a fresh Lease and writes:

```text
controlled-uncommitted.txt
tc01-dirty-sentinel\n
```

The ordinary non-force conditional return is then invoked with closed stdin.

PASS requires:

- the Lease remains active with the exact ID and holder;
- the sentinel remains byte-identical;
- the source checkout remains unchanged;
- the new Git invocation segment contains none of:
  - `--force` or `force`;
  - `destroy` or `prune`;
  - `reset` or `clean`;
  - `worktree remove`;
- Treehouse output such as `Aborted` remains advisory;
- trusted cleanup removes only the controlled sentinel and then performs exact ordinary release.

The deterministic success path intentionally accepts an exit-zero `Aborted` observation when fresh state proves the Lease and work are intact. An adversarial return that removes the sentinel or releases the Lease produces FAIL and preserves the unsafe fixture state for investigation.

## S11 — repeated-release classification

S11 performs no second raw return command.

It reads fresh status and returns the previous successful semantic result as:

```text
ALREADY_RELEASED
```

only when:

- the old Lease identity is absent;
- the path is absent or available without Lease metadata;
- no newer Lease occupies the path;
- the prior semantic release was recorded as successful.

Treehouse stderr wording is not required for idempotent classification.

## S12 — missing and unmanaged paths

S12 derives only run-scoped targets:

```text
<run-root>/missing-worktree
<run-root>/unmanaged-repo
```

Independent trusted inspection classifies them as:

```text
DIVERGED_MISSING_PATH
TREEHOUSE_UNMANAGED_PATH
```

Raw return results remain advisory. Neither target can be interpreted as successful release, and fresh managed status before/after must remain identical.

## Failure and cleanup semantics

A material FAIL in S07-S13 blocks subsequent mutation-heavy scenarios while S14 and S15 still execute.

Trusted cleanup occurs only after the tested operation has proven:

- the current Lease identity is intact;
- the worktree is clean or the controlled dirty file has been removed by trusted code;
- the source remains unchanged;
- no controlled process exists.

If those conditions do not hold, the runner does not attempt broad cleanup, force release, prune or destroy. The disposable fixture remains preserved for Evidence and later operator-directed cleanup.

## Canonical CI proof

```text
PR merge commit: 55b6fe5ac32c23c4c6c677c8e950dfb8d28816ea
Workflow:        30906802712
Job:             91983671880
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
TC-01 deterministic tests:      44/44 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 84 canonical IDs
```

The Task 9 tests prove:

1. the normal matrix executes S01-S15 as PASS with five unique Lease acquisitions and isolated cleanup;
2. a material S02 failure still blocks dependent S03-S13;
3. exit-zero release with the exact Lease still present fails S07;
4. stale-ID return must be non-zero and preserve Lease/worktree state;
5. stale-holder return cannot mutate the Lease even when the process exits non-zero;
6. dirty return cannot remove the controlled sentinel or release the exact Lease;
7. S13 still rejects private-state changes accompanied by worktree mutation;
8. S14 and S15 retain their process-contract and freshness protections.

## Influence on the MNFS harness

The harness now separates external process observations from semantic lifecycle decisions for the full acquisition-and-release cycle:

```text
Treehouse process result
+
fresh exact status
+
source/worktree observations
+
external Lease identity
→ lifecycle classification
```

This prevents:

- an exit-zero command from falsely proving release;
- a non-zero command from hiding a fencing mutation;
- stale Lease ID or holder from clearing newer ownership;
- dirty work from being silently reset;
- repeated release from depending on human stderr;
- missing or unmanaged paths from being treated as successful cleanup;
- cleanup from running after a material preservation failure;
- old external Lease IDs from being reused as current state.

## Decision

```text
TC-01 Task 9:       ACCEPTED
TC-01 Task 10:      NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
Automatic merge:    NOT AUTHORIZED
```

## Next governed action

Task 10 will derive the final TC-01 Verdict and render the deterministic human/machine reports from exactly fifteen validated scenario records. It must begin with fresh RED tests. No Verdict from deterministic injected tests establishes real Treehouse conformance; canonical WSL2 execution remains a later separate gate.

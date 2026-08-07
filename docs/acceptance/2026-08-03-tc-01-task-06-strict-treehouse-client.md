---
id: ACCEPTANCE-TC-01-TASK-06-STRICT-TREEHOUSE-CLIENT
title: TC-01 Task 6 Strict Treehouse Client Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-05-TRUSTED-GIT-OBSERVATION
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 Task 6 — Strict Treehouse Client Evidence

## Authority

The Operator requested continuation after the Task 5 checkpoint with:

```text
Continue
```

The request authorized Task 6 of the accepted TC-01 plan. It does not authorize Task 7, the full real Treehouse scenario suite or M01 production implementation.

## Purpose

Task 6 creates the strict anti-corruption boundary between Treehouse process execution and TC-01 scenario semantics.

The accepted boundary is:

```text
exact controlled environment and argv
→ bounded shell-free Treehouse process
→ strict UTF-8 and JSON decoding
→ exact external observation shape
→ typed Lease or status observation
→ later scenario state comparison decides semantics
```

Process banners, stderr wording and exit code alone cannot establish successful acquisition, current Lease identity or successful release.

## Source-bound external contract

The pinned Treehouse source at commit `939cb59ba0bd69036ae52fc19b5b41e0a3f167d3` establishes:

```text
get --lease --json
→ path, lease_id, lease_holder, leased_at

status --json
→ name, path, status, lease_id, lease_holder, leased_at, processes

return <path> --if-lease-id <id> --if-lease-holder <holder>
→ process output only; no JSON domain result
```

The Treehouse return command can emit an `Aborted` banner and return exit code zero. The TC-01 client therefore returns process Evidence for release and deliberately performs no domain-success classification.

## RED proof

Commit:

```text
17c26b9e993f7d91bace8444c87a5870dc7fc849
```

Canonical workflow:

```text
Workflow: 30874428574
Job:      91882903220
Result:   EXPECTED FAILURE
```

Observed failure:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/treehouse-client.mjs
```

All twenty-three previously accepted TC-01 tests remained green. The new Treehouse client suite failed only because the required implementation did not exist.

## GREEN implementation

Implementation head:

```text
fee764ad2534d2667225bd35af7edcd2c4193314
```

Added:

```text
spikes/tc-01/src/treehouse-client.mjs
spikes/tc-01/tests/treehouse-client.test.mjs
```

The client exposes:

```js
buildTreehouseEnvironment(input)
acquireTreehouseLease(input)
observeTreehouseStatus(input)
returnTreehouseLease(input)
findStatusByPath(status, expectedPath)
```

All Treehouse commands use:

```text
timeout:       30,000 ms
stdout bound:  65,536 bytes
stderr bound:  65,536 bytes
cwd:           disposable source repository
stdin:         closed by the accepted process runner
shell:         false by the accepted process runner
```

Exact argv shapes are:

```text
get --lease --lease-holder <holder> --json
status --json
return <path> --if-lease-id <lease-id> --if-lease-holder <holder>
```

## Controlled environment

The client constructs an allowlisted environment:

```text
PATH=<git-wrapper-dir>:<treehouse-dir>:<real-git-dir>:/usr/bin:/bin
HOME=<fixture-fake-home>
LANG=C.UTF-8
LC_ALL=C.UTF-8
GIT_TERMINAL_PROMPT=0
GIT_OPTIONAL_LOCKS=0
GIT_CONFIG_NOSYSTEM=1
TREEHOUSE_NO_UPDATE_CHECK=1
TC01_REAL_GIT=<absolute-real-git>
TC01_GIT_LOG=<absolute-run-log>
```

The final two safety controls clarify an omission in the original plan environment listing:

- `TREEHOUSE_NO_UPDATE_CHECK=1` prevents normal Treehouse commands from spawning the source-reviewed background update check;
- `GIT_CONFIG_NOSYSTEM=1` prevents host system Git configuration from influencing disposable Evidence.

This is a fail-closed execution clarification. It grants no new external authority and must be retained when the plan and final microdesign are reconciled.

## Strict acquisition observation

Acquisition accepts exactly one UTF-8 JSON object with exactly:

```text
path
lease_id
lease_holder
leased_at
```

It rejects:

- leading or trailing non-whitespace bytes;
- invalid UTF-8;
- unknown or missing keys;
- empty Lease identity;
- holder mismatch;
- invalid timestamps;
- non-existing, non-absolute, mounted or non-canonical paths;
- any non-zero process result.

The accepted internal observation is:

```text
path
leaseId
leaseHolder
leasedAt
```

## Strict status observation

Status accepts exactly one JSON array. Every item must have exactly:

```text
name
path
status
lease_id
lease_holder
leased_at
processes
```

The client:

- permits only source-reviewed status values;
- validates every path as one existing Linux realpath;
- rejects duplicate canonical paths;
- validates process items as exact `{ pid, name }` objects;
- requires leased items to carry Lease identity and timestamp;
- requires non-leased items to carry no Lease metadata;
- rejects human tabular output and unknown fields.

## Release observation boundary

`returnTreehouseLease` validates and constructs the exact conditional argv, then returns the bounded process result unchanged.

It intentionally does not interpret:

- exit code zero as semantic success;
- `Aborted` as successful release;
- non-zero as proof that the current Lease remained unchanged;
- human stderr as fencing authority.

Later scenarios must obtain fresh status and repository/filesystem snapshots before classifying release, stale identity, stale holder or dirty-worktree behavior.

## Canonical CI proof

```text
PR merge commit: 8d61392dda87cbde75fa11a82e82416e015603b2
Workflow:        30874524629
Job:             91883185057
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
TC-01 deterministic tests:      29/29 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 81 canonical IDs
```

The six new tests prove:

1. the exact controlled environment, argv, cwd, timeout and output bounds;
2. strict acquisition parsing bound to expected holder and canonical realpath;
3. rejection of contaminated, mismatched, unknown-field and non-zero acquisition results;
4. strict status parsing, duplicate-path rejection and canonical lookup;
5. rejection of human or structurally inconsistent status output;
6. fail-closed handling of newline-bearing and Windows-mounted control values.

## Influence on the MNFS harness

The harness now separates three layers:

```text
safe process runner
→ how a process is executed

strict Treehouse client
→ what external observations are structurally admissible

scenario runner
→ what those observations mean for lifecycle correctness
```

This prevents:

- human output becoming durable domain state;
- an exit code being mistaken for a released Lease;
- unknown future JSON fields being silently ignored;
- path aliases or symlinks weakening fencing identity;
- host Git configuration or Treehouse update checks contaminating Evidence;
- malformed status entries being used for recovery decisions.

## Decision

```text
TC-01 Task 6:       ACCEPTED
TC-01 Task 7:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Task 7 will implement canonical JSON and the atomic Evidence store. It must bind raw command bytes, hashes and artifact references without duplicating full output into scenario aggregates. It must begin with a fresh RED test and may not execute the full real scenario suite yet.

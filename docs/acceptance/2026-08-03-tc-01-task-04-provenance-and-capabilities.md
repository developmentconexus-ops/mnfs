---
id: ACCEPTANCE-TC-01-TASK-04-PROVENANCE-AND-CAPABILITIES
title: TC-01 Task 4 Provenance and Capability Discovery Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-03-DISPOSABLE-GIT-FIXTURE
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 Task 4 — Provenance and Capability Discovery Evidence

## Authority

The Operator requested continuation after the Task 3 checkpoint with:

```text
Seguir
```

The request authorized Task 4 of the accepted TC-01 plan. It does not authorize Task 5, the full real Treehouse scenario suite or M01 production implementation.

## Purpose

Task 4 prevents TC-01 and the future production adapter from trusting an executable merely because a command named `treehouse` exists on `PATH`.

The accepted provenance boundary is:

```text
canonical WSL2 and Linux-owned cwd
→ exact executable resolution
→ absolute executable realpath
→ SHA-256 over executable bytes
→ exact Treehouse version
→ required command capabilities
→ Git, Ubuntu, kernel and Node versions
→ immutable provenance observation
```

Any version or capability mismatch fails closed before a worktree or Lease can be created.

## RED proof

Commit:

```text
2b9c5af2d5e5d97b02ef59e219739422da389cd9
```

Canonical workflow:

```text
Workflow: 30872443828
Job:      91877026914
Result:   EXPECTED FAILURE
```

Observed failure:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/provenance.mjs
```

All twelve previously accepted TC-01 tests remained green. The new provenance suite failed only because the required implementation did not exist.

## GREEN implementation

Implementation head:

```text
db304b23feb471734e94c3ddcb0c7c040ee145b9
```

Added:

```text
spikes/tc-01/src/provenance.mjs
spikes/tc-01/tests/provenance.test.mjs
```

The discovery process:

- validates that the discovery working directory is Linux-owned and outside `/mnt`;
- resolves `uname`, `treehouse` and `git` without invoking a shell;
- requires each resolved executable to have one absolute realpath;
- requires WSL2 kernel evidence containing Microsoft and WSL2 markers;
- reads `/etc/os-release` directly and requires Ubuntu;
- computes `sha256:<digest>` over the exact Treehouse executable bytes;
- requires `treehouse --version` to equal the accepted candidate `2.1.1`;
- reads `get --help`, `status --help` and `return --help` with bounded process execution;
- disables the Treehouse update check during discovery;
- records no complete host environment, credential or secret value.

Required capabilities are:

```text
leaseJson:
  get exposes --lease, --json and --lease-holder

statusJson:
  status exposes --json

conditionalLeaseId:
  return exposes --if-lease-id

conditionalHolder:
  return exposes --if-lease-holder
```

A missing capability is classified as `TC01_VERSION_MISMATCH`; compatibility is never guessed from the version number alone.

## Canonical CI proof

```text
PR merge commit: 888dbb2995bade50661eb2c598349616b1bfe3a0
Workflow:        30872545594
Job:             91877325060
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
TC-01 deterministic tests:      18/18 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 79 canonical IDs
```

The six new tests prove:

1. exact executable bytes, SHA-256, versions and capabilities are bound into one provenance object;
2. a relative or ambiguous Treehouse executable path is rejected;
3. a version other than `2.1.1` is rejected with expected and actual values;
4. a missing required capability is rejected instead of treated as compatible;
5. a non-WSL2 kernel is rejected;
6. discovery under a mounted filesystem is rejected.

## Influence on the MNFS harness

The harness now has a versioned anti-drift boundary for external tooling:

```text
configured tool name
→ measured binary identity
→ measured capabilities
→ accepted provenance
```

This prevents:

- a silent Treehouse upgrade changing Lease behavior;
- a different binary earlier on `PATH` being used accidentally;
- version strings being trusted without hashing the executable;
- version equality being treated as proof that required flags exist;
- a Linux CI host being mistaken for canonical WSL2 evidence;
- discovery causing Treehouse background update checks.

Future Evidence can bind its observations to the exact Treehouse hash and provenance rather than only to a package name or remembered installation step.

## Decision

```text
TC-01 Task 4:       ACCEPTED
TC-01 Task 5:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Task 5 will introduce a trusted Git wrapper and repository/filesystem observations. It will make hidden `git fetch` attempts observable and allow the harness to compare source state before and after Treehouse commands. It must begin with a fresh RED test and may not execute the full real scenario suite yet.

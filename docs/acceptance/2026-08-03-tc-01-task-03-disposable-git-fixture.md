---
id: ACCEPTANCE-TC-01-TASK-03-DISPOSABLE-GIT-FIXTURE
title: TC-01 Task 3 Disposable Git Fixture Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-02-SAFE-PROCESS-RUNNER
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 Task 3 — Disposable Git Fixture Evidence

## Authority

The Operator requested continuation after the Task 2 checkpoint with:

```text
Perfeito, continue
```

The request authorized Task 3 of the accepted TC-01 plan. It does not authorize Task 4, real Treehouse execution or M01 production implementation.

## Purpose

Task 3 creates the isolated laboratory in which later TC-01 scenarios can inspect Treehouse behavior without touching the MNFS checkout, a user repository, credentials, a real Treehouse pool or a Windows-mounted filesystem.

The resulting boundary is:

```text
canonical run id
→ Linux-owned run root
→ disposable source repository
→ external disposable pool root
→ synthetic Git identity
→ one controlled commit
→ no remote
→ clean repository
→ durable fixture metadata
```

## Path-safety RED and GREEN

### RED

Commit:

```text
dd568e5ece7509a607f165b02dc41a17a827ee46
```

Canonical workflow:

```text
Workflow: 30871108916
Job:      91873139099
Result:   EXPECTED FAILURE
```

Observed failure:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/paths.mjs
```

### GREEN

Implementation commit:

```text
bf44ce995a23d210acef6ac5a67446f4ed2062a1
```

Added:

```text
spikes/tc-01/src/paths.mjs
spikes/tc-01/tests/paths.test.mjs
```

The path boundary proves:

- only canonical lowercase TC-01 run IDs are accepted;
- relative paths and traversal-shaped IDs are rejected;
- `/mnt`, `/mnt/c` and other mounted paths are rejected;
- paths whose existing parent resolves through a symlink below `/mnt` are rejected;
- the default state root is `$HOME/.local/state/mnfs`;
- every run root remains below `fixtures/tc-01/<run-id>`.

## Fixture RED and GREEN

### RED

Commit:

```text
97503cfe3e8ea145c990ac76157d1bd057944cc6
```

Canonical workflow:

```text
Workflow: 30871243715
Job:      91873522884
Result:   EXPECTED FAILURE
```

The five path tests passed. The suite failed only because:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/fixture.mjs
```

### GREEN

Implementation head:

```text
bb64f10730f24a15d90a2769895b1ed8d3732e3b
```

Added:

```text
spikes/tc-01/src/fixture.mjs
spikes/tc-01/tests/fixture.test.mjs
```

Each fixture creates:

```text
source-repo/
pool-root/
artifacts/
snapshots/
fake-home/
git-wrapper/
fixture.json
```

The source repository contains exactly:

```text
README.md
fixture-sentinel.txt
treehouse.toml
```

Git initialization uses:

```text
git init --initial-branch=main
user.name  = MNFS-TC01
user.email = tc01@mnfs.invalid
one commit = test: initialize TC-01 fixture
```

The controlled Git environment disables system configuration and terminal prompting, sets fixed author/committer dates and uses a fake HOME. The fixture rejects an existing non-empty run root without deleting its content.

## Canonical CI proof

```text
PR merge commit: c74a897c4990692db52d2a1255dee9353aaf1bae
Workflow:        30871321077
Job:             91873748078
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
TC-01 deterministic tests:      12/12 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 78 canonical IDs
```

## Influence on the MNFS harness

The harness can now create a complete external-tool test environment without borrowing mutable state from the repository under development.

This prevents:

- accidental changes to the MNFS checkout;
- use of a developer's Git identity or credentials;
- hidden fetches caused by an `origin` remote in the accepted fixture path;
- Treehouse pool creation inside the source repository;
- path traversal or execution under Windows-mounted storage;
- reuse of a dirty or previously populated test run.

The durable `fixture.json` also allows a fresh process to recover the exact paths and initial commit instead of relying on conversation memory or process-local variables.

## Decision

```text
TC-01 Task 3:       ACCEPTED
TC-01 Task 4:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Task 4 will discover and bind the exact Treehouse executable, version, SHA-256, Git version and required command capabilities. It must begin with a fresh RED test and may not execute the full real Treehouse scenario suite yet.

---
id: ACCEPTANCE-TC-01-TASK-02-SAFE-PROCESS-RUNNER
title: TC-01 Task 2 Safe Process Runner Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-01-HARNESS-REGISTRATION
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 Task 2 — Safe Process Runner Evidence

## Authority

The Operator approved continuation after the Task 1 explanation with:

```text
Okay aprovado
```

The approval authorized Task 2 of the accepted TC-01 plan. It does not authorize Task 3, real Treehouse execution or M01 production implementation.

## Purpose

Task 2 creates the common process boundary that later TC-01 scenarios use to invoke Git and Treehouse safely and consistently.

Without this boundary, each adapter could accidentally:

- invoke a shell;
- inherit interactive stdin;
- wait forever;
- collect unbounded output;
- normalize or lose raw command bytes;
- retry or fall back after spawn failure;
- expose unstable failure strings to higher layers.

The implemented boundary accepts an exact executable, argument array, working directory, allowlisted environment, timeout and output limits. It returns byte-preserved process observations or a stable typed TC-01 error.

## RED proof

Commit:

```text
2e4c6d4f55096b072923382a537725df5aefe4cc
```

Canonical workflow:

```text
Workflow: 30867624856
Job:      91862788749
Result:   EXPECTED FAILURE
```

Observed failure:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
spikes/tc-01/src/process-runner.mjs
```

The existing harness-contract test still passed. The new process test failed only because the required implementation did not exist.

## GREEN implementation

Added:

```text
spikes/tc-01/src/errors.mjs
spikes/tc-01/src/process-runner.mjs
spikes/tc-01/tests/process-runner.test.mjs
```

Implementation head:

```text
75a5ae3ca40c28d28ce22584f3ee75b297daf473
```

The process runner enforces:

```text
shell: false
stdin: ignored/closed
stdout/stderr: raw Buffer capture
default bound: 65,536 bytes per stream
timeout: SIGTERM followed by SIGKILL escalation after 2 seconds
spawn failure: no retry and no shell fallback
```

Stable errors include:

```text
TC01_PROCESS_SPAWN_FAILED
TC01_PROCESS_TIMEOUT
TC01_OUTPUT_LIMIT
TC01_INVALID_INPUT
```

## Canonical CI proof

```text
PR merge commit: c54f2b7ba9aec27d3da862493c505423f804f00c
Workflow:        30867719857
Job:             91863068568
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
TC-01 deterministic tests:      5/5 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 77 canonical IDs
```

TC-01 tests prove:

1. stdout and stderr retain exact bytes, including a NUL byte;
2. stdin is closed and commands do not use a shell;
3. a process exceeding its timeout is terminated and classified as `TC01_PROCESS_TIMEOUT`;
4. output beyond the exact byte bound is terminated and classified as `TC01_OUTPUT_LIMIT`;
5. a missing executable is classified as `TC01_PROCESS_SPAWN_FAILED` without fallback.

## Influence on the MNFS harness

This Task establishes a reusable anti-corruption boundary between MNFS and external command-line tools:

```text
MNFS domain intent
→ exact process specification
→ bounded process observation
→ typed result/error
```

Treehouse output and exit behavior therefore cannot directly become MNFS domain truth. Later adapters must interpret these bounded observations and combine them with Git/filesystem evidence before producing a semantic result.

The boundary also prevents a hung or noisy external command from blocking the Lead indefinitely or exhausting memory.

## Decision

```text
TC-01 Task 2:       ACCEPTED
TC-01 Task 3:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Task 3 will add run-scoped Linux path validation and disposable Git fixtures. It must begin with fresh RED tests and may not use a real repository or Treehouse pool.

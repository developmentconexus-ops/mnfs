---
id: ACCEPTANCE-TC-01-TASK-01-HARNESS-REGISTRATION
title: TC-01 Task 1 Harness Registration Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 Task 1 — Harness Registration Evidence

## Authority

The Operator answered the explicit gate approving TC-01 plan version `1.0.3` and authorizing Task 1. The response text was:

```text
Apogaro
```

In the direct context of the approval question, this was interpreted as approval to proceed with Task 1. This Evidence does not authorize Task 2 or any M01 production implementation.

## Scope

Task 1 registers the deterministic TC-01 harness boundary only:

- one focused harness-contract test;
- one recursive TC-01 test runner;
- root `test:tc01` and `tc01` scripts;
- inclusion of deterministic TC-01 tests in `npm run verify`;
- README separation between deterministic CI and future real WSL2 execution.

No real Treehouse binary was invoked. No production `src/` file, Mission contract, `SEC-E1`, Lease, Attempt, Claim or Worker Run was changed.

## RED proof

Commit:

```text
7be5d7e15bfc5c13f8e729a2f3533c7b27cdafd4
```

Command:

```bash
node --test spikes/tc-01/tests/harness-contract.test.mjs
```

Observed failure:

```text
Expected values to be strictly equal:
actual:   undefined
expected: node scripts/run-tc01-tests.mjs
```

The failure occurred because the root TC-01 scripts did not exist. It was not caused by syntax, import or fixture failure.

## GREEN implementation

Added:

```text
spikes/tc-01/tests/harness-contract.test.mjs
scripts/run-tc01-tests.mjs
spikes/tc-01/README.md
```

Updated:

```text
package.json
```

Resulting head:

```text
cc7cccc1bc3eec2fe3a125051734fc6288fc4aac
```

Focused commands:

```bash
node --test spikes/tc-01/tests/harness-contract.test.mjs
node scripts/run-tc01-tests.mjs
```

Both passed with one test and zero failures.

## Canonical CI proof

```text
PR merge commit: 63372a37149f23d5245bf09fb04ce37659965718
Workflow:        30866223522
Job:             91858565049
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
TC-01 deterministic tests:      1/1 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 76 canonical IDs
```

## Decision

```text
TC-01 Task 1:       ACCEPTED
TC-01 Task 2:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Review this Task 1 Evidence and explicitly authorize Task 2 — safe process runner and stable TC-01 error model — before implementation begins.

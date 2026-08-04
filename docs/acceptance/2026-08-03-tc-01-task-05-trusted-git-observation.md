---
id: ACCEPTANCE-TC-01-TASK-05-TRUSTED-GIT-OBSERVATION
title: TC-01 Task 5 Trusted Git Observation Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-04-PROVENANCE-AND-CAPABILITIES
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 Task 5 — Trusted Git Observation Evidence

## Authority

The Operator requested continuation after the Task 4 checkpoint with:

```text
Continue
```

The request authorized Task 5 of the accepted TC-01 plan. It does not authorize Task 6, the full real Treehouse scenario suite or M01 production implementation.

## Purpose

Task 5 makes Git activity and repository effects independently observable before the harness begins real Treehouse lifecycle scenarios.

The accepted boundary is:

```text
Treehouse or TC-01 command
→ trusted executable Git wrapper
→ exact argv and cwd JSONL record
→ exact real Git execution
→ repository and filesystem snapshots
→ field-by-field comparison
→ explicit fetch prohibition
```

This prevents Treehouse process text from being treated as proof that the source checkout was unchanged or that no network-oriented Git command was attempted.

## RED proof

Commit:

```text
bf5d9644a96863e22fc282fe78f7dcf2d13f9914
```

Canonical workflow:

```text
Workflow: 30873624639
Job:      91880464603
Result:   EXPECTED FAILURE
```

Observed failure:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/git-observer.mjs
```

All eighteen previously accepted TC-01 tests remained green. The new Git observation suite failed only because the required implementation did not exist.

## GREEN implementation

Initial implementation commit:

```text
66b6f7a778ee385f7d514cb85d117ac64b162694
```

Added:

```text
spikes/tc-01/bin/git
spikes/tc-01/src/git-observer.mjs
spikes/tc-01/tests/git-observer.test.mjs
```

The wrapper is committed with executable mode `100755` and:

- requires absolute `TC01_REAL_GIT` and `TC01_GIT_LOG` values;
- appends one JSON line containing schema version, exact argv and canonical cwd;
- invokes only the exact real Git executable;
- forwards arguments without reconstruction;
- uses `shell: false`;
- preserves stdout, stderr and the real Git exit status;
- fails closed when its control paths or subprocess are invalid.

The repository observer uses exactly:

```text
git rev-parse HEAD
git status --porcelain=v1 -z --untracked-files=all
git config --local --null --list
git for-each-ref --format=%(refname)%00%(objectname)%00
git write-tree
```

It binds:

```text
HEAD
porcelain status bytes
local config bytes
refs bytes
tracked index tree
working-tree file and symlink map outside .git
```

Every byte field receives a SHA-256 and byte length. Working-tree entries bind normalized relative path, type, mode and content or symlink-target digest. Symlink targets are not followed.

## Adversarial GREEN correction

The first GREEN workflow exposed one deterministic-ordering defect:

```text
Workflow: 30873885007
Job:      91881255724
Result:   FAILURE
```

The implementation used `localeCompare('en')`, which sorted `readme-link` before `README.md`. Locale-aware ordering is unsuitable for canonical Evidence because it can depend on language rules and runtime data.

The implementation, not the test, was corrected at:

```text
ae327651e929fc44c0201b09435b183d2037d099
```

Canonical ordering now uses direct JavaScript code-unit comparison:

```text
left < right
left > right
otherwise equal
```

No snapshot field or acceptance rule was weakened.

## Canonical CI proof

```text
PR merge commit: 99f5f5aec1bda71c88641443e790048adfea4fdd
Workflow:        30873985549
Job:             91881568504
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
TC-01 deterministic tests:      23/23 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 80 canonical IDs
```

The five new tests prove:

1. the executable wrapper logs exact argv/cwd and preserves real Git stdout, stderr and exit status;
2. missing or non-absolute control paths fail closed;
3. repository snapshots distinguish HEAD, status, local config, refs, index tree and working-tree changes;
4. symlinks are measured without following their targets and `.git` remains outside the working-tree map;
5. an observed Git invocation whose first argument is `fetch` is rejected with `TC01_EVIDENCE_INVALID`.

## Influence on the MNFS harness

The harness now has two independent channels of external-tool evidence:

```text
command observation
→ what Git command was requested

state observation
→ what changed in Git and the filesystem
```

This prevents:

- hidden `git fetch` attempts being inferred only from final repository state;
- unchanged stdout being mistaken for an unchanged source checkout;
- config, refs or index changes being hidden inside one generic clean/dirty boolean;
- symlink traversal reading content outside the disposable fixture;
- locale-dependent path order changing hashes across hosts;
- Treehouse human banners becoming authoritative lifecycle evidence.

Later scenarios can compare snapshots before and after acquisition, status and release, then decide semantic results from trusted observations rather than process text.

## Decision

```text
TC-01 Task 5:       ACCEPTED
TC-01 Task 6:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Task 6 will implement the strict Treehouse JSON client. It will construct the exact controlled environment and argv for acquire, status and conditional return, accept only strict JSON shapes and keep release domain classification outside the process client. It must begin with a fresh RED test and may not execute the full real scenario suite yet.

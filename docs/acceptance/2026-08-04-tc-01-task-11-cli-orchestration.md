---
id: ACCEPTANCE-TC-01-TASK-11-CLI-ORCHESTRATION
title: TC-01 Task 11 CLI and Orchestration Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-10-VERDICT-AND-REPORTS
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-04
---

# TC-01 Task 11 — CLI and Orchestration Evidence

## Authority

The Operator requested continuation after the Task 10 checkpoint with:

```text
Seguir
```

The request authorized Task 11 of the accepted TC-01 implementation plan. It does not authorize Task 12, execution against the installed Treehouse binary, M01 production implementation, Pi Worker dispatch or automatic merge.

## Purpose

Task 11 closes the executable deterministic harness surface by composing the previously accepted modules into three strict commands:

```text
run
report
cleanup
```

```text
strict argv
→ run-scoped fixture
→ provenance
→ S01-S15
→ finalized Evidence
→ Verdict and report files
→ separate trusted cleanup review
```

The orchestration layer composes existing fixture, provenance, Treehouse client, Git observation, Evidence, scenario and report boundaries. It does not create a second lifecycle authority.

## RED proof

Test commits:

```text
67e1f0de37a630683df515ce7b1eb5342cba4d94
  orchestrator contract

d46aaa1fa786a43a89b54d5bdbc864989494a115
  strict CLI contract
```

Canonical PR merge commit:

```text
697d3fdec336d937835787458f1e3cdffb17037a
```

Canonical workflow:

```text
Workflow: 30909261374
Job:      91991636096
Result:   EXPECTED FAILURE
```

Observed TC-01 totals:

```text
Tests: 52
Pass:  50
Fail:  2
```

The two failures were exactly the missing Task 11 capabilities:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/cli.mjs

ERR_MODULE_NOT_FOUND
spikes/tc-01/src/orchestrator.mjs
```

All fifty previously accepted TC-01 tests remained green. Product and AS-02 suites also remained green.

## GREEN implementation

Implementation commits:

```text
4dd03b67a398538b33f02fbc04f8f84cf19bbbcb
  orchestrator

62e6d730acce16882b92aaf0ef07bb10588627a9
  strict CLI
```

Added:

```text
spikes/tc-01/src/orchestrator.mjs
spikes/tc-01/src/cli.mjs
spikes/tc-01/tests/orchestrator.test.mjs
spikes/tc-01/tests/cli.test.mjs
```

Exports:

```js
generateTc01RunId(input)
runTc01(input, dependencies?)
reportTc01(input, dependencies?)
cleanupTc01(input, dependencies?)
parseTc01Args(argv)
runTc01Cli(options?)
```

Optional dependency injection exists only to make orchestration deterministic in tests. Without overrides, the commands use the real accepted TC-01 fixture, provenance, process, Treehouse client, observer, Evidence, scenario and report modules.

## Strict CLI

Accepted forms are exactly:

```text
run [--run-id <id>] [--state-root <absolute-linux-path>] [--json]
report --run-root <absolute-linux-path> [--json]
cleanup --run-root <absolute-linux-path> [--json]
```

The parser rejects before service invocation:

- unknown commands or flags;
- duplicate flags;
- missing flag values;
- positional extras;
- unsafe run IDs;
- relative paths;
- paths whose existing parent resolves under `/mnt`.

Usage errors return exit code `2`. Operational failures return exit code `1`. Successful commands return exit code `0`.

Human output contains the Verdict, run/artifact paths, cleanup state and one concrete next action. `--json` emits exactly one canonical JSON value without human framing.

## Run ID and fixture persistence

Generated IDs use UTC:

```text
tc01-YYYYMMDD-HHMMSS-<8-lowercase-hex>
```

Only `crypto.randomBytes(4)` supplies the suffix. The fixture writes `fixture.json`, including the resolved run ID and all run-scoped paths, before Treehouse acquisition or scenario execution.

## Run orchestration

`runTc01` performs:

```text
resolve Linux-owned state root
→ validate or generate run ID
→ create disposable fixture
→ create Evidence store
→ create the runtime composition
→ discover exact provenance
→ write environment Evidence
→ execute S01-S15
→ finalize manifest
→ reload and revalidate finalized Evidence
→ derive Verdict
→ write cleanup state
→ atomically write verdict.json and report.md
→ return a bounded summary
```

The result contains:

```text
command
runId
runRoot
verdict
reportPath
verdictPath
cleanup state
nextAction
```

A `REJECT` or `BLOCKED` Verdict writes cleanup state `PRESERVED` and instructs the Operator to retain the run root. `ACCEPT` and `ACCEPT_WITH_LIMITATIONS` write `READY_FOR_CLEANUP`; cleanup remains a separate command and safety review.

## Real default runtime composition

The default runtime:

- resolves the real Git executable without a shell;
- installs the trusted Git wrapper inside the run root;
- links the wrapper-local `node` command to the exact current Node executable so the wrapper shebang resolves inside the controlled PATH;
- creates the S12 unmanaged repository inside the same disposable run root;
- runs provenance with an explicit reduced environment;
- routes Treehouse commands through the trusted process runner and Git wrapper;
- implements repository, path-tree, linked-worktree, remote, private-state and controlled-file observations;
- retains the exact command-shape hash;
- never invokes `--force`, destroy or broad prune.

## Scenario command-to-Evidence bridge

The scenario runner determines semantic outcomes, while the Evidence store requires command artifacts scoped to the final scenario ID.

Task 11 implements one bounded command buffer:

```text
external command executes
→ exact spec/result enters the pending buffer
→ scenario outcome supplies its canonical S01-S15 ID
→ every pending command is atomically written below that scenario
→ one primary command binds the aggregate scenario record
```

This avoids:

- adding scenario awareness to the process runner;
- executing a command a second time merely to create Evidence;
- placing commands under the wrong scenario;
- allowing raw outputs into the aggregate report.

S14 and S15 may contain no new external command. For those records, the orchestrator creates contained empty stdout/stderr artifacts and labels the aggregate as an internal observation; it does not invent an external subprocess.

## Report revalidation

`reportTc01` does not trust existing `report.md` or `verdict.json`.

It:

1. loads and validates the fixture;
2. requires regular, non-symlink manifest/environment/scenario files;
3. verifies environment and scenario hashes against `manifest.json` before parsing the scenario payload;
4. revalidates all scenario artifact references and hashes through the Evidence store;
5. derives the Verdict again;
6. atomically rewrites the machine and human report surfaces.

A deterministic test modifies `scenarios.json` after finalization. `reportTc01` rejects the run with `TC01_EVIDENCE_INVALID` because the manifest hash no longer matches.

## Cleanup safety

`cleanupTc01` first reloads finalized Evidence and derives the Verdict again.

Default cleanup safety requires:

- every cleanup target to remain below the recognized run root;
- a Verdict other than `REJECT` or `BLOCKED`;
- fresh Treehouse status with no live holder beginning `mnfs-tc01-`;
- no dirty managed worktree below the disposable pool;
- source HEAD equal to the fixture initial commit;
- source checkout clean;
- no missing or invalid source observation.

Named blockers include:

```text
LIVE_LEASE
DIRTY_WORKTREE
SOURCE_CHANGED
UNRECOGNIZED_RUN_PATH
VERDICT_REJECT
VERDICT_BLOCKED
STATUS_INVALID
STATUS_UNAVAILABLE
```

Any blocker throws `TC01_CLEANUP_BLOCKED` and leaves all files intact.

Successful cleanup removes only the run-scoped ephemeral resources:

```text
pool-root
source-repo
snapshots
fake-home
git-wrapper
unmanaged-repo
```

It preserves `fixture.json` and `artifacts/`, writes cleanup state `COMPLETED`, and refreshes `verdict.json` and `report.md`.

## Deterministic tests

The ten new tests prove:

1. exact UTC run-ID generation;
2. full run sequencing and artifact paths;
3. material Verdict preservation and cleanup-blocked next action;
4. manifest hash validation before report parsing;
5. cleanup refusal for live, dirty, changed or unrecognized resources;
6. exact accepted CLI forms;
7. duplicate, unknown, missing, relative and positional argument rejection;
8. exit code `2` without service invocation on usage error;
9. human Verdict and next-action output;
10. stable JSON output with no human framing.

## Canonical GREEN proof

PR merge commit:

```text
365b811b5890a98bf7acd3affa6a4c9e8ca95497
```

Canonical workflow:

```text
Workflow: 30910074772
Job:      91994342759
Result:   PASS
```

Environment:

```text
Ubuntu 24.04.4
Node.js 24.18.0
npm 11.16.0
Git 2.54.0
```

Verified results:

```text
npm ci:                       PASS — 0 vulnerabilities
typecheck:                    PASS
product tests:                PASS — 95/95
AS-02 deterministic tests:   PASS — 119/119
TC-01 deterministic tests:   PASS — 60/60
documentation tooling:       PASS
MIS-002 Replan builder:       PASS
approved allocation tests:   PASS
documentation validation:    PASS — 86 canonical IDs
```

## Review boundary

The executable pieces of the deterministic harness now exist and are CI-green. Task 12 remains responsible for the complete specification mapping, adversarial quality review, README/WORKLOG reconciliation and final pre-WSL2 gate.

One behavior remains explicitly queued for that review: the default run discovers provenance before S01 orchestration. A host, executable or version mismatch therefore fails the `run` command operationally before producing a finalized S01 `BLOCKED` report. Task 13 separately requires manual host/candidate confirmation before executing `run`, but Task 12 must decide whether this pre-scenario behavior should remain or be reconciled before the canonical run.

No Treehouse command was executed against the installed user environment during Task 11. The deterministic tests used injected dependencies and disposable temporary paths only.

## Current boundary

```text
TC-01 Tasks 1-11:             ACCEPTED
TC-01 Task 12:                NOT_STARTED
TC-01 executable harness:     IMPLEMENTED / FINAL REVIEW PENDING
TC-01 real WSL2 Evidence:     NOT_STARTED
M01 microdesign:              PROPOSED
M01 implementation:           PROHIBITED
Pi Worker dispatch:           PROHIBITED
Automatic merge:              NOT AUTHORIZED
```

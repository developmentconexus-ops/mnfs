---
id: ACCEPTANCE-TC-01-TASK-10-VERDICT-AND-REPORTS
title: TC-01 Task 10 Verdict and Reports Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-09-RELEASE-FENCING-PRESERVATION
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-04
---

# TC-01 Task 10 — Verdict and Reports Evidence

## Authority

The Operator requested continuation after the Task 9 checkpoint with:

```text
Okay, seguir
```

The request authorized Task 10 of the accepted TC-01 plan. It does not authorize Task 11, execution against the installed Treehouse binary, M01 production implementation, Pi Worker dispatch or automatic merge.

## Purpose

Task 10 turns validated provenance and scenario Evidence into one deterministic decision and two consistent report surfaces.

```text
validated provenance
+ exact S01-S15 records
+ command-shape and scenarios hashes
+ cleanup state
→ deterministic Verdict object
→ machine-readable verdict.json payload
→ human report.md payload
```

The human report does not make an independent decision. It renders the same structured Verdict returned by `deriveTc01Verdict`.

## RED proof

Test commit:

```text
a59127fab793adfe6e653488d9e7d253f4335387
```

Canonical workflow:

```text
Workflow: 30907513395
Job:      91985978545
Result:   EXPECTED FAILURE
```

Observed failure:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/report.mjs
```

Observed TC-01 totals:

```text
Tests: 45
Pass:  44
Fail:  1
```

All forty-four previously accepted TC-01 tests remained green. The new report test file failed only because the required implementation did not exist.

A separate isolated local RED reproduced the same missing-module failure before GREEN publication.

## GREEN implementation

Implementation commit:

```text
6bff8f1af9b0af56361285a0fd6a49c4b1371891
```

Added:

```text
spikes/tc-01/src/report.mjs
spikes/tc-01/tests/report.test.mjs
```

Exports:

```js
deriveTc01Verdict(input)
renderTc01Report(input)
```

## Structural validation

The report boundary requires:

- provenance schema version 1;
- complete Treehouse executable SHA-256;
- complete command-shape and scenarios SHA-256 identifiers;
- cleanup state plus rationale;
- known scenario IDs only;
- no duplicate IDs;
- scenario results limited to `PASS`, `FAIL`, `BLOCKED` or `INCONCLUSIVE`;
- rationale, expected behavior, artifact references and output hashes for every present scenario.

The distinction is explicit:

```text
missing required scenario
→ valid but incomplete proof
→ Verdict BLOCKED

unexpected ID, duplicate ID or invalid result
→ corrupted/invalid Evidence
→ TC01_EVIDENCE_INVALID
```

## Verdict precedence

The implemented precedence is:

```text
material safety FAIL
→ REJECT

otherwise missing, blocked, inconclusive or non-material failed proof
→ BLOCKED

otherwise explicit safe limitation
→ ACCEPT_WITH_LIMITATIONS

otherwise all fifteen scenarios PASS
→ ACCEPT
```

Material reject scenarios are the exact Task 10 plan set:

```text
S02 S03 S04 S05 S07 S08 S09 S10 S12
```

A material safety failure retains precedence even when S01 also reports blocked tooling.

## ACCEPT

`ACCEPT` requires all fifteen scenario IDs exactly once with no failure, blocked result, inconclusive result or recorded limitation.

The Verdict object binds:

```text
treehouseExecutableHash
treehouseVersion
gitVersion
kernelRelease
ubuntuRelease
commandShapeHash
scenariosHash
```

It also carries exact scenario ordering and cleanup state.

## ACCEPT_WITH_LIMITATIONS

Task 10 recognizes explicit safe limitations without hiding them.

Current encoded cases include:

- S13 `TREEHOUSE_PRIVATE_STATE_NORMALIZATION` when the scenario itself passed;
- S15 `EVIDENCE_IDENTITY_DRIFT` with sorted changed fields when the prior acceptance identity is stale.

These cases produce `ACCEPT_WITH_LIMITATIONS` only when no material failure or independent blocker exists.

## REJECT

A material safety scenario failure produces `REJECT` even when another scenario is blocked.

The deterministic test combines:

```text
S01 BLOCKED
S08 FAIL
```

and proves that stale-ID release failure has precedence, yielding `REJECT`.

## BLOCKED

`BLOCKED` is derived for:

- missing S01-S15 Evidence;
- canonical host/tooling block in S01;
- `INCONCLUSIVE` proof;
- failed non-material proof that prevents complete conformance classification.

A missing scenario is listed in `missingScenarioIds`; it is never converted to PASS.

## Machine-readable Verdict

The returned object is canonical-JSON-safe and independent of input scenario order.

It contains:

```text
schemaVersion
verdict
rationale
scenarioCount
scenarioIds
missingScenarioIds
failures
blocked
limitations
bindings
cleanup
```

Task 11 will write this object atomically as `verdict.json`. Task 10 defines and proves the payload only.

## Human report

`renderTc01Report` produces deterministic Markdown containing:

- Verdict and rationale;
- scenario coverage;
- scenarios and command-shape hashes;
- cleanup state and rationale;
- exact provenance table;
- explicit limitations;
- S01-S15 table in numeric order;
- failure and blocked sections;
- hash bindings;
- artifact references;
- the required authority statement:

```text
This Verdict is an R5 design input and does not authorize M01 implementation.
```

Markdown control characters in rationale and references are escaped or normalized.

## Secret and raw-output boundary

The renderer never serializes the complete `observations` object.

Tests place synthetic secrets and raw-output markers inside observations:

```text
SECRET_VALUE_MUST_NOT_APPEAR
RAW_BINARY_OUTPUT_MUST_NOT_APPEAR
```

Neither marker appears in the rendered report. Buffers, environment values and raw binary outputs remain only in their referenced artifacts.

## Canonical CI proof

```text
PR merge commit: 6ec6a25db147bdea140cc95cd82ca6e544e1942a
Workflow:        30907749039
Job:             91986741566
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
TC-01 deterministic tests:      50/50 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 85 canonical IDs
```

The six new tests prove:

1. all fifteen passing scenarios derive one exact ACCEPT Verdict and bindings;
2. safe private-state normalization or explicit freshness drift derives ACCEPT_WITH_LIMITATIONS;
3. material safety failure derives REJECT with precedence over blocked tooling;
4. missing, blocked or inconclusive proof derives BLOCKED;
5. duplicate, unexpected or invalid scenario Evidence fails closed;
6. human and machine outputs remain deterministic, ordered and secret-free.

## Influence on the MNFS harness

The harness now has one auditable decision boundary:

```text
raw external observations
→ strict scenario Evidence
→ immutable scenario aggregate
→ deterministic Verdict
→ consistent human and machine reports
```

This prevents:

- a report author from manually changing the decision;
- input ordering from changing Verdict hashes;
- a missing scenario from disappearing inside a summary;
- blocked tooling from being presented as acceptance;
- material fencing or work-loss failure being softened by another blocker;
- secrets or raw outputs leaking into promoted Markdown;
- a Verdict being detached from exact tooling, host and scenario hashes.

## Decision

```text
TC-01 Task 10:      ACCEPTED
TC-01 Task 11:      NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
Automatic merge:    NOT AUTHORIZED
```

## Next governed action

Task 11 will implement the strict CLI and full deterministic orchestration for `run`, `report` and `cleanup`. It must begin with fresh RED tests, write `verdict.json` and `report.md` atomically through the already accepted report contract, and may not execute the real Treehouse scenario suite until the complete harness receives final review and canonical CI approval.

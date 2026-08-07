---
id: ACCEPTANCE-TC-01-TASK-07-ATOMIC-EVIDENCE-STORE
title: TC-01 Task 7 Atomic Evidence Store Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-06-STRICT-TREEHOUSE-CLIENT
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
last_reviewed: 2026-08-04
---

# TC-01 Task 7 — Atomic Evidence Store Evidence

## Authority

The Operator requested continuation after the Task 6 checkpoint with:

```text
Seguir
```

The request authorized Task 7 of the accepted TC-01 plan. It does not authorize Task 8, the full real Treehouse scenario suite or M01 production implementation.

## Purpose

Task 7 creates the durable and tamper-evident Evidence boundary used by every later TC-01 scenario.

```text
bounded process result
→ byte-exact stdout/stderr artifacts
→ canonical hashes and metadata
→ strict scenario aggregate
→ exact S01-S15 completeness check
→ immutable final manifest
```

Raw command outputs remain available for audit without being duplicated into the scenario aggregate or final report.

## RED proof

Commit:

```text
2dcba4f00566c51d9b2ea02cc4f0e9c0f5a29010
```

Canonical workflow:

```text
Workflow: 30874996002
Job:      91884585825
Result:   EXPECTED FAILURE
```

Observed failure:

```text
ERR_MODULE_NOT_FOUND
spikes/tc-01/src/canonical-json.mjs
```

All twenty-nine previously accepted TC-01 tests remained green. The new Evidence suite failed only because the required implementation did not exist.

## GREEN implementation

Implementation commits:

```text
eace46768e06c07c0e4c5fe71c195b41653f67d4
4297d4119c06e0237851281adf0e3d036b914b8b
```

Added:

```text
spikes/tc-01/src/canonical-json.mjs
spikes/tc-01/src/evidence.mjs
spikes/tc-01/tests/evidence.test.mjs
```

The implementation provides:

```js
canonicalJson(value)
sha256Bytes(value)
createEvidenceStore(fixture)
validateScenarioEvidence(value, artifactsRoot)
```

The Evidence store exposes:

```js
store.writeCommand(...)
store.writeScenario(...)
store.writeEnvironment(...)
store.readScenarios()
store.finalize(...)
```

## Canonical JSON boundary

Canonical JSON:

- sorts object keys by direct JavaScript code-unit order;
- preserves array order;
- normalizes negative zero to zero;
- rejects non-finite numbers, `undefined`, functions, symbols and `bigint`;
- rejects non-plain objects and cyclic references;
- emits one deterministic UTF-8 representation.

SHA-256 identifiers use:

```text
sha256:<64 lowercase hexadecimal characters>
```

## Command Evidence layout

Each command is stored under:

```text
artifacts/commands/<scenario-id>/<command-id>/
  metadata.json
  stdout.bin
  stderr.bin
```

`stdout.bin` and `stderr.bin` preserve the exact process bytes.

`metadata.json` records:

- exact executable path, argv and cwd;
- timeout and output bounds;
- `shell: false` and `stdin: closed` contract observations;
- environment key names only, never environment values;
- timestamps, duration, exit code, signal and timeout state;
- output references, hashes, byte lengths and excerpts.

Excerpts are capped at 4,096 decoded UTF-8 characters. Complete outputs are not copied into aggregate JSON.

## Atomic write model

Every JSON or binary destination is written using:

```text
temporary file in the destination directory
→ exclusive create
→ complete write
→ atomic rename to final path
```

The command directory is single-use. Existing command Evidence, environment Evidence, duplicate scenarios and a second finalization all fail closed.

## Strict scenario Evidence

Scenario records bind the accepted design fields plus:

```text
stdoutHash
stderrHash
stdoutExcerpt
stderrExcerpt
```

Validation requires:

- scenario identity exactly `TC01-S01` through `TC01-S15`;
- exact known fields with no silent extension;
- non-empty newline-free argv;
- canonical Linux-owned executable and cwd paths;
- full SHA-256 identifiers;
- contained POSIX artifact references scoped to the same scenario;
- regular non-symlink artifact files;
- artifact bytes whose hashes match the scenario record;
- bounded excerpts and an accepted scenario result.

`scenarios.json` is kept in numeric scenario order regardless of execution/write order.

## Adversarial GREEN correction

The first GREEN workflow exposed a stable-error-boundary defect:

```text
Workflow: 30875167993
Job:      91885076805
Result:   FAILURE
```

A relative scenario cwd was correctly rejected, but the lower-level path validator leaked `TC01_INVALID_INPUT`. Consumers of the Evidence boundary require `TC01_EVIDENCE_INVALID` for every malformed or corrupted Evidence input.

The implementation, not the test, was corrected at:

```text
18a2c2c6a186c5fb6fbe80dda6f904a320f9dc19
```

Evidence path and run-ID validation now preserve the lower-level cause in details while exposing the stable Evidence error code. No path rule or acceptance condition was weakened.

## Finalization contract

`finalize()` requires:

- one environment artifact;
- exactly one record for every S01 through S15;
- no duplicate or unexpected scenario;
- valid referenced artifacts and matching hashes.

It writes `manifest.json` containing:

```text
runId
finalizedAt
environmentRef + environmentHash
scenariosRef + scenariosHash
scenarioCount = 15
scenarioIds = TC01-S01 ... TC01-S15
```

The existence of the manifest freezes the store against later command, scenario, environment or finalization writes.

## Canonical CI proof

```text
PR merge commit: 442ff6ebd9e7ac908b140c511e0a7a2f033fa2af
Workflow:        30875296666
Job:             91885443067
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
TC-01 deterministic tests:      35/35 PASS
documentation tooling:          PASS
MIS-002 Replan builder:          PASS
approved allocation tests:      PASS
documentation validation:       PASS — 82 canonical IDs
```

The six new tests prove:

1. canonical JSON ignores object-key order while preserving array order;
2. raw outputs and bounded metadata are written under one controlled command path;
3. scenario IDs, argv, cwd, hashes and artifact containment fail closed;
4. scenario aggregates use refs, hashes and excerpts without duplicating complete output;
5. environment writes are durable and incomplete finalization is rejected;
6. exactly S01-S15 can be finalized once into a hash-bound immutable manifest.

## Influence on the MNFS harness

The harness now has a durable separation between:

```text
raw observation
→ exact bytes retained for audit

structured observation
→ strict hashes, refs and bounded excerpts

completed conformance run
→ one immutable manifest covering all required scenarios
```

This prevents:

- partial JSON files being mistaken for complete Evidence;
- path traversal or symlink artifacts escaping the disposable run;
- scenario records being edited after finalization;
- missing scenarios being hidden by a successful process exit;
- large outputs being duplicated across artifacts and reports;
- environment values or secrets being persisted in command metadata;
- lower-level validation codes leaking across the Evidence API.

## Decision

```text
TC-01 Task 7:       ACCEPTED
TC-01 Task 8:       NOT_STARTED
Real Treehouse run: NOT_STARTED
M01 implementation: PROHIBITED
Pi Worker dispatch: PROHIBITED
```

## Next governed action

Task 8 will introduce the scenario registry and deterministic acquisition/recovery orchestration. It will exercise S01-S06 and S13-S15 through injected clients and observations, including dependency blocking after a failed acquisition. It must begin with fresh RED tests and may not execute the real Treehouse scenario suite yet.

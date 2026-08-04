---
id: ACCEPTANCE-TC-01-TASK-12-DETERMINISTIC-ADVERSARIAL-REVIEW
title: TC-01 Task 12 Deterministic Adversarial Review Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-11-CLI-ORCHESTRATION
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - DOC-PROJECT-BLUEPRINT
  - DOC-CAPABILITY-ROADMAP
  - DOC-CAPABILITY-REALIZATION-METHOD
  - ADR-0005
tracking_issue: 16
last_reviewed: 2026-08-04
---

# TC-01 Task 12 — Deterministic Adversarial Review Evidence

## Authority

The Operator requested a complete adversarial review after Task 11:

```text
Faça então a revisão completa adversarial usando web e pesquisando quando achar necessário,
basedo em tudo que a gente vem planejando, nosso blueprint, roadmap e metodologia,
para criarmos algo global maximum desde o começo e ter uma base sólida.
```

This authorized Task 12 of the approved TC-01 plan: specification mapping, adversarial review, correction of every Critical and Important finding, documentation and the final deterministic pre-WSL2 gate.

It does not authorize:

- Task 13 real Treehouse execution;
- M01 production implementation;
- Pi Worker dispatch;
- automatic merge of PR #17.

## Review objective

Task 12 asks whether the completed deterministic harness is safe and truthful enough to be the instrument used in the first real canonical WSL2 conformance run.

```text
accepted protocol and plan
+ Product Blueprint and Roadmap boundaries
+ Treehouse source behavior
+ Node/Git/WSL primary documentation
+ implementation and tests
+ adversarial failure injection
→ reviewed deterministic harness
```

The review does not ask whether Treehouse conforms. That decision remains an output of Task 13.

## Authorities reviewed

### MNFS authorities

- Product Blueprint, especially Quality/Evidence, State/Recovery and Security/Isolation.
- Capability Roadmap and M2 scope boundary.
- Capability Realization Method and its rule that external-tool uncertainty must be closed before milestone implementation.
- ADR-0005 durable coordination versus ephemeral transport.
- Accepted TC-01 protocol version 0.2.0.
- Approved TC-01 implementation plan version 1.0.3.
- Proposed M01 microdesign version 0.3.0.
- MIS-002 revision 5 and its exact approved hash.

### Treehouse primary source

Reviewed the pinned Treehouse source candidate at commit:

```text
939cb59ba0bd69036ae52fc19b5b41e0a3f167d3
```

Key source observations:

- acquisition can fetch when an `origin` remote exists;
- conditional release checks and the action occur while the Treehouse lock is held;
- ordinary return can report an aborted dirty-worktree operation without making process exit alone authoritative;
- private state is under the configured pool root;
- Treehouse state persistence synchronizes the temporary file and directory around replacement.

### Current external primary documentation

The review used current official documentation for:

- Node.js child processes, detached POSIX process groups and signal behavior;
- Node.js filesystem synchronization and rename behavior;
- Node.js fatal UTF-8 decoding through `TextDecoder`;
- Git worktree and Git configuration environment controls;
- Microsoft WSL guidance to keep Linux tooling state on Linux-owned filesystems rather than Windows-mounted paths.

No secondary blog or model-generated claim was used as lifecycle authority.

## Scope result

The implementation remains correctly bounded to the M2 Architecture Spike:

- one disposable repository shape;
- one Treehouse candidate;
- one pool;
- one fixed S01-S15 matrix;
- no Repository Profile capability;
- no Golden Path selection;
- no multi-Worker scheduling;
- no integration workflow;
- no Pi dispatch;
- no M01 persistence or production adapter.

The review found no accidental implementation of later Roadmap milestones.

## Adversarial method

The harness was reviewed through five complementary methods:

1. line-by-line code and protocol comparison;
2. source review of the selected Treehouse candidate;
3. mechanical searches for prohibited process and cleanup patterns;
4. executable adversarial tests added before corrections;
5. full exact-head GitHub Actions verification after corrections.

The review challenged:

- shell invocation and fallback;
- process descendants after timeout;
- host environment inheritance;
- Windows-mounted or escaped paths;
- Treehouse paths outside the disposable pool;
- command output bounds;
- unsafe cleanup;
- stale executable identity;
- exit-code-only semantic decisions;
- dirty-worktree loss;
- invalid UTF-8;
- partial or non-durable Evidence;
- inaccurate private-state observation;
- incomplete or fabricated BLOCKED reports.

## Findings and resolution

| Severity | Finding | Resolution |
| --- | --- | --- |
| Critical | Timeout signaled only the direct child; descendants could survive and contaminate Evidence or cleanup. | Every Linux subprocess now owns an isolated process group. Timeout/output overflow signals the full group with `SIGTERM` and escalates to `SIGKILL`. A real grandchild-process test proves termination. |
| Critical | Cleanup could use the old Treehouse path without proving that its current bytes still match the finalized Verdict. | Cleanup rediscovers current provenance and blocks before status or deletion when executable path/hash, Treehouse version, Git, Node, Ubuntu/WSL identity or command-shape hash changed. |
| Important | A provenance mismatch aborted `run` before S01, producing no finalized BLOCKED Evidence. | Known host/tool/version discovery errors become a structured blocked provenance object; S01 and dependent scenarios are finalized as `BLOCKED`, with honest null bindings and no invented identity. |
| Important | Cleanup compared only source HEAD and porcelain status. | `environment.json` now binds a complete source baseline: HEAD, status, local config, refs, tracked tree and working-tree digest. Cleanup compares the full snapshot. |
| Important | Treehouse control paths and observed worktrees were only absolute/Linux-owned, not fully constrained to the run/pool. | Logs must remain under run `artifacts/`; return targets must remain under the run; acquisition/status paths must resolve under the configured pool. |
| Important | `treehouse.toml` interpolated the pool path without encoding quotes or backslashes. | The pool root is encoded as a TOML-compatible quoted string through deterministic JSON string escaping. |
| Important | Some JSON readers could accept invalid UTF-8 after replacement-character decoding. | `parseJsonBytesStrict` uses fatal UTF-8 decoding before `JSON.parse`; fixture, finalized run and scenario aggregate boundaries use it. |
| Important | Provenance subprocesses inherited arbitrary host variables and PATH entries. | Discovery uses an exact environment with an executable-derived Linux-only PATH, locale controls, update suppression, and disabled Git global/system configuration. |
| Important | S13 inspected fake HOME rather than the real Treehouse private-state area and compared non-adjacent snapshots. | S13 now observes the configured pool private state immediately before and after `status --json`; isolated normalization is a limitation, while accompanying Lease/repository mutation is a failure. |
| Important | Evidence writes were rename-atomic but not explicitly crash-durable. | A shared durable writer now performs write, file `fsync`, close, rename and directory `fsync`. Fixture and finalized Evidence APIs do not return before this boundary. |

All Critical and Important findings were corrected before pre-WSL2 acceptance.

## RED proof

### Main adversarial RED

Canonical workflow:

```text
Workflow: 30913196584
Job:      92004727217
Result:   EXPECTED FAILURE
```

Observed TC-01 totals:

```text
Tests: 69
Pass:  60
Fail:   9
```

The nine failures corresponded to the intended missing properties:

- descendant process group survived timeout;
- path control characters were accepted;
- TOML root encoding was unsafe;
- Treehouse control/observed paths escaped the run or pool;
- provenance inherited host environment;
- strict UTF-8 parser did not exist;
- provenance failure aborted before finalized S01 BLOCKED Evidence;
- cleanup did not revalidate current identity;
- cleanup did not compare the complete source baseline.

All sixty previously accepted TC-01 tests remained green.

### BLOCKED report RED

Canonical workflow:

```text
Workflow: 30913520103
Job:      92005804841
Result:   EXPECTED FAILURE
```

The additional test required blocked provenance to produce a truthful report with `NOT_OBSERVED` values and no synthetic version or executable hash.

## Corrected deterministic coverage

The reviewed README contains the complete S01-S15 mapping. The deciding implementation is summarized below.

| Scenario | Deciding boundary |
| --- | --- |
| S01 | provenance discovery/validation and BLOCKED conversion |
| S02 | strict JSON acquisition, pool containment and linked-worktree proof |
| S03 | trusted Git invocation log, no-fetch assertion and zero-remotes proof |
| S04 | source/pool before-after snapshot comparison |
| S05 | new status-only client recovery without a second acquisition |
| S06 | exact path, Lease ID, holder and leased-status observation |
| S07 | clean preflight, exact conditional return and fresh post-status |
| S08 | stale-ID non-zero rejection plus unchanged Lease/worktree |
| S09 | stale-holder non-zero rejection plus unchanged Lease/worktree |
| S10 | dirty sentinel, non-force return and destructive-command exclusion |
| S11 | stored semantic release result plus fresh status; no second return |
| S12 | independent missing/unmanaged classification and unchanged managed status |
| S13 | adjacent private-state observation plus Lease/source/worktree integrity |
| S14 | every command metadata record against the bounded process contract |
| S15 | exact freshness identity and cleanup rediscovery |

Cross-cutting tests additionally prove strict CLI parsing, path/symlink containment, crash-durable writes, process-tree termination, secret-free reporting and fail-closed cleanup.

## Mechanical review result

The final reviewed implementation contains:

```text
shell: true production invocation:           NONE
shell fallback:                              NONE
force release invocation:                    NONE
destroy invocation:                          NONE
broad prune invocation:                      NONE
unbounded command output:                    NONE
cleanup before finalized Evidence:           NONE
exit-code-only release classification:        NONE
broad stderr-regex lifecycle authority:       NONE
unbound executable/version Verdict:           NONE
arbitrary host environment propagation:       NONE
cleanup path outside validated run root:      NONE
```

Mocked dependencies are used to force rare lifecycle states, but state-changing properties are also covered by real child-process, Git repository, symlink, filesystem, durability and process-group tests.

## Final GREEN proof

Reviewed implementation head:

```text
2e1d73ef1c970694c5c50f8a2db4bc3c00db22be
```

PR synthetic merge commit:

```text
e219df0b492fe45b529389df27f0e82edb8cf859
```

Canonical workflow:

```text
Workflow:    30916499733
Job:         92015860083
Environment: Ubuntu 24.04.4, Node.js 24.18.0, npm 11.16.0, Git 2.54.0
Command:     npm ci && npm run verify
Result:      PASS
```

Verified results:

```text
npm audit:                       PASS — 0 vulnerabilities
typecheck:                       PASS
product tests:                   PASS — 95/95
AS-02 deterministic tests:      PASS — 119/119
TC-01 deterministic tests:      PASS — 75/75
documentation tooling:          PASS
MIS-002 Replan builder:         PASS
approved allocation tests:      PASS
documentation validation:       PASS — 87 canonical IDs
```

## Residual limitations

The following are explicit boundaries, not hidden defects:

1. **No real conformance yet.** The installed Treehouse candidate has not executed against this harness. Task 13 remains `NOT_STARTED`.
2. **Internal scenario artifacts.** S14/S15 may use empty synthetic artifacts for internal observations; no fake subprocess is executed.
3. **Integrity, not hostile-user authenticity.** Hashes and the manifest detect accidental or partial tampering. They are not a signature against a malicious same-user actor able to rewrite all artifacts and matching hashes.
4. **Candidate binding.** Any change in Treehouse bytes/version, Git, Node, Ubuntu/WSL identity or command shape invalidates reuse and requires re-review.
5. **Draft design state.** PR #17 remains draft/unmerged; M01 microdesign remains proposed and R5 remains in progress.

None of these limitations permit false Treehouse acceptance.

## Verdict

```text
TC-01 deterministic harness:        ACCEPTED FOR CANONICAL WSL2 EXECUTION
TC-01 real Treehouse Evidence:       NOT_STARTED
Treehouse production conformance:    NOT ESTABLISHED
M01 microdesign:                     PROPOSED
M01 production implementation:       PROHIBITED
Pi Worker dispatch:                  PROHIBITED
Automatic merge:                     NOT AUTHORIZED
```

Task 12 closes the deterministic harness review. It does not begin Task 13 automatically.
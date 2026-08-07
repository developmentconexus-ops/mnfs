# TC-01 Treehouse Production Adapter Conformance

TC-01 is a disposable conformance harness for the exact Treehouse binary used by the canonical Ubuntu WSL2 environment. It is an Architecture Spike and R5 design input, not the M01 production adapter.

## Authority boundary

```text
TC-01 deterministic harness: IMPLEMENTED / DETERMINISTICALLY VERIFIED
TC-01 real WSL2 Evidence:     NOT_STARTED
Treehouse conformance:         NOT ESTABLISHED
M01 microdesign:               PROPOSED
M01 implementation:            PROHIBITED
Pi Worker dispatch:            PROHIBITED
```

A deterministic PASS proves the harness logic and safety boundaries. It does not prove the installed Treehouse binary until the separate canonical WSL2 run is performed and reviewed.

## Deterministic verification

```bash
npm run test:tc01
npm run verify
```

The deterministic tests do not invoke the installed Treehouse binary. They use injected process boundaries and disposable repositories so root CI can verify harness logic without WSL2, network, credentials, the user's real HOME, a user repository or a user Treehouse pool.

The deterministic suite includes real child-process, Git repository, filesystem, symlink, process-group and durability proofs where observation of the operating-system behavior matters.

## Real canonical WSL2 execution

The real commands exist, but remain behind the Task 13 human gate:

```bash
npm run tc01 -- run [--run-id <id>] [--state-root <absolute-linux-path>] [--json]
npm run tc01 -- report --run-root <absolute-linux-path> [--json]
npm run tc01 -- cleanup --run-root <absolute-linux-path> [--json]
```

Real execution must use a disposable Linux-owned repository and a run-specific pool outside the MNFS checkout. It preserves material failures for review and never uses `treehouse return --force`, `treehouse destroy`, broad prune or automatic destructive recovery.

## Runtime layout

```text
${MNFS_HOME:-$HOME/.local/state/mnfs}/fixtures/tc-01/<run-id>/
  fixture.json
  source-repo/
  pool-root/
  snapshots/
  fake-home/
  git-wrapper/
  artifacts/
    environment.json
    scenarios.json
    manifest.json
    verdict.json
    report.md
    cleanup.json
    commands/
```

`fixture.json`, command Evidence, scenario aggregates and the final manifest are written through a crash-durable boundary: temporary bytes are synchronized, renamed and followed by directory synchronization before the API reports completion.

## Process boundary

Every controlled subprocess uses:

- an executable plus argument array;
- `shell: false`;
- closed stdin;
- bounded stdout and stderr;
- an explicit timeout;
- an allowlisted environment;
- no shell fallback or retry.

On Linux, each subprocess receives an isolated process group. Timeout or output overflow sends termination to the complete group and escalates to `SIGKILL`, preventing descendants from surviving the Evidence boundary.

## Path and environment boundary

TC-01 rejects:

- relative paths;
- `/mnt` and paths whose existing ancestor resolves below `/mnt`;
- control characters in paths or command values;
- symlink escapes;
- Treehouse logs outside the run's `artifacts/` directory;
- return targets outside the disposable run;
- acquired or observed worktrees outside the configured pool.

Provenance and Git observations use reduced environments. User Git configuration, arbitrary host variables and Windows-mounted PATH entries do not participate in conformance measurements.

## Evidence and Verdict boundary

Raw stdout and stderr remain binary artifacts. Scenario and report aggregates contain hashes, references and bounded excerpts only.

```text
material safety failure             → REJECT
missing, blocked or inconclusive    → BLOCKED
safe explicit constraint            → ACCEPT_WITH_LIMITATIONS
all S01-S15 pass without limitation → ACCEPT
```

Command exit and human banners are observations, never lifecycle authority. Release classifications require fresh status plus Git/filesystem observations.

## Cleanup boundary

Cleanup is a separate command and is never automatic.

It requires:

- finalized and hash-valid Evidence;
- an acceptable Verdict;
- no live TC-01 Lease;
- no dirty managed worktree;
- exact current Treehouse/Git/Ubuntu/WSL/Node/command-shape identity;
- a complete source baseline match covering HEAD, porcelain status, local config, refs, tracked tree and working-tree digest;
- recognized run-scoped paths only.

Any blocker returns `TC01_CLEANUP_BLOCKED` and preserves all artifacts and fixture resources.

## Deterministic coverage

| Scenario | Deciding implementation | Primary deterministic proof |
| --- | --- | --- |
| S01 | `discoverTc01Environment`, `validateProvenance`, provenance branch in `runTc01ScenarioCore` | `provenance.test.mjs`; `orchestrator-blocked.test.mjs`; `report-blocked-provenance.test.mjs` |
| S02 | `acquireCurrentLease`, `acquireTreehouseLease`, `proveLinkedWorktree` | `scenario-runner.test.mjs` normal acquisition; `treehouse-client.test.mjs`; `treehouse-client-boundary.test.mjs` |
| S03 | `readGitInvocationLog`, `assertNoFetchInvocation`, `listRemotes` | `git-observer.test.mjs`; S03 normal path in `scenario-runner.test.mjs` |
| S04 | repository/path snapshot comparison around acquisition | `git-observer.test.mjs`; S04 normal path in `scenario-runner.test.mjs` |
| S05 | fresh-client `status --json` recovery without a second acquisition | `scenario-runner.test.mjs` fresh-client counters and acquisition-failure blocking |
| S06 | `observeLease` plus exact path/Lease ID/holder matching | `scenario-runner.test.mjs`; strict status tests in `treehouse-client.test.mjs` |
| S07 | `releaseExactLease` with clean preflight and fresh status | normal and exit-zero/Lease-still-present tests in `scenario-runner.test.mjs` |
| S08 | stale external Lease ID branch | non-zero plus unchanged-state and exit-zero adversarial tests in `scenario-runner.test.mjs` |
| S09 | stale holder branch | non-zero plus unchanged-state and mutation-despite-error tests in `scenario-runner.test.mjs` |
| S10 | dirty sentinel, non-force return, destructive-Git inspection | preservation and destructive mutation tests in `scenario-runner.test.mjs` |
| S11 | stored semantic release plus fresh status; no second return | `ALREADY_RELEASED` and `rawReturnInvoked: false` assertions in `scenario-runner.test.mjs` |
| S12 | independent missing/unmanaged target inspection plus unchanged managed status | divergence classifications in `scenario-runner.test.mjs`; client containment tests |
| S13 | adjacent private-state snapshots around status plus Lease/source/worktree comparison | `scenario-private-state-boundary.test.mjs`; isolated-normalization and integrity-failure tests in `scenario-runner.test.mjs` |
| S14 | `commandContractViolation` against all command metadata | valid and invalid command Evidence tests in `scenario-runner.test.mjs`; process runner tests |
| S15 | `currentFreshnessIdentity`, Verdict bindings and cleanup rediscovery | identity-drift tests in `scenario-runner.test.mjs`, `report.test.mjs` and `cleanup-safety.test.mjs` |

Cross-cutting proofs:

| Property | Tests |
| --- | --- |
| strict CLI | `cli.test.mjs` |
| complete orchestration | `orchestrator.test.mjs`, `orchestrator-blocked.test.mjs` |
| canonical JSON and strict UTF-8 | `evidence.test.mjs`, `strict-json.test.mjs` |
| crash-durable writes | `durable-write.test.mjs`, Evidence and fixture suites |
| path/symlink containment | `paths.test.mjs`, `git-observer.test.mjs`, `treehouse-client-boundary.test.mjs` |
| process-tree termination | `process-runner.test.mjs` |
| provenance isolation | `provenance.test.mjs` |
| deterministic secret-free reporting | `report.test.mjs`, `report-blocked-provenance.test.mjs` |
| cleanup freshness and full source baseline | `cleanup-safety.test.mjs`, `orchestrator.test.mjs` |

## Adversarial review result

Task 12 inspected the final harness against the accepted Product Blueprint, Capability Roadmap, Capability Realization Method, ADR-0005, TC-01 protocol, M01 microdesign, Treehouse 2.1.1 source and current primary documentation for Node.js, Git and WSL.

Corrected Critical or Important findings:

1. timeouts terminated only the direct child rather than the complete descendant process group;
2. cleanup could invoke a Treehouse executable whose bytes changed after the Verdict;
3. a host/tooling mismatch stopped before finalized S01 `BLOCKED` Evidence;
4. cleanup compared only HEAD/status rather than the complete source baseline;
5. Treehouse control, return and observed worktree paths were not fully constrained to the run/pool;
6. fixture TOML did not encode quote/backslash characters safely;
7. some JSON boundaries accepted invalid UTF-8 through replacement characters;
8. provenance commands inherited arbitrary host environment and PATH entries;
9. S13 measured the wrong private-state area and used non-adjacent snapshots;
10. fixture and Evidence publication were rename-atomic but lacked an explicit fsync durability boundary.

Final mechanical review found no production invocation using `shell: true`, no force/destroy/broad-prune operation, no release decision based only on an exit code or human regex, and no cleanup path outside the validated run root.

## Residual limitations

- The deterministic suite proves the harness, not the installed Treehouse binary. Runtime conformance remains `NOT_STARTED` until Task 13.
- S14 and S15 can use synthetic empty artifacts for internal observations; no fake subprocess is executed.
- Hash-bound artifacts provide integrity and tamper detection, not authenticity against a malicious same-user actor able to rewrite every artifact and matching hash.
- PR #17 remains draft and unmerged; R5 remains `IN_PROGRESS`.

## Next governed gate

Task 13 is a separate manual canonical WSL2 run. It requires explicit continuation after review of Task 12. No real Treehouse run, M01 implementation or Pi Worker dispatch is authorized by this README.
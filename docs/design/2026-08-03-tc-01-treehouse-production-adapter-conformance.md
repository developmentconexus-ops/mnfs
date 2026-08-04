---
id: DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
title: TC-01 Treehouse Production Adapter Conformance
document_type: microdesign
form: explanation
authority: specification
status: accepted
version: 0.2.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - CAP-EXECUTION
  - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
  - ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2
  - ACCEPTANCE-M2-UNBLOCK
  - ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW
tracking_issue: 16
last_reviewed: 2026-08-03
---

# TC-01 — Treehouse Production Adapter Conformance

## 1. Purpose

TC-01 proves whether the exact Treehouse binary installed in canonical Ubuntu WSL2 satisfies the external-operation contract required by `MIS-002/M01`.

It is a conformance protocol, not production implementation.

```text
Treehouse source review
+
installed binary behavior
+
controlled disposable fixture
→ adapter contract evidence
```

The protocol prevents the M01 microdesign from treating undocumented or source-only behavior as production fact.

## 2. Decision under test

Candidate:

```text
Treehouse 2.1.1
→ physical worktree and external Lease authority

MNFS
→ semantic Lease, Intent, idempotency, fencing and Recovery authority
```

TC-01 may return:

```text
ACCEPT
ACCEPT_WITH_LIMITATIONS
REJECT
BLOCKED
```

No result authorizes M01 implementation automatically. The result becomes an R5 input.

## 3. Fixed constraints

- Run only under canonical Ubuntu WSL2.
- Use Node.js `24.18.0` or the currently approved canonical floor.
- Use a Linux-owned disposable fixture, never `/mnt/c`.
- Capture exact Treehouse version, executable realpath and SHA-256 before scenarios.
- Use a disposable Git repository with **no `origin` remote** for the accepted fixed M2 path.
- Place the Treehouse pool outside the source checkout.
- Never read or modify the user's real repositories, credentials or Treehouse pools.
- Never use `treehouse return --force` or any destroy command.
- Invoke subprocesses using argument arrays and `shell: false`.
- Close stdin; no scenario may wait for interactive confirmation.
- Use bounded stdout/stderr capture and stable timeout classifications.
- Preserve the fixture and Evidence after a material failure until trusted cleanup.
- A missing proof is `BLOCKED` or `INCONCLUSIVE`, never PASS.

## 4. Fixture

Each run uses:

```text
${MNFS_HOME:-$HOME/.local/state/mnfs}/fixtures/tc-01/<run-id>/
  source-repo/
  pool/
  artifacts/
  snapshots/
```

Trusted setup:

1. initialize `source-repo` with one deterministic commit;
2. do not configure an `origin`;
3. configure Treehouse pool root to `pool/`;
4. record source tree, `.gitignore`, Git refs/config and directory digests;
5. verify the checkout is clean;
6. compute the deterministic holder:

```text
mnfs-tc01-<run-id>
```

No test uses the real MNFS checkout as the Treehouse source repository.

## 5. Evidence model

Every scenario writes a structured record:

```ts
interface TreehouseConformanceEvidence {
  scenarioId: string;
  startedAt: string;
  finishedAt: string;
  executablePath: string;
  executableHash: string;
  version: string;
  argv: string[];
  cwd: string;
  timeoutMs: number;
  exitCode: number | null;
  signal: string | null;
  stdoutRef: string;
  stderrRef: string;
  expected: string;
  observations: Record<string, unknown>;
  result: 'PASS' | 'FAIL' | 'BLOCKED' | 'INCONCLUSIVE';
  rationale: string;
}
```

Raw outputs remain artifacts. The final report contains digests and bounded excerpts only.

## 6. Scenario matrix

### TC01-S01 — Version and capability identity

Run:

```text
treehouse --version
```

Verify:

- executable resolves to one absolute Linux path;
- version is exactly the accepted candidate;
- executable SHA-256 is captured;
- help exposes `get --lease --json`, `status --json`, `return --if-lease-id` and `return --if-lease-holder`;
- no command is inferred from source review alone.

A version or capability mismatch is `BLOCKED` pending explicit re-review.

### TC01-S02 — JSON Lease acquisition contract

Run from `source-repo`:

```text
treehouse get --lease --lease-holder <holder> --json
```

Require stdout to contain exactly one JSON object with:

```text
path
lease_id
lease_holder
leased_at
```

Validate:

- path is an existing absolute Linux realpath;
- path is outside the source checkout;
- path is a linked worktree for the fixture repository;
- `lease_id` is non-empty and stable across observation;
- holder equals the exact requested value;
- no human banner contaminates stdout.

### TC01-S03 — No hidden network dependency

The fixture has no `origin`.

Use a trusted Git wrapper or syscall/process observation that records invocation without changing command semantics. Verify acquisition executes no `git fetch`, network client or credential prompt.

Environment includes:

```text
GIT_TERMINAL_PROMPT=0
GIT_OPTIONAL_LOCKS=0
```

Any network-dependent acquisition for the accepted fixture is `REJECT`.

### TC01-S04 — Source checkout mutation boundary

Compare before/after digests for:

- tracked tree;
- `.gitignore`;
- repository config;
- relevant refs;
- source worktree status.

Expected:

- source checkout remains clean;
- no tracked or untracked file appears;
- no source configuration changes unexpectedly;
- only the configured external pool and Git's expected linked-worktree metadata change.

A source-checkout mutation is `REJECT` unless the microdesign names and safely controls it.

### TC01-S05 — Crash after external acquisition

Simulate:

```text
MNFS Intent persisted
→ Treehouse acquisition succeeds
→ process terminates before semantic ACTIVE commit
```

Start a fresh process and run `treehouse status --json`.

Require exact rediscovery by holder with matching:

```text
lease_id
lease_holder
path
leased_at
status = leased
```

A second `get` must not be needed to recover the observation.

### TC01-S06 — Status JSON identity

Run:

```text
treehouse status --json
```

Require deterministic parsing of a JSON array. Locate the worktree by exact realpath and verify Lease ID, holder and leased status match acquisition.

The adapter must not parse colorized or tabular human output.

### TC01-S07 — Correct conditional release

Before release, verify the worktree is clean and has no controlled background process.

Run:

```text
treehouse return <path>
  --if-lease-id <external-lease-id>
  --if-lease-holder <holder>
```

with closed stdin and no force.

Afterward, use fresh status observation to verify the exact Lease is absent or the worktree is available with no Lease identity.

Command exit alone is not sufficient proof.

### TC01-S08 — Stale external Lease ID fencing

Acquire a Lease, then invoke return with a different Lease ID and the correct holder.

Expected:

- non-zero exit with a bounded identifiable precondition failure;
- worktree remains leased;
- Lease ID and holder remain unchanged;
- worktree content remains unchanged.

### TC01-S09 — Stale holder fencing

Invoke return with the correct Lease ID and a different holder.

Expected:

- non-zero exit;
- current Lease remains intact;
- no detach, reset or cleanup occurs.

### TC01-S10 — Dirty-worktree preservation

Create a controlled uncommitted file in the leased worktree.

The future MNFS preflight must detect dirty state and skip Treehouse return. Additionally, prove that an accidentally invoked non-force return with closed stdin does not silently reset the worktree.

Expected:

- command aborts or fails without confirmation;
- controlled file remains byte-identical;
- Lease remains active;
- no force flag appears.

If the installed binary resets dirty work non-interactively, the candidate is `REJECT` for direct production use.

### TC01-S11 — Repeated-release classification

After a successful release, repeat the same semantic MNFS request.

The protocol must not require Treehouse stderr to mean `ALREADY_RELEASED`.

Expected MNFS classification algorithm:

1. fresh `status --json` observation;
2. verify no matching Lease ID or holder exists;
3. verify no newer Lease occupies the path;
4. return the previous semantic release result.

Record the repeated raw Treehouse command only as advisory behavior.

### TC01-S12 — Missing or unmanaged path

Test a controlled missing path and an unmanaged fixture worktree.

Expected:

- neither is automatically classified as a successful release;
- the result is an explicit divergence or adapter failure;
- no unrelated pool resource changes.

### TC01-S13 — Status private-metadata behavior

Digest Treehouse private state before and after `status --json`.

If Treehouse normalizes its private metadata, record the exact change and prove:

- no worktree content is reset;
- no Lease identity is cleared;
- no source checkout mutation occurs;
- no MNFS state is changed.

The final design must describe this as observation with possible private self-healing, not a byte-for-byte read-only command.

### TC01-S14 — Process contract

For every command prove:

- executable and argument array are exact;
- `shell: false`;
- stdin closed;
- timeout bounded;
- environment allowlisted;
- output size bounded;
- stdout JSON remains separate from stderr banners;
- no direct-host fallback exists after timeout or spawn failure.

### TC01-S15 — Evidence freshness

Change any of:

```text
Treehouse version
executable hash
Git version
Ubuntu/WSL identity
adapter command shape
```

Verify the previous acceptance cannot be reused silently. The conformance report becomes stale and R5 returns to review.

## 7. Verdict rules

### ACCEPT

All scenarios pass at the exact pinned version and host identity. No hidden network, source mutation, stale-holder release or dirty-worktree loss exists.

### ACCEPT_WITH_LIMITATIONS

No work loss or fencing bypass exists, but the microdesign must bind explicit constraints such as:

- fixture/repository without remote;
- external pool location;
- exact version and executable hash;
- mandatory preflight;
- status private-metadata normalization;
- limited supported Git/Treehouse combination.

### REJECT

Any of:

- stale ID or holder releases a new Lease;
- dirty work is reset without explicit authority;
- accepted acquisition requires network or credentials;
- source checkout mutates unexpectedly;
- JSON identity cannot be obtained reliably;
- recovery cannot rediscover an exact acquired Lease;
- missing path is treated as safe success without identity proof.

### BLOCKED

The canonical host lacks required tooling, or the installed version differs and has not been reviewed.

## 8. Cleanup

Cleanup is trusted and run-specific.

- release only the exact controlled Lease after Evidence is complete;
- if ordinary release is unsafe or fails, preserve the fixture and report manual cleanup instructions;
- never invoke broad prune or destroy;
- never touch a real user pool;
- remove only the run-specific fixture after all protected digests pass.

## 9. Outputs

TC-01 produces:

```text
runtime artifacts/tc-01/<run-id>/
  environment.json
  provenance.json
  scenarios.json
  commands/
  report.md

promoted acceptance/rejection report
  docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md
```

The promoted report records exact versions, hashes, outcomes, limitations and whether the M01 microdesign may depend on the candidate.

## 10. Documentation and requirements impact

```yaml
documentation_impact:
  status: UPDATED
  affected:
    - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
    - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
    - DOC-PROJECT-STATUS
    - TRACKING-WORKLOG
  rationale: "TC-01 converts Treehouse source assumptions into canonical WSL2 adapter evidence."
  follow_up:
    issue: 16

requirements_impact:
  status: UPDATED
  affected:
    - CAP-EXEC-REQ-006
    - CAP-EXEC-REQ-007
    - CAP-EXEC-REQ-008
  rationale: "These requirements depend on exact acquisition, external identity, release fencing and observation behavior."
```

## 11. Approval and current authority

The Operator accepted this protocol for implementation and canonical WSL2 execution planning through `ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW`.

```text
Protocol status:       ACCEPTED
Implementation plan:   WRITTEN, SEPARATE REVIEW REQUIRED
Protocol execution:    AUTHORIZED after a reviewed, CI-green harness exists
Production adapter:    PROHIBITED
M01 implementation:    PROHIBITED
Pi Worker dispatch:    PROHIBITED
```

Acceptance of this protocol does not establish Treehouse conformance and does not approve the final M01 microdesign.

---
id: ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2
title: AS-02 Local Pi Sandbox on WSL2 Acceptance
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - DESIGN-AS-02-LOCAL-PI-SANDBOX-WSL2
  - PLAN-AS-02-LOCAL-PI-SANDBOX-WSL2
  - ADR-0006
  - CAP-EXECUTION
tracking_issue: 8
last_reviewed: 2026-08-03
---

# AS-02 Local Pi Sandbox on WSL2 Acceptance

## 1. Decision

AS-02 produced the mechanical Verdict **`ACCEPT`** for the reviewed local E1 candidate:

```text
Trusted Pi/provider host process
+ Pi built-ins and discovered extensions disabled
+ seven first-party brokered tools
+ @anthropic-ai/sandbox-runtime 0.0.67
+ Treehouse disposable Lease/worktree
+ canonical Ubuntu WSL2
```

This acceptance applies only to the frozen candidate, versions, policy and scenario harness described in this report. It does not independently approve the M2 Mission Plan, merge the spike, or unblock M2 execution.

## 2. Accepted run identity

| Field | Value |
|---|---|
| Run ID | `as02-20260803t144645276z-7048d3` |
| Run status | `COMPLETE` |
| Verdict | `ACCEPT` |
| Policy hash | `sha256:886eb0f1fb5c2087d0b5bf16a51f399dc1ffb9a75aab16d4900a9ffe6ab57797` |
| Restart status | `PASS` |
| Restart drift | none |
| Restart checkpoint hash | `sha256:ff955d0ac518741ec1cf47c434950d6e101b8de527584effa1cddae979658b40` |
| Pi Pilot | `PASS` |
| M2 entry criteria introduced | none |

The runtime report was generated at:

```text
${MNFS_HOME}/artifacts/as-02/as02-20260803t144645276z-7048d3/report.md
```

Raw runtime artifacts remain outside the repository under the MNFS state root. This document promotes only the reviewed identity, hashes and conclusions required for governance.

## 3. Environment and dependency boundary

| Component | Observed value |
|---|---|
| Distribution | Ubuntu 26.04 LTS under WSL2 |
| Kernel | `6.18.33.2-microsoft-standard-WSL2` |
| Architecture | `x86_64` |
| Node.js | `v24.18.0` |
| npm | `12.0.2` |
| Pi | `0.83.0` |
| Pi Anthropic auth plugin | `2.0.1` |
| Sandbox Runtime | `0.0.67` |
| Treehouse | `v2.1.1` |
| Bubblewrap | `0.11.1` |
| Docker socket | `NOT_PRESENT` |

The Pi Pilot used model `anthropic/claude-haiku-4-5`, registered exactly `bash`, `read`, `write`, `edit`, `grep`, `find`, and `ls`, completed exactly one successful nonce-bound read call, made no other tool calls, and matched the expected output.

## 4. Scenario evidence

| Scenario | Expected | Result | Accepted rationale |
|---|---|---|---|
| S1 | ALLOW | PASS | A write inside the leased worktree succeeded and was observed by the trusted runner. |
| S2 | DENY | PASS | Host write escape was blocked and trusted observations remained unchanged. |
| S3 | DENY | PASS | Synthetic credential-shaped reads were blocked without opening real credentials. |
| S4 | DENY | PASS | Access to the controlled Windows mount sentinel was blocked. |
| S5 | DENY | PASS | Network access was denied by default. |
| S6 | OBSERVE | PASS | The declared domain was reachable while an undeclared domain remained blocked. |
| S7 | OBSERVE | PASS | Broad GitHub reachability was observed only as risk evidence and did not grant mutation authority. |
| S8 | DENY | PASS | The controlled Unix socket was inaccessible to the sandboxed process. |
| S9 | DENY | PASS | Protected metadata writes were blocked; the unreadable active policy was shadowed without host mutation; all trusted digests remained unchanged. |
| S10 | ALLOW | PASS | Git, Node, npm, TypeScript and test workflow compatibility remained usable. |
| S11 | DENY | PASS | Restrictions propagated to child processes. |
| S12 | DENY | PASS | A blocked violation produced diagnostic evidence while trusted observations remained unchanged. |
| S13 | FAIL_CLOSED | PASS | Sandbox initialization failure exposed no direct-host fallback or allowed side effect. |
| S14 | OBSERVE | PASS | Baseline, sandbox and paired-overhead distributions were measured without inventing a pass threshold. |
| S15 | OBSERVE | PASS | A real operator-assisted WSL termination and resume preserved dependency, policy, fixture and representative scenario identity with no drift. |

All required scenarios passed. The generated decision contained one reason: `All required AS-02 evidence passed.`

## 5. Security interpretation

The accepted result supports the following bounded conclusions:

1. A trusted Pi/provider host process can retain subscription OAuth while repository-facing operations are constrained behind the reviewed first-party broker and Sandbox Runtime boundary.
2. Treehouse provides disposable checkout separation, while Sandbox Runtime and the explicit policy provide the enforcement boundary; neither WSL2 nor Treehouse is accepted as sufficient isolation by itself.
3. The Worker-facing environment is an allowlist and does not inherit provider credentials or arbitrary WSL user variables.
4. Filesystem, mount, network-default-deny, Unix-socket, protected-metadata, child-process and fail-closed scenarios behaved as required on the accepted host.
5. The active policy remained outside Worker write authority. Linux read-deny shadowing did not mutate the trusted host file, which was verified by unchanged trusted digests.
6. Domain-level GitHub access remains broad risk evidence. It cannot distinguish safe reads from every possible mutation and must not be treated as generic mutation authority.
7. Docker-specific denial was not directly exercised because the Docker socket was absent. S8 still proved denial against a controlled Unix socket on the accepted `x86_64` host.

## 6. Performance observation

S14 measured warm and repeated samples for process spawn, Node startup, filesystem reads and the disposable toolchain test workflow. Overhead is calculated from paired samples (`sandbox[i] - baseline[i]`) and then summarized; independent percentile subtraction is not used.

No performance pass/fail threshold was introduced by AS-02. The accepted conclusion is that the boundary was measurable and compatible with the tested M2 development workflow, not that a universal latency budget has been established.

## 7. Operational boundary

Durable state required across restart is stored below the Linux MNFS state root:

```text
${MNFS_HOME}/artifacts/as-02/<run-id>/
${MNFS_HOME}/fixtures/as-02/<run-id>/
```

The Treehouse Lease remains under the user Treehouse root. The controlled Unix socket uses a short per-user, run-derived pathname under `/tmp`; it is strictly ephemeral, recreated after restart, excluded from checkpoint identity, and cleaned through a path derived from the run ID.

Cleanup is explicit and idempotent. Ordinary cleanup never uses Treehouse `destroy` or `--force`. A prior orphan recovery used Treehouse's exact-path, opt-in destroy workflow only after the backing repository had already been lost; that recovery is historical and not the normal accepted lifecycle.

## 8. Non-claims and remaining governance

AS-02 acceptance does **not** by itself:

- modify or approve `.mnfs/missions/MIS-002/plan.json` revision 3;
- authorize production M2 Worker dispatch;
- mark PR #13 ready or merge it;
- close the complete M2 readiness decision;
- change R3 or R4 without a fresh mechanical calculation.

The next required governance sequence is:

1. complete and integrate the AS-02 evidence change for Issue #8;
2. execute Issue #9 and create a schema-v2 Replan from the immutable MIS-002 revision 3 contract;
3. review and approve the exact Replan content hash explicitly;
4. recalculate R0–R4 from canonical evidence;
5. issue an explicit Operator decision before M2 is unblocked.

Until that sequence completes, the previously recorded readiness remains authoritative: R0 `PASS`, R1 `PASS`, R2 `PASS`, R3 `REVIEW_REQUIRED`, and R4 `BLOCKED`.

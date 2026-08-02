---
id: AS-02
title: Local Pi Sandbox on WSL2
document_type: architecture_spike
form: explanation
authority: specification
status: proposed
implementation_status: planned
version: 0.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - AS-02 test plan and decision inputs
related:
  - CAP-EXECUTION
  - ADR-0006
  - DOC-PRODUCT-BLUEPRINT-10
tracking_issue: 6
---

# AS-02 — Local Pi Sandbox on WSL2

## Question

Can MNFS run a real Pi Writer in a Treehouse worktree on canonical WSL2 while denying host writes, credential reads, network egress, privileged sockets and active-policy tampering, without breaking the required Node/Git/test toolchain?

## Candidate

```text
Pi sandbox extension pattern
+
@anthropic-ai/sandbox-runtime
+
Treehouse worktree
+
Ubuntu WSL2
```

## Baseline

Compare:

```text
A. no real Worker dispatch
B. candidate E1 boundary
```

Unrestricted host execution is not an acceptable production baseline.

## Environment

- Ubuntu WSL2;
- repository under Linux filesystem;
- pinned Pi version;
- pinned Sandbox Runtime version;
- bubblewrap and required helpers;
- Treehouse;
- disposable repository;
- sentinel secrets and protected paths;
- network test endpoint;
- no real credentials.

## Scenarios

| ID | Scenario | Expected |
|---|---|---|
| S01 | write inside worktree | allowed |
| S02 | write outside allowed roots | denied |
| S03 | read `~/.ssh`, `~/.aws`, gcloud, kube and sentinel `.env` | denied |
| S04 | read/write `/mnt/c` | denied by default |
| S05 | internet egress | denied by default |
| S06 | narrow registry/documentation allowlist | allowed only when configured |
| S07 | broad GitHub access | classified as insufficient for write safety |
| S08 | Docker and privileged Unix sockets | denied |
| S09 | mutate active sandbox policy, `.pi`, `.mnfs`, Git hooks/config | denied |
| S10 | Git read/status, Node, npm, TypeScript and tests | functional |
| S11 | spawn child process | restrictions propagate |
| S12 | blocked operation | violation is observable |
| S13 | sandbox unavailable | Worker does not start |
| S14 | repeated command execution | overhead measured |
| S15 | WSL/process restart | policy identity remains detectable |

## Measurements

- startup latency;
- command latency;
- test latency;
- memory use;
- denied operation diagnostics;
- tool compatibility;
- policy exceptions required;
- bypass attempts;
- Pi/Sandbox Runtime versions.

## Acceptance Criteria

1. no sentinel secret is readable;
2. no write escapes allowed roots;
3. network denial is effective;
4. domain allowlist does not grant external mutation authority;
5. Docker socket is inaccessible;
6. active policy is immutable to the Worker;
7. required M2 toolchain works;
8. child processes remain constrained;
9. sandbox failure is fail-closed;
10. overhead is measured and accepted;
11. configuration and violations are inspectable;
12. disable, upgrade and removal paths are documented.

## Output

- test report;
- Evidence refs;
- final policy draft;
- adapter recommendation;
- accepted/rejected ADR-0006 validation;
- new blockers;
- Removal Conditions.

## Stop conditions

Stop and reject the candidate when:

- a protected secret or path is accessible;
- execution falls back unsandboxed;
- required exceptions erase the boundary;
- WSL2 behavior is not repeatable;
- diagnostics cannot distinguish blocked from failed commands.

## Execution status

```text
NOT EXECUTED
```

This spike must run in the Operator's canonical WSL2 environment. Documentation publication alone cannot satisfy it.

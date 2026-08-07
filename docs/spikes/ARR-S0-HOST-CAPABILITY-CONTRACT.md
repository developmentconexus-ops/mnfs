---
id: DOC-ARR-S0-HOST-CAPABILITY-CONTRACT
title: ARR-S0 Host Capability Contract
document_type: architecture_spike_contract
form: reference
authority: contract
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - DOC-ARR-SPIKE-GOVERNANCE
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - ACCEPTANCE-ARR-S0-IMPLEMENT-AUTHORIZATION
tracking_issue: 23
last_reviewed: 2026-08-07
---

# ARR-S0 Host Capability Contract

## 1. Purpose and authority

ARR-S0 answers one bounded question:

> **What physical capabilities and broad capability classes are actually observable on the canonical Ubuntu WSL2 host, with enough exact Evidence for fresh S1/S2 planners to make later realization decisions?**

This contract is provider-neutral. It records host facts, not named-substrate eligibility, conformance, safety or selection.

The approved implementation plan is `PLAN-ARR-S0-HOST-CAPABILITY-PROBE` version `0.2.0`, accepted under `GATE-P0`. The deterministic harness may be built and reviewed under the exact `GATE-S0-IMPLEMENT` authorization, but **all new real host observation is PROHIBITED pending `GATE-S0-EXECUTE`**.

This document remains `status: proposed`, version `0.1.0`, until an explicit Operator Decision accepts exact contract bytes. Contract acceptance alone is never execution authority. Both `preflight` and `run` require `GATE-S0-EXECUTE`; `preflight` is intentionally lighter than `run`, but it still observes real Git, filesystem and host facts and therefore is not executable under the implementation-only gate.

The exact runtime Operator gate token is supplied through the dedicated `MNFS_ARR_S0_EXECUTE_AUTHORIZATION` control-plane channel:

```text
MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=<accepted-plan-git-blob> contract_sha256=<exact-contract-sha256> base_sha=<exact-canonical-commit> verify_run=<exact-successful-workflow-run> scope=canonical-host-probe-only
```

The execution-authority token is authenticated against the approved plan blob and SHA-256 recomputed from the exact accepted contract bytes **before any host or Git observation occurs**. Only after that authentication may the harness observe the repository source commit; it then revalidates the token's `base_sha` against that observed commit before host preflight may proceed. Missing, malformed, broader, stale or differently bound authority fails closed. The raw token is not persisted and is never propagated into probe subprocess environments; durable Evidence retains only its hash-bound authority identity.

`report` does not require a new execution gate because it reopens existing durable Evidence and performs no new host probe or host observation.

---

## 2. Safety boundary

ARR-S0 is observation-first and fail-closed.

Allowed operations after `GATE-S0-EXECUTE` authority validation are limited to:

- bounded reads of reviewed Linux host files;
- exact read-only commands with absolute executable paths;
- exact Git identity/status commands under a constrained non-mutating Git environment;
- `lstat` of reviewed device/tool paths;
- opening a reviewed device node only to establish openability, followed immediately by close and with no ioctl;
- one ephemeral user-namespace smoke when the reviewed executable is already present;
- read-only version queries against already-present optional tools;
- writes only beneath the validated Linux-owned MNFS state root for S0 Evidence.

Every subprocess uses exact argv, `shell: false`, closed stdin, explicit cwd, explicit allowlisted environment, timeout, bounded stdout/stderr and complete descendant termination on timeout.

Git observation disables optional locks, terminal prompts, system/global Git configuration, `core.fsmonitor` and hooks. This keeps repository identity observation from refreshing the index or invoking repository-configured executable behavior.

The harness must not inherit arbitrary host environment, proxy variables, credential-helper state or user credentials into probe subprocesses. The dedicated execution-authority token is consumed by the control plane before probing and is not included in any probe environment.

The harness must not modify host configuration, install software, enable kernel/virtualization features, alter sysctl state, start services, create workloads, broaden network/credential/effect authority or dispatch a production Worker.

The repository root and state root are separate safety boundaries. Lexical rejection of `/mnt/*` is not sufficient: preflight also locates the nearest existing ancestor of the state root, runs the reviewed `/usr/bin/stat -f -c %T` observation on that ancestor, and accepts the state-root filesystem only when its type is on the reviewed Linux-owned allowlist. Unreviewed or inconclusive filesystem types fail closed.

---

## 3. Durable run identity and lifecycle

A run ID is machine-generated and conforms to:

```text
arr-s0-YYYYMMDDtHHMMSSmmmz-<6 lowercase hex>
```

Durable lifecycle phases are exactly:

```text
CREATED
→ OBSERVING
→ OBSERVED
→ FINALIZED
```

Lifecycle state and Verdict are separate concepts. An interrupted run is reported at its last durable phase and never receives an invented final result.

Every run binds at least:

- exact repository commit and tree;
- exact approved S0 plan identity and approved plan Git blob;
- exact accepted S0 contract identity;
- exact `GATE-S0-EXECUTE` authority identity, including verification-run ID and token SHA-256 but never the raw Operator token;
- canonical host identity;
- raw and normalized Evidence artifacts;
- content hashes used for integrity verification.

---

## 4. Required host capability observations

The deterministic harness and this contract use exactly these host capability IDs:

| Capability ID | Deciding host fact |
|---|---|
| `HOST-WSL2` | whether kernel identity establishes the canonical WSL2 host |
| `HOST-LINUX-FS` | whether the repository filesystem is Linux-owned rather than a Windows-mounted filesystem |
| `HOST-CPU-VIRT` | whether virtualization CPU flags are positively exposed, or remain inconclusive where masking is possible |
| `HOST-KVM-DEVICE` | whether `/dev/kvm` exists as the expected character device |
| `HOST-KVM-RW-OPEN` | whether `/dev/kvm` can be opened read/write and immediately closed without ioctl |
| `HOST-USERNS` | whether the bounded ephemeral user-namespace smoke succeeds, is decisively denied/unsupported, or is inconclusive |
| `HOST-SECCOMP-CONFIG` | whether generic seccomp kernel config prerequisites are positively observed |
| `HOST-LANDLOCK-CONFIG` | whether generic Landlock kernel config support is positively observed; this does not prove a specific ABI |
| `HOST-FUSE-DEVICE` | whether the FUSE device exists in the expected form and can be opened without mounting |
| `HOST-FUSE-TOOLS` | whether reviewed userspace FUSE tooling is already present and version-observable |
| `HOST-CGROUP-V2` | whether cgroup v2 is positively observed from controllers plus filesystem type |
| `HOST-DOCKER-CLI` | whether the existing Docker CLI is present/version-observable without creating resources |
| `HOST-DOCKER-DAEMON` | whether an already-running Docker daemon answers only the reviewed read-only version query |
| `HOST-BWRAP` | whether the existing Bubblewrap executable is present/version-observable without launching a sandbox |
| `HOST-GIT-READONLY` | whether exact Git commit/tree/status identity is available through reviewed non-mutating commands |

Observation state vocabulary is:

```text
PRESENT
ABSENT
SUPPORTED
UNSUPPORTED
UNKNOWN
```

`UNKNOWN` is preserved whenever the available observation cannot justify a stronger state. In particular, missing kernel config does not justify inferring unsupported behavior from kernel version, and a generic feature flag does not prove a feature-specific ABI.

---

## 5. Generic capability classes

ARR-S0 derives only these broad classes:

| Class ID | Relevant host capabilities |
|---|---|
| `CLASS-LOCAL-PROCESS-ISOLATION` | WSL2, user namespaces and generic seccomp support |
| `CLASS-LANDLOCK-ISOLATION` | WSL2, generic Landlock support and generic seccomp support |
| `CLASS-MICROVM-KVM` | WSL2, CPU virtualization visibility, KVM device and KVM read/write openability |
| `CLASS-FUSE-COW` | WSL2, FUSE device and existing userspace FUSE tooling |
| `CLASS-LOCAL-CONTAINER` | WSL2, existing Docker CLI and existing Docker daemon observability |

Class eligibility values are exactly:

```text
PHYSICALLY_PLAUSIBLE
REQUIRES_SETUP_DECISION
BLOCKED_BY_HOST
UNKNOWN
```

The meanings are:

- `PHYSICALLY_PLAUSIBLE` means the mapped generic host facts are positive; it **does not prove a named candidate** is currently runnable, conformant, safe or selected.
- `REQUIRES_SETUP_DECISION` means a provisionable/tooling prerequisite is decisively absent or unsupported while no harder host fact blocks the generic class.
- `BLOCKED_BY_HOST` means a non-provisionable fact mapped by this contract is decisively absent or unsupported for that generic class.
- `UNKNOWN` means a material mapped host fact is missing or inconclusive and no stronger blocker/setup conclusion is justified.

Precedence is fail-closed and deterministic:

```text
hard host blocker
→ hard host unknown
→ provisionable prerequisite absent/unsupported
→ provisionable prerequisite unknown
→ physically plausible
```

No class result promotes a concrete runtime, process envelope, virtual-machine envelope, workspace substrate or remote provider.

---

## 6. Mechanical overall Verdict

The overall Verdict vocabulary is exactly:

```text
ACCEPT
ACCEPT_WITH_LIMITATIONS
BLOCKED
REJECT
```

Derivation is mechanical:

- `REJECT` — Evidence integrity/contract failure such as unsafe mutation, tamper, fail-open behavior, artifact-root escape or contract violation.
- `BLOCKED` — the canonical run cannot validly proceed/complete because a required run precondition is false, including canonical host identity, repository identity, clean checkout or core Evidence completeness.
- `ACCEPT_WITH_LIMITATIONS` — canonical source/host identity is established but one or more material observations or generic classes remain `UNKNOWN`; limitations are preserved for later planners.
- `ACCEPT` — required Evidence is complete and decisive enough for fresh S1/S2 planning, even when a generic class is decisively unavailable on the host.

A host lacking one physical capability is not by itself a contract failure. A model narrative, process exit message or operator preference cannot override the mechanically derived result.

---

## 7. Evidence integrity

Raw bytes are preserved before interpretation and referenced through immutable artifact records containing stable ID, relative path, SHA-256 and byte count.

Publication requires:

- path containment beneath the validated run root;
- no symlink destination/parent escape;
- exclusive temporary creation with restrictive file mode;
- exact-byte write;
- file fsync;
- atomic no-replace hard-link publication from the fsynced temporary file to the final name;
- removal of the temporary name after successful publication;
- parent-directory fsync;
- idempotence only when an existing artifact has identical bytes.

The no-replace operation must fail with an existing destination rather than overwrite it. If another actor creates the destination during the publication race, the harness leaves those bytes intact and accepts them only when they are exactly identical to the intended immutable artifact; differing bytes fail closed.

Before finalization, manifest records are reopened and checked for uniqueness, containment, regular-file type, exact byte count and recomputed SHA-256. `report` repeats integrity checks in a fresh process. Any later mismatch causes current Evidence to be treated as tampered and therefore rejected even if an earlier stored result said otherwise.

The final state binds both manifest hash and result hash and preserves the hash-bound execution-authority projection so a fresh reviewer can verify which gate authorized the Evidence without access to the raw token.

---

## 8. Machine interface

The frozen machine interface contains only:

```text
preflight --json
run --json
report --run-id RUN_ID --json
```

`preflight` requires `GATE-S0-EXECUTE`. It is read-only and checks whether the complete probe could run safely, but it still performs real repository/filesystem/host observations. The exact execution-authority token is therefore authenticated before any host or Git observation, and `base_sha` is revalidated against the observed repository commit before the remaining preflight checks proceed.

`run` requires the same authenticated `GATE-S0-EXECUTE` authority. It creates a run identity only after authority and preflight succeed, then performs the complete bounded capability suite and persists hash-bound Evidence.

`report` reopens existing durable Evidence and does not perform a new host probe or host observation. It rechecks manifest/result integrity by the machine-emitted run identity and never guesses or recomputes a run ID from time.

There is no host-management or remediation command in ARR-S0.

---

## 9. Downstream use

Accepted ARR-S0 Evidence may become an input to fresh S1/S2 planning. Those later planners must refresh current upstream requirements and map them onto immutable generic host facts; ARR-S0 Evidence is not rewritten when external project requirements change.

ARR-S0 by itself authorizes none of the following:

- concrete runtime/environment selection;
- candidate execution or adoption;
- production Worker dispatch;
- revision-5 M02 implementation;
- automatic delivery/merge;
- later Architecture Spike execution.

A later `GATE-S0-EXECUTE` authorization is independent from contract acceptance and must supply the exact runtime token binding the accepted plan blob, exact contract hash, exact canonical commit, exact deterministic verification Evidence and the bounded host-probe-only scope.

---
id: ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE
title: ARR-S0 Host Capability Probe Acceptance
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - DOC-ARR-S0-HOST-CAPABILITY-CONTRACT
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
tracking_issue: 23
last_reviewed: 2026-08-08
---

# ARR-S0 Host Capability Probe Acceptance

## 1. Mechanical Verdict

ARR-S0 produced the mechanical Verdict **`ACCEPT_WITH_LIMITATIONS`** for the canonical Ubuntu WSL2 host.

This acceptance records provider-neutral host facts only. It does not select, adopt or authorize any Agent Runtime, process sandbox, microVM, container, workspace substrate or other named realization.

The accepted conclusion is that core host identity and enough generic capability Evidence were established for fresh ARR-S1 and ARR-S2 planning to continue, while the unresolved Docker-daemon observation remains an explicit limitation.

## 2. Accepted run identity

| Field | Value |
|---|---|
| Run ID | `arr-s0-20260808t210139618z-ff3979` |
| Source commit | `8150eeddf3ed32485ac4c36b917e6a904ef6b683` |
| Source tree | `c878641bf1da29dc5427aa4e426263b825f1dff3` |
| S0 plan Git blob | `3e78445fcbcca360f612edefd025c6cb0f84f8e5` |
| S0 contract | `DOC-ARR-S0-HOST-CAPABILITY-CONTRACT` 1.0.0 |
| Contract SHA-256 | `sha256:2891a1a2dda0dc1cfe146174839c988be7d76dc3c710cd4d15d1b247f0753f5d` |
| Execution gate | `GATE-S0-EXECUTE` |
| Gate verification run | `31278210630` |
| Gate token hash | `sha256:09a612812253be5a1f2acd63db11b2d3b8c69a6336fd61535564f7a58859a34c` |
| Artifact manifest hash | `sha256:47fa64912e89ccb5ab8c7d9609f70aa78279bb7081467fb3354d1596c84de3cf` |
| Fresh report integrity | `PASS` (`ok=true`, zero errors) |
| Real-run exit | `RUN_RC=0` |
| Fresh report exit | `REPORT_RC=0` |
| Post-probe full verify | `PASS` (`POST_VERIFY_RC=0`) |

Raw probe bytes remain outside the repository under the Linux MNFS state root for this run. This document promotes only normalized, secret-free identities, hashes, host facts, capability classes, Verdict and limitations.

## 3. Canonical host identity

| Field | Observed value |
|---|---|
| Platform | `linux` |
| Canonical WSL2 | `true` |
| Kernel | `6.18.33.2-microsoft-standard-WSL2` |
| Distribution | Ubuntu `26.04` |
| Architecture | `x86_64` |
| Node.js | `v24.18.0` |
| Git | `2.53.0` |
| Repository filesystem | reviewed Linux-owned `ext2/ext3` |
| State-root filesystem | reviewed Linux-owned `ext2/ext3` |

The preflight established a clean exact checkout, Linux-owned repository and state roots, readable required host identity sources and the accepted execution-authority binding before the full run.

## 4. Accepted host capability facts

| Capability | State | Accepted rationale |
|---|---|---|
| `HOST-WSL2` | `SUPPORTED` | Kernel release identifies canonical WSL2. |
| `HOST-LINUX-FS` | `SUPPORTED` | Repository filesystem is on the reviewed Linux-owned allowlist. |
| `HOST-GIT-READONLY` | `SUPPORTED` | Read-only Git established exact commit/tree and a clean checkout. |
| `HOST-CPU-VIRT` | `SUPPORTED` | CPU information exposes `vmx`/`svm` virtualization capability. |
| `HOST-KVM-DEVICE` | `PRESENT` | `/dev/kvm` exists as a character device. |
| `HOST-KVM-RW-OPEN` | `UNSUPPORTED` | Read/write open of `/dev/kvm` failed with `EACCES`; no ioctl or VM creation was attempted. |
| `HOST-SECCOMP-CONFIG` | `SUPPORTED` | `CONFIG_SECCOMP=y` and `CONFIG_SECCOMP_FILTER=y`. |
| `HOST-LANDLOCK-CONFIG` | `SUPPORTED` | `CONFIG_SECURITY_LANDLOCK=y`; a specific Landlock ABI remains unproved. |
| `HOST-USERNS` | `SUPPORTED` | Ephemeral exact-argv user-namespace smoke succeeded with mapped uid 0. |
| `HOST-FUSE-DEVICE` | `SUPPORTED` | `/dev/fuse` is a character device and opened read/write without mounting. |
| `HOST-FUSE-TOOLS` | `PRESENT` | `fusermount3` is present under the reviewed fixed path. |
| `HOST-CGROUP-V2` | `SUPPORTED` | `cgroup.controllers` is readable on `cgroup2fs`. |
| `HOST-DOCKER-CLI` | `ABSENT` | Docker CLI was not found under the reviewed fixed paths `/usr/bin` or `/bin`. |
| `HOST-DOCKER-DAEMON` | `UNKNOWN` | Without the reviewed Docker CLI interface, an already-running daemon could not be observed. |
| `HOST-BWRAP` | `PRESENT` | Bubblewrap is present at `/usr/bin/bwrap`; S0 did not launch a sandbox. |

## 5. Generic capability classes

| Capability class | Eligibility | Accepted interpretation |
|---|---|---|
| `CLASS-LOCAL-PROCESS-ISOLATION` | `PHYSICALLY_PLAUSIBLE` | WSL2, user namespaces and generic seccomp facts are positive. This does not prove any named process-sandbox candidate. |
| `CLASS-LANDLOCK-ISOLATION` | `PHYSICALLY_PLAUSIBLE` | Generic Landlock and seccomp facts are positive. Specific Landlock ABI requirements remain candidate-specific proof work. |
| `CLASS-MICROVM-KVM` | `BLOCKED_BY_HOST` | `/dev/kvm` exists but the reviewed read/write open is unsupported in the observed host/user context. No automatic host or permission change is authorized. |
| `CLASS-FUSE-COW` | `PHYSICALLY_PLAUSIBLE` | FUSE device and reviewed userspace tooling are positive. This does not select a COW workspace substrate. |
| `CLASS-LOCAL-CONTAINER` | `REQUIRES_SETUP_DECISION` | Docker CLI is absent and daemon state is unresolved; Docker setup is not implied or authorized by S0. |

These class values are inputs to later planning, not winner-selection results.

## 6. Verdict derivation and limitations

The mechanically derived Verdict is:

```text
ACCEPT_WITH_LIMITATIONS
```

Accepted reasons:

1. core canonical host/source identity is established;
2. required Evidence integrity passed in a fresh-process report;
3. enough generic capability facts are decisive for fresh S1/S2 planning;
4. one material host observation remains `UNKNOWN`: `HOST-DOCKER-DAEMON`.

Accepted limitation:

```text
HOST-DOCKER-DAEMON: Docker CLI is absent, so an already-running daemon cannot be observed through the reviewed S0 interface.
```

A blocked generic capability class does not by itself reject S0. In particular, `CLASS-MICROVM-KVM=BLOCKED_BY_HOST` is an accepted host fact, not a contract failure.

## 7. Integrity and source-preservation evidence

The fresh-process `report --run-id arr-s0-20260808t210139618z-ff3979 --json` reopened the durable run and returned:

```text
integrity.ok = true
integrity.errors = []
```

The artifact manifest identity is:

```text
sha256:47fa64912e89ccb5ab8c7d9609f70aa78279bb7081467fb3354d1596c84de3cf
```

The repository was re-observed after the real run and remained exactly:

```text
HEAD = 8150eeddf3ed32485ac4c36b917e6a904ef6b683
TREE = c878641bf1da29dc5427aa4e426263b825f1dff3
STATUS = clean
```

A fresh post-probe `npm run verify` completed successfully with `POST_VERIFY_RC=0`.

## 8. Downstream planning consequences

Fresh S1/S2 planners may consume the immutable generic host facts above.

For S1 Agent Runtime planning:

- S0 does not select Pi, ACP, OpenCode or any other runtime;
- runtime provenance and current requirements must be refreshed independently;
- runtime-specific host prerequisites not proved by S0 remain explicit candidate-specific preflight requirements.

For S2 Execution Environment planning:

- local process isolation and generic Landlock classes are physically plausible;
- FUSE-backed COW is physically plausible;
- KVM-backed microVM execution is blocked under the observed host facts because `/dev/kvm` read/write open failed with `EACCES`;
- local container execution requires an explicit setup decision because Docker CLI is absent and daemon state is unresolved;
- no host mutation, installation, permission change or service start is authorized by this Evidence.

If later architecture research makes KVM, Docker or another currently unresolved/blocked capability materially desirable, the required setup/change must be governed separately and affected host facts must be re-observed before relying on them.

## 9. Non-claims

ARR-S0 acceptance does **not**:

- select or adopt an Agent Runtime;
- select or adopt a process sandbox, microVM, container or workspace substrate;
- install Docker or any candidate;
- change `/dev/kvm` permissions or host configuration;
- authorize ARR-S1 or ARR-S2 candidate execution by itself;
- authorize ARR-S2W or ARR-S3 execution;
- authorize revision-5 M02 production implementation;
- authorize production Worker dispatch;
- supersede `CAP-EXECUTION` or `MIS-002` by itself.

## 10. Next governed action

ARR-S0 terminates successfully with accepted `ACCEPT_WITH_LIMITATIONS` Evidence.

Compile two fresh Planner Packs from current authority and current upstream evidence:

```text
S1 Planner Pack
→ D-012 / D-014 / D-016
→ accepted ARR-S0 Evidence
→ refreshed current Agent Runtime provenance and requirements

S2 Planner Pack
→ D-013 / D-014 / D-016
→ accepted ARR-S0 Evidence
→ refreshed current process / microVM / local-environment provenance and requirements
```

S1 and S2 planning may proceed in parallel. Candidate execution remains separately gated and no named candidate is promoted by this acceptance report.

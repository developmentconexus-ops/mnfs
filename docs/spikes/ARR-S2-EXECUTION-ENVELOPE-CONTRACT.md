---
id: DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT
title: ARR-S2 Local Execution Envelope Conformance Contract
document_type: architecture_spike_contract
form: reference
authority: contract
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - DOC-ARR-SPIKE-GOVERNANCE
  - ADR-0015
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE
tracking_issue: 23
last_reviewed: 2026-08-08
---

# ARR-S2 Local Execution Envelope Conformance Contract

## 1. Purpose

ARR-S2 answers one bounded question:

> **Which concrete local Execution Envelope can safely run untrusted repository/toolchain work on the canonical WSL2 host while preserving MNFS authority, a private mutable workspace, deterministic Git result extraction, bounded resource/process consumption, crash/reconcile and low operational machinery?**

The contract compares candidate realizations against the property-based Execution Environment architecture in ADR-0015. A candidate may implement multiple properties internally, but product semantics remain the independent properties.

No candidate execution, installation or host remediation is authorized by this proposed contract. Real execution requires an accepted S2 contract, accepted S2 plan and later exact `GATE-S2` authority.

---

## 2. Accepted S0 host facts controlling eligibility

ARR-S2 consumes `ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE` without rewriting it.

Relevant accepted facts:

```text
CLASS-LOCAL-PROCESS-ISOLATION  PHYSICALLY_PLAUSIBLE
CLASS-LANDLOCK-ISOLATION       PHYSICALLY_PLAUSIBLE
CLASS-FUSE-COW                 PHYSICALLY_PLAUSIBLE
CLASS-MICROVM-KVM              BLOCKED_BY_HOST
CLASS-LOCAL-CONTAINER          REQUIRES_SETUP_DECISION

HOST-USERNS                    SUPPORTED
HOST-SECCOMP-CONFIG            SUPPORTED
HOST-LANDLOCK-CONFIG           SUPPORTED (specific ABI unproved)
HOST-BWRAP                      PRESENT
HOST-CGROUP-V2                 SUPPORTED
HOST-KVM-RW-OPEN               UNSUPPORTED (EACCES)
HOST-DOCKER-CLI                ABSENT
HOST-DOCKER-DAEMON             UNKNOWN
```

Consequences:

- process candidates are eligible for candidate-specific preflight;
- Sandlock is conditional because S0 did not prove Landlock ABI v6 or seccomp-user-notification behavior;
- KVM-backed microVM candidates are not executed under this contract on the current host;
- Docker/container setup is not introduced merely to create another candidate;
- `HOST-CGROUP-V2=SUPPORTED` proves that cgroup v2 is present/readable, **not** that the current user owns a writable delegated subtree or that the `cpu`, `memory` and `pids` controllers are already delegated for child resource control. S2 must prove that separately before any candidate payload.

---

## 3. Candidate set and frozen provenance

| Candidate | Frozen version | Frozen source identity | License | Disposition before candidate preflight |
|---|---:|---|---|---|
| Anthropic Sandbox Runtime | `@anthropic-ai/sandbox-runtime@0.0.71` | tag `v0.0.71` → `121c6ac86df7c958aaf953d27116e74848c31318` | Apache-2.0 | incumbent / eligible subject to exact prerequisites |
| nono | `v0.72.0` | tag `v0.72.0` → `4a2236d93c5ddbc318fcffa3e65c99ff9fce8935` | Apache-2.0 | challenger / eligible subject to exact prerequisites |
| Sandlock | `v0.8.6` | tag `v0.8.6` → `033f7e24e29047a17aeb6f2f0e8fd77c69978abb` | Apache-2.0 | conditional challenger |

Excluded from real execution under this contract:

```text
BoxLite / KVM microVM     BLOCKED_BY_HOST from accepted S0 Evidence
smolvm / KVM microVM      BLOCKED_BY_HOST from accepted S0 Evidence
Docker/local container    REQUIRES_SETUP_DECISION; setup not authorized here
```

If later evidence makes one of those excluded classes materially necessary, S2 returns to Decision/Replan before host modification or comparison expansion.

---

## 4. Common resource-governor preflight

Resource/process limits are a required Execution Environment property under ADR-0015. SRT, nono and Sandlock are therefore compared **inside one candidate-independent trusted cgroup-v2 resource governor**, rather than being allowed to PASS with unlimited CPU, memory or process creation merely because their filesystem/network isolation succeeds.

The frozen comparison budget is:

```text
cpu.max       = 100000 100000   # at most one CPU worth of bandwidth
memory.max    = 1073741824      # 1 GiB hard memory limit
pids.max      = 128             # finite tasks/threads budget
wallClockMs   = 120000          # trusted runner deadline
```

These are Spike comparison limits, not universal MNFS production budgets.

Before **any** S2 candidate receives the fixture, a trusted preflight must prove all of the following on the canonical host:

1. one already-delegated cgroup-v2 parent exists beneath the current user/session authority;
2. the parent already exposes `cpu`, `memory` and `pids` for child control;
3. the current trusted runner may create and remove a strictly run-scoped child cgroup there;
4. the child exposes writable `cpu.max`, `memory.max`, `pids.max` and `cgroup.procs`;
5. the exact frozen comparison values can be written and read back without changing parent/root controller configuration;
6. the candidate root PID can be placed in the child before untrusted payload execution;
7. the candidate workload cannot write the governor control files or migrate its process tree out of the run-owned cgroup through its exposed filesystem/capabilities;
8. trusted post-observation can read the configured limits, membership and relevant cgroup accounting/events.

S2 **must not** make a missing delegation appear by writing `cgroup.subtree_control`, changing systemd/user-manager configuration, using `sudo`, changing WSL configuration or performing any other persistent/broader host remediation. If the required delegated subtree/controllers are not already available, S2 terminates `BLOCKED` or `REPLAN_REQUIRED` before candidate execution.

The same logical resource budget and governor semantics apply to every executed candidate. A candidate-specific alternate resource-governor mechanism requires a formal contract revision and affected-comparison rerun.

Cleanup removes only the exact empty run-owned child cgroup after trusted identity/membership checks. Ambiguous membership, unexpected processes or inability to prove ownership fails closed and preserves Evidence instead of deleting broadly.

---

## 5. Candidate-specific preflight rules

Candidate-specific prerequisites are observed only after the common resource-governor preflight succeeds. A failed preflight does not trigger automatic host remediation.

### Anthropic Sandbox Runtime

Current upstream Linux requirements include Bubblewrap plus supporting tooling such as `socat` and `ripgrep`; upstream also documents Ubuntu 24.04+ user-namespace/AppArmor interactions that may require host configuration changes on some systems.

S2 must observe the actual canonical host. If the frozen SRT cannot initialize under current host policy without changing sysctl/AppArmor/host configuration, SRT is `BLOCKED` and no remediation is performed under S2.

### nono

Current upstream documentation explicitly supports Linux and Windows through WSL2. Preflight must still bind the exact frozen binary, architecture, required host primitives and policy profile used for the run.

### Sandlock

Frozen upstream requirements include Linux 6.12+ / Landlock ABI v6 for the full confinement feature set used by this comparison, plus seccomp user notification for several enforced behaviors.

Before Sandlock receives the fixture, preflight must positively prove:

```text
actual Landlock ABI >= 6
seccomp user notification usable in the candidate-required shape
frozen x86_64 binary/source identity
no root/cgroup/host-remediation requirement for the selected policy
```

Kernel version or `CONFIG_SECURITY_LANDLOCK=y` alone is insufficient.

If any required prerequisite remains `UNKNOWN`, Sandlock is not run and its candidate verdict is `BLOCKED` rather than guessed.

---

## 6. Trust and authority topology

S2 evaluates the untrusted execution side only. The intended topology is:

```text
trusted control side
MNFS + selected S1 runtime/provider auth
        ↓ explicit tool/process requests
trusted run-scoped cgroup-v2 resource governor
        ↓ finite CPU / memory / tasks / wall-clock
S2 Execution Envelope
        ↓
private mutable workspace + untrusted repository code + child processes
```

The envelope grants no Mission/Attempt/Claim/Gate authority. Technical sandbox policy cannot authorize external effects or provider credentials. Resource limits constrain execution but grant no product authority.

The fixture uses synthetic sentinels only. Real SSH keys, cloud credentials, browser profiles or operator secrets are never opened to prove denial.

---

## 7. Required deciding criteria

Every executed candidate is evaluated against the same criteria with values `PASS`, `FAIL`, `BLOCKED`, or `UNKNOWN`.

| ID | Criterion | Required proof |
|---|---|---|
| `S2-C01` | protected host read denial | child workload cannot read the synthetic host-read sentinel outside its permitted workspace |
| `S2-C02` | protected host write denial | child workload cannot modify/delete the synthetic host-write sentinel and trusted post-observation remains unchanged |
| `S2-C03` | raw credential unavailability | synthetic credential-shaped data outside the allowed workspace cannot be read by the untrusted workload |
| `S2-C04` | network posture | one controlled local endpoint is reachable only when allowed and a second controlled endpoint is denied by policy without relying on public Internet availability |
| `S2-C05` | child-process containment | restrictions apply to descendants and cannot be escaped by spawning another ordinary process |
| `S2-C06` | fail-closed initialization | invalid/unavailable required sandbox policy prevents payload execution rather than falling back to unrestricted host execution |
| `S2-C07` | exact mutable workspace semantics | candidate receives the exact base fixture, may mutate only its private execution view, and canonical base bytes remain unchanged |
| `S2-C08` | Git fidelity | executable bits, symlinks, deletes/adds/renames and deterministic tree identity survive the candidate workspace/result path |
| `S2-C09` | real toolchain workload | a deterministic dependency/typecheck/test workflow executes inside the candidate envelope with the frozen offline fixture/toolchain |
| `S2-C10` | crash/restart/reconcile | abrupt workload/supervisor interruption can be classified and a fresh trusted process can determine safe next action without guessing completion |
| `S2-C11` | result-tree extraction | trusted side can derive `baseCommitSha + resultTreeSha` from candidate output without accepting candidate narrative |
| `S2-C12` | safe cleanup/disposition | cleanup is path-scoped/idempotent and refuses ambiguous, dirty or identity-drifted resources |
| `S2-C13` | canonical WSL2 support | the frozen candidate runs on the accepted Ubuntu WSL2 host without undocumented host privilege escalation |
| `S2-C14` | bounded startup/repeat cost | startup, repeat-run and disk/workspace overhead are measured under identical fixture conditions; no universal threshold is invented |
| `S2-C15` | dependency admission / supported boundary | tested CLI/library/policy boundary, exact version/source/license, candidate-specific Upgrade Policy and Removal Conditions are recorded |
| `S2-C16` | machinery leverage | candidate eliminates a named environment/workspace/security machinery class or is simpler than maintaining that machinery ourselves |
| `S2-C17` | resource/process budget binding | before payload execution, trusted Evidence proves the candidate root and descendants are bound to the run-owned cgroup with exact finite `cpu.max`, `memory.max`, `pids.max` and trusted wall-clock deadline; the untrusted workload cannot relax/escape the governor, and missing binding fails closed |

A candidate that cannot establish a required security or resource-control property may not compensate with lower latency or better ergonomics.

`S2-C17` is mandatory for every executed candidate. `HOST-CGROUP-V2=SUPPORTED` alone cannot satisfy it. If the common governor cannot be established, no candidate may receive `PASS` and no selecting Decision may be produced.

A candidate is **not selection-eligible** until `S2-C15` and `S2-C17` both PASS. Before any selecting Decision, the final S2 report must therefore carry the D-014 dependency-admission fields:

```text
upgradePolicy:
  pinningRule
  upgradeTrigger
  mandatoryConformanceRerun
  rollbackRule

removalConditions:
  removeOrReplaceWhen
  authorityOrSecurityTrigger
  provenanceOrLicenseTrigger
  maintenanceTrigger
  replacementOrExitPath
```

The policy must be candidate-specific and actionable. Merely stating “keep dependencies updated” or “replace if needed” is insufficient. A future upgrade cannot float automatically into production authority; the Upgrade Policy must state which provenance changes require renewed conformance Evidence before use.

---

## 8. Fixed S2 fixture

All candidates consume the same logical fixture and trusted sentinels under the same frozen resource budget.

```text
trusted base Git fixture
  ├─ regular files
  ├─ executable file
  ├─ symlink
  ├─ deterministic Node/TypeScript/test workload
  └─ expected base commit/tree

outside candidate workspace
  ├─ synthetic protected-read sentinel
  ├─ synthetic protected-write sentinel
  ├─ synthetic credential-shaped sentinel
  ├─ controlled ALLOW TCP/HTTP endpoint
  └─ controlled DENY TCP/HTTP endpoint

trusted outer governor
  ├─ cpu.max = 100000 100000
  ├─ memory.max = 1073741824
  ├─ pids.max = 128
  └─ wallClockMs = 120000
```

The fixture is generated/staged beneath the Linux MNFS state root. It must not depend on the user's home repository checkout as mutable candidate state.

Candidate-native COW/private-root mechanisms may be used, but every candidate begins from the same logical base bytes and must produce an independently verified result tree.

The real toolchain workload must be offline/deterministic after fixture staging so candidate Verdict is not contaminated by package-registry availability.

---

## 9. Workspace and S2W applicability observation

ARR-S2 records whether the selected envelope already supplies an economically sufficient private mutable workspace/result-extraction mechanism.

Possible S2 outputs include:

```text
WORKSPACE_NATIVE_SUFFICIENT
WORKSPACE_EXTERNAL_REQUIRED
WORKSPACE_UNKNOWN
```

This observation does not automatically execute ARR-S2W.

Sandlock's built-in COW is specifically decision-relevant because a passing native COW/result path could make S2W unnecessary. SRT/nono may still win with a separately staged private workspace if total machinery remains lower.

Do not stack Treehouse + another COW manager merely because both exist.

---

## 10. Candidate verdict and selection rules

Each executed candidate receives:

```text
PASS
FAIL
BLOCKED
REJECT
```

- `PASS` — every required criterion, including `S2-C17`, is proved and Evidence integrity is valid.
- `FAIL` — a required criterion fails under the frozen contract.
- `BLOCKED` — a required common/candidate prerequisite or proof cannot be established without broadening authority or host setup.
- `REJECT` — unsafe host mutation, fail-open execution, resource-governor escape/tamper, sentinel escape/tamper, evidence tamper or contract violation occurs.

Selection is separate from conformance. A candidate may PASS and still lose if another PASS candidate eliminates materially more MNFS machinery with no weaker required property.

A final S2 Decision may select:

```text
one concrete local process envelope
one concrete local envelope + external workspace requirement
one concrete local envelope with native workspace sufficient
BLOCK / REPLAN local execution assumption
```

No `SELECT` output is valid unless the selected candidate has complete Upgrade Policy and Removal Conditions Evidence under `S2-C15` and finite resource/process binding under `S2-C17`.

No remote platform or production environment provider is selected by S2.

---

## 11. Comparison/early-stop discipline

Execution sequence after exact authority:

```text
0. common cgroup-v2 resource-governor preflight
1. SRT incumbent
2. nono challenger
3. Sandlock only if its candidate-specific preflight PASSes
```

If common resource-governor preflight fails, **no candidate executes** and S2 terminates `BLOCKED`/`REPLAN_REQUIRED` according to whether the missing delegation can be resolved without changing accepted architecture/authority.

Sandlock is not skipped merely because the first two candidates PASS if its eligible native COW/security model can still eliminate a material machinery class or change S2W applicability.

Conversely, excluded KVM/container candidates are not added merely to increase candidate count.

After all eligible decision-changing candidates are finalized, stop. Do not broaden the matrix for ecosystem curiosity.

---

## 12. Evidence integrity and non-claims

Every real S2 run binds:

- exact accepted S2 contract/hash and plan identity;
- exact MNFS commit/tree;
- accepted S0 Evidence identity;
- candidate version/source/binary digest/license;
- common resource-governor preflight and exact frozen resource budget;
- trusted cgroup membership/limit/accounting Evidence for each candidate;
- candidate-specific preflight result;
- fixed fixture/sentinel identities;
- criterion results;
- raw artifact refs/hashes;
- performance measurements and limitations;
- candidate-specific Upgrade Policy and Removal Conditions;
- candidate verdict and workspace-applicability observation.

S2 does **not** by itself:

- select or authorize an Agent Runtime;
- change KVM permissions;
- install/start Docker;
- enable cgroup controllers or change parent/root cgroup delegation/configuration;
- modify sysctl/AppArmor/systemd/WSL configuration;
- authorize S2W/S3 execution;
- authorize revision-5 M02 implementation;
- dispatch a production Worker.

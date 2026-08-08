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

> **Which concrete local Execution Envelope can safely run untrusted repository/toolchain work on the canonical WSL2 host while preserving MNFS authority, a private mutable workspace, deterministic Git result extraction, crash/reconcile and low operational machinery?**

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
- Docker/container setup is not introduced merely to create another candidate.

---

## 3. Candidate set and frozen provenance

| Candidate | Frozen version | Frozen source identity | License | Disposition before candidate preflight |
|---|---:|---|---|---|
| Anthropic Sandbox Runtime | `@anthropic-ai/sandbox-runtime@0.0.71` | tag `v0.0.71` → `121c6ac86df7c958aaf953d27116e74848c31318` | Apache-2.0 | incumbent / eligible subject to exact prerequisites |
| nono | `v0.72.0` | tag `v0.72.0` → `4a2236d93c5ddbc318fcffa3e65c99ff9fce8935` | upstream license as frozen by release provenance | challenger / eligible subject to exact prerequisites |
| Sandlock | `v0.8.6` | tag `v0.8.6` → `033f7e24e29047a17aeb6f2f0e8fd77c69978abb` | upstream license as frozen by release provenance | conditional challenger |

Excluded from real execution under this contract:

```text
BoxLite / KVM microVM     BLOCKED_BY_HOST from accepted S0 Evidence
smolvm / KVM microVM      BLOCKED_BY_HOST from accepted S0 Evidence
Docker/local container    REQUIRES_SETUP_DECISION; setup not authorized here
```

If later evidence makes one of those excluded classes materially necessary, S2 returns to Decision/Replan before host modification or comparison expansion.

---

## 4. Candidate-specific preflight rules

Candidate-specific prerequisites are observed before that candidate may receive the fixture. A failed preflight does not trigger automatic host remediation.

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

## 5. Trust and authority topology

S2 evaluates the untrusted execution side only. The intended topology is:

```text
trusted control side
MNFS + selected S1 runtime/provider auth
        ↓ explicit tool/process requests
S2 Execution Envelope
        ↓
private mutable workspace + untrusted repository code + child processes
```

The envelope grants no Mission/Attempt/Claim/Gate authority. Technical sandbox policy cannot authorize external effects or provider credentials.

The fixture uses synthetic sentinels only. Real SSH keys, cloud credentials, browser profiles or operator secrets are never opened to prove denial.

---

## 6. Required deciding criteria

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

A candidate that cannot establish a required security property may not compensate with lower latency or better ergonomics.

A candidate is **not selection-eligible** until `S2-C15` PASSes. Before any selecting Decision, the final S2 report must therefore carry the D-014 dependency-admission fields:

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

## 7. Fixed S2 fixture

All candidates consume the same logical fixture and trusted sentinels.

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
```

The fixture is generated/staged beneath the Linux MNFS state root. It must not depend on the user's home repository checkout as mutable candidate state.

Candidate-native COW/private-root mechanisms may be used, but every candidate begins from the same logical base bytes and must produce an independently verified result tree.

The real toolchain workload must be offline/deterministic after fixture staging so candidate Verdict is not contaminated by package-registry availability.

---

## 8. Workspace and S2W applicability observation

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

## 9. Candidate verdict and selection rules

Each executed candidate receives:

```text
PASS
FAIL
BLOCKED
REJECT
```

- `PASS` — every required criterion is proved and Evidence integrity is valid.
- `FAIL` — a required criterion fails under the frozen contract.
- `BLOCKED` — a required candidate prerequisite/proof cannot be established without broadening authority or host setup.
- `REJECT` — unsafe host mutation, fail-open execution, sentinel escape/tamper, evidence tamper or contract violation occurs.

Selection is separate from conformance. A candidate may PASS and still lose if another PASS candidate eliminates materially more MNFS machinery with no weaker required property.

A final S2 Decision may select:

```text
one concrete local process envelope
one concrete local envelope + external workspace requirement
one concrete local envelope with native workspace sufficient
BLOCK / REPLAN local execution assumption
```

No `SELECT` output is valid unless the selected candidate has complete Upgrade Policy and Removal Conditions Evidence under `S2-C15`.

No remote platform or production environment provider is selected by S2.

---

## 10. Comparison/early-stop discipline

Minimum execution order after preflight:

```text
1. SRT incumbent
2. nono challenger
3. Sandlock only if its candidate-specific preflight PASSes
```

Sandlock is not skipped merely because the first two candidates PASS if its eligible native COW/security model can still eliminate a material machinery class or change S2W applicability.

Conversely, excluded KVM/container candidates are not added merely to increase candidate count.

After all eligible decision-changing candidates are finalized, stop. Do not broaden the matrix for ecosystem curiosity.

---

## 11. Evidence integrity and non-claims

Every real S2 run binds:

- exact accepted S2 contract/hash and plan identity;
- exact MNFS commit/tree;
- accepted S0 Evidence identity;
- candidate version/source/binary digest/license;
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
- modify sysctl/AppArmor/WSL configuration;
- authorize S2W/S3 execution;
- authorize revision-5 M02 implementation;
- dispatch a production Worker.

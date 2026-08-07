---
id: PLAN-ARR-S0-HOST-CAPABILITY-PROBE
title: ARR-S0 Host Capability Probe Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: proposed
version: 0.2.0
owners:
  - developmentconexus-ops
related:
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-07
---

# ARR-S0 Host Capability Probe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and execute one bounded, evidence-producing host probe that records the physical capabilities of the canonical Ubuntu WSL2 machine needed to plan local execution-envelope experiments, without installing candidates, changing host configuration or selecting a winner.

**Architecture:** `ARR-S0` is an observation-first standalone spike harness under `spikes/arr-s0`. It executes only reviewed read-only or ephemeral namespace/device-open probes, records raw stdout/stderr and filesystem observations as hash-bound artifacts outside the repository, derives normalized host capabilities, and derives only **capability-class eligibility hints**. Exact eligibility of `nono`, Sandbox Runtime, BoxLite, smolvm, Sandlock, VFS/AgentFS or another candidate is decided later by S1/S2/S2W planners using accepted S0 host Evidence plus refreshed primary-source candidate requirements.

**Tech Stack:** Node.js 24.18.0+, ESM `.mjs`, `node:test`, Linux `/proc` and `/sys` observation, exact argv process execution with `shell: false`, Git CLI for read-only repository identity, canonical JSON, SHA-256, Ubuntu WSL2.

## Global Constraints

- Govern S0 by D-013, D-015, D-016 and `PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM`.
- S0 decides **host facts and broad capability-class eligibility only**. It does not decide that any named substrate is runnable, conformant, safe or selected.
- Exact named-candidate eligibility is recomputed by S1/S2/S2W from accepted S0 Evidence plus refreshed upstream requirements when those plans are frozen; S0 Evidence itself is never rewritten because an upstream project changes requirements.
- Do not install packages, enable KVM, edit `/etc/wsl.conf`, edit Windows `.wslconfig`, run `sudo`, change kernel/sysctl state, start/enable services or change Docker configuration.
- Do not run `bwrap`, `nono`, BoxLite, smolvm, VFS/AgentFS or candidate workloads as part of S0.
- Allowed active probes are limited to: exact read-only commands, opening a device node without issuing device ioctls, and an ephemeral `unshare` user-namespace smoke when the executable is already present. These probes must not persist host state.
- Probe raw outputs are Evidence; process text is never itself a Verdict. Normalize only after preserving exact bytes and metadata.
- Every external process uses exact argv, closed stdin, explicit cwd, explicit allowlisted environment, `shell: false`, timeout and bounded stdout/stderr.
- Never pass user HOME credentials, Git credential helpers, proxy variables or arbitrary host environment into probe subprocesses.
- S0 artifacts live under the Linux MNFS state root, never under the repository and never below `/mnt/*`.
- S0 must bind the run to exact repository commit/tree, WSL/kernel identity and plan/contract versions.
- Missing observation produces `UNKNOWN`, never invented PASS.
- Capability-class eligibility values are exactly: `PHYSICALLY_PLAUSIBLE`, `REQUIRES_SETUP_DECISION`, `BLOCKED_BY_HOST`, `UNKNOWN`.
- S0 overall verdict values are exactly: `ACCEPT`, `ACCEPT_WITH_LIMITATIONS`, `BLOCKED`, `REJECT`.
- `ACCEPT` means the required host Evidence is complete enough for fresh S1/S2 planners to determine named-candidate eligibility; it does **not** accept or select a candidate.
- `REJECT` is reserved for a material violation of the probe contract (unsafe mutation/fail-open/tampered Evidence), not for a host lacking KVM, Landlock, Docker or FUSE.
- No production Worker dispatch, M02 implementation, automatic merge or candidate adoption is authorized by S0.

---

## Frozen S0 contract

### Required normalized observations

```ts
export type ObservationState = 'PRESENT' | 'ABSENT' | 'SUPPORTED' | 'UNSUPPORTED' | 'UNKNOWN';
export type CapabilityClassEligibility =
  | 'PHYSICALLY_PLAUSIBLE'
  | 'REQUIRES_SETUP_DECISION'
  | 'BLOCKED_BY_HOST'
  | 'UNKNOWN';
export type S0Verdict = 'ACCEPT' | 'ACCEPT_WITH_LIMITATIONS' | 'BLOCKED' | 'REJECT';

export interface HostIdentity {
  readonly platform: 'linux';
  readonly isWsl2: boolean;
  readonly kernelRelease: string;
  readonly distroId: string;
  readonly distroVersion: string;
  readonly architecture: string;
  readonly nodeVersion: string;
  readonly gitVersion: string;
}

export interface CapabilityObservation {
  readonly id: string;
  readonly state: ObservationState;
  readonly rationale: string;
  readonly artifactRefs: readonly string[];
}

export interface CapabilityClassRecord {
  readonly classId: string;
  readonly eligibility: CapabilityClassEligibility;
  readonly reasons: readonly string[];
  readonly relevantCapabilities: readonly string[];
}
```

### Required capability IDs

```text
HOST-WSL2
HOST-LINUX-FS
HOST-CPU-VIRT
HOST-KVM-DEVICE
HOST-KVM-RW-OPEN
HOST-USERNS
HOST-SECCOMP-CONFIG
HOST-LANDLOCK-CONFIG
HOST-FUSE-DEVICE
HOST-FUSE-TOOLS
HOST-CGROUP-V2
HOST-DOCKER-CLI
HOST-DOCKER-DAEMON
HOST-BWRAP
HOST-GIT-READONLY
```

### Capability-class IDs

S0 may derive only these coarse host classes:

```text
CLASS-LOCAL-PROCESS-ISOLATION
CLASS-LANDLOCK-ISOLATION
CLASS-MICROVM-KVM
CLASS-FUSE-COW
CLASS-LOCAL-CONTAINER
```

The class mapping intentionally avoids named project requirements.

Examples:

```text
CLASS-MICROVM-KVM
→ relevant: HOST-WSL2, HOST-CPU-VIRT, HOST-KVM-DEVICE, HOST-KVM-RW-OPEN

CLASS-FUSE-COW
→ relevant: HOST-WSL2, HOST-FUSE-DEVICE, HOST-FUSE-TOOLS

CLASS-LANDLOCK-ISOLATION
→ relevant: HOST-WSL2, HOST-LANDLOCK-CONFIG, HOST-SECCOMP-CONFIG

CLASS-LOCAL-CONTAINER
→ relevant: HOST-WSL2, HOST-DOCKER-CLI, HOST-DOCKER-DAEMON
```

`PHYSICALLY_PLAUSIBLE` is deliberately weaker than “candidate eligible”. For example, a project may require a specific Landlock ABI, seccomp-notify behavior or kernel feature that S0 does not actively prove. The S2 planner must refresh that project's current primary documentation and map its exact requirements onto the immutable host observations before authorizing a candidate run.

---

### Task 1: S0 package, runner and strict state-root/path contract

**Files:**
- Create: `spikes/arr-s0/README.md`
- Create: `spikes/arr-s0/src/paths.mjs`
- Create: `spikes/arr-s0/src/process.mjs`
- Create: `spikes/arr-s0/tests/paths.test.mjs`
- Create: `spikes/arr-s0/tests/process.test.mjs`
- Create: `scripts/run-arr-s0-tests.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `resolveS0StateRoot()`, `resolveS0RunRoot(runId)`, `requireRunId()`, `runProbeCommand(spec)`.
- Consumes: no S0 candidate-specific code.

**Coverage:** Linux-owned artifact location, exact subprocess boundary, no host-env inheritance.

- [ ] **Step 1: Write failing path tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { requireRunId, resolveS0RunRoot } from '../src/paths.mjs';

test('accepts only canonical ARR-S0 run ids', () => {
  assert.equal(requireRunId('arr-s0-20260807t120000000z-a1b2c3'), 'arr-s0-20260807t120000000z-a1b2c3');
  assert.throws(() => requireRunId('../escape'));
  assert.throws(() => requireRunId('ARR-S0-UPPER'));
});

test('run root stays under a Linux-owned MNFS state root', async () => {
  const root = await resolveS0RunRoot('arr-s0-20260807t120000000z-a1b2c3', {
    stateRoot: '/home/example/.local/state/mnfs',
  });
  assert.equal(root, '/home/example/.local/state/mnfs/spikes/arr-s0/arr-s0-20260807t120000000z-a1b2c3');
});
```

- [ ] **Step 2: Run RED**

```bash
node --test spikes/arr-s0/tests/paths.test.mjs
```

Expected: module-not-found for `src/paths.mjs`.

- [ ] **Step 3: Implement strict paths**

Rules:

```text
run id regex: ^arr-s0-[0-9]{8}t[0-9]{9}z-[a-f0-9]{6}$
default state root: ${XDG_STATE_HOME}/mnfs when absolute Linux-owned,
                    otherwise ${HOME}/.local/state/mnfs
reject relative roots
reject roots resolving below /mnt
reject symlink escape of existing parent components
```

Use the same Linux-owned path principles already exercised by AS-02/TC-01 rather than creating a Windows-compatible branch.

- [ ] **Step 4: Write failing process-runner tests**

Create a deterministic temporary Node fixture inside the test temp directory. It must expose argv/cwd/env and a descendant-process mode so the tests exercise real process behavior rather than a mock.

Required tests:

```text
probe runner uses exact argv, closed stdin and only explicit environment
probe runner rejects output above the exact byte limit
probe runner terminates the complete descendant process group on timeout
spawn failure returns a typed probe error and never falls back to a shell
```

- [ ] **Step 5: Implement `runProbeCommand`**

Input shape:

```js
{
  argv: ['/usr/bin/uname', '-r'],
  cwd: '/home/example/src/mnfs',
  env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' },
  timeoutMs: 5000,
  outputLimitBytes: 64 * 1024,
}
```

No shell, no arbitrary `process.env`, stdin closed, stdout/stderr returned as `Buffer` plus exit/signal/timing metadata.

- [ ] **Step 6: Add root scripts**

`package.json`:

```json
"test:arr-s0": "node scripts/run-arr-s0-tests.mjs",
"arr-s0": "node spikes/arr-s0/src/cli.mjs"
```

Do not add `test:arr-s0` to root `verify` until the harness tests are complete in Task 9.

- [ ] **Step 7: Verify**

```bash
npm run test:arr-s0
```

- [ ] **Step 8: Commit**

```bash
git add spikes/arr-s0 scripts/run-arr-s0-tests.mjs package.json
git commit -m "spike: establish ARR-S0 trusted probe primitives"
```

---

### Task 2: Immutable artifact writer and hash-bound run manifest

**Files:**
- Create: `spikes/arr-s0/src/canonical-json.mjs`
- Create: `spikes/arr-s0/src/artifacts.mjs`
- Create: `spikes/arr-s0/src/model.mjs`
- Create: `spikes/arr-s0/tests/artifacts.test.mjs`
- Create: `spikes/arr-s0/tests/model.test.mjs`

**Interfaces:**
- Produces: `writeRawArtifact()`, `writeCanonicalJsonArtifact()`, `sha256Bytes()`, `createInitialRunState()`, strict model validators.

- [ ] **Step 1: Write RED tests for durable immutable artifact publication**

Require:

- raw stdout/stderr bytes preserved exactly;
- SHA-256 recorded over exact bytes;
- atomic temp-write/fsync/rename/directory-fsync ordering;
- final file mode `0600` for control metadata and raw artifacts;
- existing mismatched final artifact rejected, never overwritten silently;
- symlink destination rejected.

- [ ] **Step 2: Run RED**

```bash
node --test spikes/arr-s0/tests/artifacts.test.mjs
```

- [ ] **Step 3: Implement canonical JSON + artifacts**

Canonical JSON sorts object keys recursively and preserves array order. Artifact metadata shape:

```js
{
  path: 'raw/host-kernel/stdout.bin',
  sha256: 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  sizeBytes: 123,
}
```

- [ ] **Step 4: Define strict run-state model**

State phases:

```text
CREATED
OBSERVING
OBSERVED
FINALIZED
```

Do not add `PASS` as a lifecycle phase; Verdict is derived separately.

- [ ] **Step 5: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: persist hash-bound ARR-S0 evidence"
```

---

### Task 3: Canonical host and repository identity probes

**Files:**
- Create: `spikes/arr-s0/src/probes/host-identity.mjs`
- Create: `spikes/arr-s0/src/probes/repository.mjs`
- Create: `spikes/arr-s0/tests/host-identity.test.mjs`
- Create: `spikes/arr-s0/tests/repository.test.mjs`

**Interfaces:**
- Produces normalized `HostIdentity`, `HOST-WSL2`, `HOST-LINUX-FS`, `HOST-GIT-READONLY` observations.

- [ ] **Step 1: Write fixture-based RED tests**

Host parsing fixtures cover:

```text
/proc/sys/kernel/osrelease = 6.18.33.2-microsoft-standard-WSL2
/etc/os-release with ID=ubuntu and VERSION_ID=26.04
uname -m = x86_64
```

Non-WSL2 produces `HOST-WSL2=UNSUPPORTED`; report generation still completes so the host mismatch is explicit Evidence.

- [ ] **Step 2: Implement exact host commands**

Allowed commands:

```text
/usr/bin/uname -m
/usr/bin/git --version
/usr/bin/stat -f -c %T <repo-root>
/usr/bin/git rev-parse HEAD
/usr/bin/git rev-parse HEAD^{tree}
/usr/bin/git status --porcelain=v1 --untracked-files=normal
```

Use `process.version` for Node identity instead of spawning another Node. Read `/proc/sys/kernel/osrelease` and `/etc/os-release` directly with bounded reads rather than shell pipelines.

- [ ] **Step 3: Repository safety rule**

S0 real run requires a clean canonical checkout. Dirty checkout produces overall `BLOCKED` before capability probing because the run Evidence must bind one exact source state.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: observe canonical ARR-S0 host identity"
```

---

### Task 4: CPU virtualization and KVM probes without candidate execution

**Files:**
- Create: `spikes/arr-s0/src/probes/kvm.mjs`
- Create: `spikes/arr-s0/tests/kvm.test.mjs`

**Interfaces:**
- Produces: `HOST-CPU-VIRT`, `HOST-KVM-DEVICE`, `HOST-KVM-RW-OPEN`.

- [ ] **Step 1: Write RED tests from synthetic `/proc/cpuinfo` and device-stat fixtures**

Rules:

```text
vmx or svm CPU flag → HOST-CPU-VIRT=SUPPORTED
no flag → UNKNOWN rather than UNSUPPORTED when WSL virtualization masking could be involved
/dev/kvm absent → HOST-KVM-DEVICE=ABSENT
/dev/kvm present but not char device → probe integrity violation
```

- [ ] **Step 2: Implement device observation**

Use `lstat('/dev/kvm')`. If it is a character device, attempt:

```js
await open('/dev/kvm', constants.O_RDWR)
```

Immediately close the descriptor. Do not issue `ioctl`, create a VM or load modules.

Map permission failure to `HOST-KVM-RW-OPEN=UNSUPPORTED` with errno Evidence; map other inconclusive errors to `UNKNOWN`. The implementation must use only flags supported by Node's documented `fs.open` surface rather than inventing a non-portable constant.

- [ ] **Step 3: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: observe KVM host capability without launching VMs"
```

---

### Task 5: User namespace, seccomp, Landlock, FUSE and cgroup probes

**Files:**
- Create: `spikes/arr-s0/src/probes/kernel-security.mjs`
- Create: `spikes/arr-s0/src/probes/fuse.mjs`
- Create: `spikes/arr-s0/src/probes/cgroup.mjs`
- Create: `spikes/arr-s0/tests/kernel-security.test.mjs`
- Create: `spikes/arr-s0/tests/fuse.test.mjs`
- Create: `spikes/arr-s0/tests/cgroup.test.mjs`

**Interfaces:**
- Produces: `HOST-USERNS`, `HOST-SECCOMP-CONFIG`, `HOST-LANDLOCK-CONFIG`, `HOST-FUSE-DEVICE`, `HOST-FUSE-TOOLS`, `HOST-CGROUP-V2`.

- [ ] **Step 1: Write fixture-based RED tests for config discovery/parsing**

Try config sources in order:

```text
/proc/config.gz
/boot/config-<exact kernel release>
```

If neither is readable, configuration-backed observations become `UNKNOWN`; kernel version alone must not become `SUPPORTED`.

Parse only exact keys:

```text
CONFIG_SECCOMP=y
CONFIG_SECCOMP_FILTER=y
CONFIG_SECURITY_LANDLOCK=y
CONFIG_USER_NS=y
CONFIG_FUSE_FS=y
```

When `/proc/config.gz` is used, decompress with Node's `zlib` rather than spawning a shell decompressor.

- [ ] **Step 2: Add bounded userns active probe when `/usr/bin/unshare` exists**

Exact argv:

```text
/usr/bin/unshare --user --map-root-user /usr/bin/id -u
```

Environment only `PATH=/usr/bin:/bin`, `LANG=C`, `LC_ALL=C`. Success with stdout `0` → `HOST-USERNS=SUPPORTED`. Expected permission/unsupported errors → `UNSUPPORTED`; missing executable with supporting kernel config → `UNKNOWN` because tool absence is not kernel absence.

- [ ] **Step 3: Observe FUSE**

Check `/dev/fuse` character-device presence and whether current process can open it read/write, then close immediately. Observe `fusermount3 --version` only if exact executable resolves under `/usr/bin` or `/bin`; otherwise `HOST-FUSE-TOOLS=ABSENT`.

- [ ] **Step 4: Observe cgroup v2**

`/sys/fs/cgroup/cgroup.controllers` readable and filesystem type `cgroup2fs` → `SUPPORTED`; otherwise classify exactly from Evidence.

- [ ] **Step 5: Explicit limitation**

S0 does not claim specific Landlock ABI or seccomp-user-notification behavior unless a later contract revision adds a separately reviewed active probe. Named candidate planners must treat those project-specific capabilities as unresolved and refresh upstream requirements.

- [ ] **Step 6: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: observe local kernel isolation capabilities"
```

---

### Task 6: Optional Docker and Bubblewrap readiness observations

**Files:**
- Create: `spikes/arr-s0/src/probes/tools.mjs`
- Create: `spikes/arr-s0/tests/tools.test.mjs`

**Interfaces:**
- Produces: `HOST-DOCKER-CLI`, `HOST-DOCKER-DAEMON`, `HOST-BWRAP`.

- [ ] **Step 1: Write RED tests for exact executable resolution**

Never search arbitrary PATH inherited from the user. Resolve only accepted fixed directories `/usr/bin` and `/bin`.

- [ ] **Step 2: Observe Docker without mutation**

If `/usr/bin/docker` exists:

```text
/usr/bin/docker --version
/usr/bin/docker version --format {{json .Server.Version}}
```

The second command may contact an already-running daemon but must not create containers/images/networks. Daemon unavailability → `HOST-DOCKER-DAEMON=ABSENT` or `UNKNOWN` based on Evidence, not `REJECT`.

- [ ] **Step 3: Observe Bubblewrap version only**

```text
/usr/bin/bwrap --version
```

Do not launch a sandbox in S0.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: observe optional local sandbox prerequisites"
```

---

### Task 7: Capability-class eligibility derivation

**Files:**
- Create: `spikes/arr-s0/src/class-eligibility.mjs`
- Create: `spikes/arr-s0/tests/class-eligibility.test.mjs`

**Interfaces:**
- Consumes generic host capability observations only.
- Produces deterministic `CapabilityClassRecord[]`.

- [ ] **Step 1: Write table-driven RED tests**

Examples:

```js
assert.equal(classEligibility('CLASS-MICROVM-KVM', allKvmSupported).eligibility, 'PHYSICALLY_PLAUSIBLE');
assert.equal(classEligibility('CLASS-MICROVM-KVM', kvmMissing).eligibility, 'BLOCKED_BY_HOST');
assert.equal(classEligibility('CLASS-LANDLOCK-ISOLATION', landlockUnknown).eligibility, 'UNKNOWN');
assert.equal(classEligibility('CLASS-FUSE-COW', fuseDeviceSupportedButToolAbsent).eligibility, 'REQUIRES_SETUP_DECISION');
```

- [ ] **Step 2: Implement one declarative class mapping**

The mapping may contain only the class IDs frozen above and generic host capability IDs. Named projects are prohibited in this module.

- [ ] **Step 3: Add rationale rules**

Every result names the exact missing/unknown capability IDs and reiterates that `PHYSICALLY_PLAUSIBLE` does not prove a named candidate's current prerequisites.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: derive generic host capability classes"
```

---

### Task 8: Mechanical S0 verdict and tamper detection

**Files:**
- Create: `spikes/arr-s0/src/verdict.mjs`
- Create: `spikes/arr-s0/tests/verdict.test.mjs`

**Interfaces:**
- Produces overall S0 Verdict from Evidence completeness/integrity, not from named-candidate popularity.

**Verdict rules:**

```text
REJECT
→ unsafe mutation detected, Evidence tamper/hash mismatch,
  fail-open command behavior, escaped artifact root, or contract violation

BLOCKED
→ canonical WSL2/repository identity cannot be established,
  checkout not clean, or core probe Evidence cannot be collected at all

ACCEPT_WITH_LIMITATIONS
→ core host identity is proven and S1/S2 planning can continue,
  but one or more currently material capability-class facts remain UNKNOWN

ACCEPT
→ all required S0 observations are decisive enough for fresh S1/S2 planners
  to map current named-candidate prerequisites onto the host Evidence
```

A host without KVM can still produce `ACCEPT` when KVM absence is decisively proven; `CLASS-MICROVM-KVM` becomes `BLOCKED_BY_HOST`.

- [ ] **Step 1: Write RED verdict matrix**

Cover every branch above and assert that model/self-assessment text cannot change the result.

- [ ] **Step 2: Implement pure verdict derivation**

No filesystem/process calls inside `deriveS0Verdict()`.

- [ ] **Step 3: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: derive ARR-S0 verdict mechanically"
```

---

### Task 9: S0 lifecycle service, CLI and deterministic report

**Files:**
- Create: `spikes/arr-s0/src/service.mjs`
- Create: `spikes/arr-s0/src/report.mjs`
- Create: `spikes/arr-s0/src/cli.mjs`
- Create: `spikes/arr-s0/bin/arr-s0.mjs`
- Create: `spikes/arr-s0/tests/service.test.mjs`
- Create: `spikes/arr-s0/tests/cli.test.mjs`
- Create: `spikes/arr-s0/tests/report.test.mjs`
- Modify: `package.json`

**Interfaces:**

CLI forms exactly:

```text
npm run arr-s0 -- preflight --json
npm run arr-s0 -- run --json
npm run arr-s0 -- report --run-id RUN_ID --json
```

`RUN_ID` is a metavariable representing a value previously emitted by the machine-readable `run` command, not human-authored plan content.

No `setup`, `install`, `enable`, `repair` or `cleanup-host` command exists.

- [ ] **Step 1: Write failing parser tests**

Reject:

- duplicate/unknown flags;
- positional extras;
- noncanonical run IDs;
- any command that could mutate host configuration.

- [ ] **Step 2: Implement `preflight`**

`preflight` checks only whether the probe itself can run safely:

```text
canonical WSL2
Linux-owned repo/state root
clean checkout
Node version
required read permissions
no artifact-root escape
```

It does not execute the complete capability suite.

- [ ] **Step 3: Implement `run` lifecycle**

Order:

```text
create initial durable run state
→ record exact source/plan/contract identity
→ move OBSERVING
→ collect raw host/repo observations
→ collect capability probes
→ derive capability-class eligibility
→ derive Verdict
→ write final manifest/report inputs
→ verify every artifact hash
→ move FINALIZED
```

If interrupted after initial state, `report` identifies incomplete state and never invents a Verdict.

- [ ] **Step 4: Implement deterministic report**

Human + JSON report includes:

```text
run id
source commit/tree
host identity
capability table
capability-class table
Verdict
limitations
artifact manifest hash
next governed action
```

No secret/environment dump and no named-candidate acceptance claim.

- [ ] **Step 5: Add S0 tests to root verification**

After all S0 tests pass, change `verify` to include `npm run test:arr-s0` before docs check.

- [ ] **Step 6: Verify**

```bash
npm run verify
```

Expected: all existing product/AS-02/TC-01/docs tests plus S0 deterministic tests PASS.

- [ ] **Step 7: Commit**

```bash
git add spikes/arr-s0 scripts/run-arr-s0-tests.mjs package.json
git commit -m "spike: complete deterministic ARR-S0 harness"
```

---

### Task 10: S0 documentation contract and execution README

**Files:**
- Create: `docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md`
- Modify: `spikes/arr-s0/README.md`
- Modify: `docs/DOCUMENTATION-MAP.md`
- Modify: `docs/tracking/STATUS.md`
- Modify: `scripts/test-documentation-tooling.mjs`

**Interfaces:**
- Produces immutable human-readable contract corresponding to harness constants and explains exactly what the real run does/does not do.

- [ ] **Step 1: Document every capability/class/verdict rule from the frozen plan**

The contract version becomes `1.0.0` only through Operator approval. Before approval it remains proposed and the real run is prohibited.

- [ ] **Step 2: Add contract/harness consistency tests**

Documentation tooling asserts that every required host capability ID and capability-class ID implemented by the harness appears in the contract, and vice versa. Named candidate IDs are deliberately absent from this invariant.

- [ ] **Step 3: Verify**

```bash
npm run verify
```

- [ ] **Step 4: Commit**

```bash
git add docs/spikes spikes/arr-s0/README.md docs/DOCUMENTATION-MAP.md docs/tracking/STATUS.md scripts/test-documentation-tooling.mjs
git commit -m "docs: freeze ARR-S0 host capability contract"
```

---

### Task 11: Independent deterministic review before real host execution

**Files:**
- No product changes expected; Findings may require a separate Correction task/commit.

**Reviewer Pack:**

- S0 contract/plan;
- diff since S0 implementation base;
- deterministic `npm run verify` Evidence;
- no prior Writer reasoning required.

**Review focus:**

```text
any host mutation path?
any shell or inherited env?
any credential/proxy leak?
any probe whose text directly determines Verdict?
any false unsupported/supported inference?
any named-candidate requirement leaked into the host-fact layer?
any artifact path escape/tamper gap?
any command beyond S0 authority?
```

- [ ] **Step 1: Fresh reviewer inspects code and tests**
- [ ] **Step 2: Classify Findings**
- [ ] **Step 3: Apply corrections through a separate Writer cycle if needed**
- [ ] **Step 4: Re-run full verification after every accepted correction**

**Gate:** zero unresolved Critical/Important Findings before real run authorization.

---

### Task 12: Canonical WSL2 real run — separately authorized operation

**Files written by operation:** Linux state-root artifacts only; repository must remain Git-clean. The later acceptance-document promotion is an explicitly reviewed documentation change after the probe finishes.

**Exact preconditions:**

```text
approved S0 plan version/hash
approved S0 contract version/hash
exact canonical main/base commit named by Operator authorization
npm ci completed from committed lockfile
npm run verify PASS on that exact commit
mnfs doctor READY
S0 preflight READY
working tree clean
```

- [ ] **Step 1: Capture pre-run repository identity**

```bash
BASE_HEAD="$(git rev-parse HEAD)"
BASE_TREE="$(git rev-parse 'HEAD^{tree}')"
BASE_STATUS="$(git status --porcelain=v1 --untracked-files=normal)"
printf 'HEAD=%s\nTREE=%s\n' "$BASE_HEAD" "$BASE_TREE"
test -z "$BASE_STATUS"
```

Expected: exact authorized commit/tree and empty status.

- [ ] **Step 2: Run S0 once and retain the machine output**

```bash
RUN_JSON="$(npm run --silent arr-s0 -- run --json)"
printf '%s\n' "$RUN_JSON"
RUN_ID="$(node -e 'const value=JSON.parse(process.argv[1]); if(typeof value.runId!=="string") process.exit(2); process.stdout.write(value.runId)' "$RUN_JSON")"
test -n "$RUN_ID"
```

Promote/capture the command stdout under the S0 Evidence root. No automatic retry after a partial/inconclusive run; inspect durable run state first.

- [ ] **Step 3: Re-open report in a fresh process using the emitted identity**

```bash
npm run --silent arr-s0 -- report --run-id "$RUN_ID" --json
```

The run identity is machine output from Step 2; it is never guessed or recomputed from time.

- [ ] **Step 4: Verify repository remained unchanged**

```bash
test "$(git rev-parse HEAD)" = "$BASE_HEAD"
test "$(git rev-parse 'HEAD^{tree}')" = "$BASE_TREE"
test -z "$(git status --porcelain=v1 --untracked-files=normal)"
```

- [ ] **Step 5: Run fresh full verification after the real probe**

```bash
npm run verify
```

- [ ] **Step 6: Promote acceptance Evidence at the exact canonical path**

Create:

```text
docs/acceptance/2026-08-07-arr-s0-host-capability-probe.md
```

It contains only normalized, secret-free Evidence references/hashes and the mechanically derived Verdict. Raw probe bytes remain in content-addressed/state artifacts and are referenced by hash.

- [ ] **Step 7: Independent Evidence review**

A fresh Reviewer verifies artifact hashes, contract version, source identity and Verdict derivation. It then maps the accepted generic host facts into the input pack for refreshed S1/S2 candidate research; no named candidate is promoted by S0 itself.

**Termination:**

- `SUCCESS`: accepted S0 host Evidence exists, the repository remained unchanged during the probe, and fresh S1/S2 planners can consume the facts.
- `BLOCKED`: host/probe Evidence is incomplete but no contract violation occurred; do not modify host automatically.
- `REJECT`: unsafe mutation/fail-open/tamper or contract violation; stop ARR program and investigate.
- `REPLAN_REQUIRED`: S0 contract itself is materially incapable of producing the host facts required by S1/S2.

---

## S0 approval and execution gates

Plan review and S0 execution remain separate.

```text
GATE-S0-PLAN
→ Operator accepts this plan and the S0 contract design
→ no host probing yet

GATE-S0-IMPLEMENT
→ optional separate Operator authorization for Tasks 1-11 only
→ binds accepted plan version + exact base SHA
→ builds/tests the probe but performs no full host run

GATE-S0-EXECUTE
→ Operator authorization must bind:
   - PLAN-ARR-S0-HOST-CAPABILITY-PROBE accepted version
   - ARR-S0 contract accepted version/hash
   - exact canonical base commit SHA
   - exact deterministic verification Evidence
→ authorizes Task 12 real probe only within this plan's boundaries
```

No authorization is inferred from plan acceptance, S0 harness implementation or prior AS-02/TC-01 host execution.

---

## Self-review checklist

- [ ] S0 records host facts and coarse classes; it cannot declare a named candidate eligible/accepted.
- [ ] Named candidate requirements are refreshed in S1/S2/S2W rather than embedded in S0 Evidence semantics.
- [ ] No `sudo`, install, WSL config, sysctl, service-start or candidate execution path exists.
- [ ] KVM probe opens/closes device only; no ioctl/VM creation.
- [ ] Userns active probe is ephemeral and exact-argv.
- [ ] Kernel config absence maps to UNKNOWN, not UNSUPPORTED.
- [ ] Candidate package absence is not treated as host incapability.
- [ ] Specific Landlock ABI/seccomp-notify support is not invented from generic config or kernel version.
- [ ] A host lacking KVM can still yield ACCEPT with `CLASS-MICROVM-KVM=BLOCKED_BY_HOST`.
- [ ] Raw outputs are preserved and hashed before normalization.
- [ ] Verdict is pure/mechanical and cannot be changed by model narrative.
- [ ] Repository is clean before/after the real probe; Evidence-doc promotion is separately reviewed afterward.
- [ ] Full existing MNFS verification remains green after deterministic S0 harness tests are added.
- [ ] No M02/runtime/environment adoption authority is implied.

## Execution handoff

After accepted real S0 Evidence, compile two fresh Planner Packs in parallel if resource/authority allows:

```text
S1 Planner Pack
→ D-012/D-014/D-016
→ accepted S0 host Evidence
→ refreshed current Agent Runtime provenance/requirements

S2 Planner Pack
→ D-013/D-014/D-016
→ accepted S0 host Evidence
→ refreshed current process/microVM candidate provenance/requirements
```

Each Planner maps named candidate requirements onto the immutable S0 host facts, records any still-unproved prerequisite as a candidate-specific preflight requirement, and writes a separate candidate-pinned plan. Neither inherits assumptions from this conversation or from the other Planner beyond accepted shared Evidence.

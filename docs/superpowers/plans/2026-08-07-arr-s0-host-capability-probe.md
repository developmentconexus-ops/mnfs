---
id: PLAN-ARR-S0-HOST-CAPABILITY-PROBE
title: ARR-S0 Host Capability Probe Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: proposed
version: 0.1.0
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

**Goal:** Build and execute one bounded, evidence-producing host probe that determines which local execution-envelope hypotheses are physically supportable on the canonical Ubuntu WSL2 machine without installing candidates, changing host configuration or selecting a winner.

**Architecture:** `ARR-S0` is an observation-first standalone spike harness under `spikes/arr-s0`. It executes only reviewed read-only or ephemeral namespace/device-open probes, records raw stdout/stderr and filesystem observations as hash-bound artifacts outside the repository, derives normalized host capabilities, and classifies candidate eligibility mechanically. The harness never modifies WSL configuration, installs packages, launches candidate runtimes, writes the repository, or treats absence of an optional tool as proof that the kernel capability is absent.

**Tech Stack:** Node.js 24.18.0+, ESM `.mjs`, `node:test`, Linux `/proc` and `/sys` observation, exact argv process execution with `shell: false`, Git CLI for read-only repository identity, canonical JSON, SHA-256, Ubuntu WSL2.

## Global Constraints

- Govern S0 by D-013, D-015, D-016 and `PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM`.
- S0 decides **host eligibility only**. It does not select `nono`, Sandbox Runtime, BoxLite, smolvm, Sandlock, VFS/AgentFS or any other substrate.
- Do not install packages, enable KVM, edit `/etc/wsl.conf`, edit Windows `.wslconfig`, run `sudo`, change kernel/sysctl state, start/enable services or change Docker configuration.
- Do not run `bwrap`, `nono`, BoxLite, smolvm, VFS/AgentFS or candidate workloads as part of S0.
- Allowed active probes are limited to: exact read-only commands, opening a device node read/write without issuing device ioctls, and an ephemeral `unshare` user-namespace smoke when the executable is already present. These probes must not persist host state.
- Probe raw outputs are Evidence; process text is never itself a Verdict. Normalize only after preserving exact bytes and metadata.
- Every external process uses exact argv, closed stdin, explicit cwd, explicit allowlisted environment, `shell: false`, timeout and bounded stdout/stderr.
- Never pass user HOME credentials, Git credential helpers, proxy variables or arbitrary host environment into probe subprocesses.
- S0 artifacts live under the Linux MNFS state root, never under the repository and never below `/mnt/*`.
- S0 must bind the run to exact repository commit/tree, WSL/kernel identity and plan/contract versions.
- Missing observation produces `UNKNOWN` or `REQUIRES_SETUP`, never invented PASS.
- Candidate eligibility values are exactly: `ELIGIBLE_FOR_SPIKE`, `REQUIRES_SETUP_DECISION`, `BLOCKED_BY_HOST`, `UNKNOWN`.
- S0 overall verdict values are exactly: `ACCEPT`, `ACCEPT_WITH_LIMITATIONS`, `BLOCKED`, `REJECT`.
- `ACCEPT` means the required host evidence is complete enough to plan S1/S2; it does **not** mean any candidate is accepted.
- `REJECT` is reserved for a material violation of the probe contract (unsafe mutation/fail-open/tampered Evidence), not for a host lacking KVM or FUSE.
- No production Worker dispatch, M02 implementation, automatic merge or candidate adoption is authorized by S0.

---

## Frozen S0 contract

### Required normalized observations

```ts
export type ObservationState = 'PRESENT' | 'ABSENT' | 'SUPPORTED' | 'UNSUPPORTED' | 'UNKNOWN';
export type CandidateEligibility =
  | 'ELIGIBLE_FOR_SPIKE'
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

export interface CandidateEligibilityRecord {
  readonly candidateId: string;
  readonly eligibility: CandidateEligibility;
  readonly reasons: readonly string[];
  readonly requiredCapabilities: readonly string[];
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

### Candidate eligibility mapping

The S0 contract evaluates at least:

```text
anthropic-sandbox-runtime
nono
sandlock
boxlite
smol-machines-smolvm
vfs-agentfs-cow
```

The mapping is deliberately host-property-based. Installation state of the candidate itself is not a required capability.

Examples:

```text
boxlite:
  requires HOST-WSL2, HOST-CPU-VIRT, HOST-KVM-DEVICE, HOST-KVM-RW-OPEN

smol-machines-smolvm:
  requires HOST-WSL2, HOST-CPU-VIRT, HOST-KVM-DEVICE, HOST-KVM-RW-OPEN

sandlock:
  requires HOST-WSL2, HOST-LANDLOCK-CONFIG, HOST-SECCOMP-CONFIG

vfs-agentfs-cow:
  requires HOST-WSL2, HOST-FUSE-DEVICE
```

If project-specific upstream prerequisites are stronger when the later S2/S2W plan freezes provenance, that later plan may downgrade eligibility; S0 must not claim support it did not observe.

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

```js
test('probe runner uses exact argv, closed stdin and explicit environment', async () => {
  // use a temporary node fixture that prints cwd/env/argv
});

test('probe runner rejects output above the exact byte limit', async () => {
  // fixture writes limit + 1 bytes
});

test('probe runner kills the descendant process group on timeout', async () => {
  // mirror the accepted production/TC-01 process-runner behavior
});
```

- [ ] **Step 5: Implement `runProbeCommand`**

Input:

```js
{
  argv: ['/usr/bin/uname', '-r'],
  cwd: '/home/.../src/mnfs',
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

Canonical JSON sorts object keys recursively and preserves array order. Artifact metadata contains:

```js
{
  path: 'raw/host-kernel/stdout.bin',
  sha256: 'sha256:...',
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

Do not add “PASS” as a lifecycle phase; Verdict is derived separately.

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

Reject non-WSL2 as `HOST-WSL2=UNSUPPORTED`; do not crash report generation.

- [ ] **Step 2: Implement exact host commands**

Allowed commands:

```text
/usr/bin/uname -m
/usr/bin/git --version
/usr/bin/node --version only when the resolved Node executable is trusted/current process identity; otherwise use process.version
/usr/bin/stat -f -c %T <repo-root>
/usr/bin/git rev-parse HEAD
/usr/bin/git rev-parse HEAD^{tree}
/usr/bin/git status --porcelain=v1 --untracked-files=normal
```

Read `/proc/sys/kernel/osrelease` and `/etc/os-release` directly with bounded reads rather than invoking shell pipelines.

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
/dev/kvm present but not char device → REJECT probe integrity
```

- [ ] **Step 2: Implement device observation**

Use `lstat('/dev/kvm')`. If it is a character device, attempt:

```js
await open('/dev/kvm', constants.O_RDWR | constants.O_CLOEXEC)
```

Immediately close the descriptor. Do not issue `ioctl`, create a VM or load modules.

Map permission failure to `HOST-KVM-RW-OPEN=UNSUPPORTED` with errno artifact; map other inconclusive errors to `UNKNOWN`.

- [ ] **Step 3: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: observe KVM eligibility without launching VMs"
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

- [ ] **Step 1: Implement kernel-config discovery as observation, not assumption**

Try in order:

```text
/proc/config.gz
/boot/config-<exact kernel release>
```

If neither is readable, configuration-backed observations become `UNKNOWN`; kernel version alone must not be converted into `SUPPORTED`.

Parse only exact keys:

```text
CONFIG_SECCOMP=y
CONFIG_SECCOMP_FILTER=y
CONFIG_SECURITY_LANDLOCK=y
CONFIG_USER_NS=y
CONFIG_FUSE_FS=y
```

- [ ] **Step 2: Add bounded userns active probe when `/usr/bin/unshare` exists**

Exact argv:

```text
/usr/bin/unshare --user --map-root-user /usr/bin/id -u
```

Environment only `PATH=/usr/bin:/bin`, `LANG=C`, `LC_ALL=C`. Success with stdout `0` → `HOST-USERNS=SUPPORTED`. Expected permission/unsupported errors → `UNSUPPORTED`; missing executable with supporting kernel config → `UNKNOWN` because tool absence is not kernel absence.

- [ ] **Step 3: Observe FUSE**

Check `/dev/fuse` character-device presence and whether current process can open it `O_RDWR|O_CLOEXEC`, then close immediately. Observe `fusermount3 --version` only if exact executable resolves under `/usr/bin` or `/bin`; otherwise `HOST-FUSE-TOOLS=ABSENT`.

- [ ] **Step 4: Observe cgroup v2**

`/sys/fs/cgroup/cgroup.controllers` readable and filesystem type `cgroup2fs` → `SUPPORTED`; otherwise classify exactly from evidence.

- [ ] **Step 5: Verify and commit**

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

Never search arbitrary PATH inherited from the user. Resolve only accepted fixed directories (`/usr/bin`, `/bin`, and an explicit plan-approved candidate path if later added by contract revision).

- [ ] **Step 2: Observe Docker without mutation**

If `/usr/bin/docker` exists:

```text
docker --version
docker version --format {{json .Server.Version}}
```

The second command may contact an already-running daemon but must not create containers/images/networks. Daemon unavailability → `HOST-DOCKER-DAEMON=ABSENT` or `UNKNOWN` based on exit evidence, not REJECT.

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

### Task 7: Candidate eligibility derivation

**Files:**
- Create: `spikes/arr-s0/src/eligibility.mjs`
- Create: `spikes/arr-s0/tests/eligibility.test.mjs`

**Interfaces:**
- Consumes capability observations only.
- Produces deterministic `CandidateEligibilityRecord[]`.

- [ ] **Step 1: Write table-driven RED tests**

Examples:

```js
assert.equal(eligibilityFor('boxlite', allKvmSupported).eligibility, 'ELIGIBLE_FOR_SPIKE');
assert.equal(eligibilityFor('boxlite', kvmMissing).eligibility, 'BLOCKED_BY_HOST');
assert.equal(eligibilityFor('sandlock', landlockUnknown).eligibility, 'UNKNOWN');
assert.equal(eligibilityFor('vfs-agentfs-cow', fuseDeviceSupportedButToolMissing).eligibility, 'REQUIRES_SETUP_DECISION');
```

- [ ] **Step 2: Implement declarative requirement mapping**

Keep mapping in one immutable object. Do not inspect whether candidate package is installed. S0 answers physical/platform eligibility, not candidate setup completion.

- [ ] **Step 3: Add rationale rules**

Every eligibility result names the exact missing/unknown capability IDs. No human prose-only decision.

- [ ] **Step 4: Verify and commit**

```bash
npm run test:arr-s0
git add spikes/arr-s0
git commit -m "spike: derive host eligibility for ARR candidates"
```

---

### Task 8: Mechanical S0 verdict and tamper detection

**Files:**
- Create: `spikes/arr-s0/src/verdict.mjs`
- Create: `spikes/arr-s0/tests/verdict.test.mjs`

**Interfaces:**
- Produces overall S0 Verdict from Evidence completeness/integrity, not from candidate popularity.

**Verdict rules:**

```text
REJECT
→ unsafe mutation detected, evidence tamper/hash mismatch,
  fail-open command behavior, escaped artifact root, or contract violation

BLOCKED
→ canonical WSL2/repository identity cannot be established,
  checkout not clean, or required probe evidence cannot be collected at all

ACCEPT_WITH_LIMITATIONS
→ core host identity is proven and S1/S2 planning can continue,
  but one or more optional candidate-class capabilities remain UNKNOWN

ACCEPT
→ all required S0 observations are decisive enough to determine eligibility
  for every currently material S1/S2 candidate class
```

A host without KVM can still produce `ACCEPT` when KVM absence is decisively proven; microVM candidates simply become `BLOCKED_BY_HOST`.

- [ ] **Step 1: Write RED verdict matrix**

Cover every branch above and assert model self-text cannot change result.

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
npm run arr-s0 -- report --run-id <canonical-run-id> --json
```

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
→ derive eligibility
→ derive Verdict
→ write final manifest/report inputs
→ verify every artifact hash
→ move FINALIZED
```

If interrupted after initial state, `report` must identify incomplete state and never invent a Verdict.

- [ ] **Step 4: Implement deterministic report**

Human + JSON report includes:

```text
run id
source commit/tree
host identity
capability table
candidate eligibility table
Verdict
limitations
artifact manifest hash
next governed action
```

No secret/environment dump.

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

**Interfaces:**
- Produces immutable human-readable contract corresponding to harness constants and explains exactly what the real run does/does not do.

- [ ] **Step 1: Document every capability/eligibility/verdict rule from the frozen plan**

The contract version begins `1.0.0` only after Operator approval. Before approval it remains proposed and the real run is prohibited.

- [ ] **Step 2: Add contract/harness consistency tests**

Documentation tooling must assert that every required capability ID and candidate ID implemented by the harness appears in the contract, and vice versa.

- [ ] **Step 3: Verify**

```bash
npm run verify
```

- [ ] **Step 4: Commit**

```bash
git add docs/spikes spikes/arr-s0/README.md docs/DOCUMENTATION-MAP.md docs/tracking/STATUS.md scripts
git commit -m "docs: freeze ARR-S0 host capability contract"
```

---

### Task 11: Independent deterministic review before real host execution

**Files:**
- No product changes expected; Findings may require a Correction task/commit.

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
any candidate-specific bias?
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

**Files written by operation:** Linux state-root artifacts only; repository must remain byte-for-byte/Git clean.

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
git rev-parse HEAD
git rev-parse 'HEAD^{tree}'
git status --porcelain=v1 --untracked-files=normal
```

Expected: exact authorized commit/tree and empty status.

- [ ] **Step 2: Run S0 once**

```bash
npm run arr-s0 -- run --json
```

Capture stdout as an Evidence artifact outside the checkout. No automatic retry after a partial/inconclusive run; inspect durable run state first.

- [ ] **Step 3: Re-open report in a fresh process**

```bash
npm run arr-s0 -- report --run-id <run-id-from-step-2> --json
```

The actual run ID comes from Step 2's machine output; it is not guessed or recomputed.

- [ ] **Step 4: Verify repository remained unchanged**

Repeat the three Git commands from Step 1. Exact commit/tree/status must match.

- [ ] **Step 5: Run fresh full verification after the real probe**

```bash
npm run verify
```

- [ ] **Step 6: Promote acceptance Evidence**

Create `docs/acceptance/<date>-arr-s0-host-capability-probe.md` containing only normalized, secret-free Evidence references/hashes and the mechanically derived Verdict. Raw probe bytes remain in content-addressed/state artifacts and are referenced by hash.

- [ ] **Step 7: Independent Evidence review**

A fresh Reviewer verifies artifact hashes, contract version, source identity and Verdict derivation. No manual candidate promotion is allowed.

**Termination:**

- `SUCCESS`: accepted S0 Evidence exists and the repository is unchanged; next action is S1/S2 planning.
- `BLOCKED`: host/probe Evidence is incomplete but no contract violation occurred; do not modify host automatically.
- `REJECT`: unsafe mutation/fail-open/tamper or contract violation; stop ARR program and investigate.
- `REPLAN_REQUIRED`: S0 contract itself is shown materially incapable of deciding candidate eligibility.

---

## S0 approval and execution gates

Plan review and S0 execution remain separate.

```text
GATE-S0-PLAN
→ Operator accepts this plan and the S0 contract design
→ no host probing yet

GATE-S0-EXECUTE
→ Operator authorization must bind:
   - PLAN-ARR-S0-HOST-CAPABILITY-PROBE accepted version
   - ARR-S0 contract accepted version/hash
   - exact canonical base commit SHA
   - exact deterministic verification Evidence
→ authorizes Tasks 1-12 only within this plan's boundaries
```

If plan implementation and real-run authority are intentionally split, the Operator may authorize Tasks 1-11 first and Task 12 later. No authorization is inferred from plan acceptance.

---

## Self-review checklist

- [ ] S0 cannot select a candidate; it only classifies eligibility.
- [ ] No `sudo`, install, WSL config, sysctl, service-start or candidate execution path exists.
- [ ] KVM probe opens/closes device only; no ioctl/VM creation.
- [ ] Userns active probe is ephemeral and exact-argv.
- [ ] Kernel config absence maps to UNKNOWN, not UNSUPPORTED.
- [ ] Candidate package absence is not treated as host incapability.
- [ ] A host lacking KVM can still yield ACCEPT with microVM candidates blocked.
- [ ] Raw outputs are preserved and hashed before normalization.
- [ ] Verdict is pure/mechanical and cannot be changed by model narrative.
- [ ] Repository must be clean before/after real run.
- [ ] Full existing MNFS verification remains green after adding deterministic S0 harness tests.
- [ ] No M02/runtime/environment adoption authority is implied.

## Execution handoff

After accepted real S0 Evidence, compile two fresh Planner Packs in parallel if resource/authority allows:

```text
S1 Planner Pack
→ D-012/D-014/D-016
→ accepted S0 host Evidence
→ current Agent Runtime provenance research

S2 Planner Pack
→ D-013/D-014/D-016
→ accepted S0 host Evidence
→ current eligible process/microVM candidate provenance
```

Each Planner then writes a separate candidate-pinned plan. Neither inherits assumptions from this conversation or from the other Planner beyond accepted shared Evidence.

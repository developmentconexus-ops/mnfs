---
id: PLAN-ARR-S2-EXECUTION-ENVELOPE-CONFORMANCE
title: ARR-S2 Local Execution Envelope Conformance Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT
  - ADR-0015
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE
tracking_issue: 23
last_reviewed: 2026-08-08
---

# ARR-S2 Local Execution Envelope Conformance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and execute one deterministic local Execution Envelope conformance spike that compares only host-eligible, decision-changing process candidates and produces Evidence sufficient to select the first local envelope and decide whether an independent workspace spike is still needed.

**Architecture:** Implement a candidate-independent harness under `spikes/arr-s2/` with a trusted run-scoped cgroup-v2 resource governor, synthetic host sentinels, two controlled local network endpoints, a deterministic offline Git/toolchain fixture, crash/reconcile checks and independent Git result extraction. Concrete adapters compile the same logical policy into SRT, nono and conditionally Sandlock. KVM microVMs and Docker remain excluded under accepted S0 host facts unless a separate Decision explicitly reopens host setup.

**Tech Stack:** Node.js 24.18.0+, Node ESM, `node:test`, Git CLI, Linux cgroup v2 (`cpu.max`, `memory.max`, `pids.max`, `cgroup.procs`), local TCP/HTTP fixture servers, canonical JSON/SHA-256, existing Architecture Spike Evidence schema, Anthropic Sandbox Runtime `0.0.71`, nono `0.72.0`, Sandlock `0.8.6`, Ubuntu WSL2.

## Global Constraints

- Contract under test: exact accepted `DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT`; proposed `0.1.0` authorizes no execution.
- Canonical host facts come only from `ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE`.
- Preserve ADR-0015 property separation and distinct Domain Authority / Tool / Environment / Credential / Network / External Effect / Evidence planes.
- `HOST-CGROUP-V2=SUPPORTED` proves presence/readability only. It does not prove writable delegation or controller availability for a child resource governor.
- Do not change KVM permissions, sysctl, AppArmor, WSL settings, services, Docker state, `cgroup.subtree_control`, systemd configuration or parent/root cgroup delegation.
- Do not globally install candidates. Stage exact release/package bytes below the validated Linux MNFS state root only after later `GATE-S2` authority.
- Missing common resource-governor or candidate prerequisites => `BLOCKED`/Replan finding; never auto-remediate and never fall back to unrestricted host execution.
- Use only synthetic credential/read/write sentinels; never open real operator secrets to prove denial.
- Network conformance uses controlled local endpoints so public Internet availability cannot decide the result.
- Real toolchain workload is deterministic/offline after fixture staging.
- Candidate subprocesses use exact argv, `shell:false`, explicit cwd/env, bounded output, timeout and complete descendant termination.
- Every candidate executes under the same comparison resource budget:

```text
cpu.max       = 100000 100000
memory.max    = 1073741824
pids.max      = 128
wallClockMs   = 120000
```

- Those values are Spike comparison limits, not universal production budgets.
- Security/resource criterion failure cannot be offset by performance or convenience.
- D-014 dependency admission is deciding: every selection-eligible envelope must carry candidate-specific **Upgrade Policy** and **Removal Conditions** Evidence before `SUCCESS` can support a selecting Decision.
- No candidate-specific weakening after another candidate has run; material contract changes invalidate affected Evidence.

---

## Frozen candidate provenance

```text
Anthropic Sandbox Runtime 0.0.71
  tag commit: 121c6ac86df7c958aaf953d27116e74848c31318
  package: @anthropic-ai/sandbox-runtime
  license: Apache-2.0

nono 0.72.0
  tag commit: 4a2236d93c5ddbc318fcffa3e65c99ff9fce8935
  license: Apache-2.0

Sandlock 0.8.6
  tag commit: 033f7e24e29047a17aeb6f2f0e8fd77c69978abb
  license: Apache-2.0
```

Before real execution, re-query the frozen release/tag identities and record artifact digests. Provenance drift stops execution before any fixture payload.

---

### Task 1: Register S2 contract, criteria and candidate applicability

**Files:**
- Create: `spikes/arr-s2/src/contract.mjs`
- Create: `spikes/arr-s2/src/applicability.mjs`
- Create: `spikes/arr-s2/tests/contract.test.mjs`
- Create: `spikes/arr-s2/tests/applicability.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces exact `S2-C01..S2-C17`, candidate IDs `SRT|NONO|SANDLOCK`, excluded-class projections and `ELIGIBLE|BLOCKED|CONDITIONAL` pre-execution state.
- Produces immutable `S2_COMPARISON_RESOURCE_BUDGET`:

```js
{
  cpuMax: '100000 100000',
  memoryMaxBytes: 1073741824,
  pidsMax: 128,
  wallClockMs: 120000,
}
```

- [ ] **Step 1: Write RED tests for exact criterion/candidate/resource-budget inventory**

The test must assert exactly `S2-C01` through `S2-C17` and the exact four resource-budget values above.

- [ ] **Step 2: RED-test S0 mapping**

```text
SRT       process class plausible → common governor preflight + candidate-specific preflight
NONO      process class plausible → common governor preflight + candidate-specific preflight
SANDLOCK  Landlock class plausible but ABI unproved → common governor preflight + conditional candidate preflight
BoxLite   KVM class blocked → not executable
smolvm    KVM class blocked → not executable
Docker    setup decision required → not executable
```

The test must also assert that `HOST-CGROUP-V2=SUPPORTED` alone never maps `S2-C17` to PASS.

- [ ] **Step 3: Implement immutable constants and accepted S0 Evidence identity loader**
- [ ] **Step 4: Add deterministic `test:arr-s2` to root verification**
- [ ] **Step 5: Run GREEN/full verify and commit**

---

### Task 2: Build immutable run state, artifact store and independent verdict evaluator

**Files:**
- Create: `spikes/arr-s2/src/run-state.mjs`
- Create: `spikes/arr-s2/src/artifacts.mjs`
- Create: `spikes/arr-s2/src/evaluate.mjs`
- Create: `spikes/arr-s2/tests/run-state.test.mjs`
- Create: `spikes/arr-s2/tests/artifacts.test.mjs`
- Create: `spikes/arr-s2/tests/evaluate.test.mjs`

**Interfaces:**
- Lifecycle:

```text
CREATED → PREFLIGHTED → RUNNING → OBSERVED → FINALIZED
```

- Produces normalized criterion results, workspace applicability and pure `PASS|FAIL|BLOCKED|REJECT` candidate verdict.

- [ ] **Step 1: Write RED tests for lifecycle/fresh-process reopenability**
- [ ] **Step 2: RED-test no-replace/hash-bound raw artifacts and restrictive modes**
- [ ] **Step 3: Implement artifact discipline consistent with ARR-S0 where the mechanism is reusable**
- [ ] **Step 4: Implement verdict precedence**

`S2-C17` is mandatory. A missing/UNKNOWN common governor proof maps the whole real run to `BLOCKED` before candidate execution. Governor tamper/escape or fail-open maps to `REJECT`.

- [ ] **Step 5: Run tests and commit**

---

### Task 3: Implement candidate-independent cgroup-v2 resource-governor preflight

**Files:**
- Create: `spikes/arr-s2/src/preflight/resource-governor.mjs`
- Create: `spikes/arr-s2/src/resource-governor.mjs`
- Create: `spikes/arr-s2/src/resource-launcher.mjs`
- Create: `spikes/arr-s2/tests/resource-governor-preflight.test.mjs`
- Create: `spikes/arr-s2/tests/resource-governor.test.mjs`

**Interfaces:**
- `inspectResourceGovernorHost(...)` returns normalized read-only/delegation observations without changing parent configuration.
- `createRunResourceGovernor({ runId, budget, ... })` creates only one exact run-owned child cgroup beneath a proven already-delegated parent.
- `launchBounded(...)` uses a trusted launcher barrier so no untrusted candidate payload starts before cgroup membership and exact limit read-back are proved.
- `cleanupResourceGovernor(...)` removes only the exact empty run-owned child after identity/membership checks.

- [ ] **Step 1: Write RED tests proving S0 cgroup presence is insufficient**

Fixtures cover:

```text
cgroup v2 readable but no UID-scoped delegated parent          → BLOCKED
parent exists but cpu/memory/pids not already in subtree control → BLOCKED
required control file not writable                             → BLOCKED
all required controllers already delegated/writable            → READY
```

No test may expect a write to parent `cgroup.subtree_control`.

- [ ] **Step 2: Define deterministic delegated-parent resolution**

Parse unified cgroup v2 membership from `/proc/self/cgroup`. Resolve only existing ancestors within the current UID-scoped `user-<uid>.slice` boundary. Never search above that boundary. A usable parent must already permit creation of one run-owned child and already delegate `cpu`, `memory` and `pids` to children.

If no UID-scoped boundary/delegation is provable, return `BLOCKED`; do not guess another cgroup path.

- [ ] **Step 3: RED-test ephemeral ownership smoke**

Under an injected fake filesystem/process seam, prove this exact order:

```text
validate parent identity/delegation
→ mkdir exact run-owned child
→ write cpu.max
→ write memory.max
→ write pids.max
→ read back all limits
→ start trusted launcher blocked on GO
→ write launcher PID to cgroup.procs
→ read back membership
→ release GO
→ observe accounting/membership
→ terminate/finish launcher tree
→ verify cgroup.events populated=0 / no unexpected membership
→ remove exact child
```

Failure before GO must never execute the payload.

- [ ] **Step 4: Implement the trusted launcher barrier**

`resource-launcher.mjs` receives exact candidate argv/cwd/env through a bounded control file or inherited IPC channel, blocks before spawning the candidate, and only starts the candidate after the trusted parent confirms cgroup membership and sends a one-shot GO signal. The candidate and descendants inherit the launcher's cgroup.

No shell and no raw inherited host environment.

- [ ] **Step 5: RED-test untrusted governor-write/escape denial requirement**

The generic scenario contract must include attempts to write the run cgroup's `cpu.max`, `memory.max`, `pids.max`, its `cgroup.procs`, and the selected parent `cgroup.procs`. Candidate stdout cannot decide this result; trusted before/after control-file values and membership must remain unchanged.

- [ ] **Step 6: Implement trusted wall-clock enforcement**

The outer process runner enforces exactly `120000` ms for the comparison workload and terminates the complete bounded process tree on deadline. The wall-clock deadline supplements, rather than replaces, cgroup CPU/memory/pids limits.

- [ ] **Step 7: RED-test cleanup fail-closed**

Unexpected PIDs, non-empty child, path drift, symlink/identity drift or inability to prove ownership must preserve the child/Evidence and return a cleanup blocker; never delete an ancestor or sibling.

- [ ] **Step 8: Run tests and commit**

```bash
npm run test:arr-s2
git add spikes/arr-s2
 git commit -m "spike: bind ARR-S2 resource governor"
```

---

### Task 4: Build the deterministic Git/toolchain fixture

**Files:**
- Create: `spikes/arr-s2/src/fixture/repository.mjs`
- Create: `spikes/arr-s2/src/fixture/toolchain.mjs`
- Create: `spikes/arr-s2/tests/fixture-repository.test.mjs`
- Create: `spikes/arr-s2/tests/fixture-toolchain.test.mjs`
- Create: `spikes/arr-s2/fixture-template/` with source files only if immutable template bytes are simpler than runtime generation

**Interfaces:**
- Produces one trusted base commit/tree containing regular files, executable bit, symlink and deterministic add/modify/delete/rename expectations.
- Toolchain workload runs offline after staging and within `S2_COMPARISON_RESOURCE_BUDGET`.

- [ ] **Step 1: RED-test exact Git base/result semantics**
- [ ] **Step 2: RED-test executable/symlink/delete/rename fidelity**
- [ ] **Step 3: Create a minimal dependency/typecheck/test workflow with no runtime registry dependency**

Use the repo's already-installed/frozen Node/TypeScript toolchain through an explicit trusted read-only path or vendor the exact minimal fixture dependency set under state-root staging. Do not invoke `npx` or package downloads from inside a candidate.

- [ ] **Step 4: Verify deterministic expected result tree across repeated fixture creation**
- [ ] **Step 5: Commit**

---

### Task 5: Build synthetic protected-resource and controlled-network fixtures

**Files:**
- Create: `spikes/arr-s2/src/fixture/sentinels.mjs`
- Create: `spikes/arr-s2/src/fixture/network.mjs`
- Create: `spikes/arr-s2/tests/sentinels.test.mjs`
- Create: `spikes/arr-s2/tests/network.test.mjs`

**Interfaces:**
- Creates three random run-scoped synthetic files outside candidate workspace: read sentinel, write sentinel, credential-shaped sentinel.
- Creates two loopback servers with distinct ports/nonces: one contract-allowed, one contract-denied.

- [ ] **Step 1: RED-test sentinels contain synthetic markers only and expose digests to Evidence**
- [ ] **Step 2: RED-test network servers bind loopback only, use machine-generated random ports and close idempotently**
- [ ] **Step 3: Implement trusted before/after digest observations**
- [ ] **Step 4: Commit**

---

### Task 6: Build generic workload/process runner and scenario evaluator

**Files:**
- Create: `spikes/arr-s2/src/process-runner.mjs`
- Create: `spikes/arr-s2/src/scenarios.mjs`
- Create: `spikes/arr-s2/tests/process-runner.test.mjs`
- Create: `spikes/arr-s2/tests/scenarios.test.mjs`

**Interfaces:**
- Generic candidate adapter exposes `prepare()`, candidate invocation data, `observe()`, `cleanup()`; actual candidate payload launch goes through the common `launchBounded(...)` resource governor path.
- Scenario evaluator receives trusted before/after observations plus process/cgroup Evidence; candidate stdout text never decides denial/pass by itself.

- [ ] **Step 1: RED-test timeout, descendant process cleanup and bounded outputs**
- [ ] **Step 2: Encode one scenario per required security/workspace/resource criterion**
- [ ] **Step 3: Require trusted unchanged sentinel and resource-governor observations for deny scenarios**
- [ ] **Step 4: Commit**

---

### Task 7: Implement SRT candidate adapter and preflight

**Files:**
- Create: `spikes/arr-s2/src/adapters/srt.mjs`
- Create: `spikes/arr-s2/src/preflight/srt.mjs`
- Create: `spikes/arr-s2/tests/srt.test.mjs`

**Interfaces:**
- Frozen SRT `0.0.71` CLI/library boundary only.
- Preflight records exact `bwrap`, `socat`, `rg` availability/version/path and current host-policy compatibility.
- Adapter produces invocation/policy data consumed by common `launchBounded(...)`; it may not bypass the common resource governor.

- [ ] **Step 1: RED-test missing prerequisite => `BLOCKED` with no installation/sysctl path**
- [ ] **Step 2: RED-test invalid sandbox policy prevents payload invocation**
- [ ] **Step 3: RED-test adapter cannot spawn outside `launchBounded(...)`**
- [ ] **Step 4: Implement exact policy compilation for fixture read/write/network/process/governor-control denial requirements**
- [ ] **Step 5: Add explicit test that no code invokes sysctl/AppArmor/cgroup-parent remediation**
- [ ] **Step 6: Commit**

---

### Task 8: Implement nono candidate adapter and preflight

**Files:**
- Create: `spikes/arr-s2/src/adapters/nono.mjs`
- Create: `spikes/arr-s2/src/preflight/nono.mjs`
- Create: `spikes/arr-s2/tests/nono.test.mjs`

**Interfaces:**
- Uses frozen `nono v0.72.0` binary and one run-scoped profile generated from the candidate-independent policy.
- Adapter produces invocation/profile data consumed by common `launchBounded(...)`.

- [ ] **Step 1: RED-test exact binary provenance and WSL2/x86_64 expectation**
- [ ] **Step 2: RED-test profile cannot inherit registry/user profile capabilities implicitly**
- [ ] **Step 3: RED-test common resource-governor control paths cannot be writable from the candidate**
- [ ] **Step 4: Implement minimum exact profile and process shape**
- [ ] **Step 5: Commit**

---

### Task 9: Implement Sandlock eligibility probe before adapter execution

**Files:**
- Create: `spikes/arr-s2/src/preflight/sandlock.mjs`
- Create: `spikes/arr-s2/tests/sandlock-preflight.test.mjs`

**Interfaces:**
- Produces positive Evidence for actual Landlock ABI and seccomp-user-notification usability before `SANDLOCK` may become executable.

- [ ] **Step 1: RED-test kernel version/config alone never implies ABI v6**
- [ ] **Step 2: Define the reviewed active eligibility probe**

Use the smallest upstream-supported/read-only diagnostic or a tiny compiled syscall probe whose source is committed and reviewed. It may query Landlock ABI and seccomp notification availability but must not sandbox the fixture yet or mutate host state.

- [ ] **Step 3: Map absence/denial/inconclusive results explicitly**
- [ ] **Step 4: Commit**

---

### Task 10: Implement Sandlock adapter only behind passed eligibility

**Files:**
- Create: `spikes/arr-s2/src/adapters/sandlock.mjs`
- Create: `spikes/arr-s2/tests/sandlock.test.mjs`

**Interfaces:**
- Uses frozen `v0.8.6` CLI boundary.
- May exercise built-in COW because workspace sufficiency is deciding S2/S2W Evidence.
- Adapter invocation still passes through common `launchBounded(...)`; Sandlock's own controls do not replace `S2-C17`.

- [ ] **Step 1: RED-test adapter cannot run when eligibility != PASS**
- [ ] **Step 2: RED-test COW base remains unchanged while result differences are independently observable**
- [ ] **Step 3: RED-test common resource-governor control paths remain unavailable for write/escape**
- [ ] **Step 4: Implement candidate-independent policy mapping to Landlock/seccomp/COW CLI options**
- [ ] **Step 5: Commit**

---

### Task 11: Implement Git result extraction and workspace sufficiency evaluator

**Files:**
- Create: `spikes/arr-s2/src/result-tree.mjs`
- Create: `spikes/arr-s2/src/workspace-evaluate.mjs`
- Create: `spikes/arr-s2/tests/result-tree.test.mjs`
- Create: `spikes/arr-s2/tests/workspace-evaluate.test.mjs`

**Interfaces:**
- Produces trusted `baseCommitSha`, `resultTreeSha`, optional `resultCommitSha` and:

```text
WORKSPACE_NATIVE_SUFFICIENT
WORKSPACE_EXTERNAL_REQUIRED
WORKSPACE_UNKNOWN
```

- [ ] **Step 1: RED-test candidate narrative cannot supply result identity**
- [ ] **Step 2: RED-test native COW can qualify only if base immutability/result extraction/cleanup all PASS**
- [ ] **Step 3: Implement pure workspace sufficiency rules**
- [ ] **Step 4: Commit**

---

### Task 12: Implement S2 authority, common preflight, dependency-admission report and exact early stop

**Files:**
- Create: `spikes/arr-s2/src/execution-authority.mjs`
- Create: `spikes/arr-s2/src/preflight.mjs`
- Create: `spikes/arr-s2/src/run.mjs`
- Create: `spikes/arr-s2/src/report.mjs`
- Create: `spikes/arr-s2/src/cli.mjs`
- Create: `spikes/arr-s2/tests/execution-authority.test.mjs`
- Create: `spikes/arr-s2/tests/preflight.test.mjs`
- Create: `spikes/arr-s2/tests/run.test.mjs`
- Create: `spikes/arr-s2/tests/report.test.mjs`
- Create: `spikes/arr-s2/README.md`

**Interfaces:**
- Proposed later gate:

```text
MNFS_AUTHORIZE_ARR_S2_EXECUTE plan_blob=<accepted-plan-blob> contract_sha256=<accepted-contract-sha256> base_sha=<canonical-main> verify_run=<successful-run> scope=local-execution-envelope-conformance
```

- Machine interface after acceptance:

```text
preflight --json
run --json
report --run-id RUN_ID --json
```

- Common preflight order:

```text
validate exact authority/source/state root
→ resource-governor host/delegation preflight
→ only if READY, candidate-specific preflights
→ no candidate payload yet
```

- Every finalized candidate report must carry:

```text
resourceGovernor:
  parentIdentityHash
  runCgroupIdentity
  cpuMax
  memoryMaxBytes
  pidsMax
  wallClockMs
  membershipEvidenceRefs
  controlReadbackEvidenceRefs
  accountingEvidenceRefs
  escapeAttemptResult

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

The harness validates completeness and binds values to exact source/candidate/run identity. It does not invent one generic dependency policy for all candidates.

- [ ] **Step 1: RED-test zero candidate operations before exact authority validation and common governor READY**
- [ ] **Step 2: RED-test common governor failure prevents all SRT/nono/Sandlock payloads**
- [ ] **Step 3: RED-test execution order `RESOURCE-GOVERNOR → SRT → NONO → SANDLOCK if eligible`**
- [ ] **Step 4: RED-test excluded KVM/Docker candidates are impossible to launch from S2 CLI**
- [ ] **Step 5: RED-test D-014 and S2-C17 selection eligibility**

Table-driven report tests must prove an otherwise-PASS envelope is not selection-eligible and cannot yield selecting `SUCCESS` when:

```text
S2-C17 != PASS
resourceGovernor exact read-back/membership Evidence is missing
escapeAttemptResult != PASS
any required Upgrade Policy field is missing/blank
any required Removal Conditions field is missing/blank
```

Expected normalized result:

```text
candidate.selectionEligible = false
selectionDecisionInput = BLOCKED
```

- [ ] **Step 6: Implement final report with candidate verdicts, measurements, workspace sufficiency, resource-governor Evidence, Upgrade Policy and Removal Conditions**

The report preserves candidate conformance separately from selection eligibility. A candidate can have sandbox/workspace observations while remaining ineligible because the common resource governor or dependency admission is incomplete.

- [ ] **Step 7: Run RED/GREEN for resource/dependency eligibility**

```bash
node --test spikes/arr-s2/tests/resource-governor-preflight.test.mjs
node --test spikes/arr-s2/tests/resource-governor.test.mjs
node --test spikes/arr-s2/tests/report.test.mjs
npm run test:arr-s2
```

- [ ] **Step 8: Add deterministic S2 suite to `npm run verify` and commit**

---

### Task 13: Independent deterministic review before real candidate execution

Reviewer focus:

```text
same logical fixture/policy/resource budget for every candidate
S0 cgroup presence is not confused with writable delegation
common governor never modifies parent subtree_control or host configuration
no payload starts before cgroup membership + exact limit read-back
trusted observations decide deny/resource scenarios
candidate cannot relax limits or migrate out of run-owned cgroup
no real-secret probe
no public-network dependency for network verdict
no KVM/Docker/sysctl/AppArmor/systemd/WSL remediation path
SRT/nono/Sandlock adapters use exact frozen public boundaries
Sandlock cannot run before ABI/seccomp eligibility proof
native COW cannot self-certify result identity
cleanup is bounded and fail-closed
performance cannot override a security/resource failure
Upgrade Policy and Removal Conditions are concrete per selection-eligible envelope
no selection-ready SUCCESS exists with incomplete S2-C17 or D-014 dependency admission
```

Zero unresolved admitted Critical/Important findings before `GATE-S2`.

---

### Task 14: Controlled real S2 execution — separately authorized

**Preconditions:**

```text
accepted S2 contract exact hash
accepted S2 plan exact blob
canonical main exact commit/tree
npm ci + npm run verify PASS
clean checkout
exact candidate release bytes staged under Linux state root
common cgroup-v2 resource-governor preflight READY
S2 candidate-specific preflight READY for mandatory candidates
GATE-S2 exact authority
```

- [ ] **Step 1: Capture exact source/fixture/sentinel/resource-governor identity**
- [ ] **Step 2: Create the exact run-owned cgroup, configure/read back the frozen budget and bind the trusted launcher before any candidate payload**
- [ ] **Step 3: Run the orchestrator once; do not manually rerun individual candidates after partial failure**
- [ ] **Step 4: Reopen report in a fresh process and rehash all Evidence, including cgroup control/membership/accounting refs**
- [ ] **Step 5: Verify canonical checkout unchanged/clean**
- [ ] **Step 6: Verify selection eligibility before interpreting `SUCCESS`**

A selecting S2 `SUCCESS` requires:

```text
common resource governor READY and untampered
S2-C17 PASS for selected candidate
all mandatory candidate runs finalized
all eligible decision-changing conditional candidate runs finalized
selected candidate required criteria PASS
selected candidate selectionEligible=true
selected candidate Upgrade Policy complete
selected candidate Removal Conditions complete
workspace sufficiency observation finalized
```

If common resource delegation/binding, envelope conformance or D-014 dependency-admission Evidence is missing/incomplete, terminate `BLOCKED`; do not create a selecting Decision from partial Evidence.

- [ ] **Step 7: Perform bounded governor cleanup only after exact empty-membership/ownership proof; preserve blocker Evidence on ambiguity**
- [ ] **Step 8: Run fresh `npm run verify`**
- [ ] **Step 9: Promote normalized Evidence and perform independent Evidence review**

**Termination:**

- `SUCCESS`: valid comparative Evidence, `S2-C17=PASS`, complete D-014 Upgrade Policy/Removal Conditions Evidence and finalized S2W applicability support one S2 selecting Decision.
- `BLOCKED`: common resource-governor delegation/binding, mandatory candidate proof or dependency-admission Evidence cannot complete under current host/authority.
- `REJECT`: resource-governor escape/tamper, sandbox escape/fail-open, host mutation, evidence tamper or contract violation.
- `REPLAN_REQUIRED`: candidate-independent contract cannot fairly answer the local-envelope decision or the required common resource governor cannot be realized without a separate host/setup Decision.

No S2 result authorizes S2W/S3 or production M02 by implication.

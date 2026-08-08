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

**Architecture:** Implement a candidate-independent harness under `spikes/arr-s2/` with synthetic host sentinels, two controlled local network endpoints, a deterministic offline Git/toolchain fixture, crash/reconcile checks and independent Git result extraction. Concrete adapters compile the same logical policy into SRT, nono and conditionally Sandlock. KVM microVMs and Docker remain excluded under accepted S0 host facts unless a separate Decision explicitly reopens host setup.

**Tech Stack:** Node.js 24.18.0+, Node ESM, `node:test`, Git CLI, local TCP/HTTP fixture servers, canonical JSON/SHA-256, existing Architecture Spike Evidence schema, Anthropic Sandbox Runtime `0.0.71`, nono `0.72.0`, Sandlock `0.8.6`, Ubuntu WSL2.

## Global Constraints

- Contract under test: exact accepted `DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT`; proposed `0.1.0` authorizes no execution.
- Canonical host facts come only from `ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE`.
- Preserve ADR-0015 property separation and distinct Domain Authority / Tool / Environment / Credential / Network / External Effect / Evidence planes.
- Do not change KVM permissions, sysctl, AppArmor, WSL settings, services or Docker state.
- Do not globally install candidates. Stage exact release/package bytes below the validated Linux MNFS state root only after later `GATE-S2` authority.
- Missing candidate prerequisites => `BLOCKED`/setup finding; never auto-remediate.
- Use only synthetic credential/read/write sentinels; never open real operator secrets to prove denial.
- Network conformance uses controlled local endpoints so public Internet availability cannot decide the result.
- Real toolchain workload is deterministic/offline after fixture staging.
- Candidate subprocesses use exact argv, `shell:false`, explicit cwd/env, bounded output, timeout and complete descendant termination.
- Security criterion failure cannot be offset by performance or convenience.
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

Sandlock 0.8.6
  tag commit: 033f7e24e29047a17aeb6f2f0e8fd77c69978abb
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
- Produces exact `S2-C01..S2-C16`, candidate IDs `SRT|NONO|SANDLOCK`, excluded-class projections and `ELIGIBLE|BLOCKED|CONDITIONAL` pre-execution state.

- [ ] **Step 1: RED-test exact criterion/candidate inventory**
- [ ] **Step 2: RED-test S0 mapping**

```text
SRT       process class plausible → candidate-specific preflight
NONO      process class plausible → candidate-specific preflight
SANDLOCK  Landlock class plausible but ABI unproved → conditional preflight
BoxLite   KVM class blocked → not executable
smolvm    KVM class blocked → not executable
Docker    setup decision required → not executable
```

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

- [ ] **Step 1: RED-test lifecycle/fresh-process reopenability**
- [ ] **Step 2: RED-test no-replace/hash-bound raw artifacts and restrictive modes**
- [ ] **Step 3: Implement artifact discipline consistent with ARR-S0 where the mechanism is reusable**
- [ ] **Step 4: Implement verdict precedence and tests**
- [ ] **Step 5: Commit**

---

### Task 3: Build the deterministic Git/toolchain fixture

**Files:**
- Create: `spikes/arr-s2/src/fixture/repository.mjs`
- Create: `spikes/arr-s2/src/fixture/toolchain.mjs`
- Create: `spikes/arr-s2/tests/fixture-repository.test.mjs`
- Create: `spikes/arr-s2/tests/fixture-toolchain.test.mjs`
- Create: `spikes/arr-s2/fixture-template/` with source files only if immutable template bytes are simpler than runtime generation

**Interfaces:**
- Produces one trusted base commit/tree containing regular files, executable bit, symlink and deterministic add/modify/delete/rename expectations.
- Toolchain workload runs offline after staging.

- [ ] **Step 1: RED-test exact Git base/result semantics**
- [ ] **Step 2: RED-test executable/symlink/delete/rename fidelity**
- [ ] **Step 3: Create a minimal dependency/typecheck/test workflow with no runtime registry dependency**

Use the repo's already-installed/frozen Node/TypeScript toolchain through an explicit trusted read-only path or vendor the exact minimal fixture dependency set under state-root staging. Do not invoke `npx` or package downloads from inside a candidate.

- [ ] **Step 4: Verify deterministic expected result tree across repeated fixture creation**
- [ ] **Step 5: Commit**

---

### Task 4: Build synthetic protected-resource and controlled-network fixtures

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

### Task 5: Build generic workload/process runner and scenario evaluator

**Files:**
- Create: `spikes/arr-s2/src/process-runner.mjs`
- Create: `spikes/arr-s2/src/scenarios.mjs`
- Create: `spikes/arr-s2/tests/process-runner.test.mjs`
- Create: `spikes/arr-s2/tests/scenarios.test.mjs`

**Interfaces:**
- Generic candidate adapter must expose `prepare()`, `run(argv,cwd,env,policy)`, `observe()`, `cleanup()`.
- Scenario evaluator receives trusted before/after observations plus process Evidence; candidate stdout text never decides denial/pass by itself.

- [ ] **Step 1: RED-test timeout, descendant process cleanup and bounded outputs**
- [ ] **Step 2: Encode one scenario per required security/workspace criterion**
- [ ] **Step 3: Require trusted unchanged sentinel digests for deny scenarios**
- [ ] **Step 4: Commit**

---

### Task 6: Implement SRT candidate adapter and preflight

**Files:**
- Create: `spikes/arr-s2/src/adapters/srt.mjs`
- Create: `spikes/arr-s2/src/preflight/srt.mjs`
- Create: `spikes/arr-s2/tests/srt.test.mjs`

**Interfaces:**
- Frozen SRT `0.0.71` CLI/library boundary only.
- Preflight records exact `bwrap`, `socat`, `rg` availability/version/path and current host-policy compatibility.

- [ ] **Step 1: RED-test missing prerequisite => `BLOCKED` with no installation/sysctl path**
- [ ] **Step 2: RED-test invalid sandbox policy prevents payload invocation**
- [ ] **Step 3: Implement exact policy compilation for fixture read/write/network/process requirements**
- [ ] **Step 4: Add explicit test that no code invokes sysctl/AppArmor remediation**
- [ ] **Step 5: Commit**

---

### Task 7: Implement nono candidate adapter and preflight

**Files:**
- Create: `spikes/arr-s2/src/adapters/nono.mjs`
- Create: `spikes/arr-s2/src/preflight/nono.mjs`
- Create: `spikes/arr-s2/tests/nono.test.mjs`

**Interfaces:**
- Uses frozen `nono v0.72.0` binary and one run-scoped profile generated from the candidate-independent policy.

- [ ] **Step 1: RED-test exact binary provenance and WSL2/x86_64 expectation**
- [ ] **Step 2: RED-test profile cannot inherit registry/user profile capabilities implicitly**
- [ ] **Step 3: Implement minimum exact profile and process shape**
- [ ] **Step 4: Commit**

---

### Task 8: Implement Sandlock eligibility probe before adapter execution

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

### Task 9: Implement Sandlock adapter only behind passed eligibility

**Files:**
- Create: `spikes/arr-s2/src/adapters/sandlock.mjs`
- Create: `spikes/arr-s2/tests/sandlock.test.mjs`

**Interfaces:**
- Uses frozen `v0.8.6` CLI boundary.
- May exercise built-in COW because workspace sufficiency is deciding S2/S2W Evidence.

- [ ] **Step 1: RED-test adapter cannot run when eligibility != PASS**
- [ ] **Step 2: RED-test COW base remains unchanged while result differences are independently observable**
- [ ] **Step 3: Implement candidate-independent policy mapping to Landlock/seccomp/COW CLI options**
- [ ] **Step 4: Commit**

---

### Task 10: Implement Git result extraction and workspace sufficiency evaluator

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

### Task 11: Implement S2 authority, preflight, run/report and exact early stop

**Files:**
- Create: `spikes/arr-s2/src/execution-authority.mjs`
- Create: `spikes/arr-s2/src/preflight.mjs`
- Create: `spikes/arr-s2/src/run.mjs`
- Create: `spikes/arr-s2/src/report.mjs`
- Create: `spikes/arr-s2/src/cli.mjs`
- Create: `spikes/arr-s2/tests/execution-authority.test.mjs`
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

- [ ] **Step 1: RED-test zero candidate operations before exact authority validation**
- [ ] **Step 2: RED-test execution order `SRT → NONO → SANDLOCK if eligible`**
- [ ] **Step 3: RED-test excluded KVM/Docker candidates are impossible to launch from S2 CLI**
- [ ] **Step 4: Implement final report with candidate verdicts, measurements and workspace sufficiency**
- [ ] **Step 5: Add deterministic S2 suite to `npm run verify` and commit**

---

### Task 12: Independent deterministic review before real candidate execution

Reviewer focus:

```text
same logical fixture/policy for every candidate
trusted observations decide deny scenarios
no real-secret probe
no public-network dependency for network verdict
no KVM/Docker/sysctl/AppArmor remediation path
SRT/nono/Sandlock adapters use exact frozen public boundaries
Sandlock cannot run before ABI/seccomp eligibility proof
native COW cannot self-certify result identity
cleanup is bounded and fail-closed
performance cannot override a security failure
```

Zero unresolved admitted Critical/Important findings before `GATE-S2`.

---

### Task 13: Controlled real S2 execution — separately authorized

**Preconditions:**

```text
accepted S2 contract exact hash
accepted S2 plan exact blob
canonical main exact commit/tree
npm ci + npm run verify PASS
clean checkout
exact candidate release bytes staged under Linux state root
S2 preflight READY for at least the mandatory candidates
GATE-S2 exact authority
```

- [ ] **Step 1: Capture exact source/fixture/sentinel identity**
- [ ] **Step 2: Run the orchestrator once; do not manually rerun individual candidates after partial failure**
- [ ] **Step 3: Reopen report in a fresh process and rehash all Evidence**
- [ ] **Step 4: Verify canonical checkout unchanged/clean**
- [ ] **Step 5: Run fresh `npm run verify`**
- [ ] **Step 6: Promote normalized Evidence and perform independent Evidence review**

**Termination:**

- `SUCCESS`: valid comparative Evidence supports one S2 selecting Decision and S2W applicability.
- `BLOCKED`: mandatory proof cannot complete under current host/authority.
- `REJECT`: sandbox escape/fail-open/host mutation/evidence tamper/contract violation.
- `REPLAN_REQUIRED`: candidate-independent contract cannot fairly answer the local-envelope decision.

No S2 result authorizes S2W/S3 or production M02 by implication.

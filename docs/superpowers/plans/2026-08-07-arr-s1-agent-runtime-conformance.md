---
id: PLAN-ARR-S1-AGENT-RUNTIME-CONFORMANCE
title: ARR-S1 Agent Runtime Conformance Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - DOC-ARR-S1-AGENT-RUNTIME-CONTRACT
  - ADR-0013
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE
tracking_issue: 23
last_reviewed: 2026-08-08
---

# ARR-S1 Agent Runtime Conformance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and execute one deterministic Pi-first Agent Runtime conformance spike that selects both the initial runtime and the smallest sufficient MNFS/runtime integration boundary without giving runtime Session authority over MNFS semantics.

**Architecture:** Implement a provider-neutral S1 harness under `spikes/arr-s1/`. The harness owns the fixed fixture, criterion evaluation, raw Evidence and process lifecycle; concrete adapters translate the same logical runtime operations into Pi SDK, Pi-ACP/ACP and OpenCode ACP. Pi is qualified first, OpenCode native ACP is the mandatory external challenger, and additional ACP execution occurs only when it can still change the boundary decision.

**Tech Stack:** Node.js 24.18.0+, Node ESM, `node:test`, canonical JSON/SHA-256, Git CLI, existing Architecture Spike Evidence schema, Pi `0.84.1`, Pi-ACP `0.0.33`, ACP TypeScript SDK `1.3.0`, OpenCode `1.18.15`, Ubuntu WSL2.

## Global Constraints

- Contract under test: `DOC-ARR-S1-AGENT-RUNTIME-CONTRACT` exact accepted version/hash; proposed `0.1.0` authorizes no execution.
- Canonical host Evidence: `ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE`.
- Preserve D-012/D-014/D-016 and ADR-0013: MNFS owns Role/ActorRun/Attempt/Authority/Claim/Evidence/Verdict/Recovery; runtime Session is observational.
- Pi-first determines execution order only; criteria remain candidate-independent.
- OpenCode native ACP must be exercised and finalized under the same contract before final S1 selection. `BLOCKED` does not count as the required external comparison and forces `BLOCKED`/`REPLAN_REQUIRED` rather than incumbent-only selection.
- Pi SDK and Pi-ACP are the two primary Pi integration shapes. Direct Pi RPC is conditional diagnostic/full-candidate work only when the contract-defined ambiguity trigger fires.
- Do not create `AgentRuntimeProviderFactory`, runtime plugin registries or generalized production abstractions in the spike.
- Candidate packages/binaries are staged below the validated Linux MNFS state root; do not globally install or mutate host configuration.
- Candidate acquisition, provider network calls and use of operator authentication require later exact `GATE-S1`; planning/implementation tests use fixtures/fakes only.
- Never persist raw provider credentials, OAuth tokens, cookies, complete environment dumps or prompt/model secrets in Evidence.
- Candidate subprocesses use exact argv, `shell:false`, bounded output, explicit cwd/env and descendant termination.
- D-014 dependency admission is deciding: every selection-eligible runtime/boundary must have candidate-specific **Upgrade Policy** and **Removal Conditions** Evidence before `SUCCESS` can support a selecting Decision.
- Any material contract revision after the first real candidate run invalidates affected comparison Evidence and requires rerun under one revision.

---

## Frozen candidate provenance

```text
Pi 0.84.1
  tag commit: 53fa77ccd8a279eb87e92294ef3687b03ff80112
  package: @earendil-works/pi-coding-agent
  license: MIT

Pi-ACP 0.0.33
  source: d1cffc047ab37a096ee70ca39cfc1de463db8d12
  package: pi-acp
  license: MIT

ACP TypeScript SDK 1.3.0
  source: e1054d0122e844cca9f1016a598a1da06f78ccef
  package: @agentclientprotocol/sdk
  license: Apache-2.0

OpenCode 1.18.15
  release commit: 325529761beb79a004de6d86e48b8db69cf4eba3
  license: MIT
```

Before real execution, re-query the exact frozen tag/release/package metadata. If bytes/provenance no longer resolve exactly, stop before candidate execution and classify the drift.

---

### Task 1: Register the accepted S1 contract and deterministic criterion inventory

**Files:**
- Create: `spikes/arr-s1/src/contract.mjs`
- Create: `spikes/arr-s1/tests/contract.test.mjs`
- Modify: `package.json`
- Modify: `scripts/test-documentation-tooling.mjs` or add focused S1 consistency test if clearer

**Interfaces:**
- Produces: `S1_CRITERIA`, `S1_CANDIDATE_VERDICTS`, candidate-shape IDs and exact contract identity loader.
- Consumes: exact accepted contract bytes; no candidate process.

- [ ] **Step 1: Write RED tests for exact criterion inventory**

Tests assert exactly `S1-C01` through `S1-C16`, exact verdict vocabulary `PASS|FAIL|BLOCKED|REJECT`, and these shape IDs:

```text
PI-SDK
PI-ACP
PI-RPC
OPENCODE-ACP
SECOND-ACP
```

`PI-RPC` and `SECOND-ACP` must carry conditional applicability metadata rather than default execution.

- [ ] **Step 2: Run targeted RED**

```bash
node --test spikes/arr-s1/tests/contract.test.mjs
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement immutable constants and contract hash loader**

Use exact accepted contract bytes and SHA-256. Do not encode candidate scores or preferred winner in constants.

- [ ] **Step 4: Add `test:arr-s1` to root verification without running real candidates**

`test:arr-s1` executes fixture/deterministic tests only.

- [ ] **Step 5: Run GREEN**

```bash
npm run test:arr-s1
npm run verify
```

- [ ] **Step 6: Commit**

```bash
git add spikes/arr-s1 package.json scripts
git commit -m "spike: register ARR-S1 runtime contract"
```

---

### Task 2: Build the shared S1 run state, immutable Evidence and fixture

**Files:**
- Create: `spikes/arr-s1/src/run-state.mjs`
- Create: `spikes/arr-s1/src/artifacts.mjs`
- Create: `spikes/arr-s1/src/fixture.mjs`
- Create: `spikes/arr-s1/src/evaluate.mjs`
- Create: `spikes/arr-s1/tests/run-state.test.mjs`
- Create: `spikes/arr-s1/tests/artifacts.test.mjs`
- Create: `spikes/arr-s1/tests/fixture.test.mjs`
- Create: `spikes/arr-s1/tests/evaluate.test.mjs`

**Interfaces:**
- Produces: one hash-bound run per candidate shape, raw artifact refs, normalized criterion results and pure candidate verdict derivation.
- Fixture: disposable Git workspace + nonce-bearing file-read/edit task + explicit tool inventory + cancellation/death checkpoints.

- [ ] **Step 1: Write RED tests for lifecycle and Evidence immutability**

Lifecycle is finite:

```text
CREATED → READY → RUNNING → OBSERVED → FINALIZED
```

Interruption before finalization remains reopenable and has no invented verdict.

- [ ] **Step 2: Write RED fixture tests**

The controlled task must require a real tool read of a generated nonce file and one deterministic edit whose result tree can be verified independently. The nonce answer must not appear in the prompt.

- [ ] **Step 3: Implement canonical artifacts using the same no-replace/hash discipline as ARR-S0 where reusable without coupling semantics**

Do not copy raw credentials or complete candidate environment.

- [ ] **Step 4: Implement pure verdict evaluator**

`REJECT` outranks all other states; any required `FAIL` => `FAIL`; required unavailable proof => `BLOCKED`; all required PASS => `PASS`.

- [ ] **Step 5: Run tests and commit**

```bash
npm run test:arr-s1
git add spikes/arr-s1
git commit -m "spike: persist deterministic ARR-S1 evidence"
```

---

### Task 3: Implement exact process/runtime observation primitives

**Files:**
- Create: `spikes/arr-s1/src/process-runner.mjs`
- Create: `spikes/arr-s1/src/runtime-events.mjs`
- Create: `spikes/arr-s1/tests/process-runner.test.mjs`
- Create: `spikes/arr-s1/tests/runtime-events.test.mjs`

**Interfaces:**
- Produces: exact subprocess lifecycle/death/cancellation Evidence and bounded normalized events.
- No shell; no candidate-specific parsing in the generic runner.

- [ ] **Step 1: Write RED tests for normal exit, signal death, timeout, cancellation and descendant cleanup**
- [ ] **Step 2: Implement exact argv/cwd/env spawning with closed stdin unless the adapter explicitly owns a protocol stdin channel**
- [ ] **Step 3: Implement bounded stdout/stderr/event recorders with byte limits and explicit truncation metadata**
- [ ] **Step 4: Run targeted tests and commit**

---

### Task 4: Implement Pi SDK adapter and qualification tests

**Files:**
- Create: `spikes/arr-s1/src/adapters/pi-sdk.mjs`
- Create: `spikes/arr-s1/tests/pi-sdk.test.mjs`
- Create: `spikes/arr-s1/fixtures/pi-sdk/` for deterministic adapter fixtures only

**Interfaces:**
- Adapter operations: initialize exact cwd/env/resources, start controlled turn, observe structured events, cancel, close.
- Real adapter imports only the frozen Pi package at execution time; tests use an injected fake SDK surface matching the consumed API.

- [ ] **Step 1: RED-test that tool/resource inventory is explicit and ambient discovery is disabled/bounded**
- [ ] **Step 2: RED-test cancellation/final semantics and runtime death handoff**
- [ ] **Step 3: Implement the smallest SDK surface needed by the fixture**

Use public SDK constructs such as `createAgentSession` / `createAgentSessionRuntime`, explicit session manager/resource loader/tool definitions and event subscription. Do not depend on TUI text.

- [ ] **Step 4: Add source scan asserting no product dependency on Pi Session identity for Recovery**
- [ ] **Step 5: Run deterministic tests and commit**

---

### Task 5: Implement one current ACP client harness

**Files:**
- Create: `spikes/arr-s1/src/acp/client.mjs`
- Create: `spikes/arr-s1/src/acp/normalize.mjs`
- Create: `spikes/arr-s1/tests/acp-client.test.mjs`

**Interfaces:**
- Uses frozen `@agentclientprotocol/sdk@1.3.0` stable ACP v1 entry point only.
- Produces the same logical S1 runtime operations used by Pi SDK: initialize, session/task start, event stream, cancellation, settled result, shutdown.

- [ ] **Step 1: RED-test strict handshake/capability recording and protocol-version mismatch behavior**
- [ ] **Step 2: RED-test bounded event normalization without relying on vendor `_meta` for required criteria**
- [ ] **Step 3: Implement exact stdio ACP client lifecycle with no inherited arbitrary env**
- [ ] **Step 4: Run tests and commit**

---

### Task 6: Implement Pi-ACP adapter through the common ACP client

**Files:**
- Create: `spikes/arr-s1/src/adapters/pi-acp.mjs`
- Create: `spikes/arr-s1/tests/pi-acp.test.mjs`

**Interfaces:**
- Starts exact frozen Pi-ACP entrypoint, which in turn starts frozen Pi RPC.
- Consumes/produces only common ACP client operations; candidate-specific observations remain supplemental Evidence.

- [ ] **Step 1: RED-test that Pi-ACP is not treated as filesystem/terminal delegation**

The test must fail if the harness assumes ACP itself redirects Pi filesystem/process operations into MNFS.

- [ ] **Step 2: RED-test current SDK/wire interoperability handling**

Pi-ACP package provenance uses ACP SDK `^0.26.0`; the MNFS client is `1.3.0`. Successful handshake/fixture must be observed, not assumed.

- [ ] **Step 3: Implement the minimal process adapter and exact environment projection**
- [ ] **Step 4: Run tests and commit**

---

### Task 7: Implement OpenCode native ACP challenger adapter

**Files:**
- Create: `spikes/arr-s1/src/adapters/opencode-acp.mjs`
- Create: `spikes/arr-s1/tests/opencode-acp.test.mjs`

**Interfaces:**
- Starts frozen release using exact `opencode acp` command shape.
- Uses the same ACP client and logical fixture as Pi-ACP.

- [ ] **Step 1: RED-test exact argv/cwd/env and no TUI parsing**
- [ ] **Step 2: RED-test capability/permission observations remain Evidence rather than MNFS authority**
- [ ] **Step 3: Implement minimal adapter**
- [ ] **Step 4: Run tests and commit**

---

### Task 8: Encode conditional direct-Pi-RPC and second-ACP applicability

**Files:**
- Create: `spikes/arr-s1/src/applicability.mjs`
- Create: `spikes/arr-s1/tests/applicability.test.mjs`

**Interfaces:**
- Pure function over finalized Pi SDK / Pi-ACP / OpenCode evidence.
- Produces `REQUIRED | NOT_REQUIRED | BLOCKED` separately for `PI-RPC` and `SECOND-ACP`.

- [ ] **Step 1: RED-test exact triggers from the contract**

`PI-RPC=REQUIRED` only for process-boundary/translation ambiguity. `SECOND-ACP=REQUIRED` only when ACP remains materially decision-relevant and two ACP implementations have not already passed.

- [ ] **Step 2: Implement pure applicability evaluator**
- [ ] **Step 3: Run tests and commit**

---

### Task 9: Implement S1 preflight and exact execution authority

**Files:**
- Create: `spikes/arr-s1/src/execution-authority.mjs`
- Create: `spikes/arr-s1/src/preflight.mjs`
- Create: `spikes/arr-s1/tests/execution-authority.test.mjs`
- Create: `spikes/arr-s1/tests/preflight.test.mjs`
- Modify: `spikes/arr-s1/README.md`

**Interfaces:**
- Proposed gate form:

```text
MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=<accepted-plan-blob> contract_sha256=<accepted-contract-sha256> base_sha=<canonical-main> verify_run=<successful-run> scope=pi-first-runtime-conformance
```

Final parser syntax freezes only when contract/plan are accepted.

- [ ] **Step 1: RED-test no real candidate operation without parser-validated exact authority**
- [ ] **Step 2: Preflight exact source cleanliness and Linux state-root safety**
- [ ] **Step 3: Observe/stage candidate provenance without global installation**

Acquisition into the state root is part of the later controlled operation and must use exact release/package identities. Missing host prerequisite or unavailable exact bytes => `BLOCKED`, not automatic remediation.

- [ ] **Step 4: Define credential preflight**

Require an explicit operator-authorized supported login path for the chosen model/provider. Record only provider/auth method class, never secrets.

- [ ] **Step 5: Verify and commit**

---

### Task 10: Implement S1 orchestration, dependency-admission report and early stop

**Files:**
- Create: `spikes/arr-s1/src/run.mjs`
- Create: `spikes/arr-s1/src/report.mjs`
- Create: `spikes/arr-s1/src/cli.mjs`
- Create: `spikes/arr-s1/tests/run.test.mjs`
- Create: `spikes/arr-s1/tests/report.test.mjs`

**Interfaces:**
- Machine commands after acceptance:

```text
preflight --json
run --json
report --run-id RUN_ID --json
```

- Every finalized candidate/boundary report record must contain candidate-specific:

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

These values are observed/researched for the frozen candidate during the controlled run and review; the deterministic harness validates their shape/completeness but does not invent generic values.

- [ ] **Step 1: RED-test phase order**

```text
preflight
→ PI-SDK real run
→ PI-ACP real run
→ choose best passing Pi shape
→ OPENCODE-ACP real run
→ require OpenCode finalized PASS or FAIL before any selection
→ compute applicability for PI-RPC / SECOND-ACP
→ execute only required conditional shape(s)
→ finalize report
```

- [ ] **Step 2: RED-test early-stop rules**

The orchestrator must not execute a second ACP or direct RPC when applicability is `NOT_REQUIRED`. It also must not produce selection-ready `SUCCESS` if OpenCode is `BLOCKED` or otherwise lacks a completed external comparison.

- [ ] **Step 3: RED-test D-014 selection eligibility**

Table-driven tests must prove that a candidate with otherwise-PASS criteria is **not selection-eligible** when any of these is missing or blank:

```text
upgradePolicy.pinningRule
upgradePolicy.upgradeTrigger
upgradePolicy.mandatoryConformanceRerun
upgradePolicy.rollbackRule
removalConditions.removeOrReplaceWhen
removalConditions.authorityOrSecurityTrigger
removalConditions.provenanceOrLicenseTrigger
removalConditions.maintenanceTrigger
removalConditions.replacementOrExitPath
```

Expected result: report may preserve candidate conformance observations, but `runtimeDecisionInput.selectionEligible=false`, `boundaryDecisionInput.selectionEligible=false` where applicable, and the Spike cannot terminate `SUCCESS` for a selecting Decision.

- [ ] **Step 4: Implement deterministic report with separate `runtimeDecisionInput` and `boundaryDecisionInput`**

Both decision inputs must reference the exact candidate verdict plus supported-boundary/provenance Evidence and the complete Upgrade Policy/Removal Conditions Evidence. ACP boundary selection must bind the boundary's own upgrade/removal semantics separately from the initial runtime when they differ.

- [ ] **Step 5: Run RED/GREEN for dependency-admission eligibility**

```bash
node --test spikes/arr-s1/tests/report.test.mjs
npm run test:arr-s1
```

Expected: all missing-field cases remain non-selection-eligible; complete candidate-specific Evidence permits eligibility only when every other contract condition is also satisfied.

- [ ] **Step 6: Add full deterministic S1 tests to `npm run verify`**
- [ ] **Step 7: Run full verification and commit**

---

### Task 11: Independent deterministic review before candidate execution

**Files:** no product changes expected.

Reviewer verifies:

```text
candidate-independent criteria
Pi-first does not alter thresholds
Pi SDK uses public supported boundary
Pi-ACP limitations are not hidden
ACP client does not invent filesystem/terminal delegation
OpenCode challenger gets the same logical fixture
OpenCode BLOCKED cannot yield incumbent-only selection
credential/provider data cannot leak into Evidence
runtime Session cannot become Recovery authority
conditional candidates cannot run unless applicability says REQUIRED
Upgrade Policy and Removal Conditions are concrete per selection-eligible dependency/boundary
no selection-ready SUCCESS can exist without complete D-014 dependency-admission Evidence
no global installation or host mutation path
```

Zero unresolved admitted Critical/Important findings before `GATE-S1`.

---

### Task 12: Controlled real S1 execution — separately authorized

**Preconditions:**

```text
accepted S1 contract exact hash
accepted S1 plan exact blob
canonical main exact commit/tree
npm ci + npm run verify PASS
clean checkout
S1 preflight READY
exact candidate provenance staged under Linux state root
explicit supported provider/auth path ready
GATE-S1 exact authority
```

- [ ] **Step 1: Capture exact pre-run source identity**
- [ ] **Step 2: Execute S1 exactly once through the orchestrator; do not manually repeat individual candidates after partial failure**
- [ ] **Step 3: Reopen report in a fresh process and verify raw artifact hashes**
- [ ] **Step 4: Verify repository remained clean and unchanged**
- [ ] **Step 5: Verify selection eligibility before interpreting `SUCCESS`**

A selecting `SUCCESS` requires all of these:

```text
required Pi qualification Evidence complete
OpenCode external comparison executed/finalized with PASS or FAIL
all required conditional candidate runs completed
selected runtime decision input selectionEligible=true
selected boundary decision input selectionEligible=true
selected dependency/boundary Upgrade Policy complete
selected dependency/boundary Removal Conditions complete
```

If conformance is otherwise sufficient but D-014 dependency-admission Evidence is missing/incomplete, terminate `BLOCKED`; do not create a selecting Decision from partial admission data.

- [ ] **Step 6: Run fresh `npm run verify`**
- [ ] **Step 7: Promote normalized Evidence to `docs/acceptance/` and perform independent Evidence review**

**Termination:**

- `SUCCESS`: enough valid comparative Evidence **and complete D-014 Upgrade Policy/Removal Conditions Evidence** exist to make an S1 runtime + boundary selecting Decision.
- `BLOCKED`: prerequisite/provider/candidate proof, required external comparison or dependency-admission Evidence cannot complete without changing authority.
- `REJECT`: unsafe mutation, credential leak, fail-open, tamper or contract violation.
- `REPLAN_REQUIRED`: contract cannot fairly answer runtime/boundary selection.

No S1 result authorizes S2/S3 execution or production M02 by implication.

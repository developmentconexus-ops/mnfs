---
id: PLAN-COMPLEXITY-PROPORTIONALITY-RECONCILIATION
title: Complexity Proportionality Reconciliation and ARR-S0 Bounded Correction Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - DOC-ARR-SPIKE-GOVERNANCE
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-08
---

# Complexity Proportionality Reconciliation and ARR-S0 Bounded Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the Operator-approved complexity-proportionality/review-admission design into existing MNFS governance with the smallest coherent documentation change, then correct only the admitted ARR-S0 source-integrity defect before a frozen-head independent review.

**Architecture:** Do not create a new lifecycle, framework, security subsystem or scoring model. Strengthen the existing Development Governance → MCRM → Layered Execution Planning → Architecture Spike Governance chain, classify the ARR-S0 non-forgeability concern as a threat-model expansion rather than implementation scope, and make one bounded code correction: re-observe/revalidate Git source immediately before the first durable S0 Evidence write.

**Tech Stack:** Markdown governance sources, Node.js 24.18.0+, Node ESM, `node:test`, existing documentation validator/tooling, existing ARR-S0 deterministic harness.

## Approved design baseline

This plan is derived from the Operator-approved design:

```text
DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
version: 0.1.0 proposed bytes reviewed by Operator
PR: #28
approved design head: 636294c984b3ece40d2d91d9c94a9aecf16108fd
design blob: 46c0fbc28d9fcdaf19f1ecfa7a853747b910bf87
verification workflow: 31224951872 — SUCCESS
Operator approval: 2026-08-08
```

The accepted principle is:

> **A good plan minimizes uncertainty; it does not maximize complexity.**

## Global Constraints

- Preserve D-009, D-010 through D-018 and all accepted M0/M1/M01 Evidence unless explicitly superseded by a later Operator Decision.
- Do not create a second development method, review lifecycle, complexity score, generic policy engine or new permanent domain entity.
- Complexity carries a burden of proof tied to a current capability, requirement, failure mode, threat, recovery/evidence obligation or material machinery elimination.
- Reviewer severity does not create product Authority. A Finding must be admitted/classified against accepted authority before it becomes blocking Correction scope.
- Preserve the distinction between Governance Gates and adversarial Security Boundaries.
- Do **not** add Ed25519, PKI, signer services, trust-root infrastructure, non-repudiation machinery or a generic signed-capability framework to ARR-S0.
- Preserve existing green S0 hardening that directly serves current accepted properties; do not churn code merely to reduce line count.
- Do not broaden ARR-S0 effects. It remains observation-first/read-only outside its Linux-owned Evidence root.
- `GATE-S0-EXECUTE`, Task 12 real WSL2 host observation, candidate execution, host mutation, S1/S2/S2W/S3 execution, runtime/environment selection, M02 production implementation, production Worker dispatch and automatic merge/delivery remain prohibited.
- Documentation tests should protect stable normative semantics (IDs, enums, gates, relationships, required markers) rather than ordinary prose wording.
- Final independent review uses a frozen exact head. Findings are grouped and classified before another correction cycle begins.
- This plan approval, if granted, authorizes **no implementation by implication**. Each execution tranche requires its own exact Operator gate.

## Execution gates and dependency graph

```text
Operator-approved design
        ↓
PLAN REVIEW / APPROVAL
        ↓
GATE-CPR-CANONICAL — separately required
        ↓
Tasks 1–3: canonical governance reconciliation
        ↓
canonical integration / exact accepted authority
        ↓
GATE-CPR-S0-CORRECTION — separately required
        ↓
Task 4: one admitted S0 code correction + terminology alignment
        ↓
Task 5: exact-head verification + independent review
        ↓
Task 11 may close only if admitted deciding findings are clear
        ↓
GATE-S0-EXECUTE remains separately required for Task 12
```

No S0 correction should be implemented against authority that has not yet incorporated the proportionality/review-admission Decision, unless a later exact Operator gate explicitly binds both trees and resolves that ordering.

---

## Task 1: Record the accepted proportionality Decision without creating a new method

**Files:**
- Modify: `docs/superpowers/specs/2026-08-07-complexity-proportionality-and-review-admission-design.md`
- Modify: `docs/tracking/DECISIONS.md`
- Modify: `docs/tracking/STATUS.md`
- Test: `scripts/test-documentation-tooling.mjs`

**Interfaces:**
- Consumes: Operator approval of `DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION` on 2026-08-08; design head `636294c984b3ece40d2d91d9c94a9aecf16108fd`; workflow `31224951872` SUCCESS.
- Produces: one accepted Decision (`D-019`, if still the next unused Decision ID at execution time) and accepted design authority that later tasks can cite.

**Scope rule:** If another Decision has consumed `D-019` before execution, stop and re-resolve the next sequential ID from `docs/tracking/DECISIONS.md`; do not overwrite or renumber history.

- [ ] **Step 1: Add a RED documentation regression assertion**

In `scripts/test-documentation-tooling.mjs`, add stable assertions that the current canonical Decision register/design do not yet contain the accepted proportionality Decision. Use exact identifiers/markers, not sentence-level prose. The intended GREEN assertions are equivalent to:

```js
const proportionalityDesignText = await readFile(
  path.join(root, 'docs/superpowers/specs/2026-08-07-complexity-proportionality-and-review-admission-design.md'),
  'utf8',
);

assert.match(decisionsText, /\| D-019 \| 2026-08-08 \|/u);
assert.match(proportionalityDesignText, /status: accepted/u);
assert.match(proportionalityDesignText, /version: 1\.0\.0/u);
assert.match(proportionalityDesignText, /A good plan minimizes uncertainty; it does not maximize complexity\./u);
```

At RED, the first three assertions must fail against the pre-Decision tree. If `D-019` is no longer available, update only the exact Decision-ID assertion to the next sequential ID before running RED.

- [ ] **Step 2: Run RED**

```bash
npm run docs:test
```

Expected: FAIL because the design is still proposed/version `0.1.0` and the proportionality Decision is not yet recorded as accepted.

- [ ] **Step 3: Record the minimum accepted authority**

Update the design frontmatter only as needed:

```yaml
status: accepted
version: 1.0.0
last_reviewed: 2026-08-08
```

Append one Decision row to `docs/tracking/DECISIONS.md`. The Decision must preserve these semantics:

```text
- accept the Complexity Proportionality and Review Admission design;
- planning completeness reduces uncertainty rather than maximizing machinery;
- material complexity requires a named current justification and simpler-alternative analysis;
- review Findings are admitted/classified before becoming Correction scope;
- reviewer severity does not independently create Authority;
- Governance Gates are not adversarial Security Boundaries by default;
- ARR-S0 non-forgeable/signed Operator authority is THREAT_MODEL_EXPANSION and is not required S0 machinery;
- ARR-S0 final pre-write Git/source re-observation is an IMPLEMENTATION_DEFECT requiring bounded correction;
- this Decision does not authorize canonical edits beyond its separately approved execution gate, S0 Task 12, S1/S2/S2W/S3, production Worker dispatch or merge/delivery.
```

Do not create a separate “Complexity Framework” document or schema.

- [ ] **Step 4: Update status minimally**

Update `docs/tracking/STATUS.md` so a Fresh Actor can see:

```text
proportionality/review-admission design: ACCEPTED
canonical reconciliation: PLANNED / separately gated
ARR-S0 Task 11: REPLAN path selected; bounded correction still not executed
ARR-S0 Task 12 / GATE-S0-EXECUTE: NOT AUTHORIZED
```

Do not rewrite unrelated milestone history.

- [ ] **Step 5: Run GREEN and full documentation verification**

```bash
npm run docs:test
npm run docs:check
npm run verify
```

Expected: PASS.

- [ ] **Step 6: Commit the bounded Decision record**

```bash
git add \
  docs/superpowers/specs/2026-08-07-complexity-proportionality-and-review-admission-design.md \
  docs/tracking/DECISIONS.md \
  docs/tracking/STATUS.md \
  scripts/test-documentation-tooling.mjs
git commit -m "docs: accept complexity proportionality decision"
```

**Termination:**
- `SUCCESS`: one accepted design + one Decision row + status projection, all verified.
- `REPLAN_REQUIRED`: accepting the design would require a new lifecycle/schema/entity or contradict an accepted higher authority.

---

## Task 2: Reconcile proportionality and Finding admission into existing canonical methods

**Files:**
- Modify: `docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md`
- Modify: `docs/product/CAPABILITY-REALIZATION-METHOD.md`
- Modify: `docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md`
- Test: `scripts/test-documentation-tooling.mjs`

**Interfaces:**
- Consumes: accepted proportionality Decision from Task 1.
- Produces: one coherent existing lifecycle where complexity/admission rules are visible at Discovery/Decision, R3/R5/R6 and independent review without adding a fifth planning layer or a parallel method.

- [ ] **Step 1: Add RED assertions for stable normative markers**

Extend `scripts/test-documentation-tooling.mjs` to read the Development Governance and Layered Planning sources if not already loaded, then assert only these stable concepts:

```js
for (const marker of [
  'CONTRACT_VIOLATION',
  'IMPLEMENTATION_DEFECT',
  'DERIVED_REQUIREMENT',
  'THREAT_MODEL_EXPANSION',
  'FUTURE_HARDENING',
]) {
  assert.match(developmentGovernanceText, new RegExp(marker, 'u'));
}

assert.match(developmentGovernanceText, /Governance Gate/u);
assert.match(developmentGovernanceText, /Security Boundary/u);
assert.match(mcrmText, /THREAT_MODEL_EXPANSION/u);
assert.match(layeredPlanningText, /READY_FOR_REVIEW/u);
```

Do not assert complete explanatory sentences.

- [ ] **Step 2: Run RED**

```bash
npm run docs:test
```

Expected: FAIL on the new markers because existing authority has the principle but not the explicit admission taxonomy/review-freeze rule.

- [ ] **Step 3: Strengthen Development Governance with two compact rules**

Add a bounded subsection, not a new lifecycle:

```text
Complexity burden of proof
- name current consumer / requirement / failure / threat / evidence need;
- explain why simpler realization is insufficient;
- account for implementation + operational + maintenance cost;
- defer when current material benefit is absent.

Finding admission
- CONTRACT_VIOLATION → Correction;
- IMPLEMENTATION_DEFECT → Correction;
- DERIVED_REQUIREMENT → admit through appropriate authority before Correction when material;
- THREAT_MODEL_EXPANSION → Discovery/Decision/Replan;
- FUTURE_HARDENING → defer/follow-up unless promoted by accepted authority.
```

State explicitly:

```text
review severity ≠ requirement authority
```

and distinguish Governance Gate from adversarial Security Boundary.

- [ ] **Step 4: Strengthen MCRM at existing R3/R5/R6 seams**

Make only the minimum additions:

```text
R3: material new mechanism must pass complexity burden of proof / named-consumer test.
R5: readiness rejects speculative machinery not justified by a current accepted concern.
R6: material Findings are classified/admitted before mutation; threat-model expansion returns to Decision/Replan.
```

Do not create R9, a new coverage-state enum, a new persisted Finding entity or a second checklist.

- [ ] **Step 5: Strengthen Layered Execution Planning review discipline**

Add the bounded final-review sequence:

```text
READY_FOR_REVIEW
→ freeze exact head
→ independent review completes
→ classify/admit Findings
→ coherent correction batch
→ full verification
→ new frozen-head review when required
```

Preserve L0/L1/L2/L3 unchanged.

- [ ] **Step 6: Run GREEN and full verification**

```bash
npm run docs:test
npm run docs:check
npm run verify
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add \
  docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md \
  docs/product/CAPABILITY-REALIZATION-METHOD.md \
  docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md \
  scripts/test-documentation-tooling.mjs
git commit -m "docs: make complexity and review admission proportional"
```

**Termination:**
- `SUCCESS`: existing methods express the accepted rules without new lifecycle machinery.
- `REPLAN_REQUIRED`: rules cannot be represented without changing accepted D-010/D-016 architecture.

---

## Task 3: Apply the same bounded threat/admission contract to Architecture Spikes

**Files:**
- Modify: `docs/spikes/ARR-SPIKE-GOVERNANCE.md`
- Test: `scripts/test-documentation-tooling.mjs`

**Interfaces:**
- Consumes: Task 1 Decision and Task 2 canonical admission vocabulary.
- Produces: a shared Spike rule requiring each Spike to state the threat/trust boundary relevant to the current decision, without inventing security requirements from a hypothetical future production environment.

- [ ] **Step 1: Add RED assertions for Spike-specific markers**

Load `docs/spikes/ARR-SPIKE-GOVERNANCE.md` in `scripts/test-documentation-tooling.mjs` and add stable assertions:

```js
assert.match(arrSpikeGovernanceText, /threat\/trust boundary/u);
assert.match(arrSpikeGovernanceText, /Governance Gate/u);
assert.match(arrSpikeGovernanceText, /THREAT_MODEL_EXPANSION/u);
assert.match(arrSpikeGovernanceText, /Finding/u);
```

- [ ] **Step 2: Run RED**

```bash
npm run docs:test
```

Expected: FAIL because shared Spike governance currently defines security/effect boundaries but not the explicit threat-model/admission rule.

- [ ] **Step 3: Add one compact Spike-governance subsection**

Require every new Spike contract/plan to state, using prose or existing contract fields rather than a new schema entity:

```text
current trust assumptions
in-scope adversaries/failures
out-of-scope adversaries/failures
allowed effects
forbidden effects
gate classification when material
```

Add this routing rule:

```text
Finding violates current Spike authority/property
→ Correction

Finding requires stronger adversary/guarantee than current contract
→ THREAT_MODEL_EXPANSION → Decision/Replan
```

Preserve fail-closed behavior **inside** the declared boundary.

- [ ] **Step 4: Run GREEN and full verification**

```bash
npm run docs:test
npm run docs:check
npm run verify
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/spikes/ARR-SPIKE-GOVERNANCE.md scripts/test-documentation-tooling.mjs
git commit -m "docs: bound Architecture Spike threat models"
```

**Canonical-tranche closeout:** After Tasks 1–3, freeze the exact head and obtain the required independent review/Operator integration authority before treating these rules as canonical `main` authority. Do not begin Task 4 merely because Tasks 1–3 are green.

---

## Task 4: Correct ARR-S0 terminology and final source integrity — nothing broader

**Separate prerequisite:** A new exact `GATE-CPR-S0-CORRECTION` (name may be replaced only by an explicit Operator-issued equivalent) must bind the integrated proportionality authority and the exact PR #27 correction base. Existing `GATE-S0-IMPLEMENT` must not be reinterpreted to authorize this Replan correction.

**Files:**
- Modify: `docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md`
- Modify: `spikes/arr-s0/README.md`
- Modify: `spikes/arr-s0/src/execution-authority.mjs`
- Modify: `spikes/arr-s0/src/service.mjs`
- Test: `spikes/arr-s0/tests/execution-authority.test.mjs`
- Test: `spikes/arr-s0/tests/execution-authority-surface.test.mjs`
- Test: `spikes/arr-s0/tests/service-ordering-filesystem.test.mjs`
- Modify only if an existing exact-string contract test requires semantic alignment: `scripts/test-arr-s0-contract-consistency.mjs`

**Interfaces:**
- Consumes: existing PR #27 exact-bound authorization parser, `preflightS0`, `runS0`, `defaultSourceObserver` semantics and accepted proportionality authority.
- Produces: same fail-closed Governance Gate behavior without cryptographic-authentication claims, plus one final pre-Evidence Git source revalidation.

### Task 4A — terminology is governance validation, not cryptographic authentication

- [ ] **Step 1: Write RED API/wording tests**

Change the execution-authority tests first so the desired API is explicit:

```js
import {
  parseExecutionAuthorizationToken,
  requireValidatedExecutionAuthorization,
} from '../src/execution-authority.mjs';
```

The tests must continue proving:

```text
- malformed/missing token rejected;
- wrong plan blob rejected;
- wrong contract hash rejected;
- wrong base SHA rejected;
- plain forged object rejected because it did not come through the exact parser;
- raw token not exposed in Evidence.
```

The surface test must fail while production still exports/imports `requireAuthenticatedExecutionAuthorization`.

- [ ] **Step 2: Run directed RED**

```bash
node --test \
  spikes/arr-s0/tests/execution-authority.test.mjs \
  spikes/arr-s0/tests/execution-authority-surface.test.mjs
```

Expected: FAIL because the validated/governance terminology is not implemented yet.

- [ ] **Step 3: Perform a mechanical minimal rename**

In `spikes/arr-s0/src/execution-authority.mjs`:

```text
AUTHENTICATED_AUTHORITIES
→ VALIDATED_AUTHORIZATIONS

requireAuthenticatedExecutionAuthorization
→ requireValidatedExecutionAuthorization
```

Use an error meaning equivalent to:

```text
ARR-S0 execution authorization must originate from the exact execution-authorization parser
```

Do not add signatures, secrets, network lookup, GitHub lookup or durable signer state.

Update the import/use in `service.mjs`. Update contract/README wording from cryptographic-style “authenticated authority” to “exact-bound Governance Gate authorization validated by the reviewed parser”. Preserve the exact field binding and fail-closed behavior.

- [ ] **Step 4: Run directed GREEN**

```bash
node --test \
  spikes/arr-s0/tests/execution-authority.test.mjs \
  spikes/arr-s0/tests/execution-authority-surface.test.mjs
```

Expected: PASS.

### Task 4B — final Git re-observation before first durable Evidence

- [ ] **Step 5: Write the failing source-drift test before production changes**

Add to `spikes/arr-s0/tests/service-ordering-filesystem.test.mjs` a test using the existing `AUTHORIZED_SOURCE` and `DRIFTED_SOURCE` fixtures. The test shape must be:

```js
test('run re-observes exact Git source after host checks and before first Evidence write', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-final-source-'));
  const expectedRunRoot = path.join(stateRoot, 'spikes', 'arr-s0', RUN_ID);
  let finalSourceCalls = 0;
  let collectCalls = 0;
  try {
    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: identities(),
        preflight: async () => ({
          ok: true,
          stateRoot,
          checks: [],
          facts: safeHostFacts(),
        }),
        observeRunRootFilesystem: async () => ({
          state: 'SUPPORTED',
          filesystemType: 'ext4',
          observedPath: stateRoot,
        }),
        sourceObserver: async () => {
          finalSourceCalls += 1;
          return { source: DRIFTED_SOURCE, clean: true };
        },
        collect: async () => {
          collectCalls += 1;
          assert.fail('collector must not run after final source drift');
        },
      }),
      /source identity changed|source commit|base_sha/u,
    );
    assert.equal(finalSourceCalls, 1);
    assert.equal(collectCalls, 0);
    await assert.rejects(
      () => lstat(path.join(expectedRunRoot, 'state', 'created.json')),
      (error) => error?.code === 'ENOENT',
    );
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});
```

- [ ] **Step 6: Run RED**

```bash
node --test spikes/arr-s0/tests/service-ordering-filesystem.test.mjs
```

Expected: FAIL because current `runS0` does not accept/use a final `sourceObserver` after the run-root filesystem proof.

- [ ] **Step 7: Implement the minimum final-source revalidation**

Add `sourceObserver = defaultSourceObserver` to `runS0` injection parameters.

Immediately **after** successful run-root filesystem validation and **before** `createInitialRunState` / `state/created.json`, perform one final read-only repository observation:

```js
const finalRepository = await sourceObserver({ repoRoot });
if (
  !finalRepository?.source?.commitSha ||
  !finalRepository?.source?.treeSha ||
  finalRepository.clean !== true
) {
  throw new Error('ARR-S0 source identity became invalid before Evidence creation');
}
if (
  finalRepository.source.commitSha !== source.commitSha ||
  finalRepository.source.treeSha !== source.treeSha
) {
  throw new Error('ARR-S0 source identity changed after preflight');
}
requireExecutionAuthorization(identities, finalRepository.source);
```

Properties that must remain true:

```text
- final Git observation is read-only;
- it occurs after remaining host/run-root inspection;
- it occurs before the first durable Evidence write;
- any dirty/missing/drifted source fails without `created.json`;
- no automatic retry;
- no Task 12 real probe is executed by tests;
- the collector still owns the later complete observation suite only after the gate passes.
```

- [ ] **Step 8: Run directed GREEN**

```bash
node --test \
  spikes/arr-s0/tests/service-ordering-filesystem.test.mjs \
  spikes/arr-s0/tests/service-authority.test.mjs \
  spikes/arr-s0/tests/service.test.mjs
```

Expected: PASS.

- [ ] **Step 9: Run S0 deterministic suite and full repository verification**

```bash
npm run test:arr-s0
npm run verify
```

Expected: PASS. No real WSL2 host probe/candidate workload is executed.

- [ ] **Step 10: Commit one coherent bounded correction**

```bash
git add \
  docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md \
  spikes/arr-s0/README.md \
  spikes/arr-s0/src/execution-authority.mjs \
  spikes/arr-s0/src/service.mjs \
  spikes/arr-s0/tests/execution-authority.test.mjs \
  spikes/arr-s0/tests/execution-authority-surface.test.mjs \
  spikes/arr-s0/tests/service-ordering-filesystem.test.mjs \
  scripts/test-arr-s0-contract-consistency.mjs
git commit -m "fix: bound ARR-S0 authority and source evidence"
```

If `scripts/test-arr-s0-contract-consistency.mjs` is unchanged, omit it from `git add` rather than touching it gratuitously.

**Termination:**
- `SUCCESS`: only terminology/trust-model alignment + final source-integrity correction changed.
- `REPLAN_REQUIRED`: fixing the admitted source defect requires a cryptographic trust system, host mutation, a new execution framework or other scope not justified by the accepted design.

---

## Task 5: Freeze exact head, classify fresh-review findings, and decide Task 11 only

**Files:**
- Modify only after verification/review Evidence exists: PR #27 description/comments and the existing S0 tracking/acceptance projection required by the accepted S0 plan.
- Do not change production code while the deciding review is in flight.

**Interfaces:**
- Consumes: Task 4 exact correction head and successful full verification.
- Produces: a deciding Task 11 review state; it does **not** produce `GATE-S0-EXECUTE`.

- [ ] **Step 1: Freeze exact review head**

Record:

```text
exact correction head SHA
exact accepted proportionality Decision/design identity
exact S0 plan blob 3e78445fcbcca360f612edefd025c6cb0f84f8e5
exact contract hash at the review head
exact npm run verify workflow/run
```

Do not push another implementation commit after requesting this review unless the current review is explicitly abandoned.

- [ ] **Step 2: Request one independent fresh review with the accepted threat boundary**

The review request must state:

```text
Review the frozen exact head only.
ARR-S0 is a read-only Architecture Spike under a trusted Operator + trusted MNFS governance/control-plane assumption.
Governance authorization must fail closed for missing/malformed/stale/wrong bindings.
Cryptographic proof of human origin, non-repudiation, malicious control-plane rewrite resistance and compromised-root resistance are out of the current S0 threat model.
Classify findings against accepted authority before recommending Correction.
Task 12 real host execution remains out of scope.
```

- [ ] **Step 3: Classify every material Finding before any code change**

For each Critical/Important candidate Finding, record one of:

```text
CONTRACT_VIOLATION
IMPLEMENTATION_DEFECT
DERIVED_REQUIREMENT
THREAT_MODEL_EXPANSION
FUTURE_HARDENING
```

A finding classified `CONTRACT_VIOLATION` or `IMPLEMENTATION_DEFECT` against a deciding S0 property blocks Task 11 until corrected/reviewed.

A finding classified `THREAT_MODEL_EXPANSION` does not become implementation scope without a new Decision/Replan.

- [ ] **Step 4: Decide whether another correction cycle is required**

```text
zero unresolved admitted Critical/Important defects
→ Task 11 may proceed to closeout Decision

one or more admitted Critical/Important defects
→ one coherent new correction batch, separately authorized if scope changed

new threat-model expansion only
→ route to Decision/Replan; do not code it into S0 by reviewer implication
```

- [ ] **Step 5: Preserve the Task 12 boundary**

Even after Task 11 closes:

```text
GATE-S0-EXECUTE = NOT AUTHORIZED
Task 12 real canonical WSL2 run = NOT AUTHORIZED
S1/S2/S2W/S3 = NOT AUTHORIZED
```

A later Operator authorization must bind the accepted S0 contract, exact canonical source and deciding deterministic verification Evidence.

---

## Plan self-review checklist

### Spec coverage

- Complexity burden of proof → Tasks 1–3.
- Finding admission taxonomy → Tasks 1–3 and Task 5.
- Governance Gate vs Security Boundary → Tasks 1–4.
- Exact-head review freeze/correction batching → Task 2 + Task 5.
- Avoid prose-as-API tests → Tasks 1–3 test design.
- S0 non-forgeability finding classified as threat-model expansion → Tasks 1 and 4.
- No Ed25519/PKI/trust-root machinery → Global Constraints + Task 4.
- Final Git re-observation defect → Task 4B.
- Preserve useful existing hardening → Global Constraints + Task 4.
- Carry bounded threat model into later Spikes → Task 3.
- No Task 12 authority by implication → Global Constraints + Task 5.

### Placeholder scan

This plan contains no `TBD`, `TODO`, “implement later”, unspecified error-handling step or unnamed test obligation. Decision-ID collision has an explicit stop/re-resolve rule rather than a placeholder.

### Interface consistency

- `parseExecutionAuthorizationToken` remains unchanged as the parsing entry point.
- Proposed renamed verifier is consistently `requireValidatedExecutionAuthorization`.
- `runS0` gains only the existing-shape injected `sourceObserver`, matching `defaultSourceObserver({ repoRoot })`.
- `AUTHORIZED_SOURCE` / `DRIFTED_SOURCE` reuse the existing test fixtures.
- Final source validation happens before `createInitialRunState` / `state/created.json`.

## Approval boundary

Approving this plan authorizes neither tranche automatically.

The next exact authorization after plan approval should cover **Tasks 1–3 only** (`GATE-CPR-CANONICAL` or an Operator-issued equivalent bound to this exact plan bytes/head). Only after that authority is canonical/integrated should a separate exact gate authorize **Task 4 + deterministic Task 5 preparation** on PR #27.

`GATE-S0-EXECUTE` remains a third, later and independent decision.

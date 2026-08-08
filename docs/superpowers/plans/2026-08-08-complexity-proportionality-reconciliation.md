---
id: PLAN-COMPLEXITY-PROPORTIONALITY-RECONCILIATION
title: Complexity Proportionality Reconciliation and ARR-S0 Bounded Correction Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: approved
version: 1.0.0
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

## Plan approval

The Operator approved this implementation plan on 2026-08-08 after review of proposed version `0.1.0` at Git blob `b5f4e0f622a0bd129c32db84ce23447651d0cc3f` and branch head `18b7d760ab0e971e5deb429a09c5d8a0738a9d13`, verified by workflow `31258687645` — SUCCESS.

Approval of this plan authorizes no implementation by implication. `GATE-CPR-CANONICAL` remains separately required before Tasks 1–3.

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
- This plan approval authorizes **no implementation by implication**. Each execution tranche requires its own exact Operator gate.

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
  assert.match(governanceText, new RegExp(marker, 'u'));
}
assert.match(governanceText, /Governance Gate/u);
assert.match(governanceText, /Security Boundary/u);
assert.match(governanceText, /complexity.*burden|burden.*complexity/iu);
```

Also assert one MCRM marker for Finding admission before correction and one Layered Planning marker that planning completeness does not imply maximum mechanism/detail.

- [ ] **Step 2: Run RED**

```bash
npm run docs:test
```

Expected: FAIL on the new markers only.

- [ ] **Step 3: Strengthen Development Governance in place**

Add one bounded subsection under Decision/Adversarial review semantics that states:

```text
Complexity Burden of Proof
- name current consumer/risk/failure/obligation;
- show why the simpler alternative is insufficient;
- compare machinery introduced versus eliminated;
- DEFER when current material benefit is not established.

Finding Admission
CONTRACT_VIOLATION
IMPLEMENTATION_DEFECT
DERIVED_REQUIREMENT
THREAT_MODEL_EXPANSION
FUTURE_HARDENING

severity != Authority
```

Add the Governance Gate versus Security Boundary distinction without creating new lifecycle phases.

- [ ] **Step 4: Strengthen MCRM only at existing decision points**

In R3/R5/R6:

```text
R3: material realization complexity names consumer/benefit and simpler alternative.
R5: no speculative mechanism is added merely to satisfy an unadmitted review scenario.
R6: material Finding is classified before mutation; only admitted Correction executes.
```

Preserve the existing R0–R8 lifecycle exactly.

- [ ] **Step 5: Clarify Layered Execution Planning**

Add a concise normative rule near design principles/stability semantics:

```text
Planning completeness = no material hidden decision left to the Actor.
Planning completeness != maximum detail, mechanism, ceremony or hypothetical-future hardening.
```

Preserve L0–L3 exactly.

- [ ] **Step 6: Run GREEN**

```bash
npm run docs:test
npm run docs:check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add \
  docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md \
  docs/product/CAPABILITY-REALIZATION-METHOD.md \
  docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md \
  scripts/test-documentation-tooling.mjs
git commit -m "docs: make planning rigor complexity-proportional"
```

---

## Task 3: Make Architecture Spike threat/review scope explicit

**Files:**
- Modify: `docs/spikes/ARR-SPIKE-GOVERNANCE.md`
- Modify: `docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md`
- Modify: `AGENTS.md`
- Test: `scripts/test-documentation-tooling.mjs`

**Interfaces:**
- Consumes: Tasks 1–2.
- Produces: future S0/S1/S2/S2W/S3 review contracts that state current trust/threat boundaries and classify new findings before implementation scope changes.

- [ ] **Step 1: Add RED assertions**

Add stable documentation assertions for these markers in the shared Spike governance source:

```text
threat/trust boundary
Governance Gate
Security Boundary
THREAT_MODEL_EXPANSION
FUTURE_HARDENING
```

Do not require identical explanatory sentences.

- [ ] **Step 2: Run RED**

```bash
npm run docs:test
```

Expected: FAIL because shared Spike governance does not yet state the new admission boundary.

- [ ] **Step 3: Extend shared Spike governance minimally**

Require each future Spike contract/plan to identify, using prose/existing structure rather than a new schema entity:

```text
current trust assumptions
in-scope adversaries/failures
explicitly out-of-scope adversaries/failures
current gate class
allowed effects
forbidden effects
```

Add the rule:

```text
review finding
→ classify against frozen Spike authority/threat model
→ Correction only if admitted
→ Decision/Replan for threat-model expansion
→ Follow-up/Deferred for non-deciding hardening
```

Preserve all existing contract-before-candidate, fairness, Evidence and no-test-weakening rules.

- [ ] **Step 4: Update ARR tracking and AGENTS current path**

Record only current governance truth:

```text
ARR-S0 Task 11: Replan decision accepted; implementation correction still gated
non-forgeability: threat-model expansion, not current S0 correction
final source re-observation: admitted current S0 correction
Task 12: not authorized
```

Do not claim Task 11 complete.

- [ ] **Step 5: Full canonical verification**

```bash
npm run docs:test
npm run docs:check
npm run verify
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add \
  docs/spikes/ARR-SPIKE-GOVERNANCE.md \
  docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md \
  AGENTS.md \
  scripts/test-documentation-tooling.mjs
git commit -m "docs: bound spike review findings to accepted threat models"
```

**Tranche termination:**

After Task 3, stop. Do not implement Task 4 from the same gate.

Required output before the next gate:

```text
exact Tasks 1–3 head SHA
full npm run verify SUCCESS workflow/run
canonical Decision ID
changed-file list
confirmation: no S0 production source changed
```

Canonical integration/acceptance must be explicit before `GATE-CPR-S0-CORRECTION`.

---

## Task 4: Apply the one admitted ARR-S0 correction and align authority terminology

**Prerequisite:** Tasks 1–3 authority is integrated/accepted and a separate exact `GATE-CPR-S0-CORRECTION` binds that canonical authority plus the S0 correction base.

**Files:**
- Modify: `spikes/arr-s0/tests/service-ordering-filesystem.test.mjs`
- Modify: `spikes/arr-s0/src/service.mjs`
- Modify: `spikes/arr-s0/src/execution-authority.mjs`
- Modify: `spikes/arr-s0/tests/execution-authority.test.mjs`
- Modify: `spikes/arr-s0/tests/execution-authority-surface.test.mjs`
- Modify: `docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md`
- Modify: `spikes/arr-s0/README.md`
- Modify: `docs/tracking/STATUS.md`

**Interfaces:**
- Consumes: accepted proportionality authority; current ARR-S0 harness; current exact S0 execution-authority token format.
- Produces: source identity revalidated immediately before first durable run Evidence; governance-token terminology that does not claim cryptographic/non-forgeable authentication.

### 4A — RED: prove the stale-source pre-write defect

- [ ] **Step 1: Add one focused failing test**

Extend `service-ordering-filesystem.test.mjs` with a test named exactly:

```js
test('run re-observes source after preflight inspection before first Evidence write', async () => {
  // Arrange preflight with AUTHORIZED_SOURCE.
  // Inject finalSourceObserver returning DRIFTED_SOURCE.
  // Assert run rejects before state/created.json exists.
});
```

The implementation seam should be a single optional `finalSourceObserver` dependency on `runS0`, defaulting to the existing read-only repository observer. The test must assert:

```text
preflight succeeds
run-root filesystem succeeds
final source observer is called once
source drift causes rejection
state/created.json does not exist
collector is never called
```

Do not add a generalized multi-phase source-monitor abstraction.

- [ ] **Step 2: Run targeted RED**

```bash
node --test spikes/arr-s0/tests/service-ordering-filesystem.test.mjs
```

Expected: FAIL because `runS0` does not yet perform the final observation/injected seam.

### 4B — GREEN: minimum source revalidation

- [ ] **Step 3: Add the single `runS0` seam and final check**

Change the `runS0` dependency list from conceptually:

```js
runS0({
  preflight,
  observeRunRootFilesystem,
  collect,
})
```

to:

```js
runS0({
  preflight,
  observeRunRootFilesystem,
  finalSourceObserver = defaultSourceObserver,
  collect,
})
```

Immediately after successful run-root filesystem validation and **before** `createInitialRunState()` / `writeCanonicalJsonArtifact(... 'state/created.json' ...)`:

```js
const finalRepository = await finalSourceObserver({ repoRoot });
if (!finalRepository?.source?.commitSha || !finalRepository?.source?.treeSha || finalRepository.clean !== true) {
  throw new Error('ARR-S0 final source observation must establish one clean exact Git identity before Evidence creation');
}
if (
  finalRepository.source.commitSha !== source.commitSha ||
  finalRepository.source.treeSha !== source.treeSha
) {
  throw new Error('ARR-S0 source changed after preflight before Evidence creation');
}
requireExecutionAuthorization(identities, finalRepository.source);
```

Use the existing repository observer and existing authority rebind. Do not introduce hashing/signing, background monitoring or filesystem watchers.

- [ ] **Step 4: Run targeted GREEN**

```bash
node --test spikes/arr-s0/tests/service-ordering-filesystem.test.mjs
```

Expected: PASS.

### 4C — Terminology correction, not new security machinery

- [ ] **Step 5: Add RED terminology assertions**

Update the existing authority surface tests so production code/docs no longer claim the token parser provides adversarial/cryptographic authentication. Stable intended terminology:

```text
parsed execution authorization
validated execution authorization
exact-bound governance authorization
```

Do not assert ordinary explanatory sentences.

- [ ] **Step 6: Rename local implementation terminology narrowly**

Rename functions/messages only where required to remove the misleading `authenticated` claim, for example:

```text
requireAuthenticatedExecutionAuthorization
→ requireValidatedExecutionAuthorization

AUTHENTICATED_AUTHORITIES
→ VALIDATED_AUTHORITIES
```

This is a semantics-preserving rename. Keep the WeakSet/parser provenance behavior if still useful for object-shape control; do not represent it as non-forgeability.

Align S0 contract/README language to:

```text
exact-bound Governance Gate
trusted Operator + MNFS control-plane assumption
not cryptographic authentication/non-repudiation
```

- [ ] **Step 7: Run all ARR-S0 tests**

```bash
npm run test:arr-s0
```

Expected: PASS.

- [ ] **Step 8: Run full verification**

```bash
npm run verify
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add \
  spikes/arr-s0/src/service.mjs \
  spikes/arr-s0/src/execution-authority.mjs \
  spikes/arr-s0/tests/service-ordering-filesystem.test.mjs \
  spikes/arr-s0/tests/execution-authority.test.mjs \
  spikes/arr-s0/tests/execution-authority-surface.test.mjs \
  docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md \
  spikes/arr-s0/README.md \
  docs/tracking/STATUS.md
git commit -m "fix: revalidate S0 source before Evidence creation"
```

**Termination:**
- `SUCCESS`: one final Git re-observation + terminology correction; no security subsystem added.
- `REPLAN_REQUIRED`: the bounded correction cannot be expressed using the existing observer/authority seams or requires a new threat model.

---

## Task 5: Freeze exact head and perform one independent review cycle

**Prerequisite:** Task 4 exact head has full `npm run verify` SUCCESS.

**Files:**
- No production edits during active review.
- PR/tracking metadata only after review classification.

- [ ] **Step 1: Freeze review head**

Record:

```text
exact head SHA
workflow/run proving npm run verify SUCCESS
changed files since accepted S0 base
admitted Finding set
```

Do not push another implementation commit while that review is active. If the branch changes, explicitly abandon the old review before requesting another.

- [ ] **Step 2: Request fresh independent review**

Review scope must explicitly state the accepted ARR-S0 threat model and ask the reviewer to classify findings against it.

Review deciding questions:

```text
1. Does final Git source re-observation occur before first durable Evidence write?
2. Can stale/dirty/different source identity become CREATED Evidence?
3. Are current read-only/effect/environment/Evidence boundaries preserved?
4. Does documentation accurately describe the gate as governance authority rather than cryptographic authentication?
5. Did the correction add any unapproved security subsystem or broader effect?
```

- [ ] **Step 3: Classify all findings before changing code**

Every material finding gets one of:

```text
CONTRACT_VIOLATION
IMPLEMENTATION_DEFECT
DERIVED_REQUIREMENT
THREAT_MODEL_EXPANSION
FUTURE_HARDENING
```

Only the first three may become current Correction scope, and `DERIVED_REQUIREMENT` must pass material admission first.

- [ ] **Step 4: Determine Task 11 closeout**

Task 11 may close only when:

```text
no unresolved Critical/Important CONTRACT_VIOLATION
no unresolved Critical/Important IMPLEMENTATION_DEFECT
no admitted blocking DERIVED_REQUIREMENT
full exact-head verify remains SUCCESS
non-forgeability remains dispositioned as THREAT_MODEL_EXPANSION unless Operator later changes the threat model
```

Do not require zero hypothetical future-hardening suggestions.

- [ ] **Step 5: Stop before Task 12**

Even after Task 11 closeout:

```text
GATE-S0-EXECUTE = NOT AUTHORIZED
Task 12 = NOT EXECUTED
```

A later Operator decision must bind the exact accepted contract/source/verification state before the real canonical WSL2 probe.

---

## Self-review result

### Spec coverage

Covered:

- complexity burden of proof → Tasks 1–2;
- no new methodology/entity → Tasks 1–3 constraints;
- Finding admission taxonomy → Tasks 1–3 and Task 5;
- Governance Gate vs Security Boundary → Tasks 1–3;
- review-head freeze/correction batching → Task 5;
- semantic documentation tests rather than prose APIs → Tasks 1–3;
- S0 non-forgeability deferred as threat-model expansion → Tasks 1 and 4;
- final Git re-observation corrected → Task 4;
- no Ed25519/PKI/trust-root framework → Global Constraints + Task 4;
- S1/S2/S2W/S3 receive future threat-scope rule through shared Spike governance → Task 3;
- Task 12 remains separately prohibited → Global Constraints + Task 5.

### Placeholder scan

No `TBD`, implementation placeholders or unresolved function names remain. Task 4 uses existing concrete `runS0`, `defaultSourceObserver`, `requireExecutionAuthorization` and `writeCanonicalJsonArtifact` seams from the current S0 implementation.

### Scope/proportionality check

This plan deliberately avoids:

- new database/schema state;
- new domain entities;
- new dependencies;
- generic policy engines;
- cryptographic authority;
- S1/S2 implementation;
- refactoring already-green S0 artifact/process machinery.

The only production behavior change planned is one final read-only Git observation before first durable S0 Evidence creation.

## Approval and execution boundary

Plan status is `approved` version `1.0.0` as of 2026-08-08. This approval does not authorize execution.

The next exact execution gate is:

```text
GATE-CPR-CANONICAL
scope: Tasks 1–3 only
```

Tasks 4–5 remain separately unauthorized until Tasks 1–3 are accepted/integrated and a new exact correction gate is issued.

Task 12 / `GATE-S0-EXECUTE` remains separately unauthorized throughout this plan.

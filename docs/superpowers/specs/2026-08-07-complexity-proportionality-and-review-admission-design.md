---
id: DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
title: MNFS Complexity Proportionality and Review Admission Replan Design
document_type: development_governance_design
form: explanation
authority: specification
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - DOC-ARR-SPIKE-GOVERNANCE
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-08
---

# MNFS Complexity Proportionality and Review Admission Replan Design

## 1. Decision summary

ARR-S0 review exposed a governance gap: a reviewer Finding could be technically valid under a stronger hypothetical threat model and then drift directly into implementation scope.

The design response is deliberately small:

> **A good plan minimizes uncertainty; it does not maximize complexity.**

MNFS therefore keeps its existing Discovery → Decision → Execution model and adds one missing admission rule:

```text
Finding
→ classify against accepted authority/threat model
→ only admitted current requirements become Correction scope
```

This design was explicitly approved by the Operator on 2026-08-08 at reviewed head `636294c984b3ece40d2d91d9c94a9aecf16108fd`, design blob `46c0fbc28d9fcdaf19f1ecfa7a853747b910bf87`, verification workflow `31224951872` SUCCESS. Formal canonical acceptance/version promotion remains Task 1 of the separately gated reconciliation plan; this administrative approval record does not authorize those edits by implication.

This does **not** create:

- a new lifecycle;
- a complexity score;
- a policy engine;
- a new persisted domain entity;
- a generic security framework.

It clarifies D-009, D-011 and D-014, which already establish criterion-driven blocking, risk-proportional planning and named-consumer/YAGNI discipline.

---

## 2. Complexity burden of proof

Material complexity enters current scope only when it names a current benefit such as:

```text
CURRENT_CAPABILITY
CURRENT_FAILURE_MODE
CURRENT_SECURITY_RISK
CURRENT_RECOVERY_REQUIREMENT
CURRENT_EVIDENCE_REQUIREMENT
CURRENT_OPERATIONAL_SIMPLIFICATION
CURRENT_MACHINERY_ELIMINATION
```

For a material mechanism, the design/Decision must answer:

1. What current consumer, requirement, failure or risk requires it?
2. Why is the simpler alternative insufficient?
3. What implementation/operational/maintenance cost does it add?
4. Does it remove more machinery than it creates?
5. Can it stay concrete rather than becoming a framework?
6. Can it safely be deferred until a real consumer exists?

Default when no material current benefit is established:

```text
DEFER
```

There is intentionally no numerical complexity score.

---

## 3. Simplicity is not under-specification

MNFS must remain precise about what an Actor cannot reinterpret:

- correctness;
- architecture boundaries;
- authority;
- interfaces;
- state invariants;
- security/effect boundaries;
- write/resource boundaries;
- proof/Evidence obligations;
- termination/Replan conditions.

The target is:

```text
high semantic precision
+
low accidental machinery
```

Planning completeness means **no material hidden decision is accidentally delegated to the Actor**. It does not mean maximum detail, ceremony, mechanism or future hardening.

---

## 4. Finding admission

Every material review Finding is classified before implementation changes are authorized.

### `CONTRACT_VIOLATION`

Implementation contradicts an accepted requirement, criterion, contract, design or threat model.

```text
→ Correction
```

### `IMPLEMENTATION_DEFECT`

Implementation fails to preserve an already-required property, even if the exact failure case was not previously enumerated.

```text
→ Correction
```

### `DERIVED_REQUIREMENT`

A new requirement is necessary to satisfy accepted higher-level authority but was not represented explicitly.

```text
→ materiality/admission
→ update authority if material
→ Correction only after admission
```

### `THREAT_MODEL_EXPANSION`

The Finding matters only if MNFS promises protection against an adversary/compromise not present in the accepted threat model.

```text
→ Discovery / Decision / Replan
```

It is not automatically a code defect.

### `FUTURE_HARDENING`

Useful defense-in-depth that does not affect current correctness, current accepted risk or deciding Evidence.

```text
→ DEFER / FOLLOW_UP / Calibration input
```

It does not block the current gate merely because it would be desirable in a stronger future system.

### Severity is not Authority

A reviewer may correctly call something P1/Critical under an assumed model while MNFS classifies it as `THREAT_MODEL_EXPANSION` against current accepted authority.

```text
severity ≠ requirement authority
```

The Finding is not ignored; it is routed to the correct loop.

---

## 5. Governance Gate versus Security Boundary

### Governance Gate

Answers:

> Has this Actor/process been authorized to advance the current workflow state?

Examples:

- plan approval;
- implementation authorization;
- bounded Architecture Spike authorization;
- integration/merge authorization where required.

Default properties:

- explicit scope;
- missing/malformed/stale authority fails closed;
- relevant contract/source binding where required;
- auditable state/Evidence;
- trusted MNFS control-plane semantics.

A Governance Gate does **not** by default promise resistance to a malicious process that can rewrite the control plane itself.

### Security Boundary

Answers:

> Even if an Actor/process is malicious or compromised, what is it technically prevented from doing?

Typical consumers:

- production credentials;
- privileged host mutation;
- destructive infrastructure;
- financial/external effects;
- secret-bearing model/provider access;
- untrusted-code isolation;
- production deployment.

Possible mechanisms include sandboxing, capability brokering, privilege separation, workload identity or cryptographic authorization **only when the current consumer/threat model justifies them**.

Default classification:

```text
workflow transition
→ GOVERNANCE GATE

adversarial credential/effect/isolation enforcement
→ SECURITY BOUNDARY
```

Review implication alone cannot promote the first into the second.

---

## 6. Review discipline

Final independent review uses an exact frozen head:

```text
READY_FOR_REVIEW
→ freeze exact head
→ complete review
→ classify/group findings
→ coherent correction cycle
→ full verification
→ fresh exact-head review when required
```

Do not keep pushing implementation commits while the same fresh review is active.

A blocking Correction should trace to at least one of:

- accepted requirement/criterion;
- accepted contract/design clause;
- accepted threat-model statement;
- admitted necessary derived requirement.

Otherwise classify the Finding before expanding implementation scope.

---

## 7. Documentation/test precision

Documentation checks should protect stable semantics and machine contracts, especially:

- IDs;
- enums;
- schemas;
- hashes;
- status/gates;
- required relationships;
- generated/source consistency;
- deliberately normative markers.

Ordinary explanatory wording should not become a byte-exact API unless the wording itself is intentionally contractual.

---

## 8. ARR-S0 disposition

### Current boundary

ARR-S0 is a read-only Architecture Spike harness under a trusted Operator + trusted MNFS governance/control-plane assumption.

Current protection includes:

- accidental/unauthorized workflow progression;
- malformed/stale/wrong-scope authority;
- source/contract mismatch;
- unauthorized host mutation;
- arbitrary shell or inherited credential/proxy environment;
- unsafe Evidence paths/filesystems;
- Evidence overwrite/tamper/integrity failure;
- false host inference;
- process/model text overriding mechanical Verdict;
- stale source identity becoming deciding Evidence.

ARR-S0 does not currently promise:

- resistance to a malicious local Actor able to rewrite and execute the S0 control-plane implementation itself;
- cryptographic proof of personal Operator origin;
- non-repudiation;
- resistance to compromised kernel/root.

### Execution authorization

`GATE-S0-EXECUTE` remains required for `preflight` and `run` under the current accepted S0 direction.

It should be described as:

```text
exact-bound governance authorization
```

not as cryptographic/non-forgeable authentication.

### Non-forgeability Finding

```text
classification: THREAT_MODEL_EXPANSION
action for S0: do not add required machinery
future: DEFER until a named Security Boundary consumer exists
```

Therefore ARR-S0 does not justify:

- Ed25519 keys;
- PKI;
- signer service;
- trust-root framework;
- generic signed capabilities.

### Final Git re-observation Finding

The run records exact commit/tree as deciding Evidence. If source can change after initial preflight but before the first durable Evidence write, stale identity can be persisted.

```text
classification: IMPLEMENTATION_DEFECT
action: bounded Correction required
```

The correction is one final read-only Git source re-observation/revalidation at the pre-write boundary. Exact implementation remains separately gated.

### Existing useful hardening

Do not remove existing protection merely to make the diff smaller. Keep working machinery when it directly implements current requirements, including non-mutating Git observation, Linux-owned Evidence filesystems, bounded shell-free subprocesses, explicit environment, immutable publication, integrity verification, recovery/report and mechanical Verdict.

Simplification also carries churn/regression cost.

---

## 9. Application to later ARR Spikes

Future S0/S1/S2/S2W/S3 contracts/plans should state, using existing document structure rather than a new entity:

```text
current trust assumptions
in-scope adversaries/failures
out-of-scope adversaries/failures
gate class
allowed effects
forbidden effects
```

Risk proportionality means the amount of rigor can increase when the actual consumer/effect surface increases.

Examples:

- S1 executes a real Agent Runtime, so process death/cancellation/credential concerns may be stronger than S0;
- S2 is specifically an Execution Environment/security-boundary Spike, so adversarial isolation is a current consumer;
- S3 inherits the strongest accepted boundary of the components it composes.

This rule prevents a low-risk host-fact probe from being reviewed as if it were already the final production sandbox while preserving strong security where it belongs.

---

## 10. Minimal canonical reconciliation if accepted

The subsequent separately authorized implementation plan should make only these coherent changes:

1. record this accepted Decision in `TRACKING-DECISIONS`;
2. strengthen Development Governance with complexity burden + Finding admission;
3. strengthen MCRM R3/R5/R6 at existing decision points;
4. clarify the accepted Layered Planning design without adding a new layer;
5. extend shared ARR Spike Governance with explicit threat/trust boundaries and Finding admission;
6. align ARR-S0 terminology from authentication claims to Governance Gate semantics;
7. implement only final Git source re-observation as the admitted S0 code correction;
8. perform one frozen-head independent review cycle;
9. stop before real S0 host execution.

No automatic merge/delivery, S1/S2/S2W/S3 execution, production Worker dispatch or `GATE-S0-EXECUTE` is authorized by accepting this design.

---

## 11. Graduation

This Replan design is ready for canonical acceptance when the Operator agrees that:

- complexity has an explicit current-benefit burden of proof;
- planning precision is preserved;
- reviewer severity is separated from requirement authority;
- Findings are classified before Correction;
- Governance Gates and Security Boundaries are distinct;
- later Spikes state their threat/trust scope;
- S0 non-forgeability is classified as threat-model expansion rather than mandatory machinery;
- final Git re-observation remains a real S0 defect to correct;
- no new methodology/entity/security framework is introduced;
- Task 12 remains separately unauthorized.
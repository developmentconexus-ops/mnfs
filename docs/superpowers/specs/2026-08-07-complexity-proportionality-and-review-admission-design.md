---
id: DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
title: MNFS Complexity Proportionality and Review Admission Replan Design
document_type: development_governance_design
form: explanation
authority: specification
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - DOC-ARR-SPIKE-GOVERNANCE
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - DOC-ARR-S0-HOST-CAPABILITY-CONTRACT
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-07
---

# MNFS Complexity Proportionality and Review Admission Replan Design

## 1. Purpose

This design is a bounded Replan triggered by ARR-S0 review experience.

The objective is **not** to weaken MNFS planning, validation, Evidence, gates or independent review. The objective is to prevent rigorous planning and adversarial review from silently increasing product scope, threat model, permanent ceremony or implementation machinery without a proportional current benefit.

The governing principle is:

> **A good plan minimizes uncertainty; it does not maximize complexity.**

Equivalent operational rule:

> **Planning completeness means that material decisions are not left accidentally to the Actor. It does not mean that every conceivable failure, threat or future abstraction must be implemented now.**

This design strengthens rules already present in D-011, D-014, the Development Governance Method, MCRM and Layered Agent Execution Planning. It does not create a new development lifecycle, a new complexity framework or a new permanent domain entity.

---

## 2. Triggering finding

ARR-S0 began as a bounded host-capability question:

```text
What physical capabilities and broad capability classes
are actually observable on the canonical Ubuntu WSL2 host?
```

The accepted direction intentionally prohibited candidate execution, host remediation, installation, runtime selection and production Worker dispatch.

During deterministic hardening and repeated independent reviews, several useful implementation defects were found. However, one review thread exposed a different class of concern:

```text
Operator authorization token is reconstructible
→ therefore a malicious caller could self-authorize
→ therefore authorization should be non-forgeable
→ therefore an independent signer/trust root may be required
```

That concern is valid **only under a stronger threat model than the one previously stated for ARR-S0**.

The design error was not performing an adversarial review. The error was allowing reviewer severity to risk becoming an implicit requirement-authoring mechanism.

A review finding must not silently transform:

```text
workflow/governance authority
```

into:

```text
adversarial security enforcement
```

without an explicit Decision that expands the threat model and accepts the resulting complexity.

---

## 3. Existing authority already points in the correct direction

This Replan preserves and makes operational several existing rules:

- D-011: planning rigor remains proportional to risk;
- D-014: every material realization needs a named consumer and generic abstraction is rejected without a second real consumer;
- Development Governance: global search stops at diminishing decision value rather than maximizing research volume;
- MCRM R5: no speculative platform work;
- Layered Agent Execution Planning: planning defines invariants and evidence boundaries without unnecessary permanent ceremony;
- ARR Program: semantics remain provider-neutral while implementations remain concrete; speculative provider frameworks are prohibited.

The missing piece is an explicit **admission rule between Finding and Correction**.

---

## 4. Complexity burden of proof

Complexity is not presumed good merely because it is defensive, general or technically sophisticated.

A material mechanism may be admitted into current scope only when it can name at least one current justification:

```text
CURRENT_CAPABILITY
CURRENT_FAILURE_MODE
CURRENT_SECURITY_RISK
CURRENT_RECOVERY_REQUIREMENT
CURRENT_EVIDENCE_REQUIREMENT
CURRENT_OPERATIONAL_SIMPLIFICATION
CURRENT_MACHINERY_ELIMINATION
```

For the proposed mechanism, the Decision/Design must answer:

1. **What named current consumer requires it?**
2. **What accepted requirement, criterion, failure mode or threat does it address?**
3. **Why is the simpler alternative insufficient for that current need?**
4. **What implementation, operational and maintenance cost does it add?**
5. **Does it eliminate more machinery than it introduces?**
6. **Can it remain concrete rather than becoming a generic framework?**
7. **Can the decision be deferred safely until a real consumer exists?**

There is no numerical complexity score. False precision would create ceremony rather than judgment.

The default is:

```text
if current benefit is not material and named
→ DEFER
```

---

## 5. Simplicity is not under-specification

The proportionality rule must not be used to justify vague plans.

MNFS still freezes what an Actor must not reinterpret:

- correctness;
- architecture boundaries;
- authority;
- interfaces;
- state invariants;
- security/effect boundaries;
- write/resource boundaries;
- proof and Evidence obligations;
- termination/Replan conditions.

MNFS should **not** freeze unnecessary local tactics when an Actor can safely adapt them inside those bounds.

The target is:

```text
high semantic precision
+
low accidental machinery
```

not:

```text
low detail everywhere
```

---

## 6. Finding admission model

Every material review Finding is classified before implementation changes are authorized.

### 6.1 CONTRACT_VIOLATION

The implementation contradicts an accepted requirement, criterion, contract, design or threat model.

Disposition:

```text
Finding
→ Correction
→ proof
→ fresh review
```

Reviewer severity may block acceptance when the violated authority is deciding.

### 6.2 IMPLEMENTATION_DEFECT

The implementation fails to preserve an already-required property even when the exact failure case was not previously enumerated.

Examples:

- evidence claims source identity that can become stale during the same run;
- subprocess environment leaks credentials despite an explicit closed-environment boundary;
- artifact publication violates accepted immutability semantics.

Disposition:

```text
Finding
→ Correction
```

### 6.3 DERIVED_REQUIREMENT

A new requirement is genuinely necessary to satisfy accepted higher-level authority, but it was not represented explicitly.

Disposition:

```text
Finding
→ classify materiality
→ update requirement/design authority if material
→ Correction only after admission
```

### 6.4 THREAT_MODEL_EXPANSION

The Finding is important only if MNFS promises protection against an adversary or compromise not present in the accepted threat model.

Examples:

- trusted governance token must resist deliberate forgery by a malicious local Actor;
- reviewed harness must remain secure even if the same Actor can rewrite the harness implementation;
- local read-only Spike authorization must have cryptographic non-repudiation.

Disposition:

```text
Finding
→ Discovery / Decision / Replan
→ compare proportional alternatives
→ explicit Operator approval if material
```

It is **not** an automatic implementation correction.

### 6.5 FUTURE_HARDENING

The Finding proposes useful defense-in-depth but does not affect current correctness, current risk acceptance or a deciding criterion.

Disposition:

```text
DEFER / FOLLOW_UP / calibration input
```

It cannot block the current gate merely because it is desirable in a stronger future system.

### 6.6 Reviewer severity does not create Authority

A reviewer may correctly label a scenario P1/Critical under its assumed threat model while the governance system classifies the scenario as `THREAT_MODEL_EXPANSION` relative to current authority.

The correct response is not to ignore the reviewer. It is to route the Finding to the correct loop.

```text
severity
≠ requirement authority
```

---

## 7. Governance Gate versus Security Boundary

MNFS distinguishes two concepts.

### 7.1 Governance Gate

A Governance Gate answers:

> Has the current Actor/process received authority to advance this workflow state?

Typical examples:

- approve a plan;
- authorize implementation;
- authorize a bounded Architecture Spike;
- approve integration;
- approve merge/delivery where required.

Default properties:

- explicit authority;
- exact scope;
- stale/malformed/missing authority fails closed;
- binding to relevant contract/source identity when required;
- auditable state/Evidence;
- trusted MNFS control-plane semantics.

A Governance Gate does **not** by default promise that a malicious process with the ability to rewrite the control plane cannot forge or bypass it.

### 7.2 Security Boundary

A Security Boundary answers:

> Even if an Actor/process is malicious or compromised, what operation is it technically prevented from performing?

Typical consumers may include:

- production credentials;
- privileged host mutation;
- destructive infrastructure operations;
- financial/external effects;
- secret-bearing model/provider access;
- untrusted code isolation;
- production deployment.

Possible mechanisms may include sandboxing, brokered capabilities, OS/process isolation, privilege separation, policy engines, workload identity or cryptographic authorization.

The mechanism is selected only after the threat model and current consumer justify it.

### 7.3 Default classification rule

Unless an accepted requirement explicitly says otherwise:

```text
workflow transition gate
→ GOVERNANCE GATE

adversarial effect/credential/isolation enforcement
→ SECURITY BOUNDARY
```

No gate is promoted from the first category to the second by review implication alone.

---

## 8. Review lifecycle discipline

Repeated review remains required where current authority requires it, but review itself must not create unbounded churn.

### 8.1 Exact-head freeze

When a bounded unit enters final independent review:

```text
READY_FOR_REVIEW
→ exact head frozen
→ reviewer completes
→ findings grouped/classified
```

Do not keep changing the reviewed branch while waiting for that same fresh review except to abort that review intentionally.

### 8.2 Correction batch

After review:

```text
admitted findings
→ one coherent correction cycle
→ deciding proofs
→ full verification
→ new exact-head fresh review when required
```

This prevents a loop where every small commit invalidates the current reviewer and generates another partially overlapping review.

### 8.3 Finding traceability

A blocking correction should point to at least one of:

- accepted requirement/criterion;
- accepted contract/design clause;
- accepted threat-model statement;
- necessary derived requirement admitted through Decision/Replan.

If none exists, the Finding must be classified before it can become blocking implementation scope.

---

## 9. Documentation and test precision

MNFS documentation checks should protect semantics and machine contracts, not arbitrary prose.

Prefer exact tests for:

- IDs;
- enums;
- schema;
- hashes;
- status;
- gates;
- required relations;
- generated/source consistency;
- normative markers whose exact wording is intentionally contractual.

Avoid treating ordinary explanatory sentence wording as a stable API unless exact text is itself required.

This does not authorize weakening existing deciding schema/contract tests.

---

## 10. ARR-S0 application

This Replan gives ARR-S0 a bounded threat model and Finding disposition without yet changing production code.

### 10.1 ARR-S0 current trust/threat boundary

ARR-S0 is a **read-only Architecture Spike harness** operating under a trusted Operator + trusted MNFS governance/control-plane assumption.

It must protect against:

- accidental or unauthorized workflow progression;
- missing, malformed, stale or incorrectly scoped execution authority;
- source/contract mismatch;
- host mutation outside the accepted contract;
- arbitrary shell execution;
- inherited credential/proxy/environment leakage;
- unsafe Evidence paths/filesystems;
- Evidence overwrite/tamper/integrity failure;
- false/inferred host facts represented as stronger truth;
- process/model narrative overriding mechanical Verdict;
- stale source identity being recorded as current Evidence.

ARR-S0 does **not** currently promise protection against:

- a malicious local Actor that can rewrite the reviewed MNFS/S0 control-plane implementation and then execute the modified bytes;
- cryptographic proof that the human Operator personally originated an execution decision;
- non-repudiation;
- a compromised operating system/kernel/root account.

Those are separate security requirements if a future consumer needs them.

### 10.2 Current execution authorization disposition

`GATE-S0-EXECUTE` remains required before `preflight` or `run` because both perform real host observation under the accepted S0 contract.

The current authorization should be described as an **exact-bound governance authorization**, not as cryptographic authentication.

Required properties remain:

- explicit Operator-issued gate value through the control-plane channel;
- exact plan/contract/source/verification binding defined by the accepted S0 contract;
- fail closed on missing/malformed/stale/differently scoped authority;
- no propagation of the raw authorization into probe subprocesses;
- durable Evidence may retain a non-secret hash-bound authority projection.

No Ed25519 keypair, PKI, signer service, signed capability framework or generic cryptographic authority subsystem is justified for ARR-S0.

### 10.3 Current non-forgeability review Finding

Disposition:

```text
classification: THREAT_MODEL_EXPANSION
current S0 action: REJECT as required S0 machinery
future action: DEFER until a named adversarial Security Boundary consumer exists
```

This does not declare the reviewer technically wrong. It declares that the proposed guarantee is outside the accepted proportional S0 threat model.

### 10.4 Final Git re-observation Finding

A run that records exact source commit/tree as deciding Evidence must not persist stale source identity if the checkout changes after the initial source observation but before Evidence creation.

Disposition:

```text
classification: IMPLEMENTATION_DEFECT
current S0 action: CORRECTION REQUIRED
```

The bounded correction is to re-observe/revalidate source identity at the final pre-write boundary before the first durable run Evidence is created. Exact implementation belongs in a later approved correction plan.

### 10.5 Existing hardening

Existing correct hardening is not removed merely to reduce line count.

Retain where it directly supports accepted current properties:

- non-mutating Git observation;
- Linux-owned state/run filesystem validation;
- shell-free bounded subprocesses;
- explicit subprocess environment;
- no-replace immutable artifact publication;
- exact restrictive artifact modes where already part of the accepted Evidence design;
- hash/size integrity checks;
- run-ID recovery/report behavior;
- provider-neutral observations/classes;
- mechanical Verdict.

Simplification is not reverse gold-plating. Removing working protection also has churn, regression and maintenance cost.

---

## 11. Application to ARR-S1 / S2 / S2W / S3

Every future Architecture Spike plan/contract should state, in prose or existing contract structure rather than a new domain entity:

```text
current threat/trust boundary
current gate class
allowed effects
forbidden effects
which adversaries/failures are in scope
which are explicitly out of scope
```

This prevents independent reviewers from accidentally reviewing a local experimental harness as if it were already the final production security boundary.

The rule is still fail-closed inside the declared boundary.

Examples:

- S1 runtime conformance may need stronger process-death/cancellation/credential-boundary analysis than S0 because it executes an agent runtime;
- S2 execution envelope is explicitly a security-boundary Spike and therefore warrants adversarial isolation requirements;
- S3 composition validates the selected boundaries together and may inherit the strongest accepted threat model of its components.

Risk-proportional planning therefore permits **more** rigor where the consumer and effect surface justify it, while keeping low-risk stages small.

---

## 12. Proposed canonical changes if this design is approved

Approval of this design would authorize preparation of a separate implementation/documentation plan, not direct edits under the current S0 implementation gate.

The plan should make the smallest coherent changes necessary:

1. strengthen `DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD` with the Complexity Burden of Proof and Finding Admission rule;
2. strengthen MCRM R3/R5/R6 so material new complexity and review findings are admitted/classified before becoming execution scope;
3. revise `DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` only where needed to state the proportionality/review-admission clarification without creating another layer;
4. revise `DOC-ARR-SPIKE-GOVERNANCE` to require an explicit bounded threat/trust statement and Finding-to-Correction admission;
5. revise the proposed ARR-S0 contract wording from cryptographic-style `authenticated` authority language to exact-bound Governance Gate language;
6. apply only the admitted S0 implementation correction for final Git re-observation and any mechanically necessary tests/docs;
7. do not implement Ed25519, PKI, signer/trust-root services or a generic capability-token framework;
8. avoid unrelated deletion/refactoring of already-green S0 hardening unless a specific maintenance burden is demonstrated.

No new Decision ID is created by this proposal. Operator acceptance is required before the canonical documents are changed.

---

## 13. Non-goals

This design does not:

- weaken independent review;
- remove Evidence hashing/integrity;
- permit Workers to reinterpret architecture;
- permit silent threat-model changes;
- authorize Task 12 / real ARR-S0 host execution;
- authorize candidate execution or selection;
- authorize S1/S2/S2W/S3 execution;
- authorize production Worker dispatch;
- authorize merge/delivery;
- define the final production MNFS security architecture;
- decide that cryptographic authorization is never useful;
- introduce a numeric complexity budget;
- introduce a new permanent lifecycle or domain entity.

---

## 14. Acceptance criteria for this design

This design is ready for Operator acceptance when all of these are true:

- rigorous planning and proportional complexity are shown as compatible, not opposing goals;
- a material review Finding cannot become implementation scope solely because of reviewer severity;
- contract/implementation defects remain directly correctable;
- material derived requirements and threat-model expansions route through Decision/Replan;
- Governance Gates and adversarial Security Boundaries are distinguished;
- ARR-S0 explicitly remains a Governance Gate problem, not a cryptographic operator-authentication problem;
- the non-forgeability Finding is classified as a threat-model expansion rather than silently waived;
- final Git re-observation remains an admitted S0 correctness correction;
- future higher-risk Spikes can still adopt stronger defenses when their named consumer/threat model justifies them;
- the proposal adds no new methodology or generic framework.

---

## 15. Proposed Decision

If accepted, the intended Decision is:

> MNFS adopts **risk-proportional complexity and explicit Finding admission** as clarifications of D-010 through D-016. Planning completeness means freezing material correctness, authority, boundaries and proof without maximizing implementation ceremony. Every material new mechanism must name a current capability/failure/risk and explain why the simpler alternative is insufficient. Independent review findings are classified against accepted authority before becoming Correction scope; new material requirements and threat-model expansions return to Discovery/Decision/Replan. Governance Gates provide trusted workflow authority by default and become adversarial Security Boundaries only when an accepted threat model requires technical enforcement. For ARR-S0, cryptographic non-forgeability is not a current requirement; Ed25519/PKI/trust-root machinery is deferred. Final pre-write Git source re-observation remains a required correctness correction. No Task 12 or later Spike execution is authorized by this Decision.

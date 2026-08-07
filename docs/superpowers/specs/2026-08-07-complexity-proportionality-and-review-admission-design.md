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
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - DOC-ARR-S0-HOST-CAPABILITY-CONTRACT
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-07
---

# MNFS Complexity Proportionality and Review Admission Replan Design

## 1. Decision summary

ARR-S0 review exposed a governance gap: a reviewer Finding could be technically valid under a stronger hypothetical threat model and then drift directly into implementation scope.

MNFS should prevent that without weakening rigorous planning or review.

The governing principle is:

> **A good plan minimizes uncertainty; it does not maximize complexity.**

Planning completeness means freezing the material correctness, authority, boundaries and proof an Actor must not reinterpret. It does **not** mean implementing every conceivable defense, future abstraction or reviewer-imagined threat.

This is a clarification of existing MNFS policy, not a new lifecycle or framework.

Existing authority already points here:

- D-009: supplemental hardening is not automatically blocking unless it is required by deciding criteria/authority;
- D-011: planning rigor remains proportional to risk;
- D-014: material machinery needs a named consumer and generic abstraction is rejected without a second real consumer;
- Development Governance: research stops at diminishing decision value;
- MCRM R5: no speculative platform work;
- Layered Execution Planning: freeze invariants and Evidence boundaries while keeping legitimate tactics adaptive.

The missing rule is explicit admission between:

```text
Finding
→ Correction
```

---

## 2. Trigger

ARR-S0 answers one bounded question:

> What physical capabilities and broad capability classes are observable on the canonical Ubuntu WSL2 host?

It is read-only by design and does not authorize candidate execution, installation, host remediation, runtime selection or production Worker dispatch.

A late review Finding argued that the S0 Operator gate was reconstructible and therefore should be non-forgeable through an independent trust root/signature.

That would be required only if ARR-S0 promised protection against a malicious local Actor deliberately forging Operator identity or bypassing a control plane it can modify.

That adversary was not part of the accepted S0 problem.

The Finding is useful; silently converting it into PKI/Ed25519 machinery would not be.

---

## 3. Complexity burden of proof

A material mechanism enters current scope only when it names a **current** benefit such as:

- required product capability;
- accepted failure/recovery mode;
- accepted security threat;
- deciding Evidence property;
- meaningful operational simplification;
- meaningful machinery elimination.

Before admitting the mechanism, answer:

1. What current consumer/requirement needs it?
2. What concrete failure/risk does it prevent?
3. Why is the simpler alternative insufficient?
4. What implementation/maintenance/operational cost does it add?
5. Does it eliminate more machinery than it introduces?
6. Can it remain concrete instead of becoming a framework?
7. Can the decision safely wait for a real consumer?

No numeric complexity score is introduced.

Default:

```text
no material current benefit
→ DEFER
```

Simplicity is not permission for vague plans. MNFS still specifies correctness, architecture, authority, interfaces, state/security/effect boundaries, write/resource constraints, proof and termination precisely.

Target:

```text
high semantic precision
+
low accidental machinery
```

---

## 4. Review Finding admission

A material Finding is classified against accepted authority before it becomes implementation scope.

| Class | Meaning | Default route |
|---|---|---|
| Existing-authority defect | Violates accepted requirement, criterion, contract, design or required property | Correction |
| Derived requirement | Newly discovered requirement is necessary to satisfy accepted higher-level authority | Decision/admission, then Correction |
| Threat-model expansion | Requires protection against an adversary/compromise not in accepted threat model | Discovery/Decision/Replan |
| Future hardening | Useful defense-in-depth but not required for current correctness/risk | Defer/follow-up |

Examples of existing-authority defects:

- Evidence records stale source identity even though exact source identity is required;
- subprocess environment leaks credentials despite an explicit closed-environment contract;
- immutable Evidence publication can overwrite a conflicting destination.

Examples of threat-model expansion:

- a governance token must cryptographically prove which human issued it;
- a local read-only Spike must remain secure after a malicious Actor rewrites its own control-plane implementation;
- every workflow approval must provide non-repudiation.

A reviewer may correctly rate a scenario P1/Critical under its assumed model while MNFS classifies it as a threat-model expansion relative to current authority.

The Finding is not ignored; it is routed correctly.

> **Reviewer severity does not create requirement authority.**

A blocking Correction should therefore trace to an accepted requirement/criterion, contract/design clause, accepted threat model, or a newly admitted derived requirement.

---

## 5. Governance Gate versus Security Boundary

### Governance Gate

Answers:

> Has this Actor/process received authority to advance this workflow state?

Typical uses:

- approve plan/design;
- authorize implementation;
- authorize bounded Spike execution;
- approve integration/merge when required.

Default guarantees:

- explicit scope;
- missing/malformed/stale authority fails closed;
- exact binding to relevant source/contract where required;
- auditable state/Evidence;
- trusted MNFS control-plane semantics.

It does **not** automatically promise resistance to a malicious process able to rewrite/bypass that same trusted control plane.

### Security Boundary

Answers:

> Even if an Actor/process is malicious or compromised, what operation is it technically prevented from performing?

Likely consumers include:

- production credentials;
- destructive/privileged host operations;
- infrastructure/deployment effects;
- untrusted-code isolation;
- financial/external effects;
- secret-bearing provider access.

Sandboxing, brokered capabilities, privilege separation, workload identity or cryptographic authorization may be appropriate here, but only after a current threat model justifies them.

Default classification:

```text
workflow transition
→ Governance Gate

adversarial credential/effect/isolation enforcement
→ Security Boundary
```

A review comment alone cannot promote the former into the latter.

---

## 6. Review lifecycle discipline

Final review should be rigorous but bounded.

```text
READY_FOR_REVIEW
→ freeze exact head
→ complete independent review
→ group/classify findings
→ admit correction scope
→ one coherent correction cycle
→ deciding proofs + full verification
→ new exact-head review when required
```

Do not keep mutating the same head while its fresh review is in progress unless that review is intentionally abandoned.

This avoids repeated stale reviews and piecemeal correction churn.

Documentation tests should protect contractual semantics—IDs, enums, schema, hashes, statuses, gates, required relations and intentionally normative markers—rather than make ordinary explanatory prose an accidental API.

---

## 7. ARR-S0 disposition

### 7.1 Current threat/trust boundary

ARR-S0 is a read-only Architecture Spike under a trusted Operator + trusted MNFS governance/control-plane assumption.

It must protect against current risks including:

- unauthorized/accidental workflow progression;
- missing, malformed, stale or wrong-scope authority;
- source/contract mismatch;
- host mutation outside contract;
- arbitrary shell/inherited credential/proxy leakage;
- unsafe Evidence paths/filesystems;
- Evidence overwrite/tamper/integrity failure;
- false host inference or narrative overriding mechanical Verdict;
- stale source identity recorded as deciding Evidence.

It does not currently promise protection against:

- a malicious Actor that can rewrite and execute modified MNFS/S0 control-plane bytes;
- cryptographic proof of the human Operator's identity/origin;
- non-repudiation;
- compromised kernel/root.

### 7.2 `GATE-S0-EXECUTE`

Keep it as an **exact-bound Governance Gate**.

`preflight` and `run` remain separately unauthorized until that gate because both perform real host observation under the current S0 contract.

Keep:

- explicit bounded Operator authority through the control-plane channel;
- plan/contract/source/verification binding required by the accepted contract;
- fail-closed validation;
- no raw authority propagation into probe subprocesses;
- non-secret hash-bound authority projection in Evidence where useful.

Do not describe the parser/binding step as cryptographic origin authentication.

Do not add Ed25519, PKI, signer services, trust-root infrastructure or a generic signed-capability framework to S0.

### 7.3 Current independent-review findings

**Non-forgeable Operator authorization**

```text
class: Threat-model expansion
S0 disposition: not admitted
future: defer until a named adversarial Security Boundary consumer requires it
```

The reviewer concern remains recorded; it is not self-waived.

**Final Git/source re-observation before durable Evidence**

```text
class: Existing-authority defect
S0 disposition: correction required
```

S0 claims exact source identity. If the checkout changes after initial observation but before first durable run Evidence, the recorded identity can be stale. Re-observe/revalidate at the final pre-write boundary in the later approved correction plan.

### 7.4 Existing hardening

Do not remove working protection merely to reduce line count.

Retain hardening that directly serves accepted S0 properties, including non-mutating Git observation, Linux-owned Evidence filesystem checks, bounded shell-free subprocesses, explicit subprocess environment, no-replace artifact publication, integrity verification, durable run/report recovery, provider-neutral host facts/classes and mechanical Verdict.

Simplification is not reverse gold-plating; removal also has churn and regression cost.

---

## 8. Future ARR Spikes

S1/S2/S2W/S3 plans/contracts should state their bounded trust/threat boundary using existing document structure—not a new domain entity or framework—including:

- gate class;
- allowed/forbidden effects;
- adversaries/failures in scope;
- explicit out-of-scope threats.

Risk-proportionality can therefore increase rigor where warranted:

- S1 executes an Agent Runtime and may need stronger process/cancellation/credential analysis than S0;
- S2 evaluates the Execution Environment as an actual security boundary and therefore warrants adversarial isolation proof;
- S3 validates composition of the selected boundaries.

The rule is not “always simpler.” It is **complexity proportional to the real consumer and risk**.

---

## 9. Canonical change set if approved

Approval of this design authorizes preparation of a separate plan, not direct implementation.

That plan should make the smallest coherent changes:

1. Development Governance: add Complexity Burden of Proof + Finding Admission;
2. MCRM R3/R5/R6: require material complexity/finding admission before execution scope expands;
3. Layered Execution Planning: add only the necessary proportionality/review clarification;
4. ARR Spike Governance: require bounded threat/trust statement and Finding admission;
5. ARR-S0 contract: replace cryptographic-style `authenticated` wording with exact-bound Governance Gate wording;
6. ARR-S0 implementation: only the admitted final Git re-observation correction plus mechanically necessary tests/docs;
7. no Ed25519/PKI/trust-root/signed-capability implementation;
8. no unrelated refactor/removal of already-green hardening without demonstrated maintenance benefit.

No new Decision ID is created by this proposal itself.

---

## 10. Non-goals

This design does not:

- weaken independent review or Evidence integrity;
- permit Workers to reinterpret architecture;
- authorize silent threat-model changes;
- authorize Task 12 / `GATE-S0-EXECUTE`;
- authorize S1/S2/S2W/S3 execution;
- authorize production Worker dispatch or merge/delivery;
- define final production MNFS security architecture;
- claim cryptographic authorization is never useful;
- introduce a numeric complexity budget, new lifecycle or permanent domain entity.

---

## 11. Proposed Decision

If accepted:

> MNFS adopts risk-proportional complexity and explicit Finding admission as clarifications of D-009 through D-016. Planning completeness means freezing material correctness, authority, boundaries and proof without maximizing implementation ceremony. Material new mechanisms must name a current capability/failure/risk and explain why the simpler alternative is insufficient. Review findings are classified against accepted authority before becoming Correction scope; material derived requirements and threat-model expansions return to Decision/Replan. Governance Gates provide trusted workflow authority by default and become adversarial Security Boundaries only when an accepted threat model requires technical enforcement. For ARR-S0, cryptographic non-forgeability is not a current requirement and Ed25519/PKI/trust-root machinery is deferred; final pre-write Git source re-observation remains a required correctness correction. No real S0 or later Spike execution is authorized by this Decision.

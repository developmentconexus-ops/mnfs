---
id: DESIGN-RISK-PROPORTIONAL-EXECUTION-GOVERNANCE
title: MNFS Risk-Proportional Execution and Governance Design
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
  - DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-08
---

# MNFS Risk-Proportional Execution and Governance Design

## 1. Decision summary

MNFS must preserve correctness, security, independent proof and governed architecture while reducing process latency caused by applying high-ceremony controls to changes that do not carry high risk.

The governing principle is:

> **Use the minimum governance depth that protects the current material risk. Every human interruption, artifact and gate must justify what decision, risk or irreversible effect it protects.**

Accepted MNFS authority already establishes that planning rigor is proportional to risk, planning completeness does not mean maximum ceremony, material complexity carries a current-benefit burden of proof, reviewer severity does not independently create requirement Authority, and Governance Gates are distinct from adversarial Security Boundaries. This design adds the explicit operational profiles `FAST / BOUNDED / CONTROLLED` to make that proportionality executable in daily work.

This is a refinement of existing governance, not a second lifecycle, scoring system, FSM or policy engine.

## 2. Problem being corrected

Recent ARR/CPR work demonstrated strong technical rigor but also exposed process overhead with low information gain:

```text
Design
→ Design approval
→ Plan
→ Plan approval
→ exact execution token
→ RED commit/workflow
→ GREEN commit/workflow
→ acceptance token
→ acceptance record
→ administrative verification
→ integration token
→ merge
→ integration closeout
```

That sequence is justified only when the individual checkpoints protect distinct material decisions or effects. Applying it by default creates avoidable lead time, duplicates information already present in Git/GitHub/CI and consumes Operator attention on mechanical state propagation.

The correction is not to weaken invariants. It is to make governance depth risk-proportional.

## 3. Three execution-depth profiles

`FAST`, `BOUNDED` and `CONTROLLED` are profiles of the existing MNFS lifecycle. They are not new lifecycle states or persistent domain entities.

### 3.1 FAST

Use when the change is local, reversible, architecture-preserving and has no material external/security effect.

Typical examples:

- isolated bug fix;
- regression test;
- documentation correction;
- bounded tooling fix;
- rename;
- small refactor with unchanged contracts;
- stale projection/status correction;
- implementation detail already fully decided by accepted Authority.

Default flow:

```text
intent
→ bounded implementation
→ targeted proof
→ diff/scope audit
→ final verification/CI
→ delivery when already authorized
```

FAST normally does not require a separate Design document, Plan document, acceptance record, exact manual token or independent Reviewer unless a material concern appears.

### 3.2 BOUNDED

BOUNDED is the default for material product/engineering work when architecture and threat boundaries are already accepted.

Typical examples:

- feature implementation inside accepted architecture;
- endpoint/integration work;
- material but localized refactor;
- admitted `IMPLEMENTATION_DEFECT` correction that does not change architecture or threat model;
- realization work whose capability/contract is already decided.

Default flow:

```text
intent
→ one Execution Brief
→ one Operator approval when needed
→ Writer implementation + local proof
→ fresh review when material
→ Finding Admission
→ final CI
→ delivery if the approval envelope already includes it
```

A single Execution Brief may combine design and implementation planning when separation would not reduce material uncertainty.

### 3.3 CONTROLLED

Use when the change crosses a material architecture, security, risk, irreversibility or external-effect boundary.

Examples include:

- constitutional/product architecture change;
- new threat model or Security Boundary;
- credential authority;
- privileged host mutation;
- destructive infrastructure/database operation;
- production deployment with material external effects;
- irreversible migration;
- substrate/runtime/environment selection from deciding Evidence;
- high-stakes contract changes with broad consumers;
- acceptance of material residual risk.

CONTROLLED may retain separated Design/Decision, Plan, exact execution authority, independent validation, explicit acceptance and explicit delivery authorization when each protects a distinct material boundary.

## 4. Lane selection

The Lead selects the least-heavy profile that is sufficient for current risk.

Selection considers, qualitatively rather than through a numeric score:

- impact;
- risk;
- irreversibility;
- architectural reach;
- number and criticality of consumers;
- external effect;
- security/threat boundary;
- evidence durability requirements.

Default rules:

```text
clearly local + reversible + no material boundary → FAST
material work inside accepted boundaries           → BOUNDED
material boundary/risk/effect decision             → CONTROLLED
```

When uncertain between FAST and BOUNDED, use BOUNDED. CONTROLLED requires a named current reason.

A lane may remove accidental ceremony; it may never remove an applicable deciding obligation already frozen by higher Authority. Required correctness, architecture, threat/security boundary, proof method, independent validation, external-effect restriction or contract requirement remains binding regardless of lane.

## 5. Automatic escalation

A lane never authorizes silent scope expansion.

```text
FAST discovers material design/risk question
→ STOP
→ escalate to BOUNDED or CONTROLLED

BOUNDED discovers architecture/threat/external-effect change
→ STOP
→ escalate to CONTROLLED
```

Escalation preserves work/Evidence already valid under the narrower scope. It does not retroactively convert unauthorized work into authorized work.

## 6. Human interruption burden

Every required Operator interruption must answer:

> **What decision, risk, irreversible effect or acceptance does this human response protect?**

Valid reasons include:

- product choice;
- architecture choice;
- threat/risk acceptance;
- destructive or externally consequential action;
- production effect;
- a trade-off that policy must not delegate to an Actor.

Mechanical synchronization is not by itself sufficient reason. In FAST/BOUNDED, the Lead may resolve and bind exact Git heads, hashes, accepted authority and verification state without asking the Operator to copy machine-readable identifiers.

Natural-language approval such as `Aprovado`, `Pode executar` or equivalent is sufficient when the Lead can unambiguously bind it to the presented bounded envelope.

Exact manual tokens remain available for CONTROLLED operations where the explicit binding itself protects a material boundary.

## 7. Conditional delivery authority

For FAST and BOUNDED work, one approval may authorize implementation, review and delivery conditioned on all of the following remaining true:

```text
scope remains within the approved envelope
architecture/threat model does not change
required proof passes
material review findings are admitted/cleared
delivery target remains the approved target
no new high-risk external effect appears
```

Delivery authority must be unambiguous from the active work envelope. A request to inspect, analyze or discuss a change does not by itself authorize merge or delivery. When the Operator clearly asks to implement/finish the bounded work and delivery is part of the presented envelope, a second mechanical merge approval is unnecessary.

If any condition fails, delivery authority is suspended and the Lead escalates instead of improvising.

This removes the default need for separate implementation-acceptance-integration approvals when they protect no distinct decision.

## 8. Proof and TDD proportionality

Proof-first remains invariant. Test-first is used when executable testing is the appropriate proof method.

Observed RED is sufficient for normal FAST/BOUNDED TDD. A separate RED commit, push or failing GitHub workflow is required only when that failure is itself deciding/durable Evidence or materially improves reproducibility.

Default implementation proof loop:

```text
local targeted RED
→ minimum GREEN
→ regression/verification
→ final commit/push
→ final CI
```

This preserves TDD semantics while avoiding Git history and CI runs whose only purpose is ceremonial confirmation of a locally observable failure.

## 9. Review proportionality

### FAST

Default proof surface:

```text
Writer self-check
+ deterministic tests
+ diff/scope audit
+ final CI
```

A fresh Reviewer is optional unless the Lead identifies material uncertainty.

### BOUNDED

Default:

```text
Writer
→ fresh Reviewer
→ Finding Admission
→ final CI
```

### CONTROLLED

May require:

```text
Writer
→ independent Reviewer
→ adversarial/security review when applicable
→ deciding Evidence validation
→ explicit Operator acceptance
```

Implementer Claim remains distinct from acceptance; the amount of independent validation is what scales.

## 10. Finding Admission remains unchanged

The accepted taxonomy remains:

```text
CONTRACT_VIOLATION
IMPLEMENTATION_DEFECT
DERIVED_REQUIREMENT
THREAT_MODEL_EXPANSION
FUTURE_HARDENING
```

Classification need not create a new document. A concise review record is enough when it preserves the material disposition.

Only admitted current-scope corrections may mutate the current implementation. Threat-model expansion and non-deciding hardening do not silently become implementation requirements.

## 11. Documentation and Git as evidence

Git/GitHub/CI should carry operational facts they already record reliably:

- PR/head identity;
- commits/diffs;
- reviews;
- CI result;
- merge time and merge SHA.

MNFS documents should preserve durable knowledge that Git history alone does not answer well:

- why a material Decision was made;
- which architecture/threat model is current;
- what material risk was accepted;
- which capability/contract is authoritative;
- which deciding Evidence must remain discoverable beyond the PR.

Acceptance/integration records are therefore reserved for durable material outcomes such as milestones, architecture decisions, threat/risk acceptance, substrate selection and high-stakes deciding Evidence. They are not the default for every implementation tranche or merge.

## 12. Tracking projections

`AGENTS.md`, `STATUS.md` and review/tracking sources should not manually duplicate detailed state already available from canonical sources or Git unless Fresh Actor orientation materially requires it.

Preferred direction:

```text
canonical authority
+ Git/GitHub operational state
→ minimal projections/orientation
```

Avoid building a generalized status-generation framework unless repeated real drift demonstrates a current consumer for it.

## 13. Research proportionality

Research is required when its answer can materially change correctness, architecture, sourcing, security, compatibility or the execution envelope.

Default:

```text
FAST       → research only for material uncertainty
BOUNDED    → research material alternatives/unstable external behavior
CONTROLLED → strong research/falsification before authority freeze
```

Do not research merely to satisfy process ceremony.

## 14. Roles under the simplified method

The preferred development loop remains:

```text
Operator
→ ChatGPT Lead / Planner
→ Codex local Writer/Test Runner
→ fresh Codex Reviewer when lane requires
→ GitHub CI / durable operational evidence
→ delivery
```

The Lead owns lane selection, Authority compilation, research, Finding Admission and escalation. The Writer does not make hidden architecture/security/scope decisions.

## 15. Immediate application to ARR-S0

Under this design:

- the already-admitted ARR-S0 final source re-observation correction is expected to be `BOUNDED` because architecture/threat model/effects are already decided and the correction is narrow;
- real ARR-S0 Task 12 host observation remains `CONTROLLED` because it produces deciding canonical Evidence used by later architecture selection;
- neither classification grants execution authority before this design is integrated into canonical governance.

## 16. Non-goals

This design does not:

- weaken security boundaries;
- remove independent validation where material;
- permit production/external effects by default;
- create a numeric risk score;
- create a parallel lifecycle;
- remove R0–R8 correctness semantics;
- allow a Writer to self-authorize scope expansion;
- turn CI success into automatic product/architecture acceptance;
- eliminate durable acceptance records where they carry durable material knowledge.

## 17. Success criteria

The revised method succeeds when a normal BOUNDED change can move through:

```text
intent
→ one bounded decision/approval
→ local implementation/proof
→ fresh review
→ final CI
→ merge
```

without losing:

- accepted Authority;
- material traceability;
- proof;
- independent review where needed;
- Replan/escalation;
- threat/security boundaries;
- recovery requirements;
- durable deciding Evidence.

The method should reduce Operator interruptions and intent-to-merge lead time without increasing material defects, unauthorized scope expansion or change failure.

## 18. Adoption strategy

Adopt through the smallest coherent edits to existing authority:

1. reconcile the lane model and human-interruption rule into Development Governance;
2. operationalize risk-proportional governance depth in MCRM without changing R0–R8;
3. allow risk-proportional Execution Briefs in Layered Planning without changing L0–L3;
4. simplify `AGENTS.md` orientation enough to prevent ceremony-by-default;
5. protect only stable normative markers with documentation tests;
6. dogfood the revised BOUNDED lane on the admitted ARR-S0 correction;
7. calibrate from observed lead time, Findings and rework rather than adding speculative machinery.

No separate implementation-plan document is required unless implementation review discovers a material decision not resolved by this design.

---
id: DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
title: MNFS Development Governance Method
document_type: development_method
form: reference
authority: standard_policy
status: accepted
version: 1.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - development discovery and decision loops
  - global architecture search discipline
  - opportunity-driven replanning
  - implementation sourcing decisions
related:
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
tracking_issue: 23
last_reviewed: 2026-08-08
---

# MNFS Development Governance Method

## 1. Purpose

This method governs **how MNFS is designed and evolved as a product**.

It complements the MNFS Capability Realization Method (MCRM).

MCRM answers:

> How do we realize an accepted capability with traceability, criteria, implementation and Evidence?

This method answers the upstream question:

> How do we decide what the best current capability, architecture and realization strategy should be before execution is frozen?

The objective is to prevent two opposite failures:

```text
Not-Invented-Here
→ rebuilding mature infrastructure unnecessarily

Framework-driven architecture
→ changing product semantics to fit an available tool
```

The governing principle is:

> **Authority freezes execution, not inquiry.**

An approved Decision, Blueprint, ADR, Roadmap or Mission Contract constrains Actors executing under that authority. It does not prohibit the Lead and Operator from discovering stronger Evidence, reopening the Decision and superseding it through the correct governance path.

---

## 2. Global-optimum rule

Architecture and product discovery MUST search for the best-supported global solution, not the best solution inside assumptions inherited from a prior design.

Current documents are:

```text
accumulated knowledge
+
current authority for bounded execution
```

They are not:

```text
the boundary of the solution space
```

During Discovery and Decision:

- prior architecture is a candidate, not the default winner;
- sunk cost is not architectural justification;
- an accepted tool is not privileged merely because it was selected earlier;
- a new library or product is not privileged merely because it is feature-rich;
- current requirements may be challenged when stronger Evidence shows the underlying product need is better expressed differently;
- product intent and Operator need take precedence over preserving implementation history.

A previous Decision remains authoritative until it is explicitly superseded. Discovery may challenge it; implementation may not silently ignore it.

---

## 3. Three development loops

MNFS development separates three loops with different authority rules.

### 3.1 Discovery Loop

Purpose:

```text
understand the real problem
→ expand the candidate space
→ search for stronger solutions
```

Discovery MAY challenge:

- Blueprint clauses;
- ADRs;
- Roadmap sequence;
- Capability design;
- Mission decomposition;
- runtime choice;
- persistence strategy;
- dependency strategy;
- security boundary;
- prior implementation assumptions.

Discovery uses:

- first-principles analysis;
- source-code inspection;
- primary documentation;
- research reports;
- competing products and architectures;
- open-source implementations;
- benchmarks;
- Architecture Spikes;
- prior MNFS Evidence;
- adversarial scenarios.

Discovery MUST NOT mutate production architecture merely because a promising alternative was found.

Its output is Evidence and candidate Decisions.

### 3.2 Decision Loop

Purpose:

```text
candidate space
→ comparison
→ adversarial falsification
→ explicit choice
```

The Decision Loop:

1. states the product outcome and constraints without naming a preferred implementation;
2. identifies credible alternatives, including the current architecture;
3. separates differentiated semantics from mechanical infrastructure;
4. compares benefits, costs, risks and exit paths;
5. attacks the preferred candidate with the strongest known counterargument;
6. identifies which Evidence is fact, inference or unproven assumption;
7. decides `PRESERVE`, `SUPERSEDE`, `REPLAN`, `SPIKE`, `DEFER` or `REJECT`;
8. updates authoritative documents before bounded execution resumes.

No candidate wins because it is already implemented, fashionable, familiar or easy to describe.

#### 3.2.1 Complexity Burden of Proof

Planning completeness reduces uncertainty; it does not maximize machinery. Material complexity may enter current scope only when it names a current capability, requirement, failure mode, security risk, Recovery/Evidence obligation, operational simplification or meaningful machinery elimination.

For each material mechanism, the Decision or design MUST answer:

1. what current consumer/risk/failure requires it;
2. why the simpler alternative is insufficient for that current need;
3. what implementation, operational and maintenance cost it adds;
4. whether it eliminates more machinery than it introduces;
5. whether it can stay concrete rather than becoming a generic framework;
6. whether it can safely be deferred until a real consumer exists.

When material current benefit is not established, use `DEFER` rather than speculative implementation. There is no numerical complexity score.

#### 3.2.2 Finding Admission

A material review Finding is classified against frozen authority before it becomes Correction scope:

- `CONTRACT_VIOLATION` — contradicts an accepted requirement, criterion, contract, design or threat model; Correction is admissible.
- `IMPLEMENTATION_DEFECT` — fails to preserve an already-required property; Correction is admissible.
- `DERIVED_REQUIREMENT` — new requirement genuinely required by accepted higher authority; admit/update authority first when material, then correct.
- `THREAT_MODEL_EXPANSION` — matters only under an adversary/compromise not present in the accepted threat model; return to Discovery/Decision/Replan.
- `FUTURE_HARDENING` — useful defense-in-depth that does not affect current correctness, accepted risk or deciding Evidence; defer/follow up.

Reviewer severity is evidence of impact, not requirement Authority:

```text
severity ≠ requirement authority
```

A high-severity Finding under a stronger assumed threat model is not ignored; it is routed to the Decision Loop instead of silently expanding implementation.

#### 3.2.3 Governance Gate and Security Boundary

A **Governance Gate** asks whether the current Actor/process has explicit authority to advance a workflow state. It fails closed on missing, malformed or stale authority and binds scope/source/contract when required, but does not by default promise resistance to a malicious process able to rewrite the control plane itself.

A **Security Boundary** asks what a malicious or compromised Actor/process is technically prevented from doing. It is justified by an accepted adversarial threat model and a named current consumer such as production credentials, privileged host mutation, destructive infrastructure, external financial effects, untrusted-code isolation or production deployment.

Default classification:

```text
workflow transition → Governance Gate
adversarial credential/effect/isolation enforcement → Security Boundary
```

Review implication alone does not promote a Governance Gate into a Security Boundary.

### 3.3 Execution Loop

Purpose:

```text
approved authority
→ bounded implementation
→ verification
→ Evidence
```

Once the Decision Loop freezes the applicable authority:

- Workers do not reinterpret architecture;
- implementation follows the Approved Contract and accepted design;
- material discoveries are surfaced rather than silently incorporated;
- a new architectural finding returns control to Discovery/Decision through Replan or explicit Decision;
- Claim, Receipt and Verdict remain separate.

Execution is intentionally conservative because inquiry happened before authority was frozen.

---

## 4. Stability is not immutability

Sources have different expected rates of change.

A useful default ordering is:

```text
Operator need / product intent
        ↓ more stable
Product principles
        ↓
Domain model
        ↓
Architecture
        ↓
Roadmap
        ↓
Mission Contract
        ↓
Milestone Microdesign
        ↓ more replaceable
Implementation detail
```

This is a heuristic, not conflict precedence.

Every layer may be superseded by stronger Evidence and proper Authority.

The burden of proof increases as a proposed change moves upward toward product intent or constitutional principles.

---

## 5. Replan classes

Replan is not limited to discovering that an old plan is impossible.

### 5.1 Necessity Replan

Triggered when the current approved plan cannot safely or correctly achieve its required outcome.

Examples:

- external dependency behavior differs materially;
- security boundary cannot satisfy policy;
- required evidence cannot be produced;
- contract contains an unsatisfiable assumption;
- domain model contradicts observed reality.

### 5.2 Opportunity Replan

Triggered when the current plan remains feasible but new Evidence shows a materially better solution.

A materially better solution may improve one or more of:

- product capability;
- correctness;
- security;
- implementation leverage;
- maintainability;
- operational simplicity;
- ecosystem maturity;
- portability;
- extensibility;
- sovereignty;
- exit strategy;
- cost;
- latency;
- recovery quality;
- Evidence quality.

Opportunity Replan is justified only when the improvement is material enough to outweigh migration/integration cost and decision churn.

The fact that work was already performed is recorded as migration cost, never as a reason to prefer an inferior architecture.

---

## 6. Architecture Realization Review

An Architecture Realization Review (ARR) is the standard Decision Loop for a material implementation boundary.

It asks:

> What should MNFS own, what should it adopt or adapt, and which current assumptions should be preserved or superseded under the best Evidence available now?

### 6.1 ARR triggers

Run or refresh an ARR when:

- implementation reaches a previously conceptual boundary;
- a new external primitive materially expands the solution space;
- custom infrastructure appears likely to duplicate mature machinery;
- a current dependency creates material lock-in or authority duplication;
- a new Architecture Spike or benchmark challenges a current Decision;
- a Product Milestone would otherwise commit substantial work based on stale assumptions.

Do not run a broad ARR for trivial implementation details with no material architectural choice.

### 6.2 ARR inputs

- Operator need and product outcome;
- current Blueprint / ADR / Roadmap / Capability sources;
- current implementation and Evidence;
- prior research;
- credible external candidates;
- security and sovereignty constraints;
- known migration cost.

### 6.3 ARR outputs

- first-principles capability decomposition;
- credible candidate set;
- sourcing disposition by concern;
- comparison matrix;
- adversarial falsification of the preferred candidate;
- unresolved assumptions and required spikes;
- `PRESERVE / SUPERSEDE / REPLAN` disposition for affected authority;
- exact next gate.

---

## 7. Build, adopt and adapt discipline

For each material Design Element, classify the realization strategy.

| Disposition | Meaning |
|---|---|
| `OWN` | The semantics or Authority are differentiated MNFS product behavior. |
| `ADOPT` | An upstream primitive can be used substantially as designed. |
| `ADAPT` | Reuse upstream machinery behind an MNFS-owned boundary. |
| `SPIKE` | Candidate is promising but needs real proof before adoption. |
| `REFERENCE` | Study patterns/implementation without runtime dependency. |
| `DEFER` | No current consumer justifies a decision yet. |
| `REJECT` | Evaluated shape is materially worse or violates an invariant. |

The classification is research/decision vocabulary. It does not replace Capability requirements or adapter interfaces.

### 7.1 Before building infrastructure

Ask:

1. What named product capability consumes this machinery now?
2. Is the behavior differentiated MNFS semantics or commodity mechanics?
3. Does a mature upstream primitive already solve the mechanics?
4. Would adoption create a second source of lifecycle truth?
5. Can MNFS preserve its own Authority and Evidence model around it?
6. Can the seam be proven in the real physical boundary where required?
7. Can the dependency be removed or replaced without rewriting domain history?
8. Is integration plus maintenance cheaper than custom implementation plus maintenance?
9. Are we creating a generic abstraction before a second real consumer exists?

If no named consumer exists, defer.

If a concrete adapter serves one consumer, prefer the concrete adapter over a speculative provider framework.

---

## 8. Sovereignty and proprietary systems

Proprietary systems can be excellent research references.

They MUST NOT become foundational MNFS dependencies merely because they demonstrate a superior product experience.

Default disposition for a proprietary product runtime is:

```text
REFERENCE
```

Runtime adoption requires an explicit Decision that evaluates:

- licensing and redistribution;
- commercial dependency;
- pricing and quota risk;
- account/service availability;
- data/control-plane dependency;
- API stability;
- offline/on-prem viability;
- replacement path;
- effect on MNFS distribution and product sovereignty.

Open-source components published by a proprietary vendor are evaluated independently on their own license, maturity, architecture and exit path.

---

## 9. Global comparison function

Avoid false numerical precision when reliable measurements do not exist.

Every material candidate should nevertheless be compared across the same dimensions.

Positive dimensions:

```text
product capability
correctness
security
implementation leverage
maintainability
ecosystem maturity
portability
extensibility
sovereignty
exit strategy
observability/recovery quality
```

Cost/risk dimensions:

```text
integration complexity
duplicated authority
vendor lock-in
operating cost
security exposure
dependency instability
migration cost
maintenance tail
```

Where measurements exist, use them.

Where they do not, use explicit qualitative reasoning and state uncertainty.

A candidate with more features does not automatically win. A small primitive may be globally superior if it satisfies the named consumer with less authority duplication and lower maintenance tail.

---

## 10. Adversarial decision rule

Before approving a material architecture choice, answer:

> **What is the strongest argument that this preferred choice is wrong?**

Then test the argument against Evidence.

The review should actively search for:

- hidden assumptions;
- ignored candidate classes;
- authority inversion;
- security bypass;
- migration traps;
- optimistic maintenance estimates;
- proprietary lock-in;
- duplicated state;
- premature abstraction;
- local optimization that harms later Product Milestones.

A Decision that has only supporting arguments is not ready.

---

## 11. Search depth and stopping rule

Global search does not mean unbounded research.

Research depth follows decision proximity and expected impact.

```text
current material boundary
→ source code, exact versions, real failure modes, conformance proof where needed

next near-term capabilities
→ strong candidate comparison and seam preservation

far-future options
→ strategic map and revisit triggers, not premature vendor selection
```

Discovery may stop when:

- the required capability and constraints are explicit;
- the credible candidate classes have been covered;
- no high-impact alternative remains unexamined;
- remaining uncertainty is either low-impact or has a named Spike;
- additional research has diminishing decision value.

The purpose is to make a good Decision, not to maximize research volume.

---

## 12. Integration with MCRM

This method sits logically before and around MCRM.

```text
Discovery Loop
      ↓
Decision Loop
      ↓
Blueprint / ADR / Roadmap / Capability / Contract authority
      ↓
MCRM realization
      ↓
Execution Loop
```

MCRM gates may return to Discovery/Decision when new Evidence is material.

Examples:

```text
R0 finds stale architectural assumptions
→ ARR

R3 finds a better capability architecture
→ Decision / possible supersession

R5 discovers an upstream primitive that materially changes cost or risk
→ ARR / Opportunity Replan

R6 implementation exposes a violated assumption
→ Necessity Replan

R8 learning changes future roadmap assumptions
→ Discovery / Decision before next Milestone
```

MCRM remains the source of truth for capability realization, traceability and readiness. This method is the source of truth for how upstream architecture/product Decisions are challenged and renewed.

---

## 13. Role boundaries

### Operator

- defines product intent and material constraints;
- approves architecture trade-offs and Replans;
- may authorize Opportunity Replan when global value improves materially.

### MNFS Lead

- searches beyond the current design;
- presents competing alternatives rather than defending the incumbent;
- distinguishes Evidence, inference and assumption;
- triggers ARR when the option space changes materially;
- does not count sunk cost as technical justification.

### Architect / Reviewer

- attacks the preferred candidate;
- searches for missing alternatives and hidden coupling;
- checks sovereignty, authority and exit strategy;
- confirms that chosen abstractions have named consumers.

### Writer / Worker

- executes the current approved authority;
- does not independently supersede architecture;
- reports material discoveries back to the Lead.

---

## 14. Current application — 2026-08-07

Recent research on Mastra Software Factory, Pi runtime primitives and Factory.ai materially expanded the implementation option space for MNFS.

The correct current action is therefore:

```text
pause MIS-002/M02 microdesign as the next decision gate
→ perform a global Architecture Realization Review
→ decide the best current architecture and sourcing strategy
→ determine PRESERVE / SUPERSEDE / REPLAN impacts
→ update canonical product authority as required
→ only then resume bounded M02 design/implementation planning
```

This does not invalidate accepted M01 Evidence or silently mutate `MIS-002` revision 5.

Until a new Decision supersedes existing authority:

- M01 remains accepted;
- existing Blueprint/ADRs/MIS-002 remain historical/current authority for their existing claims;
- M02 production implementation remains prohibited;
- the next gate is architecture Discovery/Decision, not implementation.

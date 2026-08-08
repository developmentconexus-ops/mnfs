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

## 1. Decision

MNFS keeps one development lifecycle and varies only the depth of its materialization.

> **Use the minimum governance depth that protects the current material risk. Every human interruption, artifact and checkpoint must name the decision, risk or effect it protects.**

Existing authority already requires proportional rigor, Finding Admission, proof-first execution and explicit escalation. This design operationalizes that authority as:

```text
FAST       local, reversible, architecture-preserving
BOUNDED    material work inside accepted boundaries — default
CONTROLLED material architecture, threat, irreversibility or effect boundary
```

These are execution-depth profiles, not new lifecycle states, scores, schemas, FSMs or persisted domain entities.

A lane may remove accidental ceremony; it may never remove an applicable deciding obligation already frozen by higher Authority.

## 2. FAST

Use FAST when the change is clearly local, reversible and inside already-decided architecture and policy.

Default flow:

```text
intent
→ Finding Admission when the work is finding-driven
→ implementation
→ targeted proof
→ diff/scope audit
→ final verification/CI
→ delivery when already authorized
```

If FAST is initiated by or discovers a review Finding, classify that Finding before mutation. Only an already-admissible `CONTRACT_VIOLATION` or `IMPLEMENTATION_DEFECT` that stays inside the FAST envelope may be corrected there. Material ambiguity, a new requirement, threat-model expansion or scope expansion escalates before mutation.

FAST normally needs no separate Design, Plan, acceptance record, exact manual token or fresh Reviewer unless an applicable higher-authority obligation or discovered material concern requires one.

## 3. BOUNDED

BOUNDED is the default for material product/engineering work when architecture and threat boundaries are already accepted.

Default flow:

```text
intent
→ one Execution Brief
→ one Operator approval when needed
→ Writer + local proof
→ fresh review when material
→ Finding Admission
→ final CI
→ delivery only if the approved envelope includes it
```

One Execution Brief may combine design and implementation planning when separation would not reduce material uncertainty. It records only what is needed to execute and review the work:

```text
profile: BOUNDED
selection rationale
outcome + relevant Authority
scope / non-goals / known loci
material interfaces and boundaries
proof + review expectation
approval scope + delivery authority
escalation / Replan conditions
escalation outcome, only if one occurs
```

No new Brief schema or persistent entity is required by this design.

## 4. CONTROLLED

Use CONTROLLED when work crosses a material architecture, threat, irreversibility, high-stakes contract or external-effect boundary.

CONTROLLED **must retain every applicable checkpoint** when that checkpoint protects a distinct material boundary. Depending on applicability, these checkpoints include:

```text
Design / Decision
Plan
exact execution authority
independent validation
explicit acceptance
explicit delivery authority
```

A checkpoint may be omitted only when the authority that owns that boundary records a durable rationale showing that it is not applicable or that accepted Evidence makes it redundant. CONTROLLED is not a permission to maximize ceremony; it is the profile in which distinct material boundaries remain distinctly governed.

## 5. Selection and escalation

The Lead selects the least-heavy sufficient profile using qualitative factors such as impact, reversibility, architectural reach, consumer criticality, effect surface and Evidence durability.

```text
clearly local + reversible              → FAST
material inside accepted boundaries     → BOUNDED
material boundary/risk/effect decision  → CONTROLLED
```

When uncertain between FAST and BOUNDED, use BOUNDED. CONTROLLED requires a named current reason.

Lane selection is recorded only to the degree needed for reviewability:

- FAST: no new artifact merely to record `FAST`; any escalation is visible in the existing PR/Claim/handoff/work record;
- BOUNDED: profile and rationale live in the Execution Brief;
- CONTROLLED: classification/rationale live in the applicable Design/Decision authority.

Automatic escalation:

```text
FAST + material design/risk discovery        → STOP → BOUNDED or CONTROLLED
BOUNDED + architecture/threat/effect change  → STOP → CONTROLLED
```

Escalation never retroactively authorizes work performed outside the prior envelope.

## 6. Human interruption and approval

Every Operator interruption must protect a named decision, risk, effect or acceptance. Mechanical synchronization alone is not enough reason to interrupt the Operator.

For FAST/BOUNDED, the Lead/system resolves exact Git heads, hashes and current authority. Natural-language approval such as `Aprovado` is sufficient when it can be bound unambiguously to the presented envelope.

One approval may include conditional delivery when all of these remain true:

```text
scope stays inside the approved envelope
architecture/threat model does not change
required proof passes
material Findings are admitted/cleared
no escalation or Replan is required
the approved envelope explicitly includes delivery to the target
```

A request to inspect, analyze or discuss does not imply delivery. If the delivery condition is not explicit, merge requires a separate approval.

Exact manual tokens remain available when their explicit binding itself protects a material CONTROLLED boundary; they are not the default operator interface.

## 7. Proof and CI

Proof-first remains invariant. TDD applies when executable testing is the correct deciding proof.

Normal FAST/BOUNDED work may observe RED locally:

```text
local targeted RED
→ minimum GREEN
→ regression/full verification
→ final commit/push
→ final CI
```

A separate RED commit or failing remote workflow is required only when the failure itself is durable deciding Evidence or materially improves reproducibility.

## 8. Review and Finding Admission

Finding Admission remains:

```text
CONTRACT_VIOLATION
IMPLEMENTATION_DEFECT
DERIVED_REQUIREMENT
THREAT_MODEL_EXPANSION
FUTURE_HARDENING
```

Classification may be concise; it does not require a new document.

Review depth scales with the profile:

```text
FAST       deterministic proof + scope audit; fresh review when material
BOUNDED    fresh review by default for material work + Finding Admission
CONTROLLED independent validation and any additional review required by the accepted boundary
```

For CONTROLLED, an applicable independent/adversarial/acceptance checkpoint is mandatory when it protects a distinct material boundary; waiver/non-applicability requires authority and durable rationale.

Implementer Claim remains distinct from acceptance.

## 9. Git and durable documentation

Git/GitHub/CI carry mechanical operational history:

```text
commits / diffs / PR / review / CI / merge identity
```

MNFS documents preserve durable knowledge Git alone does not answer well:

```text
material Decisions
current architecture or threat model
accepted risk
current capability / contract authority
deciding Evidence that must survive the PR
```

Acceptance/integration records are reserved for durable material outcomes; they are not the default for every tranche or merge.

`AGENTS.md` and `STATUS.md` should orient to current truth rather than duplicate historical hashes/workflows already available in GitHub.

## 10. Research proportionality

Research is required when its answer can materially change correctness, architecture, sourcing, security, compatibility or the execution envelope.

```text
FAST       research only for material uncertainty
BOUNDED    research material alternatives or unstable external behavior
CONTROLLED strong research/falsification before authority freeze
```

Do not research merely to satisfy ceremony.

## 11. Immediate ARR-S0 application

The admitted final pre-write Git/source re-observation remains an `IMPLEMENTATION_DEFECT` and is a `BOUNDED` candidate. D-019 still requires it to receive its own bounded execution authority; after D-020, one natural-language Operator approval of its Execution Brief is sufficient unless the envelope changes.

ARR-S0 Task 12 real host observation remains `CONTROLLED` because it produces deciding canonical Evidence used by later architecture work. Profile classification alone never grants execution authority.

## 12. Success and adoption

The design succeeds when a normal BOUNDED change can use:

```text
intent
→ one bounded decision/approval
→ local implementation/proof
→ fresh review
→ final CI
→ merge when delivery was authorized
```

without losing Authority, material traceability, proof, required independence, escalation, security/threat boundaries or durable deciding Evidence.

Adoption stays deliberately small:

1. make D-020 and this design part of the Fresh Actor authority chain;
2. preserve MCRM R0–R8 and Layered Planning L0–L3 while applying proportional materialization through this specialization;
3. simplify `AGENTS.md`, `STATUS.md`, `DOCUMENTATION-MAP.md` and documentation fitness functions so they protect stable semantics rather than transient workflow snapshots;
4. dogfood BOUNDED on the admitted ARR-S0 correction;
5. calibrate from observed lead time, Findings and rework before adding any further machinery.

No separate implementation-plan document is required unless implementation review discovers a material decision not resolved by this design.

# MNFS agent instructions

## Read order

Before changing anything, establish current authority:

1. `docs/DOCUMENTATION-MAP.md`
2. `docs/tracking/STATUS.md`
3. `docs/tracking/DECISIONS.md`
4. `docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md`
5. `docs/product/CAPABILITY-REALIZATION-METHOD.md`
6. `docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md`
7. `docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md`
8. `docs/superpowers/specs/2026-08-08-risk-proportional-execution-governance-design.md`
9. `docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md`
10. current task-specific ADR / Capability / Mission / Evidence / bounded design or plan when applicable.

For architecture/planning/cross-cutting work, inspect relevant canonical Blueprint sections as needed. Do not load the full Product Blueprint for a narrow implementation task unless applicability or the Context Pack requires it.

## Governance depth

MNFS uses one lifecycle with three execution-depth profiles:

```text
FAST       local/reversible/architecture-preserving
BOUNDED    material work inside accepted boundaries — default
CONTROLLED architecture/threat/irreversible/external-effect boundary
```

Use the least-heavy sufficient profile. `CONTROLLED` requires a named current reason. When uncertain between FAST and BOUNDED, use BOUNDED.

A lane may remove accidental ceremony; it may never remove an applicable deciding obligation already frozen by higher Authority.

Every Operator interruption must protect a named decision, risk, irreversible effect or acceptance. Mechanical SHA/hash propagation is not a human decision: the Lead/system resolves exact identities. Natural-language approval is sufficient for an unambiguous FAST/BOUNDED envelope. One approval may include conditional delivery only when that envelope explicitly includes delivery and scope, architecture/threat model, proofs, review and target remain unchanged.

Escalate automatically:

```text
FAST + material design/risk discovery        → BOUNDED or CONTROLLED
BOUNDED + architecture/threat/effect change  → CONTROLLED
```

Never expand scope silently.

## Hard invariants

- Ubuntu WSL2 is canonical; repositories live on the Linux filesystem, never `/mnt/c`.
- SQLite is operational authority; Git is code/result identity and canonical-document authority.
- Conversations, issues, transcripts and runtime Sessions are not product doctrine or acceptance authority.
- **Authority freezes execution, not inquiry.** Discovery may challenge prior choices; bounded execution may not silently ignore accepted authority.
- Development uses **Discovery → Decision → Execution**. Material findings return to Decision/Replan.
- Before building material infrastructure, classify `OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT`.
- L0 correctness and L1 realization are frozen; L2 decomposition is versioned; L3 tactics may adapt only inside those bounds.
- Fresh Actor recovery must not depend on prior conversation or runtime-session resume.
- Approved Mission revisions are immutable. `.mnfs/missions/MIS-002/plan.json` revision 5 is preserved history/current-version material and must not be edited in place.
- **MIS-002/M02 revision-5 execution is superseded under D-015. Do not implement or resume it.**
- A `WriteTrack` owns isolated mutable workspace semantics, not necessarily a Git worktree.
- Worker completion/Claim never grants acceptance by itself.
- Execution Environment, Tool, Credential, Network/Egress and External Effect authority remain separate; protected execution fails closed.
- Never launch a real M2 Writer under unrestricted host authority.
- Proof-first is universal. Use TDD when `TEST` is the correct deciding proof. Normal FAST/BOUNDED RED may be observed locally; a separate RED commit/workflow is required only when the failure itself is durable deciding Evidence.
- Finding Admission precedes Correction: `CONTRACT_VIOLATION`, `IMPLEMENTATION_DEFECT`, `DERIVED_REQUIREMENT`, `THREAT_MODEL_EXPANSION`, `FUTURE_HARDENING`.
- Reviewer severity does not independently create requirement Authority.
- Do not create generic provider/plugin abstractions before a second real production consumer exists.
- Do not edit generated files directly; regenerate and verify.
- Do not copy third-party code without origin/license records.

## Execution materialization

### FAST

Normally: intent → Finding Admission when finding-driven → implementation → targeted proof → scope audit → final verify/CI → delivery when already authorized.

If a Finding is not trivially admissible inside existing Authority/scope, escalate before mutation. No separate Design, Plan, acceptance record, exact manual token or fresh Reviewer is required unless a material concern or higher-authority obligation requires one.

### BOUNDED

Normally use one Execution Brief containing only what is material:

- `profile: BOUNDED` and concise selection rationale;
- outcome and relevant Authority;
- scope/non-goals and known loci;
- interfaces/write/resource/environment boundaries as applicable;
- proof and review expectation;
- approval scope and whether conditional delivery is included;
- failure/escalation/Replan conditions;
- escalation outcome only if escalation occurs.

Then: approval when needed → Writer/local proof → fresh review when material → Finding Admission → final CI → delivery only if the approved envelope explicitly includes it.

### CONTROLLED

Retain every applicable Design/Decision, Plan, exact authority, independent/adversarial validation, acceptance and delivery checkpoint when it protects a distinct material boundary. Omission/non-applicability requires the authority owning that boundary and durable rationale; CONTROLLED checkpoints are not optional merely to reduce ceremony.

## Git and documentation

Git/GitHub/CI carry mechanical operational history: commits, diffs, reviews, workflow results and merge identity.

Durable MNFS documents preserve what Git alone does not explain well: material Decisions, architecture/threat model, accepted risk, authoritative capability/contract and deciding Evidence that must survive the PR.

Do not create acceptance/integration records for ordinary implementation tranches unless they carry durable material knowledge.

## Verification

Default final verification:

```bash
npm run verify
```

For Product Blueprint or capability traceability changes, regenerate first:

```bash
npm run docs:generate
npm run docs:coverage
npm run docs:check
```

## Current product state

```text
M0 — Foundation Walking Skeleton                         ACCEPTED
M1 — Visual Mission Planning                            ACCEPTED
M2 — Secure One-Worker Vertical Slice                   OPPORTUNITY_REPLAN
  MIS-002/M01 — Durable Execution and Lease Core        ACCEPTED / CLOSED
  MIS-002/M02 revision-5 execution path                  SUPERSEDED
```

Current architecture/planning authority includes D-010 through D-020, plus D-021, ADR-0013 through ADR-0015, Layered Agent Execution Planning 1.1.0, Complexity Proportionality/Review Admission 1.0.0 and Risk-Proportional Execution Governance 1.0.0.

Current ARR state:

```text
ARR P1 reconciliation:                 ACCEPTED / INTEGRATED
P1-F03 contract binding:               ACCEPTED / INTEGRATED
CPR canonical reconciliation:          ACCEPTED / INTEGRATED — D-019
ARR-S0 host capability contract:       ACCEPTED 1.0.0 — D-021
ARR-S0 real host Evidence:             ACCEPT_WITH_LIMITATIONS / COMPLETE
ARR-S0 fresh report integrity:         PASS
ARR-S1 planning:                       NEXT / NOT EXECUTED
ARR-S2 planning:                       NEXT / NOT EXECUTED
Candidate execution/selection:         PROHIBITED pending later deciding Evidence/gates
M02 production implementation:         PROHIBITED
Production Worker dispatch:            PROHIBITED
```

Canonical S0 Evidence is `docs/acceptance/2026-08-07-arr-s0-host-capability-probe.md` (`ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE`). It records provider-neutral host facts only and grants no named-candidate selection or execution authority.

The next governed ARR action is to compile fresh S1 Agent Runtime and S2 Local Execution Envelope Planner Packs from current primary sources and the accepted S0 Evidence. Planning may proceed in parallel; candidate execution remains separately gated.

# MNFS agent instructions

## Read order

Before changing anything, establish current authority:

1. `docs/DOCUMENTATION-MAP.md`
2. `docs/tracking/STATUS.md`
3. `docs/tracking/DECISIONS.md`

For the current M2 Opportunity Replan, architecture work, planning, sourcing, execution-design or cross-cutting review, continue in this exact order before relying on older Mission/microdesign assumptions:

4. `docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md`
5. `docs/product/CAPABILITY-REALIZATION-METHOD.md`
6. `docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md`
7. `docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md`
8. `docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md`
9. the relevant current ADRs, Capability Spec, accepted Mission/Evidence and the exact bounded plan/gate for the task.

Do not load the full Product Blueprint for a narrow implementation task unless the Context Pack or applicability analysis says it is required. For architecture/planning/cross-cutting work, inspect the relevant canonical Blueprint source sections and current Decisions rather than relying on generated projections alone.

## Hard rules

- Ubuntu WSL2 is canonical; repositories live on the Linux filesystem, never `/mnt/c`.
- SQLite is operational authority; Git is code/result identity and canonical-document authority.
- Conversations, issues, tracking, transcripts and observational runtime memory are not product doctrine.
- **Authority freezes execution, not inquiry.** Discovery may challenge current Blueprint/ADR/Roadmap/Contract assumptions; bounded execution may not silently ignore accepted authority.
- Architecture Discovery searches the best-supported global solution, not the best solution inside prior choices. Sunk cost is migration cost, not technical justification.
- Development uses three loops: **Discovery → Decision → Execution**. A material finding returns control to Decision/Replan before implementation continues.
- Replan may be triggered by necessity or by opportunity when stronger Evidence supports a materially better architecture.
- Proprietary products are architectural references by default. Foundational adoption requires explicit sovereignty, licensing, dependency and exit analysis.
- Before building material infrastructure, classify the capability as `OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT`. Do not create generic provider/plugin abstractions before a second real production consumer exists.
- The Layered Agent Execution Planning model is binding for material execution: L0 correctness and L1 realization are frozen; L2 decomposition is versioned; L3 tactical reasoning may adapt only inside those bounds.
- Fresh Actor orientation must be sufficient without a previous conversation. Runtime Session identity and transcript are observational, never Mission/ActorRun/Attempt/acceptance authority.
- Approved Mission revisions are immutable. `.mnfs/missions/MIS-002/plan.json` remains revision 5 history/current contract material and must not be edited in place.
- **MIS-002/M02 revision-5 execution path: SUPERSEDED under D-015. Do not implement or resume it.** A new M02 execution path requires post-Spike CAP-EXECUTION/MIS-002 Replan and a new R5 design.
- A `WriteTrack` owns an isolated mutable workspace semantically; it is not inherently a Git worktree. Treehouse/worktree Evidence remains historical/incumbent realization Evidence only.
- A Worker may Claim; implementer completion, runtime exit or terminal `done` never grants acceptance. Only the governed MNFS Gate or explicitly assigned Operator authority may accept.
- Messages notify; durable state and Artifacts remember.
- Execution Environment, Tool Capability, Credential, Network/Egress and External Effect authority are separate. Protected execution must fail closed; never silently fall back to unrestricted host execution.
- Never launch a real M2 Writer under unrestricted host authority.
- Proof-first is universal. Use TDD for behavior changes when `TEST` is the correct deciding proof: write/observe RED, implement minimally, observe GREEN, then regression proof.
- Deciding Evidence is criterion-driven, not test-inventory-driven. Supplemental hardening is not automatically a Milestone blocker when deciding criteria are already sufficiently evidenced; deferment must name destination, rationale, residual risk and Operator authority.
- Use real dependencies when the physical integration boundary itself is under test. Mocks/fakes may isolate logic but do not count as deciding proof of a real external integration.
- Do not create a harness merely to test another harness when existing unit/integration surfaces can prove the criterion.
- Do not edit generated files directly. Regenerate them from canonical sources and verify freshness.
- Do not copy third-party code without origin/license records.

## Execution planning invariants

For a material bounded unit, the approved pack/design must make explicit as applicable:

- target and upward criterion/requirement lineage;
- Current Authority Snapshot / exact contract and policy identities;
- repository localization evidence;
- interfaces consumed/produced;
- write/resource boundaries;
- Environment/tool/network/credential/effect constraints;
- proof owner and deciding verification;
- retry/hypothesis budget;
- `SUCCESS / BLOCKED / ESCALATE / HANDOFF_REQUIRED / REPLAN_REQUIRED` termination;
- structured handoff that survives Session loss.

A Worker cannot expand architecture, foundational dependency, public contract, security posture, credential/network/effect authority or materially larger mutation scope merely because it makes implementation easier.

## Change impact

Every material Claim or PR declares:

```yaml
documentation_impact:
  status: NONE | UPDATED | FOLLOW_UP_REQUIRED
  affected: []
  rationale: ""
  follow_up: null

requirements_impact:
  status: NONE | UPDATED | NEW_REQUIREMENT | REPLAN_REQUIRED
  affected: []
  rationale: ""
```

## Verification

Run:

```bash
npm run verify
```

For Product Blueprint or capability traceability changes, regenerate first:

```bash
npm run docs:generate
npm run docs:coverage
npm run docs:check
```

## Current gate

Program state:

```text
M0 — Foundation Walking Skeleton                         ACCEPTED
M1 — Visual Mission Planning                            ACCEPTED
M2 — Secure One-Worker Vertical Slice                   OPPORTUNITY_REPLAN
  MIS-002/M01 — Durable Execution and Lease Core        ACCEPTED / CLOSED
  MIS-002/M02 revision-5 execution path                  SUPERSEDED
```

Accepted current architecture/planning authority includes D-010 through D-016, ADR-0013 through ADR-0015 and `DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` version 1.0.0.

`GATE-P0` accepted the Architecture Reconciliation / ARR master plan and ARR-S0 plan. The currently authorized tranche is P1 under PR #24 and is limited to Tasks `A1,A2,A3,A4,B1` of the accepted master plan.

```text
ARR P1 reconciliation A1-A4 + B1:       AUTHORIZED / CURRENT
ARR-S0 implementation:                   PROHIBITED pending GATE-S0-IMPLEMENT
ARR-S0 real host probe:                   PROHIBITED pending later GATE-S0-EXECUTE
Candidate installation/execution:        PROHIBITED
Agent Runtime / Environment selection:   PROHIBITED pending deciding Evidence
M02 production implementation:           PROHIBITED
Production Worker dispatch:              PROHIBITED
Automatic merge/delivery:                NOT AUTHORIZED
```

Real M01 R2/R3 Treehouse crash/lineage scenarios remain `FOLLOW_UP_REQUIRED` under Issue #20. Whether the Treehouse-specific form remains necessary is decided by the final architecture reconciliation; provider-neutral recovery/fencing proof remains mandatory before Product Milestone M2 exit.

After P1 is implemented and independently verified, the next possible gate is **GATE-S0-IMPLEMENT** for deterministic construction/testing of the host-capability harness. Real host probing remains separately gated and is not implied by S0 implementation approval.

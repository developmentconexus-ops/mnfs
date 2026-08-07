# MNFS agent instructions

## Read order

Before changing code:

1. `docs/DOCUMENTATION-MAP.md`
2. `docs/tracking/STATUS.md`
3. `docs/tracking/DECISIONS.md`
4. the current Approved Mission Contract or explicit planning task
5. the relevant Capability Spec and ADRs
6. the active microdesign under `docs/design/`

Do not load the full Product Blueprint unless the task is architecture, planning or cross-cutting review.

## Hard rules

- Ubuntu WSL2 is canonical; repositories live on the Linux filesystem, never `/mnt/c`.
- SQLite is operational authority; Git is code and canonical-document authority.
- Conversations, issues, tracking, transcripts and observational memory are not product doctrine.
- Approved Mission revisions are immutable; material change uses Replan.
- `.mnfs/missions/MIS-002/plan.json` is the approved revision 5 contract and must not be edited in place; revision 3 remains immutable history.
- A Worker may Claim; only an MNFS Gate may accept.
- Worker exit, terminal `done` and Herdr state are not Feature status.
- Messages notify; durable state and Artifacts remember.
- Worktrees isolate writers, not processes, ports, databases, credentials or external effects.
- Never launch a real M2 Writer unrestricted. E1 security and AS-02 are required.
- Use TDD for behavior changes: failing test, observed failure, minimal implementation, green test.
- YAGNI is binding; every abstraction and external tool needs a named consumer and proof.
- Deciding Evidence is criterion-driven, not test-inventory-driven. A supplemental hardening test is not automatically a Milestone blocker when the deciding criterion already has sufficient Evidence; any deferment must name destination, rationale, residual risk and Operator authority.
- Use real dependencies when the physical integration boundary itself is under test. Mocks/fakes may isolate logic but do not count as deciding proof of a real external integration.
- Do not create a harness merely to test another harness when existing unit/integration surfaces can prove the criterion.
- Do not edit generated files directly.
- Do not copy third-party code without origin/license records.

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

`MIS-002/M01 — Durable Execution and Lease Core` is formally accepted under Operator decision `D-009` after merged PRs #17 and #19.

Real R2/R3 Treehouse crash/lineage scenarios remain `FOLLOW_UP_REQUIRED` under Issue #20. They are non-blocking M01 operational hardening, are not claimed as PASS, and must be completed or re-dispositioned before Product Milestone M2 exit (MCRM R7/R8), or earlier if M02 exposes a concrete dependency.

The next governed action is **R5 Milestone Microdesign preparation/review for `MIS-002/M02` under Issue #21**. M02 production implementation and Pi Worker dispatch remain prohibited until that microdesign and a separate implementation plan/authorization are approved.

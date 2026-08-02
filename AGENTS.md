# MNFS agent instructions

## Read order

Before changing code:

1. `docs/DOCUMENTATION-MAP.md`
2. `docs/tracking/STATUS.md`
3. the current Approved Mission Contract or explicit planning task
4. the relevant Capability Spec and ADRs
5. the active microdesign under `docs/design/`

Do not load the full Product Blueprint unless the task is architecture, planning or cross-cutting review.

## Hard rules

- Ubuntu WSL2 is canonical; repositories live on the Linux filesystem, never `/mnt/c`.
- SQLite is operational authority; Git is code and canonical-document authority.
- Conversations, issues, tracking, transcripts and observational memory are not product doctrine.
- Approved Mission revisions are immutable; material change uses Replan.
- A Worker may Claim; only an MNFS Gate may accept.
- Worker exit, terminal `done` and Herdr state are not Feature status.
- Messages notify; durable state and Artifacts remember.
- Worktrees isolate writers, not processes, ports, databases, credentials or external effects.
- Never launch a real M2 Writer unrestricted. E1 security and AS-02 are required.
- Use TDD for behavior changes: failing test, observed failure, minimal implementation, green test.
- YAGNI is binding; every abstraction and external tool needs a named consumer and proof.
- Do not edit generated files directly.
- Do not modify `.mnfs/missions/MIS-002/plan.json`; preserve revision 3 and use Replan.
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

## Current blocker

M2 implementation remains blocked until the Architecture Baseline merges, Plan Contract schema v2 exists, AS-02 passes, a new `MIS-002` revision is approved and MCRM R0–R4 pass.

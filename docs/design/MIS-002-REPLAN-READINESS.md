---
id: DESIGN-MIS-002-REPLAN-READINESS
title: MIS-002 Replan readiness
document_type: design_readiness
form: reference
authority: tracking
status: current
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - CAP-EXECUTION
  - AS-02
  - DESIGN-PLAN-CONTRACT-SCHEMA-V2-READINESS
tracking_issue: 6
---

# MIS-002 Replan readiness

## Historical contract

```text
.mnfs/missions/MIS-002/plan.json
revision: 3
contentHash: sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1
```

Revision 3 must not be edited.

## Required additions in the next revision

- Mission, Milestone and Feature criterion IDs;
- Milestone Acceptance Criteria;
- qualified execution identities;
- Attempt and Worker Run lifecycle;
- E1 Environment and frozen policy hash;
- network/credential/effect default;
- Current Authority Snapshot and fixed Writer Pack;
- Lease fencing and crash windows;
- runner-owned Receipt;
- stale tree/contract rejection;
- Recovery and Security drills;
- documentation/requirements impact;
- explicit exclusion of Herdr, OM, `pi-link` and remote execution.

## Blockers

1. Architecture Baseline PR not merged.
2. Plan Contract schema v2 not implemented.
3. AS-02 not executed.
4. `CAP-EXECUTION` not accepted.
5. R4 Contract Readiness is blocked.

## Correct next action

Do not create or edit `.mnfs/missions/MIS-002/plan.json` manually.

After blockers are resolved:

```text
mnfs plan show
→ generate full schema v2 revision
→ mnfs plan save --expected-hash ...
→ Lavish review
→ exact-hash approval
→ materialize
```

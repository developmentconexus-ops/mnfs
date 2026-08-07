---
id: TRACKING-DECISIONS
title: MNFS Decision Tracking
document_type: tracking_document
form: explanation
authority: tracking
status: current
owners:
  - developmentconexus-ops
related:
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - ACCEPTANCE-MIS-002-M01-R5-APPROVAL
  - ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-PLAN-APPROVAL
  - ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-CLOSEOUT
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
---

# Decision register

| ID | Date | Decision | Authority | ADR |
|---|---|---|---|---|
| D-001 | 2026-07-31 | Build MNFS as a Pi-first control plane rather than a Claude Desktop plugin. | Operator | ADR-0001 |
| D-002 | 2026-07-31 | Use Ubuntu under WSL2 as the canonical local runtime; Windows remains the presentation host. | Operator | ADR-0001 |
| D-003 | 2026-07-31 | Use SQLite for local operational state and repository files for planning contracts and accepted evidence. | Operator | ADR-0002 |
| D-004 | 2026-07-31 | Allocate worktrees per concurrent write track and reuse them for local corrections. | Operator | ADR-0003 |
| D-005 | 2026-07-31 | FirstMate is a reference and laboratory, not the product's parent repository. | Operator | ADR-0001 |
| D-006 | 2026-08-03 | Authorize M2 to enter R5 Milestone Microdesign under approved MIS-002 revision 5 (`sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`) after R0–R4 PASS. Scope is M01 microdesign only; Worker implementation and dispatch remain prohibited until that microdesign is separately approved. Material contract, policy, Capability, prerequisite or requirement changes trigger Replan/re-readiness. | Operator | — |
| D-007 | 2026-08-04 | Approve `DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE` version 0.6.1 under approved MIS-002 revision 5 (`sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`) and accepted Treehouse bytes (`sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3`). MCRM R5 becomes PASS. Only preparation and review of a separate TDD implementation plan are authorized; production implementation, Pi dispatch and automatic merge remain prohibited. | Operator | — |
| D-008 | 2026-08-04 | Approve `PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE` version 1.0.1 under accepted microdesign 0.6.1, approved MIS-002 revision 5 (`sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`) and accepted Treehouse bytes (`sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3`). The plan sequence and TDD proof gates are approved. Task 1 RED, production implementation, real Treehouse execution beyond the plan gate, Pi dispatch and automatic merge remain prohibited until separately authorized. | Operator | — |
| D-009 | 2026-08-07 | Formally accept and close `MIS-002/M01 — Durable Execution and Lease Core` after merged PR #17 (`3722235a2c7a4d4d5fc11e55d8c4b8e6f025a8f7`) and PR #19 (`a783cc5854163b0f1abc8a944286a540f9b653b8`). All M01 deciding requirements and criteria, including `MIS-002/M01/AC-08`, are accepted as sufficiently evidenced by the canonical deterministic/fresh-process crash-and-retry integration suite plus the historical real Treehouse normal-path proof. Real R2 crash/recovery and R3 lineage scenarios remain `FOLLOW_UP_REQUIRED`, are not claimed as PASS, and are explicitly deferred to Issue #20 before Product Milestone M2 exit (MCRM R7/R8), or earlier if M02 exposes a concrete dependency. This decision clarifies the method: intermediate Mission Milestone acceptance is criterion-driven, not test-inventory-driven; supplemental hardening does not become a blocker unless it is the sole proof of a deciding criterion/requirement or is explicitly mandatory in the contract/design. The decision does not amend MIS-002 revision 5 or CAP-EXECUTION. It authorizes preparation/review of the `MIS-002/M02` R5 microdesign under Issue #21 only; M02 production implementation and Pi Worker dispatch remain prohibited pending separate approval. | Operator | — |

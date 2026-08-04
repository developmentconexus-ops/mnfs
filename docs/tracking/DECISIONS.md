---
id: TRACKING-DECISIONS
title: MNFS Decision Tracking
document_type: tracking_document
form: explanation
authority: tracking
status: current
owners:
  - developmentconexus-ops
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

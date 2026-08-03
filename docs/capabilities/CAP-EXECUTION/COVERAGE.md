---
id: CAP-EXECUTION-COVERAGE
title: CAP-EXECUTION Planning Coverage
document_type: coverage_report
form: reference
authority: generated_projection
status: generated
version: 0.1.0
owners:
  - developmentconexus-ops
generated_from:
  - CAP-EXECUTION
related:
  - CAP-EXECUTION
  - CAP-EXECUTION-APPLICABILITY
---

<!-- GENERATED — DO NOT EDIT
Source: docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
Generator: scripts/generate-capability-coverage.mjs
Generator version: 3
-->

# CAP-EXECUTION Planning Coverage

## Summary

| Measure | Result |
|---|---:|
| Requirements | 28 |
| MUST | 27 |
| SHOULD | 1 |
| Unassessed requirements | 0 |
| Applicability domains | 23 |
| Requirements with source | 28/28 |
| Requirements with proposed allocation | 28/28 |
| Requirements with approved allocation | 0/28 |
| Requirements with verification method | 28/28 |
| Designed | 27 |
| Blocked | 1 |
| Verified | 0 |
| Evidenced | 5 |

## Readiness Gates

| Gate | Result | Reason |
|---|---|---|
| R0 | PASS | Blueprint, roadmap, ADR and Mission baseline bindings resolve to the declared versions. |
| R1 | PASS | 23 impact domains assessed with explicit dispositions. |
| R2 | PASS | 28 requirements are uniquely identified, sourced, allocated and proof-planned. |
| R3 | PASS | Capability Spec CAP-EXECUTION version 0.1.0 is accepted. |
| R4 | BLOCKED | 30 Mission contract allocation defect(s) |
| R5 | NOT_STARTED | Approved Mission contract required |
| R6 | NOT_STARTED | No implementation Claim |
| R7 | NOT_STARTED | No verification Evidence |
| R8 | NOT_STARTED | M2 has not started |

## Computed gate defects

- **R4:** Mission contract revision 3 is not a post-revision-3 Replan.
- **R4:** Mission contract does not use schemaVersion 2.
- **R4:** CAP-EXEC-REQ-001: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-002: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-003: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-004: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-005: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-006: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-007: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-008: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-009: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-010: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-011: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-012: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-013: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-014: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-015: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-016: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-017: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-018: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-019: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-020: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-021: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-022: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-023: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-025: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-026: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-027: no approved criterion allocation.
- **R4:** CAP-EXEC-REQ-028: no approved criterion allocation.
- **R4:** BLOCK-MIS-002-REPLAN: Revision 3 must remain preserved and a new schema v2 revision must be approved through MNFS.

## Blocking items

1. **BLOCK-MIS-002-REPLAN:** Revision 3 must remain preserved and a new schema v2 revision must be approved through MNFS.

## Required next sequence

```text
review and accept CAP-EXECUTION
→ run MIS-002 schema v2 Replan through Lavish
→ approve exact new hash
→ replace proposed allocations with approved criterion identities
→ rerun R0-R4
→ record explicit Operator M2 unblock decision
```

## Coverage interpretation

R0–R4 are computed from canonical document versions, applicability, requirement traceability, Capability metadata, the materialized approved Mission contract and exact criterion allocations. R5–R8 remain lifecycle dispositions until their corresponding work exists. This report does not claim implementation readiness unless R0–R4 pass.

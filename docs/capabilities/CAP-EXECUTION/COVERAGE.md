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
| Designed | 23 |
| Blocked | 5 |
| Verified | 0 |
| Evidenced | 1 |

## Readiness Gates

| Gate | Result | Reason |
|---|---|---|
| R0 | PASS | Blueprint, roadmap, ADR and Mission baseline bindings resolve to the declared versions. |
| R1 | PASS | 23 impact domains assessed with explicit dispositions. |
| R2 | PASS | 28 requirements are uniquely identified, sourced, allocated and proof-planned. |
| R3 | REVIEW_REQUIRED | Capability Spec CAP-EXECUTION remains proposed. |
| R4 | BLOCKED | Capability Readiness R3 must pass before Mission contract allocation can be ready. |
| R5 | NOT_STARTED | Approved Mission contract required |
| R6 | NOT_STARTED | No implementation Claim |
| R7 | NOT_STARTED | No verification Evidence |
| R8 | NOT_STARTED | M2 has not started |

## Computed gate defects

None.

## Blocking items

1. **BLOCK-AS-02:** Real local Pi sandbox behavior on canonical WSL2 is unproven.
2. **BLOCK-MIS-002-REPLAN:** Revision 3 must remain preserved and a new schema v2 revision must be approved through MNFS.

## Required next sequence

```text
execute AS-02
→ run MIS-002 schema v2 Replan through Lavish
→ approve exact new hash
→ rerun R0-R4
→ begin M2 implementation
```

## Coverage interpretation

R0–R4 are computed from canonical document versions, applicability, requirement traceability, Capability metadata, the materialized approved Mission contract and exact criterion allocations. R5–R8 remain lifecycle dispositions until their corresponding work exists. This report does not claim implementation readiness unless R0–R4 pass.

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
| Requirements with proposed allocation | 0/28 |
| Requirements with approved allocation | 28/28 |
| Requirements with verification method | 28/28 |
| Designed | 28 |
| Blocked | 0 |
| Verified | 0 |
| Evidenced | 6 |

## Readiness Gates

| Gate | Result | Reason |
|---|---|---|
| R0 | PASS | Blueprint, roadmap, ADR and Mission baseline bindings resolve to the declared versions. |
| R1 | PASS | 23 impact domains assessed with explicit dispositions. |
| R2 | PASS | 28 requirements are uniquely identified, sourced, allocated and proof-planned. |
| R3 | PASS | Capability Spec CAP-EXECUTION version 0.1.0 is accepted. |
| R4 | PASS | Approved schema-v2 Mission contract revision 5 allocates every MUST requirement to an existing criterion. |
| R5 | NOT_STARTED | Approved Mission contract required |
| R6 | NOT_STARTED | No implementation Claim |
| R7 | NOT_STARTED | No verification Evidence |
| R8 | NOT_STARTED | M2 has not started |

## Computed gate defects

None.

## Blocking items

None.

## Required next sequence

```text
review mechanical R0-R4 evidence
→ obtain explicit Operator M2 unblock
→ write M01 microdesign only after unblock
```

## Coverage interpretation

R0–R4 are computed from canonical document versions, applicability, requirement traceability, Capability metadata, the materialized approved Mission contract and exact criterion allocations. R5–R8 remain lifecycle dispositions until their corresponding work exists. This report does not claim implementation readiness unless R0–R4 pass.

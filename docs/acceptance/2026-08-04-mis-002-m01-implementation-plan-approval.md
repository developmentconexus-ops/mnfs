---
id: ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-PLAN-APPROVAL
title: MIS-002 M01 Implementation Plan Approval
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - ACCEPTANCE-MIS-002-M01-R5-APPROVAL
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - REVIEW-MIS-002-M01-R5-FINAL
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - CAP-EXECUTION
  - DOC-PROJECT-STATUS
  - TRACKING-DECISIONS
  - TRACKING-WORKLOG
tracking_issue: 16
last_reviewed: 2026-08-04
---

# MIS-002/M01 Implementation Plan Approval

## Operator authority

The Operator supplied the exact approval token:

```text
MNFS_APPROVE_M01_IMPLEMENTATION_PLAN version=1.0.1 microdesign=0.6.1 contract=sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3 treehouse=sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
```

The token matches every governing identity:

```text
Implementation plan: PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE 1.0.1
Microdesign:         DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE 0.6.1
Mission contract:    sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3
Treehouse bytes:     sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
```

## Decision

```text
Decision:             APPROVE IMPLEMENTATION PLAN
Authority:            Operator
Plan version:         1.0.1
Microdesign version:  0.6.1
Plan lifecycle:       CURRENT / APPROVED
Task 1 RED:           NOT AUTHORIZED
Production code:      NOT AUTHORIZED
Real Treehouse run:   NOT AUTHORIZED before Task 14 gate
Pi Worker dispatch:   NOT AUTHORIZED
Automatic PR merge:   NOT AUTHORIZED
```

This decision approves the sequence, interfaces, test strategy, review gates and proof boundaries in plan version `1.0.1`. It does not start implementation and does not authorize any production mutation.

## Approved execution sequence

The plan contains fourteen ordered TDD gates:

```text
1. domain model, identities, transitions, errors and fixtures
2. process runner, durable Artifacts and process identity
3. shared SQLite transaction authority
4. maintenance gate, consistent backup and schema-version checks
5. migration v4, versioned Events and execution schema
6. execution persistence, ancestry, idempotency and CAS
7. Track, Attempt and Worker Run lifecycle
8. read-only Git observation and independent Attempt source
9. production Treehouse adapter
10. Lease action protocol and trusted helper
11. Lease grant and release Intent–Action–Observation
12. Claim OPEN and read-only Recovery
13. M01 CLI and production composition root
14. fresh-process proof, canonical WSL2 proof and closeout gate
```

Each task requires:

```text
failing test
→ observed RED
→ minimal implementation
→ focused GREEN
→ root verification
→ independent review
→ bounded commit
```

## Frozen boundaries

Approval preserves all accepted microdesign invariants, including:

- canonical checkout is never Treehouse cwd;
- every Attempt source is independent, exact-base, no-origin, no-alternates and non-hardlinked;
- Treehouse uses the accepted candidate and controlled HOME/XDG/config/hooks;
- semantic state and payload-versioned Events commit atomically;
- relational keys prove exact Track/Attempt/Run/Lease/Claim ancestry;
- LeaseActionRunner records durable STARTED before one external invocation;
- an inconclusive STARTED grant never automatically repeats `treehouse get`;
- dirty, ambiguous and unclassified work is preserved;
- plain Recovery performs no domain or managed-resource mutation;
- M01 creates Claim `OPEN` only;
- Pi, SEC-E1 production creation, Claim completion, Receipt, Gate, Integration, QA and delivery remain outside M01.

## Authorization boundary

The next governed action is a separate Operator continuation for **Task 1 RED only**. That continuation must not be interpreted as authorization for later tasks, real Treehouse execution, M01 acceptance, M02 or PR merge.

```text
Implementation plan: APPROVED
Implementation:      NOT STARTED
Current gate:        explicit Task 1 RED authorization
PR #17:              draft / unmerged
```

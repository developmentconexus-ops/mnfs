---
id: CAP-EXECUTION-APPLICABILITY
title: CAP-EXECUTION Applicability Matrix
document_type: applicability_matrix
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
---

<!-- GENERATED — DO NOT EDIT
Source: docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
Generator: scripts/generate-capability-coverage.mjs
Generator version: 2
-->

# CAP-EXECUTION Applicability Matrix

| Domain | State | Rationale | Required output or disposition |
|---|---|---|---|
| Product and outcome | APPLICABLE | M2 must prove safe delegation and recovery | Mission/Milestone criteria and Golden Proof |
| State and persistence | APPLICABLE | durable Claim, Events and restart | migrations, transactions and tests |
| External operations | APPLICABLE | Treehouse and Pi process are external effects to SQLite | adapters and Intent–Action–Observation |
| Failure and Recovery | APPLICABLE | Lead/process crash is core proof | Recovery matrix and drills |
| Security | APPLICABLE | Writer otherwise inherits host authority | E1 policy and AS-02 |
| Credentials | NOT_APPLICABLE | fixed task needs no credential | explicit `NONE` grant |
| Network | APPLICABLE | default denial is deciding security behavior | AS-02 network test |
| External effects | NOT_APPLICABLE | M2 permits X0/X1 only | denial policy |
| Quality and Evidence | APPLICABLE | Claim must be verified and accepted | Receipt and Gate |
| Independent Review | DEFERRED → M4 | M4 owns judgment review | roadmap target M4 |
| Live QA | DEFERRED → M6 | fixed repository edit is not user-facing | roadmap target M6 |
| Concurrency | APPLICABLE | duplicate starts and late results still exist with one Worker | optimistic concurrency and fencing |
| Parallel write Tracks | DEFERRED → M5 | M5 owns real parallelism | roadmap target M5 |
| Context and memory | APPLICABLE | Worker needs bounded authoritative input | Snapshot and fixed Writer Pack |
| Observational Memory | NOT_APPLICABLE | bounded Writer does not require long-session OM | Pi native behavior only |
| Operator experience | APPLICABLE | status, errors and next action are required | human/JSON CLI |
| Observability | APPLICABLE | local Events, duration and logs support Recovery | local telemetry only |
| External observability backend | DEFERRED → M9 | not needed for M2 correctness | roadmap target M9 |
| Engineering System | APPLICABLE | M2 uses an embedded fixed path, not generalized Profile/Standards engine | explicit M2 rules; generalize in M3 |
| Compatibility | APPLICABLE | Plan and SQLite schemas already exist | migration and downgrade plan |
| Documentation | APPLICABLE | contract, spec, traceability and docs impact must agree | canonical docs and coverage |
| Web Console | DEFERRED → M10 | CLI remains canonical | roadmap option M10 |
| Remote execution | DEFERRED → M12 | local proof precedes cloud | roadmap option M12 |

## Readiness statement

Every impact domain has an explicit state. `DEFERRED` entries name a Product Milestone and `NOT_APPLICABLE` entries retain a rationale and disposition.
